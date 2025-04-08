<script>
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore'
import Card from '../../components/front/Card.vue';
import Pagination from '../../components/front/shop/Pagination.vue' 

export default {
  components: { Card,Pagination, },
  data(){
    return{
      // isLoading: false, // 加载状态

    }
  },
  computed: {
    wishlistStore() {
      return useWishlistStore();
    },
    authStore(){
      return useAuthStore()
    },
    //在state裡
    isLoading() {
      return this.wishlistStore.isLoading;
    },
    //在getters裡
    categories() {
      return this.wishlistStore.categories;
    },
    //在state裡
    selectedCategory() {
      return this.wishlistStore.selectedCategory;
    },
    //在getters裡
    categoryCounts() {
      return this.wishlistStore.categoryCounts;
    },
    //在getters裡
    paginatedWishlist() {
      return this.wishlistStore.paginatedWishlist;
    },
    //在getters裡
    totalPages() {
      return this.wishlistStore.totalPages;
    },
    //在state裡
    currentPage() {
      return this.wishlistStore.currentPage;
    },
    isLoggedIn() {
      return this.authStore.isLoggedIn; // 从 authStore 获取登录状态
    },
    //检查商品是否在追踪清单中  切換追蹤不追蹤的圖片
    // isInWishlist() {
    //   return (productId) => this.wishlistStore.isInWishlist(productId);
    // },
  },
  methods:{
    //在actions裡
    filterByCategory(category) {
      this.wishlistStore.filterByCategory(category);
    },
    //在actions裡的setCurrentPage(page)
    onPageChange(page) { 
      this.wishlistStore.setCurrentPage(page); // 当页码变化时，更新 store 中的当前页 }, },
    },

    //add
    // (這裡只能用在追蹤清單裡)先登入，才能切換追蹤不追蹤的圖片  添加或移除商品到追踪清单 原本
    // toggleWishlistHandler(product) {
    //   // // 判斷是否已登錄
    //   // if (!this.authStore.isLoggedIn) {
    //   //   alert('請先登入以操作追蹤清單');
    //   //   this.$router.push('/login'); // 導向登錄頁
    //   //   return;
    //   // }

    //   // 調用 `wishlistStore` 中的 `toggleWishlist` 方法
    //   this.wishlistStore.removeFromWishlist(product);
    // },
    //從追蹤清單中移除商品(這裡只能用在追蹤清單裡)
    handleWishlistClick(product, index) {
      // const token = localStorage.getItem('token'); // 從 localStorage 獲取 token
      const token = this.authStore.token; // 使用 Pinia 中的 token
      if (!token) {
        console.error('Token is missing.');
       return;
      }
      this.wishlistStore.removeFromWishlist(product, index, token); // 移除商品 傳遞 index
    },
   
  },
  mounted() {
    // const authStore = useAuthStore();
    // const wishlistStore = useWishlistStore();

    // 從 localStorage 初始化 token 和 userId
    // const token = localStorage.getItem('token');
    // const userId = localStorage.getItem('userId');
    const token = this.authStore.token; // 從 authStore 取得 token
    const userId = this.authStore.id; // 從 authStore 取得 userId

    if (token && userId) {
      // this.authStore.setToken(token); // 初始化 token
      // this.authStore.setUserId(userId); // 初始化 userId
      this.wishlistStore.getWishlist(); // 獲取追蹤清單
    } else {
      console.error('缺少 token 或 userId，無法加載追蹤清單。');
      this.$router.push('/login'); // 跳轉到登入頁面（如果需要）
    }
    // this.cartStore.loadCartFromLocalStorage();// 頁面載入時同步 LocalStorage 資料(才不會重新整理頁面時，出現購物車0的頁面)
    
  },


};
</script>
<template>
    <div class="wishlist-page">
      <!-- 分类按钮 -->
      <div class="flex justify-center gap-4 mb-6">
        <!-- :class="{ active: selectedCategory === category }" -->
        <button 
          v-for="category in categories" 
          :key="category" 
          :class="[ selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200']" 
          @click="filterByCategory(category)"
          class="rounded-xl w-24 h-10"
        >
          {{ category }}
          <!-- 显示分类总额 -->
        <span > ({{ categoryCounts[category] || 0 }}) </span>
        </button>
      </div>

      <!-- 显示加载状态 -->
      <div v-if="isLoading" class="bg-orange-300 h-56 flex items-center justify-center">
        <h3>加载中...</h3>
      </div>
      <!-- v-if="!isLoading && paginatedWishlist.length === 0"-->
      <!-- 无收藏数据 -->
      <div v-else-if="paginatedWishlist.length === 0" class="bg-orange-300 h-56 flex items-center justify-center">
        <h3>無收藏商品</h3>
      </div>
  
      <!-- 渲染商品 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <!-- :is-in-wishlist="true"清單中的所有商品都已追蹤 -->
        <Card 
          v-for="(product, index) in paginatedWishlist" 
          :key="product.id" 
          :product="product" 
          :index="index" 
          :is-in-wishlist="true"
          :handle-wishlist-click="handleWishlistClick"
        />

      </div>

      <!-- 分页組件 -->
      <Pagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @pageChange="onPageChange"
      />
    </div>
</template>
  

  
  <style>
  
  .loading,
  .no-data {
    text-align: center;
    padding: 50px;
    font-size: 18px;
  }
  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
  }
  </style>
  <!-- .wishlist-page {
    padding: 20px;
  } -->
  