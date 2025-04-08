<script>
import CartNavbar from '../../components/front/CartNavbar.vue'
import { useCartStore } from '../../stores/cartStore'
import { usePaymentStore } from '../../stores/paymentStore'

export default {
  // name: "CheckoutPage",
  components:{CartNavbar},
  data(){
    return{
      storeName: '',
      storeAddress: '',
    }
  },
  computed:{
    cartStore(){
      return useCartStore()
    },
    paymentStore(){
      return usePaymentStore()
    }
  },
  methods:{
    openMap() {
      const MerchantID = '2000132'; // 綠界測試用 MerchantID（固定）
      const ServerReplyURL = encodeURIComponent('https://www.google.com');//隨便填一個格式正確的網址
      const URL = `https://logistics-stage.ecpay.com.tw/Express/map?MerchantID=${MerchantID}&LogisticsType=CVS&LogisticsSubType=UNIMART&IsCollection=Y&ServerReplyURL=${ServerReplyURL}`;

      console.log('開啟地圖網址:', URL); // 測試網址是否正確

      window.open(URL, 'mapWindow', 'width=500,height=600');// 開啟地圖視窗
      console.log(URL);
    },
    receiveStoreData(event) {
      console.log('收到門市資料:', event.data); // ← 加這行來測試
      if (event.data?.CVSStoreID) {
        this.storeName = event.data.CVSStoreName;
      this.storeAddress = event.data.CVSAddress;
      }
    },
  },
  mounted(){
    window.addEventListener("message", this.receiveStoreData);
  },
  beforeDestroy() {
        window.removeEventListener('message', this.receiveStoreData);  // 移除事件監聽
      }
};
</script>

<template>
    <div class="container mx-auto p-6">
      <div>
        <CartNavbar/>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

        
        <!-- 訂單資訊(有勾選的商品) -->
        <div class="bg-gray-100 p-6 rounded-lg shadow-md w-full">
          <!-- 表頭 (僅 md 以上顯示) -->
          <div class="hidden md:flex font-medium text-gray-700 border-b pb-2 mb-4">
            <div class="flex-[2]">商品名稱</div>
            <div class="flex-[1]">顏色</div>
            <div class="flex-[1]">尺寸</div>
            <div class="flex-[1.5]">售價</div>
            <div class="flex-[1]">數量</div>
            <div class="flex-[1.5]">金額</div>
          </div>

          <!-- 商品資料列 -->
          <div
            v-for="item in cartStore.selectedtItems"
            :key="item.id"
            class="flex flex-col md:flex-row md:items-center gap-4 py-4 border-b"
          >
            <!-- 商品名稱 + 圖片 -->
            <div class="flex items-center gap-3 flex-[2]">
              <img
                :src="item.product.colors[0].imageurl"
                alt="商品圖片"
                class="w-16 h-16 object-cover rounded shrink-0"
              />
              <div>
                <div class="md:hidden text-sm text-gray-500">商品名稱</div>
                <span>{{ item.product.name }}</span>
              </div>
            </div>

            <!-- 顏色 -->
            <div class="flex-[1]">
              <div class="md:hidden text-sm text-gray-500">顏色</div>
              {{ item.product.colors[0].color }}
            </div>

            <!-- 尺寸 -->
            <div class="flex-[1]">
              <div class="md:hidden text-sm text-gray-500">尺寸</div>
              {{ item.product.variants[0].size }}
            </div>

            <!-- 售價 -->
            <div class="flex-[1.5]">
              <div class="md:hidden text-sm text-gray-500">售價</div>
              ${{ item.price }}
            </div>

            <!-- 數量 -->
            <div class="flex-[1]">
              <div class="md:hidden text-sm text-gray-500">數量</div>
              {{ item.quantity }}
            </div>

            <!-- 金額 -->
            <div class="flex-[1.5]">
              <div class="md:hidden text-sm text-gray-500">金額</div>
              ${{ item.subTotal }}
            </div>
          </div>

          <!-- 底部 金額 -->
          <div class="mt-6 space-y-3 text-sm text-gray-800">

            <!-- 商品總價 -->
            <div class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center">
                <span>
                  共 <span class="text-red-500 font-bold">{{ cartStore.selectedItemsCount }}</span> 件商品 商品總價
                </span>
                <span class="font-semibold tracking-wide">
                  ${{ cartStore.totalAmount.toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- 免運提示與運費 -->
            <div class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span
                    v-if="paymentStore.remainingForFreeShipping > 0"
                    class="text-red-600 border border-red-500 px-2 py-0.5 rounded text-xs font-medium"
                  >
                    再購買 {{ paymentStore.remainingForFreeShipping }} 元即可享免運！
                  </span>
                  <span
                    v-else
                    class="text-red-600 border border-red-500 px-2 py-0.5 rounded text-xs font-medium"
                  >
                    滿 {{ paymentStore.selectedMethod.freeShippingThreshold }} 免運！
                  </span>
                  <span>運費</span>
                </div>
                <span class="font-semibold tracking-wide">
                  ${{ paymentStore.shippingFee.toLocaleString() }}
                </span>
              </div>
            </div>

            <!-- 分隔虛線 (短版) -->
            <div class="flex justify-end">
              <hr class="border-dashed border-gray-300 border-t w-[380px]" />
            </div>

            <!-- 總付款金額 -->
            <div class="flex justify-end">
              <div class="w-full max-w-sm flex justify-between items-center font-bold text-lg">
                <span>總付款金額</span>
                <span class="text-red-600">${{ cartStore.finalTotal.toLocaleString() }}</span>
              </div>
            </div>
          </div>

        </div>

        <!-- 帳單資訊 -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <!-- 訂購人資料 -->
          <div>
          <h2 class="text-2xl font-semibold mb-4">訂購人資料</h2>
  
          <form class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="first-name" class="block text-sm font-medium">姓名 *</label>
                <input type="text" id="first-name" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>  
            </div>
            <!-- 7-11 全家 -->
            <!-- <div>
              <label for="">取貨門市</label>
              <input type="text" id="address">
              <label for="">取貨地點</label>
              <input type="text" name="" id="">
              <button>選擇門市</button>
            </div> -->
            <div>
              <span>取貨門市</span>
              <span>{{ storeName || '尚未選擇門市' }}</span>
              <span>取貨地點</span>
              <span>{{ storeAddress || '尚未選擇地點' }}</span>
              <button @click="openMap">選擇門市</button>
            </div>
             <!-- 貨到付款 信用卡線上付款 -->
             <div class="flex flex-wrap">
                <label for="">地址</label>
                <div>
                  <select name="" id="">
                    <option value="">台北市</option>
                  </select>
                  <select name="" id="">
                    <option value="">大安區</option>
                  </select>
                  <input type="text">
                </div>
              </div> 
            <div>
              <label for="email" class="block text-sm font-medium">電子郵件 *</label>
              <input type="email" id="email" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label for="phone" class="block text-sm font-medium">電話 *</label>
              <input type="text" id="phone" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div>
              <label for="order-notes" class="block text-sm font-medium">備註</label>
              <textarea id="order-notes" rows="4" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
            </div>
          </form>
          </div>
          <!-- 收件件人資料 貨到付款 信用卡線上付款 LINE Pay(可用 LINE Points 折抵)-->

          <div>
            <div class="flex flex-wrap">
              <h2 class="text-2xl font-semibold mb-4">收件人資料</h2>
              <div>
                <input type="checkbox">
                <label for="">同訂購人請打勾</label>
              </div>
            </div>
            <form class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="first-name" class="block text-sm font-medium">姓名 *</label>
                  <input type="text" id="first-name" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>  
              </div>
              <!-- 7-11 全家 -->
              <div>
                <label for="">取貨門市</label>
                <input type="text" id="address">
                <button>選擇門市</button>
              </div>
              <!-- 貨到付款 信用卡線上付款 LINE Pay(可用 LINE Points 折抵)-->

              <div class="flex flex-wrap">
                <label for="">地址</label>
                <div>
                  <select name="" id="">
                    <option value="">台北市</option>
                  </select>
                  <select name="" id="">
                    <option value="">大安區</option>
                  </select>
                  <input type="text">
                </div>
              </div> 
              <div>
                <label for="email" class="block text-sm font-medium">電子郵件 *</label>
                <input type="email" id="email" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label for="phone" class="block text-sm font-medium">電話 *</label>
                <input type="text" id="phone" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label for="order-notes" class="block text-sm font-medium">備註</label>
                <textarea id="order-notes" rows="4" class="mt-1 w-full border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
              </div>
            </form>

          </div>
          <div>
            <h2>發票資訊</h2>
            <div>
              <button>個人-電子發票</button>
              <button>個人-手機條碼</button>
              <button>公司-統一編號</button>
              <button>捐贈發票</button>
            </div>
            <div>
              <div>依財政部規定，發票已託管，無需開立紙本發票。</div>
              <div>
                <input type="text" placeholder="輸入手機載具">
              </div>
              <div>
                <input type="text" placeholder="輸入統一編號">
              </div>
              <div>
                捐贈單位：財團法人「創世社會福利基金會」
              </div>
            </div>
            
          </div>
        </div>

      </div>
      <div class="flex w-full">
        <button>繼續購物</button>
        <button>支付${{ cartStore.finalTotal.toLocaleString() }}</button>
      </div>
    </div>
</template>
  
