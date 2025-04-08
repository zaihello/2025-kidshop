<script>
// import Pagination from '../../components/front/shop/Pagination.vue';
import Pagination from '../../../components/front/shop/Pagination.vue'
// import { useAdminProductStore } from '../../stores/adminProductStore'
import { useProductStore } from '../../../stores/productStore'
import { useAdminProductStore } from '../../../stores/adminProductStore' 
import { useAdminAuthStore } from '../../../stores/adminAuthStore'
import axios from 'axios'
export default{
    components:{Pagination},
    data(){
        return{
            newImageUrl: '', // 儲存列表圖片的連結
            newCoverImageUrl: '', // 商品封面圖片的輸入
            //搜尋參數
            searchParams: {
                name: '',
                id: '',
                category: '',
                is_enabled:'',//''value是字串這裡也要字串
                is_expired: '',//'' value是字串這裡也要字串
            },
            currentPage: 1,           // 當前頁碼
            itemsPerPage: 10,         // 每頁顯示的商品數
            // filterProducts: [] // 篩選後的商品儲存
            filteredProductsList: [],// 篩選後的商品儲存
            hasSearched: false, // 是否已執行篩選
            // currentAdminName: "Admin Name", //登入的管理者名稱
            //new
            expandedProduct: null, // 記錄哪個商品被展開(編輯按鈕)
            isAddingVariant: false, // 新增變體按鈕(控制變體輸入區域顯示/隱藏)
  
        }
    },
    computed:{
        //取得 adminProductStore
        adminProductStore(){
            return useAdminProductStore()
        },
        adminAuthStore(){
            return useAdminAuthStore()
        },
        productStore(){
            return useProductStore()
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
        // 將 tempProduct 的 size 屬性作為 computed，實現雙向綁定
        selectedSizes:{
            get(){
                return this.adminProductStore.tempProduct.variants.size
            },
            set(value){
                this.adminProductStore.tempProduct.variants.size = value
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
        // 將 tempProduct 的 mark 屬性作為 computed，實現雙向綁定
        selectedMarks: {
            get() {
                return this.adminProductStore.tempProduct.mark;
            },
            set(value) {
                this.adminProductStore.tempProduct.mark = value;
            }
        },
       
        // 顯示的商品（全部 or 篩選後的結果）
        displayedProducts() {
            // 如果已執行篩選，則顯示 `filteredProductsList`，否則顯示全部商品
            return this.hasSearched ? this.filteredProductsList : this.adminProductStore.adminProducts;
        },
        // 計算當前分頁的產品
        paginatedProducts() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.displayedProducts.slice(start, end);
            // return this.filteredProductsList.slice(start, end); 
        },
        //計算總頁數
        totalPages() {
            return Math.ceil(this.displayedProducts.length / this.itemsPerPage);
            //return Math.ceil(this.filteredProductsList.length / this.itemsPerPage);
 
        },
        //目前登入的管理者是哪位
        currentAdminName() {
            // return this.adminAuthStore.user?.name || "未知管理員";
            return this.adminAuthStore.adminName || "未知管理員";
        },
        //是否有進行篩選(searchParams全部都是'')
        hasFiltered() {
            return Object.values(this.searchParams).some(value => value !== '');
        }
    },
    
    methods:{
        //Size按鈕切換(改變按鈕顏色)
        toggleSelectedSize(size) {
            this.selectedSizes = this.selectedSizes === size ? '' : size;
            this.adminProductStore.newVariant.size = this.selectedSizes; // 確保 newVariant 也更新
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
        //Category按鈕切換
        toggleCategory(category) {
            // 若當前選擇的分類與點擊的相同，則清空，否則設置為該分類
            this.selectedCategorys = this.selectedCategorys === category ? '' : category;
        },
        //切換 上/下架 按鈕
        toggleProductStatus(product) {
            if (!product || !product.id) {
                console.error("❌ 錯誤: 產品資料錯誤:", product);
                return;
            }

            // **切換產品切換 上/下架 按鈕狀態**
            const newStatus = !product.is_enabled;
            product.is_enabled = newStatus;  // 直接用 true/false

            // **同步是否啟用的checkbox tempProduct**
            if (this.adminProductStore.tempProduct && this.adminProductStore.tempProduct.id === product.id) {
                this.adminProductStore.tempProduct.is_enabled = newStatus;
            }

            // **同步後端 API**
            // this.updateProductStatusAPI(product.id, newStatus);
            this.adminProductStore.updateProductStatus(product.id, newStatus)
            // .updateProductExpiration(product.id)//3/30
        },
        //更新後端上/下架狀態
        // updateProductStatusAPI(productId, status) {
        //     //dev/products
        //     const apiUrl = `https://204ed3432b06d7af.mokky.dev/product/${productId}`; // 根據你的 API 設定 URL
        //     axios.patch(apiUrl, { is_enabled: status }) // 直接發送 true/false
        //         .then((res) => {
        //             console.log("✅ 產品狀態更新成功:", res.data);
        //         })
        //         .catch((err) => {
        //             console.error("❌ 更新產品狀態失敗:", err);
        //         });
            
        // },
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
               tempProduct.owner = this.currentAdminName; // 確保新增時設置管理員名稱(自動更新)
            //    this.productStore.addProduct(tempProduct); //  新增到前台
            if (!tempProduct.variants || tempProduct.variants.length === 0) {
                alert("請輸入變體");
                return;
            }
                await this.adminProductStore.updateProduct(tempProduct);
            
           }
           if (modalType === 'edit') {
               tempProduct.owner = this.currentAdminName; // 編輯時變更為當前管理員
               await this.adminProductStore.updateProduct(tempProduct); // **等候 API 更新**
            //    this.productStore.updateProduct(tempProduct); // 編輯時同步前台
           }
           if (modalType === 'delete') {
               await this.adminProductStore.deleteProduct(tempProduct.id);// **等候刪除**
            //    this.productStore.removeProduct(tempProduct.id); // 刪除時同步前台
           }
           this.adminProductStore.closeModal();
       },
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
        // 切換分頁(設定頁碼，確保不超過範圍)
        handlePageChange(newPage) {
            if (newPage < 1) newPage = 1;
            if (newPage > this.totalPages) newPage = this.totalPages;
            this.currentPage = newPage;
        },
        // 搜尋商品按鈕，並重置回第 1 頁
        searchProducts(){
            this.filteredProductsList = this.filteredProducts(); // 點擊按鈕時執行
            this.hasSearched = true; // 設定為已篩選
            this.currentPage = 1;
        },
        //篩選所有商品後再分頁
        filteredProducts() {
            return this.adminProductStore.adminProducts.filter(product => {
                const { name, id, category, is_enabled, is_expired } = this.searchParams;
                const now = new Date();
                // 商品名稱篩選
                const matchesName = name ? product.name.includes(name) : true;
                // 商品 ID 篩選（確保比較時是字串）
                const matchesId = id ? product.id.toString() === id : true;
                // 商品類別篩選
                const matchesCategory = category ? product.category === category : true;
                // 上架/下架篩選（確保比較時 `is_enabled` 是字串）
                const productEnabled = product.is_enabled ? "1" : "0";// true → "1", false → "0"
                // 上架期限是否過期篩篩選( endDate 為空 ('' 或 null) 的情況會設為 "0"（未過期）)
                const productEndDate = product.endDate ? new Date(product.endDate + 'T23:59:59') : null;
                const computedIsExpired = productEndDate && now > productEndDate ? "1" : "0";

                return (
                    matchesName &&
                    matchesId &&
                    matchesCategory &&
                    this.filterByIsEnabled(productEnabled, is_enabled) &&
                    this.filterByIsExpired(computedIsExpired, is_expired)
                );
            });
        },
        //is_enabled api是 布林值 跟value的字串 相合對 true → "1", false → "0"
        filterByIsEnabled(productEnabled, is_enabled) {
             return is_enabled === "" || is_enabled === "2" // 空字串或 "2"（全部）時不過濾
                    ? true 
                    : productEnabled === is_enabled;// 確保 `is_enabled` 也是字串比較
        },
        //is_expired api是 false未過期 布林值 跟value的字串 相合對 true → "1", false → "0"
        filterByIsExpired(computedIsExpired, is_expired) {
            return is_expired === "" || is_expired === "2" // 空字串或 "2"（全部）時不過濾
                ? true 
                : computedIsExpired === is_expired;// 確保 `is_expired` 也是字串比較
        },   
        //上架日期不能選擇今天 以前 的日期
        getToday() {
            const today = new Date();
            today.setHours(today.getHours() + 8); // 調整為台灣時間
            return today.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
        },
        //3/11
        //記錄哪個商品被展開切換(編輯/新增)
        toggleExpand(productId) {
            console.log("Before toggle:", this.expandedProduct);
            this.expandedProduct = this.expandedProduct === productId ? null : productId;
            console.log("After toggle:", this.expandedProduct);
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
    //刪除該顏色和該顏色所有變題
    removeColor(color) {
      // 刪除 colors 陣列中的該 color
      this.adminProductStore.tempProduct.colors = this.adminProductStore.tempProduct.colors.filter(c => c.color !== color);
      // 刪除 variants 陣列中該 color 的所有變體
      this.adminProductStore.tempProduct.variants = this.adminProductStore.tempProduct.variants.filter(v => v.color !== color);
    },
        //顏色標題區塊api要有該顏色的尺寸物件才會顯示326
        hasColorInVariants(color) {
            return this.adminProductStore.tempProduct.variants.some(variant => variant.color ===  color);
        },
    

  
    },
    watch: {
        // 在新增編輯框架時自動填入管理員名稱(watch 監聽 modalType 變化並自動更新 tempProduct.owner)
        "adminProductStore.modalType"(newType) {
            if (newType === "new") {
                this.adminProductStore.tempProduct.owner = this.currentAdminName;
            }
        },
    },
    mounted(){
        this.adminProductStore.getAdminProducts();
    },

}


</script>
 <template>
    <div>
        <!-- 頁面框架 -->
        <div>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">產品列表</h2>
                <button
                    @click="adminProductStore.openModal('new')"
                    class="px-4 py-2 bg-green-500 text-white rounded"
                >
                    建立新的產品
                </button>
            </div>
            <!-- 搜尋框架 -->
            <div class="flex flex-wrap">
                <div>
                    <label for="">商品名稱</label>
                    <input v-model="searchParams.name" class="border p-1" placeholder="輸入商品名稱">
                </div>
                <div>
                    <label for="">商品編號</label>
                    <input v-model="searchParams.id" class="border p-1" placeholder="輸入商品編號">
                </div>
                <div>
                    <label for="">商品分類</label>
                    <select v-model="searchParams.category" class="border p-1" name="" id="">
                        <option value="">請選擇選項</option>
                        <option :value="category" v-for="category in adminProductStore.categoryOptions" :key="category">
                            {{ category }}
                        </option>
                    </select>
                </div>
            </div>
            <div class="flex flex-wrap">
                <div>
                    <label for="">是否上架</label>
                    <select  v-model="searchParams.is_enabled" class="border p-1" name="" id="">
                        <option value="">請選擇選項</option>
                        <option value="0">未上架</option>
                        <option value="1">上架</option>
                        <option value="2">全部</option>

                    </select>
                </div>
                <div>
                    <label for="">上架期限是否過期</label>
                    <select v-model="searchParams.is_expired" name="" id="">
                        <option value="">請選擇選項</option>
                        <option value="0">未過期</option>
                        <option value="1">過期</option>
                        <option value="2">全部</option>

                    </select>
                </div>
                <!-- <div>
                    <label for=""></label>
                    <select  name="" id="">
                        <option value="">請選擇選項</option>
                        <option :value="0">1</option>
                        <option :value="1">2</option>
                        <option :value="2">3</option>
                    </select>
                </div> -->
            </div>
            <div>
                <button @click="searchProducts" class="px-4 py-2 bg-blue-500 text-white rounded"> 搜尋商品</button>
            </div> 
        </div>
        <!--  -->
        <div v-if="!hasSearched || displayedProducts.length > 0"  class="w-full overflow-x-auto">
            <table v-if="displayedProducts.length > 0"  class="w-full border border-gray-300">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2">上架</th>
                        <th class="px-4 py-2">商品編號</th>
                        <th class="px-4 py-2">圖片</th>
                        <th class="px-4 py-2">產品名稱</th>
                        <th class="px-4 py-2">標記</th>
                        <th class="px-4 py-2">原價</th>
                        <th class="px-4 py-2">特價</th>
                        <th class="px-4 py-2">管理員</th>
                        <th class="px-4 py-2">更新時間</th>
                        <th class="px-4 py-2">操作</th>
                    </tr>
                </thead>
                <tbody v-for="product in paginatedProducts" :key="product.id">
                    <tr class="border-b">
                        <td class="px-3 py-2">
                        <button
                            @click="toggleProductStatus(product)"
                            :class="product.is_enabled ? 'bg-green-500 text-white' : 'bg-gray-400  text-black'" 
                            class="py-1 rounded w-16"
                        >
                            {{ product.is_enabled ? '上架' : '下架' }}
                        </button>
                        </td>
                        <td class="px-4 py-2">{{ product.id }}</td>
                        <td class="px-4 py-2">
                        <img :src="product.imgurl" alt="主要商品圖片" class="w-16 h-16 object-cover rounded">
                        </td>
                        <td class="px-4 py-2 cursor-pointer text-blue-600" @click="toggleExpand(product.id)">
                        {{ product.name }}
                        </td>
                        <td class="px-4 py-2">{{ product.mark.length ? product.mark.join(", ") : '無' }}</td>
                        <td class="px-4 py-2">{{ product.OriginalPrice }}</td>
                        <td class="px-4 py-2">{{ product.price }}</td>
                        <td class="px-4 py-2">{{ product.owner}}</td>
                        <td class="px-4 py-2">{{ product.updatedAt }}</td>
                        <td class="px-4 py-2">
                        <button @click="adminProductStore.openModal('edit', product)" class="px-2 py-1 text-blue-500 border border-blue-500 rounded">編輯</button>
                        <button @click="adminProductStore.openModal('delete', product)" class="ml-2 px-2 py-1 text-red-500 border border-red-500 rounded">刪除</button>
                        </td>
                    </tr>
                    <!-- 變體 (variants) 折疊區域 -->
                    <tr v-if="product && expandedProduct === product.id" class="w-full border-collapse border border-gray-300">

                        <td colspan="6" class="p-0">
                            <!-- 這個div讓變體表格有獨立的橫向滾動 -->
                            <div class="w-full overflow-x-auto">
                                <table class="w-full  border-collapse border border-gray-300 text-center">
                                    <!-- 變體標頭 -->
                                    <thead>
                                        <tr class="bg-gray-200">
                                            <th class="px-4 py-2">圖片</th>
                                            <th class="px-4 py-2">尺寸</th>
                                            <th class="px-4 py-2">顏色</th>
                                            <th class="px-4 py-2">銷售數量</th>
                                            <th class="px-4 py-2">庫存</th>             
                                        </tr>
                                    </thead>
                                     <!-- 變體列表-->
                                    <tbody>
                                        <tr v-for="variant in product.variants" :key="variant.id" class="bg-gray-100">
                                            <td><img v-for="(image,index) in variant.imagesurl" :key="index" :src="image" class="w-12 h-12 object-cover rounded mx-auto"></td>
                                            <td class="px-4 py-2">{{ variant.size }}</td>
                                            <td class="px-4 py-2">{{ variant.color }}</td>
                                            <td class="px-4 py-2">{{ variant.sellCount }}</td>
                                            <td class="px-4 py-2">{{ variant.count }}</td>
                                        </tr>
                                    </tbody>

                                </table>
                            </div>
                        </td> 
                    </tr>
                </tbody>
            </table>
           
        </div> 
        <!-- 篩選後沒有商品的情況 -->
        <div v-else="hasSearched && displayedProducts.length === 0">
            <div class="text-center text-red-500 py-4">❌ 找不到符合條件的商品</div>
        </div>
        
       
        <!-- 分頁組件 -->
        <nav>
            <Pagination
                :currentPage="currentPage"
                :totalPages="totalPages"
                @pageChange="handlePageChange"
            />
        </nav>
    </div>
           
       
      
        <!-- 新增/編輯產品框架 -->
        <div v-if="adminProductStore.showProductModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center ">
            
            <div class=" bg-white rounded w-10/12 xl:w-6/12 max-h-[90vh] overflow-auto">

                <!-- 頭 -->
                <div class="flex justify-between bg-black py-2 px-4">
                    <h5 class="text-white text-lg font-semibold">{{ adminProductStore.modalType === 'new' ? '新增產品' : '編輯產品' }}</h5>
                    <button
                        @click="adminProductStore.closeModal"
                        class="text-gray-500"
                    >
                    X
                    </button>
                </div>
                <!-- 內容 -->
                <div class="flex flex-col md:flex-row md:gap-5 p-4 ">
                    <!-- 左邊圖片框架架構 -->
                     <!-- w-full -->
                    <div class=" lg:w-5/12">
                        <!-- 商品封面圖片 -->
                        <div>
                            <label for="">商品封面</label>
                            <!-- 新增圖片輸入框 -->
                            <div class="mb-2 flex flex-warp">
                                <input type="text" v-model="newCoverImageUrl" placeholder="請輸入圖片連結" class="border px-2 mr-2 w-full" />
                                <button @click="addCoverImage" class="bg-blue-500 text-white w-36 py-2 rounded">新增圖片</button>
                            </div> 
                            <div v-if="adminProductStore.tempProduct.imgurl">
                                <input type="text" v-model="adminProductStore.tempProduct.imgurl" placeholder="請輸入圖片連結" class="w-11/12 mb-2">
                                <div class="flex justify-between items-center">
                                    <img :src="adminProductStore.tempProduct.imgurl" alt="商品封面" class="w-32 h-32 object-cover">
                                    <button @click="removeCoverImage" class="bg-red-500 text-white w-16 h-8 rounded">刪除</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 右邊詳細資料架構 -->
                    <div class=" lg:w-7/12">
                        <div>
                            <label for="">商品名稱</label>
                            <input type="text" v-model="adminProductStore.tempProduct.name" placeholder="請輸入商品名稱"class="w-full">
                        </div>
                        <div>
                            <label for="">分類</label>
                            <div>
                                <!-- selectedCategorys.includes(category) ? -->
                                <button
                                 v-for="category in adminProductStore.categoryOptions"
                                    :key="category"
                                    @click="toggleCategory(category)"
                                    :class="[
                                        'px-3 py-1 rounded border cursor-pointer',
                                        selectedCategorys === category ? 'bg-green-300 text-white' : 'bg-gray-200'
                                    ]"
                                >
                                    {{ category }}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label for="">售價(不用輸入，系統會自動算出)</label>
                            <input 
                                type="number" 
                                v-model.number="adminProductStore.tempProduct.price"
                                min="0" 
                                placeholder="請輸入售價"
                            >
                        </div>
                        <div>
                            <label for="">折扣(%)</label>
                            <input 
                                type="number"
                                v-model.number="adminProductStore.discountInput"
                                @input="adminProductStore.handleDiscountChange"
                                min="0"
                                max="100"
                                placeholder="輸入折扣 (例如 30=7折)"
                            >
                        </div>
                        <div>
                            <label for="">原價</label>
                            <input type="number" v-model.number="adminProductStore.tempProduct.OriginalPrice" min="0" placeholder="請輸入原價">
                        </div>
                        <div>
                            <label for="">標籤</label>
                            <div>
                                <button
                                    v-for="mark in adminProductStore.markOptions"
                                    :key="mark"
                                    @click="toggleMark(mark)"
                                    
                                    :class="[
                                        'px-3 py-1 rounded border cursor-pointer',
                                        selectedMarks.includes(mark) ? 'bg-green-300 text-white' :   'bg-gray-200'
                                    ]"
                                >
                                {{ mark }}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label for="">商品描述</label>
                            <div>
                                <textarea v-model="adminProductStore.tempProduct.description" class="w-full" name="" id="" cols="50"  rows="6" placeholder="請輸入商品描述"></textarea>
                            </div>
                        </div>
                        <div class="flex jusity-between">
                            <div>
                                <label for="">上架日期<span>*</span></label>
                                <input 
                                    type="date" 
                                    v-model="adminProductStore.tempProduct.startDate" 
                                    :min="getToday()"
                                    :max="adminProductStore.tempProduct.endDate"
                                    required
                                >
                                <!-- 在api增加startDate屬性 -->
                            </div>
                            <div>
                                <label for="">下架日期<span>*</span></label>
                                <input 
                                    type="date" 
                                    v-model="adminProductStore.tempProduct.endDate" 
                                    :min="adminProductStore.tempProduct.startDate"
                                    required
                                >
                                <!-- 在api增加endDate屬性 -->
                            </div>
                        </div>
                        <div>
                            <input type="checkbox" v-model="adminProductStore.tempProduct.is_enabled">
                            <label for="">是否啟用</label>
                        </div>
                         
                        <div>
                            <label for="">管理員</label>
                            <input type="text" v-model="adminProductStore.tempProduct.owner" name="" id="">
                        </div>
                        <div>
                            <label for="">更新時間</label>
                            <!-- type="datetime-local" -->
                            <input type="text" v-model="adminProductStore.tempProduct.updatedAt"class="bg-gray-100 outline-none"readonly>
                        </div>
                        <!-- 變體 -->
                        <div class="space-y-4">
                            <button @click="adminProductStore.toggleAddVariant()" class="bg-blue-500 text-white px-4 py-2 rounded">
                                {{ adminProductStore.isAddingVariant ? '收起變體' : '新增變體' }}
                            </button>
                            
                            <!-- 收起變體/新增變體 按鈕 展開後的內容 -->
                            <div v-if="adminProductStore.isAddingVariant" class="border p-4 mt-2">
                                <div class="flex flex-col gap-2">
                                <!-- 編輯顏色 -->
                                <label for="">顏色:</label>  
                                <button
                                    v-for="color in adminProductStore.colorOptions"
                                    :key="color"
                                    @click="toggleSelectedColor(color)"
                                    :class="[
                                        'px-3 py-1 rounded border cursor-pointer',
                                        selectedColors === color ? 'bg-blue-300 text-white' :  'bg-gray-200'
                                    ]"
                                >
                                    {{ color }}
                                </button>  
                                <!-- 編輯尺寸 -->
                                <label for="">尺寸:</label>
                                <!-- toggleSelectedSize -->
                                <button
                                 v-for="size in adminProductStore.sizeOptions"
                                    :key="size"
                                    @click="toggleSelectedSize(size)"
                                    :class="[
                                        'px-3 py-1 rounded border cursor-pointer',
                                        selectedSizes === size ? 'bg-green-300  text-white' : 'bg-gray-200'
                                    ]"
                                >
                                    {{ size }}
                                </button>
                                <!-- 編輯顏色圖片 -->
                                 <!-- 5/23 正在-->
                                  <!--   v-show="selectedColors === colorObj.color"  -->
                                <div 
                                    v-for="(colorObj,index) in adminProductStore.tempProduct.colors " 
                                    :key="index"
                                    v-show="selectedColors === colorObj.color"
                                    class="p-4 border rounded-lg w-64">
                                    <!-- 輸入圖片網址 -->
                                    <input
                                     v-model="colorObj.newImage"
                                        type="text"
                                        placeholder="輸入圖片網址"
                                        class="border p-2 w-full mb-2"
                                    />
                                    <!-- :disabled="!imageUrl" -->
                                    <button
                                        @click="addColorImage(index)"
                                        class="bg-blue-500 text-white px-4 py-2 rounded w-full"
                                        
                                    >
                                    確認圖片
                                    </button>
                                    <!-- 預覽圖片 -->
                                    <!-- v-if="colorObj.imageurl" -->
                                    <div v-if="colorObj.imageurl" class="relative mt-4">
                                        <!-- :src="colorObj.imageurl" -->
                                        <img :src="colorObj.imageurl" alt="預覽圖片" class="w-full h-40 object-cover rounded"/>
                                        <button
                                            @click="removeColorImage(index)"
                                            class="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                        >
                                        ×
                                        </button>
                                    </div>
                                </div>
    <!-- 5/23 -->
      <!-- 新增後的顏色、尺寸列表 放這-->  
                                <button @click="adminProductStore.addVariant" class="bg-green-500 text-white px-2 py-1 rounded">確認新增</button>
                                </div>
                            </div>
               
                            <!-- 新增後的顏色、尺寸列表 -->                                                       
                            <!-- <div> -->
                                <!-- v-for="(colorObj, index) in adminProductStore.tempProduct.colors" -->
                                <!-- sortedColors -->
                            <div v-for="(colorObj, index) in adminProductStore.tempProduct.colors" :key="colorObj.color" class="border rounded-lg">
                                <!-- 顏色標題區塊 -->
                                <div v-if="hasColorInVariants(colorObj.color)" @click="toggleOpenColor(colorObj.color)" class="p-4 bg-gray-200 cursor-pointer flex                          justify-between items-center">
                                <h2 class="text-xl font-bold">{{ colorObj.color }}</h2>
                                <button @click.stop="removeColor(colorObj.color)" class="bg-red-500 text-white px-2 py-1 rounded">刪除</button>
                                </div>

                                <!-- 尺寸區塊 -->
                                <div v-if="adminProductStore.openColors.includes(colorObj.color)" class="p-4 bg-gray-100">
                                    <!-- v-for="(variant, index) in adminProductStore.tempProduct.variants.filter(v => v.color === colorObj.color)" -->
                                    <!-- v-for="(variant, index) in adminProductStore.tempProduct.variants" -->
                                <div v-for="(variant, index) in adminProductStore.tempProduct.variants.filter(v => v.color === colorObj.color)" :key="variant.id"                           class="p-2 border-b">
                                    <!-- 點擊時展開變體資訊 -->
                                    <div @click="toggleOpenSize(variant.id)" class="cursor-pointer flex justify-between items-center">
                                    <span>{{ variant.size }}</span>
                                    <button class="bg-red-500 text-white px-2 py-1 rounded" @click.stop="adminProductStore.removeVariant(variant.id)">刪除</button> 
          
                                    </div>

                                    <!-- 展開編輯框 -->
                                    <div v-if="adminProductStore.openSizes.includes(variant.id)" class="mt-2 p-2 bg-white">
                                    <label for="">庫存數量:</label>
                                    <input type="number" v-model="variant.count" placeholder="庫存數量" class="border p-2 w-full">
                                    <label for="">銷售數量:</label>
                                    <input type="number" v-model="variant.sellCount" placeholder="銷售數量" class="border p-2 w-full">
                                    <label for="">上架日期:</label>
                                    <input type="date" :min="getToday()" v-model="variant.startDate" class="border p-2 w-full">
                                    <label for="">下架日期:</label>
                                    <input type="date" :min="variant.startDate" v-model="variant.endDate" class="border p-2 w-full">
                                    <label>
                                        <input type="checkbox" v-model="variant.is_enabled"> 啟用
                                    </label>

                                    <div class="flex gap-2 mt-2">
                                        <button @click="adminProductStore.saveVariant(variant)" class="bg-green-500 text-white px-2 py-1 rounded">確認</button>
                                        <button @click="adminProductStore.toggleSizePanel(variant.id)" class="bg-gray-500 text-white px-2 py-1 rounded">取消</button>
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <!-- </div> -->

                        </div>
                        <!--編輯/新增框架的 底部 -->
                        <div>
                            <button @click="adminProductStore.closeModal" class="px-4 py-2 bg-gray-300 rounded mr-2">取消</button>
                            <button @click="handleConfirm" class="px-4 py-2 bg-blue-500 text-white rounded">確認</button>
                            <!-- @click="updateProduct" -->
                        </div>
                    </div>
                </div>
            </div>    
        </div>

        <!-- 刪除框架 -->
        <div v-if="adminProductStore.showDeleteModal" class="fixed z-50 inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div class="bg-white p-4 rounded w-1/3">
                <div class="flex justify-between items-center mb-2">
                    <h5 class="text-lg font-semibold">刪除產品</h5>
                    <button @click="adminProductStore.closeModal" class="text-gray-500">X</button>
                </div>
                <div>
                    是否刪除
                    <strong>{{ adminProductStore.tempProduct.name }}</strong>商品(刪除後將無法恢復)。
                </div>
                <div>
                    <button @click="adminProductStore.closeModal" class="px-4 py-2 bg-gray-300 rounded mr-2">取消</button>
                    <button @click="handleConfirm" class="px-4 py-2 bg-red-500 text-white rounded">確認刪除</button>
                    <!-- @click="deleteProduct" -->
                </div>
            </div>
        </div>

</template>




  