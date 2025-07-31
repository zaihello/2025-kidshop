<script setup>
import { ref,computed,onMounted } from 'vue'
import axiosInstance from '../../services/axiosInstance'
import { useAuthStore } from '../../stores/authStore'
import { useCouponStore } from '../../stores/couponStore'
import { autoIssueAllCoupons } from '../../utils/couponUtils'

import UsableCouponsPage from '../../components/UsableCouponsPage.vue'
import InvalidCouponsPage from '../../components/InvalidCouponsPage.vue' 


const activeTab = ref('usable')
const tabs = ref([
  { key: 'usable', label: '可使用' },
  { key: 'invalid', label: '已失效' }
])

const couponStore = useCouponStore()
const authStore = useAuthStore()

const usableCoupons = computed(() => couponStore.usableCoupons)
const invalidCoupons = computed(() => couponStore.invalidCoupons)

onMounted(async() => {
  const user = authStore.user
  await autoIssueAllCoupons({user,axiosInstance})
  await couponStore.getUserCoupons()
  
  // console.log(' autoIssueAllCoupons 被呼叫', user.id)

})

</script>

<template>
  <div class="p-4">
    <div class="flex gap-4 mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-200', 'px-4 py-2 rounded']"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- <pre>可使用{{ usableCoupons }}</pre> 
   <pre>已失效{{ invalidCoupons }}</pre>  -->
    <div v-if="activeTab === 'usable'">
      <UsableCouponsPage
        :coupons="usableCoupons"
      />
    </div>
    
    <div v-else-if="activeTab === 'invalid'">
      <InvalidCouponsPage
        :coupons="invalidCoupons"
      />
    </div>
  </div>
</template>


<style scoped>
</style>
