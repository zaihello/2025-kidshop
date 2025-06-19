<script setup>
import CouponCard from './CouponCard.vue';

const props = defineProps({
    coupons:{
        type:Array,
        default:() => []
    }
})

const copyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
        alert('已複製折扣碼：' + code);
    });
}

</script>
<template>
  <div class="space-y-4">
    <CouponCard
      v-for="coupon in coupons"
      :key="coupon.id"
      :coupon="coupon"
      @copy="copyCode"
    >
      <template #action="{ coupon, copyCode }">
        <div
          v-if="coupon.status === 'usable' && !coupon.isClaimed && coupon.codeType === 'manual'"
          class="mt-2"
        >
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
        </div>
      </template>
    </CouponCard>
  </div>
</template>