import React, { useMemo, useState } from 'react';
import {
  Alert,
  Accordion,
  Badge,
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Input,
  Progress,
  RadioGroup,
  Stack,
  Tabs,
  Tooltip,
  Switch,
  Checkbox,
  Table,
  Text,
} from '@chakra-ui/react';

// import { SearchIcon, AddIcon } from '@chakra-ui/icons';
// import '../../css/51-modern-default.css';
// import '../../css/loading.css';
// import '../../css/style.css';
// import '../../css/multiple-select-style.css';

export const mapView: React.FC = () => {

  return (
    <Container>
      <Box id="menu">
        <HStack wrap="wrap" gap="6">
          <Button size="md" id="search_records" title="ピンを絞り込む">絞込み</Button>
          <Button size="md" id="address_search" title="住所検索を行う">住所</Button>
          <Button size="md" id="new_record" style={{ display: 'none' }} title="マップをクリックして登録する">クリックで登録</Button>
          <Button size="md" id="input_image_button" style={{ display: 'none' }} title="画像でピンを登録する">画像で登録</Button>
        </HStack>
        <Input type="file" id="input_image" style={{ display: 'none' }} multiple />
        <Box className="select-button" id="map_tiles" title="マップのタイルを変更">
          <HStack wrap="wrap" gap="6">
            <Button id="map_tile_select_button" className="show-button-dropdown">
              {/* <img src="../mapTile.png" alt="map tile" /> */}
            </Button>
            <Box className="select-options" style={{ display: 'none' }}>
              <Box id="OpenStreetMap" className="button-selects">OpenStreetMap</Box>
              <Box id="GRUS画像" className="button-selects">国土地理院 GRUS画像</Box>
              <Box id="電子地形図" className="button-selects">国土地理院 電子地形図</Box>
              <Box id="淡色地図" className="button-selects">国土地理院 電子地形図（淡色地図）</Box>
            </Box>
          </HStack>
        </Box>
        <Box className="select-button" id="map-types">
          <Button id="map_type_select_button" className="show-button-dropdown" title="表示するマップを切り替える">
            マップ切替
          </Button>
          <Box className="select-options" style={{ display: 'none' }} />
        </Box>
        <Box className="select-button" id="map-layers">
          <Button id="map_show_other_layer" className="show-button-dropdown" title="閲覧できるほかのマップを重ねて表示する">
            他のマップ
          </Button>
          <Box className="select-options" style={{ display: 'none' }} />
        </Box>
        <Button id="drawing" style={{ display: 'none' }} title="マップ上に描画を行う">描画</Button>
        <Button id="add_shapefile" title="シェープファイルでピンや経路を追加する" style={{ display: 'none' }}>シェープファイルで追加</Button>
        <Input type="file" id="select_shapefile" style={{ display: 'none' }} multiple />
        <Box id="controlArtistName" />
        <Box id="controlAlbumName" />
        <Box id="controlTitleName" />
        <Box id="records" />
        <Box className="map" />
      </Box>
    </Container>
  )
}