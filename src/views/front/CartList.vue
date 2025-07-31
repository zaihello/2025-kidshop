<script>
import { useCartStore } from '../../stores/cartStore'
import { useCouponStore } from '../../stores/couponStore'

import CartNavbar from '../../components/front/CartNavbar.vue'
import SelectCouponModal from '../../components/SelectCouponModal.vue'


export default {
  name: 'CartList',
  components:{CartNavbar,SelectCouponModal},
  data(){
    return{
      loading:true, // 之後補上
      showCouponModal:false,// 控制 modal 是否顯示
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
    openCouponModal(){
      this.showCouponModal = true
    },
    closeCouponModal(){
      this.showCouponModal = false
    },
    async applyCouponAndSync(){
      await this.cartStore.syncCartsDataToAPI()
    },
    isEligible(coupon){
      return !coupon.threshold || this.cartStore.totalAmount >= coupon.threshold
    }
  },
  computed:{
    cartStore() {
      return useCartStore();
    },
    couponStore(){
      return useCouponStore()
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
    // this.cartStore.setupWatchers()
    this.cartStore.setupCartSyncWatcher()
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
      <!-- 商品列表 -->
      <div v-else class="space-y-8">
          <!-- 商品列表-->
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
             

            <!-- 總計-->
            <div class="py-6 flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <div class="flex gap-3">
                  
                  <P>商品總價</P>
                </div>
                <span>{{ formatCurrency(cartStore.totalAmount) }}</span>
              </div>
              <!-- 優惠券顯示（支援 amount / percent）-->
              <div v-if="cartStore.cartItems?.coupon && isEligible(cartStore.cartItems.coupon)">
                <div v-if="cartStore.cartItems.coupon.offerType === 'amount'" class="flex justify-between text-red-500">
                  <p>折價券 滿 {{ cartStore.cartItems.coupon.threshold }} 元折 {{ formatCurrency(cartStore.cartItems.coupon.discount) }}元</p>
                  <p>-{{ formatCurrency(cartStore.discountAmount) }}</p>
                </div>

                <div v-else-if="cartStore.cartItems.coupon.offerType === 'percent'" class="flex justify-between text-red-500">
                  <p>折價券 滿 {{ cartStore.cartItems.coupon.threshold }} 元折 {{ cartStore.cartItems.coupon.discount }}%</p>
                  <p>-{{ formatCurrency(cartStore.discountAmount) }}</p>
                </div>
              </div>

              <!-- 運費 -->
              <div class="flex justify-between">
                <p>運費總金額</p>
                <!-- <p>{{formatCurrency(paymentStore.originalShippingFee)}}</p> -->
                <p>{{ formatCurrency(cartStore.cartItems.freight) }}</p>
              </div>
              
              <!-- 免運券折抵 -->
              <div v-if="cartStore.cartItems.freeShipping && isEligible(cartStore.cartItems.freeShipping)" class="flex justify-between text-red-500">
                <p>
                  運費折抵
                  <span v-if="cartStore.cartItems.freeShipping.miniAmount">
                    滿 {{ cartStore.cartItems.freeShipping.miniAmount }} 元
                  </span>
                  <span v-else-if="cartStore.cartItems.freeShipping.miniPieces">
                    滿 {{ cartStore.cartItems.freeShipping.miniPieces }} 件
                  </span>
                  折 {{ cartStore.cartItems.freeShipping.discount }} 元
                </p>
                <p>-{{ formatCurrency(cartStore.cartItems.freeShipping.discount) }}</p>
              </div>

              <div class="flex justify-between items-center">
                <p>預計付款金額總計</p>
                  <span>{{ formatCurrency(cartStore.finalTotal) }}</span>
              </div>
            </div>

            <div class="flex justify-end">
              <span class="text-right text-blue-400 py-2 cursor-pointer" @click="openCouponModal">選擇優惠券或輸入優惠代碼</span>
            </div>
            <!-- modal -->
            <SelectCouponModal 
                v-if="showCouponModal" 
                @close="closeCouponModal" 
                @applyCoupon="applyCouponAndSync"
            />
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
                  <!-- class="flex items-center" -->
                  <div class="text-right">
                    <p class="text-xs text-gray-500 md:text-sm">預計付款總額:</p>
                    <span class="text-lg md:text-xl font-bold text-blue-700">
                         {{ formatCurrency(cartStore.finalTotal) }}
                    </span>
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
  