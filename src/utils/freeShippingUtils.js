// ✅ 基本資料驗證（活動名稱與條件設定）後台設定流程 驗證設定是否合理且完整
export function isFreeShippingCampaignValid(campaign){
    const { campaignTitle,shippingType,selectedCondition, conditionSubType } = campaign.basic
    
    if(!campaignTitle || !shippingType || !selectedCondition || !conditionSubType) return false

    if(selectedCondition === 'none'){
        //暫無東西
        return true
    }

    // ✅ 需要檢查的門檻欄位
    const threshold = campaign.conditionThreshold || {}

    const validAmount = Number(threshold.miniAmount) > 0
    const validPieces = Number(threshold.miniPieces) > 0

    // ✅ 相同邏輯集中處理
    if(['reach','products','categories'].includes(selectedCondition)){
        if(conditionSubType === 'miniAmount') return validAmount
        if(conditionSubType === 'miniPieces') return validPieces
    }

    // 若條件不符合或無法判斷，預設 false
    return false

}

// ✅ 目標群組驗證（會員層級、標籤選擇）後台設定流程
export function isFreeShippingTargetGroupValid(targetGroup){
    const {selectedGroup,members,tags} = targetGroup

    if(selectedGroup === 'all'){
        //暫無東西
        return true
    } 

    if(selectedGroup === 'members') {
        if(members.levelOption === 'All'){
            return true
        }else if(members.levelOption === 'MemberLevel'){
            return Array.isArray(members.selectedLevels) && members.selectedLevels.length > 0
        }
    }

    if(selectedGroup === 'tagged') {
        return Array.isArray(members.selectedTags) && tags.selectedTags.length > 0
    }

    return false
}

// ✅ 優惠與標準驗證（自動套用或用券）後台設定流程
export function isFreeShippingPromotionValid(promotion) {
    if(!promotion || typeof promotion !== 'object') return false
    
    const method = promotion.selectedMethod
    
    // ✅ 共用驗證函式
    // 使用次數驗證
    const isValidUsageLimit = (item) => item.unlimited || (Number(item.usageLimit) > 0)
    // 時效驗證
    const isValidDateRange = (start,end,neverExpires) => neverExpires || (start && end)
    if(method === 'automatic'){
        const auto = promotion.automatic
        // 使用次數驗證
        if(!auto || !isValidUsageLimit(auto)) return false

        // 時效驗證
        if(!isValidDateRange(auto.promotionStartDate, auto.promotionEndDate, auto.neverExpiresPromotion)) return false
        return true
    } 

    if(method === 'UseCoupons'){
        const { selectedReceiveMethod } = promotion.useCoupons || {};

        if(selectedReceiveMethod === 'InCenter'){
            const inCenter = promotion.useCoupons.inCenter

            if(!inCenter || !isValidUsageLimit(inCenter)) return false
            if(!inCenter.code || inCenter.code.trim() === '') return false
            if(!isValidDateRange(inCenter.promotionStartDate, inCenter.promotionEndDate, inCenter.neverExpiresPromotion)) return false
                
            return true
        }

        if (selectedReceiveMethod  === 'EnterCouponCode') {
            const enter = promotion.useCoupons.enterCouponCode || {};
            const codeType = enter.selectedCodeType;
            if (codeType === 'Universal') {
                const u = enter.universal;
                if (!u || !u.code || u.code.trim() === '') return false;
                if (!isValidUsageLimit(u)) return false;
                if (!isValidDateRange(u.promotionStartDate, u.promotionEndDate, u.neverExpiresPromotion)) return false
                return true;
            } 
            if (codeType  === 'Independent') {
                const i = enter.independent
                if (!i || !Array.isArray(i.codes) || i.codes.length === 0) return false;
                if (!isValidDateRange(i.promotionStartDate, i.promotionEndDate, i.neverExpiresPromotion)) return false
                return true;
            }
        }

        if (selectedReceiveMethod  === 'GetCoupons') {
            const g = promotion.useCoupons.getCoupons
            
            if (!g || !isValidUsageLimit(g)) return false
            if (!isValidDateRange(g.promotionStartDate, g.promotionEndDate, g.neverExpiresPromotion)) return false;
            return true;
        }
        
        return false;
    }

    if(method === 'RecommendedActivities'){
        const r = promotion.recommended
        return r && isValidUsageLimit(r)
    }

    return false
}

// ✅ 驗證至少選擇一種付款與一種運送方式 後台設定流程
export function isFreeShippingPaymentAndShippingValid(paymentAndShipping) {
    const payments = paymentAndShipping.paymentMethods;
    const shippings = paymentAndShipping.shippingMethods

    const hasPayment = payments.cashOnDelivery || payments.creditCard || payments.linePay;
    const hasShipping = shippings.blackCat || shippings.familyMart || shippings.sevenEleven
   
   return hasPayment && hasShipping
}

// 總驗證 後台設定流程
export function isFreeShippingFormValid(form){
    return (
        isFreeShippingCampaignValid(form.campaign) &&
        isFreeShippingTargetGroupValid(form.targetGroup) &&
        isFreeShippingPromotionValid(form.promotion) &&
        isFreeShippingPaymentAndShippingValid(form.paymentAndShipping)
    )
}


//1.判斷購物車是否符合免運門檻
export function isFreeShippingCampaignConditionMet(campaign,cartItems) {
    if(!campaign || !Array.isArray(cartItems)) return false

    const { selectedCondition } = campaign.basic || {}

    switch (selectedCondition) {
        case 'none':
            return true
        case 'reach':
            return checkAmountThresholdMet(campaign,cartItems)
        case 'products':
            return checkProductConditionMet(campaign,cartItems)   
        case 'categories':
            return checkCategoryConditionMet(campaign,cartItems)   
        default:
            return false          
    }
}
// 全單達門檻（件數或金額）
export function checkAmountThresholdMet(campaign,cartItems) {
    const { conditionSubType } = campaign.basic || {}
    const { miniAmount,miniPieces } = campaign.conditionThreshold || {}

    const totalPieces = cartItems.reduce((sum,item) => sum + item.quantity,0)
    const totalAmount = cartItems.reduce((sum,item) => sum + item.subTotal,0)

    // console.log('7/10 totalPieces',totalPieces)
    // console.log('7/10 totalAmount',totalAmount)

    if(conditionSubType === 'miniPieces') return totalPieces >= Number(miniPieces)
    if(conditionSubType === 'miniAmount') return totalAmount >= Number(miniAmount)
    
    return false      
}
//(暫時停用) 指定商品達門檻（件數或金額）
export function checkProductConditionMet(campaign,cartItems) {
    const productIds = (campaign.targetProducts || []).map(p => p.id); // 你需確認後台有設定此欄位
    const { conditionSubType } = campaign.basic || {};
    const { miniAmount, miniPieces } = campaign.conditionThreshold || {};

    const matchedItems = cartItems.filter(item => productIds.includes(item.product.id));
    const totalPieces = matchedItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = matchedItems.reduce((sum, item) => sum + item.subTotal, 0);

    if (conditionSubType === 'miniPieces') return totalPieces >= Number(miniPieces);
    if (conditionSubType === 'miniAmount') return totalAmount >= Number(miniAmount);
        
    return false
}
//  指定分類達門檻（件數或金額）
export function checkCategoryConditionMet(campaign, cartItems) {
  const categoryIds = (campaign.selectedCategories || []).map(c => c.id);
  const { conditionSubType } = campaign.basic || {};
  const { miniAmount, miniPieces } = campaign.conditionThreshold || {};

  const matchedItems = cartItems.filter(item => categoryIds.includes(item.product.categoryId));
  const totalPieces = matchedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = matchedItems.reduce((sum, item) => sum + item.subTotal, 0);

  if (conditionSubType === 'miniPieces') return totalPieces >= Number(miniPieces);
  if (conditionSubType === 'miniAmount') return totalAmount >= Number(miniAmount);
  return false;
}

//2.判斷使用者是否符合目標群組條件
// 免運卷依目標群組(會員、會員等級)發送 前台使用流程 判斷用戶是否符合活動條件 1版(暫用)
export function isUserMatchedTargetGroup(user,targetGroup){
  if(!user || !targetGroup) return false

  const { selectedGroup,members,tags } = targetGroup
  //(暫用) 所有顧客  
  if(selectedGroup === 'all'){
    return true
  }
  // 適用會員
  if(selectedGroup === 'members'){
    if(members.levelOption === 'All'){
      return true
    }
    if(members.levelOption === 'MemberLevel'){
      return members.selectedLevels.some(level => level.value === user.role)
    }
    return false
  }
  //(暫用) 適用標籤
  if (selectedGroup === 'tagged') {
    if (!Array.isArray(tags.selectedTags) || tags.selectedTags.length === 0) return false;
    //user.tags  tags: ["high-spender", "repeat-buyer"] // 跟後台設定的 selectedTags.value 對應
    return tags.selectedTags.some(tag => user.tags?.includes(tag.value));
  }
  
  return false
}

//3.判斷優惠與標準
export function isPromotionActive(promotion,currentDate = new Date(),usedCount = 0) {
    const method = promotion.selectedMethod
    //(暫停用)  
    if(method === 'automatic') {
        return ( 
            isWithinPromotionPeriod(promotion.automatic,currentDate) &&
            isPromotionUnderUsageLimit(promotion.automatic,usedCount)
        )
    }

    if(method === 'UseCoupons') {
        const receiveMethod = promotion.useCoupons.selectedReceiveMethod

        switch(receiveMethod) {
            case 'InCenter':
                return ( 
                    isWithinPromotionPeriod(promotion.useCoupons.inCenter,currentDate) &&
                    isPromotionUnderUsageLimit(promotion.useCoupons.inCenter,usedCount)
                )
            //(暫停用)      
            case 'EnterCouponCode':
                const codeType = promotion.useCoupons.enterCouponCode.selectedCodeType;
                if(codeType === 'Universal'){
                    return (
                        isWithinPromotionPeriod(promotion.useCoupons.enterCouponCode.universal, currentDate) &&
                        isPromotionUnderUsageLimit(promotion.useCoupons.enterCouponCode.universal,usedCount)
                    )
                }
                if(codeType === 'Independent') {
                    return isWithinPromotionPeriod(promotion.useCoupons.enterCouponCode.independent, currentDate)
                }
                break
            //(暫停用)    
            case 'GetCoupons':
                return isWithinPromotionPeriod(promotion.useCoupons.getCoupons, currentDate)

        }
    }
    //(暫停用)  
    if(method === 'RecommendedActivities') {
        return isPromotionUnderUsageLimit(promotion.recommended, usedCount);
    }

    return false
}
// 檢查促銷是否在起訖時間內或永不過期
export function isWithinPromotionPeriod(promoBlock,currentDate) {
    if(!promoBlock) return false
    if(promoBlock.neverExpiresPromotion) return true

    const start = promoBlock.promotionStartDate ? new Date(promoBlock.promotionStartDate) : null
    const end = promoBlock.promotionEndDate ? new Date(promoBlock.promotionEndDate) : null

    if(start && currentDate < start) return false
    if(end && currentDate > end) return false

    return true
}
// 判斷優惠使用次數是否仍可用
export function isPromotionUnderUsageLimit(promoBlock,usedCount) {
    if(!promoBlock) return false
    if(promoBlock.unlimited) return true

    const limit = parseInt(promoBlock.usageLimit)
    if(isNaN(limit)) return false

    return usedCount < limit
}

//4.判斷是否符合付款與送貨方式條件
export function isPaymentAndShippingMethodMatched(paymentMethods,shippingMethods,userPayment,userShipping) {
    // const { paymentMethods,shippingMethods } = promotionSettings

    const paymentValid = 
       (paymentMethods.cashOnDelivery && userPayment === 'cashOnDelivery') ||
       (paymentMethods.creditCard && userPayment === 'credit') ||
       (paymentMethods.linePay && userPayment === 'linePay')                                                                                     
    
    const shippingValid =
        (shippingMethods.blackCat && userShipping === 'home') ||
        (shippingMethods.familyMart && userShipping === 'familymart') ||
        (shippingMethods.sevenEleven && userShipping === 'seven');   

    return paymentValid && shippingValid;    
}

// 判斷是否可使用免運優惠（總控）
export function isFreeShippingUsable(
  promotion,
  campaign,
  paymentMethods,
  shippingMethods,
  userShipping,
  userPayment,
  user,
  targetGroup,
  cartItems,
  currentDate = new Date(),
  usedCount = 0
) {

  return (
    isPromotionActive(promotion, currentDate, usedCount) &&
    isFreeShippingCampaignConditionMet(campaign, cartItems) &&
    isUserMatchedTargetGroup(user, targetGroup) &&
    isPaymentAndShippingMethodMatched(paymentMethods, shippingMethods, userPayment, userShipping)
  );
}



