
const express = require('express')
const app = express()
const port = 3011
const { PrismaClient, User } = require('@prisma/client')
var cors = require('cors')
var bodyParser = require('body-parser')
const { ethers } = require("ethers")
const dotenv = require('dotenv')
const constants = require("../blockchain/scripts/json/constants.json")
const config = require("../frontend/config.json")
const lotteryAbi = require("../blockchain/artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json")
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
dotenv.config()
const prisma = new PrismaClient()

const PROD = process.env.PROD != 'false'
const chainId = 11155111
const infura = 'e896ad4f86a749038fe8e1de62a9b540'
const prefix = config.prefix


app.post('/getUser', async (req: any, res: any) => {
    try {
        let { wallet } = req.body
        wallet = wallet.toLowerCase()
        const user = await prisma.user.findUnique({
            where: {
                wallet
            }
        })
        const referer = await prisma.user.findUnique({
            where: {
                id: user.refererId
            },
            select: {
                wallet: true
            }
        })
        res.send({ user, referer })
    } catch (error) {
        console.log(error)
        res.send({ user: null, error })
    }
})

app.listen(port, async () => {
    let provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    if (prefix != 'localhost_') {
        provider = new ethers.providers.InfuraProvider(chainId, infura)
    }
    const contract = new ethers.Contract(constants.addresses[prefix + 'Lottery_busd_usdt'], lotteryAbi.abi, new ethers.Wallet(constants[prefix + 'privateKey'], provider))
    const filter = await contract.queryFilter(contract.filters.Draw())
    // console.log(filter)
    contract.on('Draw', async (drawNumber: any, rewardToken0: any, rewardToken1: any, prticipantsRewardToken0: any, prticipantsRewardToken1: any) => {
        console.log(drawNumber.toString(), rewardToken0.toString(), rewardToken1.toString(), prticipantsRewardToken0.toString(), prticipantsRewardToken1.toString())
        const filter = await contract.queryFilter(contract.filters.Victory())
        let afterDrawData = []
        let referalsReward0 = BigInt(0)
        let referalsReward1 = BigInt(0)
        let referalsRewardCake = BigInt(0)
        const len = filter.length
        for (let index = len - 1; index >= 0; index--) {
            const element = filter[index];
            // console.log(element.args)
            if (element.args._drawNumber < drawNumber)
                break
            const user = await prisma.user.findUnique({
                where: {
                    wallet: element.args?._winner.toLowerCase()
                },
                select: {
                    percent: true,
                    refererId: true
                }
            })
            // console.log(user)
            const referer = await prisma.user.findUnique({
                where: {
                    id: user?.refererId as any
                },
                select: {
                    wallet: true
                }
            })
            const reward0 = Math.round(element.args?._amountToken0 / 100 * (user?.percent as number / 100))
            const reward1 = Math.round(element.args?._amountToken1 / 100 * (user?.percent as number / 100))
            const rewardCake = Math.round(element.args?._amountCake / 100 * (user?.percent as number / 100))
            afterDrawData.push({
                wallet: referer?.wallet,
                reward0: BigInt(reward0),
                reward1: BigInt(reward1),
                rewardCake: BigInt(rewardCake)
            })
            referalsReward0 += BigInt(reward0)
            referalsReward1 += BigInt(reward1)
            referalsRewardCake += BigInt(rewardCake)
        }
        console.log(afterDrawData)
        try {
            await contract.afterDraw(afterDrawData, BigInt(referalsReward0), BigInt(referalsReward1), BigInt(referalsRewardCake))
        } catch (error) {
            console.log('after', error)
        }
        console.log("done:", drawNumber)
    })
    console.log(`Example app listening on port ${port}`)
    console.log("prefix:", prefix)
})