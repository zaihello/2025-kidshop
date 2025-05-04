<!--  -->
<script> 
import Pagination from '../../../components/front/shop/Pagination.vue'
import axios from 'axios'

export default {
  components:{Pagination},
  data() {
    return {
      adminAccounts: [],// 全部的管理員資料
      showModal: false,
      modalType: 'new',
      tempAdmin: {
        name: '',
        email: '',
        password: '',
        role: 'admin',
        type: 'admin',
      },
      // 分頁用
      currentPage: 1, // 當前頁數
      perPage: 10, // 每頁顯示幾筆
      displayedAdmins: [],   // **當前頁面要顯示的管理員資料**
    };
  },
  computed: {
    
    // 總頁數
    totalPages() {
      return Math.ceil(this.adminAccounts.length / this.perPage);
    },
   
  },
  methods: {
    async getAdmins() {
      try {
        const cachedAdmins = localStorage.getItem("adminAccounts");
        if (cachedAdmins) {
          this.adminAccounts = JSON.parse(cachedAdmins);
        }
        const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/users`);
        this.adminAccounts = data
          .filter(user => user.type === 'admin')
          .map(admin => ({ ...admin }));

        localStorage.setItem("adminAccounts", JSON.stringify(this.adminAccounts));
        this.updateDisplayedAdmins(); // 取得最新資料後更新顯示
      } catch (err) {
        console.log('取得管理員資料失敗:', err);
      }
    },
    //任一新增、編輯、刪除後，都要更新 當前頁面要顯示的管理員資料
    updateDisplayedAdmins() {
      const start = (this.currentPage - 1) * this.perPage;
      const end = start + this.perPage;
      this.displayedAdmins = this.adminAccounts.slice(start, end);
    },
    //切換頁碼時，更新 displayedAdmins(只顯示目前頁面要看的那幾筆)
    handlePageChange(page) {
      this.currentPage = page;
      this.updateDisplayedAdmins();
    },
    openModal(type, admin = {}) {
      this.modalType = type;
      this.tempAdmin = type === 'edit' ? { ...admin } : { ...this.tempAdmin };
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async confirmAction() {
      try {
        if (this.modalType === 'new') {
          const { data } = await axios.post(`https://204ed3432b06d7af.mokky.dev/register`, this.tempAdmin);
          this.adminAccounts.push(data);
        } else {
          await axios.patch(`https://204ed3432b06d7af.mokky.dev/users/${this.tempAdmin.id}`, this.tempAdmin);
          const { data } = await axios.get(`https://204ed3432b06d7af.mokky.dev/users/${this.tempAdmin.id}`);
          const index = this.adminAccounts.findIndex(a => a.id === this.tempAdmin.id);
          if (index !== -1) this.adminAccounts.splice(index, 1, { ...this.tempAdmin });
        }
        this.updateDisplayedAdmins(); // 新增或編輯後更新顯示
        this.closeModal();
      } catch (err) {
        console.log('儲存管理員資料失敗:', err);
      }
    },
    async deleteAdmin(id) {
      if (confirm('確定要刪除這個管理員嗎？')) {
        try {
          await axios.delete(`https://204ed3432b06d7af.mokky.dev/users/${id}`);
          this.adminAccounts = this.adminAccounts.filter(admin => admin.id !== id);
          this.updateDisplayedAdmins(); // 刪除後更新顯示
          // 如果刪到空頁，回到上一頁
          // if (this.paginatedAdmins.length === 0 && this.currentPage > 1) {
          //   this.currentPage--;
          // }

        } catch (err) {
          console.log('刪除管理員失敗:', err);
        }
      }
    },
   
  },
  mounted() {
    this.getAdmins();
  }
};
</script>
<template>
  <div class="p-4">
    <h1 class="text-3xl font-bold mb-6 text-center">管理員帳號管理</h1>

    <!-- 新增管理員按鈕 -->
    <div class="flex justify-end mb-4">
      <button @click="openModal('new')" class=" bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow">
        新增管理員
      </button>
    </div> 
    <!-- 手機版卡片式 -->
    <div class="grid gap-4 md:hidden">
      <div v-for="admin in displayedAdmins" :key="admin.id" class="border rounded-lg shadow p-4">
        <div class="mb-2">
          <span class="font-semibold">名稱：</span>{{ admin.name }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">Email：</span>{{ admin.email }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">角色：</span>{{ admin.role }}
        </div>
        <div class="flex gap-2 mt-4">
          <button @click="openModal('edit', admin)" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
            編輯
          </button>
          <button @click="deleteAdmin(admin.id)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
            刪除
          </button>
        </div>
      </div>
    </div>

    <!-- 桌機版表格 -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full table-auto border rounded-lg shadow">
        <thead class="bg-gray-100">
          <tr class="text-gray-700">
            <th class="px-6 py-3 text-left">名稱</th>
            <th class="px-6 py-3 text-left">Email</th>
            <th class="px-6 py-3 text-left">角色</th>
            <th class="px-6 py-3 text-left">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in displayedAdmins" :key="admin.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4">{{ admin.name }}</td>
            <td class="px-6 py-4">{{ admin.email }}</td>
            <td class="px-6 py-4">{{ admin.role }}</td>
            <td class="px-6 py-4 flex gap-2">
              <button @click="openModal('edit', admin)" class="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
                編輯
              </button>
              <button @click="deleteAdmin(admin.id)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                刪除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁 Pagination -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @pageChange="handlePageChange"
    />
    <!--  Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 class="text-xl font-bold mb-4">{{ modalType === 'new' ? '新增管理員' : '編輯管理員' }}</h2>

        <input v-model="tempAdmin.name" type="text" placeholder="名稱" class="border p-2 w-full mb-3" />
        <input v-model="tempAdmin.email" type="email" placeholder="Email" class="border p-2 w-full mb-3" />
        <input v-model="tempAdmin.password" type="password" placeholder="密碼" class="border p-2 w-full mb-3" />
        <select v-model="tempAdmin.role" class="border p-2 w-full mb-4">
          <option value="superadmin">超級管理員</option>
          <option value="admin">一般管理員</option>
        </select>

        <div class="flex justify-end gap-2">
          <button @click="closeModal" class="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded">
            取消
          </button>
          <button @click="confirmAction" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
            確認
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

