<!-- 原版 -->
<script setup>
import { ref,watch,onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAdminProductStore } from '../../stores/adminProductStore'
import { useAdminAuthStore } from '../../stores/adminAuthStore'

const adminProductStore = useAdminProductStore()
const adminAuthStore = useAdminAuthStore()
const route = useRoute()

const menuDate = [
  {
    key:'products',
    title:'產品管理',
    children:[
      { key:'products-list',title:'產品列表',path:'/admin/products' },
    ]
  },
  {
    key:'orders',
    title:'訂單管理',
    children:[
      {key:'orders-list',title:'訂單列表',path:'/admin/orders'}
    ]
  },
  {
    key:'users',
    title:'用戶管理',
    children:[
      {key:'admins',title:'管理員列表',path:'/admin/users/admins'},
      {key:'members',title:'會員列表',path:'/admin/users/members'},
    ]
  },
  {
    key:'marketing',
    title:'行銷管理',
    children:[
      {key:'coupons',title:'滿額滿件優惠',path:'/admin/marketing/coupons'},
      {key:'freeshipping',title:'免運費',path:'/admin/marketing/freeshipping'},
    ]
  },
]
// 控制各選單展開/收合狀態
const activeMenus = ref({})

menuDate.forEach(menu => {
  activeMenus.value[menu.key] = false
})
// 切換展開狀態
const toggleMenu = (key) =>{
  activeMenus.value[key] = !activeMenus.value[key]
}
// 判斷路由是否啟用
const isActive = (path) =>{
  return route.path.startsWith(path)
}
// 控制 modal 開啟時禁止滾動
watch(
  () => adminProductStore.isModalOpen,
  (isOpen) => {
    document.body.style.overflow = isOpen ? 'hidden' : ''; // 新增/編輯/刪除視窗開啟時禁止滾動
  }
)
// 初始載入資料
onMounted(() => {
  adminProductStore.getAdminProducts()
})


</script>

<template>
  <div :class="{ 'overflow-hidden': adminProductStore.isModalOpen }" class="w-full 2xl:w-3/4 2xl:m-auto p-6">
    
    <p class="text-xl font-semibold text-gray-700 mb-8">{{ adminAuthStore.adminName }} <span class="text-red-500">登入中</span></p>
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Sidebar -->
      <nav class="w-full md:w-1/4 bg-white border border-gray-300 rounded-xl shadow-sm p-4 space-y-6">
        
        <div v-for="menu in menuDate" :key="menu.key">
          <button 
            @click="toggleMenu(menu.key)" 
            class="flex justify-between items-center w-full py-3 px-2 text-gray-800 hover:bg-gray-100 rounded-md font-semibold">
            {{ menu.title }}
            <span>{{ activeMenus[menu.key] ? '▲' : '▼' }}</span>
          </button>
          <ul v-show="activeMenus[menu.key]" class="pl-4 mt-2 space-y-2">
            <li v-for="item in menu.children" :key="item.path">
              <router-link 
                :to="item.path"
                class="block py-2 px-4 rounded-md hover:bg-orange-100 text-gray-700"
                :class="{ 'bg-orange-200 font-bold': isActive(item.path) }">
                {{ item.title }}
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
