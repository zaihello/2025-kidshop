<!-- 商品詳情頁面 -->
<template>
    <div v-if="product" class="w-full 2xl:w-3/4 2xl:m-auto py-8 px-4">
      <!-- Breadcrumbs -->
      <div class="text-sm text-gray-500 mb-4">
        <router-link to="/" class="hover:underline">Home</router-link> /
        <router-link 
          :to="{ name: 'Shop', query: { category: product.category} }" 
          class="hover:underline">{{ product.category }}</router-link> /
        <span>{{ product.name }}</span>
      </div>
  
      <!-- Main Content -->
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Image Carousel Section -->
        <div class="w-full md:w-1/2">
          <!-- 主圖 -->
          <div class="relative border rounded overflow-hidden">
            
            <button 
              @click="prevImage" 
              class="absolute left-2 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center transform -translate-y-1/2 top-1/2 shadow-md hover:bg-gray-400 transition z-10">
              ‹
            </button>
            <img :src="activeImage" class="w-full h-auto object-cover object-center transition-transform duration-300    hover:scale-125" alt="Main Product Image">
            <button 
              @click="nextImage" 
              class="absolute right-2 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center transform -translate-y-1/2 top-1/2 shadow-md hover:bg-gray-400 transition z-10">
              ›
            </button>
          </div>
  
          <!-- 小圖 -->
          <div class="flex mt-4 space-x-4 overflow-x-auto">
            <img 
              v-for="(image, index) in allImages" 
              :key="index" 
              :src="image" 
              @click="setActiveImage(image)" 
              :class="{'border-blue-500': image === activeImage, 'border': true}" 
              class="w-16 h-16 cursor-pointer mx-2">
          </div>
        </div>
  
        <!-- Product Details Section -->
        <div class="w-full md:w-1/2">
          <h1 class="text-2xl font-semibold">{{ product.name }}</h1>
          <div class="flex items-center space-x-4 mt-2">
            <span 
              v-if="product.OriginalPrice" 
              class="text-gray-400" 
              :class="{'line-through':product.price}"
            >原價:${{ product.OriginalPrice }}
            </span>
            <span v-if="product.price" class="text-xl font-bold text-blue-500">特價:${{ product.price }}</span>
          </div>
          <p class="text-gray-600 mt-4">
            {{ product.description }}
          </p>
  

           <!-- Size Selection -->
          <div class="mt-4">
            <label class="block font-medium text-gray-700">Size:</label>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="(size, index) in sizeOptions" 
                :key="index" 
                class="px-4 py-2 font-medium rounded-lg shadow-md transition-all duration-300"
                :class="[
                  !selectedColor ? 'bg-orange-500 text-white' : '', // 未選擇顏色時，所有尺寸按鈕為橘色
                  selectedSize === size ? 'ring-2 ring-black' : '', // 選中的尺寸加黑色邊框
                  selectedColor && isOutOfStock(selectedColor, size) ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 hover:bg-orange-600 text-white' // 只有選擇顏色後，顯示對應的尺寸按鈕樣式
                ]"
                @click="selectSize(size)"
              >
                {{ size }} 
              </button>  
            </div>
          </div>
  

          <!-- Color Options -->
          <!-- 選中的顏色，則設定黑色邊框；否則設定透明邊框2px solid transparent -->
          <div class="mt-4">
            <label class="block font-medium text-gray-700">Color:</label>
            <div class="flex flex-wrap gap-3 mt-2">
              <button 
                v-for="(color,index) in availableColors" 
                :key="index" 
                :class="[productStore.colorsTailwindcss[color] || 'bg-gray-200', selectedColor === color ? 'ring-2 ring-black' : 'ring-2 ring-transparent']"
                class="w-8 h-8 rounded-full cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg" 
                @click="selectColor(color)">
              </button>
            </div>
          </div>

          <div class="flex justify-between flex-wrap">
            <!-- 數量控制 -->
            <div>
              <div class="mt-4 flex items-center space-x-4 p-2 border rounded-lg w-fit"
              :class="(selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)) ? 'bg-gray-300 cursor-not-allowed' : 'bg-white'">
                <button @click="decrementQuantity" class="p-2 border rounded text-gray-600"
                :disabled="quantity <= 1 || (selectedSize && isOutOfStock(selectedColor, selectedSize))">-</button>
                <span>{{ quantity }}</span>
                <button @click="incrementQuantity" class="p-2 border rounded text-gray-600"
                :disabled="selectedColor && selectedSize && (isOutOfStock(selectedColor, selectedSize) || (selectedVariant && quantity >= selectedVariant.count))">+</button>
              </div>
            </div>
            
            <div class="flex flex-wrap gap-3 ">
            <!-- 加入購物車按鈕 -->
            <button 
              class="mt-4 px-4 py-2 font-medium rounded-lg transition-all duration-300"
              :class="(selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'"
              :disabled="selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)"
               @click="addItemToCart"
            >
              <span v-if="selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)">商品已售完</span>
              <span v-else >加入購物車</span>
            </button>

            <button 
              class="mt-4 px-4 py-2 font-medium rounded-lg transition-all duration-300 "
              :class="(selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)) ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'"
              :disabled="selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)"
               @click="buyNow"
            >
              <span v-if="selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)">商品已售完</span>
              <span v-else >立即購買</span>
            </button>
          </div>
          </div>
 
          <!-- Wishlist and Share Links -->
          <div class="flex items-center mt-6 space-x-4">
            <div class="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
              <img 
                :src="isInWishlist ? './check.svg' : './wishlist.svg'" 
                @click="toggleWishlist"  
                class="cursor-pointer w-6 h-6"
                alt="Wishlist Icon"
              >
              <span>{{ isInWishlist ? '已加入追蹤清單' : '加入追蹤清單' }}</span>
            </div>
            <div class="flex space-x-2">
              <a href="#" class="text-gray-500 hover:text-blue-500"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="text-gray-500 hover:text-blue-500"><i class="fab fa-twitter"></i></a>
              <a href="#" class="text-gray-500 hover:text-blue-500"><i class="fab fa-pinterest"></i></a>
            </div>
          </div>
        </div>
      </div>
  
      <div v-if="errorMessage">
        <p style="color: red;">{{ errorMessage }}</p>
      </div>
    </div>
    <div v-else class="w-full 2xl:w-3/4 2xl:m-auto py-8 px-4">
      <p>正在加載商品資料...</p>
    </div>
</template>
  
  <script>
  import { useWishlistStore } from '../../stores/wishlistStore'
  import { useAuthStore } from '../../stores/authStore'
  import { useCartStore } from '../../stores/cartStore'
  import { useProductStore } from '../../stores/productStore'

  import axios from 'axios';
  
  export default {
    data() {
      return {
        product: null, // 個別商品資料
        errorMessage: null, // 錯誤信息
        activeImage: '', // 當前顯示的主圖片
        activeImageIndex: 0, // 當前主圖片的索引
        quantity: 1, // 商品數量
        selectedSize: null, //使用者選擇的尺寸（對應 product.variants.size）
        selectedColor: null, //使用者選擇的顏色（對應 product.colors.color）
        selectedVariant: null,//使用者根據選擇的 color 和 size 所對應的 variant 物件。
      };
    },
    computed:{
       // 動態獲取 store 實例
      wishlistStore(){
        return useWishlistStore() 
      },
      authStore(){
        return useAuthStore()
      },
      cartStore(){
        return useCartStore()
      },
      productStore(){
        return useProductStore()
      },
      isInWishlist() {
        return this.wishlistStore.isInWishlist(this.product.id);
      },
      //縮圖區： 第一張是 product.imgurl ；後面是 colors.imageurl
      allImages() {
      // 先拿到所有顏色的圖片 URL，並過濾掉空字串
      const colorImages = this.product.colors
        .map(color => color.imageurl)  // 提取所有顏色的圖片 URL
        .filter(imageUrl => imageUrl !== "");  // 過濾掉空字串的 URL

      // 返回包含主圖和非空顏色圖片的陣列
      return [this.product.imgurl, ...colorImages];
    },
       // 獲取所有可選顏色（無論有無庫存）
      availableColors() {
        return [...new Set(this.product.variants.map(v => v.color))];
      },
       // 獲取當前顏色的所有尺寸，不重覆，並尺寸排序（無論有無庫存）
      sizeOptions() {
        return [...new Set(this.product.variants
          .filter(v => this.selectedColor ? v.color === this.selectedColor : true)
          .map(v => v.size)
        )].sort((a, b) => {
          // 如果某個值是 'F'，排在最後
          if (a === 'F') return 1;
          if (b === 'F') return -1;

          // 提取尺寸中的數字進行比較
          const numA = parseInt(a);
          const numB = parseInt(b);

          return numA - numB;
        });
      },
     // 判斷當前選擇的尺寸是否缺貨
      isOutOfStock() {
        return (color, size) => {
          const variant = this.product.variants.find(v => v.color === color && v.size === size);
          return !variant || variant.count === 0;
        };
      },
    },
   
    methods: {
      
      // 根據 商品ID 獲取商品詳細資料 
      async productDetails(productId) {
        try {
          //dev/products
          const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/product/${productId}`);
          this.product = response.data;

          this.setActiveImage();  // 預設設定第一張圖片為主要圖片
          console.log('詳細頁面商品資料',this.product)
        
        } catch (error) {
          this.errorMessage = '無法獲取商品資料，請稍後再試。';
          console.error('獲取商品詳情失敗:',error);
        }
      },
      // 預設主圖設定第一張商品圖片
      setActiveImage(image = null) {
        if (image) {
          this.activeImage = image;
          this.activeImageIndex = this.allImages.indexOf(image);
        } else {
          this.activeImage = this.product.imgurl; // 預設為 product.imgurl
          this.activeImageIndex = 0;
        }
      },

      //上一頁
      prevImage() {
        if (this.activeImageIndex > 0) {
          this.activeImageIndex--;
        } else {
          this.activeImageIndex = this.allImages.length - 1;
        }
        this.activeImage = this.allImages[this.activeImageIndex];
      },
      //下一頁
      nextImage() {
        if (this.activeImageIndex < this.allImages.length - 1) {
          this.activeImageIndex++;
        } else {
          this.activeImageIndex = 0;
        }
        this.activeImage = this.allImages[this.activeImageIndex];
      },
       
      decrementQuantity() {
        if (this.quantity > 1) {
          this.quantity--;
        }
      },
      incrementQuantity() {
        if (this.selectedVariant && this.quantity < this.selectedVariant.count) {
          this.quantity++;
        }
      },

      // 選擇button顏色時，主圖變成該顏色
      selectColor(color) {
        this.selectedColor = color; // 更新 UI 選擇的顏色

        // 從 colors 陣列中找到對應顏色的物件
        const colorData = this.product.colors.find(c => c.color === color);
  
        // 如果該顏色有圖片，則設定主圖
        if (colorData && colorData.imageurl) {
          this.setActiveImage(colorData.imageurl);
        }
       
        // 如果目前選擇的尺寸仍然存在於新顏色的 sizeOptions，就保持選擇
        if (!this.sizeOptions.includes(this.selectedSize)) {
          this.selectedSize = null; // 只有當已選尺寸不在新顏色內時才重設
        }
       
      },
     

      //選染ui(點擊尺寸外框黑色)
      selectSize(size) {
        this.selectedSize = size; // 更新選中的尺寸
        
        // 當選擇尺寸時，如果還未選擇顏色，則直接篩選出該尺寸的顏色
        if (!this.selectedColor) {
          const matchingVariant = this.product.variants.find(variant => variant.size === size);
          if (matchingVariant) {
            this.selectedColor = matchingVariant.color; // 自動選擇第一個匹配的顏色
          }
        }
        //可增加減少數量
        if (this.selectedColor && this.selectedSize) {
          this.selectedVariant = this.product.variants.find(
            v => v.color === this.selectedColor && v.size === this.selectedSize
          ) || null;
        } else {
          this.selectedVariant = null;
        }
      },
      //加入購物車按鈕
      addItemToCart() {
        const token = this.authStore.token;
        // 🔹 檢查是否已登入
        if (!token) {
          alert('請登入以將商品加入購物車！');
          this.$router.push('/login');
          return;
        }

        this.cartStore.addItemToCart(this.product, this.selectedSize, this.selectedColor, this.quantity);
      },

      //立即購買功能
      buyNow() {
        if (!this.selectedSize || !this.selectedColor) {
          alert('請選擇尺寸和顏色');
          return;
        }
        this.cartStore.buyNow(this.product, this.selectedSize, this.selectedColor, this.quantity);
      },

      toggleWishlist() {
        this.wishlistStore.toggleWishlist(this.product);
      },
    },
    mounted() {
      const productId = this.$route.params.id;// 從路由參數中獲取商品 ID
      this.productDetails(productId);// 加載商品詳細資料
    },

  }
  </script>

   

  
  