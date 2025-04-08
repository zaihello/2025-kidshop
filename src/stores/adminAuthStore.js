//管理員登入管理
//負責存儲和管理(後台管理員)的狀態 (admin、token、role)。
import { defineStore } from 'pinia';

export const useAdminAuthStore = defineStore('adminAuth', {
    state: () => ({
      admin: null,
      token: localStorage.getItem('adminToken') || '',
      role: localStorage.getItem('adminRole') || '',
      id: localStorage.getItem('adminId') || '',
    }),
    getters: {
      isLoggedIn: state => !!state.token,//用來判斷顯示 登出按鈕
      isSuperAdmin: state => state.role === 'superadmin',
      adminName: (state) => state.admin?.name || localStorage.getItem("adminName") || "管理員", // 新增 管理員名稱(這樣如果 adminAuthStore.admin 已經有資料，就會使用最新的 name，否則才從 localStorage 拿。)
    },
    actions: {
        setAuthData(token, admin) {
            this.token = token;
            this.admin = admin;// 存完整的 admin 資料
            this.role = admin.role;
            this.id = admin.id;
      
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminRole', admin.role);
            localStorage.setItem('adminId', admin.id);
            localStorage.setItem("adminName", admin.name); // 存入管理員名稱
        },
        clearAuth() {
            this.token = '';
            this.admin = null;
            this.role = '';
            this.id = '';
      
            // 清除 LocalStorage
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminId');
            localStorage.removeItem('adminAccounts');
            localStorage.removeItem('adminProducts');
            localStorage.removeItem('lastLogin');
            localStorage.removeItem('memberAccounts');
            localStorage.removeItem('adminName');


        },
   
    },
  });