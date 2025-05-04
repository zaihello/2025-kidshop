<!-- Home/全部商品/緊身褲 組件-->

<template>
    <nav class="text-gray-600 mb-4" aria-label="breadcrumb">
      <ol class="list-reset flex">
        <!-- Home Link -->
        <li>
          <router-link :to="homeLink" class="text-blue-500 hover:underline">Home</router-link>
        </li>

        <!-- Breadcrumb Items -->
        <li v-for="(breadcrumb, index) in breadcrumbs" :key="index" class="flex items-center">
          <span class="mx-2">/</span>
          <div v-if="breadcrumb.action">
            <a 
              @click.prevent="handleClick(breadcrumb.action)"
              href="#"
              class="text-blue-500 hover:underline"
            >
              {{ breadcrumb.label }}
            </a>
          </div>
          <div v-else>
            <span class="text-gray-700 font-medium">{{ breadcrumb.label }}</span>
          </div>
        </li>
      </ol>
    </nav>
  </template>
  
  <script>
  export default {
    props: {
      // Home link path
      homeLink: {
        type: String,
        default: '/',
      },
      // Breadcrumb items: array of objects with { label, link, action }
      breadcrumbs: {
        type: Array,
        required: true,
      },
    },
    methods: {
      handleClick(action) {
        if (typeof action === 'function') {
          action();
        }
      },
    },
  };
  </script>
  
  