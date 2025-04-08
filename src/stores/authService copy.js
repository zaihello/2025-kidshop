//負責 API 請求與邏輯（如登入、登出、註冊等）
import { useAuthStore } from './authStore'// 引入 Pinia 的認證狀態管理
import { useWishlistStore } from './wishlistStore'
import { useCartStore } from './cartStore';

import axios from 'axios';

const API_URL = 'https://204ed3432b06d7af.mokky.dev';

//登入原本
// export async function login(credentials) {
//     const authStore = useAuthStore(); // 使用 authStore
//     try {
//       const { data } = await axios.post(`${API_URL}/auth`, credentials); // 發送登入請求
//       authStore.setToken(data.token); // 更新 token 狀態
//       return data;
//     } catch (error) {
//       console.error('登入失敗:', error);
//       throw new Error('登入失敗，請檢查帳號或密碼是否正確');
//     }
// }
// export async function login(credentials) {
//     const authStore = useAuthStore(); // 使用 authStore
//     const wishlistStore = useWishlistStore(); // 使用 wishlistStore

//     try {
//       const { data } = await axios.post(`${API_URL}/auth`, credentials); // 發送登入請求
//       authStore.setToken(data.token); // 更新 token 狀態
//        // 在登入後獲取該用戶的追蹤清單
//        await wishlistStore.getWishlist();

//       return data;
//     } catch (error) {
//       console.error('登入失敗:', error);
//       throw new Error('登入失敗，請檢查帳號或密碼是否正確');
//     }
// }
export async function login(credentials) {
    const authStore = useAuthStore();
    const wishlistStore = useWishlistStore();
    const cartStore = useCartStore()
  
    try {
      // 發送登入請求
    //  data:user這裡的data是輸出的格式https://mokky.gitbook.io/welcome/dop.-nastroiki/autentifikaciya/primer-koda 看成功回覆標題
      const response = await axios.post(`${API_URL}/auth`, credentials);
      const { token, data:user } = response.data;
      console.log('token + user:',response.data)  
      // 設置用戶的 Token 和 ID
      authStore.setToken(token);// 保存 token
      authStore.setUserId(user.id);// 保存 userId

      // 確保 token 和 userId 設置後調用 getWishlist
    if (!authStore.token || !authStore.userId) {
        throw new Error('Token 或 UserId 設置失敗');
      }
  
  
      // 登入後同步獲取追蹤清單
      await wishlistStore.getWishlist();
      // 初始化購物車
      // await cartStore.initializeCart(user.id, token);
      await cartStore.getCartData({ initialize: true });

      // 更新購物車總金額與狀態
      // cartStore.updateCartTotals();
      // cartStore.updateCartSummary()//更新購物車摘要
      // cartStore.updateSelectAllState()
      // cartStore.updateItemSelectionState()// 確保所有商品的選擇狀態同步
      // cartStore.toggleSelectAll()// 全選所有商品
      console.log('登入成功，購物車與追蹤清單已同步');
      return response.data; // 返回數據供組件使用
    } catch (error) {
      console.error('登入失敗:', error);
      throw new Error('登入失敗，請檢查帳號或密碼是否正確');
    }
}
//登出
// export function logout() {
//     const authStore = useAuthStore(); // 使用 authStore
//     authStore.clearToken(); // 清除 token
// }
export async function logout() {
    const authStore = useAuthStore();
    const wishlistStore = useWishlistStore();
    const cartStore = useCartStore()
  
    try {
      // 清空本地和狀態管理
      authStore.clearAuth();// 清空 token 和 userId
      wishlistStore.clearWishlist();// 清空追蹤清單
      
       // 清空購物車(isInCart狀態被清除)
       cartStore.cartItems = [];
       cartStore.backendCart = { items: [] };
       cartStore.syncCartToLocalStorage(); // 同步到本地儲存
      // cartStore.clearCart(); // 清空購物車
      console.log('登出成功，所有狀態已清空');

    } catch (error) {
      console.error('登出失敗:', error);
    }
  }
//版本2
// /**
//  * 登入功能服務
//  * @param {Object} credentials - 使用者的登入憑證（email 和 password）
//  * @returns {Promise<Object>} 返回包含登入成功後的數據
//  */
// export async function login(credentials) {
//     try {
//         // 發送 POST 請求進行登入
//         const { data } = await axios.post('https://204ed3432b06d7af.mokky.dev/auth', credentials);

//         // 儲存 token 到 localStorage
//         localStorage.setItem('token', data.token);

//         console.log('登入成功，Token:', data.token);
//         return data; // 返回登入成功的數據（如 token）
//     } catch (error) {
//         console.error('Login error:', error);

//         // 捕捉錯誤並丟出，供呼叫者處理
//         throw new Error(error.response?.data?.message || '登入失敗，請檢查您的帳號密碼是否正確！');
//     }
// }



// //登出
// export function logout(router) {
//     try {
//         // 移除本地的 Token
//         localStorage.removeItem('token');

//         // 跳轉到首頁或登入頁
//         router.push('/shop');
//     } catch (error) {
//         console.error('登出失敗:', error);
//         throw error;
//     }
// }

// /**
//  * 註冊功能服務
//  * @param {Object} userDetails - 使用者的註冊資料
//  * @returns {Promise<Object>} 返回註冊成功的回應數據
//  */
export async function register(userDetails) {
    try {
        // 發送 POST 請求進行註冊
        const { data } = await axios.post('https://204ed3432b06d7af.mokky.dev/register', userDetails);

        console.log('註冊成功，回應數據:', data);
        return data; // 返回註冊成功的數據
    } catch (error) {
        console.error('Registration error:', error);

        // 捕捉錯誤並丟出，供呼叫者處理
        throw new Error(error.response?.data?.message || '註冊失敗，請檢查您的資料是否正確！');
    }
}


// 版本1
// export async function login(router, credentials) {
//     const wishlistStore = useWishlistStore();

//     try {
//         const { data } = await axios.post('API_ENDPOINT', credentials);

//         // 設置 token
//         wishlistStore.setToken(data.token);

//         // 導向首頁或其他頁面
//         router.push('/');
//     } catch (error) {
//         console.error('登入失敗:', error);
//         throw error;
//     }
// }

// export function logout(router) {
//     const wishlistStore = useWishlistStore();

//     wishlistStore.logout(); // 清空 token 和 localStorage

//     // 導向登入頁
//     router.push('/login');
// }