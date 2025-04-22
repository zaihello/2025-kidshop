<script>
export default {
  name: "LinePayPage",
  data() {
    return {
      orderId: this.$route.params.orderId,
    };
  },
  methods: {
    completePayment() {
      // 付款完成，導回訂單完成頁
      this.$router.push("/cart/orderdone");
    },
  },
};
</script>

<template>
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">LINE Pay 模擬付款</h2>
      <p>訂單編號：{{ orderId }}</p>
      <button @click="completePayment" class="mt-6 bg-green-500 text-white px-4 py-2 rounded">
        模擬付款完成
      </button>
    </div>
</template>
  
 
  