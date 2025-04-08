<!-- level: "VIP會員" → 會員的等級（一般會員、VIP會員、尊貴會員） -->
<script>
import axios from 'axios';

export default {
  data() {
    return {
      memberAccounts: [],
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
    //   tempMember: {}
    };
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
      } catch (err) {
        console.error('取得會員資料失敗:', err);
      }
    },
    openModal(type, member = null) {
      this.modalType = type;
    //   this.tempMember = member
    //     ? { ...member }
    //     : { name: '', email: '', password: '', is_enabled: true, type: 'user' };
      this.tempMember = member
        ? { ...member }
        : { ...this.tempMember};  
      this.showModal = true;
    },
    async confirmAction() {
      try {
        if (this.modalType === 'new') {
          await axios.post('https://204ed3432b06d7af.mokky.dev/users', this.tempMember);
        } else {
          await axios.patch(`https://204ed3432b06d7af.mokky.dev/users/${this.tempMember.id}`, this.tempMember);
        }
        this.getMembers();
        this.showModal = false;
      } catch (err) {
        console.error('操作失敗:', err);
      }
    },
    async deleteMember(id) {
      if (confirm('確定要刪除此會員嗎？')) {
        try {
          await axios.delete(`https://204ed3432b06d7af.mokky.dev/users/${id}`);
          this.getMembers();
        } catch (err) {
          console.error('刪除會員失敗:', err);
        }
      }
    },
    async toggleStatus(member) {
      try {
        member.is_enabled = !member.is_enabled;
        await axios.patch(`https://204ed3432b06d7af.mokky.dev/users/${member.id}`, { is_enabled: member.is_enabled });
      } catch (err) {
        console.error('切換狀態失敗:', err);
      }
    },
    closeModal() {
      this.showModal = false;
    },
   
  },
  mounted() {
    this.getMembers();
  },
 
};
</script>

<template>
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">會員帳號管理</h1>
  
      <!-- 新增會員按鈕 -->
      <button @click="openModal('new')" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">新增會員</button>
  
      <!-- 會員列表 -->
      <table class="w-full border">
        <thead>
          <tr class="bg-gray-200">
            <th class="p-2">名稱</th>
            <th class="p-2">Email</th>
            <th class="p-2">手機號碼</th>
            <th class="p-2">會員等級</th>
            <th class="p-2">狀態</th>
            <th class="p-2">最後登入時間</th>
            <th class="p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in memberAccounts" :key="member.id" class="border-t">
            <td class="p-2">{{ member.name }}</td>
            <td class="p-2">{{ member.email }}</td>
            <td class="p-2">{{ member.phone }}</td>
            <td class="p-2">{{ member.level }}</td>
            <td class="p-2">
              <span :class="member.is_enabled ? 'text-green-500' : 'text-red-500'">
                {{ member.is_enabled ? '啟用' : '停用' }}
              </span>
            </td>
            <td class="p-2">{{ member.last_login}}</td>
            <td class="p-2">
              <button @click="openModal('edit', member)" class="bg-yellow-500 text-white px-2 py-1 rounded mr-2">編輯</button>
              <button @click="deleteMember(member.id)" class="bg-red-500 text-white px-2 py-1 rounded">刪除</button>
              <button @click="toggleStatus(member)" class="bg-gray-500 text-white px-2 py-1 rounded ml-2">
                {{ member.is_enabled ? '停用' : '啟用' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- 新增/編輯會員 Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-4 rounded w-96">
          <h2 class="text-xl font-bold mb-4">{{ modalType === 'new' ? '新增會員' : '編輯會員' }}</h2>
          <input v-model="tempMember.name" type="text" placeholder="名稱" class="border p-2 w-full mb-2" />
          <input v-model="tempMember.email" type="email" placeholder="Email" class="border p-2 w-full mb-2" />
          <input v-model="tempMember.phone" type="text" placeholder="手機號碼" class="border p-2 w-full mb-2">
          <input v-model="tempMember.password" type="password" placeholder="密碼 " class="border p-2 w-full mb-2" />
          <div class="flex justify-end">
            <button @click="closeModal" class="bg-gray-300 px-4 py-2 rounded mr-2">取消</button>
            <button @click="confirmAction" class="bg-blue-500 text-white px-4 py-2 rounded">確認</button>
          </div>
        </div>
      </div>
    </div>
</template>  

<style>
/* 簡單樣式 */
.enabled { color: green; }
.disabled { color: red; }
</style>
 
  