
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
  checkRegistration: 'true' | 'false';
  imageField: string;
  registrationAllImage: 'true' | 'false';
  imageDatatime: boolean;
  imageDatetimeField: string;
  mapTile: string;
}

export const postConfig = async (data: FormValues, setConfig: null | any, domainId: number, users: any[], loginUserInfo: any, popupFieldRows: any) => {
  const postConfig: { config: any, colors: any, popup: any, user: any[], id: number | string } = {
    config: data,
    colors: {},
    popup: {},
    user: [],
    id: ''
  }

  console.log(data)

  let popup_row_num: number = popupFieldRows.length;

  for (let i = 0; i < popupFieldRows.length; i++) {
    postConfig.popup['popup_row' + (i + 1)] = {
      popupField: popupFieldRows[i].field,
      popupFieldName: ''
    }
  }

  const colorTable: any = document.querySelectorAll('#show_color_table tbody tr');
  const change_color_row_num = colorTable.length

  for (let i = 0; i < colorTable.length; i++) {
    postConfig.colors['change_color_row' + (i + 1)] = {
      option: colorTable[i].getElementsByClassName('option-label')[0].innerText,
      color: colorTable[i].getElementsByClassName('marker-color')[0].value,
      icon: colorTable[i].getElementsByClassName('marker-icon')[0].value,
      iconColor: colorTable[i].getElementsByClassName('icon-color')[0].value
    }
  }

  const narrow: any = {};
  const mapShowUser: any = {};
  if (!setConfig) {
    postConfig.config.creater = loginUserInfo.id
    postConfig.config.valid = true;
    postConfig.config.mapTitle = 'マップ'
    if (loginUserInfo.authority !== 0) {
      for (let i = 0; i < users.length; i++) {
        if (users[i].autority === 0) {
          postConfig.user = [users[i].id]
          break;
        }
      }

      postConfig.user.push(loginUserInfo.id)
    } else {
      postConfig.user = [loginUserInfo.id]
    }

    for (let i = 0; i < users.length; i++) {
      if (users[i].authority === 0 || users[i].id === loginUserInfo.id) {
        mapShowUser['user_row' + (Object.keys(mapShowUser).length + 1)] = {
          user: users[i].id,
          edit: true,
          create: true,
          setConfig: true,
          authority: users[i].authority
        }
      }
    }
  } else {
    postConfig.id = setConfig.id
    postConfig.config.valid = setConfig.valid
    postConfig.config.mapTitle = setConfig.mapTitle

    for (let i = 1; i <= setConfig.narrow_row_number; i++) {
      narrow['narrow_row' + i] = setConfig['narrow_row' + i]
    }

    for (let i = 1; i <= setConfig.users_row_number; i++) {
      mapShowUser['user_row' + i] = setConfig['user_row' + i]
    }
  }

  postConfig.config.domain = domainId

  postConfig.config.addImage = JSON.stringify({
    checkRegistration: data.checkRegistration === 'true' ? true : false,
    imageField: data.imageField,
    RegistrationAllImage: data.registrationAllImage === 'true' ? true : false,
    imageDateTime: data.imageDatatime,
    imageDateTimeField: data.imageDatatime ? data.imageDatetimeField : ''
  })

  console.log(postConfig);

  const postConfigResp = await fetch('./setConfig', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postConfig)
  })

  if (!postConfigResp.ok) {
    throw new Error('設定の保存に失敗しました。')
  }

  const postConfigResult = await postConfigResp.json();
  console.log(postConfigResult);

  return {
    id: postConfigResult.id,
    domain: domainId,
    mapTitle: postConfig.config.mapTitle,
    appId: Number(postConfig.config.appId),
    token: postConfig.config.token,
    centerLat: Number(postConfig.config.centerLat),
    centerLng: Number(postConfig.config.centerLng),
    marker: postConfig.config.marker,
    latitude: postConfig.config.latitude,
    longitude: postConfig.config.longitude,
    name: postConfig.config.name,
    group: postConfig.config.group,
    color: postConfig.config.color,
    openURL: postConfig.config.openURL,
    addImage: JSON.parse(postConfig.config.addImage),
    valid: postConfig.config.valid,
    change_color_row_num: change_color_row_num,
    ...postConfig.colors,
    popup_row_num: popup_row_num,
    ...postConfig.popup,
    narrow_row_number: Object.keys(narrow).length,
    ...narrow,
    users_row_number: Object.keys(mapShowUser).length,
    ...mapShowUser
  }
}