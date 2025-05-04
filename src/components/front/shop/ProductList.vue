<script>
import { useProductStore } from '../../../stores/productStore'
import { useAdminProductStore } from '../../../stores/adminProductStore'
import { useWishlistStore } from '../../../stores/wishlistStore'
import { useAuthStore } from '../../../stores/authStore';
import { useCartStore } from '../../../stores/cartStore'

import CategorySwiper from '../../swiper/CategorySwiper.vue'
import Breadcrumb from './Breadcrumb.vue'
import Card from '../Card.vue'
import Pagination from './Pagination.vue'
import AddcartModal from '../../../components/AddcartModal.vue'

export default {
  components: {Card,Pagination,CategorySwiper,Breadcrumb,AddcartModal},
  data(){
    return{
      isMenuOpen: false, // 控制導航列開關
      isModalOpen: false,//加入購物車的視窗開關追蹤
      selectedProduct: null,//加入購物車的視窗 選擇的產品
    }
  },
  methods:{
    //切換漢堡選單開關
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    //關閉漢堡選單開關
    closeMenu() {
      this.isMenuOpen = false;
    },
    //分頁組件在使用
    handlePageChange(pageNumber) {
      // 更新路由參數和 store
      this.$router.push({
        name:'Shop',
        query: { ...this.$route.query, page: pageNumber },
      });
      this.productStore.setPage(pageNumber); // 通知 store
    },
    // 1.更新分類並導航 https://example.com/shop?category=Clothing&page=1
    updateCategoryAndNavigate(category) {
      
      const categoryParam = category

      // 更新路由參數
      this.$router.push({
        name: 'Shop',
        query: { ...this.$route.query, category: categoryParam, page: 1 },
      });

      // 更新 Store 中的分類狀態
     this.productStore.updateCategory(category);
    },
    // 2.設定 "全部商品" 分類為All
    showAllProducts() {
      this.updateCategoryAndNavigate('All');
    },
    // 商品列表先登入，才能切換追蹤不追蹤的圖片  添加或移除商品到追踪清单
    handleWishlistClick(product) {
      // 判斷是否已登錄
      if (!this.authStore.isLoggedIn) {
        alert('請先登入以操作追蹤清單');
        this.$router.push('/login'); // 導向登錄頁
        return;
      }
      // 調用 `wishlistStore` 中的 `toggleWishlist` 方法
      this.wishlistStore.toggleWishlist(product);
    },
   
      // 商品列表的購物車按鈕
    handleCartListClick(product) {
      // 判斷是否已登錄
      if (!this.authStore.isLoggedIn) {
        alert('請先登入以加入購物車');
        this.$router.push('/login'); // 導向登錄頁
        return;
      }
      this.selectedProduct = product;// 設定商品
      this.isModalOpen = true;// 開啟 Modal（但其實只靠 selectedProduct 就夠了）
      
    },
    //關閉加入購物車視窗(商品列表頁)
    closeModal() {
      this.isModalOpen = false;
      this.selectedProduct = null;
    },  
  },
  computed: {
    // 動態獲取 store 實例
    productStore() {
      return useProductStore();
    },
    wishlistStore(){
      return useWishlistStore() 
    },
    authStore(){
      return useAuthStore() 
    },
    cartStore(){
      return useCartStore()
    },
    adminProductStore(){
      return useAdminProductStore()
    },
    // 控制側邊欄的開合動畫位移 translate-x
    menuClass() {
      return this.isMenuOpen ? "translate-x-0" : "-translate-x-full";
    },
    //(麵包屑)
    currentCategory() {
      return this.productStore.filter?.category || '全部商品';
    },
    //計算麵包屑(點選分類切換內容)
    breadcrumbItems() {
      return [
        { label: '全部商品', action: this.showAllProducts },
        // label: this.currentCategoryLabel
        this.currentCategory !== '全部商品' ? { label: this.currentCategory } :  null,// 顯示當前分類
      ].filter(Boolean);// 過濾掉 null 值
    },
   
    // 傳進Pagination
    currentPage() {
      return this.productStore.currentPage;
    },
    //總頁數 傳進Pagination
    totalPages() {
      return this.productStore.totalPages;
    },
  },
  watch:{
    // 監聽 query 中的所有參數(類別、頁碼)變化
    '$route.query': {
      immediate: true, // 初始化時觸發
      handler(newQuery) {
        this.productStore.syncRouteParams(this.$route);
      },
    },

  },
  mounted() {
    this.productStore.syncRouteParams(this.$route);//初始化狀態（類別與頁碼）
    this.adminProductStore.getProducts()// 取得前台商品資料
  },

}
</script>

<template>
<div class="2xl:w-3/4 2xl:m-auto py-20">
    <!-- 頭:版型寬度 -->
    <div class="pb-6">
      <CategorySwiper/>
    </div>
    <!-- 小螢幕Breadcrumb -->
    <div class="lg:hidden px-2 pb-4">
        <!-- 麵包屑 -->
        <nav class="text-gray-600" aria-label="breadcrumb">
            <ol class="list-reset flex">
                <Breadcrumb
                  :homeLink="'/'"
                  :breadcrumbs="breadcrumbItems"
                />
            </ol>
        </nav>
        <div class="flex justify-between items-center">  
            <!-- 漢堡選單 -->
            <button 
                @click="toggleMenu" 
                class="text-gray-500 rounded-full "
                >
                <span class="material-icons">menu</span>
            </button> 
            
            <!-- 價格排序 -->
            <select v-model="productStore.priceSortOrder" class="p-2 rounded-md border border-gray-300">
                <option value="">價格排序</option>
                <option value="lowToHigh">價格從低到高</option>
                <option value="highToLow">價格從高到低</option>
            </select>
        </div>
    </div>

    <div class="flex justify-between">
      <!-- 左側邊欄 -->
      <div>
        <!-- 小螢幕專用區 -->
        <div>
          <!-- 遮罩層 -->
          <div 
            v-if="isMenuOpen" 
            class="fixed inset-0 bg-black bg-opacity-50 z-40" 
            @click="closeMenu">
          </div>
  
          <!-- 側邊欄 -->
          <div 
            :class="menuClass" 
            class="fixed top-0 left-0 h-screen w-80 bg-white shadow-lg z-50 overflow-y-auto transition-transform duration-500">
            <!-- 關閉按鈕 -->
            <button @click="closeMenu" class="absolute top-4 right-4 text-gray-800">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                class="w-6 h-6">
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
  
            <!-- 篩選內容 -->
            <div class="p-6">
              <!-- 搜尋商品 -->
              <div class="mb-6">
                <h4 class="text-md font-semibold text-gray-700">搜尋商品</h4>
                <div class="relative mt-4">
                  <img class="absolute left-4 top-3" src="/search.svg">
                  <input 
                    v-model="productStore.filter.searchText"
                    class="border rounded-md py-2 pl-11 pr-4 outline-none focus:border-gray-400 w-full" 
                    type="text" 
                    placeholder="請輸入要搜尋的東西">
                </div>
              </div>
  
              <hr class="my-6">
  
              <!-- Filter by Price -->
              <div class="mb-6">
                <h4 class="text-md font-semibold text-gray-700">價格篩選</h4>
                <div class="mt-4 flex flex-col gap-4">
                  <input type="number" v-model.number="productStore.filter.price.min" placeholder="最低價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                  <input type="number" v-model.number="productStore.filter.price.max" placeholder="最高價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                </div>
              </div>
  
              <hr class="my-6">
              <!-- Filter by Color -->
              <div class="mb-6 max-h-48 overflow-y-auto">
                <h4 class="text-lg font-semibold text-gray-800">顏色篩選</h4>
                <ul class="mt-4 space-y-2">
                  <!-- 所有顏色選項 -->
                  <li 
                    class="flex items-center justify-between group relative cursor-pointer"
                    @click="productStore.filter.color = ''">
                    <div class="flex items-center">
                      <!-- 圓形標記可以保持空白 -->
                      <div 
                        class="w-5 h-5 rounded-full mr-3 bg-gray-300 border border-gray-400">
                      </div>
                      <!-- 顏色名稱 -->
                      <span 
                        class="text-gray-700 group-hover:text-black"
                        :class="{ 'font-bold': productStore.filter.color === '' }">
                        所有顏色
                      </span>
                    </div>
                  </li>
                

                   <!-- 動態顏色選項 -->
                  <li 
                    v-for="color in productStore.colorCounts" 
                    :key="color.name"
                    class="flex items-center justify-between group relative cursor-pointer"
                    @click="productStore.filter.color = color.name">
                    <div class="flex items-center">
                      <!-- 顏色圓形-->
                      <div 
                        :class="color.class"
                        class="w-5 h-5 rounded-full mr-3 relative">
                        <div 
                          class="absolute left-0 bottom-[-5px] h-[2px] w-0 bg-black group-hover:w-full transition-all">
                        </div>
                      </div>
                      <!-- 顏色名稱 -->
                      <span 
                        class="text-gray-700 group-hover:text-black"
                        :class="{ 'font-bold': productStore.filter.color === color.name }">
                        {{ color.name }}
                      </span>
                    </div>
                    <!-- 顏色數量 -->
                    <span 
                      class="text-sm border group-hover:bg-blue-500 group-hover:text-white px-4 py-0.5 rounded-3xl">
                      {{ color.count }}
                    </span>
                  </li>  
                </ul>
              </div>
  
              <hr class="my-6">
  
              <!-- Filter by Size -->
              <div>
                <h4 class="text-lg font-semibold text-gray-800">尺寸篩選</h4>
                <ul class="mt-4 space-y-2">
                  <!-- 所有尺寸選項 -->
                  <li 
                    class="flex items-center justify-between group cursor-pointer"
                    @click="productStore.filter.size = ''">
                    <span 
                      class="text-gray-700 group-hover:text-black"
                      :class="{ 'font-bold': productStore.filter.size === '' }">
                      所有尺寸
                    </span>
                  </li>
                   <!-- 動態尺寸選項 -->
                  <li 
                    v-for="size in productStore.sizeCounts" 
                    :key="size.name" 
                    class="flex items-center justify-between group cursor-pointer"
                    @click="productStore.filter.size = size.name">
                    <span 
                      class="text-gray-700 group-hover:text-black"
                      :class="{ 'font-bold': productStore.filter.size === size.name }">
                      {{ size.name }}
                    </span>
                    <span 
                      class="text-sm border group-hover:bg-blue-500 group-hover:text-white px-4 py-0.5 rounded-3xl">
                      {{ size.count }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 大螢幕專用區 -->
        <div class="hidden lg:block">
          <div class="p-6 bg-white rounded-lg shadow">
            <!-- 篩選內容 (與小螢幕一致) -->
            <div>
              <!-- 搜尋商品 -->
              <div class="mb-6">
                <h4 class="text-md font-semibold text-gray-700">搜尋商品</h4>
                <div class="relative mt-4">
                  <img class="absolute left-4 top-3" src="/search.svg">
                  <input 
                    v-model="productStore.filter.searchText"
                    class="border rounded-md py-2 pl-11 pr-4 outline-none focus:border-gray-400 w-full" 
                    type="text" 
                    placeholder="請輸入要搜尋的東西">
                </div>
              </div>
  
              <hr class="my-6">
  
              <!-- Filter by Price -->
              <div class="mb-6">
                <h4 class="text-md font-semibold text-gray-700">價格篩選</h4>
                <div class="mt-4 flex flex-col gap-4">
                  <input type="number"  v-model.number="productStore.filter.price.min" placeholder="最低價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                  <input type="number"  v-model.number="productStore.filter.price.max" placeholder="最高價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                </div>
              </div>
  
              <hr class="my-6">

              <!-- Filter by Color -->
              <div class="mb-6 max-h-48 overflow-y-auto">
                <h4 class="text-lg font-semibold text-gray-800">顏色篩選</h4>
                <ul class="mt-4 space-y-2">
                  <!-- 所有顏色選項 -->
                  <li 
                    class="flex items-center justify-between group relative cursor-pointer"
                    @click="productStore.filter.color = ''">
                    <div class="flex items-center">
                      <!-- 圓形標記可以保持空白 -->
                      <div 
                        class="w-5 h-5 rounded-full mr-3 bg-gray-300 border border-gray-400">
                      </div>
                      <!-- 顏色名稱 -->
                      <span 
                        class="text-gray-700 group-hover:text-black"
                        :class="{ 'font-bold': productStore.filter.color === '' }">
                        所有顏色
                      </span>
                    </div>
                  </li>
                  <!-- 動態顏色選項 -->
                  <li 
                    v-for="color in productStore.colorCounts" 
                    :key="color.name"
                    class="flex items-center justify-between group relative cursor-pointer"
                    @click="productStore.filter.color = color.name">
                    <div class="flex items-center">
                      <!-- 顏色圓形 -->
                      <div 
                        :class="color.class"
                        class="w-5 h-5 rounded-full mr-3 relative">
                        <div 
                          class="absolute left-0 bottom-[-5px] h-[2px] w-0 bg-black group-hover:w-full transition-all">
                        </div>
                      </div>
                      <!-- 顏色名稱 -->
                      <span 
                        class="text-gray-700 group-hover:text-black"
                        :class="{ 'font-bold': productStore.filter.color === color.name }">
                        {{ color.name }}
                      </span>
                    </div>
                    <!-- 顏色數量 -->
                    <span 
                      class="text-sm border group-hover:bg-blue-500 group-hover:text-white px-4 py-0.5 rounded-3xl">
                      {{ color.count }}
                    </span>
                  </li>
                </ul>
              </div> 
  
              <hr class="my-6">

              <!-- Filter by Size -->
              <div>
                <h4 class="text-lg font-semibold text-gray-800">尺寸篩選</h4>
                <ul class="mt-4 space-y-2">
                  <!-- 所有尺寸選項 -->
                  <li 
                    class="flex items-center justify-between group cursor-pointer"
                    @click="productStore.filter.size = ''">
                    <span 
                      class="text-gray-700 group-hover:text-black"
                      :class="{ 'font-bold': productStore.filter.size === '' }">
                      所有尺寸
                    </span>
                  </li>
                  <!-- 動態尺寸選項 -->
                  <li 
                    v-for="size in productStore.sizeCounts" 
                    :key="size.name" 
                    class="flex items-center justify-between group cursor-pointer"
                    @click="productStore.filter.size = size.name">
                    <span 
                      class="text-gray-700 group-hover:text-black"
                      :class="{ 'font-bold': productStore.filter.size === size.name }">
                      {{ size.name }}
                    </span>
                    <span 
                      class="text-sm border group-hover:bg-blue-500 group-hover:text-white px-4 py-0.5 rounded-3xl">
                      {{ size.count }}
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
  
      <!-- 右側邊欄 -->
      <div class="w-full lg:w-3/4">
        <!-- 大螢幕Breadcrumb -->
        <div class="lg:flex lg:justify-between lg:items-center mb-8 hidden lg:block">
          <!-- 大螢幕Breadcrumb -->
          <nav class="text-gray-600" aria-label="breadcrumb">
            <ol class="list-reset flex">
              <Breadcrumb 
                :homeLink="'/'"
                :breadcrumbs="breadcrumbItems"
              />
            </ol>
          </nav>
  
          <!-- 價格排序 -->
          <select v-model="productStore.priceSortOrder" class="p-2 rounded-md border border-gray-300">
            <option value="">價格排序</option>
            <option value="lowToHigh">價格從低到高</option>
            <option value="highToLow">價格從高到低</option>
          </select>
        </div>
  
        <!-- 商品列表 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2 lg:px-0">
         
          <Card
            v-for="(product,index) in productStore.paginatedProducts"
            :key="product.id"
            :product="product"
            :index="index"
            :handle-wishlist-click="handleWishlistClick"
            @open-cart-modal="handleCartListClick"
          />

          <!-- Modal -->
          <AddcartModal
            v-if="selectedProduct"
            :product="selectedProduct"
            @close="closeModal"
          />

        </div> 
        <!-- Pagination Controls -->
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @pageChange="handlePageChange"
          class="my-10"
        />
      </div>
    </div>
</div>    
</template>
  