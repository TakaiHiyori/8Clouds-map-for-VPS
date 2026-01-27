import { Box, Button, Field, Input } from '@chakra-ui/react'
import { LuSearch } from 'react-icons/lu'

interface values {
  map: any
}

export const SearchAddress = ({ map }: values) => {

  return (
    <Box>
      <Field.Root>
        <Input
          type='text'
          id='address'
          placeholder="東京都千代田区千代田1-1" />
        <Button><LuSearch /></Button>
      </Field.Root>
    </Box>
  )
}