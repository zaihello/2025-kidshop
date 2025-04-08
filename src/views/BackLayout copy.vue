<!-- 後臺管理 -->
<!--header z-30 ；側邊欄 z-50 ;遮罩 z-40-->
<script>
import { useAuthStore } from '../stores/authStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { useCartStore } from '../stores/cartStore';
import { logout } from '../stores/authService';

import FrontLayoutFooter from '../components/front/FrontLayoutFooter.vue'

export default{
    components:{FrontLayoutFooter},
    data(){
        return{
            // account
            isSidebarOpen: false,//漢堡選單開關
            activeIndex: null, // 記錄當前選中的索引，切換背景、文字顏色
        }
    },
    computed:{
      //store引入
      authStore() {
        return useAuthStore();
      },
      wishlistStore(){
        return useWishlistStore()
      },  
      cartStore(){
        return useCartStore() 
      },
      wishlistCounts() {
      // 获取 "全部" 的数量
        return this.wishlistStore.categoryCounts['全部'] || 0;
      },  
      //獲取購物車商品項目數量
      itemTypesCount() {
        return this.cartStore.itemTypesCount; // 從 getter 中獲取商品品項數量
      },

    },
    methods:{
      //登出
      async handleLogout() {
        try {
          await logout(); // 呼叫登出方法
          alert('已成功登出！');
          this.$router.push('/shop'); // 在組件中進行跳轉
        } catch (error) {
          console.error('登出失敗:', error);
        }
      },
        //漢堡選單開關
      toggleSidebar() {
          this.isSidebarOpen = !this.isSidebarOpen;
      },
      // 切換背景、文字顏色  
      setActive(index) {
        this.activeIndex = index; // 更新當前選中的索引
        this.isSidebarOpen = false; // 點擊後隱藏側邊欄
      },
      //負責從 localStorage 加載購物車數據到內存中（Vue 的狀態）；使用於頁面加載或刷新時恢復數據
      loadCartFromLocalStorage(){
        this.cartStore.loadCartFromLocalStorage()
      },
    },
    mounted(){
      // this.cartStore.initializeCart()// 確保購物車初始化(商品數量數字不會不見)
       this.cartStore.getCartData({ initialize: true });
       this.loadCartFromLocalStorage();// 頁面載入時同步 LocalStorage 資料(才不會重新整理頁面時，出現購物車0的頁面)
    }
}
   
</script>
<template>
  <!-- bg-orange-100 -->
  <div id="app" class=" border-b">
      <!-- 小螢幕版型區塊 -->
    <div class=" px-4 py-5 flex items-center justify-between lg:justify-center fixed top-0 left-0 w-full bg-white shadow-md z-30 lg:hidden lg:bg-transparent lg:shadow-none    lg:z-0">
  
      <!-- 左邊小螢幕漢堡選單 -->
      <button 
        @click="toggleSidebar" 
        class="text-gray-500 hover:text-gray-700 flex-shrink-0 lg:hidden">
        <span class="material-icons">menu</span>
      </button>

      <!-- 中間Logo -->
      <div class="flex-1 flex justify-center items-center">
        <a href="#" class="text-2xl font-bold">
          <img src="/logo.svg" alt="Logo" class="inline-block h-10">
        </a>
      </div>

      <!-- 右側購物車圖示 -->
      <div class="lg:hidden flex items-center">
        <router-link to="/cart/cartlist" class="relative text-gray-500 hover:text-gray-700">
          <span class="material-icons">shopping_bag</span>
          <span class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center    justify-center">
            {{ itemTypesCount}}
          </span>
        </router-link>
      </div>
    </div>
    <!-- 大螢幕版型區塊 -->
    <div class="hidden lg:block lg:fixed lg:top-0 lg:left-0 lg:right-0 z-30 bg-orange-100 px-4 py-5">
      
      <div class="flex-1 flex justify-center items-center">
        <a href="#" class="text-2xl font-bold">
          <img src="/logo.svg" alt="Logo" class="inline-block h-10">
        </a>
      </div>
      <div class="lg:flex lg:items-center lg:justify-between px-4 py-5 w-full 2xl:w-3/4 2xl:m-auto">
 
        <!-- 左側區塊：標題和導航鏈接 -->
        <div class="flex items-center space-x-6 text-sm text-gray-700">
          <a href="#" class="flex items-center space-x-1 hover:text-blue-600">
            <span class="material-icons">groups</span>
            <span>關於我們</span>
          </a>
          <a href="#" class="flex items-center space-x-1 hover:text-blue-600">
            <span class="material-icons">mail</span>
            <span>聯絡我們</span>
          </a>
          <a href="#" class="flex items-center space-x-1 hover:text-blue-600">
            <span class="material-icons">edit</span>
            <span>文章</span>
          </a>
        </div>

        <!-- 中間區塊：Shop -->
        <div class="space-x-4 text-lg text-gray-800">
          <router-link to="/shop" class="hover:text-blue-600">商店</router-link>
        </div>

        <!-- 右側區塊：登入和購物車按鈕 -->
        <div class="space-x-4">
          <!-- 未登入時顯示 -->
          <ul v-if="!authStore.isLoggedIn" class="flex gap-4">
            <li>
              <router-link to="/login">登入</router-link>
            </li>
            <li>
              <router-link to="/signup">註冊</router-link>
            </li>
          </ul>
          <!-- 已登入時顯示 -->
          <ul v-else class="flex gap-4">
            <li>
              <button @click="handleLogout" class="text-gray-500 hover:text-gray-700">登出</button>
            </li>
            <li>
              <router-link to="/account/wishes" class="text-gray-500 hover:text-gray-700">
                <span class="material-icons">person</span>
              </router-link>
            </li>
            <li>
              <router-link to="/account/wishes" class="relative text-gray-500 hover:text-gray-700">
                <span class="material-icons">favorite</span>
                <span class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center    justify-center">{{ wishlistCounts }}</span>
              </router-link>
            </li>
            <li>
              <router-link to="/cart/cartlist" class="relative text-gray-500 hover:text-gray-700">
                <span class="material-icons">shopping_bag</span>
                <span class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center    justify-center">{{ itemTypesCount}}</span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 小螢幕摺疊式導航列 -->
    <div class="relative">
      <!-- 側邊欄 -->
      <div
        :class="{'translate-x-0': isSidebarOpen, '-translate-x-full': !isSidebarOpen}"
        class="fixed top-0 left-0 h-full w-80 bg-white shadow-lg z-50 transition-transform duration-300"
      >
        <div class="flex justify-between items-center p-4 border-b">
          <h2 class="text-lg font-semibold">Menu</h2>
          <button @click="toggleSidebar" class="text-gray-500">X</button>
        </div>
      
        <nav class="">
          <ul class="space-y-2">
            <router-link>
              <li 
                class="border-b-2 p-4 text-gray-800"
                :class="{
                  'bg-orange-200 text-white': activeIndex === 0 ,
                  'hover:bg-gray-200': activeIndex !== 0
                }"
                @click="setActive(0)"
              >首頁
              </li>
            </router-link>
            <router-link to="/shop">
              <li class="border-b-2 p-4 text-gray-800"
                  :class="{
                    'bg-orange-200 text-white': activeIndex === 1 ,
                    'hover:bg-gray-200': activeIndex !== 1
                  }"
                  @click="setActive(1)">商店 
              </li>
            </router-link>
            <router-link>
              <li 
                class="border-b-2 p-4 text-gray-800"
                :class="{
                    'bg-orange-200 text-white': activeIndex === 2 ,
                    'hover:bg-gray-200': activeIndex !== 2
                }"
                @click="setActive(2)"
              >關於我們
              </li>
            </router-link>
            <router-link>
              <li 
                class="border-b-2 p-4 text-gray-800"
                :class="{
                    'bg-orange-200 text-white': activeIndex === 3 ,
                    'hover:bg-gray-200': activeIndex !== 3
                }"
                @click="setActive(3)"
              >聯絡我們
              </li>
            </router-link>
            <router-link>
              <li 
                class="border-b-2 p-4 text-gray-800"
                :class="{
                    'bg-orange-200 text-white': activeIndex === 4 ,
                    'hover:bg-gray-200': activeIndex !== 4
                }"
                @click="setActive(4)"
              >文章
              </li>
            </router-link>
            <router-link 
              to="/account/wishes" 
              class="text-gray-500 hover:text-gray-700"
            >
              <li 
                class="border-b-2 p-4 relative flex items-center gap-3" 
                :class="{
                    'bg-orange-200 text-white': activeIndex === 5 ,
                    'hover:bg-gray-200': activeIndex !== 5
                }"
                @click="setActive(5)"
              >
                <div class="relative">
                  <span class="material-icons ">favorite</span>
                  <span class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{{ wishlistCounts }}</span>    
                </div>
                <span>追蹤清單</span>
              </li>  
            </router-link>  
            
            <router-link to="/login">
              <li 
                class="border-b-2 p-4"
                :class="{
                    'bg-orange-200 text-white': activeIndex === 6 ,
                    'hover:bg-gray-200': activeIndex !== 6
                }"
                @click="setActive(6)"
              >登入

              </li>
            </router-link>
            <router-link to="/signup">
              <li 
                class="border-b-2 p-4"
                :class="{
                    'bg-orange-200 text-white': activeIndex === 7 ,
                    'hover:bg-gray-200': activeIndex !== 7
                }"
                @click="setActive(7)"
              >註冊
              </li>
            </router-link>
            
          </ul>
        </nav>
      </div>

      <!-- 遮罩背景 -->
      <div
        v-if="isSidebarOpen"
        @click="toggleSidebar"
        class="fixed inset-0 bg-black bg-opacity-50 z-40"
      ></div>
    </div>
  
  </div>

  <!-- 加入 margin-top 來避免被 Header 使用fixed遮擋 -->
  <div class="mt-28 lg:mt-44">
    <router-view/>
  </div>

  <!-- <FrontLayoutFooter/> -->
  
</template>

<style scoped>
/* 側邊欄滑動效果 */
.translate-x-0 {
  transform: translateX(0);
}

.-translate-x-full {
  transform: translateX(-100%);
}

</style>