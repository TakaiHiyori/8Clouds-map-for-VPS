
import * as shapefile from "shapefile";

const zone = {
  "北海道": 12,
  "青森県": 10,
  "岩手県": 10,
  "宮城県": 10,
  "秋田県": 10,
  "山形県": 10,
  "福島県": 9,
  "茨城県": 9,
  "栃木県": 9,
  "群馬県": 9,
  "埼玉県": 9,
  "千葉県": 9,
  "東京都": 9,
  "神奈川県": 9,
  "新潟県": 8,
  "富山県": 7,
  "石川県": 7,
  "福井県": 6,
  "山梨県": 8,
  "長野県": 8,
  "岐阜県": 7,
  "静岡県": 8,
  "愛知県": 7,
  "三重県": 6,
  "滋賀県": 6,
  "京都府": 6,
  "大阪府": 6,
  "兵庫県": 5,
  "奈良県": 6,
  "和歌山県": 6,
  "鳥取県": 5,
  "島根県": 3,
  "岡山県": 5,
  "広島県": 3,
  "山口県": 3,
  "徳島県": 4,
  "香川県": 4,
  "愛媛県": 4,
  "高知県": 4,
  "福岡県": 2,
  "佐賀県": 2,
  "長崎県": 1,
  "熊本県": 2,
  "大分県": 2,
  "宮崎県": 2,
  "鹿児島県": 2,
  "沖縄県": 15
}

const loadBinaryFile = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = event.target?.result;
      if (result == null) {
        return;
      }
      resolve(result);
    };
    reader.readAsArrayBuffer(file);
  });
};

export const getSHPFile = async (files, map) => {
  const fileMap = {};

  // ファイルを拡張子ごとに分類
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const extension = file.name.split('.').pop().toLowerCase();
    fileMap[extension] = file;
  }

  // 必須ファイルの確認
  if (!fileMap.shp || !fileMap.dbf) {
    alert('.shpと.dbfファイルが必要です。');
    return;
  }

  const [shpData, dbfData] = await Promise.all([
    loadBinaryFile(fileMap.shp),
    loadBinaryFile(fileMap.dbf),
  ]);

  shapefile
    .read(shpData, dbfData, { encoding: "shift-jis" })
    .then(async geojson => {
      console.log(geojson);
      for (let i = 0; i < geojson.features.length; i++) {
        const geometry = geojson.features[i].geometry
        const properties = geojson.features[i].properties

        switch (geometry.type) {
          case 'Point':
            let pointLatlng;
            if (Math.abs(geometry.coordinates[0]) >= 1000 && Math.abs(geometry.coordinates[1]) >= 1000) {
              const zone = xyzonejapan(3);
              //X座標-34638.1とY座標-6806.74と座標系情報zoneを指定して、緯度経度を取得する。
              const getLatlng = xy2latlon(geometry.coordinates[1], geometry.coordinates[0], zone);
              // const getLatlngForXY = await fetch('../getLatlng', {
              //   method: 'post',
              //   headers: {
              //     "Content-Type": "application/json"

              //   },
              //   body: JSON.stringify(({ x: geometry.coordinates[1], y: geometry.coordinates[0] }))
              // })

              // console.log(getLatlngForXY);
              // const getLatlng = await getLatlngForXY.json();
              pointLatlng = {
                lat: getLatlng[0],
                lng: getLatlng[1]
              }
              // geometry.coordinates[1] = getLatlng[0]
              // geometry.coordinates[0] = getLatlng[1]
              // pointLatlng = {
              //   lat: getLatlng.latlng.OutputData.latitude,
              //   lng: getLatlng.latlng.OutputData.longitude
              // }
            } else {
              pointLatlng = {
                lat: geometry.coordinates[1],
                lng: geometry.coordinates[0]
              }
            }

            const latitude = pointLatlng.lat;
            const longitude = pointLatlng.lng;

            let pointPopup = '';

            for (const key in properties) {
              pointPopup += `<div><span>${key}：</span><span>${properties[key] ? properties[key] : ''}</span></div>`
            }

            L.marker([latitude, longitude]).addTo(map).bindPopup(pointPopup);
            map.panTo(new L.LatLng(latitude, longitude))
            break;
          case 'MultiLineString':
            for (let j = 0; j < geometry.coordinates.length; j++) {
              let lineLatlng = [];
              for (let k = 0; k < geometry.coordinates[j].length; k++) {
                const point = geometry.coordinates[j][k]
                // setTimeout(async () => {
                if (Math.abs(point[0]) >= 1000 && Math.abs(point[1]) >= 1000) {
                  const zone = xyzonejapan(3);
                  //X座標-34638.1とY座標-6806.74と座標系情報zoneを指定して、緯度経度を取得する。
                  const getLatlng = xy2latlon(point[1], point[0], zone);
                  console.log(getLatlng)
                  // const getLatlngForXY = await fetch('../getLatlng', {
                  //   method: 'post',
                  //   headers: {
                  //     "Content-Type": "application/json"

                  //   },
                  //   body: JSON.stringify(({ x: point[1], y: point[0] }))
                  // })

                  // console.log(getLatlngForXY);
                  // const getLatlng = await getLatlngForXY.json();
                  lineLatlng.push([getLatlng[0], getLatlng[1]])
                  // lineLatlng.push([getLatlng.latlng.OutputData.latitude, getLatlng.latlng.OutputData.longitude])
                } else {
                  lineLatlng.push([point[1], point[0]])
                }
                // }, 1000)
              }
              let lintPopup = '';

              for (const key in properties) {
                lintPopup += `<div><span>${key}：</span><span>${properties[key] ? properties[key] : ''}</span></div>`
              }

              L.polyline(lineLatlng, { color: 'red' }).addTo(map).bindPopup(lintPopup);
            }
            break;
          case 'LineString':
            let lineLatlng = [];
            for (let j = 0; j < geometry.coordinates.length; j++) {
              const point = geometry.coordinates[j]
              if (Math.abs(point[0]) >= 1000 && Math.abs(point[1]) >= 1000) {
                const zone = xyzonejapan(3);
                //X座標-34638.1とY座標-6806.74と座標系情報zoneを指定して、緯度経度を取得する。
                const getLatlng = xy2latlon(point[1], point[0], zone);
                console.log(getLatlng)
                // const getLatlngForXY = await fetch('../getLatlng', {
                //   method: 'post',
                //   headers: {
                //     "Content-Type": "application/json"

                //   },
                //   body: JSON.stringify(({ x: point[1], y: point[0] }))
                // })

                // console.log(getLatlngForXY);
                // const getLatlng = await getLatlngForXY.json();
                lineLatlng.push([getLatlng[0], getLatlng[1]])
                // lineLatlng.push([getLatlng.latlng.OutputData.latitude, getLatlng.latlng.OutputData.longitude])
              } else {
                lineLatlng.push([point[1], point[0]])
              }
            }
            let lintPopup = '';

            for (const key in properties) {
              lintPopup += `<div><span>${key}：</span><span>${properties[key] ? properties[key] : ''}</span></div>`
            }

            L.polyline(lineLatlng, { color: 'red' }).addTo(map).bindPopup(lintPopup);
            break
        }
      }
      // L.geoJSON(geojson).addTo(map);
    })
    .catch(error => {
      console.error(error)
      throw new Error('シェイプファイルの読み取りに失敗しました。');
    });
}