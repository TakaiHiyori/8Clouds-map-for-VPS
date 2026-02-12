
export const setDropdown = (field: any) => {
  const arrayLatitudes: any[] = [],
    arrayLongitudes: any[] = [],
    arrayNames: any[] = [],
    arrayGroups: any[] = [],
    arrayColors: any[] = [],
    arrayPopups: any[] = [],
    arrayFiles: any[] = [],
    arrayDatetimes: any[] = [],
    arrayNarrowFields: any = [];

  const groupLabel: any = {
    'SINGLE_LINE_TEXT': '文字列',
    'MULTI_LINE_TEXT': '文字列',
    'RITCH_TEXT': '文字列',
    'LINK': '文字列',
    'NUMBER': '数値',
    'CALC': '数値',
    'RECORD_NUMBER': '数値',
    'DATE': '日付',
    'TIME': '時刻',
    'DATETIME': '日時',
    'CREATED_TIME': '日時',
    'UPDATED_TIME': '日時',
    'RADIO_BUTTON': '選択',
    'DROP_DOEN': '選択',
    'MULTI_SELECT': '選択',
    'CHECK_BOX': '選択',
    'CATEGORY': '選択',
    'STATUS': '選択',
    'USER_SELECT': 'ユーザー',
    'CREATOR': 'ユーザー',
    'MODIFIER': 'ユーザー',
    'STATUS_ASSIGNEE': 'ユーザー',
    'ORGANIZATION_SELECT': '組織',
    'GROUP_SELECT': 'グループ',
    'FILE': '添付ファイル'
  }

  for (const key in field) {
    const option: any = { label: field[key].label, value: field[key].code, category: groupLabel[field[key].type] }
    switch (field[key].type) {
      case '__REVISION__':
      case 'SUBTABLE':
      case 'RICH_TEXT':
      case 'GROUP':
      case 'REFERENCE_TABLE':
      case 'LABEL':
      case 'SPACER':
      case 'HR':
        break;

      case 'STATUS':
        if (field[key].enabled) {
          arrayPopups.push(option);
          arrayNarrowFields.push(option);
        }
        break;

      case 'CATEGORY':
      case 'STATUS_ASSIGNEE':
        if (field[key].enabled) {
          arrayPopups.push(option);
        }
        break;

      case 'NUMBER':
        if (!field[key].lookup) {
          arrayLatitudes.push(option);
          arrayLongitudes.push(option);
          arrayNames.push(option);
        }
        arrayPopups.push(option);
        arrayNarrowFields.push(option);
        break;

      case 'SINGLE_LINE_TEXT':
        if (!field[key].lookup && field[key].expression === '') {
          arrayNames.push(option);
        }
        arrayPopups.push(option);
        arrayNarrowFields.push(option);
        break;

      case 'RADIO_BUTTON':
      case 'DROP_DOWN':
        arrayGroups.push(option);
        arrayColors.push(option);
        arrayPopups.push(option);
        arrayNarrowFields.push(option);
        break;

      case 'FILE':
        arrayFiles.push(option);
        arrayPopups.push(option);
        break;

      case 'DATETIME':
      case 'DATE':
        arrayDatetimes.push(option);
        arrayPopups.push(option);
        arrayNarrowFields.push(option);
        break;

      case 'USER_SELECT':
      case 'ORGANIZATION_SELECT':
      case 'GROUP_SELECT':
      case 'CREATOR':
      case 'MODIFIER':
        arrayPopups.push(option);
        break;

      default:
        arrayPopups.push(option);
        arrayNarrowFields.push(option);
        break;
    }
  }

  return [arrayLatitudes, arrayLongitudes, arrayNames, arrayGroups, arrayColors, arrayFiles, arrayDatetimes, arrayPopups, arrayNarrowFields]
}