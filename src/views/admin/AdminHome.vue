<script>
import { useAdminProductStore } from '../../stores/adminProductStore'

export default{
  
    computed:{
        adminProductStore(){
            return useAdminProductStore()
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
   <!-- 新增/編輯/刪除視窗開的true，隱藏overflow-hidden -->
    <div :class="{ 'overflow-hidden': adminProductStore.isModalOpen }"  class="w-full 2xl:w-3/4 2xl:m-auto ">
      <!-- Layout -->
      <div class="flex flex-col md:flex-row justify-between">
        <!-- Sidebar -->
        <div class="hidden md:block w-full md:w-44">
          <ul class="bg-white border border-gray-200 rounded-md divide-y divide-gray-200 ">
            <li class="bg-orange-500">
              <!-- <router-link
                to="/admin/adminhome"
                class="block px-4 py-2 text-lg "
              >
           
                後台首頁
              </router-link> -->
            </li>
            <li class="bg-orange-500">
              <router-link
                to="/admin/adminhome/adminproductsmanagement"
                class="block px-4 py-2 text-lg"
              >
                產品管理 ({{ adminProductStore.totalProductCount }})
              </router-link>
            </li>
            <li class="bg-orange-500">
              <router-link
                to="/admin/adminhome/adminordersmanagement"
                class="block px-4 py-2 text-lg"
              >
                訂單管理
              </router-link>
            </li>
            <li>
              用戶管理
            </li>
            
          </ul>
        </div>
  
        <!-- Main Content -->
        <div class="w-full md:w-3/4">
          <router-view/>
        </div>
      </div>
    </div>
</template>
  