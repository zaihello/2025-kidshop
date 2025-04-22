<!-- 測試用導覽列 router -->
<template>
    <div class="checkout-layout">
      <div class="steps">
        <router-link
          v-for="step in steps"
          :key="step.id"
          :to="step.path"
          :class="['step', { active: $route.path === step.path, disabled: isSubmitted && step.id !== 3 }]"
          @click.prevent="onStepClick(step)"
        >
          {{ step.label }}
        </router-link>
      </div>
      <router-view />
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isSubmitted: false,
        steps: [
          { id: 1, label: '1. 購物清單', path: '/cart/cartlist' },
          { id: 2, label: '2. 填寫資料', path: '/cart/paylist' },
          { id: 3, label: '3. 訂購完成', path: '/cart/orderdone' },
        ]
      }
    },
    methods: {
      onStepClick(step) {
        if (this.isSubmitted && step.id !== 3) return // 完成後不可點前面
        this.$router.push(step.path)
      }
    },
    watch: {
      $route(to) {
        if (to.path === '/cart/orderdone') {
          this.isSubmitted = true
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .steps {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .step {
    padding: 10px 20px;
    background: #eee;
    border-radius: 8px;
    text-decoration: none;
    color: black;
  }
  .step.active {
    background: #007bff;
    color: white;
  }
  .step.disabled {
    pointer-events: none;
    opacity: 0.5;
  }
  </style>
  