export const addUserClick = async (setUserInfo: any, domainId: number, users: any, id: number) => {
  const link: string = location.href.replace(/[^/]+$/, '')
  console.log(setUserInfo);
  console.log(users);

  setUserInfo.user_autority = setUserInfo.user_autority ? '2' : '1';
  if (setUserInfo.check_passwoed !== undefined) {
    try {
      console.log(id)
      //ユーザーを更新する
      await window.fetch(link + "updateUser", {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...setUserInfo, id: id })
      });

      return {
        id: id,
        domain: domainId,
        user_id: setUserInfo.user_id,
        user_name: setUserInfo.user_name,
        password: setUserInfo.password,
        email: setUserInfo.user_email,
        autority: setUserInfo.user_autority
      }

    } catch (e: any) {
      return 'ユーザーの更新に失敗しました。'
    }

  } else {
    const userFilter = users.filter((u: any) => u.user_id === setUserInfo.user_id);
    console.log(userFilter)

    if (userFilter.length >= 1) {
      return `ログインID「${setUserInfo.user_id}」はすでに登録されています。`
    } else {
      //ユーザーを登録する
      const response = await window.fetch(link + "setUser", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...setUserInfo, domain: domainId })
      });
      if (!response.ok) {
        return `ユーザーの登録に失敗しました。`
      } else {

        const result = await response.json();

        return {
          id: Number(result.id),
          domain: domainId,
          user_id: setUserInfo.user_id,
          user_name: setUserInfo.user_name,
          password: setUserInfo.password,
          email: setUserInfo.user_email,
          autority: setUserInfo.user_autority
        }

      }
    }
  }
}