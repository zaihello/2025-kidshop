<script>
import Pagination from '../../../components/front/shop/Pagination.vue'
import AdminProductModal from '../../../components/AdminProductModal.vue'
import { useProductStore } from '../../../stores/productStore'
import { useAdminProductStore } from '../../../stores/adminProductStore' 
import { useAdminAuthStore } from '../../../stores/adminAuthStore'
export default{
    components:{Pagination,AdminProductModal},
    data(){
        return{
            newImageUrl: '', // 儲存列表圖片的連結
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
            filteredProductsList: [],// 篩選後的商品儲存
            hasSearched: false, // 是否已執行篩選
            expandedProduct: null, // 記錄哪個商品被展開(編輯按鈕)
            // isAddingVariant: false, // 新增變體按鈕(控制變體輸入區域顯示/隱藏)
  
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
        },
        //計算總頁數
        totalPages() {
            return Math.ceil(this.displayedProducts.length / this.itemsPerPage);
 
        },
       
        //是否有進行篩選(searchParams全部都是'')
        hasFiltered() {
            return Object.values(this.searchParams).some(value => value !== '');
        }
    },
    
    methods:{
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
            this.adminProductStore.updateProductStatus(product.id, newStatus)
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
       
        //記錄哪個商品被展開切換(編輯/新增)
        toggleExpand(productId) {
            console.log("Before toggle:", this.expandedProduct);
            this.expandedProduct = this.expandedProduct === productId ? null : productId;
            console.log("After toggle:", this.expandedProduct);
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
               tempProduct.owner = this.adminAuthStore.adminName; // 目前登入的管理者是哪位
            if (!tempProduct.variants || tempProduct.variants.length === 0) {
                alert("請輸入變體");
                return;
            }
                await this.adminProductStore.updateProduct(tempProduct);
            
           }
           if (modalType === 'edit') {
               tempProduct.owner = this.adminAuthStore.adminName; // 目前登入的管理者是哪位
               await this.adminProductStore.updateProduct(tempProduct); // **等候 API 更新**
           }
           if (modalType === 'delete') {
               await this.adminProductStore.deleteProduct(tempProduct.id);// **等候刪除**
           }
           this.adminProductStore.closeModal();
        },
    },
    watch: {
        // 在新增編輯框架時自動填入管理員名稱(watch 監聽 modalType 變化並自動更新 tempProduct.owner)
        "adminProductStore.modalType"(newType) {
            if (newType === "new") {
                this.adminProductStore.tempProduct.owner = this.adminAuthStore.adminName;//目前登入的管理者是哪位
            }
        },
    },
    mounted(){
        this.adminProductStore.getAdminProducts();
    },

}

</script>

<template>
    <div class="p-6 space-y-6">
  
      <!-- 標題與建立按鈕 -->
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">產品列表</h2>
        <button
          @click="adminProductStore.openModal('new')"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow"
        >
          建立新的產品
        </button>
      </div>
  
      <!-- 搜尋框 -->
      <div class="bg-white rounded shadow p-4 space-y-4">
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm mb-1">商品名稱</label>
            <input v-model="searchParams.name" class="w-full border rounded p-2" placeholder="輸入商品名稱" />
          </div>
          <div>
            <label class="block text-sm mb-1">商品編號</label>
            <input v-model="searchParams.id" class="w-full border rounded p-2" placeholder="輸入商品編號" />
          </div>
          <div>
            <label class="block text-sm mb-1">商品分類</label>
            <select v-model="searchParams.category" class="w-full border rounded p-2">
              <option value="">請選擇選項</option>
              <option :value="category" v-for="category in adminProductStore.categoryOptions" :key="category">{{ category }}</option>
            </select>
          </div>
        </div>
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm mb-1">是否上架</label>
            <select v-model="searchParams.is_enabled" class="w-full border rounded p-2">
              <option value="">請選擇選項</option>
              <option value="0">未上架</option>
              <option value="1">上架</option>
              <option value="2">全部</option>
            </select>
          </div>
          <div>
            <label class="block text-sm mb-1">上架期限是否過期</label>
            <select v-model="searchParams.is_expired" class="w-full border rounded p-2">
              <option value="">請選擇選項</option>
              <option value="0">未過期</option>
              <option value="1">過期</option>
              <option value="2">全部</option>
            </select>
          </div>
        </div>
        <div class="text-right">
          <button @click="searchProducts" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow">搜尋商品</button>
        </div>
      </div>
  
      <!-- 商品列表 -->
      <div v-if="!hasSearched || displayedProducts.length > 0" class="overflow-x-auto rounded shadow">
        <table class="w-full text-sm text-left border border-gray-300">
          <thead class="bg-gray-100">
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
          <tbody v-for="product in paginatedProducts" :key="product.id" >
            <tr class="border-b hover:bg-gray-50">
              <td class="px-4 py-2">
                <button
                  @click="toggleProductStatus(product)"
                  :class="product.is_enabled ? 'bg-green-500 text-white' : 'bg-gray-400 text-black'"
                  class="w-16 py-1 rounded"
                >
                  {{ product.is_enabled ? '上架' : '下架' }}
                </button>
              </td>
              <td class="px-4 py-2">{{ product.id }}</td>
              <td class="px-4 py-2">
                <img :src="product.imgurl" alt="商品圖片" class="w-12 h-12 object-cover rounded" />
              </td>
              <td class="px-4 py-2 cursor-pointer text-blue-600" @click="toggleExpand(product.id)">
                {{ product.name }}
              </td>
              <td class="px-4 py-2">{{ product.mark?.length ? product.mark.join(", ") : '無' }}</td>
              <td class="px-4 py-2">{{ product.OriginalPrice }}</td>
              <td class="px-4 py-2">{{ product.price }}</td>
              <td class="px-4 py-2">{{ product.owner }}</td>
              <td class="px-4 py-2">{{ product.updatedAt }}</td>
              <td class="flex gap-2 px-4 py-2">
                <button @click="adminProductStore.openModal('edit', product)" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">編輯</button>
                <button @click="adminProductStore.openModal('delete', product)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">刪除</button>
              </td>
            </tr>
  
            <!-- 展開變體 -->
            <tr v-if="product && expandedProduct === product.id" class="bg-white">
              <td colspan="10" class="p-0">
                <div class="overflow-x-auto p-4 bg-gray-50 rounded-b-xl shadow-inner">
                  <table class="w-full text-center border border-gray-200 rounded-lg overflow-hidden">
                    <thead class="bg-gray-100 text-gray-700">
                      <tr>
                        <th class="px-4 py-2">尺寸</th>
                        <th class="px-4 py-2">顏色</th>
                        <th class="px-4 py-2">銷售數量</th>
                        <th class="px-4 py-2">庫存</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="variant in product.variants" :key="variant.id" class="bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
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
  
      <!-- 無資料提示 -->
      <div v-else class="text-center text-red-500 py-6">❌ 找不到符合條件的商品</div>
  
      <!-- 分頁組件 -->
      <Pagination :currentPage="currentPage" :totalPages="totalPages" @pageChange="handlePageChange" />
  
      <!-- Modal 區域 -->
      <AdminProductModal />
  
      <!-- 刪除 Modal -->
      <div v-if="adminProductStore.showDeleteModal" class="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded shadow-md w-full max-w-md">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">刪除產品</h3>
            <button @click="adminProductStore.closeModal" class="text-gray-500 text-xl">×</button>
          </div>
          <p>是否刪除 <strong>{{ adminProductStore.tempProduct.name }}</strong> 商品？（刪除後將無法恢復）</p>
          <div class="mt-6 flex justify-end space-x-2">
            <button @click="adminProductStore.closeModal" class="px-4 py-2 bg-gray-300 rounded">取消</button>
            <button @click="handleConfirm" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">確認刪除</button>
          </div>
        </div>
      </div>
  
    </div>
</template>
  


  