<template>
  <div class="app">
    <app-header @connect-wallet="connectWallet" />
    <router-view></router-view>
    <app-footer />
  </div>
</template>
<script>
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import Web3 from "web3";
export default {
  components : {
    AppHeader,
    AppFooter,
  },
  methods: {
    async connectWallet() {
      const web3 = new Web3(window.ethereum)
      var accounts = await web3.eth.requestAccounts()
      this.$store.commit('setAccount',accounts.length ? accounts[0] : 0x0)
    },
  },
  created() {
    if(typeof ethereum !== 'undefined' && ethereum.isMetaMask == true) {

      const web3 = new Web3(window.ethereum)

      web3.eth.getAccounts().then(accounts => {
        this.$store.commit('setAccount',accounts.length ? accounts[0] : 0x0)
        this.$store.commit('setChain', ethereum.networkVersion);
        switch (this.$route.name){
          case 'test-net':
            if (this.$store.state.chain != 97) {
              if (confirm('Our app use BSC TestNet. Do you what to switch to this?')) {
                ethereum
                    .request({
                      method: 'wallet_switchEthereumChain',
                      params: [{
                        chainId: '0x61'
                      }]
                    })
              }
            }
            break;
          case 'pancake':
          case 'lottery':
            if (this.$store.state.chain != 56) {
              if (confirm('Our app use BSC Net. Do you what to switch to this?')) {
                ethereum
                    .request({
                      method: 'wallet_switchEthereumChain',
                      params: [{
                        chainId: '0x38'
                      }]
                    })
              }
            }
            break;
        }
      })


      window.ethereum.on('accountsChanged', (accounts) => {
        this.$store.commit('setAccount',accounts.length ? accounts[0] : 0x0)
      });

      window.ethereum.on('chainChanged', (chainId) => {
        this.$store.commit('setChain', chainId);
        if (this.$store.state.chain != 0x61) {
          if (confirm('Our app use BSC TestNet. Do you what to switch to this?')) {
            ethereum
                .request({
                  method: 'wallet_switchEthereumChain',
                  params: [{
                    chainId: '0x61'
                  }]
                })
          }
        }
      })

      window.ethereum.on('connect', (chainId) => {
        this.$store.state.chain = chainId
      })

      window.ethereum.on('disconnect', (chainId) => {
        this.$store.state.chain = chainId
        window.location.reload();
      })
    } else {
      alert('Install MetaMask')
    }
  }
}
</script>
<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Roboto', sans-serif;
  }

  .container{
    margin: 0 auto;
    max-width: 1200px;
    overflow: hidden;
  }

  .app{
    background-color: #c7eeb4!important;
    font-size: 16px;
  }

  button.transparent{
    border: none;
    background-color: transparent;
    padding: 0;
  }
</style>