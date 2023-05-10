const pytyt = require('@prisma/client')

const _prisma = new pytyt.PrismaClient()

const CLEAR_ALL_D = true

const userNULL = {
    wallet: '0x00',
    id: 1,
    level: 0,
    // refererId: null,
    // percent: 500,
    pid: null
}

const userFirst = {
    wallet: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    id: 2,
    level: 1,
    refererId: 1,
    pid: null
}

async function handlerf() {
    if (CLEAR_ALL_D)
        await _prisma.user.deleteMany()

    const t = await _prisma.user.create({
        data: { ...userNULL }
    })

    const t1 = await _prisma.user.create({
        data: { ...userFirst }
    })

    console.log(t, t1)
}

handlerf().then(() => {
    console.log('done')
})