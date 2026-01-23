/**
 * マップを表示する
 * @author 髙井
 */
/**
 * 修正日：2025/10/29～2025/10/31
 * 修正内容
 * 　位置情報を取得
 */
/**
 * 修正日：2025/11/07～2025/11/18
 * 追加機能
 *  絞り込み機能の追加
 */
/**
 * 修正日：2025/11/28～
 * 追加機能
 *  画像から緯度経度を取得してkintoneに登録
 */
/**
 * 修正日：2025/12/4～
 * 修正内容
 *  VPSでマップを動くようにする
 */

import '../../css/51-modern-default.css'
import '../../css/loading.css'
import '../../css/style.css'
import '../../css/multiple-select-style.css';
import './index.js'

import $ from "jquery"
// import { Button, ButtonGroup } from "@chakra-ui/react"

import { createRecordModal, createMarker, createImageModal } from './createMarker.mjs'
import { createSearchArea, addressSearch, markerSearch } from './searchRecord.mjs'
import { createOtherMapModal } from './createOtherLayer.mjs';
import { marker } from './marker.mjs';
import { getBoundingBox, getCurrentPosition, getMapViewDistanceKm, updateMarkersByCenter } from './coordinate.mjs';
import { postImageRecords, showGetFileModal } from './getFiles.mjs';
import { createDetailModal } from './createDetailModal.ts'
import { createQuery } from './createQuery.ts';
import { clickDrawLine, clickDrawCircle, clickDrawArea } from './drawOnMap.ts'
import * as turf from '@turf/turf';
import { getSHPFile } from './getSHP.js';

/** @type {boolean} ログインしているか確認する */
let login = false
/** @type {boolean} レコードを登録するボタンを押したかを確認する */
let newRecord = false
/** @type {string} マップのレイヤー */
let currentTile
/** @type {object} マップの要素など */
let map;
/** @type {Array} 他のマップのレイヤー */
const otherLayer = []
/** @type {object} ログインしたユーザーの権限 */
const authority = {
    edit: 0,
    create: 0,
};
let zoom = 18
let file = false;
let drawing = false;
let drawManuClose = false;

let drawLine = false;
let drawLineLatLng = {}
let lineStart = null

let drawCircle = false;
let drawCircleLatLng = []

let drawArea = false;
let drawAreaLatLng = {};
let areaStart = null

let allDraws = []

let allMarker = {};

let hideMarkers = []
let searchMarkers = [], leafletLayerHideMarkers = [];

/** @type {string} ドメインのテキスト */
let getDomainText = ''
/** @type {string} 公開用のマップのID取得 */
let openURL = ''
const parts = location.pathname.split('/');

for (let i = 1; i < parts.length; i++) {
    if (parts[i - 1] === 'benri') {
        //ドメインが8Cloudsmapの時、ドメインを取得
        getDomainText = parts[i];
        if (parts[i + 1] && getDomainText.indexOf('Public') !== -1) {
            openURL = parts[i + 1];
        }
        break;
    }
}

if (getDomainText === '') {
    //ドメインがないとき、エラー
    window.location.href = "../notAccess";
}

export const domainText = getDomainText;

//ローカルストレージからログイン情報を取得
export const localStorageKey = `map_${domainText}`
/** @type {object} ログイン情報 */
const checkLogin = localStorage.getItem(localStorageKey);

console.log(JSON.parse(checkLogin))
let showMapInformation = {};

if (checkLogin && domainText.indexOf('Public') === -1) {
    //ログイン情報があって公開用マップのIDがないとき
    /** @type {date} ログイン日時 */
    const loginTime = JSON.parse(checkLogin).loginTime;

    if (Date.now() - (4 * 60 * 60 * 1000) > loginTime) {
        //ログインしていた時間が、指定の時間よりも前の時、セッションを削除
        localStorage.removeItem(localStorageKey);
        window.location.href = `../${domainText}/login`;
    } else {
        $('#login_user_name').text(JSON.parse(checkLogin).userName).show()
        if (JSON.parse(checkLogin).authority === 1) {
            //ログインユーザーの権限が1(マップの設定権限がない)の時
            $('#config_button').hide()
            $('#logout-config hr').hide();
        }
        // $('#new_record').css('display', 'block');
        login = true;
        if ((/iPhone|Android.+Mobile|macintosh/).test(navigator.userAgent) || "ontouchend" in document) {
            $('#config_button').hide();
            $('#logout-config > hr').hide();
        }
    }
} else {
    //ログインが行われていないとき
    if (domainText.indexOf('Public') === -1) {
        //公開用URLでないとき
        const getDomainResp = await fetch('../getDomain', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ domain: domainText })
        })

        const getDomain = await getDomainResp.json();
        if (getDomain.success) {
            //マップのIDとあっている場合、ログイン画面に遷移
            $('#logout-config').hide();
            window.location.href = `../${domainText}/login`
        } else {
            window.location.href = `../notAccess`
        }
    } else if (openURL !== '') {
        //公開用マップのIDがあるとき、ログインの確認をgalseにする
        login = false;
    } else {
        window.location.href = "../notAccess";
    }
}

//マップ表示の情報を取得するためのキー
const showMapLocalStorageKey = `show_map_${domainText}_${JSON.parse(checkLogin)?.id}`

const getConfig = async () => {
    if (login) {
        const configResp = await window.fetch("../getConfig", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ domain: domainText, user: JSON.parse(checkLogin).id })
        });
        return await configResp.json()
    } else if (!login && openURL !== '') {
        const configResp = await window.fetch("../getPublicConfig", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ domain: domainText, openURL: openURL })
        });
        const config = await configResp.json()

        if (config.success === false) {
            window.location.href = "../notAccess";
        } else {
            return config
        }
    }
}

/** @type {object} 設定を取得 */
const config = await getConfig();
console.log(config)

/** @type {string} kintoneのドメインを取得 */
const domain = config.domain

//オプションによって表示するボタンを変更する
// if (config.addImage) {
//     $('#input_image_button').show()
// }
if (config.drawMap) {
    $('#drawing').show()
}

//表示するマップのタイル
const map1 = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

const map2 = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg', {
    attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 GRUS画像（© Axelspace）</a>'
});

const map3 = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 電子地形図</a>'
});

const map4 = L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 電子地形図（淡色地図）</a>'
});

const layerMap = {
    'OpenStreetMap': map1,
    'GRUS画像': map2,
    '電子地形図': map3,
    '淡色地図': map4,
};

/**
 * マップを表示する
 * @param {string} showMap 表示するマップの設定名
 */
async function showMap(showMap) {
    try {
        let centerLat, centerLng
        const mapConfig = config[showMap];
        console.log(mapConfig)

        const userShowMap = JSON.parse(checkLogin).showMaps.filter(map => map.config === mapConfig.id);
        console.log(userShowMap);

        let recordsResp = []

        /**
         * マップをクリックしたとき
         * @param {object} e
         */
        async function onMapClick(e) {
            //マップがクリックされたとき
            if (newRecord) {
                //レコードと登録を行うとき
                newRecord = false;
                // document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'progress';
                $('#map').css('cursor', 'progress')

                if ((/iPhone|Android.+Mobile|ipad|iPad|macintosh/).test(navigator.userAgent) || "ontouchend" in document) {
                    $('.loading-content').attr('class', 'loading-content').css('background-color', '#ffffff6c')
                }
                //newRecordがtrueのとき、モーダルを表示
                await createRecordModal(field, mapConfig, domain);
                newRecord = true
                $('.loading-content').attr('class', 'loading-content loaded')

                // document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'url(../pin.png) 1 15, auto';
                $('#map').css('cursor', 'url(../pin.png) 1 15, auto')

                $('#cancel').off('click').click(() => {
                    //キャンセルがクリックされたとき、モーダルを消す
                    $('#glay_out').remove();
                })
                $('#save').off('click').click(async () => {
                    //保存がクリックされたとき
                    const [newMarkers, newrecords] = await createMarker(e.latlng, allMarker, mapConfig, field, recordsResp, domain, login, map, domainText)
                    allMarker = newMarkers;
                    recordsResp = newrecords;
                })
            } else if (drawing) {
                //描画がonになっているとき
                if (drawLine) {
                    const objectDrawLineLatLng = Object.keys(drawLineLatLng)
                    //線の描画を行うとき
                    // let lineDragg = false;
                    // map.on('mousedown', () => {
                    //     if (!drawLine) {
                    //         return;
                    //     }
                    //     lineDragg = true;
                    //     drawLineLatLng['line1'] = {
                    //         color: '',
                    //         latlng: [[e.latlng.lat, e.latlng.lng]]
                    //     };
                    //     lineStart = L.circle([e.latlng.lat, e.latlng.lng], {
                    //         color: $('.draw-line-color').val(),       // 線の色
                    //         radius: 1        // 半径
                    //     }).addTo(map);
                    // })

                    // $('#map').on('mouseup mouseleave', () => {
                    //     if (!drawLine) {
                    //         return;
                    //     }
                    //     map.removeLayer(lineStart)
                    //     lineDragg = false;
                    // })

                    // $('#map').on('mousemove', () => {
                    //     if (lineDragg) {
                    //         if (!drawLine) {
                    //             lineDragg = false;
                    //             return;
                    //         }
                    //     }
                    // })
                    // $('#map').on('')
                    if (!lineStart && objectDrawLineLatLng.length === 0) {
                        drawLineLatLng['line1'] = {
                            color: '',
                            latlng: [[e.latlng.lat, e.latlng.lng]]
                        };
                        lineStart = L.circle([e.latlng.lat, e.latlng.lng], {
                            color: $('.draw-line-color').val(),       // 線の色
                            radius: 1        // 半径
                        }).addTo(map);
                    } else if (!lineStart) {
                        drawLineLatLng['line' + Number(Number(objectDrawLineLatLng.length) + 1)] = {
                            color: '',
                            latlng: [[e.latlng.lat, e.latlng.lng]]
                        }
                        lineStart = L.circle([e.latlng.lat, e.latlng.lng], {
                            color: $('.draw-line-color').val(),       // 線の色
                            radius: 1        // 半径
                        }).addTo(map);
                    } else if (lineStart) {
                        drawLineLatLng[objectDrawLineLatLng[objectDrawLineLatLng.length - 1]].latlng.push([e.latlng.lat, e.latlng.lng])
                        drawLineLatLng[objectDrawLineLatLng[objectDrawLineLatLng.length - 1]].color = $('.draw-line-color').val()
                        map.removeLayer(lineStart)
                        lineStart = null
                    }

                    for (const key in drawLineLatLng) {
                        if (drawLineLatLng[key].latlng?.length === 2 && !drawLineLatLng[key].polyline) {
                            //マップにラインを追加
                            const polyline = L.polyline(drawLineLatLng[key].latlng, { color: drawLineLatLng[key].color }).addTo(map);
                            const point1 = L.latLng(drawLineLatLng[key].latlng[0][0], drawLineLatLng[key].latlng[0][1])
                            const point2 = L.latLng(drawLineLatLng[key].latlng[1][0], drawLineLatLng[key].latlng[1][1]);
                            const distance = point1.distanceTo(point2)
                            drawLineLatLng[key].distance = Math.round(distance * 100) / 100
                            drawLineLatLng[key].polyline = polyline.bindPopup('<div class="draw-shape">' + drawLineLatLng[key].distance + 'm</div>')
                            allDraws.push(drawLineLatLng[key].polyline)
                            polyline.on('click', onMarkerClick)
                            //地図のズーム調整
                            // map.fitBounds(polyline.getBounds());
                        }
                    }
                } else if (drawCircle) {
                    //円の描画を行うとき
                    let radius = $('.radius').val() >= 1 ? $('.radius').val() : 1
                    const circleArea = Number(radius * radius * 3.14)
                    let circleAreaUnit = '㎡'
                    if ($('.radius-unit').val() === 'km') {
                        radius = radius * 1000
                        circleAreaUnit = 'k㎡'
                    }

                    let markerNum = 0;
                    const circle = L.circle([e.latlng.lat, e.latlng.lng], {
                        color: $('.draw-circle-color').val(),       // 線の色
                        radius: radius,          // 半径
                        fill: $('#circle_fill').prop('checked')
                    }).addTo(map);

                    Object.keys(allMarker).forEach(key => {
                        if (circle.getLatLng().distanceTo(allMarker[key].marker.getLatLng()) <= radius) {
                            markerNum++;
                        }
                    })
                    circle.bindPopup(`<div class="draw-shape"><div>面積：<br>${circleArea + circleAreaUnit}</div><br><div>円内のピンの数<br>${markerNum}</div></div>`)
                    circle.on('click', onMarkerClick)
                    allDraws.push(circle)

                    drawCircleLatLng.push(circle)
                } else if (drawArea) {
                    //エリアの描画を行うとき
                    const objectDrawAreaLatLng = Object.keys(drawAreaLatLng)
                    if (!areaStart && objectDrawAreaLatLng.length === 0) {
                        drawAreaLatLng['area1'] = {
                            color: '',
                            latlng: [[e.latlng.lat, e.latlng.lng]],
                        };
                        areaStart = L.circle([e.latlng.lat, e.latlng.lng], {
                            color: $('.draw-area-color').val(),       // 線の色
                            radius: 3,        // 半径
                            className: 'start-area-marker'
                        }).addTo(map);
                    } else if (!areaStart) {
                        drawAreaLatLng['line' + Number(Number(objectDrawAreaLatLng.length) + 1)] = {
                            color: '',
                            latlng: [[e.latlng.lat, e.latlng.lng]]
                        }
                        areaStart = L.circle([e.latlng.lat, e.latlng.lng], {
                            color: $('.draw-area-color').val(),       // 線の色
                            radius: 3,        // 半径
                            className: 'start-area-marker'
                        }).addTo(map);
                    } else if (areaStart) {
                        drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].latlng.push([e.latlng.lat, e.latlng.lng])
                        const borderLine = L.polyline(drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].latlng, { color: $('.draw-area-color').val() }).addTo(map);
                        if (drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].borderLine) {
                            map.removeLayer(drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].borderLine)
                        }
                        drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].borderLine = borderLine

                        // 地点から円の中心までの距離を計算 (メートル単位)
                        const distance = L.latLng(e.latlng.lat, e.latlng.lng).distanceTo(areaStart.getLatLng());

                        // 距離が半径以下であれば、内部にあると判定
                        if (distance <= 3) {
                            map.removeLayer(drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].borderLine)
                            map.removeLayer(areaStart);
                            areaStart = null;

                            const latlngArray = drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].latlng;
                            const polygon = L.polygon(latlngArray, {
                                color: $('.draw-area-color').val(),
                                fill: $('#area_fill').prop('checked')
                            }).addTo(map);
                            polygon.on('click', onMarkerClick)

                            // Turf.jsを使用して面積を計算（平方メートル）
                            const geoJsonPolygon = turf.polygon([[...latlngArray.map(point => [point[1], point[0]]), [latlngArray[0][1], latlngArray[0][0]]]]);
                            const areaM2 = turf.area(geoJsonPolygon); // 平方メートル
                            const areaKm2 = areaM2 / 1000000; // 平方キロメートル
                            let markerNum = 0

                            Object.keys(allMarker).forEach(key => {
                                const point = turf.point([allMarker[key].marker.getLatLng().lng, allMarker[key].marker.getLatLng().lat]);

                                if (turf.booleanPointInPolygon(point, polygon.toGeoJSON())) {
                                    markerNum++
                                }
                            })

                            // ポップアップに面積を表示
                            const popupText = `<div class="draw-shape"><div>面積:<br>${areaM2.toFixed(2)} ㎡<br>${areaKm2.toFixed(6)} k㎡</div><br><div>エリア内のピンの数:<br>${markerNum}</div></div>`;
                            polygon.bindPopup(popupText);

                            drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].polygon = polygon
                            drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].area = {
                                m2: areaM2,
                                km2: areaKm2
                            }
                            allDraws.push(drawAreaLatLng[objectDrawAreaLatLng[objectDrawAreaLatLng.length - 1]].polygon)

                        }
                    }
                }
            }
        }

        const onMarkerClick = (e) => {
            if (newRecord || drawLine || drawCircle || drawArea) {
                map.closePopup() // ポップアップを閉じる
                onMapClick(e)
            }
        }

        //マップのタイトルを設定
        $('#map-title').text(mapConfig.mapTitle);
        $('head title').text(mapConfig.mapTitle);

        const fieldResp = await window.fetch("../kintone/getField", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ app: mapConfig.appId, token: mapConfig.token, domain: domain })
        });
        const field = await fieldResp.json();

        //マップのタイルの種類を取得
        if (showMapInformation.mapLayer) {
            $('#menu #' + showMapInformation.mapLayer).attr('class', 'selected-option');
            currentTile = showMapInformation.mapLayer
        } else {
            $('#menu #' + mapConfig.mapTile).attr('class', 'selected-option');
            currentTile = mapConfig.mapTile
        }
        /** @type {object} 位置情報を取得 */
        const position = await getCurrentPosition(mapConfig);
        centerLat = position.lat;
        centerLng = position.lng;
        const centerMarker = L.circleMarker([centerLat, centerLng], { color: '#0000ff', fillColor: '#1e90ff', fillOpacity: 1, radius: 10, className: 'marker' }).bindPopup("現在地");

        if (showMapInformation.latitude !== undefined && showMapInformation.longitude !== undefined) {
            //座標が既に設定されているとき
            centerLat = Number(showMapInformation.latitude);
            centerLng = Number(showMapInformation.longitude)
        }

        /**=====================================マップの作製===================================================== */
        map = L.map('map', { zoomControl: false, minZoom: 10 }).setView([centerLat, centerLng], 18);
        layerMap[currentTile].addTo(map)
        centerMarker.addTo(map);
        const measure = L.control.scale({
            maxWidth: 100,
            imperial: false
        }).addTo(map);
        $('.loading-content').attr('class', 'loading-content loaded')

        // 表示されている距離を取得
        const dist = getMapViewDistanceKm(map);

        const latLngBox = getBoundingBox(centerLat, centerLng, dist)

        /**=====================================現在地周辺のレコードを取得===================================================== */
        let query = `${mapConfig.latitude} != "" and ${mapConfig.longitude} != "" and
                    (${mapConfig.latitude} > ${latLngBox.minLat} and ${mapConfig.latitude} < ${latLngBox.maxLat} and
                     ${mapConfig.longitude} > ${latLngBox.minLng} and ${mapConfig.longitude} < ${latLngBox.maxLng})`

        query += createQuery(mapConfig, field);
        console.log(query)

        //レコードとフィールド情報を取得
        let recordsResps = await window.fetch("../kintone/getRecords", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ app: mapConfig.appId, token: mapConfig.token, domain: domain, query: query })
        });
        const getRecordsResp = await recordsResps.json();

        const recordCounter = [0];
        for (let i = 500; i < getRecordsResp.totalCount; i += 500) {
            recordCounter.push(i);
        }
        recordsResp = getRecordsResp.records

        let markerProcessStart = performance.now();
        console.log('マーカー処理開始:', new Date().toISOString());

        recordsResp.forEach(async (records) => {
            records.forEach(async (record) => {
                const createMarker = await marker(record, mapConfig, domain, login, latLngBox, map);
                if (allMarker[record.$id.value]) {
                    map.removeLayer(allMarker[record.$id.value].marker)
                    map.removeLayer(allMarker[record.$id.value].markerName)
                }
                allMarker[record.$id.value] = createMarker
                createMarker.marker.on('click', onMarkerClick)
            })
        })

        let markerProcessEnd = performance.now();
        let markerProcessTime = ((markerProcessEnd - markerProcessStart) / 1000).toFixed(2);
        console.log(`マーカー処理完了: ${markerProcessTime}秒`);
        console.log('マーカー処理終了:', new Date().toISOString());

        if (mapConfig.group !== '' && mapConfig.group) {

            let layerPosition = 'topleft';
            if ((/iPhone|Android.+Mobile|ipad|iPad|macintosh/).test(navigator.userAgent) || ("ontouchend" in document)) {
                layerPosition = 'topright';
            }

            const layerControl = L.control.layers({}, {}, { position: layerPosition }).addTo(map);

            for (const key in field.properties[mapConfig.group].options) {
                layerControl.addOverlay(L.layerGroup(), field.properties[mapConfig.group].options[key].label);
            }

            if (layerPosition !== 'topright') {
                const menuWidth = Number($('#menu').css('width').replace('px', ''))
                $('.leaflet-control-layers.leaflet-control').css('margin-left', menuWidth + 10 + 'px');
            } else {
                $('.leaflet-control-layers.leaflet-control').css('margin-top', '0px');
            }
        }

        for (let i = 0; i < $('.leaflet-control-layers-selector').length; i++) {
            $('.leaflet-control-layers-selector').eq(i).hide();
            $('.leaflet-control-layers-selector').eq(i).next().hide()
            $('.leaflet-control-layers-selector').eq(i).next().after($('<label>').attr('for', $('.leaflet-control-layers-selector').eq(i).next().text().replace(/\s/g, '')).text($('.leaflet-control-layers-selector').eq(i).next().text()))
            $('.leaflet-control-layers-selector').eq(i).next().after($('<input>').attr({ type: 'checkbox', class: 'layer-control-check', id: $('.leaflet-control-layers-selector').eq(i).next().text().replace(/\s/g, '') }))
            $('.leaflet-control-layers-selector').eq(i).parent().css('display', 'flex')
        }

        $('.layer-control-check').attr('checked', true).prop('checked', true).change()

        /**=====================================グループのチェックが変更されたとき===================================================== */
        $('.layer-control-check').off('change').change(function () {
            const layerName = $(this).next().text().replace(/\s/g, '')
            if ($(this).prop('checked')) {
                recordsResp.forEach(records => {
                    records.forEach(record => {
                        if (record[mapConfig.group].value === layerName) {
                            leafletLayerHideMarkers.splice(leafletLayerHideMarkers.indexOf(record.$id.value), 1)
                        }
                    })
                })
            } else {
                recordsResp.forEach(records => {
                    records.forEach(record => {
                        if (record[mapConfig.group].value === layerName) {
                            leafletLayerHideMarkers.push(record.$id.value)
                        }
                    })
                })
            }

            hideMarkers = searchMarkers.concat(leafletLayerHideMarkers);
            updateMarkersByCenter(allMarker, hideMarkers, map)
            if (zoom <= 12) {
                $('.marker-label').hide()
            } else {
                $('.marker-label').css('display', 'block');
            }
        })

        if (!userShowMap[0].create) {
            $('#new_record').hide()
            $('#input_image_button').hide()
            $('#add_shapefile').hide()
        } else {
            $('#new_record').show()
            if (config.addImage) {
                $('#input_image_button').show()
            }
            if (config.addShapeFile) {
                $('#add_shapefile').show()
            }
        }
        if (!(/iPhone|Android.+Mobile|ipad|iPad|macintosh/).test(navigator.userAgent) || !("ontouchend" in document)) {
            const menuWidth = Number($('#menu').css('width').replace('px', ''))
            $('.leaflet-control-layers.leaflet-control').css('margin-left', menuWidth + 10 + 'px');
        }

        /**=====================================現在地の周辺以外のレコードを取得===================================================== */
        query = `${mapConfig.latitude} != "" and ${mapConfig.longitude} != "" and
                    (${mapConfig.latitude} < ${latLngBox.minLat} or ${mapConfig.latitude} > ${latLngBox.maxLat} or
                     ${mapConfig.longitude} < ${latLngBox.minLng} or ${mapConfig.longitude} > ${latLngBox.maxLng})`

        query += createQuery(mapConfig, field);

        markerProcessStart = performance.now();

        recordCounter.forEach(async (i, index) => {
            if (i > 10000) {
                return;
            }
            console.log('マーカー処理開始:', new Date().toISOString());
            const get500Query = query + ` limit 500 offset ${i}`;
            const body = {
                app: mapConfig.appId,
                query: get500Query
            }
            await fetch(`../kintone/getNewRecords`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ domain: domain, token: mapConfig.token, body: body })
            })
                .then(async (response) => {
                    const records = await response.json()
                    records.records.forEach(async (record) => {
                        const createMarker = await marker(record, mapConfig, domain, login, latLngBox, map);
                        if (allMarker[record.$id.value]) {
                            map.removeLayer(allMarker[record.$id.value].marker)
                            map.removeLayer(allMarker[record.$id.value].markerName)
                        }
                        allMarker[record.$id.value] = createMarker
                        createMarker.marker.on('click', onMarkerClick)
                    })
                    recordsResp.push(records.records)

                    if (recordCounter[index + 1] > 10000) {
                        //次のレコードから10000件以上の時、カーソルを使って取得を行う
                        query += ` and $id > ${records.records[records.records.length - 1].$id.value}`
                        recordsResps = await window.fetch("../kintone/getRecords", {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ app: mapConfig.appId, token: mapConfig.token, domain: domain, query: query })
                        })
                            .then(async (recordsResponse) => {
                                let getOuterRecordResp = await recordsResponse.json();
                                const outerRecordResp = getOuterRecordResp.records

                                outerRecordResp.forEach(async (records) => {
                                    records.forEach(async (record) => {
                                        const createMarker = await marker(record, mapConfig, domain, login, latLngBox, map);
                                        if (allMarker[record.$id.value]) {
                                            map.removeLayer(allMarker[record.$id.value].marker)
                                            map.removeLayer(allMarker[record.$id.value].markerName)
                                        }
                                        allMarker[record.$id.value] = createMarker
                                        createMarker.marker.on('click', onMarkerClick)
                                    })
                                })
                                recordsResp = recordsResp.concat(outerRecordResp)

                            });
                    }
                    markerProcessEnd = performance.now();
                    markerProcessTime = ((markerProcessEnd - markerProcessStart) / 1000).toFixed(2);
                    console.log(`マーカー処理完了: ${markerProcessTime}秒`);
                    console.log('マーカー処理終了:', new Date().toISOString());
                })
        })

        console.log(recordsResp)

        //マップをクリックした時のイベントイベント
        map.on('click', onMapClick);
        centerMarker.on('click', onMarkerClick)

        /**=====================================現在地に戻るボタンをクリック===================================================== */
        $('#back').click(async () => {
            const position = await getCurrentPosition(mapConfig);
            centerLat = position.lat;
            centerLng = position.lng;
            centerMarker.setLatLng([centerLat, centerLng])

            showMapInformation.latitude = centerLat;
            showMapInformation.longitude = centerLng;
            localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));

            map.panTo(new L.LatLng(centerLat, centerLng))
            updateMarkersByCenter(allMarker, hideMarkers, map)
        })

        /**=====================================ピンの新規追加===================================================== */
        $('#new_record').off('click').click(() => {
            newRecord = !newRecord;
            if (newRecord) {
                //newRecordがtrueになったとき、色を変える
                $('#new_record').css({ 'background': '#bdbdbd' });
                // document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'url(../pin.png) 1 15, auto';
                $('#map').css('cursor', 'url(../pin.png) 1 15, auto')

            } else {
                //newRecordがfakseになったとき、色を変える
                $('#new_record').css('background', '#ededed');
                // document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'grab';
                $('#map').css('cursor', 'grab')

            }
        })

        /**=====================================絞り込み===================================================== */
        $('#search_records').off('click').click(async () => {
            $('.select-options').hide()
            $('#address_search_modal').hide()
            //絞り込みモーダルを表示
            await createSearchArea(field);

            $('#search').off('click').click(async () => {
                //絞り込みが押されたとき
                searchMarkers = await markerSearch(allMarker, recordsResp, map, leafletLayerHideMarkers)

                if (zoom <= 12) {
                    $('.marker-label').hide()
                } else {
                    $('.marker-label').css('display', 'block');
                }
                hideMarkers = searchMarkers.concat(leafletLayerHideMarkers)
                $('#search_modal').hide()
            });

            //絞り込み解除が押されてたとき
            $('#show_all').off('click').click(async () => {
                let conditionNum = $('.conditions').length;
                $('#search_text').hide()

                for (let i = 1; i < conditionNum; i++) {
                    $('.conditions:eq(' + i + ') .search_field_select').val('')
                    if (conditionNum > 2) {
                        $('.conditions:eq(' + i + ')').remove()
                    } else {
                        $('.conditions:eq(' + i + ') .andor').hide()
                        $('.conditions:eq(' + i + ') .condition_delete').hide()
                    }
                    conditionNum--;
                    i--;
                }
                searchMarkers = [];
                Object.keys(allMarker).forEach(key => {
                    if (leafletLayerHideMarkers.indexOf(key) === -1) {
                        allMarker[key].marker.addTo(map)
                        allMarker[key].markerName.addTo(map)
                    }
                })

                if (zoom <= 12) {
                    $('.marker-label').hide()
                } else {
                    $('.marker-label').css('display', 'block');
                }

                hideMarkers = searchMarkers.concat(leafletLayerHideMarkers);
                // $('#search_modal').hide()
            })

            //×ボタンが押されたとき、非表示にする
            $('#close').off('click').click(() => {
                $('#search_modal').hide()
            })
        })

        /**=====================================住所検索===================================================== */
        $('#address_search').click(async () => {
            $('.select-options').hide()
            $('#search_modal').hide()
            await addressSearch(map, mapConfig);
        })

        /**=====================================ズームレベルの取得===================================================== */
        map.on('moveend zoomend', function (e) {
            //マップムーブイベントで値を出力
            zoom = map.getZoom();

            updateMarkersByCenter(allMarker, hideMarkers, map)

            if (zoom <= 12) {
                $('.marker-label').hide()
            } else {
                $('.marker-label').css('display', 'block');
            }
        });

        /**=====================================画像からピンの追加===================================================== */
        $('.loading-content').attr('class', 'loading-content loaded');
        map.on('popupopen', function (e) {
            $('img.field-value').click(function () {
                createImageModal($, $(this).prop('src'), $(this).prop('title'));
            })
        })

        $('#input_image_button').click(function () {
            //画像で登録ボタンを押したとき
            newRecord = false
            $('#new_record').css('background', '#ededed');
            // document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'grab';
            $('#map').css('cursor', 'grab')

            $('#input_image').click();
        })
        $('#input_image').on("cancel", () => { });

        $('#input_image').change(async function (e) {
            //画像が選択されたとき
            $('.select-options').hide()
            $('#search_modal').hide()
            $('#address_search_modal').hide()

            await showGetFileModal(e.target.files, mapConfig, recordsResp);
            $('#save_files').click(async () => {
                try {
                    $('.loading-content').attr('class', 'loading-content').css('background-color', '#ffffff6c')

                    const newRecords = await postImageRecords(mapConfig, domain);

                    const center = map.getCenter();
                    const centerLat = center.lat;
                    const centerLng = center.lng;

                    const nowlatLngBox = getBoundingBox(centerLat, centerLng, dist)
                    console.log(newRecords)

                    for (let i = 0; i < newRecords.length; i++) {
                        allMarker[newRecords[i].$id.value] = await marker(newRecords[i], mapConfig, domain, login, nowlatLngBox, map);
                    }

                    $('.loading-content').attr('class', 'loading-content loaded')
                } catch (error) {
                    $('.loading-content').attr('class', 'loading-content loaded')
                    alert('登録中にエラーが発生しました。');
                    console.error(error)
                }
            })
            $('#input_image').val('')
        })

        $('#drawing').off('click').click(function () {
            drawLine = false;
            $('#draw_line').css('background', '#ededed');
            drawCircle = false;
            $('#draw_circle').css('background', '#ededed');

            newRecord = false;
            //newRecordがfakseになったとき、色を変える
            $('#new_record').css('background', '#ededed');
            // document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'grab';
            $('#map').css('cursor', 'grab')


            if (drawing) {
                drawing = false;
                $('#menu').show()
                $('#drawing_menu').hide();
                // マーカーのクリックイベントハンドラを削除
            } else {
                drawing = true;
                $('#menu').hide()
                $('#drawing_menu').show();

                $('#draw_line').off('click').click(function () {
                    if (lineStart) {
                        map.removeLayer(lineStart);
                        delete drawLineLatLng[Object.keys(drawLineLatLng)[Object.keys(drawLineLatLng).length - 1]]
                        lineStart = null
                    }
                    if (areaStart) {
                        map.removeLayer(drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]].borderLine);
                        delete drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]]
                        map.removeLayer(areaStart);
                        areaStart = null;
                    }

                    drawCircle = false;
                    drawArea = false;
                    $('#draw_circle').css('background', '#ededed');
                    $('#draw_area').css('background', '#ededed');
                    drawLine = clickDrawLine(drawLine);
                    // if (drawLine) {
                    //     map.dragging.disable();
                    // } else {
                    //     map.dragging.enable();
                    // }
                })

                $('#draw_circle').off('click').click(function () {
                    if (lineStart) {
                        map.removeLayer(lineStart);
                        delete drawLineLatLng[Object.keys(drawLineLatLng)[Object.keys(drawLineLatLng).length - 1]]
                        lineStart = null
                    }
                    if (areaStart) {
                        map.removeLayer(drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]].borderLine);
                        delete drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]]
                        map.removeLayer(areaStart);
                        areaStart = null;
                    }

                    drawLine = false;
                    drawArea = false;
                    drawCircle = clickDrawCircle(drawCircle);
                    // if (drawCircle) {
                    //     map.dragging.disable();
                    // } else {
                    //     map.dragging.enable();
                    // }
                })

                $('#draw_area').off('click').click(function () {
                    if (lineStart) {
                        map.removeLayer(lineStart);
                        delete drawLineLatLng[Object.keys(drawLineLatLng)[Object.keys(drawLineLatLng).length - 1]]
                        lineStart = null
                    }
                    if (areaStart) {
                        map.removeLayer(drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]].borderLine);
                        delete drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]]
                        map.removeLayer(areaStart);
                        areaStart = null;
                    }

                    drawLine = false
                    drawCircle = false;
                    $('#draw_line').css('background', '#ededed');
                    $('#draw_circle').css('background', '#ededed');
                    drawArea = clickDrawArea(drawArea);
                    map.dragging.enable();
                })

                $('#draw_back').click(function () {
                    if (lineStart) {
                        map.removeLayer(lineStart);
                        delete drawLineLatLng[Object.keys(drawLineLatLng)[Object.keys(drawLineLatLng).length - 1]]
                        lineStart = null
                    }
                    if (areaStart) {
                        map.removeLayer(drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]].borderLine);
                        delete drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]]
                        map.removeLayer(areaStart);
                        areaStart = null;
                    }

                    if (allDraws.length > 0) {
                        map.removeLayer(allDraws[allDraws.length - 1])
                        allDraws.pop();
                    }
                })

                $('#draw_all_delete').click(function () {
                    if (lineStart) {
                        map.removeLayer(lineStart);
                        delete drawLineLatLng[Object.keys(drawLineLatLng)[Object.keys(drawLineLatLng).length - 1]]
                        lineStart = null
                    }
                    if (areaStart) {
                        map.removeLayer(drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]].borderLine);
                        delete drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]]
                        map.removeLayer(areaStart);
                        areaStart = null;
                    }

                    for (let i = allDraws.length - 1; i >= 0; i--) {
                        map.removeLayer(allDraws[i])
                        allDraws.pop();
                    }
                })

                $('#drawing_menu_close').off('click').click(function () {
                    if (!drawManuClose) {
                        drawManuClose = true;
                        $('#drawing_menu_close').text('□').attr('title', '開く');
                        $('.draw_buttons').hide();
                        $('#drawing_menu').css({ 'height': '50px' })
                    } else {
                        drawManuClose = false;
                        $('#drawing_menu_close').text('-').attr('title', '閉じる');
                        $('.draw_buttons').show()
                        $('#drawing_menu').css({ 'height': 'calc(96% - 10px)' })
                    }
                })

                $('#drawing_end').off('click').click(function () {
                    if (lineStart) {
                        map.removeLayer(lineStart);
                        delete drawLineLatLng[Object.keys(drawLineLatLng)[Object.keys(drawLineLatLng).length - 1]]
                        lineStart = null
                    }
                    if (areaStart) {
                        map.removeLayer(drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]].borderLine);
                        delete drawAreaLatLng[Object.keys(drawAreaLatLng)[Object.keys(drawAreaLatLng).length - 1]]
                        map.removeLayer(areaStart);
                        areaStart = null;
                    }

                    // document.getElementsByClassName('leaflet-grab')[0].style.cursor = 'grab';
                    $('#map').css('cursor', 'grab')
                    $('#menu').show()
                    $('#drawing_menu').hide();
                    drawing = false;

                    if (drawManuClose) {
                        $('#drawing_menu_close').click()
                    }

                    drawLine = false;
                    $('#draw_line').css({ 'background': '#ededed', 'box-shadow': '1px 1px 0px 0px #818181' });
                    drawCircle = false;
                    $('#draw_circle').css({ 'background': '#ededed', 'box-shadow': '1px 1px 0px 0px #818181' });
                    drawArea = false;
                    $('#draw_area').css({ 'background': '#ededed', 'box-shadow': '1px 1px 0px 0px #818181' });
                    map.dragging.enable();
                    return;
                })
            }
        })

        // map.on('drag', function (e) {
        //     if (drawLine) {
        //         console.log('カーソルドラッグ')
        //         console.log(e)
        //         map.dragging.disable();
        //     } else {

        //     }
        //     map.dragging.enable();
        // })

        $('#add_shapefile').click(() => {
            $('#select_shapefile').click();
        })

        $('#select_shapefile').off('change').change(async function (e) {
            try {
                const files = e.target.files;

                await getSHPFile(files, map)
            } catch (error) {
                alert(error.message);
                console.error('シェイプファイル読み込みエラー:', error);
            } finally {
                // リセット
                e.target.value = '';
            }
        })

        // let watchID
        // let GPSLine = [];
        // let afterline;
        // let GPSStart = false;

        // // 位置情報の監視を終了する
        // const clear = () => {
        //     afterline = null;
        //     GPSLine = [];
        //     navigator.geolocation.clearWatch(watchID)
        // }

        // $('#GSP_start_stop').off('click').click(async () => {
        //     if (GPSStart) {
        //         GPSStart = false;
        //         $('#GSP_start_stop').text('GPSで経路作成開始');
        //         alert('経路の作成を終了します。');
        //         clear()
        //     } else {
        //         GPSStart = true;
        //         $('#GSP_start_stop').text('経路作成終了');
        //         alert('経路の作成を開始します。');
        //         const position = await getCurrentPosition(mapConfig);
        //         centerMarker.setLatLng([position.lat, position.lng])
        //         watchID = navigator.geolocation.watchPosition(
        //             (nowPosition) => {
        //                 console.log(`緯度：${nowPosition.coords.latitude}`, `経度：${nowPosition.coords.longitude}`)
        //                 centerMarker.setLatLng([nowPosition.coords.latitude, nowPosition.coords.longitude])

        //                 GPSLine.push([nowPosition.coords.latitude, nowPosition.coords.longitude])
        //                 if (afterline) {
        //                     map.removeLayer(afterline);
        //                 }

        //                 if (GPSLine.length > 1) {
        //                     afterline = L.polyline(GPSLine).addTo(map);
        //                 }
        //             },
        //             (error) => {
        //                 // clear()
        //             }
        //         )
        //     }
        // })

        map.on('popupopen', function (e) {
            $('.detail-button').click(function () {
                const recordId = $(this).prop('id');
                console.log(recordId);
                createDetailModal(recordId, recordsResp, domain, mapConfig, field.properties)
            })
        })

    } catch (error) {
        alert('エラーが発生しました。他のマップに切り替えるか設定を確認してください。')
        console.error(error.name);
        console.error(error.message);
        console.error(error.stack);
    }
}

if (config.config1 === undefined) {
    //config1がないとき
    $('#menu button').hide()
    $('#map button').hide()

    if (checkLogin && JSON.parse(checkLogin)?.authority !== 1) {
        $('#map').append(`<h1>閲覧できるマップがありません。\n設定を行ってください。</h1>`);
    } else if (openURL !== '') {
        window.location.href = "./notAccess";
    } else {
        $('#map').append('<h1>閲覧できるマップがありません。</h1>');
    }
    $('.loading-content').attr('class', 'loading-content loaded')
} else {
    if (login) {
        //ログインしているとき
        let chackAuthority = false;

        for (const key in config) {
            if (config[key].mapTitle !== undefined) {
                for (let i = 1; i <= config[key].users_row_number; i++) {
                    const showMap = config[key]['user_row' + i]
                    if (showMap.user === JSON.parse(checkLogin).id && config[key].valid) {
                        if (!chackAuthority) {
                            //chachAuthorityがfalseの時(初めてif分に入ったとき)、マップの表示情報を取得
                            if (!localStorage.getItem(showMapLocalStorageKey)) {
                                const position = await getCurrentPosition(config[key])
                                console.log(position)
                                showMapInformation = {
                                    date: Date.now(),
                                    key: key,
                                    login: JSON.parse(checkLogin).id,
                                    latitude: position.lat,
                                    longitude: position.lng,
                                    mapLayer: config[key].mapTile
                                }
                                localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
                            } else {
                                if (Date.now() - (4 * 60 * 60 * 1000) > JSON.parse(localStorage.getItem(showMapLocalStorageKey)).date) {
                                    //ログインしていた時間が、指定の時間よりも前の時、セッションを削除
                                    const position = await getCurrentPosition(config[key]);
                                    console.log(position)
                                    localStorage.removeItem(showMapLocalStorageKey);
                                    showMapInformation = {
                                        date: Date.now(),
                                        key: key,
                                        login: JSON.parse(checkLogin).id,
                                        latitude: position.lat,
                                        longitude: position.lng,
                                        mapLayer: config[key].mapTile
                                    }
                                    localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
                                } else {
                                    showMapInformation = JSON.parse(localStorage.getItem(showMapLocalStorageKey));
                                    if (config[showMapInformation.key] === undefined) {
                                        const position = await getCurrentPosition(config[key])
                                        console.log(position)
                                        localStorage.removeItem(showMapLocalStorageKey);
                                        showMapInformation = {
                                            date: Date.now(),
                                            key: key,
                                            login: JSON.parse(checkLogin).id,
                                            latitude: position.lat,
                                            longitude: position.lng,
                                            mapLayer: config[key].mapTile
                                        }
                                        localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
                                    }
                                }
                            }

                            chackAuthority = true
                        }
                        $('#map-types .select-options').append(`<div id="${key}" class="button-selects">${config[key].mapTitle}</div>`);
                        if (showMapInformation.key !== key) {
                            otherLayer.push(key)
                        }
                        break;
                    }
                }
            }
        }

        if (!chackAuthority) {
            //閲覧できるマップがなかった時、警告を出す。
            $('#menu button').hide()
            $('#map button').hide()

            if (JSON.parse(checkLogin).authority !== 1) {
                $('#map').append('<h1>閲覧できるマップがありません。\n設定を行ってください。</h1>');
            } else {
                $('#map').append('<h1>閲覧できるマップがありません。</h1>');
            }
            $('.loading-content').attr('class', 'loading-content loaded')
        } else {

            $('#map-types').css('display', 'block');
            $('#map-layers').css('display', 'block');

            $(`#map-types .select-options #${showMapInformation.key}`).attr('class', 'selected-option');

            if (otherLayer.length >= 1) {
                await showMap(showMapInformation.key);
                await createOtherMapModal(config, otherLayer, map, showMapInformation.key);
            } else {
                $('#map_show_other_layer').hide();
                $('#mobail_menu #other_maps').hide();
                $('#mobail_menu #other_maps').next().hide();
                await showMap(showMapInformation.key);
            }
        }
    } else {
        if (config.config1.valid) {
            showMap('config1')
        } else {
            window.location.href = "../notAccess";
        }
    }
}

$('.show-button-dropdown').off('click').click((e) => {
    $('#address_search_modal').hide()
    $('#search_modal').hide()
    $('#logout-config').hide()
    let options = e.target.nextElementSibling;
    let id = e.target.id

    if (e.originalEvent.target.tagName === 'IMG') {
        options = e.target.parentNode.nextElementSibling;
        id = e.target.parentNode.id
    }

    for (let i = 0; i < document.getElementsByClassName('select-options').length; i++) {
        if (options !== document.getElementsByClassName('select-options')[i]) {
            document.getElementsByClassName('select-options')[i].style.display = 'none';
        }
    }

    if (options.style.display === 'none') {

        options.style.display = 'block';

        $('.select-button .button-selects').off('click').click((option) => {
            $(`#${id}`).next().children('.selected-option').attr('class', 'button-selects');
            option.target.className = 'selected-option';
            const value = option.target.id;

            if (id === 'map_tile_select_button') {
                layerMap[currentTile].remove(map);
                currentTile = value;
                layerMap[currentTile].addTo(map);

                if (openURL === '') {
                    showMapInformation.mapLayer = currentTile;
                    localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
                }

            } else {
                const position = getCurrentPosition(config[value])
                showMapInformation = {
                    date: showMapInformation.date,
                    key: value,
                    login: JSON.parse(checkLogin).id,
                    latitude: position.lat,
                    longitude: position.lng,
                    mapLayer: config[value].mapTile
                }
                localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
                window.location.href = `./`;
            }
            options.style.display = 'none';
            return;
        })
    } else {
        options.style.display = 'none';
    }
    return;
})