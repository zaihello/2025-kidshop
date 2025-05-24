<template>
  <div class="p-6">
    <button @click="show = !show" class="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
      切換顯示區塊
    </button>

    <transition name="fade">
      <div v-if="show" class="p-4 bg-gray-100 border rounded">
        👋 這是一個淡入淡出的區塊
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true,
    };
  },
};
</script>

<style>
/* 注意不要加 scoped */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
