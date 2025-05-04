<script>
import axios from 'axios'
import { useAuthStore } from '../../stores/authStore'

export default {
  data() {
    return {
      order: null,//訂單id的資料
      loading: true,
      // 發票類型的對應顯示名稱
      invoiceTypeMap: {
          '電子發票': '二聯式電子發票',
          '統一編號': '三聯式電子發票',
          '手機條碼': '手機條碼載具',
          '捐贈發票': '捐贈發票'
        },
    }
  },
 
  async created(){
    await this.getOrders()
  },
  methods: {
    //取得該使用者的訂單id資料
    async getOrders() {
      const id = this.$route.params.id//重點
      const authStore = useAuthStore()
      const userId = authStore.id
      const token = authStore.token

      try {
        const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
    
        this.order = data
      } catch (error) {
        console.error('取得歷史訂單失敗', error)
      } finally{
        this.loading = false
      }
    },

    //日期格式:2025-4-23
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
              <p class="text-gray-500">單價： {{ formatCurrency(item.price) }}</p>
            </div>
            <div class="font-bold text-right">小計: {{ formatCurrency(item.subtotal) }}</div>
          </div>
        </div>
  
        <!-- 訂單基本資訊 -->
        <div class="space-y-2">
          <p>訂單號碼：{{ order.id }}</p>
          <p>訂單日期：{{ formatDate(order.created_at) }}</p>
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
        </div>
  
        <!-- 付款資訊 -->
        <div>
          <h3 class="font-semibold text-gray-700 mb-2">付款資訊</h3>
          <div class="grid grid-cols-2 gap-y-2 text-sm">
            <span>付款方式：{{ order.payment_info.method }}</span>
            <span>付款狀態：{{order.payment_info.status}}</span>
            <span>發票形式：{{ invoiceTypeMap[order.invoice_info.type] || '未知類型' }}</span>
          </div>
        </div>
  
        <!-- 總金額 -->
        <div class="text-right text-lg font-bold">
          總計： {{ formatCurrency(order.final_price) }}
        </div>
      </div>
    </div>
</template>
  

  
 