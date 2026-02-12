import React, { useState } from 'react'
import { Alert, Box, Button, CloseButton, Dialog, Icon, Image, Portal, Stack, Table, Text } from '@chakra-ui/react'
import { UserEdit } from './userEdit'
import { addUserClick } from '../../../ts/user/addUser'
import { useForm } from 'react-hook-form'
import { BsTrash } from 'react-icons/bs'

// import { addUserClickButton } from './userEdit'

export type showDialogType = 'edit' | 'create' | 'delete'

export type StatusAlertDialogStatus = 'error' | 'info' | 'warning' | 'success' | 'neutral';
export type StatusAlertDialogAlign = 'start' | 'center' | 'end';
export type StatusAlertDialogTextAlign = 'left' | 'center' | 'right';


interface values {
  users: any[];
  domainId: number;
  onResult: (value: any) => void;
}

interface editDialog {
  type: showDialogType;
  open: boolean;
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

export const ShowUserTable = ({ users, domainId, onResult }: values) => {
  let userNum = '無制限'
  let user_id: number = 0;

  const [usetOperation, setUserOperation] = useState<editDialog>({
    type: 'create',
    open: false
  })
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

  /**
   * ユーザーの設定を保存する
   * @param data 入力されたユーザーの情報
   */
  const addUserClickButton = async (data: any) => {
    try {
      const loginIdCheck = users.filter((u: any) => u.user_id === data.user_id);
      if (loginIdCheck.length >= 1) {
        throw new Error(`${data.user_id}はすでに使用されているログインIDです。`);
      }
      let title = 'ユーザーの設定を保存します。よろしいですか?'

      if (data.check_passwoed !== undefined) {
        title = '変更した設定を保存します。よろしいですか?'
      }
      const dialog: Props = {
        open: true,
        status: 'warning',
        title: title,
        showCancel: true,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'center',
        data: data
      }
      setDialog(dialog)

    } catch (e: any) {
      const dialog: Props = {
        open: true,
        status: 'error',
        title: e.message,
        showCancel: false,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'start',
        data: ''
      }
      setDialog(dialog)
      console.error(e)
    }
  }

  /**
   * ユーザーを削除する
   * @param e
   */
  const deleteUser = async (e: any) => {
    try {
      const dialog: editDialog = {
        type: 'delete',
        open: false
      }

      setUserOperation(dialog)

      let id: string = e.target.value;
      let parent: any = e.target.parentNode;

      while (!id) {
        id = parent.value;
        parent = parent.parentNode
      }
      if (id === '') {
        throw new Error('ユーザーの削除に失敗しました。')
      }
      let userID: string = ''
      let num: number = users.length;
      users.forEach((user: any, index: number) => {
        if (user.id === Number(id)) {
          userID = user.user_id
          num = index
        }
      })

      const newDialog: Props = {
        open: true,
        status: 'warning',
        title: 'ユーザー「' + userID + '」を削除しますか?',
        showCancel: true,
        confirmLabel: '',
        comfirmResult: false,
        contentAlign: 'center',
        data: { id: id, num: num }
      }
      setDialog(newDialog);

    } catch (e: any) {
      setDialog({
        open: false,
        status: 'error',
        title: e.message,
        showCancel: false,
        confirmLabel: '',
        comfirmResult: true,
        contentAlign: 'start',
        data: '',
      })
      console.error(e)
    }
  }

  /**
   * ユーザーの詳細画面が開かれたとき
   * @param e
   */
  const showEditDialog = (e: any) => {
    user_id = e.target.id
    const dialog: editDialog = {
      type: 'edit',
      open: true
    }

    setUserOperation(dialog)
  }

  /**
   * ユーザーの作成画面が開かれたとき
   */
  const showCreateDialog = () => {
    const dialog: editDialog = {
      type: 'create',
      open: true
    }

    setUserOperation(dialog)
  }

  /**
   * ダイアログのOKボタンをクリックしたとき
   */
  const dialogClickOk = async () => {
    setDialog({
      open: false,
      status: dialog.status,
      title: '',
      showCancel: false,
      confirmLabel: '',
      comfirmResult: true,
      contentAlign: 'center',
      data: '',
    })
    try {
      if (dialog.status === 'warning') {
        //ダイアログがwarningの時
        if (usetOperation.type !== 'delete') {
          // 行った動作がdelete以外の時
          const result: any | string = await addUserClick(dialog.data, domainId, users, user_id);

          if (typeof result === 'string') {
            throw new Error(result)
          } else {
            const newUsers = [];
            if (dialog.data.check_passwoed !== undefined) {
              users.forEach((user: any) => {
                if (user.id === result.id) {
                  newUsers.push(result)
                } else {
                  newUsers.push(user);
                }
              })
            } else {
              users.forEach((user: any) => {
                newUsers.push(user);
              })
              newUsers.push(result)
            }
            onResult(newUsers)
          }
          setUserOperation({ type: usetOperation.type, open: false })
          setDialog({
            open: true,
            status: 'success',
            title: 'ユーザー設定の保存が完了しました。',
            showCancel: false,
            confirmLabel: '',
            comfirmResult: true,
            contentAlign: 'start',
            data: '',
          })
        } else {
          const params = new URLSearchParams({ id: dialog.data.id })
          const deleteUserResp = await fetch(`./deleteUser?${params.toString()}`, {
            method: 'DELETE',
            headers: {
              "Content-Type": "application/json"
            }
          });

          if (!deleteUserResp.ok) {
            throw new Error('ユーザーの削除に失敗しました。');
          }

          const result = await deleteUserResp.json();

          if (result.success) {
            delete users[dialog.data.num]

            const newUsers: any[] = []
            users.forEach((user: any) => {
              newUsers.push(user)
            })

            onResult(newUsers);
          } else {
            throw new Error('ユーザーの削除に失敗しました。');
          }
        }
      }
    } catch (e: any) {
      setDialog({
        open: true,
        status: 'error',
        title: e.message,
        showCancel: false,
        confirmLabel: '',
        comfirmResult: false,
        contentAlign: 'start',
        data: '',
      })
      console.error(e)
    }
  }

  return (
    <Box>
      {/* ユーザー追加ボタン */}
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">

        <Dialog.Root open={usetOperation.type === 'create' ? usetOperation.open : false}
          size="cover" placement="center"
          closeOnInteractOutside onOpenChange={(e: any) => { setUserOperation({ type: 'create', open: e.open }) }}>
          <Dialog.Trigger >
            <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}
              onClick={showCreateDialog}>
              ユーザー追加
            </Button>
          </Dialog.Trigger>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger />
              <Dialog.Header>
                <Dialog.Title >
                  <Button id="add_user_button" bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}
                    // disabled={true}
                    onClick={() => {
                      document.getElementById('user_detail_form')
                        ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                    }}
                  >
                    保存
                  </Button>
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" className='dialog-close' onClick={() => { setUserOperation({ type: 'create', open: false }) }} />
              </Dialog.CloseTrigger>
              <Dialog.Body h={"100%"} overflow={"auto"}>
                <UserEdit user={null} onSubmit={addUserClickButton} />
              </Dialog.Body>
              <Dialog.Footer />
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
        <Box>
          <Text>ユーザー数</Text>
          <Text>{userNum}</Text>
        </Box>
      </Box>

      <Table.Root bg="white" borderRadius="md" overflow="hidden" boxShadow="sm" id='show_user_table' stickyHeader>
        <Table.Header>
          <Table.Row style={{ backgroundColor: '#f7fafc' }}>
            <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: 'large', borderBottom: '1px solid #e2e8f0' }}></Table.ColumnHeader>
            <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: 'large', borderBottom: '1px solid #e2e8f0' }}>ログインID</Table.ColumnHeader>
            <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: 'large', borderBottom: '1px solid #e2e8f0' }}>ユーザー名</Table.ColumnHeader>
            <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: 'large', borderBottom: '1px solid #e2e8f0' }}>メールアドレス</Table.ColumnHeader>
            <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: 'large', borderBottom: '1px solid #e2e8f0' }}>削除</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {users.map((user: any) => (
            <Table.Row style={{ borderBottom: '1px solid #e2e8f0' }} className='user-info' >
              <Table.Cell style={{ padding: '12px' }}>
                <Dialog.Root open={usetOperation.type === 'edit' ? usetOperation.open : false}
                  size="cover" placement="center"
                  closeOnInteractOutside onOpenChange={(e: any) => { setUserOperation({ type: 'edit', open: e.open }) }}>
                  <Dialog.Trigger >
                    <Button color="cyan.500" fontSize="sm" className='user-edit-button' id={user.id}
                      bg="white" borderColor="cyan.500" _hover={{ background: "gray. 100" }}
                      onClick={showEditDialog}>
                      編集</Button>
                  </Dialog.Trigger>
                  <Dialog.Backdrop />
                  <Dialog.Positioner>
                    <Dialog.Content>
                      <Dialog.CloseTrigger />
                      <Dialog.Header>
                        <Dialog.Title >
                          <Button id="edit_user_button" bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}
                            // disabled={true}
                            onClick={() => {
                              document.getElementById('user_detail_form')
                                ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
                            }}
                          >
                            保存
                          </Button>
                        </Dialog.Title>
                      </Dialog.Header>
                      <Dialog.CloseTrigger asChild>
                        <CloseButton size="sm" className='dialog-close' onClick={() => { setUserOperation({ type: 'edit', open: false }) }} />
                      </Dialog.CloseTrigger>
                      <Dialog.Body h={"100%"} overflow={"auto"}>
                        <UserEdit user={user} onSubmit={addUserClickButton} />
                      </Dialog.Body>
                      <Dialog.Footer />
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Dialog.Root>
              </Table.Cell>
              <Table.Cell style={{ padding: '12px', fontSize: 'large' }} className='show-login-id'>{user.user_id}</Table.Cell>
              <Table.Cell style={{ padding: '12px', fontSize: 'large' }} className='show-user-name'>{user.user_name}</Table.Cell>
              <Table.Cell style={{ padding: '12px', fontSize: 'large' }} className='show-user-email'>{user.email === '' ? '-' : user.email}</Table.Cell>
              <Table.Cell style={{ padding: '12px' }}>
                <Button fontSize="sm" className='user-delete-button' bg="white" borderColor="red.500" _hover={{ background: "gray. 100" }} value={user.id} onClick={deleteUser}>
                  <Icon size="lg" color="red">
                    <BsTrash />
                  </Icon>
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

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