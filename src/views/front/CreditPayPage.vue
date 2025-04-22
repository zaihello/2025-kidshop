<script>
import { useAuthStore } from '../../stores/authStore'
import axios from 'axios'
//VeeValidate 驗證
import { Form, Field, ErrorMessage, defineRule, configure } from 'vee-validate'
import { required, numeric, min,max, regex } from '@vee-validate/rules'

// 定義驗證規則
defineRule('required', required)
defineRule('numeric', numeric)
defineRule('min', min)
defineRule('max', max)
defineRule('regex', regex)


defineRule('expiryDate', (value) => {
  if (!value) return '請輸入有效期限';

  const [month, year] = value.split('/');

  if (!month || !year || month.length !== 2 || year.length !== 2) {
    return '格式錯誤，請輸入 MM/YY';
  }

  const monthNum = parseInt(month, 10);
  const yearNum = parseInt('20' + year, 10); // 轉換成 20XX 年

  if (isNaN(monthNum) || isNaN(yearNum)) {
    return '格式錯誤，請輸入數字';
  }

  if (monthNum < 1 || monthNum > 12) {
    return '月份必須介於 01 到 12';
  }

  const today = new Date();
  const expiryDate = new Date(yearNum, monthNum); // 到當月月底（下個月的第 1 天）

  if (expiryDate <= today) {
    return '卡片已過期';
  }

  return true;
});

export default {
  name: "CreditPayPage",
  components:{ Form,Field,ErrorMessage },
  data() {
    return {  
      orderData: null,//若資料來自 API，初始化設 null 最安全、語意最明確。代表「尚未載入資料」，適合用來區分「尚未請求」和「已請求但為空資料」的情況  
      orderId:'',//訂單編號
      //   orderId: this.$route.params.orderId,

      //421
      cardSegments: ['', '', '', ''],//卡號
      expiryDate: '',//有效期限
      cvc: '',//背面末3碼
      captcha: '',//輸入驗證碼
      generatedCaptcha: '',//產生的驗證碼

    };
  },
  created() {
    this.orderId = this.$route.params.id; // 因為路由是 /credit/:id
    this.generateCaptcha();
    this.getOrder()
  },
  methods: {
    async getOrder(){
          const authStore = useAuthStore();
          const userId = authStore.id;
          const token = authStore.token;

          try{
            const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/orders?userId=${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
          });
             // 假設只取最後一筆訂單
          this.orderData = response.data[response.data.length - 1]; 
          }catch{}
    },
    //產生驗證碼
    generateCaptcha() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      this.generatedCaptcha = Array.from({ length: 5 }, () =>
        chars.charAt(Math.floor(Math.random() * chars.length))
      ).join("");

      //驗證 generatedCaptcha 是否一致
      defineRule('matchesCaptcha', (value) => {
        const userInput = value?.trim().toUpperCase();// 忽略大小寫比對
        const correctCaptcha = this.generatedCaptcha?.toUpperCase();
        return userInput === correctCaptcha ? true : '驗證碼錯誤';
      });

    },
   
    // 模擬付款完成按鈕
    async completePayment() {
        await this.markOrderAsPaid(); // ⬅️ 先更新付款資訊
        this.$router.push("/cart/orderdone"); // ⬅️ 再導頁 
    },
    //結帳後有transaction_id、paid_at、status資料產生
    async markOrderAsPaid() {
      const authStore = useAuthStore();
      const token = authStore.token;

      const transactionId = `TXN-${Date.now()}`;
      
      //時間格式
      const now = new Date()
      const createdAt = this.formatDateTime(now)

      try {
        // 先取得該筆訂單，取得原本的 payment_info
        const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/orders/${this.orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 合併原本的資料(原本資料會被覆蓋過去)再 patch
        const updatedPaymentInfo = {
          ...data.payment_info,
          transaction_id: transactionId,
          paid_at: createdAt,
          status: "已付款"
        };

        await axios.patch(`https://204ed3432b06d7af.mokky.dev/orders/${this.orderId}`, {
          payment_info: updatedPaymentInfo
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

      } catch (error) {
        console.error("更新付款資訊失敗：", error);
      }
    },

    //重新填寫按鈕 421
    resetForm() {
      this.cardSegments = ['', '', '', '']
      this.expiryDate = "";
      this.cvc = "";
      this.captcha = "";
      this.generateCaptcha();
    },
    //格式化日期 2025-04-14 19:05:09
    formatDateTime(dateStr) {
      const date = new Date(dateStr)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    },
  }
};
</script>

<template >
<div class="bg-stone-200 py-20 p-8">  
  <div v-if="orderData" class="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-8 my-10">
    <h2 class="text-2xl font-semibold mb-4 text-center">信用卡付款</h2>
    <p class="mb-2">訂單編號： {{ orderId }}</p>
    <p class="mb-2">交易金額: ${{ orderData.final_price }}</p>
    <p class="mb-6">交易日期:{{ orderData.created_at }}</p>
    <!-- v-slot="{ errors }" -->
    <Form @submit="completePayment" >
      <!-- 卡號 -->
      <div>
        <label class="block font-medium mb-1">卡號</label>
        <div class="grid grid-cols-4 gap-2 mb-2">
          <Field
            v-for="(segment, index) in 4"
            :key="index"
            v-model="cardSegments[index]"
            :name="'card' + index"
            rules="required|numeric|min:4|max:4"
            maxlength="4"
            class="border p-2 text-center rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            :placeholder="index === 0 ? '4622' : '0000'"
          />
        </div>

        <!-- 集中錯誤訊息呈現 -->
        <div class="grid grid-cols-4 gap-2 mb-4 text-sm text-red-500">
          <ErrorMessage :name="'card0'" />
          <ErrorMessage :name="'card1'" />
          <ErrorMessage :name="'card2'" />
          <ErrorMessage :name="'card3'" />
        </div>
      </div>  
      <!-- 有效期限-->
      <div>
        <label class="block font-medium mt-4 mb-1">有效期限</label>
        <Field
          name="expiryDate"
          v-model="expiryDate"
          rules="required|expiryDate"
          placeholder="MM/YY"
          class="border p-2 w-full"
        />
        <ErrorMessage name="expiryDate" class="text-red-500 text-sm" />
      </div> 
      <!-- CVC -->
      <div>
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
      </div>
      <!-- 422 -->
      <div>
        <!-- 圖形驗證碼 -->
        <label class="block font-medium mt-4 mb-1">圖形驗證碼</label>
        <div class="flex items-center gap-3 mb-2">
          <span class="bg-gray-200 text-lg px-4 py-2 font-bold rounded tracking-widest">
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
        <ErrorMessage name="captcha" class="text-red-500 text-sm"/>
      </div>
      <!-- 按鈕 -->
      <div class="flex gap-4 mt-6">
        <button @click="resetForm" class="bg-gray-400 text-white px-4 py-2 rounded">重新填寫</button>

        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
          模擬付款完成
        </button>
      </div>
    </Form>

  </div>
</div>  
</template>

