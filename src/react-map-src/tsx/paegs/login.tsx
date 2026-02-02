// 外部ライブラリ
import React, { useState } from 'react';
import { useForm, SubmitHandler, set } from 'react-hook-form';
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
  Field,
  VStack,
  Center,
  Grid,
} from '@chakra-ui/react';

// 内部モジュール
import {
  PasswordInput
} from "../../../components/ui/password-input"

// 内部css
import '../../css/login-style.css'

// 型定義
interface FormValues {
  userID: string;
  password: string;
}

interface LoginConfig {
  id: number;
  userId: string;
  userName: string;
  authority: number;
  loginTime?: number;
  showMaps?: Array<number>;
}

export const showLoginPage: React.FC = () => {
  'use client'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>()

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [mapDomain, setMapDomain] = useState<string>(window.location.hostname);
  const [isAuth, setIsAuth] = useState<boolean>(false)
  const [loginConfig, setLoginConfig] = useState<LoginConfig | null>(null);
  const [isReSend, setIsReSend] = useState<boolean>(false);
  const [canSubmit, setCanSubmit] = useState<boolean>(true);

  // ログインフォーム送信時の処理
  const onLoginSubmit: SubmitHandler<FormValues> = async (data: FormValues) => {
    // URLからドメインを取得してリクエストに含める
    setMapDomain(window.location.hostname);
    const payload = {
      id: data.userID,
      pass: data.password,
      domain: mapDomain,
    }

    try {
      // ログイン認証
      const response: any = await window.fetch("./checkLogin", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        // ログイン成功
        const loginCongfigValue: LoginConfig = {
          id: result.user.id,
          userId: result.user.user_id,
          userName: result.user.user_name,
          authority: result.user.authority,
          loginTime: Number(Date.now()),
          showMaps: result.showMaps
        };
        setLoginConfig((prev) => ({
          ...prev,
          ...loginCongfigValue
        }));

        if (!result.user.email) {
          // 2FA不要
          setIsAuth(false);
          localStorage.setItem('map_' + mapDomain, JSON.stringify(loginCongfigValue));
          window.location.href = location.href.replace(/[^/]+$/, ''); // 通常の遷移
        } else {
          // 2FA必要
          setErrorMessage('');
          setEmail(result.user.email);

          // メール送信
          sendCode(result.user.id, result.user.email, mapDomain );
          setIsAuth(true);
        }
      } else {
        // ログイン失敗
        console.error("ログイン失敗:", result)
        setErrorMessage('ログインIDまたはパスワードが違います。')
      }
    } catch (error) {
      console.error("Network Error:", error)
      setErrorMessage("予期せぬエラーが発生しました。しばらくしてから再度お試しください。")
    }    
  };

  // 認証コードフォーム送信時の処理
  const onCertificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 6桁入力されているかチェック
    if (code.length < 6) {
      setErrorMessage("6桁の認証コードを入力してください。");
      return;
    }

    try {
      // バックエンドへ送信 (例: /api/verify)
      const response = await fetch("./verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code,
          email: email, 
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 成功後の処理（ダッシュボードへ遷移など）
        localStorage.setItem('map_' + mapDomain, JSON.stringify(loginConfig));
        window.location.href = location.href.replace(/[^/]+$/, '');
      } else {
        if (response.status === 422) {
          setCanSubmit(false);
        }
        console.error("認証失敗:", result);
        setErrorMessage(result.message || "認証に失敗しました。再度お試しください。");
      }
    } catch (error) {
      console.error("認証失敗:", error);
      setErrorMessage("予期せぬエラーが発生しました。しばらくしてから再度お試しください。");
    }
  };

  // 認証コード送信処理
  const sendCode = async (user_id: number | undefined = loginConfig?.id, targetEmail: string = email, domain: string = mapDomain): Promise<void> => {
    setIsReSend(false);
    setCanSubmit(true);
    setCode("");
    setErrorMessage("");
    
    const mailResponse = await fetch('./mail', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_id: user_id, email: targetEmail, domain: domain })
    })
    setTimeout(() => {
      setIsReSend(true);
    }, 10000);
    const mailResult = await mailResponse.json();
  };

  // 戻る処理
  const handleBack = () => {
    reset();
    setErrorMessage("");
    setIsAuth(false);
  };

  return (
    <Container>
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Flex direction="column" background="gray.100" padding={12} rounded={6} w={'446px'}>
          <Image src="./8clouds_logo1.png"
            alignSelf="center"
            w={100}
            marginBottom={5}
          />

          {/* ログインフォーム */}
          {!isAuth && <Box id="login_form" style={{ color: 'black' }}>
            <Heading mb={6} justifyContent="center">ログイン</Heading>
            <VStack gap="4" as="form" onSubmit={handleSubmit(onLoginSubmit)} align="stretch">
              
              {/* ログインID Field */}
              <Field.Root invalid={!!errors.userID}>
                <Field.Label>ログインID</Field.Label>
                <Input
                  type="text"
                  variant="outline"
                  id="user_name"
                  placeholder="ログインID"
                  {...register("userID", { required: 'ログインIDを入力してください' })}
                />
                <Field.ErrorText>{errors.userID?.message}</Field.ErrorText>
              </Field.Root>

              {/* パスワード Field */}
              <Field.Root invalid={!!errors.password}>
                <Field.Label>パスワード</Field.Label>
                <PasswordInput
                  variant="outline"
                  type='password'
                  id="password"
                  placeholder="パスワード"
                  {...register("password", { required: 'パスワードを入力してください' })}
                />
                <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
              </Field.Root>

              <Text 
                id="error_message" 
                color="fg.error"
                fontSize="xs"
                fontWeight="medium">
                  {errorMessage}
              </Text>
              <Button 
                mb={6} 
                bgColor="cyan.500" 
                type="submit" 
                id="login-button" 
                color={'white'} 
                _hover={{ bg: "cyan.700" }}
                loading={isSubmitting}>
                ログイン
              </Button>
            </VStack>
          </Box>}

          {/* 認証コードフォーム */}
          {isAuth && (
            <Box id="certification_form" style={{ color: 'black' }}>
              <Heading mb={6} justifyContent="center">2段階認証</Heading>

              <Text mb={6} fontSize="sm" textAlign="center">
                メールに送信された認証コードを入力してください。
              </Text>
              
              <VStack gap="4" as="form" onSubmit={onCertificationSubmit} align="stretch">
                
                {/* 認証コード入力フィールド */}
                <Field.Root>
                  <Field.Label>認証コード（数字6桁）</Field.Label>
                  <Center w="full">
                    <PinInput.Root 
                      type="numeric" 
                      otp 
                      onValueChange={(e) => setCode(e.value.join(""))}
                    >
                      <PinInput.HiddenInput />
                      <PinInput.Control>
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <PinInput.Input key={index} index={index} />
                        ))}
                      </PinInput.Control>
                    </PinInput.Root>
                  </Center>
                </Field.Root>

                {/* エラーメッセージ */}
                <Text 
                  id="error_message" 
                  color="fg.error" 
                  fontSize="xs" 
                  fontWeight="medium"
                  minH="1.5em"
                >
                  {errorMessage}
                </Text>

                {/* 認証ボタン */}
                <Button 
                  bgColor="cyan.500" 
                  type="submit" 
                  id="certification_button"
                  color={'white'}
                  _hover={{ bg: "cyan.700" }}
                  disabled={!canSubmit}
                >
                  認証
                </Button>

                <Grid templateColumns="repeat(2, 1fr)" gap="3" pt={2}>
                  <Button
                    bgColor="gray.500"
                    color="white"
                    _hover={{ bg: "gray.400" }}
                    onClick={() => handleBack()}
                    w="full"
                  >
                    戻る
                  </Button>

                  <Button
                    borderColor="cyan.500"
                    bgColor="white"
                    color="cyan.500"
                    _hover={{ bg: "cyan.700", color: "white" }}
                    type="button"
                    id="resubmit"
                    onClick={() => sendCode()}
                    disabled={!isReSend}
                    w="full"
                  >
                    メールを再送信
                  </Button>
                </Grid>
               
              </VStack>
            </Box>
          )}

        </Flex>
      </Flex>
    </Container >
  )
}