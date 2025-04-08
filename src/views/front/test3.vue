
<script>
import axios from 'axios'
export default{
    data() {
        return {
          storeName: '',
          storeAddress: ''
        };
    },
    methods: {
        openMap() {
          const MerchantID = '2000132'; // 測試用 MerchantID
          const ServerReplyURL = encodeURIComponent('http://localhost:5174/test3'); // 用一個有效網址作為範例
          const URL = `https://logistics-stage.ecpay.com.tw/Express/map?MerchantID=${MerchantID}&LogisticsType=CVS&LogisticsSubType=UNIMART&IsCollection=Y&ServerReplyURL=${ServerReplyURL}`;
          
          console.log("你點到 openMap 了！");  // 確認是否觸發
          console.log("開啟地圖網址:", URL);
          window.open(URL, 'mapWindow', 'width=500,height=600'); // 開啟地圖視窗
        },
        // receiveStoreData(event) {
        //   console.log('收到門市資料:', event.data); // 收到資料後印出來
        //   if (event.data?.CVSStoreID) {
        //     this.storeName = event.data.CVSStoreName;
        //     this.storeAddress = event.data.CVSAddress;
        //   }
        // }
        receiveStoreData(event) {
  console.log('收到門市資料:', event.data); // 輸出 event.data 看看資料是否正確

  // 確認 event.data 是否有 CVSStoreID 且資料結構符合預期
  if (event.data && event.data.CVSStoreID) {
    console.log('正確收到門市資料', event.data);
    this.storeName = event.data.CVSStoreName || '無名稱';
    this.storeAddress = event.data.CVSAddress || '無地址';
  } else {
    console.log('收到的資料無效或缺少 CVSStoreID');
  }
}

    },
    mounted() {
        window.addEventListener('message', this.receiveStoreData);  // 註冊 postMessage 接收資料
      },
      beforeDestroy() {
        window.removeEventListener('message', this.receiveStoreData);  // 移除事件監聽
      }
}
</script>
<template>
    <div>
      <span>取貨門市</span>
      <span>{{ storeName || '尚未選擇門市' }}</span>
      <span>取貨地點</span>
      <span>{{ storeAddress || '尚未選擇地點' }}</span>
      <button @click="openMap">選擇門市</button>
    </div>
</template>