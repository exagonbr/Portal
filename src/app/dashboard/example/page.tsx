'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import Card, { CardHeader, CardBody, CardFooter, StatCard } from '@/components/ui/Card';
import { Button, ButtonGroup, FAB } from '@/components/ui/Button';

export default function ExampleDashboard() {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: 'dashboard' },
    { id: 'analytics', label: 'Análises', icon: 'analytics' },
    { id: 'reports', label: 'Relatórios', icon: 'description' },
    { id: 'settings', label: 'Configurações', icon: 'settings' },
  ];

  const stats = [
    {
      title: 'Total de Alunos',
      value: '1,234',
      icon: <span className="material-symbols-outlined">groups</span>,
      trend: { value: 12, isPositive: true },
      color: 'primary' as const,
    },
    {
      title: 'Taxa de Aprovação',
      value: '87%',
      icon: <span className="material-symbols-outlined">school</span>,
      trend: { value: 5, isPositive: true },
      color: 'success' as const,
    },
    {
      title: 'Aulas Hoje',
      value: '24',
      icon: <span className="material-symbols-outlined">event</span>,
      trend: { value: -2, isPositive: false },
      color: 'warning' as const,
    },
    {
      title: 'Mensagens',
      value: '48',
      icon: <span className="material-symbols-outlined">mail</span>,
      trend: { value: 18, isPositive: true },
      color: 'accent' as const,
    },
  ];

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: theme.colors.background.primary }}
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: theme.colors.text.primary }}
          >
            Dashboard Exemplo
          </h1>
          <p 
            className="text-lg"
            style={{ color: theme.colors.text.secondary }}
          >
            Demonstração dos novos componentes e temas
          </p>
        </div>
        <ThemeSelector />
      </motion.div>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 mb-8 p-1 rounded-xl"
        style={{ backgroundColor: theme.colors.background.secondary }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
              ${selectedTab === tab.id ? 'shadow-md' : ''}
            `}
            style={{
              backgroundColor: selectedTab === tab.id 
                ? theme.colors.background.card 
                : 'transparent',
              color: selectedTab === tab.id 
                ? theme.colors.primary.DEFAULT 
                : theme.colors.text.secondary,
            }}
          >
            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card gradient glass>
            <CardHeader 
              icon={<span className="material-symbols-outlined">insights</span>}
              action={
                <Button variant="ghost" size="sm">
                  <span className="material-symbols-outlined">more_vert</span>
                </Button>
              }
            >
              Desempenho Mensal
            </CardHeader>
            <CardBody>
              <div className="h-64 flex items-center justify-center">
                <p style={{ color: theme.colors.text.tertiary }}>
                  Gráfico de desempenho aqui
                </p>
              </div>
            </CardBody>
            <CardFooter>
              <ButtonGroup>
                <Button variant="outline" size="sm">
                  Exportar
                </Button>
                <Button variant="default" size="sm">
                  Ver Detalhes
                </Button>
              </ButtonGroup>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Atividades Recentes */}
          <Card hover>
            <CardHeader 
              icon={<span className="material-symbols-outlined">history</span>}
            >
              Atividades Recentes
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                    style={{ 
                      backgroundColor: theme.colors.background.hover,
                      border: `1px solid ${theme.colors.border.light}`
                    }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.colors.status.success }}
                    />
                    <div className="flex-1">
                      <p 
                        className="text-sm font-medium"
                        style={{ color: theme.colors.text.primary }}
                      >
                        Nova tarefa concluída
                      </p>
                      <p 
                        className="text-xs"
                        style={{ color: theme.colors.text.tertiary }}
                      >
                        Há {item * 5} minutos
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader 
              icon={<span className="material-symbols-outlined">flash_on</span>}
            >
              Ações Rápidas
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="default"
                  size="sm"
                >
                  Novo
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                >
                  Upload
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  Compartilhar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={<span className="material-symbols-outlined">download</span>}
                >
                  Baixar
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <FAB
        variant="primary"
        gradient
        icon={<span className="material-symbols-outlined">add</span>}
        onClick={() => console.log('FAB clicked')}
      />

      {/* Demo Buttons Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <Card>
          <CardHeader>
            Demonstração de Botões
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Variantes */}
            <div>
              <h3 
                className="text-sm font-medium mb-3"
                style={{ color: theme.colors.text.secondary }}
              >
                Variantes
              </h3>
              <ButtonGroup>
                <Button variant="primary">Primário</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="accent">Destaque</Button>
                <Button variant="success">Sucesso</Button>
                <Button variant="warning">Aviso</Button>
                <Button variant="error">Erro</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
              </ButtonGroup>
            </div>

            {/* Tamanhos */}
            <div>
              <h3 
                className="text-sm font-medium mb-3"
                style={{ color: theme.colors.text.secondary }}
              >
                Tamanhos
              </h3>
              <ButtonGroup>
                <Button size="xs">Extra Pequeno</Button>
                <Button size="sm">Pequeno</Button>
                <Button size="md">Médio</Button>
                <Button size="lg">Grande</Button>
                <Button size="xl">Extra Grande</Button>
              </ButtonGroup>
            </div>

            {/* Com Gradiente */}
            <div>
              <h3 
                className="text-sm font-medium mb-3"
                style={{ color: theme.colors.text.secondary }}
              >
                Com Gradiente e Brilho
              </h3>
              <ButtonGroup>
                <Button variant="primary" gradient>Gradiente Primário</Button>
                <Button variant="secondary" gradient glow>Gradiente + Brilho</Button>
                <Button variant="accent" glow>Com Brilho</Button>
              </ButtonGroup>
            </div>

            {/* Estados */}
            <div>
              <h3 
                className="text-sm font-medium mb-3"
                style={{ color: theme.colors.text.secondary }}
              >
                Estados
              </h3>
              <ButtonGroup>
                <Button loading>Carregando</Button>
                <Button disabled>Desabilitado</Button>
                <Button 
                  icon={<span className="material-symbols-outlined">favorite</span>}
                  iconPosition="left"
                >
                  Com Ícone
                </Button>
                <Button 
                  icon={<span className="material-symbols-outlined">arrow_forward</span>}
                  iconPosition="right"
                >
                  Ícone à Direita
                </Button>
              </ButtonGroup>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
} 