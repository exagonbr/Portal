import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  title: string;
  initialData?: any;
  fields: {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    options?: { label: string; value: any }[];
    render?: (props: any) => React.ReactNode;
  }[];
}

export const CrudModal: React.FC<CrudModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  fields,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: initialData,
  });

  const onSubmitHandler = async (data: any) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmitHandler)}>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {fields.map((field) => (
                <FormControl
                  key={field.name}
                  isInvalid={!!errors[field.name]}
                  isRequired={field.required}
                >
                  <FormLabel>{field.label}</FormLabel>
                  {field.render ? (
                    field.render({
                      ...register(field.name, {
                        required: field.required && 'Este campo é obrigatório',
                      }),
                    })
                  ) : (
                    <input
                      {...register(field.name, {
                        required: field.required && 'Este campo é obrigatório',
                      })}
                      type={field.type}
                    />
                  )}
                  <FormErrorMessage>
                    {errors[field.name]?.message as string}
                  </FormErrorMessage>
                </FormControl>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
            >
              Salvar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}; 