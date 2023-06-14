import { Lines } from "./periphery/Lines";

export function Referal() {
    return (
        <div className="section-regular" id="ref">
            <Lines />

            <div className="container-x-small">
                <div data-w-id="362479a4-ad8f-68b0-447f-d46739d7ca12" className="title-wrapper-center">
                    <h2 className="h2-heading pixel-font">Invite</h2>
                </div>
                <div className="section-actions do-anim appear-slideInUp is-animated" id="invite-more">
                    <h3>Now you invited <span className="highlight">7 friends</span>. Invite more using your referral link below</h3>
                    <div className="ref-code paragraph-large" style={{ display: 'inline-flex' }}><a href="#" id="invite-link" className="invite-link" style={{ textDecorationStyle: 'dotted', marginTop: 'auto', marginBottom: 'auto' }}>https://frogs.fi/invite/5XTLM</a>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", userSelect: 'none', marginLeft: '10px' }} onClick={() => 'copyToClipboard'}>
                            <img src="/img/copy.png" width={40} height={40} />
                        </div>
                    </div>
                    <p className="left-finger animate__animated animate__pulse animate__infinite"><img src="/img/finger.svg" style={{ height: "45px", marginRight: "10px" }} /><img src="/img/finger.svg" style={{ height: "45px" }} /><img src="/img/finger.svg" style={{ height: "45px", marginLeft: "10px" }} /></p>
                    <div>
                        <button className="button-primary w-button fro-fro-disabled" style={{ marginBottom: "15px", marginLeft: 'auto', marginRight: 'auto', padding: "0px 60px" }}>Claim $0</button>
                        <i>None of your friends won in the draw</i>
                    </div>
                    <div>
                        <button className="button-primary w-button fro-fro" style={{ marginBottom: "15px", width: "100%" }}>Claim $157</button>
                        <i>Claim your referral prize of $157</i>
                    </div>
                </div>
            </div>
        </div>
    )
}