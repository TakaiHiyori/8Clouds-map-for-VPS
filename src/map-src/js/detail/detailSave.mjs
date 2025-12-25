import { uploadFile } from '../kintoneAPI.mjs'

export const detailSave = async (config, recordId, record, domain, uploadFiles, fieldResp) => {
  if ($(`#${config.name} input`).val() === '' || !$(`#${config.name} input`).val()) {
    throw new Error('ピンの名前が入力されていません。')
  }
  const body = {
    domain: domain,
    token: config.token,
    record: {
      app: Number(config.appId),
      id: Number(recordId),
      record: {}
    }
  }

  for (const key in record.record) {
    const prop = fieldResp.properties[key]
    const RecordProp = record.record[key]

    switch (RecordProp.type) {
      case '__ID__':
      case '__REVISION__':
      case 'MODIFIER':
      case 'CREATOR':
      case 'CREATED_TIME':
      case 'UPDATED_TIME':
      case 'RECORD_NUMBER':
        break;

      case 'RADIO_BUTTON':
        if (RecordProp.value !== $(`#${key} input[name="${prop.code}"]:checked`).val()) {
          body.record.record[prop.code] = {
            value: $(`#${key} input[name="${prop.code}"]:checked`).val()
          }
        }
        break;

      case 'DROP_DOWN':
        if (RecordProp.value !== $(`#${key} select`).val()) {
          body.record.record[prop.code] = {
            value: $(`#${key} select`).val()
          }
        }
        break;

      case 'CHECK_BOX':
        const checkes = $(`#${key} input[name="${prop.code}"]:checked`);
        const checkBoxValue = [];
        for (let i = 0; i < checkes.length; i++) {
          checkBoxValue.push(checkes.eq(i).val());
        }

        body.record.record[prop.code] = {
          value: checkBoxValue
        }
        break;

      case 'MULTI_SELECT':
        const multiSelects = $(`#${key} .kintoneplugin-dropdown-list-item-selected`);
        const multiSelectValue = [];
        for (let i = 0; i < multiSelects.length; i++) {
          multiSelectValue.push($(`#${key} .kintoneplugin-dropdown-list-item-selected:eq(${i}) .kintoneplugin-dropdown-list-item-name`).text());
        }

        body.record.record[prop.code] = {
          value: multiSelectValue
        }
        break;

      case 'DATETIME':
        const nowZone = luxon.DateTime.now().setZone('Asia/Tokyo');
        const dateTime = luxon.DateTime.fromISO($(`#${key} input`).val() + 'Z').setZone('utc').minus({ hours: Number(nowZone.o / 60) }).toFormat('yyyy-MM-dd\'T\'HH:mm\'Z\'');
        if (RecordProp.value !== dateTime) {
          if (dateTime === 'Invalid DateTime') {
            body.record.record[prop.code] = {
              value: ''
            }
          } else {
            body.record.record[prop.code] = {
              value: dateTime
            }
          }
        }
        break;

      case 'MULTI_LINE_TEXT':
        if (RecordProp.value !== $(`#${key} textarea`).val()) {
          body.record.record[prop.code] = {
            value: $(`#${key} textarea`).val()
          }
        }
        break;

      case 'NUMBER':
      case 'SINGLE_LINE_TEXT':
        if (prop.code === config.latitude || prop.code === config.longitude) {
          break;
        }

        if (prop.lookup === undefined && (prop.expression === '' || !prop.expression)) {
          if (RecordProp.value !== $(`#${key} input`).val()) {
            if ($(`#${key}input`).val() === null) {
              body.record.record[prop.code] = {
                value: ''
              }
            } else {
              body.record.record[prop.code] = {
                value: $(`#${key} input`).val()
              }
            }
          }
        }
        break;

      case 'LINK':
      case 'DATE':
      case 'TIME':
        if (RecordProp.value !== $(`#${key} input`).val()) {
          if (!$(`#${key} input`).val()) {
            body.record.record[prop.code] = {
              value: ''
            }
          } else {
            body.record.record[prop.code] = {
              value: $(`#${key} input`).val()
            }
          }
        }
        break;

      case 'FILE':

        body.record.record[prop.code] = { value: [] }
        for (let i = 0; i < uploadFiles[prop.code].length; i++) {
          if (uploadFiles[prop.code][i].fileKey) {
            body.record.record[prop.code].value.push({ fileKey: uploadFiles[prop.code][i].fileKey })
          } else {
            const fileKey = await uploadFile(domain, config.token, uploadFiles[prop.code][i], '../../kintone/uploadFile')
            if (fileKey.success) {
              body.record.record[prop.code].value.push({ fileKey: fileKey.fileKey })
            }
          }
        }
        break;

      case 'SUBTABLE':
        body.record.record[prop.code] = { value: [] }
        for (let i = 1; i < $(`#${key} tbody > tr`).length; i++) {
          if ($(`#${key} tbody > tr`).eq(i).prop('id')) {
            body.record.record[prop.code].value.push({
              id: $(`#${key} tbody > tr`).eq(i).prop('id'),
              value: {}
            })
          } else {
            body.record.record[prop.code].value.push({ value: {} })
          }
          for (const f in prop.fields) {
            const field = prop.fields[f];
            switch (field.type) {
              case 'SINGLE_LINE_TEXT':
                if (field.lookup === undefined && field.expression === '') {
                  body.record.record[prop.code].value[(i - 1)].value[field.code] = {
                    value: $(`#${key} tbody > tr:eq(${i}) #${field.code}`).val()
                  }
                }
                break;

              case 'NUMBER':
              case 'DATE':
              case 'TIME':
              case 'DROP_DOWN':
              case 'LINK':
              case 'MULTI_LINE_TEXT':
                if (field.lookup === undefined && !field.expression) {
                  body.record.record[prop.code].value[(i - 1)].value[field.code] = {
                    value: $(`#${key} tbody > tr:eq(${i}) #${field.code}`).val() || ''
                  }
                }
                break;

              case 'RADIO_BUTTON':
                body.record.record[prop.code].value[(i - 1)].value[field.code] = {
                  value: $(`#${key} tbody > tr:eq(${i}) input[name^=${field.code}]:checked`).val()
                }
                break;

              case 'MULTI_SELECT':
                const multiSelectValues = []
                for (let j = 0; j < $(`#${key} tbody > tr:eq(${i}) #${field.code} .kintoneplugin-dropdown-list-item-selected`).length; j++) {
                  multiSelectValues.push($(`#${key} tbody > tr:eq(${i}) #${field.code} .kintoneplugin-dropdown-list-item-selected:eq(${j}) .kintoneplugin-dropdown-list-item-name`).text());
                }
                body.record.record[prop.code].value[(i - 1)].value[field.code] = {
                  value: multiSelectValues
                }
                break;

              case 'CHECK_BOX':
                const checkes = $(`#${key} tbody > tr:eq(${i}) input[name^="${field.code}"]:checked`);
                const checkBoxValue = [];
                for (let i = 0; i < checkes.length; i++) {
                  checkBoxValue.push(checkes.eq(i).val());
                }

                body.record.record[prop.code].value[(i - 1)].value[field.code] = {
                  value: checkBoxValue
                }
                break;

              case 'DATETIME':
                const nowZone = luxon.DateTime.now().setZone('Asia/Tokyo');
                const dateTime = luxon.DateTime.fromISO($(`#${key} tbody > tr:eq(${i}) #${field.code}`).val() + 'Z').setZone('utc').minus({ hours: Number(nowZone.o / 60) }).toFormat('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
                if (dateTime === 'Invalid DateTime') {
                  body.record.record[prop.code].value[(i - 1)].value[field.code] = {
                    value: ''
                  }
                } else {
                  body.record.record[prop.code].value[(i - 1)].value[field.code] = {
                    value: dateTime
                  }
                }
                break;

              case 'FILE':
                body.record.record[prop.code].value[(i - 1)].value[field.code] = { value: [] }
                for (let j = 0; j < uploadFiles[field.code][String(i)].length; j++) {
                  if (uploadFiles[field.code][String(i)][j].fileKey) {
                    body.record.record[prop.code].value[(i - 1)].value[field.code].value.push({
                      fileKey: uploadFiles[field.code][String(i)][j].fileKey
                    })
                  } else {
                    const fileKey = await uploadFile(domain, config.token, uploadFiles[field.code][String(i)][j], '../../kintone/uploadFile')
                    if (fileKey.success) {
                      body.record.record[prop.code].value[(i - 1)].value[field.code].value.push({
                        fileKey: fileKey.fileKey
                      })
                    }
                  }
                }
                break;

              default:
                break;
            }
          }
        }
        break;
    }
  }

  const putResponse = await window.fetch('../../kintone/putRecord',
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

  const respText = await putResponse.text();

  if (respText === '') {
    throw new Error('kintoneへの登録に失敗しました。\n入力内容をもう一度確認してください。');
    return record
  }

  //レコードを取得
  const recordsResponse = await window.fetch("../../kintone/getRecord",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ app: config.appId, id: Number(recordId), domain: domain, token: config.token })
    });

  // await window.fetch("./php/putKintoneRecords.php", {
  //   method: 'POST',
  //   headers: {
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({ configId: config.id, appId: config.appId, records: JSON.stringify([record.record]) })
  // })

  $('#detail_buttons').css('display', 'block')
  $('#record_buttons').css('display', 'none')
  $('#kintone_detail').empty();
  return await recordsResponse.json();
}