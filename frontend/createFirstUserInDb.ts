const p = require('@prisma/client')

const prisma = new p.PrismaClient()

const CLEAR_ALL_DB = false

const user = {
    wallet: '0x00',
    // id: 1,
    level: 0,
    // refererId: null,
    // percent: 500,
    pid: null
}

async function handler() {
    if (CLEAR_ALL_DB)
        await prisma.user.deleteMany()


    const t = await prisma.user.create({
        data: { ...user }
    })

    console.log(t)
}

handler().then(() => {
    console.log('done')
})