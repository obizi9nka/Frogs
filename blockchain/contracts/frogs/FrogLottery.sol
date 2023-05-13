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
    mapping (address => uint) public rewardOf;

    address[] public participants;
    mapping (address => bool) public alreadyParticipant;

    uint public minUsd;
    uint public maxUsd;
    uint feePercent;
    uint maxFeePercent;
    uint balanceFromPreviousDraws;
    bool isEthLottery;

    event BeneficiaryChanged(address indexed _oldBeneficiary, address indexed _newBeneficiary);
    event FeePercentChanged(uint indexed _oldFeePercent, uint indexed _newFeePercent);
    event Draw(uint indexed _drawNumber, uint _fundTotal, uint _rewardTotal);
    event Victory(uint indexed _drawNumber, address indexed _winner, uint256 _amount);
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

    constructor(address _token0, address _token1, uint24 _poolFee, address _frogReferalAddress, bool _isEthLottery, address _beneficiary, uint _pancakePID, address _pool, address _nonfungiblePositionManager, address _swapRouter) {
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

    function setAll(address _token0, address _token1,address usd, address router,address masterChef,address pair) public isBeneficiaryOrOwner {
        token0 = _token0;
        token1 = _token1;
        pancakeRouterAddress = router;
        pancakeMCAddress = masterChef;
        pancakePairAddress = pair;
        stableCoinAddress = usd;
    }

    function registerBeforeDeposit(bytes calldata message, uint8 v, bytes32 r, bytes32 s, uint amountToken0, uint amountToken1) public payable returns (bool success){
        require(IFrogReferal(frogReferalAddress).registerReferal(message,v,r,s),'invalid sig');
        (address newUser) = abi.decode(message,(address));
        require(newUser == msg.sender, "sender and signed user mismatch");
        return deposit(amountToken0,amountToken1);
    }

    function deposit(uint amountToken0, uint amountToken1) public payable returns (bool success){
        if(isEthLottery)
            require(amountToken1 == msg.value, "msg.value and amount mismatch");
        else {
            require(IERC20(token1).balanceOf(msg.sender) >= amountToken1, 'Not enought Token1');
            require(IERC20(token1).allowance(msg.sender, address(this)) >= amountToken1,'Not enought allowance Token1');
        }
        require(IERC20(token0).balanceOf(msg.sender) >= amountToken0, 'Not enought Token0');
        require(IERC20(token0).allowance(msg.sender, address(this)) >= amountToken0,'Not enought allowance Token0');
        return _deposit(amountToken0,amountToken1);
    }

    function rateLPTokens() public view returns (uint lpToken0, uint lpToken1){
        (uint112 reserve0, uint112 reserve1,) = IPancakePair(pancakePairAddress).getReserves();
        uint supply = IPancakePair(pancakePairAddress).totalSupply();
        lpToken0 = reserve0 * lpDecimals / supply;
        lpToken1 = reserve1 * lpDecimals / supply;
    }

    function getPSRate(uint _amount, address _tokenIn, address _tokenOut) public view returns (uint){
        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint[] memory rate;
        rate = new uint[](2);
        rate = IPancakeRouter02(pancakeRouterAddress).getAmountsOut(_amount,path);
        return rate[1];
    }

    function getTokensPrice() public view {
        (uint160 sqrtPriceX96,,,,,,) = IUniswapV3Pool(pool).slot0();
    }

    function swapExactInputSingle(uint256 amountIn) internal returns (uint256 amountOut) {
        // msg.sender must approve this contract

        // Transfer the specified amount of DAI to this contract.
        TransferHelper.safeTransferFrom(token0, msg.sender, address(this), amountIn);

        // Approve the router to spend DAI.
        TransferHelper.safeApprove(token0, address(swapRouter), amountIn);

        // Naively set amountOutMinimum to 0. In production, use an oracle or other data source to choose a safer value for amountOutMinimum.
        // We also set the sqrtPriceLimitx96 to be 0 to ensure we swap our exact input amount.
        ISwapRouter.ExactInputSingleParams memory params =
            ISwapRouter.ExactInputSingleParams({
                tokenIn: token0,
                tokenOut: token1,
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

    function _deposit(uint amountToken0, uint amountToken1) private returns (bool success){
        require(IFrogReferal(frogReferalAddress).alreadyParticipant(msg.sender), "Not a Participant");

        // Checking  minUSD <= (balance + deposit - withdraw + new deposit) <= maxUSD
        // (uint lpToken0, uint lpToken1) = rateLPTokens();
        amountToken1 = swapExactInputSingle(amountToken0 /= 2);
        console.log("rrrrrr", amountToken0, amountToken1);

        // return true;
        // uint futureBalanceUsd = (balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender]) * (getPSRate(lpToken0, token0, stableCoinAddress) + getPSRate(lpToken1, token1, stableCoinAddress)) / lpDecimals;
        // uint depositUsd = getPSRate(amountToken0, token0, stableCoinAddress) + getPSRate(amountToken1, token1, stableCoinAddress);

        // console.log(futureBalanceUsd,depositUsd,minUsd,maxUsd);
        // require(futureBalanceUsd + depositUsd >= minUsd, 'Total balance less than minUSD');
        // require(futureBalanceUsd + depositUsd <= maxUsd, 'Total balance great than maxUSD');

        bool isTransfer0 = IERC20(token0).transferFrom(msg.sender, address(this), amountToken0);
        bool isTransfer1 = IERC20(token1).transferFrom(msg.sender, address(this), amountToken1);
        require(isTransfer0, 'transfer is failed0');
        require(isTransfer1, 'transfer is failed1');
        uint liquidity;
        uint amount0;
        uint amount1;
        // IERC20(token0).approve(pancakeRouterAddress, amountToken0);

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
            // require(IERC20(token1).transferFrom(msg.sender, address(this), amountToken1), 'transfer is failed');
            // IERC20(token1).approve(pancakeRouterAddress, amountToken1);
        }
        
        // IERC20(pancakePairAddress).approve(pancakeMCAddress,amountLP);
        // IMasterChef(pancakeMCAddress).deposit(pancakePID, amountLP);

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
        require(rewardOf[msg.sender] > 0, 'Reward is empty');
        // require(IERC20(token0).balanceOf(address(this)) >= rewardOf[msg.sender], 'Not enought CAKE for a claim');
        require(IERC20(token0).transfer(msg.sender, rewardOf[msg.sender] / 2),"Transfer faild0");
        require(IERC20(token1).transfer(msg.sender, rewardOf[msg.sender] / 2),"Transfer faild1");
        balanceFromPreviousDraws -= rewardOf[msg.sender];
        rewardOf[msg.sender] = 0;
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

        console.log(amount0,amount1);

        uint currentReward = amount0 + amount1 - balanceFromPreviousDraws;
        // uint currentReward = IERC20(token0).balanceOf(address(this)) - balanceFromPreviousDraws;
        // // @TODO optimize
        address[] memory activeParticipants = new address[](participants.length);
        uint participantsCount;
        uint[] memory winnerItems;
        uint winnersDeposit;
        (activeParticipants, participantsCount) = getParticipants();
        console.log("===========================participantsCount",participantsCount);
        if(participantsCount > 0){
            uint reward = currentReward * (10000 - feePercent) / 10000;

            uint winnersCount = participantsCount / 150 + 1;
            winnerItems = new uint[](winnersCount);
            winnerItems = getRandomsWithRepeat(participantsCount, winnersCount);

            for(uint i = 0; i < winnersCount; i++){
                uint index = winnerItems[i];
                winnersDeposit += balanceOf[activeParticipants[index]];
            }

            drawNumber++;
            uint prticipantsReward;
            for(uint i = 0; i < winnersCount; i++){
                address winner = activeParticipants[winnerItems[i]];
                uint participantRewardPart = balanceOf[winner] * 100 / winnersDeposit;
                uint participantReward = reward * participantRewardPart / 100;
                rewardOf[winner] += participantReward;
                balanceFromPreviousDraws += participantReward;
                prticipantsReward += participantReward;
                emit Victory(drawNumber, winner, participantReward);
                // вычисляет награду для кошелька для которого winner являеться рефералом
            }

            emit Draw(drawNumber, currentReward, prticipantsReward);
            
            accounting();
        } else {
            accounting();
        }
    }

    function afterDraw(IFrogReferal.ReferersRewardInfo[] memory data, uint referersReward) public isBeneficiaryOrOwner{
        uint balance = IERC20(token0).balanceOf(address(this)) - balanceFromPreviousDraws;
        IFrogReferal(frogReferalAddress).accrueRewardFromWinningReferral(data, token0);
        IERC20(token0).transfer(frogReferalAddress,referersReward);
        IERC20(token0).transfer(beneficiary, balance - referersReward);
    }

    function farmTotal() public view returns(uint){
        return IMasterChef(pancakeMCAddress).pendingCake(pancakePID, address(this));
    }

    receive() external payable {}
}