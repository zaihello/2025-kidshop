<template>
    <!-- 使用 flex 和 justify-center 將卡片置中。 -->
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">會員註冊</h2>
        <form @submit.prevent="handleRegister">
          <!-- Username -->
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
              姓名 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              id="username"
              placeholder="請輸入您的姓名"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
  
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

          <!-- 手機 -->
          <div class="mb-4">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              手機號碼 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.phone"
              type="text"
              id="phone"
              placeholder="請輸入您的手機號碼"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <!-- 生日 -->
          <div class="mb-4">
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
              生日 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.birthday"
              type="date"
              id="birthday"
              placeholder="請輸入您的生日"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>
  

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition"
          >
            註冊

          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { useAuthStore } from '../../stores/authStore'
  import { register } from '../../stores/authService';

  export default {
    data() {
      return {
        form: {
          name: "",
          email: "",
          password: "",
          phone:"",
          birthday:"",
          type:'member',
          role:'member',
          last_login:'',
        },
        showPassword: false,
      };
    },
    methods: {
      async handleRegister() {
        try {
          const response = await register(this.form); // 來自import { register }，，確保正確接收回傳值
          
          console.log("註冊 API 回傳資料:", response); // 檢查是否有 type
          this.$router.push('/login'); // 跳轉到登入頁面
        } catch (error) {
          alert(error.message);
        }
      },
      togglePassword() {
        this.showPassword = !this.showPassword;
      },
      
      // 密碼顯示切換
      
      // fetch版
      // async registerUser() {
      //   try {
      //        // MOKKY規範用fetch
      //     const res = await fetch('https://204ed3432b06d7af.mokky.dev/register', {
      //       method: 'POST',
      //       headers: { 'Content-Type': 'application/json' },
      //       body: JSON.stringify({ 
      //           username:this.form.username,
      //           email: this.form.email, 
      //           password: this.form.password, 
      //           phone:this.form.phone,
      //           birthday:this.form.birthday,
      //       }),
      //     });

      //     if (res.ok) {
      //       alert("註冊成功!");
      //       // 轉跳到登入頁面
      //       this.$router.push("/login");
      //     }
      //   } catch (error) {
      //     console.error("Registration error:", error);
      //   }
      // },  
        // 密碼顯示切換
      // togglePassword() {
      //   this.showPassword = !this.showPassword;
      // },
  
    },
  };
  </script>
  