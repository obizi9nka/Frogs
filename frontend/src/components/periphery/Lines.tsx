export function Lines({ isFrogs }: any) {
    return (
        <div className="background-wrapper">
            <div className="background-line-wrapper">
                <div className="line"></div>
                {isFrogs ?
                    <div className="line-wrapper">
                        <img src="/img/figure1.svg" loading="lazy" alt="" className="accent-6" />
                        <div className="line"></div>
                    </div> :
                    <div className="line"></div>

                }
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
                {isFrogs ?
                    <div className="line-wrapper">
                        <img src="/img/figure2.svg" loading="lazy" alt="" className="accent-5" />
                        <div className="line"></div>
                    </div> :
                    <div className="line"></div>
                }
                <div className="line"></div>
            </div>
        </div>
    )
}