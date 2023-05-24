<template>
  <div>
    <modal v-model:show="modalVisible">{{ modalContent }}</modal>
    <div class="container">
      <div class="pools">
        <div class="pool">
          <div class="pool__header">
            <div class="pool__title">CAKE-BNB</div>
          </div>

          <template v-if="$store.state.account">
            <div class="pool__body">
              <!-- <div class="pool__token">
                <div class="pool__token__header">
                  <label class="pool__token__name">CAKE</label>
                  <div class="pool__token__balance">balance: <span>{{ wallet.cake }}</span></div>
                </div>
                <input-text class="pool__token__count" v-model="form.deposit.cake" @input="formDepositBnbSync" v-focus />
                <div class="pool__token__footer">
                  <div class="pool__token__estimate">~<span>{{ form.deposit.cake * pancake.rates.cakeusdt }}</span> USD
                  </div>
                  <btn-link class="pool__token__max" @click="formDepositCakeMaximize">max</btn-link>
                </div>
              </div>
              <div class="pool__plus">+</div> -->
              <div class="choose_token">
                <div class="token_area" :class="{ active: this.tokenSelcted == 0 }" @click="changeToken(0)">
                  <div class="token">
                    BUSD
                  </div>
                </div>
                <div class="token_area" :class="{ active: this.tokenSelcted == 1 }" @click="changeToken(1)">
                  <div class="token">
                    USDT
                  </div>
                </div>
                <div class="token_area" :class="{ active: this.tokenSelcted == 2 }" @click="changeToken(2)">
                  <div class="token">
                    USDC
                  </div>
                </div>
              </div>
              <div class="pool__token">
                <div class="pool__token__header">
                  <label class="pool__token__name">BNB</label>
                  <div class="pool__token__balance">balance: <span>{{ wallet.bnb }}</span></div>
                </div>
                <div class="pool__token__header">
                  <label class="pool__token__name">USDT</label>
                  <div class="pool__token__balance">balance: <span>{{ wallet.token1 }}</span></div>
                </div>
                <div class="pool__token__header">
                  <label class="pool__token__name">USDC</label>
                  <div class="pool__token__balance">balance: <span>{{ wallet.stable }}</span></div>
                </div>
                <div class="pool__token__header">
                  <label class="pool__token__name">BUSD</label>
                  <div class="pool__token__balance">balance: <span>{{ wallet.token0 }}</span></div>
                </div>
                <input-text class="pool__token__count" v-model="form.deposit.token" @input="formDepositRate" />
                <div class="pool__token__footer">
                  <div class="pool__token__estimate">~<span>{{ form.depositUsdvalue }}</span> USD
                  </div>
                  <btn-link class="pool__token__max" @click="formDepositBnbMaximize">max</btn-link>
                </div>
              </div>
              <div class="s">
                <div class="">
                  <div class="">Min: {{ frog.minUsd }} USD</div>
                </div>
                <div class="">
                  <div class="">Max: {{ frog.maxUsd }} USD</div>
                </div>
              </div>
              <div class="pool__rates">
                <div class="pool__rate">
                  <div class="pool-rate__value">{{ pancake.rates.t0_t1 }}</div>
                  <div class="pool-rate__label">USDT per BUSD</div>
                </div>
                <div class="pool__rate">
                  <div class="pool-rate__value">{{ pancake.rates.t1_t0 }}</div>
                  <div class="pool-rate__label">BUSD per USDT</div>
                </div>
              </div>
              <div class="pool__rates">
                <div class="pool__rate">
                  <div class="pool-rate__value">{{ pancake.rates.t0_stbl }}</div>
                  <div class="pool-rate__label">stable per BUSD</div>
                </div>
                <div class="pool__rate">
                  <div class="pool-rate__value">{{ pancake.rates.t1_stbl }}</div>
                  <div class="pool-rate__label">stable per USDT</div>
                </div>
              </div>
              <div>
                <btn-primary @click="deposit">Deposit</btn-primary>
              </div>
              <table>
                <tr>
                  <th>Your</th>
                  <th>LP</th>
                  <!-- <th>CAKE</th> -->
                  <th>BUSD</th>
                  <th>USDT</th>
                </tr>
                <tr>
                  <td>deposit</td>
                  <td><small>{{ frog.user.deposit }}</small></td>
                  <!-- <td><small>{{ frog.user.deposit * pancake.rates.lpcake }}</small></td> -->
                  <td><small>{{ pancake.table.deposit_token0 }}</small></td>
                  <td><small>{{ pancake.table.deposit_token1 }}</small></td>
                </tr>
                <tr>
                  <td>balance</td>
                  <td><small>{{ frog.user.balance }}</small></td>
                  <!-- <td><small>{{ frog.user.balance * pancake.rates.lpcake }}</small></td> -->
                  <td><small>{{ pancake.table.balance_token0 }}</small></td>
                  <td><small>{{ pancake.table.balance_token1 }}</small></td>
                </tr>
                <tr>
                  <td>withdraw</td>
                  <td><small>{{ frog.user.withdraw }}</small></td>
                  <!-- <td><small>{{ frog.user.withdraw * pancake.rates.lpcake }}</small></td> -->
                  <td><small>{{ pancake.table.withdraw_token0 }}</small></td>
                  <td><small>{{ pancake.table.withdraw_token1 }}</small></td>
                </tr>
              </table>
              <div>
                <input type="text" v-model="form.withdraw.lp" />
                <btn-primary @click="withdraw">Withdraw</btn-primary>
              </div>
              <br>
              <div>
                <h3>Last Draw Number: {{ frog.drawNumber }}</h3>
              </div>
              <div>
                <h3>Total Farm: {{ frog.farmTotal }}</h3>
              </div>
              <div>
                <h3>Your Reward: {{ frog.user.rewardOfToken0 }}</h3>
              </div>
              <div>
                <h3>Your Reward: {{ frog.user.rewardOfToken1 }}</h3>
              </div>
              <div>
                <h3>Your Referer: {{ frog.referalInfo.referer }}</h3>
              </div>
              <div>
                <h3>Your Percent: {{ frog.referalInfo.percent }}</h3>
              </div>
              <div>
                <h3>Your Referal Reward: {{ frog.user.referalReward }}</h3>
              </div>
              <div>
                <h3>Now In Lottery: {{ frog.nowIn }}</h3>
              </div>
              <div>
                <h3>Beneficiary : {{ frog.beneficiaryAmount }}</h3>
              </div>
              <btn-primary @click="claimReward" v-if="frog.user.rewardOfToken0 || frog.user.rewardOfToken1">Claim
                Reward</btn-primary>
              <btn-primary @click="claimReferalReward" v-if="frog.user.referalReward">Claim Referal Reward</btn-primary>
            </div>
          </template>
          <template v-else>
            <div class="pool__body">
              Please connect your wallet to select this pool
            </div>
            <div class="pool_footer">

            </div>
          </template>
        </div>
      </div> <!-- .pools -->
      <btn-primary @click="getCake">getCake</btn-primary>
      <btn-primary @click="swap">swap</btn-primary>
      <h2>Set referer</h2>
      <form @submit.prevent class="admin-form">
        <input-text v-model="this.frog.referalInfo.inputReferer" placeholder="Address" class="input" />
        <btn-primary @click="setReferer">Set referer</btn-primary>
      </form>
      <div>
        <h2>Admin</h2>
        <br>
        <h3>Owner <small>(current: {{ frog.owner }})</small></h3>
        <h3>Beneficiary <small>(current: {{ frog.beneficiary }})</small></h3>
        <h3>Farm Total: <small> {{ frog.farmTotal }}</small></h3>
        <h3>Last Draw number: <small> {{ frog.drawNumber }}</small></h3>
        <form @submit.prevent class="admin-form" v-if="isOwner || isBeneficiary">
          <input-text v-model="form.newBeneficiary" placeholder="New Beneficiary Address" class="input" />
          <btn-primary @click="setBeneficiary">Set beneficiary</btn-primary>
        </form>
        <form @submit.prevent class="admin-form" v-if="isOwner">
          <input-text v-model="form.newOwner" placeholder="New Owner Address" class="input" />
          <btn-primary @click="setOwner">Set owner</btn-primary>
        </form>
        <form @submit.prevent class="admin-form" v-if="isOwner">
          <input-text v-model="form.newFeePercent" placeholder="New Fee Percent" class="input" />
          <btn-primary @click="setFeePercent">Set fee percent</btn-primary>
        </form>
        <template v-if="frog.participants">
          <h2>Current Participants</h2>
          <table>
            <thead>
              <th>Address</th>
              <th>LP</th>
              <th>rewardOfToken0</th>
              <th>rewardOfToken1</th>
            </thead>
            <tbody>
              <tr v-for="participant in frog.participants">
                <td>{{ participant.address }}</td>
                <td>{{ participant.balance }}</td>
                <td>{{ participant.rewardOfToken0 }}</td>
                <td>{{ participant.rewardOfToken1 }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="frog.victories">
          <h2>Table of Winners</h2>
          <table>
            <thead>
              <th>Draw</th>
              <th>Winner</th>
              <th>Amount</th>
            </thead>
            <tbody>
              <tr v-for="victory in frog.victories">
                <td>{{ victory.drawNumber }}</td>
                <td>{{ victory.winner }}</td>
                <td>{{ victory.amount }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="frog.draws">
          <h2>Table of Draws</h2>
          <table>
            <thead>
              <th>#</th>
              <th>Fund</th>
              <th>Reward</th>
              <th>Fee</th>
            </thead>
            <tbody>
              <tr v-for="draw in frog.draws">
                <td>{{ draw.number }}</td>
                <td>{{ draw.fund }}</td>
                <td>{{ draw.reward }}</td>
                <td>{{ draw.fee }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <btn-primary @click="draw">Draw</btn-primary>
      </div>
    </div> <!-- .container -->
  </div> <!-- .app -->
</template>

<script>
import Web3 from 'web3';
import axios from 'axios';
import AppHeader from '@/components/AppHeader';
import Modal from "@/components/UI/Modal";
import BtnPrimary from "@/components/UI/BtnPrimary";
import constants from "../../../blockchain/scripts/json/constants.json"
import { ethers } from "ethers"
import config from "../../config.json"
import JSBI from "jsbi"
// import { TickMath, FullMath } from "@uniswap/v3-sdk"

import bnbAbi from '../../../blockchain/artifacts/contracts/frogs/ERC20.sol/ERC20Token.json'
import lotteryAbi from '../../../blockchain/artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json'
import factoryAbi from '../../../blockchain/artifacts/contracts/frogs/FrogFactory.sol/FrogFactory.json'
import referalAbi from "../../../blockchain/artifacts/contracts/frogs/FrogReferal.sol/FrogReferal.json"
import PoolAbi from "../../../blockchain/artifacts/contracts/core/UniswapV3Pool.sol/UniswapV3Pool.json"
import PositionManager from "../../../blockchain/artifacts/contracts/periphery/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"
import Router from "../../../blockchain/artifacts/contracts/periphery/SwapRouter.sol/SwapRouter.json"
import BigNumber from 'bignumber.js';


const prefix = config.prefix

const ERC20TokenABI = bnbAbi.abi

const FrogContractABI = lotteryAbi.abi
// const this.addresses.frogLottery = constants.addresses[prefix + 'Lottery_busd_usdt'];

const FrogReferalABI = referalAbi.abi

const backendUrl = config.backendUrl


export default {
  components: {
    BtnPrimary,
    Modal
  },

  data() {
    return {
      isOwner: false,
      isBeneficiary: false,
      form: {
        newBeneficiary: '',
        newOwner: '',
        newFeePercent: 0,
        deposit: {
          cake: 0,
          bnb: 0,
          token: 0
        },
        depositUsdvalue: 0,
        withdraw: {
          lp: 0,
        },
      },
      frog: {
        owner: 0,
        beneficiary: 0,
        farmTotal: 0,
        drawNumber: 0,
        minUsd: 0,
        maxUsd: 0,
        nowIn: -1,
        beneficiaryAmount: -1,
        user: {
          deposit: -1,
          balance: -1,
          withdraw: -1,
          rewardOfToken0: -1,
          rewardOfToken1: -1,
          referalReward: -1
        },
        referalInfo:
        {
          inputReferer: '',
          referer: "-1",
          percent: -1
        },
        participants: [],
        draws: [],
        victories: [],
      },
      wallet: {
        cake: -1,
        bnb: -1,
        token1: -1,
        stable: -1,
        token0: -1
      },
      addresses: {
        token0: constants.addresses[prefix + 'BUSD'],
        token1: constants.addresses[prefix + 'USDT'],
        stable: constants.addresses[prefix + 'USDC'],
        pool_token0_stable: constants.addresses[prefix + 'Pool_busd_usdc'],
        pool_token1_stable: constants.addresses[prefix + 'Pool_usdt_usdc'],
        pool_token0_token1: constants.addresses[prefix + 'Pool_busd_usdt'],
        manager: constants.addresses[prefix + 'NonfungiblePositionManager'],
        router: constants.addresses[prefix + 'SwapRouter'],
        factory: constants.addresses[prefix + 'PancakeFactory'],
        fee: constants.addresses[prefix + 'Pool_busd_usdt_fee'],
        frogReferal: constants.addresses[prefix + 'FrogReferal'],
        frogLottery: constants.addresses[prefix + 'Lottery_busd_usdt'],
        frogFactory: constants.addresses[prefix + 'FrogFactory']
      },
      pancake: {
        sqrtPriceX96_token0_token1: 0,
        sqrtPriceX96_token0_stable: 0,
        sqrtPriceX96_token1_stable: 0,
        currentTick: 0,
        tickLower: 0,
        tickUpper: 0,
        tokenId: 0,
        table: {
          deposit_token0: -1,
          deposit_token1: -1,
          balance_token0: -1,
          balance_token1: -1,
          withdraw_token0: -1,
          withdraw_token1: -1,
        },
        rates: {
          bnbusdt: 0,
          cakeusdt: 0,
          t0_t1: 0,
          t1_t0: 0,
          t0_stbl: 0,
          t1_stbl: 0,
          lpcake: 0,
          lpbnb: 0,
          cakelp: 0,
          bnblp: 0,
        }
      },
      modalVisible: false,
      modalContent: '',
      tokenSelcted: 0,
    }
  },
  methods: {
    async updateParams() {
      console.log(this.addresses.token0)
      console.log(this.addresses.token1)
      console.log(constants.addresses[prefix + 'BUSD'])
      console.log(constants.addresses[prefix + 'USDT'])
      const web3 = new Web3(window.ethereum)

      // let poolName = this.tokenSelcted == 2 ? 'Pool_usdt_usdc' : 'Pool_busd_usdt'
      const pool = new web3.eth.Contract(PoolAbi.abi, this.addresses.pool_token0_token1)
      const manager = new web3.eth.Contract(PositionManager.abi, this.addresses.manager)
      const FrogContract = new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery);

      this.pancake.tokenId = await FrogContract.methods.tokenId().call()
      const position = await manager.methods.positions(this.pancake.tokenId).call()
      this.pancake.tickLower = position.tickLower
      this.pancake.tickUpper = position.tickUpper
      let provider
      if (prefix == 'sepolia_')
        provider = new ethers.providers.InfuraProvider(11155111, '')
      else
        provider = new ethers.providers.JsonRpcProvider()

      // console.log('price', 1 / getPrice(1, BigInt(1857259621983179994159796290), 18, 18))
      // console.log('price', 1 / getPrice(1, (await pool.methods.slot0().call()).sqrtPriceX96, 18, 18))
      const pool_token0_stable = new web3.eth.Contract(PoolAbi.abi, this.addresses.pool_token0_stable)
      const pool_token1_stable = new web3.eth.Contract(PoolAbi.abi, this.addresses.pool_token1_stable)

      const data = await pool.methods.slot0().call()

      this.pancake.currentTick = data.tick

      this.pancake.sqrtPriceX96_token0_token1 = data.sqrtPriceX96
      this.pancake.sqrtPriceX96_token0_stable = (await pool_token0_stable.methods.slot0().call()).sqrtPriceX96
      this.pancake.sqrtPriceX96_token1_stable = (await pool_token1_stable.methods.slot0().call()).sqrtPriceX96
      const token0PerToken1 = this.getPrice(1, this.pancake.sqrtPriceX96_token0_token1, 18, 18)
      const token1PerToken0 = 1 / token0PerToken1

      console.log('pool_busd_usdt', BigNumber((await pool.methods.slot0().call()).sqrtPriceX96).pow(2).div(BigInt(2 ** 192)).toString())
      console.log('pool_busd_usdc', BigNumber((await pool_token0_stable.methods.slot0().call()).sqrtPriceX96).pow(2).div(BigInt(2 ** 192)).toString())
      console.log('pool_usdt_usdc', BigNumber((await pool_token1_stable.methods.slot0().call()).sqrtPriceX96).pow(2).div(BigInt(2 ** 192)).toString())

      // if (this.tokenSelcted == 0)
      //   token0PerToken1 = 1 / token0PerToken1
      // else if (this.tokenSelcted == 1)
      //   token1PerToken0 = 1 / token1PerToken0


      this.pancake.rates.t0_t1 = token0PerToken1.toFixed(4)
      this.pancake.rates.t1_t0 = token1PerToken0.toFixed(4)
      // console.log(this.pancake.sqrtPriceX96_token0_stable)
      // console.log(this.pancake.sqrtPriceX96_token1_stable)
      this.pancake.rates.t0_stbl = (this.getPrice(1, this.pancake.sqrtPriceX96_token0_stable, 18, 18)).toFixed(4)
      this.pancake.rates.t1_stbl = (this.getPrice(1, this.pancake.sqrtPriceX96_token1_stable, 18, 18)).toFixed(4)

      // const pancakePairCakeWbnb = new web3.eth.Contract(PancakePairCakeWbnbABI, PancakePairCakeWbnbAddress);
      // const reserves = await pancakePairCakeWbnb.methods.getReserves().call()
      // const supply = await pancakePairCakeWbnb.methods.totalSupply().call()
      // this.pancake.rates.lpcake = reserves._reserve0 / supply
      // this.pancake.rates.lpbnb = reserves._reserve1 / supply
      // this.pancake.rates.cakelp = supply / reserves._reserve0;
      // this.pancake.rates.bnblp = supply / reserves._reserve1;


      FrogContract.methods.minUsd().call()
        .then(minUsd => {
          this.frog.minUsd = parseFloat(web3.utils.fromWei(minUsd))
        });
      FrogContract.methods.maxUsd().call()
        .then(maxUsd => {
          this.frog.maxUsd = parseFloat(web3.utils.fromWei(maxUsd))
        });

      setTimeout(this.updateParams, 20000)
    },
    async updateBalances() {
      if (this.$store.state.account) {
        const web3 = new Web3(window.ethereum)
        const token0 = new web3.eth.Contract(ERC20TokenABI, this.addresses.token0)
        const token1 = new web3.eth.Contract(ERC20TokenABI, this.addresses.token1)
        const stable = new web3.eth.Contract(ERC20TokenABI, this.addresses.stable)

        token0.methods.balanceOf(this.$store.state.account.toLowerCase()).call()
          .then(async balance => {
            this.wallet.token0 = BigNumber(balance).div(BigNumber(10 ** 18))
          })

        token1.methods.balanceOf(this.$store.state.account.toLowerCase()).call()
          .then(balance => {
            this.wallet.token1 = BigNumber(balance).div(BigNumber(10 ** 18))
          })

        stable.methods.balanceOf(this.$store.state.account.toLowerCase()).call()
          .then(balance => {
            this.wallet.stable = BigNumber(balance).div(BigNumber(10 ** 18))
          })

        new web3.eth.getBalance(this.$store.state.account.toLowerCase())
          .then(balance => {
            this.wallet.bnb = BigNumber(balance).div(BigNumber(10 ** 18))
          })

        const frog = new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery)
        frog.methods.depositOf(this.$store.state.account).call()
          .then(async balance => {
            this.frog.user.deposit = balance.toString()
            console.log(BigInt(this.pancake.sqrtPriceX96_token0_token1), this.pancake.currentTick, this.pancake.tickLower, this.pancake.tickUpper, this.frog.user.deposit, false)
            const data = await this.calculateAmountsForLiquidity(BigInt(this.pancake.sqrtPriceX96_token0_token1), this.pancake.currentTick, this.pancake.tickLower, this.pancake.tickUpper, this.frog.user.deposit, false)
            console.log(data)
            this.pancake.table.deposit_token0 = parseFloat(this.getPrice(BigNumber(data.amount0).div(BigInt(10 ** 18)).toNumber(), this.pancake.sqrtPriceX96_token0_stable, 18, 18))
            this.pancake.table.deposit_token1 = parseFloat(this.getPrice(BigNumber(data.amount1).div(BigInt(10 ** 18)).toNumber(), this.pancake.sqrtPriceX96_token1_stable, 18, 18))
          })

        frog.methods.balanceOf(this.$store.state.account).call()
          .then(async balance => {
            this.frog.user.balance = balance.toString()
            const data = await this.calculateAmountsForLiquidity(this.pancake.sqrtPriceX96_token0_token1, this.pancake.currentTick, this.pancake.tickLower, this.pancake.tickUpper, this.frog.user.balance, false)
            this.pancake.table.balance_token0 = parseFloat(this.getPrice(BigNumber(data.amount0).div(BigInt(10 ** 18)).toNumber(), this.pancake.sqrtPriceX96_token0_stable, 18, 18))
            this.pancake.table.balance_token1 = parseFloat(this.getPrice(BigNumber(data.amount1).div(BigInt(10 ** 18)).toNumber(), this.pancake.sqrtPriceX96_token1_stable, 18, 18))
          })

        frog.methods.withdrawOf(this.$store.state.account).call()
          .then(async balance => {
            this.frog.user.withdraw = balance.toString()
            const data = await this.calculateAmountsForLiquidity(this.pancake.sqrtPriceX96_token0_token1, this.pancake.currentTick, this.pancake.tickLower, this.pancake.tickUpper, this.frog.user.withdraw, false)
            this.pancake.table.withdraw_token0 = parseFloat(this.getPrice(BigNumber(data.amount0).div(BigInt(10 ** 18)).toNumber(), this.pancake.sqrtPriceX96_token0_stable, 18, 18))
            this.pancake.table.withdraw_token1 = parseFloat(this.getPrice(BigNumber(data.amount1).div(BigInt(10 ** 18)).toNumber(), this.pancake.sqrtPriceX96_token1_stable, 18, 18))
          })

        frog.methods.rewardOfToken0(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.rewardOfToken0 = parseFloat(web3.utils.fromWei(balance))
          })

        frog.methods.rewardOfToken1(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.rewardOfToken1 = parseFloat(web3.utils.fromWei(balance))
          })

        const BUSD = new web3.eth.Contract(ERC20TokenABI, this.addresses.token0)

        await BUSD.methods.balanceOf(this.addresses.frogLottery).call()
          .then(balance => {
            this.frog.nowIn = parseFloat(web3.utils.fromWei(balance))
          })

        await BUSD.methods.balanceOf(await frog.methods.beneficiary().call()).call()
          .then(balance => {
            this.frog.beneficiaryAmount = parseFloat(web3.utils.fromWei(balance))
          })

        const FrogReferal = new web3.eth.Contract(FrogReferalABI, this.addresses.frogReferal)
        await FrogReferal.methods.balance(this.addresses.token0, this.$store.state.account).call()
          .then(balance => {
            this.frog.user.referalReward = parseFloat(web3.utils.fromWei(balance))
          })

      }
      setTimeout(this.updateBalances, 20000)
    },
    async updateParticipants() {
      // @TODO check isOwner
      const web3 = new Web3(window.ethereum)
      const FrogContract = new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery)

      // FrogContract.methods.farmTotal().call().then(farmTotal => {
      //   this.frog.farmTotal = web3.utils.fromWei(farmTotal)
      // })
      FrogContract.methods.drawNumber().call().then(drawNumber => {
        this.frog.drawNumber = drawNumber
      })
      FrogContract.methods.owner().call().then(owner => {
        this.frog.owner = owner
        this.isOwner = owner.toLowerCase() === this.$store.state.account.toLowerCase()
      })
      FrogContract.methods.beneficiary().call().then(beneficiary => {
        this.frog.beneficiary = beneficiary
        this.isBeneficiary = beneficiary.toLowerCase() === this.$store.state.account.toLowerCase()
      })

      // Table Of Participants
      const participants = await FrogContract.methods.getParticipants().call()
      var _participants = [];
      for (const _participant of participants.result) {
        const participant = {
          address: _participant,
          balance: web3.utils.fromWei(await FrogContract.methods.balanceOf(_participant).call()),
          rewardOfToken0: web3.utils.fromWei(await FrogContract.methods.rewardOfToken0(_participant).call()),
          rewardOfToken1: web3.utils.fromWei(await FrogContract.methods.rewardOfToken1(_participant).call()),
        }
        _participants.push(participant)
      }
      this.frog.participants = _participants;

      try {
        var _victories = [];
        const victories = await FrogContract.getPastEvents('Victory', {
          // @TODO Block Frog deploy
          fromBlock: 26440756,
          toBlock: 'latest'
        })
        for (const _victory of victories) {
          const victory = {
            drawNumber: web3.eth.abi.decodeParameter("uint256", _victory.raw.topics[1]),
            winner: web3.eth.abi.decodeParameter("address", _victory.raw.topics[2]),
            amount: web3.utils.fromWei(web3.eth.abi.decodeParameter("uint256", _victory.raw.data))
          }
          _victories.push(victory)
        }
        this.frog.victories = _victories;

        // Table Of Winners


        // Table Of Draws
        var _draws = [];
        // @TODO how to find Draw Event?!?!
        const draws = await FrogContract.getPastEvents('AllEvents', {
          // @TODO Block Frog deploy
          fromBlock: 26440756,
          toBlock: 'latest'
        })
        for (const _draw of draws) {
          if (_draw.raw.data.length > 66) {
            const data = web3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint256'], _draw.raw.data)
            const draw = {
              number: web3.eth.abi.decodeParameter("uint256", _draw.raw.topics[1]),
              fund: web3.utils.fromWei(data[0]),
              reward: web3.utils.fromWei(data[1]),
              fee: web3.utils.fromWei(data[2]),
            }
            _draws.push(draw)
          }
        }
        this.frog.draws = _draws;
      } catch (error) {
        console.log(error)
      }
      // Referal
      // const FrogReferal = new web3.eth.Contract(FrogReferalABI, this.addresses.frogReferal)

      // const referalInfo = await FrogReferal.methods.refererOf(this.$store.state.account.toLowerCase()).call()
      const data = await axios.post(`${backendUrl}/getUser`, { wallet: this.$store.state.account.toLowerCase() })
      if (data.data.user == null) {
        this.frog.referalInfo.referer = '-11'
        this.frog.referalInfo.percent = -11
      } else {
        this.frog.referalInfo.referer = data.data.referer.wallet
        this.frog.referalInfo.percent = data.data.user.percent / 100
      }

      setTimeout(this.updateParticipants, 20000)
    },
    async formDepositRate() {
      let firstPart;
      let secndPart;
      switch (this.tokenSelcted) {
        case 0:
          firstPart = (this.getPrice(1, this.pancake.sqrtPriceX96_token0_stable, 18, 18) * (this.form.deposit.token / 2)) //
          secndPart = (this.getPrice(1, this.pancake.sqrtPriceX96_token1_stable, 18, 18) * (this.form.deposit.token / 2 * (this.pancake.rates.t0_t1))) //
          this.form.depositUsdvalue = firstPart
          this.form.depositUsdvalue += secndPart
          break;
        case 1:
          firstPart = (this.getPrice(1, this.pancake.sqrtPriceX96_token0_stable, 18, 18) * (this.form.deposit.token / 2 * (this.pancake.rates.t1_t0))) //
          secndPart = (this.getPrice(1, this.pancake.sqrtPriceX96_token1_stable, 18, 18) * (this.form.deposit.token / 2)) //
          this.form.depositUsdvalue = firstPart
          this.form.depositUsdvalue += secndPart
          break;
        case 2:
          // console.log(this.getPrice(1, this.pancake.sqrtPriceX96_token0_stable, 18, 18))
          // console.log(this.getPrice(1, this.pancake.sqrtPriceX96_token1_stable, 18, 18))
          // console.log(this.getPrice(1, this.pancake.sqrtPriceX96_token0_token1, 18, 18))
          // console.log(this.pancake.rates.t0_stbl)
          // console.log(this.pancake.rates.t1_stbl)
          // console.log(1 / this.pancake.rates.t0_stbl)
          // console.log(1 / this.pancake.rates.t1_stbl)
          // console.log(1 / this.getPrice(1, this.pancake.sqrtPriceX96_token0_stable, 18, 18), this.form.deposit.token / 2 * 1 / this.pancake.rates.t0_stbl)
          // console.log(1 / this.getPrice(1, this.pancake.sqrtPriceX96_token1_stable, 18, 18), this.form.deposit.token / 2 * 1 / this.pancake.rates.t1_stbl)
          firstPart = (this.getPrice(1, this.pancake.sqrtPriceX96_token0_stable, 18, 18) * (this.form.deposit.token / 2 * (1 / this.pancake.rates.t0_stbl))) //
          secndPart = (this.getPrice(1, this.pancake.sqrtPriceX96_token1_stable, 18, 18) * (this.form.deposit.token / 2 * (1 / this.pancake.rates.t1_stbl))) //
          // console.log(firstPart)
          // console.log(secndPart)
          this.form.depositUsdvalue = firstPart
          this.form.depositUsdvalue += secndPart
          break;
      }

      // this.form.depositUsdvalue = this.getPrice(this.form.deposit.token, this.pancake.sqrtPriceX96_token0_token1, 18, 18)
      this.$forceUpdate()
    },
    // formDepositCakeSync() {
    //   const usdtAmount = this.form.deposit.bnb * this.pancake.rates.bntoken0t
    //   this.form.deposit.cake = usdtAmount / this.pancake.rates.cakeusdt
    // },
    formDepositCakeMaximize() {
      this.form.deposit.cake = this.wallet.cake
      this.formDepositBnbSync()
    },
    formDepositBnbMaximize() {
      this.form.deposit.bnb = this.wallet.bnb
      this.formDepositCakeSync()
    },
    async swap() {
      const web3 = new Web3(window.ethereum)
      const router = new web3.eth.Contract(Router.abi, this.addresses.router)
      await router.methods.exactInputSingle({
        tokenIn: this.addresses.token1,
        tokenOut: this.addresses.token0,
        fee: this.addresses.fee,
        recipient: this.$store.state.account,
        deadline: 100000000000,
        amountIn: BigInt(100000 * 10 ** 18),
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0
      })
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Swap complete!')
        })
    },
    async deposit() {
      var errors = [];
      let tokenForDepositAddress;
      let tokenBalance
      let sqrtPriceX96
      switch (this.tokenSelcted) {
        case 0: {
          tokenForDepositAddress = this.addresses.token0
          tokenBalance = parseFloat(this.wallet.token0)
          sqrtPriceX96 = this.pancake.sqrtPriceX96_token0_token1
          break;
        }
        case 1: {
          tokenForDepositAddress = this.addresses.token1
          tokenBalance = parseFloat(this.wallet.token1)
          sqrtPriceX96 = this.pancake.sqrtPriceX96_token0_token1
          break;
        }
        case 2: {
          tokenForDepositAddress = this.addresses.stable
          tokenBalance = parseFloat(this.wallet.stable)
          sqrtPriceX96 = this.pancake.sqrtPriceX96_token0_token1
          break;
        }
      }
      console.log(tokenBalance, this.form.deposit.token)

      if (tokenBalance < parseFloat(this.form.deposit.token)) {
        errors.push("Not enough tokens")
      }
      console.log(BigInt(this.pancake.sqrtPriceX96_token0_token1), this.pancake.tickLower, this.pancake.tickUpper, BigNumber(this.frog.user.deposit).plus(this.frog.user.balance).plus(this.frog.user.withdraw).toString())
      const data = await this.calculateAmountsForLiquidity(BigInt(this.pancake.sqrtPriceX96_token0_token1), this.pancake.currentTick, this.pancake.tickLower, this.pancake.tickUpper, BigNumber(this.frog.user.deposit).plus(this.frog.user.balance).plus(this.frog.user.withdraw), true)
      const price = this.getPrice(1, this.pancake.sqrtPriceX96_token0_token1, 18, 18)

      console.log(price, data)
      // 522620298966930423808
      // 25487249999999663021

      const token0 = BigNumber(price * data.amount0).div(BigInt(10 ** 18))
      const token1 = BigNumber(1 / price * data.amount1).div(BigInt(10 ** 18))
      const futureBalance = BigNumber(token0.plus(token1))  //(this.frog.user.balance + this.frog.user.deposit - this.frog.user.withdraw) * (this.pancake.rates.lpcake * this.pancake.rates.cakeusdt + this.pancake.rates.lpbnb * this.pancake.rates.bnbusdt)
      const deposit = BigNumber(this.form.depositUsdvalue)
      console.log(futureBalance.toString())
      console.log(deposit.toString())
      if (futureBalance.plus(deposit) < this.frog.minUsd || futureBalance.plus(deposit) > this.frog.maxUsd) {
        errors.push('Amount of balance must be in $' + this.frog.minUsd + ' .. $' + this.frog.maxUsd + "|" + `${futureBalance}` + `  ${deposit}`)
      }
      if (errors.length) {
        this.showModal(errors.join(', '))
      } else {
        const web3 = new Web3(window.ethereum)
        const FrogReferal = new web3.eth.Contract(FrogReferalABI, this.addresses.frogReferal)
        const isPartisipant = await FrogReferal.methods.alreadyParticipant(this.$store.state.account).call()
        console.log(isPartisipant, "isPartisipant")
        const condition = '-111'
        if (this.frog.referalInfo.referer == condition) {
          this.showModal('Not a referal')
        } else if (confirm("You want to send: \n" + this.form.deposit.cake + " CAKE\n" + this.form.deposit.bnb + " BNB")) {

          const allowance0 = web3.utils.fromWei(await new web3.eth.Contract(ERC20TokenABI, tokenForDepositAddress)
            .methods.allowance(this.$store.state.account, this.addresses.frogLottery).call());
          if (allowance0 < tokenBalance) {
            const approveCake = await new web3.eth.Contract(ERC20TokenABI, tokenForDepositAddress)
              .methods.approve(this.addresses.frogLottery, web3.utils.toWei(this.form.deposit.cake.toString()))
              .send({
                from: this.$store.state.account
              })
              .on('sending', () => {
                this.showModal('Waiting for confirmation')
              })
            if (approveCake.status != true) {
              this.showModal('Something went wrong with tCake approve!')
              return
            }
          }
          // 102.474568424912758913
          // 102.474568424912758913
          // 1024.745684249127550976
          const amount = web3.utils.toWei(this.form.deposit.token);
          // const amountToken1 = web3.utils.toWei(this.form.deposit.bnb.toString().substring(0, 20));
          const FrogContract = new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery)

          // 10.000000000000000000
          console.log(tokenForDepositAddress, this.tokenSelcted, amount)
          if (isPartisipant) {
            await FrogContract.methods.deposit(
              tokenForDepositAddress,
              amount
            )
              .send({
                from: this.$store.state.account,
                value: 0
              })
              .on('sending', () => {
                this.showModal('Waiting for confirmation')
              })
              .on('error', (error) => {
                this.showModal('Transaction error: ' + JSON.stringify(error))
              })
              .on('receipt', (receipt) => {
                this.showModal('Your tokens sent to deposit!')
                this.form.deposit.token = 0;
                this.form.depositUsdvalue = 0;
              })
          } else {
            const { message, v, r, s } = await this.sigAddress(this.$store.state.account)
            await FrogContract.methods.registerBeforeDeposit(message, v, r, s,
              tokenForDepositAddress,
              amount
            )
              .send({
                from: this.$store.state.account,
                value: 0
              })
              .on('sending', () => {
                this.showModal('Waiting for confirmation')
              })
              .on('error', (error) => {
                this.showModal('Transaction error: ' + JSON.stringify(error))
              })
              .on('receipt', (receipt) => {
                this.showModal('Your tokens sent to deposit!')
                this.form.deposit.cake = 0;
                this.form.deposit.bnb = 0;
              })
          }

        }
      }
    },
    async withdraw() {
      if (this.form.withdraw.lp <= 0) {
        this.showModal("Withdraw must be > 0")
        return;
      }

      const futureBalance = (this.frog.user.balance + this.frog.user.deposit - this.frog.user.withdraw - this.form.withdraw.lp) * (this.pancake.rates.lpcake * this.pancake.rates.cakeusdt + this.pancake.rates.lpbnb * this.pancake.rates.bnbusdt)
      if (futureBalance < 0) {
        this.showModal("Not enough LP")
        return;
      }
      let errors = [];

      if (futureBalance && futureBalance < this.frog.minUsd || futureBalance > this.frog.maxUsd) {
        this.showModal('Amount of balance must be in $' + this.frog.minUsd + ' .. $' + this.frog.maxUsd)
        return
      }

      if (confirm("You want to withdraw: \n" + this.form.withdraw.lp + " LP?")) {
        const web3 = new Web3(window.ethereum)
        const FrogContract = await new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery)
        await FrogContract.methods.withdraw(
          this.form.withdraw.lp.toString()
        )
          .send({
            from: this.$store.state.account
          })
          .on('sending', () => {
            this.showModal('Waiting for confirmation')
          })
          .on('error', (error) => {
            this.showModal('Transaction error: ' + JSON.stringify(error))
          })
          .on('receipt', (receipt) => {
            this.showModal('Your lp was sent to withdraw!')
            this.form.withdraw.lp = 0;
          })
      }
    },
    async draw() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery)
      await FrogContract.methods.draw()
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Drawing complete!')
        })
    },
    async setBeneficiary() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery)
      await FrogContract.methods.setBeneficiary(this.form.newBeneficiary)
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('New beneficiary was set!')
        })
    },
    async setOwner() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery)
      await FrogContract.methods.transferOwnership(this.form.newOwner)
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('New beneficiary was set!')
        })

    },
    async setFeePercent() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery)
      await FrogContract.methods.setFeePercent(this.form.newFeePercent)
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('New fee percent was set!')
        })
    },
    async claimReward() {
      const web3 = new Web3(window.ethereum)
      const FrogContract = await new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery)
      await FrogContract.methods.claimReward()
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Congratulations! You kept your reward!')
        })
    },
    showModal(content = '') {
      this.modalContent = content;
      this.modalVisible = true;
    },
    hideModal() {
      this.modalContent = '';
      this.modalVisible = false
    },
    async setReferer() {
      const web3 = new Web3(window.ethereum)
      const FrogReferal = new web3.eth.Contract(FrogReferalABI, this.addresses.frogReferal)
      await FrogReferal.methods.add(this.frog.referalInfo.inputReferer.toLowerCase())
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Referer was set!')
        })
      //0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

    },
    async claimReferalReward() {
      const web3 = new Web3(window.ethereum)
      const FrogReferal = new web3.eth.Contract(FrogReferalABI, this.addresses.frogReferal)
      await FrogReferal.methods.claimReward([this.addresses.token0, this.addresses.token1])
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Reward claimed')
        })
      //0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

    },
    async getCake() {
      const web3 = new Web3(window.ethereum)
      const cake = new web3.eth.Contract(ERC20TokenABI, this.addresses.token0)
      await cake.methods.getTokens(BigInt(10 ** 32))
        .send({
          from: this.$store.state.account
        })
        .on('sending', () => {
          this.showModal('Waiting for confirmation')
        })
        .on('error', (error) => {
          this.showModal('Transaction error: ' + JSON.stringify(error))
        })
        .on('receipt', (receipt) => {
          this.showModal('Token Received')
        })
      //0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    },
    async sigAddress(user) {
      const sig = async (types, values, signer) => {
        const message = ethers.utils.defaultAbiCoder.encode(types, values);
        const messageHash = ethers.utils.solidityKeccak256(["bytes"], [message]);
        const messageHashBytes = ethers.utils.arrayify(messageHash);

        const sig1 = await signer.signMessage(messageHashBytes);

        const { v, r, s } = ethers.utils.splitSignature(sig1);
        return {
          message,
          messageHash,
          v,
          r,
          s,
        };
      };
      const { message, v, r, s } = await sig(['address'], [user], new ethers.Wallet(constants[prefix + 'privateKey']))
      return { message, v, r, s }
    },
    changeToken(index) {
      this.tokenSelcted = index
      this.formDepositRate()
      this.$forceUpdate()
    },
    getPrice(amount, sqrtRatioX96, token0Decimals, token1Decimals) {
      const ratioX192 = BigInt(sqrtRatioX96 * sqrtRatioX96) // JSBI.multiply(sqrtRatioX96, sqrtRatioX96)

      const baseAmount = JSBI.BigInt(amount * (10 ** token0Decimals))

      const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192))
      const quote = BigNumber(ratioX192).times(baseAmount).dividedBy(shift.toString()) // FullMath.mulDivRoundingUp(ratioX192, baseAmount, shift)
      return quote.toString() / (10 ** token1Decimals)
    },
    async calculateAmountsForLiquidity(sqrtPriceX96, currentTick, tickLower, tickUpper, liquidity, isMinus) {
      const web3 = new Web3(window.ethereum)
      const FrogContract = new web3.eth.Contract(FrogContractABI, this.addresses.frogLottery);

      // console.log('request')
      const data = await FrogContract.methods.calculateAmountsForLiquidity(sqrtPriceX96, BigInt(currentTick), BigInt(tickLower), BigInt(tickUpper), liquidity, isMinus).call()
      // console.log('respond')
      return { amount0: data.amount0, amount1: data.amount1 }
    }

  },
  created() {
    this.tokenSelcted = 0
    this.updateBalances()
    this.updateParams()
    this.updateParticipants()
    if (typeof window?.ethereum !== 'undefined' && window?.ethereum.isMetaMask == true) {
      const web3 = new Web3(window.ethereum)
      window.ethereum.on('accountsChanged', async (accounts) => {
        this.updateBalances()
        this.updateParams()
        this.updateParticipants()
      });
    }
  },
}
</script>

<style>
table {
  border-collapse: collapse;
  margin: 30px 0;
}

ul {
  margin: 30px 0;
}

td,
th {
  padding: 10px 20px;
  border-bottom: 1px solid;
}

input,
button {
  padding: 10px 15px;
  border-radius: 0;
  border: 1px solid olive;
}

input {
  background-color: white;
}

button {
  cursor: pointer;
  background-color: olive;
  color: white;
}

.pools {
  padding: 100px 0;
  display: flex;
  flex-wrap: wrap;
}

.pool {
  width: 33.3%;
  border: 2px solid olive;
  background-color: white;
  margin-bottom: 25px;
  min-height: 500px;
  position: relative;
}

.token_area {
  border-width: 2px;
  border-color: black;
  border-radius: 12px;
  padding: 20px;
  border-style: solid;
  display: flex;
}

.token_area.active {
  background-color: rgb(83, 83, 200);
}

.token {
  justify-self: center;
  align-self: center;
  font-weight: bold;
}

.choose_token {
  display: flex;
  height: 100px;
  justify-content: space-between;
  padding: 30px;
}

.pool__header,
.pool__footer {
  padding: 30px;
}

.pool__title {
  font-size: 24px;
  font-weight: bold;
}

.pool__body {
  padding: 0 30px 30px;
}

.pool__token__header,
.pool__token__footer {
  display: flex;
  justify-content: space-between;
}

.pool__token__balance,
.pool__token__estimate {
  font-size: 12px;
}

.pool__token__max {
  font-size: 12px !important;
  line-height: 12px !important;
  text-transform: uppercase;
}

.pool__token__name {
  font-weight: bold;
}

.pool__token__count {
  width: 100%;
}

.pool__plus {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

.pool__rates {
  border-top: 2px solid olive;
  margin-top: 20px;
  padding: 20px 0;
  text-align: center;
  display: flex;
  justify-content: space-between;
}

.pool__footer {
  /*position: absolute;*/
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.admin-form {
  margin: 20px 0;
}

small {
  font-size: .5em;
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .pool {
    width: 100%;
  }
}
</style>