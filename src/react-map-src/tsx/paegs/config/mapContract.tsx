import { Box, Table, Text } from '@chakra-ui/react';
import React from 'react';

export const MapContract = ({ configs }: { configs: any }) => {
  let domain: string = configs.domain;
  const optionsLabel: { addImage: string; drawMap: string; addShapeFile: string; } = {
    addImage: '画像でピン追加オプション',
    drawMap: '描画機能オプション',
    addShapeFile: 'シェイプファイルの追加オプション'
  }
  const options: any = [];

  for (const key in configs) {
    if (typeof configs[key] === 'boolean') {
      options.push({
        label: optionsLabel[key],
        valid: configs[key]
      })
    }
  }
  return (
    <Box>
      <Box bg="white" p={4} mb={6} borderLeft="4px solid" >
        <Text textStyle="md" color="gray.600" mb={1}>現在使用中のkintoneドメイン</Text>
        <Text textStyle="md" fontWeight="bold">{domain}</Text>
      </Box>

      <Table.Root bg="white" borderRadius="md" overflow="hidden" boxShadow="sm" id='show_user_table' stickyHeader>
        <Table.Header>
          <Table.Row style={{ backgroundColor: '#f7fafc' }}>
            <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: 'large', borderBottom: '1px solid #e2e8f0' }}>オプション名</Table.ColumnHeader>
            <Table.ColumnHeader style={{ padding: '12px', textAlign: 'left', fontSize: 'large', borderBottom: '1px solid #e2e8f0' }}></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {options.map((option: any) => (
            <Table.Row style={{ borderBottom: '1px solid #e2e8f0' }} background={option.valid ? 'white' : 'gray.300'} >
              <Table.Cell style={{ padding: '12px', fontSize: 'large' }} className='option-label'>{option.label}</Table.Cell>
              <Table.Cell style={{ padding: '12px', fontSize: 'large' }} className='option-valid'>{option.valid === true ? '有効' : '無効'}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  )
}