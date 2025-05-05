<!-- 簡化版  改進-->
<!--header z-50 ；側邊欄 z-50 ;遮罩 z-40-->
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
            sidebarLinks: [
              { to: '/', label: '首頁' },
              { to: '/shop', label: '商店' },
              { to: '/about', label: '關於我們' },
              { to: '/contact', label: '聯絡我們' },
              { to: '/blog', label: '文章' },
              { to: '/account/wishes', label: '追蹤清單' },
              { to: '/login', label: '登入' },
              { to: '/signup', label: '註冊' },
            ],
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
          await logout();
          alert('已成功登出！');
          this.$router.push('/shop');
          //解決登出時wishlist清空，但追蹤符號沒有取消問題
          //location.reload() 會整個頁面重新加載，等於重新跑一次 mounted()、computed 等邏輯，這樣 isInWishlist() 就會回傳正確值了。
          setTimeout(() => {
            location.reload(); // 確保所有組件重新渲染
          }, 100);
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
      
    },
    mounted(){
      this.cartStore.getCartData();
    }
}
   
</script>

<template>
  <div id="app">
    <!-- Header -->
    <header class="sticky top-0 z-50 shadow-md bg-white lg:bg-orange-100 ">
      <!-- 小螢幕導覽列 container mx-auto-->
      <div class="flex items-center justify-between px-4 py-4 lg:hidden">
        <!-- 漢堡選單 -->
        <button @click="toggleSidebar" class="text-gray-600">
          <span class="material-icons">menu</span>
        </button>

        <!-- Logo -->
        <router-link to="/shop" class="flex justify-center items-center">
          <img src="/logo.svg" alt="Logo" class="h-10" />
        </router-link>

        <!-- 購物車（小螢幕） -->
        <router-link to="/cart/cartlist" class="relative text-gray-600">
          <span class="material-icons">shopping_bag</span>
          <span class="absolute -top-1 -right-1 translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{{ itemTypesCount }}</span>
        </router-link>
      </div>

      <!-- 大螢幕導覽列 class="hidden lg:flex items-center justify-between px-8 py-4 bg-orange-100"-->
       <!-- hidden lg:block 2xl:w-3/4 2xl:m-auto py-8 space-y-4 原本-->
      <div class="hidden lg:block w-full 2xl:w-3/4 2xl:m-auto py-6 space-y-4 bg-orange-100">
         <!-- Logo -->
        <router-link to="/shop" class="flex justify-center items-center">
          <img src="/logo.svg" alt="Logo" class="h-10" />
        </router-link>
        <!-- overflow-hidden -->
        <div class=" lg:flex items-center justify-between py-2">
          <!-- 左邊連結 -->
          <div class="flex gap-6 text-gray-700 text-sm">
            <router-link to="/about" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">
              <span class="material-icons">groups</span> 關於我們
            </router-link>
            <router-link to="/contact" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">
              <span class="material-icons">mail</span> 聯絡我們
            </router-link>
            <router-link to="/blog" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">
              <span class="material-icons">edit</span> 文章
            </router-link>
          </div>

          <!-- 中間連結 -->
          <div>
            <router-link to="/shop" class="text-lg font-medium hover:text-blue-600">商店</router-link>
          </div>

          <!-- 右邊操作 -->
          <div class="flex gap-4 items-center">
            <div v-if="!authStore.isLoggedIn"class="flex gap-6">
              <router-link to="/login" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">登入</router-link>
              <router-link to="/signup" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">註冊</router-link>
            </div>

            <div v-else class="flex gap-6 ">
              <button @click="handleLogout" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">登出</button>
            
              <router-link to="/account/wishes" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">
                <span class="material-icons">favorite</span>
                <span class=" bg-blue-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{{ wishlistCounts }}</span>
              </router-link>

              
              <router-link to="/cart/cartlist" class=" flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">
                <span class="material-icons">shopping_bag</span>
                <span class=" bg-blue-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{{ itemTypesCount }}</span>
              </router-link>
              
            </div>
          </div>
        </div>
      </div>
    </header>

    <!--小螢幕 側邊欄 z-50-->
    <transition
      enter-active-class="transition duration-300"
      leave-active-class="transition duration-300"
      enter-from-class="-translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="-translate-x-full opacity-0"
    >
      <aside v-if="isSidebarOpen" class="fixed inset-0 z-50 flex">
        <div class="w-64 bg-white shadow-lg p-4 space-y-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-bold">選單</h2>
            <button @click="toggleSidebar" class="text-gray-500">X</button>
          </div>
          <nav>
            <ul class="space-y-2">
              <li v-for="(item, index) in sidebarLinks" :key="index">
                <router-link
                  :to="item.to"
                  @click="setActive(index)"
                  :class="[
                    'block p-3 rounded hover:bg-gray-100',
                    activeIndex === index ? 'bg-orange-200 text-white' : 'text-gray-700'
                  ]"
                >
                  {{ item.label }}
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
        <div class="flex-1 bg-black bg-opacity-50" @click="toggleSidebar"></div>
      </aside>
    </transition>

    <!-- 主內容 -->
    <main class="">
      <router-view />
    </main>

    <!-- 頁腳 -->
    <FrontLayoutFooter />
  </div>
</template>
