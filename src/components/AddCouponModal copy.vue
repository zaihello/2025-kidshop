<script>
import axios from 'axios'
export default {
  props:{
    couponData:{
      type:Object,
      default:null
    }
  },
  data() {
    return {
      form:{

        //Accordion 1 - 基本資料
        campaign: {
          basic: {
            campaignTitle: '',// 活動名稱
            selectedCondition: '',// none, reach, products, categories
            conditionSubType: '',// 最低金額 / 最少件數
            OfferType: '',// percent, amount, gift
            ApplyTo: '',// all, category, product, once
            AutoApply: ''// enable, disable
          },
          percentDiscount: {
            discount: '',// %折扣
            threshold: ''// 滿額門檻（％）
          },
          amountDiscount: {
            discount: '',// 金額折扣
            threshold: ''// 滿額門檻（金額）
          }
        },
        
        //Accordion 2 - 目標群組
        targetGroup: {
          selectedGroup: '', // 'all', 'members', 'tagged'

          members: {
            levelOption: '', // 'All', 'MemberLevel'
            selectedLevels: []//表格中選到的會員等級與對應人數 [{ label: 'VIP', value: 'vip', count: 3 }]
          },

          tags: {
            selectedTagValue: '',//累積消費5次以上、高價購買者、近期回購
            selectedTags: []// 每一筆應是 { label: 'xxx', value: 'xxx', count: 123 }
          },

          usageLimit: '' // 'unlimited', 'first', 'once'
        },
        //Accordion 3.優惠與標準
        promotion: {
          selectedMethod: '', // 'automatic' | 'UseCoupons' | 'RecommendedActivities'

          // 自動套用優惠
          automatic: {
            usageLimit: '',       // 數字，代表次數
            unlimited: false,     // 是否無限
            startDate: '',        // yyyy-MM-dd
            endDate: '',          // yyyy-MM-dd
            neverExpires: false   // 是否永不過期
          },

          // 使用優惠券
          useCoupons: {
            selectedReceiveMethod: '', // 'InCenter' | 'EnterCouponCode' | 'GetCoupons'
            // 顯示在領卷中心
            inCenter: {
              usageLimit: '',       // 數字
              unlimited: false,
              receiveStartDate: '',
              receiveEndDate: '',
              neverExpiresReceive: false,
              promotionStartDate: '',
              promotionEndDate: '',
              neverExpiresPromotion: false
            },
            // 輸入優惠碼
            enterCouponCode: {
              selectedCodeType: '', // 'Universal' or 'Independent'

              // 單組通用代碼設定
              universal: {
                code:'',
                showInMemberCenter: false,
                usageLimit:'',
                unlimited:false,
                receiveStartDate: '',
                receiveEndDate: '',
                neverExpiresReceive: false,
                promotionStartDate: '',
                promotionEndDate: '',
                neverExpiresPromotion: false
              },

              // 多組獨立代碼設定
              independent: {
                codes: '', // 例如輸入多筆代碼
                receiveStartDate: '',
                receiveEndDate: '',
                neverExpiresReceive: false,
                promotionStartDate: '',
                promotionEndDate: '',
                neverExpiresPromotion: false
              }
             
            },
            // 透過連結或顧客分群發送
            getCoupons: {
              usageLimit: '',
              unlimited: false,
              receiveStartDate: '',
              receiveEndDate: '',
              neverExpiresReceive: false,
              promotionStartDate: '',
              promotionEndDate: '',
              neverExpiresPromotion: false
            }
          },

          // 推薦活動
          recommended: {
            usageLimit: '',
            unlimited: false
          }
        },
        //Accordion 4.付款及送貨方式
        paymentAndShipping: {
          paymentMethods: {
            cashOnDelivery: false,       // 貨到付款
            creditCard: false,           // 信用卡線上付款
            linePay: false               // LINE Pay
          },
          shippingMethods: {
            blackCat: false,             // 黑貓 - 常溫
            familyMart: false,           // 全家 - 取貨
            sevenEleven: false           // 7-11 - 取貨
          }
        },

      },
      selectedOption: '',//一般會員、VIP、VVIP(Accordion 2 - 目標群組)
      // 下拉選單選項（只負責顯示 label / value）
      availableMemberLevels: [
        { label: '一般會員', value: 'member' },
        { label: 'VIP', value: 'vip' },
        { label: 'VVIP', value: 'vvip' },
      ],
      // 假設這是所有會員資料（未來會來自 API）
      members: [
        { name: 'Amy', level: 'vip' },
        { name: 'Bob', level: 'vip' },
        { name: 'Cindy', level: 'vvip' },
        { name: 'David', level: 'member' },
        { name: 'Eric', level: 'member' },
        { name: 'Fiona', level: 'vip' },
        { name: 'Grace', level: 'vvip' },
      ],
      // 顧客標籤選擇
      availableTags:[
          {value:'tag1',label:'累積消費5次以上',count:2},
          {value:'tag2',label:'高價購買者',count:4},
          {value:'tag3',label:'近期回購',count:3}
      ],
    
      isAccordionOpen:{
        basic:false,// 第 1 組（基本資料）
        group:false,// 第 2 組（目標群組）
        discount:false,//第 3 組(優惠與標準)
        payment:false,//第 4 組(付款及送貨方式)

      },
    };
  },
  watch:{
    //編輯、新增
    couponData:{
      immediate:true,
      handler(newVal){
        if(newVal){
          this.form = { ...this.form,...newVal}
        }
      }
    }
  },
  methods: {
    // async submitCoupon() {
    //   const payload = {
    //     id: this.form.id, 
    //     campaignTitle: this.form.campaignTitle,
    //     title: this.form.title,
    //     discount: this.form.discount,
    //     endDate: this.form.endDate,
    //     autoGrant: this.form.type === 'auto',
    //     ...(this.form.type === 'code' && { code: this.form.code }), 
    //     // condition: this.form.condition,
    //     threshold:this.form.threshold,        
    //   };
    //   this.$emit('submitCoupon',payload)// 送出給父元件
    //   console.log('送出給父元件:', payload);
    // },
    async submitForm(){
      try{
        const payload = {
          
          //Accordion 1 - 基本資料
          campaign: {
            basic: {
              campaignTitle: this.form.campaign.basic.campaignTitle,
              selectedCondition: this.form.campaign.basic.selectedCondition,
              conditionSubType: this.form.campaign.basic.conditionSubType,
              offerType: this.form.campaign.basic.OfferType,
              applyTo: this.form.campaign.basic.ApplyTo,
              autoApply: this.form.campaign.basic.AutoApply
            },
            percentDiscount: {
              discount: this.form.campaign.percentDiscount.discount,
              threshold: this.form.campaign.percentDiscount.threshold
            },
            amountDiscount: {
              discount: this.form.campaign.amountDiscount.discount,
              threshold: this.form.campaign.amountDiscount.threshold
            }
          },
          
          //Accordion 2 - 目標群組
          targetGroup: {
            members: {
              levelOption: this.form.targetGroup.members.levelOption,
              selectedLevels: this.form.targetGroup.members.selectedLevels,
            },
            tags: {
              selectedTags: this.form.targetGroup.tags.selectedTags,
            },
           usageLimit: this.form.targetGroup.usageLimit,
          },

          // ✅ Accordion 3 - 優惠與標準
          promotion: {
            selectedMethod: this.form.promotion.selectedMethod,

            automatic: {
              usageLimit: this.form.promotion.automatic.usageLimit,
              unlimited: this.form.promotion.automatic.unlimited,
              startDate: this.form.promotion.automatic.startDate,
              endDate: this.form.promotion.automatic.endDate,
              neverExpires: this.form.promotion.automatic.neverExpires,
            },

            useCoupons: {
              selectedReceiveMethod: this.form.promotion.useCoupons.selectedReceiveMethod,

              inCenter: {
                usageLimit: this.form.promotion.useCoupons.inCenter.usageLimit,
                unlimited: this.form.promotion.useCoupons.inCenter.unlimited,
                receiveStartDate: this.form.promotion.useCoupons.inCenter.receiveStartDate,
                receiveEndDate: this.form.promotion.useCoupons.inCenter.receiveEndDate,
                neverExpiresReceive: this.form.promotion.useCoupons.inCenter.neverExpiresReceive,
                promotionStartDate: this.form.promotion.useCoupons.inCenter.promotionStartDate,
                promotionEndDate: this.form.promotion.useCoupons.inCenter.promotionEndDate,
                neverExpiresPromotion: this.form.promotion.useCoupons.inCenter.neverExpiresPromotion,
              },

              enterCouponCode: {
                selectedCodeType: this.form.promotion.useCoupons.enterCouponCode.selectedCodeType,
                universal: {
                  code:this.form.promotion.useCoupons.enterCouponCode.universal.code,
                  showInMemberCenter: this.form.promotion.useCoupons.enterCouponCode.universal.showInMemberCenter,
                  usageLimit:this.form.promotion.useCoupons.enterCouponCode.universal.usageLimit,
                  unlimited:this.form.promotion.useCoupons.enterCouponCode.universal.unlimited,
                  receiveStartDate: this.form.promotion.useCoupons.enterCouponCode.universal.receiveStartDate,
                  receiveEndDate: this.form.promotion.useCoupons.enterCouponCode.universal.receiveEndDate,
                  neverExpiresReceive: this.form.promotion.useCoupons.enterCouponCode.universal.neverExpiresReceive,
                  promotionStartDate: this.form.promotion.useCoupons.enterCouponCode.universal.promotionStartDate,
                  promotionEndDate: this.form.promotion.useCoupons.enterCouponCode.universal.promotionEndDate,
                  neverExpiresPromotion: this.form.promotion.useCoupons.enterCouponCode.universal.neverExpiresPromotion,
                },
                independent: {
                  codes: this.form.promotion.useCoupons.enterCouponCode.independent.codes,
                  receiveStartDate: this.form.promotion.useCoupons.enterCouponCode.independent.receiveStartDate,
                  receiveEndDate: this.form.promotion.useCoupons.enterCouponCode.independent.receiveEndDate,
                  neverExpiresReceive: this.form.promotion.useCoupons.enterCouponCode.independent.neverExpiresReceive,
                  promotionStartDate: this.form.promotion.useCoupons.enterCouponCode.independent.promotionStartDate,
                  promotionEndDate: this.form.promotion.useCoupons.enterCouponCode.independent.promotionEndDate,
                  neverExpiresPromotion: this.form.promotion.useCoupons.enterCouponCode.independent.neverExpiresPromotion,
                }
              },

              getCoupons: {
                usageLimit: this.form.promotion.useCoupons.getCoupons.usageLimit,
                unlimited: this.form.promotion.useCoupons.getCoupons.unlimited,
                receiveStartDate: this.form.promotion.useCoupons.getCoupons.receiveStartDate,
                receiveEndDate: this.form.promotion.useCoupons.getCoupons.receiveEndDate,
                neverExpiresReceive: this.form.promotion.useCoupons.getCoupons.neverExpiresReceive,
                promotionStartDate: this.form.promotion.useCoupons.getCoupons.promotionStartDate,
                promotionEndDate: this.form.promotion.useCoupons.getCoupons.promotionEndDate,
                neverExpiresPromotion: this.form.promotion.useCoupons.getCoupons.neverExpiresPromotion,
              }
            },

            recommended: {
              usageLimit: this.form.promotion.recommended.usageLimit,
              unlimited: this.form.promotion.recommended.unlimited
            }
          },
          //Accordion 4.付款及送貨方式
          paymentAndShipping: {
            paymentMethods: {
              cashOnDelivery: this.form.paymentAndShipping.paymentMethods.cashOnDelivery,       // 貨到付款
              creditCard: this.form.paymentAndShipping.paymentMethods.creditCard,           // 信用卡線上付款
              linePay:this.form.paymentAndShipping.paymentMethods.linePay             // LINE Pay
            },
            shippingMethods: {
              blackCat: this.form.paymentAndShipping.shippingMethods.blackCat,             // 黑貓 - 常溫
              familyMart: this.form.paymentAndShipping.shippingMethods.familyMart,           // 全家 - 取貨
              sevenEleven: this.form.paymentAndShipping.shippingMethods.sevenEleven,           // 7-11 - 取貨
            }
          },




        }
        const token = localStorage.getItem('adminToken');

        const response = await axios.post(`https://204ed3432b06d7af.mokky.dev/coupons`,payload,{
          headers:{
            Authorization: `Bearer ${token}`
          }
        })

        alert('新增優惠券成功！')
        console.log('伺服器回傳:', response.data);
      }catch(error){
        console.error('新增優惠券失敗', error)
        alert('發送失敗，請檢查欄位與登入狀態');
      }
    },
    toggleAccordion(section) {
      this.isAccordionOpen[section] = !this.isAccordionOpen[section];
    },
    isSectionOpen(section) {
      return !!this.isAccordionOpen[section]; 
    },
    // addSelectedLevel(selectedValue){
    //   if(!selectedValue) return

    //   //1. 找出該會員級別的顯示名稱（label）
    //   const levelOption = this.availableMemberLevels.find(l => l.value === this.selectedOption)
    //   if(!levelOption) return

    //   // 2. 若已加入該等級，則不再重複加入
    //   const alreadyExists = this.selectedLevels.some(item => item.value === levelOption.value) 
    //   if(alreadyExists) return

    //   // 3. 計算該會員等級的會員數量
    //   const count = this.members.filter(member => member.level === levelOption.value).length

    //   // 4. 加入至已選清單
    //   this.selectedLevels.push({
    //     label:levelOption.label,
    //     value:levelOption.value,
    //     count
    //   })

    // },
    // handleSelectChange(){
    //   this.addSelectedLevel(this.selectedOption)// ✅ 傳入參數
    //   this.selectedOption = ''// 清空選擇欄位
    // },
    addSelectedLevel() {
      if (!this.selectedOption) return;

      // 找出選項的 label
      const levelOption = this.availableMemberLevels.find(l => l.value === this.selectedOption);
      if (!levelOption) return;

      // 已經加入過就不重複加入
      if (this.form.targetGroup.members.selectedLevels.some(item => item.value === levelOption.value)) return;

      // 計算該等級會員數量
      const count = this.members.filter(member => member.level === levelOption.value).length;

      this.form.targetGroup.members.selectedLevels.push({
        label: levelOption.label,
        value: levelOption.value,
        count
      });

      this.selectedOption = ''; // 清空選擇
    },
    removeSelectedLevel(index) {
      this.form.targetGroup.members.selectedLevels.splice(index, 1);
    },
    addSelectedTag() {
      const selectedValue = this.form.targetGroup.tags.selectedTagValue;
      if (!selectedValue) return;

      const selectedTag = this.availableTags.find(tag => tag.value === selectedValue);
      if (!selectedTag) return;

      // 限制最多10個
      if (this.form.targetGroup.tags.selectedTags.length >= 10) {
        alert('最多只能選擇10個顧客標籤');
        return;
      }

      // 確保沒有重複
      const alreadyExists = this.form.targetGroup.tags.selectedTags.some(tag => tag.value === selectedTag.value);
      if (!alreadyExists ) {
        this.form.targetGroup.tags.selectedTags.push({ ...selectedTag });
      }

      // 清空選單
      this.form.targetGroup.tags.selectedTagValue = '';
    },
    removeSelectedTag(index){
      this.form.targetGroup.tags.selectedTags.splice(index,1)
    },
  }
};
</script>

<template>
    <div class="relative bg-white overflow-auto max-h-[90vh] w-full max-w-lg">
        <!-- X 關閉按鈕 -->
        <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-500 hover:text-white text-xl font-bold">
        ×
        </button>
       
        <h2 class="bg-black text-white text-lg font-bold text-center py-2">{{ form.id ?'編輯滿額滿件優惠' : '新增滿額滿件優惠'}}</h2>
        
        <!-- <form @submit.prevent="submitCoupon" class="p-3">      -->
          

          <!-- 優惠類型 保留 -->
          <!-- <label class="block mb-2 font-semibold">優惠類型</label>
          <select v-model="form.type" class="mb-4 p-2 border rounded w-full">
              <option value="auto">自動發放型優惠券</option>
              <option value="code">手動輸入折扣碼</option>
          </select> -->
           
          <!-- 優惠券名稱 保留 -->
          <!-- <label  class="block mb-2 font-semibold">優惠券名稱</label>
          <input v-model="form.title" type="text" class="mb-4 p-2 border rounded w-full" placeholder="例如：首次登入送100元"> -->

          <!-- 折扣金額 保留 -->
          <!-- <label  class="block mb-2 font-semibold">折扣金額</label>
          <input v-model.number="form.discount" type="number" class="mb-4 p-2 border rounded w-full" placeholder="例如：100">  -->
          
          <!-- 僅在「code」型時顯示 保留-->
          <!-- <div v-if="form.type === 'code'">
            <label  class="block mb-2 font-semibold">優惠碼</label>
            <input v-model="form.code" type="text" class="mb-4 p-2 border rounded w-full" placeholder="例如：MAY100">
          </div> -->

          <div>
            <!-- <label class="block mb-2 font-semibold">發放條件</label>
            <select v-model="form.condition" class="mb-4 p-2 border rounded w-full">
              <option value="newUser">首次登入</option>
              <option value="birthday">當月壽星</option>
              <option value="overAmount">滿額贈</option>
            </select> -->

            <!-- <div v-if="form.condition === 'overAmount'"> -->
              <!-- 保留 -->
              <!-- <label  class="block mb-2 font-semibold">門檻金額</label>
              <input v-model.number="form.threshold" type="number" class="mb-4 p-2 border rounded w-full" placeholder="例如：1500">           -->
            <!-- </div> -->
          </div>  
          
          <!-- 有效期限 保留-->
          <!-- <label class="block mb-2 font-semibold">有效期限（結束日）</label>
          <input v-model="form.endDate" type="date" class="mb-4 p-2 border rounded w-full" > -->

          <!-- 提交按鈕 保留-->
          <!-- <div class="space-x-2">
            <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              取消
            </button>
          
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold">
              提交
            </button>
          </div> -->
          <!-- Accordion 1.基本資料 -->
          <div>
            <button @click="toggleAccordion('basic')" class="bg-black text-white w-full text-lg font-bold p-2 flex justify-between">
              <span>1.基本資料</span>
              <span> {{ isSectionOpen('basic') ? '▲' : '▼' }}</span>
            </button>
            <transition name="fade">
              <ol v-show="isSectionOpen('basic')" class="list-decimal ml-6 space-y-3">
                <!-- 行銷活動名稱 -->
                <li class="border-b border-gray-300 pb-4">
                  <label class="block mb-2 font-semibold">活動名稱</label>
                  <input v-model="form.campaign.basic.campaignTitle" type="text" class=" p-2 border rounded w-full" placeholder="例如：母親節加碼">
                </li> 
                <!--1.  -->
                <li class="border-b border-gray-300 pb-4 space-y-3">
                  <h4 class="">選擇生效條件類型</h4> 
                  <div class="space-x-2 ">
                    <input type="radio" id="none" v-model="form.campaign.basic.selectedCondition" name="condition">
                    <label for="none">沒有條件</label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input type="radio" id="reach" value="reach" v-model="form.campaign.basic.selectedCondition" name="condition">
                    <label for="reach">當全單達到...</label>
                    <div class="flex-1 min-h-[40px]">
                      <select v-if="form.campaign.basic.selectedCondition === 'reach'"  name="" id="" class="p-2 border max-w-56 w-full ">
                        <!--  -->
                        <option value="">請選擇</option>
                        <option value="">最低金額</option>
                        <option value="">最少件數</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input type="radio" id="products" value="products" name="condition" v-model="form.campaign.basic.selectedCondition">
                    <label for="products">當指定商品達到...</label>
                    <div class="flex-1 min-h-[40px]">
                      <select v-if="form.campaign.basic.selectedCondition === 'products'"  name="" id="" class="p-2 border max-w-56 w-full">
                        <option value="">請選擇</option>
                        <option value="">最低金額</option>
                        <option value="">最少件數</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input type="radio" id="categories" value="categories" v-model="form.campaign.basic.selectedCondition" name="condition">
                    <label for="categories">當指定分類達掉...</label>
                    <div class="flex-1 min-h-[40px]">
                      <select v-if="form.campaign.basic.selectedCondition === 'categories'"  name="" id="" class="p-2 border max-w-56 w-full">
                        <option value="">請選擇</option>
                        <option value="">最低金額</option>
                        <option value="">最少件數</option>
                      </select>
                    </div>
                  </div>
                </li>
                <!-- 2. -->
                <li class="border-b border-gray-300 pb-4 space-y-3">
                  <h4>選擇優惠類型</h4>
                  <div class="space-x-2">
                    <label for="OfferType">優惠類型</label>
                    <select name="" id="OfferType" v-model="form.campaign.basic.OfferType" class="p-2 border max-w-56 w-full">
                      <option value="">請選擇</option>
                      <option value="percent">%折扣</option>
                      <option value="amount">折扣金額</option>
                      <option value="gift">贈品</option>
                    </select>
                  </div>
                  <div class="space-x-2">
                    <label for="ApplyTo">套用至</label>
                    <select name="" id="ApplyTo" v-model="form.campaign.basic.ApplyTo" class="p-2 border max-w-56 w-full">
                      <option value="">請選擇</option>
                      <option value="all">全店</option>
                      <option value="category">指定分類</option>
                      <option value="product">指定商品</option>
                      <option value="cnce">一次性</option>
                    </select>
                  </div>
                  <div class="space-x-2 flex">
                    <label for="">自動累計優惠</label>
                
                    <div class="relative group">
                      <div class="space-x-2">
                        <input type="radio" name="grand" id="enable" value="enable" v-model="form.campaign.basic.AutoApply">
                        <label for="enable">開啟</label>
                      </div>
                      <!-- 提示訊息 -->
                      <div v-if="form.campaign.basic.AutoApply === 'enable'" class="absolute -top-14 left-1/2 -translate-x-1/2 bg-black text-white text-sm text-center rounded px-2 py-1 min-w-60 max-w-96 opacity-0 group-hover:opacity-100 transition duration-200">
                    滿 100 折 10 元 滿 100 折 10 元 滿 100 折 10 元 滿 100 折 10 元
                      </div>
                    </div>
                
                    <div class="relative group">
                      <div class="space-x-2">
                        <input type="radio" name="grand" id="disable" value="disable" v-model="form.campaign.basic.AutoApply">
                        <label for="disable">關閉</label>
                      </div>
                      <!-- 提示訊息 -->
                      <div v-if="form.campaign.basic.AutoApply === 'disable'" class="absolute -top-14 left-1/2 -translate-x-1/2 bg-black text-white text-sm text-center rounded px-2 py-1 min-w-60 max-w-96 opacity-0 group-hover:opacity-100 transition duration-200">
                    滿 200 仍折 10 元 滿 200 仍折 10 元 滿 200 仍折 10 元
                      </div>
                    </div>
                  </div>
                </li>
                <!-- 3. -->
                <li class="border-b border-gray-300 pb-4 space-y-3">
                  <h4>設定活動和條件</h4>
                  <!-- % -->
                  <div class="flex ">
                    <div class="flex items-center">
                      <label for="PercentDiscount">折扣</label>
                      <div class="flex w-40"> 
                        <input type="text" id="PercentDiscount" class="border border-gray-300 px-3 py-1 w-full rounded-l" v-model="form.campaign.percentDiscount.discount">
                        <span class="border border-gray-300 border-l-0 bg-gray-100 px-3 py-1 flex items-center rounded-r text-gray-600">%</span>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <label for="PercentThreshold">當購物滿</label>
                      <div class="flex w-40">
                        <span class="border border-gray-300 border-r-0 bg-gray-100 px-3 py-1 flex items-center rounded-l text-gray-600">NT$</span>
                        <input type="text" name="" id="PercentThreshold" v-model="form.campaign.percentDiscount.threshold" class="border border-gray-300 px-3 py-1 w-full rounded-r">
                      </div>
                    </div>
                    <button>移除</button>
                  </div>
                  <p class="text-sm text-gray-600 ">填寫1-99之間任何數字。例:20代表八折；70代表三折。</p>
                  <!-- 金額 -->
              
                  <div class="flex">
                    <div class="flex items-center">
                      <label for="AmountDiscount">折扣</label>
                      <div class="flex  w-40">
                        <span class="border border-gray-300 border-l-0 bg-gray-100 px-3 py-1 flex  items-center  rounded-l text-gray-600">NT$</span>
                        <input type="text" id="AmountDiscount" v-model="form.campaign.amountDiscount.discount" class="border border-gray-300 px-3 py-1 w-full rounded-r">
                      </div>
                    </div>
                    <div class="flex items-center">
                      <label for="AmountThreshold">當購物滿</label>
                      <div class="flex w-40">
                        <span class="border border-gray-300 border-r-0 bg-gray-100 px-3 py-1 flex items-center rounded-l text-gray-600">NT$</span>
                        <input type="text" id="AmountThreshold" v-model="form.campaign.amountDiscount.threshold" class="border bporder-gray-300 px-3 py-1 w-full rounded-r">
                      </div>
                  
                    </div>
                    <button>移除</button>
                  </div>
                  <p class="text-sm text-gray-600">填寫的數字必須大於0。例:20代表減$20；70代表減$70</p>
                </li>
              </ol>
            </transition>
          </div>
          <!-- Accordion 2.目標群組 -->
          <div>
            <button @click="toggleAccordion('group')"  class="bg-black text-white w-full text-lg font-bold p-2 flex justify-between">
              <span>2.目標群組</span>
              <span>{{ isSectionOpen('group') ? '▲' : '▼' }}</span>
            </button>
            <transition name="fade">
              <ol v-show="isSectionOpen('group')" class="list-decimal ml-6 space-y-3">
                <!-- 1. -->
                <li class="border-b border-gray-300 pb-4 space-y-3">
                  <h4>請選擇目標群組</h4>
                  <div class="space-x-2">
                    <input type="radio" id="AllCustomers" value="all" v-model="form.targetGroup.selectedGroup" name="TargetGroup"class="">
                    <label for="AllCustomers" class="">所有顧客</label>
                  </div>
                  <div class="space-x-2">
                    <input type="radio" id="Members" value="members" v-model="form.targetGroup.selectedGroup" name="TargetGroup">
                    <label for="Members">會員</label>
                  </div>
                  <div class="space-x-2">
                    <input type="radio" id="DesignatedCustomer" value="tagged" v-model="form.targetGroup.selectedGroup" name="TargetGroup">
                    <label for="DesignatedCustomer">指定顧客標籤</label>
                  </div>
                </li>
                <!--  選擇所有顧客-->
                <li v-if="form.targetGroup.selectedGroup === 'all'" class="border-b border-gray-300 pb-4 space-y-3">
                    <h4>其他設定</h4>
                    <p>每位顧客最多使用次數</p>
                    <div class="flex space-x-2">
                      <div class="space-x-2">
                        <input type="radio" id="NoLimit" value="NoLimit" v-model="form.targetGroup.usageLimit" name="frequency">
                        <label for="NoLimit">不限使用次數</label>
                      </div>
                      <div >
                        <div class="space-x-2">
                          <input type="radio" id="First" value="First" v-model="form.targetGroup.usageLimit" name="frequency">
                          <label for="First">限首次購買</label>
                        </div>
                        <p class="ml-6 text-sm text-gray-600">限尚未成立過訂單的顧客使用</p>
                      </div>
                    </div>
                </li>
                <!-- 選擇會員 -->
                <li v-if="form.targetGroup.selectedGroup === 'members'" class="border-b border-gray-300 pb-4 space-y-3">
                    <h4>目標會員群組</h4>
                    <div class="flex space-x-2">
                      <div class="space-x-2">
                        <input type="radio" id="AllMembmers" value="All" v-model="form.targetGroup.members.levelOption"  name="MemberGroup"class="">
                        <label for="AllMembmers" class="">所有會員</label>
                      </div>
                      <div class="space-x-2">
                        <input type="radio" id="DesignatedMembers" value="MemberLevel" v-model="form.targetGroup.members.levelOption"  name="MemberGroup">
                        <label for="DesignatedMembers">指定會員等級</label>
                      </div>
                    </div>

                    <div v-if="form.targetGroup.members.levelOption === 'MemberLevel'" class="space-y-3" >
                      <select name="" id="" v-model="selectedOption" @change="addSelectedLevel" class="w-full border p-2">
                        <option value="">請選擇會員類型</option>
                        <option 
                          v-for="level in availableMemberLevels" 
                          :key="level.value" 
                          :value="level.value"
                          :disabled="form.targetGroup.members.selectedLevels.some(item => item.value === level.value)"
                          >
                          {{ level.label }}
                        </option>
                      </select>
                      <p v-if="form.targetGroup.members.selectedLevels.length">已選擇目標群組({{ form.targetGroup.members.selectedLevels.length }}個會員已選擇)</p>
                      <table v-if="form.targetGroup.members.selectedLevels.length" class=" w-full table-fixed  ">
                        <thead class="border">
                          <tr>
                            <th class=" px-4 py-2 text-left w-1/3">會員級別</th>
                            <th class=" px-4 py-2 text-left w-1/3">會員級別數量</th>
                            <!-- <th class=" px-4 py-2 text-left w-1/3">123</th> -->
                          </tr>
                        </thead>
                        <tbody class="border border-t-0">
                          <tr v-for="(level, index) in form.targetGroup.members.selectedLevels" :key="level.value">
                            <td class=" px-4 py-2">{{ level.label }}</td>
                            <td class=" px-4 py-2">{{ level.count }}</td>
                            <td class=" px-4 py-2 text-right ">
                              <button 
                                type="button" 
                                class="bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                                @click="removeSelectedLevel(index)"
                                >X</button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                </li>  
                <li v-if="form.targetGroup.selectedGroup === 'members'" class="space-y-3">
                    <h4>其他設定</h4>
                    <p>每位顧客最多使用次數</p>
                    <div class="flex space-x-2">
                      <div class="space-x-2">
                        <input type="radio" id="NoLimit" value="NoLimit" v-model="form.targetGroup.usageLimit" name="frequency">
                        <label for="NoLimit">不限使用次數</label>
                      </div>
                      <div class="space-x-2">
                        <input type="radio" id="LimitedOne" value="LimitedOne" v-model="form.targetGroup.usageLimit" name="frequency">
                        <label for="LimitedOne">每位會員限用優惠一次</label>
                      </div>
                      <div >
                        <div class="space-x-2">
                          <input type="radio" id="First" value="First" v-model="form.targetGroup.usageLimit" name="frequency">
                          <label for="First">限首次購買</label>
                        </div>
                        <p class="ml-6 text-sm text-gray-600">限尚未成立過訂單的顧客使用</p>
                      </div>
                    </div>
                </li>
                <!-- 選擇指定顧客標籤 -->
                  <li v-if="form.targetGroup.selectedGroup === 'tagged'" class="border-b border-gray-300 pb-4 space-y-3">
                    <h4>顧客標籤</h4>
                    <p>選擇適用此優惠的顧客標籤，顧客需登入才能使用，標籤最多10組</p>
                    <select name="" id="" v-model="form.targetGroup.tags.selectedTagValue" @change="addSelectedTag" class="w-full border p-2">
                      <option value="">請選擇或搜尋顧客標籤</option>
                      <option 
                        v-for="tag in availableTags"
                        :key="tag.value"
                        :value="tag.value"
                        :disabled="form.targetGroup.tags.selectedTags.some(t => t.value === tag.value)"
                      >
                      {{ tag.label }}
                      </option>
                    </select>
                    <p>以選擇{{ form.targetGroup.tags.selectedTags.length }}/10個顧客標籤</p>
                    <table class=" w-full table-fixed  ">
                      <thead class="border">
                        <tr> 
                          <th class=" px-4 py-2 text-left w-1/3">顧客標籤</th>
                          <th class=" px-4 py-2 text-left w-1/3">顧客數量</th>
                          <!-- <th class=" px-4 py-2 text-left w-1/3">123</th> -->
                        </tr>
                      </thead>
                      <tbody class="border border-t-0">
                        <tr 
                          v-for="(tag,index) in form.targetGroup.tags.selectedTags"
                          :key="tag.value"
                        >
                          <td class=" px-4 py-2">{{ tag.label }}</td>
                          <td class=" px-4 py-2">{{ tag.count }}</td>
                          <td class=" px-4 py-2 text-right ">
                            <button 
                              type="button" 
                              class="bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                              @click="removeSelectedTag(index)"
                            >X</button>
                          </td>
                        </tr>
                   
                      </tbody>
                    </table>
                  </li>
                  <li v-if="form.targetGroup.selectedGroup === 'tagged'" class="border-b border-gray-300 pb-4 space-y-3">
                    <h4>其他設定</h4>
                    <p>每位顧客最多使用次數</p>
                    <div class="flex space-x-2">
                      <div class="space-x-2">
                        <input type="radio" id="NoLimit" value="NoLimit" v-model="form.targetGroup.usageLimit" name="frequency">
                        <label for="NoLimit">不限使用次數</label>
                      </div>
                      <div class="space-x-2">
                        <input type="radio" id="LimitedOne" value="LimitedOne" v-model="form.targetGroup.usageLimit" name="frequency">
                        <label for="LimitedOne">每位會員限用優惠一次</label>
                      </div>
                      <div >
                        <div class="space-x-2">
                          <input type="radio" id="First" value="First" v-model="form.targetGroup.usageLimit" name="frequency">
                          <label for="First">限首次購買</label>
                        </div>  
                        <p class="ml-6 text-sm text-gray-600">限尚未成立過訂單的顧客使用</p>
                      </div>
                    </div>
                  </li>
              </ol>
            </transition>
           
          </div>
          <!-- Accordion 3.優惠與標準 -->
          <div>
            <button @click="toggleAccordion('discount')" class="bg-black text-white w-full text-lg font-bold p-2 flex justify-between">
              <span>3.優惠與標準</span>
              <span>{{ isSectionOpen('discount') ? '▲' : '▼' }}</span>
            </button>
            <transition name="fade">
              <ol v-show="isSectionOpen('discount')"class="list-decimal ml-6 space-y-3" >
                <li class="space-y-3 ">
                  <h4>選擇促銷方法</h4>
                  <div class="space-x-2">
                    <input type="radio" id="automatic" value="automatic" v-model="form.promotion.selectedMethod" name="promotion">
                    <label for="automatic">自動套用優惠</label>
                  </div>
                  <div class="space-x-2" >
                    <input type="radio" id="UseCoupons" value="UseCoupons" v-model="form.promotion.selectedMethod" name="promotion">
                    <label for="UseCoupons">使用優惠卷</label>
                  </div>
                  <div class="space-x-2">
                    <input type="radio" id="RecommendedActivities" value="RecommendedActivities" v-model="form.promotion.selectedMethod" name="promotion">
                    <label for="RecommendedActivities">僅適用於推薦活動</label>
                  </div>
                </li>
                <!-- 選擇自動套用優惠 -->
                <li v-if="form.promotion.selectedMethod === 'automatic'" class="space-y-3">
                  <h4>優惠卷使用上限</h4>
                  <p>優惠卷可使用次數</p>
                  <div class="flex w-40">
                    <input type="text" id="usagelimit" value="usagelimit" v-model="form.promotion.automatic.usageLimit" class="border border-gray-300 px-3 py-1 w-full rounded-l">
                    <label for="usagelimit" class="border border-l-0 border-gray-300 bg-gray-100 px-3 py-1 flex items-center text-gray-600 rounded-r">次</label>
                  </div>
                  <div class="space-x-2">
                    <input type="checkbox" id="unlimited" value="unlimited" v-model="form.promotion.automatic.unlimited">
                    <label for="unlimited">無限</label>
                  </div>
                </li>
                <li v-if="form.promotion.selectedMethod === 'automatic'" class="space-y-3">
                  <h4>促銷限制</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>促銷開始時間</p>
                      <input type="date" value="StartDate" v-model="form.promotion.automatic.startDate" class="w-40">
                    </div>
                    <div>
                      <p>促銷結束時間</p>
                      <input type="date" value="EndDate" v-model="form.promotion.automatic.endDate" class="w-40">
                      <div class="space-x-2">
                        <input type="checkbox" id="NeverExpires" value="NeverExpires" v-model="form.promotion.automatic.neverExpires">
                        <label for="NeverExpires">永不過期</label>
                      </div>  
                    </div>
                  </div>
                </li>
                <!-- 選擇使用優惠卷 -->
                <li v-if="form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                  <h4>優惠卷領取方式</h4>
                  <div>
                    <div class="space-x-2">
                      <input type="radio" id="InCenter" value="InCenter" v-model="form.promotion.useCoupons.selectedHowToReceive" name="GetCoupons">
                      <label for="InCenter">顯示在領卷中心</label>
                    </div>  
                    <p class="ml-6 text-sm text-gray-600">顧客可直接在網店前台的領卷中心領取，此優惠卷限領取和使用一次</p>
                  </div>
                  <div>
                    <div class="space-x-2">
                      <input type="radio" id="EnterCouponCode" value="EnterCouponCode" v-model="form.promotion.useCoupons.selectedHowToReceive" name="GetCoupons">
                      <label for="EnterCouponCode">輸入優惠卷代碼領取</label>
                    </div>
                    <p class="ml-6 text-sm text-gray-600">顧客可在網店前台的領卷中心和會員中心輸入代碼後領取，亦支援顧客在結帳時直接輸入代碼套用</p>
                  </div>
                  <div >
                    <div class="space-x-2">
                      <input type="radio" id="GetCoupons" value="GetCoupons" v-model="form.promotion.useCoupons.selectedHowToReceive" name="GetCoupons">
                      <label for="GetCoupons">透過連結或顧客分群發送(領取型優惠卷)</label>
                    </div>
                    <p class="ml-6 text-sm text-gray-600">建立優惠卷連結後，顧客點擊後登入即可領取(每位會員限領取與使用一次)；亦可使用顧客分群發送優惠卷，直接將優惠卷歸戶至顧客身上</p>
                    </div>
                </li> 
                <!-- 選擇使用僅適用於推薦活動 -->
                <li v-if="form.promotion.selectedMethod === 'RecommendedActivities'" class="space-y-3">
                  <h4>優惠卷使用上限</h4>
                  <p>優惠卷可使用次數</p>
                  <div class="flex w-40">
                    <input type="text" v-model="form.promotion.recommended.usageLimit" class="border border-gray-300 px-3 py-1 w-full rounded-l">
                    <label class="border border-l-0 border-gray-300 bg-gray-100 px-3 py-1 flex items-center text-gray-600 rounded-r">次</label>
                  </div>
                  <div class="space-x-2">
                    <input type="checkbox" id="unlimited" v-model="form.promotion.recommended.unlimited">
                    <label for="unlimited">無限</label>
                  </div>  
                </li>
                <!-- 選擇顯示在領卷中心 -->
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'InCenter' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                  <h4>優惠卷使用上限</h4>
                  <p>優惠可領取次數</p>
                  <div class="flex w-40">
                    <input type="text" v-model="form.promotion.useCoupons.inCenter.usageLimit" class="border border-gray-300 px-3 py-1 w-full rounded-l">
                    <label class="border border-l-0 border-gray-300 bg-gray-100 px-3 py-1 flex items-center text-gray-600 rounded-r">次</label>
                  </div>
                  <div class="space-x-2">
                    <input type="checkbox" id="unlimited" v-model="form.promotion.useCoupons.inCenter.unlimited">
                    <label for="unlimited">無限</label>
                  </div>
                </li>
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'InCenter' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                  <h4>顯示在領卷中心</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>領卷開始時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.inCenter.receiveStartDate" class="w-40">
                    </div>
                    <div>
                      <p>領卷結束時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.inCenter.receiveEndDate" class="w-40">
                      <div class="space-x-2">
                        <input type="checkbox" id="NeverExpiresReceive" v-model="form.promotion.useCoupons.inCenter.neverExpiresReceive">
                        <label for="NeverExpiresReceive">永不過期</label>
                      </div>  
                    </div>
                  </div>
                </li>
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'InCenter' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                  <h4>促銷限制</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>促銷開始時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.inCenter.promotionStartDate" class="w-40">
                    </div>
                    <div>
                      <p>促銷結束時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.inCenter.promotionEndDate" class="w-40">
                      <div class="space-x-2">
                        <input type="checkbox" id="NeverExpiresPromotion" v-model="form.promotion.useCoupons.inCenter.neverExpiresPromotion" >
                        <label for="NeverExpiresPromotion">永不過期</label>
                      </div>  
                    </div>
                  </div>
                </li>
                <!-- 選擇輸入優惠卷代碼領取 -->
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                  <h4>優惠卷代碼與使用上限</h4>
  
                  <!-- 單組通用代碼 -->
                  <div>
                    <div class="space-x-2">
                      <input type="radio" id="UniversalCode" value="Universal" v-model="form.promotion.useCoupons.enterCouponCode.selectedCodeType" name="CouponCode">
                      <label for="UniversalCode">單組通用代碼</label>
                    </div>
                    <p class="ml-6 text-sm text-gray-600">設定一組單組通用代碼，格式支援中文，半形英文數字的組合</p>
                  </div>

                  <div v-if="form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Universal'" class="ml-6 flex flex-col md:flex-row">
                    <div class="md:w-1/2 space-y-2">
                      <label class="block">輸入代碼</label>
                      <input type="text" v-model="form.promotion.useCoupons.enterCouponCode.universal.code" class="w-40 border border-gray-300 px-3 py-1 rounded" placeholder="例如:Happy慶新年888">
      
                      <div class="space-x-2">
                        <input type="checkbox" v-model="form.promotion.useCoupons.enterCouponCode.universal.showInMemberCenter">
                        <label>於網店會員中心顯示優惠卷</label>
                      </div>
                    </div>

                    <div class="md:w-1/2 space-y-2">
                      <label class="block">優惠可使用次數</label>
                      <div class="flex">
                        <input type="number" v-model.number="form.promotion.useCoupons.enterCouponCode.universal.usageLimit" class="border border-gray-300 px-3 py-1 w-40 rounded-l">
                        <span class="border border-gray-300 border-l-0 bg-gray-100 px-3 py-1 flex items-center rounded-r text-gray-600">次</span>
                      </div>

                      <div class="space-x-2">
                        <input type="checkbox" v-model="form.promotion.useCoupons.enterCouponCode.universal.unlimited">
                        <label>無限</label>
                      </div>
                    </div>
                  </div>

                  <!-- 多組獨立代碼 -->
                  <div>
                    <div class="space-x-2">
                      <input type="radio" id="IndependentCode" value="Independent" v-model="form.promotion.useCoupons.enterCouponCode.selectedCodeType" name="CouponCode">
                      <label for="IndependentCode">多組獨立代碼</label>
                    </div>
                    <p class="ml-6 text-sm text-gray-600">設定多組代碼，每組代碼限用一次</p>
                  </div>

                  <div v-if="form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Independent'" class="ml-6">
                    <p>需設定大於一組代碼，不可使用空格 (格式支援中文、半形英文數字的組合)，代碼間用半形逗號做區隔</p>
                    <textarea v-model="form.promotion.useCoupons.enterCouponCode.independent.codes" rows="5" class="border border-gray-300 rounded w-full p-2" placeholder="例如:Happy慶新年111,Happy慶新年222"></textarea>
                  </div>
                </li>
                <!--領卷中心（針對單組通用代碼） -->
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons' && form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Universal'" class="space-y-3">  
                  <h4>顯示在領卷中心</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>領卷開始時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.enterCouponCode.universal.receiveStartDate" class="w-40">
                    </div>
                    <div>
                      <p>領卷結束時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.enterCouponCode.universal.receiveEndDate" :disabled="form.promotion.useCoupons.enterCouponCode.universal.neverExpiresReceive" class="w-40">
                      <div class="space-x-2">
                        <input type="checkbox" id="NeverExpires" v-model="form.promotion.useCoupons.enterCouponCode.universal.neverExpiresReceive">
                        <label for="NeverExpires">永不過期</label>
                      </div>  
                    </div>
                  </div>
                </li>
                <!-- 領卷中心（針對多組獨立代碼） -->
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons' && form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Independent'" class="space-y-3">  
                  <h4>顯示在領卷中心</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>領卷開始時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.enterCouponCode.independent.receiveStartDate" class="w-40">
                    </div>
                    <div>
                      <p>領卷結束時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.enterCouponCode.independent.receiveEndDate" class="w-40" :disabled="form.promotion.useCoupons.enterCouponCode.independent.neverExpiresReceive">
                      <div class="space-x-2">
                        <input type="checkbox" v-model="form.promotion.useCoupons.enterCouponCode.independent.neverExpiresReceive">
                        <label>永不過期</label>
                      </div>  
                    </div>
                  </div>
                </li>
                <!-- 促銷限制（單組通用代碼） -->
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons' && form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Universal'" class="space-y-3">
                  <h4>促銷限制</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>促銷開始時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.enterCouponCode.universal.promotionStartDate" class="w-40">
                    </div>
                    <div>
                      <p>促銷結束時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.enterCouponCode.universal.promotionEndDate" :disabled="form.promotion.useCoupons.enterCouponCode.universal.neverExpiresPromotion" class="w-40">
                      <div class="space-x-2">
                        <input type="checkbox" id="NeverExpires" v-model="form.promotion.useCoupons.enterCouponCode.universal.neverExpiresPromotion" >
                        <label for="NeverExpires">永不過期</label>
                      </div>  
                    </div>
                  </div>
                </li>
                <!-- 促銷限制（多組獨立代碼） -->
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons' && form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Independent'" class="space-y-3">
                  <h4>促銷限制</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>促銷開始時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.enterCouponCode.independent.promotionStartDate" class="w-40">
                    </div>
                    <div>
                      <p>促銷結束時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.enterCouponCode.independent.promotionEndDate" class="w-40" :disabled="form.promotion.useCoupons.enterCouponCode.independent.neverExpiresPromotion">
                      <div class="space-x-2">
                        <input type="checkbox" v-model="form.promotion.useCoupons.enterCouponCode.independent.neverExpiresPromotion">
                        <label>永不過期</label>
                      </div>  
                    </div>
                  </div>
                </li>

                <!-- 選擇透過連結或顧客分群發送 -->
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'GetCoupons' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                    <h4>優惠卷使用上限</h4>
                    <p>優惠卷可使用次數</p>
                    <div class="flex w-40">
                      <input type="text" v-model="form.promotion.useCoupons.getCoupons.usageLimit" class="border border-gray-300 px-3 py-1 w-full rounded-l">
                      <label class="border border-l-0 border-gray-300 bg-gray-100 px-3 py-1 flex items-center text-gray-600 rounded-r">次</label>
                    </div>
                    <div class="space-x-2">
                      <input type="checkbox" id="unlimited" v-model="form.promotion.useCoupons.getCoupons.unlimited">
                      <label for="unlimited">無限</label>
                    </div>

                    <h4>優惠卷連結</h4>
                    <p class="text-sm text-gray-600">尚未建立領取連結，於活動建立成功後產生</p>
                </li>
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'GetCoupons' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                  <h4>顯示在領卷中心</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>領卷開始時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.getCoupons.receiveStartDate" class="w-40">
                    </div>
                    <div>
                      <p>領卷結束時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.getCoupons.receiveEndDate" class="w-40">
                      <div class="space-x-2">
                        <input type="checkbox" id="NeverExpires" v-model="form.promotion.useCoupons.getCoupons.neverExpiresReceive" >
                        <label for="NeverExpires">永不過期</label>
                      </div>  
                    </div>
                  </div>
                </li>
                <li v-if="form.promotion.useCoupons.selectedHowToReceive === 'GetCoupons' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                  <h4>促銷限制</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>促銷開始時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.getCoupons.promotionStartDate" class="w-40">
                    </div>
                    <div>
                      <p>促銷結束時間</p>
                      <input type="date" v-model="form.promotion.useCoupons.getCoupons.promotionEndDate" class="w-40">
                      <div class="space-x-2">
                        <input type="checkbox" id="NeverExpires" v-model="form.promotion.useCoupons.getCoupons.neverExpiresPromotion" >
                        <label for="NeverExpires">永不過期</label>
                      </div>  
                    </div>
                  </div>
                </li>
                  
              </ol>
            </transition>
             <button
              @click="submitForm"
              class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
            送出新增
            </button>
          </div>
          <!-- Accordion 4.付款及送貨方式 -->
          <div>
            <button @click="toggleAccordion('payment')" class="bg-black text-white w-full text-lg font-bold p-2 flex justify-between">
              <span>4.付款及送貨方式</span>
              <span>{{ isSectionOpen('payment') ? '▲' : '▼'}}</span>
            </button>
            <transition name="fade" >
              <div v-show="isSectionOpen('payment')" class="px-2 space-y-3">
                <div class="space-y-3">
                  <h4 class="font-bold">付款設定</h4>
                  <p class="text-sm text-gray-600">系統已自動選取所有的付款設定適用於此促銷活動，如某付款設定不適用於促銷活動，可以取消選取選項</p>
                  
                  <div class="flex gap-2">
                    <input type="checkbox" id="CashOnDelivery" v-model="form.paymentAndShipping.paymentMethods.cashOnDelivery">
                    <label for="CashOnDelivery">貨到付款</label>
                  </div>
                  <div class="flex gap-2">
                    <input type="checkbox" id="CreditCardPayment" v-model="form.paymentAndShipping.paymentMethods.creditCard">
                    <label for="CreditCardPayment">信用卡線上付款(支援Visa,Master,JCB)</label>
                  </div>
                  <div class="flex gap-2">
                    <input type="checkbox" id="LinePay" v-model="form.paymentAndShipping.paymentMethods.linePay">
">
                    <label for="LinePay">LINE Pay</label>
                  </div>
                </div>
                <div class="space-y-3">
                  <h4 class="font-bold">送貨設定</h4>
                  <p class="text-sm text-gray-600">系統已自動選取所有的付款設定適用於此促銷活動，如某付款設定不適用於促銷活動，可以取消選取選項</p>
                  <div class="flex gap-2">
                    <input type="checkbox" id="BlackCat" v-model="form.paymentAndShipping.shippingMethods.blackCat">
                    <label for="BlackCat">黑貓 - 常溫</label>
                  </div>
                  <div class="flex gap-2">
                    <input type="checkbox" id="Family" v-model="form.paymentAndShipping.shippingMethods.familyMart">
                    <label for="Family">全家 - 取貨</label>
                  </div>
                  <div class="flex gap-2">
                    <input type="checkbox" id="7-11" v-model="form.paymentAndShipping.shippingMethods.sevenEleven">
                    <label for="7-11">7-11 - 取貨</label>
                  </div>
                </div>
              </div>                                                    
            </transition>
          </div>
        <!-- </form> -->
      </div>
</template>
<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.fade-enter-to, .fade-leave-from {
  opacity: 1;
}
</style>