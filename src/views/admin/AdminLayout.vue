<script>
import { useAdminProductStore } from '../../stores/adminProductStore'
import { useAdminAuthStore } from '../../stores/adminAuthStore'

export default{
    data(){
      return{
        activeMenus: { // 確保有預設 key，避免 Vue 無法監聽 (追蹤展開的下拉選單)
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
      // 直接切換當前選單的展開/收起狀態，不影響其他選單
      toggleMenu(menu) {
        
        this.activeMenus[menu] = !this.activeMenus[menu];
      },
      isActive(path) {
        return this.currentPath.startsWith(path);
      },
    },
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
  <div :class="{ 'overflow-hidden': adminProductStore.isModalOpen }" class="w-full 2xl:w-3/4 2xl:m-auto p-6">
    
    <p class="text-xl font-semibold text-gray-700 mb-8">{{ adminAuthStore.adminName }} 管理員，登入中～</p>
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Sidebar -->
      <nav class="w-full md:w-1/4 bg-white border border-gray-300 rounded-xl shadow-sm p-4 space-y-6">
        <!-- 產品管理 -->
        <div>
          <button @click="toggleMenu('products')" 
                  class="flex justify-between items-center w-full py-3 px-2 text-gray-800 hover:bg-gray-100 rounded-md font-semibold">
            產品管理
            <span>{{ activeMenus.products ? '▲' : '▼' }}</span>
          </button>
          <ul v-show="activeMenus.products" class="pl-4 mt-2 space-y-2">
            <li>
              <router-link to="/admin/products"
                class="block py-2 px-4 rounded-md hover:bg-orange-100 text-gray-700"
                :class="{ 'bg-orange-200 font-bold': isActive('/admin/products') }">
                產品列表
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 訂單管理 -->
        <div>
          <button @click="toggleMenu('orders')"
                  class="flex justify-between items-center w-full py-3 px-2 text-gray-800 hover:bg-gray-100 rounded-md font-semibold">
            訂單管理
            <span>{{ activeMenus.orders ? '▲' : '▼' }}</span>
          </button>
          <ul v-show="activeMenus.orders" class="pl-4 mt-2 space-y-2">
            <li>
              <router-link to="/admin/orders"
                class="block py-2 px-4 rounded-md hover:bg-orange-100 text-gray-700"
                :class="{ 'bg-orange-200 font-bold': isActive('/admin/orders') }">
                訂單列表
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 用戶管理 -->
        <div>
          <button @click="toggleMenu('users')"
                  class="flex justify-between items-center w-full py-3 px-2 text-gray-800 hover:bg-gray-100 rounded-md font-semibold">
            用戶管理
            <span>{{ activeMenus.users ? '▲' : '▼' }}</span>
          </button>
          <ul v-show="activeMenus.users" class="pl-4 mt-2 space-y-2">
            <li>
              <router-link to="/admin/users/admins"
                class="block py-2 px-4 rounded-md hover:bg-orange-100 text-gray-700"
                :class="{ 'bg-orange-200 font-bold': isActive('/admin/users/admins') }">
                管理員列表
              </router-link>
            </li>
            <li>
              <router-link to="/admin/users/members"
                class="block py-2 px-4 rounded-md hover:bg-orange-100 text-gray-700"
                :class="{ 'bg-orange-200 font-bold': isActive('/admin/users/members') }">
                會員列表
              </router-link>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="w-full md:w-3/4 bg-white  rounded-xl shadow-md min-h-[600px]">
        <router-view/>
      </div>
    </div>
  </div>
</template>
