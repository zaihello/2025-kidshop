import { defineStore } from 'pinia';
import { useAuthStore } from './authStore'
import axios from 'axios';
// import router from '@/router';

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
    //讀 localStorage，但背景偷偷 refresh
    async getWishlist() {
      const authStore = useAuthStore();
      const token = authStore.token;
      const userId = authStore.id;
    
      // 先讀 localStorage 快速顯示，避免每次刷新時都顯示「加載中」
      const storedWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      if (storedWishlist.length > 0) {
        this.wishlist = storedWishlist;
      }
    
      this.isLoading = true; // 仍然顯示 loading
      try {
        // 根据 userId 获取该用户的追踪清单
        const { data: wishes } = await axios.get('https://204ed3432b06d7af.mokky.dev/wishes', {
          headers: { Authorization: `Bearer ${token}` },
          params: { user_id: userId }, // 通过 user_id 过滤数据
        });
         // 获取商品数据dev/products
        const { data: products } = await axios.get('https://204ed3432b06d7af.mokky.dev/product');
        // 最新 API 資料 → 整理 → 直接覆蓋 this.wishlist
        // 合并产品(商品詳細資料)和追踪清单数据
        this.wishlist = wishes.map(wish => {
          const product = products.find(p => p.id === wish.product_Id);// 找到對應的商品
          return product ? { ...wish, ...product, wishId: wish.id } : null; // 合併資料(避免 wish.id 被 product.id 覆蓋掉，要確保把 wish.id 儲存為 wishId)
        }).filter(item => item);// 過濾掉 null 值（確保只保留有效商品）
        // 更新本地存储
        localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
        console.log('Successfully refreshed wishlist:', this.wishlist);
      } catch (error) {
        console.error('Failed to refresh wishlist:', error);
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
    // 1. 登入後才能添加或移除商品到追踪清单(商品列檔案使用)用於切換商品是否加入追蹤清單 
  async toggleWishlist(product) { 
    const authStore = useAuthStore();
    const token = authStore.token;
    const userId = authStore.id;
  
    if (!token || !userId) {
      alert("請先登入以追蹤清單")
      // router.push('/login');
      return;
    }
  
    console.log('Wishlist before operation:', this.wishlist); // 操作前的 wishlist
  
    if (this.isInWishlist(product.id)) {
      // 商品已在願望清單中，執行移除
      try {
        await this.removeFromWishlist(product, token);
      } catch (error) {
        console.error('移除商品失敗:', error);
      }
    } else {
      // 商品不在願望清單，執行新增
      try {
        await this.addToWishlist(product, userId, token);
      } catch (error) {
        console.error('添加商品失敗:', error);
      }
    }
  
    localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
    console.log('Wishlist after operation:', this.wishlist); // 操作後的 wishlist
  },
    //2.添加願望商品 
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
            wishId: wish.id, // 這是 /wishes 內的 ID 存成 wishId，確保刪除時能用
            product_Id: product.id, 
          },
        ];
    
        this.wishlist = updatedWishlist;
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
        console.log('成功添加商品到追踪清单:', product);
      } catch (error) {
        console.error('添加商品到愿望清单时出错:', error);
      }
    },
  
    //在願望清單頁面移除願望商品
    async removeFromWishlist(product, token) {
      const item = this.wishlist.find(p => p.product_Id === product.id);
      if (!item || !item.wishId) {
        console.warn('找不到 wishId，無法刪除');
        return;
      }
  
      try {
        await axios.delete(`https://204ed3432b06d7af.mokky.dev/wishes/${item.wishId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        this.wishlist = this.wishlist.filter(p => p.product_Id !== product.id);
      } catch (error) {
        console.error('刪除願望清單項目失敗:', error);
      }
    },
    // 清空 wishlist 狀態(在authService 登出使用)
    clearWishlist() {
      this.wishlist = []; // 清空追蹤清單
      localStorage.removeItem('wishlist'); // 清空本地存儲
    },
    //追蹤、取消狀態
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
  
  },
});


