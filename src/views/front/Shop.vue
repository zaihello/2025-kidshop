<script>
import CategorySwiper from '../../components/swiper/CategorySwiper.vue'
import ProductList from '../../components/front/shop/ProductList.vue';

export default {
  components: {CategorySwiper,ProductList},
}
</script>
<template>
    <div class="min-h-screen flex flex-col">
        <!-- 頭:版型寬度class="w-full 2xl:w-3/4 2xl:m-auto -->
        <div>
            <ProductList/>
        </div>     
    </div>
</template>