
const express = require('express')
const app = express()
const port = 3001
const { PrismaClient, User } = require('@prisma/client')
var cors = require('cors')
var bodyParser = require('body-parser')
const { ethers } = require("ethers")
const dotenv = require('dotenv')
const constants = require("../blockchain/scripts/json/constants.json")
const lotteryAbi = require("../blockchain/artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json")
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
dotenv.config()
const prisma = new PrismaClient()

const PROD = process.env.PROD != 'false'
const chainId = 11155111
const infura = 'e896ad4f86a749038fe8e1de62a9b540'


app.post('/getUser', async (req: any, res: any) => {
    try {
        let { wallet } = req.body
        console.log(wallet, wallet.toLowerCase())
        wallet = wallet.toLowerCase()
        console.log(wallet)
        const user = await prisma.user.findUnique({
            where: {
                wallet
            }
        })
        console.log(user)
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
    if (PROD) {
        provider = new ethers.providers.InfuraProvider(chainId, infura)
    }
    const contract = new ethers.Contract(constants.addresses.Lottery_CAKE_BNB, lotteryAbi.abi, new ethers.Wallet(constants.privateKey, provider))
    contract.on('Draw', async (drawNumber: any, allReward: any, participantsReward: any) => {
        console.log(drawNumber.toString(), allReward.toString(), participantsReward.toString())
        const filter = await contract.queryFilter(contract.filters.Victory(), await provider.getBlockNumber() - 5)
        let afterDrawData = []
        let referalsReward = BigInt(0)
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
            const reward = Math.round(element.args?._amount / 100 * (user?.percent as number / 100))
            afterDrawData.push({
                wallet: referer?.wallet,
                reward: BigInt(reward)
            })
            referalsReward += BigInt(reward)
        }
        console.log(afterDrawData)
        await contract.afterDraw(afterDrawData, BigInt(referalsReward))
        console.log("done:", drawNumber)
    })
    console.log(`Example app listening on port ${port}`)
})