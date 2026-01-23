
export const createQuery = (config: any, field: any) => {
  let addQuery = ''
  for (let i = 1; i <= config.narrow_row_number; i++) {
    if (i === 1) {
      addQuery += ' and (';
    }
    const condition = config['narrow_row' + i]
    switch (field[condition.field].type) {
      case 'SINGLE_LINE_TEXT':
      case 'MULTI_LINE_TEXT':
      case 'RITCH_TEXT':
      case 'RITCH':
        let con = condition.condition;
        if (con === 'match') {
          con = 'like'
        } else if (con === 'unmatch') {
          con = 'not like'
        }
        addQuery += `${condition.field} ${con} "${condition.value}"`
        break;

      case 'NUMBER':
      case 'RECORD_NUMBER':
      case 'CALC':
        addQuery += `${condition.field} ${condition.condition} ${Number(condition.value)}`
        break;

      case 'RADIO_BUTTON':
      case 'DROP_DOWN':
        addQuery += `${condition.field} ${condition.condition === 'match' ? 'in' : 'not in'} ${Number(condition.value)}`
        break;

      case 'MULTI_SELECT':
      case 'CHECK_BOX':
        const conditionValue: string = condition.value.map((v: string) => v).join(', ')
        addQuery += `${condition.field} ${condition.condition === 'match' ? 'in' : 'not in'} (${conditionValue})`
        break;
    }

    if (i !== config.narrow_row_number) {
      addQuery += ` ${condition.andor} `
    } else {
      addQuery += ')'
    }
  }

  return addQuery;
}