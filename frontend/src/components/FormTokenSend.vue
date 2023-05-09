<template>
  <form @submit.prevent class="admin-form">
    <input
        v-model="tokenSendModel.address"
        placeholder="Address"
        class="input"
    />
    <input
        v-model="tokenSendModel.amount"
        placeholder="Amount"
        class="input"
    />
    <button @click="tokenSend">Send TCake</button>
  </form>
</template>

<script>
export default {
  data() {
    return {
      tokenSendModel : {
        address: '',
        amount: '',
      }
    }
  },
  methods : {
    tokenSend(){
      if(confirm('Send ' + this.tokenSendModel.amount + 'tCake to ' + this.tokenSendModel.address)) {
        // this.tokenSendModel.id = Date.now();
        // this.$emit('tokenSend', this.tokenSendModel)
        this.tokenSendModel = {
          address: '',
          amount: ''
        }
      }
    },
  }
}
</script>

<style scoped>
  form{
    display: flex;
    flex-direction: row;
  }
</style>