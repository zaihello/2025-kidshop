//集中處理 API 請求，包含(會員)和(管理員)的登入、登出、註冊。
//後端 API /auth 可以同時處理前台 & 後台登入，根據 role 來決定使用者是否是管理員。
import { useAuthStore } from './authStore'// 引入 Pinia 的認證狀態管理
import { useAdminAuthStore } from './adminAuthStore'
import { useWishlistStore } from './wishlistStore'
import { useCartStore } from './cartStore';

import axios from 'axios';

const API_URL = 'https://204ed3432b06d7af.mokky.dev';


// 前台會員登入
//登入成功後，會儲存 id 到 authStore
export async function login(credentials) {
    const authStore = useAuthStore();
    const wishlistStore = useWishlistStore();
    const cartStore = useCartStore()
  
    try {
      // 發送登入請求
    //  data:user這裡的data是輸出的格式https://mokky.gitbook.io/welcome/dop.-nastroiki/autentifikaciya/primer-koda 看成功回覆標題
      const response = await axios.post(`${API_URL}/auth`, credentials);
      const { token, data:user } = response.data;
      console.log('會員登入回應:',response.data)  
      // 設置用戶的 Token 和 ID
      // authStore.setToken(token);// 保存 token
      // authStore.setUserId(user.id);// 保存 userId

      // 確保 token 和 userId 設置後調用 getWishlist
    // if (!authStore.token || !authStore.userId) {
    //     throw new Error('Token 或 UserId 設置失敗');
    //   }
      // **改用 `type` 判斷會員**
      if(user.type === 'member'){
        authStore.setAuthData(token, user);
        console.log(`會員登入成功，ID: ${user.id}`);
        // 確保 token 和 userId 設置成功後再執行其他操作
        // if (!authStore.token || !authStore.user) {
        //   throw new Error('Token 或 UserId 設置失敗');
        // }

        // 後台會員的last_login:取得當前台灣時間並格式化為 YYYY/MM/DD HH:mm
        const now = new Date().toLocaleString('zh-TW', { 
          timeZone: 'Asia/Taipei', 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false  // 24小時制
        }).replace(/\//g, '-'); // 轉換 `/` 為 `-` 以符合 API 要求

        // 更新 last_login
       
        await axios.patch(`${API_URL}/users/${user.id}`, { last_login: now });
         // **更新 authStore，讓畫面立即顯示最新時間**
        //  authStore.setAuthData(token, { ...user, last_login: now });
        console.log('會員 last_login 已更新:', now);

         // 登入後同步獲取追蹤清單
        await wishlistStore.getWishlist();
        // 初始化購物車
        await cartStore.getCartData({ initialize: true });

        console.log('會員登入成功，購物車與追蹤清單已同步');
        return response.data; // 返回數據供組件使用
      }else{
        throw new Error('非會員帳號，請使用管理員登入');
      }
    } catch (error) {
      console.error('會員登入失敗:', error);
      throw new Error('登入失敗，請檢查帳號或密碼是否正確');
    }
}
// 管理員登入
//登入成功後，會儲存 id 到 adminAuthStore
export async function adminLogin(credentials){
  const adminAuthStore = useAdminAuthStore()

  try{
    const response = await axios.post(`${API_URL}/auth`, credentials);
    const { token, data: user } = response.data;
    console.log('管理員登入回應:', response.data);
    // **改用 `type` 判斷管理員**
    if (user.type === 'admin') {
      adminAuthStore.setAuthData(token, user);
      console.log(`管理員登入成功，ID: ${user.id}`);
      return response.data;
    } else {
      throw new Error('非管理員帳號，請使用前台登入');
    }
    // if (admin.type === 'admin' || admin.role === 'superadmin') {
    //   adminAuthStore.setAuthData(token, user);
    //   console.log(`管理員登入成功，ID: ${user.id}`);
    //   return response.data;
    // } else {
    //   throw new Error('非管理員帳號，請使用前台登入');
    // }

    // if(user.role === 'admin' || user.role === 'superadmin'){
    //   adminAuthStore.setAuthData(token, user);
    //   console.log('管理員登入成功');
    //   return response.data;
    // }else{
    //   throw new Error('非管理員帳號，請使用前台登入');
    // }
  }catch(error){
    console.error('管理員登入失敗:', error);
    throw new Error('登入失敗，請檢查帳號或密碼');
  }
}

// 登出（通用）
export function logout() {
    const authStore = useAuthStore();
    const adminAuthStore = useAdminAuthStore();
    const wishlistStore = useWishlistStore();
    const cartStore = useCartStore()
  
   
      // 清空本地和狀態管理
      authStore.clearAuth();// 清空 token 和 userId
      adminAuthStore.clearAuth();
      wishlistStore.clearWishlist();// 清空追蹤清單
      
       // 清空購物車(isInCart狀態被清除)
       cartStore.cartItems = [];
       cartStore.backendCart = { items: [] };
      //  cartStore.syncCartToLocalStorage(); // 同步到本地儲存
   
      console.log('登出成功，所有狀態已清空');

   
}

// /**
//  * 註冊功能服務
//  * @param {Object} userDetails - 使用者的註冊資料
//  * @returns {Promise<Object>} 返回註冊成功的回應數據
//  */
//會員註冊
export async function register(userDetails) {
    try {
        // 發送 POST 請求進行註冊
        const { data } = await axios.post('https://204ed3432b06d7af.mokky.dev/register', userDetails);

        // console.log('註冊成功，回應數據:', data);
        return data; // 返回註冊成功的數據
    } catch (error) {
        console.error('註冊失敗:', error);

        // 捕捉錯誤並丟出，供呼叫者處理
        throw new Error(error.response?.data?.message || '註冊失敗，請檢查您的資料是否正確！');
    }
}


