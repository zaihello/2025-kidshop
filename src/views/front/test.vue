<template>
    <!--  -->
    <div class="space-y-4">
      <button @click="toggleAddVariant" class="bg-blue-500 text-white px-4 py-2 rounded">
        {{ isAddingVariant ? '收起變體' : '新增變體' }}
      </button>
  
      <div v-if="isAddingVariant" class="border p-4 mt-2">
        <div class="flex flex-col gap-2">
          <label for="">顏色:</label>  
          <input type="text" v-model="newVariant.color" placeholder="顏色" class="border p-2">
          <label for="">尺寸:</label>
          <input type="text" v-model="newVariant.size" placeholder="尺寸" class="border p-2">
          <button @click="addVariant" class="bg-green-500 text-white px-2 py-1 rounded">確認新增</button>
        </div>
      </div>
  
      <div v-for="(variants, color) in groupedVariants" :key="color" class="border rounded-lg">
        <!-- 顏色區塊 -->
        <div @click="toggleColor(color)" class="p-4 bg-gray-200 cursor-pointer">
          <h2 class="text-xl font-bold">{{ color }}</h2>
        </div>
  
        <!-- 尺寸區塊 -->
        <div v-if="openColors.includes(color)" class="p-4 bg-gray-100">
          <div v-for="(variant, index) in variants" :key="variant.id" class="p-2 border-b">
            <div @click="toggleSize(variant.id)" class="cursor-pointer flex justify-between items-center">
              <span>{{ variant.size }}</span>
              <button class="bg-red-500 text-white px-2 py-1 rounded" @click.stop="removeVariant(variant.id)">刪除</button>
            </div>
  
            <!-- 展開編輯框 -->
            <div v-if="openSizes.includes(variant.id)" class="mt-2 p-2 bg-white">
              <label for="">庫存數量:</label>
              <input type="number" v-model="variant.count" placeholder="庫存數量" class="border p-2 w-full">
              <label for="">銷售數量:</label>
              <input type="number" v-model="variant.sellCount" placeholder="銷售數量" class="border p-2 w-full">
              <label for="">上架日期:</label>
              <input type="date" v-model="variant.startDate" class="border p-2 w-full">
              <label for="">下架日期:</label>
              <input type="date" v-model="variant.endDate" class="border p-2 w-full">
              <label>
                <input type="checkbox" v-model="variant.is_enabled"> 啟用
              </label>

              <!-- 圖片輸入 (最多 3 張) 2-->
              <div class="flex flex-col gap-2">
                <div v-for="(image, imgIndex) in variant.images" :key="imgIndex" class="flex relative w-fit">
                  <img :src="image" alt="變體圖片" class="w-16 h-16 object-cover border">
                  <button @click="removeImage(variant, imgIndex)" class="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">X</button>
                </div>

                <input v-if="variant.images.length < 3" type="text" v-model="variant.newImage" placeholder="輸入圖片網址" class="border p-2">
                <button v-if="variant.images.length < 3" @click="addImage(variant)" class="bg-blue-500 text-white px-2 py-1 rounded">
                  新增圖片
                </button>
                <p v-if="variant.images.length >= 3" class="text-red-500 text-sm">最多只能新增 3 張圖片</p>
              </div>

              <div class="flex gap-2 mt-2">
                <button @click="saveVariant(variant)" class="bg-green-500 text-white px-2 py-1 rounded">確認</button>
                <button @click="toggleSize(variant.id)" class="bg-gray-500 text-white px-2 py-1 rounded">取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  <!-- 3/26 -->
  <div>
    <!-- 顏色選擇 -->
    <div >
      <label class="block font-medium text-gray-700">顏色:</label>
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="(color, index) in availableColors" 
          :key="index" 
          class="px-4 py-2 font-medium rounded-lg shadow-md transition-all duration-300"
          :class="[selectedColor === color ? 'ring-2 ring-black' : 'ring-2 ring-transparent', 'bg-gray-200']"
          @click="selectColor(color)"
        >
          {{ color }}
        </button>
      </div>
     
    </div>

    <!-- 尺寸選擇 -->
    <div>
      <label class="block font-medium text-gray-700 mt-4">尺寸:</label>
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="(size, index) in sizeOptions" 
          :key="index"
          class="px-4 py-2 font-medium rounded-lg shadow-md transition-all duration-300"
          :class="[
            selectedSize === size ? 'ring-2 ring-black' : 'ring-2 ring-transparent',
            isOutOfStock(selectedColor, size) ? 'bg-gray-300 text-gray-500' : 'bg-orange-500 hover:bg-orange-600 text-white'
          ]"
          @click="selectSize(size)"
        >
          {{ size }}
        </button>
      </div>
     
    </div>

    <!-- 數量控制 -->
 
    <div>
      <div class="mt-4 flex items-center space-x-4 p-2 border rounded-lg w-fit"
           :class="isOutOfStock(selectedColor, selectedSize) ? 'bg-gray-300 cursor-not-allowed' : 'bg-white'">
        <button @click="decrementQuantity" class="p-2 border rounded text-gray-600"
                :disabled="quantity <= 1 || isOutOfStock(selectedColor, selectedSize)">-</button>
        <span>{{ quantity }}</span>
        <button @click="incrementQuantity" class="p-2 border rounded text-gray-600"
                :disabled="quantity >= maxStock || isOutOfStock(selectedColor, selectedSize)">+</button>
      </div>
    </div>

    <!-- 加入購物車按鈕 -->
    <button 
      class="mt-4 px-4 py-2 font-medium rounded-lg transition-all duration-300 w-full"
      :class="isOutOfStock(selectedColor, selectedSize) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'"
      :disabled="isOutOfStock(selectedColor, selectedSize)"
    >
      <span v-if="isOutOfStock(selectedColor, selectedSize)">商品已售完</span>
      <span v-else @click="addItemToCart">加入購物車</span>
     
    </button>
  </div>

</template>
  
  <script>
  import { useAdminProductStore } from '../../stores/adminProductStore'
  export default {
    data() {
      return {
        //
        isAddingVariant: false,
        newVariant: { color: "", size: "" },//, stock: 0
        openColors: [], // 存放展開的顏色
        openSizes: [], // 存放展開的尺寸
        variants: [
          { id: 1, color: "紅色", size: "S", count: 10, sellCount: 5, startDate: "", endDate: "", is_enabled: true,images: [], newImage: "" },
          { id: 2, color: "紅色", size: "M", count: 8, sellCount: 2, startDate: "", endDate: "", is_enabled: false,images: [], newImage: "" },
          { id: 3, color: "藍色", size: "L", count: 12, sellCount: 7, startDate: "", endDate: "", is_enabled: true,images: [], newImage: ""},
        ],
        tempProduct:this.getTempProduct(),// 重置資料 儲存api產品資料

        //3/26
      //   selectedColor: '黃色',//使用者選擇的顏色（對應 product.colors.color）
      // selectedSize: null,//使用者選擇的尺寸（對應 product.variants.size）
      quantity: 1,
      stockData: {
        黃色: { S: 0, M: 0, L: 5, XL: 8 },  // S, M 缺貨
        藍色: { S: 10, M: 12, L: 0, XL: 0 }, // L, XL 缺貨
      },
      sizeOptions: ['S', 'M', 'L', 'XL'],
      //327
      selectedColor: '黃色',//使用者選擇的顏色（對應 product.colors.color）
      selectedSize: null,//使用者選擇的尺寸（對應 product.variants.size）
      selectedVariant: null,//使用者根據選擇的 color 和 size 所對應的 variant 物件。
      //3/27
    //   product: {
    //   id: 30,
    //   category: "玩具",
    //   category_id: 3,
    //   name: "1213玩具",
    //   price: 477,
    //   OriginalPrice: 530,
    //   mark: ["HOT", "NEW", "-10%"],
    //   is_enabled: true,
    //   description: "",
    //   imgurl: "https://woodmart.xtemos.com/kids/wp-content/uploads/sites/13/2023/05/w-bcs-toys-1-1.jpg",
    //   owner: "管理員",
    //   updatedAt: "2025-03-26 21:06",
    //   is_expired: "",
    //   startDate: "",
    //   endDate: "",
    //   variants: [
    //     { id: 3058, color: "Blue", size: "0 - 3 Months", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //     { id: 3045, color: "Blue", size: "6 - 12 Months", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //     { id: 3078, color: "Blue", size: "F", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //     { id: 3040, color: "Brown", size: "6 - 12 Months", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //     { id: 3048, color: "Brown", size: "F", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //     { id: 3054, color: "Green", size: "6 - 12 Months", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //     { id: 3079, color: "Green", size: "F", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //     { id: 3060, color: "Pink", size: "F", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //     { id: 3065, color: "Yellow", size: "6 - 12 Months", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //     { id: 3029, color: "Yellow", size: "F", count: 0, sellCount: 0, is_enabled: true, newImage: "" },
    //   ],
    //   colors: [
    //     { color: "Blue", imageurl: "https://woodmart.xtemos.com/kids/wp-content/uploads/sites/13/2023/05/w-bcs-accessories-3-2.jpg", newImage: "" },
    //     { color: "Brown", imageurl: "https://woodmart.xtemos.com/kids/wp-content/uploads/sites/13/2023/05/w-bcs-growsuit-12-1.jpg", newImage: "" },
    //     { color: "Green", imageurl: "https://woodmart.xtemos.com/kids/wp-content/uploads/sites/13/2023/05/w-bcs-accessories-12-1.jpg", newImage: "" },
    //     { color: "Yellow", imageurl: "", newImage: "" },
    //   ]
    // },
    // selectedColor: "",
    // selectedSize: ""
    
      };
    },
    computed: {
        adminProductStore(){
            return useAdminProductStore()
        },
      groupedVariants() {
        return this.variants.reduce((acc, variant) => {
          if (!acc[variant.color]) acc[variant.color] = [];
          acc[variant.color].push(variant);
          return acc;
        }, {});
      },
      //3/26
      availableColors() {
      return Object.keys(this.stockData);
    },
    maxStock() {
      return this.selectedSize ? this.stockData[this.selectedColor][this.selectedSize] : 0;
    },
    //當用戶選擇某個 color 後，availableSizes 會顯示該顏色的可選 size。327
  //   availableSizes() {
  //   if (!this.selectedColor) return [];
  //   return this.product.variants
  //     .filter(variant => variant.color === this.selectedColor && variant.is_enabled)
  //     .map(variant => variant.size);
  // }
     
    },
    methods: {
      //stor  
      toggleAddVariant() {
        this.isAddingVariant = !this.isAddingVariant;
      },
      //store
      toggleColor(color) {
        const index = this.openColors.indexOf(color);
        if (index > -1) {
          this.openColors.splice(index, 1);
        } else {
          this.openColors.push(color);
        }
      },
      //store
      toggleSize(id) {
        const index = this.openSizes.indexOf(id);
        if (index > -1) {
          this.openSizes.splice(index, 1);
        } else {
          this.openSizes.push(id);
        }
      },
      //store
      addVariant() {
        const newId = this.variants.length + 1;
        this.variants.push({ id: newId, ...this.newVariant, images: [] });
        this.newVariant = { color: "", size: "", count: 0, images: [], newImage: "" };
      },
      //store
      removeVariant(id) {
        this.variants = this.variants.filter(variant => variant.id !== id);
      },
      //store
      //更新變體資料，但不發送 API
      saveVariant(updatedVariant) {
        const index = this.tempProduct.variants.findIndex(v => v.id === updatedVariant.id);
        if (index > -1) {
            // 找到對應的變體，更新它
            this.tempProduct.variants[index] = { ...updatedVariant };
        }else{
             // 如果找不到，可能是新變體，則加入陣列
            this.tempProduct.variants.push(updatedVariant);
        }
        this.toggleSize(updatedVariant.id);// 這行應該是切換 UI 展開狀態
      },
      //store
      //提交整個商品（包含變體）到 API
      async saveProduct() {
        //tempProduct格式改為formatProductData格式
        const formattedData = this.formatProductData(this.tempProduct);

        try {
        const response = await axios.post("https://204ed3432b06d7af.mokky.dev/product", formattedData); // 或 `put` 來更新
         console.log("成功送出:", response.data);
      
        // 送出成功後，重置 tempProduct
        this.tempProduct = this.getTempProduct();
        } catch (error) {
        console.error("送出錯誤:", error);
        }
      },
      //store
      addImage(variant) {
        if (variant.newImage.trim() !== "" && variant.images.length < 3) {
            variant.images.push(variant.newImage.trim());
            variant.newImage = "";
        }
      },
      //store
      removeImage(variant, imgIndex) {
        variant.images.splice(imgIndex, 1);
      },
      //store
      //送出資料格式化以符合 API 需求
      formatProductData(product) {
        return {
            id: product.id || null,
            category: product.category,
            category_id: product.category_id,
            name: product.name,
            price: product.price || null,
            OriginalPrice: product.OriginalPrice,
            imgurl: product.imgurl,
            description: product.description,
            is_enabled: product.is_enabled,
            owner: "管理員", // 假設 owner 是固定的
            updatedAt: new Date().toISOString().split("T")[0], // 取當前日期
            startDate: product.startDate,
            endDate: product.endDate,
            is_expired: product.is_expired || "",
            variants: product.variants.map(variant => ({
                id: variant.id || null,
                size: variant.size,
                color: variant.color,
                mark: variant.mark ? [variant.mark] : [],
                price: variant.price || null,
                OriginalPrice: variant.OriginalPrice || null,
                imagesurl: variant.imagesurl || [], // 確保是陣列
                count: variant.count, 
                sellCount: variant.sellCount, 
                is_enabled: variant.is_enabled
            }))
        };
      },  
      // store
      //tempProduct的初始值
      getTempProduct() {
            return {
                id: null,
                category: "",
                category_id: null,
                name: "",
                price: null,
                OriginalPrice: null,
                imgurl: "",
                description: "",
                is_enabled: true,
                owner: "管理員",
                updatedAt: "",
                startDate: "",
                endDate: "",
                is_expired: "",
                variants: [],
            };
      },
      //3/26
    //   selectColor(color) {
    //   this.selectedColor = color;
    //   this.selectedSize = null; // 選擇新顏色時重置尺寸
    // },
    // selectSize(size) {
    //   this.selectedSize = size; // 允許選擇缺貨尺寸
    //   this.quantity = 1; // 選擇新尺寸時重置數量
    // },
    isOutOfStock(color, size) {
      return this.stockData[color]?.[size] === 0;
    },
    incrementQuantity() {
      if (this.quantity < this.maxStock) {
        this.quantity++;
      }
    },
    decrementQuantity() {
      if (this.quantity > 1) {
        this.quantity--;
      }
    },
    addItemToCart() {
      if (!this.isOutOfStock(this.selectedColor, this.selectedSize)) {
        alert(`加入購物車：顏色：${this.selectedColor}，尺寸：${this.selectedSize}，數量：${this.quantity}`);
      }
    },
    //3/27
    selectColor(color) {
      this.selectedColor = color;
      this.updateVariants();
    },
    selectSize(size) {
      this.selectedSize = size;
          this.selectedVariant = this.adminProductStore.tempProduct.variants.find(
        (variant) => variant.color === this.selectedColor && variant.size === this.selectedSize
      );
    },

    updateVariants() {
      const availableSizes = this.adminProductStore.tempProduct.variants
        .filter((variant) => variant.color === this.selectedColor)
        .map((variant) => variant.size);
      this.selectSize(this.selectedSize);
    },

     
    },
  };
  </script>
  <style scoped>
  button:disabled {
    opacity: 0.6;
  }
  </style>
  