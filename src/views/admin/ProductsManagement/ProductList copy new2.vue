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
                // return this.adminProductStore.tempProduct.size
                return this.adminProductStore.tempProduct.variants.size

            },
            set(value){
                // this.adminProductStore.tempProduct.size = value
                this.adminProductStore.tempProduct.variants.size = value

            }
        },
        // 將 tempProduct 的 color 屬性作為 computed，實現雙向綁定
        selectedColors:{
            get(){
                // return this.adminProductStore.tempProduct.color
                return this.adminProductStore.tempProduct.variants.color

            },
            set(value){
                // this.adminProductStore.tempProduct.color = value
                this.adminProductStore.tempProduct.variants.color = value

            }
        },
        // 將 tempProduct 的 mark 屬性作為 computed，實現雙向綁定
        selectedMarks: {
            get() {
                // return this.adminProductStore.tempProduct.mark;
                return this.adminProductStore.tempProduct.mark;

            },
            set(value) {
                // this.adminProductStore.tempProduct.mark = value;
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
        // expandedVariants() {
        //     if (!this.expandedProduct) return [];
        //     const product = this.paginatedProducts.find(p => (p.id) === (this.expandedProduct));
   
        //     return product?.variants || [];
        // },
        // sortedVariants() {
        //     return Object.entries(this.adminProductStore.groupedVariants)
        //         .map(([color, variants]) => ({
        //             color,
        //             variants: variants.slice().sort((a, b) => a.size.localeCompare(b.size, 'zh-Hant')) // 依尺寸排序
        //         }))
        //         .flatMap(group => group.variants); // 拆回陣列供 table 使用
        // },
        // sortedVariants() {
        // if (!this.adminProductStore.groupedVariants) return []; // 確保不會出錯

        // return Object.entries(this.adminProductStore.groupedVariants || {})
        //     .map(([color, variants]) => ({
        //         color,
        //         variants: (variants || []).slice().sort((a, b) => a.size.localeCompare(b.size, 'zh-Hant')) // 依尺寸排序
        //     }))
        //     .flatMap(group => group.variants); // 轉回陣列
        // }
        // sortedVariants() {
        //     if (!this.adminProductStore.groupedVariants) return [];

        //     const sizeOrder = ["0 - 3 Months", "3 - 6 Months", "6 - 12 Months", "F"];

        //     return Object.values(this.adminProductStore.groupedVariants) // 取出所有顏色的陣列
        //         .flat() // 轉換成單一陣列
        //         .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)); // 按尺寸排序
        // },
        // sortedVariants() {
        //     const sizeOrder = ["0 - 3 Months", "3 - 6 Months", "6 - 12 Months", "F"];

        //     return [...this.product.variants]
        //         .sort((a, b) => {
        //             // 先按照顏色的字母順序排序
        //             if (a.color !== b.color) {
        //                 return a.color.localeCompare(b.color);
        //             }
        //             // 再按照尺寸的指定順序排序
        //             return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
        //         });
        // },
        sortedVariants() {
        if (!this.product || !this.product.variants) {
            return []; // 避免 `undefined` 錯誤，回傳空陣列
        }

        const sizeOrder = ["0 - 3 Months", "3 - 6 Months", "6 - 12 Months", "F"];

        return [...this.product.variants]
            .sort((a, b) => {
                // 先按照顏色的字母順序排序
                if (a.color !== b.color) {
                    return a.color.localeCompare(b.color);
                }
                // 再按照尺寸的指定順序排序
                return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
            });
    },
    


       
    },
    
    methods:{
        //Size按鈕切換(改變按鈕顏色)
        toggleSelectedSize(size) {
            this.selectedSizes = this.selectedSizes === size ? '' : size;
            this.adminProductStore.newVariant.size = this.selectedSizes; // 確保 newVariant 也更新
        },
        //size控制區塊展開（展開/折疊」該size的變體資訊。）
        toggleOpenSize(size) {
            // if (!Array.isArray(this.adminProductStore.openSizes)) {
            //     this.adminProductStore.openSizes = []; // ✅ 確保它是陣列
            // }
            const index = this.adminProductStore.openSizes.indexOf(size);
            if (index > -1) {
                this.adminProductStore.openSizes.splice(index, 1);
            } else {
                this.adminProductStore.openSizes.push(size);
            }
        },
        //Color按鈕切換(改變按鈕顏色)
        toggleSelectedColor(color) {
            this.selectedColors = this.selectedColors === color ? '' : color;
            this.adminProductStore.newVariant.color = this.selectedColors; // 確保 newVariant 也更新
        },
        //color控制區塊展開（展開/折疊」該顏色的變體資訊。）
        toggleOpenColor(color) {
            // if (!Array.isArray(this.adminProductStore.openColors)) {
            //     this.adminProductStore.openColors = []; // ✅ 確保它是陣列
            // }
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
        // toggleCategory(category) {
        //     // 單選功能：如果已選擇則取消，否則只保留當前選擇
        //     if (this.selectedCategorys.includes(category)) {
        //         this.selectedCategorys = [];
        //     } else {
        //         this.selectedCategorys = [category];
        //     }
        // },
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
        //編輯、新增、刪除確認按鈕(使用async await 是要確保資料更新完成後才關閉 Modal)原本
    //     async handleConfirm() {
           
    //        const { modalType, tempProduct } = this.adminProductStore;

    //        // 類別對應的 category_id
    //        const categoryMap = {
    //            '緊身衣': 1,
    //            '毛衣': 2,
    //            '玩具': 3,
    //            '配件': 4,
    //            '洋裝': 5,
    //            '緊身褲': 6
    //        };
    //        // **確保 category_id 正確**
    //        this.adminProductStore.tempProduct.category_id = categoryMap[this.adminProductStore.tempProduct.category]

    //        // tempProduct.price = Number(tempProduct.price) || 0; // 確保 price在api在api 不為 null，若為空則設為 0
           
    //        if (modalType === 'new') {
    //            tempProduct.owner = this.currentAdminName; // 確保新增時設置管理員名稱(自動更新)
    //            await this.adminProductStore.createProduct(tempProduct);//**確保等候 API 完成**
    //            this.productStore.addProduct(tempProduct); //  新增到前台
             
    //        }
    //        if (modalType === 'edit') {
    //            tempProduct.owner = this.currentAdminName; // 編輯時變更為當前管理員
    //            await this.adminProductStore.updateProduct(tempProduct); // **等候 API 更新**
    //            this.productStore.updateProduct(tempProduct); // 編輯時同步前台
    //        }
    //        if (modalType === 'delete') {
    //            await this.adminProductStore.deleteProduct(tempProduct.id);// **等候刪除**
    //            this.productStore.removeProduct(tempProduct.id); // 刪除時同步前台
    //        }
    //        this.adminProductStore.closeModal();
    //    },
        //編輯、新增、刪除確認按鈕(使用async await 是要確保資料更新完成後才關閉 Modal)
//         async handleConfirm() {
//     const { modalType, tempProduct } = this.adminProductStore;

//     // 類別對應的 category_id
//     const categoryMap = {
//         '緊身衣': 1,
//         '毛衣': 2,
//         '玩具': 3,
//         '配件': 4,
//         '洋裝': 5,
//         '緊身褲': 6
//     };
    
//     // **確保 category_id 正確**
//     tempProduct.category_id = categoryMap[tempProduct.category];

//     if (modalType === 'new') {
//         // **確保先創建主產品**
//         tempProduct.owner = this.currentAdminName; // 設置管理員名稱
//         await this.adminProductStore.createProduct(tempProduct); // **確保 API 完成**
        
//         // **確保 tempProduct.id 存在**
//         // if (!tempProduct.id) {
//         //     console.error("錯誤：主產品 ID 未正確創建！");
//         //     return;
//         // }

//         // **修正變體 ID**
//         // tempProduct.variants.forEach((variant, index) => {
//         //     variant.id = tempProduct.id * 100 + (index + 1);
//         // });

//         // **更新 API 以確保變體 ID 正確**
//         await this.adminProductStore.updateProduct(tempProduct);

//         // **同步到前台**
//         this.productStore.addProduct(tempProduct);
//     }

//     if (modalType === 'edit') {
//         tempProduct.owner = this.currentAdminName; // 編輯時變更為當前管理員
//         await this.adminProductStore.updateProduct(tempProduct); // **等候 API 更新**
//         this.productStore.updateProduct(tempProduct); // 編輯時同步前台
//     }

//     if (modalType === 'delete') {
//         await this.adminProductStore.deleteProduct(tempProduct.id); // **等候刪除**
//         this.productStore.removeProduct(tempProduct.id); // 刪除時同步前台
//     }

//     this.adminProductStore.closeModal();
// },

// async handleConfirm() {
//     const { modalType, tempProduct } = this.adminProductStore;

//     // **類別對應的 category_id**
//     const categoryMap = {
//         '緊身衣': 1,
//         '毛衣': 2,
//         '玩具': 3,
//         '配件': 4,
//         '洋裝': 5,
//         '緊身褲': 6
//     };
    
//     tempProduct.category_id = categoryMap[tempProduct.category];

//     if (modalType === 'new') {
//         tempProduct.owner = this.currentAdminName; // 設置管理員名稱
//         const createdProduct = await this.adminProductStore.createProduct(tempProduct);

//         if (createdProduct && createdProduct.id) {
//             tempProduct.id = createdProduct.id;
//             console.log("新產品創建成功，ID:", tempProduct.id);
//         } else {
//             console.error("新產品創建失敗！");
//             return;
//         }

//         // **更新變體 ID**
//         tempProduct.variants.forEach((variant, index) => {
//             variant.id = tempProduct.id * 100 + (index + 1);
//         });

//         await this.adminProductStore.updateProduct(tempProduct);
//         this.productStore.addProduct(tempProduct);
//     }

//     if (modalType === 'edit') {
//         tempProduct.owner = this.currentAdminName;
//         await this.adminProductStore.updateProduct(tempProduct);
//         this.productStore.updateProduct(tempProduct);
//     }

//     if (modalType === 'delete') {
//         await this.adminProductStore.deleteProduct(tempProduct.id);
//         this.productStore.removeProduct(tempProduct.id);
//     }

//     this.adminProductStore.closeModal();
// },
async handleConfirm() {
    const { modalType, tempProduct } = this.adminProductStore;

    // **類別對應的 category_id** 應該放到toggleAddVariant裡
    const categoryMap = {
        '緊身衣': 1,
        '毛衣': 2,
        '玩具': 3,
        '配件': 4,
        '洋裝': 5,
        '緊身褲': 6
    };
    
    tempProduct.category_id = categoryMap[tempProduct.category];

    if (modalType === 'new' || modalType === 'edit') {
        tempProduct.owner = this.currentAdminName;

        // **確保變體 ID 計算正確**
        tempProduct.variants.forEach((variant, index) => {
            if (!variant.id) {
                variant.id = tempProduct.id * 100 + (index + 1);
            }
        });

        // ✅ **更新產品（包含變體）**
        await this.adminProductStore.updateProduct(tempProduct);
        this.productStore.updateProduct(tempProduct);
    }

    if (modalType === 'delete') {
        await this.adminProductStore.deleteProduct(tempProduct.id);
        this.productStore.removeProduct(tempProduct.id);
    }

    this.adminProductStore.closeModal();
},
    

        //增加列表圖片
        addImage() {
            if (this.newImageUrl.trim() !== '') {
                this.adminProductStore.tempProduct.variants.imagesurl.push(this.newImageUrl.trim());
                this.newImageUrl = ''; // 清空輸入框
            }
        },
        //刪除列表圖片
        removeImage(index) {
            this.adminProductStore.tempProduct.variants.imagesurl.splice(index, 1);
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
                // `is_enabled` 直接用 true/false 過濾(原本)
                // const matchesIsEnabled = is_enabled !== '' && is_enabled !== '2'
                //     ? product.is_enabled === (is_enabled === 'true')
                //     : true;
                    const matchesIsEnabled = is_enabled
                    ? product.is_enabled === (is_enabled === 'true' && 'false')
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
        // 3/11
        //新增變體按鈕（展開/收起）
        // toggleAddVariant() {
        //     this.adminProductStore.isAddingVariant = !this.adminProductStore.isAddingVariant; // 點擊時切換展開/收起
        //     if (this.adminProductStore.isAddingVariant) {
        //         // 如果是展開狀態，準備一個新的變體
        //         this.adminProductStore.newVariant = this.adminProductStore.getDefaultVariant();
        //         // this.newVariant = this.adminProductStore.getDefaultVariant();

        //     }
        // },
        // 3/11 新增變體按鈕
        // addVariant() {
        //     if (!this.adminProductStore.tempProduct.variants) {
        //         this.adminProductStore.tempProduct.variants = [];
        //     }
        
        //     // 確保變體有填入必要資訊
        //     if (!this.newVariant.name) {
        //         alert("請輸入變體名稱");
        //         return;
        //     }

        //     // 添加變體
        //     this.adminProductStore.tempProduct.variants.push({ ...this.newVariant });

        //     // 重置表單並收起變體區域
        //     this.isAddingVariant = false;
        // },
    

  
    },
    watch: {
        // 在新增編輯框架時自動填入管理員名稱(watch 監聽 modalType 變化並自動更新 tempProduct.owner)
        "adminProductStore.modalType"(newType) {
            if (newType === "new") {
                this.adminProductStore.tempProduct.owner = this.currentAdminName;
            }
        },
        "adminProductStore.groupedVariants": {
      handler(newVal) {
        console.log("🔄 groupedVariants 更新了:", newVal);
      },
      deep: true, // 監聽物件內部變化
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
        </div>
        <!-- 主要表格容器 商品列表 3/11-->
        <div class="w-full overflow-x-auto">
            <table class="w-full border border-gray-300">
                <thead class="bg-gray-200">
                    <tr>
                        <th class="px-4 py-2">上架</th>
                        <th class="px-4 py-2">商品編號</th>
                        <th class="px-4 py-2">圖片</th>
                        <th class="px-4 py-2">產品名稱</th>
                        <th class="px-4 py-2">標記</th>
                        <th class="px-4 py-2">原價</th>
                        <th class="px-4 py-2">售價</th>
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
                                     <!-- 變體列表 原本-->
                                    <!--  v-if="product && product.variants"-->
                                    <tbody>
                                        <!-- v-for="variant in product.variants" -->
                                        <!-- v-for="variant in sortedVariants" -->
                                        <tr v-for="variant in product.variants" :key="variant.id" class="bg-gray-100">
                                            <td><img v-for="(image,index) in variant.imagesurl" :key="index" :src="image" class="w-12 h-12 object-cover rounded mx-auto"></td>
                                            <td class="px-4 py-2">{{ variant.size }}</td>
                                            <td class="px-4 py-2">{{ variant.color }}</td>
                                            <td class="px-4 py-2">{{ variant.sellCount }}</td>
                                            <td class="px-4 py-2">{{ variant.count }}</td>
                                        </tr>
                                        <!-- {{ variant }} -->
                                    </tbody>

                                     <!-- 變體列表 -->
                                    <!--  v-if="product && product.variants"-->
                                    <!-- <tbody v-for="(variants, color) in adminProductStore.groupedVariants[product.id]" :key="color"> -->
                                        <!-- v-for="variant in product.variants" -->
                                        <!-- v-for="variant in sortedVariants" -->
                                        <!-- <tr v-for="variant in variants" :key="variant.id" class="bg-gray-100">
                                            <td><img v-for="(image,index) in variant.imagesurl" :key="index" :src="image" class="w-12 h-12 object-cover rounded mx-auto"></td>
                                            <td class="px-4 py-2">{{ variant.size }}</td>
                                            <td class="px-4 py-2">{{ variant.color }}</td>
                                            <td class="px-4 py-2">{{ variant.sellCount }}</td>
                                            <td class="px-4 py-2">{{ variant.count }}</td>
                                        </tr>
                                        {{ variant }} -->
                                    <!-- </tbody> -->
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
                            <div v-for="(url, index) in adminProductStore.tempProduct.variants.imagesurl" :key="index"  class=" mb-2">
                                <input 
                                    type="text" 
                                    v-model="adminProductStore.tempProduct.variants.imagesurl[index]" name=""id="" 
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
                        <!-- 列表圖片及時瀏覽 -->
                        <!-- <div>
                            <label for="">列表圖片及時瀏覽</label>
                            <div v-for="(image,index) in variant.imagesurl" :key="index" class="flex relative w-fit">
                                <img :src="image" alt="列表圖片" class="w-16 h-16 object-cover border">
                            </div>
                        </div> -->
                        
                        
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
                                <button @click="adminProductStore.addVariant" class="bg-green-500 text-white px-2 py-1 rounded">確認新增</button>
                                </div>
                            </div>
                            <!-- 新增後的顏色、尺寸列表 -->
                            <div v-if="Object.keys(adminProductStore.groupedVariants).length > 0">
                            <div v-for="(variants, color) in adminProductStore.groupedVariants" :key="color" class="border rounded-lg">
                               

                                <!-- 顏色標題區塊 -->
                                <div @click="toggleOpenColor(color)" class="p-4 bg-gray-200 cursor-pointer">
                                    <h2 class="text-xl font-bold">{{ color }}</h2>
                                </div>
                                <!-- 尺寸區塊 -->
                                <!-- adminProductStore.openColors.includes(color) -->
                                 <!-- adminProductStore.openColors === color -->
                                <div v-if="adminProductStore.openColors.includes(color)" class="p-4 bg-gray-100">
                                    <div v-for="(variant, index) in variants" :key="variant.id" class="p-2 border-b">
                                        <!-- 這個區塊是點擊時展開變體資訊 -->
                                        <div @click="toggleOpenSize(variant.id)" class="cursor-pointer flex justify-between items-center">
                                            <span>{{ variant.size }}</span>
                                            <button class="bg-red-500 text-white px-2 py-1 rounded" @click.stop="adminProductStore.removeVariant(variant.id)">刪除</button>
                                        </div>
  
                                        <!-- 展開編輯框 -->
                                         <!-- 這裡控制變體區塊是否展開 -->
                                        <!-- adminProductStore.openSizes.includes(variant.id) -->
                                         <!-- adminProductStore.openSizes === variant.id -->
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

                                            <!-- 圖片輸入 (最多 3 張) 2-->
                                            <div class="flex flex-col gap-2">
                                                <!-- (image, index) in variant.images -->
                                                <div v-for="(image,index) in variant.imagesurl" :key="index" class="flex relative w-fit">
                                                    <img :src="image" alt="變體圖片" class="w-16 h-16 object-cover border">
                                                    <button @click="adminProductStore.removeImage(variant, index)" class="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">X</button>
                                                </div>

                                                <input v-if="variant.imagesurl.length < 3" type="text" v-model="variant.newImage" placeholder="輸入圖片網址" class="border p-2">
                                                <button v-if="variant.imagesurl.length < 3" @click="adminProductStore.addImage(variant)" class="bg-blue-500 text-white px-2 py-1 rounded">
                                                    新增圖片
                                                </button>
                                                <p v-if="variant.imagesurl.length >= 3" class="text-red-500 text-sm">最多只能新增 3 張圖片 </p>
                                            </div>

                                            <!-- 圖片輸入 (最多 3 張) 原始版2--> 
                                            <div class="flex flex-col gap-2">
                                                <!-- (image, index) in variant.images -->
                                                <!-- <div v-for="(image,index) in variant.imagesurl" :key="index" class="flex relative w-fit">
                                                    <img :src="image" alt="變體圖片" class="w-16 h-16 object-cover border">
                                                    <button @click="adminProductStore.removeImage(variant, index)" class="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded">X</button>
                                                </div>

                                                <input v-if="variant.imagesurl.length < 3" type="text" v-model="variant.newImage" placeholder="輸入圖片網址" class="border p-2">
                                                <button v-if="variant.imagesurl.length < 3" @click="adminProductStore.addImage(variant)" class="bg-blue-500 text-white px-2 py-1 rounded">
                                                    新增圖片
                                                </button>
                                                <p v-if="variant.images.length >= 3" class="text-red-500 text-sm">最多只能新增 3 張圖片 </p> -->
                                            </div> 

                                            <div class="flex gap-2 mt-2">
                                                <button @click="adminProductStore.saveVariant(variant)" class="bg-green-500 text-white px-2 py-1 rounded">確認</button>
                                                <button @click="adminProductStore.toggleSizePanel(variant.id)" class="bg-gray-500 text-white px-2 py-1 rounded">取消</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <pre>{{adminProductStore.groupedVariants}}</pre>
                            </div>
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
  
    
</template>