import { defineStore } from 'pinia'
import { useAdminProductStore } from '../stores/adminProductStore'

export const useProductStore = defineStore('productStore', {
  state: () => ({
    
    //搜尋商品的篩選條件
    filter: {
      price: { min: null, max: null },
      color: '',
      size: '',
      searchText: '',
      category: 'All',// 預設顯示所有分類All
    },
   
    // 分頁資訊
    currentPage: 1,// 當前頁碼
    itemsPerPage: 8,// 每頁顯示的商品數量
   
    // 儲存價格排序方式
    priceSortOrder: '',
    //顏色轉為tailwindcss術語
    colorsTailwindcss: {
        Blue: 'bg-blue-500',
        Brown: 'bg-amber-900',
        Gray: 'bg-gray-500',
        Green: 'bg-green-500',
        Pink: 'bg-pink-500',
        Silver: 'bg-neutral-400',
        Yellow: 'bg-yellow-500',
    },
    marks: {
        HOT: 'bg-pink-300',
        NEW: 'bg-green-300',
    },
  }),
    // 邏輯需要處理副作用（如調用外部 API）
  actions: {
    // 在navigateToCategory(category)調用
    updateCategory(category) {
      this.filter.category = category;// 更新分類
      this.currentPage = 1; // 重置頁碼到第 1 頁
    },
    //更新頁碼  分頁組件 
    setPage(pageNumber) {
        this.currentPage = pageNumber;
    },
    //同步路由中的參數(分類、頁碼}
    syncRouteParams(route) {
        const categoryName = route.query.category || 'All';// 預設為 'All'
        const pageNumber = parseInt(route.query.page, 10) || 1;// 預設為第 1 頁
        
        // 更新分类和当前页，將首字母大寫
        this.filter.category = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);// 分类首字母大写
        this.currentPage = pageNumber;
    },
    
     // 計算前台每個類別的商品數量(以啟用商品)
    categoryCounts(categoryItems) {
        const categoryMap = {};// 累計每個類別的商品數量。
        const adminProductStore = useAdminProductStore()
        adminProductStore.products.forEach((product) => {
          const category = product.category || '未分類'; // 若沒有類別，顯示為 'Uncategorized'
          categoryMap[category] = (categoryMap[category] || 0) + 1;//每次遇到該類別時，將數量加 1。
  
        });
        return categoryItems.map((item) => {
          return {
            name: item.name,   // 類別名稱
            image: item.image, // 類別圖片
            count:categoryMap[item.name] || 0,// 類別商品數量，若無則為 0,           
          };
        });
    },
  },
  getters: {
    
    // 過濾符合篩選條件的商品
    filteredProducts(state) {
      //
      const adminProductStore = useAdminProductStore()
      let filtered = adminProductStore.products.filter((item) => {
          const { category, price, color, size, searchText } = state.filter;
          // 獲取所有商品價格的最小值
          const minProductPrice = Math.min(...adminProductStore.products.map(product => product.price || Infinity));
  
          // 類別篩選：當 filter.category 為空時，顯示所有商品
          const isCategoryMatch = category === 'All' || item.category === category;
  
          // 價格範圍：忽略 max 小於最小商品價格的情況(解決商品列表不見問題)(商品有特價 (price > 0)，就用 price 排序；如果 price === 0，則用 OriginalPrice 排序。)
          //最低價或最高價沒有輸入數字(null)時可以篩選的
          const itemPrice = item.price > 0 ? item.price : item.OriginalPrice;
          const inPriceRange = 
              (!price.min || itemPrice >= price.min) &&
              (price.max === null || price.max < minProductPrice || itemPrice <= price.max);

  
          // 顏色篩選
          const matchesColor = !color || item.colors.some(colorObj => colorObj.color === color);

         
          // 尺寸篩選
          const matchesSize = !size || item.variants.some(variant => variant.size === size);

  
          // 關鍵字篩選
          const matchesSearch =
              !searchText || item.name.toLowerCase().includes(searchText.toLowerCase());
  
          // 總篩選條件
          return isCategoryMatch && inPriceRange && matchesColor && matchesSize && matchesSearch;
      });
  
     
      // 價格排序(商品有特價 (price > 0)，就用 price 排序；如果 price === 0，則用 OriginalPrice 排序。)
      if (state.priceSortOrder === 'lowToHigh') {
        return filtered.sort((a, b) => {
            const priceA = a.price > 0 ? a.price : a.OriginalPrice;
            const priceB = b.price > 0 ? b.price : b.OriginalPrice;
            return priceA - priceB; // 低到高排序
        });
      } else if (state.priceSortOrder === 'highToLow') {
        return filtered.sort((a, b) => {
            const priceA = a.price > 0 ? a.price : a.OriginalPrice;
            const priceB = b.price > 0 ? b.price : b.OriginalPrice;
            return priceB - priceA; // 高到低排序
        });
      }

      return filtered;
    },
  
    // 當前分頁的商品清單(可用)
    paginatedProducts(state) {
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        // return this.filteredProducts.slice(start, end);
        return state.filteredProducts.slice(start, end); 
    },
    // 總頁數
    totalPages(state) {
      return Math.ceil(state.filteredProducts.length / state.itemsPerPage);
    },
    
   
    // 可以根據顏色名稱返回 Tailwind 類名(顏色篩選側邊欄在使用)
    colorClass: (state) => (color) => state.colorsTailwindcss[color] || 'bg-gray-200',// 如果找不到顏色名稱，返回 bg-gray-200
      
    
    // markBackgroundColor 根據標籤名稱或百分比返回類名
    markBackgroundColor: (state) => (markitem) => {
      const isPercentage = /^-\d+%$/.test(markitem); // 檢查是否為百分比
      //百分比類型返回藍色 ；匹配或預設為灰色
      if (isPercentage) {
        return 'bg-blue-300'; // 百分比類型返回藍色
      }
      return state.marks[markitem] || 'bg-gray-300'; // 匹配或預設為灰色
    },
   
    // 計算商品顏色數量 直接返回 { name, count, class }，在 CardList.vue 內可以直接用 class 來渲染 Tailwind 樣式。
    colorCounts() {
      const colorStats = this.filteredProducts.reduce((acc, product) => {
          product.colors.forEach(colorObj => {
              const color = colorObj.color;
              if (color) {
                  const existing = acc.find(item => item.name === color);
                  if (existing) {
                      existing.count++; // 累加該顏色的商品數量
                  } else {
                      acc.push({
                          name: color,
                          count: 1, // 新顏色計數從 1 開始
                          class: this.colorClass(color), // 直接使用 store 的 colorClass
                      });
                  }
              }
          });
          return acc;
      }, []);
  
      // // **輸出計算後的顏色統計結果**
      // console.log("顏色統計結果:", JSON.stringify(colorStats, null, 2));
  
      return colorStats;
    },
  
  
    // 計算商品size數量 直接返回 { name, count }
    sizeCounts() {
      const sizeStats = this.filteredProducts.reduce((acc, product) => {
          // 取得該商品所有不重複的尺寸
          const uniqueSizes = [...new Set(product.variants.map(variant => 
              variant.size.trim().replace(/\s*-\s*/g, ' - ') // 移除空格 + 規範 `-` 格式
          ))];
  
          // 累加不同商品的尺寸數量
          uniqueSizes.forEach(size => {
              if (size) {
                  const existing = acc.find(item => item.name === size);
                  if (existing) {
                      existing.count++; // 這個尺寸的商品數 +1
                  } else {
                      acc.push({
                          name: size,
                          count: 1, // 第一次出現的尺寸，商品數量設為 1
                      });
                  }
              }
          });
  
          return acc;
      }, []);
  
      // // **輸出計算後的尺寸統計結果**
      // console.log("尺寸統計結果:", JSON.stringify(sizeStats, null, 2));
  
      return sizeStats;
    },
  
    
  },
     
});
