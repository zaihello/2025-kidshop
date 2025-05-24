<!-- 之後建立頁面 -->
<script>
import { useCartStore } from '../../stores/cartStore'
export default{
    data(){
        return{ 
            isLoading:true, // 資料加載狀態
            // redeemedCoupons: [], // 儲存已領取的優惠券代碼
        }
    },
    computed:{
        cartStore() {
            return useCartStore();
        },
        availableCoupons(){
            return this.cartStore.availableCoupons;// 從 Store 中取得資料
        },
        redeemedCoupons(){
            return this.cartStore.redeemedCoupons
        },
    },
    methods:{
        //
        // isCouponActive(coupon) {
        //     if (!coupon || !coupon.start_date || !coupon.end_date) {
        //         console.error("無效的優惠券資料:", coupon);
        //         return false;
        //     }

        //     const now = new Date();
        //     const startDate = new Date(coupon.start_date);
        //     const endDate = new Date(coupon.end_date);
        //     return now >= startDate && now <= endDate;
        // },
        // 折扣活動(滿額折扣、優惠券)
        claimCoupon(inputCode){
            this.cartStore.claimCoupon(inputCode)
        },
        //檢查 coupon 的狀態
        getCouponState(coupon) {
            const now = new Date();
            const startDate = new Date(coupon.start_date);
            const endDate = new Date(coupon.end_date);

            if (now < startDate) {
                return 'notStarted'; // 未開始
            } else if (now > endDate) {
                return 'expired'; // 已過期
            } else if (this.redeemedCoupons.includes(coupon.code)) {
                return 'redeemed'; // 已領取
            }
            return 'available'; //領取
        },
    },
    // async mounted(){
    //     try {
    //         // 假設 cartStore 有一個載入優惠券的異步方法
    //         await this.cartStore.getDiscountData(); // 加載資料
    //         this.cartStore.loadCartFromLocalStorage();
    //     } catch (error) {
    //         console.error("加載優惠券失敗:", error);
    //     } finally {
    //         this.isLoading = false; // 確保無論成功或失敗都能停止載入中狀態
    //     }

    // },
    async mounted() {
        try {
            // 檢查 localStorage 是否已經有已加載的資料
            const storedCoupons = localStorage.getItem("AvailableCoupons");
        
            if (!storedCoupons) {
                // 如果沒有資料，才調用 API 獲取資料
                await this.cartStore.getDiscountData();
            } else {
                // 如果有資料，直接從 localStorage 加載
                this.cartStore.loadCartFromLocalStorage();
            }
            console.log('availableCoupons', this.availableCoupons);
        } catch (error) {
            console.error("加載資料失敗:", error);
        } finally {
            // 確保資料加載完畢後設置 isLoading 為 false
            this.isLoading = false;
        }
    },

}
</script>
<template>
    <!-- 優惠卷 -->
    <div class=""> 
        <!-- v-if="heartData.length === 0" -->
        <div v-if="isLoading" class="bg-gray-200 h-72 flex items-center justify-center">
            <h3>載入中...</h3>
        </div> 
        <div v-else-if="availableCoupons.length === 0" class="bg-orange-300 h-72 flex items-center justify-center">
            <h3>無收藏資料</h3>
        </div> 
        <!-- v-else -->
        <div v-else>
            <!-- 分頁顯示的商品 -->
                <!-- wishlistStore.paginatedWishlist grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4-->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="coupon in availableCoupons" :key="coupon.id" class="flex">
                    <div class="w-3/5 bg-orange-400 rounded-l-lg p-4">
                        <p>折抵${{ coupon.amount }}</p>
                        <p>消費滿${{ coupon.minSpend }}</p>
                        <p>有效日期:{{ coupon.start_date }} ~ {{ coupon.end_date }}</p>     
                    </div>
                    <div class="w-2/5 bg-orange-200 h-full flex items-center justify-center	rounded-r-lg">
                        <!-- <button 
                            class="border border-black rounded w-16 h-8"
                            @click="claimCoupon(coupon.code)"
                            :disabled="!isCouponActive(coupon)"
                            :class="{ 'disabled': !isCouponActive(coupon) }" 
                        >
                        {{ isCouponActive(coupon) ? '領取': '已領取' }}
                        </button> -->
                        <button 
                            class="border border-black rounded w-16 h-8"
                            @click="claimCoupon(coupon.code)"
                            :disabled="getCouponState(coupon) !== 'available'"
                            :class="{ 
                                'bg-gray-300 text-gray-500': getCouponState(coupon) !== 'available',
                                'bg-orange-500 text-white': getCouponState(coupon) === 'available',
                            }" 
                        >
                            <span v-if="getCouponState(coupon) === 'notStarted'">未開始</span>
                            <span v-else-if="getCouponState(coupon) === 'expired'">已過期</span>
                            <span v-else-if="getCouponState(coupon) === 'redeemed'">已領取</span>
                            <span v-else>領取</span>
                        </button>
                    </div>
                </div>
            </div>  
                
        </div> 
    </div> 
</template>
<style scoped>
button.disabled {
    background-color: #ccc;
    color: #999;
    cursor: not-allowed;
}

</style>