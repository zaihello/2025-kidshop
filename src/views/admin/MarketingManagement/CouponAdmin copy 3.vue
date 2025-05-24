<script>
import axios from 'axios'
import AddCouponModal from '../../../components/AddCouponModal.vue' 

export default {
  components:{AddCouponModal},
  data() {
    return {
      showModal: false,
      coupons: [],// 優惠券列表
      currentCoupon: null, // 編輯用
    };        
  },
  methods: {
    async getCoupons() {
      const res = await axios.get('https://204ed3432b06d7af.mokky.dev/coupons');
      this.coupons = res.data;
    },
    openAddModal() {
      this.currentCoupon = null;
      this.showModal = true;
    },
    editCoupon(coupon) {
      //因後端autoGrant是布林值，手動轉換auto、code
      // this.currentCoupon = { ...coupon,type:coupon.autoGrant ? 'auto' : 'code' };// 傳編輯資料進子元件
      this.currentCoupon = coupon // 巢狀結構直接傳入即可
      this.showModal = true;
    },
    async deleteCoupon(id) {
      if (confirm('確定刪除這張優惠券？')) {
        await axios.delete(`https://204ed3432b06d7af.mokky.dev/coupons/${id}`);
        this.getCoupons();// 重新取得資料
      }
    },
    async handleCouponSubmit(data){
      console.log('父元件收到的優惠券資料:', data); 
      if(data.id){
        //編輯
        await axios.patch(`https://204ed3432b06d7af.mokky.dev/coupons/${data.id}`,data)
      }else{
        //新增
        await axios.post(`https://204ed3432b06d7af.mokky.dev/coupons/`,data)
      }
      this.showModal = false
      await this.getCoupons()// 重新取得資料
    },
    // getConditionText(coupon){
    //   const map = {
    //     overAmount:(c) => `滿${c.threshold}元`,
    //     newUser:(c) => `(首次登入)滿${c.threshold}元`,
    //     birthday:(c) => `(當月壽星)滿${c.threshold}元`
    //   }
    //   return map[coupon.condition]?.(coupon) || '-'
    // },
  },
  mounted() {
    this.getCoupons();
  }
};
</script>

<template>
<div>  
  <h1 class="text-2xl font-bold mb-6 text-center">滿額滿件優惠</h1>
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
      <tr v-for="coupon in coupons" :key="coupon.id" class="border hover:bg-gray-50">
        <td class="py-4">{{ coupon.campaign.basic.campaignTitle || '—' }}</td>
        <!-- <td class="py-4">網店</td> -->
        <td class="py-4">套用範圍</td>
        <td class="py-4">
          {{ coupon.atartDate }} 至
          <span v-if="coupon.endDate">{{ coupon.endDate }}</span>
          <span v-else>永不過期</span>
        </td>
        <td class="py-4">目標群組</td>
        <td class="py-4">{{ coupon.autoGrant? '自動套用' : '優惠代碼' }}</td>
        <td class="py-4">
          0 || 無限使用
        </td>
        <td class="py-4">
          <button @click="editCoupon(coupon)" class="border bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded shadow">編輯</button>
          <button @click="deleteCoupon(coupon.id)" class="border bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow">刪除</button>
        </td>
        
      </tr>
    </tbody>
  </table>
  <!-- Modal -->
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <AddCouponModal
     :couponData="currentCoupon"
     @submitCoupon="handleCouponSubmit"
     @close="showModal=false"  
    />
  </div> 

</div>  
</template>