//617
import { defineStore } from "pinia";
import { useAuthStore } from './authStore'
import { usePaymentStore } from './paymentStore'
import { useCouponStore } from './couponStore'
import axios from 'axios'
import { watch } from 'vue'
import { nextTick } from "vue";
import { isFreeShippingUsable } from '../utils/freeShippingUtils'

export const useCartStore = defineStore("cartStore",{
    state:() =>({
        //cartItems是使用者物件 /cartsdata格式
        cartItems: JSON.parse(localStorage.getItem("cartItems")) || {
            userId: 0,//null
            items: [],
            total: 0,
            coupon:null,// ← 優惠券資料
            freight:0,
            freeShipping:null,//免運卷
            final_total: 0,
            status: false,
            orderStatus: false,
        },
        // isLoaded: false, // 🆕 控制是否完成載入 72
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
       
        // 折價卷折扣金額 （自動根據 offerType 計算）只依據 cartItems.couponCode
        discountAmount(state){
            const coupon = state.cartItems.coupon
            const total = state.cartItems.total

            if(!coupon || total < coupon.threshold) return 0

            if(coupon.offerType === 'percent'){
                return Math.floor(total * (coupon.discount / 100))
            }

            // 預設為金額折扣
            return coupon.discount
        },        
        //自動計算金額(有 折價卷、免運卷 ) 計算最終應付金額（總金額 - 折扣 + 運費 - 免運）
        finalTotal(state){
            const paymentStore = usePaymentStore();
            return Math.max(0,this.totalAmount - this.discountAmount + paymentStore.originalShippingFee - paymentStore.shippingDiscountAmount)
        },
        // 計算已勾選商品數量
        selectedItemsCount: (state) => {
            return state.cartItems.items.filter(item => item.selected).length;
        },
        
        //已勾選的商品
        selectedItems(state) {
            return state.cartItems.items.filter(item => item.selected);
        },
        

    },
    actions:{
        //取得目前使用者的購物車  /cartsdata格式 原本
        async getCartData(){
            const authStore = useAuthStore();
            const userId = authStore.id;
            const token = authStore.token;

            if (!userId || !token) {
                console.log("未登入，無法加載購物車");
                return;
            }

            try{
                // this.isLoaded = false//72
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
                        coupon:{},// ← 優惠券資料
                        freight:0,
                        freeShipping:null, 
                        final_total: 0,
                        status: false,
                        orderStatus: false,
                    };
                    localStorage.setItem("cartItems", JSON.stringify(this.cartItems));
                    console.log("API 無資料，自動重設購物車為空");
                  
                }
                // this.isLoaded = true//72
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
                        coupon: couponStore.appliedDiscountCoupon?.code || null,
                        freeShipping:couponStore.appliedFreeShippingCoupon?.code || null,
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
                    categoryId:product.category_id,
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

            const discountCoupon = this.cartItems.coupon || null
            const freeShippingCoupon = this.cartItems.freeShipping || null
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
                coupon:discountCoupon,
                freight:paymentStore.originalShippingFee,
                freeShipping:freeShippingCoupon,
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

                // console.log('🧮 this.totalAmount:', this.totalAmount)
                // console.log('💸 this.discountAmount:', this.discountAmount)
                // console.log('🚚 Shipping Fee:', paymentStore.finalShippingFee)
                // console.log('🧾 finalTotal (calculated):', this.finalTotal)


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

                // 2. 取得使用者 /cartsdata 對應購物車物件
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
                        coupon: null,
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
                    // 5. 更新 items 陣列並觸發同步
                    this.cartItems.items = updatedItems;
                    this.updateCouponStatusIfInvalid()// ← 自動檢查門檻
                    await this.syncCartsDataToAPI()
                    console.log("🧺 商品已移除，購物車資料已更新");
                }

            } catch (error) {
                console.error('❌ 移除商品失敗:', error);
            }
        },
        //更新折價卷、免運卷失效判斷
        updateCouponStatusIfInvalid() {
            const couponStore = useCouponStore()
            const total = this.totalAmount

            // 折價券失效判斷
            const discountCoupon = this.cartItems.coupon
            if (discountCoupon && total < discountCoupon.threshold) {
                this.cartItems.coupon = null
                couponStore.clearCoupons()
                console.log('❌ 折價券未達門檻，自動移除')
            }

            // 免運券失效判斷
            const freeShippingCoupon = this.cartItems.freeShipping
            if (freeShippingCoupon && total < freeShippingCoupon.threshold) {
                this.cartItems.freeShipping = null
                couponStore.selectedFreeShippingCoupon = null
                console.log('❌ 免運券未達門檻，自動移除')
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
                    coupon: null,
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
                        coupon: null,
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
 
        //
        setupCartSyncWatcher(){
            const couponStore = useCouponStore()
            const paymentStore = usePaymentStore()
            const authStore = useAuthStore()

            let isSyncing = false

            watch(
                // () => JSON.stringify(this.cartItems.items),  // 監聽 items 陣列整體內容
                () => this.cartItems.items,
              
                async (newItems) => {
                    if(isSyncing) return
                    isSyncing = true

                    // console.log('🚨 items 變了',  '→', newTotal)
                    const discountCoupon = this.cartItems.coupon
                    const freeShippingCoupon = this.cartItems.freeShipping

                    let shouldWait = false // ← 加這行來判斷是否需要等 reactive 完成


                    console.log('711 freeShippingCoupon',freeShippingCoupon)

                    // ✅ 折價券門檻不符合，自動移除 newTotal
                    if (discountCoupon && discountCoupon.threshold && this.totalAmount < discountCoupon.threshold) {
                        this.cartItems.coupon = null
                        couponStore.selectedDiscountCoupon = null
                        couponStore.manualCoupon = null
                        shouldWait = true//
                    }

                    // ✅ 免運券門檻／條件不符，自動移除
                    if(freeShippingCoupon) {
                        const matchedFreeshipping = couponStore.allFreeshippings.find( f => f.id === freeShippingCoupon.couponId)
                      
                        if(matchedFreeshipping){
                            const user = authStore.user
                            const shipping = paymentStore.orderInfo.delivery_info.method
                            const payment = paymentStore.orderInfo.payment_info.method
                            const selectedItems = this.cartItems.items.filter(item => item.selected)

                            const canUse = isFreeShippingUsable(
                                matchedFreeshipping.promotion,
                                matchedFreeshipping.campaign,
                                matchedFreeshipping.paymentAndShipping.paymentMethods,
                                matchedFreeshipping.paymentAndShipping.shippingMethods,
                                shipping,
                                payment,
                                user,
                                matchedFreeshipping.targetGroup,
                                selectedItems // ⬅️ 只傳勾選的商品
                            )
                   
                            if (!canUse) {
                                this.cartItems.freeShipping = null
                                couponStore.selectedFreeShippingCoupon = null
                                // console.log('before nextTick:', this.cartItems.freeShipping) // 可能還是 null
                                shouldWait = true // ⬅️ 🔥 加這一行就是你要的關鍵！
                            }
                        }
                    }    

                     // ✅ 如果剛剛清掉了優惠，必須等 reactive 完成
                    if (shouldWait) await nextTick()
                        // console.log('after nextTick:', this.cartItems.freeShipping) // 確保 reactive 更新完成
                    // ✅ 每次金額變動都同步 API
                    await this.syncCartsDataToAPI()
                    isSyncing = false
                },
                { immediate:true }
                // deep:true,
            )
        },

    },

})