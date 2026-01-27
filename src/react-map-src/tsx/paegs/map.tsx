import React, { useMemo, useState, useEffect } from 'react';

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
  Dialog
} from '@chakra-ui/react';

// import { MapContainer, TileLayer, useMap } from 'react-leaflet'

import $ from 'jquery'

import '../../css/map-style.css'
import 'leaflet/dist/leaflet.css'
import { checkLogin } from '../../ts/checkLogin';

import { getCurrentPosition } from '../../ts/map/coordinate'
import { showMap } from '../../ts/map/showMap'
import { showModal } from '../../ts/map/showModal'
import { judgClick } from '../../ts/map/judgClick'
import { SearchAddress } from './map/serachAddress';
import { SearchMarkers } from './map/sesarchMarkers'

// import '../../css/51-modern-default.css';
// import '../../css/loading.css';
// import '../../css/style.css';
// import '../../css/multiple-select-style.css';

let newRecord: boolean = false;
let currentTile: string = "OpenStreetMap";
let layerMap: any
let map: any
// let map: any;
const otherLayer: any[] = [];
let zoom: number = 18;

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

let hideMarkers: any[] = []
// let searchMarkers: any[] = [],
let leafletLayerHideMarkers: any[] = [];

let records: any[] = []

let showMapInformation: any = {}

export const mapView: React.FC = () => {
  const mapDomain: string = window.location.hostname;
  let mapName: string = 'マップ';
  let userName: string = '';
  const otherMap: any[] = []
  let errorMessage: string = '';
  let config: any = {};

  let Initial = false

  const result = checkLogin(mapDomain);
  console.log(result)

  userName = result.userName
  const login = result.login;
  const loginInfomation = result.loginUserInfomation

  if (!result.login) {
    window.location.href = `./login`
  }


  const [buttonList, setDivList] = useState<React.ReactNode[]>([]);

  // 2. 新しいdivを追加する関数
  const addButton = (layer: any) => {
    const newElement = (
      <Button bgColor="gray.100" variant="subtle" size="sm" justifyContent="flex-start" w={'100%'} style={{ borderRadius: '0%' }}
        id={layer.id} className={layer.className}>
        {layer.name}
      </Button>
    );
    // 新しい要素を追加した新しい配列をstateにセット
    setDivList([...buttonList, newElement]);
  };

  const showMapLocalStorageKey = `show_map_${mapDomain}_${loginInfomation?.id}`
  useEffect(() => {
    if (Initial || !result.login) return
    const initializeMapDisplay = async () => {
      try {
        //マップ表示の情報を取得するためのキー

        const getConfigParams = new URLSearchParams({ domain: mapDomain, user: loginInfomation.id })
        const configResp = await fetch(`./getConfig?${getConfigParams.toString()}`);
        // return await configResp.json()

        if (!configResp.ok) {
          throw new Error('設定の取得に失敗しました。')
        }
        /** 設定を取得 */
        config = await configResp.json();
        console.log(config)

        if (config.drawMap) {
          $('#drawing').show()
        }

        if (Object.keys(config).length <= 6) {
          //config1がないとき
          $('#menu').hide()
          $('#map button').hide()

          if (login && loginInfomation.authority !== 1) {
            $('#map').append(`<h1>閲覧できるマップがありません。\n設定を行ってください。</h1>`);
          } else {
            $('#map').append('<h1>閲覧できるマップがありません。</h1>');
          }
          $('#loading').remove();

        } else {
          const showMapLocation: null | any = localStorage.getItem(showMapLocalStorageKey)

          let chackAuthority: boolean = false;

          for (const key in config) {
            if (config[key].mapTitle) {
              if (!chackAuthority) {
                if (!showMapLocation || Date.now() - (4 * 60 * 60 * 1000) > JSON.parse(showMapLocation).date) {
                  const position: any = await getCurrentPosition(config[key])
                  console.log(position)
                  localStorage.removeItem(showMapLocalStorageKey);
                  showMapInformation = {
                    date: Date.now(),
                    key: key,
                    login: loginInfomation.id,
                    latitude: position.lat,
                    longitude: position.lng,
                    mapLayer: config[key].mapTile
                  }
                  localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
                } else {
                  showMapInformation = JSON.parse(showMapLocation);
                  if (config[showMapInformation.key] === undefined) {
                    const position: any = await getCurrentPosition(config[key])
                    console.log(position)
                    localStorage.removeItem(showMapLocalStorageKey);
                    showMapInformation = {
                      date: Date.now(),
                      key: key,
                      login: loginInfomation.id,
                      latitude: position.lat,
                      longitude: position.lng,
                      mapLayer: config[key].mapTile
                    }
                    localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
                  }
                  // }
                }

                chackAuthority = true
              }

              // addButton({ id: key, name: config[key].mapTitle, className: 'button-selects' })

              if (showMapInformation.key !== key) {
                otherLayer.push(key)
              }
            }
          }
          if (!chackAuthority) {
            //閲覧できるマップがなかった時、警告を出す。
            $('#menu button').hide()
            $('#map button').hide()

            if (loginInfomation.authority !== 1) {
              errorMessage = '閲覧できるマップがありません。\n設定を行ってください。'
            } else {
              errorMessage = '閲覧できるマップがありません。'
            }
            // $('.loading-content').attr('class', 'loading-content loaded')
            $('#loading').remove();
          } else {

            $('#map-types').css('display', 'block');
            $('#map-layers').css('display', 'block');

            $(`#map-types .select-options #${showMapInformation.key}`).attr('class', 'selected-option');

            if (otherLayer.length >= 1) {
              // await createOtherMapModal(config, otherLayer, map, showMapInformation.key);
            } else {
              $('#map_show_other_layer').hide();
              $('#mobail_menu #other_maps').hide();
              $('#mobail_menu #other_maps').next().hide();
            }
            const showMapResult = await showMap(config, showMapInformation.key, login, showMapInformation);
            map = showMapResult.map
            currentTile = showMapResult.currentTile
            mapName = showMapResult.name;
            layerMap = showMapResult.layerMap;
            records = showMapResult.records

            document.getElementById(currentTile).disabled = true
          }
        }
        $('#loading').remove();
        console.log(document.getElementById('map'))
      } catch (e: any) {
        alert(e.message);
        console.error(e);
      }
    };

    initializeMapDisplay();
  }, [login, loginInfomation]);


  const modalHide = (selectOptionModal: any[], addressSearchModal: null | any, searchModal: null | any) => {
    for (let i = 0; i < selectOptionModal.length; i++) {
      selectOptionModal[i].style.display = 'none';
    }
    if (addressSearchModal) {
      addressSearchModal.style.display = 'none';
    }
    if (searchModal) {
      searchModal.style.display = 'none';
    }
  }

  const onClick = (event: any) => {
    const selectOptionModal: any = document.getElementsByClassName('select-options');
    const addressSearchModal: any = document.getElementById('address_search_modal');
    const searchModal: any = document.getElementById('searchModal')

    if (event.target.nextElementSibling && event.target.nextElementSibling.tagName === 'DIV' && event.target.nextElementSibling.style.display === 'none') {
      modalHide(selectOptionModal, addressSearchModal, searchModal);

      event.target.nextElementSibling.style.display = 'block'
    } else if (event.target.parentNode.nextElementSibling && event.target.parentNode.nextElementSibling.tagName === 'DIV' && event.target.parentNode.nextElementSibling === 'none') {
      modalHide(selectOptionModal, addressSearchModal, searchModal);

      event.target.parentNode.nextElementSibling = 'block'
    } else {
      modalHide(selectOptionModal, addressSearchModal, searchModal);
    }
  }

  $('body').click(function (e) {
    judgClick(e);
  })

  const logout = () => {
    localStorage.removeItem(`map_${mapDomain}`);
    window.location.href = `./login`;
  }

  const changeLayer = (e: any) => {
    layerMap[currentTile].remove(map);
    document.getElementById(currentTile).disabled = false
    currentTile = e.target.id;
    document.getElementById(currentTile).disabled = true
    layerMap[currentTile].addTo(map);

    showMapInformation.mapLayer = currentTile;
    localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
  }

  return (
    <Box h={'100%'}>
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
            <Button size="md" bgColor="cyan.500" id="search_records" title="ピンを絞り込む" onClick={onClick}>絞込み</Button>
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
            <Button size="md" bgColor="cyan.500" id="address_search" title="住所検索を行う" onClick={onClick}>住所</Button>
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
        <Button size="md" bgColor="cyan.500" id="new_record" style={{ display: 'none' }} title="マップをクリックして登録する" onClick={onClick}>クリックで登録</Button>
        <Button size="md" bgColor="cyan.500" id="input_image_button" style={{ display: 'none' }} title="画像でピンを登録する" onClick={onClick}>画像で登録</Button>
        <Input type="file" id="input_image" style={{ display: 'none' }} multiple />
        <Box className="select-button" id="map_tiles" title="マップのタイルを変更">
          <Button size="md" bgColor="cyan.500" id="map_tile_select_button" className="show-button-dropdown" onClick={onClick}>
            <img src="./mapTile.png" alt="map tile" style={{
              width: '35px !important',
              height: '35px'
            }} />
          </Button>
          <Box className="select-options map-tile-select-modal" style={{ display: 'none' }}
            bg="white" borderWidth="1px" shadow="md" borderRadius="md" w={'256px'}>
            <Button bgColor="gray.100" variant="subtle" size="sm" justifyContent="flex-start" w={'100%'} style={{ borderRadius: '0%' }} id="open_street_map" className="button-selects" onClick={changeLayer}>OpenStreetMap</Button>
            <Button bgColor="gray.100" variant="subtle" size="sm" justifyContent="flex-start" w={'100%'} style={{ borderRadius: '0%' }} id="GRUS_images" className="button-selects" onClick={changeLayer}>国土地理院 GRUS画像</Button>
            <Button bgColor="gray.100" variant="subtle" size="sm" justifyContent="flex-start" w={'100%'} style={{ borderRadius: '0%' }} id="digital_topographic_map" className="button-selects" onClick={changeLayer}>国土地理院 電子地形図</Button>
            <Button bgColor="gray.100" variant="subtle" size="sm" justifyContent="flex-start" w={'100%'} style={{ borderRadius: '0%' }} id="light_colored_map" className="button-selects" onClick={changeLayer}>国土地理院 電子地形図(淡色地図)</Button>
          </Box>
        </Box >
        <Box className="select-button" id="map-types">
          <Button size="md" bgColor="cyan.500" id="map_type_select_button" className="show-button-dropdown" title="表示するマップを切り替える" onClick={onClick}>
            マップ切替
          </Button>
          <Box className="select-options map-type-select-modal" style={{ display: 'none' }}
            bg="white" borderWidth="1px" shadow="md" borderRadius="md">
          </Box>
        </Box>
        <Box className="select-button" id="map-layers">
          <Button size="md" bgColor="cyan.500" id="map_show_other_layer" className="show-button-dropdown" title="閲覧できるほかのマップを重ねて表示する" onClick={onClick}>
            他のマップ
          </Button>
          <Box className="select-options map-show-other-layer-modal" style={{ display: 'none' }} >
            {/* {buttonList} */}
          </Box>
        </Box>
        <Button size="md" bgColor="cyan.500" id="drawing" style={{ display: 'none' }} title="マップ上に描画を行う" onClick={onClick}>描画</Button>
        <Button size="md" bgColor="cyan.500" id="add_shapefile" title="シェープファイルでピンや経路を追加する" style={{ display: 'none' }} onClick={onClick}>シェープファイルで追加</Button>
        <Input type="file" id="select_shapefile" style={{ display: 'none' }} multiple />
        <Box id="controlArtistName" />
        <Box id="controlAlbumName" />
        <Box id="controlTitleName" />
        <Box id="records" />
      </Box >
      <Box id="map">
        <Text>{errorMessage}</Text>
      </Box>
    </Box >
  )
}