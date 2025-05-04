<script>
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore'
import Card from '../../components/front/Card.vue';
import Pagination from '../../components/front/shop/Pagination.vue' 
import AddcartModal from '../../components/AddcartModal.vue'

export default {
  components: { Card,Pagination,AddcartModal },
  data(){
    return{
      isModalOpen: false,//加入購物車的視窗開關追蹤
      selectedProduct: null,//加入購物車的視窗 選擇的產品

    }
  },
  computed: {
    wishlistStore() {
      return useWishlistStore();
    },
    authStore(){
      return useAuthStore()
    },
    //在getters裡
    totalPages() {
      return this.wishlistStore.totalPages;
    },
    //在state裡
    currentPage() {
      return this.wishlistStore.currentPage;
    },
    
    
  },
  methods:{
    //在actions裡的setCurrentPage(page)
    onPageChange(page) { 
      this.wishlistStore.setCurrentPage(page); // 当页码变化时，更新 store 中的当前页 }, },
    },
    //從追蹤清單中移除商品(這裡只能用在追蹤清單頁面裡)
    handleWishlistClick(product, index) {
      const token = this.authStore.token; // 使用 Pinia 中的 token
      if (!token) {
        console.error('Token is missing.');
       return;
      }
      this.wishlistStore.removeFromWishlist(product, index, token); // 移除商品 傳遞 index
    },
      // 426商品列表的購物車按鈕(追蹤清單頁)
      handleCartListClick(product) {
      this.selectedProduct = product;// 設定商品
      this.isModalOpen = true;// 開啟 Modal（但其實只靠 selectedProduct 就夠了）
    },
     //426關閉加入購物車視窗(追蹤清單頁)
     closeModal() {
      this.isModalOpen = false;
      this.selectedProduct = null;
    },  
   
  },
  mounted() {
    const token = this.authStore.token; // 從 authStore 取得 token
    const userId = this.authStore.id; // 從 authStore 取得 userId

    if (token && userId) {
      this.wishlistStore.getWishlist(); // 獲取追蹤清單
    } else {
      console.error('缺少 token 或 userId，無法加載追蹤清單。');
      this.$router.push('/login'); // 跳轉到登入頁面（如果需要）
    }
    
  },
};
</script>
<template>
    <div class="wishlist-page">
      <!-- 分类按钮 -->
      <div class="flex justify-center gap-4 mb-6">
        <button 
          v-for="category in wishlistStore.categories" 
          :key="category" 
          :class="[ wishlistStore.selectedCategory === category ? 'bg-orange-400 text-white' : 'bg-gray-200']" 
          @click="wishlistStore.filterByCategory(category)"
          class="rounded-xl w-24 h-10"
        >
          {{ category }}
          <!-- 显示分类总额 -->
        <span > ({{ wishlistStore.categoryCounts[category] || 0 }}) </span>
        </button>
      </div>

      <!-- 显示加载状态 -->
      <div v-if="wishlistStore.isLoading" class="bg-orange-100 h-56 flex items-center justify-center">
        <h3 class="text-2xl font-semibold">加载中...</h3>
      </div>
      <!-- 无收藏数据 -->
      <div v-else-if="wishlistStore.paginatedWishlist.length === 0" class="bg-orange-100 h-56 flex items-center justify-center">
        <h3 class="text-2xl font-semibold">無收藏商品</h3>
      </div>
  
      <!-- 渲染商品 -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card 
          v-for="(product, index) in wishlistStore.paginatedWishlist" 
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

        <!--  -->
      </div>
      <!-- 分页組件 -->
      <Pagination
        :currentPage="currentPage"
        :totalPages="totalPages"
        @pageChange="onPageChange"
      />
    </div>
</template>
  

  
