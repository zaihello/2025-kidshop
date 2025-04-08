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

export default {
  components: {Card,Pagination,CategorySwiper,Breadcrumb},
  data(){
    return{
      isMenuOpen: false, // 控制導航列開關
    }
  },
  methods:{
    //切換漢堡選單開關 //本組件
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
    },
    //關閉漢堡選單開關 //本組件  
    closeMenu() {
      this.isMenuOpen = false;
    },
    //分頁組件在使用
    handlePageChange(pageNumber) {
      // 更新路由參數和 store
      this.$router.push({
        name:'Shop',
        // path: this.$route.path,
        query: { ...this.$route.query, page: pageNumber },
      });
      this.productStore.setPage(pageNumber); // 通知 store
      // this.updatePrices(); // 在分頁切換時更新價格 add
    },
   
  

    // 1.更新分類並導航
    updateCategoryAndNavigate(category) {
      // 將分類參數設置為小寫
      const categoryParam = category.toLowerCase();

      // 更新路由參數
      this.$router.push({
        // path: this.$route.path,
        name: 'Shop',
        query: { ...this.$route.query, category: categoryParam, page: 1 },
      });

      // 更新 Store 中的分類狀態
     this.productStore.updateCategory(category);
    },
   
     // 2.用於導航到特定分類
    navigateToCategory(category) {
      this.updateCategoryAndNavigate(category);
    },
    // 3.回到 "全部商品"
    showAllProducts() {
      this.updateCategoryAndNavigate('All');
    },
    //設置麵包屑數據 
    setupBreadcrumb() {
      this.breadcrumbItems = [
        { label: '全部商品', action: this.showAllProducts },
        this.currentCategory !== '全部商品' ? { label: this.currentCategoryLabel } : null, // 如果當前類別不是「全部商品」，  顯示第二項
      ].filter(Boolean); // 過濾掉 null 值
    },
    // 先登入，才能切換追蹤不追蹤的圖片  添加或移除商品到追踪清单 原本
    // toggleWishlistHandler(product) {
    //   // 判斷是否已登錄
    //   if (!this.authStore.isLoggedIn) {
    //     alert('請先登入以操作追蹤清單');
    //     this.$router.push('/login'); // 導向登錄頁
    //     return;
    //   }

    //   // 調用 `wishlistStore` 中的 `toggleWishlist` 方法
    //   this.wishlistStore.toggleWishlist(product);
    // },
    //add
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
    
    //商品列表的購物車按鈕
    toggleCart(product) {
      // 判斷是否已登錄
      if (!this.authStore.isLoggedIn) {
        alert('請先登入以加入購物車');
        this.$router.push('/login'); // 導向登錄頁
        return;
      }
      //this.cartStore.toggleCart(product, this.authStore.userId, this.authStore.token);
      // this.cartStore.toggleCart(product, this.authStore.id, this.authStore.token);
      this.cartStore.toggleCart(product)
      console.log('User ID:', this.authStore.id);
      console.log('Token:', this.authStore.token);

      console.log('Toggle Cart called for product:', product);//有
    },
    isInWishlist(productId) {
      return this.wishlistStore.isInWishlist(productId);
    },
   

    
  },
    // 加載產品並批量更新折購後的價格儲存進api裡
    // async updatePrices() {
    //   try {
    //       await this.productStore.getProducts(); // 加載所有產品
    //       // await this.productStore.updateAllProductPrices(); // 更新所有價格
    //       console.log('所有價格更新完成！');
    //   } catch (error) {
    //       console.error('更新價格過程中出現錯誤:', error);
    //   } finally {
    //   }
    // },
    // updateAllProductPrices(){
    //   return this.productStore.updateAllProductPrices()
    // },
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

    // 滾動 //本組件
    menuClass() {
      return this.isMenuOpen ? "translate-x-0" : "-translate-x-full";
    },
    // 當前分頁的商品清單
    paginatedProducts() {
      
      return this.productStore.paginatedProducts;
    },
   
    // 過濾符合篩選條件的商品(好像可刪)(2/20)
    // filteredProducts(){
    //   return this.productStore.filteredProducts;
    // },
    // 計算顏色數量
    // colorCounts(){
    //   return this.productStore.colorCounts;
    // },
    // 計算尺寸數量
    sizeCounts(){
      return this.productStore.sizeCounts;
    },
    //state的filter物件
    filter() {
      return this.productStore.filter ;
    },
    //(麵包屑)
    currentCategory() {
      return this.productStore.filter?.category || '全部商品';
    },
    // 當前分類標籤(麵包屑)
    currentCategoryLabel() {
      return this.currentCategory;
    },
    //計算麵包屑
    breadcrumbItems() {
      return [
        { label: '全部商品', action: this.showAllProducts },
        this.currentCategory !== '全部商品' ? { label: this.currentCategoryLabel } :  null,// 顯示當前分類
      ].filter(Boolean);// 過濾掉 null 值
    },
    // , 'markBackgroundColor'
    // ...mapState(useProductStore, ['colorClass']),
    //data的currentPage
    currentPage() {
      return this.productStore.currentPage;
    },
    //總頁數
    totalPages() {
      return this.productStore.totalPages;
    },
   
    // totalPages() {
    //   return Math.ceil(this.adminProducts.length / this.itemsPerPage);
    // },
    //检查商品是否在追踪清单中  切換追蹤不追蹤的圖片
    // isInWishlist() {
    //   return (productId) => this.wishlistStore.isInWishlist(productId);
    // },
     // 計算某個商品是否在購物車中
    // isInCart(){
    //   return this.cartStore.isInCart
    // },
    //使用 computed 來監聽 adminProducts
    //3/28可刪
    adminProducts() {
        return this.adminProductStore.adminProducts; 
    },
    // isInWishlist() {
    //   return (productId) =>
    //     this.wishlistStore.wishlist.some((item) => item.product_Id === productId);
    // },
    //  isInWishlist(productId) {
    //   return this.wishlistStore.isInWishlist(productId);
    // },


  },
  watch:{
    // 監聽 query 中的所有參數(類別、頁碼)變化
    '$route.query': {
      immediate: true, // 初始化時觸發
      handler(newQuery) {
        this.productStore.syncRouteParams(this.$route);
      },
    },
  
    // 當分類改變時更新麵包屑
    'productStore.filter.category': {
      immediate: true,
      handler() {
        this.setupBreadcrumb();
      },
    },

  },
  mounted() {
    this.productStore.syncRouteParams(this.$route);//初始化狀態（類別與頁碼）
    // this.productStore.getProducts();//載入商品324
    this.setupBreadcrumb()//初始化麵包屑add
    this.adminProductStore.getAdminProducts()
    this.adminProductStore.getProducts()//324
    // this.productStore.updateProductPrice(product)
    // 在組件加載時初始化願望清單
    // this.productStore.updateAllProductsPrice(this.products)
    // this.updateAllProductPrices() // 加載產品並批量更新折購後的價格儲存進api裡
    // this.updatePrices() // 加載產品並批量更新折購後的價格儲存進api裡
  },
  
 
}
</script>

<template>
  <h1>ProductList.vue</h1>
    <!-- 頭:版型寬度 -->
    <div class="w-full 2xl:w-3/4 2xl:m-auto">
      <CategorySwiper/>
    </div>
    <!-- 小螢幕Breadcrumb -->
    <div class="lg:hidden">
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
                class="text-gray-500 p-4 rounded-full "
                >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button> 
            
            <!-- 價格排序 -->
            <select v-model="productStore.priceSortOrder" class="p-2 rounded-md border border-gray-300">
                <option value="">價格排序</option>
                <option value="lowToHigh">價格從低到高</option>
                <option value="highToLow">價格從高到低</option>
            </select>
        </div>
    </div>

    <div class="w-full 2xl:w-3/4 2xl:m-auto flex justify-between">
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
                    v-model="filter.searchText"
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
                  <input type="number" v-model.number="filter.price.min" placeholder="最低價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                  <input type="number" v-model.number="filter.price.max" placeholder="最高價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
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
                      <!-- 顏色圓形 colorClass(color.name)原本-->
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
                    v-model="filter.searchText"
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
                  <input type="number"  v-model.number="filter.price.min" placeholder="最低價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                  <input type="number"  v-model.number="filter.price.max" placeholder="最高價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
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
                       <!-- :class="colorClass(color.name)" -->
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
              <!-- <Breadcrumb
                :homeLink="'/'"
                :breadcrumbs="breadcrumbItems"
                :currentCategory="currentCategory"
              /> -->
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
        <div  class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
           <!-- @toggle-wishlist="toggleWishlistHandler" -->
           <!-- 这里使用了箭头函数 (product) => toggleWishlistHandler(product)，目的是将子组件 @toggle-wishlist 的参数传递到父组件的 toggleWishlistHandler 方法中。 -->
          <!-- @toggle-wishlist="(product) => toggleWishlistHandler(product)" -->
           <!-- :toggle-wishlist-handler="toggleWishlistHandler" 原本 -->
            <!-- product.id -->
          <!-- cartStore.isInCart(product.id) 是一個函數執行的結果，返回布林值 -->
          <!-- :key="product.id" -->
          <!-- key="product-${product.id}" 可防止 Vue 誤判，確保正確銷毀舊組件並重新渲染新組件！ -->
          <!-- 原版 -->
          <!-- <Card
            v-for="product in paginatedProducts"
            :key="`product-${product.id}`"
            :product="product"
            :is-in-wishlist="isInWishlist(product.id)"
           
            :handle-wishlist-click="handleWishlistClick"
          /> -->
          <Card
            v-for="product in paginatedProducts"
            :key="product.name"
            :product="product"
            :is-in-wishlist="isInWishlist(product.id)"
           
            :handle-wishlist-click="handleWishlistClick"
          />
          <!-- :is-in-cart="cartStore.isInCart(product.id)"
          @togglecart="toggleCart" -->
          <!--  :is-in-wishlist="product.isWishlist" -->
        </div> 
        <!-- Pagination Controls -->
        <!-- @pageChange="setPage" -->
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @pageChange="handlePageChange"
          class="my-10"
        />
      </div>
    </div>
</template>
  