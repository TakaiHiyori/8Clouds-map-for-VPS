import { ColorTable } from './createColorTable'

export const countPopupRowNumber = () => {
    if ($('.popup_configs').lengtu <= 2) {
        $('.popup_configs .remove').hide()
    } else {
        $('.popup_configs .remove').show()
    }
}

export const setDefault = (config, key, fieldResp) => {
    console.log('setDefault')
    for (let i = 1; i < $('.popup_configs').length; i++) {
        $('.popup_configs').eq(i).remove()
        i--;
    }
    $('.cf-plugin-gropu-table').remove();
    if (config[key] !== undefined) {
        const CONF = config[key];
        console.log(CONF)
        if (CONF.addImage) {
            if (typeof CONF.addImage === 'string') {
                CONF.addImage = JSON.parse(CONF.addImage);
            }
            const checkRegistration = CONF.addImage.checkRegistration ? '1' : '0'
            $(`input[name="check-registration"][value="${checkRegistration}"]`).attr('checked', true).prop('checked', true).change()
            $('#image_field').val(CONF.addImage.imageField);
            const checkRegistrationType = CONF.addImage.RegistrationAllImage ? '1' : '0'
            $(`input[name="check-registration-image-type"][value="${checkRegistrationType}"]`).attr('checked', true).prop('checked', true)
            $(`input[name="registration-datetime"]`).attr('checked', CONF.addImage.imageDateTime).prop('checked', CONF.addImage.imageDateTime).change()
            $('#image_datetime_field').val(CONF.addImage.imageDateTimeField);
        }

        $('#config_name').val(CONF.mapTitle).attr('disabled', true)
        $('#open_url_name').val(CONF.openURL)
        if (CONF.openURL !== '') {
            $('#open_url').text(`https://solution.8clouds.co.jp/benri/${config.openDomain}/${CONF.openURL}`).attr({ 'href': `https://solution.8clouds.co.jp/benri/${config.openDomain}/${CONF.openURL}`, 'target': '_blank' })
        }

        $('#appId').val(CONF.appId)
        $('#token').val(CONF.token)
        $('#center_lat').val(CONF.centerLat)
        $('#center_lng').val(CONF.centerLng)
        $(`#marker`).val(CONF.marker);
        $(`#lat`).val(CONF.latitude);
        $(`#lng option[value="${CONF.latitude}"]`).css('display', 'none');

        $(`#lng`).val(CONF.longitude);
        $(`#lat option[value="${CONF.longitude}"]`).css('display', 'none');

        $(`#name`).val(CONF.name);
        $(`#group`).val(CONF.group);
        $(`#color`).val(CONF.color);
        $(`#map_tile`).val(CONF.mapTile);

        if ($(`#color`).val() !== '') {
            ColorTable(fieldResp.properties[CONF.color], CONF)
        }

        if (CONF.popup_row_num === 0) {
            $('.popup_configs').eq(0).clone(true).insertAfter(
                $('.popup_configs').eq(0)
            )
            $('.popup_configs').eq(1).attr('id', '')
        }

        for (let i = 1; i <= CONF.popup_row_num; i++) {
            $('.popup_configs').eq(0).clone(true).insertAfter(
                $('.popup_configs').eq(i - 1)
            )
            $('.popup_configs').eq(i).attr('id', '')

            if (!CONF['popup_row' + i]) {
                break;
            }
            $('.popup_configs:eq(' + i + ') #popup').val(CONF['popup_row' + i].popupField);

            for (let j = 0; j < $('.popup_configs').length; j++) {
                if ($(`.popup_configs:eq(${j}) #popup`).val() !== CONF['popup_row' + i].popupField) {
                    $(`.popup_configs:eq(${j}) #popup option[value="${CONF['popup_row' + i].popupField}"]`).css('display', 'none');
                }
            }
        }
    } else {
        $('.popup_configs').eq(0).clone(true).insertAfter(
            $('.popup_configs').eq(0)
        )
        $('.popup_configs').eq(1).attr('id', '')
    }
    countPopupRowNumber()
}