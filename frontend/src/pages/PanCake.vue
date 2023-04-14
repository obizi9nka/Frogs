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
                  <div class="pool__token__balance">balance: <span>{{ cakeBalance }}</span></div>
                </div>
                <input-text class="pool__token__count" v-model="cakeToLiquidity" @input="syncBnbLiquidity" v-focus />
                <div class="pool__token__footer">
                  <div class="pool__token__estimate">~<span id="labelCAKEInUSD">{{ cakeToLiquidityByUsdt }}</span> USD</div>
                  <btn-link class="pool__token__max" @click="cakeToLiquidityMax">max</btn-link>
                </div>
              </div>
              <div class="pool__plus">+</div>
              <div class="pool__token">
                <div class="pool__token__header">
                  <label class="pool__token__name">BNB</label>
                  <div class="pool__token__balance">balance: <span>{{ bnbBalance }}</span></div>
                </div>
                <input-text class="pool__token__count" v-model="bnbToLiquidity" @input="syncCakeLiquidity" />
                <div class="pool__token__footer">
                  <div class="pool__token__estimate">~<span id="labelBNBInUSD">{{ bnbToLiquidityByUsdt }}</span> USD</div>
                  <btn-link class="pool__token__max" @click="bnbToLiquidityMax">max</btn-link>
                </div>
              </div>
              <div class="pool__rates">
                <div class="pool__rate">
                  <div class="pool-rate__value" id="labelCAKEBNBRate">{{ bnbCake }}</div>
                  <div class="pool-rate__label">CAKE per BNB</div>
                </div>
                <div class="pool__rate">
                  <div class="pool-rate__value" id="labelBNBCAKERate">{{ cakeBnb }}</div>
                  <div class="pool-rate__label">BNB per CAKE</div>
                </div>
              </div>
            </div>
            <div class="pool__footer">
              <btn-primary @click="addLiquidity">Add Liquidity</btn-primary>
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

      <div><h3>Wallet LP: {{lpBalance}}</h3> </div>
      <div><h3>Staked LP: {{stakedLP}}</h3> </div>
      <div><h3>Earned: {{earnedCake}}</h3> </div>
      <btn-primary @click="harvest" v-if="earnedCake">Harvest</btn-primary>

      <form @submit.prevent class="admin-form">
        <input-text
            v-model="lpToPool"
            placeholder="Amount"
            class="input"
        />
        <btn-primary @click="liquidityToPool">Add LP to Pool</btn-primary>
      </form>
      <form @submit.prevent class="admin-form">
        <input-text
            v-model="lpFromPool"
            placeholder="Amount"
            class="input"
        />
        <btn-primary @click="liquidityFromPool">Remove LP from Pool</btn-primary>
      </form>

      <form @submit.prevent class="admin-form">
        <input-text
            v-model="lpSplit"
            placeholder="Amount"
            class="input"
        />
        <btn-primary @click="liquiditySplit">Split LP</btn-primary>
      </form>


      <h2>Cake <small>(you have: {{ cakeBalance }} tokens)</small></h2>
      <btn-link @click="addCakeToWallet">Don't see tokens in your wallet?</btn-link>
      <form @submit.prevent class="admin-form">
        <input-text
            v-model="cakeTransferModel.address"
            placeholder="Address"
            class="input"
        />
        <input-text
            v-model="cakeTransferModel.amount"
            placeholder="Amount"
            class="input"
        />
        <btn-primary @click="cakeTransfer">Send Cake</btn-primary>
      </form>
      <h2>Bnb <small>(you have: {{ bnbBalance }} tokens)</small></h2>
<!--      <btn-link @click="addBnbToWallet">Don't see tokens in your wallet?</btn-link>-->
      <form @submit.prevent class="admin-form">
        <input-text
            v-model="bnbTransferModel.address"
            placeholder="Address"
            class="input"
        />
        <input-text
            v-model="bnbTransferModel.amount"
            placeholder="Amount"
            class="input"
        />
        <btn-primary @click="bnbTransfer">Send Bnb</btn-primary>
      </form>
    </div> <!-- .container -->
  </div> <!-- .app -->
</template>

<script>
import Web3 from 'web3';
import axios from 'axios';
import AppHeader from '@/components/AppHeader';
import {
  encrypt,
  recoverPersonalSignature,
  recoverTypedSignatureLegacy,
  recoverTypedSignature,
  recoverTypedSignature_v4 as recoverTypedSignatureV4,
} from '@metamask/eth-sig-util';
// import recoverTypedSignature from '@metamask/eth-sig-util';
import Modal from "@/components/UI/Modal";
import BtnPrimary from "@/components/UI/BtnPrimary";

const bnbChainId = '0x38';
const bnbRpcUrl = 'https://bsc-dataseed.binance.org';

const PancakeRouterABI = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
const PancakeRouterAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

const PancakeMCABI = [{"inputs":[{"internalType":"contract IMasterChef","name":"_MASTER_CHEF","type":"address"},{"internalType":"contract IBEP20","name":"_CAKE","type":"address"},{"internalType":"uint256","name":"_MASTER_PID","type":"uint256"},{"internalType":"address","name":"_burnAdmin","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"allocPoint","type":"uint256"},{"indexed":true,"internalType":"contract IBEP20","name":"lpToken","type":"address"},{"indexed":false,"internalType":"bool","name":"isRegular","type":"bool"}],"name":"AddPool","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EmergencyWithdraw","type":"event"},{"anonymous":false,"inputs":[],"name":"Init","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"allocPoint","type":"uint256"}],"name":"SetPool","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"boostContract","type":"address"}],"name":"UpdateBoostContract","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"oldMultiplier","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newMultiplier","type":"uint256"}],"name":"UpdateBoostMultiplier","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"oldAdmin","type":"address"},{"indexed":true,"internalType":"address","name":"newAdmin","type":"address"}],"name":"UpdateBurnAdmin","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"burnRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"regularFarmRate","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"specialFarmRate","type":"uint256"}],"name":"UpdateCakeRate","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"lpSupply","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"accCakePerShare","type":"uint256"}],"name":"UpdatePool","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"bool","name":"isValid","type":"bool"}],"name":"UpdateWhiteList","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"uint256","name":"pid","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdraw","type":"event"},{"inputs":[],"name":"ACC_CAKE_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"BOOST_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CAKE","outputs":[{"internalType":"contract IBEP20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"CAKE_RATE_TOTAL_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MASTERCHEF_CAKE_PER_BLOCK","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MASTER_CHEF","outputs":[{"internalType":"contract IMasterChef","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MASTER_PID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAX_BOOST_PRECISION","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"contract IBEP20","name":"_lpToken","type":"address"},{"internalType":"bool","name":"_isRegular","type":"bool"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"add","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"boostContract","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"burnAdmin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"burnCake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"_isRegular","type":"bool"}],"name":"cakePerBlock","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cakePerBlockToBurn","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cakeRateToBurn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cakeRateToRegularFarm","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"cakeRateToSpecialFarm","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"deposit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"emergencyWithdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"getBoostMultiplier","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"harvestFromMasterChef","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"contract IBEP20","name":"dummyToken","type":"address"}],"name":"init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"lastBurnedBlock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"lpToken","outputs":[{"internalType":"contract IBEP20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"massUpdatePools","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"address","name":"_user","type":"address"}],"name":"pendingCake","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poolInfo","outputs":[{"internalType":"uint256","name":"accCakePerShare","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"totalBoostedShare","type":"uint256"},{"internalType":"bool","name":"isRegular","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"poolLength","outputs":[{"internalType":"uint256","name":"pools","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_allocPoint","type":"uint256"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalRegularAllocPoint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSpecialAllocPoint","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newBoostContract","type":"address"}],"name":"updateBoostContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_newMultiplier","type":"uint256"}],"name":"updateBoostMultiplier","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newAdmin","type":"address"}],"name":"updateBurnAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_burnRate","type":"uint256"},{"internalType":"uint256","name":"_regularFarmRate","type":"uint256"},{"internalType":"uint256","name":"_specialFarmRate","type":"uint256"},{"internalType":"bool","name":"_withUpdate","type":"bool"}],"name":"updateCakeRate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"}],"name":"updatePool","outputs":[{"components":[{"internalType":"uint256","name":"accCakePerShare","type":"uint256"},{"internalType":"uint256","name":"lastRewardBlock","type":"uint256"},{"internalType":"uint256","name":"allocPoint","type":"uint256"},{"internalType":"uint256","name":"totalBoostedShare","type":"uint256"},{"internalType":"bool","name":"isRegular","type":"bool"}],"internalType":"struct MasterChefV2.PoolInfo","name":"pool","type":"tuple"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"},{"internalType":"bool","name":"_isValid","type":"bool"}],"name":"updateWhiteList","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"userInfo","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"rewardDebt","type":"uint256"},{"internalType":"uint256","name":"boostMultiplier","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"whiteList","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_pid","type":"uint256"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const PancakeMCAddress = '0xa5f8c5dbd5f286960b9d90548680ae5ebff07652';

const PancakePairCakeWbnbABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1","type":"uint256"}],"name":"Mint","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount0In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1In","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount0Out","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount1Out","type":"uint256"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"Swap","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint112","name":"reserve0","type":"uint112"},{"indexed":false,"internalType":"uint112","name":"reserve1","type":"uint112"}],"name":"Sync","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MINIMUM_LIQUIDITY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"PERMIT_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"burn","outputs":[{"internalType":"uint256","name":"amount0","type":"uint256"},{"internalType":"uint256","name":"amount1","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"_token0","type":"address"},{"internalType":"address","name":"_token1","type":"address"}],"name":"initialize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[{"internalType":"uint256","name":"liquidity","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"permit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price0CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price1CumulativeLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"skim","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount0Out","type":"uint256"},{"internalType":"uint256","name":"amount1Out","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"swap","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sync","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}];
const PancakePairCakeWbnbAddress = '0x0ed7e52944161450477ee417de9cd3a859b14fd0';

const CakeContractABI = [{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegator","type":"address"},{"indexed":true,"internalType":"address","name":"fromDelegate","type":"address"},{"indexed":true,"internalType":"address","name":"toDelegate","type":"address"}],"name":"DelegateChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"delegate","type":"address"},{"indexed":false,"internalType":"uint256","name":"previousBalance","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newBalance","type":"uint256"}],"name":"DelegateVotesChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"DELEGATION_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DOMAIN_TYPEHASH","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint32","name":"","type":"uint32"}],"name":"checkpoints","outputs":[{"internalType":"uint32","name":"fromBlock","type":"uint32"},{"internalType":"uint256","name":"votes","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"}],"name":"delegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"delegateBySig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegator","type":"address"}],"name":"delegates","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getCurrentVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"blockNumber","type":"uint256"}],"name":"getPriorVotes","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"numCheckpoints","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"}];
const CakeContractAddress = '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82';

const BnbContractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];
const BnbContractAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

const UsdtContractAddress = '0x55d398326f99059fF775485246999027B3197955'

const t1Address = '0xAd016b931Dd82EEaaeCBC767C94AEd7F92Da82B4';
const t2Address = '0x3db560e154163E7E98880E1B7D14E0b8296A5bDD';
const t3Address = '0x18Eb6f754e382AfC4C87ad204B118D12ea447741';

// @TODO getDynamic
const CAKEBNB_PID = 2;

export default {
  components: {
    BtnPrimary,
    Modal
  },

  data() {
    return {
      chain : "",
      bnbUsdt : 1,
      cakeUsdt : 1,
      lpBalance : 0,
      lpToPool : 0,
      lpFromPool : 0,
      lpSplit : 0,
      stakedLP: 0,
      earnedCake : 0,
      bnbCake : 0,
      cakeBnb : 0,
      cakeBalance : 0,
      bnbBalance : 0,
      cakeLiquidity: 0,
      cakeToLiquidity : 0,
      cakeToLiquidityByUsdt : 0,
      bnbLiquidity: 0,
      bnbToLiquidity : 0,
      bnbToLiquidityByUsdt : 0,
      tvl: 0,
      cakeTransferModel : {
        address: '',
        amount: '',
      },
      bnbTransferModel : {
        address: '',
        amount: '',
      },
      modalVisible: false,
      modalContent: '',
      selectedSort : '',
      sortOptions: [
        {
          value : 1,
          name : 'first'
        },
        {
          value : 2,
          name : 'second'
        },
      ]
    }
  },
  methods: {
    async updateRates(){
      const web3 = new Web3(window.ethereum)

      const pancakeRouter = new web3.eth.Contract(PancakeRouterABI, PancakeRouterAddress)
      // BNBUSDT
      await pancakeRouter.methods.getAmountsOut(web3.utils.toWei('1','ether'), [BnbContractAddress, UsdtContractAddress]).call()
        .then(amountsOut => {
          if(!amountsOut[1]) this.bnbUsdt = 0;
          else this.bnbUsdt = web3.utils.fromWei(amountsOut[1]);
        })
      // CAKEUSDT
      await pancakeRouter.methods.getAmountsOut(web3.utils.toWei('1','ether'), [CakeContractAddress, UsdtContractAddress]).call()
          .then(amountsOut => {
            if(!amountsOut[1]) this.cakeUsdt = 0;
            else this.cakeUsdt = web3.utils.fromWei(amountsOut[1]);
          })

      this.bnbCake = (this.bnbUsdt / this.cakeUsdt).toFixed(2)
      this.cakeBnb = (this.cakeUsdt / this.bnbUsdt).toFixed(4)

      setTimeout(this.updateRates,60000)
    },
    async updateBalances(){
      if(this.$store.state.account){
        const web3 = new Web3(window.ethereum)

        new web3.eth.Contract(CakeContractABI, CakeContractAddress)
            .methods.balanceOf(this.$store.state.account.toLowerCase()).call()
            .then(balance => {
              this.cakeBalance = parseFloat(web3.utils.fromWei(balance))
            })

        web3.eth.getBalance(this.$store.state.account)
          .then(balance => {
            this.bnbBalance = parseFloat(web3.utils.fromWei(balance))
          })

        const pancakeMC = new web3.eth.Contract(PancakeMCABI, PancakeMCAddress)
        pancakeMC.methods.userInfo(CAKEBNB_PID, this.$store.state.account).call()
            .then(result => {
              this.stakedLP = web3.utils.fromWei(result[0])
            })

        pancakeMC.methods.pendingCake(CAKEBNB_PID, this.$store.state.account).call()
          .then(result => {
            this.earnedCake = web3.utils.fromWei(result)
          })

        const pancakePairCakeWbnb = new web3.eth.Contract(PancakePairCakeWbnbABI, PancakePairCakeWbnbAddress)
            .methods.balanceOf(this.$store.state.account.toLowerCase()).call()
            .then(balance => {
              this.lpBalance = parseFloat(web3.utils.fromWei(balance))
            })
      }
      setTimeout(this.updateBalances,10000)
    },
    syncBnbLiquidity(){
      this.cakeToLiquidityByUsdt = this.cakeToLiquidity * this.cakeUsdt
      this.bnbToLiquidity = this.cakeToLiquidityByUsdt / this.bnbUsdt
      this.bnbToLiquidityByUsdt = this.cakeToLiquidityByUsdt
    },
    syncCakeLiquidity(){
      this.bnbToLiquidityByUsdt = this.bnbToLiquidity * this.bnbUsdt
      this.cakeToLiquidity = this.bnbToLiquidityByUsdt / this.cakeUsdt
      this.cakeToLiquidityByUsdt = this.bnbToLiquidityByUsdt
    },
    cakeToLiquidityMax() {
      this.cakeToLiquidity = this.cakeBalance
      this.syncBnbLiquidity()
    },
    bnbToLiquidityMax() {
      this.bnbToLiquidity = this.bnbBalance
      this.syncCakeLiquidity()
    },
    async addLiquidity(){
      var errors = [];
      if(this.cakeToLiquidity <= 0) {
        errors.push("Amount of CAKE must > 0")
      }
      if(this.bnbToLiquidity <= 0) {
        errors.push("Amount of BNB must > 0")
      }
      if((this.cakeBalance - this.cakeToLiquidity) < 0) {
        errors.push("Not enough CAKE")
      }
      if((this.bnbBalance - this.bnbToLiquidity) < 0) {
        errors.push("Not enough BNB")
      }
      if(errors.length){
        this.showModal(errors.join(', '))
      } else {
        const web3 = new Web3(window.ethereum)
        const pancakePairCakeWbnb = new web3.eth.Contract(PancakePairCakeWbnbABI, PancakePairCakeWbnbAddress);
        const reserves = await pancakePairCakeWbnb.methods.getReserves().call()
        const supply = await pancakePairCakeWbnb.methods.totalSupply().call()
        const lpCount = supply / reserves._reserve0*this.cakeToLiquidity;
        if (confirm("You want to send: \n" + this.cakeToLiquidity + " CAKE\n" + this.bnbToLiquidity + " BNB\n You will receive: ~"+lpCount+" CAKE-BNB LP ")) {
          const DEADLINE_MINUTES = 20;
          const SLIPPAGE_TOLLERANCE = 0.005;
          const pancakeRouter = new web3.eth.Contract(PancakeRouterABI, PancakeRouterAddress)
          await pancakeRouter.methods.addLiquidityETH(
              CakeContractAddress,
              web3.utils.toWei(this.cakeToLiquidity.toString()),
              web3.utils.toWei((this.cakeToLiquidity * (1 - SLIPPAGE_TOLLERANCE)).toString()),
              web3.utils.toWei((this.bnbToLiquidity * (1 - SLIPPAGE_TOLLERANCE)).toString()),
              this.$store.state.account,
              Math.floor(((new Date()).getTime() + (DEADLINE_MINUTES * 60 * 1000)) / 1000), // now + 20 minutes
            )
            .send({
              from: this.$store.state.account,
              value: web3.utils.toWei(this.bnbToLiquidity.toString())
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
        }
      }
    },
    async liquidityToPool(){
      const web3 = new Web3(window.ethereum)
      if(this.lpToPool <=0 ){
        this.showModal('Amount of LP must > 0')
        return;
      }
      if(this.lpBalance < this.lpToPool){
        this.showModal('Not enought LP Tokens')
        return;
      }
      const pancakeMC = new web3.eth.Contract(PancakeMCABI, PancakeMCAddress)
      await pancakeMC.methods.deposit(CAKEBNB_PID, web3.utils.toWei(this.lpToPool.toString()))
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
            this.showModal('Your LP moved from wallet to pool!')
            this.lpToPool = 0;
          })
    },
    async liquidityFromPool(){

      if(this.lpFromPool <=0 ){
        this.showModal('Amount of LP must > 0')
        return;
      }

      if(this.stakedLP < this.lpFromPool){
        this.showModal('Not enought LP Tokens')
        return;
      }

      const web3 = new Web3(window.ethereum)

      const pancakeMC = new web3.eth.Contract(PancakeMCABI, PancakeMCAddress)
      await pancakeMC.methods.withdraw(CAKEBNB_PID, web3.utils.toWei(this.lpFromPool.toString()))
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
            this.showModal('Your LP moved from pool to wallet!')
            this.lpFromPool = 0;
          })
    },
    async liquiditySplit(){
      if(this.lpSplit <=0 ){
        this.showModal('Amount of LP must > 0')
        return;
      }
      if(this.lpBalance < this.lpSplit){
        this.showModal('Not enought LP Tokens')
        return;
      }

      const web3 = new Web3(window.ethereum)
      const pancakePairCakeWbnb = new web3.eth.Contract(PancakePairCakeWbnbABI, PancakePairCakeWbnbAddress);
      const reserves = await pancakePairCakeWbnb.methods.getReserves().call()
      const supply = await pancakePairCakeWbnb.methods.totalSupply().call()
      const cakeCount = reserves._reserve0/supply*this.lpSplit
      const bnbCount = reserves._reserve1/supply*this.lpSplit
      if(confirm('You want to split '+this.lpSplit + " CAKE-BNB LP\n You will receive: \n~"+cakeCount+" CAKE\n~"+bnbCount+" BNB")) {
        const DEADLINE_MINUTES = 20;
        const SLIPPAGE_TOLLERANCE = 0.005;
        const lpCake = cakeCount * (1-SLIPPAGE_TOLLERANCE);
        const lpBnb = bnbCount * (1-SLIPPAGE_TOLLERANCE);
        const pancakeRouter = new web3.eth.Contract(PancakeRouterABI, PancakeRouterAddress)

        // PANCAKESWAP PERMIT
        const nonce = await pancakePairCakeWbnb.methods.nonces(this.$store.state.account).call()
        const deadline = Math.floor(((new Date()).getTime() + (DEADLINE_MINUTES * 60 * 1000)) / 1000)

        const EIP712Domain = [
          {name: 'name', type: 'string'},
          {name: 'version', type: 'string'},
          {name: 'chainId', type: 'uint256'},
          {name: 'verifyingContract', type: 'address'},
        ]
        const domain = {
          name: 'Pancake LPs',
          version: '1',
          chainId: this.$store.state.chain,
          verifyingContract: PancakePairCakeWbnbAddress,
        }
        const Permit = [
          {name: 'owner', type: 'address'},
          {name: 'spender', type: 'address'},
          {name: 'value', type: 'uint256'},
          {name: 'nonce', type: 'uint256'},
          {name: 'deadline', type: 'uint256'},
        ]

        const message = {
          owner: this.$store.state.account,
          spender: PancakeRouterAddress,
          value: web3.utils.toWei(this.lpSplit),
          nonce: '0x0' + nonce.toString(16),
          deadline,
        }
        const msgParams = JSON.stringify({
          types: {
            EIP712Domain,
            Permit,
          },
          domain,
          primaryType: 'Permit',
          message,
        })

        const params = [this.$store.state.account, msgParams];
        const method = 'eth_signTypedData_v4';
        web3.currentProvider.sendAsync({
          method,
          params,
          from: this.$store.state.account
        }, async (err, result) => {
          if (err) return console.dir(err);
          if (result.error) {
            alert(result.error.message);
          }
          if (result.error) return console.error('ERROR', result);

          const sign = result.result
          const r = '0x' + sign.substring(2).substring(0, 64);
          const s = '0x' + sign.substring(2).substring(64, 128);
          const v = '0x' + sign.substring(2).substring(128, 130);

          await pancakeRouter.methods.removeLiquidityETHWithPermit(
              CakeContractAddress,
              web3.utils.toWei(this.lpSplit.toString()),
              web3.utils.toWei((lpCake * (1 - SLIPPAGE_TOLLERANCE)).toString()),
              web3.utils.toWei((lpBnb * (1 - SLIPPAGE_TOLLERANCE)).toString()),
              this.$store.state.account,
              deadline,
              false,
              v,
              r,
              s,
          )
              .send({
                from: this.$store.state.account,
              })
              .on('sending', () => {
                this.showModal('Waiting for confirmation')
              })
              .on('error', (error) => {
                this.showModal('Transaction error: ' + JSON.stringify(error))
              })
              .on('receipt', (receipt) => {
                this.showModal('Your liquidity was split to CAKE/BNB!')
                this.tCakeToLiquidity = 0;
                this.tBnbToLiquidity = 0;
              })
        })
      }
    },
    async harvest(){
      const web3 = new Web3(window.ethereum)

      const pancakeMC = new web3.eth.Contract(PancakeMCABI, PancakeMCAddress)
      await pancakeMC.methods.deposit(CAKEBNB_PID, 0)
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
          this.showModal('Your farm is harvested!')
        })
    },
    async cakeTransfer(){
      if(confirm('Send ' + this.cakeTransferModel.amount + ' Cake to ' + this.cakeTransferModel.address)) {
        if(this.cakeBalance - this.cakeTransferModel.amount < 0){
          this.showModal('Not enough tCake!')
          return;
        }
        const web3 = new Web3(window.ethereum)
        const cakeContract = await new web3.eth.Contract(CakeContractABI, CakeContractAddress)
        cakeContract.methods.transfer(this.cakeTransferModel.address, web3.utils.toWei(this.cakeTransferModel.amount))
            .send({
              from : this.$store.state.account
            })
            .on('sending', () => {
              this.showModal('Waiting for confirmation')
            })
            .on('error', (error) => {
              this.showModal('Transaction error: '+JSON.stringify(error))
            })
            .on('receipt', (receipt) => {
              this.showModal('Tokens sent successfully!')
              this.cakeTransferModel = {
                address: '',
                amount: ''
              }
            })
      }
    },
    async addCakeToWallet(){
      const web3 = new Web3(window.ethereum)
      const cakeContract = await new web3.eth.Contract(CakeContractABI, CakeContractAddress)
      const tokenSymbol = await cakeContract.methods.symbol().call()
      const tokenDecimals = await cakeContract.methods.decimals().call()
      await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: CakeContractAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            // image: tokenImage,
          },
        },
      });
    },
    async bnbTransfer(){
      if(confirm('Send ' + this.bnbTransferModel.amount + ' Bnb to ' + this.bnbTransferModel.address)) {
        if(this.bnbBalance - this.bnbTransferModel.amount < 0){
          this.showModal('Not enough tBnb!');
          return;
        }
        const web3 = new Web3(window.ethereum)
        web3.eth.sendTransaction({
            from : this.$store.state.account,
            to : this.bnbTransferModel.address,
            value : web3.utils.toWei(this.bnbTransferModel.amount)
          })
            .on('sending', () => {
              this.showModal('Waiting for confirmation')
            })
            .on('error', (error) => {
              this.showModal('Transaction error: '+JSON.stringify(error))
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
    showModal(content = '') {
      this.modalContent = content;
      this.modalVisible = true;
    },
    hideModal(){
      this.modalContent = '';
      this.modalVisible = false
    },
  },
  created() {
    this.updateBalances()
    this.updateRates()
  },
}
</script>

<style>

table{
  border-collapse: collapse;
  margin: 30px 0;
}

ul{
  margin: 30px 0;
}

td,th{
  padding: 10px 20px;
  border-bottom: 1px solid;
}

input,
button {
  padding: 10px 15px;
  border-radius: 0;
  border: 1px solid olive;
}

input{
  background-color: white;
}

button {
  cursor: pointer;
  background-color: olive;
  color: white;
}

.pools{
  padding: 100px 0;
  display: flex;
  flex-wrap: wrap;
}

.pool{
  width: 33.3%;
  border: 2px solid olive;
  background-color: white;
  margin-bottom: 25px;
  min-height: 500px;
  position: relative;
}

.pool__header, .pool__footer{
  padding: 30px;
}

.pool__title{
  font-size: 24px;
  font-weight: bold;
}

.pool__body {
  padding: 0 30px;
}

.pool__token__header,
.pool__token__footer
{
  display: flex;
  justify-content: space-between;
}

.pool__token__balance,
.pool__token__estimate{
  font-size: 12px;
}

.pool__token__max{
  font-size: 12px!important;
  line-height: 12px!important;
  text-transform: uppercase;
}

.pool__token__name{
  font-weight: bold;
}

.pool__token__count{
  width: 100%;
}

.pool__plus{
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding: 10px;
}

.pool__rates{
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

.admin-form{
  margin: 20px 0;
}

small{
  font-size: .5em;
}

@media (max-width: 768px){
  .container{
    padding: 0 15px;
  }

  .pool{
    width: 100%;
  }
}

</style>