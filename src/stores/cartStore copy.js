import { defineStore } from "pinia";
import { useAuthStore } from './authStore'
import axios from 'axios'

//資料流：本地（cartItems）(主要是為了渲染UI)➡ 本地存儲（syncToLocalStorage）➡ 後端（syncCartToServer）。
export const useCartStore = defineStore("cart",{
    state:() =>({
        cartItems:[],// (本地)當前用戶的購物車內容(前端資料格式)
        backendCart: {items:[]}, // (後端資料格式)，用於同步購物車
        cart_Id:null,//每個user一個cart_Id(後端格式)
        // couponCode:"", // 優惠券代碼
       
        freight:200, // 運費
        total:0, //  被選商品的總金額
        final_total:0,// 折扣後的最終金額
        discount:100,   // 預設折抵金額
        // selectAll: false, // 全選狀態
        couponCode:null,// 當前唯一作用中的優惠券。
        redeemedCoupons: [], // (記錄用戶已成功領取的所有優惠券)
        couponDiscount:0,//優惠卷折抵金額
        autoDiscount:0,//滿額自動折抵金額
        availableCoupons:[],//存放後端優惠卷的活動資訊
        discountRules:[],//存放後端滿額電腦自動折扣活動資料(消費滿5000折500)
        IsdiscountRules:false,// 是否已應用滿額折扣

        // selectAll:false, // 全選按鈕的狀態
        // selectedTotal:0, // 被選商品的總金額
    }),
    getters:{
        //  isInCart 是一個函數當使用它時，首先需要傳入 productId，這個函數才會返回一個布林值。isInCart 本身是函數，而它的返回結果才是 Boolean (true 或 false)。
        isInCart: (state) => (productId) => {
            // console.log('Checking if product is in cart:', productId);//有
            return state.cartItems.some(item => item.id === productId);
        },
        // 計算使用者商品品項數量
        itemTypesCount(state) {
            return Array.isArray(state.backendCart.items) 
                ? state.backendCart.items.length 
                : 0;
        },
        //計算差多少到滿額折扣
        nextThreshold(state) {
            const thresholds = state.discountRules
                .filter(rule => rule.threshold > state.total)
                .map(rule => rule.threshold - state.total);
            return thresholds.length ? Math.min(...thresholds) : 0;
        },
        //cartItems 的 selected 狀態改變，selectAll 也會自動更新。
        selectAll() {
            return this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
        }
        
         // 計算被選商品的總金額
        // getSelectedTotal(state) {
        //     return state.cartItems
        //     .filter((item) => item.selected)
        //     .reduce((sum, item) => sum + item.subTotal, 0);
        // },
    },
    actions:{
        // (前端用)初始化購物車，無需前端檢查購物車是否存在。(獲取購物車項目，還負責處理購物車是否存在的邏輯，並創建新的購物車。)
        // async initializeCart() {
        //     const authStore = useAuthStore();
        //     const userId = authStore.userId;
        //     const token = authStore.token;

        //     try {
        //         if (!userId || !token) {
        //             console.error("未登入，無法初始化購物車");
        //             return;
        //         }


        //         // 向後端查詢購物車（後端負責生成空購物車）
        //         const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/cartsdata?user_id=${userId}`, {
        //             headers: { Authorization: `Bearer ${token}` },
        //         });
                
        //         const userCarts = response.data; // 後端應返回一個購物車對象
        //         // if (userCart && userCart.id) {
        //         //     // 購物車存在，合併後端數據
        //         //     this.cart_Id = userCart.id;
        //         //     // this.backendCart = userCart; // 儲存後端格式
        //         //     // this.backendCart = {
        //         //     //     ...userCart,
        //         //     //     items: userCart.items || [], // 確保 items 屬性有效
        //         //     // };
        //         //     // this.cartItems = this.processCartItems(userCart.items || []);// 轉換為前端格式|| []
        //         //     this.backendCart = {
        //         //         ...userCart,
        //         //         items: Array.isArray(userCart.items) ? userCart.items : [], // 確保 items 是有效的陣列
        //         //     };
        //         //     this.cartItems = this.processCartItems(this.backendCart.items); // 轉換為前端格式
        //         // } else {
        //         //     console.error("初始化購物車時未獲得有效資料");
        //         //     // 如果購物車不存在，創建新的購物車
        //         //     const newCart = await this.createNewCart();
        //         //     this.cart_Id = newCart.id;
        //         //     // this.backendCart = newCart;
        //         //     this.backendCart = {
        //         //         ...newCart,
        //         //         items: [], // 確保 items 為空陣列
        //         //     };
        //         //     this.cartItems = [];
        //         // }
        //         if (Array.isArray(userCarts) && userCarts.length > 0) {
        //             // 找到第一個對應的購物車
        //             const existingCart = userCarts[0]; // 假設使用第一個購物車
        //             this.cart_Id = existingCart.id;
        //             this.backendCart = {
        //                 ...existingCart,
        //                 items: Array.isArray(existingCart.items) ? existingCart.items : [], // 確保 items 是有效的陣列
        //             };
        //             this.cartItems = this.processCartItems(this.backendCart.items); // 轉換為前端格式
        //         } else {
        //             console.error("沒有找到現有購物車，創建一個新的購物車");
        //             // 如果沒有購物車，創建新的購物車
        //             const newCart = await this.createNewCart();
        //             this.cart_Id = newCart.id;
        //             this.backendCart = {
        //                 ...newCart,
        //                 items: [], // 確保 items 為空陣列
        //             };
        //             this.cartItems = [];
        //         }
        //         this.updateCartState(); // 統一更新狀態
                
        //         console.log("購物車初始化成功：", this.cartItems);
        //     } catch (error) {
        //         console.error("初始化購物車失敗：", error);
        //     }
        // },
        //(購物清單頁面專用，取得購物車商品資訊)
        // async loadCartForDisplay() {
        //     try {
        //         const authStore = useAuthStore();
        //         const userId = authStore.userId;
        //         const token = authStore.token;

        //         const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/cartsdata?user_id=${userId}`, {
        //             headers: { Authorization: `Bearer ${token}` },
        //         });
        
        //         const userCart = response.data[0]; // 假設後端返回單一購物車
        //         if (userCart) {
        //             this.cart_Id = userCart.id;
        //             // 前端顯示和後端相容
        //             this.cartItems = this.processCartItems(userCart.items);
        //             this.freight = userCart.freight ?? 0; // 後端可能返回運費，確保它有正確值 (add)

        //         } else {
        //             console.warn("未找到購物車資料");
        //             this.cartItems = []; // 如果沒有購物車，設為空
        //             this.freight = 0; // 如果沒有購物車，運費設為 0 (add)
        //         }
        //         this.updateCartTotals();
        //         console.log("購物車資料已載入：", this.cartItems);
        //     } catch (error) {
        //         console.error("載入購物車資料失敗：", error);
        //     }
        // },

        //為initializeCart和loadCartForDisplay整合
        //後端加載購物車數據(參數區分是顯示購物車還是初始化)
        async getCartData({ initialize = false } = {}) {
            const authStore = useAuthStore();
            // const userId = authStore.userId;
            const userId = authStore.id;
            const token = authStore.token;
        
            if (!userId || !token) {
                console.log("未登入，無法加載購物車");
                return;// 不執行後續程式
            }
        
            try {
                const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/cartsdata?user_id=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                const userCarts = response.data;
                // 如果找到現有購物車
                if (Array.isArray(userCarts) && userCarts.length > 0) {
                    const existingCart = userCarts[0];
                    this.cart_Id = existingCart.id;
                    this.backendCart = { ...existingCart, items: existingCart.items || [] };

                     // 直接從後端獲取 selected 狀態，並將其映射到 cartItems
                    // this.cartItems = this.backendCart.items.map(item => ({
                    //     // ...item,
                    //     selected: item.selected ?? false, // 默認為 false 如果後端沒有返回 selected
                    // }));
                    //原本
                    //  this.cartItems = this.processCartItems(this.backendCart.items);
                    //
                    // 合併後端數據與 LocalStorage 的 selected 狀態
                    // const localItems = JSON.parse(localStorage.getItem("cartItems")) || [];
                    // this.cartItems = this.processCartItems(this.backendCart.items).map((item) => {
                    //     const localItem = localItems.find((local) => local.product_Id === item.product_Id);
                    //     return {
                    //         ...item,
                    //         selected: localItem ? localItem.selected : false, //使用 LocalStorage 中的 selected 狀態
                    //     };
                    // });
                    //selected: localItem ? localItem.selected : item.selected,
                    //2.ok 直接從後端獲取 selected 狀態，並將其映射到 cartItems
                    // this.cartItems = this.processCartItems.items.map(item => ({
                    //     ...item,
                    //     selected: item.selected ?? false, // 默認為 false 如果後端沒有返回 selected
                    // }));   
                    //3.刷新頁面刷新頁面ok    
                    // 取得 LocalStorage 中的 cartItems                
                    // const localItems = JSON.parse(localStorage.getItem("cartItems")) || [];
                    // // // 合併後端數據與 LocalStorage 狀態
                    // this.cartItems = this.backendCart.items.map(item => {
                    //     const localItem = localItems.find(local => local.product_Id === item.product_Id);
                    //     return this.createCartItem(
                    //         item.product,
                    //         localItem ? localItem.selected : item.selected ?? false // 傳入選中狀態
                    //     );
                    // });
                    //4.
                    // 獲取 LocalStorage 中的 cartItems
const localItems = JSON.parse(localStorage.getItem("cartItems")) || [];

//                     // 合併後端數據與 LocalStorage 狀態，並轉換為前端格式
this.cartItems = this.processCartItems(
    this.backendCart.items.map(item => {
        const localItem = localItems.find(local => local.product_Id === item.product_Id);
        return {
            ...item,
            selected: localItem ? localItem.selected : item.selected ?? false, // 傳入選中狀態
        };
    })
);
                   
                    this.syncCartToLocalStorage();// 將最新購物車資料同步到 LocalStorage

                } else if (initialize) {
                    // 如果選擇初始化購物車
                    const newCart = await this.createNewCart();
                    this.cart_Id = newCart.id;
                    this.backendCart = { ...newCart, items: [] };
                    this.cartItems = [];
                    // this.syncCartToLocalStorage();// 將最新購物車資料同步到 LocalStorage

                } else {
                    console.error("未找到購物車");
                    return;// 不執行後續程式
                }
                
                // this.syncCartToLocalStorage();// 將最新購物車資料同步到 LocalStorage
                // console.log("購物車資料已加載：", this.cartItems);
            } catch (error) {
                console.error("加載購物車失敗：", error);
            }
        },
        
        
        //前端單一商品的格式資料(前端UI所需的 cartItems 格式，為購物清單專用)
        processCartItems(items) {   
            return items.map(item => ({
                id: item.product_Id,
                name: item.product.name,
                category: item.product.category,
                size: item.product.size,
                color: item.product.color,
                imgurl: item.product.imgurl,
                qty: item.qty,
                price: item.price,
                subTotal: item.subTotal,
                originalPrice: item.product?.OriginalPrice,
                selected: item.selected ?? false, // 默認值為 false
            }));
        },
        //selected:item.selected ?? false, // (在購物車頁面勾選商品)並初始化為 false
        //前端格式的完整使用者物件
        createFrontendCart() {
            const authStore = useAuthStore();
            // const userId = authStore.userId;
            const userId = authStore.id;
            return {
                id: this.cart_Id, // 購物車 ID
                user_id:userId, // 使用者 ID
                items: this.processCartItems(this.cartItems), // 使用 processCartItems 方法處理購物車項目
                total: this.total, // 總金額
                final_total: this.final_total, // 最終金額
                status: this.status || false, // 購物車狀態
                orderStatus: this.orderStatus || false, // 訂單狀態
            };
        },
        //創建一個新的後端空購物車的(後端格式)
        getEmptyCartPayload(userId) {
            return {
                user_id: userId,
                items: [],
                total: 0,
                final_total: 0,
                status: false,
                orderStatus: false,
                // selectAll: false, // 初始化為未全選
            };
        },
        // 創建一個新的後端空購物車(使用後端格式)
        async createNewCart() {
            const authStore = useAuthStore();
            // const userId = authStore.userId;
            const userId = authStore.id;
            const token = authStore.token;

            const emptyCartPayload = this.getEmptyCartPayload(userId); // 使用封裝的空購物車格式
            const response = await axios.post(
                `https://204ed3432b06d7af.mokky.dev/cartsdata`,
                emptyCartPayload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data; // 返回新創建的購物車
        },
        // 創建單個商品加入購物車為一個物件(後端格式)
        createCartItem(product,selected = false) {
            const price = product.price || product.OriginalPrice || 0;
           
            return {
                product_Id: product.id,
                qty: 1,  // 數量固定為 1
                price:price,
                subTotal: price ,
                product: { ...product },  // 商品的詳細信息
                selected:selected, 
            };
        },
        // 創建購物車以userId為一個(後端格式)
        createPayload() {
            const authStore = useAuthStore(); // 獲取 authStore
            // const userId = authStore.userId; // 從 authStore 獲取 userId
            const userId = authStore.id; 
      
            return {
            id: this.cart_Id,
            user_id: userId,
            items: this.cartItems.map(item => this.createCartItem(item)),
            total: this.total,
            final_total: this.final_total,
            status: false,
            orderStatus: false,
            };
        },
        
        // async addToCart(product, userId, token) {
        //     if (!token || !userId) {
        //         alert("請先登入以加入購物車");
        //         return;
        //     }
        //     // 確保購物車已初始化
        //     if (!this.cart_Id) {
        //         await this.initializeCart(userId, token);
        //     }
        //     // 檢查是否已存在商品
        //     const existingItem = this.cartItems.find(item => item.product_Id === product.id);
        //     if (existingItem) {
        //         // 如果商品已存在，提示用戶
        //         alert("商品已在購物車中");
        //         return;
        //     }
        
        //     // 新增商品到購物車
        //     // 使用 createCartItem 將商品格式化
        //     const newItem = this.createCartItem(product);
        //     // 添加到本地購物車
        //     this.cartItems.push(newItem);
        //      // 更新購物車總金額與小計
        //     this.updateCartTotals();
        //      // 本地存儲同步
        //     this.syncToLocalStorage();

        
           
        //     //1
        //     // try{
        //     //     // 同步到後端
        //     //     const response = await axios.post(
        //     //         "https://204ed3432b06d7af.mokky.dev/cartsdata",
        //     //         payload,
        //     //         { headers: { Authorization: `Bearer ${token}` } }
        //     //     );
                
        //     //     // 使用 processCartItems 將後端返回的數據格式化為前端所需結構
        //     //     this.cartItems = this.processCartItems(response.data);
                
        
        //     //     alert("商品已加入購物車");
        //     //     console.log("購物車已更新：", response.data);
        
                
        //     //     //同步購物車數據到後端
        //     //     this.syncCartToServer(userId, token, this.cartItems);
        //     // } catch (error) {
        //     //     // 如果後端操作失敗，回滾本地變更
        //     //     this.cartItems.pop();
        //     //     this.syncToLocalStorage(); // 回滾時更新 localStorage
        //     //     alert("無法新增商品，請稍後再試。");
        //     //     console.error("加入購物車失敗：", error);
        //     // }
        //     //2
        //     // try {
        //     //     // 如果購物車已存在，更新後端資料
        //     //     if (this.cart_Id) {
        //     //          // 構建 payload
        //     //         const payload = this.createPayload(userId, this.total, this.final_total)
        //     //         await axios.patch(
        //     //             `https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cart_Id}`,
        //     //             payload,
        //     //             { headers: { Authorization: `Bearer ${token}` } }
        //     //         );
        //     //     } else {
        //     //         // 如果購物車不存在，創建新的購物車
        //     //         // const response = await axios.post(
        //     //         //     "https://204ed3432b06d7af.mokky.dev/cartsdata",
        //     //         //     payload,
        //     //         //     { headers: { Authorization: `Bearer ${token}` } }
        //     //         // );
        //     //         // this.cart_Id = response.data.id; // 紀錄新的購物車 ID
        //     //         // 如果购物车不存在，创建新的购物车
        //     //         const newCart = await this.createNewCart(userId, token);
        //     //         this.cart_Id = newCart.id; // 记录新的购物车ID
        //     //     }
        
        //     //     alert("商品已加入購物車");
        //     // } catch (error) {
        //     //     this.cartItems.pop(); // 回滾本地變更// 删除最后添加的商品
        //     //     this.syncToLocalStorage();// 回滚时更新 localStorage
        //     //     alert("無法新增商品，請稍後再試。");
        //     //     console.error("加入購物車失敗：", error);
        //     // }
        //     //3
        //     try {
        //         // 將更新同步到後端
        //         const payload = this.createPayload(userId, this.total, this.final_total);
        //         await axios.patch(
        //             `https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cart_Id}`,
        //             payload,
        //             { headers: { Authorization: `Bearer ${token}` } }
        //         );
        
        //         alert("商品已加入購物車");
        //     } catch (error) {
        //         // 回滾本地變更
        //         this.cartItems.pop();
        //         this.updateCartTotals();
        //         this.syncToLocalStorage();
        //         alert("新增商品失敗，請稍後再試。");
        //         console.error("加入購物車失敗：", error);
        //     }
        // },
        //原版
        // async addToCart(product) {
        //     const authStore = useAuthStore();
        //     const userId = authStore.userId;
        //     const token = authStore.token;
    
        //     if (!token || !userId) {
        //         alert("請先登入以加入購物車");
        //         return;
        //     }
    
        //     if (!this.cart_Id) {
        //         await this.initializeCart();// 確保購物車初始化
        //     }
    
        //     const existingItem = this.cartItems.find(item => item.id === product.id);
        //     if (existingItem) {
        //         alert("商品已在購物車中");
        //         return;
        //     }
        //     // 確保 color 和 size 只取第一個內容(因為我在這邊的設計是這樣)
        //     const color = Array.isArray(product.color) && product.color.length > 0 
        //         ? product.color[0] 
        //         : null;
        //     const size = Array.isArray(product.size) && product.size.length > 0 
        //         ? product.size[0] 
        //         : null;
    
        //     // const newItem = this.createCartItem(product);
        //     // 創建新的購物車項目，將處理後的 color 和 size 加入
        //     const newItem = this.createCartItem({
        //         ...product,
        //         color: color,// 只取陣列第一個內容
        //         size: size,// 只取陣列第一個內容
        //     });

        //     // 確保 backendCart.items 為有效陣列
        //     if (!Array.isArray(this.backendCart.items)) {
        //         console.error("後端購物車 items 格式無效，初始化為空陣列");
        //         this.backendCart.items = [];
        //     }
        //     // 添加新項目到 cartItems 和 backendCart.items
        //     this.cartItems.push(this.processCartItems([newItem])[0]);
        //     this.backendCart.items.push(newItem);// 推送後端格式資料
    
        //     this.updateCartState(); // 統一更新狀態
    
        //     try {
        //         const payload = {
        //             id: this.cart_Id,
        //             user_id: userId,
        //             items: this.backendCart.items,
        //             total: this.total,
        //             final_total: this.final_total,
        //         };
        //         await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cart_Id}`, payload, {
        //             headers: { Authorization: `Bearer ${token}` },
        //         });
    
        //         alert("商品已加入購物車");
        //     } catch (error) {
        //         console.error("新增商品失敗：", error);
        //     }
        // },
        //商品列表頁的addToCart，，優化後(分離數據操作與數據同步邏輯)
        async addToCart(product) {
            const existingItem = this.cartItems.find(item => item.id === product.id);
            if (existingItem) {
                alert("商品已在購物車中");
                return;
            }
        
            const color = Array.isArray(product.color) ? product.color[0] : null;
            const size = Array.isArray(product.size) ? product.size[0] : null;
        
            const newItem = this.createCartItem({
                ...product,
                color,//
                size,//
            });

            this.cartItems.push(this.processCartItems([newItem])[0]);
            this.backendCart.items.push(newItem);
        
            await this.syncCartToServer(); // 統一同步到後端
            this.syncCartToLocalStorage();// 同步到 localStorage
        },
        

        
        // 3.從購物車移除此商品 ok
        // async removeFromCart(productId, userId, token) {
        //     const index = this.cartItems.findIndex(item => item.product_Id === productId);
        //     if (index !== -1) {
        //         // 暫存被移除的商品，以防同步失敗時進行回退
        //         const removedItem = this.cartItems.splice(index, 1)[0];
        //         this.syncToLocalStorage(); // 更新到 localStorage
        
        //         try {
        //             console.log("正在移除商品，productId:", productId);
        
        //             // 發送 DELETE 請求
        //             const response = await axios.delete(
        //                 `https://204ed3432b06d7af.mokky.dev/cartsdata/${productId}`, 
        //                 { headers: { Authorization: `Bearer ${token}` } }
        //             );
        
        //             console.log(`URL: https://204ed3432b06d7af.mokky.dev/cartsdata/${productId}`);
        //             console.log("Headers:", { Authorization: `Bearer ${token}` });
        //             console.log("商品已從購物車移除", response.data);
        
        //             alert("移除商品完成!");
        //             // 更新購物車總金額
        //             this.updateCartTotals();
                    
        //             // 同步到後端
        //             this.syncCartToServer(userId, token, this.allCartPayloads);
        //         } catch (error) {
        //             // 後端刪除失敗，將商品恢復到本地購物車
        //             this.cartItems.splice(index, 0, removedItem);
        //             this.syncToLocalStorage(); // 回退時同步到 localStorage
        //             alert("無法移除商品，請稍後再試。");
        //             console.error("移除購物車失敗：", error);
        //         }
        //     } else {
        //         alert("商品不在購物車中，無需移除。");
        //     }
            
        // },
        //從購物車移除此商品(原版)
        // async removeFromCart(productId) {
        //     const authStore = useAuthStore();
        //     const userId = authStore.userId;
        //     const token = authStore.token;
        //      // 移除指定商品
        //     this.cartItems = this.cartItems.filter(item => item.id !== productId);
        //     this.backendCart.items = this.backendCart.items.filter(item => item.product_Id !== productId);
        //     this.updateCartState(); // 統一更新狀態
        
        //     try {
        //         if (this.cartItems.length === 0) {
        //              // 當購物車為空時，使用封裝的空購物車格式
        //             const emptyCartPayload = this.getEmptyCartPayload(userId);
        //              // 更新後端購物車為空購物車格式
        //             await axios.patch(
        //                 `https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cart_Id}`,
        //                 emptyCartPayload,
        //                 { headers: { Authorization: `Bearer ${token}` } }
        //             );

        //             // 本地同步後端格式(要加id)
        //             this.backendCart = { ...emptyCartPayload, id: this.cart_Id };
        //         } else {
        //             // 如果購物車內仍有商品，正常更新後端購物車
        //             const payload = {
        //                 id: this.cart_Id,
        //                 user_id:userId,
        //                 items: this.backendCart.items,
        //                 total: this.total,
        //                 final_total: this.final_total,
        //             };
        //             // const payload = this.createPayload()
        //             await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cart_Id}`, payload, {
        //                 headers: { Authorization: `Bearer ${token}` },
        //             });
        //         }
        //     } catch (error) {
        //         console.error("移除商品失敗：", error);
        //         alert("無法從購物車移除商品，請稍後再試。");
        //     }
        // },
        //從購物車移除此商品(商品面的切換增加刪除的刪除)(分離數據操作與數據同步邏輯)
        async removeFromCart(productId) {
            this.cartItems = this.cartItems.filter(item => item.id !== productId);
            this.backendCart.items = this.backendCart.items.filter(item => item.product_Id !== productId);
        
            await this.syncCartToServer(); // 統一同步到後端
            this.syncCartToLocalStorage();// 同步到 localStorage
        },
        //1.更新後端購物車資料，並同步到後端
        //僅在以下操作中執行：1.商品新增（addToCart）。2.商品刪除（removeFromCart）。3.結帳或手動保存購物車。
        //不需要在每次小計或總計更新時執行，避免頻繁的 API 請求。
        async syncCartToServer() {
            const authStore = useAuthStore();
            // const userId = authStore.userId;
            const userId = authStore.id;
            const token = authStore.token;

            try {
                //避免在後端創建多餘的購物車，應檢查 cart_Id 是否存在。如果存在，直接更新購物車，而非新增。
                if (!this.cart_Id) {
                    console.error("購物車 ID 不存在，無法同步到後端");
                    return;
                }
                const payload = {
                    user_id: userId,
                    items: this.backendCart.items,
                };
                //更新購物車(items: this.cartItems)
                const response = await axios.patch(
                    `https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cart_Id}`,
                    payload,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
        
                console.log("購物車同步成功:", response.data);
            } catch (error) {
                console.error("購物車同步失敗:", error);
            }
        },
        //2.優化後，將購物車數據同步到前端(本地存儲 localStorage)
        syncCartToLocalStorage() {
            try {
                // 將 cartItems 儲存到 localStorage
                localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
        
                // 將 backendCart 儲存到 localStorage
                localStorage.setItem("backendCart", JSON.stringify(this.backendCart));

                // 儲存 redeemedCoupons 到 localStorage
                localStorage.setItem("redeemedCoupons", JSON.stringify(this.redeemedCoupons));

                localStorage.setItem('total', JSON.stringify(this.total));

                // const frontendCart = this.createFrontendCart(); // 生成前端購物車
                // localStorage.setItem("frontendCart", JSON.stringify(frontendCart));

                // 儲存 selectAll 狀態
                localStorage.setItem('selectAll', JSON.stringify(this.selectAll));
                // this.updateSelectAllState() // 確保 `selectAll` 狀態與加載的 `cartItems` 同步

                console.log("同步到 localStorage:", {
                    cartItems: this.cartItems,
                    selectAll: this.selectAll,
                });
        
                // console.log("購物車和優惠券已同步到 localStorage");
            } catch (error) {
                console.error("同步到 localStorage 失敗:", error);
            }
        },
        //3.負責從 localStorage 加載數據到內存中（Vue 的狀態）；使用於頁面加載或刷新時恢復數據
        loadCartFromLocalStorage() {
            try {
                 // 從 localStorage 加載 cartItems 和 backendCart
                const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
                const backendCart = JSON.parse(localStorage.getItem("backendCart")) || { items: [] };

                // 從 localStorage 加載 redeemedCoupons
                const redeemedCoupons = JSON.parse(localStorage.getItem("redeemedCoupons")) || [];
                const AvailableCoupons = JSON.parse(localStorage.getItem("AvailableCoupons")) || [];

                const total = JSON.parse(localStorage.getItem("total")) || 0;

                // const selectAll = JSON.parse(localStorage.getItem("selectAll")) || false ;

                 // 保留 processCartItems 中的初始結構，但合併 localStorage 的數據
                // this.cartItems = processCartItems(cartItems).map(item => ({
                //     ...item,
                //     selected: item.selected || false, // 確保布林值存在
                // }));

                //selectAll 不需要從 localStorage 加載，可以直接通過 cartItems 動態計算
                 // 確保響應式數據更新
                // this.cartItems = cartItems.map(item => ({
                //     ...item,
                //     selected: item.selected ?? false, // 保留 selected 狀態，若不存在則設為 false
                // }));
                // 確保響應式數據更新 ok的
                // this.cartItems = cartItems.map(item => ({
                //     ...item,
                //     selected: !!item.selected, // 保證 selected 是布爾值
                // }));
                // 結合後端數據進行初始化，並保留 `localStorage` 的 selected 狀態
                // this.cartItems = this.processCartItems(backendCart.items).map((item) => {
                //     const cartItem = cartItems.find((local) => local.product_Id === item.product_Id);
                //     return {
                //         ...item,
                //         selected: cartItem ? cartItem.selected : item.selected, //使用 LocalStorage 中的 selected 狀態
                //     };
                // });
                // 設置全選狀態
                // this.selectAll = this.cartItems.every((item) => item.selected);
                // 合併後端數據與 LocalStorage，優先使用 LocalStorage 的 selected 狀態  add
        this.cartItems = this.processCartItems(
            backendCart.items.map((item) => {
                const localItem = cartItems.find((local) => local.product_Id === item.product_Id);
                return {
                    ...item,
                    selected: localItem ? localItem.selected : item.selected ?? false,
                };
            })
        );
                // 加載到 state
                // this.cartItems = cartItems
                this.backendCart = backendCart;
                this.redeemedCoupons = redeemedCoupons;
                this.AvailableCoupons = AvailableCoupons
                this.total = total
                // this.selectAll = selectAll;

                // 每次加載後，根據 cartItems 計算 selectAll
                // this.selectAll = this.cartItems.every(item => item.selected);
                // 確保 selectAll 與 cartItems 同步

                console.log("加載的 cartItems 和 selectAll:", {
                    cartItems: this.cartItems,
                    selectAll: this.selectAll,
                });
            } catch (error) {
                console.error("從 localStorage 加載失敗:", error);
            }
        },
        // loadCartFromLocalStorage() {
        //     try {
        //         // 從 localStorage 獲取資料
        //         const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        //         const backendCart = JSON.parse(localStorage.getItem("backendCart")) || { items: [] };
        //         const redeemedCoupons = JSON.parse(localStorage.getItem("redeemedCoupons")) || [];
        //         const total = JSON.parse(localStorage.getItem("total")) || 0;
        //         const selectAll = JSON.parse(localStorage.getItem("selectAll")) || false ;

        //         // 加載 cartItems
        //         if (cartItems) {
        //             this.cartItems = cartItems.map(item => ({
        //                 ...item,
        //                 selected: !!item.selected, // 保證 selected 為布林值
        //             }));
        //         } else {
        //             this.cartItems = [];
        //         }

        //         // 加載 selectAll
        //         if (selectAll !== null) {
        //             this.selectAll = storedSelectAll;
        //         } else {
        //             this.selectAll = false;
        //         }

        //         // 更新狀態
        //         this.backendCart = backendCart;
        //         this.redeemedCoupons = redeemedCoupons;
        //         this.total = total
               
        //         console.log("加載的 cartItems 和 selectAll:", {
        //             cartItems: this.cartItems,
        //             selectAll: this.selectAll,
        //         });
        //     } catch (error) {
        //         console.error("從 localStorage 加載失敗:", error);
        //     }
        // },
       
        //優化後img切換(商品增加、移除切換)
        async toggleCart(product) {
            // 確保購物車已初始化
            if (!this.cart_Id || !Array.isArray(this.backendCart.items)) {
                console.warn("購物車尚未初始化，嘗試初始化...");
                await this.initializeCart(); // 購物車初始化
            }
        
            const isInCart = this.isInCart(product.id); // 檢查是否已在購物車中
        
            try {
                if (isInCart) {
                    await this.removeFromCart(product.id); // 移除商品
                } else {
                    await this.addToCart(product); // 新增商品
                }
            } catch (error) {
                console.error("切換購物車商品失敗：", error);
                alert("操作失敗，請稍後再試。");
            }
        },
     
        // 從本地存儲加載到後端購物車數據(頁面初始化時使用)(可刪)
        // loadFromLocalStorage() {
        //     const storedCartItems = localStorage.getItem("cartItems");
        //     const storedBackendCart = localStorage.getItem("backendCart");

        //     // if (storedCartItems) {
        //     //     this.cartItems = JSON.parse(storedCartItems);
        //     // }
        //     // if (storedBackendCart) {
        //     //     this.backendCart = JSON.parse(storedBackendCart);
        //     // }
        //     this.cartItems = storedCartItems ? JSON.parse(storedCartItems) : [];
        //     this.backendCart = storedBackendCart ? JSON.parse(storedBackendCart) : { items: [] };
        
        //     // 修正數據
        //     this.cartItems = this.processCartItems(this.backendCart.items);

        //     this.updateCartTotals();// 確保總金額和小計正確
            
        // },
       
        //優化後 更新購物車摘要
        // updateCartSummary() {
        //     this.total = this.cartItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
        //     this.discount = this.discount || 0;// 確保折扣有初始值
        //     this.freight = this.freight ?? 0;// 使用 Nullish Coalescing 避免非必要的覆蓋
        //     this.final_total = this.total - this.discount + this.freight;// 預設無折抵
        
        //     this.syncCartToLocalStorage(); // 只需確保本地同步，不用到後端
        // },
        //優化後 更新每個商品小計金額
        // updateSubTotal(index) {
        //     const item = this.cartItems[index];
        //     item.subTotal = item.price * item.qty;

        //     this.syncCartToLocalStorage(); // 只需確保本地同步，不用到後端
        //     this.updateCartSummary(); // 更新總金額
        // },
         // 計算 total 和 final_total
        // updateCartTotals() {
        //     // 計算 total
        //     this.total = this.cartItems.reduce((sum, item) => sum + item.subTotal, 0);
        
        //     // 計算 final_total，這裡可以加入折扣邏輯
        //     this.final_total = this.total - this.discount + this.freight;
        // },
        // 當購物車商品變動時呼叫此方法(購物車的更新邏輯是由多個地方觸發的（例如，新增商品、刪除商品、修改商品數量），集中邏輯在 setCartItems 中可以確保每次變動後，updateCartTotals 被正確調用，避免重複編寫相同的更新邏輯。)
        setCartItems(newCartItems) {
            this.cartItems = newCartItems;  // 更新購物車商品列表
            this.updateCartTotals();        // 更新 total 和 final_total
        },
        //取得優惠券和滿額折扣資料
        // async getDiscountData() {
        //     try {
        //         const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/discounts`);
        //         console.log("API 回應資料:", response.data); // 檢查 API 回應是否包含所需資料

        //         this.availableCoupons = response.data.availableCoupons;
        //         console.log("API 優惠卷資料:", response.data.availableCoupons); // 檢查 API 回應是否包含所需資料

        //         this.discountRules = response.data.discountRules;
        //         console.log("API 滿額折抵資料:", response.data.discountRules);
        //     } catch (error) {
        //         console.error('Failed to fetch discount data:', error);
        //     }
        // },
        async getDiscountData() {
            try {
                const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/discounts`);
                console.log("API 回應資料:", response.data); // 確認資料結構
        
                // 從陣列中提取 availableCoupons 和 discountRules
                const availableCouponsData = response.data.find(item => item.availableCoupons)?.availableCoupons || [];
                const discountRulesData = response.data.find(item => item.discountRules)?.discountRules || [];
        
                this.availableCoupons = availableCouponsData;
                this.discountRules = discountRulesData;
        
                console.log("API 優惠券資料:", this.availableCoupons);
                console.log("API 滿額自動折抵規則資料:", this.discountRules);
                // 在 getDiscountData 中獲取資料後，應該觸發 updateCartTotals 來更新 total 和 nextThreshold。
                // 確保資料加載後更新購物車的總金額及折扣規則
                this.updateCartTotals();  // 更新 total 和 nextThreshold
            } catch (error) {
                console.error('獲取折扣資料失敗:', error);
            }
        },
        
        // 計算 total 和 final_total(滿2000折200)
        // updateCartTotals() {
        //     // 計算 total
        //     this.total = this.cartItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);

        //      // 如果有優惠券折扣
        //     if (this.couponCode) {
        //         total -= this.couponCode.amount;  // 根據優惠券減少金額
        //     }
    
        //     // 如果有滿額折扣
        //     if (this.IsdiscountRules) {
        //         total -= this.autoDiscount;  // 根據滿額折扣減少金額
        //     }
        //     // this.autoDiscount = this.calculateAutoDiscount();
        //     // this.couponDiscount = this.calculateCouponDiscount();
        //     // 計算最終金額
        //     this.final_total = this.total + this.freight;
        // },
        //計算最終金額
        updateCartTotals() {
            // 計算 total
            this.total = this.cartItems.reduce((sum, item) => sum + (item.subTotal || 0), 0);
        
            // 初始化折扣資訊
            // this.autoDiscount = 0;
            // this.couponDiscount = 0;
            // this.IsdiscountRules = false;
        
            // 檢查並應用滿額折扣
            const applicableRule = this.discountRules.find(rule => this.total >= rule.threshold);
            if (applicableRule) {
                // 若滿額折扣可用，優先應用滿額折扣並禁用優惠券
                this.IsdiscountRules = true;
                this.autoDiscount = applicableRule.autoDiscount;
                this.couponCode = null; // 禁用優惠券
            } else if (this.couponCode) {
                // 若未滿足滿額折扣條件且有有效優惠券，應用優惠券折扣
                this.couponDiscount = this.couponCode.amount;
            }
        
            // 計算最終金額
            this.final_total = this.total - this.autoDiscount - this.couponDiscount + this.freight;
        },
        
        // 領取優惠券(使用者領取優惠券時，執行)
        //     const coupon = this.availableCoupons.find(item => item.code === inputCode);
        //     if (!coupon) {
        //         console.log("無效的優惠券代碼");
        //         return;
        //     }

        //     const now = new Date();
        //     const startDate = new Date(coupon.start_date);
        //     const endDate = new Date(coupon.end_date);

        //     if (now >= startDate && now <= endDate) {
        //         this.couponCode = coupon; // 儲存優惠券
        //         this.updateCartTotals();  // 領取後立即更新金額
        //         console.log(`優惠券已成功領取: ${coupon.code}`);
        //     } else {
        //      console.log("此優惠券已過期或尚未生效");
        //     }
        // },
        // 折扣活動(滿額折扣、優惠券)
        claimCoupon(inputCode) {
            const coupon = this.availableCoupons.find(item => item.code === inputCode);
            if (!coupon) {
                console.log("無效的優惠券代碼");
                return;
            }
            const now = new Date();
            const startDate = new Date(coupon.start_date);
            const endDate = new Date(coupon.end_date);

            // 檢查是否已經選擇了滿額折扣
            if (this.IsdiscountRules) {
                console.log("已經應用了滿額折扣，無法再使用優惠券");
                return;
            }

            // 檢查優惠券是否有效
            if (now >= startDate && now <= endDate) {
                if (this.redeemedCoupons.includes(inputCode)) {
                    console.log("已經領取過此優惠券");
                    return;
                }
        
                this.couponCode = coupon;// 領取即使用
                this.redeemedCoupons.push(inputCode); // 儲存領取的記錄
                this.updateCartTotals(); // 更新金額
                this.syncCartToLocalStorage(); // 同步到 localStorage
                console.log(`優惠券已成功領取並應用: ${coupon.code}`);
            } else {
                console.log("此優惠券已過期或尚未生效");
            }
        },
         // 勾選單個商品選擇或取消
//         toggleItemSelection(index) {
//             // 切換單一商品的選擇狀態
//             const item = this.cartItems[index];
//             item.selected = !item.selected;
           
           
//              // 更新全選框狀態
//             this.selectAll = this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
//              // 強制 Vue 檢測到數組的變化
//   this.cartItems = [...this.cartItems];
//             // this.cartItems = [...this.cartItems]; // 強制更新
//             // this.cartItems[index] = {
//             //     ...this.cartItems[index],
//             //     selected: !this.cartItems[index].selected,
//             // };
//             // this.updateSelectAllState(); // 檢查是否需要更新全選框的狀態
//             this.updateSelectedTotal(); // 更新被選商品的總金額
//             this.syncCartToLocalStorage(); // 同步到 localStorage
           
//             console.log("切換單一商品選擇狀態:", this.cartItems);
            
//         },
        // 勾選單個商品選擇或取消
        toggleItemSelection(index) {
            this.cartItems[index].selected = !this.cartItems[index].selected;

            // 如果所有商品都選中，更新 selectAll 為 true，否則為 false
            // this.selectAll = this.cartItems.every(item => item.selected);
  
            this.updateSelectedTotal(); // 更新被選商品的總金額
            this.syncCartToLocalStorage(); // 同步到 localStorage
        },
  
       
        // 全選或取消全選
        toggleSelectAll() {
            const isSelectAll = this.selectAll; // (selectAll是getters)使用計算屬性檢查當前的全選狀態
                
            // 更新所有商品的 selected 狀態
            this.cartItems = this.cartItems.map(item => ({
                ...item,
                selected: !isSelectAll, // 反轉全選狀態
            }));

            // 更新 selectAll 狀態
            // this.selectAll = !isSelectAll;

            // this.selectAll = !this.selectAll;
            // 更新cartItems的選擇狀態
            // this.cartItems = this.cartItems.map(item => ({
            //   ...item,
            //   selected: this.selectAll,
            // })); 
          
            this.updateSelectedTotal(); // 更新被選商品的總金額
            this.syncCartToLocalStorage(); // 同步到 localStorage
        },
          
        
        
        // 更新全選框狀態
        // updateSelectAllState() {
        //     // 檢查是否所有商品都已選中
        //     // this.selectAll = this.cartItems.every(item => item.selected);
        //     this.selectAll = this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
        //     // this.syncCartToLocalStorage(); // 同步到 localStorage
        //     console.log("更新 selectAll 狀態:", this.selectAll);
        // },
         // 更新所有商品的選擇狀態（根據全選框的狀態）add
        // updateItemSelectionState() {
        //     this.cartItems = this.cartItems.map(item => ({
        //         ...item,
        //         selected: this.selectAll, // 根據全選框的狀態來更新
        //     }));
        //     this.syncCartToLocalStorage(); // 同步到 localStorage
        //     console.log("更新 單一商品 selected 狀態:", this.cartItems);
        // },

       
         // 更新被選商品的總金額
        updateSelectedTotal() {
            this.total = this.cartItems
                .filter((item) => item.selected)
                .reduce((sum, item) => sum + item.subTotal , 0);// 計算小計總和
            // this.syncCartToLocalStorage(); // 同步到 LocalStorage

        },
          // 模擬購物操作：結帳時同步到後端
        async checkout() {
            try {
            const selectedItems = this.cartItems.filter((item) => item.selected);
            const response = await axios.post('/api/checkout', {
                total: this.total, // 傳遞總金額
                items: selectedItems, // 傳遞被選商品
            });
            console.log('結帳成功:', response.data);
            this.clearCart(); // 結帳成功後清空購物車
            } catch (error) {
            console.error('結帳失敗:', error);
            }
        },
        // (結帳成功後)清空購物車
        clearCart() {
            this.cartItems = [];
            this.total = 0;
            // this.selectAll = false;
            this.syncCartToLocalStorage(); // 清空後同  步到 LocalStorage
        },
  
        // 檢查並應用滿額折扣(可刪)
        // applyDiscountRules() {
        //     const applicableRule = this.discountRules.find(rule => this.total >= rule.threshold);
        //     if (applicableRule) {
        //         this.autoDiscount = applicableRule.discount;
        //         this.IsdiscountRules = true;  // 記錄已應用滿額折扣
        //         this.updateCartTotals();  // 更新金額
        //         console.log(`已應用滿額折扣: ${this.autoDiscount}`);
        //     }
        // },
        
        //自動折扣活動(滿額折扣)  
        // calculateAutoDiscount() {
        //     const applicableDiscount = this.discountRules.find(rule => this.total >= rule.threshold);
        //     return applicableDiscount ? applicableDiscount.discount : 0;
        // },
        //僅計算已領取的優惠券折扣金額
        // calculateCouponDiscount() {
        //     const now = new Date();
        //     if (
        //         this.couponCode &&
        //         now >= new Date(this.couponCode.start_date) &&
        //         now <= new Date(this.couponCode.end_date) &&
        //         this.total >= this.couponCode.minSpend
        //     ) {
        //         return this.couponCode.amount || 0;
        //     }
        //     return 0;
        // },
        // calculateCouponDiscount() {
        //     if (this.couponCode) {
        //         return this.couponCode.amount || 0;
        //     }
        //     return 0;
        // },
     
        
         // (一鍵)清空購物車 勿刪
        //  clearCart() {
        //     this.cart_Id = null;
        //     this.cartItems = [];
        //     this.total = 0;
        //     this.final_total = 0;
        //     this.syncToLocalStorage(); // 同步清空到本地儲存(); 
        //     console.log('購物車已清空');
        // },
       
       
         // 增加商品數量
        increaseQuantity(index) {
            this.cartItems[index].qty++;
            this.cartItems[index].subTotal = this.cartItems[index].price * this.cartItems[index].qty;//更新小計
            this.updateSelectedTotal(); // 更新被選商品的總金額
            this.syncCartToLocalStorage(); // 同步到 localStorage

        },

         // 減少商品數量
        decreaseQuantity(index) {
            if (this.cartItems[index].qty > 1) {
                this.cartItems[index].qty--;
                this.cartItems[index].subTotal = this.cartItems[index].price * this.cartItems[index].qty;//更新小計
                this.updateSelectedTotal(); // 更新被選商品的總金額
                this.syncCartToLocalStorage(); // 同步到 localStorage

            }
        },
       
        //在購物車頁面刪除該商品含div框架
        deleteItem(index) {
            const productId = this.cartItems[index].id; // 取得商品的 id
            
            // 從前端資料中刪除商品
            // this.cartItems = this.cartItems.filter((item, idx) => idx !== index);
            this.cartItems.splice(index, 1);

            // 從後端資料中刪除商品
            this.backendCart.items = this.backendCart.items.filter(item => item.product_Id !== productId);
        
            
            this.updateCartTotals();// 更新購物車總金額
            // 同步更新到後端與本地儲存
            this.syncCartToServer(); // 同步到後端
            this.syncCartToLocalStorage(); // 同步到 localStorage
        },
    },      
})
// 1.程式邏輯如何分開處理兩個格式(前端和後端格式)
// 初始化購物車 (initializeCart)

// 從後端獲取購物車資料後：
// 將後端的 items 資料存入 backendCart.items。
// 通過 processCartItems 方法轉換後，存入 cartItems。
// 新增商品 (addToCart)

// 前端格式：使用 processCartItems 處理新增的商品，並加入到 cartItems。
// 後端格式：直接新增到 backendCart.items。
// 移除商品 (removeFromCart)

// 從 cartItems 中過濾掉對應商品，更新前端格式。
// 從 backendCart.items 中過濾掉對應商品，更新後端格式。
// 同步至本地存儲 (syncToLocalStorage)

// 僅保存 cartItems 的前端資料，適合快速顯示購物車內容。