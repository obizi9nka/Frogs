import axios, { AxiosResponse } from "axios"
import { createUserDto, findUserDto } from "./api/dto"
import { User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { useMetamask } from "use-metamask";
import Image from "next/image";
import ClipboardJS from "clipboard";
import { useRouter } from "next/router";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger)

function handler() {

    const [user, setuser] = useState({} as User)
    const router = useRouter()
    const block1 = useRef(null)
    const block2 = useRef(null)
    const block3 = useRef(null)
    const block4 = useRef(null)
    const block5 = useRef(null)
    const block6 = useRef(null)
    const blockImg = useRef(null)
    const blockFooter1 = useRef(null)
    const blockFooter2 = useRef(null)


    useEffect(() => {
        if (typeof window.ethereum !== 'undefined') {
            window.ethereum.on('usersChanged', function (acounts: any) {
                findUser(acounts[0])
            });
        }
    })

    const findUser = async (wallet: string) => {
        await axios.post(`http://localhost:3001/api/findUser`, { wallet }).then(async (response: AxiosResponse) => {
            if (response.status == 200)
                setuser(await response.data as User)
        }).catch(async (response: AxiosResponse) => {
        })
    }

    useEffect(() => {
        const t = (el: any, delay?: number, duration?: number, px?: string, start?: string) => {
            gsap.fromTo(el, {
                y: '+=40',
            }, {
                scrollTrigger: {
                    trigger: el,
                    start: start == undefined ? 'top 90%' : start
                },
                y: '0',
                duration: duration == undefined ? 0.6 : duration,
                opacity: 1,
                delay: delay == undefined ? 0.1 : delay
            })
        }
        t(block1.current, 1)
        t(block2.current, 1.2)
        t(block3.current, 0.4)
        t(block4.current, 0.75)
        t(block5.current, 0.8)
        t(block6.current, 0.8)
        t(blockImg.current, 0.8)
        t(blockFooter1.current, 0.6, undefined, undefined, 'top bottom')
        t(blockFooter2.current, 0.6, undefined, undefined, 'top bottom')
    }, [])

    return (
        <div>
            <div className="change-background">
                <div className="wrap">
                    <header className="header change-background">
                        <div className="header__container">
                            <a href="/" className="logo" aria-label="logo"><img src="/ref/frogsfi.svg" alt="Frogs" /></a>
                        </div>
                    </header>
                    <main className="main">
                        <div className="section" >
                            <div className="bg-lines" style={{ zIndex: '0' }}>
                                <div className="bg-lines__wrap">
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"><img className="decor do-anim appear-slideInUp forAnimation" ref={block1} src="/ref/figure2.svg"
                                        loading="lazy" alt="" style={{ width: "67px", top: '50%' }} /></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"><img className="decor do-anim appear-slideInUp forAnimation" ref={block2} src="/ref/figure1.svg"
                                        loading="lazy" alt="" style={{ width: "29px", top: '10%' }} /></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                </div>
                            </div>
                            <div className="container" style={{ zIndex: 100 }}>
                                <h1 className="do-anim appear-slideInUp forAnimation" ref={block4}><span
                                    className="highlight">OOPS</span>! You used the wrong referral link</h1>
                                <div style={{ display: " flex", justifyContent: "center" }}>
                                    <img src="/ref/alert.png" style={{ maxWidth: "256px", marginTop: '0px', zIndex: '10000' }} />
                                </div>
                                <div className="section-actions do-anim appear-slideInUp forAnimation" ref={block3} style={{ marginTop: '50px' }} id="invite-more">
                                    <h3>To get the real link we recommend you to join <br /> Frogs Community and ask a valid link</h3>
                                    <a href="https://t.me/frogsfi" className="button button--big" style={{ marginRight: 'auto', marginLeft: 'auto', maxWidth: '560px' }}>Join Community</a>
                                </div>
                            </div>
                        </div>
                    </main>
                    <footer className="footer" style={{ paddingBottom: '80px' }}>
                        <div className="container">
                            <div className="footer__top  do-anim appear-slideInUp forAnimation" ref={blockFooter1}>
                                <div className="footer__col-brand">
                                    <a href="https://frogs.fi" className="logo footer__logo"><img src="/ref/frogsfi.svg" alt="Frogs" /></a>
                                    <p>Gain your dep with no loss risks</p>
                                </div>
                                <div className="footer__col">
                                    <div className="footer-menu-heading">SUPPORT</div>
                                    <ul className="footer-menu">
                                        <li>
                                            <a href="/">About</a>
                                        </li>
                                        <li>
                                            <a href="#">Request a pool</a>
                                        </li>
                                        <li>
                                            <a href="https://discord.gg/sVY7RZ6eeJ" target="_blank">Join Discord</a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="footer__col">
                                    <div className="footer-menu-heading">PRODUCT</div>
                                    <ul className="footer-menu">
                                        <li>
                                            <a href="#draw">Make a Draw</a>
                                        </li>
                                        <li>
                                            <a href="#how">How2Play</a>
                                        </li>
                                        <li>
                                            <a href="#faq">FAQ</a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="footer__col">
                                    <div className="footer-menu-heading">TECH</div>
                                    <ul className="footer-menu">
                                        <li>
                                            <a href="">Github</a>
                                        </li>
                                        <li>
                                            <a href="">Audits</a>
                                        </li>
                                        <li>
                                            <a href="https://good-crayon-448.notion.site/docs-x-FROGS-72957ea111024e6b89d8bcb8cdee33e4"
                                                target="_blank">Docs</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="footer-line"></div>
                            <div className="footer__bottom do-anim appear-slideInUp forAnimation" ref={blockFooter2}>
                                <div className="text-sm text-center">&copy; {`2023 FrogsFi > with 💚 from the swamp`}</div>
                                <div className="footer__social">
                                    <a href="https://t.me/frogsfi" target="_blank" className="circle"><svg viewBox="0 0 32 32" fill="none"
                                        className="icon rect-125">
                                        <path fill="currentColor"
                                            d="M29.919 6.163l-4.225 19.925c-0.319 1.406-1.15 1.756-2.331 1.094l-6.438-4.744-3.106 2.988c-0.344 0.344-0.631 0.631-1.294 0.631l0.463-6.556 11.931-10.781c0.519-0.462-0.113-0.719-0.806-0.256l-14.75 9.288-6.35-1.988c-1.381-0.431-1.406-1.381 0.288-2.044l24.837-9.569c1.15-0.431 2.156 0.256 1.781 2.013z">
                                        </path>
                                    </svg></a>
                                    <a href="https://twitter.com/FrogsFi" target="_blank" className="circle"><svg viewBox="0 0 24 24" fill="none"
                                        className="icon rect-150">
                                        <path
                                            d="M20.4683 6.71333C19.8321 6.99474 19.1574 7.17956 18.4666 7.26167C19.1947 6.82619 19.7397 6.14084 19.9999 5.33333C19.3166 5.74 18.5674 6.025 17.7866 6.17917C17.2621 5.61798 16.5669 5.2458 15.809 5.12049C15.0512 4.99517 14.2732 5.12374 13.596 5.48621C12.9187 5.84868 12.3802 6.42474 12.0642 7.12483C11.7481 7.82492 11.6722 8.60982 11.8483 9.3575C10.4625 9.28804 9.10686 8.92794 7.86933 8.30055C6.63179 7.67317 5.54003 6.79254 4.66492 5.71583C4.35516 6.24788 4.19238 6.85269 4.19326 7.46833C4.19326 8.67667 4.80826 9.74417 5.74326 10.3692C5.18993 10.3517 4.64878 10.2023 4.16492 9.93333V9.97667C4.16509 10.7814 4.44356 11.5613 4.95313 12.1842C5.46269 12.8071 6.17199 13.2346 6.96075 13.3942C6.4471 13.5334 5.90851 13.5539 5.38576 13.4542C5.60814 14.1469 6.04159 14.7527 6.62541 15.1868C7.20924 15.6208 7.9142 15.8615 8.64159 15.875C7.91866 16.4428 7.0909 16.8625 6.20566 17.1101C5.32041 17.3578 4.39503 17.4285 3.48242 17.3183C5.0755 18.3429 6.93 18.8868 8.82409 18.885C15.2349 18.885 18.7408 13.5742 18.7408 8.96833C18.7408 8.81833 18.7366 8.66667 18.7299 8.51833C19.4123 8.02514 20.0013 7.41418 20.4691 6.71417L20.4683 6.71333Z"
                                            fill="currentColor"></path>
                                    </svg></a>
                                </div>
                            </div>
                        </div>
                    </footer>
                </div>

            </div >
        </div >
    )
}



export default handler
