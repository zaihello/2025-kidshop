
<script>
import CartNavbar from '../../components/front/CartNavbar.vue'
import { useCartStore } from '../../stores/cartStore'
import { usePaymentStore } from '../../stores/paymentStore'

//引入 VeeValidate 所需模組
import { defineRule, configure, Field, Form, ErrorMessage } from 'vee-validate';  
import { required, email, min, numeric } from '@vee-validate/rules';
//localize 內建多語系
import { localize } from '@vee-validate/i18n'
import zh_TW from '@vee-validate/i18n/dist/locale/zh_TW.json'

// VeeValidate註冊規則
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('numeric', numeric);

localize({ zh_TW }) // 加入語系資料
localize('zh_TW')   // 設定預設語系
// 這行會設定整體為中文顯示
configure({
  generateMessage: (ctx) => {
    // 先設定語系為 zh_TW
    const msg = localize('zh_TW')(ctx)

    // 只保留冒號、空格之後的內容，例如：「收件人地址 不能小於 5 個字元」→「不能小於 5 個字元」
    return msg.replace(/^.+?(：|:|\s)/, '')
  },
  validateOnInput: true,
})


// 自訂手機條碼規則（以 `/開頭，後面有 7 碼英數字）
defineRule('mobileBarcode', value => {
  if (!value) return true; // 非必填
  return /^\/[A-Z0-9]{7}$/.test(value) || '手機載具格式錯誤，需以 '/' 開頭且總長 8 碼（如 /ABC1234）';
});

// 自訂統一編號規則（8 碼數字）
defineRule('taxId', value => {
  if (!value) return true; // 非必填
  return /^\d{8}$/.test(value) || '統一編號必須為 8 碼數字';
});

// ✅ 台灣手機號碼（09 開頭 + 8 碼數字）
defineRule('twMobile', value => {
  if (!value) return '手機號碼為必填'
  return /^09\d{8}$/.test(value) || '手機格式錯誤，請輸入 09 開頭的 10 碼號碼'
})

export default {
  components:{CartNavbar,Field,Form,ErrorMessage,},
  data(){
    return{
      storeName: '',//7-11選擇的門市 之後補上
      storeAddress: '',//7-11選擇的地址 之後補上
    }
  },
  computed:{
    cartStore(){
      return useCartStore()
    },
    paymentStore(){
      return usePaymentStore()
    },
    //判斷縣市有哪些區域(收件人專用)
    availableDistricts() {
      const county = this.paymentStore.orderInfo.shipping_info.county
      return this.paymentStore.addressData[county] || {}
    },
    //判斷縣市有哪些區域(訂購人專用)
    availableBuyerDistricts() {
      const county = this.paymentStore.orderInfo.user_info.county
      return this.paymentStore.addressData[county] || {}
    },

    //郵遞區號
    zipcode() {
      const county = this.paymentStore.orderInfo.shipping_info.county
      const district = this.paymentStore.orderInfo.shipping_info.district
      return this.paymentStore.addressData[county]?.[district] || ''
    },
  },
  watch:{
    //收件人的縣市改變監聽
    'paymentStore.orderInfo.shipping_info.county'(newCounty) {
      // 當縣市改變，要清空鄉鎮與郵遞區號
      this.paymentStore.orderInfo.shipping_info.district = ''
      this.paymentStore.orderInfo.shipping_info.zipcode = ''
    },
    //收件人的鄉鎮區改變監聽
    'paymentStore.orderInfo.shipping_info.district'(newDistrict) {
      const county = this.paymentStore.orderInfo.shipping_info.county
      if (county && newDistrict && this.paymentStore.addressData[county][newDistrict]) {
        this.paymentStore.orderInfo.shipping_info.zipcode = this.paymentStore.addressData[county][newDistrict]
      } else {
        this.paymentStore.orderInfo.shipping_info.zipcode = ''
      }
    },
    //訂購人的縣市改變監聽
    'paymentStore.orderInfo.user_info.county'(newCounty) {
      this.paymentStore.orderInfo.user_info.district = ''
      this.paymentStore.orderInfo.user_info.zipcode = ''
    },
    //訂購人的鄉鎮區改變監聽
    'paymentStore.orderInfo.user_info.district'(newDistrict) {
      const county = this.paymentStore.orderInfo.user_info.county
      const zip = this.paymentStore.addressData[county]?.[newDistrict] || ''
      this.paymentStore.orderInfo.user_info.zipcode = zip
    }
  },
  methods:{
    // 支付按紐
    async submitOrder(){
      const success = await this.paymentStore.submitOrder(this.$router);
      if (success) {
        console.log("✅ 訂單建立成功");
      }

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
    isEligible(coupon){
      return !coupon.threshold || this.cartStore.totalAmount >= coupon.threshold
    }
 
  },
  

};
</script>

<template>
  <div class="bg-stone-200 pt-16 pb-28">
    <Form @submit="submitOrder" class="w-full 2xl:w-3/4 2xl:m-auto px-8">
      <!-- 導覽列 -->
      <div class="mb-14">
        <CartNavbar/>
      </div>
      <!-- 商品 + 填資料 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
        <!-- 原本 訂單資訊(有勾選的商品) -->
        <div class="bg-gray-100 rounded-lg shadow-md w-full p-6">
          <!-- 表頭 (僅 md 以上顯示) -->
          <div class="hidden md:flex font-medium text-gray-700 border-b pb-2 mb-4">
            <div class="flex items-center basis-[40%]">商品名稱</div>
            <div class="flex items-center basis-[15%]">顏色</div>
            <div class="flex items-center basis-[15%]">尺寸</div>
            <div class="flex items-center basis-[15%] ">售價</div>
            <div class="flex items-center basis-[10%]">數量</div>
            <div class="flex items-center basis-[10%] justify-end">金額</div>
          </div>

          <!-- 商品資料列 -->
          <div
            v-for="item in cartStore.selectedtItems"
            :key="item.id"
            class="flex flex-col md:flex-row py-4 border-b gap-2"
          >
            <!-- 商品名稱 + 圖片 -->
            <div class="flex items-center gap-3 basis-[40%]">
              <img
                :src="item.product.colors[0].imageurl"
                alt="商品圖片"
                class="w-16 h-16 object-cover rounded shrink-0"
              />
              <div>
                <div class="md:hidden text-sm text-gray-500">商品名稱</div>
                <span>{{ item.product.name }}</span>
              </div>
            </div>

            <!-- 顏色 -->
            <div class="basis-[15%]">
              <div class="md:hidden text-sm text-gray-500">顏色</div>
              {{ item.product.colors[0].color }}
            </div>

            <!-- 尺寸 -->
            <div class="basis-[15%]">
              <div class="md:hidden text-sm text-gray-500">尺寸</div>
              {{ item.product.variants[0].size }}
            </div>

            <!-- 售價 -->
            <div class="basis-[15%]">
              <div class="md:hidden text-sm text-gray-500">售價</div>
              {{ formatCurrency(item.price) }}
            </div>

            <!-- 數量 -->
            <div class="basis-[10%]">
              <div class="md:hidden text-sm text-gray-500">數量</div>
              {{ item.quantity }}
            </div>

            <!-- 金額 -->
            <div class="basis-[10%] text-right">
              <div class="md:hidden text-sm text-gray-500 ">金額</div>
              {{ formatCurrency(item.subTotal) }}
            </div>
          </div>

          <!-- 底部 金額 -->
          <div class="mt-6 space-y-3 text-sm text-gray-800">

            <!-- 商品總價 -->
            <div class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center">
                <span>
                  共 <span class="text-red-500 font-bold">{{ cartStore.selectedItemsCount }}</span> 件商品 商品總價
                </span>
                <span class="font-semibold tracking-wide">
                  <!-- {{ formatCurrency(cartStore.totalAmount) }} -->
                  {{ formatCurrency(cartStore.cartItems.total) }}
                </span>
              </div>
            </div>
            <!-- 優惠卷 class="flex justify-end"-->
            <div v-if="cartStore.cartItems?.couponCode && isEligible(cartStore.cartItems.couponCode)" class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center text-red-500">
                <span>
                  折價卷 滿 {{ cartStore.cartItems.couponCode.threshold}}折{{cartStore.cartItems.couponCode.discount}}
                </span>
                <span class="font-semibold tracking-wide">
                  -{{ formatCurrency(cartStore.cartItems.couponCode.discount) }}
                </span>
              </div>
            </div> 
            <!-- 運費 -->
            <div class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center">
                <span>運費總金額</span>
                <span>{{ formatCurrency(cartStore.cartItems.freight) }}</span>
              </div>
            </div>
            <!-- 免運卷 -->
            <div v-if="cartStore.cartItems.freeShipping && isEligible(cartStore.cartItems.freeShipping)" class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center text-red-500">
                <span>運費折抵 滿 {{ cartStore.cartItems.freeShipping.threshold }} 折 {{ cartStore.cartItems.freeShipping.discount }}</span>
                <span>-{{ formatCurrency(cartStore.cartItems.freeShipping.discount) }}</span>
              </div>
            </div>
            <!-- 免運提示與運費 -->
            <!-- <div class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span
                    v-if="paymentStore.remainingForFreeShipping > 0"
                    class="text-red-600 border border-red-500 px-2 py-0.5 rounded text-xs font-medium"
                  >
                    再購買 {{ formatCurrency(paymentStore.remainingForFreeShipping) }} 元即可享免運！
                  </span>
                  <span
                    v-else
                    class="text-red-600 border border-red-500 px-2 py-0.5 rounded text-xs font-medium"
                  >
                    滿 {{ formatCurrency(paymentStore.selectedMethod.freeShippingThreshold) }} 免運！
                  </span>
                  <span>運費</span>
                </div>
                <span class="font-semibold tracking-wide">
                  {{ formatCurrency(paymentStore.shippingFee) }}
                </span>
              </div>
            </div> -->

            <!-- 分隔虛線 (短版) -->
            <div class="flex justify-end">
              <hr class="border-dashed border-gray-300 border-t w-[380px]" />
            </div>

            <!-- 總付款金額 -->
            <div class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center font-bold text-lg">
                <span>總付款金額</span>
                <!-- <span class="text-red-600">{{ formatCurrency(cartStore.finalTotal) }}</span> -->
                <span class="text-red-600">{{ formatCurrency(cartStore.cartItems.final_total) }}</span>
              </div>
            </div>
          </div>
        </div>
       
         <!-- 帳單資訊  VeeValidate版-->
        <div class="bg-white p-6 rounded-lg shadow-md space-y-10">    
            <!-- 訂購人資料 -->
            <div class="space-y-3">
              <h2 class="text-2xl font-semibold ">訂購人資料</h2>
              <!-- 姓名 -->
              <div class="space-y-2">
                <label for="user_name" class="block text-sm font-medium">姓名<span class="text-red-600">*</span></label>
                <Field
                  id="user_name"
                  name="user_name"
                  type="text"
                  rules="required"
                  placeholder="請輸入姓名"
                  class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  v-model="paymentStore.orderInfo.user_info.name"
                />
                <ErrorMessage name="user_name" class="text-red-500 text-sm mt-1" />
              </div>
              <!-- 7-11 全家 -->
              <div v-if="['7-11', 'familymart'].includes(paymentStore.selectedMethod?.value)"> 
                <span>取貨門市</span>
                <span>{{ storeName || '尚未選擇門市' }}</span>
                <span>取貨地點</span>
                <span>{{ storeAddress || '尚未選擇地點' }}</span>
                <button @click="openMap">選擇門市</button>
              </div>
              
              <!-- 貨到付款 信用卡線上付款 LINE Pay-->
              <!-- 地址 -->
              <div v-if="['cod', 'credit', 'linepay'].includes(paymentStore.selectedMethod?.value)" class="flex flex-wrap space-y-2">
                <p class="w-full">地址<span class="text-red-600">*</span></p>
                <div class="grid grid-cols-3 gap-2 w-full">
                  <!-- 縣市 -->
                  <Field
                    name="buyer_county"
                    as="select"
                    class="border rounded px-3 py-2"
                    v-model="paymentStore.orderInfo.user_info.county"
                    rules="required"
                  >
                    <option value="">請選擇縣市</option>
                    <option v-for="(districts, county) in paymentStore.addressData" :key="county" :value="county">
                      {{ county }}
                    </option>
                  </Field>
                  <ErrorMessage name="buyer_county" class="text-red-500 text-sm col-span-3" />

                  <!-- 鄉鎮市區 -->
                  <Field
                    name="buyer_district"
                    as="select"
                    class="border rounded px-3 py-2"
                    v-model="paymentStore.orderInfo.user_info.district"
                    rules="required"
                  >
                    <option value="">請選擇區域</option>
                    <option v-for="(zip, district) in availableBuyerDistricts" :key="district" :value="district">
                      {{ district }}
                    </option>
                  </Field>
                  <ErrorMessage name="buyer_district" class="text-red-500 text-sm col-span-3" />

                  <!-- 郵遞區號（readonly） -->
                  <input
                    type="text"
                    class="border rounded px-3 py-2"
                    placeholder="郵遞區號"
                    v-model="paymentStore.orderInfo.user_info.zipcode"
                    readonly
                  />

                  <!-- 街道地址 -->
                  <Field
                    name="buyer_address"
                    type="text"
                    class="border rounded px-3 py-2 col-span-3"
                    placeholder="請輸入街道地址"
                    v-model="paymentStore.orderInfo.user_info.address"
                    rules="required|min:5"
                  />
                  <ErrorMessage name="buyer_address" class="text-red-500 text-sm col-span-3" />
                </div>
              </div>

              <!-- Email-->
              <div class="space-y-2">
                <label for="email" class="block text-sm font-medium">電子郵件<span class="text-red-600">*</span></label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  rules="required|email"
                  placeholder="請輸入 Email"
                  class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  v-model="paymentStore.orderInfo.user_info.email"
                />
                <ErrorMessage name="email" class="text-red-500 text-sm mt-1" />
              </div>
              <!-- 電話 -->
              <div class="space-y-2">
                <label for="tel" class="block text-sm font-medium">電話<span class="text-red-600">*</span></label>
                <Field
                  name="tel"
                  v-model="paymentStore.orderInfo.user_info.tel"
                  rules="twMobile"
                  placeholder="請輸入手機號碼（例：0912345678）"
                  class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                </Field>
                <ErrorMessage name="tel" class="text-red-500 text-sm mt-1" />
              </div>
            </div>
            <!-- 收件人資料 -->
            <div class="space-y-3">
              <!-- 收件件人資料 貨到付款 信用卡線上付款 LINE Pay(可用 LINE Points 折抵)-->
              <div v-if="['cod','credit','linepay'].includes(paymentStore.selectedMethod?.value)" class="flex flex-wrap items-center gap-2">
                <h2 class="text-2xl font-semibold">收件人資料</h2>
                <div class="flex items-center gap-1">
                  <input 
                    type="checkbox" 
                    id="sameAsUserInfo" 
                    v-model="paymentStore.sameAsUserInfo"   
                    @change="paymentStore.copyUserInfo">
                  <label for="sameAsUserInfo">同訂購人請打勾</label>
                </div> 
              </div>
             
              <!-- 姓名-->
              <div class="space-y-2">
                <label for="shipping_name" class="block text-sm font-medium">姓名<span class="text-red-600">*</span></label>
                <Field
                  id="shipping_name"
                  name="shipping_name"
                  type="text"
                  rules="required"
                  placeholder="請輸入姓名"
                  class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  v-model="paymentStore.orderInfo.shipping_info.name"
                />
                <ErrorMessage name="shipping_name" class="text-red-500 text-sm mt-1" />
              </div>
              <!-- 7-11 全家 -->
              <div v-if="['7-11', 'familymart'].includes(paymentStore.selectedMethod?.value)"> 
                <span>取貨門市</span>
                <span>{{ storeName || '尚未選擇門市' }}</span>
                <span>取貨地點</span>
                <span>{{ storeAddress || '尚未選擇地點' }}</span>
                <button @click="openMap">選擇門市</button>
              </div>
            
              <!-- 貨到付款 信用卡線上付款 LINE Pay(可用 LINE Points 折抵) 原本-->
              <!-- 收件人地址 -->
              <div v-if="['cod', 'credit', 'linepay'].includes(paymentStore.selectedMethod?.value)" class="flex flex-wrap space-y-2">
                <p class="w-full">地址<span class="text-red-600">*</span></p>
                <div class="grid grid-cols-3 gap-2 w-full">
                  <!-- 縣市 -->
                  <Field
                    name="shipping_county"
                    as="select"
                    class="border rounded px-3 py-2"
                    v-model="paymentStore.orderInfo.shipping_info.county"
                    rules="required"
                  >
                    <option value="">請選擇縣市</option>
                    <option v-for="(districts, county) in paymentStore.addressData" :key="county" :value="county">
                      {{ county }}
                    </option>
                  </Field>
                  <ErrorMessage name="shipping_county" class="text-red-500 text-sm col-span-3" />

                  <!-- 鄉鎮市區 -->
                  <Field
                    name="shipping_district"
                    as="select"
                    class="border rounded px-3 py-2"
                    v-model="paymentStore.orderInfo.shipping_info.district"
                    rules="required"
                  >
                    <option value="">請選擇區域</option>
                    <option v-for="(zip, district) in availableDistricts" :key="district" :value="district">
                      {{ district }}
                    </option>
                  </Field>
                  <ErrorMessage name="shipping_district" class="text-red-500 text-sm col-span-3" />

                  <!-- 郵遞區號（readonly） -->
                  <input
                    type="text"
                    class="border rounded px-3 py-2"
                    placeholder="郵遞區號"
                    v-model="paymentStore.orderInfo.shipping_info.zipcode"
                    readonly
                  />

                  <!-- 街道地址 -->
                  <Field
                    name="shipping_address"
                    type="text"
                    class="border rounded px-3 py-2 col-span-3"
                    placeholder="請輸入街道地址"
                    v-model="paymentStore.orderInfo.shipping_info.address"
                    rules="required|min:5"
                  />
                  <ErrorMessage name="shipping_address" class="text-red-500 text-sm col-span-3" />
                </div>
              </div>
              <!-- Email -->
              <div class="space-y-2">
                <label for="shipping_email" class="block text-sm font-medium">電子郵件<span class="text-red-600">*</span></label>
                <Field
                  id="shipping_email"
                  name="shipping_email"
                  type="email"
                  rules="required|email"
                  placeholder="請輸入 Email"
                  class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  v-model="paymentStore.orderInfo.shipping_info.email"
                />
                <ErrorMessage name="shipping_email" class="text-red-500 text-sm mt-1" />
              </div>
              <!-- 收件人電話 -->
              <div class="space-y-2">
                <label for="shipping_tel" class="block text-sm font-medium">電話<span class="text-red-600">*</span></label>
                <Field
                  id="shipping_tel"
                  name="shipping_tel"
                  type="tel"
                  rules="twMobile"
                  placeholder="請輸入手機號碼（例：0912345678）"
                  class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  v-model="paymentStore.orderInfo.shipping_info.tel"
                />
                <ErrorMessage name="shipping_tel" class="text-red-500 text-sm mt-1" />
              </div>
              <!-- 備註 -->
              <div class="space-y-2">
                <label for="shipping_comment" class="block text-sm font-medium">備註</label>
                <Field
                  id="shipping_comment"
                  name="shipping_comment"
                  as="textarea"
                  rows="4"
                  placeholder="請輸入備註"
                  class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  v-model="paymentStore.orderInfo.shipping_info.comment"
                />
              </div>
            </div>
            <!-- 發票資訊 -->
            <div class="space-y-3">
              <h2 class="text-lg font-semibold">發票資訊</h2>
              <!-- 選擇發票類型 -->
              <div class="flex flex-col sm:flex-row sm:flex-wrap w-full gap-3">
                <button
                 v-for="type in ['電子發票', '手機條碼', '統一編號', '捐贈發票']"
                 :key="type"
                 type="button"
                 @click="paymentStore.selectInvoiceType(type)"
                
                 :class="[
                   'px-4 py-2 rounded border',
                   paymentStore.orderInfo.invoice_info.type === type ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
                 ]"
                >
                 {{ type }}
                </button>
              </div>
              <!-- 電子發票提示 -->
              <div v-if="paymentStore.orderInfo.invoice_info.type === '電子發票'" class="text-sm text-gray-500 mb-4">
                依財政部規定，發票已託管，無需開立紙本發票。
              </div>
              <!-- 手機條碼 -->
              <div v-if="paymentStore.orderInfo.invoice_info.type === '手機條碼'">
                <label for="mobile_barcode">手機條碼</label>
                <Field
                  id="mobile_barcode"
                  name="mobile_barcode"
                  v-model="paymentStore.orderInfo.invoice_info.phoneCarrier"
                  type="text"
                  :rules="paymentStore.orderInfo.invoice_info.type === '手機條碼' ? 'required|mobileBarcode' : ''"
                  class="border p-2 w-full"
                  placeholder="請輸入 /ASD1234"
                />
                <ErrorMessage name="mobile_barcode" class="text-red-500 text-sm" />
              </div>
              <!-- 統一編號 -->
              <div v-if="paymentStore.orderInfo.invoice_info.type === '統一編號'">
                <label for="tax_id">統一編號</label>
                <Field
                  id="tax_id"
                  name="tax_id"
                  v-model="paymentStore.orderInfo.invoice_info.taxId"
                  type="text"
                  :rules="paymentStore.orderInfo.invoice_info.type === '統一編號' ? 'required|taxId' : ''"
                  class="border p-2 w-full"
                  placeholder="請輸入 8 碼數字"
                />
                <ErrorMessage name="tax_id" class="text-red-500 text-sm" />
              </div>

              <!-- 捐贈發票 -->
              <div v-if="paymentStore.orderInfo.invoice_info.type === '捐贈發票'" class="mb-4 text-sm text-gray-700">
                <p>捐贈單位：{{ paymentStore.orderInfo.invoice_info.donationName }}</p>
                <p>捐贈碼：{{ paymentStore.orderInfo.invoice_info.donationCode }}</p>
              </div>
            </div>
        </div>
      </div>
      <!-- 購物、支付按鈕 -->
      <div class="flex justify-between w-full gap-4">
        <button 
          @click="$router.push('/cart/cartlist')"
          class="px-6 md:px-32 py-3 md:py-6 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition"
        >繼續購物
        </button>
        <button 
          type="submit"
          class="px-6 md:px-32 py-3 md:py-6 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >支付${{ cartStore.cartItems.final_total.toLocaleString() }}</button>
      </div>
    </Form>
  </div>  
</template>
  
