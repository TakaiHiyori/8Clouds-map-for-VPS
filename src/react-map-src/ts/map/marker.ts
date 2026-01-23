// import '../index.js'

import L from 'leaflet'
import { DateTime } from 'luxon';

// import { createPopup } from "./createMarker.mjs";
// import { domainText } from "./map.mjs";
// import { createPopup, domainText } from '../index.js';

//色に合った名前
const colors: any = {
    "#ff0000": 'red',
    "#ffcccb": 'lightred',
    "#8b0000": 'darkred',
    "#ffa500": 'orange',
    "#eedcb3": 'beige',
    "#008000": 'green',
    "#006400": 'darkgreen',
    "#90ee90": 'lightgreen',
    "#0093ff": 'blue',
    "#00008b": 'darkblue',
    "#add8e6": 'lightblue',
    "#800080": 'purple',
    "#871f78": 'darkpurple',
    "#f5b2b2": 'pink',
    "#f0f8ff": 'cadetblue',
    "#ffffff": 'white',
    "#808080": 'gray',
    "#d3d3d3": 'lightgray',
    "#000000": 'black',
}

/**
 * マップ上にピンを作成する
 * @param {Array} record 取得したレコード
 * @param {object} config 設定
 * @param {string} domain ドメイン
 * @param {boolean} login ログインしているかどうか
 * @param {Array} conditions 絞り込み条件
 * @param {object} latLngBox 画面に表示されている経度緯度
 * @param {object} map マップ
 * @returns {object} マップ上に建てるピン
 * @author 髙井
 * 作成日：2025/11/10
 */
export const marker = async (record: any, config: any, domain: string, login: boolean, latLngBox: any, map: any) => {
    if (!record[config.latitude].value || !record[config.longitude].value) {
        //経度緯度が未入力の場合、処理を終える
        return {};
    }

    // if (!checkRecord(record, config)) {
    //     //絞り込み条件に該当しないものは処理を終える
    //     return {};
    // }

    let marker, markerName
    //ポップアップを作成
    // const popup = await createPopup(record, config, domain);
    if (config.marker === 'pin') {
        //マーカーを作成
        marker = L.marker([record[config.latitude].value, record[config.longitude].value])
        //マーカーの名前を作成
        markerName = L.marker([record[config.latitude].value, record[config.longitude].value], {
            icon: L.divIcon({
                html: '<div class="marker-label">' + record[config.name].value + '</div>',
                iconSize: [0, 0],
                iconAnchor: [31, 59], // アイコンのアンカー位置
                className: 'marker-title'
            })
        })
    } else {
        //マーカーの種類が円の時、円を作成
        marker = L.circleMarker([record[config.latitude].value, record[config.longitude].value], { color: '#ffd700', fillColor: '#ffd700', fillOpacity: 1, radius: 10, className: 'marker' });
        markerName = L.marker([record[config.latitude].value, record[config.longitude].value], {
            icon: L.divIcon({
                html: '<div class="marker-label">' + record[config.name].value + '</div>',
                iconSize: [0, 0],
                iconAnchor: [8, 33], // アイコンのアンカー位置
                className: 'marker-title'
            })
        })
    }

    for (let j = 1; j <= config.change_color_row_num; j++) {
        //カラーが設定されているとき
        if (config['change_color_row' + j].option === record[config.color].value) {
            // 色の設定されている選択肢と、現在の値が同じとき
            if (config.marker === 'pin') {
                const redMarker = L.AwesomeMarkers.icon({
                    prefix: 'fa',
                    icon: config['change_color_row' + j].icon,
                    markerColor: colors[config['change_color_row' + j].color],
                    iconColor: colors[config['change_color_row' + j].iconColor],
                    extraClasses: 'glyphicons-custom',
                });

                L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
                marker = L.marker([record[config.latitude].value, record[config.longitude].value], { icon: redMarker }); //マーカーの作成
            } else {
                //マーカーの種類が円の時
                marker = L.circleMarker([record[config.latitude].value, record[config.longitude].value], { color: config['change_color_row' + j].color, fillColor: config['change_color_row' + j].color, fillOpacity: 1, radius: 10, className: 'marker' });
            }
            break;
        }
    }
    //グーグルマップのURLを作成
    const googleMap = `https://www.google.com/maps/search/${record[config.latitude].value},${record[config.longitude].value}/${record[config.latitude].value},${record[config.longitude].value},18.5z?entry=ttu&g_ep=EgoyMDI0MTExMi4wIKXMDSoASAFQAw%3D%3D`

    let detailURL = `<a href="${googleMap}" target="_blank">グーグルマップ</a><a href="./detail/${record.$id.value}">詳細表示</a><button class="detail-button" id="${record.$id.value}">詳細表示</button>`

    if (!login) {
        //ログインしていないとき、詳細画面へ遷移するURLを非表示
        detailURL = `<a href="${googleMap}" target="_blank">グーグルマップに遷移する</a>`
    }
    marker.bindPopup(
        // `<div>${popup}</div>${detailURL}`
        `<div></div>${detailURL}`
    );

    const inside = (latLngBox.minLat < Number(record[config.latitude].value) && latLngBox.maxLat > Number(record[config.latitude].value) &&
        latLngBox.minLng < Number(record[config.longitude].value) && latLngBox.maxLng > Number(record[config.longitude].value))
    if (inside) {
        marker.addTo(map)
        markerName.addTo(map)
    }

    return {
        marker: marker,
        markerName: markerName
    }
}

/**
 * 絞り込みを行う
 * @param {object} record レコードの情報
 * @param {Array} conditions 条件
 * @returns
 * @author 髙井
 * 作成日：2025/11/10
 */
export const checkRecord = (record: any, config: any) => {
    if (config.narrow_row_number === 0) {
        return true;
    }
    const andor = config['narrow_row1'].andor
    let checkConditioin = true

    for (let i = 1; i <= config.narrow_row_number; i++) {
        const condition = config['narrow_row' + i]
        checkConditioin = true;
        const conditionValue = condition.value
        switch (record[condition.field].type) {
            case 'SINGLE_LINE_TEXT':
            case 'MULTI_LINE_TEXT':
            case 'LINT':
            case 'RICH_TEXT':
                let text = record[condition.field].value

                if (record[condition.field].type === 'RICH_TEXT') {
                    text = text.replace("<div>", "").replace(/<div>/g, "").replace(/<\/div>/g, "").replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, "");
                }

                switch (condition.condition) {
                    case '=':
                        checkConditioin = (text === conditionValue);
                        break;
                    case '!=':
                        checkConditioin = (text !== conditionValue);
                        break;
                    case 'match':
                        checkConditioin = (text.indexOf(conditionValue) !== -1);
                        break;
                    case 'unmatch':
                        checkConditioin = (text.indexOf(conditionValue) === -1);
                        break;
                }
                break;

            case 'NUMBER':
            case 'CALC':
            case 'RECORD_NUMBER':
                const number = record[condition.field].value

                switch (condition.condition) {
                    case '=':
                        checkConditioin = (Number(number) === Number(conditionValue));
                        break;
                    case '!=':
                        checkConditioin = (Number(number) !== Number(conditionValue));
                        break;
                    case '>=':
                        checkConditioin = (Number(number) >= Number(conditionValue));
                        break;
                    case '>':
                        checkConditioin = (Number(number) > Number(conditionValue));
                        break;
                    case '<=':
                        checkConditioin = (Number(number) <= Number(conditionValue));
                        break;
                    case '<':
                        checkConditioin = (Number(number) < Number(conditionValue));
                        break;
                }
                break;

            case 'RADIO_BUTTON':
            case 'DROP_DOWN':
            case 'STATUS':
                const value = record[condition.field].value;

                switch (condition.condition) {
                    case 'match':
                        checkConditioin = (conditionValue.indexOf(value) !== -1);
                        break;
                    case 'unmatch':
                        checkConditioin = (conditionValue.indexOf(value) === -1);
                        break;
                }
                break;

            case 'CHECK_BOX':
            case 'MULTI_SELECT':
                const values = record[condition.field].value;

                roopValue: for (let j = 0; j < conditionValue.length; j++) {
                    switch (condition.condition) {
                        case 'match':
                            checkConditioin = (values.indexOf(conditionValue[j]) !== -1);
                            if (checkConditioin) {
                                break roopValue;
                            }
                            break;
                        case 'unmatch':
                            checkConditioin = (values.indexOf(conditionValue[j]) === -1);
                            if (!checkConditioin) {
                                break roopValue;
                            }
                            break;
                    }
                }
                break;

            case 'DATE':
                const date = record[condition.field].value.replace(/\-/g, '');

                switch (condition.condition) {
                    case '=':
                        checkConditioin = (Number(date) === Number(conditionValue.replace(/\-/g, '')));
                        break;
                    case '!=':
                        checkConditioin = (Number(date) !== Number(conditionValue.replace(/\-/g, '')));
                        break;
                    case '>=':
                        checkConditioin = (Number(date) >= Number(conditionValue.replace(/\-/g, '')));
                        break;
                    case '>':
                        checkConditioin = (Number(date) > Number(conditionValue.replace(/\-/g, '')));
                        break;
                    case '<=':
                        checkConditioin = (Number(date) <= Number(conditionValue.replace(/\-/g, '')));
                        break;
                    case '<':
                        checkConditioin = (Number(date) < Number(conditionValue.replace(/\-/g, '')));
                        break;
                }
                break;

            case 'TIME':
                const time = record[condition.field].value.replace(/\:/g, '');

                switch (condition.condition) {
                    case '=':
                        checkConditioin = (Number(time) === Number(conditionValue.replace(/\:/g, '')));
                        break;
                    case '!=':
                        checkConditioin = (Number(time) !== Number(conditionValue.replace(/\:/g, '')));
                        break;
                    case '>=':
                        checkConditioin = (Number(time) >= Number(conditionValue.replace(/\:/g, '')));
                        break;
                    case '>':
                        checkConditioin = (Number(time) > Number(conditionValue.replace(/\:/g, '')));
                        break;
                    case '<=':
                        checkConditioin = (Number(time) <= Number(conditionValue.replace(/\:/g, '')));
                        break;
                    case '<':
                        checkConditioin = (Number(time) < Number(conditionValue.replace(/\:/g, '')));
                        break;
                }
                break;

            case 'DATETIME':
            case 'CREATED_TIME':
            case 'UPDATED_TIME':
                const datetime = DateTime.fromISO(record[condition.field].value);
                const conditionDatetime = DateTime.fromISO(conditionValue);

                switch (condition.condition) {
                    case '=':
                        checkConditioin = (Number(datetime) === Number(conditionDatetime));
                        break;
                    case '!=':
                        checkConditioin = (Number(datetime) !== Number(conditionDatetime));
                        break;
                    case '>=':
                        checkConditioin = (Number(datetime) >= Number(conditionDatetime));
                        break;
                    case '>':
                        checkConditioin = (Number(datetime) > Number(conditionDatetime));
                        break;
                    case '<=':
                        checkConditioin = (Number(datetime) <= Number(conditionDatetime));
                        break;
                    case '<':
                        checkConditioin = (Number(datetime) < Number(conditionDatetime));
                        break;
                }
                break;
        }

        if ((andor === 'and' && !checkConditioin) || (andor === 'or' && checkConditioin)) {
            return checkConditioin
        }

    }
    return checkConditioin;
}