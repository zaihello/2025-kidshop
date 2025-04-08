<template>
    <!-- 使用 flex 和 justify-center 將卡片置中。 -->
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">會員登入</h2>
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
  
  <script>
  import { login } from '../../stores/authService'

  export default{
    data() {
       return {
         form: {
           email: "",
           password: "",
         },
         showPassword: false,
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
          console.log('登入後的數據:', data);

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
      //axios版本
    //   async loginUser() {
    // try {
    //     // 使用 Axios 發送 POST 請求
    //     const { data } = await axios.post('https://204ed3432b06d7af.mokky.dev/auth', {
    //         email: this.form.email,
    //         password: this.form.password,
    //     });

    //     console.log(data);

    //     // 將 token 儲存到 localStorage
    //     localStorage.setItem("token", data.token);
    //     console.log('Token', data.token);

    //     alert("登入成功!");
    //     // 登入後轉跳到的頁面
    //     this.$router.push("/shop");
    // } catch (error) {
    //     console.error("Login error:", error);

    //     // 額外的錯誤提示或處理
    //     alert("登入失敗，請檢查您的帳號密碼是否正確！");
    // }
    //   },
      
    },

  }
  // export default {
  //   data() {
  //     return {
  //       form: {
  //         email: "",
  //         password: "",
  //       },
  //       showPassword: false,
  //     };
  //   },
  //   methods: {
      // async loginUser() {
      //   try {
      //       // MOKKY規範用fetch
      //     const res = await fetch('https://204ed3432b06d7af.mokky.dev/auth', {
      //       method: 'POST',
      //       headers: { 
      //           'Content-Type': 'application/json' 
      //       },
      //       body: JSON.stringify({ 
      //           email: this.form.email, 
      //           password: this.form.password 
      //       }),
      //     });
      //     const data = await res.json();
      //     console.log(data)
        
         
      //       // 將 token 儲存到 localStorage
      //       localStorage.setItem("token", data.token);
      //       console.log('Token',data.token)
      //       alert("登入成功!");
      //       // 登入後轉跳到的頁面
      //       this.$router.push("/shop");
         
      //   } catch (error) {
      //     console.error("Login error:", error);
      //   }
      // },  
       
      // 密碼顯示切換
      // togglePassword() {
      //   this.showPassword = !this.showPassword;
      // }
  //  },
  </script>
  