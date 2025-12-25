import { escapeHtml } from '../escapeHtml.mjs';

export const showEdit = (fieldResp, record, config, uploadFiles, fileImageURLs) => {

  $('#detail_buttons').css('display', 'none')
  $('#record_buttons').css('display', 'block');

  for (const key in record.record) {
    const prop = fieldResp.properties[key]
    const RecordProp = record.record[key]
    let value = '', count = 0;

    switch (RecordProp.type) {
      case 'NUMBER':
        if (prop.code === config.latitude || prop.code === config.longitude) {
          break;
        }
        if (prop.lookup === undefined && !prop.expression) {
          const numberField = $(`#${key}`);
          value = `<div id=${key}><input type="number" class="kintoneplugin-input-text" value=${RecordProp.value}></div>`
          numberField.after(value);
          numberField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
          numberField.remove();
        }
        break;

      case 'SINGLE_LINE_TEXT':
        if (prop.lookup === undefined && prop.expression === '') {
          const singleLineField = $(`#${key}`);

          value = `<div id=${key}><input type="text" class="kintoneplugin-input-text" value=${escapeHtml(RecordProp.value)}></div>`
          singleLineField.after(value)
          singleLineField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
          singleLineField.remove();
        }
        break;

      case 'MULTI_LINE_TEXT':
        const multiLineField = $(`#${key}`);
        value = `<div id=${key}><textarea class="kintoneplugin-input-text">${escapeHtml(RecordProp.value)}</textarea></div>`
        multiLineField.after(value)
        multiLineField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        multiLineField.remove();
        break;

      case 'RADIO_BUTTON':
        const radioField = $(`#${key}`);
        let radioOptions = '';
        for (const o in prop.options) {
          if (prop.options[o].label === RecordProp.value) {
            radioOptions += `<span class="kintoneplugin-input-radio-item radio1" >
                                            <input type="radio" name="${escapeHtml(prop.code)}" value="${escapeHtml(prop.options[o].label)}" id="${escapeHtml(prop.code)}-${escapeHtml(prop.options[o].label)}" checked="">
                                            <label for="${escapeHtml(prop.code)}-${escapeHtml(prop.options[o].label)}">${escapeHtml(prop.options[o].label)}</label>
                                        </span>`
          } else {
            radioOptions += `<span class="kintoneplugin-input-radio-item radio1" >
                                            <input type="radio" name="${escapeHtml(prop.code)}" value="${escapeHtml(prop.options[o].label)}" id="${escapeHtml(prop.code)}-${escapeHtml(prop.options[o].label)}">
                                            <label for="${escapeHtml(prop.code)}-${escapeHtml(prop.options[o].label)}">${escapeHtml(prop.options[o].label)}</label>
                                        </span>`
          }
        }
        value = `<div id="${key}">
                             <div class="kintoneplugin-redio">
                                 <div class="kintoneplugin-input-radio cf-field-type">${(radioOptions)}</div>
                             </div>
                         </div>`
        radioField.after(value)
        radioField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        radioField.remove();
        if (prop.align === 'HORIZONTAL') {
          $(`#${key}`).css('display', 'flex');
        }
        break;

      case 'DROP_DOWN':
        const dropDownField = $(`#${key}`);
        let selectOptions = '<option value="">-----</option>';
        for (const o in prop.options) {
          if (prop.options[o].label === RecordProp.value) {
            selectOptions += `<option value="${escapeHtml(prop.options[o].label)}" selected="">${escapeHtml(prop.options[o].label)}</option>`
          } else {
            selectOptions += `<option value="${escapeHtml(prop.options[o].label)}">${escapeHtml(prop.options[o].label)}</option>`
          }
        }
        value = `<div id="${key}">
                                <select>
                                    ${selectOptions}
                                </select>
                            </div>`
        dropDownField.after(value)
        dropDownField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        dropDownField.remove();
        break;

      case 'CHECK_BOX':
        const checkBoxField = $(`#${key}`);

        let checkBoxOptions = ``
        for (const o in prop.options) {
          checkBoxOptions += `<div class="kintoneplugin-input-checkbox">
                                               <span class="kintoneplugin-input-checkbox-item">`

          if (RecordProp.value.indexOf(prop.options[o].label) !== -1) {
            checkBoxOptions += `<input type="checkbox" name="${escapeHtml(prop.code)}" value="${escapeHtml(prop.options[o].label)}" id="${escapeHtml(prop.code)}-${escapeHtml(prop.options[o].label)}" checked>
                                            <label for="${escapeHtml(prop.code)}-${escapeHtml(prop.options[o].label)}">${escapeHtml(prop.options[o].label)}</label>
                                        </span></div>`
          } else {
            checkBoxOptions += `<input type="checkbox" name="${escapeHtml(prop.code)}" value="${escapeHtml(prop.options[o].label)}" id="${escapeHtml(prop.code)}-${escapeHtml(prop.options[o].label)}">
                                             <label for="${escapeHtml(prop.code)}-${escapeHtml(prop.options[o].label)}">${escapeHtml(prop.options[o].label)}</label>
                                        </span></div>`
          }

        }
        value += `<div id="${key}">
                                ${checkBoxOptions}
                              </div>`
        checkBoxField.after(value)
        checkBoxField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        checkBoxField.remove();
        if (prop.align === 'HORIZONTAL') {
          $(`#${key}`).css('display', 'flex');
        }
        break;

      case 'MULTI_SELECT':
        const multiSelectField = $(`#${key}`);

        let multiSelectOptions = `<div class="kintoneplugin-dropdown-list" id="${escapeHtml(prop.code)}">`;
        for (const o in prop.options) {
          if (RecordProp.value.indexOf(prop.options[o].label) !== -1) {
            multiSelectOptions += `<div class="kintoneplugin-dropdown-list-item  kintoneplugin-dropdown-list-item-selected"><span class="kintoneplugin-dropdown-list-item-name">${escapeHtml(prop.options[o].label)}</span></div>`
          } else {
            multiSelectOptions += `<div class="kintoneplugin-dropdown-list-item"><span class="kintoneplugin-dropdown-list-item-name">${escapeHtml(prop.options[o].label)}</span></div>`
          }
        }

        value += `<div id="${key}">${multiSelectOptions}</div>`
        multiSelectField.after(value)
        multiSelectField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        multiSelectField.remove();
        break;

      case 'DATE':
        const dateField = $(`#${key}`);
        value = `<div id="${key}"><input type="date" class="kintoneplugin-input-text" value=${RecordProp.value}></div>`
        dateField.after(value)
        dateField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        dateField.remove();
        break;

      case 'TIME':
        const timeField = $(`#${key}`);
        value = `<div id="${key}"><input type="time" class="kintoneplugin-input-text" value=${RecordProp.value}></div>`
        timeField.after(value)
        timeField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        timeField.remove();
        break;

      case 'DATETIME':
        const datetimeField = $(`#${key}`);
        if (RecordProp.value !== '' || RecordProp) {
          const datetime = luxon.DateTime.fromISO(RecordProp.value).toFormat('yyyy-MM-dd\'T\'HH:mm:ss')
          value = `<div id="${key}"><input type="datetime-local" class="kintoneplugin-input-text"  value=${datetime}></div>`
        } else {
          value = `<div id="${key}"><input type="datetime-local" class="kintoneplugin-input-text"></div>`
        }
        datetimeField.after(value)
        datetimeField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        datetimeField.remove();
        break;

      case 'LINK':
        const linkField = $(`#${key}`);

        if (prop.protocol === 'WEB') {
          value = `<div id="${key}"><input type="url" class="kintoneplugin-input-text" value=${RecordProp.value}></div>`

        } else if (prop.protocol === 'TEL') {
          value = `<div id="${key}"><input type="tel" class="kintoneplugin-input-text" value=${RecordProp.value}></div>`

        } else {
          value = `<div id="${key}"><input type="email" class="kintoneplugin-input-text" value=${RecordProp.value}></div>`

        }
        linkField.after(value)
        linkField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        linkField.remove();
        break;

      case 'FILE':
        const fileField = $(`#${key}`);
        let values = $('<div>').attr('id', key);
        uploadFiles[key] = []

        for (let i = 0; i < RecordProp.value.length; i++) {
          let fileValue = ''
          uploadFiles[key].push({ fileKey: RecordProp.value[i].fileKey });
          if (RecordProp.value[i].contentType.startsWith('image/')) {
            fileValue = `<div class="file-values"><img class="field-value-image" src="${fileImageURLs[RecordProp.value[i].fileKey]}"><button class="delete-files" id="${RecordProp.value[i].fileKey}">×</button></div>`
          } else {
            fileValue = `<div class="file-values"><div>${RecordProp.value[i].name}</div><button class="delete-files" id="${RecordProp.value[i].fileKey}">×</button></div>`
          }

          values.append(fileValue)
        }

        const postDropboxImage = $('<div>').attr('class', 'post_image');

        const inputMessage = $('<label>').text('ファイルを追加');

        if (navigator.userAgent.match(/iPhone|Android.+Mobile|ipad|macintosh/) || ("ontouchend" in document)) {
          inputMessage.text('追加')
        }

        const inputDropbocFile = $('<input>').attr({ 'class': 'input-files', 'type': 'file', 'name': 'input-file', 'multiple': 'muliple' });

        const showInputFileName = $('<div>').attr({ 'id': 'file-names' + escapeHtml(key), 'class': 'file-names' }).html('アップロードするファイル<br>');

        values.append(postDropboxImage);
        postDropboxImage.append(inputMessage);
        inputMessage.append(inputDropbocFile);
        postDropboxImage.append(showInputFileName);

        fileField.after(values);
        fileField.parent().css({ 'background-color': '#ffffff00', 'border': 'none' })
        fileField.remove();

        break;

      case 'SUBTABLE':
        const nowDateTime = luxon.DateTime.now().setLocale('ja');

        $(`#${key}`).attr('class', 'kintoneplugin-table edit-table');

        const thead = $(`#${key} thead > tr > th`);
        let body = '<tr>';

        const tbody = $('<tbody>');

        let fieldName = '';

        for (let i = 0; i < thead.length; i++) {
          const tableField = fieldResp.properties[key].fields[thead.eq(i).prop('id')];
          switch (tableField.type) {
            case 'SINGLE_LINE_TEXT':
              if (tableField.lookup === undefined && tableField.expression === '') {
                body += `<td>
                         <div class="kintoneplugin-table-td-control">
                             <div class="kintoneplugin-table-td-control-value">
                             ${fieldName}
                                 <div class="kintoneplugin-input-outer">
                                     <input type="text" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" value="${tableField.defaultValue}" />
                                 </div>
                             </div>
                         </div>
                         </td>`
              } else {
                body += `<td>
                             <div class="kintoneplugin-table-td-control">
                                 <div class="kintoneplugin-table-td-control-value">
                                 ${fieldName}
                                     <span id=${escapeHtml(tableField.code)}></span>
                                 </div>
                             </div>
                         </td>`
              }
              break;

            case 'NUMBER':
              if (tableField.lookup === undefined && !tableField.expression) {
                body += `<td>
                         <div class="kintoneplugin-table-td-control">
                             <div class="kintoneplugin-table-td-control-value">
                             ${fieldName}
                                 <div class="kintoneplugin-input-outer">
                                     <input type="number" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" value=${tableField.defaultValue} />
                                 </div>
                             </div>
                         </div></td>`
              } else {
                body += `<td>
                             <div class="kintoneplugin-table-td-control">
                                 <div class="kintoneplugin-table-td-control-value">
                                 ${fieldName}
                                     <span id=${escapeHtml(tableField.code)}></span>
                                 </div>
                             </div>
                         </td>`
              }
              break;

            case 'MULTI_LINE_TEXT':
              body += `<td>
                           <div class="kintoneplugin-table-td-control">
                               <div class="kintoneplugin-table-td-control-value">
                               ${fieldName}
                                   <div class="kintoneplugin-input-outer">
                                       <textarea class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}"></textarea>
                                   </div>
                               </div>
                           </div>
                       </td>`
              break;

            case 'RADIO_BUTTON':
              body += `<td>
                       <div class="kintoneplugin-table-td-control">
                           <div class="kintoneplugin-table-td-control-value">
                               ${fieldName}
                               <div class="kintoneplugin-input-radio cf-field-type table-radio" id=${tableField.code}>`

              count = 0;
              for (const o in tableField.options) {
                body += `<span class="kintoneplugin-input-radio-item radio1" >`
                if (tableField.defaultValue === '' && count === 0) {
                  body += `<input type="radio" name="${escapeHtml(tableField.code)}" value="${escapeHtml(tableField.options[o].label)}" id="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}" checked="">
                          <label for="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}">${escapeHtml(tableField.options[o].label)}</label>
                          </span>`
                } else if (tableField.defaultValue !== '' && tableField.options[o].label === tableField.defaultValue) {
                  body += `<input type="radio" name="${escapeHtml(tableField.code)}" value="${escapeHtml(tableField.options[o].label)}" id="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}" checked="">
                                <label for="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}">${escapeHtml(tableField.options[o].label)}</label>
                            </span>`
                } else {
                  body += `<input type="radio" name="${escapeHtml(tableField.code)}" value="${escapeHtml(tableField.options[o].label)}" id="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}">
                               <label for="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}">${escapeHtml(tableField.options[o].label)}</label>
                           </span>`
                }
                count++;
              }
              body += `</div></div></div></td>`
              break;

            case 'DROP_DOWN':
              body += `<td>
                       <div class="kintoneplugin-table-td-control">
                           <div class="kintoneplugin-table-td-control-value">
                               ${fieldName}
                                   <select id="${escapeHtml(tableField.code)}">
                                   <option value="">-----</option>`


              for (const o in tableField.options) {
                if (tableField.defaultValue === tableField.options[o].label) {
                  body += `<option value="${escapeHtml(tableField.options[o].label)}" selected>${escapeHtml(tableField.options[o].label)}</option>`
                }
                body += `<option value="${escapeHtml(tableField.options[o].label)}">${escapeHtml(tableField.options[o].label)}</option>`
              }
              body += `</select></div></div>`
              break;

            case 'CHECK_BOX':
              body += `<td>
                       <div class="kintoneplugin-table-td-control">
                           <div class="kintoneplugin-table-td-control-value table-check" id=${tableField.code}>
                               ${fieldName}`

              for (const o in tableField.options) {
                body += `<div class="kintoneplugin-input-checkbox">
                         <span class="kintoneplugin-input-checkbox-item">`

                if (tableField.defaultValue.indexOf(tableField.options[o].label) !== -1) {
                  body += `<input type="checkbox" name="${escapeHtml(tableField.code)}" value="${escapeHtml(tableField.options[o].label)}" id="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}" checked>
                                   <label for="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}">${escapeHtml(tableField.options[o].label)}</label>
                               </span>
                           </div>`
                } else {
                  body += `<input type="checkbox" name="${escapeHtml(tableField.code)}" value="${escapeHtml(tableField.options[o].label)}" id="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}">
                                  <label for="${escapeHtml(tableField.code)}-${escapeHtml(tableField.options[o].label)}">${escapeHtml(tableField.options[o].label)}</label>
                              </span>
                          </div>`
                }
              }
              body += `</div></div></td>`
              break;

            case 'MULTI_SELECT':
              body += `<td>
                        <div class="kintoneplugin-table-td-control">
                            <div class="kintoneplugin-table-td-control-value">
                                ${fieldName}
                                <div class="kintoneplugin-dropdown-list" id=${escapeHtml(tableField.code)}>`

              for (const o in tableField.options) {
                if (tableField.defaultValue.indexOf(tableField.options[o].label) !== -1) {
                  body += `<div class="kintoneplugin-dropdown-list-item kintoneplugin-dropdown-list-item-select" id=${escapeHtml(tableField.options[o].label)}>
                               <span class="kintoneplugin-dropdown-list-item-name">${escapeHtml(tableField.options[o].label)}</span>
                           </div>`
                } else {
                  body += `<div class="kintoneplugin-dropdown-list-item" id=${escapeHtml(tableField.options[o].label)}>
                                <span class="kintoneplugin-dropdown-list-item-name">${escapeHtml(tableField.options[o].label)}</span>
                            </div>`
                }
              }
              body += `</div></div></div></td>`
              break;

            case 'DATE':
              body += `<td>
                       <div class="kintoneplugin-table-td-control">
                           <div class="kintoneplugin-table-td-control-value">
                           ${fieldName}
                               <div class="kintoneplugin-input-outer">`

              if (tableField.defaultNowValue) {
                body += `<input type="date" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" value="${nowDateTime.toFormat('yyyy-MM-dd')}" />
                        </div></div></div></td>`
              } else if (tableField.defaultValue !== '') {
                body += `<input type="date" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}"  value="${tableField.defaultValue}"/>
                         </div></div></div></td>`
              } else {
                body += `<input type="date" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" />
                         </div></div></div></td>`
              }
              break;

            case 'TIME':
              body += `<td>
                       <div class="kintoneplugin-table-td-control">
                           <div class="kintoneplugin-table-td-control-value">
                           ${fieldName}
                               <div class="kintoneplugin-input-outer">`

              if (tableField.defaultNowValue) {
                body += `<input type="time" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" value="${nowDateTime.toFormat('HH:mm')}" />
                         </div></div></div></td>`
              } else if (tableField.defaultValue !== '') {
                body += `<input type="time" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}"  value="${tableField.defaultValue}" />
                         </div></div></div></td>`
              } else {
                body += `<input type="time" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" />
                          </div></div></div></td>`
              }
              break;

            case 'DATETIME':
              body += `<td>
                        <div class="kintoneplugin-table-td-control">
                            <div class="kintoneplugin-table-td-control-value">
                            ${fieldName}
                                <div class="kintoneplugin-input-outer">`

              if (tableField.defaultNowValue) {
                body += `<input type="datetime-local" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" value="${nowDateTime.toFormat('yyyy-MM-dd\'T\'HH:mm:ss')}" />
                         </div></div></div></td>`
              } else if (tableField.defaultValue) {
                body += `<input type="datetime-local" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}"  value="${tableField.defaultValue.replace('T', ' ')}:00" />
                         </div></div></div></td>`
              } else {
                body += `<input type="datetime-local" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" />
                        </div></div></div></td>`
              }
              break;

            case 'LINK':
              body += `<td>
                        <div class="kintoneplugin-table-td-control">
                            <div class="kintoneplugin-table-td-control-value">
                            ${fieldName}
                                <div class="kintoneplugin-input-outer">`
              if (prop.protocol === 'WEB') {
                body += `<input type="url" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" value="${tableField.defaultValue}" />
                         </div></div></div></td>`

              } else if (prop.protocol === 'TEL') {
                body += `<input type="tel" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" value="${tableField.defaultValue}" />
                         </div></div></div></td>`
              } else {
                body += `<input type="email" class="kintoneplugin-input-text" id="${escapeHtml(tableField.code)}" value="${tableField.defaultValue}" />
                         </div></div></div></td>`
              }
              break;

            case 'FILE':
              let label = 'ファイルを追加', style = ''
              if (navigator.userAgent.match(/iPhone|Android.+Mobile|ipad|macintosh/) || ("ontouchend" in document)) {
                label = '追加'
                style = 'style="min-width: 100px; margin: 3px"'
              }

              body += `<td>
                          <div class="kintoneplugin-table-td-control">
                              <div class="kintoneplugin-table-td-control-value">
                              ${fieldName}
                                  <div class="post_image" ${style}>
                                      <label>
                                          ${label}
                                          <input type="file" id="${escapeHtml(tableField.code)}" class="input-files" name="input-file" multiple="multiple">
                                      </label>
                                      <div id="file-names${escapeHtml(tableField.code)}" class="file-names">アップロードするファイル<br></div>
                                  </div>
                              </div>
                          </div>
                       </td>`
              uploadFiles[tableField.code] = {};

              break;

            case 'USER_SELECT':
            case 'ORGANIZATION_SELECT':
            case 'GROUP_SELECT':
              body += `<td>
                           <div class="kintoneplugin-table-td-control">
                               <div class="kintoneplugin-table-td-control-value">
                               ${fieldName}
                                   <div id=${escapeHtml(tableField.code)}></div>
                               </div>
                           </div>
                       </td>`
              break;

            default:
              body += `<td>
                           <div class="kintoneplugin-table-td-control">
                               <div class="kintoneplugin-table-td-control-value">
                               ${fieldName}
                                   <span id=${escapeHtml(tableField.code)}></span>
                               </div>
                           </div>
                       </td>`
              break;
          }
        }
        body += `<td class="kintoneplugin-table-td-operation">
                     <button type="button" class="kintoneplugin-button-add-row-image add-row" title="Add row"></button>
                     <button type="button" class="kintoneplugin-button-remove-row-image remove-row" title="Delete this row"></button>
                 </td></tr>`
        tbody.append(body);

        $(`#${key} tbody`).remove();
        $(`#${key}`).append(tbody);

        if (RecordProp.value.length === 0) {

          //登録されている行数が0行の時、1行目を作成
          const clone = $('#' + key + ' > tbody > tr').eq(0).clone(true);

          const tableRadio = clone.find('input[type="radio"]');
          for (let j = 0; j < tableRadio.length; j++) {
            tableRadio.eq(j).attr({ 'name': tableRadio.eq(j).prop('name') + '-1', 'id': tableRadio.eq(j).prop('id') + '-1' });
            tableRadio.eq(j).next('label').attr('for', tableRadio.eq(j).prop('id'));
          }

          const tableCheckBox = clone.find('input[type="checkbox"]');
          for (let j = 0; j < tableCheckBox.length; j++) {
            tableCheckBox.eq(j).attr({ 'name': tableCheckBox.eq(j).prop('name') + '-1', 'id': tableCheckBox.eq(j).prop('id') + '-1' });
            tableCheckBox.eq(j).next('label').attr('for', tableCheckBox.eq(j).prop('id'));
          }

          const tableFile = clone.find('input[type="file"]');
          for (let j = 0; j < tableFile.length; j++) {
            uploadFiles[tableFile[j].id]['1'] = [];
          }

          clone.insertAfter($('#' + key + ' > tbody > tr').eq(0))
          $('#' + key + '  > tbody > tr .remove-row').eq(1).hide()
        }

        for (let i = 0; i < RecordProp.value.length; i++) {
          const tableRow = RecordProp.value[i].value
          const clone = $('#' + key + '  > tbody > tr').eq(0).clone(true);

          const tableRadio = clone.find('input[type="radio"]');
          for (let j = 0; j < tableRadio.length; j++) {
            tableRadio.eq(j).attr({ 'name': tableRadio.eq(j).prop('name') + '-' + (i + 1), 'id': tableRadio.eq(j).prop('id') + '-' + (i + 1) });
            tableRadio.eq(j).next('label').attr('for', tableRadio.eq(j).prop('id'));
          }

          const tableCheckBox = clone.find('input[type="checkbox"]');
          for (let j = 0; j < tableCheckBox.length; j++) {
            tableCheckBox.eq(j).attr({ 'name': tableCheckBox.eq(j).prop('name') + '-' + (i + 1), 'id': tableCheckBox.eq(j).prop('id') + '-' + (i + 1) });
            tableCheckBox.eq(j).next('label').attr('for', tableCheckBox.eq(j).prop('id'));
          }

          clone.insertAfter($('#' + key + '  > tbody > tr').eq(i));
          $('#' + key + ' > tbody > tr').eq((i + 1)).attr('id', RecordProp.value[i].id)

          for (const f in tableRow) {
            const tableField = tableRow[f];

            switch (tableField.type) {
              case 'USER_SELECT':
              case 'ORGANIZATION_SELECT':
              case 'GROUP_SELECT':
                const names = tableField.value.map((code) => { return '<div>' + code.name + '</div>' }).join('')
                $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code}`).append(names);
                break;

              case 'RADIO_BUTTON':
                $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code} input[name^="${prop.fields[f].code}"]`).attr('checked', false);
                $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code} input[value="${tableField.value}"]`).prop('checked', true);
                break;

              case 'CHECK_BOX':
                for (let j = 0; j < tableField.value.length; j++) {
                  $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code} input[value="${tableField.value[j]}"]`).prop('checked', true);
                }
                break;

              case 'MULTI_SELECT':
                for (let j = 0; j < tableField.value.length; j++) {
                  $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code} #${tableField.value[j]}`).attr('class', 'kintoneplugin-dropdown-list-item kintoneplugin-dropdown-list-item-selected');
                }
                break;

              case 'NUMBER':
              case 'SINGLE_LINE_TEXT':
                if (prop.fields[f].lookup === undefined && (prop.fields[f].expression === '' || !prop.fields[f].expression)) {
                  $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code}`).val(tableField.value);
                } else {
                  $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code}`).text(tableField.value);
                }
                break;

              case 'DATETIME':
                const datetime = luxon.DateTime.fromISO(tableField.value).toFormat('yyyy-MM-dd\'T\'HH:mm:ss')
                $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code}`).val(datetime);
                break;

              case 'FILE':
                uploadFiles[prop.fields[f].code][String(i + 1)] = [];

                for (let j = 0; j < tableField.value.length; j++) {
                  uploadFiles[prop.fields[f].code][String(i + 1)].push({ fileKey: tableField.value[j].fileKey });

                  if (tableField.value[j].contentType.startsWith('image/')) {
                    $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code}`).parent().before(`<div class="file-values"><img class="field-value-image" src="${fileImageURLs[tableField.value[j].fileKey]}"><button class="delete-files" id="${tableField.value[j].fileKey}">×</button></div>`);
                  } else {
                    $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code}`).parent().before(`<div class="file-values"><div>${tableField.value[j].name}</div><button class="delete-files" id="${tableField.value[j].fileKey}">×</button></div>`);
                  }
                }
                break;

              default:
                $(`#${key} > tbody > tr:eq(${(i + 1)}) #${prop.fields[f].code}`).val(tableField.value);
                break;

            }
          }
        }
        if ($('#' + key + ' > tbody > tr').length === 2) {
          $('#' + key + ' > tbody > tr .remove-row').eq(1).hide()
        }
        break;

      default:
        break;
    }
  }
  return uploadFiles
}