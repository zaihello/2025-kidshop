<script>
export default{
    data() {
        return {
            openedIndex: null,
            faqList: [
                {
                question: "Why choose organic cotton fabrics and certified factories?",
                answer:
                    "A seemingly elegant design can quickly begin to bloat with unexpected content or break under the weight of actual activity.",
                },
                {
                question: "How is your product packaged?",
                answer:
                    "Websites in professional use templating systems. Commercial platforms ensure contentmanagement scalability.",
                },
                {
                question: "What’s the best size to buy for a body shower gift?",
                answer:
                    "If the copy becomes distracting in the design then you are doing something wrong or they are discussing copy changes.",
                },
            ],
            teamMembers: [
              {
                name: 'Darlene Robertson',
                role: '董事',
                socials: ['facebook', 'telegram']
              },
              {
                name: 'Kathryn Murphy',
                role: '行銷經理',
                socials: ['facebook', 'telegram', 'pinterest']
              },
              {
                name: 'Jenny Wilson',
                role: '產品設計師',
                socials: ['facebook', 'telegram']
              },
              {
                name: 'Kristin Watson',
                role: 'CEO',
                socials: ['facebook', 'telegram', 'linkedin']
              }
            ]  
        };
    },
    methods: {
        toggle(index) {
            this.openedIndex = this.openedIndex === index ? null : index;
        },
    },
}
</script>
<template>
  <div class="bg-white py-20">
    <!-- 外框 -->
    <div class="w-full xl:w-3/4 p-6 m-auto space-y-24 px-8">
      
      <!-- 區塊1：關於我們 -->
      <div class="sm:mb-10 bg-white">
        <!-- 大螢幕排版（圖片在左＋文字在右，有 space-x-6） lg:items-center-->
        <div class="hidden lg:flex lg:items-end lg:space-x-6 bg-white">
          <!-- 左側圖片區 -->
          <div class="w-3/5 h-[500px]">
            <img
              src="/about1.jpg.webp"
              alt="Ad - woman on a beach"
              class="w-full h-full object-cover rounded-xl"
            />
          </div>

          <!-- 右側文字區（貼齊底部） -->
          <div class="w-2/5 flex flex-col justify-end h-[500px]">
            <p class="font-bold text-lg text-blue-800 mb-2">關於我們</p>
          
            <h2 class="text-4xl font-bold text-gray-600 leading-tight">
              我們為嬰兒打造有機服裝
            </h2>
            <p class="mt-4 text-gray-600 leading-relaxed">
            要製作百分之百有機棉的產品，卻有許多技術問題需要克服。指出，失去了化學纖維的支撐，純棉的衣服很容易變形。為 了解決這個問題，公司花了七個月的時間研發新的工法，透過立體剪裁，讓衣服保有更大的彈性和活動空間。公司的童裝 皆為台灣設計與製造，所使用的有機棉布料符合ＧＯＴＳ全球有機紡織認證標準。
            </p>
            <p class="mt-4 text-gray-600 leading-relaxed">
              未來，將面對全球供應鏈、品牌忠於自我，以及依顧客喜好調整的挑戰。
            </p>
          </div>
        </div>

        <!-- 小螢幕排版（圖片在上方 -->
        <div class="lg:hidden">
          <img
            class="w-full md:max-h-[580px] object-cover object-center mt-2 rounded-lg shadow-2xl"
            src="/about1.jpg.webp"
            alt="Ad- woman on a beach"
          />
          <div class="mt-5">
            <h5 class="font-bold text-lg text-blue-800">關於我們</h5>
            <h2 class="my-3 font-bold text-lg text-gray-600 text-3xl">我們為嬰兒打造有機服裝</h2>
            <p class="text-base text-gray-600 text-justify pt-2">
              要製作百分之百有機棉的產品，卻有許多技術問題需要克服。指出，失去了化學纖維的支撐，純棉的衣服很容易變形。為 了解決這個問題，公司花了七個月的時間研發新的工法，透過立體剪裁，讓衣服保有更大的彈性和活動空間。公司的童裝 皆為台灣設計與製造，所使用的有機棉布料符合ＧＯＴＳ全球有機紡織認證標準。
            </p>
            <p class="mt-4 text-gray-600 leading-relaxed">
              未來，將面對全球供應鏈、品牌忠於自我，以及依顧客喜好調整的挑戰。
            </p>
          </div>
        </div> 
      </div>

      <!-- 區塊2：團隊介紹 rounded-xllg:pl-5lg:max-w-[800px] lg:max-h-[550px]border-->
      <div class="flex flex-col lg:flex-row  bg-white my-10 lg:gap-6">
        <div class="lg:basis-7/12 lg:order-2">
          <img
            src="/about2.jpg.webp"
            class="rounded-xl block  object-cover object-center  w-full h-full"
            alt=""
          />
        </div>
        <div class="lg:basis-5/12 lg:order-1">
          <div class="border-b-2 flex flex-col gap-2 py-5">
            <h3 class="font-bold text-3xl">認識我們的團隊</h3>
            <p>Websites in professional use templating systems. Commercial publishing platforms and content management systems ensure show.</p>
          </div>
  
          <!-- 成員列表 -->
          <div v-for="member in teamMembers" :key="member.name" class="flex justify-between items-center border-b-2 py-5">
            <div class="flex flex-col gap-2">
              <h4 class="font-bold">{{ member.name }}</h4>
              <p>{{ member.role }}</p>
            </div>
            <div class="flex gap-2">
              <img v-for="icon in member.socials" :key="icon" :src="`${icon}.svg`" class="w-6 h-6 hover:scale-110 transition duration-300" alt="" />
            </div>
          </div>
        </div>
      </div>
  
      <!-- 區塊3：工作流程 -->
      <div class="flex flex-col lg:flex-row lg:gap-5 gap-12 my-10">
        <div>
          <img src="/about3.jpg.webp" class="w-full rounded-xl object-cover object-center h-[675px] lg:max-w-[700px]" alt="" />
          <h3 class="font-bold text-xl my-4">我們如何工作</h3>
          <p>有別於一般市售的金屬釦，使用了安全性更高的日本樹脂壓釦...</p>
        </div>
        <div>
          <img src="/about4.jpg.webp" class="w-full rounded-xl object-cover object-center h-[675px] lg:max-w-[700px]" alt="" />
          <h3 class="font-bold text-xl my-4">我們做什麼</h3>
          <p>市面上許多衣物內裡有突出的縫份，這也是容易造成寶貝皮膚摩擦不舒服的原因...</p>
        </div>
      </div>
  
      <!-- 區塊4：FAQ 手風琴 -->
      <div class="flex flex-col lg:flex-row bg-white">
        <div class="lg:basis-2/5 mb-5">
          <h4 class="font-bold text-3xl">您的一些問題在這裡得到解答</h4>
          <p class="my-5">我們收到很多關於我們課程的問題。您可以獲得任何答案。</p>
          <button type="button" class="py-3 px-5 border bg-blue-800 rounded-lg text-white text-sm">聯絡我們</button>
        </div>
  
        <div id="accordion" class="lg:basis-3/5 lg:ml-20">
          <div
            v-for="(item, index) in faqList"
            :key="index"
            class="border-b border-gray-200"
          >
            <button
              @click="toggle(index)"
              class="w-full text-left py-4 px-5 flex justify-between items-center bg-white text-gray-800"
            >
              <span class="font-bold">{{ item.question }}</span>
              <svg
                :class="{ 'rotate-45': openedIndex === index }"
                class="w-5 h-5 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <div v-show="openedIndex === index" class="px-5 pb-4 text-gray-600">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
  
    </div>
  </div>  
</template>
  
