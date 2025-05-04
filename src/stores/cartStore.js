import { defineStore } from "pinia";
import { useAuthStore } from './authStore'
import { usePaymentStore } from './paymentStore'
import axios from 'axios'

export const useCartStore = defineStore("cartStore",{
    state:() =>({
        //cartItems是使用者物件 /cartsdata格式
        cartItems: JSON.parse(localStorage.getItem("cartItems")) || {
            userId: 0,//null
            items: [],
            total: 0,
            shipping_fee: 0,
            final_total: 0,
            status: false,
            orderStatus: false,
            discount: 0,
            
        },
    }),
    getters:{
        // 計算使用者商品品項數量 
        itemTypesCount(state) {
            //避免錯誤發生，確保 state.cartItems.items 只有在 state.cartItems 存在時才會被讀取(登入第1次沒購物會沒有cartItems)！
            return state.cartItems && Array.isArray(state.cartItems.items) 
                ? state.cartItems.items.length 
                : 0;
        },
        
        //cartItems 的 selected 狀態改變(選擇商品)，selectAll 也會自動更新。
        selectAll() {
            return this.cartItems.items.length > 0 && this.cartItems.items.every(item => item.selected);
        },
        // 自動計算金額 計算已選取商品的總金額
        totalAmount(state){
            return state.cartItems.items
                .filter(item => item.selected) // 只計算 selected: true 的商品
                .reduce((sum, item) => sum + item.subTotal, 0);
        },
        //自動計算金額(有 折扣、優惠碼 ) 計算最終應付金額（總金額 + 運費） 
        finalTotal(state){
            const paymentStore = usePaymentStore();
            return this.totalAmount + paymentStore.shippingFee;//getters的totalAmount
        },
        // 計算已勾選商品數量
        selectedItemsCount: (state) => {
            return state.cartItems.items.filter(item => item.selected).length;
        },
        //勾選的商品
        selectedtItems(state) {
            return state.cartItems.items.filter(item => item.selected);
        },
        

    },
    actions:{
        //取得目前使用者的購物車  /cartsdata格式
        async getCartData(){
            const authStore = useAuthStore();
            const userId = authStore.id;
            const token = authStore.token;

            if (!userId || !token) {
                console.log("未登入，無法加載購物車");
                return;
            }

            try{
                const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/cartsdata?userId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userCart = response.data.find(cart => cart.userId === userId);//取得使用者購物車(物件)
                
                if (userCart) {
                    this.cartItems = userCart; // ✅ 直接存入物件
                    localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
                } else {
                    // ✅ 關鍵修正：API 無資料 → 清空 cartItems 並更新 localStorage
                    this.cartItems = {
                        userId,
                        items: [],
                        total: 0,
                        shipping_fee: 0,
                        final_total: 0,
                        status: false,
                        orderStatus: false,
                        discount: 0,
                    };
                    localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
                    console.log("API 無資料，自動重設購物車為空");
                  
                }

            }catch(error){
                console.error("加載購物車失敗：", error);
            }
        },
  
        //商品詳細頁面的加入購物車功能
        //相同使用者和商品更新新增到/cartsdata /carts
        //只同步剛剛加入的商品
        async addItemToCart(product, selectedSize, selectedColor, quantity) {
            const authStore = useAuthStore();
            const token = authStore.token;
            const userId = authStore.id;
            // ✅ 判斷該商品是否需要 size 和 color
            const requiresSize = product.variants.some(variant => variant.size);
            const requiresColor = product.variants.some(variant => variant.color);
            //這樣才能有加入購物功能
            if ((requiresSize && !selectedSize) || (requiresColor && !selectedColor)) {
                alert("請選擇尺寸和顏色");
                return;
            }
            // 取得選擇的 variant 物件
            const selectedVariant = product.variants.find(v => v.size === selectedSize && v.color === selectedColor);
            // 取得選擇的 color 物件
            const selectedColorObj = product.colors.find(color => color.color === selectedColor);

            if (!selectedVariant) {
                alert("找不到對應的商品變體");
                return;
            }

            try {
                const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/cartsdata`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                let existingCartData = response.data.find(cart => cart.userId === userId);

                let currentItem = null;

                if (existingCartData) {
                    // 檢查是否已存在相同 variant_Id 的商品
                    const existingItem = existingCartData.items.find(item => item.variant_Id === selectedVariant.id);

                    if (existingItem) {
                        // 更新數量與小計
                        existingItem.quantity += quantity;//=
                        existingItem.subTotal = quantity * (product.price || product.OriginalPrice);
                        currentItem = existingItem;
                    } else {
                        // 新增新的商品
                        currentItem = {
                            variant_Id: selectedVariant.id,
                            quantity,
                            price: product.price || product.OriginalPrice,
                            subTotal: (product.price || product.OriginalPrice) * quantity,
                            product: {
                                id: product.id,
                                name: product.name,
                                colors: selectedColorObj ? [selectedColorObj] : [],// 只存選擇的顏色物件
                                variants: [selectedVariant],// 只存選擇的變體物件
                            },
                            selected: false,//勾選商品
                        };
                        existingCartData.items.push(currentItem);// 🔹 將新商品加入購物車
                    }

                    // 更新總價 不要從 existingCartData 取，改從 getters 取
                    existingCartData.total = this.totalAmount;
                    existingCartData.final_total = this.finalTotal;

                    // 更新 cartsdata
                    await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${existingCartData.id}`,  existingCartData, 
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                } else {
                    // ✅ **如果購物車不存在，建立新購物車**
                    //每個商品
                    currentItem = {
                        variant_Id: selectedVariant.id,
                        quantity,
                        price: product.price || product.OriginalPrice,
                        subTotal: (product.price || product.OriginalPrice) * quantity,
                        product: {
                            id: product.id,
                            name: product.name,
                            colors: selectedColorObj ? [selectedColorObj] : [],
                            variants: [selectedVariant],
                        },
                        selected: false,
                    };
                    // 建立新購物車
                    const newCart = {
                        userId,
                        items: [currentItem],
                        total: currentItem.subTotal,
                        final_total: currentItem.subTotal,
                        status: false,
                        orderStatus: false,
                    };

                    const createResponse = await axios.post(`https://204ed3432b06d7af.mokky.dev/cartsdata`, newCart, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    existingCartData = createResponse.data;//取得新建的/cartsdata 資料
                }

                //  確保 state 也更新
                this.cartItems = existingCartData;
                localStorage.setItem("cartItems", JSON.stringify(this.cartItems));

                // ✅ 只同步這筆商品(剛剛加入的商品) 到 /carts
                await this.syncCartItemToAPI(currentItem);

                alert("商品已加入購物車！");
            } catch (error) {
                console.error("加入購物車失敗", error);
            }
        },

        // /cartData 格式轉換為 /carts 格式 
        // ✅ 新增這個方法：只同步(更新/新增)單一商品到 /carts
        async syncCartItemToAPI(item) {
            const authStore = useAuthStore();
            const token = authStore.token;
            const userId = authStore.id;

            try {
                const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/carts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const existingCart = response.data || [];
                // ✅ **查找是否已有相同的 userId 和 variant_Id**
                const existingItem = existingCart.find(
                    cartItem => cartItem.userId === userId && cartItem.variant_Id === item.variant_Id
                );

                const payload = {
                    userId: userId,
                    variant_Id: item.variant_Id,
                    quantity: item.quantity,
                    price: item.price,
                    subTotal: item.subTotal,
                    final_total: item.subTotal,
                };

                if (existingItem) {
                    await axios.patch(`https://204ed3432b06d7af.mokky.dev/carts/${existingItem.id}`, payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(`✅ 單筆更新成功：variant_Id ${item.variant_Id}`);
                } else {
                    await axios.post(`https://204ed3432b06d7af.mokky.dev/carts`, payload, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(`✅ 單筆新增成功：variant_Id ${item.variant_Id}`);
                }

            } catch (error) {
                console.error(`❌ 單筆同步失敗：variant_Id ${item.variant_Id}`, error);
            }
        },
    
        //✅ 同步 /cartsdata（總表）
        async syncCartsDataToAPI() {
            try {
                console.log("🔄 正在同步資料:", {
                    total: this.cartItems.total,
                    final_total: this.cartItems.final_total,
                });
                const paymentStore = usePaymentStore();

                const payload = {
                    items: this.cartItems.items.map(item => ({
                        ...item,// ✅ 保留原格式 完整更新 items
                        selected: item.selected,// ✅ 確保 selected 也更新
                    })),
                    total: this.totalAmount,
                    shipping_fee: paymentStore.shippingFee, 
                    final_total: this.finalTotal, //更新
                };
      
                console.log("🔄 正在同步資料到 /cartsdata：", payload);
      
                await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cartItems.id}`, payload);
            } catch (error) {
                console.error("❌ 更新 cartsdata API 失敗:", error);
            }

            localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
        },
       
        //刪除購物清單頁面的單一商品div功能
        async removeFromCart(item) {
            const authStore = useAuthStore();
            const token = authStore.token;
            const userId = authStore.id;
        
            try {
                // 1. 先從 /carts 找到要刪除的商品
                const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
        
                const cartItem = carts.find(cart => cart.userId === userId && cart.variant_Id === item.variant_Id);
        
                if (cartItem) {
                    await axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${cartItem.id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    console.log(`✅ 成功從 /carts 移除商品: ID ${cartItem.id}`);
                }
        
                // 2. 從 /cartsdata 找到對應的使用者購物車
                const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
        
                const userCart = cartsData.find(cart => cart.userId === userId);
                
                if (userCart) {
                    // 過濾掉要刪除的商品（根據 variant_Id）
                    const updatedItems = userCart.items.filter(cartItem => cartItem.variant_Id !== item.variant_Id);
        
                    // 3. 用 patch 更新 /cartsdata 來移除商品。
                    await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`, {
                        ...userCart,
                        items: updatedItems
                    }, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
        
                    console.log('✅ `/cartsdata` 已更新，成功移除對應商品');
        
                    // 4. **同步更新 Pinia 狀態，確保畫面立即更新**
                    this.cartItems.items = updatedItems;
                }
        
            } catch (error) {
                console.error('❌ 移除商品失敗:', error);
            }
        },
        
        // 增加商品數量
        increaseQuantity(index) {
            const item = this.cartItems.items[index]
            item.quantity++;
            item.subTotal = item.price * item.quantity;//更新小計
            this.syncCartItemToAPI(item) // 同步更新/carts
            this.syncCartsDataToAPI(); // ✅ 同步更新 /cartsdata 
        },
        // 減少商品數量
        decreaseQuantity(index) {
            const item = this.cartItems.items[index]
            if (item.quantity > 1) {
                item.quantity--;
                item.subTotal = item.price * item.quantity;//更新小計
                this.syncCartItemToAPI(item)// 同步更新/carts
                this.syncCartsDataToAPI(); // ✅ 同步更新/cartsdata
            }
        },
        //input Quantity專用 更新數量時同步小計
        updateQuantity(index) {
            const item = this.cartItems.items[index];

            console.log("🔄 更新前的商品數據:", item);

            item.quantity = Math.max(1, Number(item.quantity) || 1);// 確保數量至少為 1

            item.subTotal = item.price * item.quantity; // 更新小計

            console.log("✅ 更新後的商品數據:", item);
            this.syncCartItemToAPI(item);// ✅ 單筆同步 /carts
            this.syncCartsDataToAPI()// ✅ 同步更新cartsdata 購物車陣列
            console.log("🔄 正在同步 `/cartsdata`...");
        },
        
      
        //商品單一選項的input勾選切換
        toggleItemSelection(index) {
            const item = this.cartItems.items[index];
            item.selected = !item.selected; // 切換選取狀態
            this.syncCartsDataToAPI()// ⬅️ /cartsdata 同步更新selected選取狀態
        },
        //商品全部的input勾選 全選 / 取消全選
        toggleSelectAll() {
            const allSelected = this.cartItems.items.every(item => item.selected);
            this.cartItems.items.forEach(item => (item.selected = !allSelected)); // 全選或取消全選
        },
      
         
        //購物清單頁面的刪除全部的按鈕(逐筆刪除 + 二次確認全部是否刪除)
        async deleteAllItems() {
            const authStore = useAuthStore();
            const token = authStore.token;
            const userId = (authStore.id);
        
            try {
                // 1. 取得 `/carts` 內該用戶的所有商品
                const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // ✅ 過濾出當前使用者的商品
                const userCartItems = carts.filter(item => (item.userId) === userId || (item.user_id) === userId);
        
                console.log('🛒 將刪除的商品:', userCartItems);
        
                // 2. **逐步刪除商品**
                for (const item of userCartItems) {
                    try {
                        await axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${item.id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log(`✅ 刪除成功: ID ${item.id}`);
                    } catch (error) {
                        console.error(`❌ 刪除失敗: ID ${item.id}`, error);
                    }
                }
        
                // 3. **清空 `/cartsdata`**
                const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
                    headers: { Authorization: `Bearer ${token}` }
                });
        
                const userCart = cartsData.find(cart => (cart.userId) === userId);
        
                if (userCart) {
                    await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`, {
                        ...userCart,
                        items: [],
                        total: 0,
                        shipping_fee: 0,
                        final_total: 0,
                        discount: 0,
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('✅ `/cartsdata` 已清空');
                }
        
                // 4. **二次確認 `/carts` 是否清空**
                const { data: remainingCarts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
        
                const remainingUserItems = remainingCarts.filter(item => (item.userId) === userId || (item.user_id) === userId);
        
                if (remainingUserItems.length === 0) {
                    console.log('✅ `/carts` 已完全清空');
                } else {
                    console.warn('⚠️ `/carts` 仍有殘留資料:', remainingUserItems);
                }
        
                // 5. 清空前端狀態
                this.cartItems.items = [];
                console.log('✅ 所有商品已刪除完畢');
        
            } catch (error) {
                console.error('❌ 刪除全部商品失敗:', error);
            }
        },
        //刪除在/cartsdata結帳的商品
        async clearSelectedItems() {
            const authStore = useAuthStore();
            const token = authStore.token;
          
            // ✅ 篩掉已結帳的商品
            this.cartItems.items = this.cartItems.items.filter(item => !item.selected);
          
            // ✅ PATCH 更新到 API
            await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cartItems.id}`, this.cartItems, {
              headers: { Authorization: `Bearer ${token}` },
            });
          
            // ✅ 更新 localStorage（可選）
            localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
        },

        // 清空 購物車狀態(在authService 登出使用) 5/4
        clearCartItems() {
            this.cartItems = []; // 清空購物車
            localStorage.removeItem('wishlist'); // 清空本地存儲
        },

      
 
    },
})