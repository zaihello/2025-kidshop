<script>
// import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from '../../stores/authStore';
import axios from "axios";

export default {
  name: "CreditPay",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const orderId = route.params.id;

    const confirmPayment = async () => {
      const authStore = useAuthStore();
      const token = authStore.token;

      try {
        const paidTime = new Date().toISOString();
        const payload = {
          payment_info: {
            paid_at: paidTime,
          },
        };

        const { data } = await axios.patch(`https://204ed3432b06d7af.mokky.dev/orders/${orderId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ 已更新付款時間", data);
        alert("付款完成，訂單已更新！");
        router.push("/cart/orderdone");
      } catch (err) {
        console.error("❌ 更新付款時間失敗", err);
        alert("付款狀態更新失敗");
      }
    };

    return {
      confirmPayment,
    };
  },
};
</script>

<template>
    <div class="p-6">
      <h1 class="text-xl font-bold mb-4">信用卡付款成功</h1>
      <p class="mb-4">感謝您的付款！</p>
      <button @click="confirmPayment" class="bg-blue-500 text-white px-4 py-2 rounded">
        確認付款完成
      </button>
    </div>
</template>
  
