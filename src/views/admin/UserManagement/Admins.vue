<script>
import axios from 'axios'

export default {
  data() {
    return {
      adminAccounts: [],
      showModal: false,
      modalType: 'new',
      tempAdmin: {
        name: '',
        email: '',
        password: '',
        role: 'admin',
        type:'admin',
      },
    };
  },
  methods: {
    async getAdmins(){
        try{
            // 先檢查 localStorage 是否有快取資料
            const cachedAdmins = localStorage.getItem("adminAccounts");
            if (cachedAdmins) {
                this.adminAccounts = JSON.parse(cachedAdmins);
            }
            // 發送 API 請求獲取最新管理員資料
            const { data } =await axios.get(`https://204ed3432b06d7af.mokky.dev/users`)
  
            // 過濾出 type 為 'admin' 的管理者
            this.adminAccounts = data
              .filter( user => user.type=== 'admin')// 先過濾出 type 為 'admin' 的 user
              .map(admin => ({...admin}))// 再複製 admin 物件
           
            
            // 存入 localStorage，確保刷新時仍能顯示資料
            localStorage.setItem("adminAccounts",JSON.stringify(this.adminAccounts))
        }catch(err){
            console.log('取得管理員資料失敗:', err);
        }
    },
    openModal(type, admin = {}) {
      this.modalType = type;
      this.tempAdmin = type === 'edit' ? { ...admin } : { ...this.tempAdmin }; 
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    //新增/編輯管理員
    // async confirmAction() {
    //   try{
    //     if (this.modalType === 'new') {
    //         const { data } = await axios.post(`https://204ed3432b06d7af.mokky.dev/register`, this.tempAdmin); 
    //          // 手動補上 type: 'admin'
    //         //  this.adminAccounts.push({
    //         //     ...data,
    //         //     type: 'admin',
    //         //     role_type:'admin',
    //         //     phone:'0123'
    //         // }); 
    //         console.log("新增後回傳的資料:", data); // 這裡檢查是否包含 type
    //     // this.tempAdmin.id = Date.now();
    //         this.adminAccounts.push(data);// API 回傳新管理員資料後，加入 adminAccounts 陣列
    //     } else {
    //         await axios.patch(`https://204ed3432b06d7af.mokky.dev/users/${this.tempAdmin.id}`, this.tempAdmin);
    //         // 從後端拿更新後的資料
    //         const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/users/${this.tempAdmin.id}`);
    //         console.log("更新後的資料:", data); // 這裡檢查是否包含 type
    //         // 手動補上 type: 'admin'
    //         const index = this.adminAccounts.findIndex(a => a.id === this.tempAdmin.id);//更新資料
    //         if (index !== -1) this.adminAccounts.splice(index, 1, { ...data, type: 'admin' });
    //         // if (index !== -1) this.adminAccounts.splice(index, 1, { ...this.tempAdmin });
    //     }
    //     this.closeModal();
    //   }catch(err){
    //     console.log('儲存管理員資料失敗:', err);
    //   }  
      
    // },
    async confirmAction() {
      try{
        if (this.modalType === 'new') {
            const { data } = await axios.post(`https://204ed3432b06d7af.mokky.dev/register`, this.tempAdmin); 

            console.log("新增後回傳的資料:", data); // 這裡檢查是否包含 type
        // this.tempAdmin.id = Date.now();
            this.adminAccounts.push(data);// API 回傳新管理員資料後，加入 adminAccounts 陣列
        } else {
            await axios.patch(`https://204ed3432b06d7af.mokky.dev/users/${this.tempAdmin.id}`, this.tempAdmin);
            // 從後端拿更新後的資料
            const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/users/${this.tempAdmin.id}`);
            console.log("更新後的資料:", data); // 這裡檢查是否包含 type
           
            const index = this.adminAccounts.findIndex(a => a.id === this.tempAdmin.id);//更新資料
            if (index !== -1) this.adminAccounts.splice(index, 1, { ...this.tempAdmin });
        }
        this.closeModal();
      }catch(err){
        console.log('儲存管理員資料失敗:', err);
      }  
      
    },

    //刪除管理員
    async deleteAdmin(id) {
      if (confirm('確定要刪除這個管理員嗎？')) {
        try{
            await axios.delete(`https://204ed3432b06d7af.mokky.dev/users/${id}`); 
            this.adminAccounts = this.adminAccounts.filter(admin => admin.id !== id);       
        }catch(err){
            console.log('刪除管理員失敗:', err);
        }
       
      }
    },
   
  },
  mounted(){
    this.getAdmins(); // 頁面載入時取得管理員列表
  }
};
</script>

<template>
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">管理員帳號管理</h1>
  
      <!-- 新增管理員按鈕 -->
      <button @click="openModal('new')" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">新增管理員</button>
  
      <!-- 管理員列表 -->
      <table class="w-full border">
        <thead>
          <tr class="bg-gray-200">
            <th class="p-2">名稱</th>
            <th class="p-2">Email</th>
            <th class="p-2">角色</th>
            <th class="p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in adminAccounts" :key="admin.id" class="border-t">
            <td class="p-2">{{ admin.name }}</td>
            <td class="p-2">{{ admin.email }}</td>
            <td class="p-2">{{ admin.role }}</td>
            <td class="p-2">
              <button @click="openModal('edit', admin)" class="bg-yellow-500 text-white px-2 py-1 rounded mr-2">編輯</button>
              <button @click="deleteAdmin(admin.id)" class="bg-red-500 text-white px-2 py-1 rounded">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- 新增/編輯管理員 Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-4 rounded w-96">
          <h2 class="text-xl font-bold mb-4">{{ modalType === 'new' ? '新增管理員' : '編輯管理員' }}</h2>
          <input v-model="tempAdmin.name" type="text" placeholder="名稱" class="border p-2 w-full mb-2" />
          <input v-model="tempAdmin.email" type="email" placeholder="Email" class="border p-2 w-full mb-2" />
          <input v-model="tempAdmin.password" type="password" placeholder="密碼" class="border p-2 w-full mb-2" />
          <select v-model="tempAdmin.role" class="border p-2 w-full mb-2">
            <option value="superadmin">超級管理員</option>
            <option value="admin">一般管理員</option>
          </select>
          <div class="flex justify-end">
            <button @click="closeModal" class="bg-gray-300 px-4 py-2 rounded mr-2">取消</button>
            <button @click="confirmAction" class="bg-blue-500 text-white px-4 py-2 rounded">確認</button>
          </div>
        </div>
      </div>
    </div>
</template>

<!-- <style scoped>
th, td {
  text-align: center;
}
</style>
   -->
