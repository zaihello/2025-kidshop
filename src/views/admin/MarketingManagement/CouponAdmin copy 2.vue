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
      this.currentCoupon = { ...coupon,type:coupon.autoGrant ? 'auto' : 'code' };// 傳編輯資料進子元件
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
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6 ">優惠券管理</h1>

    <button @click="openAddModal" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded">新增優惠券</button>

    <!-- 優惠券列表 -->
    <table class="w-full border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-3">活動名稱</th>
          <th class="p-3">類型</th>
          <th class="p-3">優惠卷名稱</th>
          <th class="p-3">優惠碼</th>
          <th class="p-3">折扣</th>
          <th class="p-3">條件</th>
          <th class="p-3">有效期限</th>
          <th class="p-3">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="coupon in coupons" :key="coupon.id" class="border-t">
          <td class="p-3">{{ coupon.campaignTitle }}</td>
          <td class="p-3">{{ coupon.autoGrant ? '自動發放' : '手動輸入'}}</td>
          <td class="p-3">{{ coupon.title }}</td>
          <td class="p-3 ">
            <span v-if="!coupon.autoGrant">{{coupon.code}}</span>
            <span v-else class="text-gray-400">-</span>
          </td>
          <td class="p-3">{{ coupon.discount }} 元</td>
          <td class="p-3">
           <!-- {{ getConditionText(coupon) }} -->
           滿{{ coupon.threshold }}元
          </td>
          <td class="p-3">{{ coupon.endDate }}</td>
          <td class="p-3 space-x-2">
            <button @click="editCoupon(coupon)" class="text-blue-600 hover:underline">編輯</button>
            <button @click="deleteCoupon(coupon.id)" class="text-red-600 hover:underline">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <!---->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" >
      <AddCouponModal
        :couponData="currentCoupon"
        @submitCoupon="handleCouponSubmit"   
        @close="showModal = false"
      />
    </div>
  </div>
</template>

