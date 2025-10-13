<script></script>
<template>
    <div class="bg-stone-100 border-b-2 border-stone-300">
      <div class="w-full max-w-screen-xl m-auto">
        <!-- Email Subscription Section -->
        <div class="flex lg:flex-row items-center flex-col gap-4 w-80 md:w-4/5 lg:w-full m-auto py-6 border-b-2 border-stone-300">
          <div v-once class="lg:w-1/3 flex items-center">
            <img src="/logo.svg" class="w-[240px] h-[70px] block" alt="Logo">
          </div>
          <div v-once class="flex items-center gap-3 lg:w-1/3 pr-10">
            <div class="relative w-12 h-12 bg-blue-700 rounded-full shrink-0">
              <img src="/mail.svg" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" alt="Mail Icon">
            </div>
            <div>
              Join our mailing list to receive any latest updates and promotions
            </div>
          </div>
          <div class="flex items-center gap-3 lg:w-1/3">
            <input type="email" class="w-full lg:w-auto h-10 px-5 outline-none rounded" placeholder="Your email">
            <button type="button" class="text-white w-32 h-10 rounded bg-blue-700 cursor-pointer">Sign up</button>
          </div>
        </div>
  
        <!-- Links Section -->
        <div class="flex flex-col flex-wrap md:flex-row">
          <div class="lg:basis-1/4 md:w-1/2 p-4">
            <h4 class="text-4xl mb-5 text-blue-800 font-bold">Beautiful things for small people</h4>
            <div class="flex gap-3">
              <a href=""><img src="/facebook.svg" class="w-6 h-6" alt="Facebook"></a>
              <a href=""><img src="/pinterest.svg" class="w-6 h-6" alt="Pinterest"></a>
              <a href=""><img src="/linkedin.svg" class="w-6 h-6" alt="LinkedIn"></a>
              <a href=""><img src="/telegram.svg" class="w-6 h-6" alt="Telegram"></a>
            </div>
          </div>
          <ul class="lg:basis-1/4 md:w-1/2 lg:pl-20 flex flex-col gap-2 p-5">
            <li class="font-bold text-2xl">Shop</li>
            <li><a href="">Growsuits</a></li>
            <li><a href="">Jumpers</a></li>
            <li><a href="">Toys</a></li>
            <li><a href="">Accessories</a></li>
            <li><a href="">Dresses</a></li>
            <li><a href="">Leggings</a></li>
          </ul>
          <ul class="lg:basis-1/4 md:w-1/2 flex flex-col gap-2 p-5">
            <li class="font-bold text-2xl">Useful links</li>
            <li><a href="">Blog</a></li>
            <li><a href="">Contact us</a></li>
            <li><a href="">About us</a></li>
            <li><a href="">Delivery & Return</a></li>
          </ul>
          <ul v-once class="lg:basis-1/4 md:w-1/2 flex flex-col gap-2 p-5">
            <li class="font-bold text-2xl">Got a question?</li>
            <li>Email: babyclothes@mail.com</li>
            <li>Call Us: (064) 332-1233</li>
            <li>Monday - Friday</li>
            <li>Hours: 9:00am - 5:00pm</li>
            <li>913 Wyandotte St, Kansas City, MO 64105, United States</li>
          </ul>
        </div>
      </div>
    </div>
  
    <!-- Copyright Section -->
    <div class="bg-stone-100 py-5">
      <div class="flex justify-center flex-wrap lg:justify-between lg:items-center gap-3 w-full xl:w-3/4 m-auto">
        <p class="text-sm lg:text-base">Based on <a href=""><b>WoodMart</b></a> theme &copy; 2025 <a href=""><b>WooCommerce Themes.</b></a></p>
        <div class="flex justify-between items-center gap-10">
          <img src="/payments.png" class="" alt="Payment Methods">
          <router-link to="/admin/login" class="cursor-pointer hover:text-orange-600">後台管理</router-link>
        </div>
      </div>
    </div>
</template>
 