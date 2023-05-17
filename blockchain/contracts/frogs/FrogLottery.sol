// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../pancekeswap-fork/utils/interfaces/IMasterChef.sol";
import "../pancekeswap-fork/utils/interfaces/IPancakePair.sol";
import "../pancekeswap-fork/utils/interfaces/IRouter.sol";
import "./IFrogReferal.sol";
import "./Random.sol";
import 'hardhat/console.sol';

import "../v3-interfaces/IUniswapV3Pool.sol";
import "../v3-interfaces/INonfungiblePositionManager.sol";
import "../v3-interfaces/LiquidityAmounts.sol";
import "../v3-interfaces/TickMath.sol";
// import "../v3-interfaces/OracleLibraryCut.sol";
import "../v3-interfaces/IUniswapV3Factory.sol";


import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';

/**
  * @title FrogLottery
   * @dev FrogLottery
   */
contract FrogLottery is Random, Ownable{
    uint public drawNumber = 0;
    uint public lpDecimals = 10000;

    address public token0;
    address public token1;
    address stableCoinAddress;
    address pancakeRouterAddress;
    address pancakeMCAddress;
    address pancakePairAddress;
    address frogReferalAddress;
    uint pancakePID;

    // 526877316
    // 0.000525569

    address public beneficiary;

    mapping (address => uint) public depositOf;
    mapping (address => uint) public balanceOf;
    mapping (address => uint) public withdrawOf;
    mapping (address => uint) public rewardOfToken0;
    mapping (address => uint) public rewardOfToken1;

    address[] public participants;
    mapping (address => bool) public alreadyParticipant;

    uint public minUsd;
    uint public maxUsd;
    uint feePercent;
    uint maxFeePercent;
    bool isEthLottery;

    event BeneficiaryChanged(address indexed _oldBeneficiary, address indexed _newBeneficiary);
    event FeePercentChanged(uint indexed _oldFeePercent, uint indexed _newFeePercent);
    event Draw(uint indexed _drawNumber, uint _rewardToken0, uint _rewardToken1, uint _rewardRefralToken0, uint _rewardRefralToken1);
    event Victory(uint indexed _drawNumber, address indexed _winner, uint256 _amountToken0, uint256 _amountToken1);
    event Deposit(address indexed _participant, uint _amount, uint _oldBalance);
    event Withdraw(address indexed _participant, uint _amount, uint _oldBalance);
    event NewParticipant(address indexed _newParticipant);

    modifier isBeneficiaryOrOwner() {
        require(msg.sender == owner() || msg.sender == beneficiary, "Caller is not beneficiary or owner");
        _;
    }

    // v3 
    address public nonfungiblePositionManager;
    address public pool;
    address public swapRouter;
    uint public tokenId;
    uint24 public poolFee;
    address public pancakeFactory;
    uint rewardFromPrevDrawToken0;
    uint rewardFromPrevDrawToken1;

    constructor(address _token0, address _token1, uint24 _poolFee, address _frogReferalAddress, bool _isEthLottery, address _beneficiary, uint _pancakePID, address _pool, address _nonfungiblePositionManager, address _swapRouter, address _pancakeFactory, address stable) {
        beneficiary     = _beneficiary;
        maxFeePercent   = 3000; // 30%
        feePercent      = maxFeePercent;
        minUsd         = 0.1 ether; // @TODO change to 50-500
        maxUsd         = 100 ether; // @TODO change to 50-500
        pancakePID      = _pancakePID;
        isEthLottery    = _isEthLottery;
        setToken0ContractAddress(_token0); // setToken0ContractAddress(0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82);
        setToken1ContractAddress(_token1); // setToken1ContractAddress(0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c);       
        // setUsdContractAddress(0x55d398326f99059fF775485246999027B3197955);
        // setPancakeRouterAddress(0x10ED43C718714eb63d5aA57B78B54704E256024E);
        // setPancakeMCAddress(0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652);
        // setPancakePairAddress(0x0eD7e52944161450477ee417DE9Cd3a859b14fD0);
        setFrogReferalAddress(_frogReferalAddress);
        nonfungiblePositionManager = _nonfungiblePositionManager;
        pool = _pool;
        swapRouter = _swapRouter;
        poolFee = _poolFee;
        pancakeFactory = _pancakeFactory;
        stableCoinAddress = stable;
        // createPosition(_token0,_token1,tickLower,tickUpper);
    }

    function createPosition( int24 tickLower, int24 tickUpper) public isBeneficiaryOrOwner {
        INonfungiblePositionManager.MintParams memory params =
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: poolFee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                amount0Desired: 1,
                amount1Desired: 1,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });
        IERC20(token0).approve(nonfungiblePositionManager, type(uint).max);
        IERC20(token1).approve(nonfungiblePositionManager, type(uint).max);
        (tokenId,,,) = INonfungiblePositionManager(nonfungiblePositionManager).mint(params);
        console.log('tokenId!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',tokenId);
    }

    function isParticipant(address _participant) public view returns (bool) {
        return alreadyParticipant[_participant];
    }

    // @TODO address[] or uint[] ???
    function getParticipants() public view returns(address[] memory result, uint counter) {
        // @TODO too large array with zero addresses by removeLiquidity?
        result = new address[](participants.length);
        counter = 0;
        for (uint i = 0; i < participants.length; i++){
            if(balanceOf[participants[i]] > 0){
                result[counter] = participants[i];
                counter++;
            }
        }
        return (result, counter);
    }

    // @TODO add Event(?)
function setToken0ContractAddress(address _cakeContractAddress) public isBeneficiaryOrOwner {
        token0 = _cakeContractAddress;
    }

    // @TODO add Event(?)
    function setToken1ContractAddress(address _address) public isBeneficiaryOrOwner {
        token1 = _address;
    }

    // @TODO add Event(?)
    function setUsdContractAddress(address _address) public isBeneficiaryOrOwner {
        stableCoinAddress = _address;
    }

    // @TODO add Event(?)
    function setPancakeRouterAddress(address _address) public isBeneficiaryOrOwner{
        pancakeRouterAddress = _address;
    }
    // @TODO add Event(?)
    function setPancakeMCAddress(address _address) public isBeneficiaryOrOwner{
        pancakeMCAddress = _address;
    }
    // @TODO add Event(?)
    function setPancakePairAddress(address _address) public isBeneficiaryOrOwner{
        pancakePairAddress = _address;
    }

    // @TODO add Event(?)
    function setFrogReferalAddress(address _address) public isBeneficiaryOrOwner{
        frogReferalAddress = _address;
    }

    function setBeneficiary(address _newBeneficiary) public isBeneficiaryOrOwner{
        emit BeneficiaryChanged(beneficiary, _newBeneficiary);
        beneficiary = _newBeneficiary;
    }

    function setFeePercent(uint _newFeePercent) public isBeneficiaryOrOwner{
        require(_newFeePercent <= maxFeePercent, "feePercent can not be great than maxFeePercent");
        emit FeePercentChanged(feePercent, _newFeePercent);
        feePercent = _newFeePercent;
    }

    function setMinUsd(uint _minUsd) public isBeneficiaryOrOwner{
        minUsd = _minUsd;
    }

    function setMaxUsd(uint _maxUsd) public isBeneficiaryOrOwner{
        maxUsd = _maxUsd;
}

    function setAll(address _token0, address _token1, address usd, address router,address masterChef,address pair) public isBeneficiaryOrOwner {
        token0 = _token0;
        token1 = _token1;
        pancakeRouterAddress = router;
        pancakeMCAddress = masterChef;
        pancakePairAddress = pair;
        stableCoinAddress = usd;
    }

    function registerBeforeDeposit(bytes calldata message, uint8 v, bytes32 r, bytes32 s, address token, uint amount) public payable returns (bool success){
        require(IFrogReferal(frogReferalAddress).registerReferal(message,v,r,s),'invalid sig');
        (address newUser) = abi.decode(message,(address));
        require(newUser == msg.sender, "sender and signed user mismatch");
        return deposit(token,amount);
    }

    function deposit(address token, uint amount) public payable returns (bool success){
        // if(isEthLottery)
        //     require(amountToken1 == msg.value, "msg.value and amount mismatch");
        // else {
        //     require(IERC20(token1).balanceOf(msg.sender) >= amountToken1, 'Not enought Token1');
        //     require(IERC20(token1).allowance(msg.sender, address(this)) >= amountToken1,'Not enought allowance Token1');
        // }
        // require(IERC20(token0).balanceOf(msg.sender) >= amountToken0, 'Not enought Token0');
        // require(IERC20(token0).allowance(msg.sender, address(this)) >= amountToken0,'Not enought allowance Token0');
        return _deposit(token,amount);
    }

    function swapExactInputSingle(address tokenIn, address tokenOut, uint256 amountIn) internal returns (uint256 amountOut) {
        // msg.sender must approve this contract

        // Transfer the specified amount of DAI to this contract.
        TransferHelper.safeTransferFrom(tokenIn, msg.sender, address(this), amountIn);

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(tokenIn, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // The call to `exactInputSingle` executes the swap.
        amountOut = ISwapRouter(swapRouter).exactInputSingle(params);
    }

    function _deposit(address token, uint amount) private returns (bool success){
        require(IFrogReferal(frogReferalAddress).alreadyParticipant(msg.sender), "Not a Participant");

        // Checking  minUSD <= (balance + deposit - withdraw + new deposit) <= maxUSD
        // (uint lpToken0, uint lpToken1) = rateLPTokens();
        uint amountToken0;
        uint amountToken1;
        if(token == token0){
            amountToken0 = amount / 2;
            amountToken1 = swapExactInputSingle(token0, token1, amountToken0);
        }
        else if(token == token1){
            amountToken1 = amount / 2;
            amountToken0 = swapExactInputSingle(token1, token0, amountToken1);
        }
        else {
            console.log('1');
            amountToken0 = swapExactInputSingle(token, token0, amount / 2);
            console.log('2');
            amountToken1 = swapExactInputSingle(token, token1, amount / 2);
            console.log('3');
        }

        console.log("rrrrrr", amountToken0, amountToken1);

        // uint futureBalanceUsd = estimateAmountOut(token0, uint128(balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender]));
        // uint depositUsd = estimateAmountOut(token0, uint128(amountToken0)) + estimateAmountOut(token0, uint128(amountToken1));

        // console.log(futureBalanceUsd,depositUsd,minUsd,maxUsd);
        // require(futureBalanceUsd + depositUsd >= minUsd, 'Total balance less than minUSD');
        // require(futureBalanceUsd + depositUsd <= maxUsd, 'Total balance great than maxUSD');

        uint liquidity;
        uint amount0;
        uint amount1;

        if(isEthLottery){
            // (, , amountLP) = IPancakeRouter02(pancakeRouterAddress).addLiquidityETH{value:amountToken1}(
            // token0,
            // amountToken0,
            // amountToken0 / 10000 * 9900,
            // amountToken1 / 10000 * 9900,
            // address(this),
            // block.timestamp + 20 minutes
        // );
        }else{
            INonfungiblePositionManager.IncreaseLiquidityParams memory params =
            INonfungiblePositionManager.IncreaseLiquidityParams({
                tokenId: tokenId,
                amount0Desired: amountToken0,
                amount1Desired: amountToken1,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp
            });
            console.log('increase');
            (liquidity, amount0, amount1) = INonfungiblePositionManager(nonfungiblePositionManager).increaseLiquidity(params);
            console.log(liquidity, amount0, amount1);

        }
        depositOf[msg.sender] += liquidity;

        if(!isParticipant(msg.sender)){
            alreadyParticipant[msg.sender] = true;
            participants.push(msg.sender);
            emit NewParticipant(msg.sender);
        }

        return true;
    }

    function withdraw(uint _amount) public returns (bool success){
        require(balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender] >= _amount, 'Not enought liquidity');

        // Checking  minUSD <= (balance + deposit - withdraw - new withdraw) <= maxUSD
        // (uint lpToken0, uint lpToken1) = rateLPTokens();
        // uint futureBalanceUsd = (balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender] - _amount) * (getPSRate(lpToken0, token0, stableCoinAddress) + getPSRate(lpToken1, token1, stableCoinAddress)) / lpDecimals;
        // require((futureBalanceUsd == 0) || (futureBalanceUsd >= minUsd), 'Total balance less than minUSD');
        // require(futureBalanceUsd <= maxUsd, 'Total balance great than maxUSD');
        withdrawOf[msg.sender] += _amount;
        return true;
    }

    function claimReward() virtual   public {
        require(rewardOfToken0[msg.sender] > 0 || rewardOfToken1[msg.sender] > 0, 'Reward is empty');

        if(rewardOfToken0[msg.sender] > 0){
            require(IERC20(token0).transfer(msg.sender, rewardOfToken0[msg.sender]),"Transfer faild0");
            rewardFromPrevDrawToken0 -= rewardOfToken0[msg.sender];
            rewardOfToken0[msg.sender] = 0;
        }

        if(rewardOfToken1[msg.sender] > 0){
            require(IERC20(token1).transfer(msg.sender, rewardOfToken1[msg.sender]),"Transfer faild1");
            rewardFromPrevDrawToken1 -= rewardOfToken1[msg.sender];
            rewardOfToken1[msg.sender] = 0;
        }
    }

    function getQuoteAtTick(
        int24 tick,
        uint128 baseAmount,
        address baseToken,
        address quoteToken
    ) internal pure returns (uint256 quoteAmount) {
        uint160 sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);

        // Calculate quoteAmount with better precision if it doesn't overflow when multiplied by itself
        if (sqrtRatioX96 <= type(uint128).max) {
            uint256 ratioX192 = uint256(sqrtRatioX96) * sqrtRatioX96;
            quoteAmount = FullMath.mulDiv(ratioX192, baseAmount, 1 << 192);
            // quoteAmount = baseToken < quoteToken
            //     ? FullMath.mulDiv(ratioX192, baseAmount, 1 << 192)
            //     : FullMath.mulDiv(1 << 192, baseAmount, ratioX192);
        } else {
            uint256 ratioX128 = FullMath.mulDiv(sqrtRatioX96, sqrtRatioX96, 1 << 64);
            quoteAmount = baseToken < quoteToken
                ? FullMath.mulDiv(ratioX128, baseAmount, 1 << 128)
                : FullMath.mulDiv(1 << 128, baseAmount, ratioX128);
        }
    }

    function estimateAmountOut(address tokenIn, uint128 amount) public view returns (uint amountOut) {
        console.log('estimateAmountOut', amount, tokenIn);
        address _pool = IUniswapV3Factory(pancakeFactory).getPool(tokenIn,stableCoinAddress,500);
        console.log(_pool);
        (, int24 tick,,,,,) = IUniswapV3Pool(_pool).slot0();
        console.log('tick');
        amountOut = getQuoteAtTick(tick,amount,tokenIn, stableCoinAddress);
        console.log('amountOut', amountOut);

    }
    
    uint power = 10000000000;
    // @TODO use SafeMath
    function accounting() internal{
        // @TODO optimize: IMasterChef(pancakeMCAddress).withdraw - call one time ?!

        for (uint i=0; i < participants.length; i++){
            address user = participants[i];
            if(depositOf[user] > 0){
                balanceOf[user] += depositOf[user];
                depositOf[user] = 0;
            }

            if(withdrawOf[user] > 0 && withdrawOf[user] <= balanceOf[user]){
                    balanceOf[user] -= withdrawOf[user];
                    // IMasterChef(pancakeMCAddress).withdraw(pancakePID, withdrawOf[user]);

                    // IPancakePair(pancakePairAddress).approve(pancakeRouterAddress, withdrawOf[user]);
                    // (uint lpToken0, uint lpToken1) = rateLPTokens();
                    if(isEthLottery){
                        // (uint amount0, uint amount1) = IPancakeRouter02(pancakeRouterAddress).removeLiquidityETH(
                        //     token0,
                        //     withdrawOf[user],
                        //     lpToken0 * withdrawOf[user] / 10000 * 9900 / lpDecimals,
                        //     lpToken1 * withdrawOf[user] / 10000 * 9900 / lpDecimals,
                        //     address(this),
                        //     block.timestamp + 20 minutes
                        // );
                        // IERC20(token0).transfer(user,amount0);
                        // payable(user).transfer(amount1 / power);
                    }
                    else {
                        INonfungiblePositionManager.DecreaseLiquidityParams memory params =
                        INonfungiblePositionManager.DecreaseLiquidityParams({
                            tokenId: tokenId,
                            liquidity: uint128(withdrawOf[user]),
                            amount0Min: 0,
                            amount1Min: 0,
                            deadline: block.timestamp
                        });

                        (uint amount0,uint amount1) = INonfungiblePositionManager(nonfungiblePositionManager).decreaseLiquidity(params);

                        IERC20(token0).transfer(user,amount0);
                        IERC20(token1).transfer(user,amount1);
                    }
                    

                    withdrawOf[user] = 0;
                }
        }
    }

    function draw() virtual public isBeneficiaryOrOwner{
        // IMasterChef(pancakeMCAddress).deposit(pancakePID, 0);
        INonfungiblePositionManager.CollectParams memory params =
        INonfungiblePositionManager.CollectParams({
            tokenId: tokenId,
            recipient: address(this),
            amount0Max: type(uint128).max,
            amount1Max: type(uint128).max
        });
        console.log('collect');

        (uint amount0, uint amount1) = INonfungiblePositionManager(nonfungiblePositionManager).collect(params);
        // (,,,,,int24 tickLower, int24 tickUpper, ,,,,) = INonfungiblePositionManager(nonfungiblePositionManager).positions(tokenId);
        console.log(amount0,amount1);

        // uint rewardInLiquidity = calculateLiqFromAmounts(amount0,amount1,tickLower,tickUpper);

        address[] memory activeParticipants = new address[](participants.length);
        uint participantsCount;
        uint[] memory winnerItems;
        uint winnersLiquidity;
        (activeParticipants, participantsCount) = getParticipants();
        if(participantsCount > 0){
            uint rewardWithFeeToken0 = amount0 * (10000 - feePercent) / 10000;
            uint rewardWithFeeToken1 = amount1 * (10000 - feePercent) / 10000;

            uint winnersCount = participantsCount / 150 + 1;
            winnerItems = new uint[](winnersCount);
            winnerItems = getRandomsWithRepeat(participantsCount, winnersCount);

            for(uint i = 0; i < winnersCount; i++){
                uint index = winnerItems[i];
                winnersLiquidity += balanceOf[activeParticipants[index]];
            }

            drawNumber++;
            {
            uint prticipantsRewardToken0;
            uint prticipantsRewardToken1;
            for(uint i = 0; i < winnersCount; i++){
                address winner = activeParticipants[winnerItems[i]];
                uint participantRewardPart = balanceOf[winner] * 100 / winnersLiquidity;

                uint participantRewardToken0 = rewardWithFeeToken0 * participantRewardPart / 100;
                uint participantRewardToken1 = rewardWithFeeToken1 * participantRewardPart / 100;

                rewardFromPrevDrawToken0 += participantRewardToken0;
                rewardFromPrevDrawToken1 += participantRewardToken1;

                rewardOfToken0[winner] += participantRewardToken0;
                rewardOfToken1[winner] += participantRewardToken1;

                prticipantsRewardToken0 += participantRewardToken0;
                prticipantsRewardToken1 += participantRewardToken1;

                emit Victory(drawNumber, winner, participantRewardToken0, participantRewardToken1);
                // вычисляет награду для кошелька для которого winner являеться рефералом
            }
            emit Draw(drawNumber, amount0, amount1, prticipantsRewardToken0, prticipantsRewardToken1);
            }

            accounting();
        } else {
            accounting();
        }
    }

    function calculateLiqFromAmounts(uint amount0, uint amount1, int24 tickLower, int24 tickUpper) public view returns(uint liquidity) {
        (uint160 sqrtPriceX96, , , , , , ) = IUniswapV3Pool(pool).slot0();
        uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

        liquidity = LiquidityAmounts.getLiquidityForAmounts(
            sqrtPriceX96,
            sqrtRatioAX96,
            sqrtRatioBX96,
            amount0,
            amount1
        );
    }

    function afterDraw(IFrogReferal.ReferersRewardInfo[] memory data, uint referersReward0, uint referersReward1) public isBeneficiaryOrOwner{
        uint balance0 = IERC20(token0).balanceOf(address(this)) - rewardFromPrevDrawToken0;
        uint balance1 = IERC20(token1).balanceOf(address(this)) - rewardFromPrevDrawToken1;
        IFrogReferal(frogReferalAddress).accrueRewardFromWinningReferral(data, token0, token1);
        IERC20(token0).transfer(frogReferalAddress, referersReward0);
        IERC20(token1).transfer(frogReferalAddress, referersReward1);
        IERC20(token0).transfer(beneficiary, balance0 - referersReward0);
        IERC20(token1).transfer(beneficiary, balance1 - referersReward1);
    }

    function farmTotal() public view returns(uint){
        return IMasterChef(pancakeMCAddress).pendingCake(pancakePID, address(this));
    }

    receive() external payable {}
}