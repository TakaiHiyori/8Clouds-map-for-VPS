export const ColorTable = (color, CONF) => {
    console.log(CONF)
    console.log(color)

    $('.cf-plugin-gropu-table').remove();
    if (!color) {
        return;
    }
    let ColorTable = `<table class="cf-plugin-gropu-table kintoneplugin-table">
                        <thead><tr><th class="kintoneplugin-table-th"><span class="title">選択肢</span></th>
                        <th class="kintoneplugin-table-th"><span class="title">ピンの色</span></th>
                        <th class="kintoneplugin-table-th"><span class="title">ピンのアイコン</span></th>
                        <th class="kintoneplugin-table-th"><span class="title">アイコンの色</span></th>
                        </tr></thead><tbody id="cf-plugin-group-tbody">`;

    let colors = `<div class="icon-colors">
                                <div class="icon-ffffff icon-color-selected" style="background-color: #ffffff"></div>
                                <div class="icon-000000" style="background-color: #000000"></div>
                        </div>`

    let icons = `<option value="circle">-----</option>
                        <option value="home">家</option>
                        <option value="building">ビル</option>
                        <option value="store">お店</option>
                        <option value="school">学校</option>
                        <option value="hospital">病院</option>
                        <option value="warehouse">倉庫</option>
                        <option value="user">人</option>
                        <option value="car">車</option>
                        <option value="road">道</option>
                        <option value="utensils">食器</option>
                        <option value="coffee">コーヒー</option>
                        <option value="check">チェック</option>
                        <option value="book">本</option>
                        <option value="phone">電話</option>
                        <option value="envelope">メール</option>
                        <option value="fire">炎</option>`

    const colorPalette = `<div class="color_palette_button">
                                        <div class="show_select_color"></div>
                                        <div class="button_picker"></div>
                                </div>
                                <div class="color_options" style="display: none">
                                        <div class="color_options_body">
                                                <div class="colors" id="#FF0000" style="background-color: #FF0000"></div>
                                                <div class="colors" id="#FFCCCB" style="background-color: #FFCCCB"></div>
                                                <div class="colors" id="#8b0000" style="background-color: #8b0000"></div>
                                                <div class="colors" id="#ffa500" style="background-color: #ffa500"></div>
                                                <div class="colors" id="#eedcb3" style="background-color: #eedcb3"></div>
                                                <div class="colors" id="#008000" style="background-color: #008000"></div>
                                                <div class="colors" id="#006400" style="background-color: #006400"></div>
                                                <div class="colors" id="#90ee90" style="background-color: #90ee90"></div>
                                                <div class="colors" id="#0093ff" style="background-color: #0093ff"></div>
                                                <div class="colors" id="#00008b" style="background-color: #00008b"></div>
                                                <div class="colors" id="#ADD8E6" style="background-color: #ADD8E6"></div>
                                                <div class="colors" id="#800080" style="background-color: #800080"></div>
                                                <div class="colors" id="#871F78" style="background-color: #871F78"></div>
                                                <div class="colors" id="#f5b2b2" style="background-color: #f5b2b2"></div>
                                                <div class="colors" id="#f0f8ff" style="background-color: #f0f8ff"></div>
                                                <div class="colors" id="#ffffff" style="background-color: #ffffff"></div>
                                                <div class="colors" id="#808080" style="background-color: #808080"></div>
                                                <div class="colors" id="#d3d3d3" style="background-color: #d3d3d3"></div>
                                                <div class="colors" id="#000000" style="background-color: #000000"></div>
                                        </div>
                                </div>`

    let createTable = ''; //テーブル内要素の作成
    let count = 0; //ループを数える
    for (const key in color.options) {
        const option = color.options[key];
        createTable += '<tr class="cf-plugin-group-line"><td><div class="kintoneplugin-table-td-control"><div class="kintoneplugin-table-td-control-value text"><p>' + option.label + '</p></div></div></td>' +
            '<td><div class="kintoneplugin-table-td-control"><div class="kintoneplugin-table-td-control-value">' + colorPalette + '</div></div></td>' +
            '<td><div class="kintoneplugin-table-td-control"><div class="kintoneplugin-table-td-control-value"><select class="icon map-config-selects">' +
            icons + '</select></div></div></td>' +
            '<td><div class="kintoneplugin-table-td-control"><div class="kintoneplugin-table-td-control-value">' + colors + '</div></div></td></tr>';
        count++;
    }
    ColorTable += createTable + '</tbody></table>';

    $('#color_teble').append($(ColorTable));
    if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
        for (let i = 0; i < $('#cf-plugin-group-tbody tr').length; i++) {
            $('#cf-plugin-group-tbody tr:eq(' + i + ') td:eq(1) .kintoneplugin-table-td-control-value').prepend('<div class="td-name">ピンの色</div>')
            $('#cf-plugin-group-tbody tr:eq(' + i + ') td:eq(2) .kintoneplugin-table-td-control-value').prepend('<div class="td-name">ピンのアイコン</div>')
            $('#cf-plugin-group-tbody tr:eq(' + i + ') td:eq(3) .kintoneplugin-table-td-control-value').prepend('<div class="td-name">アイコンの色</div>')
        }
    }

    if ($('#marker').val() === 'pin') {
        $('#cf-plugin-group-tbody > tr .icon').attr('disabled', false)
    } else {
        $('#cf-plugin-group-tbody > tr .icon').attr('disabled', true)
    }
    if (CONF) {
        if (color.code === CONF.color) {
            if (CONF.marker === 'pin') {
                $('#cf-plugin-group-tbody > tr .icon').attr('disabled', false).css('background-color', '#f7f9fa')
                $('#cf-plugin-group-tbody > tr .icon_colors').css('background-color', '#f7f9fa')
            } else {
                $('#cf-plugin-group-tbody > tr .icon').attr('disabled', true).css('background-color', '#dddddd')
                $('#cf-plugin-group-tbody > tr .icon_colors').css('background-color', '#dddddd')
            }

            for (let c = 0; c < CONF.change_color_row_num; c++) {
                if (!CONF['change_color_row' + (c + 1)]) {
                    continue;
                }
                for (let i = 0; i < $('#cf-plugin-group-tbody > tr').length; i++) {
                    if ($('#cf-plugin-group-tbody > tr:eq(' + i + ') .text').text() === CONF['change_color_row' + (c + 1)].option) {
                        $('#cf-plugin-group-tbody > tr:eq(' + i + ') .show_select_color').css('background-color', CONF['change_color_row' + (c + 1)].color);
                        $('#cf-plugin-group-tbody > tr:eq(' + i + ') .icon').val(CONF['change_color_row' + (c + 1)].icon);

                        $('#cf-plugin-group-tbody > tr:eq(' + i + ') .icon-colors div.icon-ffffff').attr('class', `icon-ffffff`);
                        $('#cf-plugin-group-tbody > tr:eq(' + i + ') .icon-colors div.icon-' + CONF['change_color_row' + (c + 1)].iconColor.replace('#', '')).attr('class', `icon-${CONF['change_color_row' + (c + 1)].iconColor} icon-color-selected`);
                    }
                }
            }
        }
    }
    $('#marker').change(() => {
        if ($('#marker').val() === 'pin') {
            $('#cf-plugin-group-tbody > tr .icon').attr('disabled', false).css({ 'background-color': '#f7f9fa', 'cursor': 'pointer' })
            $('#cf-plugin-group-tbody > tr .icon_colors').css({ 'background-color': '#f7f9fa', 'cursor': 'default' })
        } else {
            $('#cf-plugin-group-tbody > tr .icon').attr('disabled', true).css({ 'background-color': '#dddddd', 'cursor': 'default' })
            $('#cf-plugin-group-tbody > tr .icon_colors').css({ 'background-color': '#dddddd', 'cursor': 'default' })
        }
    });

    $('#cf-plugin-group-tbody .color_palette_button').off('click').click((e) => {
        const showColor = e.delegateTarget.children[0]
        const colorModal = e.delegateTarget.nextElementSibling;

        for (let i = 0; i < document.querySelectorAll('.color_options').length; i++) {
            if (colorModal !== document.querySelectorAll('.color_options')[i]) {
                document.querySelectorAll('.color_options')[i].style.display = 'none'
            }
        }

        if (colorModal.style.display === 'none') {
            colorModal.style.display = 'flex'

            $('.colors').off('click').click((c) => {
                const color = c.target.id
                showColor.style.background = color
                colorModal.style.display = 'none'
            })
        } else {
            colorModal.style.display = 'none'
        }
    })

    $('body').off('click').click((e) => {
        let isDuplicate = false;
        if (e.originalEvent) {
            for (let i = 0; i < document.querySelectorAll('.color_palette_button').length; i++) {
                if (e.originalEvent.target === document.querySelectorAll('.button_picker')[i]) {
                    isDuplicate = true;
                    break;
                } else if (e.originalEvent.target === document.querySelectorAll('.show_select_color')[i]) {
                    isDuplicate = true;
                    break;
                } else if (e.originalEvent.target === document.querySelectorAll('.color_palette_button')[i]) {
                    isDuplicate = true;
                    break;
                } else if (e.originalEvent.target === document.querySelectorAll('.color_options')[i]) {
                    isDuplicate = true;
                    break;
                }
            }
        }

        if (!isDuplicate) {
            for (let i = 0; i < document.querySelectorAll('.color_options').length; i++) {
                document.querySelectorAll('.color_options')[i].style.display = 'none'
            }
        }
    })

    $('.icon-colors > div').off('click').click((e) => {
        if ($('#marker').val() === 'pin') {
            for (let i = 0; i < document.querySelectorAll('.icon-colors').length; i++) {
                if (e.delegateTarget.parentNode === document.querySelectorAll('.icon-colors')[i]) {
                    if (e.delegateTarget === document.querySelectorAll('.icon-colors')[i].children[0]) {
                        $('.icon-colors:eq(' + i + ') > div').eq(0).attr('class', 'icon-ffffff icon-color-selected');
                        $('.icon-colors:eq(' + i + ') > div').eq(1).attr('class', 'icon-000000');
                    } else {
                        $('.icon-colors:eq(' + i + ') > div').eq(0).attr('class', 'icon-ffffff');
                        $('.icon-colors:eq(' + i + ') > div').eq(1).attr('class', 'icon-000000  icon-color-selected');
                    }
                }
            }
        }
    })
}