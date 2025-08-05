<!-- 此為account 的側邊欄 頁面 -->
<script setup>
import { ref,watch } from 'vue'
import { useRoute } from 'vue-router' 

const route = useRoute()
const breadcrumbTitle = ref('')

const menuData =[
  {title:'我的收藏',path:'/account/wishes'},
  {title:'我的購物車',path:'/cart'},
  {title:'領取優惠卷',path:'/account/coupons'},
  {title:'紅利點數',path:'/account/points'},
  {title:'歷史訂單資料',path:'/account/orders'}

]

// 麵包屑切換
watch(
  () => route.path,
  (path) => {
    const match = menuData.find(item => path.includes(item.path))
    //根據path找到對應的title
    breadcrumbTitle.value = match?.title || ''
  },
  {immediate:true}
)
</script>

<template>
<div class="">
  <div class="w-full 2xl:w-3/4 2xl:m-auto px-4 py-8 ">
    <!-- Breadcrumb -->
    <nav class="pb-5 text-sm md:text-base text-gray-500" >
      <ol class="flex space-x-2 items-center">
        <li><router-link to="/" exact class="hover:text-gray-700" active-class="text-gray-900 font-semibold">首頁</router-link></li>
        <li><span class="text-gray-400">/</span></li>
        <li><router-link to="/account/wishes" exact class="hover:text-gray-700" active-class="text-gray-900 font-semibold">會員中心</router-link></li>
        <li><span class="text-gray-400">/</span></li>
        <li class="text-gray-900 font-semibold">{{ breadcrumbTitle }}</li>
      </ol>
    </nav>

    <!-- Header -->
    <h4 class="border-l-4 border-primary-500 mb-6 pl-3 text-lg font-bold text-gray-800 hidden md:block">會員中心</h4>

    <!-- Mobile Tab Navigation -->
    <div class="block lg:hidden mb-6">
      <nav class="flex justify-around bg-orange-400  border rounded-lg shadow-sm overflow-hidden text-sm font-medium">
          <router-link 
            v-for="item in menuData"
            :key="item.path"
            :to="item.path" 
            class="w-full text-center py-3 hover:bg-orange-300" 
            active-class="bg-orange-700 text-white"
          >
            {{item.title}}
          </router-link>     
      </nav>
    </div>

    <!-- Layout -->
    <div class="flex flex-col md:flex-row gap-10">
      <!-- Sidebar -->
      <div class="hidden lg:block w-1/6">
        <ul class="bg-orange-400 border rounded-xl shadow-md divide-y divide-gray-100">
          <li v-for="(item,index) in menuData" :key=item.path>
            <router-link 
              :to="item.path" 
              class="block px-5 py-3 text-gray-800 hover:bg-orange-300 hover:text-white transition-colors duration-200 text-lg font-medium " 
              :class="{
                'rounded-t-xl':index === 0,
                'rounded-b-xl':index === menuData.length - 1
              }"
              active-class="bg-orange-700 text-white"
            >
              {{ item.title }}
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Main Content -->
      <div class="w-full lg:w-3/4">
        <router-view />
      </div>
    </div>
  </div>
</div>    
</template>

