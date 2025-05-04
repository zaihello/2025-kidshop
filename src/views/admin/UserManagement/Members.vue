<!-- level: "VIP會員" → 會員的等級（一般會員、VIP會員、尊貴會員） -->
<script>
import Pagination from '../../../components/front/shop/Pagination.vue'
import axios from 'axios';

export default {
  components:{Pagination},
  data() {
    return {
      memberAccounts: [],// 全部的會員資料
      showModal: false,
      modalType: 'new',
      tempMember: {
          name: "",
          email: "",
          password: "",
          phone:"",
          birthday:"",
          type:'member',
          role:'member',
          last_login:'',
          is_enabled: true,
      },
       // 分頁用
      currentPage: 1, // 當前頁數
      perPage: 10, // 每頁顯示幾筆
      displayedMembers: [],   // **當前頁面要顯示的會員員資料**
    };
  },
  computed:{
    // 總頁數
    totalPages(){
      return Math.ceil(this.memberAccounts.length / this.perPage)
    },
  },
  methods: {
    async getMembers() {
      try {
        // 先檢查 localStorage 是否有快取資料
        const cachedMembers = localStorage.getItem("memberAccounts");
        if (cachedMembers) {
            this.memberAccounts = JSON.parse(cachedMembers);
        }
        const { data } = await axios.get('https://204ed3432b06d7af.mokky.dev/users');
        this.memberAccounts = data.filter(user => user.type === 'member');

        // 存入 localStorage，確保刷新時仍能顯示資料
        localStorage.setItem("memberAccounts",JSON.stringify(this.memberAccounts))
        this.updateDisplayedMembers(); 
      } catch (err) {
        console.error('取得會員資料失敗:', err);
      }
    },
    //任一新增、編輯、刪除後，都要更新 當前頁面要顯示的會員資料
    updateDisplayedMembers(){
      const start = (this.currentPage - 1) * this.perPage
      const end = start + this.perPage
      this.displayedMembers = this.memberAccounts.slice(start,end)
    },
     //切換頁碼時，更新 displayedMembers(只顯示目前頁面要看的那幾筆)
     //page 參數，接到從子元件 emit 過來的值
    handlePageChange(page){
      this.currentPage = page
      this.updateDisplayedMembers()
    }, 
    openModal(type, member = null) {
      this.modalType = type;
      this.tempMember = member
        ? { ...member }
        : { ...this.tempMember};  
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    async confirmAction() {
      try {
        if (this.modalType === 'new') {
          await axios.post('https://204ed3432b06d7af.mokky.dev/users', this.tempMember);
        } else {
          await axios.patch(`https://204ed3432b06d7af.mokky.dev/users/${this.tempMember.id}`, this.tempMember);
        }
        this.updateDisplayedMembers()// 新增或編輯後更新顯示
        this.closeModal();
       
      } catch (err) {
        console.error('操作失敗:', err);
      }
    },
    async deleteMember(id) {
      if (confirm('確定要刪除此會員嗎？')) {
        try {
          await axios.delete(`https://204ed3432b06d7af.mokky.dev/users/${id}`);
          this.updateDisplayedMembers()// 刪除後更新顯示
        } catch (err) {
          console.error('刪除會員失敗:', err);
        }
      }
    },
    //會員停用/啟用
    async toggleStatus(member) {
      try {
        member.is_enabled = !member.is_enabled;
        await axios.patch(`https://204ed3432b06d7af.mokky.dev/users/${member.id}`, { is_enabled: member.is_enabled });
      } catch (err) {
        console.error('切換狀態失敗:', err);
      }
    }, 
   
  },
  mounted() {
    this.getMembers();
  },
 
};
</script>
<template>
  <div class="p-4 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-center">會員帳號管理</h1>

    <!-- 新增會員按鈕 -->
    <div class="flex justify-end mb-4">
      <button @click="openModal('new')" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow">
        新增會員
      </button>
    </div>

    <!-- 桌機版 Table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full table-auto border rounded-lg shadow">
        <thead class="bg-gray-100">
          <tr class="text-gray-700 text-sm">
            <th class="px-6 py-3 text-left">名稱</th>
            <th class="px-6 py-3 text-left">Email</th>
            <th class="px-6 py-3 text-left">手機號碼</th>
            <th class="px-6 py-3 text-left">會員等級</th>
            <th class="px-6 py-3 text-left">狀態</th>
            <th class="px-6 py-3 text-left">最後登入時間</th>
            <th class="px-6 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in displayedMembers" :key="member.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4">{{ member.name }}</td>
            <td class="px-6 py-4">{{ member.email }}</td>
            <td class="px-6 py-4">{{ member.phone }}</td>
            <td class="px-6 py-4">{{ member.level }}</td>
            <td class="px-6 py-4">
              <span :class="member.is_enabled ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">
                {{ member.is_enabled ? '啟用' : '停用' }}
              </span>
            </td>
            <td class="px-6 py-4">{{ member.last_login }}</td>
            <td class="px-6 py-4 flex justify-center space-x-2">
              <button @click="openModal('edit', member)" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow">編輯</button>
              <button @click="deleteMember(member.id)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow">刪除</button>
              <button @click="toggleStatus(member)" class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded shadow">
                {{ member.is_enabled ? '停用' : '啟用' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 手機版 卡片-->
    <div class="grid gap-4 md:hidden">
      <div v-for="member in displayedMembers" :key="member.id" class="bg-white p-4 rounded-lg shadow-md border">
        <div class="mb-2">
          <span class="font-semibold">名稱：</span>{{ member.name }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">Email：</span>{{ member.email }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">手機號碼：</span>{{ member.phone }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">會員等級：</span>{{ member.level }}
        </div>
        <div class="mb-2">
          <span class="font-semibold">狀態：</span>
          <span :class="member.is_enabled ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">
            {{ member.is_enabled ? '啟用' : '停用' }}
          </span>
        </div>
        <div class="mb-2">
          <span class="font-semibold">最後登入：</span>{{ member.last_login }}
        </div>
        <div class="flex justify-end space-x-2 mt-4">
          <button @click="openModal('edit', member)" class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow">編輯</button>
          <button @click="deleteMember(member.id)" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow">刪除</button>
          <button @click="toggleStatus(member)" class="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded shadow">
            {{ member.is_enabled ? '停用' : '啟用' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 分頁 Pagination -->
    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      @pageChange="handlePageChange"
    />

    <!-- 新增/編輯會員 Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
        <h2 class="text-2xl font-bold mb-4 text-center">{{ modalType === 'new' ? '新增會員' : '編輯會員' }}</h2>

        <div class="space-y-3">
          <input v-model="tempMember.name" type="text" placeholder="名稱" class="border p-2 w-full rounded" />
          <input v-model="tempMember.email" type="email" placeholder="Email" class="border p-2 w-full rounded" />
          <input v-model="tempMember.phone" type="text" placeholder="手機號碼" class="border p-2 w-full rounded" />
          <input v-model="tempMember.password" type="password" placeholder="密碼" class="border p-2 w-full rounded" />
        </div>

        <div class="flex justify-end mt-6 space-x-2">
          <button @click="closeModal" class="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded shadow">取消</button>
          <button @click="confirmAction" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow">確認</button>
        </div>
      </div>
    </div>
  </div>
</template>




  