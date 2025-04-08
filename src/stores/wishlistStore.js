import { defineStore } from 'pinia';
import { useAuthStore } from './authStore'
import axios from 'axios';

export const useWishlistStore = defineStore('wishlistStore', {
  state: () => ({
    wishlist: JSON.parse(localStorage.getItem('wishlist')) || [],// 初始化追蹤清單（包含详细的商品数据）
    isLoading: false, // 加载状态
    selectedCategory: '全部', // 当前选中的分类
    currentPage: 1, // 当前页码
    itemsPerPage: 3, // 每页商品数量
  }),
  actions: {
    //獲取追蹤清單
    async getWishlist() {
      const authStore = useAuthStore(); // 获取 authStore 实例
      const token = authStore.token;
      const userId = authStore.id;
      // const userId = authStore.userId; // 使用从 authStore 获取的 userId
  
      // if (!token || !userId) {
      //   console.error('Token and userId are required to fetch wishlist.');
      //   return;
      // }
      
      // 先從 localStorage 讀取數據，避免每次刷新時都顯示「加載中」
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      if (storedWishlist.length > 0) {
        this.wishlist = storedWishlist;
        this.isLoading = false; // 直接設置 isLoading 為 false
        return;
      }

      this.isLoading = true;
      try {
        // 根据 userId 获取该用户的追踪清单
        const { data: wishes } = await axios.get('https://204ed3432b06d7af.mokky.dev/wishes', {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: userId }, // 通过 user_id 过滤数据
        });

        // 获取商品数据dev/products
        const { data: products } = await axios.get('https://204ed3432b06d7af.mokky.dev/product');
  
        // 合并产品(商品詳細資料)和追踪清单数据
        this.wishlist = wishes.map(wish => {
          const product = products.find(p => p.id === wish.product_Id);// 找到對應的商品
          // return product ? { ...product, ...wish, isWishlist: true  } : null; // 合併資料並標記已追蹤
          return product ? { ...wish,...product, isWishlist: true } : null; 
        }).filter(item => item); // 過濾掉 null 值（確保只保留有效商品）
  
        // 更新本地存储
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        console.log('Successfully fetched wishlist:', this.wishlist);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        this.isLoading = false;
      }
    },
   
    
     // 设置选中的分类
    filterByCategory(category) {
      this.selectedCategory = category;
      this.currentPage = 1; // 切换分类时重置为第一页
    },
     // 设置当前页码
    setCurrentPage(page) {
      this.currentPage = page;
    },

   
    // 1. 登入後才能添加或移除商品到追踪清单(商品列檔案使用)用於切換商品是否加入追蹤清單 原本
  //   async toggleWishlist(product) {
  //     const authStore = useAuthStore();
  //     const token = authStore.token;
  //     const userId = authStore.id;
  
  //     if (!token || !userId) {
  //       console.error('Token and userId are required to modify wishlist.');
  //       return;
  //     }
  //     // 查找商品是否已在追踪清单中
  //     const index = this.wishlist.findIndex(item => item.product_Id === product.id);
  //     console.log('Wishlist before operation:', this.wishlist); // 检查操作前的 wishlist

  //     // 强制更新响应式 add
  // // const updateWishlistState = () => {
  // //   this.wishlist = [...this.wishlist]; // 使用 Vue 的响应式更新
  // // };
  
  //     if (index === -1) {
  //       // 添加商品
  //       try {
  //         await this.addToWishlist(product, userId, token);
  //         product.isWishlist = true; // 更新 product.isWishlist
  //         // updateWishlistState(); // 更新状态 add
  //         // this.wishlist.push({ ...product, isWishlist: true });
  //       } catch (error) {
  //         console.error('Error adding to wishlist:', error);
  //       }
  //     } else {
  //       // 移除商品
  //       try {
  //         await this.removeFromWishlist(product, index, token);
  //         product.isWishlist = false; //  更新 product.isWishlist
  //         // this.wishlist.splice(index, 1);
  //         // updateWishlistState(); // 更新状态
  //       } catch (error) {
  //         // console.error('Error removing from wishlist:', error);
  //         console.error('移除商品失败: 商品ID:', product.id, '用户ID:', userId, '错误详情:', error);

  //       }
  //     }
  //     localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
  //     console.log('Wishlist after operation:', this.wishlist); // 检查操作后的 wishlist

  //   },
  async toggleWishlist(product) { 
    const authStore = useAuthStore();
    const token = authStore.token;
    const userId = authStore.id;
  
    if (!token || !userId) {
      console.error('Token and userId are required to modify wishlist.');
      return;
    }
  
    console.log('Wishlist before operation:', this.wishlist); // 操作前的 wishlist
  
    if (this.isInWishlist(product.id)) {
      // 商品已在願望清單中，執行移除
      try {
        await this.removeFromWishlist(product, token);
        product.isWishlist = false; // 更新 product.isWishlist 狀態
      } catch (error) {
        console.error('移除商品失敗:', error);
      }
    } else {
      // 商品不在願望清單，執行新增
      try {
        await this.addToWishlist(product, userId, token);
        product.isWishlist = true; // 更新 product.isWishlist 狀態
      } catch (error) {
        console.error('添加商品失敗:', error);
      }
    }
  
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    console.log('Wishlist after operation:', this.wishlist); // 操作後的 wishlist
  },
  

    
    //2.添加願望商品  這裡好像有問題沒有const authStore = useAuthStore();const token = authStore.token; const userId = authStore.userId;
 
    async addToWishlist(product, userId, token) {
      
      try {
        // 先將商品添加到願望清單 API
        const { data: wish }= await axios.post(
          'https://204ed3432b06d7af.mokky.dev/wishes',
          {
            product_Id: product.id, // 将 product.id 存为 product_Id
            user_id: userId,
            category: product.category,
            name: product.name,
            imageurl: product.imgurl,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
    
        // 更新本地 wishlist，確保包含 `wishId`
        const updatedWishlist = [
          ...this.wishlist,
          {
            ...product,// 保留產品資訊
            wishId: wish.id, // 這是 /wishes 內的 ID，確保刪除時能用
            product_Id: product.id, 
            isWishlist: true,
          },
        ];
    
        this.wishlist = updatedWishlist;
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
        console.log('成功添加商品到追踪清单:', product);
      } catch (error) {
        console.error('添加商品到愿望清单时出错:', error);
      }
    },
    
    
    // 3.移除願望商品

    //原本
    // async removeFromWishlist(product, index, token) {
    //   try {
    //     const authStore = useAuthStore();
    //     const userId = authStore.id;
    
    //     // 1. 先從 API 獲取該使用者的 wishlist，確保 ID 正確
    //     const { data: wishes } = await axios.get('https://204ed3432b06d7af.mokky.dev/wishes', {
    //       headers: { Authorization: `Bearer ${token}` },
    //       params: { user_id: userId },
    //     });
    
    //     // 2. 在 wishlist 找到對應的 wish 物件
    //     const wish = wishes.find(w => w.product_Id === product.id);
    
    //     if (!wish) {
    //       console.error('找不到對應的 wish 物件，可能已經被刪除');
    //       return;
    //     }
    
    //     // 3. 發送 DELETE 請求，刪除該 wish 物件
    //     await axios.delete(`https://204ed3432b06d7af.mokky.dev/wishes/${wish.id}`, {
    //       headers: { Authorization: `Bearer ${token}` },
    //     });
    
    //     // 4. 更新本地狀態 (從 wishlist 陣列刪除)
    //     const updatedWishlist = [...this.wishlist];
    //     updatedWishlist.splice(index, 1);
    //     this.wishlist = updatedWishlist;
    //     localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    //     console.log('成功從追踪清單移除商品:', product);
    //   } catch (error) {
    //     console.log('移除商品時出錯:', error.response ? error.response.data : error);
    //   }
    // },
    async removeFromWishlist(product, token) { 
      try {
        const authStore = useAuthStore();
        const userId = authStore.id;
    
        // if (!userId || !token) {
        //   console.error('Token 或 User ID 缺失，無法移除願望清單');
        //   return;
        // }
    
        // 1️⃣ 從 API 獲取 wishlist，確保 ID 正確
        const { data: wishes } = await axios.get('https://204ed3432b06d7af.mokky.dev/wishes', {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: userId },
        });
    
        // 2️⃣ 找到 wish 物件
        const wish = wishes.find(w => w.product_Id === product.id);
        if (!wish) {
          console.error('找不到對應的 wish 物件，可能已經被刪除');
          return;
        }
    
        // 3️⃣ 發送 DELETE 請求
        await axios.delete(`https://204ed3432b06d7af.mokky.dev/wishes/${wish.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
    
        // 4️⃣ **更新本地 `wishlist` 狀態** 用 .filter() 來移除指定商品，
        this.wishlist = this.wishlist.filter(item => item.product_Id !== product.id);
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    
        console.log('成功從追踪清單移除商品:', product);
      } catch (error) {
        console.error('移除商品時出錯:', error.response ? error.response.data : error);
      }
    },
    
    
    
    
   
    // 清空 wishlist 狀態(在authService使用)
    clearWishlist() {
      this.wishlist = []; // 清空追蹤清單
      localStorage.removeItem('wishlist'); // 清空本地存儲
    },
    isInWishlist(productId) {
      return this.wishlist.some(item => item.product_Id === productId);
    }
   
  },
  getters:{
    // 动态获取所有分类
    categories(state) {
      const uniqueCategories = [...new Set(state.wishlist.map(product => product.category))];
      return ['全部', ...uniqueCategories];
    },
     // 根据选中的分类筛选愿望清单
    filteredWishlist(state) {
      if (state.selectedCategory === '全部') {
        return state.wishlist;
      }
      return state.wishlist.filter(product => product.category === state.selectedCategory);
    },
    // 每个分类的商品数量
    categoryCounts(state) {
      const counts = state.wishlist.reduce((counts, product) => {
        if (!counts[product.category]) {
          counts[product.category] = 0;
        }
        counts[product.category] += 1;
        return counts;
      }, {});
    
      // 添加 "全部" 分类，表示所有商品的数量
      counts['全部'] = state.wishlist.length;
    
      return counts;
    },
    // 分页后的商品
    paginatedWishlist(state) {
      const start = (state.currentPage - 1) * state.itemsPerPage;//當前頁的起始索引
      const end = start + state.itemsPerPage;//結束索引
      return state.filteredWishlist.slice(start, end);//使用 slice(start, end) 截取 filteredWishlist 的對應範圍。
    },
    // 获取总页数
    totalPages(state) {
      return Math.ceil(state.filteredWishlist.length / state.itemsPerPage);
    },
    // 檢查商品是否在願望清單中(為顯示勾選商品的切換圖片樣式式)
    // isInWishlist(state) {
    //   //商品的id 和 追蹤清單的product_Id 相等的話才符合
    //   return (productId) => state.wishlist.some(item => item.product_Id === productId);
    // },
  
  },
});

// 
