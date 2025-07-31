<script>
import axios from 'axios'
import { useAuthStore } from '../../stores/authStore'

export default {
  data() {
    return {
      orders: [],
    }
  },
  computed:{
    paymentStore(){
      return usePaymentStore()
    },
  },
  async created() {
    await this.getOrders()
  },
  methods: {
    //取得使用者訂單(將訂單依照 created_at 做倒序排序（新訂單在前）)
    async getOrders() {
      const authStore = useAuthStore()
      const userId = authStore.id
      const token = authStore.token

      try {
        const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/orders?userId=${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
       // 將訂單依照 created_at 做倒序排序（新訂單在前）
        this.orders = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } catch (error) {
        console.error('取得歷史訂單失敗', error)
      }
    },
    formatDate(datetime) {
      const date = new Date(datetime)
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    },
    //格式化金額(3,000)
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // 可以更改為其他貨幣，如 'TWD'顯示 NT$或 'EUR'
        minimumFractionDigits: 0,//顯示為 $50.00
        maximumFractionDigits: 2,
      }).format(value);
    },
  },
}
</script>
<template>
    <div class="max-w-5xl mx-auto p-4">
      <h2 class="text-2xl font-bold mb-6">歷史訂單清單</h2>
  
      <div v-if="orders.length === 0" class="text-center text-gray-500">
        尚未有任何訂單記錄。
      </div>
  
      <div v-else class="space-y-6">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-2xl shadow p-6 border border-gray-200 hover:shadow-lg transition duration-200"
        >
          <div class="flex justify-between items-center mb-4">
            <div>
              <p class="font-semibold text-lg">訂單編號：{{ order.id }}</p>
              <p class="text-sm text-gray-500">建立日期：{{ formatDate(order.created_at) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm">訂單狀態：<span class="text-blue-600">{{ order.status }}</span></p>
              <p class="text-sm">金額： {{ formatCurrency(order.final_price) }}</p>
            </div>
          </div>
  
          <div class="flex justify-between items-center mt-2">
            <div>
              <p class="text-sm">付款狀態：<span class="text-red-500">{{ order.payment_info.status }}</span></p>
              <p class="text-sm">收件人：{{ order.shipping_info.name }}</p>
            </div>
            <router-link :to="`/account/orders/${order.id}`" class="text-indigo-600 hover:underline text-sm">
              查看詳細訂單 →
            </router-link>
          </div>
        </div>
      </div>
    </div>
</template>
 