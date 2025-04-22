<script>
import axios from 'axios'
import { useAuthStore } from '../../stores/authStore'
import { usePaymentStore } from '../../stores/paymentStore'

export default {
  data() {
    return {
      order: null,
      loading: true,
    }
  },
  // computed:{
  //   paymentStore(){
  //     return usePaymentStore()
  //   },
  // },
  async created() {
    const id = this.$route.params.id
    const authStore = useAuthStore()
    const token = authStore.token

    try {
      const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      this.order = data
    } catch (error) {
      console.error('取得訂單失敗', error)
    } finally {
      this.loading = false
    }
  },
  // async created() {
  //   await this.getOrders()
  // },
  methods: {
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
    maskPhone(phone) {
      return phone ? phone.replace(/(\d{4})\d{3}(\d{3})/, '$1***$2') : ''
    },
  //  { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/cartsdata?userId=${userId}`)
  //   }, async getCartData(userId){
  //     const 
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
  },
}
</script>
<template>
    <div class="max-w-5xl mx-auto p-4">
      <h2 class="text-2xl font-bold mb-6">訂單詳細資訊</h2>
  
      <div v-if="loading" class="text-center text-gray-500">載入中...</div>
      <div v-else-if="!order" class="text-center text-gray-500">找不到該訂單。</div>
      <div v-else class="bg-white rounded-2xl shadow p-6 space-y-6 border border-gray-200">

         <!-- 商品清單 -->
        <div>
          <h3 class="font-semibold text-gray-700 mb-2">商品清單</h3>
          <div v-for="item in order.items" :key="item.product_id" class="flex justify-between py-2 border-b text-sm">
            <div>
              <img :src="item.image" alt="商品圖片" class="w-32 h-32 object-cover">
              <p class="font-medium">名稱:{{ item.name }}</p>
              <p class="text-gray-500">顏色:{{ item.color }}</p>
              <p class="text-gray-500">尺寸:{{ item.size }}</p>
              <p class="text-gray-500">數量：{{ item.quantity }}</p>
              <p class="text-gray-500">單價：$ {{ item.price }}</p>
            </div>
            <div class="font-bold text-right">小計:$ {{ item.subtotal }}</div>
          </div>
        </div>
  
        <!-- 訂單基本資訊 -->
        <div class="space-y-2">
          <p>訂單號碼：{{ order.id }}</p>
          <p>訂單日期：{{ formatDate(order.created_at) }}</p>
          <!-- {{ getOrderStatus(order.status) }} -->
          <p>訂單狀態：<span class="text-blue-600">{{ order.status }}</span></p>
        </div>
  
        <!-- 收件人資訊 -->
        <div>
          <h3 class="font-semibold text-gray-700 mb-2">收件人資訊</h3>
          <div class="grid grid-cols-2 gap-y-2 text-sm">
            <span>收件人{{ order.shipping_info.name }}</span>
            <span>電話：{{ order.shipping_info.tel}}</span>
            <span>地址：{{ order.shipping_info.address }}</span>
            <!-- <span>送貨方式：{{ order.shipping_method }}</span> -->
            <!-- <span>送貨狀態：{{ order.delivery_status }}</span> -->
            <!-- <span>備註：{{ order.note || '無' }}</span> -->
          </div>
          <div class="mt-2">
            <!-- <button
              v-if="order.shipping_method.includes('黑貓')"
              class="text-indigo-600 hover:underline text-sm"
            >
              黑貓物流追蹤
            </button> -->
          </div>
        </div>
  
        <!-- 付款資訊 -->
        <div>
          <h3 class="font-semibold text-gray-700 mb-2">付款資訊</h3>
          <div class="grid grid-cols-2 gap-y-2 text-sm">
            <!-- <span>付款方式：{{ order.payment_method }}</span> -->
            <span>付款方式：{{ order.payment_info.method }}</span>
            <span>付款狀態：{{order.payment_status}}</span>
            <span>發票形式：{{ order.invoice_type }}</span>
          </div>
        </div>
  
        <!-- 總金額 -->
        <div class="text-right text-lg font-bold">
          總計：NT$ {{ order.final_price }}
        </div>
      </div>
    </div>
</template>
  

  
  <style scoped>
  /* 可以根據需求加上動畫或 icon */
  </style>
  