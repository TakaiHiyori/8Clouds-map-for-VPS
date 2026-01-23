
export const checkLogin = (mapDomain: string) => {
  let login = false
  const localStorageKey: string = `map_${mapDomain}`
  const loginInfomationResp: null | string = localStorage.getItem(localStorageKey);

  if (loginInfomationResp) {
    const loginUserInfomation = JSON.parse(loginInfomationResp);
    console.log(loginUserInfomation)

    if (Date.now() - (4 * 60 * 60 * 1000) > loginUserInfomation.loginTime) {
      localStorage.removeItem(localStorageKey);
      return {
        login: login,
        loginUserInfomation: null,
        userName: ''
      }
    } else {
      login = true;

      const userName = loginUserInfomation.userName
      // if (loginUserInfomation.authority === 1) {
      //   //ログインユーザーの権限が1(マップの設定権限がない)の時
      //   $('#config_button').hide()
      //   $('#logout-config hr').hide();
      // }
      // // $('#new_record').css('display', 'block');
      // login = true;
      // if ((/iPhone|Android.+Mobile|macintosh/).test(navigator.userAgent) || "ontouchend" in document) {
      //   $('#config_button').hide();
      //   $('#logout-config > hr').hide();
      // }
      return {
        login: login,
        loginUserInfomation: loginUserInfomation,
        userName: userName
      }
    }

  } else {
    return {
      login: login,
      loginUserInfomation: null,
      userName: ''
    }
  }

}