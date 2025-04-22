<script>
import CartNavbar from '../../components/front/CartNavbar.vue'
import { useCartStore } from '../../stores/cartStore'
import { usePaymentStore } from '../../stores/paymentStore'
import { useAuthStore } from '../../stores/authStore'
import axios from 'axios'
import test4 from '../front/test4.vue'


export default{
    components:{ CartNavbar,test4 },
    data(){
      return{
        orderData: null,//若資料來自 API，初始化設 null 最安全、語意最明確。代表「尚未載入資料」，適合用來區分「尚未請求」和「已請求但為空資料」的情況
        // 發票類型的對應顯示名稱
        invoiceTypeMap: {
          '電子發票': '二聯式電子發票',
          '統一編號': '三聯式電子發票',
          '手機條碼': '手機條碼載具',
          '捐贈發票': '捐贈發票'
        },

      }
    },
    computed:{
        cartStore(){
            return useCartStore()
        },
        paymentStore(){
            return usePaymentStore()
        }
    },
    methods:{
      async getOrder(){
          const authStore = useAuthStore();
          const userId = authStore.id;
          const token = authStore.token;

          try{
            const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/orders?userId=${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
          });
             // 假設只取最後一筆訂單
          this.orderData = response.data[response.data.length - 1]; 
          }catch{}
      },
    },
    mounted(){
      this.getOrder()
    }
}
</script>
<template>
  <div class="bg-stone-200">
    <CartNavbar/>
    <!-- <test4/> -->
    <div class="w-full 2xl:w-3/4 2xl:m-auto p-8">
        <!-- 商品資訊(有勾選的商品) -->
        <div v-if="orderData" class="bg-gray-100 p-8 rounded-lg shadow-md w-full">
          <!-- 表頭 (僅 md 以上顯示) -->
          <div class="hidden md:flex font-medium text-gray-700 border-b pb-2 mb-4">
            <div class="flex-[1]">商品編號</div>
            <div class="flex-[2]">商品名稱</div>
            <div class="flex-[1]">顏色</div>
            <div class="flex-[1]">尺寸</div>
            <div class="flex-[1.5]">售價</div>
            <div class="flex-[1]">數量</div>
            <div class="flex-[1.5]">金額</div>
          </div>

          <!-- 商品資料列 -->
          <div
            v-for="item in orderData.items"
            :key="item.variant_id"
            class="flex flex-col md:flex-row md:items-center gap-4 py-4 border-b"
          >
            <div class="flex-[1]">
                <div class="md:hidden text-sm text-gray-500">商品編號</div>
                {{item.variant_id}}
            </div>
            <!-- 商品名稱 + 圖片 -->
            <div class="flex items-center gap-3 flex-[2]">

              <img
                :src="item.image"
                alt="商品圖片"
                class="w-16 h-16 object-cover rounded shrink-0"
              />
              <div>
                <div class="md:hidden text-sm text-gray-500">商品名稱</div>
                <span>{{ item.name }}</span>
              </div>
            </div>

            <!-- 顏色 -->
            <div class="flex-[1]">
              <div class="md:hidden text-sm text-gray-500">顏色</div>
              {{ item.color }}
            </div>

            <!-- 尺寸 -->
            <div class="flex-[1]">
              <div class="md:hidden text-sm text-gray-500">尺寸</div>
              {{ item.size }}
            </div>

            <!-- 售價 -->
            <div class="flex-[1.5]">
              <div class="md:hidden text-sm text-gray-500">售價</div>
              ${{ item.price }}
            </div>

            <!-- 數量 -->
            <div class="flex-[1]">
              <div class="md:hidden text-sm text-gray-500">數量</div>
              {{ item.quantity }}
            </div>

            <!-- 金額 -->
            <div class="flex-[1.5]">
              <div class="md:hidden text-sm text-gray-500">金額</div>
              ${{ item.subtotal }}
            </div>
          </div>

          <!-- 底部 金額 -->
          <div class="mt-6 space-y-3 text-sm text-gray-800">

            <!-- 商品總價 -->
            <div class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center">
                <span>
                 商品總價
                </span>
                <span class="font-semibold tracking-wide">
                  ${{ orderData.total }}
                </span>
              </div>
            </div>

            <!-- 運費 -->
           <div class="flex justify-end"> 
              <div class="w-full max-w-sm flex justify-between items-center">
                <span class="flex items-center gap-2">
                  運費
                </span>
                <span class="font-semibold tracking-wide text-red-600">
                  ${{ orderData.shipping_fee }}
                </span>
              </div>
            </div> 

            <!-- 分隔虛線 (短版) -->
            <div class="flex justify-end">
              <hr class="border-dashed border-gray-300 border-t w-[380px]" />
            </div>

            <!-- 總付款金額 -->
            <div class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center font-bold text-lg">
                <span>總付款金額</span>
                <span class="text-red-600">${{ orderData.final_price }}</span>
              </div>
            </div>
          </div>

        </div>
        <!-- 訂單成立 -->
         <!-- class="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl space-y-8" -->
        <div v-if="orderData" class="bg-white shadow-lg rounded-2xl mt-20 p-8">
            <div class="text-center space-y-2">
                <p class="text-2xl font-bold text-green-600">謝謝您！您的訂單已經成立！</p>
                <p class="text-lg text-gray-700">訂單號碼：<span class="font-semibold text-black">{{ orderData.id }}</span></p>
                <p class="text-gray-600">訂單確認電郵已發送到您的{{ orderData.user_info.email }}</p>
            </div>
            <!-- 訂單資訊 -->
            <div class="space-y-6">
                
                <h2 class="text-xl font-semibold border-b pb-2 mb-2">📦 訂單資訊</h2>
                <div class="flex justify-between text-gray-700">
                    <div><span class="font-medium">訂單日期：</span>{{orderData.created_at }}</div>
                    <div><span class="font-medium">訂單狀態：</span>{{orderData.status }}</div>
                </div>    
            </div>

            <!-- 訂購人資訊 -->
            <div>
                <h2 class="text-xl font-semibold border-b pb-2 mb-2">👤 訂購人資訊</h2>
                <div class="space-y-1 text-gray-700">
                    <div><span class="font-medium">姓名：</span>{{ orderData.user_info.name }}</div>
                    <div><span class="font-medium">電話號碼：</span>{{ orderData.user_info.tel }}</div>
                </div>
            </div>

            <!-- 送貨資訊 -->
            <div>
                <h2 class="text-xl font-semibold border-b pb-2 mb-2">🚚 送貨資訊</h2>
                <div class="space-y-1 text-gray-700">
                    <div><span class="font-medium">收件人姓名：</span>{{ orderData.shipping_info.name }}</div>
                    <div><span class="font-medium">收件人電話號碼：</span>{{ orderData.shipping_info.tel }}</div>
                    <!-- v-if="order?.delivery_info?.method" -->
                    <div ><span class="font-medium">送貨方式：</span>{{ orderData.delivery_info.method }} 
                    <button class="ml-2 px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800">黑貓物流追蹤</button>
                    </div>
                    <div><span class="font-medium">送貨狀態：</span>{{ orderData.status }}</div>
                    <div><span class="font-medium">地址：</span>{{ orderData.shipping_info.address }}</div>
                    <div><span class="font-medium">備註：</span>{{ orderData.shipping_info.comment }}</div>
                </div>
            </div>

            <!-- 付款資訊 -->
            <div>
                <h2 class="text-xl font-semibold border-b pb-2 mb-2">💳 付款資訊</h2>
                <div class="space-y-1 text-gray-700">
                    <div><span class="font-medium">付款方式：</span>{{ orderData.payment_info.method }}</div>
                    <div><span class="font-medium">付款狀態：</span><span class="text-red-600">{{ orderData.payment_info.status }}</span></div>
                    <div><span class="font-medium">發票：</span>{{ invoiceTypeMap[orderData.invoice_info.type] || '未知類型' }}</div>
                </div>
            </div>
       
        </div>
        <div class="flex justify-center w-full py-10">
          <!-- type="button" -->
            <button @click="$router.push('/shop')" class="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition">繼續購物</button>
            <!-- type="button" -->
            <button @click="$router.push('/account/orders')" class="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">查看訂單</button>
        </div>
    </div> 
  </div>  
</template>