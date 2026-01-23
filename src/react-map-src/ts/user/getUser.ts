
export const getUser = async (mapDomain: string, loginUserInfomation: any) => {
  const params = new URLSearchParams({ domain: mapDomain })
  const getUserResp = await fetch(`./getUsers?${params.toString()}`);

  if (!getUserResp.ok) {
    throw new Error('ユーザーを取得できませんでした。');
  }

  const getUser = await getUserResp.json();

  const userInfo = document.getElementsByClassName('user-info');
  console.log(userInfo);

  if (loginUserInfomation.authority === 0) {
    for (let i = getUser.length - 1; i >= 0; i--) {
      const clone: any = userInfo[0].cloneNode(true);

      const detailButton = clone.getElementsByClassName('user-edit-button');
      detailButton[0].id = `user_detail_${getUser[i].id}`;

      const deleteButton = clone.getElementsByClassName('user-delete-button');
      if (getUser[i].authority === 0) {
        deleteButton[0].remove();
      } else {
        deleteButton[0].id = `user_delete_${getUser[i].id}`;
      }

      const loginId = clone.getElementsByClassName('show-login-id');
      const userName = clone.getElementsByClassName('show-user-name');
      const email = clone.getElementsByClassName('show-user-email');

      loginId[0].textContent = getUser[i].user_id;
      userName[0].textContent = getUser[i].user_name;

      if (getUser[i].email !== '') {
        email[0].textContent = getUser[i].email
      }

      userInfo[0].after(clone);
    }
  } else {
    for (let i = getUser.length - 1; i >= 0; i--) {
      if (getUser[i].id === loginUserInfomation.id) {
        const clone: any = userInfo[0].cloneNode(true);

        const detailButton = clone.getElementsByClassName('user-edit-button');
        detailButton[0].id = `user_detail_${getUser[i].id}`;

        const deleteButton = clone.getElementsByClassName('user-delete-button');
        deleteButton[0].remove();

        const loginId = clone.getElementsByClassName('show-login-id');
        const userName = clone.getElementsByClassName('show-user-name');
        const email = clone.getElementsByClassName('show-user-email');

        loginId[0].textContent = getUser[i].user_id;
        userName[0].textContent = getUser[i].user_name;

        if (getUser[i].email !== '') {
          email[0].textContent = getUser[i].email
        }

        userInfo[0].after(clone);
        break;
      }
    }
  }

  return getUser
}