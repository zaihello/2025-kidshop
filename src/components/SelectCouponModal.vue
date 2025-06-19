<script setup>
import { computed, onMounted,ref } from 'vue'
import { useCouponStore } from '../stores/couponStore'
import { useCartStore } from '../stores/cartStore'
import { usePaymentStore } from '../stores/paymentStore'

const couponStore = useCouponStore()
const usableCoupons = computed(() => couponStore.usableCoupons)

const cartStore = useCartStore()
const totalAmount = computed(() => cartStore.totalAmount)

const paymentStore = usePaymentStore()

const emit = defineEmits(['applyCoupon'])

// 判斷該優惠券金額是否符合門檻
const isEligible = (coupon) => {
    return !coupon.threshold || totalAmount.value >= coupon.threshold
}


const inputCode = ref('')// 儲存輸入的折扣碼

const useCouponCode = () => {
    const input = inputCode.value.trim()
    //manual是手動輸入碼
    const matchedCoupon = usableCoupons.value.find( c => c.code === input && c.codeType === 'manual' )

    if(!matchedCoupon){
        alert('查無此優惠碼或非手動輸入類型')
        return
    }

    if(!isEligible(matchedCoupon)){
        alert(`未達使用門檻（需滿 ${matchedCoupon.threshold} 元)`)
        return
    }
    
    // 🔥 設定選擇的優惠券 ID
    if (matchedCoupon.offerType === 'amount') {
        paymentStore.selectedDiscountCouponId = matchedCoupon.couponId
    } else if (matchedCoupon.offerType === 'freeShipping') {
        paymentStore.selectedFreeShippingCouponId = matchedCoupon.couponId
    }

    // 將整個 coupon 傳給 store，統一由 getter 統整格式
    couponStore.setCouponCodeInfo(matchedCoupon)

    alert(`已套用優惠碼：${matchedCoupon.code}`)

    emit ('applyCoupon')
}

const selectCoupon = (coupon) => {
    if(!isEligible(coupon)) return

    couponStore.setSelectedCoupon(coupon)
    
    if(coupon.offerType === 'amount'){
        paymentStore.selectedDiscountCouponId = coupon.couponId
    }else if(coupon.offerType === 'freeShipping'){
        paymentStore.selectedFreeShippingCouponId = coupon.couponId
    }
    // 可加 emit、或狀態設置、或 emit 給父層等
    alert(`已選擇優惠券：${coupon.title}`)
    emit('applyCoupon')
    
}

const isCouponSelected = (coupon) => {
    return (coupon.offerType === 'amount' && paymentStore.selectedDiscountCouponId === coupon.couponId) || 
    (coupon.offerType === 'freeShipping' && paymentStore.selectedFreeShippingCouponId === coupon.couponId )
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
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-semibold">{{coupon.title}}</h3>
                        <span v-if="coupon.codeType === 'system'" class="text-xs text-gray-500">系統發放</span>
                    </div>
                    <div class="text-sm">
                        <div v-if="coupon.threshold">滿{{ coupon.threshold }} 折 {{ coupon.discount }}</div>
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
                        <div :class="isEligible(coupon) ? isCouponSelected(coupon)?'text-green-700 font-bold' : 'text-green-600' :'text-red-500'">
                              {{ isCouponSelected(coupon) ? '✅ 已套用此優惠券' : isEligible(coupon) ? '請於結帳時輸入折扣碼' : '未達門檻'}}
                        </div> 
                    </div>
                    <!-- system 顯示選擇按鈕 -->
                    <div v-else>
                        <button
                          :disabled="!isEligible(coupon) || isCouponSelected(coupon)"
                          @click="selectCoupon(coupon)"
                          class="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div v-if="isCouponSelected(coupon)">
                                ✅ 已選擇
                            </div>
                            <div v-else>
                                {{ isEligible(coupon) ? '選擇此優惠券' : '未達門檻' }}
                            </div>
 
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
</template>