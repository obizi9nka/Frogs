import { ethers } from "ethers";
import { ERC20Token, FrogLottery, TBnb, PancakeRouter, PancakePair } from "../typechain-types";
import FrogLottery_json from "../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json"
import ERC20_json from "../artifacts/contracts/frogs/ERC20.sol/ERC20Token.json"
import WETH_json from "../artifacts/contracts/frogs/TBnb.sol/TBnb.json"
import Router_json from "../artifacts/contracts/pancekeswap-fork/router.sol/PancakeRouter.json"
import LP_json from "../artifacts/contracts/pancekeswap-fork/pancakepair.sol/PancakePair.json"

export function create_FrogLottery(address: string, signerOrProvider: ethers.Wallet | ethers.providers.Provider) {
    return new ethers.Contract(address, FrogLottery_json.abi, signerOrProvider) as FrogLottery
}

export function create_ERC20(address: string, signerOrProvider: ethers.Wallet | ethers.providers.Provider) {
    return new ethers.Contract(address, ERC20_json.abi, signerOrProvider) as ERC20Token
}

export function create_WETH(address: string, signerOrProvider: ethers.Wallet | ethers.providers.Provider) {
    return new ethers.Contract(address, WETH_json.abi, signerOrProvider) as TBnb
}

export function create_Router(address: string, signerOrProvider: ethers.Wallet | ethers.providers.Provider) {
    return new ethers.Contract(address, Router_json.abi, signerOrProvider) as PancakeRouter
}

export function create_LPToken(address: string, signerOrProvider: ethers.Wallet | ethers.providers.Provider) {
    return new ethers.Contract(address, LP_json.abi, signerOrProvider) as PancakePair
}