export const addPostUser = async (domain, users) => {
    try {
        //各値を取得
        const name = $('#user_name').val().replace(/\s*$/g, '');
        const id = $('#login_id').val().replace(/\s*$/g, '');
        const password = $('#login_password').val().replace(/\s*$/g, '');
        const email = $('#login_mail').val().replace(/\s*$/g, '');
        let authority = 1

        if ($('input[name="authority"]:checked').length !== 0) {
            authority = 2
        }

        const body = {
            name: name,
            id: id,
            password: password,
            domain: domain,
            email: email,
            authority: authority
        }

        if (name === '') {
            //ユーザー名がない場合、エラー
            throw new Error('ユーザー名が入力されていません');
        } else if (id === '') {
            //ログインIDがない場合、エラー
            throw new Error('ログインIDが入力されていません');
        } else if (password === '') {
            //パスワードがない場合、エラー
            throw new Error('パスワードが入力されていません');
        } else {
            //同じログインIDで登録しようとしたとき、エラーにする
            for (let i = 0; i < users.length; i++) {
                if (users[i].ser_id === id) {
                    throw new Error('そのユーザーは既に登録されています。');
                }
            }

            //ユーザーを登録する
            const response = await window.fetch("../setUser", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });
            const result = await response.json();

            //画面を戻る
            $('#show_Registration_information').css('display', 'block');
            $('#add_user_page').css('display', 'none');

            //ユーザーを表示するテーブルに1行を増やす
            const row = $('#user_table_body tr').length
            $('#user_table_body >tr').eq(0).clone(true).insertAfter($('#user_table_body tr').eq(row - 1));
            $('#user_table_body tr:eq(' + row + ') .user-name').text(name);
            $('#user_table_body tr:eq(' + row + ') .user-id').text(id);
            $('#user_table_body tr:eq(' + row + ') .user-mail').text(email);
            $('#user_table_body tr:eq(' + row + ')').attr('id', result.userId);

            return {
                id: Number(result.userId),
                domain: domain,
                user_id: id,
                password: password,
                user_name: name,
                email: email,
                authority: authority
            }
        }
    } catch (error) {
        alert(error.message);
        console.error(error)
    }
}