<!-- 後臺管理 -->
<!--header z-30 ；側邊欄 z-50 ;遮罩 z-40-->
<script>
import { useAdminAuthStore } from '../stores/adminAuthStore'

export default{
    data(){
        return{
            // account
            isSidebarOpen: false,//漢堡選單開關
            activeIndex: null, // 記錄當前選中的索引，切換背景、文字顏色
            sidebarLinks: [
              { to: '/shop', label: '商店瀏覽 ' },
              { to: '/about', label: '關於我們瀏覽' },
              { to: '/contact', label: '聯絡我們瀏覽' },
              { to: '/blog', label: '文章瀏覽' },
              { label: '登出', action: 'logout' },
            ],
        }
    },
    computed:{
      //後台
      adminAuthStore(){
        return useAdminAuthStore()
      }, 
     
    },
    methods:{
      //登出
      async handleLogout() {
        try {
          alert('已成功登出！');
          this.adminAuthStore.clearAuth(); //清除本地管理者資料
          this.$router.push('/admin/login'); // 登出後導向後台登入頁
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
   
}
   
</script>

<template>
  <div id="app">
    <!-- Header -->
    <header class="sticky top-0 z-50 shadow-md bg-white lg:bg-orange-100">
      <!-- 小螢幕導覽列 -->
      <div class="relative flex items-center px-4 py-6 lg:hidden">
        <!-- 漢堡選單 -->
        <button v-if="adminAuthStore.isLoggedIn" @click="toggleSidebar" class="text-gray-600">
          <span class="material-icons">menu</span>
        </button>
        <router-link to="/shop" class="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold">
          後台管理
        </router-link>
      </div>

      <!-- 大螢幕導覽列 -->
      <div class="hidden lg:block 2xl:w-3/4 2xl:m-auto py-8 space-y-4">
       
        <router-link to="/shop" class="flex justify-center items-center text-2xl font-bold"> 後台管理
        </router-link>
        
        <div v-if="adminAuthStore.isLoggedIn" class=" lg:flex items-center justify-between">
          <!-- 左邊連結 -->
          <div class="flex gap-6 text-gray-700 text-sm">
            <router-link to="/about" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">
              <span class="material-icons">groups</span> 關於我們瀏覽
            </router-link>
            <router-link to="/contact" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">
              <span class="material-icons">mail</span> 聯絡我們瀏覽
            </router-link>
            <router-link to="/blog" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">
              <span class="material-icons">edit</span> 文章瀏覽
            </router-link>
          </div>

          <!-- 中間連結 -->
          <div>
            <router-link to="/shop" class=" text-gray-600 hover:text-blue-600">商店瀏覽</router-link>
          </div>

          <!-- 右邊操作 -->
          <div class="flex gap-6">
            <button @click="handleLogout" class="flex items-center gap-1 text-gray-600 transition-colors duration-200 hover:text-blue-600">登出</button>
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
                <!-- 如果是登出按鈕 -->
                <button
                  v-if="item.label === '登出'"
                  @click="handleLogout"
                  class="block w-full text-left p-3 rounded hover:bg-gray-100 text-gray-700"
                >
                  {{ item.label }}
                </button>

                <!-- 其他導覽連結 -->
                <router-link
                 v-else
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
  
  </div>
</template>

