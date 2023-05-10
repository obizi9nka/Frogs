const pyty = require('@prisma/client')

const prisma2 = new pyty.PrismaClient()

const CLEAR_ALL_DB1 = true

const userNULL1 = {
    wallet: '0x00',
    id: 1,
    level: 0,
    // refererId: null,
    // percent: 500,
    pid: null
}

const userFirst1 = {
    wallet: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
    id: 2,
    level: 1,
    refererId: 1,
    pid: null
}

const userSecond2 = {
    wallet: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    id: 3,
    level: 2,
    refererId: 2,
    pid: null
}

async function handler() {
    if (CLEAR_ALL_DB1)
        await prisma2.user.deleteMany()


    const t = await prisma2.user.create({
        data: { ...userNULL1 }
    })

    const t1 = await prisma2.user.create({
        data: { ...userFirst1 }
    })

    const t2 = await prisma2.user.create({
        data: { ...userSecond2 }
    })

    console.log(t, t1, t2)
}

handler().then(() => {
    console.log('done')
})