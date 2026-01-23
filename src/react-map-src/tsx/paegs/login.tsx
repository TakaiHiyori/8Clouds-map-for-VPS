
import React, { useMemo, useState } from 'react';

import {
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  Image,
  Box,
  PinInput,
  Field
} from '@chakra-ui/react';

import {
  PasswordInput
} from "../../../components/ui/password-input"

import { LuUser } from "react-icons/lu"
// import { PasswordInput } from "@/components/ui/password-input"
import { useForm } from "react-hook-form"

import '../../css/login-style.css'

import { onLoginSubmit } from '../../ts/login/login'
import { postEmail } from '../../ts/login/postEmail'

export const showLoginPage: React.FC = () => {
  'use client'

  const mapDomain = window.location.hostname
  console.log(location.href.replace(/[^/]+$/, ''))

  interface FormValues {
    userID: string
    password: string
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>()

  const [errorMessage, setDynamicText] = useState<string>('');

  const [text, setText] = useState<string | undefined>();

  const onSubmit = handleSubmit(async (data) => {
    console.log(data);
    if (data.userID !== '' && data.password !== '') {
      const result: any = await onLoginSubmit(data, mapDomain)
      if (result.success) {
        if (!result.email) {
          const loginConfig = {
            id: result.result.user.id,
            userId: result.result.user.user_id,
            userName: result.result.user.user_name,
            authority: result.result.user.authority,
            loginTime: Number(Date.now()),
            showMaps: result.result.showMaps
          }
          localStorage.setItem('map_' + mapDomain, JSON.stringify(loginConfig));
          window.location.href = location.href.replace(/[^/]+$/, ''); // 通常の遷移
        } else {
          // certificationText = postEmail(getDomainText, result.result)
        }
        window.location.href = location.href.replace(/[^/]+$/, '')
      } else {
        setDynamicText(result.message)
      }
    } else if (data.userID === '' && data.password !== '') {
      setDynamicText('ログインIDが未入力です。')
    } else if (data.userID !== '' && data.password === '') {
      setDynamicText('パスワードが未入力です。')
    } else {
      setDynamicText('ログインIDとパスワードを入力してください。')
    }
  })

  const onCertificationSubmit = handleSubmit(async (data) => { })

  const [show, setShow] = useState<boolean>(false)

  return (
    <Container>
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Flex direction="column" background="gray.100" padding={12} rounded={6} w={'446px'}>
          <Image src="./8clouds_logo1.png"
            // width="100px"
            alignSelf="center"
            w={100}
            marginBottom={5}
          />
          <Box id="login_form">
            <Heading mb={6} justifyContent="center">ログイン</Heading>
            <form onSubmit={onSubmit}>
              <Field.Root>
                <Field.Label>ログインID</Field.Label>
                <Input
                  type="text"
                  variant="outline"
                  id="user_name"
                  placeholder="ログインID"
                  {...register("userID", { required: '入力が必須の項目です。' })}
                  onChange={(e) => { setText(e.target.value) }}
                // w={'355px'}
                // helperText={text !== undefined && !text ? "入力してください" : ""}
                // error={text !== undefined && !text}
                />
                <Field.ErrorText>{errors.userID?.message}</Field.ErrorText>
              </Field.Root>
              <Field.Root>
                <Field.Label>パスワード</Field.Label>
                <PasswordInput
                  variant="outline"
                  type={show ? 'text' : 'password'}
                  id="password"
                  placeholder="パスワード"
                  {...register("password", { required: '入力が必須の項目です。' })}
                  onChange={(e: any) => { setText(e.target.value) }}
                // w={'355px'}
                // helperText={text !== undefined && !text ? "入力してください" : ""}
                // error={text !== undefined && !text}
                />
                {/* <InputRightElement width={'4.5rem'}>
                  <Button h='1.75rem' size='sm' onClick={() => setShow(!show)}>
                    {show ? 'Hide' : 'Show'}
                  </Button>
                </InputRightElement> */}
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>
              <Text id="error_message" textStyle="xl" fontWeight="semibold" style={{ color: 'red' }}>{errorMessage}</Text>
              <Button mb={6} bgColor="cyan.500" type="submit" id="login-button" color={'white'} _hover={{ bg: "cyan.700" }}>ログイン</Button>
            </form>
          </Box>
          <Box id="certification_form" style={{ display: 'none' }}>
            <form onSubmit={onCertificationSubmit}>
              <Field.Root>
                <Field.Label>ログインID</Field.Label>
                <PinInput.Root type="alphanumeric">
                  <PinInput.HiddenInput />
                  <PinInput.Control>
                    <PinInput.Input index={0} />
                    <PinInput.Input index={1} />
                    <PinInput.Input index={2} />
                    <PinInput.Input index={3} />
                    <PinInput.Input index={4} />
                  </PinInput.Control>
                </PinInput.Root>
              </Field.Root>
              <Text id="error_message" textStyle="xl" fontWeight="semibold">{errorMessage}</Text>
              <Button mb={6} bgColor="cyan" type="submit" id="certification_button">認証</Button>
              <Button mb={6} bgColor="cyan" type="button" id="resubmit" disabled>メールを再送信</Button>
            </form>
          </Box>
        </Flex>
      </Flex>
    </Container >
  )
}