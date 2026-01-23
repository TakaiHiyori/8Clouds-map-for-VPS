import React from 'react';
import ReactDOM from 'react-dom/client';
import { defaultSystem } from '@chakra-ui/react';
import { Provider } from "../../components/ui/provider";
import { mapView as MapView } from './paegs/map';
import { showLoginPage as ShowLoginPage } from './paegs/login';
import { showConfig as ShowConfig } from './paegs/config';

import { Container, Text, Spinner, Box, Center } from '@chakra-ui/react';

import { getURL } from '../ts/getURL';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  const url: null | string = await getURL()

  if (!url) {
    root.render(
      <React.StrictMode>
        < Provider>
          <Box id="loading" pos="absolute" inset="0" bg="bg/0">
            <Center h="full">
              <Spinner
                size="lg"
                color="cyan.600"
                animationDuration="0.8s"
                borderWidth="4px"
              />
            </Center>
            <Text color="cyan.600">読み込み中...</Text>
          </Box>
          <MapView />
        </ Provider>
      </React.StrictMode>
    );
  } else if (url === 'config') {
    root.render(
      // <React.StrictMode>
      < Provider>
        <Box id="loading" pos="absolute" inset="0" bg="bg/0">
          <Center h="full">
            <Spinner
              size="lg"
              color="cyan.600"
              animationDuration="0.8s"
              borderWidth="4px"
            />
          </Center>
          <Text color="cyan.600">読み込み中...</Text>
        </Box>
        <ShowConfig />
      </ Provider>
      // </React.StrictMode>
    );
  } else if (url === 'login') {
    root.render(
      <React.StrictMode>
        < Provider>
          <ShowLoginPage />
        </ Provider>
      </React.StrictMode>
    );
  } else if (!url || url === 'notAccess') {
    root.render(
      <React.StrictMode>
        < Provider>
          <Container>
            <Box id="loading" pos="absolute" inset="0" bg="bg/80">
              <Center h="full">
                <Spinner
                  size="lg"
                  color="cyan.600"
                  animationDuration="0.8s"
                  borderWidth="4px"
                />
              </Center>
            </Box>
            <h1>アクセスできません。</h1>
          </Container>
        </ Provider>
      </React.StrictMode>
    )
  } else {

  }
}
