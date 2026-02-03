
import { DateTime } from 'luxon'

export const createPopup = async (record: any, config: any, domain: string, field: any) => {
  //ポップアップを作成
  let popup = `<div style="font-weight: bold; font-size: larger; margin-bottom: 3px">${record[config.name].value}</div><div id="popup_body">`

  let popupTable = `<table id="popup_table">
                      <thead id="popup_table_header">
                          <tr>
                              <th>フィールド名</th>
                              <th>入力値</th>
                          </tr>
                      </thead>
                      <tbody id="popup_table_body">`

  for (let j = 1; j <= config.popup_row_num; j++) {
    let tbody = `<tr>`
    if (!config['popup_row' + j]) {
      continue;
    }
    if (!record[config['popup_row' + j].popupField]) {
      continue
    }

    switch (record[config['popup_row' + j].popupField].type) {
      case 'CREATOR': //作成者
      case 'MODIFIER': //更新者
        tbody += `<td>
                     <div class="field-name">
                         <span class="field-name">${field[config['popup_row' + j].popupField].label}</span>
                     </div>
                 </td>
                 <td>
                     <div class="field-value">
                         <span class="field-value">${record[config['popup_row' + j].popupField].value.name}</span>
                     </div>
                 </td>`
        break;

      case 'DATETIME': //日時
      case 'CREATED_TIME': //作成日時
      case 'UPDATED_TIME': //更新日時
        let datetime = '';
        if (record[config['popup_row' + j].popupField].value !== '') {
          datetime = DateTime.fromISO(record[config['popup_row' + j].popupField].value).toFormat('yyyy/MM/dd HH:mm');
        }

        tbody += `<td>
                      <div class="field-name">
                          <span class="field-name">${field[config['popup_row' + j].popupField].label}</span>
                      </div>
                  </td>
                  <td>
                      <div class="field-value">
                          <span class="field-value">${datetime}</span>
                      </div>
                  </td>`
        break;

      case 'MULTI_SELECT': //複数選択
      case 'CHECK_BOX': //チェックボックス
      case 'CATEGORY': //カテゴリー
        let multiValue = ''
        if (record[config['popup_row' + j].popupField].value.length >= 1) {
          multiValue = record[config['popup_row' + j].popupField].value.map((resp: string) => { return resp }).join(',')
        }

        tbody += `<td>
                      <div class="field-name">
                          <span class="field-name">${field[config['popup_row' + j].popupField].label}</span>
                      </div>
                  </td>
                  <td>
                      <div class="field-value">
                          <span class="field-value">${multiValue}</span>
                      </div>
                  </td>`
        break;

      case 'USER_SELECT': //ユーザー選択
      case 'ORGANIZATION_SELECT': //組織選択
      case 'GROUP_SELECT': //グループ選択
      case 'STATUS_ASSIGNEE': //作業者
        let usersValue = '';
        if (record[config['popup_row' + j].popupField].value.length >= 1) {
          usersValue = record[config['popup_row' + j].popupField].value.map((resp: { code: string, name: string }) => { return resp.name }).join(',');
        }

        tbody += `<td>
                      <div class="field-name">
                          <span class="field-name">${field[config['popup_row' + j].popupField].label}</span>
                      </div>
                  </td>
                  <td>
                      <div class="field-value">
                          <span class="field-value">${usersValue}</span>
                      </div>
                  </td>`
        break;

      case 'FILE': //添付ファイル
        tbody += `<td>
                        <div class="field-name">
                            <span class="field-name">${field[config['popup_row' + j].popupField].label}</span>
                        </div>
                    </td>
                    <td>`
        const files = record[config['popup_row' + j].popupField].value

        for (const f in files) {
          if (files[f].size >= 1048576 * 300) {
            //300MB以上の画像は表示時間を短縮するために名前のみ表示する
            tbody += `<div><span>${files[f].name}</span>`
          } else {

            // const blob = await fetchFileContent(domain, config.token, files[f].fileKey);
            const blobResp = await fetch('./kintone/getFile', {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: config.token, domain: domain, fileKey: files[f].fileKey })

            })
            const blob = await blobResp.json();
            console.log(blob)
            if (!blob.success) {
              //取得に失敗したとき、画像名のみ表示
              tbody += `<div><span>${files[f].name}</span>`
            } else {
              // Base64をBlobに変換してObject URLを作成
              const binaryString = atob(blob.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const fileBlob = new Blob([bytes], { type: blob.mimeType });
              const blobUrl = URL.createObjectURL(fileBlob);
              console.log(blobUrl)

              if (files[f].contentType.startsWith('image/') &&
                files[f].contentType !== 'image/tiff' && files[f].contentType !== 'image/x-emf' && files[f].contentType !== 'image/x-wmf' && files[f].contentType !== 'image/svg') {

                tbody += `<div class="popup-images">
                            <img class="field-value" src="${blobUrl}" title="${files[f].name}"/>
                          </div> `

              } else {
                tbody += `<div><a href="${blobUrl}" target="_blank">${files[f].name}</a></div>`
              }
            }
          }
        }

        tbody += `</td>`
        break;

      default:
        let value = '';

        if (record[config['popup_row' + j].popupField].value !== null) {
          value = record[config['popup_row' + j].popupField].value
        }
        tbody += `<td>
                      <div class="field-name">
                          <span class="field-name">${field[config['popup_row' + j].popupField].label}</span>
                      </div>
                  </td>
                  <td>
                      <div class="field-value">
                          <span class="field-value">${value}</span>
                      </div>
                  </td>`
        break;
    }
    tbody += `</tr>`
    popupTable += tbody;
  }
  popupTable += `</tbody></table>`
  popup += `${popupTable}</div>`

  return popup;
}