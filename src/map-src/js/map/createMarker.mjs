/**
 * マーカーなどを作成する
 * @author 髙井
 */
/**
 * 修正日：2025/10/31
 * 修正内容
 *  DB内にレコードのデータを入れる
 *  画像表示モーダルを作成する
 */

import { escapeHtml } from '../escapeHtml.mjs'
import { uploadFile } from '../kintoneAPI.mjs'

let updateFiles = {};

function createFieldsBlock(body, layoutField, field, config, type, code) {
    let num = 0;

    if (type !== 'SUBTABLE') {
        const prop = field.properties[layoutField.code];
        if (!prop) {
            return;
        } else if (prop.type === 'REFERENCE_TABLE') {
            return;
        }
        const label = $('<label>');
        const required = $('<span>').attr('class', 'field-required');

        if (!prop.noLabel) {
            label.text(prop.label);
        }

        if (prop.required) {
            required.text('*')
        }

        const block = $('<div>').css({ 'min-width': layoutField.size.width + 'px', 'margin-right': '15px' });

        block.append(label)
        block.append(required)
        switch (layoutField.type) {
            case 'SINGLE_LINE_TEXT':
                if (prop.lookup === undefined && prop.expression === '') {
                    const textOuter = $('<div>').attr('class', 'kintoneplugin-input-outer');
                    const textArea = $('<input>').attr({ 'type': 'text', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code), 'value': escapeHtml(prop.defaultValue) });

                    body.append(block);
                    block.append(textOuter)
                    textOuter.append(textArea);
                }
                break;

            case 'NUMBER':
                if (prop.lookup === undefined && !prop.expression) {
                    if (layoutField.code === config.latitude || layoutField.code === config.longitude) {
                        break;
                    }
                    const numberOuter = $('<div>').attr('class', 'kintoneplugin-input-outer');
                    const numberArea = $('<input>').attr({ 'type': 'number', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code), 'value': escapeHtml(prop.defaultValue) });

                    body.append(block);
                    block.append(numberOuter)
                    numberOuter.append(numberArea);
                }
                break;

            case 'MULTI_LINE_TEXT':
                const multiTextArea = $('<textarea>').attr({ 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code) }).text(escapeHtml(prop.defaultValue));
                block.css('min-height', layoutField.size.innerHeight + 'px');

                body.append(block);
                block.append(multiTextArea);
                break;

            case 'CHECK_BOX':
                const checkboxArea = $('<div>');

                for (const o in prop.options) {
                    const inputCheckbox = $('<div>').attr('class', 'kintoneplugin-input-checkbox');
                    const inputCheckboxItem = $('<div>').attr('class', 'kintoneplugin-input-checkbox-item');
                    const checkbox = $('<input>').attr({ 'type': 'checkbox', 'name': escapeHtml(layoutField.code), 'value': escapeHtml(prop.options[o].label), 'id': `${escapeHtml(layoutField.code)}-${escapeHtml(prop.options[o].label)}` });
                    const checkboxLabel = $('<label>').attr('for', `${escapeHtml(layoutField.code)}-${escapeHtml(prop.options[o].label)}`).text(escapeHtml(prop.options[o].label))
                    if (prop.defaultValue.indexOf(prop.options[o].label) !== -1) {
                        checkbox.attr('checked', true);
                    }

                    checkboxArea.append(inputCheckbox);
                    inputCheckbox.append(inputCheckboxItem);
                    inputCheckboxItem.append(checkbox)
                    inputCheckboxItem.append(checkboxLabel);
                }

                if (prop.align === 'HORIZONTAL') {
                    checkboxArea.css('display', 'flex');
                }

                block.append(checkboxArea);
                body.append(block);
                break;

            case 'DROP_DOWN':

                const dropbownDiv = $('<div>');
                const dropbown = $('<select>').attr({ 'id': escapeHtml(layoutField.code) }).append('<option value="">-----</option>');
                dropbownDiv.append(dropbown)

                for (const o in prop.options) {
                    const option = $('<option>').text(escapeHtml(prop.options[o].label)).attr('value', escapeHtml(prop.options[o].label));
                    if (prop.defaultValue === prop.options[o].label) {
                        option.attr('selected', true);
                    }
                    dropbown.append(option);
                }

                body.append(block);
                block.append(dropbownDiv);
                break;

            case 'RADIO_BUTTON':
                const radioButtonArea = $('<div>');

                const inputRadio = $('<div>').attr('class', 'kintoneplugin-input-radio')
                const inputRadioItem = $('<span>').attr('class', 'kintoneplugin-input-radio-item')
                for (const o in prop.options) {
                    const radioButton = $('<input>').attr({ 'type': 'radio', 'name': escapeHtml(layoutField.code), 'value': escapeHtml(prop.options[o].label), 'id': `${escapeHtml(layoutField.code)}-${escapeHtml(prop.options[o].label)}` });
                    const radioButtonLavel = $('<label>').attr('for', `${escapeHtml(layoutField.code)}-${escapeHtml(prop.options[o].label)}`).text(escapeHtml(prop.options[o].label));
                    if (prop.defaultValue === prop.options[o].label) {
                        radioButton.attr('checked', true);
                    } else if (num === 0) {
                        radioButton.attr('checked', true);
                    }

                    inputRadioItem.append(radioButton)
                    inputRadioItem.append(radioButtonLavel)
                }

                if (prop.align === 'HORIZONTAL') {
                    radioButtonArea.css('display', 'flex')
                }

                body.append(block);
                block.append(radioButtonArea);
                radioButtonArea.append(inputRadio);
                inputRadio.append(inputRadioItem);
                break;

            case 'MULTI_SELECT':
                const dropdownList = $('<div>').attr({ 'class': 'kintoneplugin-dropdown-list', 'id': layoutField.code });
                for (const o in prop.options) {
                    const dropdownListItem = $('<div>').attr('class', 'kintoneplugin-dropdown-list-item');
                    const dropdownListItemName = $('<span>').text(escapeHtml(prop.options[o].label)).attr('class', 'kintoneplugin-dropdown-list-item-name');

                    if (prop.defaultValue.indexOf(prop.options[o].label) !== -1) {
                        dropdownListItem.attr('class', 'kintoneplugin-dropdown-list-item kintoneplugin-dropdown-list-item-selected');
                    }

                    dropdownList.append(dropdownListItem);
                    dropdownListItem.append(dropdownListItemName)
                }

                body.append(block);
                block.append(dropdownList)
                break;

            case 'DATE':
                const dateOuter = $('<div>').attr('class', 'kintoneplugin-input-outer');
                const dateArea = $('<input>').attr({ 'type': 'date', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code) });

                if (prop.defaultValue !== '') {
                    dateArea.attr('value', prop.defaultValue);
                } else if (prop.defaultNowValue) {
                    dateArea.attr('value', luxon.DateTime.now().toFormat('yyyy-MM-dd'));
                }

                body.append(block);
                block.append(dateOuter)
                dateOuter.append(dateArea);
                break;

            case 'TIME':
                const timeOuter = $('<div>').attr('class', 'kintoneplugin-input-outer');
                const timeArea = $('<input>').attr({ 'type': 'time', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code) });

                if (prop.defaultValue !== '') {
                    timeArea.attr('value', prop.defaultValue);
                } else if (prop.defaultNowValue) {
                    timeArea.attr('value', luxon.DateTime.now().toFormat('HH:mm'));
                }

                body.append(block);
                block.append(timeOuter);
                timeOuter.append(timeArea);
                break;


            case 'DATETIME':
                const datetimeOuter = $('<div>').attr('class', 'kintoneplugin-input-outer');
                const datetimeArea = $('<input>').attr({ 'type': 'datetime-local', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code) });

                if (prop.defaultValue !== '') {
                    datetimeArea.attr('value', prop.defaultValue);
                } else if (prop.defaultNowValue) {
                    datetimeArea.attr('value', luxon.DateTime.now().toFormat('yyyy-MM-dd\'T\'HH:mm'));
                }

                body.append(block);
                block.append(datetimeOuter);
                datetimeOuter.append(datetimeArea);
                break;

            case 'LINK':
                const linkOuter = $('<div>').attr('class', 'kintoneplugin-input-outer');
                const linkArea = $('<input>').attr({ 'id': escapeHtml(layoutField.code), 'class': 'kintoneplugin-input-text' });

                if (prop.protocol === 'WEB') {
                    linkArea.attr({ 'input': 'url', 'value': prop.defaultValue })
                } else if (prop.protocol === 'CALL') {
                    linkArea.attr({ 'input': 'tell', 'value': prop.defaultValue })
                } else {
                    linkArea.attr({ 'input': 'email', 'value': prop.defaultValue })
                }

                body.append(block);
                block.append(linkOuter);
                linkOuter.append(linkArea);
                break;

            case 'FILE':
                const postDropboxImage = $('<div>').attr('class', 'post_image');

                const inputMessage = $('<label>').text('ファイルを追加');
                if (navigator.userAgent.match(/iPhone|Android.+Mobile|ipad|macintosh/) || ("ontouchend" in document)) {
                    inputMessage.text('追加')
                }

                const inputDropbocFile = $('<input>').attr({ 'id': escapeHtml(layoutField.code), 'class': 'input-files', 'type': 'file', 'name': 'input-file', 'multiple': 'muliple' });

                const showInputFileName = $('<div>').attr({ 'id': 'file-names' + escapeHtml(layoutField.code), 'class': 'file-names' }).html('アップロードするファイル<br>');

                body.append(block);
                block.append(postDropboxImage);
                postDropboxImage.append(inputMessage);
                inputMessage.append(inputDropbocFile);
                postDropboxImage.append(showInputFileName);

                updateFiles[layoutField.code] = []
                break;
        }
    } else {
        const prop = field.properties[code].fields[layoutField.code];

        switch (layoutField.type) {
            case 'SINGLE_LINE_TEXT':
                if (prop.lookup === undefined && prop.expression === '') {
                    const textArea = $('<input>').attr({ 'type': 'text', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code), 'value': escapeHtml(prop.defaultValue) });

                    body.append(textArea);
                }
                break;

            case 'NUMBER':
                if (prop.lookup === undefined && !prop.expression) {
                    const numberArea = $('<input>').attr({ 'type': 'number', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code), 'value': escapeHtml(prop.defaultValue) });

                    body.append(numberArea);
                }
                break;

            case 'MULTI_LINE_TEXT':
                const multiTextArea = $('<textarea>').attr({ 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code) }).text(escapeHtml(prop.defaultValue));
                body.css('min-height', layoutField.size.innerHeight + 'px');

                body.append(multiTextArea);
                break;

            case 'CHECK_BOX':
                const checkboxArea = $('<div>');

                for (const o in prop.options) {
                    const inputCheckbox = $('<div>').attr('class', 'kintoneplugin-input-checkbox');
                    const inputCheckboxItem = $('<div>').attr('class', 'kintoneplugin-input-checkbox-item table-check');
                    const checkbox = $('<input>').attr({ 'type': 'checkbox', 'name': escapeHtml(layoutField.code), 'value': escapeHtml(prop.options[o].label), 'id': `${escapeHtml(layoutField.code)}-${escapeHtml(prop.options[o].label)}` });
                    const checkboxLabel = $('<label>').attr('for', `${escapeHtml(layoutField.code)}-${escapeHtml(prop.options[o].label)}`).text(escapeHtml(prop.options[o].label))
                    if (prop.defaultValue.indexOf(prop.options[o].label) !== -1) {
                        checkbox.attr('checked', true);
                    }

                    checkboxArea.append(inputCheckbox);
                    inputCheckbox.append(inputCheckboxItem);
                    inputCheckboxItem.append(checkbox)
                    inputCheckboxItem.append(checkboxLabel);
                }

                if (prop.align === 'HORIZONTAL') {
                    checkboxArea.css('display', 'flex');
                }

                body.append(checkboxArea);
                break;

            case 'DROP_DOWN':
                const dropbown = $('<select>').attr({ 'id': escapeHtml(layoutField.code) }).append('<option value="">-----</option>');

                for (const o in prop.options) {
                    const option = $('<option>').text(escapeHtml(prop.options[o].label)).attr('value', escapeHtml(prop.options[o].label));
                    if (prop.defaultValue === prop.options[o].label) {
                        option.attr('selected', true);
                    }
                    dropbown.append(option);
                }

                body.append(dropbown);
                break;

            case 'RADIO_BUTTON':
                const radioButtonArea = $('<div>');

                const inputRadio = $('<div>').attr('class', 'kintoneplugin-input-radio')
                const inputRadioItem = $('<span>').attr('class', 'kintoneplugin-input-radio-item table-radio')
                for (const o in prop.options) {
                    const radioButton = $('<input>').attr({ 'type': 'radio', 'name': escapeHtml(layoutField.code), 'value': escapeHtml(prop.options[o].label), 'id': `${escapeHtml(layoutField.code)}-${escapeHtml(prop.options[o].label)}` });
                    const radioButtonLavel = $('<label>').attr('for', `${escapeHtml(layoutField.code)}-${escapeHtml(prop.options[o].label)}`).text(escapeHtml(prop.options[o].label));
                    if (prop.defaultValue === prop.options[o].label) {
                        radioButton.attr('checked', true);
                    } else if (num === 0) {
                        radioButton.attr('checked', true);
                    }

                    inputRadioItem.append(radioButton)
                    inputRadioItem.append(radioButtonLavel)
                }

                if (prop.align === 'HORIZONTAL') {
                    radioButtonArea.css('display', 'flex')
                }
                body.append(radioButtonArea);
                radioButtonArea.append(inputRadio);
                inputRadio.append(inputRadioItem);
                break;

            case 'MULTI_SELECT':
                const dropdownList = $('<div>').attr({ 'class': 'kintoneplugin-dropdown-list', 'id': layoutField.code });
                for (const o in prop.options) {
                    const dropdownListItem = $('<div>').attr('class', 'kintoneplugin-dropdown-list-item');
                    const dropdownListItemName = $('<span>').text(escapeHtml(prop.options[o].label)).attr('class', 'kintoneplugin-dropdown-list-item-name');

                    if (prop.defaultValue.indexOf(prop.options[o].label) !== -1) {
                        dropdownListItem.attr('class', 'kintoneplugin-dropdown-list-item kintoneplugin-dropdown-list-item-selected');
                    }

                    dropdownList.append(dropdownListItem);
                    dropdownListItem.append(dropdownListItemName)
                }

                body.append(dropdownList);
                break;

            case 'DATE':
                const dateArea = $('<input>').attr({ 'type': 'date', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code) });

                if (prop.defaultValue !== '') {
                    dateArea.attr('value', prop.defaultValue);
                } else if (prop.defaultNowValue) {
                    dateArea.attr('value', luxon.DateTime.now().toFormat('yyyy-MM-dd'));
                }

                body.append(dateArea);
                break;

            case 'TIME':
                const timeArea = $('<input>').attr({ 'type': 'time', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code) });

                if (prop.defaultValue !== '') {
                    timeArea.attr('value', prop.defaultValue);
                } else if (prop.defaultNowValue) {
                    timeArea.attr('value', luxon.DateTime.now().toFormat('HH:mm'));
                }

                body.append(timeArea);
                break;


            case 'DATETIME':
                const datetimeArea = $('<input>').attr({ 'type': 'datetime-local', 'class': 'kintoneplugin-input-text', 'id': escapeHtml(layoutField.code) });

                if (prop.defaultValue !== '') {
                    datetimeArea.attr('value', prop.defaultValue);
                } else if (prop.defaultNowValue) {
                    datetimeArea.attr('value', luxon.DateTime.now().toFormat('yyyy-MM-dd\'T\'HH:mm'));
                }

                body.append(datetimeArea);
                break;

            case 'LINK':
                const linkArea = $('<input>').attr({ 'id': escapeHtml(layoutField.code), 'class': 'kintoneplugin-input-text' });

                if (prop.protocol === 'WEB') {
                    linkArea.attr({ 'input': 'url', 'value': prop.defaultValue })
                } else if (prop.protocol === 'CALL') {
                    linkArea.attr({ 'input': 'tell', 'value': prop.defaultValue })
                } else {
                    linkArea.attr({ 'input': 'email', 'value': prop.defaultValue })
                }

                body.append(linkArea);
                break;

            case 'FILE':
                const postDropboxImage = $('<div>').attr('class', 'post_image');

                const inputMessage = $('<label>').text('ファイルを追加');
                if (navigator.userAgent.match(/iPhone|Android.+Mobile|ipad|macintosh/) || ("ontouchend" in document)) {
                    postDropboxImage.css({ 'min-width': '100px', 'margin': '3px' })
                    inputMessage.text('追加')
                }
                const inputDropbocFile = $('<input>').attr({ 'id': escapeHtml(layoutField.code), 'class': 'input-files', 'type': 'file', 'name': 'input-file', 'multiple': 'muliple' });

                const showInputFileName = $('<div>').attr({ 'id': 'file-names' + escapeHtml(layoutField.code), 'class': 'file-names' }).html('アップロードするファイル<br>');

                body.append(postDropboxImage);
                postDropboxImage.append(inputMessage);
                inputMessage.append(inputDropbocFile);
                postDropboxImage.append(showInputFileName);
                updateFiles[layoutField.code] = {}

                break;
        }

    }
}


/**
 * マーカーを作成するモーダルを表示
 * @param {object} field kintoneのフィールド
 * @param {object} config 設定
 * @param {string} domain ドメイン
 */
export async function createRecordModal(field, config, domain) {
    try {
        updateFiles = {};
        //kintoneのアプリのレイアウトを取得して反映させたい
        // const kintoneLayout = await getLyout(config.appId, config.token, domain);
        const kintoneLayoutResp = await fetch('../kintone/getLayout', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ app: config.appId, token: config.token, domain: domain })
        })

        const kintoneLayout = await kintoneLayoutResp.json();

        //モーダルを作成、ドロップボックスに保存するためのブロックも作成
        const modal = `<div id="glay_out" style="display: none;">
                            <div id="modal">
                                <div id="modal_header">
                                    <span id="modal_title">ピンの情報入力画面</span>
                                    <div id="buttons">
                                        <button class="kintoneplugin-button-dialog-cancel" id="cancel">キャンセル</button>
                                        <button class="kintoneplugin-button-dialog-ok" id="save">保存</button>
                                    </div>
                                </div>
                                <div id="modal_body">
                                    <div id="kintone_create_record">
                                    </div>
                                </div>
                            <div>
                        </div>`
        // <div class="block" style="display: block">
        //     <div class="field-name">写真を保存</div>
        //     <input type="file" id="inDropbox" multiple />
        // </div>
        $('body').append(modal);

        // if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
        //     $('#modal').css({ 'min-width': 'auto', 'height': '80%', 'padding': '10px' })
        //     for(let i = 0; i < kintoneLayout.layout.length; i++){
        //         switch(kintoneLayout.layout[i].type){
        //             case 'ROW':
        //                 for(let j = 0; j < kintoneLayout.layout[i].fields.length; j++){
        //                     const body = $('<div>').attr()
        //                 }
        //         }
        //     }
        // } else {
        //モーダルを追加
        for (let i = 0; i < kintoneLayout.layout.length; i++) {
            const block = $('<div>').attr('class', 'block');

            switch (kintoneLayout.layout[i].type) {
                case 'ROW':
                    for (let j = 0; j < kintoneLayout.layout[i].fields.length; j++) {
                        const layoutField = kintoneLayout.layout[i].fields[j];
                        createFieldsBlock(block, layoutField, field, config)
                    }
                    break;

                case 'GROUP':
                    const groupName = $('<summary>');

                    if (!field.properties[kintoneLayout.layout[i].code].noLabel) {
                        groupName.text(escapeHtml(field.properties[kintoneLayout.layout[i].code].label))
                    }

                    const group = $('<details>');
                    group.attr({ 'id': kintoneLayout.layout[i].code, 'class': 'group' });
                    if (field.properties[kintoneLayout.layout[i].code].openGroup) {
                        group.attr('open', true);
                    } else {
                        group.attr('open', false);
                    }

                    group.append(groupName);

                    for (let j = 0; j < kintoneLayout.layout[i].layout.length; j++) {
                        const groupfield = kintoneLayout.layout[i].layout[j]
                        const groupLayout = $('<div>');
                        groupLayout.attr('class', 'group-layout');

                        for (let k = 0; k < groupfield.fields.length; k++) {
                            const layoutField = groupfield.fields[k];
                            createFieldsBlock(groupLayout, layoutField, field, config)
                        }

                        group.append(groupLayout);
                    }

                    block.append(group)
                    break;

                case 'SUBTABLE':
                    const tableDiv = $('<div>');
                    tableDiv.attr('class', 'table-div');
                    block.append(tableDiv);

                    const tableLabel = $('<label>').attr('class', 'table-label');
                    if (!field.properties[kintoneLayout.layout[i].code].noLabel) {
                        tableLabel.text(escapeHtml(field.properties[kintoneLayout.layout[i].code].label))
                    }

                    const table = $('<table>');
                    table.attr({ 'class': 'kintoneplugin-table', id: kintoneLayout.layout[i].code });
                    tableDiv.append(table);

                    const thead = $('<thead>');
                    const theadTr = $('<tr>');

                    thead.append(theadTr);
                    table.append(thead)

                    const tbody = $('<tbody>').attr('id', 'create_record_table_body');
                    table.append(tbody);

                    const tbodyTr = $('<tr>');
                    for (let k = 0; k < kintoneLayout.layout[i].fields.length; k++) {
                        const layoutField = kintoneLayout.layout[i].fields[k]

                        if (layoutField.type === 'CALC' || layoutField.type === 'USER_SELECT' || layoutField.type === 'ORGANIZATION_SELECT' || layoutField.type === 'GROUP_SELECT' || layoutField.type === 'RICH_TEXT') {
                            continue;
                        } else if (field.properties[kintoneLayout.layout[i].code].fields[layoutField.code].lookup !== undefined || (field.properties[kintoneLayout.layout[i].code].fields[layoutField.code].expression !== '' && field.properties[kintoneLayout.layout[i].code].fields[layoutField.code].expression)) {
                            continue;
                        }

                        const theadTh = $('<th>');
                        theadTh.attr({ 'class': 'kintoneplugin-table-th', 'id': escapeHtml(layoutField.code) });

                        const tableRowName = $('<span>');
                        tableRowName.attr('class', 'title').text(escapeHtml(field.properties[kintoneLayout.layout[i].code].fields[layoutField.code].label));

                        theadTh.append(tableRowName.clone());
                        theadTr.append(theadTh);

                        const tbodyTd = $('<td>').css('min-width', layoutField.size.width);

                        // if (navigator.userAgent.match(/iPhone|Android.+Mobile|ipad|macintosh/)) {
                        //     // tbodyTd.append(tableRowName.clone());
                        // } else if ("ontouchend" in document) {
                        //     // tbodyTd.append(tableRowName.clone());
                        // }

                        createFieldsBlock(tbodyTd, layoutField, field, config, kintoneLayout.layout[i].type, kintoneLayout.layout[i].code);
                        tbodyTr.append(tbodyTd);
                    }
                    const buttonTh = $('<th>').attr('class', 'kintoneplugin-table-th-blankspace');
                    thead.append(buttonTh);

                    const buttonTd = $('<td>').attr('class', 'kintoneplugin-table-td-operation');
                    const addButton = $('<button>').attr({ 'type': 'button', 'class': 'kintoneplugin-button-add-row-image add-modal-table', 'title': '行を増やす' })
                    const removeButton = $('<button>').attr({ 'type': 'button', 'class': 'kintoneplugin-button-remove-row-image remove-modal-table', 'title': '行を減らす' });
                    buttonTd.append(addButton)
                    buttonTd.append(removeButton);
                    tbodyTr.append(buttonTd);

                    tbody.append(tbodyTr);
                    break;
            }
            $('#kintone_create_record').append(block)
        }
        // }

        for (let i = 0; i < $('#modal .kintoneplugin-table').length; i++) {
            const table = $('#modal .kintoneplugin-table').eq(i).prop('id')
            //モーダル内の各テーブルの1行目を作成
            const clone = $('#modal .kintoneplugin-table:eq(' + i + ') #create_record_table_body > tr').eq(0).clone(true)
            const tableRadio = clone.find('input[type="radio"]'); //ラジオボタンがあるとき
            const tableCheckBox = clone.find('input[type="checkbox"]') //チェックボックスがあるとき
            for (let j = 0; j < tableRadio.length; j++) {
                //各ラジオボタンのname、idとそのラベルのforを変更
                tableRadio.eq(j).attr({ 'name': tableRadio.eq(j).prop('name') + '-1', 'id': tableRadio.eq(j).prop('id') + '-1' });
                tableRadio.eq(j).next('label').attr('for', tableRadio.eq(j).prop('id'));
            }
            for (let j = 0; j < tableCheckBox.length; j++) {
                //各チェックボックスのname、idとそのラベルのforを変更
                tableCheckBox.eq(j).attr({ 'name': tableCheckBox.eq(j).prop('name') + '-1', 'id': tableCheckBox.eq(j).prop('id') + '-1' });
                tableCheckBox.eq(j).next('label').attr('for', tableCheckBox.eq(j).prop('id'));
            }
            clone.insertAfter($('#modal table:eq(' + i + ') #create_record_table_body > tr').eq(0))
            $('#modal table:eq(' + i + ') #create_record_table_body > tr .remove-modal-table').eq(1).hide()

            for (const key in updateFiles) {
                if ($(`#${table} tbody tr:eq(0) #${key}`).length !== 0) {
                    updateFiles[key]['1'] = []
                    break;
                }
            }

        }

        //モーダルを表示
        $('#glay_out').css('display', 'block');

        //テーブルを増やすボタンがクリックされたとき
        $('.add-modal-table').click((e) => {
            //どのテーブルかの判定を行う
            const table = e.target.parentNode.parentNode.parentNode.parentNode.id;
            const tr = document.querySelectorAll(`#${table} #create_record_table_body > tr`)
            const clone = $(`#${table} #create_record_table_body > tr`).eq(0).clone(true)
            let addTableNum = 0;

            let radio = false;
            let check = false;
            if (clone.find('.table-radio').length !== 0) {
                //テーブル内にラジオボタンがあるとき
                radio = true;
            }
            if (clone.find('.table-check').length !== 0) {
                //テーブル内にちぇくボックスがあるとき
                check = true;
            }
            //テーブル内のtrの数ループ
            for (let i = 0; i <= tr.length; i++) {
                if (radio) {
                    //ラジオボタンがテーブル内にあるとき
                    for (let r = 0; r < clone.find('.table-radio').length; r++) {
                        //ラジオボタンの数ループ
                        const radioName = clone.find('.table-radio:eq(' + r + ') input').eq(0).prop('name');
                        if ($(`#${table} input[name="${radioName}-${(i + 1)}"]`).length === 0) {
                            //radioName-(i+1)というname属性がないとき、新しいname属性を付与
                            for (let j = 0; j < clone.find('.table-radio:eq(' + r + ') input').length; j++) {
                                const tableRadio = clone.find('.table-radio:eq(' + r + ') input').eq(j)
                                tableRadio.attr({ 'name': tableRadio.prop('name') + '-' + (i + 1), 'id': tableRadio.prop('id') + '-' + (i + 1) })
                                tableRadio.next('label').attr('for', tableRadio.prop('id'))
                            }
                            radio = false;
                        }
                    }
                }
                if (check) {
                    //ラジオボタンがテーブル内にあるとき
                    for (let r = 0; r < clone.find('.table-check').length; r++) {
                        //ラジオボタンの数ループ
                        const radioName = clone.find('.table-check:eq(' + r + ') input').eq(0).prop('name');
                        if ($(`#${table} input[name="${radioName}-${(i + 1)}"]`).length === 0) {
                            //radioName-(i+1)というname属性がないとき、新しいname属性を付与
                            for (let j = 0; j < clone.find('.table-check:eq(' + r + ') input').length; j++) {
                                const tableRadio = clone.find('.table-check:eq(' + r + ') input').eq(j)
                                tableRadio.attr({ 'name': tableRadio.prop('name') + '-' + (i + 1), 'id': tableRadio.prop('id') + '-' + (i + 1) })
                                tableRadio.next('label').attr('for', tableRadio.prop('id'))

                            }
                            check = false;
                        }
                    }
                }
                if (e.target.parentNode.parentNode === tr[i]) {
                    addTableNum = i
                }
            }

            clone.insertAfter($(`#${table} #create_record_table_body > tr`).eq(addTableNum));
            $(`#${table} #create_record_table_body > tr .remove-modal-table`).eq(1).show()

            for (const key in updateFiles) {
                const addTableFile = { [key]: { [String(addTableNum + 1)]: [] } };
                // const addTableFile = { [key]: {} };
                if ($(`#${table} tbody tr:eq(0) #${key}`).length !== 0) {
                    for (let i = addTableNum + 2; i < $(`#${table} tbody tr`).length; i++) {
                        addTableFile[key][String(i)] = updateFiles[key][String(i - 1)] ? updateFiles[key][String(i - 1)] : []
                    }

                    for (const i in addTableFile[key]) {
                        updateFiles[key][i] = addTableFile[key][i]
                    }

                    break;
                }
            }
        })

        //行を減らすボタンが押されたとき
        $('.remove-modal-table').click((e) => {
            const table = e.target.parentNode.parentNode.parentNode.parentNode.id;
            const tr = document.querySelectorAll(`#${table} #create_record_table_body > tr`)
            let removeRow = 0
            for (let i = 0; i < tr.length; i++) {
                if (e.target.parentNode.parentNode === tr[i]) {
                    removeRow = i
                    $(`#${table} #create_record_table_body > tr`).eq(i).remove();
                    break;
                }
            }

            for (const key in updateFiles) {
                if ($(`#${table} tbody tr:eq(0) #${key}`).length !== 0) {
                    for (let i = removeRow; i < $(`#${table} tbody tr`).length; i++) {
                        updateFiles[key][String(i)] = updateFiles[key][String(i + 1)] ? updateFiles[key][String(i + 1)] : []
                    }
                    const last = Object.keys(updateFiles[key]).pop();
                    delete updateFiles[key][last]
                    break;
                }
            }

            if ($(`#${table} #create_record_table_body > tr`).length === 2) {
                //テーブルの行が2行以下なら行を削除するボタンを非表示にする
                $(`#${table} #create_record_table_body > tr .remove-modal-table`).eq(1).hide()
            }
        })

        //複数選択の選択肢がクリックされたとき
        $('.kintoneplugin-dropdown-list-item').off('click').click((e) => {
            if (e.delegateTarget.className.indexOf('kintoneplugin-dropdown-list-item-selected') !== -1) {
                e.delegateTarget.className = 'kintoneplugin-dropdown-list-item';
            } else {
                e.delegateTarget.className = 'kintoneplugin-dropdown-list-item kintoneplugin-dropdown-list-item-selected';
            }
        })


        $('.post_image input').change((e) => {
            const id = e.target.id

            if (e.target.parentNode.parentNode.parentNode.tagName !== 'TD') {

                for (let i = 0; i < e.target.files.length; i++) {
                    if (e.target.files[i].size >= 1048576 * 20) {
                        alert(`${e.target.files[i].name}は20MB以上のためアップロードできません。`);

                    } else {
                        const fileName = $('<div>').text(e.target.files[i].name).append($('<button>').attr('class', 'upload-cansel-button').text('×'));
                        $('.post_image #' + id).parent().next().append(fileName);
                        updateFiles[id].push(e.target.files[i]);
                    }
                }
            } else {
                table: for (let i = 0; i < $('#modal table').length; i++) {
                    if ($(`#modal table:eq(${i}) #${id}`).length !== 0) {
                        const table = $(`#modal table:eq(${i})`).prop('id')
                        for (let j = 1; j < document.querySelectorAll(`#${table} tbody tr`).length; j++) {
                            if (e.target.parentNode.parentNode.parentNode.parentNode === document.querySelectorAll(`#${table} tbody tr`)[j]) {

                                for (let k = 0; k < e.target.files.length; k++) {
                                    if (e.target.files[k].size >= 1048576 * 20) {
                                        alert(`${e.target.files[k].name}は20MB以上のためアップロードできません。`);

                                    } else {
                                        const fileName = $('<div>').text(e.target.files[k].name).append($('<button>').attr('class', 'upload-cansel-button').text('×'));
                                        $(`#${table} tbody tr:eq(${j}) .post_image #${id}`).parent().next().append(fileName);
                                        updateFiles[id][String(j)].push(e.target.files[k])

                                    }
                                }

                                break table;
                            }
                        }
                    }
                }
            }
        })

        $('body').off('click').click((e) => {
            if (e.originalEvent) {
                const click = e.originalEvent.target
                if (click.className === 'upload-cansel-button') {
                    const id = click.parentNode.parentNode.id.replace('file-names', '');

                    if (click.parentNode.parentNode.parentNode.parentNode.tagName !== 'TD') {
                        for (let i = 0; i < updateFiles[id].length; i++) {
                            if (updateFiles[id][i].name === click.parentNode.innerText.replace(/×$/, '')) {
                                updateFiles[id].splice(i, 1)
                                break;
                            }
                        }
                        click.parentNode.remove();
                    } else {
                        table: for (let i = 0; i < $('#modal table').length; i++) {
                            if ($(`#modal table:eq(${i}) #${id}`).length !== 0) {
                                const table = $(`#modal table:eq(${i})`).prop('id')
                                for (let j = 1; j < document.querySelectorAll(`#${table} tbody tr`).length; j++) {
                                    if (click.parentNode.parentNode.parentNode.parentNode.parentNode === document.querySelectorAll(`#${table} tbody tr`)[j]) {

                                        for (let k = 0; k < updateFiles[id][String(j)].length; k++) {
                                            if (updateFiles[id][String(j)][k].name === click.parentNode.innerText.replace(/×$/, '')) {
                                                updateFiles[id][String(j)].splice(k, 1)
                                                break;
                                            }
                                        }
                                        click.parentNode.remove();

                                        break table;
                                    }
                                }
                            }
                        }
                    }
                } else if (click.id === 'glay_out') {
                    $('#glay_out').remove();
                    updateFiles = {};
                }
            }
        })
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

/**
 * マップにマーカーを作成する
 * @param {object} latlng 緯度と経度
 * @param {object} markers すでにあるマーカー
 * @param {object} config 設定
 * @param {object} field kintoneのフィールド
 * @param {object} records kintoneのレコード
 * @param {string} domain ドメイン
 * @param {boolean} login ログインしているかの判定
 * @param {object} map マップを表示している場所
 * @param {string} mapConfigName 変形させたトークン
 * @param {string} domainText 変形させたドメイン
 * @param {string} folderName フォルダパスの名前
 * @param {string} accessToken Dropboxのアクセストークン
 * @returns
 */
export async function createMarker(latlng, markers, config, field, records, domain, login, map, domainText) {
    try {
        const lat = latlng.lat, lng = latlng.lng;
        if ($('#' + config.name).val() === '') {
            alert('ピンの名前となるフィールドに値が入力されていません。');
            return markers;
        }

        const loading = `<div class="loading-content">
                           <div class="loading-wrap">
                             <i class="fa-solid fa-circle-notch fa-4x fa-spin" style="color: #51a0db;"></i>
                           </div>
                         </div>`

        $('#modal').append(loading)
        //kintoneに追加するレコードの情報
        const record = {
            domain: domain,
            token: config.token,
            record: {
                app: config.appId,
                record: {}
            }
        }
        for (const key in field.properties) {
            const prop = field.properties[key]
            if ($(`#${prop.code}`).length === 0 && $(`input[name="${prop.code}"]`).length === 0) {
                //入力欄がない場合はスキップ
                continue
            }
            switch (prop.type) {
                case 'NUMBER': //数値
                case 'SINGLE_LINE_TEXT': //文字列1行
                case 'MULTI_LINE_TEXT': //複数選択
                case 'DROP_DOWN': //ドロップダウン
                case 'DATE': //日付
                case 'TIME': //時刻
                case 'LINK': //リンク
                    if ($(`#${prop.code}`).val() !== '' && $(`#${prop.code}`).val()) {
                        record.record.record[prop.code] = { value: $(`#${prop.code}`).val() }
                    }
                    break;

                case 'RADIO_BUTTON': //ラジオボタン
                    record.record.record[prop.code] = { value: $(`input[name="${prop.code}"]:checked`).val() }
                    break;

                case 'MULTI_SELECT': //複数選択
                    const multiSelectValueNum = $(`#${prop.code} .kintoneplugin-dropdown-list-item-selected`).length;
                    if (multiSelectValueNum !== 0) {
                        const value = []
                        for (let i = 0; i < multiSelectValueNum; i++) {
                            value.push($(`#${prop.code} .kintoneplugin-dropdown-list-item-selected:eq(${i}) .kintoneplugin-dropdown-list-item-name`).text());
                        }
                        record.record.record[prop.code] = { value: value };
                    }
                    break;

                case 'CHECK_BOX': //チェックボックス
                    const checkBoxValueNum = $(`input[name="${prop.code}"]:checked`).length;
                    if (checkBoxValueNum !== 0) {
                        const value = []
                        for (let i = 0; i < checkBoxValueNum; i++) {
                            value.push($(`input[name="${prop.code}"]:checked`).eq(i).val());
                        }
                        record.record.record[prop.code] = { value: value };
                    }
                    break;

                case 'DATETIME': //日時
                    if ($(`#${prop.code}`).val()) {
                        const nowZone = luxon.DateTime.now().setZone('Asia/Tokyo');
                        const date = luxon.DateTime.fromISO($(`#${prop.code}`).val() + 'Z').setZone('utc').minus({ hours: Number(nowZone.o / 60) }).toFormat('yyyy-MM-dd\'T\'HH:mm\'Z\'');
                        record.record.record[prop.code] = { value: date };
                    }
                    break;

                case 'FILE':
                    record.record.record[prop.code] = { value: [] };
                    for (let i = 0; i < updateFiles[prop.code].length; i++) {
                        if (updateFiles[prop.code][i]) {
                            const fileKey = await uploadFile(domain, config.token, updateFiles[prop.code][i], '../kintone/uploadFile')
                            if (fileKey) {
                                record.record.record[prop.code].value.push({ fileKey: fileKey.fileKey });
                            }
                        }
                    }
                    break;

                case 'SUBTABLE': //テーブル
                    const tableRow = $(`#${prop.code} #create_record_table_body > tr`);
                    record.record.record[prop.code] = { value: [] }
                    let count = 0;
                    for (let i = 1; i < tableRow.length; i++) {
                        record.record.record[prop.code].value.push({ value: {} })
                        for (const f in prop.fields) {
                            const field = prop.fields[f];
                            switch (field.type) {
                                case 'NUMBER': //数値
                                case 'SINGLE_LINE_TEXT': //文字列1行
                                case 'MULTI_LINE_TEXT': //複数選択
                                case 'DROP_DOWN': //ドロップダウン
                                case 'DATE': //日付
                                case 'TIME': //時刻
                                case 'LINK': //リンク
                                    if ($(`#${prop.code} #create_record_table_body > tr:eq(${i}) #${field.code}`).val()) {
                                        record.record.record[prop.code].value[count].value[field.code] = { value: $(`#${prop.code} #create_record_table_body > tr:eq(${i}) #${field.code}`).val() };
                                    }
                                    break;

                                case 'RADIO_BUTTON': //ラジオボタン
                                    record.record.record[prop.code].value[count].value[field.code] = { value: $(`#${prop.code} #create_record_table_body > tr:eq(${i}) input[name^="${field.code}"]:checked`).val() }
                                    break;

                                case 'MULTI_SELECT': //複数選択
                                    const multiSelectValueNum = $(`#${prop.code} #create_record_table_body > tr:eq(${i}) #${field.code} .kintoneplugin-dropdown-list-item-selected`).length;
                                    const multiSelectValue = []
                                    if (multiSelectValueNum !== 0) {
                                        for (let j = 0; j < multiSelectValueNum; j++) {
                                            multiSelectValue.push($(`#${prop.code} #create_record_table_body > tr:eq(${i}) #${field.code} .kintoneplugin-dropdown-list-item-selected:eq(${j}) .kintoneplugin-dropdown-list-item-name`).text());
                                        }
                                        record.record.record[prop.code].value[count].value[field.code] = { value: multiSelectValue };
                                    }
                                    break;

                                case 'CHECK_BOX': //チェックボックス
                                    const checkBoxValueNum = $(`#${prop.code} #create_record_table_body > tr:eq(${i}) input[name^="${field.code}"]:checked`).length;
                                    const checkBoxValue = []
                                    if (checkBoxValueNum !== 0) {
                                        for (let j = 0; j < checkBoxValueNum; j++) {
                                            checkBoxValue.push($(`#${prop.code} #create_record_table_body > tr:eq(${i}) input[name^="${field.code}"]:checked`).eq(j).val());
                                        }
                                        record.record.record[prop.code].value[count].value[field.code] = { value: checkBoxValue };
                                    }
                                    break;

                                case 'DATETIME': //日時
                                    if ($(`#${prop.code} #create_record_table_body > tr:eq(${i}) #${field.code}`).val()) {
                                        const nowZone = luxon.DateTime.now().setZone('Asia/Tokyo');
                                        const date = luxon.DateTime.fromISO($(`#${prop.code} #create_record_table_body > tr:eq(${i}) #${field.code}`).val() + 'Z').setZone('utc').minus({ hours: Number(nowZone.o / 60) }).toFormat('yyyy-MM-dd\'T\'HH:mm\'Z\'');
                                        record.record.record[prop.code].value[count].value[field.code] = { value: date };
                                    }
                                    break;

                                case 'FILE':
                                    record.record.record[prop.code].value[count].value[field.code] = { value: [] };
                                    for (let j = 0; j < updateFiles[field.code][String(i)].length; j++) {
                                        if (updateFiles[field.code][String(i)][j]) {
                                            const fileKey = await uploadFile(domain, config.token, updateFiles[field.code][String(i)][j], '../kintone/uploadFile')
                                            if (fileKey) {
                                                record.record.record[prop.code].value[count].value[field.code].value.push({ fileKey: fileKey.fileKey });
                                            }
                                        }
                                    }

                                default:
                                    break;
                            }
                        }
                        if (JSON.stringify(record.record.record[prop.code].value[count].value) === '{}') {
                            //値が入っていなかった時、
                            record.record.record[prop.code].value.pop();
                        } else {
                            //値が入っていた時、カウントを増やす
                            count++;
                        }
                    }
                    if (record.record.record[prop.code].value.length === 0) {
                        //テーブルに何も値が入っていなけらば、削除
                        delete record.record.record[prop.code];
                    }
                    break;

                default:
                    break;
            }
        }
        record.record.record[config.latitude] = { value: lat }
        record.record.record[config.longitude] = { value: lng }

        //レコードを登録
        const recordPostResponse = await window.fetch("../kintone/postRecord",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(record)
            });

        const respText = await recordPostResponse.text();

        if (respText === '') {
            throw new Error('kintoneへの登録に失敗しました。\n入力内容をもう一度確認してください。');
        }
        const resp = respText ? JSON.parse(respText) : {};
        updateFiles = {}

        //レコードを取得
        const recordGetResponse = await window.fetch("../kintone/getRecord",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ app: config.appId, id: resp.id, domain: domain, token: config.token })
            });

        const getRecord = await recordGetResponse.json();

        if (getRecord.message) {
            //エラーがあった場合、動作を止める
            throw new Error('kintoneからのレコードの取得に失敗しました。');
        }

        //ポップアップを作成
        const popup = await createPopup(getRecord.record, config, domain)

        //マーカーを作成
        let marker = L.marker([lat, lng]);
        if (config.marker === 'circle') {
            //マーカーの形が円の時、円を作成
            marker = L.circleMarker([lat, lng], { color: '#ffd700', fillColor: '#ffa500', fillOpacity: 1, radius: 10, className: 'marker' });
        }
        //マーカーの名前を作成
        const markerName = L.marker([lat, lng], {
            icon: L.divIcon({
                html: '<div class="marker-label">' + getRecord.record[config.name].value + '</div>',
                iconSize: [0, 0],
                iconAnchor: [31, 59], // アイコンのアンカー位置
                className: 'marker-title'
            })
        })
        const colors = {
            "#ff0000": 'red',
            "#ffcccb": 'lightred',
            "#8b0000": 'darkred',
            "#ffa500": 'orange',
            "#eedcb3": 'beige',
            "#008000": 'green',
            "#006400": 'darkgreen',
            "#90ee90": 'lightgreen',
            "#0093ff": 'blue',
            "#00008b": 'darkblue',
            "#add8e6": 'lightblue',
            "#800080": 'purple',
            "#871f78": 'darkpurple',
            "#f5b2b2": 'pink',
            "#f0f8ff": 'cadetblue',
            "#ffffff": 'white',
            "#808080": 'gray',
            "#d3d3d3": 'lightgray',
            "#000000": 'black',
        }

        if (config.color !== '' && config.color) {
            //カラーが設定されているとき
            const value = getRecord.record[config.color].value

            for (let i = 1; i <= config.change_color_row_num; i++) {
                if (config['change_color_row' + i].option === value) {
                    if (config.marker === 'pin') {
                        const redMarker = L.AwesomeMarkers.icon({
                            prefix: 'fa',
                            icon: config['change_color_row' + i].icon,
                            markerColor: colors[config['change_color_row' + i].color],
                            iconColor: colors[config['change_color_row' + i].iconColor],
                            extraClasses: 'glyphicons-custom'
                        });
                        L.AwesomeMarkers.Icon.prototype.options.prefix = 'ion';
                        marker = L.marker([lat, lng], { icon: redMarker }); //マーカーの作成
                    } else {
                        marker = L.circleMarker([lat, lng], { color: config['change_color_row' + i].color, fillColor: config['change_color_row' + i].color, fillOpacity: 1, radius: 10, className: 'marker' });
                    }
                    break;
                }
            }
        }

        markers[resp.id] = {
            marker: marker,
            markerName: markerName
        }

        //グーグルまぷのurlを取得
        const googleMap = `https://www.google.com/maps/search/${lat},${lng}/${lat},${lng},18.5z?entry=ttu&g_ep=EgoyMDI0MTExMi4wIKXMDSoASAFQAw%3D%3D`
        let detailURL = `<a href="${googleMap}" target="_blank">グーグルマップに遷移する</a><a href="../${domainText}/detail/${resp.id}">詳細表示</a>`
        if (!login) {
            //ログインしていないとき、詳細画面へのurlを表示しない
            detailURL = `<a href="${googleMap}" target="_blank">グーグルマップに遷移する</a>`
        }
        //ポップアップを入れる
        marker.bindPopup(
            `<div>${popup}</div>${detailURL}`
        );

        marker.addTo(map)
        markerName.addTo(map);
        records.push(getRecord.record);

        $('#glay_out').remove();
        return [markers, records];
    } catch (error) {
        $('#modal .loading-content').remove();
        alert(error.message);
        console.error(error);
    }
}

/**
 * ポップアップを作成する
 * @param {object} record
 * @param {object} config
 * @returns {string}
 */
export async function createPopup(record, config, domain) {

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
                                      <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
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
                    datetime = luxon.DateTime.fromISO(record[config['popup_row' + j].popupField].value).toFormat('yyyy/MM/dd HH:mm');
                }

                tbody += `<td>
                                  <div class="field-name">
                                      <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
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
                    multiValue = record[config['popup_row' + j].popupField].value.map((resp) => { return resp }).join(',')
                }

                tbody += `<td>
                                  <div class="field-name">
                                      <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
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
                    usersValue = record[config['popup_row' + j].popupField].value.map((resp) => { return resp.name }).join(',');
                }

                tbody += `<td>
                                  <div class="field-name">
                                      <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
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
                                    <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
                                </div>
                            </td>
                            <td>`
                const files = record[config['popup_row' + j].popupField].value

                for (const f in files) {
                    if (files[f].size >= 1048576 * 300) {
                        tbody += `<div><span>${files[f].name}</span>`
                    } else {

                        // const blob = await fetchFileContent(domain, config.token, files[f].fileKey);
                        const blobResp = await fetch('../kintone/getFile', {
                            method: 'POST',
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ token: config.token, domain: domain, fileKey: files[f].fileKey })

                        })
                        const blob = await blobResp.json();
                        console.log(blob)
                        if (!blob.success) {
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
                                    <span class="field-name">${config['popup_row' + j].popupFieldName}</span>
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

/**
 * 画像表示用モーダルを作成する
 * @param {object} $ jQuery
 * @param {string} img 画像のURL
 * @param {string} title 画像名
 */
export const createImageModal = ($, img, title) => {
    const modal = `<div id="glay_out">
                      <div id="modal" style="padding-bottom: 0px; height: unset; max-inline-size: max-content; padding: 10px;">
                          <div id="modal_header" style="height: 20px; justify-self: anchor-center;">
                              <span class="image-title">${title}</span>
                          </div>
                          <div id="modal_body" style="margin-top: 15px; margin-right: 0px;">
                              <div class="show-images">
                                  <img src="${img}" style="width: 100%; max-width: unset; max-height: unset;"/>
                              </div>
                              <div class="download-link" style="justify-self: anchor-center;">
                                  <a href="${img}" download="${title}">ダウンロード</a>
                              </div>
                          </div>
                      </div>
                  </div>`

    $('body').append($(modal));

    $('#glay_out').click((e) => {
        if (e.target.id === 'glay_out') {
            $('#glay_out').remove();
        }
    })
}