<template>
  <div class="pool pool_not-available">
    <div class="pool__header">
      <div class="pool__title">CAKE-BNB</div>
    </div>
    <template v-if="account">
      <div class="pool__body">
        <div class="pool__token">
          <div class="pool__token__header">
            <label class="pool__token__name">CAKE</label>
            <div class="pool__token__balance">balance: <span id="labelCAKEBalance">0.00</span></div>
          </div>
          <input type="text" class="pool__token__count" placeholder="0.0" id="inpCAKECount">
          <div class="pool__token__footer">
            <div class="pool__token__estimate">~<span id="labelCAKEInUSD">0.00</span> USD</div>
            <button class="pool__token__max btn btn-simple" id="btnCAKEMax">max</button>
          </div>
        </div>
        <div class="pool__plus">+</div>
        <div class="pool__token">
          <div class="pool__token__header">
            <label class="pool__token__name">BNB</label>
            <div class="pool__token__balance">balance: <span id="labelBNBBalance">0.00</span></div>
          </div>
          <input type="text" class="pool__token__count" placeholder="0.0" id="inpBNBCount">
          <div class="pool__token__footer">
            <div class="pool__token__estimate">~<span id="labelBNBInUSD">0.00</span> USD</div>
            <button class="pool__token__max btn btn-simple" id="btnBNBMax">max</button>
          </div>
        </div>
        <div class="pool__rates">
          <div class="row">
            <div class="col-6">
              <div class="pool-rates__value" id="labelCAKEBNBRate">0.0</div>
              <div class="pool-rates__label">CAKE per BNB</div>
            </div>
            <div class="col-6">
              <div class="pool-rates__value" id="labelBNBCAKERate">0.0</div>
              <div class="pool-rates__label">BNB per CAKE</div>
            </div>
          </div>
        </div>
      </div>
      <div class="pool__footer">
        <button>Next</button>
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
</template>

<script>
export default {
  props: {
    account: {
      type: String
    }
  }
}
</script>

<style scoped>
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
}

.pool__footer {
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  bottom: 0;
  left: 0;
}
</style>