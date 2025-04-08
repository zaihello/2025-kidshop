//管理狀態
import { defineStore } from 'pinia'
import { register } from './authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user:null,//註冊用
    token: localStorage.getItem('token') || '', // 從 localStorage 初始化 token
    userId: localStorage.getItem('userId') || null, // 初始化 userId
    // userId: null, // 初始化 userId
  }),
  getters: {
    isLoggedIn(state) {
      return !!state.token; // 判斷是否已登入
    },
  },
  actions: {
    // wishlistStore将 user_id 设置到 authStore 中
    // 設置用戶 ID
    setUserId(userId) {
      this.userId = userId;// 更新 userId
      localStorage.setItem('userId', userId); // 儲存 userId
    },
    setToken(token) {
      this.token = token; // 更新 token 狀態
      localStorage.setItem('token', token); // 儲存 token 到 localStorage
    },
    // clearToken()原本
    clearAuth() {
      this.token = ''; // 清除 token
      this.userId = null; // 清除 userId
      localStorage.removeItem('token'); // 從 localStorage 移除
      localStorage.removeItem('userId');
    },
    async registerUser(userDetails) {
        try {
          const result = await register(userDetails);
          alert('註冊成功！請前往登入頁面');
          return result;
        } catch (error) {
          throw new Error(error.message);
        }
    },
  },
});
