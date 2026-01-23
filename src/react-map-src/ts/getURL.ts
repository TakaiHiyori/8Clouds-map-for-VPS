
export const getURL = async () => {
  let getPageURL: null | any = location.href.match(/[^/]+$/);
  // const parts: any[] = location.pathname.split('/');
  // console.log(parts)
  const mapDomain = window.location.hostname

  // for (let i = 0; i < parts.length; i++) {
  //   if (parts[i - 1] === 'benri') {
  //     getPageURL = parts[i + 1];
  //   }
  // }
  const getDomainResp = await fetch('./getDomain', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ domain: mapDomain })
  })

  const getDomain = await getDomainResp.json()
  if (getDomain.success) {
    return getPageURL ? getPageURL[0] : null
  } else {
    return null
  }
}