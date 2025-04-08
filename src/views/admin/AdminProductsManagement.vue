<script>
import Pagination from '../../components/front/shop/Pagination.vue';
import { useAdminProductStore } from '../../stores/adminProductStore'
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
            filteredProductsList: []
        }
    },
    computed:{
        //取得 adminProductStore
        adminProductStore(){
            return useAdminProductStore()
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
 
        }
       
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
        // toggleProductStatus(product) {
        //     product.is_enabled = product.is_enabled === 1 ? 0 : 1; //  0:下架 1:上架
        //     this.adminProductStore.updateProductStatus(product.id, product.is_enabled);
        // },
        //切換 上/下架 按鈕
        toggleProductStatus(product) {
            // 切換產品狀態
            product.is_enabled = !product.is_enabled; //  0:下架 1:上架

            // 如果正在編輯該產品，保持 tempProduct 同步
            if (this.adminProductStore.tempProduct.id === product.id) {
                //頁面的上/下架和，新增/編輯產品的啟用/不啟用同步
                this.adminProductStore.tempProduct.is_enabled = product.is_enabled;
            }
        },

        //編輯、新增、刪除確認按鈕
        handleConfirm() {
            const { modalType, tempProduct } = this.adminProductStore;

            if (modalType === 'new') {
                this.adminProductStore.createProduct(tempProduct);
            }
            if (modalType === 'edit') {
                this.adminProductStore.updateProduct(tempProduct);
            }
            if (modalType === 'delete') {
                this.adminProductStore.deleteProduct(tempProduct.id);
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
                const matchesIsEnabled = is_enabled !== '' && is_enabled !== '2'
                ? product.is_enabled == is_enabled
                : true; 

                // 判斷商品上架期限是否過期
                // 過期判斷可能需要設定為當天結束（23:59:59）才算過期
                const productEndDate = product.endDate ? new Date(product.endDate + 'T23:59:59') : null;
                const isExpired = productEndDate && now > productEndDate ? 1 : 0;//過期 (1)，否則未過期 (0
                const matchesIsExpired = is_expired !== '' && is_expired !== '2'//2（全部）或空值則不篩選。
                    ? isExpired == is_expired
                    : true;
                        return matchesName && matchesId && matchesCategory && matchesIsEnabled && matchesIsExpired;
                    });
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
    <div >
        <!-- 頁面框架 -->
        <div>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold">產品列表</h2>
                <buttton
                    @click="adminProductStore.openModal('new')"
                    class="px-4 py-2 bg-green-500 text-white rounded"
                >
                    建立新的產品
                </buttton>
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
                            <input type="number" v-model.number="adminProductStore.tempProduct.price" placeholder="請輸入售價">
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
                            <input type="number" v-model.number="adminProductStore.tempProduct.OriginalPrice" placeholder="請輸入原價">
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
    </div>
    
</template> 