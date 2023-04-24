import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient, User } from '@prisma/client'
import { createUserDto } from './dto'

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<User | Error>
) {
    const userData = req.body as createUserDto
    console.log(userData)
    const referer = await prisma.user.findUnique({
        where: {
            wallet: userData.refererWallet,
        }
    })
    if (referer == null)
        res.status(400).send({
            message: "Referer not found",
            name: "Referer not found"
        })
    else {
        const user = {
            wallet: userData.wallet,
            refererId: referer.id,
            level: referer.level != null ? referer.level + 1 : null,
            sig: userData.sig
        }
        let t
        try {
            t = await prisma.user.create({
                data: { ...user }
            })
        } catch (error: any) {
            t = await prisma.user.findUnique({
                where: {
                    wallet: userData.wallet
                }
            }) as User
        }

        res.status(200).send(t)
    }


}
