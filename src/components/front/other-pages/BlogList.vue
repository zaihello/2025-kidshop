<script>
import axios from 'axios';

export default {
  data() {
    return {
      blogs: [],
    };
  },
  methods: {
    async grtBloglist() {
      try {
        const response = await axios.get('https://204ed3432b06d7af.mokky.dev/blogs');
        this.blogs = response.data;
      } catch (err) {
        console.log('Error fetching blogs:', err);
      }
    },
  },
  mounted() {
    this.getBloglist();
  },
};
</script>
<template>
    
</template>