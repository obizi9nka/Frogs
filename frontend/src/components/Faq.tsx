import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Lines } from "./periphery/Lines";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { gsapPopUp } from "@/functions/utils"

gsap.registerPlugin(ScrollTrigger)
const data = [{
    question: "How it works?",
    answer: "When users join the Frogs Lottery, their assets are transferred to PancakeSwap via the Frogs Smart Contract. Once a week, the Smart Contract distributes the income generated from all users in the Pool amongst the winners (randomly selected wallets with deposits), who have the chance to win up to 10x their initial deposit. Users who don't win anything don't lose anything either and keep their initial deposit and can withdraw at any time."
},
{
    question: "Alright, how much will I get?",
    answer: "The amount of users and their deposits will determine the potential prize amount. Winners can receive up to 10x their initial deposit"
},
{
    question: "Can I lose my deposit?",
    answer: "In the event of a draw, your assets will remain safe in the Pool. Only the income generated is distributed, so you won't lose any of your assets"
},
{
    question: "When will it launch?",
    answer: "We're excited to announce that the launch is scheduled for Q2 2023! Be sure to follow us on our social networks to stay up-to-date on all the latest news and updates"
},
{
    question: "How can I boost my earnings?",
    answer: "If you invite your friends to join our project using your referral link, you can earn up to 3% of their prizes. It's important to note that the referral rewards are taken from FROGS profit. So, invite your friends and start earning rewards today!"
}]

type PropsInDrop = {
    data: typeof data[0],
    blockActive: faqRouter | undefined,
    setActive: Dispatch<SetStateAction<faqRouter | undefined>>,
    index: faqRouter
}
enum faqRouter {
    zero,
    one,
    two,
    three,
    four,
}

export function Faq() {

    const blockFaq = useRef(null)
    const blockAnswers = useRef(null)

    useEffect(() => {
        gsapPopUp(blockFaq.current, .4)
        gsapPopUp(blockAnswers.current, .8)
    }, [])

    const [blockActive, setBlockActive] = useState<faqRouter>()

    return (
        <div className="section-regular" id="faq">
            <div className="container-x-small">
                <div data-w-id="362479a4-ad8f-68b0-447f-d46739d7ca12" className="title-wrapper-center">
                    <h2 className="h2-heading pixel-font" ref={blockFaq}>FAQ</h2>
                </div>
                <div data-w-id="362479a4-ad8f-68b0-447f-d46739d7ca18" ref={blockAnswers} className="faq-wrapper">
                    <Drop data={data[0]} index={faqRouter.zero} blockActive={blockActive} setActive={setBlockActive} />
                    <Drop data={data[1]} index={faqRouter.one} blockActive={blockActive} setActive={setBlockActive} />
                    <Drop data={data[2]} index={faqRouter.two} blockActive={blockActive} setActive={setBlockActive} />
                    <Drop data={data[3]} index={faqRouter.three} blockActive={blockActive} setActive={setBlockActive} />
                    <Drop data={data[4]} index={faqRouter.four} blockActive={blockActive} setActive={setBlockActive} />
                </div>
            </div>
            <Lines isFrogs='true' />
        </div>
    )
}

function Drop({ data, blockActive, index, setActive }: PropsInDrop) {
    return (
        <div data-hover="false" data-delay="0" onClick={() => setActive(blockActive == index ? undefined : index)} className={`faq-item w-dropdown frog-drop-down ${blockActive == index ? 'active' : ''}`} >
            <div className="faq-item-toggle w-dropdown-toggle">
                <div className="faq-title-wrapper">
                    <div className="label-large">{data.question}</div>
                    <div className="faq-icon-wrapper">
                        {blockActive == index ? <div className="faq-minus w-embed" >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.65283 11.2363H17.3473V12.7641H6.65283V11.2363Z" fill="currentColor" />
                            </svg>
                        </div> :
                            <div className="faq-plus w-embed" >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 19.5C7.85775 19.5 4.5 16.1423 4.5 12C4.5 7.85775 7.85775 4.5 12 4.5C16.1423 4.5 19.5 7.85775 19.5 12C19.5 16.1423 16.1423 19.5 12 19.5ZM11.25 11.25H8.25V12.75H11.25V15.75H12.75V12.75H15.75V11.25H12.75V8.25H11.25V11.25Z" fill="currentColor" />
                                </svg>
                            </div>}
                    </div>
                </div>
            </div>
            <nav className={`faq-content w-dropdown-list ${blockActive == index ? (index == faqRouter.zero ? 'active253' : index == faqRouter.four ? 'active140' : 'active84') : ''}`} >
                <div className="faq-tab-content">
                    <p className="paragraph-regular">
                        {data.answer}
                    </p>
                </div>
            </nav>
        </div>
    )
} 