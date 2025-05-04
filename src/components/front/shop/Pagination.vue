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
    // 計算分頁顯示範圍
    pageRange() {
      const range = [];
      const delta = 2; // 顯示前後 2 頁
      let start = Math.max(this.currentPage - delta, 1);
      let end = Math.min(this.currentPage + delta, this.totalPages);

      // 加入省略號的邏輯
      if (start > 1) range.push(1);
      if (start > 2) range.push('...');
      for (let i = start; i <= end; i++) {
        range.push(i);
      }
      if (end < this.totalPages - 1) range.push('...');
      if (end < this.totalPages) range.push(this.totalPages);

      return range;
    },
  },

}
</script>
<template>
   
        <div  class="flex justify-center mt-6 space-x-2">
            <button
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
            >
                上一頁
            </button>
            <!-- 顯示頁碼範圍 -->
            <button
                v-for="page in pageRange()"
                :key="page"
                @click="goToPage(page)"
                :disabled="page === '...'"
                :class="{'bg-gray-400 text-white': currentPage === page, 'bg-gray-200 hover:bg-gray-300': page !== '...'}"
                class="px-3 py-1 rounded "
            >
                {{ page }}
            </button>
            <button
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100"
            >
                下一頁
            </button>
        </div>
</template>