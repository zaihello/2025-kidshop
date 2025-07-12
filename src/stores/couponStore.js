import { defineStore } from "pinia";
import axios from 'axios'

import { useAuthStore } from '../stores/authStore'
import { useCartStore } from "./cartStore";
import { usePaymentStore } from './paymentStore'  

import { formatUserCouponsList } from '../utils/couponUtils'

export const useCouponStore = defineStore('coupon',{
    state:() => ({
        usableCoupons:[],//可使用頁面
        invalidCoupons:[],//已失效頁面
        selectedDiscountCoupon:null,// ✅ 選擇折價券（amount）
        selectedFreeShippingCoupon:null,// ✅ 選擇免運券（freeShipping）
        manualCoupon:null,// ✅ 選擇手動輸入（通常是折價券）
        allCoupons: [],           // 原始 coupons
        allFreeshippings: [],      // 原始 freeshippings
        //7/10
        // selectedDiscountCouponId: null,
        // selectedFreeShippingCouponId: null,


    }),
    actions:{
        async getUserCoupons(){
            try{
                const authStore = useAuthStore()
                const userId = authStore.user.id
                // ✅ 同時取得優惠券與訂單資料
                const [userCouponsRes,couponsRes, ordersRes,freeshippingsRes] = await Promise.all([
                    axios.get(`https://204ed3432b06d7af.mokky.dev/usercoupons?user_id=${userId}`),
                    axios.get(`https://204ed3432b06d7af.mokky.dev/coupons`),
                    axios.get(`https://204ed3432b06d7af.mokky.dev/orders?user_id=${userId}`),
                    axios.get(`https://204ed3432b06d7af.mokky.dev/freeshippings`),
                ])

                const user = authStore.user
                const userCoupons = userCouponsRes.data
                const allCoupons = couponsRes.data
                const orders = ordersRes.data
                const freeshippings = freeshippingsRes.data

                // 儲存原始完整資料（供其他地方補完整資訊使用）
                this.allCoupons = allCoupons
                this.allFreeshippings = freeshippings
                
                // ✅ 格式化所有優惠券（含折價與免運券）
                const result = formatUserCouponsList(user,userCoupons,allCoupons,orders,freeshippings)

                // ✅ 狀態分類（頁面顯示用）
                this.usableCoupons = result.filter(c => c.status === 'usable')           
                this.invalidCoupons = result.filter( c => c.status === 'expired' || c.status ==='used' )

                console.log('7/9userCoupons:', userCoupons)
                // console.log('allCoupons:', allCoupons)
                // console.log('orders:', orders)
                // console.log('freeshippings:', freeshippings)

            }catch(error){
                console.error('載入優惠券失敗:', error)
            }
        },
        //選擇系統發送優惠卷
        setSelectedCoupon(coupon){
            const cartStore = useCartStore()

            if(coupon.offerType === 'amount' || coupon.offerType === 'percent'){
                this.selectedDiscountCoupon = coupon
                this.manualCoupon = null

                // ✅ 寫入 cartStore.cartItems.coupon
                cartStore.cartItems.coupon = {
                    couponId:coupon.couponId,
                    code:coupon.code,
                    discount:coupon.discount,
                    threshold:coupon.threshold,
                    title:coupon.title,
                    offerType:coupon.offerType
                }

            } else if(coupon.offerType === 'freeShipping'){
                this.selectedFreeShippingCoupon = coupon

                // ✅ 寫入 cartStore.cartItems.freeShipping
                cartStore.cartItems.freeShipping = {
                    couponId:coupon.couponId,
                    code: coupon.code,
                    discount: coupon.discount,
                    // threshold: coupon.threshold,
                    miniAmount: coupon.miniAmount ?? null,
                    miniPieces: coupon.miniPieces ?? null,
                    title: coupon.title
                }
            }
        },
        //手動輸入代碼優惠卷
        setCouponCodeInfo(codeInfo){
            const cartStore = useCartStore()

            this.manualCoupon = codeInfo
            this.selectedDiscountCoupon = null

            // ✅ 寫入 cartStore.cartItems.coupon（用 codeInfo）
            cartStore.cartItems.coupon = {
                couponId:codeInfo.couponId,
                code:codeInfo.code,
                discount:codeInfo.discount,
                threshold:codeInfo.threshold,
                title:codeInfo.title,
                offerType:codeInfo.offerType
            }
        },
      
        clearCoupons(){
            this.selectedDiscountCoupon = null
            this.selectedFreeShippingCoupon = null
            this.manualCoupon = null
        },
    },
    getters:{
        // ✅ 改為直接從 cartStore 讀取
        appliedDiscountCoupon: () => {
            const cartStore = useCartStore()
            return cartStore.cartItems.coupon || null
            
        },
        appliedFreeShippingCoupon: () => {
           const cartStore = useCartStore()
           return cartStore.cartItems.freeShipping || null
        },
        //7/10
//         selectedDiscountCouponComputed: (state) => {
//   return state.filteredUsableCoupons.find(c => 
//     c.id === state.selectedDiscountCouponId && c.offerType !== 'freeShipping'
//   ) || null
// },
// selectedFreeShippingCouponComputed: (state) => {
//   return state.filteredUsableCoupons.find(c => 
//     c.id === state.selectedFreeShippingCouponId && c.offerType === 'freeShipping'
//   ) || null
// },

        // 710
   //代替watch
  // filteredUsableCoupons: (state) => {
  //   const cartStore = useCartStore()
  //   const paymentStore = usePaymentStore()
  //   const authStore = useAuthStore()
  //   const selectedItems = cartStore.selectedItems
  //   // const selectedItems = cartStore.cartItems.items.filter(item => item.selected)

  //   const totalAmount = cartStore.totalAmount
  //   const selectedPayment = paymentStore.orderInfo.payment_info.method
  //   const selectedShipping = paymentStore.orderInfo.delivery_info.method
  //   const user = authStore.user
  //   const orders = cartStore.ordersData // 也可以在 store 中保存 ordersData

  //   return state.usableCoupons.filter(coupon => {
  //     if (coupon.offerType === 'freeShipping') {
  //       return isFreeShippingUsable(
  //         coupon.fullCouponData.promotion,
  //         coupon.fullCouponData.campaign,
  //         coupon.fullCouponData.paymentAndShipping.paymentMethods,
  //         coupon.fullCouponData.paymentAndShipping.shippingMethods,
  //         selectedShipping,
  //         selectedPayment,
  //         user,
  //         coupon.fullCouponData.targetGroup,
  //         selectedItems
  //       )
  //     } else {
  //       return isCouponUsable(
  //         coupon.fullCouponData,
  //         user,
  //         orders,
  //         selectedPayment,
  //         selectedShipping,
  //         selectedItems
  //       )
  //     }
  //   })
  // }


    },
})