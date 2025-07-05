import React, { useState } from 'react';
import { Button, Modal, message, Spin, Typography, List } from 'antd';
import axios from 'axios';
import { API_URL } from '../../config/constants';

const { Title, Text, Paragraph } = Typography;

const defaultUsers = [
  {
    email: 'admin@sabercon.edu.br',
    name: 'Administrador do Sistema',
    role: 'SYSTEM_ADMIN',
    emoji: '👑',
    description: 'Acesso completo ao sistema'
  },
  {
    email: 'gestor@sabercon.edu.br',
    name: 'Gestor Institucional',
    role: 'INSTITUTION_MANAGER',
    emoji: '🏢',
    description: 'Gerencia operações institucionais'
  },
  {
    email: 'professor@sabercon.edu.br',
    name: 'Professor',
    role: 'TEACHER',
    emoji: '👨‍🏫',
    description: 'Professor com acesso a turmas'
  },
  {
    email: 'julia.c@ifsp.com',
    name: 'Julia Campos',
    role: 'STUDENT',
    emoji: '🎓',
    description: 'Estudante do IFSP'
  },
  {
    email: 'coordenador@sabercon.edu.com',
    name: 'Coordenador Acadêmico',
    role: 'COORDINATOR',
    emoji: '📚',
    description: 'Coordena atividades acadêmicas'
  },
  {
    email: 'renato@gmail.com',
    name: 'Renato Silva',
    role: 'GUARDIAN',
    emoji: '👨‍👩‍👧‍👦',
    description: 'Responsável por estudante'
  }
];

const CreateDefaultUsersButton: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const showModal = () => {
    setIsModalVisible(true);
    setResult(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCreateUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/admin/create-default-users`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setResult({
        success: true,
        message: response.data.message || 'Usuários padrão criados com sucesso'
      });
      message.success('Usuários padrão criados com sucesso');
    } catch (error: any) {
      console.error('Erro ao criar usuários padrão:', error);
      setResult({
        success: false,
        message: error.response?.data?.message || 'Erro ao criar usuários padrão'
      });
      message.error('Erro ao criar usuários padrão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        type="primary" 
        onClick={showModal}
        icon={<span role="img" aria-label="user">👤</span>}
      >
        Criar Usuários Padrão
      </Button>

      <Modal
        title={<Title level={4}>Criar Usuários Padrão</Title>}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        {!result ? (
          <>
            <Paragraph>
              Esta ação criará os seguintes usuários padrão no sistema:
            </Paragraph>

            <List
              itemLayout="horizontal"
              dataSource={defaultUsers}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<span style={{ fontSize: '24px' }}>{item.emoji}</span>}
                    title={<Text strong>{item.name}</Text>}
                    description={
                      <>
                        <div><Text type="secondary">Email: {item.email}</Text></div>
                        <div><Text type="secondary">Role: {item.role}</Text></div>
                        <div><Text type="secondary">{item.description}</Text></div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />

            <Paragraph style={{ marginTop: 16 }}>
              <Text strong>Senha para todos os usuários: </Text> 
              <Text code>password123</Text>
            </Paragraph>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleCancel}>
                Cancelar
              </Button>
              <Button 
                type="primary" 
                onClick={handleCreateUsers}
                loading={loading}
              >
                Confirmar Criação
              </Button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            {loading ? (
              <Spin size="large" />
            ) : (
              <>
                <div style={{ fontSize: '48px', marginBottom: 16 }}>
                  {result.success ? '✅' : '❌'}
                </div>
                <Title level={4}>{result.success ? 'Sucesso!' : 'Erro!'}</Title>
                <Paragraph>{result.message}</Paragraph>
                {result.success && (
                  <Paragraph>
                    Todos os usuários foram criados com a senha: <Text code>password123</Text>
                  </Paragraph>
                )}
                <Button 
                  type="primary" 
                  onClick={handleCancel}
                  style={{ marginTop: 16 }}
                >
                  Fechar
                </Button>
              </>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default CreateDefaultUsersButton; 