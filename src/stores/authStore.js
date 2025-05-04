//會員登入管理
//負責存儲和管理前台(會員)的狀態 (user、token、role)。

import { defineStore } from 'pinia'
import { useCartStore } from './cartStore'
import { useWishlistStore } from './wishlistStore'

// const API_URL = 'https://204ed3432b06d7af.mokky.dev/auth';
//auth
export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user:null,//註冊用
    token: localStorage.getItem('userToken') || '', // 從 localStorage 初始化 token
    role: localStorage.getItem('userRole') || '',
    id: Number(localStorage.getItem('userId')) || 0,//localStorage.getItem() 總是返回字串或 null 加上 Number
  }),
  getters: {
    isLoggedIn(state) {
      return !!state.token; // 判斷是否已登入
    },
  },
  actions: {
    setAuthData(token, user) {
      this.token = token;
      this.user = user;
      this.role = user.role;
      this.id = user.id;  // 儲存 userId

      localStorage.setItem('userToken', token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id); // 儲存 userId
    },
    clearAuth() {
      const cartStore = useCartStore()
      const wishlistStore = useWishlistStore();
      
      this.token = '';
      this.user = null;
      this.role = '';
      this.id = '';

      localStorage.removeItem('userToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');  // 清除 userId

       // 清除與使用者相關的其他狀態
      cartStore.clearCartItems();// 清空購物車
      wishlistStore.clearWishlist();// 清空追蹤清單
    },
  },
});
