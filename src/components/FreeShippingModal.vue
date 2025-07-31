<script setup>
import { ref,reactive,watch,computed } from 'vue'
import { merge } from 'lodash-es'

const props = defineProps({
  freeshippingData:{
    type:Object,
    default:null
  },
  isEditing:{
    type:Boolean,
  }
})


const emit = defineEmits(['submitFreeShipping','close'])

const handleClose = () => {
  emit('close')
}

const allCategories = ref([
  { id: 1, name: '緊身衣' },
  { id: 2, name: '毛衣' },
  { id: 3, name: '玩具' },
  { id: 4, name: '配件' },
  { id: 5, name: '洋裝' },
  { id: 6, name: '緊身褲' }
])
//指定商品用
// const allProducts = ref([])
// const searchKeyword = ref('')

const form = reactive({
   //Accordion 1 - 基本資料
  campaign: {
    basic: {
      campaignTitle: '',// 活動名稱
      shippingType:'',//all,part
      selectedCondition: '',// none, reach, products, categories
      conditionSubType: '',//miniAmount,miniPieces
    },
    conditionThreshold:{
        miniAmount:'',// 最低金額門檻b
        miniPieces:'',// 最少件數門檻
    },
    // selectedProducts:[],// ✅ 指定商品清單
    selectedCategories:[],// ✅ 指定分類清單
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

    // usageLimit: '' // 'unlimited', 'first', 'once'
  },
  //Accordion 3.優惠與標準
  promotion: {
    selectedMethod: '', // 'automatic' | 'UseCoupons' | 'RecommendedActivities'

    // 自動套用優惠
    automatic: {
      usageLimit: '',       // 數字，代表次數
      unlimited: false,     // 是否無限
      promotionStartDate: null,        // yyyy-MM-dd
      promotionEndDate: null,          // yyyy-MM-dd
      neverExpiresPromotion: false   // 是否永不過期
    },

    // 使用優惠券
    useCoupons: {
      selectedReceiveMethod: '', // 'InCenter' | 'EnterCouponCode' | 'GetCoupons'
      // 顯示在領卷中心
      inCenter: {
        // customReceiveCondition: [],  // ['First', 'Birthday'] 等 value 陣列
        usageLimit: '',       // 數字
        unlimited: false,
        code:'',
        receiveStartDate:null,
        receiveEndDate: null,
        neverExpiresReceive: false,
        promotionStartDate: null,
        promotionEndDate: null,
        neverExpiresPromotion: false,
        
      },
      // 輸入優惠卷代碼領取
      enterCouponCode: {
        selectedCodeType: '', // 'Universal' or 'Independent'

        // 單組通用代碼設定
        universal: {
          code:'',
          showInMemberCenter: false,
          usageLimit:'',
          unlimited:false,
          // receiveStartDate: null,
          // receiveEndDate: null,
          // neverExpiresReceive: false,
          promotionStartDate: null,
          promotionEndDate:null,
          neverExpiresPromotion: false
        },

        // 多組獨立代碼設定
        independent: {
          codes: [], // 例如輸入多筆代碼
          // receiveStartDate: null,
          // receiveEndDate: null,
          // neverExpiresReceive: false,
          promotionStartDate: null,
          promotionEndDate: null,
          neverExpiresPromotion: false
        }
             
      },
      // 透過連結或顧客分群發送
      getCoupons: {
        usageLimit: '',
        unlimited: false,
        // receiveStartDate: null,
        // receiveEndDate: null,
        // neverExpiresReceive: false,
        promotionStartDate: null,
        promotionEndDate: null,
        neverExpiresPromotion: false
      }
    },

    // 僅適用於推薦活動
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

})


const selectedOption = ref('') //一般會員、VIP、VVIP(Accordion 2 - 目標群組)
// 下拉選單選項（只負責顯示 label / value）
const availableMemberLevels = ref([
  { label: '一般會員', value: 'member' },
  { label: 'VIP', value: 'vip' },
  { label: 'VVIP', value: 'vvip' },
])
// 假設這是所有會員資料（未來會來自 API）
const members = ref([
  { name: 'Amy', level: 'vip' },
  { name: 'Bob', level: 'vip' },
  { name: 'Cindy', level: 'vvip' },
  { name: 'David', level: 'member' },
  { name: 'Eric', level: 'member' },
  { name: 'Fiona', level: 'vip' },
  { name: 'Grace', level: 'vvip'},
])
 // 顧客標籤選擇
const availableTags = ref([
  {value:'tag1',label:'累積消費5次以上',count:2},
  {value:'tag2',label:'高價購買者',count:4},
  {value:'tag3',label:'近期回購',count:3}
])  

const isAccordionOpen = ref({
  basic:false,// 第 1 組（基本資料）
  group:false,// 第 2 組（目標群組）
  discount:false,//第 3 組(優惠與標準)
  payment:false,//第 4 組(付款及送貨方
})

const submitForm = async (formData = form) => {
  try{
    const payload = {
      //Accordion 1 - 基本資料
      campaign: {
        basic: {
          campaignTitle: formData.campaign.basic.campaignTitle,
          shippingType:formData.campaign.basic.shippingType,
          selectedCondition: formData.campaign.basic.selectedCondition,
          conditionSubType: formData.campaign.basic.conditionSubType,
        },
        conditionThreshold:{
            miniAmount:formData.campaign.conditionThreshold.miniAmount,
            miniPieces:formData.campaign.conditionThreshold.miniPieces    
        },
        selectedCategories:formData.campaign.selectedCategories
      
      },
      //Accordion 2 - 目標群組
      targetGroup: {
        selectedGroup:formData.targetGroup.selectedGroup,
        members: {
          levelOption: formData.targetGroup.members.levelOption,
          selectedLevels: formData.targetGroup.members.selectedLevels,
        },
        tags: {
          selectedTags: formData.targetGroup.tags.selectedTags,
        },
        // usageLimit: formData.targetGroup.usageLimit,
      },
      // ✅ Accordion 3 - 優惠與標準
      promotion: {
        selectedMethod: formData.promotion.selectedMethod,

        automatic: {
          usageLimit: formData.promotion.automatic.usageLimit,
          unlimited: formData.promotion.automatic.unlimited,
          promotionStartDate: formData.promotion.automatic.promotionStartDate,
          promotionEndDate: formData.promotion.automatic.promotionEndDate,
          neverExpiresPromotion: formData.promotion.automatic.neverExpiresPromotion,
        },

        useCoupons: {
          selectedReceiveMethod: formData.promotion.useCoupons.selectedReceiveMethod,

          inCenter: {
            // customReceiveCondition:formData.promotion.useCoupons.inCenter.customReceiveCondition,
            usageLimit: formData.promotion.useCoupons.inCenter.usageLimit,
            unlimited: formData.promotion.useCoupons.inCenter.unlimited,
            code:formData.promotion.useCoupons.inCenter.code,
            receiveStartDate: formData.promotion.useCoupons.inCenter.receiveStartDate,
            receiveEndDate: formData.promotion.useCoupons.inCenter.receiveEndDate,
            neverExpiresReceive: formData.promotion.useCoupons.inCenter.neverExpiresReceive,
            promotionStartDate: formData.promotion.useCoupons.inCenter.promotionStartDate,
            promotionEndDate: formData.promotion.useCoupons.inCenter.promotionEndDate,
            neverExpiresPromotion: formData.promotion.useCoupons.inCenter.neverExpiresPromotion
          },

          enterCouponCode: {
            selectedCodeType: formData.promotion.useCoupons.enterCouponCode.selectedCodeType,
            universal: {
              code:formData.promotion.useCoupons.enterCouponCode.universal.code,
              showInMemberCenter: formData.promotion.useCoupons.enterCouponCode.universal.showInMemberCenter,
              usageLimit:formData.promotion.useCoupons.enterCouponCode.universal.usageLimit,
              unlimited:formData.promotion.useCoupons.enterCouponCode.universal.unlimited,
              receiveStartDate: formData.promotion.useCoupons.enterCouponCode.universal.receiveStartDate,
              receiveEndDate: formData.promotion.useCoupons.enterCouponCode.universal.receiveEndDate,
              neverExpiresReceive: formData.promotion.useCoupons.enterCouponCode.universal.neverExpiresReceive,
              promotionStartDate: formData.promotion.useCoupons.enterCouponCode.universal.promotionStartDate,
              promotionEndDate: formData.promotion.useCoupons.enterCouponCode.universal.promotionEndDate,
              neverExpiresPromotion: formData.promotion.useCoupons.enterCouponCode.universal.neverExpiresPromotion,
            },
            independent: {
              codes: formData.promotion.useCoupons.enterCouponCode.independent.codes,
              receiveStartDate: formData.promotion.useCoupons.enterCouponCode.independent.receiveStartDate,
              receiveEndDate: formData.promotion.useCoupons.enterCouponCode.independent.receiveEndDate,
              neverExpiresReceive: formData.promotion.useCoupons.enterCouponCode.independent.neverExpiresReceive,
              promotionStartDate: formData.promotion.useCoupons.enterCouponCode.independent.promotionStartDate,
              promotionEndDate: formData.promotion.useCoupons.enterCouponCode.independent.promotionEndDate,
              neverExpiresPromotion: formData.promotion.useCoupons.enterCouponCode.independent.neverExpiresPromotion,
            }
          },

          getCoupons: {
            usageLimit: formData.promotion.useCoupons.getCoupons.usageLimit,
            unlimited: formData.promotion.useCoupons.getCoupons.unlimited,
            receiveStartDate: formData.promotion.useCoupons.getCoupons.receiveStartDate,
            receiveEndDate: formData.promotion.useCoupons.getCoupons.receiveEndDate,
            neverExpiresReceive: formData.promotion.useCoupons.getCoupons.neverExpiresReceive,
            promotionStartDate: formData.promotion.useCoupons.getCoupons.promotionStartDate,
            promotionEndDate: formData.promotion.useCoupons.getCoupons.promotionEndDate,
            neverExpiresPromotion: formData.promotion.useCoupons.getCoupons.neverExpiresPromotion,
          }
        },

        recommended: {
          usageLimit: formData.promotion.recommended.usageLimit,
          unlimited: formData.promotion.recommended.unlimited
        }
      },
      //Accordion 4.付款及送貨方式
      paymentAndShipping: {
        paymentMethods: {
          cashOnDelivery: formData.paymentAndShipping.paymentMethods.cashOnDelivery,       // 貨到付款
          creditCard: formData.paymentAndShipping.paymentMethods.creditCard,           // 信用卡線上付款
          linePay:formData.paymentAndShipping.paymentMethods.linePay             // LINE Pay
        },
        shippingMethods: {
          blackCat: formData.paymentAndShipping.shippingMethods.blackCat,             // 黑貓 - 常溫
          familyMart: formData.paymentAndShipping.shippingMethods.familyMart,           // 全家 - 取貨
          sevenEleven: formData.paymentAndShipping.shippingMethods.sevenEleven,           // 7-11 - 取貨
        }
      },

    }
   
    // 如果是編輯模式，補上 id
    if (formData.id) {
      payload.id = formData.id
      emit('submitFreeShipping',{ mode:'edit',payload })
    } else {
      emit('submitFreeShipping',{ mode:'add',payload })
    }
    // console.log('伺服器回傳:', response.data);

     emit('submitFreeShipping',payload) // ✅ 通知父層處理新增/編輯
  }catch(error){
    console.error('新增優惠券失敗', error)
    alert('發送失敗，請檢查欄位與登入狀態');
  }
}

const toggleAccordion = (section) => {
  isAccordionOpen.value[section] = !isAccordionOpen.value[section];
}

const isSectionOpen = (section) => {
   return !!isAccordionOpen.value[section]; 
}

const addSelectedLevel = () => {
  if (!selectedOption.value) return;

   // 找出選項的 label
  const levelOption = availableMemberLevels.value.find(l => l.value === selectedOption.value);
  if (!levelOption) return;

  // 已經加入過就不重複加入
  const exists = form.targetGroup.members.selectedLevels.some((item) => item.value === levelOption.value)
  if(exists)return

  // 計算該等級會員數量
  const count = members.value.filter(member => member.level === levelOption.value).length;
 
  form.targetGroup.members.selectedLevels.push({
      label: levelOption.label,
      value: levelOption.value,
      count
  });

  selectedOption.value = ''; // 清空選擇

}

const removeSelectedLevel = (index) => {
  form.targetGroup.members.selectedLevels.splice(index, 1);
}

const addSelectedTag = () => {
  const selectedValue = form.targetGroup.tags.selectedTagValue;
  if (!selectedValue) return;

  const selectedTag = availableTags.value.find(tag => tag.value === selectedValue);
  if (!selectedTag) return;

  // 限制最多10個
  if (form.targetGroup.tags.selectedTags.length >= 10) {
    alert('最多只能選擇10個顧客標籤');
    return;
  }

  // 確保沒有重複
  const alreadyExists = form.targetGroup.tags.selectedTags.some(tag => tag.value === selectedTag.value);
  if (!alreadyExists ) {
    form.targetGroup.tags.selectedTags.push({ ...selectedTag });
  }

  // 清空選單
  form.targetGroup.tags.selectedTagValue = '';

}

const removeSelectedTag = (index) => {
  form.targetGroup.tags.selectedTags.splice(index,1)
}

// 通用：輸入次數時清除無限選項
const onUsageLimitInput = (target) => {
  if(target.usageLimit !== ''){
    target.unlimited = false
  }
}

// 通用：勾選無限時清除次數
const onUnlimitedChecked = (target) => {
  if(target.unlimited){
    target.usageLimit = ''
  }
}

watch(
   //編輯、新增
  () => props.freeshippingData,
  (newVal) => {
    if (newVal) {
      merge(form, newVal) // 深度合併，不會覆蓋掉巢狀結構

    }
  },
  { immediate: true }
)


</script>

<template>
<teleport to="#modals">
  <div class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">  
    <div class="relative bg-white overflow-auto max-h-[90vh] w-full max-w-lg">
        <!-- X 關閉按鈕 -->
        <button @click="handleClose" class="absolute top-2 right-2 text-gray-500 hover:text-white text-xl font-bold">
        ×
        </button>
       
        <h2 class="bg-black text-white text-lg font-bold text-center py-2">{{ form.id ?'編輯免運費' : '新增免運費'}}</h2>
        
        <!-- <form @submit.prevent="submitCoupon" class="p-3">      -->
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
                <li class="border-b border-gray-300 pb-4 space-y-3">
                    <h4>選擇免運類型</h4>
                    <div>
                        <div class="space-x-2">
                            <input type="radio" id="all" value="all" v-model="form.campaign.basic.shippingType" name="type">
                            <label for="all"> 整筆訂單免運</label>
                        </div>
                        <p class="ml-6 text-sm text-gray-600">滿足生效條件，整筆訂單運費免除</p>
                    </div>
                    <div>
                        <div class="space-x-2">
                            <input type="radio" id="part" value="part" v-model="form.campaign.basic.shippingType" name="type" disabled>
                            <label for="part">部分商品免運</label>
                        </div>
                        <p class="ml-6 text-sm text-gray-600">選取商品之重量/件數將不計入運費計算</p>
                    </div>

                </li>
                <!--1.  -->
                <li v-if="form.campaign.basic.shippingType === 'all'" class="border-b border-gray-300 pb-4 space-y-3" >
                  <h4 class="">選擇生效條件類型</h4> 
                  <div class="space-x-2 ">
                    <input type="radio" id="none" v-model="form.campaign.basic.selectedCondition" name="condition" disabled>
                    <label for="none">沒有條件</label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input type="radio" id="reach" value="reach" v-model="form.campaign.basic.selectedCondition" name="condition">
                    <label for="reach">當全單達到...</label>
                    <div class="flex-1 min-h-[40px]">
                      <select 
                        v-if="form.campaign.basic.selectedCondition === 'reach'" 
                        v-model="form.campaign.basic.conditionSubType"  
                        name="" id="" class="p-2 border max-w-56 w-full ">
                        <!--  -->
                        <option value="">請選擇</option>
                        <option value="miniAmount">最低金額</option>
                        <option value="miniPieces">最少件數</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input type="radio" id="products" value="products" name="condition" v-model="form.campaign.basic.selectedCondition" disabled>
                    <label for="products">當指定商品達到...</label>
                    <div class="flex-1 min-h-[40px]">
                      <select 
                        v-if="form.campaign.basic.selectedCondition === 'products'"
                        v-model="form.campaign.basic.conditionSubType"    
                        name="" id="" class="p-2 border max-w-56 w-full">
                        <option value="">請選擇</option>
                        <option value="miniAmount">最低金額</option>
                        <option value="miniPieces">最少件數</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input type="radio" id="categories" value="categories" v-model="form.campaign.basic.selectedCondition" name="condition">
                    <label for="categories">當指定分類達掉...</label>
                    <div class="flex-1 min-h-[40px]">
                      <select 
                        v-if="form.campaign.basic.selectedCondition === 'categories'"
                        v-model="form.campaign.basic.conditionSubType"  
                        name="" id="" class="p-2 border max-w-56 w-full">
                        <option value="">請選擇</option>
                        <option value="miniAmount">最低金額</option>
                        <option value="miniPieces">最少件數</option>
                      </select>
                    </div>
                  </div>
                </li>
                <!-- 2. -->
                <li v-if="form.campaign.basic.shippingType === 'all' && (form.campaign.basic.conditionSubType === 'miniAmount' || form.campaign.basic.conditionSubType === 'miniPieces')" class="border-b border-gray-300 pb-4 space-y-3">
                    <h4>設定活動和條件</h4>
                    <!-- 最低金額 -->
                    <div 
                      v-if="form.campaign.basic.conditionSubType === 'miniAmount'"
                      class="flex items-center space-x-2"
                    >
                      <label for="miniAmount">當購物滿</label>
                      <div class="flex w-40">
                        <span class="border border-gray-300 border-r-0 bg-gray-100 px-3 py-1 flex items-center rounded-l text-gray-600">NT$</span>
                        <input type="text" id="miniAmount" v-model="form.campaign.conditionThreshold.miniAmount" class="border border-gray-300 px-3 py-1 w-full rounded-r">
                      </div>
                    </div>
                    <!-- 最少件數 -->
                    <div 
                      v-if="form.campaign.basic.conditionSubType === 'miniPieces'"
                      class="flex items-center space-x-2"
                    >
                      <label for="miniPieces">當購物滿</label>
                      <div class="flex w-40">
                        <input type="text" id="miniPieces" v-model="form.campaign.conditionThreshold.miniPieces" class="border bporder-gray-300 px-3 py-1 w-full rounded-l">
                         <span class="border border-gray-300 border-l-0 bg-gray-100 px-3 py-1 flex items-center rounded-r text-gray-600">件</span>
                      </div>
                    </div>
                </li>
                <!-- 指定分類 -->
                <div v-if="form.campaign.basic.selectedCondition === 'categories'" class="border p-4 mt-4">
                  <h4 class="font-bold mb-2">選取指定分類</h4>
                  <div>
                    <div v-for="(category, index) in allCategories" :key="index" class="flex items-center">
                      <input 
                        type="checkbox"
                        :id="'category-' + category.id"
                        :value="category"
                        v-model="form.campaign.selectedCategories"
                      >
                      <label :for="'category-' + category.id" class="ml-2">{{ category.name }}</label>
                    </div>
                  </div>
                </div>
                <!-- 指定商品 -->
                <div v-if="form.campaign.basic.selectedCondition === 'products'" class="border p-4 mt-4">
                  <h4 class="font-bold mb-2">選取指定商品</h4>

                  <div class="mb-2">
                    <input v-model="searchKeyword" type="text" placeholder="搜尋商品名稱或貨號" class="border px-2 py-1 w-full" />
                  </div>

                  <div class="overflow-x-auto max-h-64 border">
                    <table class="min-w-full text-left">
                      <thead>
                        <tr>
                          <th class="px-2 py-1">圖片</th>
                          <th class="px-2 py-1">商品名稱</th>
                          <th class="px-2 py-1">商品貨號</th>
                          <th class="px-2 py-1">商品價格</th>
                          <th class="px-2 py-1"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="product in filteredProductList" :key="product.id">
                          <td><img :src="product.image" class="w-10 h-10 object-cover" /></td>
                          <td>{{ product.name }}</td>
                          <td>{{ product.sku }}</td>
                          <td>{{ product.price }}</td>
                          <td>
                            <button @click="addSelectedProduct(product)" class="text-sm bg-blue-500 text-white px-2 py-1 rounded">加入</button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

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
                    <input type="radio" id="AllCustomers" value="all" v-model="form.targetGroup.selectedGroup" name="TargetGroup" disabled>
                    <label for="AllCustomers" class="">所有顧客</label>
                  </div>
                  <div class="space-x-2">
                    <input type="radio" id="Members" value="members" v-model="form.targetGroup.selectedGroup" name="TargetGroup">
                    <label for="Members">會員</label>
                  </div>
                  <div class="space-x-2">
                    <input type="radio" id="DesignatedCustomer" value="tagged" v-model="form.targetGroup.selectedGroup" name="TargetGroup" disabled>
                    <label for="DesignatedCustomer">指定顧客標籤</label>
                  </div>
                </li>
                <!--  選擇所有顧客-->
                <!-- <li v-if="form.targetGroup.selectedGroup === 'all'" class="border-b border-gray-300 pb-4 space-y-3">
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
                </li> -->
                <!-- 選擇會員 -->
                <li v-if="form.targetGroup.selectedGroup === 'members'" class="border-b border-gray-300 pb-4 space-y-3">
                    <h4>目標會員群組</h4>
                    <div class="flex space-x-2">
                      <div class="space-x-2">
                        <input type="radio" id="AllMembmers" value="All" v-model="form.targetGroup.members.levelOption"  name="MemberGroup"class="">
                        <label for="AllMembmers" class="">所有會員</label>
                      </div>
                      <div class="space-x-2">
                        <input type="radio" id="DesignatedMembers" value="MemberLevel" v-model="form.targetGroup.members.levelOption" name="MemberGroup" disabled>
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
                <!-- <li v-if="form.targetGroup.selectedGroup === 'members'" class="space-y-3">
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
                      <div>
                        <div class="space-x-2">
                          <input type="radio" id="First" value="First" v-model="form.targetGroup.usageLimit" name="frequency">
                          <label for="First">限首次購買</label>
                        </div>
                        <p class="ml-6 text-sm text-gray-600">限尚未成立過訂單的顧客使用</p>
                      </div>
                    </div>
                </li>  -->
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
                  <!-- <li v-if="form.targetGroup.selectedGroup === 'tagged'" class="border-b border-gray-300 pb-4 space-y-3">
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
                  </li> -->
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
                    <input type="radio" id="automatic" value="automatic" v-model="form.promotion.selectedMethod" name="promotion" disabled>
                    <label for="automatic">自動套用優惠</label>
                  </div>
                  <div class="space-x-2" >
                    <input type="radio" id="UseCoupons" value="UseCoupons" v-model="form.promotion.selectedMethod" name="promotion">
                    <label for="UseCoupons">使用優惠卷</label>
                  </div>
                  <div class="space-x-2">
                    <input type="radio" id="RecommendedActivities" value="RecommendedActivities" v-model="form.promotion.selectedMethod" name="promotion" disabled>
                    <label for="RecommendedActivities">僅適用於推薦活動</label>
                  </div>
                </li>
                <!-- 選擇自動套用優惠 -->
                <li v-if="form.promotion.selectedMethod === 'automatic'" class="space-y-3">
                  <h4>優惠卷使用上限</h4>
                  <p>優惠卷可使用次數</p>
                  <div class="flex w-40">
                    <input 
                      type="text" 
                      id="usagelimit" 
                      value="usagelimit" 
                      v-model="form.promotion.automatic.usageLimit" 
                      :disabled="form.promotion.automatic.unlimited"
                      class="border border-gray-300 px-3 py-1 w-full rounded-l"
                    >
                    <label for="usagelimit" class="border border-l-0 border-gray-300 bg-gray-100 px-3 py-1 flex items-center text-gray-600 rounded-r">次</label>
                  </div>
                  <div class="space-x-2">
                    <input 
                      type="checkbox" 
                      id="unlimited" 
                      value="unlimited" 
                      v-model="form.promotion.automatic.unlimited"
                      :disabled="form.promotion.automatic.usageLimit !== ''"
                    >
                    <label for="unlimited">無限</label>
                  </div>
                </li>
                <li v-if="form.promotion.selectedMethod === 'automatic'" class="space-y-3">
                  <h4>促銷限制</h4>
                  <div class="flex flex-col md:flex-row md:space-x-6">
                    <div>
                      <p>促銷開始時間</p>
                      <input type="date" value="StartDate" v-model="form.promotion.automatic.promotionStartDate" class="w-40">
                    </div>
                    <div>
                      <p>促銷結束時間</p>
                      <input type="date" value="EndDate" v-model="form.promotion.automatic.promotionEndDate" class="w-40">
                      <div class="space-x-2">
                        <input type="checkbox" id="NeverExpires" value="NeverExpires" v-model="form.promotion.automatic.neverExpiresPromotion">
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
                      <input type="radio" id="InCenter" value="InCenter" v-model="form.promotion.useCoupons.selectedReceiveMethod" name="GetCoupons">
                      <label for="InCenter">顯示在領卷中心</label>
                    </div>  
                    <p class="ml-6 text-sm text-gray-600">顧客可直接在網店前台的領卷中心領取，此優惠卷限領取和使用一次</p>
                  </div>
                  <div>
                    <div class="space-x-2">
                      <!-- disabled -->
                      <input type="radio" id="EnterCouponCode" value="EnterCouponCode" v-model="form.promotion.useCoupons.selectedReceiveMethod" name="GetCoupons" disabled>
                      <label for="EnterCouponCode">輸入優惠卷代碼領取</label>
                    </div>
                    <p class="ml-6 text-sm text-gray-600">顧客可在網店前台的領卷中心和會員中心輸入代碼後領取，亦支援顧客在結帳時直接輸入代碼套用</p>
                  </div>
                  <div >
                    <div class="space-x-2">
                      <input type="radio" id="GetCoupons" value="GetCoupons" v-model="form.promotion.useCoupons.selectedReceiveMethod" name="GetCoupons" disabled>
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
                    <input 
                      type="text" 
                      v-model="form.promotion.recommended.usageLimit" 
                      :disabled="form.promotion.recommended.unlimited"
                      class="border border-gray-300 px-3 py-1 w-full rounded-l"
                    >
                    <label class="border border-l-0 border-gray-300 bg-gray-100 px-3 py-1 flex items-center text-gray-600 rounded-r">次</label>
                  </div>
                  <div class="space-x-2">
                    <input 
                      type="checkbox" 
                      id="unlimited" 
                      v-model="form.promotion.recommended.unlimited"
                      :disabled="form.promotion.recommended.usageLimit !== ''"
                    >
                    <label for="unlimited">無限</label>
                  </div>  
                </li>
                <!-- 選擇顯示在領卷中心 -->
                <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'InCenter' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                  <div class="space-y-2">
                    <label class="block">領取限制：</label>
                  </div> 

                  <!-- <h4>優惠卷使用上限</h4> -->
                  <p>優惠可領取次數</p>
                  <div class="flex w-40">
                    <input 
                      type="text" 
                      v-model="form.promotion.useCoupons.inCenter.usageLimit" 
                      class="border border-gray-300 px-3 py-1 w-full rounded-l"
                      :disabled="form.promotion.useCoupons.inCenter.unlimited"
                      @input="onUsageLimitInput(form.promotion.useCoupons.inCenter)"
                      >
                    <label class="border border-l-0 border-gray-300 bg-gray-100 px-3 py-1 flex items-center text-gray-600 rounded-r">次</label>
                  </div>
                  <div class="space-x-2">
                    <input 
                      type="checkbox" 
                      id="unlimited" 
                      v-model="form.promotion.useCoupons.inCenter.unlimited"
                      @change="onUnlimitedChecked(form.promotion.useCoupons.inCenter)"
                      >
                    <label for="unlimited">無限</label>
                  </div>
                  <!-- new -->
                  <div class="md:w-1/2 space-y-2">
                    <label class="block">輸入代碼</label>
                    <input type="text" v-model="form.promotion.useCoupons.inCenter.code" class="w-40 border border-gray-300 px-3 py-1 rounded" placeholder="例如:Happy慶新年888">
                  </div> 
                </li>
                <!-- <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'InCenter' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
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
                </li> -->
                <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'InCenter' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
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
                <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
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
      
                      <!-- <div class="space-x-2">
                        <input type="checkbox" v-model="form.promotion.useCoupons.enterCouponCode.universal.showInMemberCenter">
                        <label>於網店會員中心顯示優惠卷</label>
                      </div> -->
                    </div>

                    <div class="md:w-1/2 space-y-2">
                      <label class="block">優惠可使用次數</label>
                      <div class="flex">
                        <input 
                          type="number" 
                          v-model.number="form.promotion.useCoupons.enterCouponCode.universal.usageLimit"
                          :disabled="form.promotion.useCoupons.enterCouponCode.universal.unlimited" 
                          class="border border-gray-300 px-3 py-1 w-40 rounded-l">
                        <span class="border border-gray-300 border-l-0 bg-gray-100 px-3 py-1 flex items-center rounded-r text-gray-600">次</span>
                      </div>

                      <div class="space-x-2">
                        <input 
                          type="checkbox" 
                          v-model="form.promotion.useCoupons.enterCouponCode.universal.unlimited"
                          :disabled="form.promotion.useCoupons.enterCouponCode.universal.usageLimit !==''"
                        >
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
                <!-- <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons' && form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Universal'" class="space-y-3">  
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
                </li> -->
                <!-- 領卷中心（針對多組獨立代碼） -->
                <!-- <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons' && form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Independent'" class="space-y-3">  
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
                </li> -->
                <!-- 促銷限制（單組通用代碼） -->
                <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons' && form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Universal'" class="space-y-3">
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
                <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'EnterCouponCode' && form.promotion.selectedMethod === 'UseCoupons' && form.promotion.useCoupons.enterCouponCode.selectedCodeType === 'Independent'" class="space-y-3">
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
                <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'GetCoupons' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
                    <h4>優惠卷使用上限</h4>
                    <p>優惠卷可使用次數</p>
                    <div class="flex w-40">
                      <input 
                        type="text" 
                        v-model="form.promotion.useCoupons.getCoupons.usageLimit" 
                        :disabled="form.promotion.useCoupons.getCoupons.unlimited"
                        class="border border-gray-300 px-3 py-1 w-full rounded-l"
                      >
                      <label class="border border-l-0 border-gray-300 bg-gray-100 px-3 py-1 flex items-center text-gray-600 rounded-r">次</label>
                    </div>
                    <div class="space-x-2">
                      <input 
                        type="checkbox" 
                        id="unlimited" 
                        v-model="form.promotion.useCoupons.getCoupons.unlimited"
                        :disabled="form.promotion.useCoupons.getCoupons.usageLimit !== ''"
                      >
                      <label for="unlimited">無限</label>
                    </div>

                    <h4>優惠卷連結</h4>
                    <p class="text-sm text-gray-600">尚未建立領取連結，於活動建立成功後產生</p>
                </li>
                <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'GetCoupons' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
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
                <li v-if="form.promotion.useCoupons.selectedReceiveMethod === 'GetCoupons' && form.promotion.selectedMethod === 'UseCoupons'" class="space-y-3">
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
             <!--  -->
             <button
              @click="submitForm(form)"
              class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
            {{ isEditing ? '送出編輯' : '送出新增' }}
            </button>
          </div>
        <!-- </form> -->
    </div>
  </div>  
</teleport>  
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