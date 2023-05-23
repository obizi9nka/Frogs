// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IFrogReferal.sol";
import "./Random.sol";
import 'hardhat/console.sol';

import "../v3-interfaces/IUniswapV3Pool.sol";
import "../v3-interfaces/INonfungiblePositionManager.sol";
import "../v3-interfaces/LiquidityAmounts.sol";
import "../v3-interfaces/TickMath.sol";
import "../v3-interfaces/IUniswapV3Factory.sol";
import "../v3-interfaces/SafeCast.sol";

import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
// import "../v3-interfaces/SqrtPriceMath.sol";

library UnsafeMath {
    /// @notice Returns ceil(x / y)
    /// @dev division by 0 has unspecified behavior, and must be checked externally
    /// @param x The dividend
    /// @param y The divisor
    /// @return z The quotient, ceil(x / y)
    function divRoundingUp(uint256 x, uint256 y) internal pure returns (uint256 z) {
        assembly {
            z := add(div(x, y), gt(mod(x, y), 0))
        }
    }
}

library LiquidityMath {
    /// @notice Add a signed liquidity delta to liquidity and revert if it overflows or underflows
    /// @param x The liquidity before change
    /// @param y The delta by which liquidity should be changed
    /// @return z The liquidity delta
    function addDelta(uint128 x, int128 y) internal pure returns (uint128 z) {
        if (y < 0) {
            require((z = x - uint128(-y)) < x, 'LS');
        } else {
            require((z = x + uint128(y)) >= x, 'LA');
        }
    }
}

/**
  * @title FrogLottery
   * @dev FrogLottery
   */

interface Deimals {
    function decimals() external view returns (uint8);
}


contract FrogLottery is Random, Ownable{

    using SafeCast for uint256;
    using SafeCast for int256;

    uint public drawNumber = 0;

    address public token0;
    address public token1;
    address stableCoinAddress;
    address frogReferalAddress;

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
    event Draw(uint indexed _drawNumber, uint _rewardToken0, uint _rewardToken1, uint _prticipantsRewardToken0, uint _prticipantsRewardToken1);
    event Victory(uint indexed _drawNumber, address indexed _winner, uint256 _amountToken0, uint256 _amountToken1);
    event Deposit(address indexed _participant, uint _amount, uint _oldBalance);
    event Withdraw(address indexed _participant, uint _amount, uint _oldBalance);
    event NewParticipant(address indexed _newParticipant);

    modifier isBeneficiaryOrOwner() {
        require(msg.sender == owner() || msg.sender == beneficiary, "Caller is not beneficiary or owner");
        _;
    }

    address public nonfungiblePositionManager;
    address public pool;
    address public swapRouter;
    uint public tokenId;
    uint24 public poolFee;
    address public pancakeFactory;
    uint rewardFromPrevDrawToken0;
    uint rewardFromPrevDrawToken1;
    uint decimalsContoller = 10**18;

    constructor(address _token0, address _token1, uint24 _poolFee, address _frogReferalAddress, bool _isEthLottery, address _beneficiary, address _pool, address _nonfungiblePositionManager, address _swapRouter, address _pancakeFactory, address stable) {
        beneficiary     = _beneficiary;
        maxFeePercent   = 3000; // 30%
        feePercent      = maxFeePercent;
        minUsd         = 5 * decimalsContoller; // @TODO change to 50-500
        maxUsd         = 50 * decimalsContoller; // @TODO change to 50-500
        isEthLottery    = _isEthLottery;
        setToken0ContractAddress(_token0); 
        setToken1ContractAddress(_token1);       
        setFrogReferalAddress(_frogReferalAddress);
        nonfungiblePositionManager = _nonfungiblePositionManager;
        pool = _pool;
        swapRouter = _swapRouter;
        poolFee = _poolFee;
        pancakeFactory = _pancakeFactory;
        setStableCoinAddress(stable);
        // createPosition(_token0,_token1,tickLower,tickUpper);
    }

    function createPosition(int24 _tickLower, int24 _tickUpper) public isBeneficiaryOrOwner {
        require(tokenId == 0,'nono');
        TransferHelper.safeTransferFrom(token0, msg.sender, address(this), 1);
        TransferHelper.safeTransferFrom(token1, msg.sender, address(this), 1);
        IERC20(token0).approve(nonfungiblePositionManager, type(uint).max);
        IERC20(token1).approve(nonfungiblePositionManager, type(uint).max);
        
        INonfungiblePositionManager.MintParams memory params =
            INonfungiblePositionManager.MintParams({
                token0: token0,
                token1: token1,
                fee: poolFee,
                tickLower: _tickLower,
                tickUpper: _tickUpper,
                amount0Desired: 1,
                amount1Desired: 1,
                amount0Min: 0,
                amount1Min: 0,
                recipient: address(this),
                deadline: block.timestamp
            });
        
        (tokenId,,,) = INonfungiblePositionManager(nonfungiblePositionManager).mint(params);
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
    function setStableCoinAddress(address _address) public isBeneficiaryOrOwner {
        stableCoinAddress = _address;
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

    function registerBeforeDeposit(bytes calldata message, uint8 v, bytes32 r, bytes32 s, address token, uint amount) public payable returns (bool success){
        require(IFrogReferal(frogReferalAddress).registerReferal(message,v,r,s),'invalid sig');
        (address newUser) = abi.decode(message,(address));
        require(newUser == msg.sender, "sender and signed user mismatch");
        return deposit(token,amount);
    }

    // function deposit(address token, uint amount) public payable returns (bool success){
    //     // if(isEthLottery)
    //     //     require(amountToken1 == msg.value, "msg.value and amount mismatch");
    //     // else {
    //     //     require(IERC20(token1).balanceOf(msg.sender) >= amountToken1, 'Not enought Token1');
    //     //     require(IERC20(token1).allowance(msg.sender, address(this)) >= amountToken1,'Not enought allowance Token1');
    //     // }
    //     // require(IERC20(token0).balanceOf(msg.sender) >= amountToken0, 'Not enought Token0');
    //     // require(IERC20(token0).allowance(msg.sender, address(this)) >= amountToken0,'Not enought allowance Token0');
    //     return _deposit(token,amount);
    // }

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

    function deposit(address token, uint amount) public payable returns (bool success){
        require(IFrogReferal(frogReferalAddress).alreadyParticipant(msg.sender), "Not a Participant");

        // Checking  minUSD <= (balance + deposit - withdraw + new deposit) <= maxUSD
        // (uint lpToken0, uint lpToken1) = rateLPTokens();
        uint amountToken0;
        uint amountToken1;
        {
        if(token == token0){
            amountToken0 = amount / 2;
            amountToken1 = swapExactInputSingle(token0, token1, amountToken0);
        }
        else if(token == token1){
            amountToken1 = amount / 2;
            amountToken0 = swapExactInputSingle(token1, token0, amountToken1);
        }
        else {
            amountToken0 = swapExactInputSingle(token, token0, amount / 2);
            amountToken1 = swapExactInputSingle(token, token1, amount / 2);
        }
        }
        console.log("rrrrrr", amountToken0, amountToken1);
        uint amount0_active;
        uint amount1_active;
        int24 tickLower;
        int24 tickUpper;
        {
            (,,,,,tickLower, tickUpper,,,,,) = INonfungiblePositionManager(nonfungiblePositionManager).positions(tokenId);
            (uint160 sqrtPriceX96, int24 currentTick,,,,,) = IUniswapV3Pool(pool).slot0();

            (amount0_active, amount1_active) = calculateAmountsForLiquidity(sqrtPriceX96,currentTick,tickLower,tickUpper,int(balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender]),false);
        }

        uint futureBalanceUsd = getPriceWithDecimalsContoller(token0, uint128(amount0_active)) + getPriceWithDecimalsContoller(token1, uint128(amount1_active));
        uint withdrawUsd = getPriceWithDecimalsContoller(token0, uint128(amountToken0)) + getPriceWithDecimalsContoller(token1, uint128(amountToken1));

        console.log(futureBalanceUsd,withdrawUsd);
        console.log(getPriceWithDecimalsContoller(token0, uint128(amount0_active)));
        console.log(getPriceWithDecimalsContoller(token1, uint128(amount1_active)));
        console.log(getPriceWithDecimalsContoller(token0, uint128(amountToken0)));
        console.log(getPriceWithDecimalsContoller(token1, uint128(amountToken1)));

// 2.474090713541702947
        require(futureBalanceUsd + withdrawUsd >= minUsd, 'Total balance less than minUSD');
        require(futureBalanceUsd + withdrawUsd <= maxUsd, 'Total balance great than maxUSD');
        {
            TransferHelper.safeTransferFrom(token0, msg.sender, address(this), amountToken0);
            TransferHelper.safeTransferFrom(token1, msg.sender, address(this), amountToken1);
        }

        
        uint liquidity;
        uint amount0;
        uint amount1;

        if(isEthLottery){
            
        } else {
            INonfungiblePositionManager.IncreaseLiquidityParams memory params =
            INonfungiblePositionManager.IncreaseLiquidityParams({
                tokenId: tokenId,
                amount0Desired: amountToken0,
                amount1Desired: amountToken1,
                amount0Min: 0,
                amount1Min: 0,
                deadline: block.timestamp
            });
            (liquidity, amount0, amount1) = INonfungiblePositionManager(nonfungiblePositionManager).increaseLiquidity(params);

        }
        depositOf[msg.sender] += liquidity;

        console.log('liquidity deposited:' ,liquidity);


        if(!isParticipant(msg.sender)){
            alreadyParticipant[msg.sender] = true;
            participants.push(msg.sender);
            emit NewParticipant(msg.sender);
        }

        return true;
    }
 
    function withdraw(uint _amount) public{
        uint liquidity = balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender];
        require(liquidity >= _amount, 'Not enought liquidity');

        if(_amount != liquidity){
            uint amount0_active;
            uint amount1_active;
            uint amount0_in;
            uint amount1_in;
            int24 tickLower;
            int24 tickUpper;
            int24 currentTick;
            uint160 sqrtPriceX96;

            {
                (,,,,,tickLower, tickUpper,,,,,) = INonfungiblePositionManager(nonfungiblePositionManager).positions(tokenId);
            }
            {
                (sqrtPriceX96,currentTick,,,,,) = IUniswapV3Pool(pool).slot0();
            }
            (amount0_active, amount1_active) = calculateAmountsForLiquidity(sqrtPriceX96,currentTick,tickLower,tickUpper, int256(liquidity),true);
            (amount0_in, amount1_in) = calculateAmountsForLiquidity(sqrtPriceX96,currentTick,tickLower,tickUpper, int256(_amount),true);
            uint futureBalanceUsd = getPriceWithDecimalsContoller(token0, uint128(amount0_active)) + getPriceWithDecimalsContoller(token1, uint128(amount1_active));
            uint withdrawUsd = getPriceWithDecimalsContoller(token0, uint128(amount0_in)) + getPriceWithDecimalsContoller(token1, uint128(amount1_in));

            require(futureBalanceUsd - withdrawUsd >= minUsd, 'Total balance less than minUSD');
            require(futureBalanceUsd - withdrawUsd <= maxUsd, 'Total balance great than maxUSD');
        } 
        withdrawOf[msg.sender] += _amount;
    }

    function claimReward() virtual public {
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

    function getQuoteAtTick(int24 tick, uint128 baseAmount, address baseToken, address quoteToken) internal pure returns (uint256 quoteAmount) {
        uint160 sqrtRatioX96 = TickMath.getSqrtRatioAtTick(tick);

        // Calculate quoteAmount with better precision if it doesn't overflow when multiplied by itself
        if (sqrtRatioX96 <= type(uint128).max) {
            uint256 ratioX192 = uint256(sqrtRatioX96) * sqrtRatioX96;
            quoteAmount = baseToken < quoteToken
                ? FullMath.mulDiv(ratioX192, baseAmount, 1 << 192)
                : FullMath.mulDiv(1 << 192, baseAmount, ratioX192);
        } else {
            uint256 ratioX128 = FullMath.mulDiv(sqrtRatioX96, sqrtRatioX96, 1 << 64);
            quoteAmount = baseToken < quoteToken
                ? FullMath.mulDiv(ratioX128, baseAmount, 1 << 128)
                : FullMath.mulDiv(1 << 128, baseAmount, ratioX128);
        }
    }

    function getPriceWithDecimalsContoller(address tokenIn, uint128 amount) public view returns (uint amountOut) {
        address _pool = IUniswapV3Factory(pancakeFactory).getPool(tokenIn,stableCoinAddress,poolFee);
        (, int24 tick,,,,,) = IUniswapV3Pool(_pool).slot0();
        uint8 decimals = Deimals(stableCoinAddress).decimals();
        amountOut = getQuoteAtTick(tick,amount,tokenIn, stableCoinAddress) * decimalsContoller / uint(10**decimals);
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
                        INonfungiblePositionManager(nonfungiblePositionManager).decreaseLiquidity(params);

                        INonfungiblePositionManager.CollectParams memory paramsCollect =
                        INonfungiblePositionManager.CollectParams({
                            tokenId: tokenId,
                            recipient: address(this),
                            amount0Max: type(uint128).max,
                            amount1Max: type(uint128).max
                        });

                        (uint amount0Collect, uint amount1Collect) = INonfungiblePositionManager(nonfungiblePositionManager).collect(paramsCollect);
                        IERC20(token0).transfer(user,amount0Collect);
                        IERC20(token1).transfer(user,amount1Collect);
                    }
                    

                    withdrawOf[user] = 0;
                }
        }
    }

    function draw() virtual public isBeneficiaryOrOwner{
        INonfungiblePositionManager.CollectParams memory params =
        INonfungiblePositionManager.CollectParams({
            tokenId: tokenId,
            recipient: address(this),
            amount0Max: type(uint128).max,
            amount1Max: type(uint128).max
        });

        (uint amount0, uint amount1) = INonfungiblePositionManager(nonfungiblePositionManager).collect(params);


        address[] memory activeParticipants = new address[](participants.length);
        uint participantsCount;
        uint[] memory winnerItems;
        uint winnersLiquidity;
        (activeParticipants, participantsCount) = getParticipants();
        if(participantsCount > 0){
            

            uint rewardWithFeeToken0 = amount0 == 0 ? 0 : amount0 * (10000 - feePercent) / 10000;
            uint rewardWithFeeToken1 = amount1 == 0 ? 0 : amount1 * (10000 - feePercent) / 10000;
            

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

                uint participantRewardToken0 = rewardWithFeeToken0 == 0 ? 0 : rewardWithFeeToken0 * participantRewardPart / 100;
                uint participantRewardToken1 = rewardWithFeeToken1 == 0 ? 0 : rewardWithFeeToken1 * participantRewardPart / 100;
            

                rewardFromPrevDrawToken0 += participantRewardToken0;
                rewardFromPrevDrawToken1 += participantRewardToken1;

                rewardOfToken0[winner] += participantRewardToken0;
                rewardOfToken1[winner] += participantRewardToken1;

                prticipantsRewardToken0 += participantRewardToken0;
                prticipantsRewardToken1 += participantRewardToken1;

                emit Victory(drawNumber, winner, participantRewardToken0, participantRewardToken1);
            }
            emit Draw(drawNumber, amount0, amount1, prticipantsRewardToken0, prticipantsRewardToken1);
            }

            accounting();
        } else {
            accounting();
        }
    }

    // function calculateLiquidityForAmounts(uint amount0, uint amount1, int24 tickLower, int24 tickUpper) public view returns(uint liquidity) {
    //     (uint160 sqrtPriceX96, , , , , , ) = IUniswapV3Pool(pool).slot0();
    //     uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
    //     uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

    //     liquidity = LiquidityAmounts.getLiquidityForAmounts(
    //         sqrtPriceX96,
    //         sqrtRatioAX96,
    //         sqrtRatioBX96,
    //         amount0,
    //         amount1
    //     );
    // }

    function calculateAmountsForLiquidity(uint160 sqrtPriceX96, int24 currentTick, int24 tickLower, int24 tickUpper, int256 liquidity, bool isMinus) public pure returns(uint amount0, uint amount1){
        int128 liquidityDelta;
        if(isMinus){
            liquidityDelta = -liquidity.toInt128();
        } else {
            liquidityDelta = liquidity.toInt128();
        }

        int256 _amount0;
        int256 _amount1;

        if (liquidityDelta != 0) {
            if (currentTick < tickLower) {
                // current tick is below the passed range; liquidity can only become in range by crossing from left to
                // right, when we'll need _more_ token0 (it's becoming more valuable) so user must provide it
                _amount0 = getAmount0Delta(
                    TickMath.getSqrtRatioAtTick(tickLower),
                    TickMath.getSqrtRatioAtTick(tickUpper),
                    liquidityDelta
                );

            } else if (currentTick < tickUpper) {
                // current tick is inside the passed range

                _amount0 = getAmount0Delta(
                    sqrtPriceX96,
                    TickMath.getSqrtRatioAtTick(tickUpper),
                    liquidityDelta
                );
                _amount1 = getAmount1Delta(
                    TickMath.getSqrtRatioAtTick(tickLower),
                    sqrtPriceX96,
                    liquidityDelta
                );

            } else {
                // current tick is above the passed range; liquidity can only become in range by crossing from right to
                // left, when we'll need _more_ token1 (it's becoming more valuable) so user must provide it
                _amount1 = getAmount1Delta(
                    TickMath.getSqrtRatioAtTick(tickLower),
                    TickMath.getSqrtRatioAtTick(tickUpper),
                    liquidityDelta
                );
            }
            if(isMinus){
                amount0 = uint256(-_amount0);
                amount1 = uint256(-_amount1); 
            } else {
                amount0 = uint256(_amount0);
                amount1 = uint256(_amount1); 
            }
            
            
        }
        
        
        
        
        
        // uint160 sqrtRatioAX96 = TickMath.getSqrtRatioAtTick(tickLower);
        // uint160 sqrtRatioBX96 = TickMath.getSqrtRatioAtTick(tickUpper);

        // (amount0, amount1) = LiquidityAmounts.getAmountsForLiquidity(sqrtPriceX96, sqrtRatioAX96, sqrtRatioBX96, liquidity);
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
    }

    receive() external payable {}


    /// @notice Gets the amount0 delta between two prices
    /// @dev Calculates liquidity / sqrt(lower) - liquidity / sqrt(upper),
    /// i.e. liquidity * (sqrt(upper) - sqrt(lower)) / (sqrt(upper) * sqrt(lower))
    /// @param sqrtRatioAX96 A sqrt price
    /// @param sqrtRatioBX96 Another sqrt price
    /// @param liquidity The amount of usable liquidity
    /// @param roundUp Whether to round the amount up or down
    /// @return amount0 Amount of token0 required to cover a position of size liquidity between the two passed prices
    function _getAmount0Delta(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint128 liquidity,
        bool roundUp
    ) internal pure returns (uint256 amount0) {
        if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);

        uint256 numerator1 = uint256(liquidity) << FixedPoint96.RESOLUTION;
        uint256 numerator2 = sqrtRatioBX96 - sqrtRatioAX96;

        require(sqrtRatioAX96 > 0);

        return
            roundUp
                ? UnsafeMath.divRoundingUp(
                    FullMath.mulDivRoundingUp(numerator1, numerator2, sqrtRatioBX96),
                    sqrtRatioAX96
                )
                : FullMath.mulDiv(numerator1, numerator2, sqrtRatioBX96) / sqrtRatioAX96;
    }

    /// @notice Gets the amount1 delta between two prices
    /// @dev Calculates liquidity * (sqrt(upper) - sqrt(lower))
    /// @param sqrtRatioAX96 A sqrt price
    /// @param sqrtRatioBX96 Another sqrt price
    /// @param liquidity The amount of usable liquidity
    /// @param roundUp Whether to round the amount up, or down
    /// @return amount1 Amount of token1 required to cover a position of size liquidity between the two passed prices
    function _getAmount1Delta(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        uint128 liquidity,
        bool roundUp
    ) internal pure returns (uint256 amount1) {
        if (sqrtRatioAX96 > sqrtRatioBX96) (sqrtRatioAX96, sqrtRatioBX96) = (sqrtRatioBX96, sqrtRatioAX96);

        return
            roundUp
                ? FullMath.mulDivRoundingUp(liquidity, sqrtRatioBX96 - sqrtRatioAX96, FixedPoint96.Q96)
                : FullMath.mulDiv(liquidity, sqrtRatioBX96 - sqrtRatioAX96, FixedPoint96.Q96);
    }

    /// @notice Helper that gets signed token0 delta
    /// @param sqrtRatioAX96 A sqrt price
    /// @param sqrtRatioBX96 Another sqrt price
    /// @param liquidity The change in liquidity for which to compute the amount0 delta
    /// @return amount0 Amount of token0 corresponding to the passed liquidityDelta between the two prices
    function getAmount0Delta(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        int128 liquidity
    ) internal pure returns (int256 amount0) {
        return
            liquidity < 0
                ? -_getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, uint128(-liquidity), false).toInt256()
                : _getAmount0Delta(sqrtRatioAX96, sqrtRatioBX96, uint128(liquidity), true).toInt256();
    }

    /// @notice Helper that gets signed token1 delta
    /// @param sqrtRatioAX96 A sqrt price
    /// @param sqrtRatioBX96 Another sqrt price
    /// @param liquidity The change in liquidity for which to compute the amount1 delta
    /// @return amount1 Amount of token1 corresponding to the passed liquidityDelta between the two prices
    function getAmount1Delta(
        uint160 sqrtRatioAX96,
        uint160 sqrtRatioBX96,
        int128 liquidity
    ) internal pure returns (int256 amount1) {
        return
            liquidity < 0
                ? -_getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, uint128(-liquidity), false).toInt256()
                : _getAmount1Delta(sqrtRatioAX96, sqrtRatioBX96, uint128(liquidity), true).toInt256();
    }

}