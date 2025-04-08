//會員登入管理
//負責存儲和管理前台(會員)的狀態 (user、token、role)。

import { defineStore } from 'pinia'
// import { register } from './authService'
import axios from 'axios'

// const API_URL = 'https://204ed3432b06d7af.mokky.dev/auth';
//auth
export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user:null,//註冊用
    token: localStorage.getItem('userToken') || '', // 從 localStorage 初始化 token
    role: localStorage.getItem('userRole') || '',
    id: localStorage.getItem('userId') || 0,// 從 localStorage 初始化 userId ''
    // userId: localStorage.getItem('userId') || null, // 初始化 userId
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
    // setUserId(userId) {
    //   this.userId = userId;// 更新 userId
    //   localStorage.setItem('userId', userId); // 儲存 userId
    // },
    setAuthData(token, user) {
      this.token = token;
      this.user = user;
      // this.user = { ...user, last_login: user.last_login };  // 確保有 last_login(不用刷新頁面)
      this.role = user.role;
      this.id = user.id;  // 儲存 userId

      localStorage.setItem('userToken', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id); // 儲存 userId
      // localStorage.setItem('lastLogin', user.last_login);
    },
    clearAuth() {
      this.token = '';
      this.user = null;
      this.role = '';
      this.id = '';

      localStorage.removeItem('userToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');  // 清除 userId
    },
    // setToken(token) {
    //   this.token = token; // 更新 token 狀態
    //   localStorage.setItem('token', token); // 儲存 token 到 localStorage
    // },
    // clearToken()原本
    // clearAuth() {
    //   this.token = ''; // 清除 token
    //   this.userId = null; // 清除 userId
    //   localStorage.removeItem('token'); // 從 localStorage 移除
    //   localStorage.removeItem('userId');
    // },
    // async registerUser(userDetails) {
    //     try {
    //       const result = await register(userDetails);
    //       alert('註冊成功！請前往登入頁面');
    //       return result;
    //     } catch (error) {
    //       throw new Error(error.message);
    //     }
    // },
  },
});
