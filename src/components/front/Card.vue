<script>
// import { mapActions, mapState } from 'pinia'
// import { mapGetters } from 'pinia';
import { useAuthStore } from '../../stores/authStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useProductStore } from '../../stores/productStore'
import { useCartStore } from '../../stores/cartStore'

export default{
    name:"Card",
    // isInWishlist:Boolean,原本

    props:{
        product:Object,//必須
        isInWishlist:Boolean,// 接收方法，判斷是否在追蹤清單中  (傳入是否已在追蹤清單中)
        // toggleWishlistHandler:Function,// 接收方法，切換追蹤清單狀態
        index: Number, // 接收 index
        handleWishlistClick:Function,
        // handleAddToCartClick:Function,
        isInCart:Boolean,//父組件傳遞的是布林值
    },
    // 注入
    // inject:['addToCart',],//方法
    computed:{
        // 动态获取各个 store 实例
        authStore() {
            return useAuthStore();
        },
        wishlistStore() {
            return useWishlistStore();
        },
        productStore() {
            return useProductStore();
        },
        cartStore(){
            return useCartStore() 
        },
        authStore(){
            return useAuthStore()
        },
        // 3/17
        // products(){
        //     return this.productStore.products
        // },
         // 绑定 authStore 和 wishlistStore 的状态
        isLoggedIn() {
            return this.authStore.isLoggedIn;
        },
        //用computed引入的原因，當authStore.token或authStore.userId更新時，this.token和this.userId會自動同步更新。
        //邏輯抽取到計算屬性中，避免在每個方法中手動引入authStore
        // token() {
        //     return this.authStore.token;
        // },
        // userId(){
        //     return this.authStore.userId
        // },
        wishlist() {
            return this.wishlistStore.wishlist;
        },
        colorClass() {
            return this.productStore.colorClass;
        },
        markBackgroundColor() {
            return this.productStore.markBackgroundColor;
        },
        // 計算商品折扣價格
        // calculateDiscountedPrice() {
        //     return this.productStore.calculateDiscountedPrice;
        // },
        // isInCart() {
        //     // 从 store 中检查 cartItems 是否包含当前商品
        //     return this.cartStore.cartItems.some(item => item.product_Id === this.product.id);
        // },
        // 確保商品products是從 store 取得最新數據
        // currentProduct() {
        //     return this.productStore.products.find(p => p.id === this.product.id) || this.product;
        // },
        // isInWishlist() {
        //     return this.product.isWishlist; // 讓 Vue 追蹤 isWishlist
        // },
        isInCart() {
            return this.cartStore.isInCart;
        }

    },
    methods:{
        // 綁定 Store 的動作
        // ...mapActions(useWishlistStore, ['toggleWishlist']),
        //此適用商品列表
        // toggleWishlistHandler() {
        //     // $router要放在組件裡
        //     if (!this.isLoggedIn) {
        //         alert('請先登入以操作追蹤清單');
        //         this.$router.push('/login'); // 導向登入頁面
        //         return;
        //     }

        //     // this.toggleWishlist(this.product); // 呼叫 wishlistStore 中的 toggleWishlist 方法
        //     this.$emit('toggle-wishlist', this.product);
        // },
        // 绑定 Store 的动作
        // toggleWishlistHandler(product) {
        //     // 判断是否已登录
        //     if (!this.isLoggedIn) {
        //         alert('請先登入以操作追蹤清單');
        //         this.$router.push('/login'); // 导向登录页
        //         return;
        //     }

        //     // 调用 wishlistStore 中的 toggleWishlist 方法
        //     this.wishlistStore.toggleWishlist(product);
        // },
        //原本
            // handleWishlistClick() {
            //     // 調用來自父組件的 toggleWishlistHandler 方法
            //     this.toggleWishlistHandler(this.product);
            // },
        // handleWishlistClick() {
        //     // 調用父組件的方法，並傳遞 product 和 index
        //     this.toggleWishlistHandler(this.product, this.index);
        // },
        handleClick() {
            // 确保调用通过 props 传递的父组件方法
            this.handleWishlistClick(this.product,this.index);
        },
        // 加載產品並批量更新折購後的價格儲存進api裡
        // async updatePrices() {
        //     try {
        //         await this.productStore.getProducts(); // 加載所有產品
        //         // await this.productStore.updateAllProductPrices(); // 更新所有價格
        //         console.log('所有價格更新完成！');
        //     } catch (error) {
        //         console.error('更新價格過程中出現錯誤:', error);
        //     } finally {
        //     }
        // },
        // addToCartClick(product){
        //     this.cartStore.addToCart(product,1, this.userId, this.token)
        // },
        // toggleCart(){
        //     this.handleAddToCartClick
        // },
        // async addToCartClick() {
        //     try {
        //         const quantity = 1; // 默认添加 1 个商品
        //         await this.cartStore.addToCart(this.product, quantity, this.authStore.userId, this.authStore.token);
        //         console.log('成功加入購物車');
        //     } catch (error) {
        //         console.error('加入購物車失敗:', error);
        //     }
        // },
        //格式化金額(3,000)
        formatCurrency(value) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD', // 可以更改為其他貨幣，如 'TWD'顯示 NT$或 'EUR'
                minimumFractionDigits: 0,//顯示為 $50.00
                maximumFractionDigits: 2,
            }).format(value);
        },
    //     //商品列表切換 原本
        toggleCart(product){
            // 判斷是否已登錄
      if (!this.authStore.isLoggedIn) {
        alert('請先登入以加入購物車');
        this.$router.push('/login'); // 導向登錄頁
        return;
      }
            this.cartStore.toggleCart(product)
        },
         
       
    },
    mounted(){
        // this.wishlistStore.getWishlist(); // 初始化時獲取追蹤清單
        // console.log('Product props:', this.product);
        //mounted 中呼叫 this.wishlistStore.getWishlist() 是多餘的，因為如果 wishlist 的初始化是全域需求，應該放在 wishlistStore 的初始化邏輯中（例如在 store 的 actions 中自動加載）。如果這段程式碼不是必要的，可以刪除。
        // 在组件的生命周期钩子中，检查并设置 token
        const token = localStorage.getItem('token');
        // if (token) {
        //     this.authStore.setToken(token);
        // }
        if (token) {
            this.authStore.setAuthData(token, { id: localStorage.getItem('userId'), role: localStorage.getItem('userRole') });
        }
        console.log("Card.vue 被掛載，開始執行 updatePrices()");
        console.log("Card.vue 被卸載");
        //Card.vue 被掛載，開始執行 updatePrices()
        // console.log(`Card.vue 被掛載，實例 ID: ${this._uid}`);
        // this.updatePrices() // 加載產品並批量更新折購後的價格儲存進api裡
    },
}

</script>

<template>
    
    <div class="border-slate-950 group/parent relative"> 
        
            <div class="group/item relative hover:before:block rounded-lg cursor-pointer" >
                <router-link :to="`/product/${product.id}`">
                <div class="overflow-hidden rounded-lg"> 
                <!-- 商品圖片 -->
                 <!-- :src="currentProduct.imgurl" -->
                    <img :src="product.imgurl" class="w-full h-64 object-center object-cover rounded-lg hover:scale-110  duration-1000" alt="name" >
                </div>
               </router-link>
                <!-- mark -->
                <!-- 第一top8px，後面都加30px bg-lime-600-->
                <div
                    v-for="(markitem, index) in product.mark"
                    :key="markitem"
                    class="absolute text-white left-2 py-1 px-2 rounded-xl text-xs font-bold"
                    :class="markBackgroundColor(markitem)"
                    :style="{  top: `${8 + index * 30}px`}"
                >
                    <div> {{ markitem }} </div>
                </div>
                <!-- Hover 出現的框架 -->
                <!-- icon 水平置中left-1/2 transform -translate-x-1/2；item -->
                <div class="group/edit invisible group-hover/parent:visible duration-1000 flex justify-evenly gap-1 absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white w-4/5  rounded-lg py-2 " href="">
                    <!-- cart --->
                    <div class="group/cart relative">
                        <!-- 原本 -->
                        <!-- <img 
                          :src="isInCart(product.id)? '/check.svg' : '/cart.svg'"  
                          @click="toggleCart(product)" 
                          alt=""> -->
                          <!-- ?. 避免當 product.variants 為空陣列時報錯。 -->
                        <img 
                          :src="isInCart(product.variants[0]?.id)? './check.svg' : './cart.svg'"  
                          @click="toggleCart(product)" 
                          alt="">
                        <a  class="group/edit invisible group-hover/cart:visible duration-75" >
                            <span class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black p-2 text-xs rounded w-max text-center">{{ isInCart? '移除購物車' : '加入購物車' }}</span>
                        </a>
                    </div>
                    <!-- search -->
                    <div class="group/search relative">
                        <img src="/search.svg" alt="">
                        <a class="group/edit invisible  group-hover/search:visible duration-75" href="#">
                            <span class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black p-2 text-xs rounded w-max text-center">快速查看</span>
                        </a>
                    </div>
                    <!-- compare -->
                    <div class="group/compare relative">
                        <img src="/compare.svg" alt="">
                        <a class="group/edit invisible  group-hover/compare:visible duration-75" href="#">
                            <span class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black p-2 text-xs rounded w-max text-center">比較</span>
                        </a>
                    </div>
                    <!-- wishlist -->
                     <!-- @click="toggleWishlistHandler(product)" -->
                    <div class="group/wishlist relative">
                        <img 
                            :src="isInWishlist ? './check.svg' : './wishlist.svg'"
                            @click="handleClick"
                            alt="Wishlist Icon">
                        <a  class="group/edit invisible group-hover/wishlist:visible duration-75" href="#">
                            <span class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black p-2 text-xs rounded w-max text-center">{{ isInWishlist ? '已加入追蹤清單' : '加入追蹤清單' }}</span>
                        </a>
                    </div>
                </div>
            </div>
           
            <div class="w-full text-center">
                <!-- color -->
                <div v-if="product.variants && product.variants.length > 0" class="flex justify-center space-x-2 my-2">
                     <!-- ui只顯示唯一的color選項 -->
                    <div
                         v-for="(color,index) in [...new Set(product.variants.map(v => v.color))]"
                        :key="index"
                        :class="colorClass(color)"  
                        class="w-6 h-6 rounded-full"
                    >
                    </div>
                </div>

                <router-link :to="`/product/${product.id}`">
                <h2 class="font-semibold text-lg">{{ product.name }}</h2>
                </router-link>
                <p class="flex justify-center">
                   
                    <span v-if="product.price > 0" class="text-gray-700 line-through font-medium">
                    (原價: {{ product.OriginalPrice}})
                    </span>
                    <span v-else  class="text-gray-700 font-medium">
                        原價: {{ product.OriginalPrice }}
                    </span>
                   
                    <!-- 顯示特價 -->
                 
                    <span 
                    v-if="product.price !== 0 " 
                        class="text-red-500 font-medium"
                    >
                        特價: {{ product.price }}
                    </span>
                    
                </p>
            </div>
    </div> 
    
</template>