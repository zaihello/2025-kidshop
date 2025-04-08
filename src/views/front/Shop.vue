<script>
import axios from 'axios'

import CategorySwiper from '../../components/swiper/CategorySwiper.vue'

// import CardList from '../../components/front/CardList.vue';
import ProductList from '../../components/front/shop/ProductList.vue';

export default {
  components: {CategorySwiper,ProductList},
  //提供   
  provide(){
    return{
        // addToCart:this.addToCart,//方法
        // addToWishlist:this.addToWishlist,//方法
        // isInCart:this.isInCart,//方法
    }
  },
  data() {
    return {
        // cartItems: [], // 已加入購物車的商品 ID
    };
  },
  
  methods: {
    // 檢查商品是否已在購物車中
    // isInCart(productId) {
    //   return this.cartItems.includes(productId);
    // },

    
    // async addToCart(product) {
    //         const token = localStorage.getItem("token");
    //         // 1.檢查是否登入
    //         if (!token) {
    //             alert("請登入以將商品加入您的購物車!");
    //             // 
    //             this.$router.push('/login')
    //             return;
    //         }
    //         // 已加入購物車，執行移除
    //         if (this.isInCart(product.id)) {
                
    //             try {
    //                 await axios.delete(
    //                     `https://204ed3432b06d7af.mokky.dev/cart/${product.id}`, // 假設 API 支援通過商品 ID 移除購物車
    //                     { headers: { Authorization: `Bearer ${token}` } }
    //                 );
    //                 // 從本地購物車狀態中移除
    //                 this.cartItems = this.cartItems.filter(id => id !== product.id);
    //                 alert("已從購物車移除!");
    //             } catch (error) {
    //                 console.error("Failed to remove from cart", error);
    //                 alert("移除失敗，請稍後再試。");
    //             }
    //             // 尚未加入購物車，執行加入
    //         } else{
    //             try {
    //                 await axios.post('https://204ed3432b06d7af.mokky.dev/cart', 
    //                 { 
    //                     product_Id: product.id,
    //                     product_Name: product.name,
    //                     product_Price: product.price, 
    //                     product_Image: product.imgurl       
    //                 },
    //                 // user_id
    //                 { headers: { Authorization: `Bearer ${token}` } }
    //                 );
    //                 // 更新本地購物車狀態
    //                 this.cartItems.push(product.id);
    //                 alert("已加入購物車!");
    //             } catch (error) {
    //                 console.error("Failed to add to cart", error);
    //                 alert("加入購物車失敗，請稍後再試!");
    //             }
    //         }
    // },
    // 追蹤商品先登入
    // 這裡的參數可以不用(v-for="item in sortedItems")的item,另訂名稱
    // async addToWishlist(product) {
    //   const token = localStorage.getItem("token");
    //   if (!token) {
    //     alert("請登入以將商品新增至您的願望清單!");
    //     // 
    //     this.$router.push('/login')
    //     return;
    //   }
    //   try {
    //     await axios.post('https://204ed3432b06d7af.mokky.dev/wishes', 
    //       { product_Id: product.id,
    //         product_Name: product.name,
    //         product_Price: product.price, 
    //         product_Image: product.imgurl
    //       },
    //       { headers: { Authorization: `Bearer ${token}` } }
    //     );
    //     alert("已新增至願望清單!");
    //   } catch (error) {
    //     console.error("Failed to add to wishlist", error);
    //   }
    // },
   //訂購商品先登入
    // async addToCart(product) {
    //     try {
    //         const token = localStorage.getItem("token");
    //         if (!token) {
    //             alert("請登入以將商品加入您的購物車!");
    //             this.$router.push('/login'); // 導向登入頁
    //             return;
    //         }

    //         // 判斷商品是否已加入購物車
    //         if (!product.isInCart) {
    //             const payload = {
    //                 product_id: product.id,
    //                 product_Name: product.name,
    //                 product_Price: product.price,
    //                 product_Image: product.imgurl,
    //             }
    //         // 發送加入購物車的請求
    //         // 加入購物車：設定 `isInCart` 為 true 並保存伺服器返回的購物車項目 ID
    //         const { data } = await axios.post(
    //             'https://204ed3432b06d7af.mokky.dev/carts',
    //             payload,
    //             { headers: { Authorization: `Bearer ${token}` } }
    //         );
    //         // 加入購物車成功，更新狀態
    //         product.isInCart = true;
    //         product.cartItemId = data.id; // 假設伺服器返回的購物車項目 ID 是 `id`
    //         alert("商品已加入購物車!");

    //         } else {
    //             // 發送移除購物車的請求
    //         // 移除購物車：刪除伺服器中的對應購物車項目，並重置 `isInCart`
    //         await axios.delete(
    //             `https://204ed3432b06d7af.mokky.dev/carts/${product.cartItemId}`,
    //             { headers: { Authorization: `Bearer ${token}` } }
    //         );
    //             // 移除購物車成功，更新狀態
    //         product.isInCart = false;
    //         product.cartItemId = null;
    //         alert("商品已從購物車移除!");
    //         }
    //     } catch (error) {
    //         console.error("購物車操作失敗:", error);
    //     }
    // },
    // 追蹤商品先登入
    // async addToWishlist(product){
    //     try{
    //         const token = localStorage.getItem('token')
    //         if(!token){
    //             alert("請登入以將商品加入您的追蹤清單!")
    //             // 導向登入頁
    //             this.$router.push('/login')
    //             return
    //         }

    //         // 判斷商品是否已在追蹤清單中
    //         if(!product.isInWishlist){
    //             const payload = {
    //                 // 
    //                 product_id:product.id,
    //                 category:product.category,
    //                 name:product.name,
    //                 imageurl:product.imgurl,
    //                 //自動生成id 和 user_id 
    //             }
    //             // 發送加入追蹤清單的請求
    //             const { data } = await axios.post(
    //                 `https://204ed3432b06d7af.mokky.dev/hearts`,
    //                 payload,
    //                 { headers: { Authorization: `Bearer ${token}` } }
    //             )
    //             // 加入追蹤清單成功，更新狀態
    //             product.isInWishlist = true;
    //             product.wishlistItemId = data.id;// 假設伺服器返回項目 ID 是 `id`
    //             alert("商品已加入追蹤清單!");

    //         }else{
    //             // 發送移除追蹤清單的請求
    //             await axios.delete(
    //                `https://204ed3432b06d7af.mokky.dev/hearts/${product.wishlistItemId}`,
    //                { headers: { Authorization: `Bearer ${token}` } } 
    //             )
    //             // 移除追蹤清單成功，更新狀態
    //             product.isInWishlist = false,
    //             product.wishlistItemId = null,
    //             alert('商品已從追蹤清單移除!')
    //         }
    //     }catch(error){
    //         console.error("追蹤清單操作失敗:", error);
    //     }
    // }

  },
 
}
</script>
<template>
    <div class="min-h-screen flex flex-col">
        <!-- 頭:版型寬度 -->
        <!-- <div class="w-full 2xl:w-3/4 2xl:m-auto">
            <CategorySwiper/>
        </div> -->

        <!-- 新版 -->
        <div>
            <!-- <ProductList :products="products" :colorClass="colorClass" :markBackgroundColor="markBackgroundColor"/> -->
            <ProductList/>
        </div>   
        
        
        <!-- 中:版型寬度class="w-full 2xl:w-3/4 2xl:m-auto flex justify-between" -->
         <div >
            <!-- class="lg:w-1/4" -->
            <div >
                <!-- <SidebarFilter/> -->
            </div>
            <!-- class="w-full lg:w-3/4" -->
            <!-- <div >
                <CardList :products="products" :colorClass="colorClass" :markBackgroundColor="markBackgroundColor"/>
            </div> -->
        </div> 
       
        
       
        
    </div>
</template>