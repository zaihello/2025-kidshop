import { defineStore } from 'pinia'
import axios from 'axios'

export const usePointStore = defineStore('pointStore',{
    state:()=>({
        summary: {
            usablePoints: 0,
            pendingPoints: 0,
            yearlyPoints: 0
        },
        records: []
    }),
    actions:{
        async getPointsByUserId(userId){
            try{
                const res = await axios.get(`https://204ed3432b06d7af.mokky.dev/points?user_id=${userId}`)
                const data = res.data[0]
                //
                if(data){
                    this.summary = data.summary
                    this.records = data.records
                }else{
                    this.summary = {
                        usablePoints:0,
                        pendingPoints:0,
                        yearlyPoints:0
                    } 
                    this.records = []
                }

            }catch(error){
                console.log('取得點數資料失敗',error)
            }
        },
    },
})