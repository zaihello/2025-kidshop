<script setup>
import { computed, onMounted,ref } from 'vue'
import { useCouponStore } from '../stores/couponStore'
import { useCartStore } from '../stores/cartStore'
import { usePaymentStore } from '../stores/paymentStore'
import { useAuthStore } from '../stores/authStore'
import { isCouponUsable } from '../utils/couponUtils'
import { isFreeShippingUsable } from '../utils/freeShippingUtils'

const couponStore = useCouponStore()
const cartStore = useCartStore()
const paymentStore = usePaymentStore()
const authStore = useAuthStore()

const usableCoupons = computed(() => couponStore.usableCoupons)

const emit = defineEmits(['applyCoupon'])
const inputCode = ref('')// 手動輸入的優惠碼


//用(isFreeShippingUsable函式、isCouponUsable函式)判斷是否符合優惠卷的門檻 原本
// ✅ 判斷該張 coupon 是否當前可使用（門檻 + 條件符合）
const isCouponUsableNow = (coupon) => {
  if (!coupon.fullCouponData) return false

  const user = authStore.user
  const cartItems = cartStore.cartItems.items.filter(i => i.selected)//有勾選

  const shipping = paymentStore.orderInfo.delivery_info.method
  const payment = paymentStore.orderInfo.payment_info.method
  const ordersData = paymentStore.ordersData

  if (coupon.offerType === 'freeShipping') {
    const fullCoupon = coupon.fullCouponData//優惠卷的完整資料
    return isFreeShippingUsable(
      fullCoupon.promotion,
      fullCoupon.campaign,
      fullCoupon.paymentAndShipping.paymentMethods,
      fullCoupon.paymentAndShipping.shippingMethods,
      shipping,
      payment,
      user,
      fullCoupon.targetGroup,
      cartItems
    )
  }

  return isCouponUsable(
    coupon.fullCouponData,
    user,
    ordersData,
    payment,
    shipping,
    cartItems
  )
}

// ✅ 判斷是否選取中
const isCouponSelected = (coupon) => {
  if (coupon.offerType === 'freeShipping') {
    return paymentStore.selectedFreeShippingCouponId === coupon.couponId
  } else {
    return paymentStore.selectedDiscountCouponId === coupon.couponId
  }
}

// ✅ 使用「手動輸入代碼」的優惠券
const useCouponCode = () => {
  const input = inputCode.value.trim()
  //manual是手動輸入碼
  const matchedCoupon = usableCoupons.value.find(
    c => c.code === input && c.codeType === 'manual'
  )

  if (!matchedCoupon) {
    alert('查無此優惠碼或非手動輸入類型')
    return
  }

  if (!isCouponUsableNow(matchedCoupon)) {
    alert(`未達使用門檻（需滿 ${matchedCoupon.threshold} 元）`)
    return
  }

  // ✅ 使用時等同選取
  selectCoupon(matchedCoupon)
}


// ✅ 點擊系統、手動優惠券：選取 or 取消
const selectCoupon = (coupon) => {
  // 若不符合門檻金額，直接 return
  if (!isCouponUsableNow(coupon)) return

  const isSelected = isCouponSelected(coupon)

  // 如果已選取，再點擊就是取消
  if (isSelected) {
    if (coupon.offerType === 'freeShipping') {
      paymentStore.selectedFreeShippingCouponId = null
      couponStore.selectedFreeShippingCoupon = null
    } else {
      //原本
      paymentStore.selectedDiscountCouponId = null
      couponStore.selectedDiscountCoupon = null
      couponStore.manualCoupon = null
   
      if (coupon.codeType === 'manual') {
        couponStore.manualCoupon = null
      }
    }
    alert(`已取消優惠券：${coupon.title || coupon.code}`)
    return
  }

  // ✅ 正常套用流程
  couponStore.setSelectedCoupon(coupon)

  if (coupon.offerType === 'freeShipping') {
    paymentStore.selectedFreeShippingCouponId = coupon.couponId
  } else {
    paymentStore.selectedDiscountCouponId = coupon.couponId
    if (coupon.codeType === 'manual') {
      couponStore.manualCoupon = coupon
    }
  }

  alert(`已套用優惠券：${coupon.title || coupon.code}`)
  emit('applyCoupon')
}

//取消輸入代碼的優惠卷
const cancelCoupon = (coupon) => {
  if (coupon.offerType === 'amount' || coupon.offerType === 'percent') {
    paymentStore.selectedDiscountCouponId = null
    couponStore.selectedDiscountCoupon = null
    couponStore.manualCoupon = null
  } else if (coupon.offerType === 'freeShipping') {
    paymentStore.selectedFreeShippingCouponId = null
    couponStore.selectedFreeShippingCoupon = null
  }

  alert(`已取消優惠券：${coupon.title}`)
}


const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
        alert('已複製折扣碼：' + code);
    });
}


onMounted(() => {
    couponStore.getUserCoupons()
})
</script>

<template>
  <teleport to="#modals">
   <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-3 space-y-4">
            <h2 class="border-b pb-2 text-center">可使用的優惠券</h2>
            <!-- 手動輸入優惠碼區塊 -->
            <div class="bg-stone-100 flex justify-between items-center p-3">
                <span>新增優惠卷</span>
                <input v-model="inputCode" type="text" class="px-2 py-2  border border-gray-300 rounded" placeholder="優惠代碼">
                <button @click="useCouponCode" class="py-2 px-4 bg-stone-200 hover:bg-stone-300">使用</button>
            </div>
            <!-- <pre>{{ usableCoupons }}</pre> -->
            <!-- 顯示所有 usableCoupons -->
            <div class="space-y-4 max-h-[45vh] overflow-y-auto">
                <div
                  v-for="coupon in usableCoupons"  
                  :key="coupon.id"
                  :class="[
                    'border rounded-lg p-4 bg-white space-y-2 transition',
                    isCouponSelected(coupon) ? 'border-green-500 bg-green-50 ' : ''
                  ]"
                >
                    <!-- 優惠券標題與標記 -->
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">{{coupon.title}}</h3>
                        <span v-if="coupon.codeType === 'system'" class="text-xs text-gray-500">系統發放</span>
                        <span v-else class="text-xs text-gray-500">手動輸入</span>
                    </div>
                    <!-- 優惠內容 -->
                    <div class="text-sm">
                        <div v-if="coupon.offerType === 'amount'">滿 {{ coupon.threshold }} 元 折 {{ coupon.discount }} 元</div>
                        <div v-if="coupon.offerType === 'percent'">滿 {{ coupon.threshold }} 元 折 {{ coupon.discount }} %</div>
                        <div v-if="coupon.offerType === 'freeShipping'">
                            運費折抵 滿
                            <span v-if="coupon.miniAmount">
                                {{ coupon.miniAmount }} 元
                            </span>
                            <span v-else-if="coupon.miniPieces">
                                {{ coupon.miniPieces }} 件
                            </span>
                            折 {{ coupon.discount }}
                        </div>

                        <div v-if="coupon.validFrom && coupon.validTo">
                            使用期限:{{ coupon.validFrom }} - {{ coupon.validTo }}
                        </div>
                    </div>

                    <!-- 若為手動代碼，顯示提示與代碼 -->
                    <div v-if="coupon.codeType === 'manual'" class="space-y-2">
                        <div class="text-sm mb-1">請於結帳時輸入折扣碼：</div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono bg-gray-200 px-2 py-1 rounded">{{ coupon.code }}</span>
                            <button
                            class="text-blue-600 text-sm"
                            @click="copyCode(coupon.code)"
                            >
                            複製
                            </button>
                        </div>
                        <div :class="isCouponUsableNow(coupon) ? isCouponSelected(coupon)?'text-green-700 font-bold' : 'text-green-600' :'text-red-500'">
                            {{ isCouponSelected(coupon) ? '✅ 已套用此優惠券' : isCouponUsableNow(coupon) ? '請於結帳時輸入折扣碼' : '未達門檻'}}
                           
                            <button
                              v-if="isCouponSelected(coupon)"
                              class="text-red-500 text-sm"
                              @click="cancelCoupon(coupon)"
                            >
                            ❌ 取消使用
                            </button>
                        </div>  
                    </div>
                    <!-- system 顯示選擇按鈕 -->
                   
                    <div v-else>
                      <button
                        :disabled="!isCouponUsableNow(coupon)"
                        @click="isCouponSelected(coupon) ? cancelCoupon(coupon) : selectCoupon(coupon)"
                        class="px-4 py-2 rounded text-white"
                        :class="{
                          'bg-gray-500 hover:bg-gray-600': isCouponSelected(coupon),
                          'bg-blue-600 hover:bg-blue-700': !isCouponSelected(coupon),
                          'opacity-50 cursor-not-allowed': !isCouponUsableNow(coupon)
                        }"
                      >
                        <span v-if="isCouponSelected(coupon)">取消使用</span>
                        <span v-else>{{ isCouponUsableNow(coupon) ? '選擇此優惠券' : '未達門檻' }}</span>
                      </button>
                    </div>
                </div>
            </div>
            <div class="flex justify-end gap-4 pt-2 ">
                <button class="py-2 px-4 bg-gray-200 hover:bg-gray-300 rounded" @click="$emit('close')">取消</button>
                <button class="py-2 px-4 bg-gray-400 hover:bg-gray-500 rounded" @click="$emit('close')">確定</button>
            </div>
        </div>     
   </div> 
  </teleport> 
</template>