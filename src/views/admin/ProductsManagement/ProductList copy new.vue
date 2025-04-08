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
                is_enabled: '',
                is_expired: ''
            },
            currentPage: 1,           // 當前頁碼
            itemsPerPage: 10,         // 每頁顯示的商品數
            // filterProducts: [] // 篩選後的商品儲存
            filteredProductsList: [],
            // currentAdminName: "Admin Name", //登入的管理者名稱
            expandedProduct: null, // 記錄哪個商品被展開
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
                return this.adminProductStore.tempProduct.size
            },
            set(value){
                this.adminProductStore.tempProduct.size = value
            }
        },
        // 將 tempProduct 的 color 屬性作為 computed，實現雙向綁定
        selectedColors:{
            get(){
                return this.adminProductStore.tempProduct.color
            },
            set(value){
                this.adminProductStore.tempProduct.color = value
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
            // 如果 `filteredProductsList` 有資料，顯示搜尋結果，否則顯示全部商品
            return this.filteredProductsList.length > 0 ? this.filteredProductsList : this.adminProductStore.adminProducts;
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
        //
        expandedVariants() {
            if (!this.expandedProduct) return [];
            const product = this.paginatedProducts.find(p => (p.id) === (this.expandedProduct));
   
            return product?.variants || [];
        },
       
    },
    
    methods:{
        //Size按鈕切換
        toggleSize(size) {
            // 複選功能
            const index = this.selectedSizes.indexOf(size);
            if (index > -1) {
                this.selectedSizes.splice(index, 1);
            } else {
                this.selectedSizes.push(size);
            }
        },
        //Color按鈕切換
        toggleColor(color) {
            // 複選功能
            const index = this.selectedColors.indexOf(color);
            if (index > -1) {
                this.selectedColors.splice(index, 1);
            } else {
                this.selectedColors.push(color);
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
            // 單選功能：如果已選擇則取消，否則只保留當前選擇
            if (this.selectedCategorys.includes(category)) {
                this.selectedCategorys = [];
            } else {
                this.selectedCategorys = [category];
            }
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
            this.updateProductStatusAPI(product.id, newStatus);
        },
        //更新後端上/下架狀態
        updateProductStatusAPI(productId, status) {
            //dev/products
            const apiUrl = `https://204ed3432b06d7af.mokky.dev/product/${productId}`; // 根據你的 API 設定 URL
            axios.patch(apiUrl, { is_enabled: status }) // 直接發送 true/false
                .then((res) => {
                    console.log("✅ 產品狀態更新成功:", res.data);
                })
                .catch((err) => {
                    console.error("❌ 更新產品狀態失敗:", err);
                });
            
        },
      


        //編輯、新增、刪除確認按鈕(使用async await 是要確保資料更新完成後才關閉 Modal)
        async handleConfirm() {
            const { modalType, tempProduct } = this.adminProductStore;

            // tempProduct.price = Number(tempProduct.price) || 0; // 確保 price在api在api 不為 null，若為空則設為 0
            
            if (modalType === 'new') {
                tempProduct.owner = this.currentAdminName; // 確保新增時設置管理員名稱(自動更新)
                await this.adminProductStore.createProduct(tempProduct);//**確保等候 API 完成**
                this.productStore.addProduct(tempProduct); //  新增到前台
            }
            if (modalType === 'edit') {
                tempProduct.owner = this.currentAdminName; // 編輯時變更為當前管理員
                await this.adminProductStore.updateProduct(tempProduct); // **等候 API 更新**
                this.productStore.updateProduct(tempProduct); // 編輯時同步前台
            }
            if (modalType === 'delete') {
                await this.adminProductStore.deleteProduct(tempProduct.id);// **等候刪除**
                this.productStore.removeProduct(tempProduct.id); // 刪除時同步前台
            }
            this.adminProductStore.closeModal();
        },
        //增加列表圖片
        addImage() {
            if (this.newImageUrl.trim() !== '') {
                this.adminProductStore.tempProduct.imagesurl.push(this.newImageUrl.trim());
                this.newImageUrl = ''; // 清空輸入框
            }
        },
        //刪除列表圖片
        removeImage(index) {
            this.adminProductStore.tempProduct.imagesurl.splice(index, 1);
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
            this.currentPage = 1;
        },
          //篩選所有商品後再分頁
        filteredProducts() {
            
            return this.adminProductStore.adminProducts.filter(product => {
                const { name, id, category, is_enabled, is_expired } = this.searchParams;
                const now = new Date();

                const matchesName = name ? product.name.includes(name) : true;
                
                const matchesId = id ? product.id.toString() === (id) : true;  // ID Number轉成字串
                const matchesCategory = category ? product.category === category : true;
                
                // 選擇「全部」(2) 或空值時，直接通過篩選(後端API是用0、1做篩選，所以2邏輯寫在這)
                // const matchesIsEnabled = is_enabled !== '' && is_enabled !== '2'
                // ? product.is_enabled == is_enabled
                // : true; 
                // `is_enabled` 直接用 true/false 過濾
                const matchesIsEnabled = is_enabled !== '' && is_enabled !== '2'
                    ? product.is_enabled === (is_enabled === 'true')
                    : true;
                // 判斷商品上架期限是否過期
                // 過期判斷可能需要設定為當天結束（23:59:59）才算過期
                const productEndDate = product.endDate ? new Date(product.endDate + 'T23:59:59') : null;
                const isExpired = productEndDate && now > productEndDate ? 1 : 0;//過期 (1)，否則未過期 (0
                // const matchesIsExpired = is_expired !== '' && is_expired !== '2'//2（全部）或空值則不篩選。
                //     ? isExpired == is_expired
                //     : true;
                const matchesIsExpired = is_expired !== '' && is_expired !== '2'
                    ? isExpired === (is_expired === 'true')
                    : true;
                        return matchesName && matchesId && matchesCategory && matchesIsEnabled && matchesIsExpired;
                    });
        },
        //上假日期不能選擇今天 以前 的日期
        getToday() {
            const today = new Date();
            today.setHours(today.getHours() + 8); // 調整為台灣時間
            return today.toISOString().split('T')[0]; // 格式化為 YYYY-MM-DD
        },
        //記錄哪個商品被展開切換
        toggleExpand(productId) {
            console.log("Before toggle:", this.expandedProduct);
            this.expandedProduct = this.expandedProduct === productId ? null : productId;
            console.log("After toggle:", this.expandedProduct);
        }
    

  
    },
    watch: {
        // 在新增編輯框架時自動填入管理員名稱(watch 監聽 modalType 變化並自動更新 tempProduct.owner)
        "adminProductStore.modalType"(newType) {
            if (newType === "new") {
                this.adminProductStore.tempProduct.owner = this.currentAdminName;
            }
        },
    },

   
    //使用 created()，因為能更早觸發 API 請求，提升資料載入效率。
    // createed(){
    //     this.adminProductStore.getAdminProducts();//抓取 currentPage 的商品列表
    // },
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
            </div>
            <div>
                <button @click="searchProducts" class="px-4 py-2 bg-blue-500 text-white rounded"> 搜尋商品</button>
            </div>
            <!-- 商品列表 -->
            <table class="w-full border border-gray-300">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2">上架</th>
                        <!-- <th class="px-4 py-2">分類</th> -->
                        <th class="px-4 py-2">圖片</th>
                        <th class="px-4 py-2">產品名稱</th>
                        <!-- <th class="px-4 py-2">標籤</th> -->
                        <th class="px-4 py-2">原價</th>
                        <th class="px-4 py-2">售價</th>
                        <th class="px-4 py-2">銷量</th>
                        <th class="px-4 py-2">庫存</th>
                        <th class="px-4 py-2">管理員</th>
                        <th class="px-4 py-2">更新時間</th>
                        <th class="px-4 py-2">操作</th>
                    </tr>
                </thead> 
                <!-- <tbody v-if="products.length === 0">載入中...</tbody> -->
                <!-- 產品列表 -->
                <tbody>
                    <tr v-for="product in paginatedProducts" :key="product.id" class="border-b">
                        <!-- v-if判斷是佈林直 -->
                        <td class="px-3 py-2">
                            <!-- <span class="text-orange-600" v-if="product.is_enabled">啟用</span>
                            <span v-else>未啟用</span> -->
                            <button
                                @click="toggleProductStatus(product)"
                                :class="product.is_enabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-black'" 
                                class="py-1 rounded w-16"
                            >
                                {{ product.is_enabled ? '上架':'下架'}}
                            </button>
                        </td>
                        <!-- <td>{{ product.is_enabled ? '啟用' : '未啟用' }}</td> -->
                        <!-- <td class="px-4 py-2">{{ product.category }}</td> -->
                        <td class="px-4 py-2">
                            <img :src="product.imgurl" alt="商品圖片" class="w-16 h-16 object-cover rounded">
                        </td>
                        <td class="px-4 py-2">{{ product.name }}</td>
                        <!-- <td class="px-4 py-2">{{ product.tag }}</td> -->
                        <td class="px-4 py-2">{{ product.OriginalPrice }}</td>
                        <td class="px-4 py-2">{{ product.price }}</td>
                        <!-- 銷量:sellCount 在api增加sellCount屬性-->
                        <td class="px-4 py-2">{{ product.sellCount }}</td>
                        <!-- 庫存:count 在api增加count屬性-->
                        <td class="px-4 py-2">{{ product.count }}</td>
                        <!-- 管理員:owner 在api增加owner屬性-->
                        <td class="px-4 py-2">{{ product.owner }}</td>
                        <!-- 更新時間:updatedAt 在api增加updatedAt屬性-->
                        <td class="px-4 py-2">{{ product.updatedAt }}</td>

                        <td class="px-4 py-2">
                            <!--  @click="adminProductStore.openModal('edit', product)" -->
                            <!--  @click="updateProduct(product)" -->
                            <button @click="adminProductStore.openModal('edit', product)" class="px-2 py-1 text-blue-500 border border-blue-500 rounded">編輯</button>
                            <button @click="adminProductStore.openModal('delete', product)" class="ml-2 px-2 py-1 text-red-500 border border-red-500 rounded">刪除</button>
                        </td>
                    </tr>
                </tbody>
            </table> 
        </div>
<!-- 主要表格容器 3/11-->
<div class="w-full overflow-x-auto">
<table class="w-full border border-gray-300">
    <thead class="bg-gray-200">
        <tr>
            <th class="px-4 py-2">上架</th>
            <th class="px-4 py-2">圖片</th>
            <th class="px-4 py-2">產品名稱</th>
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
            <td class="px-4 py-2">
            <img :src="product.imgurl" alt="主要商品圖片" class="w-16 h-16 object-cover rounded">
            </td>
            <td class="px-4 py-2 cursor-pointer text-blue-600" @click="toggleExpand(product.id)">
            {{ product.name }}
            </td>
            <td class="px-4 py-2">{{ product.owner }}</td>
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
                                <th class="px-4 py-2">標記</th>
                                <th class="px-4 py-2">原價</th>
                                <th class="px-4 py-2">售價</th>
                                <th class="px-4 py-2">銷售數量</th>
                                <th class="px-4 py-2">庫存</th>             
                            </tr>
                        </thead>
                        <!-- 變體列表 -->
                        <tbody>
                            <tr v-for="variant in product.variants" :key="variant.id" class="bg-gray-100">
                                <td><img v-for="(image,index) in variant.imagesurl" :key="index" :src="image" class="w-12 h-12 object-cover rounded mx-auto"></td>
                            
                                <td class="px-4 py-2">{{ variant.size }}</td>
                            <td class="px-4 py-2">{{ variant.color }}</td>
                                <td class="px-4 py-2">{{ variant.mark.length ? variant.mark.join(", ") : '無' }}</td>
                                <td class="px-4 py-2">{{ variant.OriginalPrice }}</td>
                                <td class="px-4 py-2">{{ variant.price }}</td>
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
                        <!-- 列表圖片 -->
                        <div >
                            <label for="">列表圖片</label>
                            <!-- v-for="(url, index) in tempProduct.imagesurl.split(',')" -->
                            <!-- 新增圖片輸入框 -->
                            <div class="mb-2 flex flex-warp">
                                <input type="text" v-model="newImageUrl" placeholder="請輸入圖片連結" class="border px-2 mr-2 w-full" />
                                <button @click="addImage" class="bg-blue-500 text-white w-36 py-2 rounded">新增圖片</button>
                            </div> 
                            <!-- 顯示圖片列表 -->
                            <div v-for="(url, index) in adminProductStore.tempProduct.imagesurl" :key="index"  class=" mb-2">
                                <input 
                                    type="text" 
                                    v-model="adminProductStore.tempProduct.imagesurl[index]" name=""id="" 
                                    class="border p-1 mr-2 w-11/12 mb-2"
                                    placeholder="請輸入圖片連結">
                                <!-- url.trim() -->
                                <div class="flex justify-between items-center">
                                    <img :src="url" alt="列表圖片" class="w-24 h-24 object-cover border mr-2">
                                    <button @click="removeImage(index)" class="bg-red-500 text-white w-16 h-8 rounded">刪除</button>
                                    <!-- px-2 py-1 -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 右邊詳細資料架構 -->
                     <!-- w-full -->
                    <div class=" lg:w-7/12">
                        <div>
                            <label for="">商品名稱</label>
                            <input type="text" v-model="adminProductStore.tempProduct.name" placeholder="請輸入商品名稱">
                        </div>
                        <div>
                            <label for="">分類</label>
                            <div>
                                <button
                                 v-for="category in adminProductStore.categoryOptions"
                                    :key="category"
                                    @click="toggleCategory(category)"
                                    :class="[
                                        'px-3 py-1 rounded border cursor-pointer',
                                        selectedCategorys.includes(category) ? 'bg-green-300 text-white' : 'bg-gray-200'
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
                            <label for="">庫存數量</label>
                            <input type="number"v-model.number="adminProductStore.tempProduct.count" >
                            <!-- 在api增加count屬性  -->
                        </div>
                        <div>
                            <label for="">銷售數量</label>
                            <input type="number"v-model.number="adminProductStore.tempProduct.sellCount" >
                            <!-- 在api增加sellCount屬性  -->
                        </div>
                        <div>
                            <label for="">尺寸</label>
                            <div>
                                <button
                                 v-for="size in adminProductStore.sizeOptions"
                                    :key="size"
                                    @click="toggleSize(size)"
                                    :class="[
                                        'px-3 py-1 rounded border cursor-pointer',
                                        selectedSizes.includes(size) ? 'bg-green-300  text-white' : 'bg-gray-200'
                                    ]"
                                >
                                    {{ size }}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label for="">顏色</label>
                            <div>
                                <button
                                    v-for="color in adminProductStore.colorOptions"
                                    :key="color"
                                    @click="toggleColor(color)"
                                    :class="[
                                        'px-3 py-1 rounded border cursor-pointer',
                                        selectedColors.includes(color) ? 'bg-blue-300 text-white' :  'bg-gray-200'
                                    ]"
                                >
                                    {{ color }}
                                </button>
                            </div>
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
                        <!-- 底部 -->
                        <div>
                            <button @click="adminProductStore.closeModal" class="px-4 py-2 bg-gray-300 rounded mr-2">取消</button>
                            <button @click="handleConfirm" class="px-4 py-2 bg-blue-500 text-white rounded">確認</button>
                            <!-- @click="updateProduct" -->
                        </div>
                    </div>
                </div>
           
            </div>    
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
                        <!-- 列表圖片 -->
                        <div >
                            <label for="">列表圖片</label>
                            <!-- v-for="(url, index) in tempProduct.imagesurl.split(',')" -->
                            <!-- 新增圖片輸入框 -->
                            <div class="mb-2 flex flex-warp">
                                <input type="text" v-model="newImageUrl" placeholder="請輸入圖片連結" class="border px-2 mr-2 w-full" />
                                <button @click="addImage" class="bg-blue-500 text-white w-36 py-2 rounded">新增圖片</button>
                            </div> 
                            <!-- 顯示圖片列表 -->
                            <div v-for="(url, index) in adminProductStore.tempProduct.imagesurl" :key="index"  class=" mb-2">
                                <input 
                                    type="text" 
                                    v-model="adminProductStore.tempProduct.imagesurl[index]" name=""id="" 
                                    class="border p-1 mr-2 w-11/12 mb-2"
                                    placeholder="請輸入圖片連結">
                                <!-- url.trim() -->
                                <div class="flex justify-between items-center">
                                    <img :src="url" alt="列表圖片" class="w-24 h-24 object-cover border mr-2">
                                    <button @click="removeImage(index)" class="bg-red-500 text-white w-16 h-8 rounded">刪除</button>
                                    <!-- px-2 py-1 -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 右邊詳細資料架構 -->
                     <!-- w-full -->
                    <div class=" lg:w-7/12">
                        <table class="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr class="bg-gray-200">
                                    <th class="px-4 py-2">狀態</th>
                                    <th class="px-4 py-2">圖片</th>
                                    <th class="px-4 py-2">名稱</th>
                                    <th class="px-4 py-2">管理員</th>
                                    <th class="px-4 py-2">更新時間</th>
                                    <th class="px-4 py-2">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b" v-for="product in adminProductStore.products" :key="product.id">
                                    <td class="px-3 py-2">
                                        <button
                                            @click="toggleProductStatus(product)"
                                            :class="product.is_enabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-black'" 
                                            class="py-1 rounded w-16"
                                        >
                                            {{ product.is_enabled ? '上架' : '下架' }}
                                        </button>
                                    </td>
                                    <td class="px-4 py-2">
                                        <img :src="product.imgurl" alt="主要商品圖片" class="w-16 h-16 object-cover rounded">
                                    </td>
                                    <td class="px-4 py-2 cursor-pointer text-blue-600" @click="toggleExpand(product.id)">
                                        {{ product.name }}
                                    </td>
                                    <td class="px-4 py-2">{{ product.owner }}</td>
                                    <td class="px-4 py-2">{{ product.updatedAt }}</td>
                                    <td class="px-4 py-2">
                                        <button @click="adminProductStore.openModal('edit', product)" class="px-2 py-1 text-blue-500 border border-blue-500 rounded">編輯</button>
                                        <button @click="adminProductStore.openModal('delete', product)" class="ml-2 px-2 py-1 text-red-500 border border-red-500 rounded">刪除</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div>
                            <label for="">變體 (Variants)</label>
                            <div v-for="variant in adminProductStore.tempProduct.variants" :key="variant.id" class="border p-2 mb-2">
                                <div class="flex justify-between">
                                    <span>{{ variant.name }}</span>
                                    <button @click="removeVariant(variant.id)" class="bg-red-500 text-white px-2 py-1 rounded">刪除</button>
                                </div>
                            </div>
                            <button @click="addVariant" class="bg-blue-500 text-white px-4 py-2 rounded">新增變體</button>
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
    <!-- </div> -->
    
</template>