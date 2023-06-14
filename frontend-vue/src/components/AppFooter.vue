<template>
  <div class="page__footer">
    <div class="container">
      <div class="page__footer__container">
        <button @click="$router.push('/')" class="transparent">
          <img src="https://frogs.fi/frogsfi.svg" alt="">
        </button>
        <nav>
          <btn-link @click="$router.push('/')">Lottery</btn-link> |
          <btn-link @click="$router.push('/test/')">TestNet</btn-link> |
          <btn-link @click="$router.push('/cake/')">PanCake</btn-link> |
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {}

}
</script>

<style scoped>
  .page__footer{
    padding:30px 0;
    border-top: 2px solid olive;
  }

  .page__footer__container{
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
</style>