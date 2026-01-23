
import $ from 'jquery'
import { DateTime } from "luxon";

const setField = (field: any, type: string, block: any, fieldProps: any, record: any) => {
  if (type !== 'SUBTABLE') {
    const blockDiv = $('<div>').attr({ class: 'kintone-fields-block' });
    switch (field.type) {
      case 'SPACER':
        return $('<div>').css({ width: `${field.size.width}px`, height: `${field.size.height}px` })

      case 'HR':
        return $('<hr>').css({ width: `${field.size.width}px`, margin: 0 });

      case 'LABEL':
        return $('<div>').text(field.label).css({ width: `${field.size.width}px` });

      case 'SINGLE_LINE_TEXT':
      case 'NUMBER':
      case 'RECORD_NUMBER':
      case 'DROP_DOWN':
      case 'RADIO_BUTTON':
      case 'DATE':
      case 'TIME':
        if (!fieldProps[field.code].noLabel) {
          const singleTextName = $('<div>').attr({ class: 'kintone-field-label' }).text(fieldProps[field.code].label)
          blockDiv.append(singleTextName)
        }
        const singleTextBox = $('<div>').attr({ class: 'kintone-field' }).text(record[field.code].value).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
        return blockDiv.append(singleTextBox);

      case 'MULTI_LINE_TEXT':
      case 'TICH_TEXT':
        if (!fieldProps[field.code].noLabel) {
          const multiTextName = $('<div>').attr({ class: 'kintone-field-label' }).text(fieldProps[field.code].label)
          blockDiv.append(multiTextName);
        }
        const multiTextBox = $('<div>').attr({ class: 'kintone-field' }).text(record[field.code].value).css({ width: `${field.size.width}px`, 'height': `${field.size.innerHeight}px` });
        return blockDiv.append(multiTextBox);

      case 'DATETIME':
      case 'CREATED_TIME':
      case 'UPDATED_TIME':
        if (!fieldProps[field.code].noLabel) {
          const datetimetName = $('<div>').attr({ class: 'kintone-field-label' }).text(fieldProps[field.code].label)
          blockDiv.append(datetimetName)
        }
        if (record[field.code].value) {
          const datetimetBox = $('<div>').attr({ class: 'kintone-field' }).text(DateTime.fromISO(record[field.code].value).toFormat('yyyy-MM-dd HH:mm')).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
          return blockDiv.append(datetimetBox);
        } else {
          const datetimetBox = $('<div>').attr({ class: 'kintone-field' }).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
          return blockDiv.append(datetimetBox);
        }

      case 'MULTI_SELECT':
      case 'CHECK_BOX':
        if (!fieldProps[field.code].noLabel) {
          const multiSelectName = $('<div>').attr({ class: 'kintone-field-label' }).text(fieldProps[field.code].label)
          blockDiv.append(multiSelectName)
        }
        const multiSelectValue = record[field.code].value.map((v: string) => { return v }).join(', ');
        const multiSelectBox = $('<div>').attr({ class: 'kintone-field' }).text(multiSelectValue).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
        return blockDiv.append(multiSelectBox)

      case 'USER_SELECT':
      case 'ORGANIZATION_SELECT':
      case 'GROUP_SELECT':
        if (!fieldProps[field.code].noLabel) {
          const userSelectName = $('<div>').attr({ class: 'kintone-field-label' }).text(fieldProps[field.code].label)
          blockDiv.append(userSelectName)
        }
        const userSelectValue = record[field.code].value.map((c: any) => { return c.name }).join(', ');
        const userSelectBox = $('<div>').attr({ class: 'kintone-field' }).text(userSelectValue).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
        return blockDiv.append(userSelectBox)

      case 'CREATOR':
      case 'MODIFIER':
        if (!fieldProps[field.code].noLabel) {
          const createUserName = $('<div>').attr({ class: 'kintone-field-label' }).text(fieldProps[field.code].label)
          blockDiv.append(createUserName)
        }
        const createUserBox = $('<div>').attr({ class: 'kintone-field' }).text(record[field.code].value.name).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
        return blockDiv.append(createUserBox)

    }
  } else {
    // const blockDiv = $('<div>').attr({ class: 'kintone-fields-block' });
    switch (field.type) {
      case 'SINGLE_LINE_TEXT':
      case 'NUMBER':
      case 'RECORD_NUMBER':
      case 'DROP_DOWN':
      case 'DATE':
      case 'TIME':
        const singleTextBox = $('<div>').attr({ class: 'kintone-table-field' }).text(record[field.code].value).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
        // return blockDiv.append(singleTextBox);
        return singleTextBox

      case 'MULTI_LINE_TEXT':
      case 'TICH_TEXT':
        const multiTextBox = $('<div>').attr({ class: 'kintone-table-field' }).text(record[field.code].value).css({ width: `${field.size.width}px`, 'height': `${field.size.innerHeight}px` });
        // return blockDiv.append(multiTextBox);
        return multiTextBox

      case 'DATETIME':
        if (record[field.code].value) {
          const datetimetBox = $('<div>').attr({ class: 'kintone-table-field' }).text(DateTime.fromISO(record[field.code].value).toFormat('yyyy-MM-dd HH:mm')).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
          // return blockDiv.append(datetimetBox);
          return datetimetBox
        } else {
          const datetimetBox = $('<div>').attr({ class: 'kintone-field' }).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
          return datetimetBox
        }

      case 'MULTI_SELECT':
      case 'CHECK_BOX':
        const multiSelectValue = record[field.code].value.map((v: string) => { return v }).join(', ');
        const multiSelectBox = $('<div>').attr({ class: 'kintone-table-field' }).text(multiSelectValue).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
        // return blockDiv.append(multiSelectBox)
        return multiSelectBox

      case 'USER_SELECT':
      case 'ORGANIZATION_SELECT':
      case 'GROUP_SELECT':
        const userSelectValue = record[field.code].value.map((c: any) => { return c.name }).join(', ');
        const userSelectBox = $('<div>').attr({ class: 'kintone-table-field' }).text(userSelectValue).css({ width: `${field.size.width}px`, 'min-height': '40px', 'place-content': 'center' });
        // return blockDiv.append(userSelectBox)
        return userSelectBox
    }
  }
}

export const createDetailModal = async (recordId: Number, recordsResp: any, domain: string, config: any, fieldProps: any) => {
  console.log(fieldProps)
  let detailRecord: any = {}
  recordsResp.forEach((records: any[]) => {
    records.forEach((record: any) => {
      if (record.$id.value === recordId) {
        detailRecord = record
      }
    })
  })

  const kintoneLayoutResp = await fetch('../kintone/getLayout', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app: config.appId, token: config.token, domain: domain })
  })

  const kintoneLayout = await kintoneLayoutResp.json();
  console.log(kintoneLayout)
  let fileImageURLs = {}, uploadFiles = {};

  //モーダルを作成、ドロップボックスに保存するためのブロックも作成
  const modal = `<div id="glay_out" style="display: none;">
                            <div id="modal">
                                <div id="modal_header">
                                    <span id="modal_title">ピンの詳細</span>
                                    <div id="buttons">
                                        <button class="kintoneplugin-button-dialog-cancel" id="cancel">キャンセル</button>
                                        <button class="kintoneplugin-button-dialog-ok" id="edit">編集</button>
                                    </div>
                                </div>
                                <div id="modal_body">
                                    <div id="kintone_detail_record">
                                    </div>
                                </div>
                            <div>
                        </div>`
  $('body').append(modal);

  for (let i = 0; i < kintoneLayout.layout.length; i++) {
    const layout = kintoneLayout.layout[i]
    const block = $('<div>').attr('class', 'block');
    switch (layout.type) {
      case 'ROW':
        for (let j = 0; j < layout.fields.length; j++) {
          const field = layout.fields[j]
          const fieldRow = setField(field, layout.type, block, fieldProps, detailRecord)
          if (fieldRow) {
            block.append(fieldRow)
          }
        }
        $('#kintone_detail_record').append(block)
        break;

      case 'GROUP':
        const group = $('<details>').attr({ class: 'kintone-details' });
        const groupName = $('<summary>');
        if (!fieldProps[layout.code].noLabel) {
          groupName.append(`<div>${fieldProps[layout.code].label}</div>`);
        }
        group.append(groupName)
        block.append(group);
        for (let k = 0; k < layout.layout.length; k++) {
          const groupBlock = $('<div>').attr('class', 'block')
          for (let j = 0; j < layout.layout[k].fields.length; j++) {
            const field = layout.layout[k].fields[j]
            const fieldRow = setField(field, layout.type, block, fieldProps, detailRecord)
            if (fieldRow) {
              groupBlock.append(fieldRow)
            }
          }
          group.append(groupBlock)
        }
        $('#kintone_detail_record').append(block)
        break;

      case 'SUBTABLE':
        const kintoneTable = $('<table>').attr('class', 'kintone-table');
        block.append(kintoneTable)

        const kintoneTableHeader = $('<thead>');
        kintoneTable.append(kintoneTableHeader);

        const headerTR = $('<tr>')
        kintoneTableHeader.append(headerTR)
        for (let j = 0; j < layout.fields.length; j++) {
          const headerTH = $('<th>').attr('class', 'kintoneplugin-table-th');
          if (!fieldProps[layout.code].fields[layout.fields[j].code].noLabel) {
            headerTH.append($('<span>').attr('class', 'title').text(fieldProps[layout.code].fields[layout.fields[j].code].label))
          }

          headerTR.append(headerTH);
        }

        const kintoneTableBody = $('<tbody>');
        for (let k = 0; k < detailRecord[layout.code].value.length; k++) {
          const tbodyTR = $('<tr>');
          const record = detailRecord[layout.code].value[k].value;
          console.log(record)
          for (let j = 0; j < layout.fields.length; j++) {
            const field = layout.fields[j];
            const fieldRow = setField(field, layout.type, block, fieldProps, record)
            if (fieldRow) {
              tbodyTR.append($(`<th>
                <div class="kintoneplugin-table-td-control">
                  <div class="kintoneplugin-table-td-control-value">
                    ${fieldRow}
                  </div>
                </div>
              </th>`))
            }
          }
          kintoneTableBody.append(tbodyTR)
        }
        $('#kintone_detail_record').append(block)
        break;
    }
  }

  //モーダルを表示
  $('#glay_out').css('display', 'block');

  $('#cancel').off('click').click(() => {
    $('#glay_out').remove();
    return;
  })

}