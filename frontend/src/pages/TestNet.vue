<template>
  <div>
    <!--    <btn-primary @click="showModal">Modal</btn-primary>-->
    <!--    asd-->
    <modal v-model:show="modalVisible">{{ modalContent }}</modal>
    <!--    <ui-select-->
    <!--        v-model="selectedSort"-->
    <!--        :options="sortOptions"-->
    <!--    />-->
    <div class="container">
      <div class="pools">
        <div class="pool">
          <div class="pool__header">
            <div class="pool__title">CAKE-BNB</div>
          </div>
          <template v-if="$store.state.account">
            <div class="pool__body">
              <div class="pool__token">
                <div class="pool__token__header">
                  <label class="pool__token__name">CAKE</label>
                  <div class="pool__token__balance">balance: <span>{{ tCakeBalance }}</span></div>
                </div>
                <input-text class="pool__token__count" v-model="tCakeToLiquidity" @input="syncTBnbLiquidity" v-focus />
                <div class="pool__token__footer">
                  <div class="pool__token__estimate">~<span id="labelCAKEInUSD">{{ tCakeToLiquidityByUsdt }}</span> USD
                  </div>
                  <btn-link class="pool__token__max" @click="tCakeToLiquidityMax">max</btn-link>
                </div>
              </div>
              <div class="pool__plus">+</div>
              <div class="pool__token">
                <div class="pool__token__header">
                  <label class="pool__token__name">BNB</label>
                  <div class="pool__token__balance">balance: <span>{{ tBnbBalance }}</span></div>
                </div>
                <input-text class="pool__token__count" v-model="tBnbToLiquidity" @input="syncTCakeLiquidity" />
                <div class="pool__token__footer">
                  <div class="pool__token__estimate">~<span id="labelBNBInUSD">{{ tBnbToLiquidityByUsdt }}</span> USD
                  </div>
                  <btn-link class="pool__token__max" @click="tBnbToLiquidityMax">max</btn-link>
                </div>
              </div>
              <div class="pool__rates">
                <div class="pool__rate">
                  <div class="pool-rate__value" id="labelCAKEBNBRate">{{ tBnbtCake }}</div>
                  <div class="pool-rate__label">CAKE per BNB</div>
                </div>
                <div class="pool__rate">
                  <div class="pool-rate__value" id="labelBNBCAKERate">{{ tCaketBnb }}</div>
                  <div class="pool-rate__label">BNB per CAKE</div>
                </div>
              </div>
              <table>
                <tr>
                  <th>Your</th>
                  <th>tCake</th>
                  <th>tBnb</th>
                </tr>
                <tr>
                  <td>deposit</td>
                  <td><small>{{ tCakeDeposit }}</small></td>
                  <td><small>{{ tBnbDeposit }}</small></td>
                </tr>
                <tr>
                  <td>balance</td>
                  <td><small>{{ tCakeLiquidity }}</small></td>
                  <td><small>{{ tBnbLiquidity }}</small></td>
                </tr>
                <tr>
                  <td>withdraw</td>
                  <td><small>{{ tCakeWithdraw }}</small></td>
                  <td><small>{{ tBnbWithdraw }}</small></td>
                </tr>
              </table>
              <div>
                <h3>Last Draw Number: {{ drawNumber }}</h3>
              </div>
              <div>
                <h3>Total Farm: {{ farmTotal }}</h3>
              </div>
              <div>
                <h3>Your Reward: {{ reward }}</h3>
              </div>
              <div>
                <h3>Your referal reward: {{ referalReward }}</h3>
              </div>
              <div>
                <h3>Your referer: {{ referer.substring(0, 6) }}</h3>
              </div>
              <div>
                <h3>Your percent: {{ percent }}</h3>
              </div>
              <btn-primary @click="claimReward" v-if="reward">Claim Reward</btn-primary>
              <btn-primary @click="claimReferalReward" v-if="reward">Claim Referal Reward</btn-primary>
            </div>
            <div class="pool__footer">
              <btn-primary @click="addLiquidity">Add Liquidity</btn-primary>
              <btn-primary @click="removeLiquidity">Remove Liquidity</btn-primary>
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
      <h2>tCake <small>(you have: {{ tCakeBalance }} tokens)</small></h2>
      <btn-link @click="addTCakeToWallet">Don't see tokens in your wallet?</btn-link>
      <form @submit.prevent class="admin-form">
        <input-text v-model="tCakeTransferModel.address" placeholder="Address" class="input" />
        <input-text v-model="tCakeTransferModel.amount" placeholder="Amount" class="input" />
        <btn-primary @click="tCakeTransfer">Send TCake</btn-primary>
      </form>
      <h2>tBnb <small>(you have: {{ tBnbBalance }} tokens)</small></h2>
      <btn-link @click="addTBnbToWallet">Don't see tokens in your wallet?</btn-link>
      <form @submit.prevent class="admin-form">
        <input-text v-model="tBnbTransferModel.address" placeholder="Address" class="input" />
        <input-text v-model="tBnbTransferModel.amount" placeholder="Amount" class="input" />
        <btn-primary @click="tBnbTransfer">Send TBnb</btn-primary>
      </form>
      <btn-primary @click="farm">Farm</btn-primary>&nbsp;<btn-primary @click="draw">Draw</btn-primary>

      <div v-if="isOwner">
        <h2>Admin <small>(owner: {{ owner }})</small></h2>
        <br>
        <h3>Beneficiary <small>(current: {{ beneficiary }})</small></h3>
        <h3>Winners count <small>(current: {{ winnersCount }})</small></h3>
        <h3>Farm Total: <small> {{ farmTotal }}</small></h3>
        <h3>Last Draw number: <small> {{ drawNumber }}</small></h3>
        <form @submit.prevent class="admin-form">
          <input-text v-model="newBeneficiary" placeholder="New Beneficiary Address" class="input" />
          <btn-primary @click="setBeneficiary">Set beneficiary</btn-primary>
        </form>
        <form @submit.prevent class="admin-form">
          <input-text v-model="newWinnersCount" placeholder="New Winners Count" class="input" />
          <btn-primary @click="setWinnersCount">Set winners count</btn-primary>
        </form>

        <template v-if="participants">
          <h2>Current Participants</h2>
          <table>
            <thead>
              <th>Address</th>
              <th>tCake</th>
              <th>tBnb</th>
              <th>Reward</th>
            </thead>
            <tbody>
              <tr v-for="participant in participants">
                <td>{{ participant.address }}</td>
                <td>{{ participant.tCakeLiquidity }}</td>
                <td>{{ participant.tBnbLiquidity }}</td>
                <td>{{ participant.reward }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="victories">
          <h2>Table of Winners</h2>
          <table>
            <thead>
              <th>Draw</th>
              <th>Winner</th>
              <th>Amount</th>
            </thead>
            <tbody>
              <tr v-for="victory in victories">
                <td>{{ victory.drawNumber }}</td>
                <td>{{ victory.winner }}</td>
                <td>{{ victory.amount }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <template v-if="draws">
          <h2>Table of Draws</h2>
          <table>
            <thead>
              <th>#</th>
              <th>Fund</th>
              <th>Reward</th>
              <th>Fee</th>
            </thead>
            <tbody>
              <tr v-for="draw in draws">
                <td>{{ draw.number }}</td>
                <td>{{ draw.fund }}</td>
                <td>{{ draw.reward }}</td>
                <td>{{ draw.fee }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <btn-primary @click="farm">Farm</btn-primary>&nbsp;<btn-primary @click="draw">Draw</btn-primary>
        <ul>
          <li v-if="false"><b>t1:</b> 0xAd016b931Dd82EEaaeCBC767C94AEd7F92Da82B4</li>
          <li v-if="false"><b>t2:</b> 0x3db560e154163E7E98880E1B7D14E0b8296A5bDD</li>
          <li v-if="false"><b>t3:</b> 0x18Eb6f754e382AfC4C87ad204B118D12ea447741</li>
          <li><b>tCake:</b> 0x1337692b72929102b3fC1394C7a23508eb5B005D</li>
          <li><b>tBnb:</b> 0xF4ab5127063978De04Ce0A95581a3fDC0B0390f7</li>
          <li><b>tFrog:</b> 0x5F4aa29DEDdd6DD3e6a804482cEFf5618a22BEe7</li>
        </ul>
        <br>
        <br>
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

import cakeAbi from '../../../blockchain/artifacts/contracts/pancekeswap-fork/utils/CakeToken.sol/CakeToken.json'
import bnbAbi from '../../../blockchain/artifacts/contracts/ERC20.sol/ERC20Token.json'
import lotteryAbi from '../../../blockchain/artifacts/contracts/FrogLottery.sol/FrogLottery.json'
import factoryAbi from '../../../blockchain/artifacts/contracts/Factory.sol/Factory.json'
import referalAbi from "../../../blockchain/artifacts/contracts/FrogReferal.sol/FrogReferal.json"

const testBnbChainId = '0x61';

const tCakeContractABI = cakeAbi.abi
const tCakeContractAddress = constants.addresses.CAKE;

const tBnbContractABI = bnbAbi.abi
const tBnbContractAddress = constants.addresses.BNB;

const tFrogContractABI = lotteryAbi.abi
const tFrogContractAddress = constants.addresses.Lottery_CAKE_BNB;

const tFactoryABI = factoryAbi.abi
const tFactoryAddress = constants.addresses.Factory;

const tFrogReferalABI = referalAbi.abi
const tFrogReferalAddress = constants.addresses.FrogReferal;

export default {
  components: {
    BtnPrimary,
    Modal
  },

  data() {
    return {
      chain: "",
      farmTotal: 0,
      drawNumber: 0,
      reward: 0,
      owner: 0,
      beneficiary: 0,
      newBeneficiary: '',
      winnersCount: 0,
      newWinnersCount: '',
      isOwner: false,
      tBnbUsdt: 1,
      tCakeUsdt: 1,
      tBnbtCake: 0,
      tCaketBnb: 0,
      tCakeBalance: 0,
      tBnbBalance: 0,
      tCakeLiquidity: 0,
      tCakeDeposit: 0,
      tCakeWithdraw: 0,
      tCakeToLiquidity: 0,
      tCakeToLiquidityByUsdt: 0,
      tBnbLiquidity: 0,
      tBnbDeposit: 0,
      tBnbWithdraw: 0,
      tBnbToLiquidity: 0,
      tBnbToLiquidityByUsdt: 0,
      tvlMin: 50,
      tvlMax: 500,
      tvl: 0,
      tCakeTransferModel: {
        address: '',
        amount: '',
      },
      tBnbTransferModel: {
        address: '',
        amount: '',
      },
      participants: [],
      draws: [],
      victories: [],
      modalVisible: false,
      modalContent: '',
      selectedSort: '',
      sortOptions: [
        {
          value: 1,
          name: 'first'
        },
        {
          value: 2,
          name: 'second'
        },
      ],
      percent: 100,
      referer: "0x",
      referalReward: 100
    }
  },
  methods: {
    async updateRates() {
      const web3 = new Web3(window.ethereum)
      const tFrogContract = new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)
      this.tBnbUsdt = await tFrogContract.methods.tBnbUsdtRate().call() / 100
      this.tCakeUsdt = await tFrogContract.methods.tCakeUsdtRate().call() / 100
      this.tBnbtCake = (this.tBnbUsdt / this.tCakeUsdt).toFixed(2)
      this.tCaketBnb = (this.tCakeUsdt / this.tBnbUsdt).toFixed(4)
      setTimeout(this.updateRates, 60000)
    },
    async updateBalances() {
      if (this.$store.state.account) {
        const web3 = new Web3(window.ethereum)

        new web3.eth.Contract(tCakeContractABI, tCakeContractAddress)
          .methods.balanceOf(this.$store.state.account.toLowerCase()).call()
          .then(balance => {
            this.tCakeBalance = parseFloat(web3.utils.fromWei(balance))
          })

        new web3.eth.Contract(tBnbContractABI, tBnbContractAddress)
          .methods.balanceOf(this.$store.state.account.toLowerCase()).call()
          .then(balance => {
            this.tBnbBalance = parseFloat(web3.utils.fromWei(balance))
          })

        const tFrogContract = new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)
        tFrogContract.methods.balanceOf(this.$store.state.account).call()
          .then(balance => {
            console.log(33, balance)
            this.tCakeLiquidity = parseFloat(web3.utils.fromWei(balance))
          })
        tFrogContract.methods.balanceOf(this.$store.state.account).call()
          .then(balance => {
            this.tBnbLiquidity = parseFloat(web3.utils.fromWei(balance))
          })
        tFrogContract.methods.depositOf(this.$store.state.account).call()
          .then(balance => {
            this.tCakeDeposit = parseFloat(web3.utils.fromWei(balance))
          })
        tFrogContract.methods.depositOf(this.$store.state.account).call()
          .then(balance => {
            this.tBnbDeposit = parseFloat(web3.utils.fromWei(balance))
          })
        tFrogContract.methods.withdrawOf(this.$store.state.account).call()
          .then(balance => {
            this.tCakeWithdraw = parseFloat(web3.utils.fromWei(balance))
          })
        tFrogContract.methods.withdrawOf(this.$store.state.account).call()
          .then(balance => {
            this.tBnbWithdraw = parseFloat(web3.utils.fromWei(balance))
          })
        tFrogContract.methods.rewardOf(this.$store.state.account).call()
          .then(balance => {
            this.reward = parseFloat(web3.utils.fromWei(balance))
          })
      }
      setTimeout(this.updateBalances, 10000)
    },
    async updateReferalData() {
      if (this.$store.state.account) {
        const web3 = new Web3(window.ethereum)
        console.log("ref")

        const contract = new web3.eth.Contract(tFrogReferalABI, tFrogReferalAddress)
        contract.methods.getReferalInfo(this.$store.state.account.toLowerCase()).call()
          .then(ReferalInfo => {
            this.referer = ReferalInfo.participant
            this.percent = ReferalInfo.percent
          })

        contract.methods.balance(this.$store.state.account.toLowerCase()).call()
          .then(reward => {
            this.referalReward = reward
          })
      }
    },
    async updateParticipants() {
      const web3 = new Web3(window.ethereum)
      const tFrogContract = new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)
      tFrogContract.methods.farmTotal().call().then(farmTotal => {
        this.farmTotal = web3.utils.fromWei(farmTotal)
      })
      tFrogContract.methods.drawNumber().call().then(drawNumber => {
        this.drawNumber = drawNumber
      })
      tFrogContract.methods.owner().call().then(owner => {
        this.owner = owner
        this.isOwner = owner.toLowerCase() === this.$store.state.account.toLowerCase()
      })
      tFrogContract.methods.beneficiary().call().then(beneficiary => {
        this.beneficiary = beneficiary
      })
      // tFrogContract.methods.winnersCount().call().then(winnersCount => {
      // this.winnersCount = winnersCount
      // })

      // Table Of Participants
      const participants = await tFrogContract.methods.getParticipants().call()
      var _participants = [];
      let tvl = 0;
      for (const _participant of participants.result) {
        if (parseInt(_participant, 16) !== 0) {
          const participant = {
            address: _participant,
            tCakeLiquidity: web3.utils.fromWei(await tFrogContract.methods.balanceOfTCake(_participant).call()),
            tBnbLiquidity: web3.utils.fromWei(await tFrogContract.methods.balanceOfTBnb(_participant).call()),
            reward: web3.utils.fromWei(await tFrogContract.methods.balanceOfReward(_participant).call()),
          }
          tvl += participant.tCakeLiquidity * this.tCakeUsdt + participant.tBnbLiquidity * this.tBnbUsdt
          _participants.push(participant)
        }
      }
      this.participants = _participants;

      // Table Of Winners
      var _victories = [];
      const victories = await tFrogContract.getPastEvents('Victory', {
        // @TODO Block Frog deploy
        fromBlock: 26484147,
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
      this.victories = _victories;

      // Table Of Draws
      var _draws = [];
      // @TODO how to find Draw Event?!?!
      const draws = await tFrogContract.getPastEvents('AllEvents', {
        // @TODO Block Frog deploy
        fromBlock: 26484147,
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
      this.draws = _draws;

      this.tvl = tvl
      setTimeout(this.updateParticipants, 10000)
    },
    syncTBnbLiquidity() {
      this.tCakeToLiquidityByUsdt = this.tCakeToLiquidity * this.tCakeUsdt
      this.tBnbToLiquidity = this.tCakeToLiquidityByUsdt / this.tBnbUsdt
      this.tBnbToLiquidityByUsdt = this.tCakeToLiquidityByUsdt
    },
    syncTCakeLiquidity() {
      this.tBnbToLiquidityByUsdt = this.tBnbToLiquidity * this.tBnbUsdt
      this.tCakeToLiquidity = this.tBnbToLiquidityByUsdt / this.tCakeUsdt
      this.tCakeToLiquidityByUsdt = this.tBnbToLiquidityByUsdt
    },
    tCakeToLiquidityMax() {
      this.tCakeToLiquidity = this.tCakeBalance
      this.syncTBnbLiquidity()
    },
    tBnbToLiquidityMax() {
      this.tBnbToLiquidity = this.tBnbBalance
      this.syncTCakeLiquidity()
    },
    async addLiquidity() {
      var errors = [];

      if ((this.tCakeBalance - this.tCakeToLiquidity) < 0) {
        errors.push("Not enough tCAKE")
      }
      if ((this.tBnbBalance - this.tBnbToLiquidity) < 0) {
        errors.push("Not enough tBNB")
      }
      const tvl = this.tCakeToLiquidityByUsdt + this.tBnbToLiquidityByUsdt
      if (tvl < this.tvlMin || tvl > this.tvlMax) {
        errors.push('Amount of liquidity must be in $' + this.tvlMin + ' .. $' + this.tvlMax + "")
      }
      if (errors.length) {
        this.showModal(errors.join(', '))
      } else {
        if (confirm("You want to send: \n" + this.tCakeToLiquidity + " tCAKE\n" + this.tBnbToLiquidity + " tBNB")) {
          const web3 = new Web3(window.ethereum)
          const txCake = await new web3.eth.Contract(tCakeContractABI, tCakeContractAddress)
            .methods.approve(tFrogContractAddress, web3.utils.toWei(this.tCakeToLiquidity.toString()))
            .send({
              from: this.$store.state.account
            })
            .on('sending', () => {
              this.showModal('Waiting for confirmation')
            })
          if (txCake.status != true) this.showModal('Something went wrong with tCake approve!')

          const txBnb = await new web3.eth.Contract(tBnbContractABI, tBnbContractAddress)
            .methods.approve(tFrogContractAddress, web3.utils.toWei(this.tBnbToLiquidity.toString()))
            .send({
              from: this.$store.state.account
            })
            .on('sending', () => {
              this.showModal('Waiting for confirmation')
            })
          if (txBnb.status != true) this.showModal('Something went wrong with tBnb approve!')
          const tFrogContract = await new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)
          console.log(tFrogContract)
          await tFrogContract.methods.deposit(
            web3.utils.toWei(this.tCakeToLiquidity.toString())
          )
            .send({
              from: this.$store.state.account,
              value: web3.utils.toWei(this.tCakeToLiquidity.toString())
            })
            .on('sending', () => {
              this.showModal('Waiting for confirmation')
            })
            .on('error', (error) => {
              this.showModal('Transaction error: ' + JSON.stringify(error))
            })
            .on('receipt', (receipt) => {
              this.showModal('Your liquidity was added at the pool!')
              this.tCakeToLiquidity = 0;
              this.tBnbToLiquidity = 0;
            })
          this.updateBalances()
        }
      }
    },
    async removeLiquidity() {
      var errors = [];

      if ((this.tCakeLiquidity + this.tCakeDeposit - this.tCakeWithdraw - this.tCakeToLiquidity) < 0) {
        errors.push("Not enough tCAKE")
      }
      if ((this.tBnbLiquidity + this.tBnbDeposit - this.tBnbWithdraw - this.tBnbToLiquidity) < 0) {
        errors.push("Not enough tBNB")
      }

      if (errors.length) {
        this.showModal(errors.join(', '))
      } else {
        if (confirm("You want to removeLiquidity: \n" + this.tCakeToLiquidity + " tCAKE\n" + this.tBnbToLiquidity + " tBNB")) {
          const web3 = new Web3(window.ethereum)
          const tFrogContract = await new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)

          await tFrogContract.methods.removeLiquidity(
            web3.utils.toWei(this.tCakeToLiquidity.toString()),
            web3.utils.toWei(this.tBnbToLiquidity.toString())
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
              this.showModal('Your liquidity was removed!')
              this.tCakeToLiquidity = 0;
              this.tBnbToLiquidity = 0;
            })
        }
      }
    },
    async farm() {
      const web3 = new Web3(window.ethereum)
      const tFrogContract = await new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)
      await tFrogContract.methods.farm()
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
          this.showModal('Farming complete!')
        })
    },
    async draw() {
      const web3 = new Web3(window.ethereum)
      const tFrogContract = await new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)
      await tFrogContract.methods.draw()
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
      this.updateBalances()

    },
    async setBeneficiary() {
      const web3 = new Web3(window.ethereum)
      const tFrogContract = await new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)
      await tFrogContract.methods.setBeneficiary(this.newBeneficiary)
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
    async setWinnersCount() {
      const web3 = new Web3(window.ethereum)
      const tFrogContract = await new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)
      await tFrogContract.methods.setWinnersCount(this.newWinnersCount)
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
          this.showModal('New winners count was set!')
        })
    },
    async claimReward() {
      const web3 = new Web3(window.ethereum)
      const tFrogContract = await new web3.eth.Contract(tFrogContractABI, tFrogContractAddress)
      await tFrogContract.methods.claimReward()
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
    async tCakeTransfer() {
      if (confirm('Send ' + this.tCakeTransferModel.amount + 'tCake to ' + this.tCakeTransferModel.address)) {
        if (this.tCakeBalance - this.tCakeTransferModel.amount < 0) {
          this.showModal('Not enough tCake!')
          return;
        }
        const web3 = new Web3(window.ethereum)
        const tCakeContract = await new web3.eth.Contract(tCakeContractABI, tCakeContractAddress)
        tCakeContract.methods.transfer(this.tCakeTransferModel.address, web3.utils.toWei(this.tCakeTransferModel.amount))
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
            this.showModal('Tokens sent successfully!')
            this.tCakeTransferModel = {
              address: '',
              amount: ''
            }
          })
      }
    },
    async addTCakeToWallet() {
      const web3 = new Web3(window.ethereum)
      const tCakeContract = await new web3.eth.Contract(tCakeContractABI, tCakeContractAddress)
      const tokenSymbol = await tCakeContract.methods.symbol().call()
      const tokenDecimals = await tCakeContract.methods.decimals().call()
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tCakeContractAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            // image: tokenImage,
          },
        },
      });
    },
    async tBnbTransfer() {
      if (confirm('Send ' + this.tBnbTransferModel.amount + 'tBnb to ' + this.tBnbTransferModel.address)) {
        if (this.tBnbBalance - this.tBnbTransferModel.amount < 0) {
          this.showModal('Not enough tBnb!');
          return;
        }
        const web3 = new Web3(window.ethereum)
        const tBnbContract = await new web3.eth.Contract(tBnbContractABI, tBnbContractAddress)
        tBnbContract.methods.transfer(this.tBnbTransferModel.address, web3.utils.toWei(this.tBnbTransferModel.amount))
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
            this.showModal('Tokens sent successfully!')
            this.tBnbTransferModel = {
              address: '',
              amount: ''
            }
          })
      }
    },
    async addTBnbToWallet() {
      const web3 = new Web3(window.ethereum)
      const tBnbContract = await new web3.eth.Contract(tBnbContractABI, tBnbContractAddress)
      const tokenSymbol = await tBnbContract.methods.symbol().call()
      const tokenDecimals = await tBnbContract.methods.decimals().call()
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tBnbContractAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            // image: tokenImage,
          },
        },
      });
    },
    async claimReferalReward() {
      const web3 = new Web3(window.ethereum)
      const tFrogReferal = new web3.eth.Contract(tFrogReferalABI, tFrogReferalAddress)
      await tFrogReferal.methods.claimReward()
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
  },
  created() {
    this.updateBalances()
    this.updateRates()
    this.updateParticipants()
    this.updateReferalData()
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

.pool__header,
.pool__footer {
  padding: 30px;
}

.pool__title {
  font-size: 24px;
  font-weight: bold;
}

.pool__body {
  padding: 0 30px;
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