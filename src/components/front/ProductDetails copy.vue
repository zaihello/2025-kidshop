<!-- 原始版 -->
<template>
    <!-- 商品詳情頁面 -->
    <!-- class="container mx-auto p-8" -->
    <div v-if="product" class="w-full 2xl:w-3/4 2xl:m-auto py-8 px-4">
      <!-- Breadcrumbs -->
      <div class="text-sm text-gray-500 mb-4">
        <router-link to="/" class="hover:underline">Home</router-link> /
        <router-link 
          :to="{ name: 'Shop', query: { category: product.category.toLowerCase() } }" 
          class="hover:underline">{{ product.category }}</router-link> /
        <span>{{ product.name }}</span>
      </div>
  
      <!-- Main Content -->
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Image Carousel Section -->
        <div class="w-full md:w-1/2">
          <!-- 主圖 -->
          <div class="relative border rounded overflow-hidden">
            <!-- class="absolute left-2 w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center transform -translate-y-1/2 top-1/2" -->
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
            <!-- v-for="(image, index) in product.imagesurl" -->
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
          <div v-if="product.variants && product.variants.length" class="mt-4">
            <label class="block font-medium text-gray-700">Size:</label>
            <div class="flex flex-wrap gap-2">
            <!-- ui只顯示唯一的尺寸選項，ui調整格式，ui調整排序-->
              <button 
                v-for="(size, index) in [...new Set(product.variants.map(v => 
                  v.size.trim().replace(/\s*-\s*/g, ' - ')
                ))].sort((a, b) => { 
                  const order = ['0 - 3 Months', '3 - 6 Months', '6 - 12 Months', 'F']; // ui自訂排序
                  return order.indexOf(a) - order.indexOf(b);
                })" 
                :key="index" 
                class="bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg px-4 py-2 shadow-md transition-all duration-300"
                :class="[selectedSize === size ? 'ring-2 ring-black' : 'ring-2 ring-transparent']"
                @click="selectSize(size)"
              >
                {{ size }}
              </button>
            </div>
          </div>
  

          <!-- Color Options -->
          <!-- 選中的顏色，則設定黑色邊框；否則設定透明邊框2px solid transparent -->
          <div v-if="product.variants  && product.variants.length" class="mt-4">
            <label class="block font-medium text-gray-700">Color:</label>
            <div class="flex flex-wrap gap-3 mt-2">
              <!-- ui只顯示唯一的color選項 -->
              <button 
                v-for="(color,index) in [...new Set(product.variants.map(v => v.color))]" 
                :key="index" 
                :class="[productStore.colorsTailwindcss[color] || 'bg-gray-200', selectedColor === color ? 'ring-2 ring-black' : 'ring-2 ring-transparent']"
                class="w-8 h-8 rounded-full cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg" 
                @click="selectColor(color)">
              </button>
            </div>
          </div>
  
          <!-- Quantity Selector and Buttons -->
          <div class="mt-6 flex items-center space-x-4">
            <div>
              <button @click="decrementQuantity" class="text-gray-600 p-2 border rounded">-</button>
              <span>{{ quantity }}</span>
              <button @click="incrementQuantity" class="text-gray-600 p-2 border rounded">+</button>
            </div>
            <button 
              @click="addItemToCart" 
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              加入購物車
            </button>
            <button 
              @click="buyNow"
              class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
              立即購買
            </button>
          </div>
  
          <!-- Wishlist and Share Links -->
          <div class="flex items-center mt-6 space-x-4">
            <div class="flex items-center space-x-1 text-gray-600 hover:text-blue-500">
              <img 
                :src="isInWishlist ? '/check.svg' : '/wishlist.svg'" 
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
        // products:[],//所有商品資料
        product: null, // 個別商品資料
        errorMessage: null, // 錯誤信息
        activeImage: '', // 當前顯示的主圖片
        activeImageIndex: 0, // 當前主圖片的索引
        quantity: 1, // 商品數量
        selectedSize: null, // 選中的尺寸
        selectedColor: null, // 選中的顏色
        // isInWishlist: false, // 新增 預設為未加入追蹤
        // wishlistItemId: null, // 新增 儲存追蹤項目的 ID
        // token:'',//新增
        // user_id:'',//新增
        // isFavorite: false,// 新增 收藏狀態
        // token: localStorage.getItem('token') || '',//新增 初始化時嘗試從 Local Storage 中讀取已存的 token 值，如果沒有則預設為空字串。
        // wishlistStore: useWishlistStore(),
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
    //   isInWishlist() {
    //   return (productId) =>
    //     this.wishlistStore.wishlist.some((item) => item.product_Id === productId);
    // },
      //縮圖區： 第一張是 product.imgurl ；後面是 colors.imageurl
      allImages() {
      // 先拿到所有顏色的圖片 URL，並過濾掉空字串
      const colorImages = this.product.colors
        .map(color => color.imageurl)  // 提取所有顏色的圖片 URL
        .filter(imageUrl => imageUrl !== "");  // 過濾掉空字串的 URL

      // 返回包含主圖和非空顏色圖片的陣列
      return [this.product.imgurl, ...colorImages];
    }



      },
   
    methods: {
      
      // 根據 商品ID 獲取商品詳細資料 
      async productDetails(productId) {
      try {
        //dev/products
        const response = await axios.get(`https://204ed3432b06d7af.mokky.dev/product/${productId}`);
        this.product = response.data;

         // 新增 在獲取到商品資料後立即檢查追蹤清單狀態
        //  this.checkWishlistStatus(this.product); 

        this.setActiveImage();  // 預設設定第一張圖片為主要圖片
        // this.setSelectedSize(); // 預設設定第一個尺寸為選項
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
      incrementQuantity() {
        this.quantity++;
      },
      decrementQuantity() {
        if (this.quantity > 1) {
          this.quantity--;
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
      },

      //選染ui(點擊尺寸外框黑色)
      selectSize(size) {
        this.selectedSize = size; // 更新選中的尺寸
      },
      // async addToCart() {
      //   // const token = localStorage.getItem('token');
      //   const token = this.authStore.token
      //   if (!token) {
      //     alert('請登入以將商品加入購物車！');
      //     this.$router.push('/login');
      //     return;
      //   }
        
      //   try {
      //     await axios.post(
      //       // _relations=products
      //       'https://204ed3432b06d7af.mokky.dev/carts',
      //       {
               
      //         product_Id: this.product.id,
      //         product_Name: this.product.name,
      //         product_Price: this.product.price,
      //         product_Image: this.activeImage,
      //         quantity: this.quantity,
      //         size: this.selectedSize,
      //         color: this.selectedColor,
      //       },
      //       { headers: { Authorization: `Bearer ${token}` } }
      //     );
      //     alert('已加入購物車！');
      //   } catch (error) {
      //     console.error('加入購物車失敗', error);
      //   }
      // },
      //商品加入購物車功能
      // async addItemToCart() { 
      //   const token = this.authStore.token;
        
      //   // 🔹 檢查是否已登入
      //   if (!token) {
      //     alert('請登入以將商品加入購物車！');
      //     this.$router.push('/login');
      //     return;
      //   }

      //   // 🔹 檢查是否選擇了尺寸和顏色
      //   if (!this.selectedSize || !this.selectedColor) {
      //     alert('請選擇尺寸和顏色');
      //     return;
      //   }

        
      //   try {
      //     await axios.post(
      //       'https://204ed3432b06d7af.mokky.dev/carts',
      //       {
      //         product_Id: this.product.id,
      //         Name: this.product.name,
      //         Price: this.product.price || 0,//不要空值是null
      //         Image: this.activeImage,
      //         quantity: this.quantity,
      //         size: this.selectedSize,
      //         color: this.selectedColor,
      //       },
      //       { headers: { Authorization: `Bearer ${token}` } }
      //     );
         

      //     // 🔹 加入購物車成功後，同步更新 Pinia cartStore
      //     this.cartStore.addItemToCart(this.product, this.selectedSize, this.selectedColor, this.quantity);

      //     alert('已加入購物車！');
      //   } catch (error) {
      //     console.error('加入購物車失敗', error);
      //   }
      // },
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

      // { useWishlistStore }
      toggleWishlist() {
        this.wishlistStore.toggleWishlist(this.product);
      },
     
      
     
    },
    mounted() {
      const productId = this.$route.params.id;// 從路由參數中獲取商品 ID
      this.productDetails(productId);// 加載商品詳細資料
      this.wishlistStore.getWishlist(); // 初始化時獲取追蹤清單
      // this.setSelectedSize();
    },

   
  }
  </script>
  
  