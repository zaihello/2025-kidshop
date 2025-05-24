<!-- // ✅ A.vue（先清空資料再 loading） -->
<template>
  <div>
    <h2>版本 A：先清空資料</h2>
    <button @click="fetchData">載入點數</button>
    <div v-if="loading">載入中...</div>
    <div v-else>
      <p>可用點數：{{ summary.usablePoints }}</p>
      <p>待生效點數：{{ summary.pendingPoints }}</p>
      <p>年度總點數：{{ summary.yearlyPoints }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      summary: {
        usablePoints: 999,
        pendingPoints: 999,
        yearlyPoints: 999,
      },
    };
  },
  methods: {
    async fetchData() {
      this.summary = {
        usablePoints: 0,
        pendingPoints: 0,
        yearlyPoints: 0,
      };
      this.loading = true;
      try {
        // 模擬延遲並使用假資料
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const data = {
          summary: {
            usablePoints: 123,
            pendingPoints: 45,
            yearlyPoints: 200,
          },
        };
        this.summary = data.summary;
      } catch (error) {
        console.error('錯誤', error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
button {
  margin-bottom: 10px;
}
</style>