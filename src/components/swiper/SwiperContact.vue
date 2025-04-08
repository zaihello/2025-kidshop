<!-- 建立我們要顯示資料的欄位 -->

<script>

// 
import { Swiper,SwiperSlide } from 'swiper/vue';
// 上下一則導航；自動播放
import { Navigation,Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';


export default{
    data(){
        return{
            images:[
                "/contact-us-1.jpg.webp",
                "/contact-us-2.jpg.webp",
                "/contact-us-3.jpg.webp",
                "/contact-us-4.jpg.webp",
                "/contact-us-5.jpg.webp",

            ],
            modules:[Navigation,Autoplay],
        }    
    },
    components:{
        Swiper,
        SwiperSlide,
    }
}
</script>
<template>
    <div class="py-10">
    <swiper
    :slidesPerView="2"
    :spaceBetween="30"
    :breakpoints="{
        992:{
            slidesPerView:5
        }
    }"
    :navigation="true"
    :loop="true"
    :autoplay="{
        delay:1500,
        disableOnInteraction: false
    }"
    :modules="modules"
    class="mySwiper"
  >
 
    <swiper-slide v-for="image in images" :key="image">
        <div class="rounded-xl">
            <img :src="image" class="rounded-xl " alt="">
        </div>
    </swiper-slide>
    <!-- <button class="swiper-button-next scale-50 overflow-hidden whitespace-nowrap"></button>
    <button class="swiper-button-prev "></button> -->
    </swiper>
    </div>
</template>
