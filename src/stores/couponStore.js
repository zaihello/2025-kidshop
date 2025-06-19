import { defineStore } from "pinia";
import axios from 'axios'

import { useAuthStore } from '../stores/authStore'
import { formatUserCouponsList } from '../utils/couponUtils'

export const useCouponStore = defineStore('coupon',{
    state:() => ({
        usableCoupons:[],//可使用頁面
        invalidCoupons:[],//已失效頁面
        selectedDiscountCoupon:null,// ✅ 折價券（amount）
        selectedFreeShippingCoupon:null,// ✅ 免運券（freeShipping）
        manualCoupon:null,// ✅ 手動輸入（通常是折價券）
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
                

                const{usableCoupons,invalidCoupons} = formatUserCouponsList(user,userCoupons,allCoupons,orders,freeshippings)

                // 分別顯示在不同頁面
                this.usableCoupons = usableCoupons          
                this.invalidCoupons = invalidCoupons
                console.log('6/3',authStore.user)
            }catch(error){
                console.error('載入優惠券失敗:', error)
            }
        },
      
        setSelectedCoupon(coupon){
            if(coupon.offerType === 'amount'){
                this.selectedDiscountCoupon = coupon
                this.manualCoupon = null
            } else if(coupon.offerType === 'freeShipping'){
                this.selectedFreeShippingCoupon = coupon
            }
        },
      
        setCouponCodeInfo(codeInfo){
            this.manualCoupon = codeInfo
            this.selectedDiscountCoupon = null
        },
      
        clearCoupons(){
            this.selectedDiscountCoupon = null
            this.selectedFreeShippingCoupon = null
            this.manualCoupon = null
        },
    },
    getters:{
        //折價卷統一格式 呈現在/cartsdata api裡
        appliedDiscountCoupon(state){
            const coupon = state.selectedDiscountCoupon || state.manualCoupon
            return coupon
                ?{
                    code:coupon.code,
                    discount:coupon.discount,
                    threshold:coupon.threshold,
                    title:coupon.title,
                }
                : null
        },
         //免費卷統一格式 呈現在/cartsdata api裡
        appliedFreeeShippingCoupon(state){
            const coupon = state.selectedFreeShippingCoupon
            return coupon
                ?{
                    code:coupon.code,
                    discount:coupon.discount,// 運費金額
                    threshold:coupon.threshold,
                    title:coupon.title,
                }
                : null
        },
    },
})