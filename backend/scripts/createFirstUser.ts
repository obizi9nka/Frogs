const p = require('@prisma/client')

const prismat = new p.PrismaClient()

const CLEAR_ALL_DB = false

const user = {
    wallet: '0x00',
    // id: 1,
    level: 0,
    // refererId: null,
    // percent: 500,
    pid: null
}

async function handlerg() {
    if (CLEAR_ALL_DB)
        await prismat.user.deleteMany()


    const t = await prismat.user.create({
        data: { ...user }
    })

    console.log(t)
}

handlerg().then(() => {
    console.log('done')
})