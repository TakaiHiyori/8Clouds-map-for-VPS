export const removeConfig = async (e, config, checkLogin, domainText) => {
    const showMapLocalStorageKey = `show_map_${domainText}_${JSON.parse(checkLogin).id}`
    let showMapInformation = JSON.parse(localStorage.getItem(showMapLocalStorageKey))
    console.log(showMapInformation)
    let value = e.target.parentNode.id

    if (!config[value]) {
        $(`#${value}`).remove()
        if ($('.remove-config').length === 2) {
            $('.remove-config').eq(1).hide();
        }

        for (let i = 1; i < $('.map-configs').length; i++) {
            $(`.map-configs:eq(${i}) input[type="chheckbox"]`).attr({ 'id': 'valid' + i, 'value': 'config' + i });
            $(`.map-configs:eq(${i}) .valid-label`).attr({ 'for': 'valid' + i });
        }
    } else {
        const result = window.confirm('設定を削除します。よろしいですか?\n注意：この動作は戻せません。');
        if (result) {
            if (config[value] !== undefined) {
                const id = config[value].id;
                await window.fetch('../deleteConfig', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id: id })
                });
                delete config[value]

                if (showMapInformation.key === value) {
                    localStorage.removeItem(showMapLocalStorageKey);
                    showMapInformation = {}
                }
            }
            $(`#${value}`).remove()
            if ($('.remove-config').length === 2) {
                $('.remove-config').eq(1).hide();
            }

            const showConfig = showMapInformation.key
            for (let i = 1; i < $('.map-configs').length; i++) {
                if (value !== 'config' + i) {
                    config['config' + i] = config['config' + i];
                } else {
                    config['config' + i] = config['config' + (i + 1)];
                    if (showConfig === 'config' + (i + 1)) {
                        showMapInformation.key = 'config' + i;
                        localStorage.setItem(showMapLocalStorageKey, JSON.stringify(showMapInformation));
                    }
                    value = 'config' + (i + 1);
                }
                $(`.map-configs:eq(${i}) input[type="chheckbox"]`).attr({ 'id': 'valid' + i, 'value': 'config' + i });
                $(`.map-configs:eq(${i}) .valid-label`).attr({ 'for': 'valid' + i });
            }
        }
    }
}