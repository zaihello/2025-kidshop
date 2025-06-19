<script setup>
import CouponCard from './CouponCard.vue';

const props = defineProps({
    coupons:{
        type:Array,
        default:() => []        
    }
})

</script>
<template>
    <div class="space-y-4">
        <CouponCard
          v-for="coupon in coupons"
          :key="coupon.id"
          :coupon="coupon"
          :expired="true"
        >
          <template #status="{coupon}">
            <span class="text-sm">
                {{ coupon.status === 'used' ? '已使用': '已過期' }}
            </span>
          </template>
        </CouponCard>
    </div>
</template>