//617
import { defineStore } from "pinia";
import { useAuthStore } from './authStore'
import { usePaymentStore } from './paymentStore'
import { useCouponStore } from './couponStore'
import axios from 'axios'
import { watch } from 'vue'

export const useCartStore = defineStore("cartStore",{
    state:() =>({
        //cartItems是使用者物件 /cartsdata格式
        cartItems: JSON.parse(localStorage.getItem("cartItems")) || {
            userId: 0,//null
            items: [],
            total: 0,
            couponCode:null,// ← 優惠券資料
            freight:0,
            freeShipping:null,//免運卷
            final_total: 0,
            status: false,
            orderStatus: false,
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
        // 折價卷折扣金額 
        discountAmount(state){
            const couponStore = useCouponStore()
            const discountCoupon = couponStore.appliedDiscountCoupon
            return discountCoupon ? discountCoupon.discount : 0
        },        
        //自動計算金額(有 折價卷、免運卷 ) 計算最終應付金額（總金額 + 運費） 
        finalTotal(state){
            const paymentStore = usePaymentStore();
            return Math.max(0,this.totalAmount - this.discountAmount + paymentStore.finalShippingFee)
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
                        couponCode:{},// ← 優惠券資料
                        freight:0,
                        freeShipping:null, 
                        final_total: 0,
                        status: false,
                        orderStatus: false,
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
            try {
                const authStore = useAuthStore();
                const couponStore = useCouponStore();
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

                // 產生購物車商品項目（純資料物件）
                const newItem = this.createCartItem(product, selectedVariant, selectedColorObj, quantity);

                // 取得目前用戶的購物車資料
                const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/cartsdata`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                let existingCart = data.find(cart => cart.userId === userId);
                let updatedCart = null;

                if (existingCart) {
                    // 檢查是否已存在相同 variant_Id 的商品
                    const existingItem = existingCart.items.find(item => item.variant_Id === newItem.variant_Id);

                    if (existingItem) {
                        // 更新數量與小計
                        existingItem.quantity += quantity;
                        existingItem.subTotal = existingItem.quantity * existingItem.price;
                    } else {
                        // 新增新的商品
                        existingCart.items.push(newItem);
                    }

                    this.cartItems = existingCart;// ✅ 先更新 cartItems
                    const updatedFinalTotal = this.finalTotal; // ✅ 再取 finalTotal getter

                    await axios.patch(
                    `https://204ed3432b06d7af.mokky.dev/cartsdata/${existingCart.id}`,
                        {
                            ...existingCart,
                            // final_total:this.finalTotal,// ← 這裡取自 getter！
                            final_total: updatedFinalTotal,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    updatedCart = existingCart;
                } else {
                     // ✅ **如果購物車不存在，建立新購物車**
                    const newCart = {
                        userId,
                        items: [newItem],
                        freight:0,
                        couponCode: couponStore.appliedDiscountCoupon?.code || null,
                        freeShipping:couponStore.appliedFreeeShippingCoupon?.code || null,
                        status: false,
                        orderStatus: false,
                    };

                    this.cartItems = newCart;

                    const response = await axios.post(`https://204ed3432b06d7af.mokky.dev/cartsdata`, 
                        {
                            ...newCart,
                            final_total:this.finalTotal,// ✅ 使用 getter 計算
                        }
                        , 
                        {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    updatedCart = response.data;
                }

                // 更新狀態並存入 localStorage
                this.cartItems = updatedCart;
                localStorage.setItem("cartItems", JSON.stringify(this.cartItems));

                // 單品同步至 /carts
                await this.syncCartItemToAPI(newItem);

                alert("商品已加入購物車！");
            } catch (error) {
                console.error("加入購物車失敗", error);
            }
        },
        //新增商品的格式
        createCartItem(product, selectedVariant, selectedColorObj, quantity) {
            return {
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
            const couponStore = useCouponStore()
            const paymentStore = usePaymentStore()
            const token = localStorage.getItem('userToken')

            const discountCoupon = couponStore.appliedDiscountCoupon
            const freeShippingCoupon = couponStore.appliedFreeeShippingCoupon
                // console.log('6/8',finalCouponData)
            if (!this.cartItems.id) {
                console.warn("❗ 無法同步，缺少 cart ID")
                return
            }

            const payload = {
                items: this.cartItems.items.map(item => ({
                    ...item,
                    selected: item.selected,
                })),
                total: this.totalAmount,
                couponCode:discountCoupon || null,
                freight:paymentStore.originalShippingFee,
                freeShipping:freeShippingCoupon || null,
                final_total: this.finalTotal,
                status: this.cartItems.status || false,
                orderStatus: this.cartItems.orderStatus || false,
            }

            console.log("🔄 正在同步資料到 /cartsdata：", payload)

            try {
                await axios.patch(
                    `https://204ed3432b06d7af.mokky.dev/cartsdata/${this.cartItems.id}`,
                    payload,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                )

                // ✅ 更新 cartItems 與 localStorage
                this.cartItems = {
                    ...this.cartItems,
                    ...payload,
                }
                localStorage.setItem("cartItems", JSON.stringify(this.cartItems))

            } catch (error) {
                console.error("❌ 更新 cartsdata API 失敗:", error)
            }
        },

        //刪除購物清單頁面的單一商品div功能
        async removeFromCart(item) {
            const authStore = useAuthStore();
            const token = authStore.token;
            const userId = authStore.id;

            try {
                // 1. 從 /carts 找到該使用者的商品並刪除單品
                const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const cartItem = carts.find(cart => cart.userId === userId && cart.variant_Id === item.variant_Id);

                if (cartItem) {
                    await axios.delete(`https://204ed3432b06d7af.mokky.dev/carts/${cartItem.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log(`✅ 已從 /carts 刪除商品: ID ${cartItem.id}`);
                }

                // 2. 取得 /cartsdata 對應購物車物件
                const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const userCart = cartsData.find(cart => cart.userId === userId);

                if (!userCart) {
                    console.warn("❗ 找不到該使用者的 /cartsdata");
                    return;
                }

                // 3. 過濾掉要刪除的項目
                const updatedItems = userCart.items.filter(cartItem => cartItem.variant_Id !== item.variant_Id);

                // 4. 若剩下 0 項商品 → 清空購物車資訊（reset 格式）
                if (updatedItems.length === 0) {
                    const emptyCartPayload = {
                        userId,
                        items: [],
                        total: 0,
                        final_total: 0,
                        couponCode: null,
                        freight:0,
                        freeShipping:null,
                        status: false,
                        orderStatus: false,
                    };

                    await axios.patch(
                        `https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`,
                        emptyCartPayload,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    this.cartItems = emptyCartPayload;
                    localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
                    console.log("🧹 所有商品刪除，購物車已重設");

                } else {
                    const newCartItems = {
                        ...userCart,
                        items:updatedItems,
                    }
                    // 手動重新計算 total 和 final_total（只針對已更新的 updatedItems）
                    const total = updatedItems.reduce((sum,item) => sum + item.subTotal,0)
                    // const final_total = total + (userCart.freight || 0)// 如有免運優惠可再扣除
                    const final_total = total + userCart.freight - userCart.couponCode.discount - userCart.freeShipping.discount// 如有免運優惠可再扣除

                    // 5. 還有商品 → 只更新 items 陣列
                    await axios.patch(
                        `https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`,
                        {
                            ...newCartItems,
                            total,
                            final_total, // 若有 getter 可用
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    this.cartItems = {
                        ...newCartItems,
                        total,
                        final_total,
                    }
                    localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
                    console.log("🧺 商品已移除，購物車資料已更新");
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
            const userId = authStore.id;

            try {
                // ⭐步驟 1：取得該使用者的所有 carts 項目
                const { data: carts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // ✅ 過濾出當前使用者的商品
                const userCartItems = carts.filter(item => item.userId === userId || item.user_id === userId);
                console.log('🛒 將刪除的商品:', userCartItems);

                // ⭐步驟 2：**先清掉本地資料 (localStorage)**
                localStorage.removeItem('cartItems');
                this.cartItems = {
                    items: [],
                    total: 0,
                    final_total: 0,
                    couponCode: null,
                    freeShipping:null,
                };

                // ⭐步驟 3：逐一刪除 /carts 的商品
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

                // ⭐步驟 4：清空 /cartsdata
                const { data: cartsData } = await axios.get('https://204ed3432b06d7af.mokky.dev/cartsdata', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const userCart = cartsData.find(cart => cart.userId === userId || cart.user_id === userId);

                if (userCart) {
                    await axios.patch(`https://204ed3432b06d7af.mokky.dev/cartsdata/${userCart.id}`, {
                        items: [],
                        total: 0,
                        couponCode: null,
                        freight:0,
                        freeShipping:null,
                        final_total: 0,
                        status: false,
                        orderStatus: false
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('✅ `/cartsdata` 已清空');
                }

                // ⭐步驟 5：二次確認是否刪光
                const { data: remainingCarts } = await axios.get('https://204ed3432b06d7af.mokky.dev/carts', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const remainingUserItems = remainingCarts.filter(item => item.userId === userId || item.user_id === userId);

                if (remainingUserItems.length === 0) {
                    console.log('✅ `/carts` 已完全清空');
                } else {
                    console.warn('⚠️ `/carts` 仍有殘留資料:', remainingUserItems);
                }

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

        // 清空 購物車狀態(在authService 登出使用) 原本
        clearCartItems() {
            this.cartItems = []; // 清空購物車
            localStorage.removeItem('cartItems'); // 清空本地存儲
        },
       
        setupWatchers(){
            watch(
                () => this.totalAmount,
                (newTotal) => {
                    const discountCoupon = this.cartItems.couponCode
                    const freeShippingCoupon = this.cartItems.freeShipping
                    const couponStore = useCouponStore()

                    // 檢查折價券門檻
                    if(discountCoupon && discountCoupon.threshold && newTotal < discountCoupon.threshold){
                        this.cartItems.couponCode = null
                        couponStore.selectedDiscountCoupon = null
                        couponStore.manualCoupon = null
                        this.syncCartsDataToAPI()
                    }

                    // 檢查免運券門檻
                    if(freeShippingCoupon && freeShippingCoupon.threshold && newTotal < freeShippingCoupon.threshold){
                        this.cartItems.freeShipping = null
                        couponStore.selectedFreeShippingCoupon = null
                        this.syncCartsDataToAPI()
                    }

                },
                { immediate:true }
            )
        },

    },

})