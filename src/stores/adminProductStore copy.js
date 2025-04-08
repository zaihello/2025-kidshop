import { defineStore } from 'pinia'
import { useProductStore } from '../stores/productStore'
import axios from 'axios'

export const useAdminProductStore = defineStore('adminProductStore',{
    state:()=>({
        adminProducts: [], // 存放後台的產品數據
        // itemsPerPage: 10, // 每頁商品數量
        // currentPage: 1,
        //資料要擴充修改這裡就好
        sizeOptions:['0 - 3 Months','3 - 6 Months','6 - 12 Months'],
        colorOptions:['Blue', 'Brown', 'Gray', 'Green', 'Pink', 'Silver', 'Yellow'],
        markOptions: ['HOT', 'NEW'],
        categoryOptions:['緊身衣','毛衣','玩具','配件','洋裝','緊身褲'],
        // tempProduct: null,//原本
        tempProduct: {}, // 儲存選擇的option(一開始設為 null，避免誤用未初始化的資料)
        //視窗狀態在store統一管理，是要在AdminHome使用
        showProductModal: false,// 新增/編輯視窗的開關
        showDeleteModal: false,// 刪除視窗的開關
        modalType: '',// 'new' | 'edit' | 'delete'
        discountInput: null, // 儲存折扣輸入

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
        // 計算總頁數
        // totalPages: (state) => Math.ceil(state.adminProducts.length / state.itemsPerPage) || 1,
        // 計算當前分頁的產品
        // paginatedProducts: (state) => {
        //     const start = (state.currentPage - 1) * state.itemsPerPage;
        //     return state.adminProducts.slice(start, start + state.  itemsPerPage);
        // },
        //新增/編輯/刪除視窗開的true
        isModalOpen: (state) =>{
            return    state.showDeleteModal || state.showProductModal
        },
        

    },    
    actions:{
        //獲取後端商品數據並在 localStorage 存商品資料
        async getAdminProducts() {
            try {
                // 先檢查 localStorage 是否有快取資料，在取出資料
                const cachedProducts = localStorage.getItem("adminProducts");
                if (cachedProducts) {
                    this.adminProducts = JSON.parse(cachedProducts);
                }
                //dev/products
                const response = await axios.get("https://204ed3432b06d7af.mokky.dev/product");
  
                // 儲存所有商品
                this.adminProducts = response.data
                    .map(product => ({
                        id: product.id || null,
                        name: product.name || "",
                        imgurl: product.imgurl,
                        color: Array.isArray(product.color) ? product.color : [],
                        size: Array.isArray(product.size) ? product.size : [],
                        mark: Array.isArray(product.mark) ? product.mark : [],
                        price: product.price || null,
                        OriginalPrice: product.OriginalPrice || null,
                        category: product.category || "未分類",
                        is_enabled: Boolean(product.is_enabled), // 統一轉換成 true/false
                        // is_enabled: product.is_enabled, // 直接保留 0 或 1
                        // is_enabled: product.is_enabled ? 1 : 0, // 確保 is_enabled 為數字

                        description: product.description || "",
                        imagesurl:Array.isArray(product.imagesurl) ? product.imagesurl : [],  
                        
                        //擴充屬性
                        count: product.count || 0,
                        sellCount: product.sellCount || 0,
                        owner: product.owner || "Admin User",
                        updatedAt:product.updatedAt || '',
                        is_expired:product.is_expired,
                        startDate:product.startDate,
                        endDate:product.endDate,   
                }))   
                    // is_enabled: product.is_enabled == 1, // 轉換成 true 或 false
  
                // 在 localStorage 存商品資料，這樣即使頁面刷新，商品也能立即顯示：
                localStorage.setItem("adminProducts", JSON.stringify(this.adminProducts)); // 存入快取
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        },
        
        // 設定頁碼，確保不超過範圍
        // handlePageChange(page) {
        //     if (page < 1) page = 1;
        //     if (page > this.totalPages) page = this.totalPages;
        //     this.currentPage = page;
        // },
        // 標籤的切換邏輯
        toggleMark(tempProduct, mark) {
            const index = tempProduct.mark.indexOf(mark);
            if (index === -1) {
                tempProduct.mark.push(mark);
            } else {
                tempProduct.mark.splice(index, 1);
            }
        },
        
        //更新商品 上架/下架 狀態
        async updateProductStatus(productId, newStatus) {
            try {
                // const status = newStatus ? 1 : 0; // 確保發送時是數字dev/products
              await axios.patch(`https://204ed3432b06d7af.mokky.dev/product/${productId}`, { is_enabled: newStatus });
              const product = this.adminProducts.find(p => p.id === productId);
              if (product) {
                product.is_enabled = newStatus; // 更新前後端統一 true/false
                // product.is_enabled = status; // 更新前端狀態
              }
            } catch (error) {
              console.error('更新產品狀態失敗:', error);
            }
        },
        


        // 確認新增商品按鈕
        async createProduct(product) {
            try {
                //dev/products
                const response = await axios.post('https://204ed3432b06d7af.mokky.dev/product', product);
                this.adminProducts.push(response.data);
            } catch (error) {
                console.error('新增產品失敗', error);
            }
        },
        //確認編輯更新按鈕
        async updateProduct(product) {
            try {
                const updatedProduct = {
                    ...product,
                    updatedAt: this.formatTaiwanTime() // 每次更新都記錄當下時間(一定要寫在updateProduct裡)
                };
                //// 1. **更新後端 API**dev/products
                const response = await axios.patch(`https://204ed3432b06d7af.mokky.dev/product/${product.id}`, updatedProduct);
                // await axios.patch(`https://204ed3432b06d7af.mokky.dev/products/${product.id}`, updatedProduct);
                //// 2. **更新後台的 `adminProducts` 陣列**
                const index = this.adminProducts.findIndex(p => p.id === product.id);
                if (index !== -1) {
                    // ...product
                    this.adminProducts[index] = { ...response.data };// 更新後台商品資料
                }

                 // 3. **同步更新前台 `productStore.products`**
                const productStore = useProductStore();
                productStore.updateProduct(response.data); // 讓前台即時更新商品資訊
            } catch (error) {
                console.error('更新產品失敗', error);
            }
        },
        
        // 確認刪除產品按鈕
        async deleteProduct(productId) {
            try {
                //dev/products
                await axios.delete(`https://204ed3432b06d7af.mokky.dev/product/${productId}`);
                this.adminProducts = this.adminProducts.filter(p => p.id !== productId);
            } catch (error) {
                console.error('刪除產品失敗', error);
            }
        },
        //開啟新增產品、編輯產品、刪除產品視窗
        //(type,product = {} )
        openModal(type,product = {}) {
            this.modalType = type;

            if (type === 'new') {
                this.tempProduct = this.getDefaultProduct(); // 使用預設值
                this.discountInput = null;  // 新增商品時清空折扣
                // this.tempProduct.updatedAt = this.formatTaiwanTime();  // 在此加入當前時間
                this.showProductModal = true;
            }


            if (type === 'edit') {
                this.tempProduct = { ...this.getDefaultProduct(), ...product };// 建立一個完整的預設資料，再用 product 的資料覆蓋(也能保證 tempProduct 擁有所有預設欄位，避免出現 undefined)
        
                // 從 mark 中提取折扣數字 (例如 "-30%" → 30)
                const discountMark = this.tempProduct.mark.find(mark => /^-\d+%$/.test(mark));
                this.discountInput = discountMark ? parseInt(discountMark.replace(/-|%/g, '')) : null;

                // 格式化 updatedAt 為台灣時間
                // this.tempProduct.updatedAt = this.formatTaiwanTime(new Date(product.updatedAt));
                // this.tempProduct.updatedAt =this.formatTaiwanTime()
        
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
        // 儲存選擇的option設定預設值避免出現 undefined 的錯誤，可能無法正確雙向綁定。tempProduct若直接使用空物件 {}，每次使用都必須確保先初始化所有屬性，增加維護成本，且容易漏掉某些欄位。
        getDefaultProduct() {
          
            return {
                id: '',
                name: '',
                price: 0,
                OriginalPrice: 0,
                category: '',
                is_enabled:true, // 統一改成 true/false
                description: '',
                size: [],
                color: [],
                mark: [],
                imgurl: '',
                imagesurl: [],
                count: 0,  // 庫存數量
                sellCount: 0, // 銷售數量

                // 擴充屬性
                count: 0,                 // 庫存數量
                sellCount: 0,             // 銷售數量
                owner: 'Admin User',      // 預設管理員
                updatedAt:this.formatTaiwanTime(), //更新時間
                is_expired:'', //
                startDate:'',
                endDate:'',
               
            };
        },
        //因為折扣在mark陣列裡，所以獨立一個函式
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
    }
})