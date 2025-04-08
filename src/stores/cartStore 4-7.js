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
        tempCartStatus: {} // 臨時追蹤 加入購物車切換UI 狀態，避免 API 延遲影響體驗

    

    }),
    getters:{
        //讓 UI 維持響應式 原本
        // isInCart: (state) => (productId) => {
        //     // 如果 `tempCartStatus` 有變更，則優先顯示 UI 狀態
        //     return state.tempCartStatus[productId] !== undefined
        //         ? state.tempCartStatus[productId]
        //         : state.cartItems?.items.some(item => item.product_Id === productId);
        // },
        isInCart: (state) => (variantId) => {
            return state.tempCartStatus[variantId] !== undefined
                ? state.tempCartStatus[variantId]
                : state.cartItems?.items.some(item => item.variant_Id === variantId);
        },
        
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
        // 自動計算金額 計算已選取商品的總金額新增一個 getter 來取 total
        totalAmount(state){
            return state.cartItems.items
                .filter(item => item.selected) // 只計算 selected: true 的商品
                .reduce((sum, item) => sum + item.subTotal, 0);
        },
        //自動計算金額 計算最終應付金額（總金額 + 運費） 新增一個 getter 來取 finalTotal
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
                return;// 不執行後續程式
            }

            try{
                const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/cartsdata?userId=${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userCart = response.data.find(cart => cart.userId === userId);//取得使用者購物車(物件)
                
                // ✅ API 成功後，清除 `tempCartStatus`
                this.tempCartStatus = {};
                if (userCart) {
                    this.cartItems = userCart; // ✅ 直接存入物件
                    localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
                } else {
                    this.cartItems = null; // ✅ 正確：沒有購物車就設為 null
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
                existingItem.quantity = quantity;
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
            await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${existingCartData.id}`, existingCartData, {
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

        

        
        
        
        
       
       
        
        
        //商品列表的(商品增加、移除切換)原本
        // async toggleCart(product) {
        //     const authStore = useAuthStore();
        //     const token = authStore.token;
        //     const userId = authStore.id;
          
        //     if (!token || !userId) {
        //         console.error('Token and userId are required to modify carlist.');
        //         return;
        //     }
        //     const isCurrentlyInCart = this.isInCart(product.id);

        //     // 立即變更 UI（假設加入或移除成功）
        //     this.tempCartStatus[product.id] = !isCurrentlyInCart;

        //     try{  
        //         // 商品已在購物車中，執行移除
        //         if (isCurrentlyInCart){
        //             // await this.removeFromCart(product.id); // 移除商品   
        //             await this.removeFromCart(product);    
        //         }else{
        //             await this.addToCart(product); // 新增商品
        //         }   
        //         await this.getCartData()// ✅ 再次同步購物車，確保數據正確 
        //         await this.syncCartToAPI();// 3/6
        //     }catch(error){
        //         console.error(isCurrentlyInCart ? '移除商品失敗:' : '添加商品失敗:', error);

        //          // ❌ API 失敗 -> 回滾 UI 狀態
        //         this.tempCartStatus[product.id] = isCurrentlyInCart;
                
        //     }
        // },

        // 同步 final_total & total & quantity & subTotal數據到 /cartsdata
        //使用 .map() 創建新陣列，確保 Vue 和 Axios 能偵測到變更，這樣 selected 才能正確同步到後端。
        //selected 是物件屬性，直接改變它不會改變 items 的記憶體位置，可能導致 Vue 無法偵測變更 或 Axios 無法正確發送請求。
        //quantity 和 subTotal 是數字，直接改變數值即可，Vue 會追蹤變更並更新畫面，API 也能正常處理。
        //ok
        async syncCartToAPI() {
            console.log("🚀 syncCartToAPI() 被執行，當前的購物車數據:", this.cartItems.items);
            const authStore = useAuthStore();
            const token = authStore.token;
            const userId = authStore.id;
        
            // 取得 /carts 內的購物車內容
            let existingCart = [];
            try {
                const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/carts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                existingCart = response.data || [];
            } catch (error) {
                console.error("無法獲取購物車資料", error);
                return; // 取得失敗就不繼續執行
            }
        
            for (const item of this.cartItems.items) {
                console.log("🟢 目前處理的 item:", item);
        
                // ✅ **查找是否已有相同的 userId 和 variant_Id**
                const existingItem = existingCart.find(
                    cartItem => cartItem.userId === userId && cartItem.variant_Id === item.variant_Id
                );
        
                const payload = {
                    userId: userId,
                    variant_Id: item.variant_Id,
                    quantity: item.quantity,
                    price: item.price || item.OriginalPrice,
                    subTotal: (item.price || item.OriginalPrice) * item.quantity,
                    final_total: (item.price || item.OriginalPrice) * item.quantity,
                };
        
                if (existingItem) {
                    // ✅ **如果商品已存在，則更新數量、subTotal 和 final_total**+ ,
                    const updatedPayload = {
                        quantity: item.quantity,
                        subTotal: (item.quantity) * existingItem.price,
                        final_total: (item.quantity) * existingItem.price,
                    };
        
                    try {
                        await axios.patch(`https://204ed3432b06d7af.mokky.dev/carts/${existingItem.id}`, updatedPayload, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log(`✅ 更新商品 ${existingItem.variant_Id} 成功`);
                    } catch (error) {
                        console.error(`❌ 更新商品 ${existingItem.variant_Id} 失敗`, error);
                    }
                } else {
                    // ✅ **如果商品不存在，則新增**
                    try {
                        await axios.post(`https://204ed3432b06d7af.mokky.dev/carts`, payload, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log(`✅ 新增商品 ${item.variant_Id} 成功`);
                    } catch (error) {
                        console.error(`❌ 新增商品 ${item.variant_Id} 失敗`, error);
                    }
                }
            }
        
            // API 同步後，清除 localStorage 避免數據不同步
            localStorage.removeItem("cartItems");
        },
         // /cartData 格式轉換為 /carts 格式 
        // ✅ 新增這個方法：只同步(更新/新增)單一商品到 /carts ok
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
    

        //原本
        // async syncCartsDataToAPI() {
        //     try {

                // console.log("🔄 正在同步資料:", {
                //     total: this.cartItems.total,
                //     final_total: this.cartItems.final_total,
                // });

                

        //         await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cartItems.id}`, {
        //             items: this.cartItems.items.map(item => ({
        //                 ...item, // ✅ 保留原格式 完整更新 items，包含 quantity & subTotal
        //                 selected: item.selected, // ✅ 確保 selected 也更新
        //             })),
        //             total: this.cartItems.total, // ✅ 確保 total 也同步
        //             // final_total:this.cartItems.final_total, //更新final_total
        //             final_total:this.finalTotal, //更新final_total
        //         });
        //     } catch (error) {
        //         console.error("更新購物車 API 失敗:", error);
        //     }
        // },
        //✅ 同步 cartsdata（總表）
        async syncCartsDataToAPI() {
            try {
                console.log("🔄 正在同步資料:", {
                    total: this.cartItems.total,
                    final_total: this.cartItems.final_total,
                });
                const paymentStore = usePaymentStore();

              const payload = {
                items: this.cartItems.items.map(item => ({
                  ...item,
                  selected: item.selected,
                })),
                total: this.totalAmount,
                shipping_fee: paymentStore.shippingFee, // ✅ 加入運費
                final_total: this.finalTotal,
              };
      
              console.log("🔄 正在同步資料到 /cartsdata：", payload);
      
              await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cartItems.id}`, payload);
            } catch (error) {
              console.error("❌ 更新 cartsdata API 失敗:", error);
            }

            localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
        },

        //預設選 `product.variants[0]`
        async toggleCart(product) {
            const authStore = useAuthStore();
            const token = authStore.token;
            const userId = authStore.id;
        
            if (!token || !userId) {
                console.error('Token and userId are required to modify cart.');
                return;
            }
        
            // ✅ 預設選 `product.variants[0]`
            const selectedVariant = product.variants[0];
        
            if (!selectedVariant) {
                console.error("此商品沒有可用的變體，無法加入購物車");
                return;
            }
        
            const isCurrentlyInCart = this.isInCart(selectedVariant.id);
        
            // 立即變更 UI（假設加入或移除成功）
            this.tempCartStatus[selectedVariant.id] = !isCurrentlyInCart;
        
            try {  
                if (isCurrentlyInCart) {
                    await this.removeFromCart(selectedVariant.id); // ✅ 移除 `variant.id`
                } else {
                    await this.addToCart(selectedVariant); // ✅ 加入 `selectedVariant`
                }
                await this.getCartData(); // ✅ 確保數據同步
                await this.syncCartToAPI(); 
            } catch (error) {
                console.error(isCurrentlyInCart ? '移除商品失敗:' : '添加商品失敗:', error);
        
                // ❌ API 失敗 -> 回滾 UI 狀態
                this.tempCartStatus[selectedVariant.id] = isCurrentlyInCart;
            }
        },
        
        
        //商品列表的增加/取消商品的切換增加功能
        async addToCart(product) {
            const authStore = useAuthStore();
            const token = authStore.token;
            const userId = authStore.id;
        
            if (!userId || !token) {
                console.log("未登入，無法加入購物車");
                return;
            }
        
            // 🟢 這邊的設計是**自動選取第一個 size、color**
            const selectedSize = product.size?.[0] || null;
            const selectedColor = product.color?.[0] || null;
        
            try {
                // ✅ **先查詢 `/cartsdata` 取得當前使用者的購物車**
                const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/cartsdata`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
        
                let existingCartData = response.data.find(cart => cart.userId === userId);
        
                if (!existingCartData) {
                    // ❌ **沒有找到購物車，則創建新購物車**(api格式)
                    existingCartData = {
                        userId,
                        items: [],
                        total: 0,
                        shipping_fee: 0,
                        final_total: 0,
                        status: false,
                        orderStatus: false,
                        discount: 0,
                        
                    };
                }
        
                // 🔹 **檢查該商品是否已存在購物車**
                let existingItem = existingCartData.items.find(item => item.product_Id === product.id);
                // 如果商品已經存在，則不執行任何動作
                if (existingItem) {
                    alert("此商品已在購物車中！");
                    return;
                }
        
                // 🔹 **建立新商品物件** /cartsdata格式
                const newItem = {
                    product_Id: product.id,
                    quantity: 1,
                    price: product.price || product.OriginalPrice,
                    subTotal: (product.price || product.OriginalPrice) * 1,
                    product: {
                        id: product.id,
                        name: product.name,
                        imgurl: product.imgurl,
                        color: selectedColor,
                        size: selectedSize,
                        price: product.price,
                        OriginalPrice: product.OriginalPrice,
                    },
                    selected: false,
                };
        
                // 🔹 **將新商品加入購物車**
                existingCartData.items.push(newItem);
        
                // 🔹 **計算 `total` 和 `final_total`** 原本
                // existingCartData.total = existingCartData.items.reduce((sum, item) => sum + item.subTotal, 0);
                // existingCartData.final_total = existingCartData.total;
                // 不要從 existingCartData 取，改從 getters 取
existingCartData.total = this.totalAmount;
existingCartData.final_total = this.finalTotal;
        
                if (existingCartData.id) {
                    // ✅ **已有購物車，使用 `PATCH` 更新**
                    await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${existingCartData.id}`, existingCartData, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                } else {
                    // ✅ **新建購物車**
                    const createResponse = await axios.post(`https://204ed3432b06d7af.mokky.dev/cartsdata`, existingCartData, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
        
                    existingCartData.id = createResponse.data.id;
                }
        
                // ✅ **更新 LocalStorage**
                localStorage.setItem("cartItems", JSON.stringify(existingCartData));
        
                console.log("商品已加入購物車！");
                alert("商品已加入購物車！");
            } catch (error) {
                console.error("購物車更新失敗", error);
            }
        
            // 🔄 **同步至 `/carts` API**
            await this.syncCartToAPI();
        },
        
        //刪除購物清單頁面的單一商品div功能
        // async removeFromCart(product) {
        //     const authStore = useAuthStore();
        //     const token = authStore.token;
        //     const userId = authStore.id;
        
        //     // if (!token || !userId) {
        //     //     console.error('Token and userId are required to modify cart.');
        //     //     return;
        //     // }
        
        //     try {
        //         // 1. 先從 /carts 找到要刪除的商品
        //         const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
        //             headers: { 'Authorization': `Bearer ${token}` }
        //         });
                
        //         const cartItem = carts.find(item => item.userId === userId && item.product_Id === product.id);
        //         if (cartItem) {
        //             await axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${cartItem.id}`, {
        //                 headers: { 'Authorization': `Bearer ${token}` }
        //             });
        //         }
        
        //         // 2. 從 /cartsdata 找到對應的使用者購物車
        //         const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
        //             headers: { 'Authorization': `Bearer ${token}` }
        //         });
        
        //         const userCart = cartsData.find(cart => cart.userId === userId);
        //         if (userCart) {
        //             // 過濾掉要刪除的商品 
        //             const updatedItems = userCart.items.filter(item => item.product_Id !== product.id);
        
        //             // 3. 用 patch 更新 /cartsdata 來移除商品。
        //             await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`, {
        //                 ...userCart,
        //                 items: updatedItems
        //             }, {
        //                 headers: { 'Authorization': `Bearer ${token}` }
        //             });
        //             // 4. **同步更新 Pinia 狀態，確保畫面立即更新**
        //             this.cartItems.items = updatedItems;
        //         }
        
        //     } catch (error) {
        //         console.error('移除商品失敗:', error);
        //     }
        // },
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
            // this.updateTotal(); // ✅ 重新計算總計
             this.syncCartItemToAPI(item)
            this.syncCartsDataToAPI(); // ✅ 同步更新 API
           
            // this.syncCartToAPI()
            // this.updateSelectedTotal(); // 更新被選商品的總金額
            // this.syncCartToLocalStorage(); // 同步到 localStorage

        },
          // 減少商品數量
        decreaseQuantity(index) {
            const item = this.cartItems.items[index]
            if (item.quantity > 1) {
                item.quantity--;
                item.subTotal = item.price * item.quantity;//更新小計
                // this.updateTotal(); // ✅ 重新計算總計
                 this.syncCartItemToAPI(item)
                this.syncCartsDataToAPI(); // ✅ 同步更新 API
               
                // this.syncCartToAPI()
                // this.updateSelectedTotal(); // 更新被選商品的總金額
                // this.syncCartToLocalStorage(); // 同步到 localStorage

            }
        },
        //input Quantity專用 更新數量時同步小計
        updateQuantity(index) {
            const item = this.cartItems.items[index];

            console.log("🔄 更新前的商品數據:", item);

            item.quantity = Math.max(1, Number(item.quantity) || 1);// 確保數量至少為 1

            item.subTotal = item.price * item.quantity; // 更新小計

            console.log("✅ 更新後的商品數據:", item);
            // this.updateTotal(); // ✅ 重新計算總計
            this.syncCartItemToAPI(item);// ✅ 單筆同步 carts
            this.syncCartsDataToAPI()// ✅ 同步更新cartsdata 購物車陣列
            console.log("🔄 正在同步 `/cartsdata`...");
            // this.syncCartToAPI()
            console.log("🔄 正在同步 `/carts`...");
        
            // this.updateSelectedTotal(); // 更新被選商品的總金額
            // this.syncCartToLocalStorage(); // 同步到 localStorage
        },
        
      
        //商品單一選項的input勾選切換
        toggleItemSelection(index) {
            const item = this.cartItems.items[index];
            item.selected = !item.selected; // 切換選取狀態
            this.syncCartsDataToAPI()// ⬅️ /cartsdata 同步更新selected選取狀態
            // this.updateTotal(); // ✅ 更新總計
        },
        //商品全部的input勾選 全選 / 取消全選
        toggleSelectAll() {
            const allSelected = this.cartItems.items.every(item => item.selected);
            this.cartItems.items.forEach(item => (item.selected = !allSelected)); // 全選或取消全選
            // this.updateTotal(); // ✅ 更新總計
        },
        // 更新總計（計算已選商品的 subTotal 加總）原本 4/5
        // updateTotal() {
        //     this.cartItems.total = this.cartItems.items
        //         .filter(item => item.selected) // 只篩選已選取的商品
        //         .reduce((sum, item) => sum + item.subTotal, 0); // 加總 subTotal

        //     this.syncCartsDataToAPI()    
        // },
        // 更新最後金額 (有 折扣、優惠碼 ) 原本
        // updateFinalTotal() {
        //     const paymentStore = usePaymentStore();
        //     this.cartItems.final_total = this.totalAmount + paymentStore.shippingFee;
        //     this.syncCartsDataToAPI();
        // },
        // updateFinalTotal() {
        //     const paymentStore = usePaymentStore();
            
        //     // ✅ 計算 final_total cartItems.total
        //     this.cartItems.final_total = this.totalAmount + paymentStore.shippingFee;
        
        //     // ✅ 將資料同步到 /cartsdata
        //     this.syncCartsDataToAPI();
        // },
        // ✅ 用 getters 的結果就對了，不要去操作 cartItems.final_total 這個欄位
// updateFinalTotal() {
//     this.syncCartsDataToAPI(); // final_total 已經是 getter，自動會是最新值
// },
       
        
        
        
        
       
        //購物清單頁面的刪除全部的按鈕 原本
        // async deleteAllItems() {
        //     const authStore = useAuthStore();
        //     const token = authStore.token;
        //     const userId = authStore.id;
        
        //     try {
        //         // 1. 取得 `/carts` 內該用戶的所有商品
        //         const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
        //             headers: { Authorization: `Bearer ${token}` }
        //         });
        
        //         const userCartItems = carts.filter(item => item.userId === userId);
        
        //         // 2. 取得 `/cartsdata` 內該用戶的購物車
        //         const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
        //             headers: { Authorization: `Bearer ${token}` }
        //         });
        
        //         const userCart = cartsData.find(cart => cart.userId === userId);
        
        //         // **同步發送刪除請求**
        //         const deleteCartsPromises = userCartItems.map(item =>
        //             axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${item.id}`, {
        //                 headers: { Authorization: `Bearer ${token}` }
        //             })
        //         );
        
        //         const updateCartsDataPromise = userCart
        //             ? axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`, {
        //                 ...userCart,
        //                 items: [] // 清空購物車
        //             }, {
        //                 headers: { Authorization: `Bearer ${token}` }
        //             })
        //             : Promise.resolve();
        
        //         // **等待兩個 API 都完成**
        //         await Promise.all([...deleteCartsPromises, updateCartsDataPromise]);
        
        //         // 3. **同步清空 Pinia 狀態，讓畫面立即更新**
        //         this.cartItems.items = [];
        
        //     } catch (error) {
        //         console.error('刪除全部商品失敗:', error);
        //     }
        // },
        // async deleteAllItems() {
        //     const authStore = useAuthStore();
        //     const token = authStore.token;
        //     const userId = String(authStore.id); // ✅ 轉為字串比對
          
        //     try {
        //       // 1. 取得 /carts 所有資料
        //       const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
        //         headers: { Authorization: `Bearer ${token}` }
        //       });
          
        //       // ✅ 過濾出當前使用者的商品
        //       const userCartItems = carts.filter(item => String(item.userId) === userId || String(item.user_id) === userId);
          
        //       console.log('🛒 將刪除的商品:', userCartItems);
          
        //       // 2. 發送每筆刪除請求
        //       const deleteCartsPromises = userCartItems.map(item =>
        //         axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${item.id}`, {
        //           headers: { Authorization: `Bearer ${token}` }
        //         }).then(() => {
        //           console.log(`✅ 刪除商品成功: ID ${item.id}`);
        //         }).catch(error => {
        //           console.error(`❌ 刪除商品失敗: ID ${item.id}`, error);
        //         })
        //       );
          
        //       // 3. 清空 /cartsdata
        //       const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
        //         headers: { Authorization: `Bearer ${token}` }
        //       });
          
        //       const userCart = cartsData.find(cart => String(cart.userId) === userId);
          
        //       const updateCartsDataPromise = userCart
        //         ? axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`, {
        //             ...userCart,
        //             items: [],
        //             total: 0,
        //             final_total: 0,
        //             discount: 0,
        //             shipping_fee: 0
        //           }, {
        //             headers: { Authorization: `Bearer ${token}` }
        //           })
        //         : Promise.resolve();
          
        //       // 4. 等待所有刪除與更新完成
        //       await Promise.all([...deleteCartsPromises, updateCartsDataPromise]);
          
        //       // 5. 清空前端狀態
        //       this.cartItems.items = [];
        //       console.log('✅ 所有商品與 cartsdata 已刪除完畢');
          
        //     } catch (error) {
        //       console.error('❌ 刪除全部商品失敗:', error);
        //     }
        // },
        // async deleteAllItems() {
        //     const authStore = useAuthStore();
        //     const token = authStore.token;
        //     const userId = String(authStore.id); // ✅ 轉為字串比對
          
        //     try {
        //       // 1. 取得 /carts 內該用戶的所有商品
        //       const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
        //         headers: { Authorization: `Bearer ${token}` }
        //       });
          
        //       // ✅ 過濾出當前使用者的商品
        //       const userCartItems = carts.filter(item => String(item.userId) === userId || String(item.user_id) === userId);
          
        //       console.log('🛒 將刪除的商品:', userCartItems);
          
        //       // 2. 發送每筆刪除請求
        //       const deleteCartsPromises = userCartItems.map(item =>
        //         axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${item.id}`, {
        //           headers: { Authorization: `Bearer ${token}` }
        //         }).then(() => {
        //           console.log(`✅ 刪除商品成功: ID ${item.id}`);
        //         }).catch(error => {
        //           console.error(`❌ 刪除商品失敗: ID ${item.id}`, error);
        //         })
        //       );
          
        //       // 3. 清空 /cartsdata
        //       const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
        //         headers: { Authorization: `Bearer ${token}` }
        //       });
          
        //       const userCart = cartsData.find(cart => String(cart.userId) === userId);
          
        //       const updateCartsDataPromise = userCart
        //         ? axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`, {
        //             ...userCart,
        //             items: [],
        //             total: 0,
        //             final_total: 0,
        //             discount: 0,
        //             shipping_fee: 0
        //           }, {
        //             headers: { Authorization: `Bearer ${token}` }
        //           })
        //         : Promise.resolve();
          
        //       // 4. 等待所有刪除與更新完成
        //       await Promise.all([...deleteCartsPromises, updateCartsDataPromise]);
          
        //       // 5. **二次確認 `/carts` 是否還有資料**
        //       const { data: remainingCarts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
        //         headers: { Authorization: `Bearer ${token}` }
        //       });
          
        //       const remainingUserItems = remainingCarts.filter(item => String(item.userId) === userId || String(item.user_id) === userId);
          
        //       if (remainingUserItems.length === 0) {
        //         console.log('✅ 確認 `/carts` 已清空！');
        //       } else {
        //         console.warn('⚠️ `/carts` 仍有殘留資料:', remainingUserItems);
                
        //         // **強制補救：重新發送刪除請求**
        //         await Promise.all(remainingUserItems.map(item =>
        //           axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${item.id}`, {
        //             headers: { Authorization: `Bearer ${token}` }
        //           }).then(() => {
        //             console.log(`✅ 補刪成功: ID ${item.id}`);
        //           }).catch(error => {
        //             console.error(`❌ 補刪失敗: ID ${item.id}`, error);
        //           })
        //         ));
        //       }
          
        //       // 6. 清空前端狀態
        //       this.cartItems.items = [];
        //       console.log('✅ 最終確認：所有商品與 `/cartsdata` 已刪除');
          
        //     } catch (error) {
        //       console.error('❌ 刪除全部商品失敗:', error);
        //     }
        // },
        //ok 全刪 有string
        // async deleteAllItems() {
        //     const authStore = useAuthStore();
        //     const token = authStore.token;
        //     const userId = String(authStore.id); // 確保 userId 是字串
        
        //     try {
        //         // 1. 取得 `/carts` 內該用戶的所有商品
        //         const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
        //             headers: { Authorization: `Bearer ${token}` }
        //         });
        
        //         const userCartItems = carts.filter(item => String(item.userId) === userId || String(item.user_id) === userId);
        
        //         console.log('🛒 將刪除的商品:', userCartItems);
        
        //         // 2. **逐步刪除商品**
        //         for (const item of userCartItems) {
        //             try {
        //                 await axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${item.id}`, {
        //                     headers: { Authorization: `Bearer ${token}` }
        //                 });
        //                 console.log(`✅ 刪除成功: ID ${item.id}`);
        //             } catch (error) {
        //                 console.error(`❌ 刪除失敗: ID ${item.id}`, error);
        //             }
        //         }
        
        //         // 3. **清空 `/cartsdata`**
        //         const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
        //             headers: { Authorization: `Bearer ${token}` }
        //         });
        
        //         const userCart = cartsData.find(cart => String(cart.userId) === userId);
        
        //         if (userCart) {
        //             await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`, {
        //                 ...userCart,
        //                 items: [],
        //                 total: 0,
        //                 final_total: 0,
        //                 discount: 0,
        //                 shipping_fee: 0
        //             }, {
        //                 headers: { Authorization: `Bearer ${token}` }
        //             });
        //             console.log('✅ `/cartsdata` 已清空');
        //         }
        
        //         // 4. **二次確認 `/carts` 是否清空**
        //         const { data: remainingCarts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
        //             headers: { Authorization: `Bearer ${token}` }
        //         });
        
        //         const remainingUserItems = remainingCarts.filter(item => String(item.userId) === userId || String(item.user_id) === userId);
        
        //         if (remainingUserItems.length === 0) {
        //             console.log('✅ `/carts` 已完全清空');
        //         } else {
        //             console.warn('⚠️ `/carts` 仍有殘留資料:', remainingUserItems);
        //         }
        
        //         // 5. 清空前端狀態
        //         this.cartItems.items = [];
        //         console.log('✅ 所有商品已刪除完畢');
        
        //     } catch (error) {
        //         console.error('❌ 刪除全部商品失敗:', error);
        //     }
        // },
        //ok 全刪 沒有string 逐筆刪除 + 二次確認
        async deleteAllItems() {
            const authStore = useAuthStore();
            const token = authStore.token;
            const userId = (authStore.id); // 確保 userId 是字串
        
            try {
                // 1. 取得 `/carts` 內該用戶的所有商品
                const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
        
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
        //ok 全刪逐筆刪除後再次確認 Promise.all
        // async deleteAllItems() {
        //     const authStore = useAuthStore();
        //     const token = authStore.token;
        //     const userId = (authStore.id);
        
        //     try {
        //         let retryCount = 0; // 重新刪除的次數
        //         let cartsLeft; // 剩下未刪除的商品
        
        //         do {
        //             // 1. 取得該用戶的購物車內容
        //             const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
        //                 headers: { Authorization: `Bearer ${token}` }
        //             });
        
        //             cartsLeft = carts.filter(item => (item.userId) === userId || (item.user_id) === userId);
        
        //             console.log(`🛒 第 ${retryCount + 1} 次刪除，還剩下 ${cartsLeft.length} 個商品`);
        
        //             if (cartsLeft.length === 0) break; // 如果已經沒有商品，停止刪除
        
        //             // 2. **並行刪除**
        //             await Promise.all(cartsLeft.map(item =>
        //                 axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${item.id}`, {
        //                     headers: { Authorization: `Bearer ${token}` }
        //                 }).then(() => console.log(`✅ 刪除成功: ID ${item.id}`))
        //                 .catch(error => console.error(`❌ 刪除失敗: ID ${item.id}`, error))
        //             ));
        
        //             retryCount++; // 增加重試次數
        
        //         } while (cartsLeft.length > 0 && retryCount < 5); // 最多重試 5 次
        
        //         console.log('✅ `/carts` 已完全清空');
        
        //         // 3. 清空 `/cartsdata`
        //         const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
        //             headers: { Authorization: `Bearer ${token}` }
        //         });
        
        //         const userCart = cartsData.find(cart => (cart.userId) === userId);
        
        //         if (userCart) {
        //             await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`, {
        //                 ...userCart,
        //                 items: [],
        //                 total: 0,
        //                 final_total: 0,
        //                 discount: 0,
        //                 shipping_fee: 0
        //             }, {
        //                 headers: { Authorization: `Bearer ${token}` }
        //             });
        //             console.log('✅ `/cartsdata` 已清空');
        //         }
        
        //         // 4. **同步前端狀態**
        //         this.cartItems.items = [];
        //         console.log('✅ 所有商品已刪除完畢');
        
        //     } catch (error) {
        //         console.error('❌ 刪除全部商品失敗:', error);
        //     }
        // },
        //用於vue頁面 (一打開網頁時，如果還沒登入、或 API 還沒完成，先暫時把上次存下來的購物車資料載回來顯示)(頁面初始化用，讓資料不會閃一下變空)
        // loadCartFromLocalStorage() {
        //     try {
        //         const savedCart = localStorage.getItem("cartItems");
        //         this.cartItems = savedCart ? JSON.parse(savedCart) : null;
        //     } catch (error) {
        //         console.error("載入 localStorage 購物車失敗：", error);
        //         this.cartItems = null;
        //     }
        // }
        loadCartFromLocalStorage() {
            const savedCart = localStorage.getItem("cartItems");
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
        
                // 為了保持響應式效果，直接操作屬性，而不是整個替換
                this.cartItems = {
                    ...parsedCart,
                    items: [...parsedCart.items] // 解構 item 陣列，確保觸發 getter
                };
            } else {
                this.cartItems = null;
            }
        },
        
        
        
          
          
       

 
    },
})