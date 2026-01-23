
export const setMapConfig = (config: any, link: string) => {
  let configCheck = false; //設定があるかを判定する

  for (const key in config) {
    if (config[key].mapTitle) {
      const configInfo = document.getElementsByClassName('map-configs');
      configCheck = true
    }
  }
}