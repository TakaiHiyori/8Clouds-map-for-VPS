import React, { useState } from 'react'
import { Alert, Box, Button, CloseButton, Dialog, Image, Portal, Stack, Table, Text } from '@chakra-ui/react'
import { UserEdit } from './userEdit'
import { addUserClick } from '../../ts/user/addUser'
import { useForm } from 'react-hook-form'

// import { addUserClickButton } from './userEdit'

export type StatusAlertDialogStatus = 'error' | 'info' | 'warning' | 'success' | 'neutral';
export type StatusAlertDialogAlign = 'start' | 'center' | 'end';
export type StatusAlertDialogTextAlign = 'left' | 'center' | 'right';


interface values {
  users: any[],
  domainId: number,
  onResult: (value: any) => void
}

interface Props {
  open: boolean;
  status: StatusAlertDialogStatus;
  title: React.ReactNode;
  showCancel?: boolean;
  confirmLabel?: string;
  comfirmResult: boolean
}

export const ShowUserTable = ({ users, domainId, onResult }: values) => {
  let userNum = '無制限'
  let user_id: number = 0;
  console.log(users)

  const [errorMessage, setErrorMessage] = useState<string>('')
  const [showUsers, setShowUsers] = useState<any[]>(users)
  const [dialog, setDialog] = useState<Props>({
    open: false,
    status: 'info',
    title: '',
    showCancel: false,
    confirmLabel: '',
    comfirmResult: true
  })
  const [checkOpen, setOpen] = useState<boolean>(false)

  const addUserClickButton = async (data: any) => {
    console.log(data);
    let comfirmResult = true;

    if (data.check_passwoed !== undefined) {
      // dialog.open = true;
      // dialog.status = 'warning';
      // dialog.title = '変更した設定を保存します。よろしいですか?';
      // dialog.showCancel = true;
      // setDialog(dialog)
    }

    comfirmResult = dialog.comfirmResult;

    if (comfirmResult) {
      const result: any | string = await addUserClick(data, domainId, users, user_id);

      console.log(result)
      console.log(typeof result)
      if (typeof result === 'string') {
        // setErrorMessage(result)
        // setOpen(true)
        dialog.open = true;
        dialog.status = 'error';
        dialog.title = result;
        dialog.showCancel = false;
        setDialog(dialog)
      } else {
        if (data.check_passwoed !== undefined) {
          users.forEach((user: any) => {
            if (user.id === result.id) {
              user = result
            }
          })
        } else {
          users.push(result)
        }

        setShowUsers(users)
        onResult(users)
      }
    }

  }

  const deleteUser = async (e: any) => {
    try {
      const id: string = e.target.id;
      if (id === '') {
        throw new Error('ユーザーの削除に失敗しました。')
      }
      console.log(id)
      let userID: string = ''
      let num: number = users.length;
      users.forEach((user: any, index: number) => {
        if (user.id === id) {
          userID = user.user_id
          num = index
        }
      })

      // dialog.open = true;
      // dialog.status = 'warning';
      // dialog.title = 'ユーザー「' + userID + '」を削除しますか?';
      // dialog.showCancel = true;
      // setDialog(dialog)
      if (dialog.comfirmResult) {
        const link: string = location.href.replace(/[^/]+$/, '')

        const params = new URLSearchParams({ id: id })
        const deleteUserResp = await fetch(`./deleteUser?${params.toString()}`, {
          method: 'DELETE',
          headers: {
            "Content-Type": "application/json"
          }
        });

        console.log(deleteUserResp)
        if (!deleteUserResp.ok) {
          throw new Error('ユーザーの削除に失敗しました。');
        }

        console.log(await deleteUserResp.text())
        const result = await deleteUserResp.json();
        console.log(result)

        if (result.success) {
          delete users[num]
        } else {
          throw new Error('ユーザーの削除に失敗しました。');
        }
      }

    } catch (e: any) {
      dialog.open = true;
      dialog.status = 'error';
      dialog.title = e.message;
      dialog.showCancel = false;
      setDialog(dialog)
      alert(e.message)
      console.error(e)
    }
  }

  return (
    <Box>
      {/* ユーザー追加ボタン */}
      <Box mb={6} display="flex" justifyContent="space-between" alignItems="center">

        <Dialog.Root size="cover" placement="center">
          <Dialog.Trigger >
            <Button bgColor="cyan.500" _hover={{ bg: "cyan.700" }} color="white" px={4} py={2} borderRadius="md" fontWeight="bold" w={"125px"} h={"40px"}>
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
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
              <Dialog.Body h={"100%"} overflow={"auto"}>
                <UserEdit onSubmit={addUserClickButton} user={null} />
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
                <Dialog.Root size="cover" placement="center">
                  <Dialog.Trigger >
                    <Button color="cyan.500" fontSize="sm" className='user-edit-button' id={user.id}
                      bg="white" borderColor="cyan.500" _hover={{ background: "gray. 100" }} onClick={(e: any) => { user_id = e.target.id }}>編集</Button>
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
                        <CloseButton size="sm" />
                      </Dialog.CloseTrigger>
                      <Dialog.Body h={"100%"} overflow={"auto"}>
                        <UserEdit onSubmit={addUserClickButton} user={user} />
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
                <Button fontSize="sm" className='user-delete-button' bg="white" borderColor="red.500" _hover={{ background: "gray. 100" }} id={user.id} onClick={deleteUser}>
                  <Image src='./dustBox.png' title='削除'></Image>
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      <Dialog.Root open={dialog.open} onOpenChange={(details) => { dialog.open = Boolean(details); setDialog(dialog) }}>
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
            {dialog.showCancel ? (
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" onClick={() => { dialog.open = false; dialog.comfirmResult = false; setDialog(dialog) }}>キャンセル</Button>
                </Dialog.ActionTrigger>
                <Button onClick={() => { dialog.open = false; dialog.comfirmResult = true; setDialog(dialog) }}>OK</Button>
              </Dialog.Footer>
            ) : null}
            <Dialog.CloseTrigger asChild>
              <CloseButton onClick={() => { dialog.open = false; setDialog(dialog) }}></CloseButton>
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root >

    </Box >
  )
}