<template> 
    <!-- 外框設定輪播的寬度 -->
    <div class="w-3/4 m-auto ">
      <swiper 
        :slidesPerView="1" 
        :spaceBetween="10"
        :breakpoints="{
          '640':{
            slidesPerView: 2,
            spaceBetween: 10
          },
          '768':{
            slidesPerView:3,
            spaceBetween: 20
          },
          '992':{
            slidesPerView: 4,
            spaceBetween: 20
          },
          '1100':{
            slidesPerView:5,
            spaceBetween:20
          },
          '1204':{
            slidesPerView:6,
            spaceBetween:20
          }
        }"
        :navigation="{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        }" 
        :modules="modules" 
        class="mySwiper product-swiper"
        >  
      <!-- Category輪播圖 -->
        <swiper-slide
          v-for="category in categoryCounts" 
          @click="navigateToCategory(category.name)"
          :key="category.name"
          class="flex items-center justify-center mb-6"
        >
        <!-- flex items-center justify-center:圖片置中輪播框 -->
          <div class="relative  w-44 h-44" >
            <img :src="category.image" alt="" class="object-cover w-full h-full rounded-full" :class="{ 'bg-gray-400 text-white': productStore.filter.category === category.name }"/>
            <span class="absolute inset-0 flex items-center justify-center text-white font-black hover:bg-black hover:bg-opacity-20 rounded-full  ">{{ category.name }} ({{ category.count }})</span>
          </div>
        </swiper-slide>
       
         <!-- swiper-button-next 和 swiper-button-prev 都是原生設定，藉由這兩項樣式調整css --> 
        <button  class="swiper-button-next">
          <svg width="800px" height="800px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--emojione-monotone" preserveAspectRatio="xMidYMid meet"><path d="M32 2C15.432 2 2 15.432 2 32c0 16.568 13.432 30 30 30s30-13.432 30-30C62 15.432 48.568 2 32 2zm1.693 46V37.428H15V27.143h18.693V16L49 32L33.693 48z" fill="#000000"></path></svg>
        </button>
        <button class="swiper-button-prev">
          <svg width="800px" height="800px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--emojione-monotone" preserveAspectRatio="xMidYMid meet"><path d="M32 2C15.432 2 2 15.432 2 32c0 16.568 13.432 30 30 30s30-13.432 30-30C62 15.432 48.568 2 32 2zm17 35.428H30.307V48L15 32l15.307-16v11.143H49v10.285z" fill="#000000"></path></svg>  
        </button>
    
        </swiper>
    </div>
    
</template>
    
    <script>
    import { useProductStore } from '../../stores/productStore'
    // import { useAdminProductStore } from '../../stores/adminProductStore'
      // Import Swiper Vue.js components
      import { Swiper, SwiperSlide } from 'swiper/vue';
    
      // Import Swiper styles
      import 'swiper/css';
    
      import 'swiper/css/navigation';
    
    //   import './style.css';  可刪除
    
      // import required modules
      import { Navigation } from 'swiper/modules';
    
      export default {
        components: {
          Swiper,
          SwiperSlide,
        },
        data(){
          return{
            categoryItems: [
              {
                name: '緊身衣',
                image: 'https://woodmart.b-cdn.net/kids/wp-content/uploads/sites/13/2023/05/w-bcs-growsuit-11-1.jpg',
              },
              {
                name: '毛衣',
                image: 'https://woodmart.b-cdn.net/kids/wp-content/uploads/sites/13/2023/05/w-bcs-jumpers-5-1.jpg',
              },
              {
                name: '玩具',
                image: 'https://woodmart.b-cdn.net/kids/wp-content/uploads/sites/13/2023/05/w-bcs-toys-3-1.jpg',
              },
              {
                name: '配件',
                image: 'https://woodmart.b-cdn.net/kids/wp-content/uploads/sites/13/2023/05/w-bcs-accessories-2-1.jpg',
              },
              {
                name: '洋裝',
                image: 'https://woodmart.b-cdn.net/kids/wp-content/uploads/sites/13/2023/05/w-bcs-dresses-3-1.jpg',
              },
              {
                name: '緊身褲',
                image: 'https://woodmart.b-cdn.net/kids/wp-content/uploads/sites/13/2023/05/w-bcs-leggings-3-1.jpg',
              },
            ],
          }
        },
        methods:{
          // 切換類別時更新網址參數
          navigateToCategory(category) {
            // 更新路由參數
            this.$router.push({
              path: this.$route.path,
              query: { ...this.$route.query, category: category.toLowerCase(), page: 1 }
            });

            // 通知 store 更新狀態
          this.productStore.updateCategory(category);
          },
        }, 
        computed:{
          // adminProductStore(){
          //   return useAdminProductStore()
          // },
          // 計算每個類別的商品數量(放在computed數據自動重新計算)
          categoryCounts(){
            return this.productStore.categoryCounts(this.categoryItems);
          },
        },
        //323
        setup() {
          // 引用 productStore
          const productStore = useProductStore();
          return {
            modules: [Navigation],
            productStore, // 將 Store 引入模板使用 
          };
        },
      };
    </script>
    
     <style scoped>
       .swiper-button-next{
         width: 60px;
         height: 60px;
         right: 0px;
         /* 隱藏原生的藍色箭頭 */
         /* text-indent:把箭頭移到外框去 */
         text-indent:160%;
         white-space:nowrap;
         overflow:hidden;
       }
       .swiper-button-prev{
         width: 60px;
         height: 60px; 
         left: 0px;
    
         /* 隱藏原生的藍色箭頭 */
         text-indent: 160%;
         white-space:nowrap;
         overflow:hidden;
        } 
        :deep(.product-swiper){
        margin: auto;
        padding: 0;
          
          @media(min-width:768px){
            margin: 0 -30px !important;
            padding: 0 30px !important;
          }
        }  
      
    
    .swiper-button-next svg path,
    .swiper-button-prev svg path {
      fill: #FFD700; /* 修改箭頭顏色為黃色 */
    }  
    
    
    
    </style> 
    
    