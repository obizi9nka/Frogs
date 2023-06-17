import { ConnectButton as cb } from '@rainbow-me/rainbowkit';
export function ConnectWallet({ lotteryData }: DepositStuct) {
    return (
        <div className="container-regular">
            <div data-w-id="6f369299-dc14-2f93-d3cc-2248b1553a1c" className="collection-list-wrapper w-dyn-list">
                <div role="list">
                    <div id="w-node-_6f369299-dc14-2f93-d3cc-2248b1553a1e-b1553a16" role="listitem" className="w-dyn-item">
                        <div className="course-card" style={{ backgroundColor: "#effaea" }}>
                            <div className="course-card-text-wrapper">
                                <div style={{ marginBottom: "30px" }}>
                                    <b>STEP 1 OF 2</b> Connect wallet<br />
                                    <span style={{ color: "rgba(5, 5, 5, 0.5)" }}><b>NEXT STEP</b> → Add liquidity</span>
                                </div>
                                <hr style={{ marginBottom: "30px" }} />
                                <p style={{ display: "flex", justifyContent: "space-between" }}><span>Participants</span> <b>{lotteryData.participants ? lotteryData.participants.toString() : '???'}</b></p>
                                <p style={{ display: "flex", justifyContent: "space-between" }}><span>Your balance</span> <b>Not connected</b></p>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", justifyContent: "start" }}>
                                        <p >Potential win</p>
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                            <div className="tooltip" >
                                                <img src="/icons/alert-circle-outline.svg" className="info-potwin" width={18} height={18} ></img>
                                                <div className="tooltip-text">
                                                    <div style={{ margin: '-3px 0px' }}> The potential prize consists of the profit <br /></div>
                                                    <div style={{ margin: '-3px 0px' }}> from the weekly APR pool and a prize from <br /></div>
                                                    <div style={{ margin: '-3px 0px' }}> the FrogFi team </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p>
                                        <b>$???</b>
                                    </p>
                                </div>

                                <div className="course-card-bottom-row">
                                    <cb.Custom>
                                        {({ openConnectModal }) =>
                                            <button onClick={openConnectModal} className="button-primary w-button fro-fro" style={{ width: "100%" }}>Connect Wallet</button>
                                        }
                                    </cb.Custom>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}