import type { NextApiRequest, NextApiResponse } from 'next'

import { PrismaClient, User } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<User>
) {
    const userData = req.body as User

    const t = await prisma.user.create({
        data: { ...userData }
    })

    res.status(200).json(t)
}
