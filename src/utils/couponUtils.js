import { isUserMatchedTargetGroup } from './freeShippingUtils'

// 判斷折價卷是否為首次購買（根據 ordersData 判斷該 user 是否沒有已購買紀錄） 
export function isFirstPurchase(userId,ordersData = []){
    const userOrders = ordersData.filter(order => order.user_id === userId && order.payment_info.status === 'paid')

    // console.log('userOrders:',userOrders)
    //訂單沒有付款過的視為首次
    return userOrders.length === 0
}

// 判斷折價卷是否為生日當月
export function isBirthdayMonth(birthday){
    if(!birthday) return false
    const birthMonth = new Date(birthday).getMonth()
    const currentMonth = new Date().getMonth()
    return birthMonth === currentMonth
}

//折價券與免運券自動發放到該使用者的優惠卷管理中 
export async function autoIssueAllCoupons({user,axiosInstance}){
  const userId = user.id

  const [couponsRes,freeshippingsRes,ordersRes,userCouponsRes] = await Promise.all([
    axiosInstance.get(`/coupons`),
    axiosInstance.get(`/freeshippings`),
    axiosInstance.get(`/orders?user_id=${userId}`),
    axiosInstance.get(`/usercoupons?user_id=${userId}`)
  ])

  const allCoupons = couponsRes.data
  const freeshippings = freeshippingsRes.data
  const ordersData = ordersRes.data
  const existingUserCoupons = userCouponsRes.data

  //折價卷
  const availableCoupons = allCoupons.filter(coupon => {
    return isTargetGroupUsable(coupon.targetGroup, user, ordersData)
  })


  for(const coupon of availableCoupons){
    const alreadyIssued = existingUserCoupons.some(uc => uc.coupon_id === coupon.id)
    if(!alreadyIssued){
      await axiosInstance.post(`/usercoupons`,{
        user_id:userId,
        coupon_id:coupon.id,
        used:false,
        used_at:null,
        expired:false,
        type:'discount',
      })
    }
  }

  // 免運券
  for(const freeShipping of freeshippings){
    const isMatched = isUserMatchedTargetGroup(user,freeShipping.targetGroup)
    if(!isMatched) continue

    const alreadyIssued = existingUserCoupons.some(uc => uc.coupon_id === freeShipping.id)
    if(!alreadyIssued){
      await axiosInstance.post(`/usercoupons`,{
        user_id:userId,
        coupon_id:freeShipping.id,
        used:false,
        used_at:null,
        expired:false,
        type:'freeShipping',
      })
    }
  }
 
  // 更新過期狀態（要帶入兩類 coupon）
  await updateExpiredUserCoupons({
    userCoupons:existingUserCoupons,
    allCoupons,
    freeshippings,
    axiosInstance
  })
}


//判斷優惠卷是否過期
export function isExpired (endDateStr) {
  if(!endDateStr) return false
  const today = new Date().setHours(0,0,0,0)
  const endDate = new Date(endDateStr).setHours(0,0,0,0)
  return endDate < today
}


//status: usable已領取 expired已過期 used以使用。result為可使用頁面、已失效頁面資料格式呈現在前端。 7/3
export function formatUserCouponsList(user, userCoupons, allCoupons, ordersData, freeshippings) {
  const result = []
  
  // 先從訂單中找出所有使用過的優惠券 ID
  const usedCouponIds = new Set(ordersData.map(order => order?.coupon?.code).filter(Boolean))
  
  // ✅ 處理 /userCoupons api (折扣券)
  userCoupons.forEach(userCoupon => {
    const matched = allCoupons.find(c => c.id === userCoupon.coupon_id)
    if(!matched) return

    const promotion = matched.promotion
    // 取得正確的折扣資料
    const offerType = promotion.basic.offerType
    const selectedMethod = promotion.useCoupons.selectedReceiveMethod 
    let codeType = 'system'
    let code = ''
    let validFrom = null
    let validTo = null
    let threshold = 0
    let discount = 0
    
    // ⬇️ 折扣資訊
    if (offerType === 'percent') {
      threshold = Number(promotion.percentDiscount.threshold)
      discount = Number(promotion.percentDiscount.discount)
    } else if (offerType === 'amount') {
      threshold = Number(promotion.amountDiscount.threshold)
      discount = Number(promotion.amountDiscount.discount)
    }

    // ⬇️ 優惠碼與效期
    if(selectedMethod === 'EnterCouponCode') {
      const enter = promotion.useCoupons.enterCouponCode
      const codeTypeSelected = enter.selectedCodeType
      if(codeTypeSelected === 'Universal') {
        codeType = 'manual'//manual手動輸入代碼
        code = enter.universal.code
        validFrom = enter.universal.promotionStartDate
        validTo = enter.universal.promotionEndDate
      }else{
        codeType = 'manual'
        code = '[多組代碼]'
        validFrom = enter.independent.promotionStartDate
        validTo = enter.independent.promotionEndDate
      }
    }else{
      const inCenter = promotion.useCoupons.inCenter
      codeType = 'system'//自動發放型券 
      code = inCenter.code
      validFrom = inCenter.promotionStartDate
      validTo = inCenter.promotionEndDate
    }
    
    // ⬇️ 狀態判斷 原本
    let status = 'usable'
    if(userCoupon.used || usedCouponIds.has(code)) {
     status = 'used'
    }else if (userCoupon.expired ) {//
     status = 'expired'
    }

    result.push({
      id:userCoupon.id,
      couponId:matched.id,
      title:matched.campaign.basic.campaignTitle,
      offerType,
      threshold,
      discount,
      codeType,
      code,
      validFrom,
      validTo,
      status,
      fullCouponData: matched // ✅ 加入完整資料給 isCouponUsable 使用
    })
  })
  // ✅ 處理 /freeshippings api 免運券
  freeshippings.forEach(coupon => {
    // 只處理 userCoupon 有對應的免運券
    const userCoupon = userCoupons.find(u => u.coupon_id === coupon.id)
    if (!userCoupon) return

    const promotion = coupon.promotion?.useCoupons?.inCenter || {}
    const title = coupon.campaign?.basic?.campaignTitle || ''
    const validFrom = promotion.promotionStartDate
    const validTo = promotion.promotionEndDate

    const threshold = coupon.campaign?.conditionThreshold || {}
    const miniAmount = threshold.miniAmount 
    const miniPieces = threshold.miniPieces 

    const discount = 60 // ❗️免運券固定設為 60，或你可調整

    let status = 'usable'
    if (userCoupon.used || usedCouponIds.has('自動套用免運')) {
      status = 'used'
    } else if (userCoupon.expired) {//
      status = 'expired'
    }

    result.push({
      id: userCoupon.id,
      couponId: coupon.id,
      title,
      offerType: 'freeShipping',
      miniAmount,
      miniPieces, 
      // threshold,
      discount,
      codeType: 'system',
      code: '自動套用免運',
      validFrom,
      validTo,
      status,
      fullCouponData: coupon, // ✅ 加入完整資料給 isFreeShippingUsable 使用
      // freeShipping:coupon //為了判斷該優惠卷是否符合使用(免運卷主體資料)
      
    })
  })
  // console.log('🎟️ 7/9格式化後的優惠券清單:', formattedCoupons)

  return result
 
}


// 更改/usercoupons的expired未使用已過期的折價卷、免運卷 原本
export async function updateExpiredUserCoupons({userCoupons,allCoupons,freeshippings,axiosInstance}){
  for(const userCoupon of userCoupons){
    if(userCoupon.used) continue

    let validTo = null

    if(userCoupon.type === 'discount'){
      const coupon = allCoupons.find( c => c.id === userCoupon.coupon_id )
      if(!coupon) continue
      validTo = getPromotionEndDate(coupon.promotion)
    }else if(userCoupon.type === 'freeShipping'){
      const freeShipping = freeshippings.find(f => f.id === userCoupon.coupon_id)
      if(!freeShipping) continue
      validTo = getPromotionEndDate(freeShipping.promotion)

    }else{
      // 若 type 是未知類型，也跳過
      continue
    }

    const shouldBeExpired = isExpired(validTo)

    if(userCoupon.expired !== shouldBeExpired){
      await axiosInstance.patch(`/usercoupons/${userCoupon.id}`,{
        expired:shouldBeExpired
      })
    }
  }

}


// 取得 promotion 的結束時間（適用於 /usercoupons 的 expired 判斷）
export function getPromotionEndDate(promotion) {
  if (!promotion || typeof promotion !== 'object') return null

  const selectedMethod = promotion.selectedMethod

  if (selectedMethod === 'automatic') {
    const auto = promotion.automatic || {}
    return auto.promotionEndDate || null
  }

  if (selectedMethod === 'UseCoupons') {
    const useCoupons = promotion.useCoupons || {}
    const method = useCoupons.selectedReceiveMethod

    if (method === 'InCenter') {
      return useCoupons.inCenter?.promotionEndDate || null
    }

    if (method === 'EnterCouponCode') {
      const enter = useCoupons.enterCouponCode || {}
      const type = enter.selectedCodeType

      if (type === 'Universal') {
        return enter.universal?.promotionEndDate || null
      }

      if (type === 'Independent') {
        return enter.independent?.promotionEndDate || null
      }
    }

    if (method === 'GetCoupons') {
      return useCoupons.getCoupons?.promotionEndDate || null
    }
  }

  if (selectedMethod === 'RecommendedActivities') {
    return promotion.recommended?.promotionEndDate || null
  }

  return null
}



// 將折價券、免運卷標記為已使用(在PayList.vue按下支付按鈕後標記) 
export async function markUserCouponAsUsed({userId,couponId,type,axiosInstance}){
  try{
  
    const { data: userCoupons } = await axiosInstance.get(`/usercoupons?user_id=${userId}`)
    // 需同時比對 coupon_id 與 type
    const target = userCoupons.find(item => item.coupon_id === couponId && item.type === type) 
//     console.log('🧪 627userCoupons:', userCoupons)
// console.log('🧪 搜尋條件:', { couponId, type })

    if(target){
      await axiosInstance.patch(`/usercoupons/${target.id}`,{
        used:true,
        used_at:formatDateTime(),
      })
    }else{
      console.log('⚠️ 找不到對應的優惠券，無法標記')
    }
  }catch(error){
    console.log('❌ 無法標記優惠券為已使用:', error)
    throw error;
  }
}


export function formatDateTime(){
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2,'0')// 月份從 0 開始
  const day = String(now.getDate()).padStart(2,'0')
  const hours = String(now.getHours()).padStart(2,'0')
  const minutes = String(now.getMinutes()).padStart(2,'0')
  return `${year}-${month}-${day} ${hours}:${minutes}`

}

//621
//判斷優惠卷在(設定當天日期)以前，前端不會出現該優惠卷。(暫改)
export function isInDateRange(start,end,neverExpires,now = new Date()){
  if(neverExpires) return true
  if(!start || !end) return false
  const s = new Date(start)
  const e = new Date(end)

  // 👉 測試時強制回傳 true（即使過期也當作還在有效期）
  return true;
  
  // 🔒 原本正式版本
  return s <= now && now <= e  
}
//1.
export function isCampaignUsable(campaign){
  return !!campaign.basic.campaignTitle.trim()
}
//2.
export function isTargetGroupUsable(targetGroup,user,ordersData){
  if(!targetGroup || !user) return false
  
  const group = targetGroup.selectedGroup

  if(group === 'all') return true

  if(group === 'members') {
    const levelOption = targetGroup.members.levelOption

    //所有會員
    if(levelOption === 'All') {
      const condition = targetGroup.members.basicConditions
      if(condition === 'First') {
        console.log('是否為首購',isFirstPurchase(user.id,ordersData))
        return isFirstPurchase(user.id,ordersData)
        
      }else if(condition === 'Birthday') {
       console.log('是否生日當月:', isBirthdayMonth(user.birthday));
       return isBirthdayMonth(user.birthday)
      }
      return true   // 沒有條件就視為通過
    }

    //指定會員等級
    if(levelOption === 'MemberLevel') {
      return targetGroup.members.selectedLevels.some(level => level.value === user.role)
    }
  }

  if(group === 'tagged'){
    //user裡目前並沒有tags屬性
    return targetGroup.tags.selectedTags.some(tag => user.tags.includes(tag.value))
  }

  return false

}
//沒有限制 若 paymentAndShipping 沒有任何值為 true，代表不限制付款與配送方式，則預設為可用
//有限制 若設定了限制，則僅當使用者選的付款與配送方式都有包含在內時才為可用  原本
// 3.加上(只有有設定才檢查時間 驗證)
export function isPromotionUsable(promotion,cartItems = []){
  if(!promotion || typeof promotion !== 'object') return false

  const basic = promotion.basic || {}
  const selectedMethod = promotion.selectedMethod || ''
  const offerType = basic.offerType || ''

  if(!offerType) return false
  
  // ⛳ 購物車總金額
  const totalAmount = cartItems.reduce((sum, item) => sum + item.subTotal, 0);

  // ✅ 折扣設定驗證 + 門檻判斷
  if(offerType === 'percent') {
    const discount = Number(promotion.percentDiscount.discount)
    const threshold = Number(promotion.percentDiscount.threshold || 0);

    if(isNaN(discount) || discount <= 0 || discount > 100) return false
    if (threshold && totalAmount < threshold) return false;
  } else if (offerType === 'amount') {
    const discount = Number(promotion.amountDiscount.discount)
    const threshold = Number(promotion.amountDiscount.threshold || 0);
  
    if(isNaN(discount) || discount <= 0) return false
    if (threshold && totalAmount < threshold) return false;
  } else if (offerType === 'gift'){
     // 可視專案擴寫邏輯
  } else {
    return false
  }
  
  //✅選擇自動套用優惠(暫時disable)
  if(selectedMethod === 'automatic') {
    const auto = promotion.automatic || {}

    // 次數限制（若不是無限）
    if(!auto.unlimited && (!auto.usageLimit || Number(auto.usageLimit) <= 0 )){
      return false
    }

    // 有效日期
    if(!isInDateRange(auto.promotionStartDate,auto.promotionEndDate,auto.neverExpiresPromotion))
      return false
  }

  //✅選擇使用優惠卷
  if(selectedMethod === 'UseCoupons') {
    const useCoupons = promotion.useCoupons || {}
    const method = useCoupons.selectedReceiveMethod

    let validFrom = null
    let validTo = null
    let neverExpires = false
    let shouldCheckDate = false // 只有有設定才檢查時間

    // 1️⃣ InCenter 領券中心
    if(method === 'InCenter') {
      const inCenter = useCoupons.inCenter || {}

      if(!inCenter.unlimited && (!inCenter.usageLimit || Number(inCenter.usageLimit) <= 0)){
        return  false 
      }
      validFrom = inCenter.promotionStartDate
      validTo = inCenter.promotionEndDate
      neverExpires = inCenter.neverExpiresPromotion
      shouldCheckDate = !!(validFrom || validTo) || !inCenter.neverExpiresPromotion// ✅只有有資料才驗證
    

    // 2️⃣ EnterCouponCode 輸入代碼
    }else if(method === 'EnterCouponCode') {
      const enter = useCoupons.enterCouponCode || {}
      const codeType = enter.selectedCodeType
      
      //單組通用代碼
      if(codeType === 'Universal') {
        const u = enter.universal || {}

        if(!u.code || u.code.trim() === '') return false

        if(!u.unlimited && (!u.usageLimit || Number(u.usageLimit) <= 0)) return false

        validFrom = u.promotionStartDate
        validTo = u.promotionEndDate
        neverExpires = u.neverExpiresPromotion 
        shouldCheckDate = !!(validFrom || validTo) || !u.neverExpiresPromotion
        
      }
      //多組獨立代碼(暫時disable)
      if(codeType === 'Independent') {
        const i = enter.independent || {}

        if(!Array.isArray(i.codes) || i.codes.length === 0) return false
        
        validFrom = i.promotionStartDate
        validTo = i.promotionEndDate
        neverExpires = i.neverExpiresPromotion
        shouldCheckDate = !!(validFrom || validTo) || !i.neverExpiresPromotion
      }// 3️⃣ GetCoupons 推播領取(暫時disable)
    } else if(method === 'GetCoupons') {
      const g = useCoupons.getCoupons || {} 
      //使用次數或無限
      if(!g.unlimited && (!g.usageLimit || Number(g.usageLimit) <= 0)){
        return false
      }

      validFrom = g.promotionStartDate
      validTo = g.promotionEndDate
      neverExpires = g.neverExpiresPromotion
      shouldCheckDate = !!(validFrom || validTo) || !g.neverExpiresPromotion
    }

    // ✅ 有啟用日期設定時才檢查日期範圍
    if (shouldCheckDate && !isInDateRange(validFrom, validTo, neverExpires)) return false

    console.log('✅ isPromotionUsable 判斷結果: true', { validFrom, validTo, neverExpires })

    return true
  }

  // ✅ 推薦活動(暫時disable)
  if(selectedMethod === 'RecommendedActivities') {
    const r = promotion.recommended || {}
    if(!r.unlimited && (!r.usageLimit || Number(r.usageLimit) <= 0)){
      return false
    }
    return true
  }
  return false
}


//4.的子涵式
const paymentMap = {
  credit: 'creditCard',
  cod: 'cashOnDelivery',
  line: 'linePay'
}

const shippingMap = {
  home: 'blackCat',
  family: 'familyMart',
  seven: 'sevenEleven'
}

function normalizePaymentKey(userPayment) {
  return paymentMap[userPayment] || userPayment
}

function normalizeShippingKey(userShipping) {
  return shippingMap[userShipping] || userShipping
}
//4.付款方式、運送方式符合 
export function isPaymentAndShippingUsable(paymentAndShipping, selectedPayment, selectedShipping) {
  // 無限制，視為通過
  if (!paymentAndShipping) return true

  const { paymentMethods, shippingMethods } = paymentAndShipping

  const hasAnyPaymentRestriction = Object.values(paymentMethods).some(v => v === true)
  const hasAnyShippingRestriction = Object.values(shippingMethods).some(v => v === true)
  // ✅ 如果完全沒有設定限制，視為通過
  if (!hasAnyPaymentRestriction && !hasAnyShippingRestriction) return true

  const normalizedPayment = normalizePaymentKey(selectedPayment)
  const normalizedShipping = normalizeShippingKey(selectedShipping)
  // ✅ 有限制時，檢查使用者選擇是否被允許
  const isPaymentValid = hasAnyPaymentRestriction
    ? !!paymentMethods[normalizedPayment]
    : true

  const isShippingValid = hasAnyShippingRestriction
    ? !!shippingMethods[normalizedShipping]
    : true

  return isPaymentValid && isShippingValid
}

//主函式:(判斷優惠券是否可使用)
export function isCouponUsable(coupon,user,ordersData,selectedPayment,selectedShipping,cartItems) {
  return (
    isCampaignUsable(coupon.campaign) &&
    isTargetGroupUsable(coupon.targetGroup,user,ordersData) &&
    isPromotionUsable(coupon.promotion,cartItems) &&
    isPaymentAndShippingUsable(coupon.paymentAndShipping,selectedPayment,selectedShipping)
  )
}





