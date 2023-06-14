import { MyConnectButton } from "./periphery/ConnectButton";

export function Header() {
    return (
        <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="navigation w-nav change-background change-background-1">
            <div className="container-navigation">
                <a href="/" aria-current="page" className="logo w-nav-brand w--current">
                    <img src="/img/frogsfi-pixel.svg" loading="lazy" alt="" />
                </a>
                <nav role="navigation" className="nav-menu w-nav-menu change-background change-background-1">
                    <div className="nav-link-wrapper">
                    </div>
                </nav>
                <div className="menu-button-wrapper">
                    <MyConnectButton />
                </div>
            </div>
        </div>
    )
}