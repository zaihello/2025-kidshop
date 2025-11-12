<script>
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import { register } from '../../stores/authService';

export default {
  components:{Form, Field},
  data() {
    return {
      form: {
        name: "",
        email: "",
        password: "",
        phone:"",
        birthday:"",
        type:'member',//general or vip or vvip
        role:'member',//admin or member
        last_login:'',
      },
      showPassword: false,
      schema: Yup.object().shape({
        name: Yup.string().required('請輸入姓名'),
        email: Yup.string().email('請輸入有效的 Email').required('請輸入 Email'),
        password: Yup.string().min(6, '密碼至少需 6 個字元').required('請輸入密碼'),
        phone: Yup.string()
          .matches(/^09\d{8}$/, '請輸入有效的手機號碼')
          .required('請輸入手機號碼'),
        birthday: Yup.date()
        //空字串時，將其轉換為 null避免 Yup 嘗試解析空字串為日期。(避免出現英文errors)
          .transform((value, originalValue) => {
            return originalValue === '' ? null : value;
          })
          //允許欄位為 null() (避免出現英文errors)
          .nullable()
          .required('請輸入生日'),  
      }),
    };
  },
  methods: {
    async handleRegister() {
      try {
        const response = await register(this.form); // 來自import { register }，，確保正確接收回傳值
        
        // console.log("註冊 API 回傳資料:", response); // 檢查是否有 type
        this.$router.push('/login'); // 跳轉到登入頁面
      } catch (error) {
        alert(error.message);
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
   
  },
};
</script>

<template>
    <!-- 使用 flex 和 justify-center 將卡片置中。 -->
    <div class="flex items-center justify-center min-h-screen bg-stone-200">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">會員註冊</h2>
        <Form :validation-schema="schema" @submit="handleRegister" v-slot="{ errors }">
          <!-- Username -->
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span class="text-red-500">*</span>
            </label>
            <Field
              name="name"
              v-model="form.name"
              type="text"
              id="name"
              placeholder="請輸入您的姓名"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
            <span class="text-red-500 text-sm">{{ errors.name }}</span>
          </div>
  
          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email  <span class="text-red-500">*</span>
            </label>
            <Field
              name="email"
              v-model="form.email"
              type="email"
              id="email"
              placeholder="請輸入您的 email"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
            <span class="text-red-500 text-sm">{{ errors.email }}</span>
          </div>
  
          <!-- Password -->
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              密碼 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
                <!-- 切換密碼可見性使用 showPassword -->
              <Field
                name="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                id="password"
                placeholder="請輸入您的 password"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
                
              />
              <!-- 眼睛圖標切換 -->
              <button
                type="button"
                @click="togglePassword"
                class="absolute right-2 top-2 text-gray-500 focus:outline-none"
              >
                <!-- 顯示/隱藏 密碼的眼睛圖標 -->
                <span class="material-icons">
                  {{ showPassword ? 'visibility' : 'visibility_off' }}
                </span>
                
              </button>
            </div>
            <span class="text-red-500 text-sm">{{ errors.password }}</span>
          </div>

          <!-- 手機 -->
          <div class="mb-4">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              手機號碼 <span class="text-red-500">*</span>
            </label>
            <Field
              name="phone"
              v-model="form.phone"
              type="text"
              id="phone"
              placeholder="請輸入您的手機號碼"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
            <span class="text-red-500 text-sm">{{ errors.phone }}</span>
          </div>

          <!-- 生日 -->
          <div class="mb-4">
            <label for="birthday" class="block text-sm font-medium text-gray-700 mb-1">
              生日 <span class="text-red-500">*</span>
            </label>
            <Field
              name="birthday"
              v-model="form.birthday"
              type="date"
              id="birthday"
              placeholder="請輸入您的生日"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
            />
            <span class="text-red-500 text-sm">{{ errors.birthday }}</span>
          </div>
  

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition"
          >
            註冊

          </button>
        </Form>
      </div>
    </div>
</template>
  
