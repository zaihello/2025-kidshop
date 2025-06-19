
//符合折價卷活動判斷條件
export const conditionCheckers = {
    First:(user,ordersData) => isFirstPurchase(user.id,ordersData),
    Birthday:(user) => isBirthdayMonth(user.birthday),  
}
// 判斷折價卷是否為首次購買（根據 cartsData 判斷該 user 是否沒有已購買紀錄）
export function isFirstPurchase(userId,ordersData = []){
    const userOrders = ordersData.filter(order => order.user_id === userId)
    // 若沒有購物車資料或購物車內無商品或未完成結帳，視為首次
    return userOrders.length === 0
}

// 判斷折價卷是否為生日當月
export function isBirthdayMonth(birthday){
    if(!birthday) return false
    const birthMonth = new Date(birthday).getMonth()
    const currentMonth = new Date().getMonth()
    return birthMonth === currentMonth
}

// 主函式：篩選符合資格的折價卷
export function filterAvailableCouponsForUser(user,coupons,ordersData){
    return coupons.filter(coupon => {
        const conditions = coupon.promotion?.useCoupons?.inCenter?.customReceiveCondition || [] 
        // const conditions = coupon.promotion.useCoupons.inCenter.customReceiveCondition || [] //
        // 沒有設定任何條件，代表所有人可領取
        if(conditions.length === 0) return true

        const matchFirst = conditions.includes('First') ? isFirstPurchase(user.id,ordersData) : true
        const matchBirthday = conditions.includes('Birthday') ? isBirthdayMonth(user.birthday) : true

        console.log('user birthday:', user.birthday)
        console.log('coupon condition:', conditions)
        console.log('isBirthdayMonth:', isBirthdayMonth(user.birthday))

        return matchFirst && matchBirthday
    })
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
  const availableCoupons = filterAvailableCouponsForUser(user,allCoupons,ordersData)
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

// 免運卷依目標群組(會員、會員等級)發送
export function isUserMatchedTargetGroup(user,targetGroup){
  if(!user) return false

  const group = targetGroup.selectedGroup

  if(group === 'all') return true
  
  if(group === 'members'){
    if(targetGroup.members.levelOption === 'All') return true
    return targetGroup.members.selectedLevels.some(l => l.value === user.level) 
  }

  if(group === 'tagged'){
    return targetGroup.tags.selectedTags.some(tag => user.tags?.includes(tag.value))
  }

  return false
}



//status: usable已領取 expired已過期 used以使用。可使用頁面、已失效頁面資料格式呈現在前端。
export function formatUserCouponsList(user, userCoupons, allCoupons, ordersData, freeshippings) {
  const usableCoupons = []//可使用頁面
  const invalidCoupons = []//已失效頁面
  
  // 先從訂單中找出所有使用過的優惠券 ID
  const usedCouponIds = new Set()
  ordersData.forEach(order => {
    if (order.couponCode && order.couponCode.code) {
      usedCouponIds.add(order.couponCode.code)
    }
  })
  // ✅ 處理 /userCoupons api (折扣券)
  userCoupons.forEach(userCoupon => {
    const coupon = allCoupons.find(c => c.id === userCoupon.coupon_id)
    //new
     if (!coupon || !coupon.campaign || !coupon.promotion || !coupon.promotion.useCoupons) {
    console.warn('找不到對應 coupon 或欄位異常，coupon_id:', userCoupon.coupon_id)
    return
  }
    const campaign = coupon.campaign
    // 取得正確的折扣資料
    const offerType = campaign.basic.offerType

    let threshold = 0
    let discount = 0
    
    if (offerType === 'percent') {
      threshold = Number(campaign.percentDiscount.threshold)
      discount = Number(campaign.percentDiscount.discount)
    } else if (offerType === 'amount') {
      threshold = Number(campaign.amountDiscount.threshold)
      discount = Number(campaign.amountDiscount.discount)
    }

    const selectedMethod = coupon.promotion.useCoupons.selectedReceiveMethod
    // ▶ 手動輸入券（EnterCouponCode）
    const codeInfo = selectedMethod === 'EnterCouponCode'
      ? coupon.promotion.useCoupons.enterCouponCode
      : coupon.promotion.useCoupons.inCenter
    const code = selectedMethod === 'EnterCouponCode'
      ? (codeInfo.selectedCodeType === 'Universal'
          ? codeInfo.universal.code
          : '[多組代碼]')
      : codeInfo.code

    const validFrom = codeInfo.promotionStartDate
    const validTo = codeInfo.promotionEndDate
    const isExpiredFlag = isExpired(validTo)

    const formatted = {
      id: userCoupon.id,
      couponId: coupon.id,
      title: campaign.basic.campaignTitle,
      offerType,
      threshold,
      discount,
      codeType: selectedMethod === 'EnterCouponCode' ? 'manual' : 'system',//manual手動輸入代碼、system自動發放型券 
      code,
      validFrom,
      validTo
    }

    if (userCoupon.used) {
      invalidCoupons.push({ ...formatted, status: 'used' })
    } else if (isExpiredFlag) {
      invalidCoupons.push({ ...formatted, status: 'expired' })
    } else {
      usableCoupons.push({ ...formatted, status: 'usable' })
    }
  })
  // ✅ 處理 freeshippings (免運券)
  freeshippings.forEach(freeshipping => {
    // 只處理 userCoupon 有對應的免運券（coupon_id = freeshipping.id）
    const freeUserCoupon = userCoupons.find(uc => uc.coupon_id === freeshipping.id)
    if (!freeUserCoupon) return
    // ❗️判斷是否符合目標群組
    const isMatched = isUserMatchedTargetGroup(user, freeshipping.targetGroup)
    if (!isMatched) return

    const promotion = freeshipping.promotion.useCoupons.inCenter
    const title = freeshipping.campaign.basic.campaignTitle
    const threshold = freeshipping.campaign.conditionThreshold.miniAmount
    const validFrom = promotion.promotionStartDate
    const validTo = promotion.promotionEndDate
    const isExpiredFlag = isExpired(validTo)

    const freeShippingData = {
      id: freeUserCoupon.id,
      couponId: freeshipping.id,
      title,
      offerType: 'freeShipping',
      threshold,
      discount: 60,//運費暫設
      codeType: 'system',
      code: '自動套用免運',
      validFrom,
      validTo
    }

    if (freeUserCoupon.used) {
      invalidCoupons.push({ ...freeShippingData, status: 'used' })
    } else if (isExpiredFlag) {
      invalidCoupons.push({ ...freeShippingData, status: 'expired' })
    } else {
      usableCoupons.push({ ...freeShippingData, status: 'usable' })
    }
  })

  return {
    usableCoupons,
    invalidCoupons
  }
}



// 更改/usercoupons的expired未使用已過期的折價卷、免運卷 
export async function updateExpiredUserCoupons({userCoupons,allCoupons,freeshippings,axiosInstance}){
  for(const userCoupon of userCoupons){
    if(userCoupon.used) continue

    let validTo = null

    if(userCoupon.type === 'discount'){
      const coupon = allCoupons.find( c => c.id === userCoupon.coupon_id )
      if(!coupon) continue
      validTo = getPromotionEndDate(coupon)
    }else if(userCoupon.type === 'freeShipping'){
      const freeShipping = freeshippings.find(f => f.id === userCoupon.coupon_id)
      if(!freeShipping) continue
      validTo = getPromotionEndDate(freeShipping)
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
//取得的promotionEndDate
export function getPromotionEndDate(coupon){
  const {selectedReceiveMethod,inCenter,enterCouponCode,getCoupons} = coupon.promotion.useCoupons

  switch(selectedReceiveMethod){
    case 'InCenter':
      return inCenter.promotionEndDate
    case 'EnterCouponCode':
      // 預設只判斷 universal，若要判斷 independent 可加條件
      return enterCouponCode.universal.promotionEndDate
    case 'GetCoupons':
      return getCoupons.promotionEndDate
    default:
      return null  
  }
}


// 將折價券、免運卷標記為已使用(在PayList.vue按下支付按鈕後標記)
export async function markUserCouponAsUsed({userId,couponId,type,axiosInstance}){
  try{
  
    const { data: userCoupons } = await axiosInstance.get(`/usercoupons?user_id=${userId}`)
    // 需同時比對 coupon_id 與 type
    const target = userCoupons.find(item => item.coupon_id === couponId && item.type === type) 

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
