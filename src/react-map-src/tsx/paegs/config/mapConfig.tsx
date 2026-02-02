import { Alert, Badge, Box, Button, Card, Checkbox, CloseButton, ColorPicker, createListCollection, Dialog, Field, Flex, HStack, Icon, Image, Input, InputGroup, Listbox, NumberInput, parseColor, Popover, Portal, RadioGroup, Select, Stack, Switch, Table, Tabs, Text, useFilter, useListbox, useListCollection } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { LuCheck, LuChevronDown } from 'react-icons/lu';

import { BsTrash } from "react-icons/bs";

import { groupBy } from "es-toolkit"

import { setDropdown } from '../../../ts/config/setDropdown';
import { postConfig } from '../../../ts/config/setConfig';
import { setConditionSelect } from '../../../ts/config/setConditionSelect';

export type StatusAlertDialogStatus = 'error' | 'info' | 'warning' | 'success' | 'neutral';
export type StatusAlertDialogAlign = 'start' | 'center' | 'end';

interface FormValues {
  openURL: string;
  appId: number;
  token: string;
  centerLat: number;
  centerLng: number;
  marker: string;
  latitude: string;
  longitude: string;
  name: string;
  group: string;
  color: string;
  // popupField: any,
  checkRegistration: 'true' | 'false';
  imageField: string;
  registrationAllImage: 'true' | 'false';
  imageDatatime: boolean;
  imageDatetimeField: string;
  mapTile: string;
}

interface values {
  config: null | any,
  domain: string,
  addImage: boolean,
  users: any[],
  loginUserInfo: any,
  domainId: number,
  saveConfig: (data: any) => void;
}

interface Props {
  open: boolean;
  status: StatusAlertDialogStatus;
  title: React.ReactNode;
  showCancel?: boolean;
  confirmLabel?: string;
  comfirmResult: boolean;
  contentAlign: StatusAlertDialogAlign;
  data: any;
}

export const MapConfig = ({ config, domain, addImage, users, loginUserInfo, domainId, saveConfig }: values) => {

  const [setConfig, changeSetConfig] = useState<any>(config)
  console.log(setConfig)

  const [dialog, setDialog] = useState<Props>({
    open: false,
    status: 'info',
    title: '',
    showCancel: false,
    confirmLabel: '',
    comfirmResult: true,
    contentAlign: 'center',
    data: ''
  })
  let operationType = '';

  const [disabled, changeDisabled] = useState<boolean>(setConfig ? false : true);
  const [colorOptions, setColorOptions] = useState<any[]>([]);

  const [popupFieldRows, setPopupFieldRows] = useState<any[]>([]);

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

  const [checkRegistration, changeCheckRegistration] = useState<boolean>(setConfig && setConfig.addImage ? setConfig.addImage.checkRegistration : false);
  const [imageDatetime, changeImageDatetime] = useState<boolean>(setConfig && setConfig.addImage ? setConfig.addImage.imageDatetime : false);

  const [narrow, setNarrow] = useState<{ andor: string, narrows: any[] }>({ andor: 'and', narrows: [] })

  const [narrowFields, setNarrowFields] = useState<any>(
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

  const [inputValue, setInputValue] = useState("")
  const [openAddPopupField, setOpenAddPopupField] = useState(false)
  const [openShowUsers, setOpenShowUsers] = useState(false)
  const [openNarrowFields, setOpenNarrowFields] = useState(false)

  const { contains } = useFilter({ sensitivity: "base" })
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const authorityUsersSelects: any[] = []
  for (let i = 0; i < users.length; i++) {
    authorityUsersSelects.push({ label: `${users[i].user_name}(${users[i].user_id})`, value: users[i].id })
  }

  const [authorityUsers, setAutorityUsers] = useState<any>(createListCollection({
    items: authorityUsersSelects
  }))

  const [showUsers, setShowUsers] = useState<any[]>([]);

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current || !setConfig) return;

    const getKintoneField = async () => {
      try {
        const params = new URLSearchParams({ domain: domain, appId: setConfig.appId, token: setConfig.token })
        const getFieldResp = await fetch(`./kintone/getField?${params.toString()}`);

        if (!getFieldResp.ok) {
          throw new Error('フィールドの取得に失敗しました。');
        }

        const field = await getFieldResp.json();
        // getField(field.properties)
        return field.properties;
      } catch (e: any) {
        alert(e.message);
        console.error(e)
        // getField({})
        return {};
      }
    }

    getKintoneField()
      .then(async (field: any) => {
        getField(field)
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

        setfiles(createListCollection({
          items: arrayFile
        }));

        setDatetimes(createListCollection({
          items: arrayDatetimes
        }));

        const poppupFields: any = createListCollection({ items: arrayPopups })
        const narrowFields: any = createListCollection({ items: arrayNarrowFields })

        // const popupFieldCategories = Object.entries(
        //   groupBy(poppupFields.items, (item: any) => item.category),
        // )

        // const narrowFieldCategories = Object.entries(
        //   groupBy(narrowFields.items, (item: any) => item.category),
        // )
        setpopups(poppupFields);
        setNarrowFields(narrowFields);

        if (setConfig) {
          const popupDefaultValue: any = [];
          for (let i = 1; i <= setConfig.popup_row_num; i++) {

            popupDefaultValue.push({
              field: setConfig['popup_row' + i].popupField,
              label: field[setConfig['popup_row' + i].popupField].label
            })
          }

          setPopupFieldRows(popupDefaultValue);

          if (setConfig.color !== '') {
            const options: any[] = []
            for (let i = 1; i <= setConfig.change_color_row_num; i++) {
              options.push({
                option: setConfig['change_color_row' + i].option,
                color: setConfig['change_color_row' + i].color,
                icon: setConfig['change_color_row' + i].icon,
                iconColor: setConfig['change_color_row' + i].iconColor
              })
            }
            setColorOptions(options)
          }

          const narrows: { andor: string, narrows: any[] } = {
            andor: 'and',
            narrows: [],
          }
          for (let i = 1; i <= setConfig.narrow_row_number; i++) {
            const conditionSelect = await setConditionSelect(field, setConfig['narrow_row' + i].field, domain, setConfig.appId, setConfig.token)
            narrows.andor = setConfig['narrow_row' + i].andor
            narrows.narrows.push({
              field: setConfig['narrow_row' + i].field,
              label: field[setConfig['narrow_row' + i].field].label,
              condition: setConfig['narrow_row' + i].condition,
              value: setConfig['narrow_row' + i].value,
              conditionSelect: conditionSelect
            })
          }
          setNarrow(narrows);

          const showUsers: any = {}
          for (let i = 1; i <= setConfig.users_row_number; i++) {
            showUsers[setConfig['user_row' + i].user] = {
              user: setConfig['user_row' + i].user,
              edit: setConfig['user_row' + i].edit,
              create: setConfig['user_row' + i].create,
              setConfig: setConfig['user_row' + i].setConfig,
              authority: setConfig['user_row' + i].authority
            }

            for (let j = 0; j < users.length; j++) {
              if (users[j].id === setConfig['user_row' + i].user) {
                showUsers[setConfig['user_row' + i].user].userName = users[j].user_name
              }
            }
          }
          setShowUsers(showUsers);
        }

      })
      .catch(console.error)

    setAutorityUsers(createListCollection({ items: authorityUsers }))


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
    const openURL: any = document.getElementById('open_url_name')
    const material: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let strings: string = '';
    const passwordLength: number = 30;
    for (let i = 0; i < passwordLength; i++) {
      const randomNumber = Math.floor(Math.random() * material.length);
      strings += material.substring(randomNumber, randomNumber + 1);
    }

    openURL.value = strings
  }

  const swatches = ["#FF0000", "#FFCCCB", "#8b0000", "#ffa500", "#eedcb3", "#008000", "#006400", "#90ee90", "#0093ff", "#00008b"
    , "#ADD8E6", "#800080", "#871F78", "#f5b2b2", "#f0f8ff", "#ffffff", "#808080", "#d3d3d3", "#000000"]

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const getNewAppField = async (e: any) => {
    const appIdField: any = document.getElementById('app_id');
    const apiTokenField: any = document.getElementById('api_token');

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

        if (setConfig && (setConfig.appId === appIdField.value)) {
          colorValue.push(setConfig.color)
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

    if (JSON.stringify(newField) !== JSON.stringify(field)) {
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
        setfiles(createListCollection({ items: arrayFile }));
        setDatetimes(createListCollection({ items: arrayDatetimes }));
        const popupFields: any = createListCollection({ items: arrayPopups })
        const narrowFields: any = createListCollection({ items: arrayNarrowFields })

        // const popupFieldCategories = Object.entries(
        //   groupBy(popupFields.items, (item: any) => item.category),
        // )

        // const narrowFieldCategories = Object.entries(
        //   groupBy(narrowFields.items, (item: any) => item.category),
        // )
        setpopups(popupFields);
        setNarrowFields(narrowFields);
      }
    }

    if ((colorOptions.length === 0 && colorValue[0] !== '') || (colorOptions.length !== 0 && colorValue[0] === '')) {
      colorChange({ value: colorValue })
    }
  }

  const colorChange = (e: any) => {
    const options: any[] = []
    if (e.value[0] !== '') {
      if (setConfig && setConfig.color === e.value[0]) {
        for (let i = 1; i <= setConfig.change_color_row_num; i++) {
          options.push({
            option: setConfig['change_color_row' + i].option,
            color: setConfig['change_color_row' + i].color,
            icon: setConfig['change_color_row' + i].icon,
            iconColor: setConfig['change_color_row' + i].iconColor
          })
        }
      } else {
        Object.keys(field[e.value[0]].options).map((option: any) => {
          options.push({
            option: field[e.value[0]].options[option].label,
            color: '#ff0000',
            icon: '',
            iconColor: '#ffffff'
          })
        })
      }
    }
    setColorOptions(options)
  }

  const addPopupField = (e: any) => {
    const popupFields: any[] = []
    for (let i = 0; i < popupFieldRows.length; i++) {
      popupFields.push(popupFieldRows[i])
    }
    popupFields.push({ field: e.value, label: field[e.value].label })
    setPopupFieldRows(popupFields)
    setOpenAddPopupField(false)
  }

  const deletePopupField = (e: any) => {
    const deletePopupFields: any[] = []
    for (let i = 0; i < popupFieldRows.length; i++) {
      if (i !== Number(e.target.value)) {
        deletePopupFields.push(popupFieldRows[i])
      }
    }
    setPopupFieldRows(deletePopupFields)
  }


  const mapConfigSave = handleSubmit(async (data: any) => {
    try {
      operationType = setConfig ? 'edit' : 'create'

      setDialog({
        open: true,
        status: 'warning',
        title: 'マップの設定を保存してもよろしいですか?',
        showCancel: true,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'center',
        data: data
      })
    } catch (e: any) {
      // alert(e.message);
      setDialog({
        open: true,
        status: 'error',
        title: e.message,
        showCancel: false,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'center',
        data: ''
      })
      console.error(e)
    }
  })

  // ===============================絞り込み設定==========================//
  const addConditions = async (e: any) => {
    const value: string = e.value

    const newNarrows: any = {
      andor: narrow.andor,
      narrows: []
    };

    for (let i = 0; i < narrow.narrows.length; i++) {
      newNarrows.narrows.push(narrow.narrows[i])
    }
    const conditionSelect = await setConditionSelect(field, value, domain, setConfig.appId, setConfig.token);

    newNarrows.narrows.push({
      field: value,
      label: field[value].label,
      condition: '',
      value: '',
      conditionSelect: conditionSelect
    })

    setNarrow(newNarrows)
    setOpenNarrowFields(false);
  }

  const changeAndOr = (e: any) => {
    narrow.andor = e.target.value
    setNarrow(narrow)
  }

  const changeCondition = (e: any) => {
    const className = e.target.classList[0]
    const index = className.replace(/\D/g, '');

    narrow.narrows[Number(index)].condition = e.target.value;
    setNarrow(narrow)
  }

  const changeConditionValue = (e: any) => {
    const className = e.target.classList[0]
    const index = className.replace(/\D/g, '');

    if (e.target.tagName === 'INPUT') {

      narrow.narrows[Number(index)].value = e.target.value;
    } else {
      const values = []
      const options: any = e.target.getElementsByTagName('option');

      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          values.push(options[i].value);
        }
      }
      narrow.narrows[Number(index)].value = values;
    }

    setNarrow(narrow)
  }

  const deleteNarrow = (e: any) => {
    let index = e.target.value;
    let element = e.target.parentNode;

    while (!index) {
      index = element.value;
      element = element.parentNode;
    }

    const newNarrow: { andor: string, narrows: any[] } = {
      andor: narrow.andor,
      narrows: []
    }

    for (let i = 0; i < narrow.narrows.length; i++) {
      if (i !== Number(index)) {
        newNarrow.narrows.push(narrow.narrows[i])
      }
    }
    setNarrow(newNarrow)
  }

  const saveCondition = async () => {
    try {
      const narrowConditions = document.querySelectorAll('#narrow_condition_table tbody tr');
      const newNarrow: any[] = []

      let narrow_row_number = narrow.narrows.length;
      for (let i = 0; i < narrow_row_number; i++) {

        if (narrow.narrows[i].condition !== '') {
          newNarrow.push({
            field: narrow.narrows[i].field,
            condition: narrow.narrows[i].condition,
            value: JSON.stringify(narrow.narrows[i].value),
            andor: narrow.andor
          })
        } else {
          narrow_row_number--;
          i--;
          narrowConditions[i].remove()
          delete narrow.narrows[i]
        }
      }

      const postNarrowResp = await window.fetch("./setNarrow", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: setConfig.id, conditions: newNarrow })
      })

      if (!postNarrowResp.ok) {
        throw new Error('絞り込み設定の保存に失敗しました。')
      }

      const newConfig: any = {
        narrow_row_number: narrow_row_number
      }

      for (const key in setConfig) {
        if (key !== 'narrow_row_number' && key.indexOf('narrow_row') === 0) {
          newConfig[key] = setConfig[key]
        }
      }

      for (let i = 0; i < narrow_row_number; i++) {
        newConfig['narrow_row' + (i + 1)] = newNarrow[i]
      }

      setNarrow(narrow)
      saveConfig(newConfig);
      changeSetConfig(setConfig);

      setDialog({
        open: true,
        status: 'success',
        title: '絞り込み設定の保存が完了しました。',
        showCancel: false,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'center',
        data: ''
      })
    } catch (e: any) {
      setDialog({
        open: true,
        status: 'error',
        title: e.message,
        showCancel: false,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'center',
        data: ''
      })
      console.error(e)
    }
  }

  //==============================ユーザーの権限設定=======================================//
  const addShowUser = (e: any) => {
    const value = e.value;
    const newShowUsers: any = {};
    for (const key in showUsers) {
      newShowUsers[key] = showUsers[key];
    }
    newShowUsers[value] = {
      user: value,
      edit: true,
      create: true,
      setConfig: false
    }

    for (let i = 0; i < users.length; i++) {
      if (users[i].id === value) {
        newShowUsers[value].authority = users[i].authority
        newShowUsers[value].userName = users[i].user_name
      }
    }

    setShowUsers(newShowUsers);
    setOpenShowUsers(false)
  }

  const chengeAuthority = (e: any) => {
    const className = e.target.classList[1]

    const newShowUsers: any = {}
    for (const key in showUsers) {
      newShowUsers[key] = showUsers[key];
    }

    if (className.indexOf('edit') !== -1) {
      newShowUsers[className.replace(/\D/g, '')].edit = e.target.checked
    } else if (className.indexOf('create') !== -1) {
      newShowUsers[className.replace(/\D/g, '')].create = e.target.checked
    } else if (className.indexOf('setConfig') !== -1) {
      newShowUsers[className.replace(/\D/g, '')].setConfig = e.target.checked
    }
    setShowUsers(newShowUsers);
  }

  const deleteShowUser = (e: any) => {
    let id = e.target.value;
    let element = e.target
    while (!id) {
      id = element.parentNode?.value
      element = element.parentNode
    }
    const newShowUsers: any = {}

    for (const key in showUsers) {
      if (String(key) !== id) {
        newShowUsers[key] = showUsers[key];
      }
    }

    setShowUsers(newShowUsers);
  }

  const savaShowUsers = async () => {
    try {

      const admin = users.filter((u) => u.authority === 0);
      const userBody: { admin: number, config: number, showUsers: any[] } = {

        admin: admin[0].id,
        config: setConfig.id,
        showUsers: []
      }
      for (const key in showUsers) {
        userBody.showUsers.push({
          id: Number(key),
          authority: {
            edit: showUsers[key].edit,
            create: showUsers[key].create,
            setConfig: showUsers[key].setConfig
          }
        })
      }

      //マップのユーザーを設定
      const setShowUsersResp = await window.fetch("./setShowMapUsers", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userBody)
      });

      if (!setShowUsersResp.ok) {
        throw new Error('ユーザー権限の保存に失敗しました。')
      }

      const newConfig: any = {
        users_row_number: Object.keys(showUsers).length
      }

      for (const key in setConfig) {
        if (key !== 'users_row_number' && key.indexOf('user_row') === -1) {
          newConfig[key] = setConfig[key];
        }
      }

      Object.keys(showUsers).map((key: any, index: number) => {
        newConfig['user_row' + (index + 1)] = {
          user: showUsers[key].user,
          edit: showUsers[key].edit,
          create: showUsers[key].create,
          setConfig: showUsers[key].setConfig,
          authority: showUsers[key].authority
        }
      })

      saveConfig(newConfig);
      changeSetConfig(newConfig);
      setDialog({
        open: true,
        status: 'success',
        title: 'ユーザーの権限設定が完了しました。',
        showCancel: false,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'center',
        data: ''
      })
    } catch (e: any) {
      // alert(e.message);
      setDialog({
        open: true,
        status: 'error',
        title: e.message,
        showCancel: false,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'center',
        data: ''
      })
      console.error(e)
    }
  }

  const dialogClickOk = async () => {

    if (dialog.status === 'warning') {
      try {
        const returnNewConfig: any = await postConfig(dialog.data, setConfig, domainId, users, loginUserInfo, popupFieldRows)

        console.log(returnNewConfig)
        changeDisabled(false);
        changeSetConfig(returnNewConfig);
        saveConfig(returnNewConfig);

        setDialog({
          open: true,
          status: 'success',
          title: 'マップの設定が完了しました。',
          showCancel: false,
          confirmLabel: '',
          comfirmResult: true,
          contentAlign: 'center',
          data: ''
        });
      } catch (e: any) {
        console.error(e)
        setDialog({
          open: true,
          status: 'error',
          title: e.message,
          showCancel: false,
          confirmLabel: '',
          comfirmResult: true,
          contentAlign: 'center',
          data: ''
        })
      }
    } else {
      setDialog({
        open: false,
        status: dialog.status,
        title: '',
        showCancel: false,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'center',
        data: ''
      });
    }
  }

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
              <Button type='submit' bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}>
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
                    defaultValue={setConfig ? setConfig.openURL : ''}
                    {...register("openURL", {
                      pattern: { value: /^[a-zA-Z0-9]*$/, message: '半角英数字のみで入力してください。' },
                      maxLength: { value: 250, message: '255文字以下にしてください。' }
                    })
                    } />
                </InputGroup>
                <Button bgColor="white" color="cyan.500" px={4} py={2} borderRadius="md" fontSize={"small"} fontWeight="bold" w={"125px"} h={"40px"} borderColor="cyan.500"
                  onClick={randString}>
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
                      defaultValue={setConfig ? setConfig.appId : ''}
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
                    defaultValue={setConfig ? setConfig.token : ''}
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
                      defaultValue={setConfig ? setConfig.centerLat : ''}
                      {...register("centerLat", {
                        required: '中心の緯度は必須っ項目です。'
                      })}
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
                      defaultValue={setConfig ? setConfig.centerLng : ''}
                      {...register("centerLng", {
                        required: '中心の経度は必須の項目です。'
                      })}
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
                <Select.Root collection={markerShapes} size="sm" width="320px" defaultValue={[setConfig ? setConfig.marker : 'pin']}

                >
                  <Select.HiddenSelect {...register("marker")} />
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
                <Select.Root collection={latitudes} size="sm" width="320px" defaultValue={[setConfig ? setConfig.latitude : '']}

                >
                  <Select.HiddenSelect {...register("latitude", {
                    required: '緯度フィールドは必須の項目です。'
                  })} />
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
                <Select.Root collection={longitudes} size="sm" width="320px" defaultValue={[setConfig ? setConfig.longitude : '']}

                >
                  <Select.HiddenSelect
                    {...register("longitude", {
                      required: '経度フィールドは必須の項目です。'
                    })} />
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
                <Select.Root collection={names} size="sm" width="320px" defaultValue={[setConfig ? setConfig.name : '']}

                >
                  <Select.HiddenSelect
                    {...register("name", {
                      required: 'ピンの名前フィールドは必須の項目です。'
                    })} />
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
                <Select.Root collection={groups} size="sm" width="320px" defaultValue={[setConfig ? setConfig.group : '']}

                >
                  <Select.HiddenSelect
                    {...register("group")} />
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
                <Select.Root collection={colors} size="sm" width="320px" defaultValue={[setConfig ? setConfig.color : '']}
                  onValueChange={colorChange}

                >
                  <Select.HiddenSelect {...register("color")} />
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
                <Table.Root bg="white" borderRadius="md" overflow="hidden" boxShadow="sm" id='show_user_table' stickyHeader>
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
                        <Table.Cell className='option-label'>{option.option}</Table.Cell>
                        <Table.Cell>
                          <ColorPicker.Root
                            size="xs"
                            defaultValue={parseColor(option.color)}
                            maxW="200px"
                          >
                            <ColorPicker.HiddenInput className='marker-color' />
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
                          <Select.Root
                            collection={pinIcons} size="sm" width="320px"
                            defaultValue={[option.icon]}>
                            <Select.HiddenSelect className='marker-icon' />
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
                            <ColorPicker.HiddenInput className='icon-color' />
                            <ColorPicker.SwatchGroup >
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

                <Popover.Root size="xs" open={openAddPopupField} positioning={{ sameWidth: true }}
                  closeOnInteractOutside onOpenChange={(e: any) => { setOpenAddPopupField(e.open) }} >
                  <Popover.Trigger asChild>
                    <Button bgColor="white" color="cyan.500" px={4} py={2} borderRadius="md" fontSize={"small"} fontWeight="bold" w={"125px"} h={"40px"} borderColor="cyan.500"
                      onClick={(e: any) => { setOpenAddPopupField(!openAddPopupField) }}>
                      フィールド追加
                    </Button>
                  </Popover.Trigger>

                  <Portal>
                    <Popover.Positioner>
                      <Popover.Content>
                        <Popover.Body>
                          <Listbox.Root collection={popups} onSelect={addPopupField} border={'none'}>
                            <Listbox.Content maxH={"230px"}>
                              {popups.items.map((item: any) => {
                                const field = popupFieldRows.filter((f) => item.value === f.field);
                                if (field.length === 0) {
                                  return (
                                    <Listbox.Item item={item} key={item.value}>
                                      <Listbox.ItemText>{item.label}</Listbox.ItemText>
                                      <Listbox.ItemIndicator />
                                    </Listbox.Item>
                                  )
                                }
                              })}
                            </Listbox.Content>
                          </Listbox.Root>
                        </Popover.Body>
                      </Popover.Content>
                    </Popover.Positioner>
                  </Portal>
                </Popover.Root>

                {
                  popupFieldRows.map((popupField: any, index: number) => {
                    return (

                      <Card.Root id={'popup_field_' + index}
                      // _hover={{
                      //   transform: "translateY(-5px)",
                      //   shadow: "lg",
                      //   cursor: "pointer"
                      // }}
                      >
                        <Card.Body padding={'15px'}>
                          <Flex>
                            <Text textStyle="md">{popupField.label}</Text>
                            <CloseButton variant="outline" colorPalette={"red"} rounded="full"
                              marginLeft={5}
                              size={"2xs"}
                              alignSelf={'center'}
                              value={index} onClick={deletePopupField} />
                          </Flex>
                        </Card.Body>
                      </Card.Root>
                    )
                  })
                }
              </Field.Root>

              {/* 画像で保存するときの設定 */}
              <Field.Root className='popups' marginBottom={10} display={addImage ? 'block' : 'none'}>
                <Stack direction="row">
                  <Field.Label>
                    画像でピンを登録する場合
                    {/* <Badge variant="outline" color="red" borderColor="red">必須</Badge> */}
                  </Field.Label>
                </Stack>
                <RadioGroup.Root defaultValue={setConfig && setConfig.addImage ? String(setConfig.addImage.checkRegistration) : 'false'}
                  colorPalette={"cyan"}
                  onValueChange={(e: any) => { changeCheckRegistration(e.value === 'true' ? true : false) }}
                >
                  <HStack gap="6">
                    <RadioGroup.Item key='false' value='false'>
                      <RadioGroup.ItemHiddenInput {...register("checkRegistration")} />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>緯度・経度のみ登録</RadioGroup.ItemText>
                    </RadioGroup.Item>
                    <RadioGroup.Item key='true' value='true'>
                      <RadioGroup.ItemHiddenInput {...register("checkRegistration")} />
                      <RadioGroup.ItemIndicator />
                      <RadioGroup.ItemText>緯度・経度と画像を登録</RadioGroup.ItemText>
                    </RadioGroup.Item>
                  </HStack>
                </RadioGroup.Root>
                <Box display={checkRegistration ? 'block' : 'none'}>
                  <Stack direction="row">
                    <Field.Label>
                      画像を保存するフィールド
                      {/* <Badge variant="outline" color="red" borderColor="red">必須</Badge> */}
                    </Field.Label>
                  </Stack>

                  <Select.Root collection={files} size="sm" width="320px" defaultValue={[setConfig && addImage ? setConfig.imageField : '']}
                  >
                    <Select.HiddenSelect {...register("imageField")} />
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
                  <RadioGroup.Root
                    // id='registration_all_image'
                    colorPalette={"cyan"}
                    defaultValue={setConfig && setConfig.addImage ? String(setConfig.addImage.RegistrationAllImage) : 'false'}
                  >
                    <HStack gap="6">
                      <RadioGroup.Item key='false' value='false'>
                        <RadioGroup.ItemHiddenInput {...register("registrationAllImage")} />
                        <RadioGroup.ItemIndicator />
                        <RadioGroup.ItemText>緯度・経度がある画像のみ登録</RadioGroup.ItemText>
                      </RadioGroup.Item>
                      <RadioGroup.Item key='true' value='true'>
                        <RadioGroup.ItemHiddenInput {...register("registrationAllImage")} />
                        <RadioGroup.ItemIndicator />
                        <RadioGroup.ItemText>緯度・経度がない画像もすべて登録</RadioGroup.ItemText>
                      </RadioGroup.Item>
                    </HStack>
                  </RadioGroup.Root>
                  <Flex gap='6'>
                    <Switch.Root colorPalette={"cyan"} defaultChecked={setConfig && setConfig.addImage ? setConfig.addImage.imageDatetime : false}
                      onCheckedChange={(e: any) => { changeImageDatetime(e.checked) }}
                    >
                      <Switch.HiddenInput {...register("imageDatatime")} />
                      <Switch.Control />
                      <Switch.Label>撮影日時を登録</Switch.Label>
                    </Switch.Root>

                    <Select.Root collection={datetimes} size="sm" width="320px" defaultValue={[setConfig && addImage ? setConfig.addImage.imageDateTimeField : '']}
                      disabled={!imageDatetime}
                    >
                      <Select.HiddenSelect {...register("imageDatetimeField")} />
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

                >
                  <Select.HiddenSelect  {...register("mapTile")} />
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
          </form >
        </Tabs.Content >

        {/* 絞り込み条件設定 */}
        < Tabs.Content value="condition" >
          <Flex>
            <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}
              onClick={saveCondition}>
              保存
            </Button>
          </Flex>

          <Box marginBottom={"20px"} marginTop={"20px"}>

            <Popover.Root size="xs" open={openNarrowFields} positioning={{ sameWidth: true }}
              closeOnInteractOutside onOpenChange={(e: any) => { setOpenNarrowFields(e.open) }}>
              <Popover.Trigger asChild>
                <Button bgColor="white" color="cyan.500" px={4} py={2} borderRadius="md" fontSize={"small"} fontWeight="bold" w={"125px"} h={"40px"} borderColor="cyan.500"
                  onClick={(e: any) => { setOpenNarrowFields(!openNarrowFields) }}>
                  条件追加
                </Button>
              </Popover.Trigger>

              <Portal>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Body>
                      <Listbox.Root collection={narrowFields} onSelect={addConditions} border={'none'}>
                        <Listbox.Content maxH={"230px"}>
                          {narrowFields.items.map((item: any) => {
                            return (
                              <Listbox.Item item={item} key={item.value}>
                                <Listbox.ItemText>{item.label}</Listbox.ItemText>
                                <Listbox.ItemIndicator />
                              </Listbox.Item>
                            )
                          })}
                        </Listbox.Content>
                      </Listbox.Root>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
          </Box>

          <RadioGroup.Root
            colorPalette={"cyan"}
            defaultValue={narrow.andor}
            display={narrow.narrows.length > 1 ? 'blodk' : 'none'}
            onChange={changeAndOr}>
            <HStack gap="6">
              <RadioGroup.Item key="andOr" value="and">
                <RadioGroup.ItemHiddenInput name='andOr' />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>すべての条件を満たす</RadioGroup.ItemText>
              </RadioGroup.Item>
              <RadioGroup.Item key="andOr" value="or">
                <RadioGroup.ItemHiddenInput name='andOr' />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>いずれかの条件を満たす</RadioGroup.ItemText>
              </RadioGroup.Item>
            </HStack>
          </RadioGroup.Root>

          <Table.Root id='narrow_condition_table'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>条件フィールド</Table.ColumnHeader>
                <Table.ColumnHeader>条件</Table.ColumnHeader>
                <Table.ColumnHeader>条件値</Table.ColumnHeader>
                <Table.ColumnHeader>削除</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {
                narrow.narrows.map((condition: any, index: number) => {
                  return (
                    <Table.Row>
                      <Table.Cell className='condition-field-cell'>
                        <Text>{condition.label}</Text>
                      </Table.Cell>
                      <Table.Cell className='condition-cell'>
                        <Select.Root minWidth='180px' collection={condition.conditionSelect.condition} size="sm"
                          defaultValue={[condition.condition]}
                          onChange={changeCondition}>
                          <Select.HiddenSelect className={`codition-${index}`} />
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
                                {condition.conditionSelect.condition.items.map((narrowCondition: any) => (
                                  <Select.Item item={narrowCondition} key={narrowCondition.value}>
                                    {narrowCondition.label}
                                    <Select.ItemIndicator />
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Portal>
                        </Select.Root>
                      </Table.Cell>
                      <Table.Cell className='condition-value-cell'>
                        {(() => {
                          if (condition.conditionSelect.valueInput === 'number') {
                            return (
                              <NumberInput.Root minWidth='180px' defaultValue="10" onChange={changeConditionValue}>
                                <NumberInput.Control />
                                <NumberInput.Input className={`condition-value-${index}`} defaultValue={condition.value}
                                />
                              </NumberInput.Root>
                            )
                          } else if (condition.conditionSelect.valueInput === 'select') {
                            return (
                              <Select.Root multiple minWidth='180px' collection={createListCollection({ items: condition.conditionSelect.options })} size="sm"
                                // onValueChange={changeConditionValue}
                                onChange={changeConditionValue}
                              >
                                <Select.HiddenSelect className={`condition-value-${index}`} />
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
                                  <Select.Positioner defaultValue={condition.value}>
                                    <Select.Content>
                                      {condition.conditionSelect.options.items.map((narrowCondition: any) => (
                                        <Select.Item item={narrowCondition} key={narrowCondition.value}>
                                          {narrowCondition.label}
                                          <Select.ItemIndicator />
                                        </Select.Item>
                                      ))}
                                    </Select.Content>
                                  </Select.Positioner>
                                </Portal>
                              </Select.Root>
                            )
                          } else {
                            return (
                              <Input minWidth='180px' type={condition.conditionSelect.valueInput}
                                className={`condition-value-${index}`} defaultValue={condition.value}
                                onChange={changeConditionValue} />
                            )
                          }
                        })()}
                      </Table.Cell>
                      <Table.Cell style={{ padding: '12px' }}>
                        <Button fontSize="sm" className='user-delete-button' bg="white" borderColor="red.500" _hover={{ background: "gray. 100" }} value={index} onClick={deleteNarrow}>
                          <Icon size="lg" color="red">
                            <BsTrash />
                          </Icon>
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  )
                })
              }
            </Table.Body>
          </Table.Root>
        </Tabs.Content >

        {/* ユーザー権限設定 */}
        < Tabs.Content value="user" >
          <Flex mb={6} display="flex" justifyContent="space-between" alignItems="center">
            <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}
              onClick={savaShowUsers}>
              保存
            </Button>
          </Flex>

          <Box marginBottom={"20px"} marginTop={"20px"}>
            <Popover.Root size="xs" open={openShowUsers} positioning={{ sameWidth: true }}
              closeOnInteractOutside onOpenChange={(e: any) => { setOpenShowUsers(e.open) }}>
              <Popover.Trigger asChild>
                <Button bgColor="white" color="cyan.500" px={4} py={2} borderRadius="md" fontSize={"small"} fontWeight="bold" w={"125px"} h={"40px"} borderColor="cyan.500"
                  onClick={(e: any) => { setOpenShowUsers(!openShowUsers) }}>
                  ユーザー追加
                </Button>
              </Popover.Trigger>

              <Portal>
                <Popover.Positioner>
                  <Popover.Content>
                    <Popover.Body>
                      <Listbox.Root collection={authorityUsers} onSelect={addShowUser} border={'none'}>
                        <Listbox.Content maxH={"230px"}>
                          {authorityUsers.items.map((item: any) => {
                            if (!showUsers[item.value]) {
                              return (
                                <Listbox.Item item={item} key={item.value}>
                                  <Listbox.ItemText>{item.label}</Listbox.ItemText>
                                  <Listbox.ItemIndicator />
                                </Listbox.Item>
                              )
                            }
                          })}
                        </Listbox.Content>
                      </Listbox.Root>
                    </Popover.Body>
                  </Popover.Content>
                </Popover.Positioner>
              </Portal>
            </Popover.Root>
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
              {Object.keys(showUsers).map((key: any, index: number) => {
                const showUser = showUsers[key];

                return (
                  <Table.Row>
                    <Table.Cell style={{ padding: '12px' }}>
                      <Text>{showUser.userName}</Text>
                    </Table.Cell>
                    <Table.Cell style={{ padding: '12px' }}>
                      <Stack >
                        <Checkbox.Root colorPalette={"cyan"} defaultChecked={showUser.edit} disabled={showUser.authority === 0 ? true : false}
                          onChange={chengeAuthority}>
                          <Checkbox.HiddenInput className={`authority-edit edit-${showUser.user}`} />
                          <Checkbox.Control />
                          <Checkbox.Label>ピンの編集</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root colorPalette={"cyan"} defaultChecked={showUser.create} disabled={showUser.authority === 0 ? true : false}
                          onChange={chengeAuthority}>
                          <Checkbox.HiddenInput className={`authority-create create-${showUser.user}`} />
                          <Checkbox.Control />
                          <Checkbox.Label>ピンの登録</Checkbox.Label>
                        </Checkbox.Root>
                        <Checkbox.Root colorPalette={"cyan"} defaultChecked={showUser.setConfig} disabled={showUser.authority === 0 ? true : false}
                          onChange={chengeAuthority}>
                          <Checkbox.HiddenInput className={`authority-setConfig setConfig-${showUser.user}`} />
                          <Checkbox.Control />
                          <Checkbox.Label >マップの設定</Checkbox.Label>
                        </Checkbox.Root>
                      </Stack>
                    </Table.Cell>
                    <Table.Cell style={{ padding: '12px' }}>
                      <Button fontSize="sm" className='user-delete-button' bg="white" borderColor="red.500" _hover={{ background: "gray. 100" }} id={`delete_show_user_${showUser.user}`}
                        value={showUser.user}
                        display={showUser.authority === 0 ? 'none' : 'block'} onClick={deleteShowUser}>
                        {/* <Image src='./dustBox.png' title='削除'></Image> */}
                        <Icon size="lg" color="red">
                          <BsTrash />
                        </Icon>
                      </Button>
                    </Table.Cell>
                  </Table.Row >
                )
              })}
            </Table.Body >
          </Table.Root >
        </Tabs.Content >
      </Tabs.Root >

      {/* ダイアログ */}
      <Dialog.Root role="alertdialog" open={dialog.open} onOpenChange={(e: any) => {
        setDialog({
          open: e.open,
          status: dialog.status,
          title: '',
          showCancel: false,
          confirmLabel: '',
          comfirmResult: false,
          contentAlign: 'center',
          data: ''
        })
      }}>
        <Dialog.Backdrop />
        <Dialog.Positioner alignItems='center' justifyContent='center' p='4'>
          <Dialog.Content maxW='720px'>
            <Dialog.Body pt='10' pb='8' display='flex' justifyContent='center'>
              <Alert.Root status={dialog.status} w='full'>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title fontSize='lg' fontWeight='semibold'>
                    {dialog.title}
                  </Alert.Title>
                </Alert.Content>
              </Alert.Root>

            </Dialog.Body>
            <Dialog.Footer>
              {dialog.showCancel ? (
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" onClick={() => {
                    setDialog({
                      open: false,
                      status: dialog.status,
                      title: '',
                      showCancel: false,
                      confirmLabel: '',
                      comfirmResult: false,
                      contentAlign: 'center',
                      data: ''
                    })
                  }}>キャンセル</Button>
                </Dialog.ActionTrigger>
              ) : null}
              <Button onClick={dialogClickOk}>OK</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root >
    </Box >
  )
}