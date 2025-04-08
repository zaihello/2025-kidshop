<script>
import { useAdminProductStore } from '../../stores/adminProductStore'

export default{
    computed:{
        adminProductStore(){
            return useAdminProductStore()
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
      <!-- Layout -->
      <div class="flex flex-col md:flex-row justify-between">
        <!-- Sidebar -->
        <!-- class="hidden md:block w-full md:w-44" -->
        <div class="hidden md:block w-full md:w-44">
          <ul class="bg-white border border-gray-200 rounded-md divide-y divide-gray-200 ">
            <!-- hover:bg-gray-50 -->
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
  