export const onLoginSubmit = async (login: any, getDomainText: string) => {
  console.log(login)
  const userID = login.userID;
  const password = login.password;

  const body = {
    domain: getDomainText,
    id: userID,
    pass: password
  }

  const loginResp = await window.fetch("./checkLogin", {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  console.log(loginResp)
  const result = await loginResp.json();
  console.log(result)

  if (result.success) {
    if (result.user.email === '') {
      return {
        success: true,
        email: false,
        result: result
      }
    } else {
      return {
        success: true,
        email: true,
        result: result
      }
    }
  } else {
    return {
      success: false,
      message: 'ログインIDまたはパスワードが間違えています。'
    }
  }
}