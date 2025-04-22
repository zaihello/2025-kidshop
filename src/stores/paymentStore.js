// 信用卡、到貨付款  OK
import { defineStore } from 'pinia'
import { useCartStore } from '../stores/cartStore'
import { useAuthStore } from './authStore'
import axios from 'axios'
import { nextTick } from 'vue'

// import router from 'router' 


export const usePaymentStore =defineStore("payment",{
    state:() =>({
        selectedPayment: "credit", // // 使用者選擇的付款方式 預設選中 LINE Pay
        freeShippingThreshold: 1000, // 🚛 免運門檻
        paymentMethods: [
            {
              value: "7-11",
              name: "7-11 - 取貨付款",
              description: "7-11：消費滿 1000 免運費，未滿酌收 50 元物流費。",
              logo: "https://upload.wikimedia.org/wikipedia/commons/9/94/7-eleven_logo.svg",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 50 // 📦 未達免運的運費
            },
            {
              value: "familymart",
              name: "全家 - 取貨付款",
              description: "全家：消費滿 1000 免運費，未滿酌收 50 元物流費。",
              logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Famiport.svg/1280px-Famiport.svg.png",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 50 // 📦 未達免運的運費
            },
            {
              value: "cod",
              name: "貨到付款",
              description: "宅配：消費滿 1000 免運費，未滿酌收 60 元物流費。",
              logo: "",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 60 // 📦 未達免運的運費
            },
            {
              value: "credit",
              name: "信用卡線上付款",
              description: "宅配：消費滿 1000 免運費，未滿酌收 60 元物流費。",
              logo: "",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 60 // 📦 未達免運的運費
            },
            {
              value: "linepay",
              name: "LINE Pay",
              description: "(可用 LINE Points 折抵) 宅配：消費滿 1000 免運費，未滿酌收 60 元物流費。",
              logo: "https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_Pay_logo.png",
              freeShippingThreshold: 1000, // 🚛 免運門檻
              shippingFee: 60 // 📦 未達免運的運費
            }
        ],
        //填寫資料
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
            method: '信用卡線上付款', // 根據選擇的付款方式 '貨到付款'、'信用卡線上付款'、'LINE Pay'
            transaction_id: '123456789', // 這裡可以在付款成功後獲取 如果是第三方付款才會有
            // paid_at: new Date().toISOString(), // 如果當下就付款成功可填入 付款時間
            paid_at: null
          },
          //送貨資訊
          delivery_info: {
            method: "", // 或 "7-11 取貨"
            store: null, // 超商門市資訊（如果是超商才用到）
          },
          //發票資訊
          invoice_info: {
            type: "電子發票",   // "電子發票" | "手機條碼" | "統一編號" | "捐贈發票"
            phoneCarrier: "",  // 輸入手機載具條碼，例如：/ABC1234
            taxId:"",             // 輸入統一編號
            donationCode: "", // 儲存捐贈碼5620
            donationName: ""  //儲存捐贈單位名稱財團法人「創世社會福利基金會」
          },
          final_price: 0
        },
        invoiceErrors: {}, // 用來記錄發票錯誤訊息
        hasAttemptedSubmit: false,//已嘗試送出訂單 驗證發票的手機格式
        sameAsUserInfo: false, //同訂購人請打勾 勾選狀態，預設為 false
        citySelectorError:'',//請完整選擇縣市、區域與郵遞區號
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
    }),
    getters:{
        //選擇付款方式 (selectedMethod 是通過 getter 計算出來的，它依賴 selectedPayment，所以你只需要更新 selectedPayment，不需要手動設置 selectedMethod。)
        selectedMethod(state) {
            return state.paymentMethods.find(m => m.value === state.selectedPayment) || null;
        },
        //運費 考慮總金額免運問題、選擇支付的方式
        shippingFee() {
            const cartStore = useCartStore();
            const totalAmount = cartStore.totalAmount;// 只計算 selected: true 的商品總額
            // 當 totalAmount 為 0（即沒有勾選商品），運費為 0
            if (totalAmount === 0) {
                return 0;
            }
            return totalAmount >= this.selectedMethod.freeShippingThreshold ? 0 : this.selectedMethod.shippingFee;
        },
        //還差多少免運  考慮總金額免運問題、選擇支付的方式
        remainingForFreeShipping() {
            const cartStore = useCartStore();
            const totalAmount = cartStore.totalAmount;
            return totalAmount >= this.selectedMethod.freeShippingThreshold ? 0 : this.selectedMethod.freeShippingThreshold - totalAmount;
        },
        //訂購人 全部的地址資訊(放到submitOrder)
        getUserFullAddress() {
          const county = document.querySelector('.tw-city-selector-buyer .county')?.value || '';
          const district = document.querySelector('.tw-city-selector-buyer .district')?.value || '';
          const zipcode = document.querySelector('.tw-city-selector-buyer .zipcode')?.value || '';
          const street = this.orderInfo.user_info.address || '';
          return `${zipcode} ${county} ${district} ${street}`;
        },
        //收件人 全部的地址資訊(放到submitOrder)
        getShippingFullAddress() {
          const county = document.querySelector('.tw-city-selector-shipping .county')?.value || '';
          const district = document.querySelector('.tw-city-selector-shipping .district')?.value || '';
          const zipcode = document.querySelector('.tw-city-selector-shipping .zipcode')?.value || '';
          const street = this.orderInfo.shipping_info.address || '';
          return `${zipcode} ${county} ${district} ${street}`;
        },
   
    },
    actions:{
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
        //支付$按鈕
        // async submitOrder() {
        //   const authStore = useAuthStore()
        //   const token = authStore.token;

        //   const cartStore = useCartStore()

        //   const userId = authStore.id;
        //   // 檢查必填欄位
        //   if (!this.orderInfo.user_info.name || !this.orderInfo.user_info.email || !this.orderInfo.shipping_info.name || !this.orderInfo.shipping_info.address) {
        //     alert("請填寫所有必要欄位！");
        //     return;
        //   }

        //   if (!this.validateInvoiceInfo()) {
        //     alert("請修正發票資訊後再提交");
        //     return;
        //   }
        //   //訂單時間
        //   const now = new Date();
        //   const createdAt = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ` +
        //           `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

        //   // 構建訂單資料
        //   const orderData = {
        //     created_at: createdAt,
        //     userId: userId, // 這裡需要取得用戶的ID
        //     // cart_id: this.cartStore.cartId, // 當前購物車的ID
        //     // cartDataId: cartStore.cartItems.id, // 當前購物車的ID(沒影出現)

        //     status: "pending",//目前訂單狀態 ending / confirmed / shipped / delivered / cancelled
        //     payment_status: "unpaid",// 先設為未付款 或 'paid' 付款狀態(是/否) 
        //     // shipping_status: "not_shipped", //運輸狀態
        //     final_price: cartStore.finalTotal, // 最終價格（考慮折扣等）

        //     //訂購人資料
        //     user_info: {
        //       name: this.orderInfo.user_info.name,
        //       email: this.orderInfo.user_info.email,
        //       tel: this.orderInfo.user_info.tel,
        //       address: this.getUserFullAddress 
        //     },
        //     // 收件人資料
        //     shipping_info: {
        //       name:this.orderInfo.shipping_info.name,
        //       email:this.orderInfo.shipping_info.email,
        //       tel: this.orderInfo.shipping_info.tel,
        //       address:this.getShippingFullAddress,
        //       // method: this.orderInfo.shipping_info.method, // 配送方式
        //       comment: this.orderInfo.shipping_info.comment 
        //     },
        //     //付款方式
        //     payment_info: {
        //       method: this.selectedMethod.name, // 此為'linepay' / 'credit'
        //       transaction_id: null, // 付款會立即完成 貨到付款可以為null
        //       paid_at: null // 付款會立即完成 付款時間
        //     },
        //     //發票資訊
        //     invoice_info: {
        //       type: this.orderInfo.invoice_info.type,
        //       phoneCarrier: this.orderInfo.invoice_info.phoneCarrier,     // 若 type 是 "手機條碼"
        //       taxId: this.orderInfo.invoice_info.taxId,            // 若 type 是 "統一編號"
        //       donationCode: this.orderInfo.invoice_info.donationCode,      // 若 type 是 "捐贈發票"
        //       donationName: this.orderInfo.invoice_info.donationName,
        //     },
        //     items:[
        //       {
        //         variant_Id:0
        //       },
        //     ]
            
        //   };
        //   // 呼叫API創建訂單
        //   try {
        //     // this.isLoading = true;
        //     const { data } = await axios.post("https://204ed3432b06d7af.mokky.dev/orders", orderData, {
        //       headers: {
        //         // Authorization: `Bearer ${this.authStore.token}`,
        //         Authorization: `Bearer ${token}`,

        //       },
        //     });
        //     // this.isLoading = false;
        //     console.log("✅ 訂單成功建立", data);
            
        //     // 如果付款方式為線上支付才模擬付款
        //     if (["linepay", "credit"].includes(this.selectedMethod)) {
        //       await this.goToPayment(data.id);
        //     }
        //     // router.push("/cart/orderdone"); // ✅ 可以直接用

           
        //   } catch (err) {
        //     // this.isLoading = false;
        //     console.error("❌ 建立訂單失敗", err);
        //     alert("訂單建立失敗，請稍後再試");
        //   }
        // },
        // 將購物車轉換為訂單 
        // convertCartToOrder(cartsData, formData, userId) {
        //   const selectedItems = cartsData.items.filter(item => item.selected);
        //   const orderItems = selectedItems.map(item => {
        //     const variant = item.product.variants.find(v => v.id === item.variant_Id);
        //     return {
        //       product_id: item.product.id,
        //       variant_id: item.variant_Id,
        //       name: item.product.name,
        //       size: variant?.size || '',
        //       color: variant?.color || '',
        //       quantity: item.quantity,
        //       price: item.price,
        //       subtotal: item.subTotal,
        //       image: item.product.colors[0]?.imageurl || ''
        //     };
        //   });
        
        //   const now = new Date();
        //   const createdAt = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ` +
        //                     `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        
        //   return {
        //     created_at: createdAt,
        //     userId,
        //     status: "pending",
        //     payment_status: "unpaid",
        //     final_price: cartsData.final_total,
        
        //     user_info: {
        //       name: formData.user_info.name,
        //       email: formData.user_info.email,
        //       tel: formData.user_info.tel,
        //       address: formData.getUserFullAddress
        //     },
        //     shipping_info: {
        //       name: formData.shipping_info.name,
        //       email: formData.shipping_info.email,
        //       tel: formData.shipping_info.tel,
        //       address: formData.getShippingFullAddress,
        //       comment: formData.shipping_info.comment
        //     },
        //     payment_info: {
        //       method: formData.selectedMethod.name,
        //       transaction_id: null,
        //       paid_at: null
        //     },
        //     invoice_info: {
        //       type: formData.invoice_info.type,
        //       phoneCarrier: formData.invoice_info.phoneCarrier,
        //       taxId: formData.invoice_info.taxId,
        //       donationCode: formData.invoice_info.donationCode,
        //       donationName: formData.invoice_info.donationName,
        //     },
        //     items: orderItems
        //   };
        // },
        // convertCartToOrder(cartsData, userId) {
        //   const selectedItems = cartsData.items.filter(item => item.selected);
        //   const orderItems = selectedItems.map(item => {
        //     const variant = item.product.variants.find(v => v.id === item.variant_Id);
        //     return {
        //       product_id: item.product.id,
        //       variant_id: item.variant_Id,
        //       name: item.product.name,
        //       size: variant?.size || '',
        //       color: variant?.color || '',
        //       quantity: item.quantity,
        //       price: item.price,
        //       subtotal: item.subTotal,
        //       image: item.product.colors[0]?.imageurl || ''
        //     };
        //   });
        
        //   const now = new Date();
        //   const createdAt = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ` +
        //                     `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        
        //   return {
        //     created_at: createdAt,
        //     userId,
        //     status: "pending",
        //     payment_status: "unpaid",
        //     final_price: cartsData.final_total,
        
        //     user_info: {
        //       name: this.orderInfo.user_info.name,
        //       email: this.orderInfo.user_info.email,
        //       tel: this.orderInfo.user_info.tel,
        //       address: this.getUserFullAddress
        //     },
        //     shipping_info: {
        //       name: this.orderInfo.shipping_info.name,
        //       email: this.orderInfo.shipping_info.email,
        //       tel: this.orderInfo.shipping_info.tel,
        //       address: this.getShippingFullAddress,
        //       comment: this.orderInfo.shipping_info.comment
        //     },
        //     payment_info: {
        //       method: this.selectedMethod.name,
        //       transaction_id: null,
        //       paid_at: null
        //     },
        //     invoice_info: {
        //       type: this.orderInfo.invoice_info.type,
        //       phoneCarrier: this.orderInfo.invoice_info.phoneCarrier,
        //       taxId: this.orderInfo.invoice_info.taxId,
        //       donationCode: this.orderInfo.invoice_info.donationCode,
        //       donationName: this.orderInfo.invoice_info.donationName
        //     },
        //     items: orderItems
        //   };
        // },
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
            status: "處理中",
            // payment_status: "未付款",
            total:cartStore.totalAmount,
            shipping_fee:this.shippingFee,
            final_price: cartStore.finalTotal,
        
            user_info: {
              name: this.orderInfo.user_info.name,
              email: this.orderInfo.user_info.email,
              tel: this.orderInfo.user_info.tel,
              address: this.getUserFullAddress
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
              status: "未付款",

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

          const authStore = useAuthStore()
          const token = authStore.token;
          const userId = authStore.id;
          const cartStore = useCartStore();

          await cartStore.getCartData();// 🛒 先載入購物車資料

          // 補上後端完整地址格式（郵遞區號 + 縣市 + 區 + 原地址）
          const shipping = this.orderInfo.shipping_info
          const user = this.orderInfo.user_info
          shipping.address = `${shipping.zipcode} ${shipping.county} ${shipping.district} ${shipping.address}`
          user.address = `${user.zipcode} ${user.county} ${user.district} ${user.address}`

          // console.log('✅ 載入後的 cartData:', cartStore.cartData);
          
        
        
          this.hasAttemptedSubmit = true;//已嘗試送出訂單 true判斷驗證
         
        

          const userCart = cartStore.cartItems;
          console.log("✅ 準備找購物車", userCart);
          console.log("🧾 userId 是", userId);

            console.log('🛒 找到的購物車是',userCart)

          const orderData = this.convertCartToOrder();//將購物車變成order訂單

          try {
            const { data } = await axios.post("https://204ed3432b06d7af.mokky.dev/orders", orderData, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log("✅ 訂單成功建立", data);

            await cartStore.clearSelectedItems();//刪除在/cartsdata結帳的商品

           
            // 根據付款方式跳轉對應頁面
    
          if (this.selectedPayment === "linepay") {
            router.push(`/cart/paylist/line/${data.id}`);
          } else if (this.selectedPayment === "credit") {
            router.push(`/cart/paylist/credit/${data.id}`);
          } else {
            router.push("/cart/orderdone");
          }
    
          return true;  
        
            // if (["linepay", "credit"].includes(this.selectedMethod)) {
            //   await this.goToPayment(data.id);
            // }
        
          } catch (err) {
            console.error("❌ 建立訂單失敗", err);
            alert("訂單建立失敗，請稍後再試");
          }
        },
        
        
       
        
        
      
        //模擬付款中（LINE Pay / 信用卡）。如果付款方式為 linepay 或 credit 才會呼叫
        // async goToPayment(orderId) {
        //   const authStore = useAuthStore();
    
        //   console.log("🧾 模擬付款中（LINE Pay / 信用卡）...");
        //   const fakeTransactionId = "TXN_" + Date.now();
        //   const paidAt = new Date().toISOString();
    
        //   const patchData = {
        //     payment_status: "paid",
        //     payment_info: {
        //       method: this.selectedMethod,
        //       transaction_id: fakeTransactionId,
        //       paid_at: paidAt
        //     }
        //   };
    
        //   try {
        //     await axios.patch(`https://204ed3432b06d7af.mokky.dev/orders/${orderId}`, patchData, {
        //       headers: {
        //         Authorization: `Bearer ${authStore.token}`
        //       }
        //     });
    
        //     console.log("✅ 付款成功，訂單已更新為已付款");
    
        //   } catch (error) {
        //     console.error("❌ 更新付款狀態失敗：", error);
        //   }
        // },
        
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
           
          } else {
            // 清空收件人資料
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
       
        
        //
        // selectInvoiceType(type) {
        //   this.orderInfo.invoice_info.type = type;
        //   this.invoiceErrors = {}; // 清空錯誤訊息
        // }
        //選擇發票button
        selectInvoiceType(type) {
          this.orderInfo.invoice_info.type = type;
      
          // 清空先前資料
          this.orderInfo.invoice_info.phoneCarrier = '';
          this.orderInfo.invoice_info.taxId = '';
          this.orderInfo.invoice_info.donationCode = '';
          this.orderInfo.invoice_info.donationName = '';
          this.invoiceErrors = {}; // 清空錯誤訊息
      
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
    },
}) 