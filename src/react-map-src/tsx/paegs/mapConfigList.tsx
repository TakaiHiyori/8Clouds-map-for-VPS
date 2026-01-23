import { Box, Button, Link, SegmentGroup, Editable, IconButton, Dialog, CloseButton, Text } from '@chakra-ui/react';
import React from 'react';
import { LuCheck, LuExternalLink, LuPencilLine, LuX } from 'react-icons/lu';
import { MapConfig } from './mapConfig';
// import { config } from 'process';


export const MapConfigList = ({ values }: { values: any }) => {
  const configs = values.configs;
  const users = values.users
  let mapNum = '無制限'

  const validChange = (e: any) => {
    console.log(e.target.value)
    console.log(e.target.closest('.map-configs'))
    if (e.target.value === 'true') {
      e.target.closest('.map-configs').style.backGround = 'white'
    } else {
      e.target.closest('.map-configs').style.backGround = 'rgb(147 147 147)'
    }
  }

  const openURL = () => {
    return 'flex'
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
                <MapConfig mapConfig={{ config: null, domain: configs.domain, addImage: configs.addImage, user: users }} />
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
        Object.keys(configs).map((c) => {
          if (configs[c].mapTitle) {
            return (
              <Box className='map-configs'
                bg="white" borderWidth="1px" shadow="md" borderRadius="md" display="flex" padding={5} gap={"20px"} marginBottom={5}>
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
                        <MapConfig mapConfig={{ config: configs[c], domain: configs.domain, addImage: configs.addImage, user: users }} />
                      </Dialog.Body>
                      <Dialog.Footer />
                    </Dialog.Content>
                  </Dialog.Positioner>
                </Dialog.Root>

                <Editable.Root defaultValue={configs[c].mapTitle} fontSize={"large"}>
                  <Editable.Preview />
                  <Editable.Input className='map-name' fontSize={"large"} />
                  <Editable.Control>
                    <Editable.EditTrigger asChild>
                      <IconButton variant="ghost" size="xs">
                        <LuPencilLine />
                      </IconButton>
                    </Editable.EditTrigger>
                    <Editable.CancelTrigger asChild>
                      <IconButton variant="outline" size="xs">
                        <LuX />
                      </IconButton>
                    </Editable.CancelTrigger>
                    <Editable.SubmitTrigger asChild>
                      <IconButton variant="outline" size="xs">
                        <LuCheck />
                      </IconButton>
                    </Editable.SubmitTrigger>
                  </Editable.Control>
                </Editable.Root>
                <Link className='show_open_url' href="#" w={"250px"} >
                  閲覧専用マップ <LuExternalLink />
                </Link>
                <SegmentGroup.Root defaultValue="true"
                  bg="white"
                  colorPalette="cyan.700"
                  css={{
                    "--segment-indicator-bg": "colors.cyan.300",
                    "--segment-indicator-shadow": "shadows.md",
                  }}
                  // onValueChange={validChange}
                  onChange={validChange}

                >
                  <SegmentGroup.Indicator defaultValue={JSON.stringify(configs[c].valid)} />
                  {/* <SegmentGroup.Items items={[
                  { value: "false", label: "非表示" },
                  { value: "true", label: "表示" }
                ]} /> */}
                  <SegmentGroup.Item key={"valid"} value={'false'}>
                    <SegmentGroup.ItemText>{"OFF"}</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                  <SegmentGroup.Item key={"valid"} value={"true"}>
                    <SegmentGroup.ItemText>{"ON"}</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                </SegmentGroup.Root>
                <Button bgColor="white" color="red" px={4} py={2} borderRadius="md" fontWeight="bold" borderColor="red">削除</Button>
              </Box>
            )
          } else {
            return null;
          }
        })
      }
    </Box >
  )
}