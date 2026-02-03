import React, { useMemo, useState, useEffect, useRef } from 'react';

import {
  Box,
  Button,
  Input,
  Heading,
  Text,
  Menu,
  Link,
  MenuItem,
  Portal,
  Dialog,
  Table,
  Drawer,
  CloseButton,
  IconButton
} from '@chakra-ui/react';
import { Helmet } from "react-helmet-async"; // <- インポートする

import { CiImageOn } from "react-icons/ci";
import { BiCurrentLocation } from "react-icons/bi";

import $ from 'jquery'

import '../../css/map-style.css'
import { checkLogin } from '../../ts/checkLogin';

import { getCurrentPosition, updateMarkersByCenter } from '../../ts/map/coordinate'
import { showMap } from '../../ts/map/showMap'
import { showModal } from '../../ts/map/showModal'
import { judgClick } from '../../ts/map/judgClick'
import { SearchAddress } from './map/serachAddress';
import { SearchMarkers } from './map/sesarchMarkers'


let drawing: boolean = false;
let drawManuClose: boolean = false;

let drawLine: boolean = false;
let drawLineLatLng: any = {}
let lineStart: null | any = null

let drawCircle: boolean = false;
let drawCircleLatLng: any[] = [];

let drawArea: boolean = false;
let drawAreaLatLng: any = {};
let areaStart: null | any = null

let allDraws: any[] = []

let allMarker: any = {};

// let searchMarkers: any[] = [],
let leafletLayerHideMarkers: any[] = [];

let records: any[] = []

let showMapInformation: any = {}

export type mapTileNames = 'open_street_map' | 'GRUS_images' | 'digital_topographic_map' | 'light_colored_map';

interface returnMap {
  map: any,
  currentTile: mapTileNames,
  name: string,
  layerMap: any,
  records: any[],
  allMarker: any[]
}

interface showMapinfo {
  // date: number;
  key: string;
  login: number;
  latitude: number;
  longitude: number;
  mapLayer: string;
}

export const mapView = () => {
  const [login, setLogin] = useState<boolean>(false);
  const [loginUserInfo, setLoginUserInfo] = useState<any>({});

  const [map, setMap] = useState<any>({});
  const [currentTile, setCurrentTile] = useState<mapTileNames>('open_street_map');
  const [mapTileButton, setMapTileButton] = useState<any>(document.getElementById(currentTile));
  const [mapDomain, setMapDomain] = useState<string>(window.location.hostname);
  const [mapName, setMapName] = useState<string>('マップ');
  const [userName, setUserName] = useState<string>('');
  const [showMapInformation, setShowMapInformation] = useState<showMapinfo>({
    // date: Date.now(),
    key: '1',
    login: 1,
    latitude: 35.683,
    longitude: 139.757,
    mapLayer: currentTile
  });

  const [mapTile, setMapTile] = useState<any[]>([
    { label: 'OpenStreetMap', value: 'open_street_map' },
    { label: '国土地理院 GRUS画像', value: 'GRUS_images' },
    { label: '国土地理院 電子地形図', value: 'digital_topographic_map' },
    { label: '国土地理院 電子地形図(淡色地図)', value: 'light_colored_map' },
  ])
  const [otherMaps, setOtherMaps] = useState<any[]>([]);
  const [otherMapLayers, setOtherMapLayers] = useState<any[]>([]);

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [configs, setConfigs] = useState<any>({});
  const [layerMap, setLayserMaps] = useState<{
    'open_street_map': any;
    'GRUS_images': any;
    'digital_topographic_map': any;
    'light_colored_map': any;
  }>({
    'open_street_map': {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    'GRUS_images': {
      attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 GRUS画像（© Axelspace）</a>',
      url: 'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg'
    },
    'digital_topographic_map': {
      attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 電子地形図</a>',
      url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png'
    },
    'light_colored_map': {
      attribution: '&copy; <a href="https://maps.gsi.go.jp/development/ichiran.html">国土地理院 電子地形図（淡色地図）</a>',
      url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png'
    }
  });
  const [records, setRecords] = useState<any[]>([]);
  const [allMarker, setAllMarker] = useState<any[]>([]);
  const [centerMarker, setCenterMarker] = useState<any>({});
  const [position, setPosition] = useState<any[]>([]);

  const didInit = useRef(false);

  // const [buttonList, setDivList] = useState<React.ReactNode[]>([]);

  const [showMapLocalStorageKey, setShowMapLocalStorageKey] = useState<string>('');

  const [newRecord, sestNewRecord] = useState<boolean>(false);
  let zoom: number = 18;
  let hideMarkers: any[] = [];

  useEffect(() => {
    if (didInit.current) return
    const initializeMapDisplay = async () => {
      try {
        //マップ表示の情報を取得するためのキー
        const result = checkLogin(mapDomain);
        console.log(result)

        setUserName(result.userName)
        setLogin(result.login);
        const loginUserInfo = result.loginUserInfomation;

        if (!result.login) {
          window.location.href = `./login`
        }
        const showMapLocalStorageKey = `show_map_${mapDomain}_${loginUserInfo?.id}`;
        setShowMapLocalStorageKey(showMapLocalStorageKey)

        const getConfigParams = new URLSearchParams({ domain: mapDomain, user: loginUserInfo.id })
        const configResp = await fetch(`./getConfig?${getConfigParams.toString()}`);
        // return await configResp.json()

        if (!configResp.ok) {
          throw new Error('設定の取得に失敗しました。');
        }
        /** 設定を取得 */
        const configs = await configResp.json();
        console.log(configs)
        setConfigs(configs)

        if (configs.drawMap) {
          $('#drawing').show()
        }

        const otherMaps: any[] = [];
        const otherMapLayers: any[] = [];

        if (Object.keys(configs.config).length === 0) {
          //config1がないとき
          $('#menu').hide()
          $('#map button').hide()

          if (result.login && loginUserInfo.authority !== 1) {
            $('#map').append(`<h1>閲覧できるマップがありません。\n設定を行ってください。</h1>`);
          } else {
            $('#map').append('<h1>閲覧できるマップがありません。</h1>');
          }
          $('#loading').remove();

        } else {
          const showMapInformation: showMapinfo = localStorage.getItem(showMapLocalStorageKey) !== null ?
            JSON.parse(localStorage.getItem(showMapLocalStorageKey)) :
            {
              // date: Date.now(),
              key: '1',
              login: 1,
              latitude: 35.683,
              longitude: 139.757,
              mapLayer: currentTile
            };
          console.log(showMapInformation);

          setShowMapInformation(showMapInformation);
          localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
          let position: any
          console.log(Object.keys(configs.config)[0])

          let chackAuthority: boolean = false;

          for (const key in configs.config) {
            const config = configs.config[key]

            if (!chackAuthority) {

              // if (Date.now() - (4 * 60 * 60 * 1000) > showMapInformation.date) {
              //   showMapInformation.date = Number(Date.now());
              //   showMapInformation.latitude = position.lat;
              //   showMapInformation.longitude = position.lng;
              //   showMapInformation.mapLayer = config.mapTile;
              // }

              if (configs.config[showMapInformation.key] === undefined) {
                position = await getCurrentPosition(config);
                console.log(position)
                // showMapInformation.date = Number(Date.now());
                showMapInformation.key = key;
                showMapInformation.latitude = position.lat;
                showMapInformation.longitude = position.lng;
                showMapInformation.mapLayer = config.mapTile;
                setShowMapInformation(showMapInformation);
                localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
              } else {
                position = await getCurrentPosition(configs.config[showMapInformation.key]);
                console.log(position)
              }
              setPosition([position.lat, position.lng])

              chackAuthority = true
            }

            if (showMapInformation.key !== key) {
              const option = {
                label: config.mapTitle, value: config.id
              }
              otherMapLayers.push(option)
              otherMaps.push(option)
            }
          }
          // if (!chackAuthority) {
          //   //閲覧できるマップがなかった時、警告を出す。
          //   $('#menu button').hide()
          //   $('#map button').hide()

          //   if (loginUserInfo.authority !== 1) {
          //     setErrorMessage('閲覧できるマップがありません。\n設定を行ってください。')
          //   } else {
          //     setErrorMessage('閲覧できるマップがありません。')
          //   }
          //   // $('.loading-content').attr('class', 'loading-content loaded')
          //   $('#loading').remove();
          // } else {

          if (otherMapLayers.length >= 1) {
            // await createOtherMapModal(config, otherLayer, map, showMapInformation.key);
          } else {
            // $('#map_show_other_layer').hide();
            // $('#mobail_menu #other_maps').hide();
            // $('#mobail_menu #other_maps').next().hide();
          }
          const centerMarker = L.circleMarker([position.lat, position.lng], { color: '#0000ff', fillColor: '#1e90ff', fillOpacity: 1, radius: 10, className: 'marker' }).bindPopup("現在地");

          const showMapResult: returnMap = await showMap(configs, showMapInformation.key, login, showMapInformation);
          setMap(showMapResult.map)
          setCurrentTile(showMapResult.currentTile)
          setMapName(showMapResult.name);
          setLayserMaps(showMapResult.layerMap);
          setRecords(showMapResult.records);
          setAllMarker(showMapResult.allMarker);

          setMapTileButton(mapTileButton);

          centerMarker.addTo(showMapResult.map);
          setCenterMarker(centerMarker)
          // }
        }

        setOtherMaps(otherMaps)
        setOtherMapLayers(otherMapLayers);

        $('#loading').remove();
        console.log(document.getElementById('map'))
      } catch (e: any) {
        alert(e.message);
        console.error(e);
      }
    };

    initializeMapDisplay();
    didInit.current = true;
  }, []);

  const onClick = (event: any) => {
  }

  /**
   * ログアウト
   */
  const logout = () => {
    localStorage.removeItem(`map_${mapDomain}`);
    window.location.href = `./login`;
  }

  /**
   * レイヤーを切り替えたとき
   * @param e
   */
  const changeLayer = (e: any) => {
    const value: mapTileNames = e.value;
    console.log(e)
    layerMap[currentTile].remove(map);
    layerMap[value].addTo(map);

    const newShowMapInfo = showMapInformation

    // localStorage.removeItem(showMapLocalStorageKey);
    newShowMapInfo.mapLayer = value;
    console.log(newShowMapInfo)
    localStorage.setItem(showMapLocalStorageKey, JSON.stringify(newShowMapInfo));
    console.log(localStorage.getItem(showMapLocalStorageKey))
    setCurrentTile(value);
    setShowMapInformation(newShowMapInfo);
  }

  /**
   * マップを切り替えたとき
   * @param e
   */
  const changeMap = async (e: any) => {
    console.log(e);
    const position: any = await getCurrentPosition(configs.config[e.value]);

    const newShowMapInfo = showMapInformation

    // localStorage.removeItem(showMapLocalStorageKey);
    newShowMapInfo.key = e.value;
    newShowMapInfo.latitude = position.lat;
    newShowMapInfo.longitude = position.lng;
    newShowMapInfo.mapLayer = configs.config[e.value].mapTile
    console.log(newShowMapInfo)
    localStorage.setItem(showMapLocalStorageKey, JSON.stringify(newShowMapInfo));
    window.location.href = `./`
  }

  const backCenter = async () => {
    const position: any = await getCurrentPosition(configs.config[showMapInformation.key]);
    const centerLat = position.lat;
    const centerLng = position.lng;
    centerMarker.setLatLng([centerLat, centerLng]);

    const newShowMapInfo = showMapInformation

    newShowMapInfo.latitude = position.lat;
    newShowMapInfo.longitude = position.lng;
    localStorage.setItem(showMapLocalStorageKey, JSON.stringify(newShowMapInfo));
    setShowMapInformation(newShowMapInfo);
    map.panTo(new L.LatLng(centerLat, centerLng))
  }

  /**=====================================ズームレベルの取得===================================================== */
  if (map?.on) {
    //マップが表示されているとき
    map.on('moveend zoomend', function (e: any) {
      //マップムーブイベントで値を出力
      zoom = map.getZoom();

      updateMarkersByCenter(allMarker, hideMarkers, map)

      if (zoom <= 12) {
        $('.marker-label').hide()
      } else {
        $('.marker-label').css('display', 'block');
      }
    });

    centerMarker.on('click', function (e: any) {
      console.log(e);
      map.panTo(new L.LatLng(e.latlng.lat, e.latlng.lng))

      const newShowMapInfo = showMapInformation

      newShowMapInfo.latitude = e.latlng.lat;
      newShowMapInfo.longitude = e.latlng.lng;
      localStorage.setItem(showMapLocalStorageKey, JSON.stringify(newShowMapInfo));
      setShowMapInformation(newShowMapInfo);
      updateMarkersByCenter(allMarker, hideMarkers, map);
    });

    allMarker.forEach((marker: any) => {
      console.log(marker)
      marker.marker.on('click', function (e: any) {
        console.log(e);

        map.panTo(new L.LatLng(e.latlng.lat, e.latlng.lng))
        const newShowMapInfo = showMapInformation

        newShowMapInfo.latitude = e.latlng.lat;
        newShowMapInfo.longitude = e.latlng.lng;
        localStorage.setItem(showMapLocalStorageKey, JSON.stringify(newShowMapInfo));
        setShowMapInformation(newShowMapInfo);
        updateMarkersByCenter(allMarker, hideMarkers, map);
      })
    })
  }

  return (
    <Box h={'100%'}>
      <Helmet>
        <title>{mapName}</title>
      </Helmet>
      <div id='map_header'>
        <Heading mb={6} id="map_title" style={{ margin: 'unset' }}>
          {mapName}
        </Heading>
        <Box id="login_url">
          <Menu.Root>
            <Menu.Trigger>
              <Button as={Button} bgColor="gray.100" id="login_user_name" color="black">
                {userName}
              </Button>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  <Link href='./config'>
                    <Menu.Item value="map-config">マップの設定</Menu.Item>
                  </Link>
                  <Link id="logout" onClick={logout}>
                    <Menu.Item value="logout" color={'red'}>ログアウト</Menu.Item>
                  </Link>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Box>
      </div >
      <Box id="menu">
        <Dialog.Root>
          <Dialog.Trigger>
            <Button size="md" bgColor="cyan.500" id="search_records" title="ピンを絞り込む">絞込み</Button>
          </Dialog.Trigger>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger />
              <Dialog.Header>
                <Dialog.Title />
              </Dialog.Header>
              <Dialog.Body >
                <SearchMarkers map={map} records={records} />
              </Dialog.Body>
              <Dialog.Footer />
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        <Dialog.Root>
          <Dialog.Trigger>
            <Button size="md" bgColor="cyan.500" id="address_search" title="住所検索を行う" >住所</Button>
          </Dialog.Trigger>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger />
              <Dialog.Header>
                <Dialog.Title />
              </Dialog.Header>
              <Dialog.Body >
                <SearchAddress map={map} />
              </Dialog.Body>
              <Dialog.Footer />
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
        <Button size="md" bgColor="cyan.500" id="new_record" title="クリックでピンを登録" >クリックで登録</Button>
        <Button size="md" bgColor={newRecord ? "cyan.700" : "cyan.500"} id="input_image_button" display={configs.addImage ? 'block' : 'none'} title="画像でピンを登録" onClick={() => sestNewRecord(!newRecord)}>画像で登録</Button>
        <Input type="file" id="input_image" style={{ display: 'none' }} multiple />
        <Box className="select-button" id="map_tiles" title="マップのタイルを変更">
          <Menu.Root onSelect={changeLayer}>
            <Menu.Trigger >
              {/* <Button size="md" bgColor="cyan.500" id="map_tile_select_button" className="show-button-dropdown" >
                <img src="./mapTile.png" alt="map tile" style={{
                  width: '35px !important',
                  height: '35px'
                }} />
              </Button> */}
              <IconButton size="md" bgColor="cyan.500">
                <CiImageOn width={'40px'}
                  height={'40px'} />
              </IconButton>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                {mapTile.map((tile: any) => (
                  <Menu.Item
                    // disabled={currentTile ==== tile.valie ? true: false}
                    value={tile.value}>
                    {tile.label}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Box >
        <Box className="select-button" id="map-types" display={otherMaps.length >= 0 ? 'block' : 'none'}>
          <Menu.Root onSelect={changeMap}>
            <Menu.Trigger>
              <Button size="md" bgColor="cyan.500" id="map_type_select_button" className="show-button-dropdown" title="表示するマップを切り替える" >
                マップ切替
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                {otherMaps.map((map: any) => (
                  <Menu.Item value={map.value}>{map.label}</Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Box>
        <Box className="select-button" id="map-layers" display={otherMapLayers.length >= 0 ? 'block' : 'none'}>
          <Menu.Root>
            <Menu.Trigger >
              <Button size="md" bgColor="cyan.500" id="map_show_other_layer" className="show-button-dropdown" title="閲覧できるほかのマップを重ねて表示する" >
                他のマップ
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content>
                {otherMapLayers.map((map: any) => (
                  <Table.Root>

                  </Table.Root>
                  // <Menu.Item value={map.value}>{map.label}</Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        </Box>

        <Drawer.Root closeOnInteractOutside={false} modal={false} placement={"start"} >
          <Drawer.Trigger asChild>
            <Button size="md" bgColor="cyan.500" id="drawing" title="マップ上に描画を行う" display={configs.drawMap ? 'block' : 'none'} >描画</Button>
          </Drawer.Trigger>
          <Portal>
            <Drawer.Positioner pointerEvents="none">
              <Drawer.Content>
                <Drawer.Body>
                  <Button>線</Button>
                  <Button>円</Button>
                  <Button>多角形</Button>
                </Drawer.Body>
                <Drawer.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Content>
            </Drawer.Positioner>
          </Portal>
        </Drawer.Root>

        <Button size="md" bgColor="cyan.500" id="add_shapefile" title="シェープファイルでピンや経路を追加する" display={configs.addShapeFile ? 'block' : 'none'}
          onClick={onClick}>シェープファイルで追加</Button>
        <Input type="file" id="select_shapefile" style={{ display: 'none' }} multiple />
        <Box id="controlArtistName" />
        <Box id="controlAlbumName" />
        <Box id="controlTitleName" />
        <Box id="records" />
      </Box >
      <Box id="map">
        <Text>{errorMessage}</Text>
        <IconButton variant="subtle" colorPalette={"white"} w={"35px"} h={"35px"} rounded={"xl"}
          position={"fixed"} zIndex={"1001"} bottom={0} right={0} marginBottom={"20px"} marginRight={"10px"} boxShadow={"0px 0px 1px"}
          onClick={backCenter}>
          <BiCurrentLocation />
        </IconButton>
      </Box>
      {/* <MapContainer center={position} zoom={18}>
        <TileLayer
          attribution={layerMap[currentTile]}>
          {allMarker.forEach((markers: any) => {
            <Marker position={[markers.marker.latlng.lat, markers.markar.latlng.lng]}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          })}
        </TileLayer>
      </MapContainer> */}
    </Box >
  )
}