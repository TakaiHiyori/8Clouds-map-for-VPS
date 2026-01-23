
import $ from "jquery"
import './index.js'

import { localStorageKey } from "./map.mjs";

$('body').off('click').click((e) => {
    if (!e.originalEvent || e.originalEvent.target.tagName === 'BUTTON') {
        //クリックした場所が見当たらない、もしくはボタンをクリックした場合は何もしない
    } else if (e.originalEvent.target.tagName === 'HEADER' || e.originalEvent.target.id === 'map' || e.originalEvent.target.id === 'map-title') {
        $('.select-options').hide()
        $('#address_search_modal').hide()
        $('#search_modal').hide()
        $('#logout-config').hide()
    } else if (e.originalEvent.target.className !== '') {
        if (e.originalEvent.target.className.baseVal) {
            if ($('#map .' + e.originalEvent.target.className.baseVal.split(' ')[0]).length >= 1) {
                $('.select-options').hide()
                $('#address_search_modal').hide()
                $('#search_modal').hide()
                $('#logout-config').hide()
            }
        } else {
            if ($('#map .' + e.originalEvent.target.className.split(' ')[0]).length >= 1) {
                $('.select-options').hide()
                $('#address_search_modal').hide()
                $('#search_modal').hide()
                $('#logout-config').hide()
            }
        }
    }
})

$('#login_user_name').off('click').click(() => {
    console.log('click')
    $('.select-options').hide()
    $('#address_search_modal').hide()
    $('#search_modal').hide()
    if ($('#logout-config').css('display') === 'none') {
        $('#logout-config').show()
    } else {
        $('#logout-config').hide()
    }
})

//configボタンを押したとき、config.htmlを開く
document.getElementById('config-page').addEventListener('click', function (e) {
    window.location.href = "./config";
});

//ログアウトボタンを押したとき、セッションを削除して8Cloudsmapを開く
document.getElementById('logput').addEventListener('click', function (e) {
    localStorage.removeItem(localStorageKey);
    window.location.href = "./login";
});