<template>
  <div class="checkout-container">
    <!-- 步驟導覽 -->
    <div class="steps">
      <div
        v-for="step in steps"
        :key="step.id"
        :class="['step', { active: activeStep === step.id, clickable: canGoToStep(step.id) }]"
        @click="goToStep(step.id)"
      >
        {{ step.label }}
      </div>
    </div>

    <!-- 內容區 -->
    <div class="step-content">
      <div v-if="activeStep === 1">
        <h2>🛒 購物清單</h2>
        <p>這裡是購物車商品清單。</p>
        <button @click="nextStep">下一步：填寫資料</button>
      </div>

      <div v-else-if="activeStep === 2">
        <h2>📝 填寫資料</h2>
        <p>請輸入收件人、付款資訊等等。</p>
        <button @click="prevStep">返回：購物清單</button>
        <button @click="nextStep">下一步：訂購完成</button>
      </div>

      <div v-else-if="activeStep === 3">
        <h2>✅ 訂購完成</h2>
        <p>感謝您的訂購！訂單已成立。</p>
        <button @click="goHome">回首頁</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeStep: 1,
      isOrderSubmitted: false,
      steps: [
        { id: 1, label: '1. 購物清單' },
        { id: 2, label: '2. 填寫資料' },
        { id: 3, label: '3. 訂購完成' },
      ]
    }
  },
  methods: {
    canGoToStep(stepId) {
      // 只允許回去，或當還沒送出訂單時可點擊
      return !this.isOrderSubmitted && stepId < this.activeStep
    },
    goToStep(stepId) {
      if (this.canGoToStep(stepId)) {
        this.activeStep = stepId
      }
    },
    nextStep() {
      if (this.activeStep < 3) {
        this.activeStep++
      }
      if (this.activeStep === 3) {
        this.isOrderSubmitted = true
      }
    },
    prevStep() {
      if (this.activeStep > 1) {
        this.activeStep--
      }
    },
    goHome() {
      alert('回首頁功能尚未實作')
    }
  }
}
</script>

<style scoped>
.checkout-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.step {
  padding: 10px 20px;
  border-radius: 8px;
  background: #eee;
  cursor: default;
  transition: all 0.3s;
}

.step.clickable {
  cursor: pointer;
  background: #ddd;
}

.step.active {
  background: #007bff;
  color: white;
  font-weight: bold;
}
</style>
