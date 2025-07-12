<script>
import { useAuthStore } from '../../stores/authStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useProductStore } from '../../stores/productStore'

export default{
    name:"Card",
    props:{
        product:Object,//從ProductList.vue、AccountWishes.vue傳遞過來
        handleWishlistClick:Function,//從ProductList.vue、AccountWishes.vue傳遞過來
    }, 
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
        isInWishlist() {
            return this.wishlistStore.isInWishlist(this.product.id);
        },
    },
    methods:{
        
        handleClick() {
            // 确保调用通过 props 传递的父组件方法
            this.handleWishlistClick(this.product,this.index);
        },
        //格式化金額(3,000)
        formatCurrency(value) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD', // 可以更改為其他貨幣，如 'TWD'顯示 NT$或 'EUR'
                minimumFractionDigits: 0,//顯示為 $50.00
                maximumFractionDigits: 2,
            }).format(value);
        },
        //打開加入購物車的視窗(商品列表頁)
        openCartModal() {
            this.$emit('open-cart-modal', this.product);
        },
         
       
    },
    mounted(){
        // 在组件的生命周期钩子中，检查并设置 token
        const token = localStorage.getItem('token');
        if (token) {
            this.authStore.setAuthData(token, { id: localStorage.getItem('userId'), role: localStorage.getItem('userRole') });
        }
       
    },
}

</script>

<template>
    
    <div class="border-slate-950 group/parent relative"> 
        
            <div class="group/item relative hover:before:block rounded-lg cursor-pointer" >
                <div class="overflow-hidden rounded-lg"> 
                <!-- 商品圖片 -->
                    <img :src="product.imgurl" class="w-full h-64 object-center object-cover rounded-lg hover:scale-110  duration-1000" alt="name" >
                </div>
                <!-- mark -->
                <!-- 第一top8px，後面都加30px bg-lime-600-->
                <!--:style="{  top: `${8 + index * 30}px`}"-->
                <div
                    v-for="(markitem, index) in product.mark"
                    :key="markitem"
                    class="absolute text-white left-2 py-1 px-2 rounded-xl text-xs font-bold"
                    :class="productStore.markBackgroundColor(markitem)"
                    :style="{  top: `${8 + index *30}px`}"
                >
                    <span> {{ markitem }} </span>
                </div>
                <!-- Hover 出現的框架 -->
                <!-- icon 水平置中left-1/2 transform -translate-x-1/2；item -->
                <div class="group/edit invisible group-hover/parent:visible duration-1000 flex justify-evenly gap-1 absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white w-4/5  rounded-lg py-2 " href="">
                    <!-- cart --->
                    <div class="group/cart relative">     
                       <img 
                         :src="'./cart.svg'"  
                         @click="openCartModal" 
                         alt="">
                       <a  class="group/edit invisible group-hover/cart:visible duration-75" >
                           <span class="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black p-2 text-xs rounded w-max text-center">加入購物車</span>
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
                    <!-- 只顯示唯一的color選項-->
                    <div
                        v-for="(colorObj,index) in product.colors"
                        :key="index"
                        :class="productStore.colorClass(colorObj.color)"  
                        class="w-6 h-6 rounded-full"
                    >
                    </div>
                </div>

                <router-link :to="`/product/${product.id}`">
                <h2 class="font-semibold text-lg">{{ product.name }}</h2>
                </router-link>
                <p class="flex justify-center">
                   
                    <span v-if="product.price > 0" class="text-gray-700 line-through font-medium">
                    (原價: {{ formatCurrency(product.OriginalPrice)}})
                    </span>
                    <span v-else  class="text-gray-700 font-medium">
                        原價: {{ formatCurrency(product.OriginalPrice) }}
                    </span>
                   
                    <!-- 顯示特價 -->          
                    <span 
                    v-if="product.price !== 0 " 
                        class="text-red-500 font-medium"
                    >
                        特價: {{ formatCurrency(product.price) }}
                    </span>      
                </p>
            </div>
    </div> 
    
</template>