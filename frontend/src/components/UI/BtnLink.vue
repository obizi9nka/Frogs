<template>
  <button>
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: "btn-link"
}
</script>

<style scoped>
  button{
    background: none;
    border:none;
    color:olive;
    border-bottom: 1px dashed;
    padding: 0;
  }
</style>