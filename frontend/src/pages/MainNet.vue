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
              <div class="pool__token">
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
              <div class="pool__plus">+</div>
              <div class="pool__token">
                <div class="pool__token__header">
                  <label class="pool__token__name">BNB</label>
                  <div class="pool__token__balance">balance: <span>{{ wallet.bnb }}</span></div>
                </div>
                <input-text class="pool__token__count" v-model="form.deposit.bnb" @input="formDepositCakeSync" />
                <div class="pool__token__footer">
                  <div class="pool__token__estimate">~<span>{{ form.deposit.bnb * pancake.rates.bnbusdt }}</span> USD
                  </div>
                  <btn-link class="pool__token__max" @click="formDepositBnbMaximize">max</btn-link>
                </div>
              </div>
              <div class="pool__rates">
                <div class="pool__rate">
                  <div class="pool-rate__value">{{ pancake.rates.bnbcake }}</div>
                  <div class="pool-rate__label">CAKE per BNB</div>
                </div>
                <div class="pool__rate">
                  <div class="pool-rate__value">{{ pancake.rates.cakebnb }}</div>
                  <div class="pool-rate__label">BNB per CAKE</div>
                </div>
              </div>
              <div>
                <btn-primary @click="deposit">Deposit</btn-primary>
              </div>
              <table>
                <tr>
                  <th>Your</th>
                  <th>LP</th>
                  <th>CAKE</th>
                  <th>BNB</th>
                  <th>USDT</th>
                </tr>
                <tr>
                  <td>deposit</td>
                  <td><small>{{ frog.user.deposit }}</small></td>
                  <td><small>{{ frog.user.deposit * pancake.rates.lpcake }}</small></td>
                  <td><small>{{ frog.user.deposit * pancake.rates.lpbnb }}</small></td>
                  <td><small>{{ frog.user.deposit * (pancake.rates.lpcake * pancake.rates.cakeusdt + pancake.rates.lpbnb *
                    pancake.rates.bnbusdt) }}</small></td>
                </tr>
                <tr>
                  <td>balance</td>
                  <td><small>{{ frog.user.balance }}</small></td>
                  <td><small>{{ frog.user.balance * pancake.rates.lpcake }}</small></td>
                  <td><small>{{ frog.user.balance * pancake.rates.lpbnb }}</small></td>
                  <td><small>{{ frog.user.balance * (pancake.rates.lpcake * pancake.rates.cakeusdt + pancake.rates.lpbnb *
                    pancake.rates.bnbusdt) }}</small></td>
                </tr>
                <tr>
                  <td>withdraw</td>
                  <td><small>{{ frog.user.withdraw }}</small></td>
                  <td><small>{{ frog.user.withdraw * pancake.rates.lpcake }}</small></td>
                  <td><small>{{ frog.user.withdraw * pancake.rates.lpbnb }}</small></td>
                  <td><small>{{ frog.user.withdraw * (pancake.rates.lpcake * pancake.rates.cakeusdt + pancake.rates.lpbnb
                    * pancake.rates.bnbusdt) }}</small></td>
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
                <h3>Your Reward: {{ frog.user.reward }}</h3>
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
              <btn-primary @click="claimReward" v-if="frog.user.reward">Claim Reward</btn-primary>
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
              <th>Reward</th>
            </thead>
            <tbody>
              <tr v-for="participant in frog.participants">
                <td>{{ participant.address }}</td>
                <td>{{ participant.balance }}</td>
                <td>{{ participant.reward }}</td>
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

import cakeAbi from '../../../blockchain/artifacts/contracts/pancekeswap-fork/utils/CakeToken.sol/CakeToken.json'
import bnbAbi from '../../../blockchain/artifacts/contracts/frogs/ERC20.sol/ERC20Token.json'
import lotteryAbi from '../../../blockchain/artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json'
import factoryAbi from '../../../blockchain/artifacts/contracts/frogs/Factory.sol/Factory.json'
import referalAbi from "../../../blockchain/artifacts/contracts/frogs/FrogReferal.sol/FrogReferal.json"
import routerAbi from "../../../blockchain/artifacts/contracts/pancekeswap-fork/router.sol/PancakeRouter.json"
import pairAbi from "../../../blockchain/artifacts/contracts/pancekeswap-fork/pancakepair.sol/PancakePair.json"

const bnbChainId = '0x38';
const bnbRpcUrl = 'https://bsc-dataseed.binance.org';

const CakeContractABI = cakeAbi.abi
const CakeContractAddress = constants.addresses.CAKE;

const BnbContractABI = bnbAbi.abi
const BnbContractAddress = constants.addresses.BNB;

const FrogContractABI = lotteryAbi.abi
const FrogContractAddress = constants.addresses.Lottery_CAKE_BNB;

const FactoryABI = factoryAbi.abi
const FactoryAddress = constants.addresses.Factory;

const FrogReferalABI = referalAbi.abi
const FrogReferalAddress = constants.addresses.FrogReferal;

// const FrogContractABI =
//[{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_oldBeneficiary", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_newBeneficiary", "type": "address" }], "name": "BeneficiaryChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_participant", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_oldBalance", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "_drawNumber", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_fundTotal", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_rewardTotal", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_feeTotal", "type": "uint256" }], "name": "Draw", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "_oldFeePercent", "type": "uint256" }, { "indexed": true, "internalType": "uint256", "name": "_newFeePercent", "type": "uint256" }], "name": "FeePercentChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_oldOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "_newOwner", "type": "address" }], "name": "OwnerChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "_drawNumber", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "_winner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "Victory", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "_participant", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "_oldBalance", "type": "uint256" }], "name": "Withdraw", "type": "event" }, { "stateMutability": "payable", "type": "fallback" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "alreadyParticipant", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "beneficiary", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amountToken0", "type": "uint256" }], "name": "deposit", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "depositOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "draw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "drawNumber", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "farmTotal", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "address", "name": "_tokenIn", "type": "address" }, { "internalType": "address", "name": "_tokenOut", "type": "address" }], "name": "getPSRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getParticipants", "outputs": [{ "internalType": "address[]", "name": "result", "type": "address[]" }, { "internalType": "uint256", "name": "counter", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_participant", "type": "address" }], "name": "isParticipant", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxUsd", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minUsd", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "participants", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "rateLPTokens", "outputs": [{ "internalType": "uint256", "name": "lpToken0", "type": "uint256" }, { "internalType": "uint256", "name": "lpToken1", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "rewardOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newBeneficiary", "type": "address" }], "name": "setBeneficiary", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "setBnbContractAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_cakeContractAddress", "type": "address" }], "name": "setCakeContractAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_newFeePercent", "type": "uint256" }], "name": "setFeePercent", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_maxUsdt", "type": "uint256" }], "name": "setMaxUsdt", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_minUsdt", "type": "uint256" }], "name": "setMinUsdt", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newOwner", "type": "address" }], "name": "setOwner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "setPancakeMCAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "setPancakePairAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "setPancakeRouterAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "setUsdtContractAddress", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "withdraw", "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "withdrawOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "stateMutability": "payable", "type": "receive" }];
// const FrogContractAddress = '0x765271F3fB407f2734b957E75DD4B53Ac8285Bb9';

const PancakeRouterABI = routerAbi.abi
//[{ "inputs": [{ "internalType": "address", "name": "_factory", "type": "address" }, { "internalType": "address", "name": "_WETH", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "WETH", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "tokenA", "type": "address" }, { "internalType": "address", "name": "tokenB", "type": "address" }, { "internalType": "uint256", "name": "amountADesired", "type": "uint256" }, { "internalType": "uint256", "name": "amountBDesired", "type": "uint256" }, { "internalType": "uint256", "name": "amountAMin", "type": "uint256" }, { "internalType": "uint256", "name": "amountBMin", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "addLiquidity", "outputs": [{ "internalType": "uint256", "name": "amountA", "type": "uint256" }, { "internalType": "uint256", "name": "amountB", "type": "uint256" }, { "internalType": "uint256", "name": "liquidity", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "amountTokenDesired", "type": "uint256" }, { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" }, { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "addLiquidityETH", "outputs": [{ "internalType": "uint256", "name": "amountToken", "type": "uint256" }, { "internalType": "uint256", "name": "amountETH", "type": "uint256" }, { "internalType": "uint256", "name": "liquidity", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "reserveIn", "type": "uint256" }, { "internalType": "uint256", "name": "reserveOut", "type": "uint256" }], "name": "getAmountIn", "outputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "uint256", "name": "reserveIn", "type": "uint256" }, { "internalType": "uint256", "name": "reserveOut", "type": "uint256" }], "name": "getAmountOut", "outputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }], "name": "getAmountsIn", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }], "name": "getAmountsOut", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountA", "type": "uint256" }, { "internalType": "uint256", "name": "reserveA", "type": "uint256" }, { "internalType": "uint256", "name": "reserveB", "type": "uint256" }], "name": "quote", "outputs": [{ "internalType": "uint256", "name": "amountB", "type": "uint256" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "tokenA", "type": "address" }, { "internalType": "address", "name": "tokenB", "type": "address" }, { "internalType": "uint256", "name": "liquidity", "type": "uint256" }, { "internalType": "uint256", "name": "amountAMin", "type": "uint256" }, { "internalType": "uint256", "name": "amountBMin", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "removeLiquidity", "outputs": [{ "internalType": "uint256", "name": "amountA", "type": "uint256" }, { "internalType": "uint256", "name": "amountB", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "liquidity", "type": "uint256" }, { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" }, { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "removeLiquidityETH", "outputs": [{ "internalType": "uint256", "name": "amountToken", "type": "uint256" }, { "internalType": "uint256", "name": "amountETH", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "liquidity", "type": "uint256" }, { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" }, { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "removeLiquidityETHSupportingFeeOnTransferTokens", "outputs": [{ "internalType": "uint256", "name": "amountETH", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "liquidity", "type": "uint256" }, { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" }, { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bool", "name": "approveMax", "type": "bool" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "removeLiquidityETHWithPermit", "outputs": [{ "internalType": "uint256", "name": "amountToken", "type": "uint256" }, { "internalType": "uint256", "name": "amountETH", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "liquidity", "type": "uint256" }, { "internalType": "uint256", "name": "amountTokenMin", "type": "uint256" }, { "internalType": "uint256", "name": "amountETHMin", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bool", "name": "approveMax", "type": "bool" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens", "outputs": [{ "internalType": "uint256", "name": "amountETH", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "tokenA", "type": "address" }, { "internalType": "address", "name": "tokenB", "type": "address" }, { "internalType": "uint256", "name": "liquidity", "type": "uint256" }, { "internalType": "uint256", "name": "amountAMin", "type": "uint256" }, { "internalType": "uint256", "name": "amountBMin", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "bool", "name": "approveMax", "type": "bool" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "removeLiquidityWithPermit", "outputs": [{ "internalType": "uint256", "name": "amountA", "type": "uint256" }, { "internalType": "uint256", "name": "amountB", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "swapETHForExactTokens", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountOutMin", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "swapExactETHForTokens", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountOutMin", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "swapExactETHForTokensSupportingFeeOnTransferTokens", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "swapExactTokensForETH", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "swapExactTokensForETHSupportingFeeOnTransferTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "swapExactTokensForTokens", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountIn", "type": "uint256" }, { "internalType": "uint256", "name": "amountOutMin", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "amountInMax", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "swapTokensForExactETH", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amountOut", "type": "uint256" }, { "internalType": "uint256", "name": "amountInMax", "type": "uint256" }, { "internalType": "address[]", "name": "path", "type": "address[]" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }], "name": "swapTokensForExactTokens", "outputs": [{ "internalType": "uint256[]", "name": "amounts", "type": "uint256[]" }], "stateMutability": "nonpayable", "type": "function" }, { "stateMutability": "payable", "type": "receive" }];
const PancakeRouterAddress = constants.addresses.Router;

// const PancakeMCABI = [{ "inputs": [{ "internalType": "contract IMasterChef", "name": "_MASTER_CHEF", "type": "address" }, { "internalType": "contract IBEP20", "name": "_CAKE", "type": "address" }, { "internalType": "uint256", "name": "_MASTER_PID", "type": "uint256" }, { "internalType": "address", "name": "_burnAdmin", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "indexed": true, "internalType": "contract IBEP20", "name": "lpToken", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isRegular", "type": "bool" }], "name": "AddPool", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "EmergencyWithdraw", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Init", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "allocPoint", "type": "uint256" }], "name": "SetPool", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "boostContract", "type": "address" }], "name": "UpdateBoostContract", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "oldMultiplier", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newMultiplier", "type": "uint256" }], "name": "UpdateBoostMultiplier", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oldAdmin", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newAdmin", "type": "address" }], "name": "UpdateBurnAdmin", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "burnRate", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "regularFarmRate", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "specialFarmRate", "type": "uint256" }], "name": "UpdateCakeRate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "lpSupply", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "accCakePerShare", "type": "uint256" }], "name": "UpdatePool", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isValid", "type": "bool" }], "name": "UpdateWhiteList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "pid", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdraw", "type": "event" }, { "inputs": [], "name": "ACC_CAKE_PRECISION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "BOOST_PRECISION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "CAKE", "outputs": [{ "internalType": "contract IBEP20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "CAKE_RATE_TOTAL_PRECISION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MASTERCHEF_CAKE_PER_BLOCK", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MASTER_CHEF", "outputs": [{ "internalType": "contract IMasterChef", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MASTER_PID", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_BOOST_PRECISION", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_allocPoint", "type": "uint256" }, { "internalType": "contract IBEP20", "name": "_lpToken", "type": "address" }, { "internalType": "bool", "name": "_isRegular", "type": "bool" }, { "internalType": "bool", "name": "_withUpdate", "type": "bool" }], "name": "add", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "boostContract", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "burnAdmin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "_withUpdate", "type": "bool" }], "name": "burnCake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bool", "name": "_isRegular", "type": "bool" }], "name": "cakePerBlock", "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "cakePerBlockToBurn", "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "cakeRateToBurn", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "cakeRateToRegularFarm", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "cakeRateToSpecialFarm", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "deposit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }], "name": "emergencyWithdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pid", "type": "uint256" }], "name": "getBoostMultiplier", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "harvestFromMasterChef", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "contract IBEP20", "name": "dummyToken", "type": "address" }], "name": "init", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "lastBurnedBlock", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "lpToken", "outputs": [{ "internalType": "contract IBEP20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "massUpdatePools", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "address", "name": "_user", "type": "address" }], "name": "pendingCake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "uint256", "name": "accCakePerShare", "type": "uint256" }, { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, { "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "internalType": "uint256", "name": "totalBoostedShare", "type": "uint256" }, { "internalType": "bool", "name": "isRegular", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "poolLength", "outputs": [{ "internalType": "uint256", "name": "pools", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_allocPoint", "type": "uint256" }, { "internalType": "bool", "name": "_withUpdate", "type": "bool" }], "name": "set", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "totalRegularAllocPoint", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSpecialAllocPoint", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newBoostContract", "type": "address" }], "name": "updateBoostContract", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_newMultiplier", "type": "uint256" }], "name": "updateBoostMultiplier", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_newAdmin", "type": "address" }], "name": "updateBurnAdmin", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_burnRate", "type": "uint256" }, { "internalType": "uint256", "name": "_regularFarmRate", "type": "uint256" }, { "internalType": "uint256", "name": "_specialFarmRate", "type": "uint256" }, { "internalType": "bool", "name": "_withUpdate", "type": "bool" }], "name": "updateCakeRate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }], "name": "updatePool", "outputs": [{ "components": [{ "internalType": "uint256", "name": "accCakePerShare", "type": "uint256" }, { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, { "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "internalType": "uint256", "name": "totalBoostedShare", "type": "uint256" }, { "internalType": "bool", "name": "isRegular", "type": "bool" }], "internalType": "struct MasterChefV2.PoolInfo", "name": "pool", "type": "tuple" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "bool", "name": "_isValid", "type": "bool" }], "name": "updateWhiteList", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "userInfo", "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }, { "internalType": "uint256", "name": "boostMultiplier", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "whiteList", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_pid", "type": "uint256" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
// const PancakeMCAddress = '0xa5f8c5dbd5f286960b9d90548680ae5ebff07652';

const PancakePairCakeWbnbABI = pairAbi.abi
//[{ "inputs": [], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "sender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount0In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1In", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "Swap", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint112", "name": "reserve0", "type": "uint112" }, { "indexed": false, "internalType": "uint112", "name": "reserve1", "type": "uint112" }], "name": "Sync", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "constant": true, "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "MINIMUM_LIQUIDITY", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "PERMIT_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "burn", "outputs": [{ "internalType": "uint256", "name": "amount0", "type": "uint256" }, { "internalType": "uint256", "name": "amount1", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "getReserves", "outputs": [{ "internalType": "uint112", "name": "_reserve0", "type": "uint112" }, { "internalType": "uint112", "name": "_reserve1", "type": "uint112" }, { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_token0", "type": "address" }, { "internalType": "address", "name": "_token1", "type": "address" }], "name": "initialize", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "kLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "mint", "outputs": [{ "internalType": "uint256", "name": "liquidity", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "price0CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "price1CumulativeLast", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "skim", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount0Out", "type": "uint256" }, { "internalType": "uint256", "name": "amount1Out", "type": "uint256" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "swap", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "sync", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "token0", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "token1", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }];
const PancakePairCakeWbnbAddress = constants.addresses.LPToken_CAKE_BNB;

// const CakeContractABI = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "fromDelegate", "type": "address" }, { "indexed": true, "internalType": "address", "name": "toDelegate", "type": "address" }], "name": "DelegateChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegate", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "previousBalance", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256" }], "name": "DelegateVotesChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [], "name": "DELEGATION_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "DOMAIN_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint32", "name": "", "type": "uint32" }], "name": "checkpoints", "outputs": [{ "internalType": "uint32", "name": "fromBlock", "type": "uint32" }, { "internalType": "uint256", "name": "votes", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }], "name": "delegate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "delegateBySig", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "delegator", "type": "address" }], "name": "delegates", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getCurrentVotes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getOwner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "getPriorVotes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_to", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "numCheckpoints", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
// const CakeContractAddress = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82';

// const BnbContractABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "wad", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Withdrawal", "type": "event" }];
// const BnbContractAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

// const UsdtContractABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "guy", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "src", "type": "address" }, { "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "wad", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "dst", "type": "address" }, { "name": "wad", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "guy", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "dst", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Deposit", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "src", "type": "address" }, { "indexed": false, "name": "wad", "type": "uint256" }], "name": "Withdrawal", "type": "event" }];
const UsdtContractAddress = constants.addresses.USDT

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
        },
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
          deposit: 0,
          balance: 0,
          withdraw: 0,
          reward: 0,
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
        cake: 0,
        bnb: 0
      },
      pancake: {
        rates: {
          bnbusdt: 0,
          cakeusdt: 0,
          bnbcake: 0,
          cakebnb: 0,
          lpcake: 0,
          lpbnb: 0,
          cakelp: 0,
          bnblp: 0,
        }
      },
      modalVisible: false,
      modalContent: '',
    }
  },
  methods: {
    async updateParams() {
      const web3 = new Web3(window.ethereum)
      const pancakeRouter = new web3.eth.Contract(PancakeRouterABI, PancakeRouterAddress)

      await pancakeRouter.methods.getAmountsOut(web3.utils.toWei('1', 'ether'), [BnbContractAddress, UsdtContractAddress]).call()
        .then(amountsOut => {
          if (!amountsOut[1]) this.pancake.rates.bnbusdt = 0;
          else this.pancake.rates.bnbusdt = web3.utils.fromWei(amountsOut[1]);
        })
      await pancakeRouter.methods.getAmountsOut(web3.utils.toWei('1', 'ether'), [CakeContractAddress, UsdtContractAddress]).call()
        .then(amountsOut => {
          if (!amountsOut[1]) this.pancake.rates.cakeusdt = 0;
          else this.pancake.rates.cakeusdt = web3.utils.fromWei(amountsOut[1]);
        })

      this.pancake.rates.bnbcake = (this.pancake.rates.bnbusdt / this.pancake.rates.cakeusdt).toFixed(2)
      this.pancake.rates.cakebnb = (this.pancake.rates.cakeusdt / this.pancake.rates.bnbusdt).toFixed(4)

      const pancakePairCakeWbnb = new web3.eth.Contract(PancakePairCakeWbnbABI, PancakePairCakeWbnbAddress);
      const reserves = await pancakePairCakeWbnb.methods.getReserves().call()
      const supply = await pancakePairCakeWbnb.methods.totalSupply().call()
      this.pancake.rates.lpcake = reserves._reserve1 / supply
      this.pancake.rates.lpbnb = reserves._reserve0 / supply
      this.pancake.rates.cakelp = supply / reserves._reserve1;
      this.pancake.rates.bnblp = supply / reserves._reserve0;


      const FrogContract = new web3.eth.Contract(FrogContractABI, FrogContractAddress);
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
        new web3.eth.Contract(CakeContractABI, CakeContractAddress)
          .methods.balanceOf(this.$store.state.account.toLowerCase()).call()
          .then(balance => {
            this.wallet.cake = parseFloat(web3.utils.fromWei(balance))
          })
        new web3.eth.getBalance(this.$store.state.account.toLowerCase())
          .then(balance => {
            this.wallet.bnb = parseFloat(web3.utils.fromWei(balance))
          })

        const frog = new web3.eth.Contract(FrogContractABI, FrogContractAddress)
        frog.methods.depositOf(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.deposit = parseFloat(web3.utils.fromWei(balance))
          })

        frog.methods.balanceOf(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.balance = parseFloat(web3.utils.fromWei(balance))
          })

        frog.methods.withdrawOf(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.withdraw = parseFloat(web3.utils.fromWei(balance))
          })

        frog.methods.rewardOf(this.$store.state.account).call()
          .then(balance => {
            this.frog.user.reward = parseFloat(web3.utils.fromWei(balance))
          })

        const Cake = new web3.eth.Contract(BnbContractABI, CakeContractAddress)

        await Cake.methods.balanceOf(FrogContractAddress).call()
          .then(balance => {
            this.frog.nowIn = parseFloat(web3.utils.fromWei(balance))
          })

        await Cake.methods.balanceOf(FactoryAddress).call()
          .then(balance => {
            this.frog.beneficiaryAmount = parseFloat(web3.utils.fromWei(balance))
          })

        const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)

        await FrogReferal.methods.balance(CakeContractAddress, this.$store.state.account).call()
          .then(balance => {
            console.log(balance)
            this.frog.user.referalReward = parseFloat(web3.utils.fromWei(balance))
          })

      }
      setTimeout(this.updateBalances, 20000)
    },
    async updateParticipants() {
      // @TODO check isOwner
      const web3 = new Web3(window.ethereum)
      const FrogContract = new web3.eth.Contract(FrogContractABI, FrogContractAddress)

      FrogContract.methods.farmTotal().call().then(farmTotal => {
        this.frog.farmTotal = web3.utils.fromWei(farmTotal)
      })
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
          reward: web3.utils.fromWei(await FrogContract.methods.rewardOf(_participant).call()),
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
      // const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)

      // const referalInfo = await FrogReferal.methods.refererOf(this.$store.state.account.toLowerCase()).call()
      const data = await axios.post('http://localhost:3001/getUser', { wallet: this.$store.state.account.toLowerCase() })
      console.log("data", data.data)
      if (data.data.user == null) {
        this.frog.referalInfo.referer = '-11'
        this.frog.referalInfo.percent = -11
      } else {
        this.frog.referalInfo.referer = data.data.referer.wallet
        this.frog.referalInfo.percent = data.data.user.percent / 100
      }

      setTimeout(this.updateParticipants, 20000)
    },
    formDepositBnbSync() {
      const usdtAmount = this.form.deposit.cake * this.pancake.rates.cakeusdt
      this.form.deposit.bnb = usdtAmount / this.pancake.rates.bnbusdt
    },
    formDepositCakeSync() {
      const usdtAmount = this.form.deposit.bnb * this.pancake.rates.bnbusdt
      this.form.deposit.cake = usdtAmount / this.pancake.rates.cakeusdt
    },
    formDepositCakeMaximize() {
      this.form.deposit.cake = this.wallet.cake
      this.formDepositBnbSync()
    },
    formDepositBnbMaximize() {
      this.form.deposit.bnb = this.wallet.bnb
      this.formDepositCakeSync()
    },
    async deposit() {
      var errors = [];

      if (this.wallet.cake < this.form.deposit.cake) {
        errors.push("Not enough CAKE")
      }
      if (this.wallet.bnb < this.form.deposit.bnb) {
        errors.push("Not enough BNB")
      }
      const futureBalance = (this.frog.user.balance + this.frog.user.deposit - this.frog.user.withdraw) * (this.pancake.rates.lpcake * this.pancake.rates.cakeusdt + this.pancake.rates.lpbnb * this.pancake.rates.bnbusdt)
      const deposit = this.form.deposit.cake * this.pancake.rates.cakeusdt + this.form.deposit.bnb * this.pancake.rates.bnbusdt
      if (futureBalance + deposit < this.frog.minUsd || futureBalance + deposit > this.frog.maxUsd) {
        errors.push('Amount of balance must be in $' + this.frog.minUsd + ' .. $' + this.frog.maxUsd + "")
      }
      if (errors.length) {
        this.showModal(errors.join(', '))
      } else {
        const web3 = new Web3(window.ethereum)
        const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)
        const isPartisipant = await FrogReferal.methods.alreadyParticipant(this.$store.state.account).call()
        console.log(isPartisipant, "isPartisipant")
        if (this.frog.referalInfo.referer == '-11') {
          this.showModal('Not a referal')
        } else if (confirm("You want to send: \n" + this.form.deposit.cake + " CAKE\n" + this.form.deposit.bnb + " BNB")) {
          const allowance0 = web3.utils.fromWei(await new web3.eth.Contract(CakeContractABI, CakeContractAddress)
            .methods.allowance(this.$store.state.account, FrogContractAddress).call());
          if (allowance0 < this.form.deposit.cake) {
            const approveCake = await new web3.eth.Contract(CakeContractABI, CakeContractAddress)
              .methods.approve(FrogContractAddress, web3.utils.toWei(this.form.deposit.cake.toString()))
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

          const amountToken0 = web3.utils.toWei(this.form.deposit.cake.toString().substring(0, 20));
          const amountToken1 = web3.utils.toWei(this.form.deposit.bnb.toString().substring(0, 20));
          const FrogContract = new web3.eth.Contract(FrogContractABI, FrogContractAddress)
          if (isPartisipant) {
            await FrogContract.methods.deposit(
              amountToken0,
              amountToken1
            )
              .send({
                from: this.$store.state.account,
                value: amountToken1
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
          } else {
            const { message, v, r, s } = await this.sigAddress(this.$store.state.account)
            await FrogContract.methods.registerBeforeDeposit(message, v, r, s,
              amountToken0,
              amountToken1
            )
              .send({
                from: this.$store.state.account,
                value: amountToken1
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
        const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
        await FrogContract.methods.withdraw(
          web3.utils.toWei(this.form.withdraw.lp.toString())
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
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
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
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
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
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
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
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
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
      const FrogContract = await new web3.eth.Contract(FrogContractABI, FrogContractAddress)
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
      const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)
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
      const FrogReferal = new web3.eth.Contract(FrogReferalABI, FrogReferalAddress)
      await FrogReferal.methods.claimReward(CakeContractAddress)
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
      const cake = new web3.eth.Contract(CakeContractABI, CakeContractAddress)
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
      const { message, v, r, s } = await sig(['address'], [user], new ethers.Wallet(constants.privateKey))
      return { message, v, r, s }
    }
  },
  created() {
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