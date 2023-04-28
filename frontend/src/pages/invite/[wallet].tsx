import axios, { AxiosResponse, ResponseType } from "axios"
import { createUserDto, findUserDto } from "../api/dto"
import { User } from "@prisma/client";
import { useEffect, useRef, useState } from "react";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { useMetamask } from "use-metamask";
import { NextApiResponse } from "next";
import { Router, useRouter } from "next/router";
import Web3 from "web3";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger)
declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider
    }
}

export const getServerSideProps = async (context: any) => {
    const { wallet } = context.params
    let referer;
    await axios.post(`http://localhost:3000/api/findUser`, { wallet }).then(async (response: AxiosResponse) => {
        if (response.status == 200)
            referer = await response.data as User
    }).catch(async (response: AxiosResponse) => {
        referer = null
    })
    return {
        props: {
            referer,
        }
    }
}
function handler({ referer }: any) {

    const [account, setAccount] = useState('')
    const router = useRouter()
    const block1 = useRef(null)
    const block2 = useRef(null)
    const block3 = useRef(null)
    const block4 = useRef(null)
    const block5 = useRef(null)
    const block6 = useRef(null)
    const blockFooter1 = useRef(null)
    const blockFooter2 = useRef(null)
    const block9 = useRef(null)
    const block10 = useRef(null)
    const blockGitHub = useRef(null)
    const blockGitBook = useRef(null)
    const blockTg = useRef(null)
    const blockTw = useRef(null)



    useEffect(() => {
        if (referer == null) {
            if (typeof window !== 'undefined') {
                router.push('/wrong')
            }
        }
    }, [])

    useEffect(() => {
        if (typeof window?.ethereum !== 'undefined' && window?.ethereum.isMetaMask == true) {
            const web3 = new Web3(window.ethereum as any)
            web3.eth.getAccounts().then(async accounts => {
                if (typeof accounts[0] == 'string')
                    await createUser(accounts[0])
            })
            window.ethereum.on('accountsChanged', async (accounts: any) => {
                if (accounts[0] == undefined)
                    setAccount('')
                else
                    setAccount(accounts[0])

            });
        }
    }, [])

    const createUser = async (wallet: string) => {
        const userData = {
            wallet,
            refererWallet: referer?.wallet,
            sig: ""
        } as createUserDto
        await axios.post('/api/createUser', userData).then(async (data: AxiosResponse) => {
            if (data.status == 200) {
                router.push('/ref')
            }
        }).catch((data) => {
            console.log(data)
        })
    }

    const connectWallet = async () => {
        console.log(referer)
        if (typeof window?.ethereum !== 'undefined' && window?.ethereum.isMetaMask == true) {
            const web3 = new Web3(window.ethereum as any)
            var accounts = await web3.eth.requestAccounts()
            try {
                createUser(accounts[0])
            } catch (error) {
                console.log(error)
            }
            setAccount(accounts[0])
        }
        else {
            alert('Install MetaMask')
        }
    }

    const disconnectWallet = async () => {
        setAccount('')
    }

    useEffect(() => {
        const t = (el: any, duration?: number, px?: string, start?: string) => {
            gsap.to(el, {
                scrollTrigger: {
                    trigger: el,
                    start: start == undefined ? 'top center' : start
                },
                marginTop: 0,
                duration: duration == undefined ? 0.6 : duration,
                opacity: 1,
                transform: `translateY(${px == undefined ? '-40px' : px})`
            })
        }
        t(block1.current, 0.47)
        t(block2.current, 0.4)
        t(block3.current)
        t(block4.current)
        t(block5.current)
        t(block6.current)
        t(blockFooter1.current, 0.6, '-15px', 'top bottom')
        t(blockFooter2.current, 0.6, '-15px', 'top bottom')
        t(block9.current)
        t(block10.current)
        t(blockGitHub.current, 0.3)
        t(blockGitBook.current, 0.5)
        t(blockTg.current, 0.7)
        t(blockTw.current, 0.9)
    }, [])


    return (
        <div>
            <div className="wrap">

                <header className="header">
                    <div className="header__container">
                        <a href="/" className="logo" aria-label="logo">
                            <img src="/ref/frogsfi.svg" alt="Frogs" />
                        </a>
                        <div>
                            {account == '' ?
                                <button className="header__button" onClick={connectWallet}>Connect Wallet</button> : <>
                                    <span style={{ margin: "0px 6px 0px 10px" }}>{'0x' + (account.slice(2, 9) + '...' + account.slice(35, 42)).toUpperCase()}</span>
                                    <button className="header__button" onClick={disconnectWallet}>Disconnect</button>
                                </>
                            }
                        </div>
                    </div>
                </header>
                <main className="main">
                    <div className="wow section bounceInUp" >
                        <div className="bg-lines">
                            <div className="bg-lines__wrap">
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line">
                                    <img className="decor do-anim appear-slideInUp" src="/ref/figure2.svg" loading="lazy" alt="" style={{ transitionDelay: "700ms;", width: "67px", top: "50%" }} />
                                </div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line">
                                    <img className="decor do-anim appear-slideInUp" src="/ref/figure1.svg" loading="lazy" alt="" style={{ transitionDelay: "900ms;", width: "29px", top: "10%" }} />
                                </div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                            </div>
                        </div>
                        <div className="container">
                            <h1 className="do-anim appear-slideInUp forAnimation" style={{ fontWeight: 'bold' }} ref={block1}>You're invited to<br /> FROGS <span
                                className="highlight">AIRDROP</span></h1>
                            <ul className="roadmap do-anim appear-slideInUp forAnimation" ref={block2}>
                                <li className="roadmap__item">
                                    <h4 style={{ fontWeight: 'bold' }}>Fundraising</h4>
                                    <p>(seed round from 3 venture firms)</p>
                                    <div className="roadmap__item-dot done"></div>
                                </li>
                                <li className="roadmap__item">
                                    <h4 style={{ fontWeight: 'bold' }}>Smart Contract deployed<br /> on Main Net</h4>
                                    <p>(Check <a href="">GitHub</a> & <a href="">Gitbook</a>)</p>
                                    <div className="roadmap__item-dot done"></div>
                                </li>
                                <li className="roadmap__item">
                                    <h4 style={{ fontWeight: 'bold' }}>Partnership with<br /> BNB Chain</h4>
                                    <div className="roadmap__item-dot done"></div>
                                </li>
                                <li className="roadmap__item">
                                    <h4 style={{ fontWeight: 'bold' }}>AIRDROP 1.0</h4>
                                    <p>(powered by <a href="">crew3</a>)</p>
                                    <div className="roadmap__item-dot active animate__heartBeat"></div>
                                </li>
                                <li className="roadmap__item">
                                    <h4 style={{ fontWeight: 'bold' }}>Beta Product is Live</h4>
                                    <div className="roadmap__item-dot"></div>
                                </li>
                                <li className="roadmap__item">
                                    <h4 style={{ fontWeight: 'bold' }}>$FROGS is listed</h4>
                                    <div className="roadmap__item-dot"></div>
                                </li>
                            </ul>
                            <div className="section-actions do-anim appear-slideInUp" style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                <div onClick={connectWallet} className="button button--big take-part1">TAKE PART</div>
                                <p>👆 <span className="counter">27</span> people just tapped the button 👆</p>
                            </div>
                        </div>
                    </div>
                    <div className="section section--small" >
                        <div className="bg-lines">
                            <div className="bg-lines__wrap">
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line">
                                    <img className="decor" src="/ref/figure1.svg" loading="lazy" alt="" style={{ width: "29px", top: "38%" }} />
                                </div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"><img className="decor" src="/ref/figure2.svg" loading="lazy" alt=""
                                    style={{ width: "67px;", top: "65%" }} /></div>
                            </div>
                        </div>
                        <div className="container">
                            <h2 className="h1 do-anim appear-slideInUp forAnimation" style={{ fontWeight: 'bold' }} ref={block9}>About FROGS.FI</h2>
                            <div className="feature-set">
                                <div className="feature do-anim appear-slideInUp forAnimation" ref={block3}>
                                    <div className="feature__icon"></div>
                                    <div className="feature__text">
                                        <b>Join the pool</b>.
                                        Users deposit their assets to the CAKE-BNB farming pool on Pancakeswap with Frogs Smart Contract
                                    </div>
                                </div>
                                <div className="feature do-anim appear-slideInUp forAnimation" ref={block4}>
                                    <div className="feature__icon"></div>
                                    <div className="feature__text">
                                        <b>Wait for the Draw</b>.
                                        Every week our contract harvests all the profits and randomly shares them with lucky winners
                                    </div>
                                </div>
                                <div className="feature do-anim appear-slideInUp forAnimation" ref={block5}>
                                    <div className="feature__icon"></div>
                                    <div className="feature__text">
                                        <b>Claim anytime</b>.
                                        You can withdraw the initial deposit and it will be back, as soon as the closest draw ends (no more than 7 days)
                                    </div>
                                </div>
                            </div>
                            <div className="services" >
                                <a href="" className="services__item color-github do-anim forAnimation" ref={blockGitHub}
                                >GitHub</a>
                                <a href="" className="services__item color-gitlook do-anim forAnimation" ref={blockGitBook}
                                >Gitbook</a>
                                <a href="" className="services__item color-telegram do-anim forAnimation" ref={blockTg}
                                >Telegram</a>
                                <a href="" className="services__item color-twitter do-anim forAnimation" ref={blockTw}
                                >Twitter</a>
                            </div>
                        </div>

                    </div>
                    <div className="section section--small">
                        <div className="bg-lines">
                            <div className="bg-lines__wrap">
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"><img className="decor" src="/ref/figure1.svg" loading="lazy" alt=""
                                    style={{ width: "29px", top: "38%" }} /></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                                <div className="bg-lines__line"></div>
                            </div>
                        </div>
                        <div className="container">
                            <div className="box do-anim appear-slideInUp forAnimation" ref={block6}>
                                <h2 className="h1">Details AIRDROP</h2>
                                <ul className="join-list block-center">
                                    <li className="first-bullet">Join Telegram</li>
                                    <li className="second-bullet">Join Twitter</li>
                                    <li className="third-bullet">Connect Wallet on Frogs.fi</li>
                                </ul>
                                <div className="section-actions">
                                    <div onClick={connectWallet} className="button button--big">Connect Wallet</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="footer">
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
                            <div className="text-sm text-center">&copy; ${'2023 FrogsFi > with 💚 from the swamp'}</div>
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
        </div>
    )
}



export default handler
