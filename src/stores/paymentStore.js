//付款方式 只有信用卡、到貨付款  ok 
import { defineStore } from 'pinia'
import { useCartStore } from './cartStore'
import { useAuthStore } from './authStore'
import { useCouponStore } from './couponStore'
import axios from 'axios'
import { nextTick } from 'vue'
import { markUserCouponAsUsed } from '../utils/couponUtils'
import axiosInstance from '../services/axiosInstance'

export const usePaymentStore =defineStore("payment",{
    state:() =>({
        selectedPayment: "credit", // // 使用者選擇的付款方式 預設選中 信用卡
        //付款方式
        paymentMethods: [
            {
              value: "7-11",
              name: "7-11 - 取貨付款",
              description: "7-11：消費滿 1000 免運費，未滿酌收 50 元物流費。",
              logo: "7-11.png",
            
            },
            {
              value: "familymart",
              name: "全家 - 取貨付款",
              description: "全家：消費滿 1000 免運費，未滿酌收 50 元物流費。",
              logo: "familymart.png",
             
            },
            {
              value: "cod",
              name: "貨到付款",
              description: "宅配：消費滿 1000 免運費，未滿酌收 60 元物流費。",
              logo: "",
             
            },
            {
              value: "credit",
              name: "信用卡線上付款",
              description: "宅配：消費滿 1000 免運費，未滿酌收 60 元物流費。",
              logo: "",
             
            },
            {
              value: "linepay",
              name: "LINE Pay",
              description: "(可用 LINE Points 折抵) 宅配：消費滿 1000 免運費，未滿酌收 60 元物流費。",
              logo: "",
             
            }
        ],
        //填寫表單資料
        orderInfo: {
          // 訂購人資料
          user_info: {
            name: '',
            email: '',
            tel: '',
            county:'',//縣市
            district:'',//區
            zipcode:'',//郵遞區號
            address: '',
          },
          //收件人資料
          shipping_info: {
            name: '',
            email: '',
            tel: '',
            county:'',//縣市
            district:'',//區
            address: '',//全部地址
            zipcode:'',//郵遞區號
            comment: ''
          },
          //付款方式
          payment_info: {
            method: '', // 根據選擇的付款方式 '貨到付款'、'信用卡線上付款'、'LINE Pay'信用卡線上付款
            transaction_id: '', // 付款成功後編號 TXN-1746272139893
            paid_at: null// 付款時間
          },
          //送貨資訊
          delivery_info: {
            method: "", // 或 "7-11 取貨"
            store: null, // 超商門市資訊（如果是超商才用到）
          },
          //發票資訊
          invoice_info: {
            type: "",   // "電子發票" | "手機條碼" | "統一編號" | "捐贈發票"
            phoneCarrier: "",  // 輸入手機載具條碼，例如：/ABC1234
            taxId:"",             // 輸入統一編號
            donationCode: "", // 儲存捐贈碼5620
            donationName: ""  //儲存捐贈單位名稱財團法人「創世社會福利基金會」
          },
          final_price: 0
        },
        sameAsUserInfo: false, //同訂購人請打勾 勾選狀態，預設為 false
        //預設資料
        addressData: {
          台北市: {
            中正區: '100',
            大安區: '106',
            信義區: '110',
          },
          新北市: {
            板橋區: '220',
            新店區: '231',
            中和區: '235',
          },
          高雄市: {
            三民區: '807',
            苓雅區: '802',
            左營區: '813',
          },
        },
        selectedDiscountCouponId: null, // 折價券
        selectedFreeShippingCouponId: null, // 免運券

    }),
    getters:{
        //選擇付款方式 (selectedMethod 是通過 getter 計算出來的，它依賴 selectedPayment，所以你只需要更新 selectedPayment，不需要手動設置 selectedMethod。)
        selectedMethod(state) {
            return state.paymentMethods.find(m => m.value === state.selectedPayment) || null;
        },
        // 原始運費（你可根據邏輯設為固定值 60）
        originalShippingFee(){
          const cartStore = useCartStore()
          const totalAmount = cartStore.totalAmount
          if(totalAmount === 0) return 0
          return 60
        },
        // 折抵多少（根據免運券）
        shippingDiscountAmount(){
          const cartStore = useCartStore()
          const couponStore = useCouponStore()
          const totalAmount = cartStore.totalAmount

          const coupon = couponStore.appliedFreeeShippingCoupon
          if(coupon && totalAmount >= coupon.threshold){
            return Math.min(60, coupon.discount || 0) // 折最多 60 元   
          }
          return 0
        },
        // 最終運費
        finalShippingFee(){
          return Math.max(
            this.originalShippingFee - this.shippingDiscountAmount,0
          )
        },
        
        //還差多少免運  考慮總金額免運問題、選擇支付的方式
        // remainingForFreeShipping() {
        //     const cartStore = useCartStore();
        //     const totalAmount = cartStore.totalAmount;
        //     return totalAmount >= this.selectedMethod.freeShippingThreshold ? 0 : this.selectedMethod.freeShippingThreshold - totalAmount;
        // },
        //訂購人 全部的地址資訊
        getUserFullAddress() {
          const user = this.orderInfo.user_info;
          return `${user.zipcode} ${user.county} ${user.district} ${user.address}`;
        },
        //收件人 全部的地址資訊
        getShippingFullAddress() {
          const shipping = this.orderInfo.shipping_info;
          return `${shipping.zipcode} ${shipping.county} ${shipping.district} ${shipping.address}`;
        },
   
    },
    actions:{
      //
        async getOrder(){
          const authStore = useAuthStore();
          const userId = authStore.id;
          const token = authStore.token;

          try{
            const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/orders?userId=${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
          });
            const userOrder = response.data
          }catch(err){
            console.error('取得訂單失敗', err);
          }
        },
        //選擇支付的方式
        setSelectedPayment(payment) {
            this.selectedPayment = payment;
        },
        
        // 將購物車轉換為訂單 
        convertCartToOrder() {
          const authStore = useAuthStore();
          const cartStore = useCartStore();
         
          const selectedItems = cartStore.cartItems.items.filter(item => item.selected);
          const orderItems = selectedItems.map(item => {
          const variant = item.product.variants.find(v => v.id === item.variant_Id);
            return {
              product_id: item.product.id,
              variant_id: item.variant_Id,
              name: item.product.name,
              size: variant?.size || '',
              color: variant?.color || '',
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subTotal,
              image: item.product.colors[0]?.imageurl || ''
            };
          });
        
          
          //格式化日期 2025-04-01
          const now = new Date();
          const createdAt = this.formatDate(now);

          return {
            created_at: createdAt,
            userId: authStore.id,
            status: "processing",//處理中
            // payment_status: "未付款",
            total:cartStore.cartItems.total,
            couponCode:cartStore.cartItems.couponCode,
            freight:this.originalShippingFee,
            freeShipping:cartStore.cartItems.freeShipping,
            final_price: cartStore.cartItems.final_total,

            user_info: {
              name: this.orderInfo.user_info.name,
              email: this.orderInfo.user_info.email,
              tel: this.orderInfo.user_info.tel,
              address: this.getUserFullAddress,
            },
            shipping_info: {
              name: this.orderInfo.shipping_info.name,
              email: this.orderInfo.shipping_info.email,
              tel: this.orderInfo.shipping_info.tel,
              address: this.getShippingFullAddress, 
              comment: this.orderInfo.shipping_info.comment
            },
            payment_info: {
              method: this.selectedMethod.name || "未知",
              transaction_id: null,
              paid_at: null,
              status: "unpaid",//未付款

            },
            delivery_info: {
              method: this.getDeliveryMethodFromPayment(this.selectedMethod.value), //例如：'黑貓宅配 - 常溫' 或 '7-11 取貨'
              store: this.orderInfo.delivery_info.store || null// 如果有超商門市
            },
            invoice_info: {
              type: this.orderInfo.invoice_info.type,
              phoneCarrier: this.orderInfo.invoice_info.phoneCarrier,
              taxId: this.orderInfo.invoice_info.taxId,
              donationCode: this.orderInfo.invoice_info.donationCode,
              donationName: this.orderInfo.invoice_info.donationName,
            },
            items: orderItems
          };
        },
         //格式化日期 2025-04-01
         formatDate(dateStr) {
          const date = new Date(dateStr)
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0') // 補零
          const day = String(date.getDate()).padStart(2, '0') // 補零
          return `${year}-${month}-${day}`
        },
        //支付$按鈕
        async submitOrder(router) {
          console.log('🧾 selectedCouponId:', this.selectedCouponId)

          const authStore = useAuthStore()
          const token = authStore.token;
          const userId = authStore.id;
          const cartStore = useCartStore();

          await cartStore.getCartData();// 🛒 先載入購物車資料

          // console.log('✅ 載入後的 cartData:', cartStore.cartData);

          const userCart = cartStore.cartItems;
          // console.log("✅ 準備找購物車", userCart);
          // console.log("🧾 userId 是", userId);

          // console.log('🛒 找到的購物車是',userCart)

          const orderData = this.convertCartToOrder();//將購物車變成order訂單

          try {
            const { data } = await axios.post("https://204ed3432b06d7af.mokky.dev/orders", orderData, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            // console.log("✅ 訂單成功建立", data);
            // ✅ 標記優惠券為已使用
           
            // 折價券
            if(this.selectedDiscountCouponId){
              await markUserCouponAsUsed({
                userId,
                couponId:this.selectedDiscountCouponId,
                type:'discount',
                axiosInstance
              })
            }

            //免運卷
            if(this.selectedFreeShippingCouponId){
              await markUserCouponAsUsed({
                userId,
                couponId:this.selectedFreeShippingCouponId,
                type:'freeShipping',
                axiosInstance
              })
            }

            await cartStore.clearSelectedItems();//刪除在/cartsdata結帳的商品
            this.orderInfo = this.getDefaultOrderInfo(); // ✅ 清空表單資料

          
          // 根據付款方式跳轉對應頁面
          if (this.selectedPayment === "linepay") {
            router.push(`/cart/paylist/line/${data.id}`);
          } else if (this.selectedPayment === "credit") {
            router.push(`/cart/paylist/credit/${data.id}`);
          } else {
            router.push("/cart/orderdone");
          }
    
          return true;  
        
          } catch (err) {
            console.error("❌ 建立訂單失敗", err);
            alert("訂單建立失敗，請稍後再試");
          }
        },
      
        //複製訂購人資料
        async copyUserInfo() {
          
          const shippingInfo = this.orderInfo.shipping_info;
          const userInfo = this.orderInfo.user_info;
          if (this.sameAsUserInfo) {
           
            console.log(this.sameAsUserInfo)
            // 複製基本資料
            shippingInfo.name = userInfo.name;
            shippingInfo.email = userInfo.email;
            shippingInfo.tel = userInfo.tel;
            shippingInfo.address = userInfo.address;

            // 複製地址資料(以下寫法因PayList.vue的watch當縣市改變，要清空鄉鎮與郵遞區號)
            // 地址處理：先設定 county
            shippingInfo.county = userInfo.county
            // 等待 county 更新完成 → 避免 district 被清掉
            await nextTick()
            // 再設定 district
            shippingInfo.district = userInfo.district
            // 再等一次 district 更新完成 → 確保 zipcode 能正確抓值
            await nextTick()
            // 最後設定 zipcode
            const zip = this.addressData[userInfo.county]?.[userInfo.district] || ''
            shippingInfo.zipcode = zip
           
          } 
          else {
            // 切換為不用複製訂購人資料(清空收件人資料)
            shippingInfo.name = '';
            shippingInfo.email = '';
            shippingInfo.tel = '';
            shippingInfo.address = '';
            shippingInfo.county = '';
            shippingInfo.district = '';
            shippingInfo.zipcode = '';
            shippingInfo.comment = '';
          }
          console.log('✅ copyUserInfo 被呼叫了！')
        },
      
        //選擇發票button
        selectInvoiceType(type) {
          this.orderInfo.invoice_info.type = type;
        
          // 清空先前資料 (只會有一筆資料)
          this.orderInfo.invoice_info.phoneCarrier = '';
          this.orderInfo.invoice_info.taxId = '';
          this.orderInfo.invoice_info.donationCode = '';
          this.orderInfo.invoice_info.donationName = '';
      
          // 自動填入捐贈碼與單位名稱
          if (type === '捐贈發票') {
            this.orderInfo.invoice_info.donationCode = '5620';
            this.orderInfo.invoice_info.donationName = '財團法人「創世社會福利基金會」';
          }
        },
        //付款方式取得對應的送貨方式
        getDeliveryMethodFromPayment(paymentValue) {
          if (["7-11", "familymart"].includes(paymentValue)) {
            return "超商取貨";
          } else {
            return "黑貓宅配 - 常溫";
          }
        },
        //orderInfo表單初始狀態(無任何資料，清空資料用)
        getDefaultOrderInfo() {
          return {
            user_info: {
              name: '',
              email: '',
              tel: '',
              county: '',
              district: '',
              zipcode: '',
              address: '',
            },
            shipping_info: {
              name: '',
              email: '',
              tel: '',
              county: '',
              district: '',
              address: '',
              zipcode: '',
              comment: ''
            },
            payment_info: {
              method: '',
              transaction_id: '',
              paid_at: null
            },
            delivery_info: {
              method: "",
              store: null
            },
            invoice_info: {
              type: "",
              phoneCarrier: "",
              taxId: "",
              donationCode: "",
              donationName: ""
            },
            final_price: 0
          };
        }, 
    },
}) 