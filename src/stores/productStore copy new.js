import { defineStore } from 'pinia'
import axios from 'axios'

export const useProductStore = defineStore('productStore', {
  state: () => ({
    // 商品資料
    products: [],
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
    //獲取商品數據並在 localStorage 存商品資料
    async getProducts() {
      try {
          // 先檢查 localStorage 是否有快取資料
          // const cachedProducts = localStorage.getItem("products");
          // if (cachedProducts) {
          //   this.products = JSON.parse(cachedProducts).map(product => ({
          //       ...product,
          //       is_enabled: Boolean(product.is_enabled) // 確保本地快取也是 true/false
          //   }));
          // }
          // 先檢查 localStorage 是否有快取資料
          const cachedProducts = localStorage.getItem("products");
          if (cachedProducts) {
              this.products = JSON.parse(cachedProducts);
          }
          //dev/products
          const response = await axios.get("https://204ed3432b06d7af.mokky.dev/product");

          // 儲存所有商品
          this.products = response.data.filter(product => (product.is_enabled)) // 只保留 is_enabled === true 的商品
          // 在 localStorage 存商品資料，這樣即使頁面刷新，商品也能立即顯示：
          localStorage.setItem("products", JSON.stringify(this.products)); // 存入快取
      } catch (error) {
          console.error("Error fetching products:", error);
      }
    },
    // 在navigateToCategory(category)調用
    updateCategory(category) {
      this.filter.category = category;// 更新分類
      this.currentPage = 1; // 重置頁碼到第 1 頁
    },

    //更新頁碼  分頁組件 新增
    setPage(pageNumber) {
        this.currentPage = pageNumber;
    },
    //同步路由中的參數(分類、頁碼}到 store
    syncRouteParams(route) {
        const categoryName = route.query.category || 'All';// 預設為 'All'
        const pageNumber = parseInt(route.query.page, 10) || 1;// 預設為第 1 頁
        
        // 更新分类和当前页，將首字母大寫
        this.filter.category = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);// 分类首字母大写
        this.currentPage = pageNumber;
    },
    
     // 計算每個類別的商品數量
    categoryCounts(categoryItems) {
     
        const categoryMap = {};// 累計每個類別的商品數量。
  
        this.products.forEach((product) => {
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
    // 計算折扣後的商品價格(價格計算已經在前端完成)
    // calculateDiscountedPrice(product) {
    //   const discountMark = product.mark?.find(mark => /^-\d+%$/.test(mark)); // 尋找符合折扣格式的標籤
    //   if (discountMark) {
    //     const discountPercentage = parseInt(discountMark.match(/-\d+/)[0], 10); // 提取折扣百分比
    //     return Math.round(product.OriginalPrice * (1 + discountPercentage / 100)); // 計算折扣價格
    //   }
    //   return product.OriginalPrice; // 如果沒有折扣，返回原價
    // },
    // 單一產品折扣後的價格更新到後端(勿刪)
    // async updateProductPrice(product) {
    //   const updatedPrice = this.calculateDiscountedPrice(product); // 計算新價格
    //   try {
    //     const response = await axios.patch(`https://204ed3432b06d7af.mokky.dev/products/${product.id}`, {
    //       price: updatedPrice,
    //     });
    //     return response.data;
    //   } catch (error) {
    //     console.error(`更新產品 ${product.id}的價格失敗:`, error.message);
    //   }
      
    // },
    //add(勿刪)
    // async updateProductPrice(product) {
    //   const updatedPrice = this.calculateDiscountedPrice(product);
      
    //   try {
    //     const response = await axios.patch(`https://204ed3432b06d7af.mokky.dev/products/${product.id}`, {
    //       price: updatedPrice,
    //     });
    
    //     // 不要直接改變原本的 `product.price`
    //     this.products = this.products.map(p =>
    //       p.id === product.id ? { ...p, price: updatedPrice } : p
    //     );
    
    //     return response.data;
    //   } catch (error) {
    //     console.error(`更新產品 ${product.id} 的價格失敗:`, error.message);
    //   }
    // },
    
    // 批量更新所有折扣後的商品價格(勿刪)
    // async updateAllProductPrices() {
    //   const updatePromises = this.products.map((product) => this.updateProductPrice(product));
    //   try {
    //     await Promise.all(updatePromises);
    //     console.log('所有產品價格已成功更新!');
    //   } catch (error) {
    //     console.error('無法更新產品價格:', error.message);
    //   }
    // },

    
    
     
    
    //add
    // toggleWishlist(product) {
    //   const index = this.wishlist.findIndex(item => item.product_Id === product.id);
    //   if (index > -1) {
    //     this.wishlist.splice(index, 1); // 移除商品
    //   } else {
    //     this.wishlist.push({ product_Id: product.id }); // 添加商品
    //   }
    // },
    
    // async updateProduct(updatedProduct) {
    //   try {
    //       // 更新後端 API
    //       const response = await axios.patch(`https://204ed3432b06d7af.mokky.dev/products/${updatedProduct.id}`, updatedProduct);

    //       // **確保前台的 products 陣列同步更新**
    //       const index = this.products.findIndex(p => p.id === updatedProduct.id);
    //       if (index !== -1) {
    //           this.products[index] = { ...response.data };
    //       }
    //   } catch (error) {
    //       console.error('更新商品失敗:', error);
    //   }
    // },
    //後台新增商品
    addProduct(newProduct) {
      this.products.push(newProduct); // 新增商品到前台列表
    },

    //後台更新商品
    updateProduct(updatedProduct) {

      const index = this.products.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
          this.products[index] = { ...updatedProduct };// 更新前台 products 陣列
          // ✅ **確保 Vue 會偵測變更**
        // this.products.splice(index, 1, { ...updatedProduct });
      }
    },
    //後台刪除商品
    removeProduct(productId) {
      this.products = this.products.filter(p => p.id !== productId); // 移除刪除的商品
    },
  },
  getters: {
    // 過濾符合篩選條件的商品() 原版
    // filteredProducts(state) {
    //     let filtered = state.products.filter((item) => {
    //         const { category, price, color, size, searchText } = state.filter;
    //         // 獲取所有商品價格的最小值
    //         const minProductPrice = Math.min(...state.products.map(product => product.price || Infinity));
    
    //         // 類別篩選：當 filter.category 為空時，顯示所有商品
    //         const isCategoryMatch = category === 'All' || item.category === category;
    
    //         // 價格範圍：忽略 max 小於最小商品價格的情況(解決商品列表不見問題)
    //         const inPriceRange = 
    //             (!price.min || item.price >= price.min) &&
    //             (price.max === null || price.max < minProductPrice || item.price <= price.max);
    
    //         // 顏色篩選
    //         const matchesColor = !color || item.variants.some(variant => variant.color === color);
           
    //         // 尺寸篩選
    //         const matchesSize = !size || item.variants.some(variant => variant.size === size);

    
    //         // 關鍵字篩選
    //         const matchesSearch =
    //             !searchText || item.name.toLowerCase().includes(searchText.toLowerCase());
    
    //         // 總篩選條件
    //         return isCategoryMatch && inPriceRange && matchesColor && matchesSize && matchesSearch;
    //     });
    
    //     // 價格排序
    //     if (state.priceSortOrder === 'lowToHigh') {
    //         return filtered.sort((a, b) => a.price - b.price);
    //     } else if (state.priceSortOrder === 'highToLow') {
    //         return filtered.sort((a, b) => b.price - a.price);
    //     }
    //     return filtered;
    // },
     // 過濾符合篩選條件的商品()
    filteredProducts(state) {
      let filtered = state.products.filter((item) => {
          const { category, price, color, size, searchText } = state.filter;
          // 獲取所有商品價格的最小值
          const minProductPrice = Math.min(...state.products.map(product => product.price || Infinity));
  
          // 類別篩選：當 filter.category 為空時，顯示所有商品
          const isCategoryMatch = category === 'All' || item.category === category;
  
          // 價格範圍：忽略 max 小於最小商品價格的情況(解決商品列表不見問題)
          const inPriceRange = 
              (!price.min || item.price >= price.min) &&
              (price.max === null || price.max < minProductPrice || item.price <= price.max);
  
          // 顏色篩選
          const matchesColor = !color || item.variants.some(variant => variant.color === color);
         
          // 尺寸篩選
          const matchesSize = !size || item.variants.some(variant => variant.size === size);

  
          // 關鍵字篩選
          const matchesSearch =
              !searchText || item.name.toLowerCase().includes(searchText.toLowerCase());
  
          // 總篩選條件
          return isCategoryMatch && inPriceRange && matchesColor && matchesSize && matchesSearch;
      });
  
      // 價格排序
      if (state.priceSortOrder === 'lowToHigh') {
          return filtered.sort((a, b) => a.price - b.price);
      } else if (state.priceSortOrder === 'highToLow') {
          return filtered.sort((a, b) => b.price - a.price);
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
    //add
    // paginatedProducts(state) {
    //   const start = (state.currentPage - 1) * state.itemsPerPage;
    //   const end = start + state.itemsPerPage;
    //   return Array.from(new Set(this.filteredProducts.slice(start, end).map(p => JSON.stringify(p))))
    //     .map(p => JSON.parse(p));
       
    // },
    // paginatedProducts(state) {
    //   const start = (state.currentPage - 1) * state.itemsPerPage;
    //   const end = start + state.itemsPerPage;
    
    //   // 去除重複的商品
    //   const uniqueProducts = Array.from(new Set(this.filteredProducts.slice(start, end).map(p => JSON.stringify(p))))
    //     .map(p => JSON.parse(p));
    
    //   // 檢查是否有重複的商品
    //   console.log("paginatedProducts:", uniqueProducts);
    //   const duplicateItems = uniqueProducts.filter((item, index, self) =>
    //     index !== self.findIndex((p) => p.id === item.id)
    //   );
    //   console.log("Duplicate Items:", duplicateItems);
    
    //   return uniqueProducts;
    // },
    // paginatedProducts(state) {
    //   const start = (state.currentPage - 1) * state.itemsPerPage;
    //   const end = start + state.itemsPerPage;
    
    //   // 透過 Map 來去重複，避免 JSON 影響 Vue reactivity
    //   const seen = new Map();
    //   return state.filteredProducts
    //     .slice(start, end)
    //     .filter((p) => !seen.has(p.id) && seen.set(p.id, 1));
    // },
    
    
    
    // 總頁數
    totalPages(state) {
      return Math.ceil(state.filteredProducts.length / state.itemsPerPage);
    },
    
    // 計算尺寸數量3/10
    // sizeCounts(state) {
    //     const sizeMap = {};
    //     //this
    //     state.filteredProducts.forEach((product) => {
    //         product.size.forEach((size) => {
    //         if (size) {
    //             sizeMap[size] = (sizeMap[size] || 0) + 1;
    //         }
    //         });
    //     });

    //     return Object.keys(sizeMap).map((size) => ({
    //         name: size,
    //         count: sizeMap[size],
    //     }));
    // },
    // 可以根據顏色名稱返回 Tailwind 類名
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
   
    // 檢查商品是否在願望清單中(為顯示勾選商品的切換圖片樣式式)
    // isInWishlist: (state) => (productId) => {
    //   return state.wishlist.some(item => item.product_Id === productId);
    // },
   
    // 計算商品顏色數量 直接返回 { name, count, class }，在 CardList.vue 內可以直接用 class 來渲染 Tailwind 樣式。
    colorCounts() {
      return this.filteredProducts.flatMap(product => product.variants)
        .reduce((acc, variant) => {
            const color = variant.color;
            if (color) {
                const existing = acc.find(item => item.name === color);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push({
                        name: color,
                        count: 1,
                        class: this.colorClass(color), // 直接使用 store 的 colorClass
                    });
                }
            }
            return acc;
        }, []);
    },
    // 計算商品size數量 直接返回 { name, count }
    sizeCounts() {
      return this.filteredProducts.flatMap(product => product.variants)
        .reduce((acc, variant) => {
            let size = variant.size.trim().replace(/\s*-\s*/g, ' - '); // 移除API前後空格 + 讓 `-` 前後只有一個空格(不然會重覆)
            // const size = variant.size;
            if (size) {
                const existing = acc.find(item => item.name === size);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push({
                        name: size,
                        count: 1,
                    });
                }
            }
            return acc;
        }, []);
    },
    
  },
     
});
