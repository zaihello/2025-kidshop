import { defineStore } from 'pinia'
import { useAdminAuthStore } from '../stores/adminAuthStore'
import axios from 'axios'

export const useAdminProductStore = defineStore('adminProductStore',{
    state:()=>({
        products:[], // 前台商品資料 
        adminProducts: [], // 存放後台的產品數據
        //資料要擴充修改這裡就好(不可移到別處)
        sizeOptions:['0 - 3 Months','3 - 6 Months','6 - 12 Months','F'],
        colorOptions:['Blue', 'Brown', 'Gray', 'Green', 'Pink', 'Silver', 'Yellow'],
        markOptions: ['HOT', 'NEW'],
        categoryOptions:['緊身衣','毛衣','玩具','配件','洋裝','緊身褲'],
        
        //視窗狀態在store統一管理，是要在AdminHome使用
        showProductModal: false,// 新增/編輯視窗的開關
        showDeleteModal: false,// 刪除視窗的開關
        modalType: '',// 'new' | 'edit' | 'delete'
        discountInput: null, // 儲存折扣輸入

        isAddingVariant: false,
        newVariant: { color: '', size: ''},//儲存新增變體的color、size的值
        openColors: [],//儲存被展開的變體color AdminProductModal.vue會使用到
        openSizes: [],//儲存被展開的變體size
        //儲存當前的數據
        tempProduct: {
            id: null,//預設 null，確保不會影響計算
            category: '',
            category_id: null,
            name: '',
            price: null,
            OriginalPrice: null,
            mark:[],
            imgurl: '',
            description: '',
            is_enabled: true,
            owner: '',
            updatedAt: '',
            startDate: '',
            endDate: '',
            is_expired: '',//''未過期
            colors:[
                {
                    color:'',
                    imageurl:'',
                    newImage:'',
                }
            ],
            variants: [
                {
                    id: '',
                    size: '',
                    color: '',
                    count: 0, // 庫存數量
                    sellCount: 0 ,// 銷售數量
                    is_enabled: true,
                    owner: '', // 預設管理員
                    updatedAt: '', // 更新時間
                }
            ],
        },
    }),
    getters:{
        // 取得全部產品（包含 is_enabled = false 的）
        allProducts: (state) => state.adminProducts,
        // 啟用的產品
        enabledProducts: (state) => state.adminProducts.filter(p => p.is_enabled === true),
        // 計算所有商品數量
        totalProductCount:(state)=>state.adminProducts.length,
        // 計算啟用的產品數量
        enabledProductCount: (state) => state.adminProducts.filter(p => p.is_enabled === true).length,
       
        //新增/編輯/刪除視窗開的true
        isModalOpen: (state) =>{
            return   state.showDeleteModal || state.showProductModal
        },
    },    
    actions:{
        // 取得前台商品資料(啟用的商品)
        async getProducts() {
            try {

                // 先檢查 localStorage 是否有快取資料
            const cachedProducts = localStorage.getItem("products");
            if (cachedProducts) {
                this.products = JSON.parse(cachedProducts);
            }
            const response = await axios.get("https://204ed3432b06d7af.mokky.dev/product");
            this.products = response.data.filter(product => product.is_enabled); // 只保留啟用的商品
            console.log('getProducts',this.products)
            localStorage.setItem("products", JSON.stringify(this.products)); // 儲存商品資料到 localStorage
            } catch (error) {
            console.error("Error fetching products:", error);
            }
        },
        //獲取後端商品數據並在 localStorage 存商品資料
        async getAdminProducts() {
            try {
                // 先檢查 localStorage 是否有快取資料，在取出資料
                const cachedProducts = localStorage.getItem("adminProducts");
                if (cachedProducts) {
                    this.adminProducts = JSON.parse(cachedProducts);
                }
                
                const response = await axios.get("https://204ed3432b06d7af.mokky.dev/product");
  
                // 儲存所有商品
                this.adminProducts = response.data

                
                // 在 localStorage 存商品資料，這樣即使頁面刷新，商品也能立即顯示：
                localStorage.setItem("adminProducts", JSON.stringify(this.adminProducts)); // 存入快取
                console.log('adminProducts',this.adminProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        },
       
        //更新商品 上架/下架 狀態 更新 `is_enabled` 和 `is_expired`
        async updateProductStatus(productId, newStatus) {
            try {
                const product = this.adminProducts.find(p => p.id === productId);
                if (!product) return;
        
                const now = new Date();
                let isExpired = 0; // 預設為 0（未過期）
        
                if (product.endDate) {
                    const productEndDate = new Date(product.endDate + 'T23:59:59');
                    if (productEndDate < now) {
                        isExpired = 1; // 若 `endDate` 過去，則標記為過期
                    }
                }
        
                // **確保 `is_expired` 值正確**
                console.log("更新的 is_expired:", isExpired, "類型:", typeof isExpired);
        
                // **發送 API 更新 `is_enabled` 和 `is_expired`**
                await axios.patch(`https://204ed3432b06d7af.mokky.dev/product/${productId}`, {
                    is_enabled: newStatus,
                    is_expired: isExpired 
                });
        
                // **更新前端資料**
                product.is_enabled = newStatus;
                product.is_expired = isExpired; // 確保前端同步更新
        
            } catch (error) {
                console.error('更新產品狀態失敗:', error);
            }
        },
    
        // 確認主產品新增商品按鈕
        async createProduct(product) {
            try {
                const response = await axios.post('https://204ed3432b06d7af.mokky.dev/product', product);
                this.adminProducts.push(response.data);
                return response.data; // ✅ 回傳 API 回應
            } catch (error) {
                console.error('新增產品失敗', error);
                return null; // 確保發生錯誤時不回傳 `undefined`
            }
        },

        //確認主產品 + 變體 編輯更新按鈕 
        async updateProduct(product) {
            try {
                const updatedProduct = {
                    ...product,
                    updatedAt: this.formatTaiwanTime() // 每次更新都記錄當下時間(一定要寫在updateProduct裡)
                };

                console.log("即將送出的 updatedProduct:", JSON.stringify(updatedProduct, null, 2));

                //// 1. **更新後端 API**dev/products
                const response = await axios.patch(`https://204ed3432b06d7af.mokky.dev/product/${product.id}`, updatedProduct);
               
                //// 2. **更新後台的 `adminProducts` 陣列**
                const index = this.adminProducts.findIndex(p => p.id === product.id);
                if (index !== -1) {
                    // ...product
                    this.adminProducts[index] = { ...response.data };// 更新後台商品資料
                }

                console.log("即將更新的 product.id:", product.id);

                // 更新 localStorage
                localStorage.setItem("products", JSON.stringify(this.products));
                // console.log("前台 productStore 更新後:", JSON.stringify(productStore.products, null, 2));
            } catch (error) {
                console.error('更新產品失敗', error.response?.data || error.message);
            }
        },
        
        
        // 確認 主產品 + 變體 刪除產品按鈕 
        async deleteProduct(productId) {
            try {
                await axios.delete(`https://204ed3432b06d7af.mokky.dev/product/${productId}`);
                this.adminProducts = this.adminProducts.filter(p => p.id !== productId);
                
                localStorage.setItem("products", JSON.stringify(this.products));
            } catch (error) {
                console.error('刪除產品失敗', error);
            }
                
        },
        //開啟新增產品、編輯產品、刪除產品視窗
        openModal(type,product = {}) {
            this.modalType = type;

            if (type === 'new') {
                this.tempProduct = this.getDefaultProduct(); // 使用預設值
                this.discountInput = null;  // 新增商品時清空折扣
                this.showProductModal = true;
            }


            if (type === 'edit') {
                this.tempProduct = { ...this.getDefaultProduct(), ...product};// 建立一個完整的預設資料，再用 product 的資料覆蓋(也能保證 tempProduct 擁有所有預設欄位，避免出現 undefined)
                // 讓 Vue 追蹤陣列變更
                this.tempProduct.variants = product.variants ? product.variants.map(v => ({ ...this.getDefaultVariant(), ...v })) : [];
                this.tempProduct.variants = [...this.tempProduct.variants];
                // 從 mark 中提取折扣數字 (例如 "-30%" → 30)
                const discountMark = this.tempProduct.mark.find(mark => /^-\d+%$/.test(mark));

                
                this.discountInput = discountMark ? parseInt(discountMark.replace(/-|%/g, '')) : null;

                this.showProductModal = true;
            }

            if (type === 'delete') {
                this.tempProduct = { id: product.id, name: product.name }; // 刪除時只需產品 ID 和名稱
                this.showDeleteModal = true;
            }
        },
        //關閉新增產品、編輯產品、刪除產品視窗 和 取消按鈕
        closeModal() {
            this.showProductModal = false;
            this.showDeleteModal = false;
            this.tempProduct = null; // 關閉時重置，避免資料殘留
        },
     
        //'收起變體' : '新增變體'按鈕，在這先創建主產品，因為才能產生變體的id
        async toggleAddVariant() {
            // **如果主產品還沒有 ID，先創建主產品**
            if (!this.tempProduct.id) {
                console.warn("主產品尚未創建，將自動創建主產品...");
                 // **類別對應的 category_id**
        
                try {
                    const createdProduct = await this.createProduct(this.tempProduct); // **等待 API 回應**
                    if (createdProduct && createdProduct.id) {
                        this.tempProduct.id = createdProduct.id; // **確保 ID 正確**
                        console.log("主產品創建成功，ID:", this.tempProduct.id);
                    } else {
                        console.error("主產品創建失敗，未取得有效 ID");
                        return;
                    }
                } catch (error) {
                    console.error("主產品創建失敗:", error);
                    return;
                }
            }
        
            // **如果主產品已經存在，直接切換新增變體區塊**
            this.isAddingVariant = !this.isAddingVariant;
        },
        //尺寸 的取消按鈕
        toggleSizePanel(id) {
            const index = this.openSizes.indexOf(id);
            if (index > -1) {
                // 如果 openSizes 陣列中已經有該 ID，則移除
              this.openSizes.splice(index, 1);
            } else {
              this.openSizes.push(id);
            }
        },
        //新增變體按鈕 創建變體+英文字母ul排序
        addVariant() {
            if (!this.newVariant.color || !this.newVariant.size) {
                alert("請選擇顏色和尺寸");
                return;
            }
             // 找到對應的顏色物件
            const selectedColorObj = this.tempProduct.colors.find(color => color.color === this.newVariant.color);

            // 確保該顏色已經有圖片
            if (!selectedColorObj || !selectedColorObj.imageurl.trim()) {
                alert("請輸入圖片網址");
                return;
            }
           
             // **檢查變體是否已經有相同的顏色和尺寸**
            const exists = this.tempProduct.variants.some(variant => 
                variant.color === this.newVariant.color && variant.size === this.newVariant.size
            );
            if (exists) {
                alert("該變體已經存在，請勿重複新增！");
                return;
            }
          
            // **生成 `id`（確保不重複）**
            let newId;
            do {
                newId = this.tempProduct.id * 100 + Math.floor(Math.random() * 90 + 10);
            } while (this.tempProduct.variants.some(variant => variant.id === newId));
           
            // **新增變體**
            this.tempProduct.variants.push({ 
                id: newId, 
                ...this.newVariant, 
                count: 0, 
                sellCount: 0, 
                is_enabled: true,
                // newImage: '', //輸入變體的圖片網址 確保 v-model 可用(api沒有) 
            });

           
            // **如果 `colors` 陣列沒有這個顏色，就加入**
            if (!this.tempProduct.colors.some(colorObj => colorObj.color === this.newVariant.color)) {
                this.tempProduct.colors.push({
                    color: this.newVariant.color,
                    imageurl: '' // 可預留圖片欄位
                });    
            }
             // **💡 在這裡直接排序 `colors`，讓顏色按英文字母排序**(新增變體的英文排序ul)
            this.tempProduct.colors.sort((a, b) => a.color.localeCompare(b.color));
             // **重新排序變體**增加變體後沒排序，順序可能亂掉(點擊商品名稱下的變體)
            this.sortVariants();
            // 重置 `newVariant`
            this.newVariant = { color: '', size: ''};
         
            // 關閉新增區塊
            this.isAddingVariant = false;

        },
      
        //刪除變體
        removeVariant(id) {
            this.tempProduct.variants = this.tempProduct.variants.filter(v => v.id !== id);

            // **重新排序變體**刪除變體後沒排序，順序可能亂掉(點擊商品名稱下的變體)
            this.sortVariants();
        },
        //變體**排序：「顏色 > 尺寸」**
        sortVariants() {
            const sizeOrder = ["0 - 3 Months", "3 - 6 Months", "6 - 12 Months", "F"];
            this.tempProduct.variants.sort((a, b) => {
                 // 先比較顏色（字母排序）
                if (a.color !== b.color) {
                    return a.color.localeCompare(b.color);
                }
                // 再比較尺寸（字母排序）
                return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
            });
        },
        
       
        //變體確認按鈕，更新變體資料，但不發送 API
        saveVariant(updatedVariant) {
            const index = this.tempProduct.variants.findIndex(v => v.id === updatedVariant.id);
            if (index > -1) {
                this.tempProduct.variants[index] = { ...updatedVariant };
                
                // ✅ 更新 UI：點擊確認後，關閉該變體的 UI
                const sizeIndex = this.openSizes.indexOf(updatedVariant.id);
                if (sizeIndex > -1) {
                    this.openSizes.splice(sizeIndex, 1);
                }
            }
        },
         //主要產品的初始化
        getDefaultProduct() {
            const adminAuthStore = useAdminAuthStore(); // 取得目前登入的管理者
            return {
                id: 0,//'' 設0為number型態
                category:'',
                category_id:'',
                name: '',
                price: 0,
                OriginalPrice: 0,
                mark:[],
                is_enabled: true, // 統一改成 true/false
                description: '',
                imgurl: '',
                owner: adminAuthStore.adminName || '未知管理員', // ✅ 自動帶入
                updatedAt: this.formatTaiwanTime(), // 更新時間
                is_expired: false,//false未過期
                startDate: '',
                endDate: '',
                variants: [], // 變體列表
                colors:[],
            };
        },
        //變體的初始化
        getDefaultVariant() {
            const adminAuthStore = useAdminAuthStore(); // 同樣取得管理者
            return {
                id:0,//''
                size: '',
                color: '',
                count: 0, // 庫存數量
                sellCount: 0 ,// 銷售數量
                is_enabled: true,
                owner: adminAuthStore.adminName || '未知管理員', // ✅ 自動帶入 目前登入的管理者是哪位
                updatedAt: this.formatTaiwanTime(), // 更新時間
            };
        },
        //送出的資料 格式化成api格式(若格式不一樣要使用)
        formatProductData(product) {
            return {
                id: product.id,//id: product.id || null
                category: product.category,
                category_id: product.category_id,
                name: product.name,
                price: product.price || 0,//null
                OriginalPrice: product.OriginalPrice,
                imgurl: product.imgurl,
                description: product.description,
                is_enabled: product.is_enabled,
                owner: product.owner,
                updatedAt: new Date().toISOString().split('T')[0],
                startDate: product.startDate,
                endDate: product.endDate,
                is_expired: product.is_expired ?? false , // 確保 boolean 值 product.is_expired ?? false
                mark: product.mark,
                variants: (product.variants).map((variant) => ({
                        id: variant.id,
                        size: variant.size,
                        color: variant.color,
                        count: variant.count,
                        sellCount: variant.sellCount,
                        is_enabled: variant.is_enabled,
                        updatedAt: new Date().toISOString().split('T')[0],
                })),
                colors:product.colors

            };
        },
        //格式化台灣時間
        formatTaiwanTime(date = new Date()) {
            //hour12: false 確保使用 24 小時制
            const [datePart, timePart] = date.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', hour12: false })
                                             .replace(/\//g, '-')// 將日期中的斜線改為 -
                                             .replace(', ', ' ')// 移除逗號，變成 YYYY-MM-DD HH:mm 格式
                                             .split(' ');
            const [year, month, day] = datePart.split('-').map(num => num.padStart(2, '0'));//year, month, day補零
            const [hours, minutes] = timePart.split(':');
        
            return `${year}-${month}-${day} ${hours}:${minutes}`;//格式
        },
        //因為折扣在mark陣列裡，所以獨立一個函式計算
        handleDiscountChange() {
            const discount = this.discountInput;
            const discountMark = `-${discount}%`;
            const product = this.tempProduct;
    
            if (!product) return; // 防止 tempProduct 為 null
    
            // 移除現有的折扣標籤
            product.mark = product.mark.filter(mark => !/^-\d+%$/.test(mark));
    
            // 如果有輸入折扣，加入新的折扣標籤
            if (discount && discount > 0) {
                product.mark.push(discountMark);
            }

            this.calculateDiscountedPrice(); // 折扣改變時，計算售價
        },
        // 在原價或折扣變動時自動計算售價
        calculateDiscountedPrice() {
            const product = this.tempProduct;
            const discount = this.discountInput;
    
            if (product && product.OriginalPrice && discount >= 0) {
                const discountedPrice = product.OriginalPrice * (1 - discount / 100);
                product.price = Math.round(discountedPrice); // 四捨五入
            } else {
                product.price = product.OriginalPrice; // 沒有折扣時售價等於原價
            }
        },
    }
})