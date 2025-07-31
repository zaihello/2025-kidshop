<script setup>
import { ref,reactive,watch, onMounted } from 'vue'
import axios from 'axios'
import FreeShippingModal from '../../../components/FreeShippingModal.vue' 

const showModal = ref(false)
const freeshippings = ref([])// 免運卷列表
const currentFreeShipping = ref(null)// 編輯用
const isEditing = ref(false)// 預設為新增模式

//取得免運卷列表
const getFreeShippings = async() => {
  const { data } = await axios.get('https://204ed3432b06d7af.mokky.dev/freeshippings')
  freeshippings.value = data
}
// 開啟新增 modal
const openAddModal = () => {
  currentFreeShipping.value = null;
  isEditing.value = false
  showModal.value = true;
}
//編輯免運費
const editFreeShipping = (freeshipping) => {
  currentFreeShipping.value = freeshipping
  isEditing.value = true
  showModal.value = true
} 

//刪除免運費
const deleteFreeShipping = async(id) => {
  if(confirm('確定刪除這張免運費卷？')) {
    await axios.delete(`https://204ed3432b06d7af.mokky.dev/freeshippings/${id}`)
    await getFreeShippings()// 重新取得資料
  }
}

// 處理新增或編輯提交
const handleFreeShippingSubmit = async ({ mode,payload}) => {
  if(mode === 'edit'){
    //編輯
    await axios.patch(`https://204ed3432b06d7af.mokky.dev/freeshippings/${payload.id}`,payload)
  }else if(mode === 'add'){
    await axios.post(`https://204ed3432b06d7af.mokky.dev/freeshippings/`,payload)
  }
  showModal.value = false
  await getFreeShippings() // 重新取得資料
}

const getApplyToLabel = (applyTo) => {
  const map = {
    all:'全店',
    category:'指定分類',
    product:'指定商品',
    once:'一次性',
  }
  return map[applyTo] || '-'
}

const getSelectedGroupLabel = (selectedGroup) => {
  const map = {
    all:'所有顧客',
    members:'會員',
    tagged:'指定顧客',
  }
  return map[selectedGroup] || '-'
}

const getSelectedMethodLabel = (selectedMethod) => {
  const map = {
    automatic:'自動套用',
    UseCoupons:'優惠卷代碼',
    RecommendedActivities:'推薦活動',
  }
  return map[selectedMethod] || '-'
} 

const getUsageLimitLabel = (coupon)  => {
  const promo = coupon.promotion
  const method = promo.selectedMethod

  if(method === 'automatic'){
    const { unlimited,usageLimit } = promo.automatic
    return unlimited || usageLimit === '' ? '無限使用' : `${usageLimit} 次`
  }
  if(method === 'UseCoupons'){
    const subMethod = promo.useCoupons.selectedReceiveMethod

    if(subMethod === 'InCenter' ){
      const {unlimited,usageLimit} = promo.useCoupons.inCenter
      return unlimited || usageLimit === '' ? '無限使用' : `${usageLimit} 次`
    }
    if(subMethod === 'EnterCouponCode'){
      const codeType = promo.useCoupons.enterCouponCode.selectedCodeType
      
      if(codeType === 'Universal'){
        const {unlimited,usageLimit} = promo.useCoupons.enterCouponCode.universal
        return unlimited || usageLimit === '' ? '無限使用' : `${usageLimit} 次`
      }

    }
    if(subMethod === 'GetCoupons'){
      const {unlimited,usageLimit} = promo.useCoupons.getCoupons
      return unlimited || usageLimit === '' ? '無限使用' : `${usageLimit} 次`
    }
  }
  if(method === 'RecommendedActivities'){
    const {unlimited,usageLimit} = promo.recommended
    return unlimited || usageLimit === '' ? '無限使用' : `${usageLimit} 次`
  }
  return '-'
}

const getPromotionPeriodLabel = (promotion) => {
  const paths = [
    promotion.automatic,
    promotion.useCoupons.inCenter,
    promotion.useCoupons.enterCouponCode.universal,
    promotion.useCoupons.enterCouponCode.independent,
    promotion.useCoupons.getCoupons,
  ]

  for( const path of paths ){
    if(!path) continue

    const { promotionStartDate,promotionEndDate,neverExpiresPromotion } = path

    if(neverExpiresPromotion){
      return '永不過期'
    }

    if(promotionStartDate || promotionEndDate){
      const start = promotionStartDate || '未設定'
      const end = promotionEndDate || '未設定'
      return `${start} ~ ${end}`
    }
  }

  return '未設定'
}
// 初次載入資料
onMounted(getFreeShippings)

</script>

<template>
<div>  
  <h1 class="text-2xl font-bold mb-6 text-center">免運費</h1>
  <div class="mb-4 flex justify-end">
    <button @click="openAddModal" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow">新增</button>
  </div>
  <!-- 滿額滿件優惠列表 -->
  <table class="border w-full border-yellow-500">
    <thead class="bg-gray-100">
      <tr class="border">
        <th class="py-3 text-left">活動名稱</th>
        <!-- <th class="py-3 text-left">適用通路</th> -->
        <th class="py-3 text-left">套用範圍</th>
        <th class="py-3 text-left">促銷期限</th>
        <th class="py-3 text-left">目標群組</th>
        <th class="py-3 text-left">優惠方式</th>
        <th class="py-3 text-left">使用次數</th>
        <th class="py-3 text-left">操作</th>
      </tr>
    </thead>
    <tbody >
      <tr v-for="freeshipping in freeshippings" :key="freeshipping.id" class="border hover:bg-gray-50">
        <td class="py-4">{{ freeshipping.campaign.basic.campaignTitle || '—' }}</td>
        <!-- <td class="py-4">網店</td> -->
        <td class="py-4">{{ getApplyToLabel(freeshipping.campaign.basic.applyTo) }}</td>
        <!-- <td class="py-4">
          {{ coupon.promotion.useCoupons.enterCouponCode.promotionStartDate || '未設定' }} 至
          <span v-if="coupon.promotion.useCoupons.enterCouponCode.promotionEndDate">{{ coupon.promotion.useCoupons.enterCouponCode.promotionEndDate || '未設定' }}</span>
          <span v-else>永不過期</span>
        </td> -->
        <td class="py-4">
          {{ getPromotionPeriodLabel(freeshipping.promotion) }}
        </td>
        <td class="py-4">{{ getSelectedGroupLabel(freeshipping.targetGroup.selectedGroup) }}</td>
        <td class="py-4">{{ getSelectedMethodLabel(freeshipping.promotion.selectedMethod) }}</td>
        <td class="py-4">
          <!-- 0 || 無限使用 -->
           {{ getUsageLimitLabel(freeshipping) }}
        </td>
        <td class="py-4">
          <button @click="editFreeShipping(freeshipping)" class="border bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded shadow">編輯</button>
          <button @click="deleteFreeShipping(freeshipping.id)" class="border bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow">刪除</button>
        </td>
        
      </tr>
    </tbody>
  </table>
  <!-- Modal -->
  <div v-if="showModal">
    <FreeShippingModal
     :freeshippingData="currentFreeShipping"
     :is-editing="isEditing"
     @submitFreeShipping="handleFreeShippingSubmit"
     @close="showModal=false"  
    />
  </div> 

</div>  
</template>