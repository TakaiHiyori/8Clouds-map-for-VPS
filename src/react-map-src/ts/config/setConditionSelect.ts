import { createListCollection } from '@chakra-ui/react'


export const setConditionSelect = async (field: any, conditionField: string, domain: string, appId: number, token: string) => {
  switch (field[conditionField].type) {
    case 'SINGLE_LINE_TEXT':
    case 'LINK':
      return {
        condition: createListCollection({
          items: [{
            label: '=(等しい)', value: '='
          }, {
            label: '≠(等しくない)', value: '!='
          },
          {
            label: '条件値を含む', value: 'match'
          },
          {
            label: '条件値を含まない', value: 'unmatch'
          }]
        }),
        valueInput: 'text'
      }
    case 'MULTI_LINE_TEXT':
    case 'RITCH_TEXT':
    case 'FILE':
      return {
        condition: createListCollection({
          items: [
            {
              label: '条件値を含む', value: 'match'
            },
            {
              label: '条件値を含まない', value: 'unmatch'
            }]
        }),
        valueInput: 'text'
      }

    case 'NUMBER':
    case 'CALC':
    case 'RECORD_NUMBER':
      return {
        condition: createListCollection({
          items: [{
            label: '=(等しい)', value: '='
          }, {
            label: '≠(等しくない)', value: '!='
          },
          {
            label: '≧(以上)', value: '>='
          },
          {
            label: '>(より大きい)', value: '>'
          },
          {
            label: '≦(以下)', value: '<='
          },
          {
            label: '<(より小さい)', value: '<'
          }]
        }),
        valueInput: 'number'
      }

    case 'DATE':
      return {
        condition: createListCollection({
          items: [{
            label: '=(等しい)', value: '='
          }, {
            label: '≠(等しくない)', value: '!='
          },
          {
            label: '≧(以降)', value: '>='
          },
          {
            label: '>(より後)', value: '>'
          },
          {
            label: '≦(以前)', value: '<='
          },
          {
            label: '<(より前)', value: '<'
          }]
        }),
        valueInput: 'date'
      }

    case 'TIME':
      return {
        condition: createListCollection({
          items: [{
            label: '=(等しい)', value: '='
          }, {
            label: '≠(等しくない)', value: '!='
          },
          {
            label: '≧(以降)', value: '>='
          },
          {
            label: '>(より後)', value: '>'
          },
          {
            label: '≦(以前)', value: '<='
          },
          {
            label: '<(より前)', value: '<'
          }]
        }),
        valueInput: 'time'
      }

    case 'DATETIME':
    case 'CREATED_TIME':
    case 'UPDATED_TIME':
      return {
        condition: createListCollection({
          items: [{
            label: '=(等しい)', value: '='
          }, {
            label: '≠(等しくない)', value: '!='
          },
          {
            label: '≧(以降)', value: '>='
          },
          {
            label: '>(より後)', value: '>'
          },
          {
            label: '≦(以前)', value: '<='
          },
          {
            label: '<(より前)', value: '<'
          }]
        }),
        valueInput: 'datetime-local'
      }

    case 'RADIO_BUTTON':
    case 'DROP_DOWN':
    case 'MULTI_SELECT':
    case 'CHECK_BOX':
      const options: any[] = [];

      for (const key in field[conditionField].options) {
        options.push({
          label: field[conditionField].options[key].label,
          value: field[conditionField].options[key].label
        })
      }
      return {
        condition: createListCollection({
          items: [
            {
              label: '条件値を含む', value: 'match'
            },
            {
              label: '条件値を含まない', value: 'unmatch'
            }]
        }),
        valueInput: 'select',
        options: createListCollection({ items: options })
      }

    case 'STATUS':
      const params = new URLSearchParams({ domain: domain, appId: String(appId), token: token })
      const statusResp = await window.fetch(`./kintone/getStatus? ${params.toString()}`,)
      const status = await statusResp.json();

      const statusOptions: any = []
      for (const key in status.states) {
        statusOptions.push({
          label: status.states[key].name,
          value: status.states[key].name
        })
      }

      return {
        condition: createListCollection({
          items: [
            {
              label: '条件値を含む', value: 'match'
            },
            {
              label: '条件値を含まない', value: 'unmatch'
            }]
        }),
        valueInput: 'select',
        options: createListCollection({ items: statusOptions })
      }

  }
}