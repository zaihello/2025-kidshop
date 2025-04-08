<template>
    <div>
      <h2>選擇優惠方式</h2>
      
      <!-- 紅利點數折抵 -->
      <div>
        <label>使用紅利點數：</label>
        <input type="number" v-model.number="bonusPoints" @input="applyBonusPoints" />
        <span>可折抵 {{ bonusDiscount }} 元</span>
      </div>
      
      <!-- 折扣碼 -->
      <div>
        <label>輸入折扣碼：</label>
        <input type="text" v-model="discountCode" />
        <button @click="applyDiscountCode">使用折扣碼</button>
        <span v-if="discountCodeError" class="error">{{ discountCodeError }}</span>
      </div>
      
      <!-- 優惠券選擇 -->
      <div>
        <label>選擇優惠券：</label>
        <select v-model="selectedCoupon" @change="applyCoupon">
          <option v-for="coupon in coupons" :key="coupon.id" :value="coupon">
            {{ coupon.name }} - 折抵 {{ coupon.discount }} 元
          </option>
        </select>
      </div>
      
      <h3>總金額：{{ finalTotal }} 元</h3>
    </div>
  </template>
  
  <script> 
  import { useCartStore } from '../../stores/cartStore'
//   import { useCartStore } from '@/stores/cartStore';
  
  export default {
    data() {
      return {
        cartStore: useCartStore(),
        bonusPoints: 0,
        discountCode: '',
        selectedCoupon: null,
        discountCodeError: '',
        discountAmount: 0,
        coupons: [
          { id: 1, name: '滿1000折100', discount: 100, minAmount: 1000 },
          { id: 2, name: '滿2000折250', discount: 250, minAmount: 2000 }
        ],
        discountCodes: {
          'SAVE100': 100,
          'WELCOME50': 50
        }
      };
    },
    computed: {
      cartStore(){
        return useCartStore()
      },

      bonusDiscount() {
        return Math.min(this.bonusPoints * 0.1, this.cartStore.total);
      },
      finalTotal() {
        return Math.max(this.cartStore.total - this.discountAmount, 0);
      }
    },
    methods: {
      applyBonusPoints() {
        this.discountAmount = this.bonusDiscount;
      },
      applyDiscountCode() {
        if (this.discountCodes[this.discountCode]) {
          this.discountAmount = this.discountCodes[this.discountCode];
          this.discountCodeError = '';
        } else {
          this.discountCodeError = '無效的折扣碼';
        }
      },
      applyCoupon() {
        if (this.selectedCoupon && this.cartStore.total >= this.selectedCoupon.minAmount) {
          this.discountAmount = this.selectedCoupon.discount;
        }
      }
    }
  };
  </script>
  
  <style>
  .error {
    color: red;
  }
  </style>
  