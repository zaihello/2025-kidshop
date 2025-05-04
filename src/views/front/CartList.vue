<script>
import { useCartStore } from '../../stores/cartStore'
import { usePaymentStore } from '../../stores/paymentStore'

import Swal from 'sweetalert2'
import CartNavbar from '../../components/front/CartNavbar.vue'
export default {
  name: 'CartList',
  components:{CartNavbar,},
  data(){
    return{
      loading:true, // 之後補上
    }
  },
  methods:{
    //格式化金額(3,000)
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // 可以更改為其他貨幣，如 'TWD'顯示 NT$或 'EUR'
        minimumFractionDigits: 0,//顯示為 $50.00
        maximumFractionDigits: 2,
      }).format(value);
    },
    //結帳按鈕
    goToPayList(){
      if (this.cartStore.selectedItemsCount > 0) {
        // 只有在有選取商品時才跳轉
        this.$router.push("/cart/paylist"); // ✅ Vue 2 或 Options API 的寫法
      } else {
        alert("請選擇商品後再結帳！");
      }
    },
  },
  computed:{
    cartStore() {
      return useCartStore();
    },
    paymentStore(){
      return usePaymentStore()
    },
    // /cartsdata格式
    cartItems() {
      return this.cartStore.cartItems; 
    },
    //折抵(之後補上)
    discount(){
      return this.cartStore.discount
    },
    //(之後補上)
    autoDiscount(){
      return this.cartStore.autoDiscount
    },
    // (之後補上)
    couponCode() {
      return this.cartStore.couponCode;
    },
     // (之後補上)
    // threshold() {
    //   return this.cartStore.discountRules.length
    //     ? Math.min(...this.yourStore.discountRules.map((rule) => rule.threshold))
    //     : 0;
    // },
   // (之後補上)
    //計算差多少到滿額折扣
    nextThreshold(){
      return this.cartStore.nextThreshold
    },
    selectAll: {
      get() {
        return this.cartStore.selectAll;//從 cartStore 中讀取 selectAll
      },
      
      set(value) {
        this.cartStore.selectAll = value;//更新 cartStore 中的 selectAll
      },
    },
  },
  async mounted() {
    console.log('載入前', this.cartStore.cartItems);
    this.loading = false//載入購物車資料後將載入設定為 false  (之後補上)
    await this.cartStore.getCartData(); //取得目前使用者的購物車  /cartsdata格式
    console.log('API 載入後', this.cartStore.cartItems);
  },
  
};
</script>
<template>
  <div class="bg-stone-200 pt-16 pb-28">
    <div class="min-h-screen w-full px-8 2xl:w-3/4 2xl:m-auto">
      <!-- loading 之後補上-->
      <!-- v-if="status.loadingItem" -->
      <!-- <div v-if="loading" class="flex flex-col items-center py-6">
        <img src="/loading.svg" alt="">
      </div> -->
       <!-- 導覽列 -->
      <div class="mb-14">
        <CartNavbar v-if="cartStore.itemTypesCount > 0" />
      </div>    
      <!-- 空購物車畫面 -->
      <div v-if="cartStore.itemTypesCount === 0"  class="flex flex-col justify-center items-center gap-4 max-w-96 m-auto h-screen">
        <img src="/emptypackage.png" alt="" class="max-w-52 max-h-52">
        <h2 class="text-3xl">您的購物車目前是空的。</h2>
        <p class="text-center">在繼續結帳之前，您必須將一些產品添加到購物車中。您會在我們的“商店”頁面上找到很多有趣的產品。</p>
        <router-link to="/shop"class="bg-blue-500 text-white rounded py-3 px-6">
         返回商店
        </router-link>
      </div>
      <!-- 付款方式 + 商品列表 -->
      <div v-else class="space-y-8">
          <!-- 付款方式 -->
          <div class="border bg-white p-6 shadow rounded">
            <h2 class="text-gray-600 text-lg font-semibold mb-4">選擇付款方式</h2>
  
            <div class="space-y-4">
              <label v-for="method in paymentStore.paymentMethods" :key="method.value"class="flex items-center space-x-3 cursor-pointer">
                <!--@change 當選擇付款方式時，將值設為 selectedMethod -->
                
                <input 
                  type="radio" 
                  name="payment" 
                  class="w-4 h-4 border-gray-300 accent-blue-500"
                  :value="method.value" 
                  v-model="paymentStore.selectedPayment"
                >
                <div class="flex flex-col flex-grow">
                  <span class="font-medium">{{ method.name }}</span>
                  <span class="text-gray-500 text-sm">{{ method.description }}</span>
                </div>
                <img v-if="method.logo" :src="method.logo" :alt="method.name" class="w-10 h-10">
              </label>
            </div>
          </div>
        
          <!-- 商品列表 v-else-->
          <div  class="border flex flex-col lg:flex-row lg:space-x-8  ">
            <!-- 商品列表 lg:w-2/3-->
            <div class="w-full  bg-white p-6 rounded-lg shadow-md">
              <div class="space-y-6">
                <h2 class="text-center text-lg font-bold">商品列表</h2>
                <div @click="cartStore.deleteAllItems()" class="flex justify-end border-b pb-6 cursor-pointer">
                  刪除全部
                </div>
                <!-- 第一個商品項目relative  md:items-start-->
                <div v-if="cartStore.cartItems && cartStore.cartItems.items.length">
                <div v-for="(item,index) in cartStore.cartItems.items" :key="item.id" class="relative flex flex-col md:flex-row items-center md:gap-3  border-b pb-6">
                  <!-- 關閉按鈕第1區塊 -->  
                  <div>
                    <!-- 設定 :checked="item.selected" 是要勾選全部時單一商品全部勾選-->
                    <input 
                      type="checkbox" 
                      :checked="item.selected"
                      @change="cartStore.toggleItemSelection(index)"
                      name="" 
                      class="w-5 h-5 absolute top-0 left-0 md:static accent-blue-500"
                    >  
                    <!-- 測試 true false -->
                    <!-- <span>Selected: {{ item.selected }}</span> -->
                  </div>
                  <!-- 圖片第2區塊 -->
                  <img :src="item.product.colors[0].imageurl" alt="Product" class="mt-10 md:mt-0 w-24 h-24 object-cover object-center rounded mb-4 md:mb-0 md:mr-6" />
                
                  <!-- 第3區塊 -->
                  <div class="w-full">
                    <!-- 商品名+金額+尺寸+顏色 -->
                    <div class="flex justify-between items-center gap-10">
                      <div class="text-lg font-medium w-3/5">
                        <span>{{ item.product.name }},</span>
                        <span>{{ item.product.variants[0].size }},</span>
                        <span>{{ item.product.colors[0].color }}</span>
                      </div>
                      <div class="w-2/5 text-right">
                        <span class="text-gray-500 font-medium">
                          售價: {{ formatCurrency(item.price) }}
                        </span>
                      </div>

                    </div>
                    <!-- 數量+總金額 -->
                    <div class="mt-4 flex justify-between items-center gap-10">
                      <div class="text-lg font-medium w-3/5">
                        <div class="text-sm text-gray-500">數量:</div>
                        <div class="flex items-center space-x-2">
                          <button @click="cartStore.decreaseQuantity(index)" class="px-2 py-1 bg-gray-200 rounded">-</button>
                          <input
                            type="text"
                            v-model="item.quantity"
                            @input="cartStore.updateQuantity(index)"
                            class="w-12 text-center border rounded focus:outline-none focus:ring-1  focus:ring-blue-500"
                          />
                          <button @click="cartStore.increaseQuantity(index)" class="px-2 py-1 bg-gray-200 rounded">+</button>
                        </div>
                      </div>
                      <div class="w-2/5 text-right">
                        <span class="font-medium w-2/5">小計:{{ formatCurrency(item.subTotal) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="w-full flex justify-end items-center">
                    <button @click="cartStore.removeFromCart(item)" class="text-red-600 hover:underline text-base">
                      刪除
                    </button>
                  </div>

                </div>
                </div>
              </div>
              <!--之後補上  -->
            <!-- 優惠券區域 -->
            <!-- <div class="mt-6 border-t pt-6 md:flex md:items-center md:gap-2 border-b pb-6">
              <input
                type="text"
                placeholder="Coupon code"
                class="w-full md:w-72 px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4 md:mb-0"
              />
              <button class="w-full md:w-40 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ">
                Apply coupon
              </button>
            </div> -->

            <!-- 總計-->
            <div class="py-6 flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <div class="flex gap-3">
                  
                  <P>商品總價</P>
                   <!-- 之後補上 -->
                  <!-- <p>再購買 {{ nextThreshold }} 元享100折扣！</p> -->
                  <!-- 再購買 {{ formatCurrency(nextThreshold) }} 元即可享100折扣！ -->
                </div>
                <span>{{ formatCurrency(cartStore.totalAmount) }}</span>
              </div>
              <!-- 之後補上 -->
              <!-- <div class="flex justify-between items-center text-red-500"> -->
                <!-- <div class="flex gap-3">
                  <p>消費滿{{  }}元折元</p>
                  <p>優惠卷折抵{{}}</p>
                </div> -->
                <!-- <div class="flex gap-3">
                  <p v-if="autoDiscount > 0">消費滿{{ formatCurrency(threshold) }}元折{{ formatCurrency(autoDiscount) }}元</p>
                  <p v-if="couponCode">優惠卷折抵{{formatCurrency(couponCode.amount)}}</p>
                </div> -->
                
                <!-- <span class="text-red-500">-{{ discount }}</span> -->
                <!-- -{{ formatCurrency(discount) }} -->
              <!-- </div> -->
              <div class="flex justify-between items-center">
                <div class="flex gap-3">
                  <p>運費</p>
                  <div>
                    <span 
                      v-if="paymentStore.remainingForFreeShipping > 0" 
                      class="text-red-600 border border-red-500 px-2 py-0.5 rounded text-xs font-medium">再購買 {{ formatCurrency(paymentStore.remainingForFreeShipping) }} 元即可享免運！
                    </span>
                    <span v-else 
                      class="text-red-600 border border-red-500 px-2 py-0.5 rounded text-xs font-medium">滿{{ formatCurrency(paymentStore.selectedMethod.freeShippingThreshold) }}免運</span>
                  </div>
                </div>
                <div>
                  <span >+{{ formatCurrency(paymentStore.shippingFee) }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <p>預計付款金額總計</p>
                <span>{{ formatCurrency(cartStore.finalTotal) }}</span>
              </div>
            </div>

            <!-- 總計(總數)items-stretch左右高度一致 items-center bg-blue-200 bg-white-->
            <div class="flex flex-col md:flex-row items-stretch py-6md:px-6">
              <!-- 左側 -->
              <div class="flex justify-between items-center w-full md:w-1/2 bg-white rounded-2xl shadow-md  py-3 md:py-6">
                <div class="flex items-center gap-2">
                  <!-- 設定:checked="selectAll"檢查商品有沒都選到 -->
                  <input 
                    type="checkbox" 
                    :checked="selectAll"
                    @change="cartStore.toggleSelectAll" 
                    name="" 
                    class="w-5 h-5 accent-blue-500">
                  <label for="" class="text-gray-700 font-medium text-sm md:text-base">全部({{ cartStore.itemTypesCount }})</label>
                  <!-- 測試用 true false-->
                  <!-- <span>{{ selectAll }}</span> -->
                </div>
                <div class="flex flex-col gap-1">
                  <!-- 之後補上 -->
                  <!-- <div class="flex text-red-500 items-center">
                    <p>折抵</p>
                    <span>{{ 350 }}</span>
                  </div> -->
                  <!-- class="flex items-center" -->
                  <div class="text-right">
                    <p class="text-xs text-gray-500 md:text-sm">預計付款總額:</p>
                    <span class="text-lg md:text-xl font-bold text-blue-700">{{ formatCurrency(cartStore.finalTotal) }}</span>
                  </div>
                </div>
              </div>
              <!-- 右側 -->
              <div class="w-full md:w-1/2 bg-blue-600 hover:bg-blue-700 transition text-white text-center rounded-2xl shadow-md flex items-center justify-center text-base md:text-lg font-semibold cursor-pointer py-3 md:py-6"
                @click="goToPayList"
              >
                購買 ({{ cartStore.selectedItemsCount }})
              </div>
            </div>
          </div>
 
          </div>
       
      </div> 
    </div>
  </div>  
</template>
  

  
  <style>
  /* Optional: Adjust the placeholder colors */
  ::placeholder {
    color: #bbb;
  }
  </style>
  