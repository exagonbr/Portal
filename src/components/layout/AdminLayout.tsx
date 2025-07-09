import React from 'react';
import { Box, Container, Flex } from '@chakra-ui/react';
import { StandardHeader } from '../StandardHeader';
import { SafeDashboardSidebar } from '../SafeDashboardSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <Flex minH="100vh" direction="column">
      <StandardHeader />
      <Flex flex="1">
        <SafeDashboardSidebar />
        <Box as="main" flex="1" p={4}>
          <Container maxW="container.xl">
            {children}
          </Container>
        </Box>
      </Flex>
    </Flex>
  );
}; 