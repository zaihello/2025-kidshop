<script>
// import { useAdminAuthStore } from '../../stores/adminAuthStore'
import { adminLogin } from '../../stores/authService'

export default{
  data(){
    return{
      form:{
        email:'',
        password:'',
      },
      showPassword: false,
    }
  },
  // computed:{
  //   adminAuthStore(){
  //     return useAdminAuthStore() 
  //   },  
  // },
  methods:{
    async loginUser() {
      try {
        // await this.adminAuthStore.login(this.form);
        const data = await adminLogin(this.form);
        alert('登入成功');
        this.$router.push('/admin'); // 登入後導向管理頁面
      } catch (error) {
        alert(error.message);
      }
    },
    //密碼隱藏切換
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
  },
}
 
</script>

<template>
    <!-- 使用 flex 和 justify-center 將卡片置中。 -->
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">後台登入</h2>
        <form @submit.prevent="loginUser">
  
          <!-- Email -->
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
              Email  <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.email"
              type="email"
              id="email"
              placeholder="請輸入您的 email"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
  
          <!-- Password -->
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
              密碼 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
                <!-- 切換密碼可見性使用 showPassword -->
                 <!--   -->
              <input
                v-model="form.password"
               :type="showPassword ? 'text' : 'password'"
                id="password"
                placeholder="請輸入您的 password"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
              <!-- 眼睛圖標切換 --> 
               <button
                type="button"
                @click="togglePassword"
                class="absolute right-2 top-2 text-gray-500 focus:outline-none"
                >  
                <!-- 顯示密碼的眼睛圖標 -->
                <span class="material-icons" v-if="showPassword">
                            visibility
                </span> 
                <!-- 隱藏密碼的斜槓眼睛圖標 -->
                 <span class="material-icons" v-else>
                    visibility_off
                </span> 
               </button>
            </div>
          </div>
  
          
  
          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition"
          >
            登入
          </button>
        </form>
      </div>
    </div>
</template>
  
 