<script>
export default{
    data(){
        return{
            steps: [
                { id: 1, label: '購物清單', path: '/cart/cartlist' },
                { id: 2, label: '填寫資料', path: '/cart/paylist' },
                { id: 3, label: '訂購完成', path: '/cart/orderdone' },
            ],
            isSubmitted: false//訂購完成後不能點前兩步用這追蹤
        }
    },
    computed:{
        //目前在步驟幾(購物清單、填寫資料、訂購完成)
        currentStep() {
            const current = this.steps.find(step => this.$route.path.includes(step.path))
            return current ? current.id : 1
        },
    },
    methods:{
        //如果已經訂購完成（isSubmitted === true），就不能回到「步驟一或步驟二」,只能留在「步驟三」訂購完成頁。
        goToStep(step) {
            if (this.isSubmitted && step.id !== 3) return
            this.$router.push(step.path)
        }
    },
    watch: {
        //如果切換到「訂購完成」頁，就把 isSubmitted 設為 true(用來禁止返回前兩步)，否則為 false。
        $route(to) {
            this.isSubmitted = to.path === '/cart/orderdone'
        }
    },
    mounted() {
        //一開始載入（進入頁面）時就檢查：是不是 /cart/orderdone？
        this.isSubmitted = this.$route.path === '/cart/orderdone'
    }
}
</script>
<template>
<div class="w-full 2xl:w-3/4 2xl:mx-auto mb-8">
    <!-- 多欄完整步驟：只在 md 顯示 -->   
    <ol class="hidden md:flex gap-4 items-center justify-center">
        <li v-for="step in steps" :key="step.id" class="flex gap-2 items-center">
            <button
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                :class="{
                    'bg-orange-500 text-white': currentStep === step.id,
                    'bg-orange-100 text-black': currentStep !== step.id,
                    'pointer-events-none opacity-50': isSubmitted && step.id !== 3
                }"
                @click="goToStep(step)"
            >
            {{ step.id }}
            </button>
            <span>{{ step.label }}</span>
            <span v-if="step.id !== steps.length">→</span>
        </li>
        
    </ol>
    <!-- 單一欄顯示當前步驟：只在 <md 顯示 -->
    <div class="block md:hidden text-center">
      <p class="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-full text-sm">
        <span class="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">{{ currentStep }}</span>
        {{ steps[currentStep - 1].label }}
      </p>
    </div>
</div>    
</template>