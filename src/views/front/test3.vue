<script>
import {
  Form,
  Field,
  ErrorMessage,
  defineRule,
  configure
} from 'vee-validate'
import {
  required,
  numeric,
  min,
  regex
} from '@vee-validate/rules'

// 定義驗證規則
defineRule('required', required)
defineRule('numeric', numeric)
defineRule('min', min)
defineRule('regex', regex)
defineRule('matchesCaptcha', (value, _, ctx) => {
  if (value === ctx.form.generatedCaptcha) return true
  return '驗證碼錯誤'
})

export default {
  components: {
    Form,
    Field,
    ErrorMessage
  },
  data() {
    return {
      orderId: 'A123456789',
      orderData: {
        final_price: 1500,
        created_at: new Date().toLocaleString()
      },
      cardSegments: ['', '', '', ''],
      expiryDate: '',
      cvc: '',
      captcha: '',
      generatedCaptcha: ''
    }
  },
  created() {
    this.generateCaptcha()
  },
  methods: {
    generateCaptcha() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      this.generatedCaptcha = Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join('')
    },
    resetForm() {
      this.cardSegments = ['', '', '', '']
      this.expiryDate = ''
      this.cvc = ''
      this.captcha = ''
      this.generateCaptcha()
    },
    completePayment() {
      const fullCardNumber = this.cardSegments.join('')
      alert(`付款成功\n卡號：${fullCardNumber}`)
    }
  }
}
</script>
<template>
  <div v-if="orderData" class="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-8 mt-10">
    <h2 class="text-2xl font-semibold mb-4 text-center">信用卡付款</h2>
    <p class="mb-2">訂單編號：{{ orderId }}</p>
    <p class="mb-2">交易金額：${{ orderData.final_price }}</p>
    <p class="mb-6">交易日期：{{ orderData.created_at }}</p>

    <Form @submit="completePayment" v-slot="{ errors }">
      <!-- 卡號 -->
      <label class="block font-medium mb-1">卡號</label>
      <div class="grid grid-cols-4 gap-2 mb-2">
        <Field
          v-for="(segment, index) in cardSegments"
          :key="index"
          v-model="cardSegments[index]"
          :name="'card' + index"
          rules="required|numeric|min:4"
          maxlength="4"
          class="border p-2 text-center"
          placeholder="0000"
        />
      </div>
      <ErrorMessage
        name="card0"
        class="text-red-500 text-sm"
      />
      <ErrorMessage
        name="card1"
        class="text-red-500 text-sm"
      />
      <ErrorMessage
        name="card2"
        class="text-red-500 text-sm"
      />
      <ErrorMessage
        name="card3"
        class="text-red-500 text-sm"
      />

      <!-- 有效期限 -->
      <label class="block font-medium mt-4 mb-1">有效期限</label>
      <Field
        name="expiryDate"
        v-model="expiryDate"
        rules="required|regex:/^(0[1-9]|1[0-2])\/\d{2}$/"
        placeholder="MM/YY"
        class="border p-2 w-full"
      />
      <ErrorMessage name="expiryDate" class="text-red-500 text-sm" />

      <!-- CVC -->
      <label class="block font-medium mt-4 mb-1">背面末3碼</label>
      <Field
        name="cvc"
        v-model="cvc"
        rules="required|numeric|min:3"
        placeholder="CVC"
        maxlength="3"
        class="border p-2 w-full"
      />
      <ErrorMessage name="cvc" class="text-red-500 text-sm" />

      <!-- 圖形驗證碼 -->
      <label class="block font-medium mt-4 mb-1">圖形驗證碼</label>
      <div class="flex items-center gap-3 mb-2">
        <span class="bg-gray-100 px-4 py-2 font-bold rounded tracking-widest">
          {{ generatedCaptcha }}
        </span>
        <button type="button" @click="generateCaptcha" class="text-blue-600 text-sm">重新產生</button>
      </div>
      <Field
        name="captcha"
        v-model="captcha"
        rules="required|matchesCaptcha"
        placeholder="請輸入上方驗證碼"
        class="border p-2 w-full"
      />
      <ErrorMessage name="captcha" class="text-red-500 text-sm" />

      <!-- 按鈕 -->
      <div class="flex justify-center gap-4 mt-8">
        <button
          type="button"
          @click="resetForm"
          class="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
        >
          重新填寫
        </button>
        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          模擬付款完成
        </button>
      </div>
    </Form>
  </div>
</template>
