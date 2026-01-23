
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

  for (const key in field) {
    const option = { label: field[key].label, value: field[key].code }
    switch (field[key].type) {
      case '__REVISION__':
      case 'SUBTABLE':
      case 'RICH_TEXT':
      case 'GROUP':
      case 'REFERENCE_TABLE':
      case 'LABEL':
      case 'SPACER':
      case 'HR':
      case 'CATEGORY':

      case 'STATUS_ASSIGNEE':
        break;

      case 'STATUS':
        arrayNarrowFields.push(option);
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
        if (!field[key].lookup && field[key].expreeion === '') {
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
        arrayPopups.push(option);
        arrayDatetimes.push(option)
        arrayNarrowFields.push(option);
        break;

      default:
        arrayPopups.push(option);
        arrayNarrowFields.push(option);
        break;
    }
  }

  return [arrayLatitudes, arrayLongitudes, arrayNames, arrayGroups, arrayColors, arrayFiles, arrayDatetimes, arrayPopups, arrayNarrowFields]
}