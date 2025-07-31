import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useWishlistStore } from './stores/wishlistStore'
import './style.css'
import App from './App.vue'

// 不要用createMemoryHistory頁面會出不來
// import { createRouter, createWebHistory } from 'vue-router'

import { createRouter, createWebHashHistory } from 'vue-router'


import FrontLayout from './views/FrontLayout.vue'
import Home from './views/front/Home.vue'
import Shop from './views/front/Shop.vue' 
import Contact from './views/front/Contact.vue'
import About from './views/front/About.vue'
import Blog from './views/front/Blog.vue'
import CategorySwiper from './components/swiper/CategorySwiper.vue'
import Login from './views/front/Login.vue'
import SignUp from './views/front/SignUp.vue'
import ProductDetails from './components/front/ProductDetails.vue'
import AccountHome from './views/front/AccountHome.vue'
import AccountWishes from './views/front/AccountWishes.vue'
import AccountCoupons from './views/front/AccountCoupons.vue'
import AccountPoints from './views/front/AccountPoints.vue'
import AccountOrders from './views/front/AccountOrders.vue'
import BackLayout from './views/BackLayout.vue'
import AdminLayout from './views/admin/AdminLayout.vue'
import AdminLogin from './views/admin/AdminLogin.vue'
import ProductList from './views/admin/ProductsManagement/ProductList.vue'
import ProductsManagement from './views/admin/ProductsManagement/ProductsManagement.vue'
import OrdersManagement from './views/admin/OrdersManagement/OrdersManagement.vue'
import OrderList from './views/admin/OrdersManagement/OrderList.vue'
import UserManagement from './views/admin/UserManagement/UserManagement.vue'
import Admins from './views/admin/UserManagement/Admins.vue'
import Members from './views/admin/UserManagement/Members.vue'
import MarketingManagement from './views/admin/MarketingManagement/MarketingManagement.vue'
import CouponAdmin from './views/admin/MarketingManagement/CouponAdmin.vue'
import FreeShippingAdmin from './views/admin/MarketingManagement/FreeShippingAdmin.vue'

import CartList from './views/front/CartList.vue'
import PayList from './views/front/PayList.vue'
import OrderDone from './views/front/OrderDone.vue'
import AccountOrderDetails from './views/front/AccountOrderDetails.vue'
import CreditPayPage from './views/front/CreditPayPage.vue'
// import AdminOrderDetail from './views/admin/OrdersManagement/AdminOrderDetail.vue'

import test1 from './views/front/test1.vue'



import AddCouponModal from './components/AddCouponModal.vue'
import { comment } from 'postcss'


const routes = [
   
    {
        path:'/',
        name:'FrontLayout',
        component:FrontLayout,
        // redirect:'/shop',//點擊/admin轉跳到此頁
        children:[
            {
                path:'test1',
                name:'test1',
                component:test1,
            },
            {
                path:'AddCouponModal',
                name:'AddCouponModal',
                component:AddCouponModal
            },
            {
                path:'',
                name:'Home',
                component:Home
            },
            {
                path:'shop',
                name:'Shop',
                component:Shop
            },
            {
                path:'contact',
                name:'Contact',
                component:Contact
            },
            {
                path:'about',
                name:'About',
                component:About
            },
            {
                path:'blog',
                name:'Blog',
                component:Blog
            },
            {
                path:'categoryswiper',
                name:'CategorySwiper',
                component:CategorySwiper
            },
            {
                path:'login',
                name:'Login',
                component:Login
            },
            {
                path:'signup',
                name:'SignUp',
                component:SignUp
            },
            {
                path:'product/:id',
                name:'ProductDetails',
                component:ProductDetails
            },

            //使用者帳號管理頁面
            {
                path:'account',
                name:'AccountHome',
                component:AccountHome,
                redirect:'/account/wishes',// 預設導向到追蹤清單
                children:[
                    {
                        path:'wishes',
                        name:'AccountWishes',
                        component:AccountWishes
                    },
                    {
                        path:'coupons',
                        name:'AccountCoupons',
                        component:AccountCoupons
                    },
                    {
                        path:'points',
                        name:'AccountPoints',
                        component:AccountPoints
                    },
                    {
                        path:'orders',
                        name:'AccountOrders',
                        component:AccountOrders
                    },
                    //
                    {
                        path:'orders/:id',
                        name:'AccountOrderDetails',
                        component:AccountOrderDetails
                    },

                ]
        
            },
            //我的購物車
            {
                path:'cart',
                redirect:'/cart/cartlist',
                children:[
                    //購物清單頁面
                    {
                        path:'cartlist',                        
                        name:'CartList',
                        component:CartList
                    },
                    //填寫資料頁面
                    {
                        path:'paylist',
                        name:'PayList',
                        component:PayList
                    },
                    //credit付款頁面
                    {
                        path:'paylist/credit/:id',
                        name:'CreditPayPage',
                        component:CreditPayPage
                    },
                  
                    //訂購完成頁面
                    {
                        path:'orderdone',
                        name:'OrderDone',
                        component:OrderDone
                    },
                ]
            },
            
        ]
       
    },
    //後台管理管理
    {
        path:'/admin',
        name:'BackLayout',
        component:BackLayout,//頭部框架
        children:[
            {
                path:'login',
                name:'AdminLogin',
                component:AdminLogin
            },
            {   
                path:'',
                component:AdminLayout,// 側邊選單的主要 Layout
                redirect:'/admin/products',//點擊/admin轉跳到此頁
                children:[
                    // 產品管理
                    {
                        path:'products',
                        component:ProductsManagement,// 產品管理首頁
                        children:[
                            {
                                path:'',
                                name: 'ProductList',
                                component:ProductList
                            },
                        ]
                    },
                    // 訂單管理
                    {
                        path:'orders',
                        component: OrdersManagement, // 訂單管理首頁
                        children:[
                            {
                                path:'',
                                name: 'OrderList',
                                component:OrderList,
                            },
                            // {
                            //     path:'/:id',
                            //     name: 'AdminOrderDetail',
                            //     component:AdminOrderDetail,
                            // },

                        ]
                    },
                    // 用戶管理
                    {
                        path:'users',
                        component: UserManagement, // 用戶管理首頁
                        children:[
                            {
                                path:'admins',
                                name: 'Admins',
                                component:Admins,
                            },
                            {
                             path:'members',
                                name: 'Members',
                                component:Members,
                            },

                        ]
                    },
                    //行銷管理   
                    {
                        path:'marketing',
                        component:MarketingManagement,
                        children:[
                            {
                                path:'coupons',
                                name:'CouponAdmin',
                                component:CouponAdmin,
                            },
                            {
                                path:'freeshipping',
                                name:'FreeShippingAdmin',
                                component:FreeShippingAdmin,
                            },

                        ]
                    },


                ]
      
       
            },
        ]
    },
    
]


const app = createApp(App)
const pinia = createPinia();

// const router = createRouter({
//     history:createWebHistory(),
//     routes
// })

const router = createRouter({
    history: createWebHashHistory(), // ← 改成 hash 模式
    routes,
  })
  

// 註冊 Pinia 和 Router
app.use(router)
app.use(pinia);


// 將 Router 傳遞給 Store
// const wishlistStore = useWishlistStore(); 5/4
// wishlistStore.setRouter(router);



app.mount('#app')

