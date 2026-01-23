
const to16 = (num) => {
    const hex = num.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
}

export const saveMapConfig = async (config, key, checkLogin, users, localStorageKey) => {
    try {
        $('.error-message-space').hide()
        let error = false
        let configName = $('#config_name').val()
        if (configName === '') {
            //設定の名前が空白の時、デフォルトの「設定」を入れる
            configName = '設定'
        }

        const appId = $('#appId').val();
        const token = $('#token').val();
        let centerLat = $('#center_lat').val();
        let centerLng = $('#center_lng').val();
        const marker = $('#marker').val();
        const latitude = $('#lat').val();
        const longitude = $('#lng').val();
        const name = $('#name').val();
        const group = $('#group').val();
        const color = $('#color').val();
        const mapTile = $('#map_tile').val();
        const openURL = $('#open_url_name').val();
        const addImage = {
            checkRegistration: $('input#check_registration_1').prop('checked'),
            imageField: $('#image_field').val(),
            RegistrationAllImage: $('input#check_registration_image_type_1').prop('checked'),
            imageDateTime: $('input#registration_datetime').prop('checked'),
            imageDateTimeField: $('#image_datetime_field').val()
        }

        if (appId === '') {
            $('#app_id_error').show().text('アプリIDを入力してください。');
            error = true;
            // throw new Error('アプリIDが設定されていません。');
        }
        if (token === '') {
            $('#token_error').show().text('APIトークンを入力してください。')
            error = true;
            // throw new Error('トークンが設定されていません。')
        }
        if (latitude === '') {
            $('#latitude_error').show().text('緯度を設定してください。')
            error = true;
            // throw new Error('緯度が設定されていません。')
        }
        if (longitude === '') {
            $('#longitude_error').show().text('経度を設定してください。')
            error = true;
            // throw new Error('経度が設定されていません。')
        }
        if (name === '') {
            $('#name_error_error').show().text('ピンの名前を設定してください。')
            error = true;
            // throw new Error('ピンの名前が入力されていません。');
        }

        if (!(/^[a-zA-Z0-9]*$/.test(openURL.trim()))) {
            //英数字のみ
            $('#open_url_name_error').show().text('公開用のURLは半角英数字のみにしてください。')
            error = true;
            // throw new Error('公開用のURLは半角英数字のみにしてください。')
        } else if (openURL.trim().length >= 256) {
            $('#open_url_name_error').show().text('公開用のURLは255文字以下にしてください。')
            error = true;
            // throw new Error('公開用のURLは255文字以下にしてください。')
        }

        if (centerLat === '') {
            centerLat = '35.468153'
        }
        if (centerLng === '') {
            centerLng = '133.048565'
        }

        if (addImage.checkRegistration) {
            if (addImage.imageField === '') {
                $('#image_field_error').show().text('画像を保存するフィールドが設定されていません。')
                error = true;
                // throw new Error('画像を保存するフィールドが設定されていません。')
            }
            if (addImage.imageDateTime && addImage.imageDateTimeField === '') {
                $('#image_datetime_error').show().text('画像の日時を保存するフィールドが設定されていません。')
                error = true;
                // throw new Error('画像の日時を保存するフィールドが設定されていません。')
            }
        }

        if (error) {
            throw new Error('正しく設定ができていない場所があります。確認して設定してください。')
        }

        let change_color_row_num = $('#cf-plugin-group-tbody >tr').length;
        const colors = {}
        for (let i = 0; i < change_color_row_num; i++) {
            let markerColor = $(`#cf-plugin-group-tbody >tr:eq(${i}) >td:eq(1) .show_select_color`).css('background-color');
            if (!/^#([A-Fa-f0-9]{6})$/.test(markerColor)) {
                const rgb = markerColor.replace(/(rgb\()|(\)$)/g, '').split(', ');
                markerColor = `#${to16(Number(rgb[0]))}${to16(Number(rgb[1]))}${to16(Number(rgb[2]))}`;
            }

            let iconColor = $(`#cf-plugin-group-tbody >tr:eq(${i}) >td:eq(3) .icon-colors .icon-color-selected`).css('background-color');

            if (!/^#([A-Fa-f0-9]{6})$/.test(iconColor)) {
                const rgb = iconColor.replace(/(rgb\()|(\)$)/g, '').split(', ');
                iconColor = `#${to16(Number(rgb[0]))}${to16(Number(rgb[1]))}${to16(Number(rgb[2]))}`;
            }
            colors['change_color_row' + (i + 1)] = {
                option: $(`#cf-plugin-group-tbody >tr:eq(${i}) >td:eq(0) p`).text(),
                color: markerColor,
                icon: $(`#cf-plugin-group-tbody >tr:eq(${i}) >td:eq(2) .icon`).val(),
                iconColor: iconColor,
            }
        }

        let popup_row_num = $('.popup_configs').length - 1;
        const popup = {}
        for (let i = 1; i <= popup_row_num; i++) {
            const popupField = $('.popup_configs:eq(' + i + ') #popup')
            if (popupField.val() !== '') {
                popup['popup_row' + i] = {
                    popupField: popupField.val(),
                    popupFieldName: $('.popup_configs:eq(' + i + ') #popup option[value="' + popupField.val() + '"]').text()
                }
            } else {
                popupField.remove();
                popup_row_num--;
                i--;
            }
        }

        let id = '', creater = checkLogin.id, user = [creater];
        if (config[key] !== undefined) {
            id = Number(config[key].id);
            creater = config[key].creater
        }

        if (checkLogin.authority !== 0) {
            for (let i = 0; i < users.length; i++) {
                if (users[i].authority === 0) {
                    user.push(users[i].id)
                    break;
                }
            }
        }

        const putConfig = {
            id: id,
            config: {
                domain: config.domainId,
                mapTitle: configName,
                openURL: openURL.trim(),
                appId: Number(appId),
                token: token,
                centerLat: Number(centerLat),
                centerLng: Number(centerLng),
                marker: marker,
                name: name,
                latitude: latitude,
                longitude: longitude,
                group: group,
                color: color,
                addImage: JSON.stringify(addImage),
                mapTile: mapTile,
                creater: creater
            },
            colors: colors,
            popup: popup,
            user: user
        }
        console.log(putConfig);

        const postConfig = await window.fetch("../setConfig", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(putConfig)
        });
        const post = await postConfig.json()

        $(`#${key} .config-name`).text(configName)

        if (openURL.trim() !== '') {
            $(`#${key} .check-open-map`).attr({ 'href': `https://solution.8clouds.co.jp/benri/${config.openDomain}/${openURL}`, 'target': '_blank' }).css({ 'display': 'block' });
        } else {
            $(`#${key} .check-open-map`).attr({ 'href': `` }).css({ 'display': 'none' });
        }
        $('#config_home_manu').css('display', 'none');
        $('#configuration_type').css('display', 'block');
        $('.map-config').css('display', 'none');

        const narrow = {};
        let narrow_row_number = 0;
        const mapShowUser = {};
        let users_row_number = 1;
        if (config[key]) {
            for (let i = 1; i <= config[key].narrow_row_number; i++) {
                narrow['narrow_row' + i] = config[key]['narrow_row' + i]
            }
            narrow_row_number = config[key].narrow_row_number

            for (let i = 1; i <= config[key].users_row_number; i++) {
                mapShowUser['user_row' + i] = config[key]['user_row' + i]
            }
            users_row_number = config[key].users_row_number
        } else {
            mapShowUser['user_row1'] = {
                user: users[0].id,
                edit: true,
                create: true,
                setConfig: true
            }

            if (checkLogin.authority !== 0) {
                mapShowUser['user_row2'] = {
                    user: checkLogin.id,
                    edit: true,
                    create: true,
                    setConfig: true
                }
                users_row_number = 2
            }
        }

        console.log(putConfig.id)
        if (putConfig.id === '') {
            //新規登録の場合、閲覧するマップを追加する
            checkLogin.showMaps.push({
                config: post.id,
                edit: true,
                create: true,
                set_config: true,
                user: checkLogin.id
            })
            console.log(checkLogin.showMaps)
            const loginConfig = {
                id: checkLogin.id,
                userId: checkLogin.userId,
                userName: checkLogin.userName,
                authority: checkLogin.authority,
                loginTime: checkLogin.loginTime,
                showMaps: checkLogin.showMaps
            }
            localStorage.setItem(localStorageKey, JSON.stringify(loginConfig));
        }

        return {
            id: post.id,
            domain: config.domainId,
            mapTitle: configName,
            appId: appId,
            token: token,
            centerLat: centerLat,
            centerLng: centerLng,
            marker: marker,
            latitude: latitude,
            longitude: longitude,
            name: name,
            group: group,
            color: color,
            change_color_row_num: change_color_row_num,
            popup_row_num: popup_row_num,
            mapTile: mapTile,
            craeter: creater,
            openURL: openURL.trim(),
            addImage: addImage,
            ...colors,
            ...popup,
            narrow_row_number,
            ...narrow,
            users_row_number,
            ...mapShowUser
        }

    } catch (error) {
        alert(error.message)
        console.error(error)
    }
}