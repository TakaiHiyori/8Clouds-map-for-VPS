import { Box, Button, Heading, Link } from '@chakra-ui/react';
import React, { useMemo, useState, useEffect, useRef } from 'react';

import '../../css/config-style.css'

import { checkLogin } from '../../ts/checkLogin';
// import { getUser } from '../../ts/user/getUser';
// import { UserEdit } from './userEdit';
import { MapConfigList } from './mapConfigList';
// import { MapConfig } from './mapConfig';
import { MapContract } from './mapContract';

// import { setConfigs } from '../../ts/config/config'

// import { showUserList, showMapList, addUserClick, addMapClick, showContractList } from '../../ts/config/clickButtons'
import { ShowUserTable } from './showUserTable';

export const showConfig = () => {
  const [config, getConfigs] = useState<any>([]);
  const [users, getUsers] = useState<any>([]);
  const [showPage, changeShowPage] = useState<Number>(0)
  const mapDomain = window.location.hostname
  const link: string = location.href.replace(/[^/]+$/, '')
  const result = checkLogin(mapDomain);
  const didInit = useRef(false);

  console.log(result)
  if (!result.login) {
    window.location.href = `${link}login`
  }

  // let userNum: string = '無制限';
  // let mapNum: string = '無制限'
  useEffect(() => {
    if (didInit.current || !result.login) return;

    const initializeConfigDisplay = async () => {
      try {
        const getConfigParams = new URLSearchParams({ domain: mapDomain, user: result.loginUserInfomation.id });
        const configResp = await fetch(`${link}getAllConfig?${getConfigParams.toString()}`);

        if (!configResp.ok) {
          throw new Error('設定内容を取得できませんでした。');
        }

        const config = await configResp.json();
        console.log(config)

        return config
      } catch (e: any) {
        alert(e.message)
        return {}
      }
    }

    initializeConfigDisplay()
      .then((config: any) => getConfigs(config))
      .catch(console.error)

    const initializeUserDisplay = async () => {
      try {
        const params = new URLSearchParams({ domain: mapDomain })
        const getUserResp = await fetch(`./getUsers?${params.toString()}`);

        if (!getUserResp.ok) {
          throw new Error('ユーザーを取得できませんでした。');
        }

        const getUser = await getUserResp.json();
        console.log(getUser);

        return getUser;
      } catch (e: any) {
        alert(e.message)
        return []
      }
    }

    initializeUserDisplay()
      .then((users: any) => getUsers(users))
      .catch(console.error)

    if (document.getElementById('loading')) {
      document.getElementById('loading')?.remove();
    }

    didInit.current = true;
  }, [])

  const logout = () => {
    localStorage.removeItem(`map_${mapDomain}`);
    window.location.href = `${link}login`;
  }

  const clickShowUser = () => {
    if (showPage !== 0) {
      changeShowPage(0)
      // showUserList
    }
  }

  const clickShowMap = () => {
    if (showPage !== 1) {
      changeShowPage(1)
      // showMapList
    }
  }

  const clickShowContract = () => {
    if (showPage !== 2) {
      changeShowPage(2)
      // showContractList
    }
  }

  const newUser = (result: any) => {
    console.log(result)
    getUsers(result)
  }

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" bg="gray.50">
      {/* ヘッダー */}
      <Box bg="white" p={4} borderBottom="1px solid" borderColor="gray.200" display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="lg">設定画面</Heading>
        <Link as="button" color="red" fontSize="sm" fontWeight="bold" onClick={logout}>
          ログアウト
        </Link>
      </Box>

      {/* メインコンテンツ */}
      {(() => {
        if (showPage === 0) {
          return (
            <Box display="flex" flex={1}>
              <Box w="200px" bg="white" p={4} borderRight="1px solid" borderColor="gray.200">
                {/* 左側パネル */}
                <Box mb={4}>
                  <Button size="md" bgColor="cyan.200" w="full" p={2} mb={2} color="gray.700" borderRadius="md" fontWeight="bold" onClick={clickShowUser}>
                    ユーザー設定
                  </Button>
                  <Button size="md" bgColor="white" w="full" p={2} mb={2} bg="gray.100" color="gray.700" borderRadius="md" onClick={clickShowMap}>
                    マップ設定
                  </Button>
                  <Button size="md" bgColor="white" w="full" p={2} mb={2} bg="gray.100" color="gray.700" borderRadius="md" onClick={clickShowContract}>
                    オプション利用状況
                  </Button>
                </Box>

                {/* マップに戻る */}
                <Box mt={8} pt={4} borderTop="1px solid" borderColor="gray.200">
                  <Link as="a" color="blue.500" fontSize="sm" cursor="pointer" display="flex" alignItems="center" href={link}>
                    ← マップに戻る
                  </Link>
                </Box>
              </Box>

              {/* 右側コンテンツ */}
              <Box flex={1} p={6} bg={'white'}>
                <Box id='show_user_list'>
                  {/* テーブル */}
                  <ShowUserTable users={users} domainId={config.domainId} onResult={newUser} />
                </Box>
              </Box>
            </Box>
          )
        } else if (showPage === 1) {
          return (
            <Box display="flex" flex={1}>
              <Box w="200px" bg="white" p={4} borderRight="1px solid" borderColor="gray.200">
                {/* 左側パネル */}
                <Box mb={4}>
                  <Button size="md" bgColor="white" w="full" p={2} mb={2} bg="gray.100" color="gray.700" borderRadius="md" onClick={clickShowUser}>
                    ユーザー設定
                  </Button>
                  <Button size="md" bgColor="cyan.200" w="full" p={2} mb={2} color="gray.700" borderRadius="md" fontWeight="bold" onClick={clickShowMap}>
                    マップ設定
                  </Button>
                  <Button size="md" bgColor="white" w="full" p={2} mb={2} bg="gray.100" color="gray.700" borderRadius="md" onClick={clickShowContract}>
                    オプション利用状況
                  </Button>
                </Box>

                {/* マップに戻る */}
                <Box mt={8} pt={4} borderTop="1px solid" borderColor="gray.200">
                  <Link as="a" color="blue.500" fontSize="sm" cursor="pointer" display="flex" alignItems="center" href={link}>
                    ← マップに戻る
                  </Link>
                </Box>
              </Box>

              {/* 右側コンテンツ */}
              <Box flex={1} p={6} bg={'white'}>
                < Box id='map_list'>
                  <MapConfigList values={{ configs: config, users: users }} />
                </Box>
              </Box>
            </Box>
          )
        } else {
          return (
            <Box display="flex" flex={1}>
              <Box w="200px" bg="white" p={4} borderRight="1px solid" borderColor="gray.200">
                {/* 左側パネル */}
                <Box mb={4}>
                  <Button size="md" bgColor="white" w="full" p={2} mb={2} bg="gray.100" color="gray.700" borderRadius="md" onClick={clickShowUser}>
                    ユーザー設定
                  </Button>
                  <Button size="md" bgColor="white" w="full" p={2} mb={2} bg="gray.100" color="gray.700" borderRadius="md" onClick={clickShowMap}>
                    マップ設定
                  </Button>
                  <Button size="md" bgColor="cyan.200" w="full" p={2} mb={2} color="gray.700" borderRadius="md" fontWeight="bold" onClick={clickShowContract}>
                    オプション利用状況
                  </Button>
                </Box>

                {/* マップに戻る */}
                <Box mt={8} pt={4} borderTop="1px solid" borderColor="gray.200">
                  <Link as="a" color="blue.500" fontSize="sm" cursor="pointer" display="flex" alignItems="center" href={link}>
                    ← マップに戻る
                  </Link>
                </Box>
              </Box>

              {/* 右側コンテンツ */}
              <Box flex={1} p={6} bg={'white'}>
                <Box id='map_contract'>
                  {/* マップのオプション利用状況画面 */}

                  <MapContract configs={config} />
                </Box>
              </Box>
            </Box>
          )
        }
      })()}
    </Box >
  )
}