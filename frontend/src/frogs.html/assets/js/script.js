    WebFont.load({
            google: {
                families: ["Archivo:100,200,300,regular,500,600,700,800,900", "Inter:100,200,300,regular,500,600,700,800,900"]
            }
        });
    !function(o, c) {
            var n = c.documentElement,
                t = " w-mod-";
            n.className += t + "js",
            ("ontouchstart" in o || o.DocumentTouch && c instanceof DocumentTouch) && (n.className += t + "touch")
        }(window, document);

    const container = document.querySelector('.fireworks');
            const fireworks = new Fireworks.default(container);
    
            const Toast = Swal.mixin({
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                }
            })
    
            $(".error-occured").on("click",function() {
                Toast.fire({
                    icon: 'error',
                    title: 'Something went wrong'
                })
            });
    
            function TurnFireworksOff() {
                fireworks.stop(); 
            }
    
            // $(".invite-popup").on("click",function() {
            //     Swal.fire({
            //         title: 'Step 2 of 5. Join Frogs by entering your referral link or code',
            //         text: 'Similar to Clubhouse, Frogs is invite-only; It means no one can join our service without an invitation (invite-link or code) from a registered frogger; P.S. you will get your code when registered',
            //         icon: 'info',
            //         confirmButtonText: 'JOIN FROGS'
            //     })
            // });
    
            $(".confirmation-popup").on("click",function() {
                Swal.fire({
                    html: '<div id="w-node-_6f369299-dc14-2f93-d3cc-2248b1553a1e-b1553a16" role="listitem" class="w-dyn-item">'+
                        '<div class="course-card" style="background-color: #fefbe7 !important; border-radius: 5px !important; box-shadow: none !important;">'+
                            '<div class="course-card-text-wrapper">'+
                                '<div class="margin-bottom-12" style="display: flex; align-items: center;">'+
                                   '<h5 style="margin-bottom: 0px !important;">By adding $50 to the Draw</h5>'+
                                '</div>'+
                                '<div style="margin-bottom: 30px;">'+
                                    '<b>STEP 5 OF 5</b> final confirmation<br>'+
                                '</div>'+
                                '<hr style="margin-bottom: 30px;">'+
                                '<div style="margin-bottom: 30px;">'+
                                    '<b>YOU GIVE</b>'+
                                    '<div style="margin-top: 7px;">'+
                                        '<span style="color: rgba(5, 5, 5, 0.5)"><b>🍪 CAKE</b> 7.2</span><br>'+
                                        '<span style="color: rgba(5, 5, 5, 0.5)"><b>🔶 BNB</b> 0.004</span>'+
                                    '</div>'+
                                '</div>'+
                                '<b>YOU SEND TO THE DRAW</b><br>'+
                                '<div style="margin-top: 10px; padding-top: 20px; padding-bottom: 20px; padding-left: 20px; padding-right: 20px; width: 100%; background-color: #fbee9d; border-radius: 10px;">'+
                                    '<span style="display: flex; justify-content: center; align-items: center;"><b>🍪 🔶 CAKE-BNB LP 0.0015</b>&nbsp;<ion-icon name="information-circle-outline" class="info-lp"></ion-icon></span>'+
                                '</div>'+
                                '<div class="desc" style="margin-top: 30px;">'+
                                    '<div>'+
                                        '<b>WHEN IN THE DRAW</b><br>'+
                                        'your assets will be added to the Draw on 22/04/2023 at 2:00 PM UTC'+
                                    '</div>'+
                                    '<div style="margin-top: 20px;">'+
                                        '<b>HOW TO REMOVE</b><br>'+
                                        '<span>you can request to remove liquidity at anytime, your assets will be returned in a week or less&nbsp;<ion-icon name="information-circle-outline" class="info-remove"></ion-icon></span>'+
                                    '</div>'+
                                '</div>'+
                                '<div class="course-card-bottom-row">'+
                                    '<button class="button-primary w-button swal2-confirm" style="width: 100%;">Confirm</button>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>',
                    showConfirmButton: false,
                    customClass: {
                        htmlContainer: 'confirm-container-html',
                        popup: 'confirm-container'
                    }
                })
            });
    
            $(".lucky-button").on("click",function() {
                $(".lucky-button").html('Checking..');
                setTimeout(
                    function() {
                        $('.winner-or-not-lucky').addClass('d-none');
                        $('.lucky').removeClass('d-none');
                        fireworks.start();
                        setTimeout(TurnFireworksOff, 10000);
                        $(".lucky-button").html('🏆 Claim your Prize 🏆').addClass('congrats-popup').removeClass('lucky-button');
                        
                        $(".congrats-popup").on("click",function() {
                            Swal.fire({
                                title: 'Congratulations!',
                                text: 'Share your result and increase a chance to win!',
                                imageUrl: 'assets/share-image.png',
                                icon: 'success',
                                confirmButtonText: 'Share'
                            })
                        });
                }, 1000);
            });
    
            $(".no-code").on("click",function() {
                $(".no-code-text").html('If you have no invite code or link please <a href="https://t.me/FrogsFi" target="_blank">join our community in Telegram</a> and ask our froggers to share the invite with you :)');
            });
    
            $(".unlucky-button").on("click",function() {
                $(".unlucky-button").html('Checking..');
                setTimeout(
                    function() {
                        $('.winner-or-not-unlucky').addClass('d-none');
                        $('.unlucky').removeClass('d-none');
                        $(".unlucky-button").html('Go to the current Draw');
                }, 1000);
            });
    
            tippy('.info-chance', {
                content: "Prize is distributed randomly and transparently among small % of participants by Frogs Smart Contract; your chance to win depends on the number of participants and winners in the draw; at the moment it's 1/129 (or ~0.77%)",
            });
    
            tippy('.info-potwin', {
                content: "According to the latest rounds, your potential win is x2 (for example, if you added $200 you could win +$200 –> it means you would doubled your deposit in just one week ($400 = x2 from your initial dep)",
            });
    
            tippy('.info-remove', {
                content: "Your CAKE-BNB LP will be converted to CAKE and BNB tokens and sent back to your wallet (the resulting balance may differ from the initial due to impermanent losses)",
            });
    
            tippy('.info-dep1', {
                content: "You have recently deposited 0.0006 CAKE-BNB LP to the Draw that is currently equal to 4 CAKE and 0.04 BNB (or $30); your assets will be added to the Draw on Monday 2:00 PM UTC",
            });
    
            tippy('.info-dep2', {
                content: "You have recently withdrawed 0.0009 CAKE-BNB LP to the Draw that is currently equal to 6 CAKE and 0.06 BNB (or $45); your assets will be returned to your wallet on Monday before 3:00 PM UTC",
            });
    
            tippy('.info-dep3', {
                content: "You currently have 0.5 CAKE-BNB LP staked in the Draw that is now equal to 13 CAKE and 0.13 BNB or $223",
            });
    
            tippy('.info-lp', {
                content: 'When you confirm transaction on MetaMask your assets (CAKE and BNB) are sent to Frogs Smart Contract and then automatically converted to CAKE-BNB LP that is a constant value and cannot be changed during the farming <a href="https://academy.binance.com/en/articles/impermanent-loss-explained" target="_blank">Learn more →</a>',
                allowHTML: true,
                interactive: 'true'
            });
    
            tippy('.dd-menu', {
                theme: 'light',
                content: '<div style="padding: 13px;"><a href="#" class="add-liq">Add Liquidity 😋</a><br><br><a class="remove-liq" href="#">Remove Liquidity 😳</a></div>',
                allowHTML: true,
                placement: 'bottom',
                trigger: 'click',
                interactive: 'true'
            });