import { escapeHtml } from '../escapeHtml.mjs';

export const craeteFieldRow = async (div, field, type, fileImageURLs, fieldResp, domain, config, record, code, num) => {
  if (type !== 'SUBTABLE') {
    switch (field.type) {
      case 'REFERENCE_TABLE':
        break;

      case 'SPACER':
        const space = $('<div>');
        space.attr({ 'id': field.elementId, 'class': 'kintone-space' }).css({ 'min-width': field.size.width + 'px', 'min-height': field.size.height + 'px' });
        div.append(space);

        break;

      default:
        const fieldDiv = $('<div>');
        fieldDiv.attr('class', 'field-div').css({ 'min-width': field.size.width + 'px' })
        const fieldLabel = $('<label>');
        fieldLabel.attr('class', 'field-label');

        if (field.type === 'HR') {
          const hr = $('<hr>');
          fieldDiv.append(hr);
          div.append(fieldDiv)
          break;
        } else if (field.type === 'LABEL') {
          fieldDiv.html(field.label);
          div.append(fieldDiv)
          break;
        }

        if (!fieldResp.properties[field.code].noLabel) {
          fieldLabel.text(fieldResp.properties[field.code].label);
        }

        const fieldValueDiv = $('<div>');
        fieldValueDiv.attr('class', 'field-value-div');
        let fieldValue;

        if (field.type === 'LINK') {
          fieldValue = $('<div>');
          const a = $('<a>').attr({ 'href': record.record[field.code].value }).text(record.record[field.code].value);

          fieldValue.append(a)
        } else if (field.type === 'DATETIME' || field.type === 'CREATED_TIME' || field.type === 'UPDATED_TIME') {
          fieldValue = $('<span>');
          if (record.record[field.code].value !== '' || record.record[field.code].value) {
            fieldValue.text(escapeHtml(luxon.DateTime.fromISO(record.record[field.code].value).toFormat('yyyy-MM-dd HH:mm')));
          }
        } else if (field.type === 'RICH_TEXT') {
          fieldValue = $('<div>');
          fieldValue.html(record.record[field.code].value);
        } else if (field.type === 'CHECK_BOX') {
          fieldValue = $('<span>');
          fieldValue.text(escapeHtml(record.record[field.code].value.map((str) => { return str }).join(' ')));
        } else if (field.type === 'MULTI_SELECT') {
          fieldValue = $('<div>');
          fieldValue.html(record.record[field.code].value.map((str) => { return '<div>' + str + '</div>' }).join(''));
        } else if (field.type === 'USER_SELECT' || field.type === 'ORGANIZATION_SELECT' || field.type === 'GROUP_SELECT') {
          fieldValue = $('<div>');
          fieldValue.html(record.record[field.code].value.map((code) => { return '<div>' + code.name + '</div>' }).join(''));
        } else if (field.type === 'CREATOR' || field.type === 'MODIFIER') {
          fieldValue = $('<span>');
          fieldValue.text(escapeHtml(record.record[field.code].value.name));
        } else if (field.type === 'FILE') {
          fieldValue = $('<div>');
          for (let i = 0; i < record.record[field.code].value.length; i++) {
            const div = $('<div>');
            const file = record.record[field.code].value[i];

            if (file.size >= 1048576 * 500) {
              alert(`サイズが500MBを超えたので${file.name}は表示できませんでした。`)
              div.append(`<span>${file.name}</span>`);

            } else {

              let blobUrl = '', blob = {};

              const fileName = $('<a>');
              if (fileImageURLs[file.fileKey]) {
                blobUrl = fileImageURLs[file.fileKey]
                fileName.attr({ 'class': 'file-value-name', 'href': fileImageURLs[file.fileKey], 'download': file.name });
              } else {
                const blobResp = await fetch('../../kintone/getFile', {
                  method: 'POST',
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token: config.token, domain: domain, fileKey: file.fileKey })

                })

                blob = await blobResp.json();
                if (!blob.success) {
                  div.append(`<span>${file.name}</span>`);

                } else {
                  const binaryString = atob(blob.data);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  const fileBlob = new Blob([bytes], { type: blob.mimeType });
                  blobUrl = URL.createObjectURL(fileBlob);

                  fileName.attr({ 'class': 'file-value-name', 'href': blobUrl, 'download': file.name });

                  fileImageURLs[file.fileKey] = blobUrl;
                }
              }

              if (file.contentType.startsWith('image/') && blob &&
                file.contentType !== 'image/tiff' && file.contentType !== 'image/x-emf' && file.contentType !== 'image/x-wmf') {
                const img = $('<img>');

                img.attr({ 'src': blobUrl, 'class': 'field-value-image' });

                if (img.prop('src') !== '') {
                  fileName.append(img);
                  div.append(fileName);
                } else {
                  div.append(`<span>${file.name}</span>`);
                }
              } else if (!file.contentType.startsWith('image/') && blob) {
                fileName.text(file.name)
                div.append(fileName);
              }
            }
            fieldValue.append(div);
          }
        } else if (field.type === 'MULTI_LINE_TEXT') {
          fieldValue = $('<div>');
          for (let i = 0; i < record.record[field.code].value.split("\n").length; i++) {
            fieldValue.append('<div>' + escapeHtml(record.record[field.code].value.split("\n")[i]) + '</div>');

          }
        } else {
          fieldValue = $('<span>');
          fieldValue.text(record.record[field.code].value);
        }

        fieldValue.attr({ 'id': field.code, 'class': 'field-value' });

        fieldDiv.append(fieldLabel);
        fieldValueDiv.append(fieldValue);
        fieldDiv.append(fieldValueDiv);

        div.append(fieldDiv)
        break;
    }
  } else {
    const fieldDiv = $('<div>');
    fieldDiv.attr('class', 'field-div').css({ 'min-width': field.size.width + 'px' })

    let fieldValue;

    if (field.type === 'LINK') {
      fieldValue = $('<div>');
      const a = $('<a>').attr({ 'href': record.record[code].value[num].value[field.code].value }).text(record.record[code].value[num].value[field.code].value);

      fieldValue.append(a)
    } else if (field.type === 'DATETIME') {
      fieldValue = $('<span>');
      if (record.record[code].value[num].value[field.code].value !== '' || record.record[code].value[num].value[field.code].value) {
        fieldValue.text(escapeHtml(luxon.DateTime.fromISO(record.record[code].value[num].value[field.code].value).toFormat('yyyy-MM-dd HH:mm')));
      }
    } else if (field.type === 'RICH_TEXT') {
      fieldValue = $('<div>');
      fieldValue.append(record.record[code].value[num].value[field.code].value);
    } else if (field.type === 'CHECK_BOX') {
      fieldValue = $('<span>');
      fieldValue.text(escapeHtml(record.record[code].value[num].value[field.code].value.map((str) => { return str }).join(' ')));
    } else if (field.type === 'MULTI_SELECT') {
      fieldValue = $('<div>');
      fieldValue.append(record.record[code].value[num].value[field.code].value.map((str) => { return '<div>' + str + '</div>' }).join(''));
    } else if (field.type === 'USER_SELECT' || field.type === 'ORGANIZATION_SELECT' || field.type === 'GROUP_SELECT') {
      fieldValue = $('<div>');
      fieldValue.append(record.record[code].value[num].value[field.code].value.map((code) => { return '<div>' + code.name + '</div>' }).join(''));
    } else if (field.type === 'FILE') {
      fieldValue = $('<div>');
      for (let i = 0; i < record.record[code].value[num].value[field.code].value.length; i++) {
        const file = record.record[code].value[num].value[field.code].value[i];
        const div = $('<div>');
        if (file.size >= 1048576 * 500) {
          alert(`サイズが500MBを超えたので${file.name}は表示できませんでした。`)
          div.append(`<span>${file.name}</span>`);

        } else {
          const fileName = $('<a>');

          let blobUrl = '', blob = {}

          if (fileImageURLs[file.fileKey]) {
            fileName.attr({ 'class': 'file-value-name', 'href': fileImageURLs[file.fileKey], 'download': file.name });
            blobUrl = fileImageURLs[file.fileKey]
          } else {
            const blobResp = await fetch('../../kintone/getFile', {
              method: 'POST',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: config.token, domain: domain, fileKey: file.fileKey })

            })

            blob = await blobResp.json();
            if (!blob.success) {
              div.append(`<span>${file.name}</span>`);
            } else {
              const binaryString = atob(blob.data);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              const fileBlob = new Blob([bytes], { type: blob.mimeType });
              blobUrl = URL.createObjectURL(fileBlob);

              fileName.attr({ 'class': 'file-value-name', 'href': blobUrl, 'download': file.name });

              fileImageURLs[file.fileKey] = blobUrl
            }
          }

          if (file.contentType.startsWith('image/') && blob.success &&
            file.contentType !== 'image/tiff' && file.contentType !== 'image/x-emf' && file.contentType !== 'image/x-wmf') {
            const img = $('<img>');

            img.attr({ 'src': blobUrl, 'class': 'field-value-image' });

            if (img.prop('src') !== '') {
              fileName.append(img);
              div.append(fileName);
            } else {
              div.append(`<span>${file.name}</span>`);
            }
          } else if (!file.contentType.startsWith('image/') && blob.success) {
            fileName.text(file.name);
            div.append(fileName);
          }
        }

        fieldValue.append(div);
      }
    } else if (field.type === 'MULTI_LINE_TEXT') {
      fieldValue = $('<div>');
      for (let i = 0; i < record.record[code].value[num].value[field.code].value.split("\n").length; i++) {
        fieldValue.append('<div>' + escapeHtml(record.record[code].value[num].value[field.code].value.split("\n")[i]) + '</div>');

      }
    } else {
      fieldValue = $('<span>');
      fieldValue.text(escapeHtml(record.record[code].value[num].value[field.code].value));
    }

    fieldValue.attr({ 'id': field.code, 'class': 'field-value' });
    fieldDiv.append(fieldValue);
    div.append(fieldDiv)

  }
  return fileImageURLs
}