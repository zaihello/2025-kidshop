  
<script>
import axios from 'axios'
import { useAuthStore } from '../../stores/authStore'

  export default {
    data() {
      return {
        // summary:{
        //     usablePoints: 45,
        //     pendingPoints: 20,
        //     yearlyPoints: 65,
        // },
        // records: [],
        pointsDate:null,
        
      };
    },
    computed:{
      authStore(){
        return useAuthStore()
      },
      // 可使用點數
      usablePoints() {
        return this.pointsDate?.summary.usablePoints || 0;
      },
      //待生效點數
      pendingPoints() {
        return this.pointsDate?.summary.pendingPoints || 0;
      },
      //年度累計
      yearlyPoints() {
        return this.pointsDate?.summary.yearlyPoints || 0;
      },
      // 點數紀錄表格
      records() {
        return this.pointsDate?.records || [];
      },
    },
    methods:{
      async getPoints(){
        const authStore = useAuthStore()
        const userId = authStore.id
        try{
          const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/points?user_id=${userId}`)
          this.pointsDate = response.data[0]
        }catch(error){
          console.log("取得點數資料失敗", error);
        }
      },

    },
    mounted(){
      this.getPoints()
    }
  };
</script>
<template>
    <div class="max-w-4xl mx-auto  px-4">
      <h1 class="text-2xl font-bold mb-6">紅利點數(script尚未開發)</h1>
  
      <!-- 點數統計 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-yellow-100 text-yellow-800 p-6 rounded-lg shadow">
          <p class="text-sm">可使用點數</p>
          <p class="text-2xl font-bold">{{ usablePoints }} 點</p>
        </div>
        <div class="bg-blue-100 text-blue-800 p-6 rounded-lg shadow">
          <p class="text-sm">待生效點數</p>
          <p class="text-2xl font-bold">{{ pendingPoints }} 點</p>
        </div>
        <div class="bg-green-100 text-green-800 p-6 rounded-lg shadow">
          <p class="text-sm">年度已累計</p>
          <p class="text-2xl font-bold">{{ yearlyPoints }} 點</p>
        </div>
      </div>
  
      <!-- 點數紀錄表格 -->
      <div class="mb-12">
        <h2 class="text-xl font-semibold mb-4">點數紀錄</h2>
        <table class="w-full text-left border border-gray-300">
          <thead class="bg-gray-100">
            <tr>
              <th class="p-3 border-b">日期</th>
              <th class="p-3 border-b">點數</th>
              <th class="p-3 border-b">啟用日</th>
              <th class="p-3 border-b">到期日</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in records" :key="index" class="border-b hover:bg-gray-50">
              <td class="p-3">{{ record.date }}</td>
              <td class="p-3">{{ record.points }}</td>
              <td class="p-3">{{ record.activateDate }}</td>
              <td class="p-3">{{ record.expireDate }}</td>
            </tr>
            <tr v-if="records.length === 0">
              <td colspan="4" class="p-3 text-center text-gray-400">目前沒有點數紀錄</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- 點數規則 -->
      <div class="bg-gray-100 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">紅利點數規則</h2>
        <ol class="list-decimal pl-5 space-y-2 text-sm text-gray-700">
          <li>消費滿 35 元可累計紅利 1 點，每 1 點折現 1 元。</li>
          <li>點數將於十天鑑賞期後，存入帳戶。如經退貨，則不列入累計。</li>
          <li>紅利點數經使用後，即不接受取消，如有退貨及個人因素包裹未取，紅利點數亦不歸還。</li>
          <li>每次折抵上限為當次消費總金額的 50%，亦不可折抵運費。</li>
        </ol>
      </div>
    </div>
</template>

  