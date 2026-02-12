import { Box, Button, Link, SegmentGroup, Editable, IconButton, Dialog, CloseButton, Text, Clipboard, Alert } from '@chakra-ui/react';
import React, { useState } from 'react';
import { LuCheck, LuPencilLine, LuX } from 'react-icons/lu';
import { MapConfig } from './mapConfig';

export type StatusAlertDialogStatus = 'error' | 'info' | 'warning' | 'success' | 'neutral';
export type StatusAlertDialogAlign = 'start' | 'center' | 'end';

interface values {
  configs: any,
  users: any[],
  loginUserInfo: any[],
  getConfig: (data: any) => void;
}

interface Props {
  open: boolean;
  status: StatusAlertDialogStatus;
  title: React.ReactNode;
  showCancel?: boolean;
  confirmLabel?: string;
  comfirmResult: boolean;
  contentAlign: StatusAlertDialogAlign;
  data: any;
}


export const MapConfigList = ({ configs, users, loginUserInfo, getConfig }: values) => {
  const [setAllConfigs, setConfigs] = useState<any>(configs)
  let mapNum = '無制限'
  const link: string = location.href.replace(/[^/]+$/, '');

  const [dialog, setDialog] = useState<Props>({
    open: false,
    status: 'info',
    title: '',
    showCancel: false,
    confirmLabel: '',
    comfirmResult: true,
    contentAlign: 'center',
    data: ''
  })

  const addConfig = (data: any) => {
    const newConfigs: any = {}
    for (const key in configs) {
      newConfigs[key] = configs[key]
    }
    newConfigs[data.id] = data
    setConfigs(newConfigs)
    getConfig(newConfigs)
  }

  const changeConfigShow = async (e: any) => {
    try {
      const id = e.target.name.replace('config-valid-', '');
      const valid = e.target.value === 'true' ? true : false

      const newConfigs: any = {}
      for (const key in configs) {
        newConfigs[key] = configs[key]
      }

      const body = {
        config: newConfigs[id].id,
        valid: valid,
        mapTitle: newConfigs[id].mapTitle
      }

      //設定の更新
      const updateConfigResp = await window.fetch("./updateConfig", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!updateConfigResp.ok) {
        throw new Error('設定の更新に失敗しました。')
      }
      newConfigs[id].valid = valid

      setConfigs(newConfigs);
      getConfig(newConfigs);

    } catch (e: any) {
      alert(e.message)
    }
  }

  const changeMapTitle = async (e: any) => {
    try {
      let classNameList = e.target.classList.value.split(' ');
      let parent = e.target.parentNode;

      while (classNameList.length <= 1) {
        classNameList = parent.classList.value.split(' ');
        parent = parent.parentNode;
      }
      const className = classNameList.filter((c: any) => c.indexOf('change-map-name-') !== -1);

      const id = className[0].replace('change-map-name-', '');

      const mapNameInput: any = document.getElementsByClassName('map-name-' + id);

      const mapName = mapNameInput[0].value;
      configs[id].mapTitle = mapName

      const newConfigs: any = {}
      for (const key in configs) {
        newConfigs[key] = configs[key]
      }

      const body = {
        config: newConfigs[id].id,
        valid: newConfigs[id].valid,
        mapTitle: mapName
      }
      console.log(body)

      //設定の更新
      const updateConfigResp = await window.fetch("./updateConfig", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!updateConfigResp.ok) {
        throw new Error('設定の更新に失敗しました。')
      }
      newConfigs[id].mapTitle = mapName

      setConfigs(newConfigs);
      getConfig(newConfigs);
    } catch (e: any) {
      setDialog({
        open: true,
        status: 'error',
        title: e.message,
        showCancel: false,
        confirmLabel: '',
        comfirmResult: false,
        contentAlign: 'center',
        data: ''
      });
      console.error(e)
    }
  }

  const deleteConfig = async (e: any) => {
    try {
      const id = e.target.value;
      console.log(id);

      const newConfigs: any = {}
      for (const key in configs) {
        if (key !== id) {
          newConfigs[key] = configs[key]
        }
      }
      setDialog({
        open: true,
        status: 'warning',
        title: '設定を削除します。よろしいですか?\n注意：この動作は戻せません。',
        showCancel: true,
        confirmLabel: '',
        comfirmResult: false,
        contentAlign: 'center',
        data: { id: id, newConfigs: newConfigs }
      });
    } catch (e: any) {
      // alert(e.message);
      setDialog({
        open: true,
        status: 'error',
        title: e.message,
        showCancel: false,
        confirmLabel: '',
        comfirmResult: false,
        contentAlign: 'center',
        data: ''
      });
      console.error(e)
    }
  }

  const dialogClickOk = async () => {
    if (dialog.status === 'warning') {
      try {
        const deleteConfigResp = await window.fetch('./deleteConfig', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id: dialog.data.id })
        });

        if (!deleteConfigResp.ok) {
          throw new Error('設定の削除に失敗しました。');
        }
        setConfigs(dialog.data.newConfigs);
        getConfig(dialog.data.newConfigs);

        setDialog({
          open: true,
          status: 'success',
          title: '設定の削除が完了しました。',
          showCancel: false,
          confirmLabel: '',
          comfirmResult: true,
          contentAlign: 'center',
          data: ''
        });
      } catch (e: any) {
        setDialog({
          open: true,
          status: 'error',
          title: e.message,
          showCancel: false,
          confirmLabel: '',
          comfirmResult: false,
          contentAlign: 'center',
          data: ''
        });
        console.error(e)
      }
    } else {
      setDialog({
        open: false,
        status: dialog.status,
        title: '',
        showCancel: false,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'center',
        data: ''
      });
    }
  }

  return (
    <Box>
      {/* マップの設定一覧画面 */}
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">
        <Dialog.Root size="cover" placement="center">
          <Dialog.Trigger >
            <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}>
              マップ追加
            </Button>
          </Dialog.Trigger>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
              <Dialog.Body h={"100%"}>
                <MapConfig
                  config={null}
                  domain={setAllConfigs.domain}
                  addImage={setAllConfigs.addImage}
                  users={users}
                  loginUserInfo={loginUserInfo}
                  domainId={setAllConfigs.domainId}
                  saveConfig={addConfig} />
              </Dialog.Body>
              <Dialog.Footer />
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>

        <Box>
          <Text>マップ数</Text>
          <Text>{mapNum}</Text>
        </Box>
      </Box>
      {
        Object.keys(setAllConfigs).map((c) => {
          if (setAllConfigs[c].mapTitle) {
            const config = setAllConfigs[c];
            return (
              <Box className='map-configs'
                bg={config.valid ? 'white' : 'gray.300'} borderWidth="1px" shadow="md" borderRadius="md" display="flex" padding={5} gap={"20px"} marginBottom={5}>
                <Dialog.Root size="cover" placement="center">
                  <Dialog.Trigger >
                    <Button bgColor="white" color="cyan.500" px={4} py={2} borderRadius="md" fontWeight="bold" borderColor="cyan.500">
                      設定
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" />
                      </Dialog.CloseTrigger>
                      <Dialog.Body h={"100%"}>
                        <MapConfig
                          config={config}
                          domain={setAllConfigs.domain}
                          addImage={setAllConfigs.addImage}
                          users={users}
                          loginUserInfo={loginUserInfo}
                          domainId={setAllConfigs.domainId}
                          saveConfig={addConfig} />
                      </Dialog.Body>
                      <Dialog.Footer />
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Dialog.Root>

                <Editable.Root defaultValue={config.mapTitle} fontSize={"large"} >
                  <Editable.Preview />
                  <Editable.Input className={`map-name-${config.id}`} fontSize={"large"} />
                  <Editable.Control>
                    <Editable.EditTrigger asChild>
                      <IconButton variant="ghost" size="xs">
                        <LuPencilLine />
                      </IconButton>
                    </Editable.EditTrigger>
                    <Editable.CancelTrigger asChild>
                      <IconButton variant="outline" size="xs" >
                        <LuX />
                      </IconButton>
                    </Editable.CancelTrigger>
                    <Editable.SubmitTrigger asChild>
                      <IconButton variant="outline" size="xs"
                        className={`change-map-name-${config.id}`} onClick={changeMapTitle}>
                        <LuCheck />
                      </IconButton>
                    </Editable.SubmitTrigger>
                  </Editable.Control>
                </Editable.Root>
                <Clipboard.Root
                  value={`${link}public/${config.openURL}`}
                  display={config.openURL !== '' ? 'block' : 'none'}
                  w={'268px'} alignContent={"center"}>
                  <Clipboard.Trigger asChild>
                    <Link as="span" color="blue.fg" textStyle="md">
                      <Clipboard.Indicator />
                      {/* <Clipboard.ValueText /> */}
                      閲覧専用マップ
                    </Link>
                  </Clipboard.Trigger>
                </Clipboard.Root>
                {/* <Link className='show_open_url' href={`./public/${config.openURL}`} w={"250px"} display={config.openURL !== '' ? 'block' : 'none'} >
                  閲覧専用マップ <LuExternalLink />
                </Link> */}
                <SegmentGroup.Root defaultValue={JSON.stringify(config.valid)}
                  bg="white"
                  colorPalette="cyan.700"
                  css={{
                    "--segment-indicator-bg": "colors.cyan.300",
                    "--segment-indicator-shadow": "shadows.md",
                  }}
                  onChange={changeConfigShow}
                >
                  <SegmentGroup.Indicator />
                  <SegmentGroup.Item key={"valid"} value={'false'}>
                    <SegmentGroup.ItemText>{"OFF"}</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput name={`config-valid-${config.id}`} />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item key={"valid"} value={"true"}>
                    <SegmentGroup.ItemText>{"ON"}</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput name={`config-valid-${config.id}`} />
                  </SegmentGroup.Item>
                </SegmentGroup.Root>
                <Button bgColor="white" color="red" px={4} py={2} borderRadius="md" fontWeight="bold" borderColor="red" value={config.id} onClick={deleteConfig}>削除</Button>
              </Box>
            )
          } else {
            return null;
          }
        })
      }

      <Dialog.Root role="alertdialog" open={dialog.open} onOpenChange={(e: any) => {
        setDialog({
          open: e.open,
          status: dialog.status,
          title: '',
          showCancel: false,
          confirmLabel: '',
          comfirmResult: false,
          contentAlign: 'center',
          data: ''
        })
      }}>
        <Dialog.Backdrop />
        <Dialog.Positioner alignItems='center' justifyContent='center' p='4'>
          <Dialog.Content maxW='720px'>
            <Dialog.Body pt='10' pb='8' display='flex' justifyContent='center'>
              <Alert.Root status={dialog.status} w='full'>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title fontSize='lg' fontWeight='semibold'>
                    {dialog.title}
                  </Alert.Title>
                </Alert.Content>
              </Alert.Root>

            </Dialog.Body>
            <Dialog.Footer>
              {dialog.showCancel ? (
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" onClick={() => {
                    setDialog({
                      open: false,
                      status: dialog.status,
                      title: '',
                      showCancel: false,
                      confirmLabel: '',
                      comfirmResult: false,
                      contentAlign: 'center',
                      data: ''
                    })
                  }}>キャンセル</Button>
                </Dialog.ActionTrigger>
              ) : null}
              <Button onClick={dialogClickOk}>OK</Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root >
    </Box >
  )
}