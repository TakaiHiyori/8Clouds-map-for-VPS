import { Box, Text } from '@chakra-ui/react';
import React from 'react';

export const MapContract = ({ configs }: { configs: any }) => {
  let domain: string = configs.domain;
  return (
    <Box>
      <Box bg="white" p={4} borderRadius="md" mb={6} borderLeft="4px solid" borderColor="blue.500">
        <Text fontSize="sm" color="gray.600" mb={1}>現在使用中のkintoneドメイン</Text>
        <Text fontSize="lg" fontWeight="bold">{domain}</Text>
      </Box>
    </Box>
  )
}