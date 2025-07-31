<script>
import { useAuthStore } from '../../../stores/authStore'
import OrderDetailModal from '../../../components/OrderDetailModal.vue'
import Pagination from '../../../components/front/shop/Pagination.vue'
import axios from 'axios'
import Swal from 'sweetalert2' 

export default{
    components:{ OrderDetailModal,Pagination},
    data(){
        return{
            //取得所有人的訂單
            orders:[],//null
            users: [],// 所有會員資料
            isModalOpen: false,//檢視的視窗 開關
            selectedOrder: null, //被選中的單筆訂單
            // 分頁用
            currentPage: 1, // 當前頁數
            perPage: 10, // 每頁顯示幾筆
            displayedOrders: [],   // **當前頁面要顯示的訂單資料**
        }
    },
    computed:{
        //總頁數
        totalPages(){
            return Math.ceil(this.orders.length / this.perPage)
        },
    },
    methods:{
        //取得全部使用者訂單(將訂單依照 created_at 做倒序排序（新訂單在前）)
        async getOrders() {
            const authStore = useAuthStore()
            const userId = authStore.id
            const token = authStore.token
            try {
       
                const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/orders`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
                // 將訂單依照 created_at 做倒序排序（新訂單在前）
                this.orders = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                this.updateDisplayedOrders()// 取得最新資料後更新顯示
            } catch (error) {
                console.error('取得歷史訂單失敗', error)
            }
        },
        async getUsers() {
            try {
                const { data } = await axios.get('https://204ed3432b06d7af.mokky.dev/users')
                this.users = data
            } catch (error) {
                console.error('取得會員資料失敗', error)
            }
        },
        //任一新增、編輯、刪除後，都要更新 當前頁面要顯示的訂單資料
        updateDisplayedOrders(){
            const start = (this.currentPage - 1) * this.perPage
            const end = start + this.perPage
            this.displayedOrders = this.orders.slice(start,end)
        },
        //切換頁碼時，更新 displayedOrders(只顯示目前頁面要看的那幾筆)
        handlePageChange(page) {
            this.currentPage = page;
            this.updateDisplayedOrders();
        },
        //打開檢視視窗
        openDetail(order) {
            this.selectedOrder = order
          
            this.isModalOpen = true
        },
        //刪除按鈕
        async deleteOrder(orderId) {
            const result = await Swal.fire({
                title: '確定要刪除這筆訂單嗎？',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#aaa',
                confirmButtonText: '刪除',
                cancelButtonText: '取消'
            })

            if (result.isConfirmed) {
                try{
                    // 呼叫後端 API 刪除
                    await axios.delete(`https://204ed3432b06d7af.mokky.dev/orders/${orderId}`)
                    // 前端同步刪除
                    this.orders = this.orders.filter(o => o.id !== orderId)
                    this.isModalOpen = false

                    Swal.fire({
                        title: '刪除成功',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    })
                }catch(error){
                    console.error('刪除訂單失敗', error)
                    Swal.fire({
                        title: '刪除失敗',
                        text: '請稍後再試',
                        icon: 'error'
                    })
                }
            }
        },
     
        //付款狀態按鈕
        async togglePayment(order) {
            // 切換狀態
            order.payment_info.status =
            order.payment_info.status === '已付款' ? '未付款' : '已付款'
          try{
            // 👉 若你要發送 PATCH API 更新資料：
            await axios.patch(`https://204ed3432b06d7af.mokky.dev/orders/${order.id}`, {
              payment_info: {
                  ...order.payment_info
              }
            })
            console.log('付款狀態已更新')
          }catch(err){
            console.error('更新失敗', err)
          }
        },
        //更新訂單狀態
        async updateOrderStatus(order) {
            try {
                await axios.patch(`https://204ed3432b06d7af.mokky.dev/orders/${order.id}`, {
                status: order.status
            })
  
            } catch (error) {
                console.error('更新失敗:', error)
            }
        }, 
       
        //要找到使用者的資料(order user)
        getUserById(userId) {
            return this.users.find(user => Number(user.id) === Number(userId))
        },
    },
    async created() {
        // 一起進行，效能更好
        await Promise.all([
            this.getOrders(),
            this.getUsers()
        ])
       
    },

}
</script>
<template>
    <div class="p-6 space-y-6">
      <h1 class="text-2xl font-bold">訂單管理</h1>
  
      <div class="overflow-x-auto">
        <table class="w-full table-auto border text-sm">
          <thead class="bg-gray-100 text-left">
            <tr>
              <th class="border px-4 py-2">訂單編號</th>
              <th class="border px-4 py-2">建立時間</th>
              <th class="border px-4 py-2">會員姓名</th>
              <th class="border px-4 py-2">總金額</th>
              <th class="border px-4 py-2">付款狀態</th>
              <th class="border px-4 py-2">訂單狀態</th>
              <th class="border px-4 py-2">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in displayedOrders" :key="order.id">
              <td class="border px-4 py-2">{{ order.id }}</td>
              <td class="border px-4 py-2">{{ order.created_at }}</td>
              <td class="border px-4 py-2">{{ getUserById(order.userId)?.email || '未知會員' }}</td>
              <td class="border px-4 py-2">$ {{ order.final_price.toLocaleString() }}</td>
  
              <td class="border px-4 py-2">
                <div class="flex items-center space-x-2">
                  <button
                    @click="togglePayment(order)"
                    class="relative w-16 h-8 rounded-full transition-colors duration-300"
                    :class="order.payment_info.status === '已付款' ? 'bg-green-500' : 'bg-red-500'"
                  >
                    <div
                      class="absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300"
                      :class="order.payment_info.status === '已付款' ? 'translate-x-8' : ''"
                    ></div>
                  </button>
                  <span
                    class="text-sm font-semibold"
                    :class="order.payment_info.status === '已付款' ? 'text-green-600' : 'text-red-600'"
                  >
                    {{ order.payment_info.status }}
                  </span>
                </div>
              </td>
  
              <td class="border px-4 py-2">
                <select
                  v-model="order.status"
                  @change="updateOrderStatus(order)"
                  class="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option disabled value="">請選擇狀態</option>
                  <option value="處理中">處理中</option>
                  <option value="已確認">已確認</option>
                  <option value="已出貨">已出貨</option>
                  <option value="已送達">已送達</option>
                  <option value="已取消">已取消</option>
                </select>
              </td>
  
              <td class="border px-4 py-2 space-y-2">
                <button
                  @click="openDetail(order)"
                  class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:underline"
                >
                  檢視
                </button>
                <button
                  @click="deleteOrder(order.id)"
                  class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  刪除訂單
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 Pagination -->
      <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @pageChange="handlePageChange"
      />
      <!-- 檢視視窗 -->
      <OrderDetailModal
        :isOpen="isModalOpen"
        :order="selectedOrder"
        @close="isModalOpen = false"
      />
  
      <div v-if="orders.length === 0" class="text-gray-500 text-center mt-6">
        目前尚無訂單
      </div>
    </div>
</template>
  