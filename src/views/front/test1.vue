<template>
  <div>
    <h1>測試頁</h1>

    <teleport to="#main-footer">
      <div style="color: green;">這段插入在 Footer</div>
    </teleport>

    <teleport to="#global-modals">
      <div class="fixed top-0 right-0 bg-red-200 p-3">這是彈窗</div>
    </teleport>
  </div>
</template>
