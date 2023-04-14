// SPDX-License-Identifier: GPL-3.0

import "./Random.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./pancekeswap-fork/utils/interfaces/IMasterChef.sol";
import "./pancekeswap-fork/utils/interfaces/IPancakePair.sol";
import "./pancekeswap-fork/utils/interfaces/IRouter.sol";
import "./pancekeswap-fork/utils/interfaces/IFrogReferal.sol";
import 'hardhat/console.sol';

pragma solidity ^0.8.0;

/**
  * @title FrogLottery
   * @dev FrogLottery
   */
contract FrogLottery is Random, Ownable{

    uint public drawNumber = 0;
    uint public lpDecimals = 10000;

    address cakeContractAddress;
    address bnbContractAddress;
    address usdtContractAddress;
    address pancakeRouterAddress;
    address pancakeMCAddress;
    address pancakePairAddress;
    address frogReferalAddress;
    uint pancakePID;

    address public beneficiary;

    mapping (address => uint) public depositOf;
    mapping (address => uint) public balanceOf;
    mapping (address => uint) public withdrawOf;
    mapping (address => uint) public rewardOf;

    address[] public participants;
    mapping (address => bool) public alreadyParticipant;

    uint public minUsdt;
    uint public maxUsdt;
    uint feePercent;
    uint maxFeePercent;
    uint balanceFromPreviousDraws;

    event BeneficiaryChanged(address indexed _oldBeneficiary, address indexed _newBeneficiary);
    event FeePercentChanged(uint indexed _oldFeePercent, uint indexed _newFeePercent);
    event Draw(uint indexed _drawNumber, uint _fundTotal, uint _rewardTotal, uint _feeTotal);
    event Victory(uint indexed _drawNumber, address indexed _winner, uint256 _amount);
    event Deposit(address indexed _participant, uint _amount, uint _oldBalance);
    event Withdraw(address indexed _participant, uint _amount, uint _oldBalance);
    event NewParticipant(address indexed _newParticipant);

    modifier isBeneficiaryOrOwner() {
        require(msg.sender == owner() || msg.sender == beneficiary, "Caller is not beneficiary or owner");
        _;
    }

    constructor(address _frogReferalAddress) {
        beneficiary     = msg.sender;
        maxFeePercent   = 30;
        feePercent      = maxFeePercent;
        minUsdt         = 1 ether; // @TODO change to 50-500
        maxUsdt         = 100 ether; // @TODO change to 50-500
        pancakePID      = 1;
        setCakeContractAddress(0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82);
        setBnbContractAddress(0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c);
        setUsdtContractAddress(0x55d398326f99059fF775485246999027B3197955);
        setPancakeRouterAddress(0x10ED43C718714eb63d5aA57B78B54704E256024E);
        setPancakeMCAddress(0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652);
        setPancakePairAddress(0x0eD7e52944161450477ee417DE9Cd3a859b14fD0);
        setFrogReferalAddress(_frogReferalAddress);
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
    function setCakeContractAddress(address _cakeContractAddress) public onlyOwner {
        cakeContractAddress = _cakeContractAddress;
    }

    // @TODO add Event(?)
    function setBnbContractAddress(address _address) public onlyOwner {
        bnbContractAddress = _address;
    }

    // @TODO add Event(?)
    function setUsdtContractAddress(address _address) public onlyOwner {
        usdtContractAddress = _address;
    }

    // @TODO add Event(?)
    function setPancakeRouterAddress(address _address) public onlyOwner{
        pancakeRouterAddress = _address;
    }
    // @TODO add Event(?)
    function setPancakeMCAddress(address _address) public onlyOwner{
        pancakeMCAddress = _address;
    }
    // @TODO add Event(?)
    function setPancakePairAddress(address _address) public onlyOwner{
        pancakePairAddress = _address;
    }
    // @TODO add Event(?)
    function setFrogReferalAddress(address _address) public onlyOwner{
        frogReferalAddress = _address;
    }

    function getPSRate(uint _amount, address _tokenIn, address _tokenOut) public view returns (uint){
        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint[] memory rate;
        rate = new uint[](2);

        rate = IPancakeRouter02(pancakeRouterAddress).getAmountsOut(_amount,path);
        console.log('rate :', _tokenIn, _tokenOut, rate[1]);
        return rate[1];
    }

    function setBeneficiary(address _newBeneficiary) public isBeneficiaryOrOwner{
        emit BeneficiaryChanged(beneficiary, _newBeneficiary);
        beneficiary = _newBeneficiary;
    }

    function setFeePercent(uint _newFeePercent) public onlyOwner{
        require(_newFeePercent <= maxFeePercent, "feePercent can not be great than maxFeePercent");
        emit FeePercentChanged(feePercent, _newFeePercent);
        feePercent = _newFeePercent;
    }

    function setMinUsdt(uint _minUsdt) public onlyOwner{
        minUsdt = _minUsdt;
    }

    function setMaxUsdt(uint _maxUsdt) public onlyOwner{
        maxUsdt = _maxUsdt;
    }

    function rateLPTokens() public view returns (uint lpToken0, uint lpToken1){
        (uint112 reserve0, uint112 reserve1,) = IPancakePair(pancakePairAddress).getReserves();
        uint supply = IPancakePair(pancakePairAddress).totalSupply();
        console.log("rateLPTokens :", reserve0, reserve1,supply);
        lpToken0 = reserve0 * lpDecimals / supply;
        lpToken1 = reserve1 * lpDecimals / supply;
    }

    function setAll(address cake,address bnb,address usdt, address router,address masterChef,address pair) public {
        cakeContractAddress = cake;
        bnbContractAddress = bnb;
        pancakeRouterAddress = router;
        pancakeMCAddress = masterChef;
        pancakePairAddress = pair;
        usdtContractAddress = usdt;
    }

    function deposit(uint _amountToken0) public payable returns (bool success){
        require(IERC20(cakeContractAddress).balanceOf(msg.sender) >= _amountToken0, 'Not enought Token0');
        require(IERC20(cakeContractAddress).allowance(msg.sender, address(this)) >= _amountToken0,'Not enought allowance Token0');
        require(IFrogReferal(frogReferalAddress).isParticipant(msg.sender), "Not a Participant");

        uint amountToken1 = msg.value;

        // Checking  minUSDT <= (balance + deposit - withdraw + new deposit) <= maxUSDT
        (uint lpToken0, uint lpToken1) = rateLPTokens();
        console.log("cake in usdt:",getPSRate(lpToken0, cakeContractAddress, usdtContractAddress));
        console.log("bnb in usdt: ",getPSRate(lpToken1, bnbContractAddress, usdtContractAddress));
        console.log("lpdecimals: ",(getPSRate(lpToken0, cakeContractAddress, usdtContractAddress) + getPSRate(lpToken1, bnbContractAddress, usdtContractAddress)) / lpDecimals);
        uint futureBalanceUsdt = (balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender]) * (getPSRate(lpToken0, cakeContractAddress, usdtContractAddress) + getPSRate(lpToken1, bnbContractAddress, usdtContractAddress)) / lpDecimals;
        uint depositUsdt = getPSRate(_amountToken0, cakeContractAddress, usdtContractAddress) + getPSRate(amountToken1, bnbContractAddress, usdtContractAddress);
        console.log(futureBalanceUsdt,depositUsdt,minUsdt,maxUsdt);
        // 69 
        // 1
        // 100  
        require(futureBalanceUsdt + depositUsdt >= minUsdt, 'Total balance less than minUSDT');
        require(futureBalanceUsdt + depositUsdt <= maxUsdt, 'Total balance great than maxUSDT');

        bool isTransfer = IERC20(cakeContractAddress).transferFrom(msg.sender, address(this), _amountToken0);
        require(isTransfer, 'transfer is failed');
        uint amountLP;
        IERC20(cakeContractAddress).approve(pancakeRouterAddress, _amountToken0);
        (, , amountLP) = IPancakeRouter02(pancakeRouterAddress).addLiquidityETH{value:amountToken1}(
            cakeContractAddress,
            _amountToken0,
            _amountToken0 / 10000 * 9900,
            amountToken1 / 10000 * 9900,
            address(this),
            block.timestamp + 20 minutes
        );
        IERC20(pancakePairAddress).approve(pancakeMCAddress,amountLP);
        IMasterChef(pancakeMCAddress).deposit(pancakePID, amountLP);

        depositOf[msg.sender] += amountLP;

        if(!isParticipant(msg.sender)){
            alreadyParticipant[msg.sender] = true;
            participants.push(msg.sender);
            emit NewParticipant(msg.sender);
        }

        return true;
    }

    function withdraw(uint _amount) public returns (bool success){
        require(balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender] >= _amount, 'Not enought liquidity');

        // Checking  minUSDT <= (balance + deposit - withdraw - new withdraw) <= maxUSDT
        (uint lpToken0, uint lpToken1) = rateLPTokens();
        console.log(lpToken0, lpToken1);
        console.log("cake in usdt:",getPSRate(lpToken0, cakeContractAddress, usdtContractAddress));
        console.log("bnb in usdt: ",getPSRate(lpToken1, bnbContractAddress, usdtContractAddress));
        console.log("lpdecimals: ",(getPSRate(lpToken0, cakeContractAddress, usdtContractAddress) + getPSRate(lpToken1, bnbContractAddress, usdtContractAddress)) / lpDecimals);
        console.log("balance: ", (balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender] - _amount));
        uint futureBalanceUsdt = (balanceOf[msg.sender] + depositOf[msg.sender] - withdrawOf[msg.sender] - _amount) * (getPSRate(lpToken0, cakeContractAddress, usdtContractAddress) + getPSRate(lpToken1, bnbContractAddress, usdtContractAddress)) / lpDecimals;
        console.log(futureBalanceUsdt,minUsdt,maxUsdt);
        require((futureBalanceUsdt == 0) || (futureBalanceUsdt >= minUsdt), 'Total balance less than minUSDT');
        require(futureBalanceUsdt <= maxUsdt, 'Total balance great than maxUSDT');
        withdrawOf[msg.sender] += _amount;
        return true;
    }

    function claimReward() public {
        require(rewardOf[msg.sender] > 0, 'Reward is empty');
        require(IERC20(cakeContractAddress).balanceOf(address(this)) >= rewardOf[msg.sender], 'Not enought CAKE for a claim');
        IERC20(cakeContractAddress).transfer(msg.sender, rewardOf[msg.sender]);
        balanceFromPreviousDraws -= rewardOf[msg.sender];
        rewardOf[msg.sender] = 0;
    }

    // @TODO use SafeMath
    function accounting() internal{
        // @TODO optimize: IMasterChef(pancakeMCAddress).withdraw - call one time ?!
        for (uint i=0; i < participants.length; i++){
            if(depositOf[participants[i]] > 0){
                balanceOf[participants[i]] += depositOf[participants[i]];
                depositOf[participants[i]] = 0;
            }

            if(withdrawOf[participants[i]] > 0){
                if(withdrawOf[participants[i]] <= balanceOf[participants[i]]){
                    balanceOf[participants[i]] -= withdrawOf[participants[i]];
                    if(balanceFromPreviousDraws >= withdrawOf[participants[i]])
                        balanceFromPreviousDraws -= withdrawOf[participants[i]];
                    IMasterChef(pancakeMCAddress).withdraw(pancakePID, withdrawOf[participants[i]]);

                    IPancakePair(pancakePairAddress).approve(pancakeRouterAddress, withdrawOf[participants[i]]);

                    (uint lpToken0, uint lpToken1) = rateLPTokens();
                    (uint cakeAmount, uint bnbAmount) = IPancakeRouter02(pancakeRouterAddress).removeLiquidityETH(
                        cakeContractAddress,
                        withdrawOf[participants[i]],
                        lpToken0 * withdrawOf[participants[i]] / 10000 * 9900 / lpDecimals,
                        lpToken1 * withdrawOf[participants[i]] / 10000 * 9900 / lpDecimals,
                        address(this),
                        block.timestamp + 20 minutes
                    );

                    IERC20(cakeContractAddress).transfer(participants[i],cakeAmount);
                    payable(participants[i]).transfer(bnbAmount);

                    withdrawOf[participants[i]] = 0;
                }
            }
        }
    }

    function draw() public{
        IMasterChef(pancakeMCAddress).deposit(pancakePID, 0);
        uint currentReward = IERC20(cakeContractAddress).balanceOf(address(this)) - balanceFromPreviousDraws;
        // // @TODO optimize
        address[] memory activeParticipants = new address[](participants.length);
        uint participantsCount;
        uint[] memory winnerItems;
        uint fee;
        uint winnersDeposit;
        uint rewardNeedToTransferToReferalContract;
        (activeParticipants, participantsCount) = getParticipants();
        if(participantsCount > 0){
            fee = currentReward;
            uint reward = currentReward * (100 - feePercent) / 100;

            uint winnersCount = participantsCount / 150 + 1;
            winnerItems = new uint[](winnersCount);
            winnerItems = getRandomsWithRepeat(participantsCount, winnersCount);

            for(uint i = 0; i < winnersCount; i++){
                uint index = winnerItems[i];
                winnersDeposit += balanceOf[activeParticipants[index]];
            }

            drawNumber++;
            for(uint i = 0; i < winnersCount; i++){
                address winner = activeParticipants[winnerItems[i]];
                uint participantRewardPart = balanceOf[winner] * 100 / winnersDeposit;
                uint participantReward = reward * participantRewardPart / 100;
                uint referalReward = calculateReferalReward(winner, currentReward, participantRewardPart);
                rewardOf[winner] += participantReward;
                balanceFromPreviousDraws += participantReward;
                emit Victory(drawNumber, winner, participantReward);
                fee -= participantReward;
                // вычисляет награду для кошелька для которого winner являеться рефералом
                rewardNeedToTransferToReferalContract += referalReward;
            }

            emit Draw(drawNumber, currentReward, currentReward - fee, fee);

            // отправляет все реферальные средства на контракт frogReferal
            IERC20(cakeContractAddress).transfer(frogReferalAddress, rewardNeedToTransferToReferalContract);
            fee -= rewardNeedToTransferToReferalContract;
            IERC20(cakeContractAddress).transfer(beneficiary, fee);
            
            accounting();
        } else {
            accounting();
        }
    }
     
    function calculateReferalReward(address referal,  uint currentReward, uint participantRewardPart) private returns(uint){
        uint percent = IFrogReferal(frogReferalAddress).getReferalPercent(referal); // узнает сколько процентов должно достаться referer
        uint rewardForReferer = ((currentReward * percent) / 100) * (participantRewardPart / 100); // высчитывает сколько это в токенах
        IFrogReferal(frogReferalAddress).recieveRewardFromReferalVictory(referal,rewardForReferer); // отправляет запрос на изменение состояния referal контракта
        return rewardForReferer; // возвращает награду для referer для последующей отправки этих средств на контракт frogReferal
    }

    function farmTotal() public view returns(uint){
        return IMasterChef(pancakeMCAddress).pendingCake(pancakePID, address(this));
    }

    receive() external payable {}
    fallback() external payable {}
}