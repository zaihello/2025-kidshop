<!-- Blog框架設計 -->
<script>
export default{
    props:{
        id:Number,
        title:String,
        author:String,
        description:String,
        image:String,
        category:String,
    }
}
</script>
<template>
   
<div class="flex justify-center items-center min-h-screen  ">
    <div class="max-w-[720px] mx-auto text-center">
        <div class="group/animation relative flex w-full max-w-[370px] flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-lg hover:shadow-lg hover:shadow-gray-900/20  transition">
            <div
                class="relative overflow-hidden text-white shadow-lg rounded-t-xl bg-blue-gray-500 bg-clip-border shadow-blue-gray-500/40 max-h-60">
                <img
                    :src="image"
                    class="max-h-60 object-cover object-center w-full group-hover/animation:scale-110 duration-500"
                    alt="ui/ux review check" />
                <!-- 遮罩 -->
                <div class="absolute invisible group-hover/animation:visible duration-500 inset-0 w-full h-full bg-[#0a1120] opacity-60 py-6 flex flex-col justify-center  overflow-hidden sm:py-12">
                    <div class=" backdrop-blur mx-auto rounded-lg flex cursor-context-menu">
                        <div class="m-auto text-gray-200">
                    <!-- Animation Snippet -->
                        <div>
                            <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block animate-flash"></span>
                            <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block animate-flash [animation-delay:0.2s]"></span>
                            <span class="w-2 h-2 ml-2 rounded-full bg-gray-200 inline-block animate-flash [animation-delay:0.4s]"></span></div>
                        </div>
                    </div>
                </div>
                <!-- 日期 -->
                <div
                    class="!absolute top-4 left-4 h-12 max-h-[48px] w-12 max-w-[48px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-red-500 transition-all   disabled:opacity-50 disabled:shadow-none bg-white"
                    >
                    <!-- <span class="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"> -->
                    <span class="flex flex-col text-xl">
                       18日
                       <span class="text-xs">
                        12月
                       </span>
                    </span>
                    
                </div>
                
            </div>
            <a href="#" class="max-w-10 absolute bg-blue-700 text-white text-xs font-bold text-center px-2 py-1 rounded top-[227px] right-[169px]">
                    <!-- {{ category }} -->
            </a>
            
            <div class="px-6 pt-6">
                <div class="flex items-center justify-between mb-3">
                    <h5 class="block font-sans text-xl antialiased font-medium leading-snug tracking-normal text-blue-gray-900">
                        <!-- {{ title }} -->
                    </h5>
                </div>
                <div class="flex flex-col items-center text-xs my-1">
                    <div class="flex flex-row items-center gap-3">
                        <span>By</span>
                        <img src="/author.jpg" class="rounded-full w-5 h-5 object-center object-over" alt="">
                        <a href="#">{{ author }}</a>
                        <a href="">
                            <div class="relative ">
                                <!--  -->
                                <img :src="image" alt="">
                                <div class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-400">
                                    <span class="text-white">0</span>
                                </div>
                            </div>
                        </a>
                        <div class="flex flex-row items-center">
                            <div class="group/connect relative " >
                                <img src="/connect.svg" alt="">
                                <!-- 使用justify-evenly置中 -->
                                <div class="group/edit invisible group-hover/connect:visible duration-200 flex justify-evenly absolute -top-14 -left-14  border border-gray-200 w-[150px] py-2 bg-gray-200 rounded-lg">
                                    <a href="">
                                       <img src="/facebook.svg" alt="" class="block"> 
                                    </a>
                                    <a href="">
                                        <img src="/pinterest.svg" alt="" class="block">
                                    </a>
                                    <a href="">
                                       <img src="/linkedin.svg" alt="" class="block"> 
                                    </a>
                                    <a href="">
                                        <img src="/telegram.svg" alt="" class="block">
                                    </a>
                                </div>
                            </div>
                        </div>
                        
                        
                    </div>           
                </div>
                        
                <p class="py-2 block font-sans text-base antialiased font-light leading-relaxed text-gray-700">
                    <!-- {{ description }} -->
                </p>
                
            </div>
            <div class="py-3">
                <div
                    class=" w-1/5 m-auto rounded-lg py-3.5  text-sm font-bold text-blue-700 cursor-pointer"
                    >
                    繼續閱讀
                </div>
            </div>
        </div>
    </div>
</div>

</template>
