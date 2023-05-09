<template>
  <input :value="modelValue" @input="updateInput" type="text">
</template>

<script>
export default {
  name: "InputText",
  props : {
    modelValue : [String, Number]
  },
  methods : {
    updateInput(event) {
      this.$emit('update:modelValue', event.target.value)
    }
  }
}
</script>

<style scoped>

</style>