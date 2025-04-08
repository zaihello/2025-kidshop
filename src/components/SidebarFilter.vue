

<script>
  export default {
    data() {
      return {
        isMenuOpen: false, // 控制導航列開關
        priceRange: [0, 500], // 預設價格範圍
        colors: {
          Blue: 5,
          Brown: 2,
          Gray: 2,
          Green: 1,
          Pink: 3,
          Silver: 1,
          Yellow:3,
        },
        sizes: {
          "0 - 3 Months": 5,
          "3 - 6 Months": 3,
          "6 - 12 Months": 2,
        },
      };
    },
    methods: {
      applyPriceFilter() {
        alert(`Filtering by price: £${this.priceRange[0]} — £${this.priceRange[1]}`);
      },
      //切換漢堡選單開關
      toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
      },
      closeMenu() {
        this.isMenuOpen = false;
      },
    },
    computed: {
      menuClass() {
        return this.isMenuOpen ? "translate-x-0" : "-translate-x-full";
    },
  },

  };
</script>
  
  <style scoped>
  /* TailwindCSS already provides utility classes, so no custom styles are needed. */
  </style>
  