import { Badge, Box, Field, Input, Stack, Switch, Text } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';

import {
  PasswordInput
} from "../../../../components/ui/password-input"
import { useForm } from 'react-hook-form';

interface userFormValues {
  user_id: string,
  user_name: string,
  user_email: string,
  check_passwoed: null | boolean,
  user_password: string,
  user_password_confirmation: string,
  user_autority: boolean
}

export const UserEdit = ({ user, onSubmit, }: { user: any; onSubmit: (data: any) => void; }) => {
  const didInit = useRef(false);
  console.log(user)

  const [checkUserId, setUserId] = useState<boolean>(user ? true : false);
  const [checkUserName, setUserName] = useState<boolean>(user ? true : false);
  const [chackPassword, setPassword] = useState<boolean>(false);
  const [chackPasswordConfirmation, setPasswordConfirmation] = useState<boolean>(false);

  const [changePassword, checkChangePassword] = useState<boolean>(false);

  //値が入力されたり変更されたりしたとき、保存ボタンを入力可/不可にする
  const addUserButton: null | any = document.getElementById('add_user_button');
  console.log(addUserButton)
  const editUserButton: null | any = document.getElementById('edit_user_button');
  console.log(editUserButton)

  if (addUserButton) {
    if (didInit.current && checkUserId && checkUserName && chackPassword && chackPasswordConfirmation) {
      addUserButton.disabled = false;
    } else {
      addUserButton.disabled = true;
    }
    didInit.current = true
  } else if (editUserButton) {
    if ((didInit.current && checkUserId && checkUserName && !changePassword) ||
      (didInit.current && checkUserId && checkUserName && changePassword && chackPassword && chackPasswordConfirmation)) {
      editUserButton.disabled = false;
    } else {
      editUserButton.disabled = true;
    }
    didInit.current = true
  }

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<userFormValues>()

  const checkPassword = (e: any) => {
    let error: boolean = false
    if (e.target.value === '') {
      error = true
    } else {
      const password: any = document.getElementById('user_password');
      if (e.target.value !== password.value) {
        error = true
      }
    }
    setPasswordConfirmation(!error);
  }

  return (
    <Box>
      <form id='user_detail_form' onSubmit={handleSubmit(onSubmit)}>
        <Field.Root className='input-login-id' marginBottom={10} invalid={!checkUserId && Boolean(errors.user_id)}>
          <Stack direction="row">
            <Field.Label>ログインID</Field.Label>
            <Badge variant="outline" color="red" borderColor="red">必須</Badge>
          </Stack>
          <Input
            type="text"
            variant="outline"
            id="login_id"
            placeholder="ログインID"
            defaultValue={user ? user.user_id : ''}
            {...register("user_id", { required: 'ログインIDは必須項目です' })}
            onChange={((e: any) => { e.target.value === '' ? setUserId(false) : setUserId(true) })}
          />
          <Field.ErrorText>{errors.user_id && errors.user_id.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root className='input-user-name' marginBottom={10} invalid={!checkUserName && Boolean(errors.user_name)}>
          <Stack direction="row">
            <Field.Label>ユーザー名</Field.Label>
            <Badge variant="outline" color="red" borderColor="red">必須</Badge>
          </Stack>
          <Input
            type="text"
            variant="outline"
            id="user_name"
            placeholder="ユーザー名"
            {...register("user_name", { required: 'ユーザー名は必須の項目です。' })}
            defaultValue={user ? user.user_name : ''}
            onChange={((e: any) => { e.target.value === '' ? setUserName(false) : setUserName(true) })}
          />
          <Field.ErrorText>{!checkUserName && (errors.user_name && errors.user_name.message)}</Field.ErrorText>
        </Field.Root>

        <Field.Root className='input-user-email' marginBottom={10}>
          <Stack direction="row">
            <Field.Label>メールアドレス</Field.Label>
          </Stack>
          <Input
            type="email"
            variant="outline"
            id="user_email"
            placeholder="メールアドレス"
            {...register("user_email", {
              pattern: { value: /^[a-zA-Z0-9-_\.]+@[a-zA-Z0-9-_\.]+$/, message: 'メールアドレスを入力してください' },
            })
            }
            defaultValue={user ? user.email : ''}
          />
          <Field.ErrorText>{errors.user_email && errors.user_email.message}</Field.ErrorText>
        </Field.Root>

        {(() => {
          if (user) {
            return (
              <Box>
                <Switch.Root colorPalette={"cyan"} defaultChecked={false} {...register("check_passwoed")}
                  onChange={(() => { checkChangePassword(!changePassword) })} marginBottom={10}>
                  < Switch.HiddenInput />
                  <Switch.Control id="check_change_password" />
                  <Switch.Label>パスワードを変更する</Switch.Label>
                </Switch.Root>
                <Box display={changePassword ? 'block' : 'none'}>
                  <Field.Root className='input-user-password' marginBottom={10} invalid={!chackPassword && Boolean(errors.user_password)}>
                    <Stack direction="row">
                      <Field.Label>パスワード</Field.Label>
                      <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                    </Stack>
                    <PasswordInput
                      variant="outline"
                      id="user_password"
                      {...register("user_password", {
                        validate: (value) => !getValues("check_passwoed") || (value !== '') || 'パスワードが一致しません。'
                      })}
                      placeholder="パスワード"
                      onChange={((e: any) => { e.target.value === '' ? setPassword(false) : setPassword(true) })}
                    />
                    <Field.ErrorText>{!chackPassword && errors.user_password && errors.user_password.message}</Field.ErrorText>
                  </Field.Root>

                  <Field.Root className='input-user-password-confirmation' marginBottom={10} invalid={!chackPasswordConfirmation && Boolean(errors.user_password_confirmation)}>
                    <Stack direction="row">
                      <Field.Label>パスワードの確認用</Field.Label>
                      <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                    </Stack>
                    <PasswordInput
                      variant="outline"
                      id="user_password_confirmation"
                      {...register("user_password_confirmation", {
                        validate: (value) => !getValues("check_passwoed") || (value === getValues("user_password")) || 'パスワードが一致しません。'
                      })}
                      placeholder="確認用パスワード"
                      onChange={checkPassword}
                    />
                    <Text color={"gray"}>上の欄で入力したものと同じパスワードを入力してください。</Text>
                    <Field.ErrorText>{!chackPasswordConfirmation && errors.user_password_confirmation && errors.user_password_confirmation.message}</Field.ErrorText>
                  </Field.Root>
                </Box>
              </Box >
            )
          } else {
            return (
              <Box>
                {/* <Switch.Root colorPalette={"cyan"} defaultChecked={true} {...register("check_passwoed")}
                  display={'none'}>
                  < Switch.HiddenInput />
                  <Switch.Control id="check_change_password" />
                  <Switch.Label>パスワードを設定する</Switch.Label>
                </Switch.Root> */}
                <Field.Root className='input-user-password' marginBottom={10} invalid={!chackPassword && Boolean(errors.user_password)}>
                  <Stack direction="row">
                    <Field.Label>パスワード</Field.Label>
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Stack>
                  <PasswordInput
                    variant="outline"
                    id="user_password"
                    placeholder="パスワード"
                    {...register("user_password", {
                      required: 'パスワードは必須の項目です。'
                    })
                    }
                    onChange={((e: any) => { e.target.value === '' ? setPassword(false) : setPassword(true) })}
                  />
                  <Field.ErrorText>{!chackPassword && errors.user_password && errors.user_password.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root className='input-user-password-confirmation' marginBottom={10} invalid={!chackPasswordConfirmation && Boolean(errors.user_password_confirmation)}>
                  <Stack direction="row">
                    <Field.Label>パスワードの確認用</Field.Label>
                    <Badge variant="outline" color="red" borderColor="red">必須</Badge>
                  </Stack>
                  <PasswordInput
                    variant="outline"
                    id="user_password_confirmation"
                    placeholder="パスワード確認用"
                    {...register("user_password_confirmation", {
                      required: 'パスワードの確認は必須項目です。',
                      validate: (value) => value === getValues("user_password") || 'パスワードが一致しません。'
                    })}
                    onChange={checkPassword}
                  />
                  <Text color={"gray"}>上の欄で入力したものと同じパスワードを入力してください。</Text>
                  <Field.ErrorText>{!chackPasswordConfirmation && (errors.user_password_confirmation && errors.user_password_confirmation.message)}</Field.ErrorText>
                </Field.Root >
              </Box>
            )
          }
        })()}


        <Field.Root className='input-user-password-confirmation'>
          <Switch.Root colorPalette={"cyan"} defaultChecked={user && (user.authority === 0 || user.authority === 2) ? true : false}
            {...register("user_autority")}
          >
            < Switch.HiddenInput />
            <Switch.Control id="user_authority" />
            <Switch.Label>マップの設定を可能にする</Switch.Label>
          </Switch.Root>
        </Field.Root>
      </form>
    </Box >
  )
}