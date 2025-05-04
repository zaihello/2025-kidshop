<script>
import axios from 'axios';

export default {
  data() {
    return {
      blogs: [],
    };
  },
  computed:{
    // 先把所有 blog 整平 成一個陣列
    allBlogs() {
      // 假設 blogs 是原本的分類資料 [{ category, datas: [...] }]
      return this.blogs.flatMap(category =>
        category.datas.map(blog => ({
          ...blog,
          category: category.category
        }))
      );
    }
  },
  methods: {
    async getBloglist() {
      try {
        const response = await axios.get('https://204ed3432b06d7af.mokky.dev/blogs');
        this.blogs = response.data;
      } catch (err) {
        console.log('Error fetching blogs:', err);
      }
    },
    //標題、介紹文字限制字數
    truncateText(text, limit) {
        if (!text) return '';  // 防止 text 為 null 或 undefined
        return text.length > limit ? text.slice(0, limit) + '...' : text;
    }
  },
  mounted() {
    this.getBloglist();
  },
};
</script>
<template>
<div class="2xl:w-3/4 2xl:m-auto py-20">
    <!-- flex justify-center items-center min-h-screen-->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-8">
        <!-- 第一層資料迭代 -->
        <!-- <div v-for="category in blogs" :key="category.id" > -->
            <!-- class="flex justify-center items-center min-h-screen" -->
            <!-- 第二層資料迭代 -->

            <div v-for="blog in allBlogs" :key="blog.id" class="mb-9 ">
                <!-- <div class="max-w-[720px] mx-auto text-center"> -->
                    <!-- max-w-[370px] rounded-xl-->
                    <div class="group/animation relative flex w-full flex-col rounded-b-xl  bg-white bg-clip-border text-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out ">
                        <!-- hover:shadow-lg hover:shadow-gray-900/20  transition -->
                         <!-- overflow-hidden rounded-t-xl-->
                        <div
                            class="relative overflow-visible text-white shadow-lg  bg-blue-gray-500 bg-clip-border shadow-blue-gray-500/40 max-h-60">
                            <div class="overflow-hidden rounded-t-xl">
                                <img
                                    :src="blog.imgUrl"
                                    class="max-h-60 object-cover object-center w-full group-hover/animation:scale-110 duration-500"
                                    alt="ui/ux review check" />
                            </div> 
                            <a href="#" 
                                class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-blue-700 text-white text-xs font-bold text-center px-2 py-1 rounded flex items-center justify-center h-[40px] z-10">
                                {{ blog.category }}
                            </a> 
                            <!-- 類別標籤 (固定在底部，水平 & 垂直置中) -->
    
                            <!-- 遮罩 -->
                            <div class="absolute invisible group-hover/animation:visible duration-500 inset-0 w-full h-full bg-[#0a1120] opacity-60 py-6 flex flex-col justify-center overflow-hidden sm:py-12 rounded-t-xl">
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
         
                        <div class="px-6 pt-6">
                            <!-- 標題 -->
                            <h5 class="block font-sans text-xl text-center antialiased font-medium leading-snug tracking-normal text-blue-gray-900 my-3">
                                {{ truncateText(blog.title,10) }}
                            </h5>
                            <div class="flex flex-col items-center text-xs my-1">
                                <div class="flex flex-row items-center gap-3">
                                    <span>By</span>
                                    <img src="/author.jpg" class="rounded-full w-5 h-5 object-center object-over"   alt="">
                                    <a href="#">{{ blog.author }}</a>
                                    <a href="">
                                        <div class="relative ">
                                            <!--  -->
                                            <img :src="image" alt="">
                                            <div class="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-400 flex justify-center items-center">
                                             <span class="text-white text-xs">0</span>
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
                            <!-- 介紹 -->
                            <p class="py-2 block font-sans text-base antialiased font-light leading-relaxed text-gray-700 ">
                                {{ truncateText(blog.description, 100) }}
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
                <!-- </div> -->
            </div>
        <!-- </div> -->
    </div>
</div>
</template>