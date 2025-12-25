export const changeUerConfig = async (users, num, passChange, id) => {
    //各値を取得
    let name = $('#user_name').val(),
        userId = $('#login_id').val(),
        pass = passChange ? $('#login_password').val() : '',
        email = $('#login_mail').val(),
        authority = 1;

    if (name === '') {
        //ユーザー名が空白の時、変更前のユーザー名を入れる
        name = users[num].name
    }
    if (userId === '') {
        //ログインIDが空白の時、変更前のユーザー名を入れる
        userId = users[num].userId
    }
    if (users[num].authority === 0) {
        //権限が管理者の時、権限を変更しない
        authority = 0;
    } else if ($('#authority-2').prop('checked')) {
        //チェックボックスにチェックが入っているとき、設定画面を開く権限を与える
        authority = 2;
    }

    const body = {
        id: id,
        userId: userId,
        name: name,
        password: pass,
        email: email,
        authority: authority
    }

    //ユーザーを更新する
    await window.fetch("../updateUser", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    $('#user_table_body tr#' + id + ' .user-name').text(name);
    $('#user_table_body tr#' + id + ' .user-id').text(userId);
    $('#user_table_body tr#' + id + ' .user-mail').text(email);

    if (pass === '') {
        pass = users[num].password
    }

    $('#show_Registration_information').css('display', 'block');
    $('#add_user_page').css('display', 'none');

    return {
        id: id,
        domain: users[num].domain,
        password: pass,
        user_id: userId,
        email: email,
        user_name: name,
        authority: authority
    }
}