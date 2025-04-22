<script>
import { useCartStore } from '../../stores/cartStore'
import { usePaymentStore } from '../../stores/paymentStore'

import axios from 'axios'
import Swal from 'sweetalert2'
import CartNavbar from '../../components/front/CartNavbar.vue'
export default {
  name: 'CartList',
  components:{CartNavbar},
  data(){
    return{
      loading:true, // Start with loading state
      //
      userId:'',//getCart()
      cartsLength: 0,//getCart()
      productId:'',
      orderId:'',
      heartId:'',
      // 
      products:[],//getProducts()
      enabledProducts:[],//getProducts()
      // 
      carts:[],//全部使用者的購物車
      userCarts:[],//單一使用者的購物車

    }
  },
  methods:{
    // async getCart(){
    //   await axios.get(`https://204ed3432b06d7af.mokky.dev/carts`)
    //   .then((response) =>{
    //     this.carts = response.data
    //     this.userCarts = this.carts.filter((item) => item.user_id = this.userId)
        
    //     // 更新購物車數量並跳轉至購物車列表頁面
    //     this.cartsLength = this.userCarts.length
    //     this.$router.push({ path: '/cart/cartlist' })

    //     // 如果購物車有商品，取得商品詳細資訊
    //     if (this.cartsLength > 0) {
    //       this.getProducts();
    //     }
       
    //   })
    //   .catch(()=>{
    //     this.$swal.fire({
    //       title:'錯誤',
    //       text:'取得購物車資料失敗',
    //       icon:'warning',
    //     })
    //   })
    // },
    // async getProducts(){
    //   await axios.get(`https://204ed3432b06d7af.mokky.dev/products`)
    //   .then((response) =>{
    //     this.products = response.data
    //     // 將 is_enabled === 1 的產品視為啟用產品
    //     this.enabledProducts = this.products.filter(item => item.is_enbled === 1)
    //     console.log('啟用產品', this.enabledProducts)

    //     this.userCarts.forEach((cartItem) =>{
    //       const productId = cartItem.productId
    //     })

    //   })
    // },

    // 增加商品數量
    increaseQuantity(index) {
      this.cartStore.increaseQuantity(index);
    },
    // 減少商品數量
    decreaseQuantity(index) {
      this.cartStore.decreaseQuantity(index);
    },
    //input Quantity專用
    updateQuantity(index){
      this.cartStore.updateQuantity(index)
    },
    // 更新單一商品小計金額
    // updateSubTotal(index) {
    //   this.cartStore.updateSubTotal(index);
    // },
    //刪除該商品含div框架
    deleteItem(index){
      this.cartStore.deleteItem(index)
    },
    //購物車頁面商品勾選/取消切換
    toggleItemSelection(index){
      this.cartStore.toggleItemSelection(index)
    },
    //購物車頁面商品全選或取消全選
    toggleSelectAll() {
      this.cartStore.toggleSelectAll();
    },
    //結帳
    // checkout() {
    //   this.cartStore.checkout();
    // },
    //結帳後清除所有購物車
    // clearCart() {
    //   this.cartStore.clearCart();
    // },
    //3/4
    // loadCartFromLocalStorage(){
    //   this.cartStore.loadCartFromLocalStorage()
    // },
    // updateSelectAllState(){
    //   this.cartStore.updateSelectAllState()
    // },
    //格式化金額(3,000)
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // 可以更改為其他貨幣，如 'TWD'顯示 NT$或 'EUR'
        minimumFractionDigits: 0,//顯示為 $50.00
        maximumFractionDigits: 2,
      }).format(value);
    },
    //計算計算
    // calculateShippingFee() {
    //   if (!this.selectedMethod) return 0; // 沒選付款方式，運費顯示 0
    //   return this.totalAmount >= this.selectedMethod.freeShippingThreshold ? 0 : this.selectedMethod.shippingFee;
    // },
    goToPayList(){
      if (this.cartStore.selectedItemsCount > 0) {
        // 只有在有選取商品時才跳轉
        // window.location.href = "/cart/paylist";
        // router.push("/cart/paylist"); // ✅ 直接切換路由，不會重整頁面
        this.$router.push("/cart/paylist"); // ✅ Vue 2 或 Options API 的寫法
      } else {
        alert("請選擇商品後再結帳！");
      }
    },
    // removeFromCart(product){
    //   return this.cartStore.removeFromCart(product)
    // },
   
    
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
    //總金額
    // total(){
    //   return this.cartStore.total
    // },
    //折抵
    discount(){
      return this.cartStore.discount
    },
    autoDiscount(){
      return this.cartStore.autoDiscount
    },
    couponCode() {
      return this.cartStore.couponCode;
    },
    // threshold() {
    //   return this.cartStore.discountRules.length
    //     ? Math.min(...this.yourStore.discountRules.map((rule) => rule.threshold))
    //     : 0;
    // },
    //運費
    // freight(){
    //   return this.cartStore.freight
    // },
    // 預計付款總額
    final_total(){
      return this.cartStore.final_total
    },
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
    // 更新被選商品的總金額
    updateSelectedTotal(){
      return this.cartStore.updateSelectedTotal
    },
    //獲取購物車商品項目數量
    // itemTypesCount() {
    //   return this.cartStore.itemTypesCount; // 從 getter 中獲取商品品項數量
    // },
    
    //3/8
    //總金額
    totalAmount(){
      return this.cartStore.totalAmount
    },
    //選擇付款方式
    selectedMethod(){
      return this.paymentStore.selectedMethod
    },
    //運費 考慮總金額免運問題、選擇支付的方式
    // shippingFee() {
    //   return this.paymentStore.shippingFee;
    // },
    //還差多少免運  考慮總金額免運問題、選擇支付的方式
    remainingForFreeShipping() {
      return this.paymentStore.remainingForFreeShipping;
    }
    
   
  },
  async mounted() {
    console.log('載入前', this.cartStore.cartItems);
    // await this.cartStore.loadCartForDisplay();
    this.loading = false//載入購物車資料後將載入設定為 false
    // this.loadCartFromLocalStorage();// 頁面載入時同步 LocalStorage 資料(才不會重新整理頁面時，出現購物車0的頁面)
    // await this.cartStore.getCartData({ initialize: true });
   
    await this.cartStore.getCartData();
    console.log('API 載入後', this.cartStore.cartItems);
    // this.cartStore.updateCartTotals()//更新購物車金額 updateCartTotals()。nextThreshold 會自動重新計算，因為它依賴於 total 和 discountRules add
    // this.cartStore.toggleSelectAll()

   
   
    // this.cartStore.updateSelectedTotal(); // 初始化 total

   
    
  },
  
};
</script>
<template>
    <div class="min-h-screen bg-gray-50 py-10 ">
      <!--  -->
      <div>
        <!-- <CartNavbar/> -->
      </div>
      <!-- loading -->
      <!-- v-if="status.loadingItem" -->
      <div v-if="loading" class="flex flex-col items-center py-6">
        <img src="/loading.svg" alt="">
      </div>
      <!-- 購物車是空的 + 商品列表 -->
      <div v-else>
        <CartNavbar/>
        <!-- 購物車是空的 -->
        <div v-if="cartStore.itemTypesCount === 0"  class="flex flex-col items-center gap-4 max-w-96 m-auto">
          <img src="/emptypackage.png" alt="" class="max-w-52 max-h-52">
          <h2 class="text-3xl">您的購物車目前是空的。</h2>
          <p>在繼續結帳之前，您必須將一些產品添加到購物車中。您會在我們的“商店”頁面上找到很多有趣的產品。</p>
          <button class="bg-blue-500 text-white rounded py-3 px-6">返回商店</button>
        </div>
        <!-- 付款方式 + 商品列表 -->
        <div v-else>
          <div  class="border bg-white p-6 shadow rounded w-full 2xl:w-3/4 2xl:m-auto mb-20">
            <h2 class="text-gray-600 text-lg font-semibold mb-4">選擇付款方式</h2>
  
            <div class="space-y-4">
              <label v-for="method in paymentStore.paymentMethods" :key="method.value"class="flex items-center space-x-3 cursor-pointer">
                <!--@change 當選擇付款方式時，將值設為 selectedMethod -->
                <input 
                  type="radio" 
                  name="payment" 
                  class="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-400"
                  :value="method.value" 
                  v-model="paymentStore.selectedPayment"
                >
                <div class="flex flex-col flex-grow">
                  <span class="font-medium">{{ method.name }}</span>
                  <span class="text-gray-500 text-sm">{{ method.description }}</span>
                </div>
                <img v-if="method.logo" :src="method.logo" :alt="method.name" class="w-6 h-6">
              </label>
            </div>
          </div>
        
          <!-- 商品列表 v-else-->
          <div  class="border flex flex-col lg:flex-row lg:space-x-8 w-full 2xl:w-3/4 2xl:m-auto ">
            <!-- 商品列表 lg:w-2/3-->
            <div class="w-full  bg-white p-6 rounded-lg shadow-md">
              <div class="space-y-6">
                <h2 class="text-center">商品列表</h2>
                <div @click="cartStore.deleteAllItems()" class="flex justify-end border-b pb-6 cursor-pointer">
                  刪除全部
                </div>
                <!-- 第一個商品項目relative  md:items-start-->
                <div v-if="cartStore.cartItems && cartStore.cartItems.items.length">
                <div v-for="(item,index) in cartStore.cartItems.items" :key="item.id" class="relative flex flex-col md:flex-row items-center md:gap-3  border-b pb-6">
                  <!-- 關閉按鈕第1區塊 -->
                  <!-- <img src="/close.svg" class="absolute top-0 left-0 md:static cursor-pointer" alt="Close"> -->
                  <div>
                    <!-- 設定 :checked="item.selected" 是要勾選全部時單一商品全部勾選-->
                 
                    <input 
                      type="checkbox" 
                      :checked="item.selected"
                      @change="toggleItemSelection(index)"
                      name="" 
                      class="w-5 h-5 absolute top-0 left-0 md:static"
                    >  
                    <span>Selected: {{ item.selected }}</span>
                  </div>
                  <!-- 圖片第2區塊 -->
                  <img :src="item.product.colors[0].imageurl" alt="Product" class="mt-10 md:mt-0 w-24 h-24 object-cover object-center rounded mb-4 md:mb-0 md:mr-6" />
                
                  <!-- 第3區塊 -->
                  <div class="w-full">
                    <!-- 商品名+金額+尺寸+顏色 -->
                    <div class="flex justify-between items-center gap-10">
                      <div class="text-lg font-medium w-3/5 ">
                        <span>{{ item.product.name }},</span>
                        <span>{{ item.product.variants[0].size }},</span>
                        <span>{{ item.product.colors[0].color }}</span>
                      </div>
                      <!-- <div>
                        <span v-if="item.product.price !== null" class="text-red-500 font-medium">
                        特價: {{ item.product.price }}
                        </span>
                        <span v-else class="text-gray-500 font-medium w-2/5">
                        原價: {{ item.product.OriginalPrice }}
                        </span>
                      </div> -->
                      <!--  -->
                      <div>
                        <span class="text-gray-500 font-medium">
                          售價: {{ item.price }}
                        </span>
                      </div>

                    </div>
                    <!-- 數量+總金額 -->
                    <div class="mt-4 flex justify-between items-center gap-10">
                      <div class="flex items-center gap-2 w-3/5">
                        <div class="text-sm text-gray-500">數量:</div>
                        <!-- <div class="text-sm text-gray-500">數量:{{ item.qty }}</div> -->
                        <div class="flex items-center space-x-2">
                          <button @click="decreaseQuantity(index)" class="px-2 py-1 bg-gray-200 rounded">-</button>
                          <input
                            type="text"
                            v-model="item.quantity"
                            @input="updateQuantity(index)"
                            class="w-12 text-center border rounded focus:outline-none focus:ring-1  focus:ring-blue-500"
                          />
                          <!-- @input="updateSubTotal(index)" -->
                          <button @click="increaseQuantity(index)" class="px-2 py-1 bg-gray-200 rounded">+</button>
                        </div>
                      </div>
                      <span class="font-medium w-2/5">小計:{{ item.subTotal }}</span>
                      <!-- 小計:{{ formatCurrency(item.subTotal) }} -->
                    </div>
                  </div>

                  <ul class="flex flex-col gap-2 absolute top-0 right-0 md:static cursor-pointer">
                    <!-- <li class="text-red-400">Tracking</li> -->
                    <!-- <li @click="cartStore.removeFromCart(item.product)" class="text-red-900">刪除</li> -->
                    <li @click="cartStore.removeFromCart(item)" class="text-red-900">刪除</li>
                  </ul>
                </div>
                </div>
              </div>
  
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

            <!-- 總計 -->
            <div class="border-b py-6 flex flex-col gap-2">
              <div class="flex justify-between items-center">
                <div class="flex gap-3">
                  
                  <P>商品總價</P>
                  <!-- <p>再購買 {{ nextThreshold }} 元享100折扣！</p> -->
                  <!-- 再購買 {{ formatCurrency(nextThreshold) }} 元即可享100折扣！ -->
                </div>
                <span>${{ totalAmount }}</span>
                <!-- <span>{{ cartItems.total }}</span> -->
                <!-- {{ formatCurrency(total) }} -->
              </div>
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
                    <p v-if="remainingForFreeShipping > 0">再購買 {{ remainingForFreeShipping }} 元即可享免運！
                    </p>
                    <p v-else>滿{{ selectedMethod.freeShippingThreshold }}免運</p>
                  </div>
                </div>
                <div>
                  <span >+${{ paymentStore.shippingFee }}</span>
                </div>
              </div>
              <div class="flex justify-between items-center">
                <p>預計付款金額總計</p>
                <span>${{ cartStore.finalTotal }}</span>
                <!-- {{ formatCurrency(final_total) }} -->
              </div>
            </div>

            <!-- 總計(總數)items-stretch左右高度一致-->
            <div class="flex items-center items-stretch py-6">
              <!-- 左側 -->
              <div class="flex justify-between items-center w-1/2  bg-blue-200 rounded ">
                <div class="flex items-center gap-2">
                  <!-- 設定:checked="selectAll"檢查商品有沒都選到 -->
                  <input 
                    type="checkbox" 
                    :checked="selectAll"
                    @change="toggleSelectAll" 
                    name="" 
                    class="w-5 h-5">
                  <label for="">全部({{ cartStore.itemTypesCount }})</label>
                  <span>{{ selectAll }}</span>
                </div>
                <div class="flex flex-col gap-1">
                  <!-- <div class="flex text-red-500 items-center">
                    <p>折抵</p>
                    <span>{{ 350 }}</span>
                  </div> -->
                  <div class="flex items-center">
                    <p>預計付款總額:</p>
                    <span>${{ cartStore.finalTotal }}</span>
                    <!-- {{ formatCurrency(final_total) }} -->
                  </div>
                  
                </div>
              </div>
              <!-- 右側 -->
              <div class="bg-blue-500 text-white w-1/2 text-center p-6 rounded"
                @click="goToPayList"
              >
                購買 ({{ cartStore.selectedItemsCount }})
              </div>
              <!-- 操作按鈕 -->
              <!-- <div>
                <button @click="checkout">結帳</button>
                <button @click="clearCart">清空購物車</button>
              </div> -->
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
  