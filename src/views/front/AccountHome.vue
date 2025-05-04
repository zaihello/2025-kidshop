<!-- 此為account 的側邊欄 頁面 -->
<script>
export default {
  data(){
    return{
      breadcrumbTitle: ''//變動的
    }
  },
  watch: {
  $route: {
    immediate: true,
    //active 側邊攔 麵包屑變動
    handler(to) {
      const path = to.path
      if (path.includes('/account/wishes')) {
        this.breadcrumbTitle = '我的收藏'
      } else if (path.includes('/cart')) {
        this.breadcrumbTitle = '我的購物車'
      } else if (path.includes('/account/coupons')) {
        this.breadcrumbTitle = '領取優惠券'
      } else if (path.includes('/account/orders')) {
        this.breadcrumbTitle = '歷史訂單資料'
      } else {
        this.breadcrumbTitle = ''
      }
    }
  }
}

}
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
      <nav class="flex justify-around bg-orange-400 border rounded-lg shadow-sm overflow-hidden text-sm font-medium">
        <router-link to="/account/wishes" class="w-full text-center py-3 hover:bg-orange-300" active-class="bg-orange-700 text-white">
          收藏
        </router-link>
        <router-link to="/cart" class="w-full text-center py-3 hover:bg-orange-300" active-class="bg-orange-700 text-white">
          購物車
        </router-link>
        <router-link to="/account/coupons" class="w-full text-center py-3 hover:bg-orange-300" active-class="bg-orange-700 text-white">
          優惠券
        </router-link>
        <router-link to="/account/orders" class="w-full text-center py-3 hover:bg-orange-300" active-class="bg-orange-700 text-white">
          訂單
        </router-link>
      </nav>
    </div>

    <!-- Layout -->
    <div class="flex flex-col md:flex-row gap-10">
      <!-- Sidebar -->
      <div class="hidden lg:block w-1/6">
        <ul class="bg-orange-400 border rounded-xl shadow-md divide-y divide-gray-100">
          <li>
            <router-link to="/account/wishes" class="block px-5 py-3 text-gray-800 hover:bg-orange-300 hover:text-white transition-colors duration-200 text-lg font-medium rounded-t-xl" active-class="bg-orange-700 text-white">
              我的收藏
            </router-link>
          </li>
          <li>
            <router-link to="/cart" class="block px-5 py-3 text-gray-800 hover:bg-orange-300 hover:text-white transition-colors duration-200 text-lg font-medium" active-class="bg-orange-700 text-white">
              我的購物車
            </router-link>
          </li>
          <li>
            <router-link to="/account/coupons" class="block px-5 py-3 text-gray-800 hover:bg-orange-300 hover:text-white transition-colors duration-200 text-lg font-medium" active-class="bg-orange-700 text-white">
              領取優惠券
            </router-link>
          </li>
          <li>
            <router-link to="/account/orders" class="block px-5 py-3 text-gray-800 hover:bg-orange-300 hover:text-white transition-colors duration-200 text-lg font-medium rounded-b-xl" active-class="bg-orange-700 text-white">
              歷史訂單資料
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

