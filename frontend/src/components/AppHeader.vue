<template>
  <div class="page__header">
    <div class="container">
      <div class="page__header__container">
        <button @click="$router.push('/')" class="transparent">
          <img src="https://frogs.fi/frogsfi.svg" alt="">
        </button>
        <!-- <ConnectButton /> -->
        <div v-if="$store.state.account"> {{ $store.state.account.toLowerCase() }} </div>
        <btn-primary class="btn btn-primary btnConnectWallet" @click="this.$emit('connect-wallet')" v-else>Connect
          Wallet</btn-primary>
      </div>
    </div>
  </div>
</template>


<script>

import { ConnectButton } from '@rainbow-me/rainbowkit';

export default {
  components: [
    ConnectButton
  ],
  props: {
    account: {
      type: String
    }
  },
  created() {
  }
}
</script>

<style scoped>
@import '@rainbow-me/rainbowkit/styles.css';

.page__header {
  padding: 30px 0;
  border-bottom: 2px solid olive;
}

.page__header__container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
</style>