import { escapeHtml } from "../escapeHtml.mjs";
import { craeteFieldRow } from './craeteFieldRow.mjs';

export const showDetail = (kintoneLayout, fileImageURLs, fieldResp, domain, config, record) => {
    const detail = $('#kintone_detail');

    const DropboxImageDiv = $('<div>');
    DropboxImageDiv.attr('id', 'dropbox_image_div');
    const DropboxImageName = $('<label>');
    DropboxImageName.attr('id', 'dropbox_image_name').text(escapeHtml('保存されている画像'));

    DropboxImageDiv.append(DropboxImageName);

    const DropboxImages = $('<div>');
    DropboxImages.attr('id', 'dropbox_images');

    for (let i = 0; i < kintoneLayout.layout.length; i++) {
        const layoutRow = $('<div>');
        layoutRow.attr('class', 'kintone-lyput-row');
        detail.append(layoutRow);

        switch (kintoneLayout.layout[i].type) {
            case 'ROW':
                for (let j = 0; j < kintoneLayout.layout[i].fields.length; j++) {
                    const field = kintoneLayout.layout[i].fields[j]
                    fileImageURLs = craeteFieldRow(layoutRow, field, kintoneLayout.layout[i].type, fileImageURLs, fieldResp, domain, config, record);
                }
                break;

            case 'GROUP':
                const groupName = $('<summary>');

                if (!fieldResp.properties[kintoneLayout.layout[i].code].noLabel) {
                    groupName.text(escapeHtml(fieldResp.properties[kintoneLayout.layout[i].code].label))
                }

                const group = $('<details>');
                group.attr({ 'id': kintoneLayout.layout[i].code, 'class': 'group' });
                if (fieldResp.properties[kintoneLayout.layout[i].code].openGroup) {
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
                        const field = groupfield.fields[k];
                        craeteFieldRow(groupLayout, field, kintoneLayout.layout[i].type, fileImageURLs, fieldResp, domain, config, record);

                    }

                    group.append(groupLayout);
                }

                layoutRow.append(group)
                break;

            case 'SUBTABLE':
                const tableDiv = $('<div>');
                tableDiv.attr('class', 'table-div');
                layoutRow.append(tableDiv);

                const tableLabel = $('<label>').attr('class', 'table-label');
                if (!fieldResp.properties[kintoneLayout.layout[i].code].noLabel) {
                    tableLabel.text(escapeHtml(fieldResp.properties[kintoneLayout.layout[i].code].label))
                }

                tableDiv.append(tableLabel)

                const table = $('<table>');
                table.attr({ 'class': 'kintoneplugin-table', id: kintoneLayout.layout[i].code });
                tableDiv.append(table);

                const thead = $('<thead>');
                const theadTr = $('<tr>');

                thead.append(theadTr);
                table.append(thead)

                const tbody = $('<tbody>');
                table.append(tbody);

                for (let k = 0; k < kintoneLayout.layout[i].fields.length; k++) {
                    const field = kintoneLayout.layout[i].fields[k]
                    const theadTh = $('<th>');
                    theadTh.attr({ 'class': 'kintoneplugin-table-th', 'id': field.code });

                    const tableRowName = $('<span>');
                    tableRowName.attr('class', 'title').text(fieldResp.properties[kintoneLayout.layout[i].code].fields[field.code].label);

                    theadTh.append(tableRowName);
                    theadTr.append(theadTh);
                }

                for (let j = 0; j < record.record[kintoneLayout.layout[i].code].value.length; j++) {
                    const tbodyTr = $('<tr>');
                    for (let k = 0; k < kintoneLayout.layout[i].fields.length; k++) {
                        const field = kintoneLayout.layout[i].fields[k]
                        const tbodyTd = $('<td>');

                        craeteFieldRow(tbodyTd, field, kintoneLayout.layout[i].type, fileImageURLs, fieldResp, domain, config, record, kintoneLayout.layout[i].code, j);
                        tbodyTr.append(tbodyTd);
                    }
                    tbody.append(tbodyTr);
                }

                break;
        }
    }
    $('.loading-content').attr('class', 'loading-content loaded')
    return fileImageURLs
}