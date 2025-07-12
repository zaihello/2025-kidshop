<script>
import {useAdminProductStore} from '../stores/adminProductStore'
import { useAdminAuthStore } from '../stores/adminAuthStore'


export default{
    data(){
        return{
            newCoverImageUrl: '', // 商品封面圖片的輸入框
        }
    },
    computed:{
        adminProductStore(){
            return useAdminProductStore()
        },
        adminAuthStore(){
          return useAdminAuthStore()
        },
        // 將 tempProduct 的 category 屬性作為 computed，實現雙向綁定
        selectedCategorys:{
            get(){
                return this.adminProductStore.tempProduct.category
            },
            set(value){
                this.adminProductStore.tempProduct.category = value
            }
        },
         // 將 tempProduct 的 mark 屬性作為 computed，實現雙向綁定
        selectedMarks: {
            get() {
                return this.adminProductStore.tempProduct.mark;
            },
            set(value) {
                this.adminProductStore.tempProduct.mark = value;
            }
        },
        // 將 tempProduct 的 color 屬性作為 computed，實現雙向綁定
        selectedColors:{
            get(){
                return this.adminProductStore.tempProduct.variants.color
            },
            set(value){
                this.adminProductStore.tempProduct.variants.color = value
            }
        },
         // 將 tempProduct 的 size 屬性作為 computed，實現雙向綁定
         selectedSizes:{
            get(){
                return this.adminProductStore.tempProduct.variants.size
            },
            set(value){
                this.adminProductStore.tempProduct.variants.size = value
            }
        },
    },
    methods:{
        // 增加商品封面圖片
        addCoverImage() {
            if (this.newCoverImageUrl.trim() !== '') {
                this.adminProductStore.tempProduct.imgurl = this.newCoverImageUrl.trim();
                this.newCoverImageUrl = '';// 清空輸入框
            }
        },
        // 刪除商品封面圖片
        removeCoverImage() {
            this.adminProductStore.tempProduct.imgurl = '';// 清空圖片連結
        },
        //Category按鈕切換
        toggleCategory(category) {
            // 若當前選擇的分類與點擊的相同，則清空，否則設置為該分類
            this.selectedCategorys = this.selectedCategorys === category ? '' : category;
        },
         //Mark按鈕切換
        toggleMark(mark) {
            // 複選功能
            const index = this.selectedMarks.indexOf(mark);
            if (index > -1) {
                this.selectedMarks.splice(index, 1);
            } else {
                this.selectedMarks.push(mark);
            }
        },
         //上架日期不能選擇今天 以前 的日期
         getToday() {
            const today = new Date();
            today.setHours(today.getHours() + 8); // 調整為台灣時間
            return today.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
        },
        //編輯、新增、刪除確認按鈕(使用async await 是要確保資料更新完成後才關閉 Modal)
        async handleConfirm() {
           
           const { modalType, tempProduct } = this.adminProductStore;

           // 類別對應的 category_id 應該放到toggleAddVariant裡
           const categoryMap = {
               '緊身衣': 1,
               '毛衣': 2,
               '玩具': 3,
               '配件': 4,
               '洋裝': 5,
               '緊身褲': 6
           };
           // **確保 category_id 正確**
           tempProduct.category_id = categoryMap[tempProduct.category];

           if (modalType === 'new') {
           
               tempProduct.owner = this.adminAuthStore.adminName; // 確保新增時設置管理員名稱(自動更新)
            if (!tempProduct.variants || tempProduct.variants.length === 0) {
                alert("請輸入變體");
                return;
            }
                await this.adminProductStore.updateProduct(tempProduct);
           }
           if (modalType === 'edit') {
               tempProduct.owner = this.adminAuthStore.adminName; // 編輯時變更為當前管理員
               await this.adminProductStore.updateProduct(tempProduct); // **等候 API 更新**
           }
           if (modalType === 'delete') {
               await this.adminProductStore.deleteProduct(tempProduct.id);// **等候刪除**
           }
           this.adminProductStore.closeModal();
        },
         //Color按鈕切換(改變按鈕顏色)
        toggleSelectedColor(color) {
            this.selectedColors = this.selectedColors === color ? '' : color;// 切換選中的顏色
            this.adminProductStore.newVariant.color = this.selectedColors; // 確保 newVariant 也更新

            // 檢查該顏色是否已存在於 colors 陣列
            const existingColor = this.adminProductStore.tempProduct.colors.find((c) => c.color === color);

            if (!existingColor) {
            // 若顏色不存在，則新增一個空白物件，確保畫面即時顯示 沒有傳送到api
            this.adminProductStore.tempProduct.colors.push({
                color: color,
                newImage: "",
                imageurl: ""
            });
            }
        },
         //Size按鈕切換(改變按鈕顏色)
        toggleSelectedSize(size) {
            this.selectedSizes = this.selectedSizes === size ? '' : size;
            this.adminProductStore.newVariant.size = this.selectedSizes; // 確保 newVariant 也更新
        },
        //加入變體顏色圖片
        addColorImage(index) {
            const colorObj = this.adminProductStore.tempProduct.colors[index];
            if (colorObj.newImage.trim() !== "") {
                // 更新 imageurl 並清空 newImage
                this.adminProductStore.tempProduct.colors[index] = {
                ...colorObj,
                imageurl: colorObj.newImage,
                newImage: "",
                };
            }
        },
        //移除變體顏色圖片
        removeColorImage(index) {
            this.adminProductStore.tempProduct.colors[index].imageurl = "";
        },
         //顏色標題區塊api要有該顏色的尺寸物件才會顯示326
        hasColorInVariants(color) {
            return this.adminProductStore.tempProduct.variants.some(variant => variant.color ===  color);
        },
         //color控制區塊展開（展開/折疊」該顏色的變體資訊。）
        toggleOpenColor(color) {
            const index = this.adminProductStore.openColors.indexOf(color);
            if (index > -1) {
                // 如果 `color` 已經存在，就移除（折疊）
                this.adminProductStore.openColors.splice(index, 1);
            } else {
                // 否則加入（展開）
                this.adminProductStore.openColors.push(color);
            }
        },
        //刪除該顏色和該顏色所有變題
        removeColor(color) {
            // 刪除 colors 陣列中的該 color
            this.adminProductStore.tempProduct.colors = this.adminProductStore.tempProduct.colors.filter(c => c.color !== color);
            // 刪除 variants 陣列中該 color 的所有變體
            this.adminProductStore.tempProduct.variants = this.adminProductStore.tempProduct.variants.filter(v => v.color !== color);
        },
        //size控制區塊展開（展開/折疊」該size的變體資訊。）
        toggleOpenSize(size) {
            const index = this.adminProductStore.openSizes.indexOf(size);
            if (index > -1) {
                this.adminProductStore.openSizes.splice(index, 1);
            } else {
                this.adminProductStore.openSizes.push(size);
            }
        },
    },
}
</script>
<template>
<div
    v-if="adminProductStore.showProductModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 "
>
    <div class="w-11/12 max-w-5xl  rounded-lg bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="flex items-center justify-between bg-blue-600 px-6 py-4 text-white">
          <h2 class="text-xl font-semibold">
            {{ adminProductStore.modalType === 'new' ? '新增產品' : '編輯產品' }}
          </h2>
          <button @click="adminProductStore.closeModal" class="text-white hover:text-gray-200">
            &times;
          </button>
        </div>
  
        <!-- Body -->
        <div class="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
          <!-- Left: 圖片區 -->
          <div class="space-y-4">
            <label class="block font-medium text-gray-700">商品封面</label>
            <div class="flex space-x-2">
              <input
                v-model="newCoverImageUrl"
                type="text"
                placeholder="請輸入圖片連結"
                class="w-full rounded border px-3 py-2"
              />
              <button
                @click="addCoverImage"
                class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                新增圖片
              </button>
            </div>
            <div v-if="adminProductStore.tempProduct.imgurl" class="space-y-2">
              <input
                v-model="adminProductStore.tempProduct.imgurl"
                type="text"
                class="w-full rounded border px-3 py-2"
                placeholder="請輸入圖片連結"
              />
              <div class="flex items-center justify-between">
                <img
                  :src="adminProductStore.tempProduct.imgurl"
                  alt="商品封面"
                  class="h-32 w-32 rounded object-cover"
                />
                <button
                  @click="removeCoverImage"
                  class="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
  
          <!-- Right: 詳細資料 -->
          <div class="space-y-4">
            <div>
              <label class="block font-medium text-gray-700">商品名稱</label>
              <input
                v-model="adminProductStore.tempProduct.name"
                type="text"
                class="w-full rounded border px-3 py-2"
                placeholder="請輸入商品名稱"
              />
            </div>
  
            <div>
              <label class="block font-medium text-gray-700">分類</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="category in adminProductStore.categoryOptions"
                  :key="category"
                  @click="toggleCategory(category)"
                  :class="[
                    'rounded px-3 py-1',
                    selectedCategorys === category
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700',
                  ]"
                >
                  {{ category }}
                </button>
              </div>
            </div>
  
            <div>
              <label class="block font-medium text-gray-700">售價</label>
              <input
                v-model.number="adminProductStore.tempProduct.price"
                type="number"
                min="0"
                class="w-full rounded border px-3 py-2"
                placeholder="請輸入售價"
              />
            </div>
  
            <div>
              <label class="block font-medium text-gray-700">折扣 (%)</label>
              <input
                v-model.number="adminProductStore.discountInput"
                @input="adminProductStore.handleDiscountChange"
                type="number"
                min="0"
                max="100"
                class="w-full rounded border px-3 py-2"
                placeholder="輸入折扣 (例如 30=7折)"
              />
            </div>
  
            <div>
              <label class="block font-medium text-gray-700">原價</label>
              <input
                v-model.number="adminProductStore.tempProduct.OriginalPrice"
                @input="adminProductStore.calculateDiscountedPrice"
                type="number"
                min="0"
                class="w-full rounded border px-3 py-2"
                placeholder="請輸入原價"
              />
            </div>
  
            <div>
              <label class="block font-medium text-gray-700">標籤</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="mark in adminProductStore.markOptions"
                  :key="mark"
                  @click="toggleMark(mark)"
                  :class="[
                    'rounded px-3 py-1',
                    selectedMarks.includes(mark)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700',
                  ]"
                >
                  {{ mark }}
                </button>
              </div>
            </div>
  
            <div>
              <label class="block font-medium text-gray-700">商品描述</label>
              <textarea
                v-model="adminProductStore.tempProduct.description"
                class="w-full rounded border px-3 py-2"
                rows="4"
                placeholder="請輸入商品描述"
              ></textarea>
            </div>
  
            <div class="flex flex-col gap-4 md:flex-row">
              <div class="flex-1">
                <label class="block font-medium text-gray-700">上架日期</label>
                <input
                  v-model="adminProductStore.tempProduct.startDate"
                  type="date"
                  :min="getToday()"
                  :max="adminProductStore.tempProduct.endDate"
                  class="w-full rounded border px-3 py-2"
                  required
                />
              </div>
              <div class="flex-1">
                <label class="block font-medium text-gray-700">下架日期</label>
                <input
                  v-model="adminProductStore.tempProduct.endDate"
                  type="date"
                  :min="adminProductStore.tempProduct.startDate"
                  class="w-full rounded border px-3 py-2"
                  required
                />
              </div>
            </div>
  
            <div class="flex items-center space-x-2">
              <input
                v-model="adminProductStore.tempProduct.is_enabled"
                type="checkbox"
                class="h-4 w-4"
              />
              <label class="text-gray-700">是否啟用</label>
            </div>
  
            <div>
              <label class="block font-medium text-gray-700">管理員</label>
              <input
                v-model="adminProductStore.tempProduct.owner"
                type="text"
                class="w-full rounded border px-3 py-2"
                placeholder="請輸入管理員名稱"
                disabled
              />
            </div>
  
            <div>
              <label class="block font-medium text-gray-700">更新時間</label>
              <!-- readonly -->
              <input
                v-model="adminProductStore.tempProduct.updatedAt"
                type="text"
                class="w-full rounded border bg-gray-100 px-3 py-2"
                disabled
              />
            </div>
          </div>
        </div>

       
        <!--變體 外層容器，限制高度並加上滾動 -->
        <div class="max-h-[80vh] overflow-y-auto p-6 space-y-6 bg-white rounded-lg shadow-lg">
            <!-- 新增變體按鈕 -->
            <div class="space-y-4">
            <button
                @click="adminProductStore.toggleAddVariant()"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-150"
            >
                {{ adminProductStore.isAddingVariant ? '收起變體' : '新增變體' }}
            </button>

            <!-- 展開變體編輯表單 -->
            <div v-if="adminProductStore.isAddingVariant" class="border p-4 rounded-lg space-y-4 bg-gray-50">
                <!-- 選擇顏色 -->
                <div>
                    <label class="font-semibold block mb-1">顏色:</label>
                    <div class="flex flex-wrap gap-2">
                        <button
                        v-for="color in adminProductStore.colorOptions"
                        :key="color"
                        @click="toggleSelectedColor(color)"
                        :class="[
                            'px-3 py-1 rounded border cursor-pointer transition duration-150',
                            selectedColors === color ? 'bg-blue-400 text-white' : 'bg-gray-200 hover:bg-gray-300'
                        ]"
                        >
                        {{ color }}
                        </button>
                    </div>
                </div>

                <!-- 選擇尺寸 -->
                <div>
                 
                    <label class="font-semibold block mb-1">尺寸:</label>
                    <div class="flex flex-wrap gap-2">
                        <button
                        v-for="size in adminProductStore.sizeOptions"
                        :key="size"
                        @click="toggleSelectedSize(size)"
                        :class="[
                            'px-3 py-1 rounded border cursor-pointer transition duration-150',
                            selectedSizes === size ? 'bg-green-400 text-white' : 'bg-gray-200 hover:bg-gray-300'
                        ]"
                        >
                        {{ size }}
                        </button>
                    </div>
                </div>

                <!-- 圖片上傳 -->
                <div
                    v-for="(colorObj, index) in adminProductStore.tempProduct.colors"
                    :key="index"
                    v-show="selectedColors === colorObj.color"
                    class="p-4 border rounded-lg bg-white w-full max-w-xs"
                >
                    <input
                        v-model="colorObj.newImage"
                        type="text"
                        placeholder="輸入圖片網址"
                        class="border p-2 w-full mb-2 rounded"
                    />
                    <button
                        @click="addColorImage(index)"
                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded w-full transition duration-150"
                    >
                        確認圖片
                    </button>

                    <div v-if="colorObj.imageurl" class="relative mt-4">
                        <img
                        :src="colorObj.imageurl"
                        alt="預覽圖片"
                        class="w-full h-40 object-cover rounded shadow"
                        />
                        <button
                        @click="removeColorImage(index)"
                        class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center     justify-center"
                        >
                        ×
                        </button>
                    </div>
                </div>

                <!-- 新增變體 -->
                <button
                @click="adminProductStore.addVariant"
                class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-150"
                >
                確認新增
                </button>
            </div>
            <!-- 顏色/尺寸 變體清單 -->
            <div v-for="(colorObj, index) in adminProductStore.tempProduct.colors" :key="colorObj.color" class="border rounded-lg overflow-hidden">
                <div
                    v-if="hasColorInVariants(colorObj.color)"
                    @click="toggleOpenColor(colorObj.color)"
                    class="p-4 bg-gray-200 cursor-pointer flex justify-between items-center hover:bg-gray-300 transition"
                    >
                    <h2 class="text-xl font-semibold">{{ colorObj.color }}</h2>
                    <button
                        @click.stop="removeColor(colorObj.color)"
                        class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition"
                    >
                        刪除
                    </button>
                </div>

                <!-- 尺寸變體 -->
                <div v-if="adminProductStore.openColors.includes(colorObj.color)" class="p-4 bg-gray-50 space-y-4">
                    <div
                        v-for="(variant, index) in adminProductStore.tempProduct.variants.filter(v => v.color === colorObj.color)"
                        :key="variant.id"
                        class="p-3 border rounded-lg bg-white shadow"
                    >
                        <div @click="toggleOpenSize(variant.id)" class="cursor-pointer flex justify-between items-center">
                            <span class="font-medium">{{ variant.size }}</span>
                            <button
                                @click.stop="adminProductStore.removeVariant(variant.id)"
                                class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            >
                                刪除
                            </button>
                        </div>

                        <!-- 編輯變體 -->
                        <div v-if="adminProductStore.openSizes.includes(variant.id)" class="mt-3 space-y-3">
                            <div>
                                <label class="block font-medium">庫存數量</label>
                                <input type="number" v-model="variant.count" class="border p-2 w-full rounded">
                            </div>
                            <div>
                                <label class="block font-medium">銷售數量</label>
                                <input type="number" v-model="variant.sellCount" class="border p-2 w-full rounded">
                            </div>
                            <div>
                                <label class="block font-medium">上架日期</label>
                                <input type="date" :min="getToday()" v-model="variant.startDate" class="border p-2 w-full rounded">
                            </div>
                            <div>
                                <label class="block font-medium">下架日期</label>
                                <input type="date" :min="variant.startDate" v-model="variant.endDate" class="border p-2 w-full rounded">
                            </div>
                            <div>
                                <label class="inline-flex items-center gap-2">
                                <input type="checkbox" v-model="variant.is_enabled">
                                啟用
                                </label>
                            </div>
                            <div class="flex gap-2 pt-2">
                                <button @click="adminProductStore.saveVariant(variant)" class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">確認</button>
                                <button @click="adminProductStore.toggleSizePanel(variant.id)" class="bg-gray-400 text-white px-3 py-1 rounded">取消</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="flex justify-end space-x-4 bg-gray-100 px-6 py-4">
          <button
            @click="adminProductStore.closeModal"
            class="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
          >
            取消
          </button>
          <button
            @click="handleConfirm"
            class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            確認
          </button>
        </div>
    </div>
</div>
</template>
  