import { getBoundingBox, getMapViewDistanceKm } from "./coordinate.mjs";
// import { data } from "../kintoneAPI.mjs";
import { domainText } from "./map.mjs";
import { checkRecord } from './marker.mjs';

let showMarkers = {};
/**
 * hsvを16進数のカラーコードに直す
 * @param {*} h
 * @param {*} s
 * @param {*} v
 * @returns 16進数のカラーコード
 */
function hsvToRgb(h, s, v) {
    h = h % 360; // Hは0-360の範囲に制限
    s = Math.max(0, Math.min(100, s)); // Sは0-100の範囲に制限
    v = Math.max(0, Math.min(100, v)); // Vは0-100の範囲に制限

    s /= 100;
    v /= 100;

    let c = v * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = v - c;
    let r, g, b;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else {
        r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * 16進数に直す
 * @param {*} c
 * @returns
 */
function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
/**
 * ほかのマップに設定されているレイヤーを表示する
 * @param {object} config マップの設定
 * @param {object} otherLayer 閲覧権限のあるマップ
 * @param {object} map マップ
*/
export const createOtherMapModal = async (config, otherLayer, map, configName) => {
    let pickrs = {}
    const localStorageKey = `${domainText}-${config[configName].mapTitle}`
    let showOtherLayers = JSON.parse(localStorage.getItem(localStorageKey)) ? JSON.parse(localStorage.getItem(localStorageKey)) : { datetime: Number(Date.now()) }

    if (showOtherLayers.datetime) {
        if (Date.now() - (24 * 60 * 60 * 1000) > showOtherLayers.datetime) {
            localStorage.removeItem(localStorageKey);
            showOtherLayers = { datetime: Number(Date.now()) };
        }
    }
    let markerLayers = {}; //表示するマーカーを保存する

    const tableDiv = $('<div>').attr('class', 'other-layer-table-div');
    const tableDivClone1 = tableDiv.clone(true)
    $('#map-layers .select-options').append(tableDivClone1);

    const table = $('<table>').attr('id', 'other_layer_table');
    const tableClone1 = table.clone(true);
    tableDivClone1.append(tableClone1);

    const tbody = $('<tbody>')
    const tbodyClone1 = tbody.clone(true);
    tableClone1.append(tbodyClone1);
    for (let i = 0; i < otherLayer.length; i++) {
        const body = $(`
            <tr id="${otherLayer[i]}_layers">
                <td>
                    <input type="checkbox" class="other-map-layer" name="other-map-layer" value="${otherLayer[i]}" id="${otherLayer[i]}">
                </td>
                <td>
                    <div class="other-map-layer-color"></div>
                </td>
                <td>
                    <label for="${otherLayer[i]}" class="other-map-layer-name">${config[otherLayer[i]].mapTitle}</label>
                </td>
            </tr>`)

        tbodyClone1.append(body.clone(true))

        let defaultColor = '#00ccff';

        if (showOtherLayers[otherLayer[i]]) {
            if (showOtherLayers[otherLayer[i]].configName === config[otherLayer[i]].mapTitle) {
                defaultColor = showOtherLayers[otherLayer[i]].color
            }
        }

        const pickr1 = new Pickr({
            el: `#menu #${otherLayer[i]}_layers .other-map-layer-color`,
            theme: 'nano',
            default: defaultColor,
            // コンポーネントの表示設定
            components: {
                preview: true, //現在のカラー
                hue: true, //色相バー

                interaction: {
                    input: true, //カラー値の出力を表示
                } //色の出力設定
            },
            closeWithKey: 'Enter',
        });

        pickr1.on('change', (color, source, instance) => {
            const rgbColor = hsvToRgb(color.h, color.s, color.v)
            $(`#${otherLayer[i]}_layers .pickr .pcr-button`).css('--pcr-color', rgbColor)
        })

        pickrs[otherLayer[i]] = {
            pickr1: pickr1,
        }
    }
    const buttonArea = $('<div>').attr('class', 'other-layer-buttons').css('display', 'flex');
    const button = $('<button>').attr('id', 'show_other_layer').text('表示');
    const cancellationButton = $('<button>').attr('id', 'cancellation_other_layer').text('解除');
    buttonArea.append(button);
    buttonArea.append(cancellationButton);
    $('#map-layers .select-options').append(buttonArea.clone(true));

    // 現在の中心を取得
    const center = map.getCenter();
    const centerLat = center.lat;
    const centerLng = center.lng;

    // 表示されている距離を取得
    const dist = getMapViewDistanceKm(map);

    const latLngBox = getBoundingBox(centerLat, centerLng, dist)

    for (const key in showOtherLayers) {
        if (key === 'datetime') {
            continue;
        }
        const showLayer = showOtherLayers[key]
        if (showLayer.showMap && $(`.select-options input#${key}`).length >= 1 && showLayer.configName === config[key].mapTitle) {
            $(`.select-options input#${key}`).attr('checked', true).prop('checked', true).change();

            const query = `${config[key].latitude} != "" and ${config[key].longitude} != ""`

            // const recordsResp = await data(config[key].appId, config[key].token, config.domain, query, config[key].id);
            let recordsResps = await window.fetch("../kintone/getRecords", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ app: config[key].appId, token: config[key].token, domain: config.domain, query: query })
            });
            const recordsResp = await recordsResps.json();
            console.log(recordsResp)
            if (!recordsResp) {
                alert(`${config[key].mapTitle}の表示に失敗しました。`)
                $(`.select-options input#${key}`).attr('checked', false).prop('checked', false).change();
                showOtherLayers[key].showMap = false;
                continue;
            }

            markerLayers[key] = [];
            showMarkers[key] = [];
            recordsResp.forEach(async (records) => {
                records.forEach(async record => {
                    if (!checkRecord(record, config[key])) {
                        //絞り込み条件に該当しないものは処理を終える
                        return {};
                    }
                    const popup = await createPopup(record, config[key])

                    const marker = L.circleMarker([record[config[key].latitude].value, record[config[key].longitude].value],
                        {
                            color: '#ffffff00',
                            fillColor: showLayer.color,
                            fillOpacity: 1,
                            radius: 9,
                        });

                    //マーカーの名前を作成
                    const markerName = L.marker([record[config[key].latitude].value, record[config[key].longitude].value], {
                        icon: L.divIcon({
                            html: '<div class="marker-label" style="font-size: small">' + record[config[key].name].value + '</div>',
                            iconSize: [0, 0],
                            iconAnchor: [14, 26], // アイコンのアンカー位置
                            className: 'marker-title'
                        })
                    })

                    const inside = (latLngBox.minLat < Number(record[config[key].latitude].value) && latLngBox.maxLat > Number(record[config[key].latitude].value) &&
                        latLngBox.minLng < Number(record[config[key].longitude].value) && latLngBox.maxLng > Number(record[config[key].longitude].value))
                    if (inside) {
                        marker.addTo(map)
                        markerName.addTo(map)
                    }
                    markerLayers[key].push(marker);
                    markerLayers[key].push(markerName);
                    showMarkers[key].push(marker)
                    showMarkers[key].push(markerName)
                    const googleMap = `https://www.google.com/maps/search/${record[config[key].latitude].value},${record[config[key].longitude].value}/${record[config[key].latitude].value},${record[config[key].longitude].value},18.5z?entry=ttu&g_ep=EgoyMDI0MTExMi4wIKXMDSoASAFQAw%3D%3D`

                    marker.bindPopup(`<div>${popup}</div><a href="${googleMap}" target="_blank">グーグルマップに遷移する</a>`);
                })
            })
        } else if (!showLayer.showMap && $(`.select-options input#${key}`).length >= 1 && showLayer.configName === config[key].mapTitle) {
            $(`.select-options input#${key}`).parent().next().children('input').val(showLayer.color);
        }
    }

    //表示ボタンがクリックされたとき
    $('#map-layers .select-options #show_other_layer').off('click').click(async () => {
        $('.loading-content').attr('class', 'loading-content').css('background-color', '#ffffff6c');

        showMarkers = {};
        // 現在の中心を取得
        const center = map.getCenter();
        const centerLat = center.lat;
        const centerLng = center.lng;

        // 表示されている距離を取得
        const dist = getMapViewDistanceKm(map);

        const latLngBox = getBoundingBox(centerLat, centerLng, dist)

        //すべてのマーカーを削除
        for (const key in markerLayers) {
            markerLayers[key].forEach((marker) => {
                map.removeLayer(marker);
                showOtherLayers[key].showMap = false
            })
        }

        const values = $('#map-layers .select-options input[name="other-map-layer"]:checked');

        for (let i = 0; i < values.length; i++) {
            const value = values.eq(i).val();

            const color = values.eq(i).parent().next().find('.pcr-button').css('--pcr-color');

            showOtherLayers[value] = {
                configName: config[value].mapTitle,
                color: color,
                showMap: true
            }
            showMarkers[value] = [];

            if (markerLayers[value]) {
                //すでに1度でも表示したマーカーの場合、レコード取得を行わない
                markerLayers[value].forEach((marker) => {
                    marker.options.fillColor = color;
                    const inside = (latLngBox.minLat < Number(marker['_latlng'].lat) && latLngBox.maxLat > Number(marker['_latlng'].lat) &&
                        latLngBox.minLng < Number(marker['_latlng'].lng) && latLngBox.maxLng > Number(marker['_latlng'].lng))
                    if (inside) {
                        marker.addTo(map)
                    }
                    showMarkers[value].push(marker)
                })
            } else {
                //始めて表示するマーカーの場合、レコードの取得を行いマーカーを表示する
                const query = `${config[value].latitude} != "" and ${config[value].longitude} != ""`

                // const recordsResp = await data(config[value].appId, config[value].token, config.domain, query, config[value].id);
                let recordsResps = await window.fetch("../kintone/getRecords", {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ app: config[value].appId, token: config[value].token, domain: config.domain, query: query })
                });
                const recordsResp = await recordsResps.json();
                console.log(recordsResp)

                if (!recordsResp) {
                    alert(`${config[value].mapTitle}の表示に失敗しました。`)
                    values.eq(i).attr('checked', false).prop('checked', false).change();
                    showOtherLayers[value].showMap = false;
                    continue;
                }

                markerLayers[value] = [];
                recordsResp.forEach(async (records) => {
                    records.forEach(async record => {
                        if (!checkRecord(record, config[value])) {
                            //絞り込み条件に該当しないものは処理を終える
                            return {};
                        }
                        const popup = await createPopup(record, config[value])
                        const marker = L.circleMarker([record[config[value].latitude].value, record[config[value].longitude].value],
                            {
                                color: '#ffffff00',
                                fillColor: color,
                                fillOpacity: 1,
                                radius: 9,
                            });

                        //マーカーの名前を作成
                        const markerName = L.marker([record[config[value].latitude].value, record[config[value].longitude].value], {
                            icon: L.divIcon({
                                html: '<div class="marker-label" style="font-size: small">' + record[config[value].name].value + '</div>',
                                iconSize: [0, 0],
                                iconAnchor: [14, 26], // アイコンのアンカー位置
                                className: 'marker-title'
                            })
                        })

                        const inside = (latLngBox.minLat < Number(record[config[value].latitude].value) && latLngBox.maxLat > Number(record[config[value].latitude].value) &&
                            latLngBox.minLng < Number(record[config[value].longitude].value) && latLngBox.maxLng > Number(record[config[value].longitude].value))
                        if (inside) {
                            marker.addTo(map)
                            markerName.addTo(map)
                        }
                        markerLayers[value].push(marker);
                        markerLayers[value].push(markerName);
                        showMarkers[value].push(marker)
                        showMarkers[value].push(markerName)

                        const googleMap = `https://www.google.com/maps/search/${record[config[value].latitude].value},${record[config[value].longitude].value}/${record[config[value].latitude].value},${record[config[value].longitude].value},18.5z?entry=ttu&g_ep=EgoyMDI0MTExMi4wIKXMDSoASAFQAw%3D%3D`

                        marker.bindPopup(`<div>${popup}</div><a href="${googleMap}" target="_blank">グーグルマップに遷移する</a>`);
                    })
                })
            }
        }
        $('#map-layers .select-options').css('display', 'none') //選択するモーダルを隠す
        $('.loading-content').attr('class', 'loading-content loaded')
        localStorage.setItem(localStorageKey, JSON.stringify(showOtherLayers));
        return;
    })

    //解除ボタンがクリックされたとき
    $('#map-layers .select-options #cancellation_other_layer').off('click').click(() => {
        //現在表示されていたものを非表示にする
        showMarkers = {};
        for (const key in markerLayers) {
            $(`.select-options input#${key}`).attr('checked', false).prop('checked', false).change();
            markerLayers[key].forEach((marker) => {
                map.removeLayer(marker);
            })

            showOtherLayers[key].showMap = false;
        }

        $('#map-layers .select-options').css('display', 'none') //選択するモーダルを隠す
        localStorage.setItem(localStorageKey, JSON.stringify(showOtherLayers));

        return;
    })

    //ラベルをクリックした時、チェックボックスを操作する
    $('#other_layer_table label').off('click').click((e) => {
        const check = $(`input#${e.target.htmlFor}`).prop('checked')
        $(`.select-options input#${e.target.htmlFor}`).attr('checked', !check).prop('checked', !check).change();
        return;
    })

    $('input[name="other-map-layer"]').off('click').click((e) => {
        const check = e.target.checked ? true : false

        $(`.select-options input#${e.target.value}`).attr('checked', check).prop('checked', check).change();
        return;
    })
}

export const showOtherLayersMakers = (latLngBox, map) => {
    for (const key in showMarkers) {
        showMarkers[key].forEach(marker => {
            const inside = (latLngBox.minLat < Number(marker['_latlng'].lat) && latLngBox.maxLat > Number(marker['_latlng'].lat) &&
                latLngBox.minLng < Number(marker['_latlng'].lng) && latLngBox.maxLng > Number(marker['_latlng'].lng))
            if (inside) {
                marker.addTo(map);
            } else {
                map.removeLayer(marker);
            }
        })
    }
}

/**
 * 他のマップのピンのポップアップを作成しる
 * @param {*} record
 * @param {*} config
 * @returns
 */
function createPopup(record, config) {

    //ポップアップを作成
    let popup = `<div
    style="font-weight: bold;
    font-size: larger;
    margin-bottom: 3px;">${record[config.name].value}</div><div id="popup_body">`

    let popupTable = `<table id="popup_table">
                                <thead id="popup_table_header">
                                    <tr>
                                        <th>フィールド名</th>
                                        <th>入力値</th>
                                    </tr>
                                </thead>
                                <tbody id="popup_table_body">`

    for (let j = 1; j <= config.popup_row_num; j++) {
        let tbody = `<tr>`
        //dropbox以外の時
        switch (record[config['popup_row' + j].popupField].type) {
            case 'CREATOR': //作成者
            case 'MODIFIER': //更新者
                tbody += `<td>
                                  <div class="field-name">
                                      <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
                                  </div>
                              </td>
                              <td>
                                  <div class="field-value">
                                      <span class="field-value">${record[config['popup_row' + j].popupField].value.name}</span>
                                  </div>
                              </td>`
                break;

            case 'DATETIME': //日時
            case 'CREATED_TIME': //作成日時
            case 'UPDATED_TIME': //更新日時
                let datetime = '';
                if (record[config['popup_row' + j].popupField].value !== '') {
                    datetime = luxon.DateTime.fromISO(record[config['popup_row' + j].popupField].value).toFormat('yyyy/MM/dd HH:mm');
                }

                tbody += `<td>
                                  <div class="field-name">
                                      <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
                                  </div>
                              </td>
                              <td>
                                  <div class="field-value">
                                      <span class="field-value">${datetime}</span>
                                  </div>
                              </td>`
                break;

            case 'MULTI_SELECT': //複数選択
            case 'CHECK_BOX': //チェックボックス
            case 'CATEGORY': //カテゴリー
                let multiValue = ''
                if (record[config['popup_row' + j].popupField].value.length >= 1) {
                    multiValue = record[config['popup_row' + j].popupField].value.map((resp) => { return resp }).join(',')
                }

                tbody += `<td>
                                  <div class="field-name">
                                      <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
                                  </div>
                              </td>
                              <td>
                                  <div class="field-value">
                                      <span class="field-value">${multiValue}</span>
                                  </div>
                              </td>`
                break;

            case 'USER_SELECT': //ユーザー選択
            case 'ORGANIZATION_SELECT': //組織選択
            case 'GROUP_SELECT': //グループ選択
            case 'STATUS_ASSIGNEE': //作業者
                let usersValue = '';
                if (record[config['popup_row' + j].popupField].value.length >= 1) {
                    usersValue = record[config['popup_row' + j].popupField].value.map((resp) => { return resp.name }).join(',');
                }

                tbody += `<td>
                                  <div class="field-name">
                                      <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
                                  </div>
                              </td>
                              <td>
                                  <div class="field-value">
                                      <span class="field-value">${usersValue}</span>
                                  </div>
                              </td>`
                break;

            case 'FILE':
                let files = ''
                if (record[config['popup_row' + j].popupField].value.length >= 1) {
                    files = record[config['popup_row' + j].popupField].value.map((resp) => { return resp.name }).join(',')
                }
                tbody += `<td>
                                <div class="field-name">
                                    <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
                                </div>
                            </td>
                            <td>
                                <div class="field-value">
                                    <span class="field-value">${files}</span>
                                </div>
                            </td>`
                break;

            default:
                let value = '';

                if (record[config['popup_row' + j].popupField].value !== null) {
                    value = record[config['popup_row' + j].popupField].value
                }
                tbody += `<td>
                                <div class="field-name">
                                    <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
                                </div>
                            </td>
                            <td>
                                <div class="field-value">
                                    <span class="field-value">${value}</span>
                                </div>
                            </td>`
                break;

        }
        tbody += `</tr>`
        popupTable += tbody + `</tr>`;
    }
    popupTable += `</tbody></table>`;

    popup += `${popupTable}</div>`

    return popup;
}