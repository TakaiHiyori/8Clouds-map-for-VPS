import { escapeHtml } from "../escapeHtml.mjs";
import { setDefault } from "./setMapConfigDefault.mjs";

export const showDropdown = (fieldResp, key, config) => {
    console.log('setDropdown')
    for (const key in fieldResp.properties) {
        const prop = fieldResp.properties[key];
        const $option = $('<option>')

        switch (prop.type) {
            case '__REVISION__':
            case 'SUBTABLE':
            case 'RICH_TEXT':
            case 'GROUP':
            case 'REFERENCE_TABLE':
            case 'LABEL':
            case 'SPACER':
            case 'HR':
            case 'CATEGORY':
            case 'STATUS':
            case 'STATUS_ASSIGNEE':
                break;


            case 'NUMBER':
                console.log($('#lat'))
                $option.attr('value', escapeHtml(prop.code));
                $option.text(escapeHtml(prop.label));
                console.log($option)
                if (prop.lookup === undefined && !prop.expression) {
                    $('#lat').append($option.clone());
                    $('#lng').append($option.clone());
                    $('#name').append($option.clone());
                }
                $('#popup').append($option.clone());
                break;

            case 'DROP_DOWN':
            case 'RADIO_BUTTON':
                $option.attr('value', escapeHtml(prop.code));
                $option.text(escapeHtml(prop.label));
                $('#group').append($option.clone());
                $('#color').append($option.clone());
                $('#popup').append($option.clone());
                break;

            case 'SINGLE_LINE_TEXT':
                $option.attr('value', escapeHtml(prop.code));
                $option.text(escapeHtml(prop.label));
                $('#popup').append($option.clone());
                if (prop.lookup === undefined && prop.expression === '') {
                    $('#name').append($option.clone());
                }
                break;

            case 'FILE':
                $option.attr('value', escapeHtml(prop.code));
                $option.text(escapeHtml(prop.label));
                $('#popup').append($option.clone());
                $('#image_field').append($option.clone());
                break;

            case 'DATETIME':
                $option.attr('value', escapeHtml(prop.code));
                $option.text(escapeHtml(prop.label));
                $('#popup').append($option.clone());
                $('#image_datetime_field').append($option.clone());
                break;

            default:
                $option.attr('value', escapeHtml(prop.code));
                $option.text(escapeHtml(prop.label));
                $('#popup').append($option.clone());
                break;
        }
    }
    setDefault(config, key, fieldResp);
}