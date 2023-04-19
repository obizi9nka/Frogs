import Image from 'next/image'
import { Inter } from 'next/font/google'
import { User } from '@prisma/client'
import axios, { AxiosResponse } from 'axios'

const inter = Inter({ subsets: ['latin'] })
const createNewUser = async () => {
  const user = {
    wallet: "0x000",
    refererId: 2
  } as User
  await axios.post('/api/createNewUser', user).then(async (data: AxiosResponse) => {
    const user: User = await data.data
    console.log(user)
  })
}

export default function Home() {
  return (
    <div onClick={createNewUser}>
      hi
    </div>
  )
}
