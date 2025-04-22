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
        this.orders = data
      } catch (error) {
        console.error('取得歷史訂單失敗', error)
      }
    },
    formatDate(datetime) {
      const date = new Date(datetime)
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    },
    // getOrderStatus(status) {
    //   const map = {
    //     pending: '處理中',
    //     confirmed: '已確認',
    //     shipped: '已出貨',
    //     delivered: '已送達',
    //     cancelled: '已取消',
    //   }
    //   return map[status] || '未知狀態'
    // },
    // getPaymentStatus(status) {
    //   return status === 'paid' ? '已付款' : '未付款'
    // },
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
              <!-- {{ getOrderStatus(order.status) }} -->
              <p class="text-sm">訂單狀態：<span class="text-blue-600">{{ order.status }}</span></p>
              <p class="text-sm">金額：NT$ {{ order.final_price }}</p>
            </div>
          </div>
  
          <div class="flex justify-between items-center mt-2">
            <div>
              <!-- {{ getPaymentStatus(order.payment_status) }} -->
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
  

  
  <style scoped>
  /* 可以根據需求加動畫或 icon */
  </style>
  