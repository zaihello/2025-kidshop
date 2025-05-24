import { defineStore } from 'pinia'
import axios from 'axios'

export const usePointStore = defineStore('pointStore',{
    state:()=>({

            usablePoints: 0,//可使用點數
            pendingPoints: 0,//待生效點數
            yearlyPoints: 0,//年度已累計
        
            records: []//點數紀錄
    }),
    actions:{
        // async getPointsByUserId(userId){
        //     try{
        //         const res = await axios.get(`https://204ed3432b06d7af.mokky.dev/points?user_id=${userId}`)
        //         const data = res.data[0]
        //         //
        //         if(data){
        //             this.summary = data.summary
        //             this.records = data.records
        //         }else{
        //             this.summary = {
        //                 usablePoints:0,
        //                 pendingPoints:0,
        //                 yearlyPoints:0
        //             } 
        //             this.records = []
        //         }

        //     }catch(error){
        //         console.log('取得點數資料失敗',error)
        //     }
        // },
        //
        async generatePendingPointsFromOrders(userId) {
            try {
              const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/orders?user=${userId}`);
              const orders = await response.data;
      
              const today = new Date();
      
              const pointsRecords = orders
                .filter(order => order.status === 'paid')
                .map(order => {
                  const point = Math.floor(order.final_price / 35);
                  const createdAt = new Date(order.createdAt);
                  const activateDate = new Date(createdAt);
                  activateDate.setDate(activateDate.getDate() + 10);
                  const expireDate = new Date(activateDate);
                  expireDate.setMonth(expireDate.getMonth() + 6);
      
                  return {
                    date: createdAt.toISOString().split('T')[0],
                    points: point,
                    activateDate: activateDate.toISOString().split('T')[0],
                    expireDate: expireDate.toISOString().split('T')[0],
                  };
                });
      
              this.records = pointsRecords;
      
              const now = today.toISOString().split('T')[0];
              this.usablePoints = pointsRecords
                .filter(p => p.activateDate <= now && p.expireDate >= now)
                .reduce((sum, p) => sum + p.points, 0);
      
              this.pendingPoints = pointsRecords
                .filter(p => p.activateDate > now)
                .reduce((sum, p) => sum + p.points, 0);
      
              this.yearlyPoints = pointsRecords
                .filter(p => p.date.startsWith(today.getFullYear()))
                .reduce((sum, p) => sum + p.points, 0);
      
            } catch (error) {
              console.error('點數資料取得失敗', error);
            }
        }
    },
})