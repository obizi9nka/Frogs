import axios, { AxiosResponse } from "axios"
import { useEffect, useRef, useState } from "react";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { useRouter } from "next/router";
import Web3 from "web3";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { useAccount, useDisconnect } from "wagmi";

gsap.registerPlugin(ScrollTrigger)
declare global {
    interface Window {
        ethereum?: MetaMaskInpageProvider
    }
}
export default function handler() {
    const [user, setuser] = useState({} as any)
    const [domen, setDomen] = useState('')
    const router = useRouter()
    const blockFrog2 = useRef(null)
    const blockFrog1 = useRef(null)
    const blockCongrats = useRef(null)
    const blockLogo = useRef(null)
    const blockWhyAnswer1 = useRef(null)
    const blockWhyAnswer2 = useRef(null)
    const blockFooter1 = useRef(null)
    const blockFooter2 = useRef(null)
    const blockBox = useRef(null)
    const blockRefLink = useRef(null)
    const blockWhy = useRef(null)
    const block5wallets = useRef(null)
    const block10wallets = useRef(null)
    const block20wallets = useRef(null)

    useEffect(() => {
        if (typeof window?.ethereum !== 'undefined' && window?.ethereum.isMetaMask == true) {
            const web3 = new Web3(window.ethereum as any)
            web3.eth.getAccounts().then(async accounts => {
                if (accounts[0] == undefined)
                    router.push('/wrong')
                await findUser(accounts[0])
                setURL(accounts[0])
            })
            window.ethereum.on('accountsChanged', async (accounts: any) => {
                await findUser(accounts[0])
                setURL(accounts[0])
            });
        }
    }, [])

    const setURL = (wallet: string | undefined) => {
        const domen = typeof window != 'undefined' ? window.location.toString().split('/ref')[0] : ''
        if (wallet)
            setDomen(domen)
        else
            setDomen('your referal link')
    }

    const findUser = async (wallet: string) => {
        await axios.post(`/api/findUserWithReferals`, { wallet }).then(async (response: AxiosResponse) => {
            if (response.status == 200) {
                const _user = await response.data
                setuser(_user)
                setURL(_user.wallet)
            }
        }).catch((error) => {
            router.push('/wrong')
        })
    }

    const connectWallet = async () => {
        if (typeof window?.ethereum !== 'undefined' && window?.ethereum.isMetaMask == true) {
            const web3 = new Web3(window.ethereum as any)
            var accounts = await web3.eth.requestAccounts()
            await findUser(accounts[0].toLowerCase())
        }
    }

    const disconnectWallet = async () => {
        router.push('/wrong')
    }

    const { disconnect } = useDisconnect()
    useAccount({ onDisconnect: disconnectWallet })



    const copyToClipboard = () => {
        if (user.wallet)
            navigator.clipboard.writeText(domen + `/invite/${user.wallet ? user.wallet : ''}`);
    };

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
        t(blockFrog2.current, 1)
        t(blockFrog1.current, 1.2)
        t(blockCongrats.current, 0.7)
        t(blockLogo.current, 0, 0)
        t(blockRefLink.current, 0.4, undefined, '-5px')
        t(blockWhy.current)
        t(blockWhyAnswer1.current, 0.45, undefined, '-15px')
        t(blockWhyAnswer2.current, 0.6, undefined, '-15px')
        t(blockBox.current)
        t(block5wallets.current, 0.3)
        t(block10wallets.current, 0.45)
        t(block20wallets.current, 0.6)
        t(blockFooter1.current, 0.2, undefined, '-15px', 'top bottom')
        t(blockFooter2.current, 0.2, undefined, '-15px', 'top bottom')
    }, [])


    return (
        <div>
            <div className="change-background">
                <div className="wrap" style={{ overflow: 'hidden' }}>
                    <header className="header change-background">
                        <div className="header__container">
                            <a href="/" className="logo" aria-label="logo"><img src="/ref/frogsfi.svg" alt="Frogs" /></a>
                            <nav className="nav-main header__nav">
                                <ul>
                                    <li className="nav-main__item invited">
                                        <a href="#invite-more">
                                            <b>{user.invited ? user.invited : 0}</b> friends invited</a>
                                    </li>
                                </ul>
                            </nav>
                            {user.wallet == null ?
                                <button className="header__button" onClick={connectWallet}>Connect Wallet</button> : <div>
                                    <span style={{ margin: "0px 15px 0px 10px" }}>{'0x' + (user.wallet.slice(2, 9) + '...' + user.wallet.slice(35, 42)).toLowerCase()}</span>
                                    <button className="header__button" onClick={() => disconnect()}>Disconnect</button>
                                </div>
                            }
                        </div>
                    </header>
                    <main className="main">
                        <div className="section">
                            <div className="bg-lines">
                                <div className="bg-lines__wrap">
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"><img className="decor do-anim appear-slideInUp forAnimation" ref={blockFrog2} src="/ref/figure2.svg"
                                        loading="lazy" alt="" style={{ width: '67px', top: "50%" }} /></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"><img className="decor do-anim appear-slideInUp forAnimation" ref={blockFrog1} src="/ref/figure1.svg"
                                        loading="lazy" alt="" style={{ width: "29px", top: "10%" }} /></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                </div>
                            </div>
                            <div className="container" >
                                <h1 className="do-anim appear-slideInUp forAnimation" ref={blockCongrats}>Congrats <span
                                    className="highlight">FRO</span>! You got 100 XP<br />for connecting your wallet</h1>
                                <div className=" forAnimation" ref={blockLogo} style={{ display: 'flex', justifyContent: 'center' }}>
                                    <a href="#" id="logo" ></a>
                                    <img src="/ref/frog-image-new.png" style={{ maxWidth: '256px', zIndex: '100' }} />
                                </div>
                                <div style={{ marginTop: "50px;" }} className="section-actions do-anim appear-slideInUp forAnimation NowYouInvited" ref={blockRefLink} id="invite-more">
                                    <h3 >Now you invited <span
                                        className="highlight" >{user.invited ? user.invited : 0} friends</span>. Invite more  using<br /> your referral link below</h3>
                                    <div className="ref-code paragraph-large" style={{ display: "grid", gridTemplateColumns: '12fr 1fr' }}>
                                        <a href="#" id="invite-link" style={{ textDecorationStyle: 'dotted', appearance: 'none', fontWeight: 'normal' }}>{`${user.wallet ? domen + `/invite/0x...${user.wallet.slice(37.42)}` : 'Connect wallet to get your refferal link'}`}</a>
                                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", userSelect: 'none', maxHeight: '40px', maxWidth: "40px", minHeight: '40px', minWidth: "40px" }} onClick={copyToClipboard}>
                                            <img src="/ref/copy.png" width={40} height={40} />
                                        </div>
                                    </div>
                                    <p className="left-finger animate__pulse">👆👆👆</p>
                                </div>
                            </div>
                        </div>
                        <div className="section section--small">
                            <div className="bg-lines">
                                <div className="bg-lines__wrap">
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"><img className="decor" src="/ref/figure1.svg" loading="lazy" alt=""
                                        style={{ width: "29px", top: "38%" }} /></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"><img className="decor" src="/ref/figure2.svg" loading="lazy" alt=""
                                        style={{ width: "67px", top: "65%" }} /></div>
                                </div>
                            </div>
                            <div className="container">
                                <h2 className="h1 do-anim appear-slideInUp forAnimation" ref={blockWhy} >Why invite?</h2>
                                <div className="feature-set">
                                    <div className="feature do-anim appear-slideInUp forAnimation" ref={blockWhyAnswer1}>
                                        <div className="feature__icon">🎁</div>
                                        <div className="feature__text">
                                            <b  >Get XP on Zealy (Crew3)</b>.
                                            Make all of your friends connect their wallets to get more XP which will be converted in $FROGS tokens <br /> in the future
                                        </div>
                                    </div>
                                    <div className="feature do-anim appear-slideInUp forAnimation" ref={blockWhyAnswer2}>
                                        <div className="feature__icon">💸</div>
                                        <div className="feature__text">
                                            <b >Get higher referral %</b>.
                                            Invite now to get 5% of the prizes from everyone who connected with your referral link – try to invite real Pancake whales and increase your chances to earn more</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="section section--small">
                            <div className="bg-lines">
                                <div className="bg-lines__wrap">
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"><img className="decor" src="/ref/figure1.svg" loading="lazy" alt=""
                                        style={{ width: "29px", top: "38%" }} /></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"><img className="decor" src="/ref/figure2.svg" loading="lazy" alt=""
                                        style={{ width: "67px", top: "65%" }} /></div>
                                </div>
                            </div>
                            <div className="container">
                                <div className="feature-set">
                                    <div className="feature do-anim appear-slideInUp forAnimation" ref={block5wallets}>
                                        <h1 className="do-anim appear-slideInUp" style={{ marginBottom: '0px' }}><span
                                            className="highlight highlight-1">500 XP</span></h1>
                                        <div className="feature__text">5 wallets</div>
                                    </div>
                                    <div className="feature do-anim appear-slideInUp forAnimation" ref={block10wallets}>
                                        <h1 className="do-anim appear-slideInUp" style={{ marginBottom: '0px' }}><span
                                            className="highlight highlight-2">1k XP</span></h1>
                                        <div className="feature__text">10 wallets</div>
                                    </div>
                                    <div className="feature do-anim appear-slideInUp forAnimation" ref={block20wallets}>
                                        <h1 className="do-anim appear-slideInUp" style={{ marginBottom: '0px' }}><span
                                            className="highlight highlight-3">2k XP</span></h1>
                                        <div className="feature__text">20 wallets</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className="section section--small" >
                            <div className="bg-lines">
                                <div className="bg-lines__wrap">
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"><img className="decor" src="/ref/figure1.svg" loading="lazy" alt=""
                                        style={{ width: "29px", top: "38%" }} /></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line"></div>
                                    <div className="bg-lines__line">
                                        {/* <img className="decor" src="/ref/figure2.svg" loading="lazy" alt="" style={{ width: "67px", top: "65%" }} /> */}
                                    </div>
                                </div>
                            </div>
                            <div className="container">
                                <div className="box do-anim appear-slideInUp forAnimation" ref={blockBox}>
                                    <h2 className="h1" >Airdrop Campaign 1.0<br />can stop at anytime</h2>
                                    <div className="join-list block-center">
                                        maybe 5 days 4 hours 3 mins LEFT
                                    </div>
                                    <div className="section-actions" style={{ display: 'flex', justifyContent: 'center' }}>
                                        <div className="button button--big take-part1" onClick={() => {
                                            const inviteLink = document.querySelector('#logo') as any
                                            inviteLink.scrollIntoView({ behavior: 'smooth' });
                                        }}>Start Inviting</div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </main>
                    <footer className="footer" style={{ padding: '80px 0px 80px 0px ' }}>
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
                </div >
            </div >
        </div >
    )
}



