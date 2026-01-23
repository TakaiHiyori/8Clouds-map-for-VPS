import { Badge, Box, Button, Checkbox, CloseButton, ColorPicker, createListCollection, Field, Flex, HStack, Icon, Image, Input, InputGroup, NumberInput, parseColor, Portal, RadioGroup, Select, Stack, Switch, Table, Tabs } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuCheck } from 'react-icons/lu';

import { setDropdown } from '../../ts/config/setDropdown';

interface FormValues {
  openURL: string,
  appId: number,
  token: string,
  centerLat: number,
  centerLng: number,
  marker: string,
  latitude: string,
  longitude: string,
  name: string,
  group: string,
  color: string,
  popupField: any,
  mapTile: string
}

export const MapConfig = ({ mapConfig }: { mapConfig: any }) => {
  const config = mapConfig.config;
  const domain = mapConfig.domain;
  const addImage = mapConfig.addImage;
  const user = mapConfig.user;

  const [disabled, changeDisabled] = useState<boolean>(config ? false : true)
  const [colorOptions, setColorOptions] = useState<any[]>([]);

  const [field, getField] = useState<any>({})
  const link: string = location.href.replace(/[^/]+$/, '') + 'public/'

  const [value, setValue] = useState("Initial value")
  const inputRef = useRef<HTMLInputElement | null>(null)


  const markerShapes = createListCollection({
    items: [
      { label: "ピン", value: "pin" },
      { label: "円", value: "circle" }
    ],
  })

  const pinIcons = createListCollection({
    items: [
      { label: "丸", value: "circle", icon: <Icon><i className="fa-solid fa-circle"></i></Icon> },
      { label: "家", value: "home", icon: <i className="fa-solid fa-house"></i> },
      { label: "ビル", value: "building", icon: <i className="fa-solid fa-building"></i> },
      { label: "お店", value: "store", icon: <i className="fa-solid fa-shop"></i> },
      { label: "学校", value: "school", icon: <i className="fa-solid fa-school"></i> },
      { label: "病院", value: "hospital", icon: <i className="fa-solid fa-hospital"></i> },
      { label: "倉庫", value: "warehouse", icon: <i className="fa-solid fa-warehouse"></i> },
      { label: "人", value: "user", icon: <i className="fa-solid fa-user"></i> },
      { label: "車", value: "car", icon: <i className="fa-solid fa-car"></i> },
      { label: "道", value: "road", icon: <i className="fa-solid fa-road"></i> },
      { label: "食器", value: "utensils", icon: <i className="fa-solid fa-utensils"></i> },
      { label: "マグカップ", value: "mug", icon: <i className="fa-solid fa-mug-saucer"></i> },
      { label: "本", value: "book", icon: <i className="fa-solid fa-book"></i> },
      { label: "電話", value: "phone", icon: <i className="fa-solid fa-phone"></i> },
      { label: "手紙", value: "envelope", icon: <i className="fa-solid fa-envelope"></i> },
      { label: "炎", value: "fire", icon: <i className="fa-solid fa-fire"></i> },
      { label: "水", value: "water", icon: <i className="fa-solid fa-water"></i> },
    ]
  })

  const [latitudes, setlatitudes] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const [longitudes, setLongitudes] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const [names, setNames] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const [groups, setGroups] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const [colors, setColors] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const [popups, setpopups] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const [files, setfiles] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const [datetimes, setDatetimes] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const popupDefaultValue: any = [];

  const [checkRegistration, changeCheckRegistration] = useState<boolean>(config && config.addImage ? config.addImage.checkRegistration : false);
  const [imageDatetime, changeImageDatetime] = useState<boolean>(config && config.addImage ? config.addImage.imageDatetime : false);

  const [narrowFields, setNarrowFields] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const [conditions, setconditions] = useState<any>(
    createListCollection({
      items: []
    })
  );

  const mapLayers = createListCollection({
    items: [
      { label: 'OpenStreetMap', value: 'open_street_map' },
      { label: '国土地理院 GRUS画像', value: 'GRUS_images' },
      { label: '国土地理院 電子地形図', value: 'digital_topographic_map' },
      { label: '国土地理院 電子地形図 淡色地図', value: 'light_colored_map' }
    ]
  })

  const users = createListCollection({
    items: []
  })

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current || !config) return;

    const getKintoneField = async () => {
      try {
        const params = new URLSearchParams({ domain: domain, appId: config.appId, token: config.token })
        const getFieldResp = await fetch(`./kintone/getField?${params.toString()}`);

        if (!getFieldResp.ok) {
          throw new Error('フィールドの取得に失敗しました。');
        }

        const getField = await getFieldResp.json();
        console.log(getField)
        return getField.properties;
      } catch (e: any) {
        alert(e.message);
        return {}
      }
    }

    getKintoneField()
      .then((field: any) => getField(field))
      .catch(console.error)

    if (config && config.color !== '') {
      const options: any[] = []
      for (let i = 1; i <= config.change_color_row_num; i++) {
        options.push({
          option: config['change_color_row' + i].option,
          color: config['change_color_row' + i].color,
          icon: config['change_color_row' + i].icon,
          iconColor: config['change_color_row' + i].iconColor
        })
      }
      setColorOptions(options)
    }

    const [arrayLatitudes, arrayLongitudes, arrayNames, arrayGroups, arrayColors, arrayFile, arrayDatetimes, arrayPopups, arrayNarrowFields] = setDropdown(field)

    setlatitudes(createListCollection({
      items: arrayLatitudes
    }));

    setLongitudes(createListCollection({
      items: arrayLongitudes
    }));

    setNames(createListCollection({
      items: arrayNames
    }));

    setGroups(createListCollection({
      items: arrayGroups
    }));

    setColors(createListCollection({
      items: arrayColors
    }));

    setpopups(createListCollection({
      items: arrayPopups
    }));

    setfiles(createListCollection({
      items: arrayFile
    }));

    setDatetimes(createListCollection({
      items: arrayDatetimes
    }));

    setNarrowFields(createListCollection({
      items: arrayNarrowFields
    }));


    setconditions(createListCollection({
      items: []
    }))

    if (config) {
      for (let i = 1; i < config.popup_row_number; i++) {
        popupDefaultValue.push(config['popup_row' + i].popupField)
      }
    }
    didInit.current = true;

  }, []);

  const endElement = value ? (
    <CloseButton
      size="xs"
      onClick={() => {
        setValue("")
        inputRef.current?.focus()
      }}
      me="-2"
    />
  ) : undefined

  const randString = () => {

  }

  console.log(field)
  console.log(colorOptions)

  const swatches = ["#FF0000", "#FFCCCB", "#8b0000", "#ffa500", "#eedcb3", "#008000", "#006400", "#90ee90", "#0093ff", "#00008b"
    , "#ADD8E6", "#800080", "#871F78", "#f5b2b2", "#f0f8ff", "#ffffff", "#808080", "#d3d3d3", "#000000"]

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const mapConfigSave = handleSubmit(async (data: any) => {
    console.log(data);
    changeDisabled(true)
  })

  const getNewAppField = async (e: any) => {
    console.log(e)
    const appIdField: any = document.getElementById('app_id');
    const apiTokenField: any = document.getElementById('api_token');
    console.log(appIdField.value)
    console.log(apiTokenField.value)

    let newField = {}
    const colorValue = []

    if (appIdField.value !== '' && apiTokenField.value !== '') {
      try {
        const params = new URLSearchParams({ domain: domain, appId: appIdField.value, token: apiTokenField.value });
        const getFieldResp = await fetch(`./kintone/getField?${params.toString()}`);

        if (!getFieldResp.ok) {
          throw new Error('フィールドの取得に失敗しました。');
        }

        const getField = await getFieldResp.json();
        newField = getField.properties

        if (config && (config.appId === appIdField.value)) {
          colorValue.push(config.color)
        } else {
          colorValue.push('')
        }

      } catch (e: any) {
        console.error(e)
        newField = {}
        colorValue.push('')
      }
    } else {
      colorValue.push('')
    }
    console.log(newField)
    console.log(field)

    console.log('JSON.stringify(newField) !== JSON.stringify(field):' + (JSON.stringify(newField) !== JSON.stringify(field)))
    if (JSON.stringify(newField) !== JSON.stringify(field)) {
      console.log('Object.keys(newField).length === 0' + (Object.keys(newField).length === 0))
      if (Object.keys(newField).length === 0) {
        getField(newField)
        setlatitudes(createListCollection({ items: [] }))
        setLongitudes(createListCollection({ items: [] }))
        setNames(createListCollection({ items: [] }))
        setGroups(createListCollection({ items: [] }))
        setColors(createListCollection({ items: [] }))
        setNarrowFields(createListCollection({ items: [] }))
        setpopups(createListCollection({ items: [] }));

        setfiles(createListCollection({ items: [] }));
        setDatetimes(createListCollection({ items: [] }));
      } else {
        const [arrayLatitudes, arrayLongitudes, arrayNames, arrayGroups, arrayColors, arrayFile, arrayDatetimes, arrayPopups, arrayNarrowFields] = setDropdown(newField)
        getField(newField)
        setlatitudes(createListCollection({ items: arrayLatitudes }));
        setLongitudes(createListCollection({ items: arrayLongitudes }));
        setNames(createListCollection({ items: arrayNames }));
        setGroups(createListCollection({ items: arrayGroups }));
        setColors(createListCollection({ items: arrayColors }));
        setNarrowFields(createListCollection({ items: arrayNarrowFields }));
        setpopups(createListCollection({ items: arrayPopups }));
        setfiles(createListCollection({ items: arrayFile }));
        setDatetimes(createListCollection({ items: arrayDatetimes }));
      }
    }

    if ((colorOptions.length === 0 && colorValue[0] !== '') || (colorOptions.length !== 0 && colorValue[0] === '')) {
      colorChange({ value: colorValue })
    }
    console.log(field)
  }

  const colorChange = (e: any) => {
    console.log(e.value[0])
    const options: any[] = []
    if (e.value[0] !== '') {
      if (config.color === e.value[0]) {
        for (let i = 1; i <= config.change_color_row_num; i++) {
          console.log(config['change_color_row' + i])
          options.push({
            option: config['change_color_row' + i].option,
            color: config['change_color_row' + i].color,
            icon: config['change_color_row' + i].icon,
            iconColor: config['change_color_row' + i].iconColor
          })
        }
      } else {
        Object.keys(field[e.value[0]].options).map((option: any) => {
          console.log(field[e.value[0]].options[option])
          options.push({
            option: field[e.value[0]].options[option].label,
            color: '#ff0000',
            icon: '',
            iconColor: '#ffffff'
          })
        })
      }
    }
    console.log(options)
    setColorOptions(options)
  }

  // const addPopupField = () => {

  // }

  return (
    <Box h={"100%"}>
      <Tabs.Root defaultValue="config" variant="plain" h={"100%"}>
        <Tabs.List bg="bg.muted" rounded="l3" p="1" h={"48px"}>
          <Tabs.Trigger value="config">
            マップの設定
          </Tabs.Trigger>
          <Tabs.Trigger value="condition" disabled={disabled}>
            絞り込み設定
          </Tabs.Trigger>
          <Tabs.Trigger value="user" disabled={disabled}>
            ユーザー権限設定
          </Tabs.Trigger>
          <Tabs.Indicator rounded="l2" />
        </Tabs.List>
        <Tabs.Content value="config" h={"100%"}>
          <form onSubmit={mapConfigSave} style={{ height: '100%' }}>
            <Flex margin={"5px, 0px, 10px, 0"}>
              <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}>
                保存
              </Button>
            </Flex>

            {/* 閲覧だけできるマップのURLを作成する */}
            <Box overflow={"auto"} h={"calc(100% - 105px)"}>
              <Field.Root className='open-url-name' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>閲覧専用マップのURL</Field.Label>
                  {/* <Badge variant="outline" color="red" borderColor="red">必須</Badge> */}
                </Stack>
                <InputGroup endElement={endElement}>
                  <Input
                    type="text"
                    variant="outline"
                    id="open_url_name"
                    defaultValue={config ? config.openURL : ''}
                    {...register("openURL", {
                      pattern: { value: /^[a-zA-Z0-9]*$/, message: '半角英数字のみで入力してください。' },
                      maxLength: { value: 250, message: '255文字以下にしてください。' }
                    })
                    } />
                </InputGroup>
                <Button bgColor="white" color="cyan.500" px={4} py={2} borderRadius="md" fontSize={"small"} fontWeight="bold" w={"125px"} h={"40px"} borderColor="cyan.500" >
                  ランダムに生成する
                </Button>
                <Field.ErrorText id='open_url_name_error'></Field.ErrorText>
              </Field.Root>

              {/* kintoneのアプリIDを入力 */}
              <Field.Root className='app-id' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    アプリID
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Field.Label>
                </Stack>
                <InputGroup>
                  <NumberInput.Root width="200px">
                    <NumberInput.Control />
                    <NumberInput.Input
                      id='app_id'
                      defaultValue={config ? config.appId : ''}
                      {...register("appId", {
                        required: 'アプリIDは必須の項目です。'
                      })}
                      onChange={getNewAppField}
                    />
                  </NumberInput.Root>
                </InputGroup>
                <Field.ErrorText id='app_id_error'>{errors.appId && errors.appId?.message}</Field.ErrorText>
              </Field.Root>

              {/* kintoneのAPIトークンを入力 */}
              <Field.Root className='token' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    APIトークン
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Field.Label>
                </Stack>
                <InputGroup>
                  <Input
                    type="text"
                    variant="outline"
                    id="api_token"
                    defaultValue={config ? config.token : ''}
                    {...register("token", {
                      required: 'APIトークンは必須の項目です。'
                    })}
                    onChange={getNewAppField}
                  />
                </InputGroup>
                <Field.ErrorText id='token_error'>{errors.appId && errors.appId?.message}</Field.ErrorText>
              </Field.Root>

              {/* 位置情報停止時にマップの中心となる緯度を入力 */}
              <Field.Root className='center-lat' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    マップの中心となる緯度
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Field.Label>
                </Stack>
                <InputGroup>
                  <NumberInput.Root width="200px">
                    <NumberInput.Control />
                    <NumberInput.Input
                      id='center_lat'
                      defaultValue={config ? config.centerLat : ''}
                      {...register("centerLat")}
                    />
                  </NumberInput.Root>
                </InputGroup>
                <Field.ErrorText id='center_lat_error'></Field.ErrorText>
              </Field.Root>

              {/* 位置情報停止時にマップの中心となる経度を入力 */}
              <Field.Root className='center-lng' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    マップの中心となる経度
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Field.Label>
                </Stack>
                <InputGroup>
                  <NumberInput.Root width="200px">
                    <NumberInput.Control />
                    <NumberInput.Input
                      id='center_lng'
                      defaultValue={config ? config.centerLng : ''}
                      {...register("centerLng")}
                    />
                  </NumberInput.Root>
                </InputGroup>
                <Field.ErrorText id='center_lng_error'></Field.ErrorText>
              </Field.Root>

              {/* マップピンの形を選択 */}
              <Field.Root className='marker' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    マップピンの形
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Field.Label>
                </Stack>
                <Select.Root collection={markerShapes} size="sm" width="320px" defaultValue={[config ? config.marker : 'pin']}
                  {...register("marker")}
                >
                  <Select.HiddenSelect />
                  <Select.Label></Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {markerShapes.items.map((markerShape) => (
                          <Select.Item item={markerShape} key={markerShape.value}>
                            {markerShape.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Field.Root>

              {/* kintone上にある緯度フィールドを選択 */}
              <Field.Root className='latitude' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    緯度フィールド
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Field.Label>
                </Stack>
                <Select.Root collection={latitudes} size="sm" width="320px" defaultValue={[config ? config.latitude : '']}
                  {...register("latitude")}
                >
                  <Select.HiddenSelect />
                  <Select.Label></Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {latitudes.items.map((latitude: any) => (
                          <Select.Item item={latitude} key={latitude.value}>
                            {latitude.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                <Field.ErrorText id='latitude_error'></Field.ErrorText>
              </Field.Root>

              {/* kintone上にある経度フィールドを選択 */}
              <Field.Root className='longitude' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    経度フィールド
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Field.Label>
                </Stack>
                <Select.Root collection={longitudes} size="sm" width="320px" defaultValue={[config ? config.longitude : '']}
                  {...register("longitude")}
                >
                  <Select.HiddenSelect />
                  <Select.Label></Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {longitudes.items.map((longitude: any) => (
                          <Select.Item item={longitude} key={longitude.value}>
                            {longitude.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                <Field.ErrorText id='longitude_error'></Field.ErrorText>
              </Field.Root>

              {/* kintone上にあるピンの名前として表示するフィールドを選択 */}
              <Field.Root className='name' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    ピンの名前フィールド
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Field.Label>
                </Stack>
                <Select.Root collection={names} size="sm" width="320px" defaultValue={[config ? config.name : '']}
                  {...register("name")}
                >
                  <Select.HiddenSelect />
                  <Select.Label></Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {names.items.map((name: any) => (
                          <Select.Item item={name} key={name.value}>
                            {name.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                <Field.ErrorText id='name'></Field.ErrorText>
              </Field.Root>

              {/* ピンの絞り込みに使用するフィールドを選択 */}
              <Field.Root className='group' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    絞り込みに使用するフィールド
                    {/* <Badge variant="outline" color="red" borderColor="red">必須</Badge> */}
                  </Field.Label>
                </Stack>
                <Select.Root collection={groups} size="sm" width="320px" defaultValue={[config ? config.group : '']}
                  {...register("group")}
                >
                  <Select.HiddenSelect />
                  <Select.Label></Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {groups.items.map((group: any) => (
                          <Select.Item item={group} key={group.value}>
                            {group.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                {/* <Field.ErrorText id='group'></Field.ErrorText> */}
              </Field.Root>

              {/* ピンの色変更の基準となるフィールドを選択 */}
              <Field.Root className='color' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    ピンの色、アイコン変更に使用するフィールド
                    {/* <Badge variant="outline" color="red" borderColor="red">必須</Badge> */}
                  </Field.Label>
                </Stack>
                <Select.Root collection={colors} size="sm" width="320px" defaultValue={[config ? config.color : '']}
                  {...register("color")}
                  onValueChange={colorChange}
                >
                  <Select.HiddenSelect />
                  <Select.Label></Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {colors.items.map((color: any) => (
                          <Select.Item item={color} key={color.value}>
                            {color.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                {/* <Field.ErrorText id='color'></Field.ErrorText> */}
                {/* 選択肢によって色を選択 */}
                <Table.Root bg="white" borderRadius="md" overflow="hidden" boxShadow="sm" id='show_color_table'>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: '14px', borderBottom: '1px solid #e2e8f0' }}></Table.ColumnHeader>
                      <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: '14px', borderBottom: '1px solid #e2e8f0' }}>ピンの色</Table.ColumnHeader>
                      <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: '14px', borderBottom: '1px solid #e2e8f0' }}>アイコン</Table.ColumnHeader>
                      <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: '14px', borderBottom: '1px solid #e2e8f0' }}>アイコンの色</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {colorOptions.map((option: any, index: number) => (
                      < Table.Row key={option.option ?? index} >
                        <Table.Cell>{option.option}</Table.Cell>
                        <Table.Cell>
                          <ColorPicker.Root
                            size="xs"
                            defaultValue={parseColor(option.color)}
                            maxW="200px"
                          >
                            <ColorPicker.HiddenInput />
                            <ColorPicker.Control>
                              <ColorPicker.Trigger />
                            </ColorPicker.Control>
                            <Portal>
                              <ColorPicker.Positioner>
                                <ColorPicker.Content>
                                  <ColorPicker.SwatchGroup>
                                    {swatches.map((item) => (
                                      <ColorPicker.SwatchTrigger key={item} value={item}>
                                        <ColorPicker.Swatch value={item}>
                                          <ColorPicker.SwatchIndicator>
                                            <LuCheck />
                                          </ColorPicker.SwatchIndicator>
                                        </ColorPicker.Swatch>
                                      </ColorPicker.SwatchTrigger>
                                    ))}
                                  </ColorPicker.SwatchGroup>
                                  <ColorPicker.ChannelInput channel="hex" />
                                </ColorPicker.Content>
                              </ColorPicker.Positioner>
                            </Portal>
                          </ColorPicker.Root>
                        </Table.Cell>
                        <Table.Cell>
                          <Select.Root collection={pinIcons} size="sm" width="320px" defaultValue={option.icon}>
                            <Select.HiddenSelect />
                            <Select.Label></Select.Label>
                            <Select.Control>
                              <Select.Trigger>
                                <Select.ValueText />
                              </Select.Trigger>
                              <Select.IndicatorGroup>
                                <Select.Indicator />
                              </Select.IndicatorGroup>
                            </Select.Control>
                            <Portal>
                              <Select.Positioner>
                                <Select.Content minW="32">
                                  {pinIcons.items.map((pinIcon) => (
                                    <Select.Item item={pinIcon} key={pinIcon.value}>
                                      <HStack>
                                        {pinIcon.icon}
                                        {pinIcon.label}
                                      </HStack>
                                      <Select.ItemIndicator />
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select.Positioner>
                            </Portal>
                          </Select.Root>
                        </Table.Cell>
                        <Table.Cell>
                          <ColorPicker.Root defaultValue={parseColor(option.iconColor)}>
                            <ColorPicker.HiddenInput />
                            <ColorPicker.SwatchGroup>
                              {['#000000', '#ffffff'].map((item) => (
                                <ColorPicker.SwatchTrigger key={item} value={item}>
                                  <ColorPicker.Swatch value={item}>
                                    <ColorPicker.SwatchIndicator boxSize="3" bg="white" />
                                  </ColorPicker.Swatch>
                                </ColorPicker.SwatchTrigger>
                              ))}
                            </ColorPicker.SwatchGroup>
                          </ColorPicker.Root>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Field.Root>

              {/* ポップアップに表示するフィールド選択 */}
              <Field.Root className='popups' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    ポップアップに表示するフィールド
                    {/* <Badge variant="outline" color="red" borderColor="red">必須</Badge> */}
                  </Field.Label>
                </Stack>
                {/* <Button bgColor="white" color="cyan.500" px={4} py={2} borderRadius="md" fontSize={"small"} fontWeight="bold" w={"125px"} h={"40px"} borderColor="cyan.500"
                  onClick={addPopupField} >
                  フィールド追加
                </Button> */}
                <Select.Root multiple collection={popups} size="sm" width="320px" defaultValue={popupDefaultValue}
                  {...register("popupField")}
                >
                  <Select.HiddenSelect />
                  <Select.Label></Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {popups.items.map((popup: any) => (
                          <Select.Item item={popup} key={popup.value}>
                            {popup.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                {/* <Field.ErrorText id='group'></Field.ErrorText> */}
              </Field.Root>

              {/* 画像で保存するときの設定 */}
              <Field.Root className='popups' marginBottom={10} display={addImage ? 'block' : 'none'}>
                <Stack direction="row">
                  <Field.Label>
                    画像でピンを登録する場合
                    {/* <Badge variant="outline" color="red" borderColor="red">必須</Badge> */}
                  </Field.Label>
                </Stack>
                <RadioGroup.Root defaultValue={"0"}>
                  <HStack gap="6">
                    <RadioGroup.Root colorPalette={"cyan"}
                      onChange={(e: any) => { changeCheckRegistration(Boolean(e.target.value)) }}
                      defaultValue={config && config.addImage ? String(config.addImage.checkRegistration) : 'false'}>
                      <RadioGroup.Item key='false' value='false'>
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemIndicator />
                        <RadioGroup.ItemText>緯度・経度のみ登録</RadioGroup.ItemText>
                      </RadioGroup.Item>
                      <RadioGroup.Item key='true' value='true'>
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemIndicator />
                        <RadioGroup.ItemText>緯度・経度と画像を登録</RadioGroup.ItemText>
                      </RadioGroup.Item>
                    </RadioGroup.Root>
                  </HStack>
                </RadioGroup.Root>
                <Box display={checkRegistration ? 'block' : 'none'}>
                  <Stack direction="row">
                    <Field.Label>
                      画像を保存するフィールド
                      {/* <Badge variant="outline" color="red" borderColor="red">必須</Badge> */}
                    </Field.Label>
                  </Stack>

                  <Select.Root multiple collection={files} size="sm" width="320px" defaultValue={popupDefaultValue}>
                    <Select.HiddenSelect />
                    <Select.Label></Select.Label>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {files.items.map((file: any) => (
                            <Select.Item item={file} key={file.value}>
                              {file.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                  <Field.ErrorText id='file_error'></Field.ErrorText>
                  <HStack gap="6">
                    <RadioGroup.Root colorPalette={"cyan"} defaultValue={config && config.addImage ? String(config.addImage.RegistrationAllImage) : 'false'}>
                      <RadioGroup.Item key='false' value='false'>
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemIndicator />
                        <RadioGroup.ItemText>緯度・経度がある画像のみ登録</RadioGroup.ItemText>
                      </RadioGroup.Item>
                      <RadioGroup.Item key='true' value='true'>
                        <RadioGroup.ItemHiddenInput />
                        <RadioGroup.ItemIndicator />
                        <RadioGroup.ItemText>緯度・経度がない画像もすべて登録</RadioGroup.ItemText>
                      </RadioGroup.Item>
                    </RadioGroup.Root>
                  </HStack>
                  <Flex>
                    <Switch.Root colorPalette={"cyan"} defaultChecked={config && config.addImage ? config.addImage.imageDatetime : false}
                      onChange={(e: any) => { changeImageDatetime(e.target.value) }}>
                      <Switch.HiddenInput />
                      <Switch.Control />
                      <Switch.Label>撮影日時を登録</Switch.Label>
                    </Switch.Root>

                    <Select.Root collection={datetimes} size="sm" width="320px" defaultValue={[config && config.addImage ? config.addImage.imageDateTimeField : '']}
                      display={imageDatetime ? 'block' : 'none'}>
                      <Select.HiddenSelect />
                      <Select.Label></Select.Label>
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {datetimes.items.map((datetime: any) => (
                              <Select.Item item={datetime} key={datetime.value}>
                                {datetime.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Flex>
                </Box>
              </Field.Root>

              <Field.Root className='group' marginBottom={10}>
                <Stack direction="row">
                  <Field.Label>
                    最初に表示する地図の種類
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Field.Label>
                </Stack>
                <Select.Root collection={mapLayers} size="sm" width="320px" defaultValue={["open_street_map"]}
                  {...register("mapTile")}
                >
                  <Select.HiddenSelect />
                  <Select.Label></Select.Label>
                  <Select.Control>
                    <Select.Trigger>
                      <Select.ValueText />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner>
                      <Select.Content>
                        {mapLayers.items.map((mapLayer) => (
                          <Select.Item item={mapLayer} key={mapLayer.value}>
                            {mapLayer.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
                {/* <Field.ErrorText id='group'></Field.ErrorText> */}
              </Field.Root>

            </Box>
          </form>
        </Tabs.Content>

        <Tabs.Content value="condition">
          <Flex>
            <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}>
              保存
            </Button>
            {/* <Button bgColor="white" color="cyan.500" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"} borderColor="cyan.500" onClick={showMapList}>
              戻る
            </Button> */}
          </Flex>

          <Box marginBottom={"20px"} marginTop={"20px"}>
            <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}>
              条件追加
            </Button>
          </Box>
          <RadioGroup.Root
            colorPalette={"cyan"}>
            <HStack gap="6">
              <RadioGroup.Item key="andOr" value="and">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>すべての条件を満たす</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item key="andOr" value="or">
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>いずれかの条件を満たす</RadioGroup.ItemText>
              </RadioGroup.Item>
            </HStack>
          </RadioGroup.Root>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>条件フィールド</Table.ColumnHeader>
                <Table.ColumnHeader>条件</Table.ColumnHeader>
                <Table.ColumnHeader>条件値</Table.ColumnHeader>
                <Table.ColumnHeader>削除</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell className='condition-field-cell'>
                  <Select.Root collection={narrowFields} size="sm" width="320px">
                    <Select.HiddenSelect />
                    <Select.Label></Select.Label>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {narrowFields.items.map((narrowField: any) => (
                            <Select.Item item={narrowField} key={narrowField.value}>
                              {narrowField.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Table.Cell>
                <Table.Cell className='condition-cell'>
                </Table.Cell>
                <Table.Cell className='condition-value-cell'>
                </Table.Cell>
                <Table.Cell style={{ padding: '12px' }}>
                  <Button fontSize="sm" className='user-delete-button' bg="white" borderColor="red.500" _hover={{ background: "gray. 100" }}>
                    <Image src='./dustBox.png' title='削除'></Image>
                  </Button>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Tabs.Content>

        <Tabs.Content value="user">
          <Flex mb={6} display="flex" justifyContent="space-between" alignItems="center">
            <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}>
              保存
            </Button>
            {/* <Button bgColor="white" color="cyan.500" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"} borderColor="cyan.500" onClick={showMapList}>
              戻る
            </Button> */}
          </Flex>

          <Box marginBottom={"20px"} marginTop={"20px"}>
            <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}>
              ユーザー追加
            </Button>
          </Box>

          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>ユーザー名</Table.ColumnHeader>
                <Table.ColumnHeader>権限</Table.ColumnHeader>
                <Table.ColumnHeader>削除</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell style={{ padding: '12px' }}>
                  <Select.Root collection={users} size="sm" width="320px">
                    <Select.HiddenSelect />
                    <Select.Label></Select.Label>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {users.items.map((user: any) => (
                            <Select.Item item={user} key={user.value}>
                              {user.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Table.Cell>
                <Table.Cell style={{ padding: '12px' }}>
                  <Checkbox.Root colorPalette={"cyan"}>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>ピンの編集</Checkbox.Label>
                  </Checkbox.Root>
                  <Checkbox.Root>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>ピンの登録</Checkbox.Label>
                  </Checkbox.Root>
                  <Checkbox.Root>
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>マップの設定</Checkbox.Label>
                  </Checkbox.Root>
                </Table.Cell>
                <Table.Cell style={{ padding: '12px' }}>
                  <Button fontSize="sm" className='user-delete-button' bg="white" borderColor="red.500" _hover={{ background: "gray. 100" }}>
                    <Image src='./dustBox.png' title='削除'></Image>
                  </Button>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Tabs.Content>
      </Tabs.Root>
    </Box >
  )
}