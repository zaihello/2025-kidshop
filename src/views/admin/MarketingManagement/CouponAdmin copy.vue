<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-2xl font-bold mb-6">優惠券管理</h1>

    <button @click="openAddModal" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded">新增優惠券</button>

    <!-- 優惠券列表 -->
    <table class="w-full border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="p-3">名稱</th>
          <th class="p-3">類型</th>
          <th class="p-3">折扣</th>
          <th class="p-3">條件</th>
          <th class="p-3">有效期限</th>
          <th class="p-3">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="coupon in coupons" :key="coupon.id" class="border-t">
          <td class="p-3">{{ coupon.name }}</td>
          <td class="p-3">{{ coupon.type }}</td>
          <td class="p-3">{{ coupon.amount }} 元</td>
          <td class="p-3">
            <div v-if="coupon.condition === 'overAmount'">滿 {{ coupon.threshold }} 元</div>
            <div v-else>-</div>
          </td>
          <td class="p-3">{{ coupon.expiresAt }}</td>
          <td class="p-3 space-x-2">
            <button @click="editCoupon(coupon)" class="text-blue-600 hover:underline">編輯</button>
            <button @click="deleteCoupon(coupon.id)" class="text-red-600 hover:underline">刪除</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 表單 Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4">{{ form.id ? '編輯優惠券' : '新增優惠券' }}</h2>
        <form @submit.prevent="submitCoupon">
          <div class="mb-3">
            <label class="block text-sm mb-1">名稱</label>
            <input v-model="form.name" type="text" class="border p-2 w-full" required />
          </div>

          <div class="mb-3">
            <label class="block text-sm mb-1">類型</label>
            <select v-model="form.type" class="border p-2 w-full">
              <option value="auto">自動發放</option>
              <option value="code">輸入代碼</option>
            </select>
          </div>

          <div class="mb-3" v-if="form.type === 'code'">
            <label class="block text-sm mb-1">代碼</label>
            <input v-model="form.code" type="text" class="border p-2 w-full" />
          </div>

          <div class="mb-3">
            <label class="block text-sm mb-1">折扣金額</label>
            <input v-model.number="form.amount" type="number" class="border p-2 w-full" required />
          </div>

          <div class="mb-3">
            <label class="block text-sm mb-1">使用條件</label>
            <select v-model="form.condition" class="border p-2 w-full">
              <option value="">無</option>
              <option value="overAmount">滿額</option>
            </select>
          </div>

          <div class="mb-3" v-if="form.condition === 'overAmount'">
            <label class="block text-sm mb-1">門檻金額</label>
            <input v-model.number="form.threshold" type="number" class="border p-2 w-full" />
          </div>

          <div class="mb-3">
            <label class="block text-sm mb-1">有效期限</label>
            <input v-model="form.expiresAt" type="date" class="border p-2 w-full" required />
          </div>

          <div class="mb-3">
            <label class="block text-sm mb-1">活動名稱（可選）</label>
            <input v-model="form.campaign" type="text" class="border p-2 w-full" />
          </div>

          <div class="flex justify-end space-x-2 mt-4">
            <button type="button" @click="closeModal" class="px-4 py-2 bg-gray-300 rounded">取消</button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">儲存</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      coupons: [],
      showModal: false,
      form: {
        id: null,
        name: '',
        type: 'auto',
        code: '',
        amount: 0,
        condition: '',
        threshold: 0,
        expiresAt: '',
        campaign: ''
      }
    };
  },
  methods: {
    async getCoupons() {
      const res = await axios.get('https://your-api-url/coupons');
      this.coupons = res.data;
    },
    openAddModal() {
      this.resetForm();
      this.showModal = true;
    },
    editCoupon(coupon) {
      this.form = { ...coupon };
      this.showModal = true;
    },
    async deleteCoupon(id) {
      if (confirm('確定刪除這張優惠券？')) {
        await axios.delete(`https://your-api-url/coupons/${id}`);
        this.getCoupons();
      }
    },
    async submitCoupon() {
      const payload = {
        name: this.form.name,
        type: this.form.type,
        amount: this.form.amount,
        expiresAt: this.form.expiresAt,
        campaign: this.form.campaign,
        ...(this.form.type === 'code' && { code: this.form.code }),
        ...(this.form.condition === 'overAmount' && { condition: 'overAmount', threshold: this.form.threshold })
      };

      if (this.form.id) {
        await axios.patch(`https://your-api-url/coupons/${this.form.id}`, payload);
      } else {
        await axios.post('https://your-api-url/coupons', payload);
      }

      this.getCoupons();
      this.closeModal();
    },
    resetForm() {
      this.form = {
        id: null,
        name: '',
        type: 'auto',
        code: '',
        amount: 0,
        condition: '',
        threshold: 0,
        expiresAt: '',
        campaign: ''
      };
    },
    closeModal() {
      this.showModal = false;
    }
  },
  mounted() {
    this.getCoupons();
  }
};
</script>
