import '../../css/login-style.css'

import { escapeHtml } from "../escapeHtml.mjs";

//ドメインのテキストと、表示マップを取得
let getDomainText = ''
const parts = location.pathname.split('/');

for (let i = 1; i < parts.length; i++) {
    if (parts[i + 1] === 'login') {
        getDomainText = parts[i]
    }
}

console.log(getDomainText)

if (getDomainText === '') {
    window.location.href = '../notAccess'; // 通常の遷移
}

const getDomainResp = await fetch('../getDomain', {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ domain: getDomainText })
})

const getDomain = await getDomainResp.json();
console.log(getDomain)
if (!getDomain.success) {
    window.location.href = `../notAccess`
}
const errorMessage = document.getElementById('error_message')

$('#login-button').off('click').click(async () => {
    errorMessage.innerText = '';
    const name = document.getElementById('user_name');
    const passWord = document.getElementById('password');

    const body = {
        domain: getDomainText,
        id: name.value,
        pass: passWord.value
    }

    const loginResp = await window.fetch("../checkLogin", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    console.log(loginResp)
    const result = await loginResp.json();
    console.log(result)

    if (!result.success) {
        errorMessage.innerText = 'ログインIDまたはパスワードが違います。';
        errorMessage.style.color = 'red'
    } else {
        if (result.user.email !== '') {
            let setTime = 600, resubmitTime = 5
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let randomString = '';

            for (let i = 0; i < 6; i++) {
                randomString += chars.charAt(Math.floor(Math.random() * chars.length));
            }

            let message = `<html>
                        	<head>
                            	<meta charset="utf-8" />
                            </head>
                            <body><div>
                               <div>8Cloudsmap にログインするための認証コードは以下になります。</div>
                               <div style="margin: 10px 0;">
                                   <p style="font-size:20px;">${randomString}<p>
                               </div>
                               <div>このコードを認証画面に入力してください。</div>
                               <div>このコードは10分後無効になります。</div>
                           </div></body></html>`

            $('#certification').show();
            $('#login_form').hide();
            $('h2').text('二段階認証');

            await fetch('../mail', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: result.user.email, message: message, domain: getDomainText })
            })

            setInterval(() => {
                setTime--;
                resubmitTime--;
                if (resubmitTime >= 1) {
                    $('#resubmit').text(`${resubmitTime}秒後再送信可能`)
                } else {
                    $('#resubmit').text('メールを再送信').attr('disabled', false);
                }
            }, 1000);

            $('#certification_button').off('click').click(() => {
                if (setTime > 0) {
                    const pass = $('#certification_pass').val();

                    if (randomString === escapeHtml(pass)) {
                        const loginConfig = {
                            id: result.user.id,
                            userId: result.user.user_id,
                            userName: result.user.user_name,
                            authority: result.user.authority,
                            loginTime: Number(Date.now()),
                            showMaps: result.showMaps
                        }
                        localStorage.setItem('map_' + getDomainText, JSON.stringify(loginConfig));
                        window.location.href = `../${getDomainText}/`; // 通常の遷移
                    } else {
                        $('#pass_error_message').text('認証コードが違います。').css('color', 'red')
                        $('#certification_pass').val('')
                    }
                } else {
                    alert('60秒を超えたため認証コードが無効になりました。\nもう一度ログインを行ってください。')
                    window.location.reload();
                }
            })

            $('#resubmit').off('click').click(async () => {
                randomString = '';

                for (let i = 0; i < 6; i++) {
                    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
                }

                message = `<html><body><div>
                               <div>8Cloudsmap にログインするための認証コードを再送信しました。</div>
                               <div style="margin: 10px 0;">
                                   <p style="font-size:20px">${randomString}<p>
                               </div>
                               <div>このコードを認証画面に入力してください。</div>
                               <div>このコードは10分後無効になります。</div>
                           </div></body></html>`


                await fetch('../mail', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email: result.user.email, message: message, domain: getDomainText })
                })
                setTime = 600;
                resubmitTime = 10;
                $('#resubmit').text(resubmitTime).attr('disabled', true);
            })
        } else {
            // debugger
            const loginConfig = {
                id: result.user.id,
                userId: result.user.user_id,
                userName: result.user.user_name,
                authority: result.user.authority,
                loginTime: Number(Date.now()),
                showMaps: result.showMaps
            }
            localStorage.setItem('map_' + getDomainText, JSON.stringify(loginConfig));
            window.location.href = `../${getDomainText}/`; // 通常の遷移
        }
    }
})

$('#user_name').off('keydown').on('keydown', (e) => {
    if (e.key === 'Enter') {
        $('#login-button').click();
    }
})

$('#password').off('keydown').on('keydown', (e) => {
    if (e.key === 'Enter') {
        $('#login-button').click();
    }
})

$('#certification_pass').off('keydown').on('keydown', (e) => {
    if (e.key === 'Enter') {
        $('#certification_button').click();
    }
})