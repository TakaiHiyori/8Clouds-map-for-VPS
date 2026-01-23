import { escapeHtml } from "../../escapeHtml.mjs";

/**
 * ユーザーを取得、表示する
 * @param {string} domain kintoneのドメイン
 * @returns 取得したユーザー
 */
export async function showUsers(domain, loginUser) {
    console.log(domain)
    console.log(loginUser)

    //登録しているユーザーを取得
    const userResp = await window.fetch("../getUsers", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ domain: domain })
    });
    let user = await userResp.json();

    //ユーザーの数ループを行い、ログインID、ユーザー名、メールアドレスを表示
    for (let i = 0; i < user.length; i++) {
        $('#user_table_body tr').eq(0).clone(true).insertAfter($('#user_table_body tr').eq(i));
        $('#user_table_body tr:eq(' + (i + 1) + ')').attr('id', user[i].id);
        $('#user_table_body tr:eq(' + (i + 1) + ') .user-name').text(user[i].user_name);
        $('#user_table_body tr:eq(' + (i + 1) + ') .user-id').text(user[i].user_id);
        $('#user_table_body tr:eq(' + (i + 1) + ') .user-mail').text(user[i].email);
        if (user[i].authority === 0) {
            $('#user_table_body tr:eq(' + (i + 1) + ') .delete-user-button').hide();
        }
        if (loginUser.authority !== 0 && user[i].authority !== 0 && user[i].user_id !== loginUser.userId) {
            $('#user_table_body tr:eq(' + (i + 1) + ')').hide()
        }
    }

    return user;
}

/**
 * ユーザーを追加する画面を表示
 */
export async function addUsers() {
    $('#user_name').val('');
    $('#login_id').val('');
    $('#login_password').val('');
    $('#login_mail').val('');
    $('#authority-2').prop('checked', false)
    $('#show_Registration_information').css('display', 'none');
    $('#add_user_page').css('display', 'block');
};

/**
 * マップのユーザーの設定数によって削除ボタンを表示する
 * @param {number} num 行数
 */
function checkTableRowNum(num) {
    if (num >= 4) {
        if ($('#show_map_users > tr:eq(2) .remove').prop('id') !== 'creater') {
            $('#show_map_users > tr:eq(2) .remove').show();
        }
    } else {
        $('#show_map_users > tr:eq(2) .remove').hide();
    }
}

/**
 * マップに対して権限のあるユーザーを表示する
 * @param {object} config 設定
 * @param {string} domain kintoneのドメイン
 * @param {object} users 登録しているユーザー
 */
export async function possibleShowUsers(configs, users, loginUser, key) {
    const config = configs[key]
    console.log(config)
    const domain = configs.domainId
    $('#map_name').text(config.mapTitle + 'ユーザー設定');

    //設定の行数を1に戻す
    for (let i = $('#show_map_users > tr').length; i > 1; i--) {
        $('#show_map_users > tr').eq(i).remove();
    }

    //登録されているユーザーの数ループ
    for (let i = 0; i < users.length; i++) {
        if (users[i].authority !== 0) {
            //権限が0以外の時、選択肢に追加する
            const $option = $('<option>');
            $option.attr('value', users[i].id).text(escapeHtml(users[i].user_name));
            $('#show_map_users > tr:eq(0) .login-user-id').append($option);
        }
    };

    $('#authority0_user_name').text(users[0].user_name);

    if (config.users_row_number >= 2) {
        //マップに権限のあるユーザーが2人以上の時
        for (let i = 1; i <= config.users_row_number; i++) {
            if (config['user_row' + i].authority !== 0) {

                //選択欄を複製
                const num = $('#show_map_users > tr').length;
                const clone = $('#show_map_users > tr').eq(0).clone(true)
                //チェックボックスのidとlabelのforを変更する
                clone.find('input[name="show-map-authority"]#show_map_authority-0').next().attr('for', 'show_map_authority-0-' + (num - 1))
                clone.find('input[name="show-map-authority"]#show_map_authority-0').attr('id', 'show_map_authority-0-' + (num - 1))
                clone.find('input[name="show-map-authority"]#show_map_authority-1').next().attr('for', 'show_map_authority-1-' + (num - 1))
                clone.find('input[name="show-map-authority"]#show_map_authority-1').attr('id', 'show_map_authority-1-' + (num - 1))
                clone.find('input[name="show-map-authority"]#show_map_authority-2').next().attr('for', 'show_map_authority-2-' + (num - 1))
                clone.find('input[name="show-map-authority"]#show_map_authority-2').attr('id', 'show_map_authority-2-' + (num - 1))
                clone.insertAfter($('#show_map_users > tr').eq(num - 1));
                $('#show_map_users > tr:eq(' + num + ') .login-user-id').val(config['user_row' + i].user);

                for (let j = 0; j < $(' .login-user-id').length; j++) {
                    //他の選択肢から既に選択されているユーザーを表示しないようにする
                    if ($('.login-user-id').eq(j).val() !== String(config['user_row' + i].user)) {
                        $(`.login-user-id:eq(${j}) option[value="${config['user_row' + i].user}"]`).css('display', 'none');
                    }
                }
                //編集権限があるとき、「ピンの編集」にチェックをつける
                $('#show_map_users > tr:eq(' + num + ') input[name="show-map-authority"]#show_map_authority-0-' + (num - 1)).attr('checked', config['user_row' + i].edit).prop('checked', config['user_row' + i].edit).change();
                //追加権限ができる時、「ピンの追加」にチェックをつける
                $('#show_map_users > tr:eq(' + num + ') input[name="show-map-authority"]#show_map_authority-1-' + (num - 1)).attr('checked', config['user_row' + i].create).prop('checked', config['user_row' + i].create).change();
                //マップを設定する権限があるとき、「マップの設定」にチェックをつける
                $('#show_map_users > tr:eq(' + num + ') input[name="show-map-authority"]#show_map_authority-2-' + (num - 1)).attr('checked', config['user_row' + i].setConfig).prop('checked', config['user_row' + i].setConfig).change();

                if (config['user_row' + i].user === config.creater) {
                    $('#show_map_users > tr:eq(' + num + ') .remove').attr('id', 'creater');
                    $('#show_map_users > tr:eq(' + num + ') input[name="show-map-authority"]#show_map_authority-2-' + (num - 1)).attr('disabled', true);
                    $('#show_map_users > tr:eq(' + num + ') input[name="show-map-authority"]#show_map_authority-1-' + (num - 1)).attr('disabled', true);
                    $('#show_map_users > tr:eq(' + num + ') input[name="show-map-authority"]#show_map_authority-0-' + (num - 1)).attr('disabled', true);
                    $('#show_map_users > tr:eq(' + num + ') .login-user-id').attr('disabled', true).css('background-color', '#dddddd');
                }
            }
        }
    } else {
        //設定がないときに1行目のクローンを作る
        const clone = $('#show_map_users > tr').eq(0).clone(true)
        clone.find('input[name="show-map-authority"]#show_map_authority-0').next().attr('for', 'show_map_authority-0-1')
        clone.find('input[name="show-map-authority"]#show_map_authority-0').attr('id', 'show_map_authority-0-1')
        clone.find('input[name="show-map-authority"]#show_map_authority-1').next().attr('for', 'show_map_authority-1-1')
        clone.find('input[name="show-map-authority"]#show_map_authority-1').attr('id', 'show_map_authority-1-1')
        clone.find('input[name="show-map-authority"]#show_map_authority-2').next().attr('for', 'show_map_authority-2-1')
        clone.find('input[name="show-map-authority"]#show_map_authority-2').attr('id', 'show_map_authority-2-1')
        clone.insertAfter($('#show_map_users > tr').eq($('#show_map_users > tr').length - 1));
    }

    //行数を数える
    checkTableRowNum($('#show_map_users > tr').length);

    //キャンセルをクリックした時、行を削除して元の画面に戻る
    $('#show_users_calsel').off('click').click(() => {
        $('#map_show_users').css('display', 'none');
        $('#configuration_type').css('display', 'block');

        $('#show_map_users > tr:eq(0) .login-user-id').empty();
        $('#show_map_users > tr:eq(0) .login-user-id').append('<option value="">-----</option>')
        for (let i = $('#show_map_users > tr').length; i > 1; i--) {
            $('#show_map_users > tr').eq(i).remove();
        }
        return;
    });
}

export const setShowUsers = async (config, users, loginUser) => {
    const usersId = {
        admin: users[0].id,
        config: config.id,
        showUsers: []
    }

    for (let i = 2; i < $('#show_map_users > tr').length; i++) {
        //ユーザーの行数ループ
        const showUserId = $('#show_map_users > tr:eq(' + i + ') .login-user-id').val();
        const checkEdit = $('#show_map_users > tr:eq(' + i + ') input[name="show-map-authority"]:eq(0)').prop('checked'),
            checkCreate = $('#show_map_users > tr:eq(' + i + ') input[name="show-map-authority"]:eq(1)').prop('checked'),
            checkSetConfig = $('#show_map_users > tr:eq(' + i + ') input[name="show-map-authority"]:eq(2)').prop('checked')
        if (showUserId === '' || usersId.showUsers.indexOf(Number(showUserId)) !== -1) {
            //ユーザーが設定されていない、もしくは同じユーザーが設定されているとき、処理を飛ばす
            continue;
        } else {
            //ユーザーが正業に設定されているとき、追加
            const authority = {
                edit: checkEdit,
                create: checkCreate,
                setConfig: checkSetConfig
            }
            usersId.showUsers.push({ id: Number(showUserId), authority: authority });
        }
    }

    //マップのユーザーを設定
    await window.fetch("../setShowMapUsers", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usersId)
    });

    //ドロップダウンの選択肢を削除、1つだけ追加
    $('#show_map_users > tr:eq(0) .login-user-id').empty();
    $('#show_map_users > tr:eq(0) .login-user-id').append('<option value="">-----</option>')
    for (let i = $('#show_map_users > tr').length; i > 1; i--) {
        //行の全削除
        $('#show_map_users > tr').eq(i).remove();
    }

    //「マップの設定」画面に戻る
    $('#map_show_users').css('display', 'none');
    $('#configuration_type').css('display', 'block');

    if (loginUser.authority !== 0) {
        let check = false
        for (let i = 0; i < usersId.showUsers.length; i++) {
            if (usersId.showUsers[i].id === loginUser.id) {
                if (!usersId.showUsers[i].authority.setConfig) {
                    $(`#${key} input[name="valid-map"]`).attr('disabled', true);
                    $(`#${key} .map`).attr('disabled', true);
                    $(`#${key} .narrow-down`).attr('disabled', true);
                    $(`#${key} .users`).attr('disabled', true);
                    $(`#${key} .remove-config`).attr('disabled', true);
                }
                check = true;
            }
        }

        if (!check && config.creater !== loginUser.id) {
            $(`#${key} input[name="valid-map"]`).attr('disabled', true);
            $(`#${key} .map`).attr('disabled', true);
            $(`#${key} .narrow-down`).attr('disabled', true);
            $(`#${key} .users`).attr('disabled', true);
            $(`#${key} .remove-config`).attr('disabled', true);
            $(`#${key}`).hide();
        }
    }
    return usersId.showUsers;
}

//行を増やすボタンがクリックされたとき、行を増やす
$('#show_map_users > tr .add').click((e) => {
    const num = document.querySelectorAll('#show_map_users > tr').length;
    for (let i = 2; i < num; i++) {
        if (e.target.parentNode.parentNode === document.querySelectorAll('#show_map_users > tr')[i]) {
            const clone = $('#show_map_users > tr').eq(0).clone(true);
            clone.find('input[name="show-map-authority"]#show_map_authority-0').next().attr('for', 'show_map_authority-0-' + (num - 1))
            clone.find('input[name="show-map-authority"]#show_map_authority-0').attr('id', 'show_map_authority-0-' + (num - 1))
            clone.find('input[name="show-map-authority"]#show_map_authority-1').next().attr('for', 'show_map_authority-1-' + (num - 1))
            clone.find('input[name="show-map-authority"]#show_map_authority-1').attr('id', 'show_map_authority-1-' + (num - 1))
            clone.find('input[name="show-map-authority"]#show_map_authority-2').next().attr('for', 'show_map_authority-2-' + (num - 1))
            clone.find('input[name="show-map-authority"]#show_map_authority-2').attr('id', 'show_map_authority-2-' + (num - 1))

            clone.insertAfter($('#show_map_users > tr').eq(i))
            break;
        }
    }
    checkTableRowNum($('#show_map_users > tr').length);
})

//行を削除するボタンがクリックされたとき、行を減らす
$('#show_map_users > tr .remove').click((e) => {
    const value = e.target.parentNode.previousElementSibling.previousElementSibling.children[0].children[0].children[0].value;
    $(`#show_map_users > tr:eq(0) .login-user-id option[value="${value}"]`).show()
    for (let i = 2; i < document.querySelectorAll('#show_map_users > tr').length; i++) {

        if (e.target.parentNode.parentNode === document.querySelectorAll('#show_map_users > tr')[i]) {
            $('#show_map_users > tr').eq(i).remove()
            i--;
        } else {
            $(`#show_map_users > tr:eq(${i}) input[name="show-map-authority"]:eq(0)`).next().attr('for', 'show_map_authority-0-' + (i - 1))
            $(`#show_map_users > tr:eq(${i}) input[name="show-map-authority"]:eq(0)`).attr('id', 'show_map_authority-0-' + (i - 1))
            $(`#show_map_users > tr:eq(${i}) input[name="show-map-authority"]:eq(1)`).next().attr('for', 'show_map_authority-1-' + (i - 1))
            $(`#show_map_users > tr:eq(${i}) input[name="show-map-authority"]:eq(1)`).attr('id', 'show_map_authority-1-' + (i - 1))
            $(`#show_map_users > tr:eq(${i}) input[name="show-map-authority"]:eq(2)`).next().attr('for', 'show_map_authority-2-' + (i - 1))
            $(`#show_map_users > tr:eq(${i}) input[name="show-map-authority"]:eq(2)`).attr('id', 'show_map_authority-2-' + (i - 1))
        }
        $(`#show_map_users > tr:eq(${i}) .login-user-id option[value="${value}"]`).show()
    }
    checkTableRowNum($('#show_map_users > tr').length);
})

//ユーザーが選択されたとき、選択された場所以外のドロップダウンから選択肢を見えなくする
let previous = ''
$('.login-user-id').click((e) => {
    previous = e.target.value;
}).change((e) => {
    for (let i = 0; i < $('.login-user-id').length; i++) {
        if (document.querySelectorAll('.login-user-id')[i] !== e.target) {
            $(`.login-user-id:eq(${i}) option[value="${previous}"]`).css('display', 'block');
        }
    }
    if (e.target.value === '') {
        return;
    }
    for (let i = 0; i < $('.login-user-id').length; i++) {
        if (document.querySelectorAll('.login-user-id')[i] !== e.target) {
            $(`.login-user-id:eq(${i}) option[value="${e.target.value}"]`).css('display', 'none');
        }
    }
})