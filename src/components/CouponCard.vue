<!-- 放updateExpiredUserCoupons在 AccountCoupons.vue-->
<script setup>
const props = defineProps({
    coupon:({
        type:Object,
        required:true
    }),
    expired:({
        type:Boolean,
        default:false
    }),
})

const emit = defineEmits(['copy'])

</script>

<template>
  <div
    class="border rounded-lg p-4 mb-4"
    :class="expired ? 'bg-gray-100 text-gray-400' : 'bg-white'"
  >
    <div class="flex justify-between items-center mb-2">
      <h3 class="text-lg font-semibold">{{ coupon.title }}</h3>
      <span v-if="coupon.codeType === 'system'" class="text-xs text-gray-500">系統發放</span>
      <!-- 狀態插槽（例如顯示「已使用」、「已過期」） -->
      <slot name="status" :coupon="coupon"></slot>
    </div>

    <div class="text-sm mb-2">
      <div v-if="coupon.offerType === 'amount'">滿 {{ coupon.threshold }} 元 折 {{ coupon.discount }} 元</div>
      <div v-if="coupon.offerType === 'percent'">滿 {{ coupon.threshold }} 元 折 {{ coupon.discount }} %</div>
      <div v-if="coupon.validFrom && coupon.validTo">
        使用期限：{{ coupon.validFrom }} - {{ coupon.validTo }}
      </div>
    </div>

    <!-- 操作插槽（例如顯示「複製折扣碼」） -->
    <slot name="action" :coupon="coupon" :copyCode="(code) => emit('copy',code)"></slot>
  </div>
</template>

