<template>
  <div class="modal" v-if="show" @click="hideModal">
    <div class="modal-content" @click.stop>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import toggleMixin from "@/mixins/toggleMixin";

export default {
  name: "modal",
  mixins: [toggleMixin]
}
</script>

<style scoped>
  .modal{
    top:0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0,0,0,.5);
    position: fixed;
    display: flex;
    z-index: 99999;
  }

  .modal-content{
    margin: auto;
    background: white;
    min-height: 50px;
    padding: 30px;
  }
</style>