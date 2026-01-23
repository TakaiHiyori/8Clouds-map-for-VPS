import { getUser } from '../user/getUser';
// import { setMapConfig } from './setMapConfig';

export const setConfigs = async (mapDomain: string, result: any, link: any) => {
  try {
    console.log(document.getElementById('loading'))
    if (document.getElementById('loading')) {
      document.getElementById('loading')?.remove();
    }
    // const getConfigParams = new URLSearchParams({ domain: mapDomain, user: result.loginUserInfomation.id });
    // const configResp = await fetch(`${link}getAllConfig?${getConfigParams.toString()}`);

    // if (!configResp.ok) {
    //   throw new Error('設定内容を取得できませんでした。');
    // }

    // let config = await configResp.json();
    // console.log(config)

    // let user = await getUser(mapDomain, result.loginUserInfomation);
    // console.log(user)

    // setMapConfig(config, link)

    // return user
  } catch (e: any) {
    alert(e.message);
    console.error(e)
  }
}