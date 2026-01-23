import '../../css/51-modern-default.css'
import '../../css/loading.css'
import '../../css/config-style.css'
import '../../css/multiple-select-style.css'

// import { field } from '../kintoneAPI.mjs'
import { addUsers, showUsers, possibleShowUsers, setShowUsers } from './users/configUser.mjs';
import { saveNarrow, setNarrowDownField } from './setNarrowDown.mjs';
import { saveMapConfig } from './saveMapConfig.mjs';
import { removeConfig } from './removeConfig.mjs';
import { addPostUser } from './users/addUser.mjs';
import { changeUerConfig } from './users/changeUserConfig.mjs';
import { setConfigName } from './setMapConfig.mjs'
import { showDropdown } from './setDropdown.mjs';
import { countPopupRowNumber } from './setMapConfigDefault.mjs';
import { ColorTable } from './createColorTable';

let key = '', fieldResp = ''

//ドメインのテキストと、表示マップを取得
let getDomainText = ''
const parts = location.pathname.split('/');
for (let i = 1; i < parts.length; i++) {
        if (parts[i + 1] === 'config') {
                getDomainText = parts[i]
        }
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

//ローカルストレージからログイン情報を取得
const localStorageKey = `map_${getDomainText}`
const checkLogin = localStorage.getItem(localStorageKey);

if (checkLogin) {
        //ログイン情報があるとき
        const loginTime = JSON.parse(checkLogin).loginTime;

        if (Date.now() - (4 * 60 * 60 * 1000) > loginTime) {
                //ログインしていた時間が、指定の時間よりも前の時、セッションを削除
                localStorage.removeItem(localStorageKey);
                window.location.href = `../${getDomainText}/login`;
        } else if (JSON.parse(checkLogin).authority !== 0) {
                $('.delete-user').hide();
                $('#add_user_button').hide();
        }
} else {
        window.location.href = `../${getDomainText}/`;
}
console.log(JSON.parse(checkLogin))

//設定内容の取得
const configResp = await window.fetch("../getAllConfig", {
        method: 'POST',
        headers: {
                "Content-Type": "application/json"
        },
        body: JSON.stringify({ domain: getDomainText, user: JSON.parse(checkLogin).id })
});

let config = await configResp.json();
console.log(config)
const domain = config.domain;
let users = await showUsers(config.domainId, JSON.parse(checkLogin));

$('#domain').text(config.domain);

if (config.addImages) {
        $('#add_images_config').show();
}

const getField = async (appId, token) => {
        const getfieldResp = await window.fetch("../kintone/getField", {
                method: 'POST',
                headers: {
                        "Content-Type": "application/json"
                },
                body: JSON.stringify({ app: appId, token: token, domain: domain })
        });
        return await getfieldResp.json()
}

/**
 * 設定画面のリセット
 */
const removeOptions = () => {
        $('#lat option:not(:first)').remove();
        $('#lng option:not(:first)').remove();
        $('#name option:not(:first)').remove();
        $('#group option:not(:first)').remove();
        $('#color option:not(:first)').remove();
        $(`input#check_registration_0`).attr('checked', true).prop('checked', true).change();
        $('#image_field option:not(:first)').remove();
        $(`input#check_registration_image_type_0`).attr('checked', true).prop('checked', true).change();
        $(`input#registration_datetime`).attr('checked', true).prop('checked', true).change();
        $('#image_datetime_field option:not(:first)').remove();
        $('.cf-plugin-gropu-table').remove();
        for (let i = 0; i < $('.popup_configs').length; i++) {
                if (i === 0) {
                        $('.popup_configs:eq(' + i + ') #popup option:not(:first)').remove();
                } else {
                        $('.popup_configs:eq(' + i + ')').remove();
                        i--;
                }
        }

        $('.image-field-config').hide()
}

$('#back-config').click(() => {
        $('#config_home_manu').css('display', 'none');
        $('#configuration_type').css('display', 'block');
        $('.map-config').css('display', 'none');
})

//設定を保存するときs
$('#save-config').click(async () => {
        config[key] = await saveMapConfig(config, key, JSON.parse(checkLogin), users, localStorageKey)
});

$('#color').change(() => {
        const color = $('#color').val()
        ColorTable(fieldResp.properties[color], config[key])
});

$('.add').click((e) => {
        for (let i = 0; i < document.querySelectorAll('.popup_configs').length; i++) {
                if (e.target.parentNode.parentNode === document.querySelectorAll('.popup_configs')[i]) {
                        $('.popup_configs').eq(0).clone(true).insertAfter($('.popup_configs').eq(i))
                        $('.popup_configs').eq(i + 1).attr('id', '')
                        break;
                }
        }
        countPopupRowNumber()
})
$('.remove').click((e) => {
        const value = e.target.parentNode.previousElementSibling.value;

        for (let i = 0; i < document.querySelectorAll('.popup_configs').length; i++) {
                $('.popup_configs:eq(' + i + ') #popup option[value="' + value + '"]').show();
                if (e.target.parentNode.parentNode === document.querySelectorAll('.popup_configs')[i]) {
                        $('.popup_configs').eq(i).remove()
                        i--;
                }
        }
        countPopupRowNumber()
})

let oldLat = '', oldLng = '';
$('#lat').click((e) => {
        oldLat = e.target.value;
}).change((e) => {
        $(`#lng option[value="${oldLat}"]`).css('display', 'block');
        if (e.target.value === '') {
                return;
        }
        $(`#lng option[value="${e.target.value}"]`).css('display', 'none');
})
$('#lng').click((e) => {
        oldLng = e.target.value;
}).change((e) => {
        $(`#lat option[value="${oldLng}"]`).css('display', 'block');
        if (e.target.value === '') {
                return;
        }
        $(`#lat option[value="${e.target.value}"]`).css('display', 'none');
})

let previous = ''
$('#popup').click((e) => {
        previous = e.target.value;
}).change((e) => {
        for (let i = 0; i < $(`.popup_configs`).length; i++) {
                if (document.querySelectorAll(`.popup_configs`)[i] !== e.target.parentNode) {
                        $(`.popup_configs:eq(${i}) #popup option[value="${previous}"]`).css('display', 'block');
                }
        }
        if (e.target.value === '') {
                return;
        }
        for (let i = 0; i < $(`.popup_configs`).length; i++) {
                if (document.querySelectorAll(`.popup_configs`)[i] !== e.target.parentNode) {

                        $(`.popup_configs:eq(${i}) #popup option[value="${e.target.value}"]`).css('display', 'none');
                }
        }
})

$('input[name="check-registration"]').change(function () {
        if ($(this).val() === '0') {
                $('.image-field-config').hide()
                $('#image_field_error').hide()
                $('#image_datetime_error').hide()
        } else {
                $('.image-field-config').show()
        }
})

$('input[name="registration-datetime"]').change(function () {
        if ($(this).prop('checked')) {
                $('#image_datetime_field').attr('disabled', false)
        } else {
                $('#image_datetime_field').attr('disabled', true)
                $('#image_datetime_field').val('')
                $('#image_datetime_error').hide()
        }
})

$('.map').click(async (event) => {
        $('#configuration_type').css('display', 'none');
        $('.map-config').css('display', 'block')
        $('#appId').val('')
        $('#token').val('');
        $('#center_lat').val('')
        $('#center_lng').val('')
        $('#config_name').val('').attr('disabled', false)
        $('#open_url_name').val('')
        $('#open_url').text('').attr('href', '')
        $(`#lat`).val('');
        $(`#lng`).val('');
        $(`#name`).val('');
        $(`#group`).val('');
        $(`#color`).val('');
        $('#image_field').val('');
        $('#image_datetime_field').val('');
        key = event.target.parentNode.id
        removeOptions();
        if (config[key] !== undefined) {
                fieldResp = await getField(config[key].appId, config[key].token)
                // fieldResp = await field(config[key].appId, config[key].token, domain);
                showDropdown(fieldResp, key, config);
        }
});

//アプリIDが入力されたとき、APIとーくんがあれば、フィールドを取得する
$('#appId').change(async () => {
        const appId = $('#appId').val()
        const token = $('#token').val()
        if (appId === '') {
                $('#app_id_error').show().text('アプリIDが入力されていません。')
        } else {
                $('#app_id_error').hide()
                if (token !== '') {
                        try {
                                fieldResp = await getField(appId, token);
                                showDropdown(fieldResp, key, config);
                                $('#appId').val(appId)
                                $('#token').val(token)
                        } catch (error) {
                                removeOptions()
                        }
                }
        }
})

//APIトークンが入力されたとき、アプリIDがあれあフィールドを取得する
$('#token').change(async () => {
        const appId = $('#appId').val()
        const token = $('#token').val()
        if (token === '') {
                $('#token_error').show().text('APIトークンが入力されていません。')
        } else {
                $('#token_error').hide()
                if (appId !== '') {
                        try {
                                fieldResp = await getField(appId, token)
                                console.log(fieldResp)
                                showDropdown(fieldResp, key, config);
                                $('#appId').val(appId)
                                $('#token').val(token)
                        } catch (error) {
                                removeOptions()
                        }
                }
        }
})

//変更されたとき、入力値がないと警告を出す。
$('#lat').off('change').change(function () {
        if ($(this).val() === '') {
                $('#latitude_error').show().text('緯度を設定してください。')
        } else {
                $('#latitude_error').hide()
        }
})

$('#lng').off('change').change(function () {
        if ($(this).val() === '') {
                $('#longitude_error').show().text('経度を設定してください。')
        } else {
                $('#longitude_error').hide()
        }
})

$('#name').off('change').change(function () {
        if ($(this).val() === '') {
                $('#name_error').show().text('ピンの名前を設定してください。')
        } else {
                $('#name_error').hide()
        }
})

$('#image_field').off('change').change(function () {
        if ($(this).val() === '') {
                $('#image_field_error').show().text('画像を保存するフィールドが設定されていません。')
        } else {
                $('#image_field_error').hide()
        }
})

$('#image_datetime_field').off('change').change(function () {
        if ($(this).val() === '') {
                $('#image_datetime_error').show().text('画像を保存するフィールドが設定されていません。')
        } else {
                $('#image_datetime_error').hide()
        }
})

//2025/08/08追加 ランダムURL作成
$('#create_Random_url').click(() => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';

        for (let i = 0; i < 30; i++) {
                randomString += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        $('#open_url_name').val(randomString);
        $('#open_url').text('https://8clouds-plugin.sakura.ne.jp/webMaps/map/8CloudsPablicMap/' + randomString).attr({ 'href': 'https://8clouds-plugin.sakura.ne.jp/webMaps/map/8CloudsPablicMap/' + randomString, 'target': '_blank' })
})

//2025/08/13追加 文字が変更されたとき
$('#open_url_name').change(function (e) {
        if ($(this).val() === '') {
                $('#open_url').text('').attr('href', '')
        } else {
                if (!(/^[a-zA-Z0-9]*$/.test($(this).val().trim()))) {
                        //英数字のみ
                        $('#open_url_name_error').show().text('公開用のURLは半角英数字のみにしてください。')
                } else if ($(this).val().trim().length >= 256) {
                        $('#open_url_name_error').show().text('公開用のURLは255文字以下にしてください。')
                } else {
                        $('#open_url_name_error').hide()
                        $('#open_url').text('https://8clouds-plugin.sakura.ne.jp/webMaps/map/8CloudsPablicMap/' + e.target.value).attr({ 'href': 'https://8clouds-plugin.sakura.ne.jp/webMaps/map/8CloudsPablicMap/' + e.target.value, 'target': '_blank' })
                }
        }
})


/*~===================================================================================================マップの設定-======================================================================= */

//有効無効が変更されたとき
$('input[name="valid-map"]').change(async (e) => {
        const id = e.delegateTarget.id;
        if (!$('#' + id).prop('checked')) {
                //無効になったとき、背景色を変える
                $('label[for="' + id + '"]').css({ 'background-color': 'rgb(147 147 147)', 'box-shadow': 'inset 0 0 4px 0px rgb(125, 125, 125)', 'cursor': 'pointer' }).text('非表示');
                $(`#${e.delegateTarget.value} .check-open-map`).hide();
                $('#' + e.delegateTarget.value).css({ 'background-color': 'gainsboro' });

        } else {
                $('label[for="' + id + '"]').css({ 'background-color': '#00c73d', 'box-shadow': 'inset 0 0 4px 0px #0cfb1f', 'cursor': 'pointer' }).text('表示');
                $('#' + e.delegateTarget.value).css({ 'background-color': 'white' });
                if (config[e.delegateTarget.value].openURL !== '' || config[e.delegateTarget.value].openURL) {
                        $(`#${e.delegateTarget.value} .check-open-map`).show();
                }
        }

        //メインのマップがきちんと設定されているとき、保存動作を行いマップに戻る
        const body = {
                config: config[e.delegateTarget.value].id,
                valid: $('#' + id).prop('checked')
        }

        //設定の更新
        await window.fetch("../updateConfig", {
                method: 'POST',
                headers: {
                        "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
        });
})

await setConfigName(config, JSON.parse(checkLogin));

$('#show_map_menu').click(() => {
        $('#configs').css('display', 'block');
        $('#configuration_type').css('display', 'block');
        $('#map_show_users').css('display', 'none');
        $('.map-config').css('display', 'none');

        $('#config_home_manu').css('display', 'none');

        $('.narrow-down-configs:not(:eq(0))').remove();
        $('.narrow-down-configs:eq(0) .narrow-down-field option:not(:eq(0))').remove()
        $('.narrow-down-configs:eq(0) .narrow-down-conditions').empty();
        $('.narrow-down-configs:eq(0) .narrow-down-values').empty();
        $('#configuration_type').css('display', 'block');
        $('#map_narrow_down').css('display', 'none');

        if (navigator.userAgent.match(/iPhone|Android.+Mobile/) || window.innerWidth <= 960) {
                $('#home_menu_button').attr('src', '../mapmune.png').css({ 'width': '31px', 'height': '19px' })
                $('.menu-buttons').hide();
                $('.left-menu').css('background', 'none')
        }
})

$('#show_home_menu').click(() => {
        $('#config_home_manu').css('display', 'block');
        $('#show_Registration_information').css('display', 'block');
        $('#add_user_page').css('display', 'none');

        $('#configs').css('display', 'none');

        $('.narrow-down-configs:not(:eq(0))').remove();
        $('.narrow-down-configs:eq(0) .narrow-down-field option:not(:eq(0))').remove()
        $('.narrow-down-configs:eq(0) .narrow-down-conditions').empty();
        $('.narrow-down-configs:eq(0) .narrow-down-values').empty();
        $('#configuration_type').css('display', 'block');
        $('#map_narrow_down').css('display', 'none');

        if (navigator.userAgent.match(/iPhone|Android.+Mobile/) || window.innerWidth <= 960) {
                $('#home_menu_button').attr('src', '../mapmune.png').css({ 'width': '31px', 'height': '19px' })
                $('.menu-buttons').hide()
                $('.left-menu').css('background', 'none')
        }
})

//設定を増やすボタンをクリックしたときに、設定を増やす
$('.add-config').click(() => {
        const clone = $('.map-configs').eq(0).clone(true)
        for (let i = 1; i <= $('.map-configs').length; i++) {
                if ($('#config' + i).length === 0) {
                        clone.find('input[type="checkbox"]').attr({ 'id': 'valid' + i, 'value': 'config' + i });
                        clone.find('.valid-label').attr('for', 'valid' + i);
                        clone[0].setAttribute('id', 'config' + i)
                        break;
                }
        }

        clone.insertAfter(
                $('.map-configs').eq($('.map-configs').length - 1)
        );

        $('.remove-config').eq(1).show();
})

//設定の削除ボタンをクリックした時、設定を削除する
$('.remove-config').click(async (e) => {
        removeConfig(e, config, JSON.parse(checkLogin), getDomainText)
});

/*==================================================================================================-ユーザー-=====================================================================================*/

//ユーザーを追加するボタンをクリックする
$('#add_user').click(async () => {
        //追加画面の表示
        addUsers();
        $('#post_user').text('追加');

        //追加ボタンをクリックする
        $('#post_user').off('click').click(async () => {
                const newUser = await addPostUser(config.domainId, users)
                if (newUser) {
                        users.push(newUser)
                }
                console.log(users)

                $('#login_password').attr('type', 'password');
                $('#login_password').next().find('i').removeClass('fa-eye-slash');
                $('#login_password').next().find('i').addClass('fa-eye');

                $('#login_password_confirmation').attr('type', 'password');
                $('#login_password_confirmation').next().find('i').removeClass('fa-eye-slash');
                $('#login_password_confirmation').next().find('i').addClass('fa-eye');
        })

        //キャンセルボタンをるりっくした時
        $('#cancel_add_user').off('click').click(async () => {
                $('#show_Registration_information').css('display', 'block');
                $('#add_user_page').css('display', 'none');

                $('#login_password').attr('type', 'password');
                $('#login_password').next().find('i').removeClass('fa-eye-slash');
                $('#login_password').next().find('i').addClass('fa-eye');

                $('#login_password_confirmation').attr('type', 'password');
                $('#login_password_confirmation').next().find('i').removeClass('fa-eye-slash');
                $('#login_password_confirmation').next().find('i').addClass('fa-eye');
        })
});

$('.show_password').off('click').click(function () {
        const textBox = $(this).prev();
        if (textBox.prop('type') === 'password') {
                //input type="password" だった場合は、input type="text" に切り替えます
                textBox.attr('type', 'text');
                //ボタンの見栄えを切り替えます。
                $(this).find('i').removeClass('fa-eye')
                $(this).find('i').addClass('fa-eye-slash')
        } else {
                //そうではなかったら、逆に、input type="password" に切り替えます。
                textBox.attr('type', 'password');
                //ボタンの見栄えを切り替えます。
                $(this).find('i').removeClass('fa-eye-slash')
                $(this).find('i').addClass('fa-eye')
        }
})

$('#user_name').off('change').change(function () {
        if ($(this).val() !== '') {
                $('#user_name_error').hide()
        } else {
                $('#user_name_error').show().text('ユーザー名が入力されていません');
        }
})

$('#login_id').off('change').change(function () {
        if ($(this).val() !== '') {
                $('#login_id_error').hide()
        } else {
                $('#login_id_error').show().text('ユーザIDが入力されていません');
        }
})

$('#login_password').change(function () {
        if ($(this).val() === '') {
                $('#password_error1').show().text('パスワードが入力されていません');
                $('#password_error2').hide()
        } else {
                $('#password_error1').hide()
                if ($(this).val() === $('#login_password_confirmation').val()) {
                        $('#password_error2').hide()
                }
        }
})

$('#login_password_confirmation').change(function () {
        if ($(this).val() !== $('#login_password').val()) {
                $('#password_error2').show().text('パスワードが違います。')
        } else {
                $('#password_error2').hide()
        }
})

let passChange = false;
//ユーザーの設定をクリックした時
$('.setting-user-button').off('click').click((e) => {
        $('#post_user').text('更新');
        //ユーザーのidを取得
        const id = Number(e.target.parentNode.parentNode.id)

        //配列内のいくつ目かを保存する
        let num
        addUsers()
        for (let i = 0; i < users.length; i++) {
                if (users[i].id === id) {
                        //ユーザーのIDが同じとき、値を入れる
                        num = i;
                        $('#user_name').val(users[i].user_name);
                        $('#login_id').val(users[i].user_id);
                        $('#login_password').val('●●●●●●');
                        if (users[i].email) {
                                $('#login_mail').val(users[i].email);
                        }

                        $('#authority-2').prop('disabled', false);
                        if (users[i].authority === 2) {
                                $('#authority-2').prop('checked', true);
                        } else if (users[i].authority === 0) {
                                $('#authority-2').prop({ 'checked': true, 'disabled': true });
                        }

                        break;
                }
        }

        $('#login_password').change(() => {
                passChange = true;
        })

        //更新ボタンを押したとき
        $('#post_user').off('click').click(async () => {
                try {
                        users[num] = await changeUerConfig(users, num, passChange, id)
                } catch (error) {
                        alert('更新に失敗しました。');
                        console.error(error)
                }
        })

        //キャンセルボタンを押したとき、戻る
        $('#cancel_add_user').off('click').click(() => {
                $('#show_Registration_information').css('display', 'block');
                $('#add_user_page').css('display', 'none');
        })
})


//ユーザーを削除するボタンをクリックすると、登録刺されているユーザーが消える
$('.delete-user-button').click(async (e) => {
        const name = e.target.parentNode.previousElementSibling.previousElementSibling.children[0].innerText;
        const id = e.target.parentNode.parentNode.id;
        const result = window.confirm(`ユーザー:${name} を削除します。よろしいですか?`);

        if (result) {
                await window.fetch("../deleteUser", {
                        method: 'POST',
                        headers: {
                                "Content-Type": "application/json"
                        },
                        body: JSON.stringify({ id: id })
                });

                e.target.parentNode.parentNode.remove();

                for (let i = 0; i < users.length; i++) {
                        if (users[i].id === Number(id)) {
                                users.splice(i, 1);
                                break;
                        }
                }

                for (const key in config) {
                        if (config[key].mapTitle) {
                                let deleteUser = false;
                                for (let i = 1; i <= config[key].users_row_number; i++) {
                                        if (config[key]['user_row' + i].user === id) {
                                                if (config[key]['user_row' + (i + 1)]) {
                                                        config[key]['user_row' + i] = config[key]['user_row' + (i + 1)]
                                                } else {
                                                        delete config[key]['user_row' + i]
                                                }
                                                config[key].users_row_number--;
                                                deleteUser = true
                                        } else if (deleteUser && config[key]['user_row' + (i + 1)]) {
                                                config[key]['user_row' + i] = config[key]['user_row' + (i + 1)]
                                        }
                                }
                        }
                }
        }
})

//マップのユーザー設定をクリックした時
$('.users').click(function (e) {
        key = $(this).parents('.map-configs').prop('id');
        if (config[key] === undefined) {
                //マップが設定されていないとき、処理を止める
                alert('マップの設定を先に行ってください。');
        } else {
                //マップが設定されているとき、ユーザーの設定を開く
                $('#configuration_type').css('display', 'none');
                $('#map_show_users').css('display', 'block');
                possibleShowUsers(config, users, JSON.parse(checkLogin), key)
                $('#show_users_save').off('click').click(async () => {
                        const newShowUsers = await setShowUsers(config[key], users, JSON.parse(checkLogin));
                        console.log(newShowUsers)
                        for (let i = 2; i <= config[key].users_row_number; i++) {
                                delete config[key]['user_row' + i]
                        }

                        let checkShowLoginUser = false;
                        config[key].users_row_number = newShowUsers.length + 1
                        const showMaps = JSON.parse(checkLogin).showMaps
                        for (let i = 0; i < newShowUsers.length; i++) {
                                config[key]['user_row' + (i + 2)] = {
                                        user: newShowUsers[i].id,
                                        edit: newShowUsers[i].authority.edit,
                                        create: newShowUsers[i].authority.create,
                                        setConfig: newShowUsers[i].authority.setConfig
                                }

                                if (JSON.parse(checkLogin).id === newShowUsers[i].id) {
                                        check: for (let j = 0; j < showMaps.length; j++) {
                                                if (showMaps[j].config === config[key].id) {
                                                        showMaps[j].edit = newShowUsers[i].authority.edit
                                                        showMaps[j].create = newShowUsers[i].authority.create
                                                        showMaps[j].setConfig = newShowUsers[i].authority.setConfig

                                                        console.log(showMaps[j])
                                                        const loginConfig = {
                                                                id: JSON.parse(checkLogin).id,
                                                                userId: JSON.parse(checkLogin).userId,
                                                                userName: JSON.parse(checkLogin).userName,
                                                                authority: JSON.parse(checkLogin).authority,
                                                                loginTime: JSON.parse(checkLogin).loginTime,
                                                                showMaps: showMaps
                                                        }
                                                        localStorage.setItem(localStorageKey, JSON.stringify(loginConfig));
                                                        checkShowLoginUser = true;
                                                        break check;
                                                }
                                        }
                                }
                        }
                        if (!checkShowLoginUser) {
                                for (let i = 0; i < showMaps.length; i++) {
                                        if (showMaps[i].config === config[key].id) {
                                                delete showMaps[i]
                                                const loginConfig = {
                                                        id: JSON.parse(checkLogin).id,
                                                        userId: JSON.parse(checkLogin).userId,
                                                        userName: JSON.parse(checkLogin).userName,
                                                        authority: JSON.parse(checkLogin).authority,
                                                        loginTime: JSON.parse(checkLogin).loginTime,
                                                        showMaps: showMaps
                                                }
                                                localStorage.setItem(localStorageKey, JSON.stringify(loginConfig));
                                                checkShowLoginUser = true;
                                        }
                                }
                        }
                })
        }
});

/*==================================================================================================-絞り込み-=====================================================================================*/

$('.narrow-down').click(async function (e) {
        key = $(this).parents('.map-configs').prop('id');
        console.log(key)
        if (config[key] === undefined) {
                alert('マップの設定を先に行ってください。')
        } else {
                $('#map_narrow_down #map_name').text(config[key].mapTitle + '絞り込み設定')
                $('#configuration_type').css('display', 'none');
                $('#map_narrow_down').css('display', 'block');
                await setNarrowDownField(config, key)
                $('#narrow_down_save').click(async () => {
                        const newNarrow = await saveNarrow();
                        console.log(newNarrow)
                        for (let i = config[key].narrow_row_number; i > 0; i--) {
                                delete config[key]['narrow_row' + i]
                        }

                        config[key].narrow_row_number = newNarrow.length
                        for (let i = 0; i < newNarrow.length; i++) {
                                config[key]['narrow_row' + (i + 1)] = {
                                        field: newNarrow[i].field,
                                        condition: newNarrow[i].condition,
                                        value: JSON.parse(newNarrow[i].value),
                                        andor: newNarrow[i].andor
                                }
                        }
                })
        }
})

/*==================================================================================================-絞り込み-=====================================================================================*/
//「マップに戻る」をクリックした時
$('#back_map').click(async () => {

        if (!config.config1) {
                alert('マップの設定が行われていません。')
        } else {
                window.location.href = `../${getDomainText}/`;
        }
});

$('#home_menu_button').click(() => {
        if ($('#home_menu_button').prop('src') === '../mapmune.png') {
                $('#home_menu_button').attr('src', '../mapmuneclose.png').css({ 'width': '20px', 'height': '20px' })
                $('.left-menu').css('background', '#bcffff')
                $('.menu-buttons').show()
        } else {
                $('#home_menu_button').attr('src', '../mapmune.png').css({ 'width': '31px', 'height': '19px' })
                $('.left-menu').css('background', 'none')
                $('.menu-buttons').hide()
        }
})
