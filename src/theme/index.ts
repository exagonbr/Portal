import { extendTheme } from '@chakra-ui/theme-utils';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'blue',
      },
    },
    Table: {
      defaultProps: {
        variant: 'simple',
      },
    },
    Modal: {
      defaultProps: {
        isCentered: true,
      },
    },
  },
});

export default theme; 