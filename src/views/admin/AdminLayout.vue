<script>
import { useAdminProductStore } from '../../stores/adminProductStore'
import { useAdminAuthStore } from '../../stores/adminAuthStore'

export default{
    data(){
      return{
        // activeMenu: null, // 追蹤展開的下拉選單
        // activeMenus: {}, // 追蹤展開的下拉選單
        activeMenus: { // 確保有預設 key，避免 Vue 無法監聽
        products: false,
        orders: false,
        users: false
      }
      }
    },
    computed:{
        adminProductStore(){
            return useAdminProductStore()
        },
        adminAuthStore(){
          return useAdminAuthStore()
        },
      
        currentPath() {
          return this.$route.path;
        },
    },
    methods:{
      // toggleMenu(menu) {
      //   this.activeMenu = this.activeMenu === menu ? null : menu;
      // },
      // toggleMenu(menu) {
      //   // 如果目前已經展開，則收起
      //   if (this.activeMenu === menu) {
      //     this.activeMenu = null;
      //   } else {
      //     // 如果還沒展開，則展開新選單，並保持其他選單的狀態
      //     this.activeMenu = menu;
      //   }
      // },
      toggleMenu(menu) {
        // 直接切換當前選單的展開/收起狀態，不影響其他選單
        this.activeMenus[menu] = !this.activeMenus[menu];
      },
      isActive(path) {
        return this.currentPath.startsWith(path);
      },
    },

     //使用 created()，因為能更早觸發 API 請求，提升資料載入效率。
    // createed(){
    //     this.adminProductStore.getAdminProducts();//抓取 currentPage 的商品列表
    // },
    watch: {
        'adminProductStore.isModalOpen'(isOpen) {
            document.body.style.overflow = isOpen ? 'hidden' : ''; // 新增/編輯/刪除視窗開啟時禁止滾動
        }
    },
    mounted(){
        this.adminProductStore.getAdminProducts();
       
    },
}
</script>

<template>
  <!-- w-full 2xl:w-3/4 2xl:m-auto  mx-auto py-10 lg:py-30-->
   <!-- 新增/編輯/刪除視窗開的true，隱藏overflow-hidden -->
    <div :class="{ 'overflow-hidden': adminProductStore.isModalOpen }"  class="w-full 2xl:w-3/4 2xl:m-auto">
       <!-- <h2 class="text-xl font-bold text-center mb-4">後台管理</h2> -->
      <!-- Layout -->
      <p>{{ adminAuthStore.adminName }}管理員，登入中~~</p>
      <div class="flex flex-col md:flex-row justify-between">
        <!-- Sidebar -->
        <!-- class="hidden md:block w-full md:w-44" -->
        
        <nav class="hidden md:block w-full md:w-44">
          <!-- 產品管理 -->
          <!-- 這裡的products是路由的訂單管理首頁 path:'products' -->  
          <div class="bg-white border border-gray-200 rounded-md divide-y divide-gray-200">
            <button @click="toggleMenu('products')" class="flex justify-between w-full py-2 px-4 hover:bg-gray-700">
              產品管理
              <span>{{ activeMenus.products ? '▲' : '▼' }}</span>
            </button>  
            <ul v-show="activeMenus.products" class="pl-6">
              <li class="bg-orange-500">
                <router-link to="/admin/products"
                  class="block py-2 px-4 hover:bg-gray-600"
                  :class="{ 'bg-gray-700': isActive('/admin/products') }"
                >
                  產品列表
                </router-link>
              </li>
            </ul>
          </div>
           <!-- 訂單管理 -->
          <!-- 這裡的orders是路由的訂單管理首頁 path:'orders' -->  
          <div>
            <button
              @click="toggleMenu('orders')"
              class="flex justify-between w-full py-2 px-4 hover:bg-gray-700" 
            >
              訂單管理
          
              <span>{{ activeMenus.orders ? '▲' : '▼' }}</span>
            </button>  
          
            <ul v-show="activeMenus.orders" class="pl-6">  
              <li>
                <router-link to="/admin/orders"
                  class="block py-2 px-4 hover:bg-gray-600"
                  :class="{ 'bg-gray-700': isActive('/admin/orders') }"
                >
                  訂單列表
                </router-link>
              </li>
            </ul>
          </div>  
          <!-- 用戶管理 -->
          <!-- 這裡的users是路由的用戶管理首頁 path:'users' -->
          <div>
            <button
              @click="toggleMenu('users')"
              class="flex justify-between w-full py-2 px-4 hover:bg-gray-700" 
            >
              用戶管理
            
              <span>{{ activeMenus.users ? '▲' : '▼' }}</span>
            </button>
          
            <ul v-show="activeMenus.users" class="pl-6">
              <li>
              <router-link to="/admin/users/admins"
                           class="block py-2 px-4 hover:bg-gray-600"
                           :class="{ 'bg-gray-700': isActive('/admin/users/admins') }">
                管理員列表
              </router-link>
              </li>
              <li>
               <router-link to="/admin/users/members"
                            class="block py-2 px-4 hover:bg-gray-600"
                            :class="{ 'bg-gray-700': isActive('/admin/users/members') }">
                  會員列表
                </router-link>
              </li>  
           
            </ul>
            
          </div>
        </nav>
  
        <!-- Main Content -->
        <div class="w-full md:w-3/4">
          <router-view/>
        </div>
      </div>
    </div>
</template>
  