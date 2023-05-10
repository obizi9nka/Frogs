
const express = require('express')
const app = express()
const port = 3001
// import { PrismaClient, User } from '@prisma/client'
const { PrismaClient, User } = require('@prisma/client')
var cors = require('cors')
var bodyParser = require('body-parser')
// import { ethers } from "ethers"
const { ethers } = require("ethers")

const constants = require("../blockchain/scripts/json/constants.json")
const lotteryAbi = require("../blockchain/artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json")
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
const prisma = new PrismaClient()


app.post('/getUser', async (req: any, res: any) => {
    try {
        const { wallet } = req.body
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
        res.send({ user: null })
        console.log(error)
    }
})

app.listen(port, async () => {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
    const contract = new ethers.Contract(constants.addresses.Lottery_CAKE_BNB, lotteryAbi.abi, new ethers.Wallet(constants.privateKey, provider))
    contract.on('Draw', async (drawNumber: any, allReward: any, participantsReward: any) => {
        console.log(drawNumber.toString(), allReward.toString(), participantsReward.toString())
        const filter = await contract.queryFilter(contract.filters.Victory(), await provider.getBlockNumber() - 5)
        let afterDrawData = []
        let referalsReward = BigInt(0)
        const len = filter.length
        for (let index = len - 1; index >= 0; index--) {
            const element = filter[index];
            console.log(element.args)
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
            console.log(user)
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