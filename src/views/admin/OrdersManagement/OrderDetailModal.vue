  
  <script>
  import axios from 'axios'

  export default {
    name: 'OrderDetailModal',
    props: {
      isOpen: Boolean,
      order: Object,
    },
    data(){
      return{
        users: [],// 所有會員資料
      }
    },
    methods: {
      close() {
        this.$emit('close')
      },
      async getUsers() {
        try {
            const { data } = await axios.get('https://204ed3432b06d7af.mokky.dev/users')
            this.users = data
        } catch (error) {
            console.error('取得會員資料失敗', error)
        }
      },
       //要找到使用者的資料(order user)
      getUserById(userId) {
        return this.users.find(user => Number(user.id) === Number(userId))
      },
   
    },
    async created() {
        await this.getUsers()
    },
    watch: {
        // 讓 modal 開啟時禁止背景滾動
        isOpen(newVal) {
            document.body.style.overflow = newVal ? 'hidden' : ''
        }
    },
  }
  </script>
  
<template>
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg w-[90%] max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        <!-- 關閉按鈕 -->
        <button @click="close" class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
  
        <h2 class="text-2xl font-bold mb-4">訂單詳細內容</h2>
  
        <div v-if="order">
          <!-- 訂單資訊 -->
          <section class="mb-4">
            <h3 class="font-semibold">訂單資訊</h3>
            <p>訂單編號：{{ order.id }}</p>
            <p>下單時間：{{ order.created_at }}</p>
            <p>付款時間: {{ order.payment_info.paid_at}}</p>
            <p>商品狀態：{{ order.status }}</p>
            <p>
              付款狀態:
              <span :class="order.payment_info.status === '已付款' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
                  {{ order.payment_info.status }}
              </span>
            </p>
          </section>
  
          <!-- 會員資訊 -->
          <section class="mb-4">
            <h3 class="font-semibold">會員資訊</h3>
            <p>姓名：{{ getUserById(order.userId).name }}</p>
            <p>Email：{{ getUserById(order.userId).email }}</p>
          </section>
  
         
          <!-- 商品列表 -->
          <section class="mb-4" v-if="order.items && order.items.length">
            <h3 class="font-semibold mb-2">商品列表</h3>
            <div class="grid grid-cols-7 gap-2 font-semibold text-sm text-gray-600 border-b pb-2">
                <div>編號</div>
                <div class="col-span-2">名稱</div>
                <div>尺寸</div>
                <div>顏色</div>
                <div>數量</div>
                <div>小計</div>
            </div>

            <div
                 v-for="item in order.items"
                 :key="item.variant_Id"
                class="grid grid-cols-7 gap-2 text-sm border-b py-2"
            >
                <div>{{ item.variant_id }}</div>
                <div class="col-span-2">{{ item.name }}</div>
                <div>{{ item.size }}</div>
                <div>{{ item.color }}</div>
                <div>{{ item.quantity }}</div>
                <div>${{ item.subtotal }}</div>
            </div>
          </section>

          <!-- 金額資訊 -->
          <section class="mb-4">
            <h3 class="font-semibold">金額資訊</h3>
            <p>商品總額：${{ order.total }}</p>
            <p>運費：${{ order.shipping_fee }}</p>
            <!-- <p>折扣：${{ order.discount }}</p> -->
            <p class="font-bold">應付金額：${{ order.final_price }}</p>
          </section>
  
          <!-- 發票資訊 -->
          <section class="mb-4" v-if="order.invoice_info">
            <h3 class="font-semibold">發票資訊</h3>
            <p>發票類型：{{ order.invoice_info.type }}</p>
            <p v-if="order.invoice_info.type === '手機條碼'">手機條碼：{{ order.invoice_info.phoneCarrier }}</p>
            <p v-if="order.invoice_info.type === '統一編號'">統一編號：{{ order.invoice_info.taxId }}</p>
            <p v-if="order.invoice_info.type === '捐贈發票'">
              捐贈單位：{{ order.invoice_info.donationName }}<br>
              捐贈碼：{{ order.invoice_info.donationCode }}
            </p>
          </section>
        </div>
      </div>
    </div>
  </template>
