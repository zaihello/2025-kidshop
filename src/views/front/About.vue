<script></script>
<template>
    <!-- 外框 -->
    <div class="w-full xl:w-3/4 p-6  m-auto bg-blue-300">
        <!-- 區塊1 -->

        <!--用lg:grid-cols-5  lg:max-h-[520px]-->
        <div class="sm:mb-10 lg:grid lg:grid-cols-5 md:grid-cols-none bg-white">
            <!-- lg的圖先隱藏在lg打開 -->
             <!-- lg:col-span-3 -->
            <div class="hidden relative lg:block lg:col-span-3">
                <!-- lg:max-h-[520px] -->
                <img class="absolute inset-0 w-full max-w-[800px] h-full block object-cover object-center rounded-lg " src="/about1.jpg.webp" alt="Ad- woman on a beach">
            </div>
            <!-- lg:col-span-2-->
            <div class="w-full lg:col-span-2 mt-20 mb-20 shadow-xl lg:mt-10 md:shadow-xl  lg:shadow-none  lg:w-full lg:mb-10 lg:pt-5 md:pl-5 ">
                <!-- sm的圖在lg隱藏 -->
                <img class="md:max-h-[580px] w-full lg:hidden object-cover object-center mt-2 rounded-lg  shadow-2xl block " src="/about1.jpg.webp" alt="Ad- woman on a beach">
                <h5 class="mt-5  font-bold text-lg  text-blue-800">關於我們</h5>
                <h2 class="my-3 font-bold  text-lg text-gray-600 lg:text-5xl ">我們為嬰兒打造有機服裝</h2>
                <p class="text-base text-gray-600 text-justify pt-2">要製作百分之百有機棉的產品，卻有許多技術問題需要克服。指出，失去了化學纖維的支撐，純棉的衣服很容易變形。為了解決這個問題，公司花了七個月的時間研發新的工法，透過立體剪裁，讓衣服保有更大的彈性和活動空間。公司的童裝皆為台灣設計與製造，所使用的有機棉布料符合ＧＯＴＳ全球有機紡織認證標準。
                 
                <br>
                <br>
                未來，將面對全球供應鏈、品牌忠於自我，以及依顧客喜好調整的挑戰。</p>   
            </div>
        </div>

        <!-- 區塊2 -->
        <div class="flex flex-col lg:flex-row border rounded-xl bg-white my-10">
            
            <div class="lg:basis-7/12 lg:order-2 ">
                <img src="/about2.jpg.webp" class="rounded-xl block lg:pl-5 object-cover object-center lg:max-w-[800px] lg:max-h-[550px] w-full h-full" alt="">
            </div>
            <div class="lg:basis-5/12 lg:order-1">
                <div class="border-b-2 flex flex-col gap-2  py-5">
                    <h3 class="font-bold text-3xl">認識我們的團隊</h3>
                    <p>Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure show.</p>
                </div>
                <!-- 間距用padding不要用margin因 items-center會置中失策-->
                <div class="flex justify-between items-center border-b-2 py-5">
                    <div class="flex flex-col gap-2 "> 
                        <h4 class="font-bold">Darlene Robertson</h4>
                        <p >董事</p>
                    </div>
                    <div class="flex gap-2"> 
                        <img src="/facebook.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                        <img src="/telegram.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                    </div>
                </div>
                <div class="flex justify-between items-center border-b-2 py-5">
                    <div class="flex flex-col gap-2 ">
                        <h4 class="font-bold">Kathryn Murphy</h4>
                        <p>行銷經理
                        </p>
                    </div>
                    <div class="flex gap-2">
                        <img src="/facebook.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                        <img src="/telegram.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                        <img src="/pinterest.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                    </div>
                </div>
                <div class="flex justify-between items-center border-b-2 py-5">
                    <div class="flex flex-col gap-2 ">
                        <h4 class="font-bold">Jenny Wilson</h4>
                        <p>產品設計師</p>
                    </div>
                    <div class="flex gap-2">
                        <img src="/facebook.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                        <img src="/telegram.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                    </div>
                </div>
                <div class="flex justify-between items-center border-b-2 py-5">
                    <div class="flex flex-col gap-2 ">
                        <h4 class="font-bold">Kristin Watson</h4>
                        <p>CEO</p>
                    </div>
                    <div class="flex gap-2">
                        <img src="/facebook.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                        <img src="/telegram.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                        <img src="/linkedin.svg" class="w-6 h-6 hover:scale-110 transition duration-300" alt="">
                    </div>
                </div>
            </div>
        </div> 

        <!-- 區塊3 -->
       
        <div class="flex flex-col lg:flex-row  lg:gap-5 gap-12  my-10">
            <div>
                <div class="">
                    <!-- 使用h-[675px]在lg:flex-row時2張圖片高度一致 -->
                    <img src="/about3.jpg.webp" class="w-full rounded-xl object-cover object-center h-[675px] lg:max-w-[700px]" alt="">
                </div>
                <div>
                    <h3 class="font-bold text-xl my-4">我們如何工作</h3>
                    <p>有別於一般市售的金屬釦，使用了安全性更高的日本樹脂壓釦，不僅耐用度更好，不易掉落，爸媽最在意的安全度也大大提升。避免了金屬釦可能發生的生鏽及寶寶對金屬過敏問題。即使是小小的釦子，對於寶寶來說也非常重要，因此釦子的選用，我們也額外重視！</p>
                </div>
            </div>
            <div>
                <div class="">
                    <!-- 使用h-[675px]在lg:flex-row時2張圖片高度一致-->
                    <img src="/about4.jpg.webp" class="w-full rounded-xl object-cover object-center h-[675px] lg:max-w-[700px] " alt="">
                </div>
                <div>
                    <h3 class="font-bold text-xl my-4">我們做什麼</h3>
                    <p>居家服作為寶寶貼身的衣物，市面上許多衣物內裡有突出的縫份，這也是容易造成寶貝皮膚摩擦不舒服的原因。寶寶皮膚耐受性低，因此在縫製時，採用市面上少有的費工無縫份的作法，讓內裡更加滑順，大大提升寶寶的穿著舒適感。</p>
                </div>
            </div>

        </div>

        <!-- 區塊4 -->
        <div class="flex flex-col lg:flex-row bg-white ">
            <div class="lg:basis-2/5 mb-5">
                <h4 class="font-bold text-3xl ">您的一些問題在這裡得到解答</h4>
                <p class="my-5">我們收到很多關於我們課程的問題。您可以獲得任何答案。</p>
                <button type="button" class="py-3 px-5 border bg-blue-800 rounded-lg text-white text-sm">聯絡我們</button>
            </div>
            <!-- 組件 -->
            <div id="accordionFlushExample" class="lg:basis-3/5 lg:ml-20 ">
                <!-- Accordion1 -->
                <div
                    class="rounded-none border border-e-0 border-s-0 border-t-0 border-neutral-200 bg-white dark:border-neutral-600 dark:bg-body-dark">
                    <!-- 標題 -->
                    <h2 class="mb-0 font-bold" id="flush-headingOne">
                    <button
                        class="group relative flex w-full items-center rounded-none border-0 bg-white pr-5 py-4 text-left text-base text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none dark:bg-body-dark dark:text-white [&:not([data-twe-collapse-collapsed])]:bg-white [&:not([data-twe-collapse-collapsed])]:text-primary [&:not([data-twe-collapse-collapsed])]:shadow-border-b dark:[&:not([data-twe-collapse-collapsed])]:bg-surface-dark dark:[&:not([data-twe-collapse-collapsed])]:text-primary dark:[&:not([data-twe-collapse-collapsed])]:shadow-white/10 "
                        type="button"
                        data-twe-collapse-init
                        data-twe-target="#flush-collapseOne"
                        aria-expanded="false"
                        aria-controls="flush-collapseOne">
                        Why choose organic cotton fabrics and certified factories?
                        <span
                        class="-me-1 ms-auto h-5 w-5 shrink-0 rotate-[-45deg] transition-transform duration-200 ease-in-out group-data-[twe-collapse-collapsed]:me-0 group-data-[twe-collapse-collapsed]:rotate-0 motion-reduce:transition-none [&>svg]:h-6 [&>svg]:w-6">
                        <img src="/plus.svg" alt="">
                        </span>
                    </button>
                    </h2>
                    <!-- 內容 -->
                    <div
                        id="flush-collapseOne"
                        class="!visible border-0" 
                        data-twe-collapse-item
                        data-twe-collapse-show
                        aria-labelledby="flush-headingOne"
                        data-twe-parent="#accordionFlushExample">
                        <div class="pr-5 py-4">
                        A seemingly elegant design can quickly begin to bloat with unexpected content or break under the weight of actual activity. Fake data can ensure a nice looking layout but it doesn’t reflect what a living, breathing application must endure. Real data does.
                        </div>
                    </div>
                </div>
                <!-- Accordion2 -->
                <div
                    class="rounded-none border border-e-0 border-s-0 border-t-0 border-neutral-200 bg-white dark:border-neutral-600 dark:bg-body-dark">
                    <!-- 標題 -->
                    <h2 class="mb-0 font-bold" id="flush-headingTwo">
                    <button
                        class="group relative flex w-full items-center rounded-none border-0 bg-white pr-5 py-4 text-left text-base text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none dark:bg-body-dark dark:text-white [&:not([data-twe-collapse-collapsed])]:bg-white [&:not([data-twe-collapse-collapsed])]:text-primary [&:not([data-twe-collapse-collapsed])]:shadow-border-b dark:[&:not([data-twe-collapse-collapsed])]:bg-surface-dark dark:[&:not([data-twe-collapse-collapsed])]:text-primary dark:[&:not([data-twe-collapse-collapsed])]:shadow-white/10 "
                        type="button"
                        data-twe-collapse-init
                        data-twe-collapse-collapsed
                        data-twe-target="#flush-collapseTwo"
                        aria-expanded="false"
                        aria-controls="flush-collapseTwo">
                        How is your product packaged?
                        <span
                        class="-me-1 ms-auto h-5 w-5 shrink-0 rotate-[-45deg] transition-transform duration-200 ease-in-out group-data-[twe-collapse-collapsed]:me-0 group-data-[twe-collapse-collapsed]:rotate-0 motion-reduce:transition-none [&>svg]:h-6 [&>svg]:w-6">
                        <img src="/plus.svg" alt="">
                        </span>
                    </button>
                    </h2>
                    <!-- 內容 -->
                    <div
                        id="flush-collapseTwo"
                        class="!visible hidden border-0"
                        data-twe-collapse-item
                        aria-labelledby="flush-headingTwo"
                        data-twe-parent="#accordionFlushExample">
                        <div class="pr-5 py-4">
                            Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure that you can show different text, different data using the same template. When it’s about controlling    hundreds of articles, product pages for web shops.
                        </div>
                    </div>
                </div>
                <!-- Accordion3 -->
                <div
                    class="rounded-none border border-b-0 border-e-0 border-s-0 border-t-0 border-neutral-200 bg-white dark:border-neutral-600 dark:bg-body-dark">
                    <!-- 標題 -->
                    <h2 class="mb-0 font-bold" id="flush-headingThree">
                    <button
                        class="group relative flex w-full items-center rounded-none border-0 bg-white pr-5 py-4 text-left text-base text-neutral-800 transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none dark:bg-body-dark dark:text-white [&:not([data-twe-collapse-collapsed])]:bg-white [&:not([data-twe-collapse-collapsed])]:text-primary [&:not([data-twe-collapse-collapsed])]:shadow-border-b dark:[&:not([data-twe-collapse-collapsed])]:bg-surface-dark dark:[&:not([data-twe-collapse-collapsed])]:text-primary dark:[&:not([data-twe-collapse-collapsed])]:shadow-white/10 "
                        type="button"
                        data-twe-collapse-init
                        data-twe-collapse-collapsed
                        data-twe-target="#flush-collapseThree"
                        aria-expanded="false"
                        aria-controls="flush-collapseThree">
                        What’s the best size to buy for a body shower gift?
                        <span
                        class="-me-1 ms-auto h-5 w-5 shrink-0 rotate-[-45deg] transition-transform duration-200 ease-in-out group-data-[twe-collapse-collapsed]:me-0 group-data-[twe-collapse-collapsed]:rotate-0 motion-reduce:transition-none [&>svg]:h-6 [&>svg]:w-6">
                        <img src="/plus.svg" alt="">
                        </span>
                    </button>
                    </h2>
                    <!-- 內容 -->
                    <div
                        id="flush-collapseThree"
                        class="!visible hidden"
                        data-twe-collapse-item
                        aria-labelledby="flush-headingThree"
                        data-twe-parent="#accordionFlushExample">
                        <div class="pr-5 py-4">
                            If the copy becomes distracting in the design then you are doing something wrong or they are discussing copy  changes. It might be a bit annoying but you could tell them that that discussion would be best suited for another  time. At worst the discussion is at least working towards the final goal of your site where questions about lorem  ipsum don’t.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div> 
</template>