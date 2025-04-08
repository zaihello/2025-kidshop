<!-- 舊版不用 -->
<!-- 用v-for渲染card組件 -->

<script>
 import axios from 'axios'
 import Card from './Card.vue'
 import { useProductStore } from '../../stores/productStore'
 import { useAdminProductStore } from '../../stores/adminProductStore'

 export default{
    components:{Card},
    props:{
        // products:Array,
        // colorClass:Function, 3/17
        markBackgroundColor:Function,
    },
    data(){
        return{
            // 原本
            isMenuOpen: false, // 控制導航列開關
            priceRange: [0, 500], // 預設價格範圍
        // colors: {
        //   Blue: 5,
        //   Brown: 2,
        //   Gray: 2,
        //   Green: 1,
        //   Pink: 3,
        //   Silver: 1,
        //   Yellow:3,
        // },
        sizes: {
          "0 - 3 Months": 5,
          "3 - 6 Months": 3,
          "6 - 12 Months": 2,
        },
            //新增
            priceSortOrder: '', // 儲存價格排序方式
            // products: [],// 獲取商品數據
            currentPage: 1,   // 當前頁碼
            itemsPerPage: 8,  // 每頁顯示的商品數量
            filter: {
                price: { min: null, max: null }, // 價格範圍
                color: '',                      // 顏色
                size: '',                       // 尺寸
                searchText: '',                 // 關鍵字搜尋
                category: '',                    //儲存當前選擇的類別這樣可以與其他過濾條件一起管理。 類別過濾
            },
        }
    },
    methods: {
        //原本  
        applyPriceFilter() {
            alert(`Filtering by price: £${this.priceRange[0]} — £${this.priceRange[1]}`);
        },
        //切換漢堡選單開關
        toggleMenu() {
            this.isMenuOpen = !this.isMenuOpen;
        },
        //關閉漢堡選單開關   
        closeMenu() {
            this.isMenuOpen = false;
        },
        // 獲取商品數據 可刪
        // async getProducts() {
        //     try {
        //         //dev/products
        //         const response = await axios.get('https://204ed3432b06d7af.mokky.dev/product'); 
        //         this.products = response.data.map(product => {
       
        //         // 使用 Array.isArray 檢查 item.size 和 item.color 是否為陣列, 否則設為空陣列
        //         return {
        //             ...product,
        //             // color: 保持為陣列
        //             color: Array.isArray(product.color) ? product.color : [],
        //             // size: 保持為陣列
        //             size: Array.isArray(product.size) ? product.size : [],
        //             // mark:保持為陣列
        //             mark:Array.isArray(product.mark) ? product.mark : [],
        //             price: product.price || null, // 如果沒有 price，設為 null
        //             OriginalPrice: product.OriginalPrice || null, // 如果沒有 salePrice，設為 null
        //         };
        //         });
        //     } catch (error) {
        //         console.error("Error fetching items:", error);
        //     }
        // },
        // 選擇一個新的類別時，需要更新selectCategory
        selectCategory(category) {
            // 更新選擇的類別
            this.filter.category = category;
      
            // 重置篩選條件
            this.filter = {
                price: { min: null, max: null },  // 清空價格範圍
                color: '',                        // 清空顏色篩選
                size: '',                         // 清空尺寸篩選
                searchText: '',                   // 清空關鍵字搜尋
                category: '',
            };

            // 清空價格排序
            this.priceSortOrder = '';

            // 重置頁碼到第 1 頁
            this.currentPage = 1;  
        },
        // 顯示所有商品按鈕的狀態
        showAllProducts() {
            this.navigateToCategory('All');
        },
        //為衣服顏色設定tailwindcss的class 3/17
        // colorClass(color) {
        //     const colorMap = {
        //         'Blue': 'bg-blue-500',
        //         'Brown':'bg-amber-900',
        //         'Gray':'bg-gray-500',
        //         'Green':'bg-green-500',
        //         'Pink':'bg-pink-500',
        //         'Silver':'bg-neutral-400',
        //         'Yellow':'bg-yellow-500',
        
        //     };
        //     return colorMap[color] || 'bg-gray-200';//未知的顏色名稱，將顯示為灰色
        // },
        // 為mark顏色設定tailwindcss的class
        markBackgroundColor(markitem) {
            // 定義背景顏色對應表
            const colorMap = {
                'HOT': 'bg-pink-300',
                'NEW': 'bg-green-300',
            };

            // 使用正則檢查是否是百分比類型
            const isPercentage = /^-\d+%$/.test(markitem);
            console.log("isPercentage:", isPercentage); // 檢查是否符合百分比條件

            // 如果是百分比類型，返回藍色
            if (isPercentage) {
                console.log("Returning: bg-blue-300");
            return 'bg-blue-300';
            }

            // 返回對應顏色，如果沒有匹配的值，設置為灰色
            return colorMap[markitem] || 'bg-gray-300';
        },
 
        // 切換類別時更新網址參數
        navigateToCategory(category) {
            // 更新路由參數
            this.$router.push({
                path: this.$route.path,
                query: { ...this.$route.query, category: category.toLowerCase(), page: 1 }
            });

            // 僅更新類別篩選條件
            this.filter.category = category;

            // 重置頁碼到第 1 頁
            this.currentPage = 1;  
        },
    
        // 分頁切換
        goToPage(pageNumber) {
            // 更新當前頁碼
            this.currentPage = pageNumber;

            // 更新網址中的 page 參數
            this.$router.push({
                path: "/categoryitems_7",
                query: {
                    ...this.$route.query, // 保留現有查詢參數（例如 category）
                    page: pageNumber,
                },
            });
        },
       

    },
    computed: {
      productStore(){
        return useProductStore()
      },
      adminProductStore(){
        return useAdminProductStore()
      },
        // 滾動
        menuClass() {
            return this.isMenuOpen ? "translate-x-0" : "-translate-x-full";
        },
            // 過濾符合篩選條件的商品3/17
        // filteredProducts() {
        //     let filtered = this.products.filter((item) => {
       
        //     // 類別篩選：當 filter.category 為空時，顯示所有商品
        //     const isCategoryMatch = this.filter.category === 'All' || item.category === this.filter.category;

        //     // 價格範圍
        //     const inPriceRange = (!this.filter.price.min || item.price >= this.filter.price.min) &&
        //                  (!this.filter.price.max || item.price <= this.filter.price.max);

        //     // 顏色篩選
        //     const matchesColor = !this.filter.color || item.color.includes(this.filter.color);

        //     // 尺寸篩選
        //     const matchesSize = !this.filter.size || item.size.includes(this.filter.size);

        //     // 關鍵字篩選
        //     const matchesSearch = !this.filter.searchText || 
        //                   item.name.toLowerCase().includes(this.filter.searchText.toLowerCase());

        //     // 總篩選條件
        //     return isCategoryMatch && inPriceRange && matchesColor && matchesSize && matchesSearch;
        //     });

        //     // 價格排序
        //     if (this.priceSortOrder === 'lowToHigh') {
        //         return filtered.sort((a, b) => a.price - b.price);
        //     } else if (this.priceSortOrder === 'highToLow') {
        //         return filtered.sort((a, b) => b.price - a.price);
        //     }
        //     return filtered;
        // },
        // 當前分頁的商品清單
        paginatedProducts() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredProducts.slice(start, end);
        },
        // 總頁數
        totalPages() {
            return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        },
        // 計算顏色數量
        // colorCounts() {
        //     const colorMap = {};//物件
        //     this.filteredProducts.forEach((product) => {
        //         product.color.forEach((color) => {
        //         if (color) {
        //             colorMap[color] = (colorMap[color] || 0) + 1;
        //         }
        //         });
        //     });
        //     // 將物件轉換為(map)陣列
        //     return Object.keys(colorMap).map((color) => ({
        //         name: color,
        //         count: colorMap[color],
        //     }));
        // },
        // 計算尺寸數量
        sizeCounts() {
            const sizeMap = {};
            this.filteredProducts.forEach((product) => {
                product.size.forEach((size) => {
                if (size) {
                    sizeMap[size] = (sizeMap[size] || 0) + 1;
                }
                });
            });

            return Object.keys(sizeMap).map((size) => ({
                name: size,
                count: sizeMap[size],
            }));
        },
        // 計算每個類別的商品數量
        categoryCounts() {
            const categoryMap = {};
            // this
            this.products.forEach((product) => {
                const category = product.category || 'Uncategorized'; // 若沒有類別，顯示為 'Uncategorized'
                categoryMap[category] = (categoryMap[category] || 0) + 1;
            });

            return Object.keys(categoryMap).map((category) => ({
                name: category,
                count: categoryMap[category],
            }));
        },

    },
    // 修正 mounted 和 watch 內的路由同步
    // 當用戶進入該頁面或切換類別時，應確保 selectedCategory 與路由的 category 參數同步。
    mounted() {
        const categoryName = this.$route.query.category || 'all';
        const pageNumber = parseInt(this.$route.query.page, 10) || 1;

        this.filter.category = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        this.currentPage = pageNumber;
        this.getProducts();
    },
    watch: {
        // 若用戶從一個類別切換到另一個類別，需要使用 watch 監控 query：
        '$route.query.category': {
            immediate: true,// 在監控初始化時觸發
            handler(newCategory) {
                this.filter.category = newCategory
                ? newCategory.charAt(0).toUpperCase() + newCategory.slice(1)
                : 'All';
            }
        },
        //在 URL 發生變化時，更新頁碼。
        // 監聽 query 中的 page 參數變化
        '$route.query.page': {
            immediate: true,
            handler(newPage) {
                this.currentPage = parseInt(newPage, 10) || 1;
            },
        },
    },

}
</script>

<template>
               <h1>cardlist.vue</h1>

    <!-- 小螢幕Breadcrumb -->
    <div class="lg:hidden">
        <!-- 麵包屑 -->
        <nav class="text-gray-600" aria-label="breadcrumb">
            <ol class="list-reset flex">
                <!-- Home Link -->
                <li>
                <router-link to="/" class="text-blue-500 hover:underline">Home</router-link>
                </li>
  
                <!-- All Products Link -->
                <li class="mx-2">/</li>
                <li>
                <!-- 呼叫父組件的 showAllProducts 方法，而不是轉跳頁面 -->
                    <a @click.prevent="showAllProducts" href="#" class="text-blue-500 hover:underline">全部商品</a>
                </li>
  
                <!-- Category Link -->
                <li v-if="selectedCategory" class="mx-2">/</li>
                <li v-if="selectedCategory" class="text-gray-700 font-medium">
                {{ selectedCategory }}
                </li>
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
            <select v-model="priceSortOrder" class="p-2 rounded-md border border-gray-300">
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
                  <input type="number" placeholder="最低價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                  <input type="number" placeholder="最高價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                </div>
              </div>
  
              <hr class="my-6">
  
              <!-- Filter by Color 原本-->
              <div class="mb-6 max-h-48 overflow-y-auto">
                <h4 class="text-lg font-semibold text-gray-800">顏色篩選</h4>
                <ul class="mt-4 space-y-2">
                  <li 
                    v-for="(count, color) in colors" 
                    :key="color" 
                    class="flex items-center justify-between group relative">
                    <div class="flex items-center">
                      <!-- 顏色圓形 -->
                      <div 
                        :style="{ backgroundColor: color }" 
                        class="w-5 h-5 rounded-full mr-3 relative">
                        <div 
                          class="absolute left-0 bottom-[-5px] h-[2px] w-0 bg-black group-hover:w-full transition-all">
                        </div>
                      </div>
                      <!-- 顏色名稱 -->
                      <span class="text-gray-700 group-hover:text-black">{{ color}}</span>
                    </div>
                    <!-- 顏色商品數量 -->
                    <span 
                      class="text-sm border group-hover:bg-blue-500 group-hover:text-white px-4 py-0.5 rounded-3xl">
                      {{ count }}
                    </span>
                  </li>
                </ul>
              </div>
              <!-- Filter by Color -->
              <div class="mb-6 max-h-48 overflow-y-auto">
                <h4 class="text-lg font-semibold text-gray-800">顏色篩選</h4>
                <ul class="mt-4 space-y-2">
                  <li 
                    v-for="color in productStore.colorCounts" 
                    :key="color.name" 
                    class="flex items-center justify-between group relative">
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
                      <span class="text-gray-700 group-hover:text-black">{{ color.name}}</span>
                    </div>
                    <!-- 顏色商品數量 -->
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
                  <li 
                    v-for="(count, size) in sizes" 
                    :key="size" 
                    class="flex items-center justify-between group">
                    <span class="text-gray-700 group-hover:text-black">{{ size }}</span>
                    <span 
                      class="text-sm border group-hover:bg-blue-500 group-hover:text-white px-4 py-0.5 rounded-3xl">
                      {{ count }}
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
                    class="border rounded-md py-2 pl-11 pr-4 outline-none focus:border-gray-400 w-full" 
                    type="text" 
                    placeholder="請輸入要搜尋的東西">
                </div>
              </div>
  
              <hr class="my-6">
  
              <!-- Filter by Price -->
              <div class="mb-6">
                <h4 class="text-md font-semibold text-gray-700">價格篩選
                </h4>
                <div class="mt-4 flex flex-col gap-4">
                  <input type="number" placeholder="最低價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                  <input type="number" placeholder="最高價" class="border rounded-md py-2 px-4 outline-none focus:border-gray-400 w-full">
                </div>
              </div>
  
              <hr class="my-6">
  
              <!-- Filter by Color -->
              <div class="mb-6 max-h-48 overflow-y-auto">
                <h4 class="text-lg font-semibold text-gray-800">顏色篩選</h4>
                <ul class="mt-4 space-y-2">
                  <li 
                    v-for="(count, color) in colors" 
                    :key="color" 
                    class="flex items-center justify-between group relative">
                    <div class="flex items-center">
                      <!-- 顏色圓形 -->
                      <div 
                        :style="{ backgroundColor: color }" 
                        class="w-5 h-5 rounded-full mr-3 relative">
                        <div 
                          class="absolute left-0 bottom-[-5px] h-[2px] w-0 bg-black group-hover:w-full transition-all">
                        </div>
                      </div>
                      <!-- 顏色名稱 -->
                      <span class="text-gray-700 group-hover:text-black">{{ color }}</span>
                    </div>
                    <!-- 右側數字 -->
                    <span 
                      class="text-sm border group-hover:bg-blue-500 group-hover:text-white px-4 py-0.5 rounded-3xl">
                      {{ count }}
                    </span>
                  </li>
                </ul>
              </div>
  
              <hr class="my-6">
  
              <!-- Filter by Size -->
              <div>
                <h4 class="text-lg font-semibold text-gray-800">尺寸篩選</h4>
                <ul class="mt-4 space-y-2">
                  <li 
                    v-for="(count, size) in sizes" 
                    :key="size" 
                    class="flex items-center justify-between group">
                    <span class="text-gray-700 group-hover:text-black">{{ size }}</span>
                    <span 
                      class="text-sm border group-hover:bg-blue-500 group-hover:text-white px-4 py-0.5 rounded-3xl">
                      {{ count }}
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
              <li>
                <router-link to="/" class="text-blue-500 hover:underline">Home</router-link>
              </li>
              <li class="mx-2">/</li>
              <li>
                <a @click.prevent="showAllProducts" href="#" class="text-blue-500 hover:underline">全部商品</a>
              </li>
              <li v-if="selectedCategory" class="mx-2">/</li>
              <li v-if="selectedCategory" class="text-gray-700 font-medium">
                {{ selectedCategory }}
              </li>
            </ol>
          </nav>
  
          <!-- 價格排序 -->
          <select v-model="priceSortOrder" class="p-2 rounded-md border border-gray-300">
            <option value="">價格排序</option>
            <option value="lowToHigh">價格從低到高</option>
            <option value="highToLow">價格從高到低</option>
          </select>
        </div>
  
        <!-- 商品列表 -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card
            v-for="product in products"
            :key="product.name"
            :product="product"
            :markBackgroundColor="markBackgroundColor"
          />
          <!-- 原版 -->
          <!-- <Card
            v-for="product in products"
            :key="product.name"
            :product="product"
            :imgurl="product.imgurl"
            :name="product.name"
            :OriginalPrice="product.OriginalPrice"
            :price="product.price"
            :color="product.color"
            :mark="product.mark"
            :colorClass="colorClass"
            :markBackgroundColor="markBackgroundColor"
          /> -->
         
        </div>

        <!-- Pagination Controls -->
        <!-- v-if:只有在有商品時才顯示分頁控制按鈕 -->
        <!-- @click="currentPage--" -->
        <div v-if="filteredProducts.length > 0" class="flex justify-center mt-6 space-x-2">
            <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
            >
                上一頁
            </button>
            <!-- @click="currentPage = page" -->
            <button
                v-for="page in totalPages"
                :key="page"
                @click="goToPage(page)"
                :class="{'bg-gray-400 text-white': currentPage === page}"
                class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            >
                {{ page }}
            </button>
            <!-- @click="currentPage++" -->
            <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
            >
                下一頁
            </button>
        </div>
      </div>
    </div>
</template>
  