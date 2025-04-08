<script>
export default {
  props: {
    currentPage: {
      type: Number,
      required: true,
    },
    totalPages: {
      type: Number,
      required: true,
    },
  },
  emits: ['pageChange'], // 通過事件通知父組件頁碼變更
  methods: {
    goToPage(pageNumber) {
      if (pageNumber >= 1 && pageNumber <= this.totalPages) {
        this.$emit('pageChange', pageNumber); // 通知父組件頁碼改變
      }
    },
  },
  // data() {
  //   return {
  //     productStore: useProductStore(),// 獲取 productStore
  //   };
  // },
  // computed: {
  //   //sate資料
  //   currentPage() {
  //     return this.productStore.currentPage;
  //   },
  //   totalPages() {
  //     return this.productStore.totalPages;
  //   },
  // },
  // methods: {
  //   goToPage(pageNumber) {
  //     if (pageNumber < 1 || pageNumber > this.totalPages) return; // 確保頁碼在有效範圍內
  //     this.productStore.setPage(pageNumber); // 更新 Store 中的頁碼

  //     // 更新網址中的 page 參數
  //     this.$router.push({
  //       path: this.$route.path,
  //       query: {
  //         ...this.$route.query, // 保留現有查詢參數
  //         page: pageNumber,
  //       },
  //     });
  //   },
  // },
}
</script>
<template>
    <!-- v-if:只有在有商品時才顯示分頁控制按鈕 -->
        <!-- @click="currentPage--" v-if="filteredProducts.length > 0"-->
        <div v-if="totalPages > 1" class="flex justify-center mt-6 space-x-2">
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
</template>