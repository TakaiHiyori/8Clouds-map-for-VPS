/**
 * 詳細画面を作成
 * @author 髙井
 */
/**
 * 修正日：2025/10/31
 * 修正内容
 *  DB内に更新したレコードを登録する
 */
import '../../css/51-modern-default.css'
import '../../css/loading.css'
import '../../css/detail-style.css'

// import { field, getLyout, fetchFileContent, uploadFile } from '../kintoneAPI.mjs'
import { showDetail } from './showDetail.mjs'
import { detailSave } from './detailSave.mjs'
import { showEdit } from './showEdit.mjs'

//ドメインのテキストと、表示マップを取得
let getDomainText = '', id = ''
const parts = location.pathname.split('/');
for (let i = 1; i < parts.length; i++) {
    if (parts[i] === 'detail') {
        getDomainText = parts[i - 1]
        if (parts[i + 1]) {
            id = parts[i + 1]
        }
        break;
    }
}
console.log(id)

if (id === '') {
    window.location.href = `../../`;
}

const domainText = getDomainText;
//ローカルストレージからログイン情報を取得
const localStorageKey = `map_${domainText}`
const checkLogin = localStorage.getItem(localStorageKey);

if (checkLogin) {
    //ログイン情報があるとき
    const loginTime = JSON.parse(checkLogin).loginTime;

    if (Date.now() - (4 * 60 * 60 * 1000) > loginTime) {
        //ログインしていた時間が、指定の時間よりも前の時、セッションを削除
        localStorage.removeItem(localStorageKey);
        window.location.href = `../`;
    }
} else {
    window.location.href = `../`;
}
const loginUser = JSON.parse(checkLogin);
console.log(loginUser)

const recordId = id;

const showMapLocalStorageKey = `show_map_${domainText}_${JSON.parse(checkLogin).id}`
const showMapInformation = JSON.parse(localStorage.getItem(showMapLocalStorageKey))

const configResp = await window.fetch("../../getConfig", {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ domain: domainText })
});
const config = await configResp.json();
const domain = config.domain
const mapConfig = config[showMapInformation.key];
console.log(mapConfig)

const token = mapConfig.token

const title = []
for (let i = 0; i < mapConfig.mapTitle.length; i++) {
    title[i] = mapConfig.mapTitle.charCodeAt(i);
}

const fieldResp = await window.fetch("../../kintone/getField", {
    method: 'POST',
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({ app: mapConfig.appId, token: mapConfig.token, domain: domain })
});
const field = await fieldResp.json();
console.log(field)

//レコードを取得
const recordsResponse = await window.fetch("../../kintone/getRecord",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ app: mapConfig.appId, id: Number(recordId), domain: domain, token: token })
    });

if (!recordsResponse.ok) {
    alert(`レコード番号${Number(recordId)}を取得できませんでした。マップ画面に戻ります。`);
    window.location.href = `../`;
}
let record = await recordsResponse.json();
console.log(record)

const kintoneLayoutResp = await fetch('../../kintone/getLayout', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app: mapConfig.appId, token: mapConfig.token, domain: domain })
})

const kintoneLayout = await kintoneLayoutResp.json();

let fileImageURLs = {}, uploadFiles = {};

const showUser = loginUser.showMaps.filter(map => map.config === mapConfig.id);
console.log(showUser)

if (showUser[0].edit === 0) {
    $('#record_edit').hide();
}

fileImageURLs = await showDetail(kintoneLayout, fileImageURLs, field, config.domain, mapConfig, record);

const editButton = document.getElementById('record_edit');
editButton.addEventListener('click', () => {
    try {
        const deleteFiles = [];
        uploadFiles = showEdit(field, record, mapConfig, uploadFiles, fileImageURLs)

        $('.kintoneplugin-dropdown-list-item').off('click').click((e) => {
            if (e.delegateTarget.className.indexOf('kintoneplugin-dropdown-list-item-selected') !== -1) {
                e.delegateTarget.className = 'kintoneplugin-dropdown-list-item';
            } else {
                e.delegateTarget.className = 'kintoneplugin-dropdown-list-item kintoneplugin-dropdown-list-item-selected';
            }
        })

        $('.add-row').click((e) => {
            const table = e.target.parentNode.parentNode.parentNode.parentNode.id;
            const tr = document.querySelectorAll(`#${table} tbody > tr`)
            const clone = $(`#${table} tbody > tr`).eq(0).clone(true)
            let addTableNum = 0;

            let radio = false;
            let check = false;
            if (clone.find('.table-radio').length !== 0) {
                radio = true;
            }
            if (clone.find('.table-check').length !== 0) {
                check = true;
            }

            //テーブル内のtrの数ループ
            for (let i = 0; i <= tr.length; i++) {
                if (radio) {
                    //ラジオボタンがテーブル内にあるとき
                    for (let r = 0; r < clone.find('.table-radio').length; r++) {
                        //ラジオボタンの数ループ
                        const radioName = clone.find('.table-radio:eq(' + r + ') input').eq(0).prop('name');
                        if ($(`#${table} input[name="${radioName}-${(i + 1)}"]`).length === 0) {
                            //radioName-(i+1)というname属性がないとき、新しいname属性を付与
                            for (let j = 0; j < clone.find('.table-radio:eq(' + r + ') input').length; j++) {
                                const tableRadio = clone.find('.table-radio:eq(' + r + ') input').eq(j)

                                tableRadio.attr({ 'name': tableRadio.prop('name') + '-' + (i + 1), 'id': tableRadio.prop('id') + '-' + (i + 1) })
                                tableRadio.next('label').attr('for', tableRadio.prop('id'))
                            }
                            radio = false;
                        }
                    }
                }
                if (check) {
                    //ラジオボタンがテーブル内にあるとき
                    for (let r = 0; r < clone.find('.table-check').length; r++) {
                        //ラジオボタンの数ループ
                        const radioName = clone.find('.table-check:eq(' + r + ') input').eq(0).prop('name');
                        if ($(`#${table} input[name="${radioName}-${(i + 1)}"]`).length === 0) {
                            //radioName-(i+1)というname属性がないとき、新しいname属性を付与
                            for (let j = 0; j < clone.find('.table-check:eq(' + r + ') input').length; j++) {
                                const tableCheck = clone.find('.table-check:eq(' + r + ') input').eq(j)

                                tableCheck.attr({ 'name': tableCheck.prop('name') + '-' + (i + 1), 'id': tableCheck.prop('id') + '-' + (i + 1) })
                                tableCheck.next('label').attr('for', tableCheck.prop('id'))

                            }
                            check = false;
                        }
                    }
                }
                if (e.target.parentNode.parentNode === tr[i]) {
                    addTableNum = i
                }
            }
            clone.insertAfter($(`#${table} tbody > tr`).eq(addTableNum));
            $(`#${table} tbody > tr .remove-row`).eq(1).show()

            for (const key in uploadFiles) {
                const addTableFile = { [key]: { [String(addTableNum + 1)]: [] } };
                if ($(`#${table} tbody tr:eq(0) #${key}`).length !== 0) {
                    for (let i = addTableNum + 2; i < $(`#${table} tbody tr`).length; i++) {
                        addTableFile[key][String(i)] = uploadFiles[key][String(i - 1)] ? uploadFiles[key][String(i - 1)] : []
                    }

                    for (const i in addTableFile[key]) {
                        uploadFiles[key][i] = addTableFile[key][i]
                    }

                    break;
                }
            }
        })

        $('.remove-row').click((e) => {
            const table = e.target.parentNode.parentNode.parentNode.parentNode.id;
            const tr = document.querySelectorAll(`#${table} tbody > tr`)
            let removeRow = 0;
            for (let i = 0; i < tr.length; i++) {
                if (e.target.parentNode.parentNode === tr[i]) {
                    $(`#${table} tbody > tr`).eq(i).remove();
                    removeRow = i;
                    break;
                }
            }

            for (const key in uploadFiles) {
                if ($(`#${table} tbody tr:eq(0) #${key}`).length !== 0) {
                    for (let i = removeRow; i < $(`#${table} tbody tr`).length; i++) {
                        uploadFiles[key][String(i)] = uploadFiles[key][String(i + 1)] ? uploadFiles[key][String(i + 1)] : []
                    }
                    break;
                }
            }

            if ($(`#${table} tbody > tr`).length === 2) {
                $(`#${table} tbody > tr .remove-row`).eq(1).hide()
            }
        })

        $('input[type="file"]').change((e) => {
            const files = e.target.files;

            if (e.target.parentNode.parentNode.parentNode.className !== 'kintoneplugin-table-td-control-value') {
                const id = e.target.parentNode.parentNode.parentNode.id

                for (let i = 0; i < files.length; i++) {
                    if (files[i].size >= 1048576 * 20) {
                        alert(`${files[i].name}は20MB以上のためアップロードできません。`);
                    } else {
                        $('#file-names' + id).append($('<div>').text(files[i].name).append($('<button>').attr('class', 'upload-cansel-button').text('×')));
                        uploadFiles[id].push(files[i]);
                    }
                }
            } else {
                const table = e.target.closest('.edit-table').id;

                const id = e.target.id;

                for (let i = 1; i < document.querySelectorAll(`#${table} tbody tr`).length; i++) {

                    if (document.querySelectorAll(`#${table} tbody tr`)[i] === e.target.closest('tr')) {

                        for (let j = 0; j < files.length; j++) {
                            if (files[j].size >= 1048576 * 20) {
                                alert(`${files[j].name}は20MB以上のためアップロードできません。`);
                            } else {
                                $(`#${table} tbody tr:eq(${i}) #file-names${id}`).append($('<div>').text(files[j].name).append($('<button>').attr('class', 'upload-cansel-button').text('×')))
                                uploadFiles[id][String(i)].push(files[j])
                            }

                        }
                    }
                }
            }
        })

        $('.delete-files').off('click').click((e) => {
            files: for (const key in uploadFiles) {
                if (uploadFiles[key].length) {
                    for (let i = 0; i < uploadFiles[key].length; i++) {
                        if (uploadFiles[key][i].fileKey === e.target.id) {
                            uploadFiles[key].splice(i, 1)
                            e.target.parentNode.remove();
                            break files;
                        }
                    }
                } else {
                    for (const i in uploadFiles[key]) {
                        for (let j = 0; j < uploadFiles[key][i].length; j++) {
                            if (uploadFiles[key][i][j].fileKey === e.target.id) {
                                uploadFiles[key][i].splice(j, 1);
                                e.target.parentNode.remove();
                                break files;
                            }
                        }
                    }
                }
            }
        })

        $('body').off('click').click((e) => {
            const click = e.originalEvent.target
            if (click.className === 'upload-cansel-button') {
                const id = click.parentNode.parentNode.id.replace('file-names', '');

                if (click.parentNode.parentNode.parentNode.parentNode.className !== 'kintoneplugin-table-td-control-value') {
                    for (let i = 0; i < uploadFiles[id].length; i++) {
                        if (uploadFiles[id][i].name === click.parentNode.innerText.replace(/×$/, '')) {
                            uploadFiles[id].splice(i, 1);
                            break;
                        }
                    }
                    click.parentNode.remove();
                } else {
                    table: for (let i = 0; i < $('.edit-table').length; i++) {
                        if ($(`.edit-table:eq(${i}) #${id}`).length !== 0) {
                            const table = $(`.edit-table:eq(${i})`).prop('id')
                            for (let j = 1; j < document.querySelectorAll(`#${table} tbody tr`).length; j++) {
                                if (click.closest('tr') === document.querySelectorAll(`#${table} tbody tr`)[j]) {

                                    for (let k = 0; k < uploadFiles[id][String(j)].length; k++) {
                                        if (uploadFiles[id][String(j)][k].name === click.parentNode.innerText.replace(/×$/, '')) {
                                            uploadFiles[id][String(j)].splice(k, 1)
                                            break;
                                        }
                                    }
                                    click.parentNode.remove();

                                    break table;
                                }
                            }
                        }
                    }
                }
            }
        })

        $('#record_save').off('click').click(async () => {
            $('.loading-content').attr('class', 'loading-content')
            try {
                record = await detailSave(mapConfig, recordId, record, domain, uploadFiles, field)
                console.log(record)
                fileImageURLs = await showDetail(kintoneLayout, fileImageURLs, field, config.domain, mapConfig, record);
            } catch (error) {
                $('.loading-content').attr('class', 'loading-content loaded')

                alert(error.message);
                console.error(error)
            }

        })

        $('#record_cansel').off('click').click(async () => {
            $('#detail_buttons').css('display', 'block')
            $('#record_buttons').css('display', 'none')
            $('#kintone_detail').empty();

            fileImageURLs = await showDetail(kintoneLayout, fileImageURLs, field, config.domain, mapConfig, record);
        })

        $('.delete-image').click((e) => {
            deleteFiles.push(e.target.id);
            e.target.parentNode.remove();
        })
    } catch (error) {
        $('.loading-content').attr('class', 'loading-content loaded')

        alert(error.message);
        console.error(error)
    }
});

$('#back_map').click(() => {
    const latitude = record.record[mapConfig.latitude].value;
    const longitude = record.record[mapConfig.longitude].value;

    showMapInformation.latitude = latitude
    showMapInformation.longitude = longitude
    localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
    window.location.href = `../`;
});