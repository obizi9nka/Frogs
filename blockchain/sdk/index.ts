import { ethers } from "ethers";
import constants from '../scripts/json/constants.json'
import { create_ERC20, create_FrogLottery, create_LPToken, create_Router } from "./create_Contracts";

const config = {
    'sepolia': 11155111,
    'bscTestnet': 97,
    'localhost': 31337,
    'bsc': 56
}


export default async function sdk(token0Address: string, token1Address: string, chainId: number, signerOrProvider: ethers.Wallet | ethers.providers.Provider) {
    const addresses = constants.addresses as any
    let chain = 'sepolia_'
    if (chainId == config.sepolia)
        chain = 'sepolia_'
    else if (chainId == config.bscTestnet)
        chain = 'bscTestnet_'
    else if (chainId == config.bsc)
        chain = 'bsc_'
    else if (chainId == config.localhost)
        chain = 'localhost_'

    const lotteryAddress = addresses[chain + 'Lottery_' + token0Address + token1Address]
    const lpTokenAddress = addresses[chain + 'LPToken_' + token0Address + token1Address]
    const routerAddress = addresses[chain + 'Router']
    const factoryAddress = addresses[chain + 'Factory']
    const stableCoinAddress = addresses[chain + 'USDT']

    return {
        lottery: create_FrogLottery(lotteryAddress, signerOrProvider),
        lp: create_LPToken(lpTokenAddress, signerOrProvider),
        router: create_Router(routerAddress, signerOrProvider),
        token0: create_ERC20(token0Address, signerOrProvider),
        token1: create_ERC20(token1Address, signerOrProvider),
        factoryAddress,
        stableCoinAddress,
    }

}