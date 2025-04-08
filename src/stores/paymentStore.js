import { defineStore } from 'pinia'
import { useCartStore } from '../stores/cartStore'

export const usePaymentStore =defineStore("payment",{
    state:() =>({
        selectedPayment: "linepay", // 預設選中 LINE Pay
        freeShippingThreshold: 1000, // 🚛 免運門檻
        paymentMethods: [
            {
              value: "7-11",
              name: "7-11 - 取貨付款",
              description: "7-11：消費滿 1000 免運費，未滿酌收 50 元物流費。",
              logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/7-eleven_logo.svg",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 50 // 📦 未達免運的運費
            },
            {
              value: "familymart",
              name: "全家 - 取貨付款",
              description: "全家：消費滿 1000 免運費，未滿酌收 50 元物流費。",
              logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Famiport.svg/1280px-Famiport.svg.png",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 50 // 📦 未達免運的運費
            },
            {
              value: "cod",
              name: "貨到付款",
              description: "宅配：消費滿 1000 免運費，未滿酌收 60 元物流費。",
              logo: "",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 60 // 📦 未達免運的運費
            },
            {
              value: "credit",
              name: "信用卡線上付款",
              description: "宅配：消費滿 1000 免運費，未滿酌收 60 元物流費。",
              logo: "",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 60 // 📦 未達免運的運費
            },
            {
              value: "linepay",
              name: "LINE Pay",
              description: "(可用 LINE Points 折抵) 宅配：消費滿 1000 免運費，未滿酌收 60 元物流費。",
              logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_Pay_logo.png",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 60 // 📦 未達免運的運費
            }
        ]
    }),
    getters:{
        //選擇付款方式
        selectedMethod(state) {
            return state.paymentMethods.find(m => m.value === state.selectedPayment) || null;
        },
        //運費 考慮總金額免運問題、選擇支付的方式
        shippingFee() {
            const cartStore = useCartStore();
            const totalAmount = cartStore.totalAmount;// 只計算 selected: true 的商品總額
            // 當 totalAmount 為 0（即沒有勾選商品），運費為 0
            if (totalAmount === 0) {
                return 0;
            }
            return totalAmount >= this.selectedMethod.freeShippingThreshold ? 0 : this.selectedMethod.shippingFee;
        },
        //還差多少免運  考慮總金額免運問題、選擇支付的方式
        remainingForFreeShipping() {
            const cartStore = useCartStore();
            const totalAmount = cartStore.totalAmount;
            return totalAmount >= this.selectedMethod.freeShippingThreshold ? 0 : this.selectedMethod.freeShippingThreshold - totalAmount;
        },
    },
    actions:{
        //選擇支付的方式
        setSelectedPayment(payment) {
            this.selectedPayment = payment;
        }
    },
}) 