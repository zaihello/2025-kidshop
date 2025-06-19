<script>
  import { useAuthStore } from '../stores/authStore'
  import { useCartStore } from '../stores/cartStore'
  import { useProductStore } from '../stores/productStore'
  // import { useAdminProductStore } from '../stores/adminProductStore'

export default{
    props: {
        product: Object,// 個別商品資料
    },
    data(){
        return{
            quantity: 1, // 商品數量
            selectedSize: null, //使用者選擇的尺寸（對應 product.variants.size）
            selectedColor: null, //使用者選擇的顏色（對應 product.colors.color）
            selectedVariant: null,//使用者根據選擇的 color 和 size 所對應的 variant 物件。
            activeImage: '', // 當前顯示的主圖片
            activeImageIndex: 0, // 當前主圖片的索引 山
            allImages: [],// /product api 的imgurl + colors.imageurl

        }
    },
    computed:{
      // 動態獲取 store 實例
      authStore(){
        return useAuthStore()
      },
      cartStore(){
        return useCartStore()
      },
      productStore(){
        return useProductStore()
      },
      // adminProductStore(){
      //   return useAdminProductStore()
      // },
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
    methods:{
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
      const index = this.allImages.indexOf(this.activeImage);
      const prevIndex = (index - 1 + this.allImages.length) % this.allImages.length;
      this.activeImage = this.allImages[prevIndex];
    },
      //下一頁 
    nextImage() {
      const index = this.allImages.indexOf(this.activeImage);
      const nextIndex = (index + 1) % this.allImages.length;
      this.activeImage = this.allImages[nextIndex];
    },        
        //
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
    },

    watch: {
        //解決主圖 imgurl沒出現問題
        product: {
            immediate: true,
            handler(newProduct) {
                if (newProduct) {
                const images = [];

                // 主圖 imgurl
                if (newProduct.imgurl) {
                    images.push(newProduct.imgurl);
                }

                // colors 裡的 imageurl
                if (newProduct.colors && newProduct.colors.length) {
                    newProduct.colors.forEach(color => {
                    if (color.imageurl) {
                        images.push(color.imageurl);
                    }
                    });
                }

                this.allImages = images;
                this.activeImage = images.length > 0 ? images[0] : '';
                }
            }
        },
    },
    //禁止視窗打開背景滾動
    mounted() {
      document.body.classList.add('overflow-hidden');
    },
    //禁止視窗打開背景滾動
    beforeUnmount() {
      document.body.classList.remove('overflow-hidden');
    }
}    
</script>
<template>
    <div v-if="product" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
       
      <!-- Modal content --><!-- 超過h-[600px] 自己可以滑動 overflow-y-auto -->
      <div class="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl relative p-6 overflow-y-auto max-h-[90vh]">
       
        <button @click="$emit('close')" class="absolute top-2 right-1 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 text-3xl rounded-full hover:bg-gray-200 transition z-20 ">&times;</button>
  
        <!-- Modal Body -->
        <div class="flex flex-col gap-8 mt-5">
          <!-- Image Section  -->
          <div class="w-full ">
            <div class="relative border rounded overflow-hidden">
              <button 
               
                @click="prevImage"
                class="absolute left-2 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center transform -translate-y-1/2 top-1/2 shadow hover:bg-gray-400 transition z-10">
                ‹
              </button>
              <img :src="activeImage" class="w-full h-64 object-cover object-center" alt="Main Product Image">
              <button 
                
                @click="nextImage"
                class="absolute right-2 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center transform -translate-y-1/2 top-1/2 shadow hover:bg-gray-400 transition z-10">
                ›
              </button>
            </div>
          </div>
  
          <!-- Product Info Section -->
          <div class="w-full flex flex-col justify-between">
            <div>
              <h1 class="text-xl font-semibold">{{ product.name }}</h1>
  
              <div class="flex items-center space-x-4 mt-2">
                <span v-if="product.OriginalPrice" class="text-gray-400" :class="{'line-through': product.price}">
                  原價: ${{ product.OriginalPrice }}
                </span>
                <span v-if="product.price" class="text-xl font-bold text-blue-500">
                  特價: ${{ product.price }}
                </span>
              </div>
  
              <!-- Size -->
              <div class="mt-4">
                <label class="block font-medium text-gray-700 mb-1">尺寸</label>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="(size, index) in sizeOptions"
                    :key="index"
                    class="px-4 py-2 rounded-lg font-medium transition-all duration-300"
                    :class="[
                      !selectedColor ? 'bg-orange-500 text-white' : '',
                      selectedSize === size ? 'ring-2 ring-black' : '',
                      selectedColor && isOutOfStock(selectedColor, size)
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    ]"
                    @click="selectSize(size)"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>
  
              <!-- Color -->
              <div class="mt-4">
                <label class="block font-medium text-gray-700 mb-1">顏色</label>
                <div class="flex flex-wrap gap-3 mt-2">
                  <button 
                    v-for="(color, index) in availableColors"
                    :key="index"
                    :class="[
                      productStore.colorsTailwindcss[color] || 'bg-gray-200',
                      selectedColor === color ? 'ring-2 ring-black' : 'ring-2 ring-transparent'
                    ]"
                    class="w-8 h-8 rounded-full cursor-pointer transition-all duration-200 shadow hover:shadow-lg"
                    @click="selectColor(color)"
                  ></button>
                </div>
              </div>
            </div>
  
            <!-- Quantity and Add to Cart -->
            <div class="mt-6 flex flex-col gap-4">
              <!-- Quantity Control -->
              <div class="flex items-center space-x-4 border p-2 rounded-lg w-fit"
                :class="(selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)) ? 'bg-gray-300 cursor-not-allowed' : 'bg-white'">
                <button
                  @click="decrementQuantity"
                  class="p-2 border rounded text-gray-600"
                  :disabled="quantity <= 1 || (selectedSize && isOutOfStock(selectedColor, selectedSize))"
                >-</button>
                <span>{{ quantity }}</span>
                <button
                  @click="incrementQuantity"
                  class="p-2 border rounded text-gray-600"
                  :disabled="selectedColor && selectedSize && (isOutOfStock(selectedColor, selectedSize) || (selectedVariant && quantity >= selectedVariant.count))"
                >+</button>
              </div>
  
              <!-- Add to Cart Button -->
              <button 
                class="w-full py-3 rounded-lg font-semibold transition-all duration-300"
                :class="(selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)) 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'"
                :disabled="selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)"
                @click="addItemToCart"
              >
                <span v-if="selectedColor && selectedSize && isOutOfStock(selectedColor, selectedSize)">商品已售完</span>
                <span v-else>加入購物車</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
  