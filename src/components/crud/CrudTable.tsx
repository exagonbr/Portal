import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Box,
  Flex,
  Button,
  useDisclosure,
  Spinner,
  Text,
  Input,
  Stack,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.ReactNode;
}

interface CrudTableProps {
  columns: Column[];
  data: any[];
  isLoading?: boolean;
  onAdd?: () => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  title: string;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
}

export const CrudTable: React.FC<CrudTableProps> = ({
  columns,
  data,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  title,
  searchPlaceholder = 'Pesquisar...',
  onSearch,
}) => {
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="2xl" fontWeight="bold">{title}</Text>
        <Stack direction="row" spacing={4}>
          {onSearch && (
            <Input
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch(e.target.value)}
              maxW="300px"
            />
          )}
          {onAdd && (
            <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={onAdd}>
              Adicionar
            </Button>
          )}
        </Stack>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner />
        </Flex>
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th key={column.key}>{column.label}</Th>
              ))}
              {(onEdit || onDelete) && <Th>Ações</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, index) => (
              <Tr key={index}>
                {columns.map((column) => (
                  <Td key={column.key}>
                    {column.render
                      ? column.render(item[column.key], item)
                      : item[column.key]}
                  </Td>
                ))}
                {(onEdit || onDelete) && (
                  <Td>
                    <Flex gap={2}>
                      {onEdit && (
                        <IconButton
                          aria-label="Editar"
                          icon={<FiEdit2 />}
                          size="sm"
                          onClick={() => onEdit(item)}
                        />
                      )}
                      {onDelete && (
                        <IconButton
                          aria-label="Excluir"
                          icon={<FiTrash2 />}
                          size="sm"
                          colorScheme="red"
                          onClick={() => onDelete(item)}
                        />
                      )}
                    </Flex>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}; 