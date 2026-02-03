
import { getCurrentPosition, getMapViewDistanceKm, getBoundingBox } from './coordinate';
import { createQuery } from './createQuery';
import { marker } from './marker';
import { mapTileNames } from '../../tsx/paegs/map';

export const showMap = async (configs: any, showMap: string, login: boolean, showMapInformation: any) => {
  console.log(configs)

  console.log(showMapInformation)

  /**kintoneのドメイン*/
  const domain: string = configs.domain
  const mapConfig: any = configs.config[showMap];
  console.log(mapConfig)

  let recordsResp: any[] = [];
  let currentTile: mapTileNames = 'open_street_map'
  let allMarker: any[] = []

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

  const layerMap: any = {
    'open_street_map': map1,
    'GRUS_images': map2,
    'digital_topographic_map': map3,
    'light_colored_map': map4,
  };

  //マップのタイトルを設定
  // $('#map-title').text(mapConfig.mapTitle);
  // $('head title').text(mapConfig.mapTitle);

  const params = new URLSearchParams({ domain: domain, appId: mapConfig.appId, token: mapConfig.token });
  const getFieldResp = await fetch(`./kintone/getField?${params.toString()}`);

  if (!getFieldResp.ok) {
    throw new Error('フィールドの取得に失敗しました。');
  }

  const getField = await getFieldResp.json();
  let field = getField.properties;
  console.log(field)

  //マップのタイルの種類を取得
  if (showMapInformation.mapLayer) {
    // $('#menu #' + showMapInformation.mapLayer).attr('class', 'selected-option');
    currentTile = showMapInformation.mapLayer
  } else {
    // $('#menu #' + mapConfig.mapTile).attr('class', 'selected-option');
    currentTile = mapConfig.mapTile
  }

  /** @type {object} 位置情報を取得 */
  const position: any = await getCurrentPosition(mapConfig);
  let centerLat = position.lat;
  let centerLng = position.lng;

  if (showMapInformation.latitude !== undefined && showMapInformation.longitude !== undefined) {
    //座標が既に設定されているとき
    centerLat = Number(showMapInformation.latitude);
    centerLng = Number(showMapInformation.longitude);
  }

  const map = L.map('map', { zoomControl: false, minZoom: 10 }).setView([showMapInformation.latitude, showMapInformation.longitude], 18);
  layerMap[showMapInformation.mapLayer].addTo(map)
  L.control.scale({
    maxWidth: 100,
    imperial: false
  }).addTo(map);


  // 表示されている距離を取得
  const dist = getMapViewDistanceKm(map);

  const latLngBox = getBoundingBox(centerLat, centerLng, dist);

  /**=====================================現在地周辺のレコードを取得===================================================== */
  let query = `${mapConfig.latitude} != "" and ${mapConfig.longitude} != "" and
                      (${mapConfig.latitude} > ${latLngBox.minLat} and ${mapConfig.latitude} < ${latLngBox.maxLat} and
                       ${mapConfig.longitude} > ${latLngBox.minLng} and ${mapConfig.longitude} < ${latLngBox.maxLng})`

  query += createQuery(mapConfig, field);
  console.log(query)

  //レコードとフィールド情報を取得
  let recordsResps = await window.fetch("./kintone/getRecords", {
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

  recordsResp.forEach(async (records: any[]) => {
    records.forEach(async (record: any) => {
      const createMarker = await marker(record, mapConfig, domain, login, latLngBox, map, field);
      if (allMarker[record.$id.value]) {
        map.removeLayer(allMarker[record.$id.value].marker)
        map.removeLayer(allMarker[record.$id.value].markerName)
      }
      allMarker[record.$id.value] = createMarker
      // createMarker.marker.on('click', onMarkerClick)
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

    for (const key in field[mapConfig.group].options) {
      layerControl.addOverlay(L.layerGroup(), field[mapConfig.group].options[key].label);
    }

    const leafletControl = document.querySelectorAll('.leaflet-control-layers.leaflet-control')
    leafletControl[0].style.marginTop = 'unset'
    if (layerPosition !== 'topright') {
      // const menuWidth = Number($('#menu').css('width').replace('px', ''))
      const menu = document.getElementById('menu');
      leafletControl[0].style.marginLeft = menu?.scrollWidth + 10 + 'px';
    }
  }

  const leafletSelects = document.getElementsByClassName('leaflet-control-layers-selector')
  for (let i = 0; i < leafletSelects.length; i++) {
    const leafletSelectNext = leafletSelects[i].nextElementSibling
    const label = document.createElement('label');
    label.textContent = leafletSelectNext?.textContent;
    label.for = `leaflet-control-layers-selector-${i}`
    leafletSelects[i].after(label)

    const input = document.createElement('input');
    input.type = 'checkbox'
    input.className = 'layer-control-check';
    input.id = `leaflet-control-layers-selector-${i}`
    input.checked = true;
    leafletSelects[i].after(input);

    leafletSelects[i].parentNode.style.display = 'flex'

    leafletSelectNext?.remove();
    leafletSelects[i].remove();
    i--;
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
    await fetch(`./kintone/getNewRecords`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ domain: domain, token: mapConfig.token, body: body })
    })
      .then(async (response) => {
        const records = await response.json()
        records.records.forEach(async (record: any) => {
          const createMarker = await marker(record, mapConfig, domain, login, latLngBox, map, field);
          if (allMarker[record.$id.value]) {
            map.removeLayer(allMarker[record.$id.value].marker)
            map.removeLayer(allMarker[record.$id.value].markerName)
          }
          allMarker[record.$id.value] = createMarker
          // createMarker.marker.on('click', onMarkerClick)
        })
        recordsResp.push(records.records)

        if (recordCounter[index + 1] > 10000) {
          //次のレコードから10000件以上の時、カーソルを使って取得を行う
          query += ` and $id > ${records.records[records.records.length - 1].$id.value}`
          const recordsResps = await window.fetch("./kintone/getRecords", {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ app: mapConfig.appId, token: mapConfig.token, domain: domain, query: query })
          })
            .then(async (recordsResponse) => {
              let getOuterRecordResp = await recordsResponse.json();
              const outerRecordResp = getOuterRecordResp.records

              outerRecordResp.forEach(async (records: any[]) => {
                records.forEach(async (record: any) => {
                  const createMarker = await marker(record, mapConfig, domain, login, latLngBox, map);
                  if (allMarker[record.$id.value]) {
                    map.removeLayer(allMarker[record.$id.value].marker)
                    map.removeLayer(allMarker[record.$id.value].markerName)
                  }
                  allMarker[record.$id.value] = createMarker
                  // createMarker.marker.on('click', onMarkerClick)
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

  return {
    map: map,
    currentTile: currentTile,
    name: mapConfig.mapTitle,
    layerMap: layerMap,
    records: recordsResp,
    allMarker: allMarker
  };

}