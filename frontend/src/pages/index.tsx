import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger)

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Faq } from '@/components/Faq';
import { Referal } from '@/components/Referal';
import { Frog } from '@/components/Frog';




export default function Home() {
  return (
    <div className="change-background change-background-1">
      <Header />
      <Frog />
      <Referal />
      <Faq />
      <Footer />
    </div >
  )
}
