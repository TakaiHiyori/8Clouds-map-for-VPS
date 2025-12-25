export const setConfigName = async (config, checkLogin) => {
    let num = 1;
    for (const key in config) {
        if (config[key].mapTitle === undefined) {
            continue
        } else {
            const clone = $('.map-configs').eq(0).clone(true);
            clone.find('input[name="valid-map"]').attr({ 'id': 'valid' + num, 'value': 'config' + num });
            clone.find('.valid-label').attr('for', 'valid' + num);
            clone.insertAfter($('.map-configs').eq(num - 1));
            $('.map-configs').eq(num).attr('id', key);

            $('#' + key + ' .config-name').text(config[key].mapTitle)
            if (!config[key].valid) {
                $('#' + key + ' #valid' + num).attr('checked', false).prop('checked', false);
                $('#' + key + ' .valid-label').css({ 'background-color': 'rgb(147 147 147)', 'box-shadow': 'inset 0 0 4px 0px rgb(125, 125, 125)', 'cursor': 'pointer' }).text('非表示');
                $('#' + key).css({ 'background-color': 'gainsboro' });
            } else {
                $('#' + key + ' #valid' + num).attr('checked', true).prop('checked', true);
            }
            if (config[key].openURL !== '') {
                $('#' + key + ' .check-open-map').attr({ 'href': `http://133.167.91.11/benri/${config.openDomain}/${config[key].openURL}`, 'target': '_blank' }).show();
            }

            if (checkLogin.authority !== 0 && config[key].creater !== checkLogin.id) {
                let checkShowUser = false, checkAuthority = false;
                for (let i = 1; i <= config[key].users_row_number; i++) {
                    if (config[key]['user_row' + i].user === checkLogin.id) {
                        checkShowUser = true;
                        if (config[key]['user_row' + i].setConfig) {
                            checkAuthority = true;
                        }
                        break;
                    }
                }

                if (!checkShowUser) {
                    $('#' + key).hide()
                } else if (!checkAuthority) {
                    //ユーザーの設定が取得できて、マップの設定の編集権限がないとき、入力不可にする
                    $('#' + key + ' .map').attr('disabled', true)
                    $('#' + key + ' .narrow-down').attr('disabled', true)
                    $('#' + key + ' .users').attr('disabled', true)
                    $('#' + key + ' input[name="valid-map"]').attr('disabled', true)
                    $('#' + key + ' .valid-label').css({ 'background-color': 'rgb(0, 199, 61);', 'box-shadow': 'inset 0 0 4px 0px rgb(12, 251, 31);', 'cursor': 'default' });
                    $('#' + key + ' .remove-config').attr('disabled', true)
                }
            }
            num++;
        }
    }

    if (num === 1) {
        const clone = $('.map-configs').eq(0).clone(true);
        clone.find('input[name="valid-map"]').attr({ 'id': 'valid' + num, 'value': 'config' + num });
        clone.find('.valid-label').attr('for', 'valid' + num);
        clone.insertAfter($('.map-configs').eq(num - 1));
        $('.map-configs').eq(1).attr('id', 'config1');

        $('#config1 .config-name').text('設定')
        $('#config1 .valid-label').css({ 'cursor': 'default' }).text('表示');
    }

    if ($('.map-configs').length === 2) {
        $('.remove-config').eq(1).hide();
    }
    $('.loading-content').attr('class', 'loading-content loaded')
}