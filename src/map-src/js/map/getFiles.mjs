import { uploadFile } from "../kintoneAPI.mjs";
import $ from "jquery"

let getFiles = {};

/**
 * exif情報を取得する
 * @param {File} file ファイルの情報
 * @param {Object} config マップの設定
 * @param {object} recordsResp まぷのレコード
 */
const getFileExif = async (file, config, recordsResp) => {
    let fileReader = new FileReader();
    fileReader.onload = async function (e) {
        if (Object.keys(getFiles).length < 100) {
            // ====== exif情報の取得
            const bytes = e.target.result;
            const exif = EXIF.readFromBinaryFile(bytes);
            console.log(exif)

            if (exif) {
                let checkFile = true
                let breakCheck = false;
                if (config.addImage.checkRegistration) {
                    recordsResp.forEach(records => {
                        if (breakCheck) {
                            return;
                        }
                        records.forEach(record => {
                            if (breakCheck) {
                                return;
                            }
                            for (let i = 0; i < record[config.addImage.imageField].value.length; i++) {
                                if (record[config.addImage.imageField].value[i].name === file.name) {
                                    checkFile = confirm(`${file.name}はすでに登録されています。登録を行いますか?`);
                                    breakCheck = true;
                                    break;
                                }
                            }
                        })
                    })
                }
                if (checkFile) {

                    let DATETIME = exif['DateTimeOriginal'];
                    const latMinSec = exif['GPSLatitude'];
                    let degMinSec = String(latMinSec).split(",");
                    let latitude = degMinSec[0] / 1 + degMinSec[1] / 60 + degMinSec[2] / 3600;
                    latitude = Math.round(latitude * 100000) / 100000;
                    const lngMinSec = exif['GPSLongitude'];
                    degMinSec = String(lngMinSec).split(",");
                    let longitude = degMinSec[0] / 1 + degMinSec[1] / 60 + degMinSec[2] / 3600;
                    longitude = Math.round(longitude * 100000) / 100000;

                    if (!latMinSec || !lngMinSec) {
                        if (config.addImage.checkRegistration && config.addImage.RegistrationAllImage) {
                            $('#image_modal #modal_body #add_image_button').before($(`
                                <div class="image-bodys">
                                    <div style="margin-bottom: 10px">
                                        <div class="input-title">ピンの名前</div>
                                        <input type="text" value="${file.name.replace(/\..*$/, '')}" placeholder="ピンの名前を入力してください。" class="kintoneplugin-input-text pin-name">
                                    </div>
                                    <div style="display: flex">
                                        <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                                        <div>
                                            <div class="input-title">ファイル名</div>
                                            <input type="text" value="${file.name}" placeholder="ファイル名を入力してください。" class="kintoneplugin-input-text new-file-name">
                                        </div>
                                        <button class="delete-file" id="${file.name}">×</button>
                                    </div>
                                </div>
                            `))
                            getFiles[file.name] = {
                                file: file,
                                exif: false
                            };
                            $(`.delete-file`).off('click').click(function () {
                                delete getFiles[$(this).prop('id')]
                                $(this).parents('.image-bodys').remove()
                            })

                            $('.new-file-name').change(function () {
                                $(this).parents('.image-bodys').find('.pin-name').val($(this).val().replace(/\..*$/, ''))
                            })
                        }
                    } else {
                        if (DATETIME) {
                            DATETIME = DATETIME.replace(':', '-').replace(':', '-');
                        }
                        $('#image_modal #modal_body #add_image_button').before($(`
                            <div class="image-bodys">
                                <div style="margin-bottom: 10px">
                                    <div class="input-title">ピンの名前</div>
                                    <input type="text" value="${file.name.replace(/\..*$/, '')}" placeholder="ピンの名前を入力してください。" class="kintoneplugin-input-text pin-name">
                                </div>
                                <div style="display: flex">
                                    <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                                    <div>
                                        <div class="image-datetime">${DATETIME}</div>
                                        <div class="input-title file-name">ファイル名</div>
                                        <input type="text" value="${file.name}" placeholder="ファイル名を入力してください。" class="kintoneplugin-input-text new-file-name">
                                    </div>
                                    <button class="delete-file" id="${file.name}">×</button>
                                </div>
                            </div>
                        `))

                        const fileExif = {
                            latitude: latitude,
                            longitude: longitude,
                            datetime: DATETIME ? DATETIME.replace(' ', 'T') + 'Z' : null
                        }

                        getFiles[file.name] = {
                            file: file,
                            exif: fileExif
                        };
                        $(`.delete-file`).off('click').click(function () {
                            delete getFiles[$(this).prop('id')]
                            $(this).parents('.image-bodys').remove()
                        })

                        $('.new-file-name').change(function () {
                            $(this).parents('.image-bodys').find('.pin-name').val($(this).val().replace(/\..*$/, ''))
                        })
                    }
                }
            } else if (config.addImage.checkRegistration && config.addImage.RegistrationAllImage) {
                let checkFile = true
                let breakCheck = false;
                if (config.addImage.checkRegistration) {
                    recordsResp.forEach(records => {
                        if (breakCheck) {
                            return;
                        }
                        records.forEach(record => {
                            if (breakCheck) {
                                return;
                            }
                            for (let i = 0; i < record[config.addImage.imageField].value.length; i++) {
                                if (record[config.addImage.imageField].value[i].name === file.name) {
                                    checkFile = confirm(`${file.name}はすでに登録されています。登録を行いますか?`);
                                    return;
                                }
                            }
                        })
                    })
                }

                if (checkFile) {
                    $('#image_modal #modal_body #add_image_button').before($(`
                        <div class="image-bodys">
                            <div style="margin-bottom: 10px">
                                <div class="input-title">ピンの名前</div>
                                <input type="text" value="${file.name.replace(/\..*$/, '')}" placeholder="ピンの名前を入力してください。" class="kintoneplugin-input-text pin-name">
                            </div>
                            <div style="display: flex">
                                <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                                <div>
                                    <div class="input-title">ファイル名</div>
                                    <input type="text" value="${file.name}" placeholder="ファイル名を入力してください。" class="kintoneplugin-input-text new-file-name">
                                </div>
                                <button class="delete-file" id="${file.name}">×</button>
                            </div>
                        </div>
                    `))
                    getFiles[file.name] = {
                        file: file,
                        exif: false
                    };
                    $(`.delete-file`).off('click').click(function () {
                        delete getFiles[$(this).prop('id')]
                        $(this).parents('.image-bodys').remove()
                    })

                    $('.new-file-name').change(function () {
                        $(this).parents('.image-bodys').find('.pin-name').val($(this).val().replace(/\..*$/, ''))
                    })
                }
            } else {
                $('.error-message').append(`<p>${file.name}は緯度・経度を取得できません。</p>`)
            }
            // ====== exif情報の取得
            // var width = exif['PixelXDimension'];
            // var height = exif['PixelYDimension'];
            // var 撮影日時 = exif['DateTimeOriginal'];
            // 撮影日時 = 撮影日時.substr(0, 10);
            // var 緯度分秒 = exif['GPSLatitude'];
            // var 度分秒 = String(緯度分秒).split(",");
            // var 緯度 = 度分秒[0] / 1 + 度分秒[1] / 60 + 度分秒[2] / 3600;
            // 緯度 = Math.round(緯度 * 100000) / 100000;
            // var 経度分秒 = exif['GPSLongitude'];
            // 度分秒 = String(経度分秒).split(",");
            // var 経度 = 度分秒[0] / 1 + 度分秒[1] / 60 + 度分秒[2] / 3600;
            // 経度 = Math.round(経度 * 100000) / 100000;

        } else {
            $('.error-message').html('<p>一度に保存できる枚数は100件までです。</p>')
        }

        console.log(Object.keys(getFiles).length)
        if (Object.keys(getFiles).length === 0) {
            $('#save_files').attr('disabled', true)
        } else {
            $('#save_files').attr('disabled', false)
        }
    };
    fileReader.readAsArrayBuffer(file);
}

/**
 * 画像を登録する
 * @param {object} config マップの設定
 * @param {string} domain kintoneのドメイン
 * @returns 新しいレコード
 */
export const postImageRecords = async (config, domain) => {
    if (Object.keys(getFiles).length === 0) {
        $('.error-message').html('<p>保存する画像がありません。</p>');
        return [];
    } else {
        const postRecordBodys = {
            app: config.appId,
            records: []
        }
        let count = 0;
        let skipNum = 0;
        let nameCheck = false;
        for (const key in getFiles) {
            const getFile = getFiles[key]
            postRecordBodys.records.push({})

            const pinName = $('.pin-name').eq(count).val().replace(/\s/, '');
            if (pinName !== '' || nameCheck) {
                postRecordBodys.records[count - skipNum][config.name] = { value: pinName }
            } else if (!nameCheck && skipNum === 0) {
                nameCheck = confirm('ピンの名前が未入力の画像があります。登録を行いますか?')
                if (!nameCheck) {
                    postRecordBodys.records.pop()
                    skipNum++;
                    count++;
                    continue;
                }
            } else if (!nameCheck && skipNum >= 1) {
                postRecordBodys.records.pop()
                skipNum++;
                count++;
                continue;
            }

            if (getFile.exif) {
                postRecordBodys.records[count - skipNum][config.latitude] = { value: getFile.exif.latitude }
                postRecordBodys.records[count - skipNum][config.longitude] = { value: getFile.exif.longitude }
            }

            if (config.addImage.checkRegistration) {
                let fileName = $('.new-file-name').eq(count).val().replace(/\s/, '')
                if (fileName === '') {
                    fileName = getFile.file.name
                } else if (!fileName.match(/\.\w*$/)) {
                    fileName = fileName + '.' + getFile.file.name.replace(/.*\./g, '')
                }
                const fileKey = await uploadFile(domain, config.token, getFile.file, '../kintone/uploadFile', fileName);
                postRecordBodys.records[count][config.addImage.imageField] = { value: [fileKey] }
            }
            if (config.addImage.imageDateTime && getFile.exif) {
                const nowZone = luxon.DateTime.now().setZone('Asia/Tokyo');
                if (getFile.exif.datetime) {
                    const datetime = luxon.DateTime.fromISO(getFile.exif.datetime).setZone('utc').minus({ hours: Number(nowZone.o / 60) }).toFormat('yyyy-MM-dd\'T\'HH:mm\'Z\'');
                    postRecordBodys.records[count][config.addImage.imageDateTimeField] = { value: datetime }
                } else {
                    postRecordBodys.records[count][config.addImage.imageDateTimeField] = { value: null }
                }
            }
            count++;
        }

        if (postRecordBodys.records.length !== 0) {
            console.log(postRecordBodys)
            const postRecordsResp = await fetch(`../kintone/postRecords`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ domain: domain, token: config.token, records: postRecordBodys })
            })

            const postResp = await postRecordsResp.json();
            console.log(postResp)

            const getRecordBody = {
                app: config.appId,
                query: `$id >= ${Number(postResp.ids[0])}`
            }

            const getRecordsResp = await fetch(`../kintone/getNewRecords`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ domain: domain, token: config.token, body: getRecordBody })
            });

            const getRecords = await getRecordsResp.json();

            $('#glay_out').remove()
            getFiles = {}
            return getRecords.records;
        } else {
            //登録するレコードがないとき、レコードの登録を行わずに終了する
            $('#glay_out').remove()
            getFiles = {}
            return [];
        }
    }
}

export const showGetFileModal = async (files, config, recordsResp) => {
    getFiles = {}
    let text = '以下の画像と位置情報を保存します。'
    if (!config.addImage.checkRegistration) {
        text = '以下の画像の位置情報を保存します。'
    }

    const modal = `
                <div id="glay_out">
                    <div id="image_modal">
                        <div id="modal_header">
                            <div class="header-message">${text}</div>
                        </div>
                        <div id="modal_body">
                            <button id="add_image_button">画像を追加</button>
                            <input type="file" id="add_image" style="display: none" multiple>
                            <div class="error-message" style="color: red;"></div>
                        </div>
                        <div id="modal_footer">
                            <button class="kintoneplugin-button-dialog-cancel" id="input_cancel">キャンセル</button>
                            <button class="kintoneplugin-button-dialog-ok" id="save_files">登録</button>
                        </div>
                    </div>
                </div>
                `

    $('body').append($(modal))

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (file.type.indexOf('image') !== -1) {
            await getFileExif(file, config, recordsResp)
        }
    }

    $('#input_cancel').click(() => {
        $('#input_image').val('')
        $('#glay_out').remove()
        return [];
    })

    $('#add_image_button').click(() => {
        $('#add_image').click()
    })

    $('#add_image').off('change').change(async function (e) {
        $('.error-message').html('')
        const addFiles = e.target.files
        for (let i = 0; i < addFiles.length; i++) {
            const file = addFiles[i]
            if (file.type.indexOf('image') !== -1) {
                const checkFile = Object.keys(getFiles).includes(file.name);

                if (!checkFile) {
                    await getFileExif(file, config, recordsResp)
                }
            }
        }
    })
}
