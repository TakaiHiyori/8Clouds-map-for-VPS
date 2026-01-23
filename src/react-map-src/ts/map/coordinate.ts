// import { showOtherLayersMakers } from "./createOtherLayer.mjs";

/**
 * 現在地を取得
 * @param {object} mapConfig マップの設定
 * @returns 経度、緯度
 */
export const getCurrentPosition = (mapConfig: any) => {
    console.log('現在地の取得開始')
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('現在取得可能')
                //位置情報が取得できるとき
                const lat = Number(position.coords.latitude);
                const lng = Number(position.coords.longitude);
                resolve({ lat, lng });
            },
            (error) => {
                //位置情報が取得できないとき
                console.log('現在取得不可')
                console.error(error);
                // エラー時はデフォルト値を返す
                resolve({
                    lat: Number(mapConfig.centerLat),
                    lng: Number(mapConfig.centerLng)
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
};

export function getBoundingBox(lat: number, lng: number, radiusKm: number = 10) {
    const earthRadius = 6371; // 地球の半径(km)
    const latRadian = lat * Math.PI / 180;

    // 緯度・経度の差分
    const latDiff = (radiusKm / earthRadius) * (180 / Math.PI);
    const lngDiff = (radiusKm / (earthRadius * Math.cos(latRadian))) * (180 / Math.PI);

    return {
        minLat: lat - latDiff,
        maxLat: lat + latDiff,
        minLng: lng - lngDiff,
        maxLng: lng + lngDiff
    };
}

export function getMapViewDistanceKm(map: any) {
    const bounds = map.getBounds(); // 表示中の緯度経度範囲
    const sw = bounds.getSouthWest(); // 左下
    const ne = bounds.getNorthEast(); // 右上
    return getDistanceKm(sw.lat, sw.lng, ne.lat, ne.lng); // 対角線距離
}

// 距離計算（前のHaversine関数を再利用）
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function updateMarkersByCenter(allMarker: any, hideMarkers: any, map: any) {
    // 現在の中心を取得
    const center = map.getCenter();
    const centerLat = center.lat;
    const centerLng = center.lng;

    // 表示されている距離を取得
    const dist = getMapViewDistanceKm(map);

    const latLngBox = getBoundingBox(centerLat, centerLng, dist)

    Object.keys(allMarker).forEach((key) => {
        if (allMarker[key].marker) {
            const latitude = allMarker[key].marker['_latlng'].lat;
            const longitude = allMarker[key].marker['_latlng'].lng;

            const inside = (latLngBox.minLat < Number(latitude) && latLngBox.maxLat > Number(latitude) &&
                latLngBox.minLng < Number(longitude) && latLngBox.maxLng > Number(longitude))
            if (!inside) {
                map.removeLayer(allMarker[key].marker)
                map.removeLayer(allMarker[key].markerName)
            } else {
                if (hideMarkers.indexOf(key) === -1) {
                    allMarker[key].marker.addTo(map)
                    allMarker[key].markerName.addTo(map)
                } else {
                    map.removeLayer(allMarker[key].marker)
                    map.removeLayer(allMarker[key].markerName)
                }
            }
        }
    })

    // showOtherLayersMakers(latLngBox, map)
}