<script>
</script>

<template>
  <!-- w-full 2xl:w-3/4 2xl:m-auto  mx-auto py-10 lg:py-30-->
    <div class="w-full 2xl:w-3/4 2xl:m-auto">
      <!-- Breadcrumb -->
      <nav class="pb-5 lg:pb-15" aria-label="breadcrumb">
        <ol class="flex space-x-2 text-lg text-gray-500">
          <li>
            <router-link
              to="/"
              exact
              class="hover:text-gray-700"
              active-class="text-gray-900 font-semibold"
            >
              首頁
            </router-link>
          </li>
          <li>
            <span class="text-gray-400">></span>
          </li>
          <li>
            <router-link
              to="/account/wishes"
              exact
              class="hover:text-gray-700"
              active-class="text-gray-900 font-semibold"
            >
              會員中心
            </router-link>
          </li>
          <li>
            <span class="text-gray-400">></span>
          </li>
          <li class="text-gray-900 font-semibold">我的收藏</li>
        </ol>
      </nav>
  
      <!-- Header -->
      <h4 class="border-l-4 border-primary-500 mb-4 hidden md:block">
        <span class="text-lg font-bold pl-3">會員中心</span>
      </h4>
  
      <!-- Layout -->
      <div class="flex flex-col md:flex-row justify-between">
        <!-- Sidebar -->
        <!-- class="hidden md:block w-full md:w-44" -->
        <div class="hidden md:block w-full md:w-44">
          <ul class="bg-white border border-gray-200 rounded-md divide-y divide-gray-200 ">
            <!-- hover:bg-gray-50 -->
            <li class="bg-orange-500">
              <router-link
                to="/account/wishes"
                class="block px-4 py-2 text-lg "
              >
              <!-- flex justify-between items-center -->
                我的收藏
              </router-link>
            </li>
            <li class="bg-orange-500">
              <router-link
                to="/cart"
                class="block px-4 py-2 text-lg"
              >
                我的購物車
              </router-link>
            </li>
            <li class="bg-orange-500">
              <router-link
                to="/account/coupons"
                class="block px-4 py-2 text-lg"
              >
                領取優惠卷
              </router-link>
            </li>

            <li class="bg-orange-500">
              <router-link
                to="/account/orders"
                class="block px-4 py-2 text-lg"
              >
                歷史訂單資料
              </router-link>
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
  
  