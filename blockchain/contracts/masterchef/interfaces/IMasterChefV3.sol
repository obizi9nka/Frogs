// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

// import "../interfaces/INonfungiblePositionManager.sol";

interface IMasterChefV3{
    function latestPeriodEndTime() external view returns (uint256);

    function latestPeriodStartTime() external view returns (uint256);

    function upkeep(uint256 amount, uint256 duration, bool withUpdate) external;

    function harvest(uint256 _tokenId, address _to) external returns (uint256 reward);

    function withdraw(uint256 _tokenId, address _to) external returns (uint256 reward);

    function updateLiquidity(uint256 _tokenId) external;


    // function increaseLiquidity(INonfungiblePositionManager.IncreaseLiquidityParams memory params) external payable returns (uint128 liquidity, uint256 amount0, uint256 amount1);

    // function decreaseLiquidity(INonfungiblePositionManager.DecreaseLiquidityParams memory params) external returns (uint256 amount0, uint256 amount1);

    // function collect(INonfungiblePositionManager.CollectParams memory params) external returns (uint256 amount0, uint256 amount1);
}
