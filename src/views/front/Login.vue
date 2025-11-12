
<script>
import { Form, Field } from 'vee-validate';
import * as Yup from 'yup';
import { login } from '../../stores/authService'
  
export default{
  components:{Form, Field},
  data() {
    return {
      form: {
         email: "",
        password: "",
      },
      showPassword: false,
      schema:Yup.object().shape({
      email: Yup.string().email('請輸入有效的 Email').required('請輸入 Email'),
      password: Yup.string().min(6, '密碼至少需 6 個字元').required('請輸入密碼'),
      })
    };
  },
  methods:{
    async loginUser() {
      try {
        // 調用 authService 的 會員login 方法
        const data = await login({
           email: this.form.email,
          password: this.form.password,
        });
  
        alert('登入成功！');
        // console.log('登入後的數據:', data);
  
        // 登入後跳轉頁面
        this.$router.push('/shop');
      } catch (error) {
        console.error('Login error:', error.message);
        alert(error.message); // 提示錯誤訊息
      }
    },
      // 密碼顯示切換
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
  },
}
    
</script>
    
<template>
    <!-- 使用 flex 和 justify-center 將卡片置中。 -->
    <div class="flex items-center justify-center min-h-screen bg-stone-200">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">會員登入</h2>
        <Form :validation-schema="schema" @submit="loginUser" v-slot="{ errors }">
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
              placeholder="1263@gmail.com"
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
                placeholder="輸入123456可體驗購物流程"
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
  
          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition"
          >
            登入
          </button>
        </Form>
      </div>
    </div>
</template>
  
  