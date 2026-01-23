
import { escapeHtml } from "../escapeHtml.mjs"
// import { field } from "../kintoneAPI.mjs"
let field, CONF, domain;

const fieldTypes = {
    'TEXT': $('<optgroup>').attr({ label: '文字列', id: 'TEXT' }),
    'NUMBER': $('<optgroup>').attr({ label: '数値', id: 'NUMBER' }),
    'SELECT': $('<optgroup>').attr({ label: '選択', id: 'SELECT' }),
    'DATETIME': $('<optgroup>').attr({ label: '日付・時刻・日時', id: 'DATETIME' }),
    'USER': $('<optgroup>').attr({ label: 'ユーザー', id: 'USER' }),
}

export const setNarrowDownField = async (config, key) => {
    domain = config.domain
    CONF = config[key]
    const fieldResp = await window.fetch("../kintone/getField", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ app: CONF.appId, token: CONF.token, domain: config.domain })
    });

    field = await fieldResp.json()

    setDropdown(field);

    if (CONF.narrow_row_number >= 1) {
        defaultNarrowDown(CONF)
    } else {
        $('.condition-add').eq(0).click();
    }
}

const setDropdown = (field) => {
    for (const key in field.properties) {
        const prop = field.properties[key];
        const $option = $('<option>');

        switch (prop.type) {
            case 'SINGLE_LINE_TEXT':
            case 'MULTI_LINE_TEXT':
            case 'RICH_TEXT':
            case 'LINK':
                fieldTypes['TEXT'].append($option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label)));
                break;

            case 'NUMBER':
            case 'CALC':
            case 'RECORD_NUMBER':
                fieldTypes['NUMBER'].append($option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label)));
                break;

            case 'RADIO_BUTTON':
            case 'CHECK_BOX':
            case 'MULTI_SELECT':
            case 'DROP_DOWN':
                fieldTypes['SELECT'].append($option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label)));
                break;

            case 'DATE':
            case 'TIME':
            case 'DATETIME':
            case 'CREATED_TIME':
            case 'UPDATED_TIME':
                fieldTypes['DATETIME'].append($option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label)));
                break;

            // case 'USER_SELECT':
            // case 'ORGANIZATION_SELECT':
            // case 'GROUP_SELECT':
            // case 'CREATOR':
            // case 'MODIFIER':
            //     fieldTypes['USER'].append($option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label)));
            //     break;

            case 'STATUS':
                if (prop.enabled) {
                    fieldTypes['SELECT'].append($option.attr('value', escapeHtml(prop.code)).text(escapeHtml(prop.label)));
                    break;
                }
        }
    }

    for (const key in fieldTypes) {
        if (fieldTypes[key][0].children.length !== 0) {
            $('.narrow-down-field').append(fieldTypes[key])
        }
    }
}

const changeConditionField = async (fieldValue, narrowDownArea) => {
    narrowDownArea.find('.narrow-down-conditions').empty();
    narrowDownArea.find('.narrow-down-values').empty();

    if (fieldValue !== '') {
        const conditionSelect = $('<select>').attr('class', 'condition map-config-selects');
        narrowDownArea.find('.narrow-down-conditions').append(conditionSelect)

        let conditionValue;
        switch (field.properties[fieldValue].type) {
            case 'SINGLE_LINE_TEXT':
            case 'MULTI_LINE_TEXT':
            case 'RITCH_TEXT':
                conditionSelect.append(
                    $('<option>').attr('value', '=').text('=(等しい)'),
                    $('<option>').attr('value', '!=').text('≠(等しくない)'),
                    $('<option>').attr('value', 'match').text('条件値を含む'),
                    $('<option>').attr('value', 'unmatch').text('条件値を含まない')
                )

                conditionValue = $('<input>').attr({ class: 'kintoneplugin-input-text condition-value', type: 'text' });
                narrowDownArea.find('.narrow-down-values').append(conditionValue);
                break;

            case 'NUMBER':
            case 'CALC':
            case 'RECORD_NUMBER':
                conditionSelect.append(
                    $('<option>').attr('value', '=').text('=(等しい)'),
                    $('<option>').attr('value', '!=').text('≠(等しくない)'),
                    $('<option>').attr('value', '>=').text('≧(以上)'),
                    $('<option>').attr('value', '>').text('>(より大きい)'),
                    $('<option>').attr('value', '<=').text('≦(以下)'),
                    $('<option>').attr('value', '<').text('<(より小さい)')
                )

                conditionValue = $('<input>').attr({ class: 'kintoneplugin-input-text condition-value', type: 'number' });
                narrowDownArea.find('.narrow-down-values').append(conditionValue);
                break;

            case 'RADIO_BUTTON':
            case 'CHECK_BOX':
            case 'MULTI_SELECT':
            case 'DROP_DOWN':
                conditionSelect.append(
                    $('<option>').attr('value', 'match').text('条件値を含む'),
                    $('<option>').attr('value', 'unmatch').text('条件値を含まない')
                )

                conditionValue = $('<select>').attr({ class: 'condition-value map-config-selects-multiple', multiple: 'multiple' });
                for (const o in field.properties[fieldValue].options) {
                    conditionValue.append($('<option>').attr('value', escapeHtml(field.properties[fieldValue].options[o].label)).text(escapeHtml(field.properties[fieldValue].options[o].label)))
                }
                narrowDownArea.find('.narrow-down-values').append(conditionValue);
                conditionValue.select2();
                break;

            case 'DATE':
            case 'TIME':
            case 'DATETIME':
            case 'CREATED_TIME':
            case 'UPDATED_TIME':
                conditionSelect.append(
                    $('<option>').attr('value', '=').text('=(等しい)'),
                    $('<option>').attr('value', '!=').text('≠(等しくない)'),
                    $('<option>').attr('value', '>=').text('≧(以降)'),
                    $('<option>').attr('value', '>').text('>(より後)'),
                    $('<option>').attr('value', '<=').text('≦(以前)'),
                    $('<option>').attr('value', '<').text('<(より前)')
                )

                conditionValue = $('<input>').attr({ class: 'kintoneplugin-input-text condition-value' })
                if (field.properties[fieldValue].type === 'DATE') {
                    conditionValue.attr('type', 'date')
                } else if (field.properties[fieldValue].type === 'TIME') {
                    conditionValue.attr('type', 'time')
                } else {
                    conditionValue.attr('type', 'datetime-local')
                }
                narrowDownArea.find('.narrow-down-values').append(conditionValue);
                break;

            case 'STATUS':
                conditionSelect.append(
                    $('<option>').attr('value', 'match').text('条件値を含む'),
                    $('<option>').attr('value', 'unmatch').text('条件値を含まない')
                )

                const statusResp = await window.fetch('../kintone/getStatus', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ domain: domain, app: CONF.appId, token: CONF.token })
                })
                const status = await statusResp.json();

                conditionValue = $('<select>').attr({ class: 'condition-value map-config-selects-multiple', multiple: 'multiple' });
                for (const key in status.states) {
                    conditionValue.append($('<option>').attr('value', escapeHtml(status.states[key].name)).text(escapeHtml(status.states[key].name)))
                }
                narrowDownArea.find('.narrow-down-values').append(conditionValue);
                conditionValue.select2();
                break;
            // case 'USER_SELECT':
            // case 'ORGANIZATION_SELECT':
            // case 'GROUP_SELECT':
            // case 'CREATOR':
            // case 'MODIFIER':
            //     conditionSelect.append(
            //         $('<option>').attr('value', 'match').text('条件値を含む'),
            //         $('<option>').attr('value', 'unmatch').text('条件値を含まない')
            //     )
            //     break;
        }
    }
}

const countRownumber = () => {
    if ($('.narrow-down-configs').length === 2) {
        $('.condition-remove').hide();
        $('.narrow-down-radio').hide();
    } else {
        $('.condition-remove').show();
        $('.narrow-down-radio').show();
    }
}

$('.narrow-down-field').off('change').change(async function () {
    const value = $(this).val();
    await changeConditionField(value, $(this).parents('.narrow-down-configs'));
})

$('.condition-add').click(function () {
    $('.narrow-down-configs').eq(0).clone(true).removeClass("first-config").insertAfter($(this).parents('.narrow-down-configs'));
    countRownumber();
})

$('.condition-remove').click(function () {
    $(this).parents('.narrow-down-configs').find('.narrow-down-field').click().val('').change();
    $(this).parents('.narrow-down-configs').remove();
    countRownumber();
})

const defaultNarrowDown = (CONF) => {
    for (let i = 1; i <= CONF.narrow_row_number; i++) {
        const condition = CONF['narrow_row' + i];
        console.log(condition)
        $('.condition-add').eq(i - 1).click();
        $(`.narrow-down-configs:eq(${i}) .narrow-down-field`).val(condition.field).change();

        setTimeout(() => {
            $(`.narrow-down-configs:eq(${i}) .condition`).val(condition.condition);
            $(`.narrow-down-configs:eq(${i}) .condition-value`).val(condition.value).change();
        }, 500)
    }

    $(`input[name="andor"][value="${CONF['narrow_row1'].andor}"]`).attr('hecked', true).prop('checked', true);
}


/* =======================================================ボタンクリックなど============================================== */

export const saveNarrow = async () => {
    const fieldConditions = [];
    const andor = fieldConditions.length <= 1 ? 'and' : $('input[name="andor"]:checked').val();
    for (let i = 1; i < $('.narrow-down-configs').length; i++) {
        if ($(`.narrow-down-configs:eq(${i}) .narrow-down-field`).val() !== '') {
            fieldConditions.push({
                field: $(`.narrow-down-configs:eq(${i}) .narrow-down-field`).val(),
                condition: $(`.narrow-down-configs:eq(${i}) .condition`).val(),
                value: JSON.stringify($(`.narrow-down-configs:eq(${i}) .condition-value`).val()),
                andor: andor
            })
        }
    }

    await window.fetch("../setNarrow", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ id: CONF.id, conditions: fieldConditions })
    })

    $('.narrow-down-configs:not(:eq(0))').remove();
    $('.narrow-down-configs:eq(0) .narrow-down-field option:not(:eq(0))').remove()
    $('.narrow-down-configs:eq(0) .narrow-down-conditions').empty();
    $('.narrow-down-configs:eq(0) .narrow-down-values').empty();
    $('#configuration_type').css('display', 'block');
    $('#map_narrow_down').css('display', 'none');

    return fieldConditions;
}

$('#narrow_down_calsel').click(() => {

    $('.narrow-down-configs:not(:eq(0))').remove();
    $('.narrow-down-configs:eq(0) .narrow-down-field option:not(:eq(0))').remove()
    $('.narrow-down-configs:eq(0) .narrow-down-conditions').empty();
    $('.narrow-down-configs:eq(0) .narrow-down-values').empty();
    $('#configuration_type').css('display', 'block');
    $('#map_narrow_down').css('display', 'none');
})

$('#narrow_down_clear').click(function () {
    for (let i = 1; i < $('.narrow-down-configs').length; i++) {
        $(`.narrow-down-configs:eq(${i}) .narrow-down-field`).val('').change();
        if (i !== 1) {
            $('.narrow-down-configs').eq(i).remove();
            i--;
        }
    }

    countRownumber();
})