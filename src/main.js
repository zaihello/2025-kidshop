import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useWishlistStore } from './stores/wishlistStore'
import './style.css'
import App from './App.vue'

// 不要用createMemoryHistory頁面會出不來
import { createWebHistory, createRouter } from 'vue-router'

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
import AccountOrders from './views/front/AccountOrders.vue'
import BackLayout from './views/BackLayout.vue'
// import AdminHome from './views/admin/AdminHome.vue'
import AdminLayout from './views/admin/AdminLayout.vue'
import AdminLogin from './views/admin/AdminLogin.vue'
import ProductList from './views/admin/ProductsManagement/ProductList.vue'
import ProductsManagement from './views/admin/ProductsManagement/ProductsManagement.vue'
import OrdersManagement from './views/admin/OrdersManagement/OrdersManagement.vue'
import OrderList from './views/admin/OrdersManagement/OrderList.vue'
import UserManagement from './views/admin/UserManagement/UserManagement.vue'
import Admins from './views/admin/UserManagement/Admins.vue'
import Members from './views/admin/UserManagement/Members.vue'

import CartList from './views/front/CartList.vue'
import PayList from './views/front/PayList.vue'
import OrderDone from './views/front/OrderDone.vue'
import test from './views/front/test.vue'
import test2 from './views/front/test2.vue'
import test3 from './views/front/test3.vue'




const routes = [
   
    {
        path:'/',
        name:'FrontLayout',
        component:FrontLayout,
        children:[
            {
                path:'test3',
                name:'test3',
                component:test3
            },    
            {
                path:'test2',
                name:'test2',
                component:test2
            },    

            {
                path:'test',
                name:'test',
                component:test
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
            //帳號管理頁面
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
                        path:'orders',
                        name:'AccountOrders',
                        component:AccountOrders
                    }
                ]
        
            },
            //我的購物車
            {
                path:'cart',
                redirect:'/cart/cartlist',
                children:[
                    {
                        path:'cartlist',                        
                        name:'CartList',
                        component:CartList
                    },
                    {
                        path:'paylist',
                        name:'PayList',
                        component:PayList
                    },
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
        redirect:'/admin/products',
        children:[
            {
                path:'login',
                name:'AdminLogin',
                component:AdminLogin
            },
           
            {   
                path:'',
                component:AdminLayout,// 側邊選單的主要 Layout
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
                            }
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

                ]
      
       
            },
        ]
    },
    //後台管理管理
    // {   path:'/admin',
    //     // name:'AdminLayout',
    //     // component:AdminLayout,// 這個是後台的主要 Layout
    //     component:AdminHome,
    //     // redirect:'/admin/adminhome',// 預設導向到AdminHome
    //     children:[
    //         {
    //             path:'login',
    //             name:'AdminLogin',
    //             component:AdminLogin
    //         },
    //         // 產品管理
    //         {
    //             path:'products',
    //             // name:'AdminLayout',
    //             component:ProductsManagement,// 產品管理首頁
    //             // redirect:'/admin/adminlayout',// 預設導向到adminproductsmanagement
    //             children:[
    //                 {
    //                     path:'',
    //                     name: 'ProductList',
    //                     component:ProductList
    //                 },
    //             ]
    //         },
    //         // 訂單管理
    //         {
    //             path:'orders',
    //             component: OrdersManagement, // 訂單管理首頁
    //             children:[
    //                 {
    //                     path:'',
    //                     name: 'OrderList',
    //                     component:OrderList,
    //                 }
    //             ]
    //         },
    //          // 用戶管理
    //         {
    //             path:'users',
    //             component: UserManagement, // 用戶管理首頁
    //             children:[
    //                 {
    //                     path:'admins',
    //                     name: 'Admins',
    //                     component:Admins,
    //                 },
    //                 {
    //                     path:'members',
    //                     name: 'Members',
    //                     component:Members,
    //                 },

    //             ]
    //         },

    //     ]
      
       
    // },
]


const app = createApp(App)
const pinia = createPinia();

const router = createRouter({
    history:createWebHistory(),
    routes
})

// 註冊 Pinia 和 Router
app.use(router)
app.use(pinia);


// 將 Router 傳遞給 Store
const wishlistStore = useWishlistStore();
// wishlistStore.setRouter(router);



app.mount('#app')

