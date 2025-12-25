/**
 * kintoneのAPIを使用する
 * @author 髙井
 */
/**
 * 修正日：2025/10/29～2025/10/31
 * 修正内容
 * 　DB内のレコードを取得
 *   DB内にレコードを登録
 */
// export const field = async (appId, token, domain) => {
//     // const getField = await window.fetch(`https://${domain}.cybozu.com//v1/app/form/fields.json?app=${appId}`, {
//     //     method: 'GET',
//     //     headers: {
//     //         "X-Cybozu-API-Token": token,
//     //         "Content-Type": "application/json"
//     //     }
//     // })
//     // const field = await getField.json();
//     // console.log(field)

//     const res = await window.fetch("", {
//         method: 'POST',
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ app: appId, token: token, domain: domain })
//     });
//     const field = await res.json()
//     return field;
// }

// export const getLyout = async (appId, token, domain) => {
//     const res = await window.fetch("./php/kintone/getLyout.php", {
//         method: 'POST',
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ app: appId, token: token, domain: domain })
//     });
//     const lyout = await res.json()
//     return lyout;
// }


// export const data = async (appId, token, domain, query, configId) => {
//     try {
//         let record = [];
//         const getRecordsForDB = await window.fetch("./php/getKintoneRecords.php", {
//             method: 'POST',
//             header: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ configId: configId, appId: appId })
//         })

//         const DBRecords = await getRecordsForDB.json();

//         DBRecords.forEach((e) => {
//             // record = record.concat(JSON.parse(e.records))
//             record.push(JSON.parse(e.records))
//         })

//         if (record.length === 0) {
//             const createCursorResponse = await window.fetch("./php/kintone/getCursor.php", {
//                 method: 'POST',
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({ app: appId, token: token, domain: domain, query: query })
//             });
//             const cursor = await createCursorResponse.json();

//             while (true) {
//                 const recordsResponse = await window.fetch("./php/kintone/getRecords.php", {
//                     method: 'POST',
//                     headers: {
//                         "Content-Type": "application/json"
//                     },
//                     body: JSON.stringify({ id: cursor.id, token: token, domain: domain })
//                 });
//                 const records = await recordsResponse.json();

//                 record.push(records.records)

//                 await window.fetch("./php/putKintoneRecords.php", {
//                     method: 'POST',
//                     headers: {
//                         "Content-Type": "application/json"
//                     },
//                     body: JSON.stringify({ configId: configId, appId: appId, records: JSON.stringify(records.records) })
//                 })

//                 if (!records.next) {
//                     break;
//                 }
//             }
//         }

//         return record;
//     } catch (e) {
//         console.error(e)
//         return false;
//     }
// }

// // kintoneからファイルを取得する関数
// export async function fetchFileContent(domain, token, fileKey) {
//     try {
//         const response = await fetch(`./php/kintone/getFile.php`, {
//             method: 'POST',
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ domain: domain, token: token, fileKey: fileKey })
//         });

//         if (!response.ok) {
//             console.error('ファイルの取得に失敗しました。')
//             return false;
//         }

//         const resp = await response.blob();
//         return resp;
//     } catch (error) {
//         return false;
//     }
// }

export async function uploadFile(domain, token, file, url, fileName) {
    console.log(url)

    const resizedFile = await resizeImage(file, 600, 600);
    const formData = new FormData();
    formData.append('domain', domain);
    formData.append('token', token);
    if (fileName) {
        formData.append('file', resizedFile, fileName);
    } else {
        formData.append('file', resizedFile, file.name);
    }
    // formData.append('file', file);

    const response = await fetch(url, {
        method: 'POST',
        body: formData
        // body: JSON.stringify({domain: domain, token: token, file: file})
    })

    if (!response.ok) {
        alert(`${file.name}のアップロードに失敗しました。\nファイルが壊れているか、ファイルサイズが大きすぎるか、対応していない形式です。`);
        return false;
    }

    return await response.json();

}

// input: Fileオブジェクト, width/height: 最大サイズ
function resizeImage(file, maxWidth, maxHeight) {
    if (!file.type.startsWith('image/') || file.type === 'image/tiff' || file.type === 'image/x-emf' || file.type === 'image/x-wmf') {
        return file;
    }
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        reader.onload = e => {
            img.onload = () => {
                let w = img.width;
                let h = img.height;
                // 縦横比を保ってリサイズ
                if (file.size >= 1048576) {
                    const ratio = Math.min(maxWidth / w, maxHeight / h);
                    w = Math.round(w * ratio);
                    h = Math.round(h * ratio);
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                canvas.toBlob(blob => {
                    // File名・typeを維持したFileオブジェクトに変換
                    const resizedFile = new File([blob], file.name, { type: file.type });
                    resolve(resizedFile);
                }, file.type, 0.85); // 画質(0.85)はお好みで
            };
            img.onerror = () => {
                reject(new Error('画像の読み込みに失敗しました。ファイルが壊れているか、対応していない形式です。'));
            };
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// export const postRecords = async (domain, token, postBody) => {
//     const response = await fetch(`./php/kintone/postRecords.php`, {
//         method: 'POST',
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ domain: domain, token: token, body: postBody })
//     });

//     if (!response.ok) {
//         console.error('レコードの登録に失敗しました。')
//         return false;
//     }

//     return await response.json()
// }