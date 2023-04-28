import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient, User } from '@prisma/client'
import { findUserDto } from './dto'

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<User | Error>
) {
    let { wallet, id } = req.body as findUserDto
    wallet = wallet?.toLowerCase()

    let referer
    if (id != undefined && wallet != undefined) {
        referer = await prisma.user.findUnique({ where: { id_wallet: { id, wallet }, } })
    }
    else if (id != undefined) {
        referer = await prisma.user.findUnique({ where: { id } })
    }
    else if (wallet != undefined) {
        referer = await prisma.user.findUnique({ where: { wallet } })
    }
    if (referer == null)
        res.status(400).send({
            message: "Referer not found",
            name: "Referer not found"
        })
    else {
        res.status(200).send(referer)
    }
}
