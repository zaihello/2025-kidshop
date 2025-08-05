<!-- 首頁路由包裝容器 -->
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
}
</script>

<template>
   <!-- 新增/編輯/刪除視窗開的true，隱藏overflow-hidden -->
    <div :class="{ 'overflow-hidden': adminProductStore.isModalOpen }"  class="w-full 2xl:w-3/4 2xl:m-auto">
      <!-- Main Content -->
      <router-view/>
    </div>
</template>
  