<!-- 父 -->
<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">優惠券管理</h1>

    <!-- ✅ 新增按鈕 -->
    <button @click="openAddModal" class="bg-green-600 text-white px-4 py-2 rounded mb-4">新增優惠券</button>

    <!-- 📋 優惠券列表 -->
    <table class="w-full border">
      <thead class="bg-gray-100">
        <tr>
          <th class="border p-2">名稱</th>
          <th class="border p-2">折扣</th>
          <th class="border p-2">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="coupon in coupons" :key="coupon.id">
          <td class="border p-2">{{ coupon.title }}</td>
          <td class="border p-2">{{ coupon.discount }}</td>
          <td class="border p-2 space-x-2">
            <!-- 📝 編輯按鈕 -->
            <button @click="openEditModal(coupon)" class="bg-yellow-500 text-white px-2 py-1 rounded">編輯</button>

            <!-- ❌ 刪除按鈕 -->
            <button @click="deleteCoupon(coupon.id)" class="bg-red-600 text-white px-2 py-1 rounded">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 🧩 彈窗元件 -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
        <test6
            :couponData="currentCoupon"
            @submit="handleCouponSubmit"
            @close="showModal = false"
        />
    </div>
    
  </div>
</template>

<script>
import test6 from './test6.vue';
import axios from 'axios';

export default {
  components: { test6 },
  data() {
    return {
      showModal: false,
      currentCoupon: null, // 編輯用
      coupons: [] // 優惠券列表
    };
  },
  methods: {
    async fetchCoupons() {
      const res = await axios.get(`https://204ed3432b06d7af.mokky.dev/coupons`);
      this.coupons = res.data;
    },
    openAddModal() {
      this.currentCoupon = null;
      this.showModal = true;
    },
    openEditModal(coupon) {
      this.currentCoupon = { ...coupon }; // 傳編輯資料進子元件
      this.showModal = true;
    },
    async deleteCoupon(id) {
      if (confirm('確定要刪除這張優惠券嗎？')) {
        await axios.delete(`https://204ed3432b06d7af.mokky.dev/coupons/${id}`);
        await this.fetchCoupons(); // 重新取得資料
      }
    },
    async handleCouponSubmit(data) {
      if (data.id) {
        // 編輯
        await axios.patch(`https://204ed3432b06d7af.mokky.dev/coupons/${data.id}`, data);
      } else {
        // 新增
        await axios.post(`https://204ed3432b06d7af.mokky.dev/coupons`, data);
      }

      this.showModal = false;
      await this.fetchCoupons(); // 重新取得資料
    }
  },
  mounted() {
    this.fetchCoupons();
  }
};
</script>
