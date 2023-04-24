import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger)

export default function Home() {
  return (
    <div>
      <Link href={'/invite/0x00'}>
        link
      </Link>
    </div>
  )
}
