
import { escapeHtml } from '../escapeHtml.mjs'
// import { escapeHtml } from '../index';

export async function createSearchArea(field) {
    if ($('#search_modal').length === 0) {
        const modal = `<div id="search_modal" style="display: block">
                            <div id="search_modal_header">
                                <div id="record_search_name">絞り込み</div>
                                <button id="close">×</button>
                            </div>
                            <div id="search_modal_body">
                                <button id="add_condition">条件追加</button>
                                <div id="first_search">
                                    <details id="field_select_area" class="conditions" open>
                                        <summary>
                                            <div>条件</div>
                                            <button class="condition_delete">×</button>
                                        </summary>
                                        <div class="andor">
                                            <div class="kintoneplugin-input-radio">
                                                <span class="kintoneplugin-input-radio-item">
                                                    <input type="radio" name="ANDOR" value="and" id="and" checked>
                                                    <label for="and">AND</label>
                                                </span>
                                                <span class="kintoneplugin-input-radio-item">
                                                    <input type="radio" name="ANDOR" value="or" id="or">
                                                    <label for="or">OR</label>
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <select class="search_field_select">
                                                <option value="">------</option>
                                            </select>
                                        </div>
                                        <div class="input-condition">
                                            <div class="number_search condition-area">
                                                <div class="kintoneplugin-input-radio">
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="numbers" value="0" id="number_end" checked>
                                                        <label for="number_end">以上</label>
                                                    </span>
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="numbers" value="1" id="number_below">
                                                        <label for="number_below">以下</label>
                                                    </span>
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="numbers" value="2" id="number_between">
                                                        <label for="number_between">範囲</label><br>
                                                    </span>
                                                </div>
                                                <div class="input-end">
                                                    <input type="number" class="end-number">以上
                                                </div>
                                                <div class="input-below">
                                                    <input type="number" class="below-number" disabled>以下
                                                </div>
                                            </div>
                                            <div class="date_search condition-area">
                                                <div class="kintoneplugin-input-radio">
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="dates" value="0" id="date_end" checked>
                                                        <label for="date_end">以降</label>
                                                    </span>
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="dates" value="1" id="date_below">
                                                        <label for="date_below">以前</label>
                                                    </span>
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="dates" value="2" id="date_between">
                                                        <label for="date_between">範囲</label><br>
                                                    </span>
                                                </div>
                                                <div class="input-end">
                                                    <input type="date" class="end-date">以降
                                                </div>
                                                <div class="input-below">
                                                    <input type="date" class="below-date" disabled>以前
                                                </div>
                                            </div>
                                            <div class="time_search condition-area">
                                                <div class="kintoneplugin-input-radio">
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="times" value="0" id="time_end" checked>
                                                        <label for="time_end">以降</label>
                                                    </span>
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="times" value="1" id="time_below">
                                                        <label for="time_below">以前</label>
                                                    </span>
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="times" value="2" id="time_between">
                                                        <label for="time_between">範囲</label><br>
                                                    </span>
                                                </div>
                                                 <div class="input-end">
                                                    <input type="time" class="end-time">以降
                                                </div>
                                                <div class="input-below">
                                                    <input type="time" class="below-time" disabled>以前
                                                </div>
                                            </div>
                                            <div class="datetime_search condition-area">
                                                <div class="kintoneplugin-input-radio">
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="datetimes" value="0" id="datetime_end" checked>
                                                        <label for="datetime_end">以降</label>
                                                    </span>
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="datetimes" value="1" id="datetime_below">
                                                        <label for="datetime_below">以前</label>
                                                    </span>
                                                    <span class="kintoneplugin-input-radio-item">
                                                        <input type="radio" name="datetimes" value="2" id="datetime_between">
                                                        <label for="datetime_between">範囲</label><br>
                                                    </span>
                                                </div>
                                                <div class="input-end">
                                                    <input type="datetime-local" class="end-datetime">以降
                                                </div>
                                                <div class="input-below">
                                                    <input type="datetime-local" class="below-datetime" disabled>以前
                                                </div>
                                            </div>
                                            <div class="text_search condition-area">
                                                <input type="text" class="texts">
                                            </div>
                                            <div class="select_search condition-area">
                                                <select class="selects"></select>
                                            </div>
                                        </div>
                                    </details>
                                </div>
                            </div>
                            <div id="buttons">
                                <button id="search">絞り込む</button>
                                <button id="show_all">絞り込み解除</button>
                            </div>
                        </div>`
        $('body').append(modal);
        $('#search_modal').css('z-index', '1010');
        $('#address_search_modal').css('z-index', '1001');

        const fieldName = {
            TEXT: $('<optgroup>').attr('label', '文字列'),
            NUMBER: $('<optgroup>').attr('label', '数値'),
            DATE: $('<optgroup>').attr('label', '日付'),
            TIME: $('<optgroup>').attr('label', '時刻'),
            DATETIME: $('<optgroup>').attr('label', '日時'),
            SELECT: $('<optgroup>').attr('label', '選択肢')
        }

        for (const key in field.properties) {
            const prop = field.properties[key];
            const $option = $('<option>');
            $option.attr({ 'class': prop.type, 'value': escapeHtml(prop.code) });
            $option.text(escapeHtml(prop.label));

            switch (prop.type) {
                case 'SINGLE_LINE_TEXT':
                case 'MULTI_LINE_TEXT':
                case 'LINK':
                    fieldName.TEXT.append($option);
                    break;

                case 'NUMBER':
                case 'CALC':
                case 'RECORD_NUMBER':
                    fieldName.NUMBER.append($option);
                    break;

                case 'RADIO_BUTTON':
                case 'DROP_DOWN':
                case 'CHECK_BOX':
                case 'MULTI_SELECT':
                    fieldName.SELECT.append($option);
                    break;

                case 'DATE':
                    fieldName.DATE.append($option);
                    break;

                case 'TIME':
                    fieldName.TIME.append($option);
                    break;

                case 'DATETIME':
                case 'CREATED_TIME':
                case 'UPDATED_TIME':
                    fieldName.DATETIME.append($option);
                    break;

                default:
                    break;
            }
        };

        for (const key in fieldName) {
            if (fieldName[key].innerHTML !== '') {
                $('.search_field_select').append(fieldName[key]);
            }
        }

        const clone = $('#field_select_area').clone(true);
        clone[0].setAttribute('id', 'search_select1');
        clone.find('.andor').css('display', 'none');
        clone.find('.condition_delete').css('display', 'none');
        for (let i = 0; i < $('#field_select_area input').length; i++) {
            const inputId = $('#field_select_area input').eq(i).prop('id');
            const inputName = $('#field_select_area input').eq(i).prop('name');
            clone.find('input[id="' + inputId + '"]').attr({ 'id': inputId + '1', 'name': inputName + '1' });
            clone.find('label[for="' + inputId + '"]').attr('for', inputId + '1');
        }

        clone.insertAfter($('#field_select_area'));

    } else {
        if ($('#search_modal').css('display') === 'block') {
            $('#search_modal').css('display', 'none')
        } else {
            $('#search_modal').css('display', 'block')
            $('#search_modal').css('z-index', '1010');
            $('#address_search_modal').css('z-index', '1001');
        }
    }

    $('.input-condition input').change((e) => {
        const parent = e.target.parentNode.parentNode.parentNode;
        const end = parent.children[1].children[0]
        const below = parent.children[2].children[0]

        switch (e.target.value) {
            case '0':
                end.disabled = false;
                below.disabled = true;
                break;

            case '1':
                end.disabled = true;
                below.disabled = false;
                break;

            case '2':
                end.disabled = false;
                below.disabled = false;
                break;
        }
    })

    $('.condition_delete').off('click').click((e) => {
        e.target.parentNode.parentNode.remove();
    })

    $('#add_condition').off('click').click((() => {
        let num = '';
        const clone = $('#field_select_area').clone(true);
        for (let i = 1; i <= $('.conditions').length; i++) {
            num = i
            for (let j = 1; j < $('.conditions').length; j++) {
                if ($('.conditions:eq(' + j + ') input').eq(0).prop('name') === 'ANDOR' + i) {
                    num = null
                    break;
                }
            }
            if (num !== null) {
                break;
            }
        }
        clone[0].setAttribute('id', 'search_select' + num);
        for (let i = 0; i < $('#field_select_area input').length; i++) {
            const inputId = $('#field_select_area input').eq(i).prop('id');
            const inputName = $('#field_select_area input').eq(i).prop('name');
            clone.find('input[id="' + inputId + '"]').attr({ 'id': inputId + num, 'name': inputName + num });
            clone.find('label[for="' + inputId + '"]').attr('for', inputId + num);
        }
        clone.insertAfter($('.conditions').eq($('.conditions').length - 1));
    }));

    $('.search_field_select').change((e) => {
        let num;
        for (let i = 1; i < document.querySelectorAll('.conditions').length; i++) {
            if (e.target.parentNode.parentNode == document.querySelectorAll('.conditions')[i]) {
                num = i;
            }
        }
        const inputCondition = $('.conditions:eq(' + num + ') .condition-area')
        if (e.target.value === '') {
            for (let i = 0; i < inputCondition.length; i++) {
                inputCondition.eq(i).css('display', 'none');
            }
        } else {
            const type = $('.conditions:eq(' + num + ') .search_field_select option[value="' + e.target.value + '"]').prop('class')

            switch (type) {
                case 'NUMBER':
                case 'CALC':
                case 'RECORD_NUMBER':
                    for (let i = 0; i < inputCondition.length; i++) {
                        if (inputCondition.eq(i).attr('class') === 'number_search condition-area') {
                            inputCondition.eq(i).css('display', 'block');
                        } else {
                            inputCondition.eq(i).css('display', 'none');
                        }
                    }
                    break;

                case 'DATE':
                    for (let i = 0; i < inputCondition.length; i++) {
                        if (inputCondition.eq(i).attr('class') === 'date_search condition-area') {
                            inputCondition.eq(i).css('display', 'block');
                        } else {
                            inputCondition.eq(i).css('display', 'none');
                        }
                    }
                    break;

                case 'TIME':
                    for (let i = 0; i < inputCondition.length; i++) {
                        if (inputCondition.eq(i).attr('class') === 'time_search condition-area') {
                            inputCondition.eq(i).css('display', 'block');
                        } else {
                            inputCondition.eq(i).css('display', 'none');
                        }
                    }
                    break;

                case 'DATETIME':
                case 'CREATED_TIME':
                case 'UPDATED_TIME':
                    for (let i = 0; i < inputCondition.length; i++) {
                        if (inputCondition.eq(i).attr('class') === 'datetime_search condition-area') {
                            inputCondition.eq(i).css('display', 'block');
                        } else {
                            inputCondition.eq(i).css('display', 'none');
                        }
                    }
                    break;

                case 'SINGLE_LINE_TEXT':
                case 'MULTI_LINE_TEXT':
                case 'RICH_TEXT':
                case 'LINK':
                    for (let i = 0; i < inputCondition.length; i++) {
                        if (inputCondition.eq(i).attr('class') === 'text_search condition-area') {
                            inputCondition.eq(i).css('display', 'block');
                        } else {
                            inputCondition.eq(i).css('display', 'none');
                        }
                    }
                    break;

                default:
                    for (let i = 0; i < inputCondition.length; i++) {
                        if (inputCondition.eq(i).attr('class') === 'select_search condition-area') {
                            inputCondition.eq(i).css('display', 'block');
                            inputCondition.eq(i).children('.selects').empty();
                            for (const key in field.properties[e.target.value].options) {
                                const $option = $('<option>');
                                $option.attr('value', escapeHtml(field.properties[e.target.value].options[key].label));
                                $option.text(escapeHtml(field.properties[e.target.value].options[key].label))
                                inputCondition.eq(i).children('.selects').append($option)
                            }
                        } else {
                            inputCondition.eq(i).css('display', 'none');
                        }
                    }
                    break;
            }
        }
    });
}

export async function markerSearch(markers, recordsResp, map, layerHideMarkers) {
    const hideMarkers = [];
    let conditionNum = $('.conditions').length;
    const condition = {}
    for (let i = 1; i < conditionNum; i++) {
        const field = $('.conditions:eq(' + i + ') .search_field_select').val();
        condition['condition' + i] = {
            condition: $('.conditions:eq(' + i + ') .andor input[name="ANDOR' + i + '"]:checked').val(),
            recordIds: []
        }
        if (field === '') {
            conditionNum--;
            i--;
            continue;
        }

        recordsResp.forEach(records => {
            for (let j = 0; j < records.length; j++) {
                const record = records[j]
                if (!record[field].value) {
                    continue;
                }
                switch (record[field].type) {
                    case 'NUMBER':
                    case 'RECORD_NUMBER':
                    case 'CALC':
                        const number = $('.conditions:eq(' + i + ') .number_search input[name="numbers' + i + '"]:checked').val();
                        if (number === '0') {
                            if (Number(record[field].value) >= $('.conditions:eq(' + i + ') .number_search .end-number').val()) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        } else if (number === '1') {
                            if (Number(record[field].value) <= $('.conditions:eq(' + i + ') .number_search .below-number').val()) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        } else {
                            if (Number(record[field].value) >= $('.conditions:eq(' + i + ') .number_search .end-number').val() && Number(record[field].value) <= $('.conditions:eq(' + i + ') .number_search .below-number').val()) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        }
                        break;

                    case 'DATE':
                        const date = $('.conditions:eq(' + i + ') .date_search input[name="dates' + i + '"]:checked').val();
                        const recordDateValue = new Date(record[field].value);
                        const endDate = new Date($('.conditions:eq(' + i + ') .date_search .end-date').val());
                        const belowDate = new Date($('.conditions:eq(' + i + ') .date_search .below-date').val())

                        if (date === '0') {
                            if (recordDateValue.getTime() >= endDate.getTime()) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        } else if (date === '1') {
                            if (recordDateValue.getTime() <= belowDate.getTime()) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        } else {
                            if (recordDateValue.getTime() >= endDate.getTime() && recordDateValue.getTime() <= belowDate.getTime()) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        }
                        break;

                    case 'TIME':
                        const time = $('.conditions:eq(' + i + ') .time_search input[name="times' + i + '"]:checked').val();
                        const recordTimeValue = Number(record[field].value.replace(':', ''));
                        const endTime = Number($('.conditions:eq(' + i + ') .time_search .end-time').val().replace(':', ''));
                        const belowTime = Number($('.conditions:eq(' + i + ') .time_search .below-time').val().replace(':', ''));

                        if (time === '0') {
                            if (recordTimeValue >= endTime) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        } else if (time === '1') {
                            if (recordTimeValue <= belowTime) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        } else {
                            if (recordTimeValue >= endTime && recordTimeValue <= belowTime) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        }
                        break;

                    case 'DATETIME':
                    case 'CREATED_TIME':
                    case 'UPDATED_TIME':
                        const datetime = $('.conditions:eq(' + i + ') .datetime_search input[name="datetimes' + i + '"]:checked').val();
                        const recordDateTimeValue = new Date(record[field].value);
                        const endDatetime = new Date($('.conditions:eq(' + i + ') .datetime_search .end-datetime').val());
                        const belowDatetime = new Date($('.conditions:eq(' + i + ') .datetime_search .below-datetime').val())

                        if (datetime === '0') {
                            if (recordDateTimeValue.getTime() >= endDatetime.getTime()) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        } else if (datetime === '1') {
                            if (recordDateTimeValue.getTime() <= belowDatetime.getTime()) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        } else {
                            if (recordDateTimeValue.getTime() >= endDatetime.getTime() && recordDateTimeValue.getTime() <= belowDatetime.getTime()) {
                                condition['condition' + i].recordIds.push(record.$id.value)
                            }
                        }
                        break;

                    case 'SINGLE_LINE_TEXT':
                    case 'MULTI_LINE_TEXT':
                    case 'RICH_TEXT':
                    case 'LINK':
                        if (record[field].value.indexOf($('.conditions:eq(' + i + ') .text_search .texts').val()) !== -1) {
                            condition['condition' + i].recordIds.push(record.$id.value)
                        }
                        break;

                    case 'RADIO_BUTTON':
                    case 'DROP_DOWN':
                        if (record[field].value === $('.conditions:eq(' + i + ') .select_search .selects').val()) {
                            condition['condition' + i].recordIds.push(record.$id.value)
                        }
                        break;

                    default:
                        if (record[field].value.indexOf($('.conditions:eq(' + i + ') .select_search .selects').val()) !== -1) {
                            condition['condition' + i].recordIds.push(record.$id.value)
                        }
                        break;
                }
            }
        })
    }

    if (conditionNum === 0) {
        return;
    } else {
        let matchRecords = []
        for (const key in condition) {
            if (matchRecords.length === 0) {
                matchRecords = condition[key].recordIds
            } else if (condition[key].condition === 'and') {
                const intersection = matchRecords.filter(value => condition[key].recordIds.includes(value));
                matchRecords = intersection;
            } else {
                const result = Array.from(new Set([...matchRecords, ...condition[key].recordIds]));
                matchRecords = result;
            }
        }
        for (const key in markers) {
            let check = false;
            markers[key].marker.addTo(map)
            markers[key].markerName.addTo(map)
            if (matchRecords.indexOf(key) !== -1) {
                check = true;
            }

            if (!check) {
                hideMarkers.push(key)
                map.removeLayer(markers[key].marker)
                map.removeLayer(markers[key].markerName)
            } else if (layerHideMarkers.indexOf(key) !== -1) {
                map.removeLayer(markers[key].marker)
                map.removeLayer(markers[key].markerName)
            }
        }
    }
    return hideMarkers;
}

let addressMarker;
export async function addressSearch(map, config) {
    let marker = '';
    if ($('#address_search_modal').length === 0) {
        const modal = `<div id="address_search_modal" style="display: block">
                            <div id="search_modal_header">
                                <div id="record_search_name">住所検索</div>
                                <button id="address_search_modal_close">×</button>
                            </div>
                            <div id="search_modal_body">
                                <input type="text" id="address" placeholder="東京都千代田区千代田1-1">
                                <button id="search_address">検索</button>
                            </div>
                        </div>`
        $('body').append(modal);

        $('#search_modal').css('z-index', '1001');
        $('#address_search_modal').css('z-index', '1010');
    } else {
        if ($('#address_search_modal').css('display') === 'block') {
            $('#address_search_modal').css('display', 'none');
        } else {
            $('#address_search_modal').css('display', 'block');
            $('#search_modal').css('z-index', '1001');
            $('#address_search_modal').css('z-index', '1010');
        }
    }

    $('#search_address').off('click').click(() => {
        const address = $('#address').val();
        if (address === '' && addressMarker === '') {
            return;
        } else if (address === '') {
            map.removeLayer(addressMarker);
            addressMarker = '';
        } else {
            getLatLng(address, (latlng) => {
                if (!latlng.lat && !latlng.lng) {
                    if (latlng.level === 1) {
                        const endpoint = 'https://geolonia.github.io/japanese-prefectural-capitals/index.json'
                        fetch(endpoint).then(res => {
                            return res.json()
                        }).then(data => {
                            map.panTo(new L.LatLng(data[latlng.pref].lat, data[latlng.pref].lng), 4);
                            marker = L.marker([data[latlng.pref].lat, data[latlng.pref].lng]).bindPopup(address)//マーカーの作成
                            marker.addTo(map);
                            if (addressMarker) {
                                map.removeLayer(addressMarker);
                            }
                            addressMarker = marker;

                            console.log(`住所の判定ができなかったので「${latlng.pref}」に移動します。`)
                        })
                    } else if (latlng.level >= 2) {
                        fetch("https://msearch.gsi.go.jp/address-search/AddressSearch?q=" + latlng.pref + latlng.city).then(res => {
                            return res.json()
                        }).then(data => {
                            map.panTo(new L.LatLng(data[0].geometry.coordinates[1], data[0].geometry.coordinates[0]), 4);
                            marker = L.marker([data[0].geometry.coordinates[1], data[0].geometry.coordinates[0]]).bindPopup(latlng.pref + latlng.city)//マーカーの作成
                            marker.addTo(map);
                            if (addressMarker) {
                                map.removeLayer(addressMarker);
                            }
                            addressMarker = marker;
                        })
                    } else {
                        alert('検索に失敗しました。\n正確な住所を入力してください。');
                        // map.panTo(new L.LatLng(config.centerLat, config.centerLng), 15);
                    }
                } else {
                    map.panTo(new L.LatLng(latlng.lat, latlng.lng), 15);
                    marker = L.marker([latlng.lat, latlng.lng]).bindPopup(address)//マーカーの作成
                    marker.addTo(map);
                    if (addressMarker) {
                        map.removeLayer(addressMarker);
                    }
                    addressMarker = marker;
                }

            });
            $('#address_search_modal').css('display', 'none');

        }
    })

    $('#address').off('keydown').on('keydown', (e) => {
        if (e.key === 'Enter') {
            $('#search_address').click();
        }
    })

    $('#address_search_modal_close').click(() => {
        $('#address_search_modal').css('display', 'none');
    })
}

function getPolygonCentroid(coords) {
    let latSum = 0, lngSum = 0, count = 0;
    coords.forEach(coord => {
        coord.forEach(([lng, lat]) => {
            lngSum += lng;
            latSum += lat;
            count++;
        });
    });
    if (count === 0) return null;
    return [latSum / count, lngSum / count]; // [lat, lng]
}