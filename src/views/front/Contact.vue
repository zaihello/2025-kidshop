<script>
import SwiperContact from '../../components/swiper/SwiperContact.vue' 

export default{
    components:{SwiperContact},
  
}
</script>
<template>
    <div class="w-full xl:w-3/4 p-6 m-auto pt-20 px-8">
        <!-- 區塊1 -->
        <div  class="flex flex-col w-full md:flex-row py-10 ">
            <div class="md:w-1/2 ">
                <h4 class="font-bold text-3xl pr-10">臺北市信義區東府路1號</h4>
                <button type="button" class="flex gap-2 bg-blue-800 rounded px-5 py-3 text-white mt-7" >
                    <img src="/map.svg" class="" alt="">
                    <span class="text-sm">顯示地圖</span>
                </button>
                <ul class="flex flex-col gap-3 my-10">
                    <li><a href="">聯絡我們:(064) 332-1233</a></li>
                    <li>營業時間：上午 9:00 - 下午 5:00</li>
                    <li>星期一 - 星期五</li>
                </ul>
                <div class="flex gap-1">
                    <a href="">
                        <div class="relative w-10 h-10 rounded-full hover:bg-blue-600  transition">
                            <img src="/facebook.svg" alt="" class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 ">
                        </div>
                    </a>
                    <a href="">
                        <div class="relative w-10 h-10 rounded-full hover:bg-blue-400  transition">
                            <img src="/linkedin.svg" alt=""  class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 ">
                        </div>
                    </a>
                    <a href="">
                        <div class="relative w-10 h-10 rounded-full hover:bg-red-600  transition">
                            <img src="/pinterest.svg" alt="" class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 ">
                        </div>
                    </a>
                    <a href="">
                        <div class="relative w-10 h-10 rounded-full hover:bg-blue-200  transition">
                        <img src="/telegram.svg" alt="" class="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 ">
                        </div>
                    </a>
                </div>
            </div>
            <div class="md:w-1/2 ">
                <form action="" class="w-full flex flex-col gap-5 p-6 bg-white rounded-lg shadow-md ">
                    <h4 class="font-bold text-2xl text-gray-800">聯絡我們</h4>
                        <div class="">
                            <input type="text" placeholder="姓名" class="outline-none border border-gray-300 w-full py-2 px-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                        </div>
                        <div class="">
                            <input type="email"placeholder="Email" class="outline-none border border-gray-300 w-full py-2 px-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition">
                        </div>
                        <div>
                            <textarea name="" rows="10" cols="30" id="" placeholder="輸入要跟我們說的話..." class="outline-none border border-gray-300 w-full py-2 px-3 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"></textarea>
                        </div>
                        <button type="button" class="w-40 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg shadow-md transition-all" >發送訊息</button>
                </form>
            </div>
        </div>
        
    </div> 
    <div class="pb-20 px-8">
        <SwiperContact></SwiperContact>
    </div>

</template>