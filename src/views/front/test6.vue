<!-- 子 -->
<template>
  <div class="relative bg-white overflow-auto max-h-[90vh] w-full max-w-96 rounded shadow-lg p-4">
    <!-- X 關閉按鈕 -->
    <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500 hover:text-black text-xl font-bold">
        ×
    </button>
    <h2 class="text-lg font-bold text-center mb-4">
      {{ localForm.id ? '編輯優惠券' : '新增優惠券' }}
    </h2>

    <form @submit.prevent="submitCoupon">
      <!-- 活動名稱 -->
      <label class="block mb-2 font-semibold">活動名稱</label>
      <input v-model="localForm.campaignTitle" type="text" class="mb-4 p-2 border rounded w-full" placeholder="例如：母親節加碼" />

      <!-- 優惠類型 -->
      <label class="block mb-2 font-semibold">優惠類型</label>
      <select v-model="localForm.type" class="mb-4 p-2 border rounded w-full">
        <option value="auto">自動發放型優惠券</option>
        <option value="code">手動輸入折扣碼</option>
      </select>

      <!-- 優惠券名稱 -->
      <label class="block mb-2 font-semibold">優惠券名稱</label>
      <input v-model="localForm.title" type="text" class="mb-4 p-2 border rounded w-full" placeholder="例如：首次登入送100元" />

      <!-- 折扣金額 -->
      <label class="block mb-2 font-semibold">折扣金額</label>
      <input v-model.number="localForm.discount" type="number" class="mb-4 p-2 border rounded w-full" placeholder="例如：100" />

      <!-- 優惠碼（僅 type 為 code 時顯示） -->
      <div v-if="localForm.type === 'code'">
        <label class="block mb-2 font-semibold">優惠碼</label>
        <input v-model="localForm.code" type="text" class="mb-4 p-2 border rounded w-full" placeholder="例如：MAY100" />
      </div>

      <!-- 發放條件（僅 type 為 auto 時顯示） -->
      <div v-if="localForm.type === 'auto'">
        <label class="block mb-2 font-semibold">發放條件</label>
        <select v-model="localForm.condition" class="mb-4 p-2 border rounded w-full">
          <option value="newUser">首次登入</option>
          <option value="birthday">當月壽星</option>
          <option value="overAmount">滿額贈</option>
        </select>

        <div v-if="localForm.condition === 'overAmount'">
          <label class="block mb-2 font-semibold">門檻金額</label>
          <input v-model.number="localForm.threshold" type="number" class="mb-4 p-2 border rounded w-full" placeholder="例如：1500" />
        </div>
      </div>

      <!-- 有效期限 -->
      <label class="block mb-2 font-semibold">有效期限（結束日）</label>
      <input v-model="localForm.endDate" type="date" class="mb-4 p-2 border rounded w-full" />

      <!-- 按鈕 -->
      <div class="space-x-2 text-right">
        <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">取消</button>
        <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold">提交</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  props: {
    couponData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      localForm: {
        id: null,
        campaignTitle: '',
        type: 'auto',
        title: '',
        discount: 0,
        code: '',
        condition: 'newUser',
        threshold: null,
        endDate: ''
      }
    };
  },
  watch: {
    couponData: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.localForm = { ...this.localForm, ...newVal };
        }
      }
    }
  },
  methods: {
    submitCoupon() {
      const payload = {
        id: this.localForm.id,
        campaignTitle: this.localForm.campaignTitle,
        title: this.localForm.title,
        discount: this.localForm.discount,
        endDate: this.localForm.endDate,
        autoGrant: this.localForm.type === 'auto',
        ...(this.localForm.type === 'code' && { code: this.localForm.code }),
        ...(this.localForm.type === 'auto' && {
          condition: this.localForm.condition,
          ...(this.localForm.condition === 'overAmount' && {
            threshold: this.localForm.threshold
          })
        })
      };

      this.$emit('submit', payload); // 送出給父元件
    }
  }
};
</script>
