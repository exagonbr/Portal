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

      {/* Stats Grid com Estilo Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Total de Alunos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-blue-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-blue-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-purple-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <span className="material-symbols-outlined text-white drop-shadow-lg text-2xl">groups</span>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">1,234</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-blue-100 font-semibold tracking-wide">ALUNOS</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Total de Alunos</h3>
                <p className="text-blue-100 text-sm font-medium">↑ 12% este mês</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card Taxa de Aprovação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-green-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-green-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-emerald-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-teal-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <span className="material-symbols-outlined text-white drop-shadow-lg text-2xl">school</span>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">87%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-green-100 font-semibold tracking-wide">APROVAÇÃO</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Taxa de Aprovação</h3>
                <p className="text-green-100 text-sm font-medium">↑ 5% este período</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card Aulas Hoje */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-purple-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-purple-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-violet-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-fuchsia-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <span className="material-symbols-outlined text-white drop-shadow-lg text-2xl">event</span>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">24</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-purple-100 font-semibold tracking-wide">AULAS</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Aulas Hoje</h3>
                <p className="text-purple-100 text-sm font-medium">-2 que ontem</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Card Mensagens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-amber-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-amber-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-orange-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-red-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <span className="material-symbols-outlined text-white drop-shadow-lg text-2xl">mail</span>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">48</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-amber-100 font-semibold tracking-wide">MENSAGENS</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Mensagens</h3>
                <p className="text-amber-100 text-sm font-medium">↑ 18 novas hoje</p>
              </div>
            </div>
          </div>
        </motion.div>
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
                >
                  <span className="material-symbols-outlined">download</span>
                  Baixar
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Floating Action Button */}
      <FAB
        variant="default"
        onClick={() => console.log('FAB clicked')}
      >
        <span className="material-symbols-outlined">add</span>
      </FAB>

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
                <Button variant="default">Primário</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="info">Com Brilho</Button>
                <Button variant="success">Sucesso</Button>
                <Button variant="warning">Aviso</Button>
                <Button variant="danger">Erro</Button>
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
                <Button size="sm">Extra Pequeno</Button>
                <Button size="sm">Pequeno</Button>
                <Button size="default">Médio</Button>
                <Button size="lg">Grande</Button>
                <Button size="lg">Extra Grande</Button>
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
                <Button variant="default">Gradiente Primário</Button>
                <Button variant="secondary">Gradiente + Brilho</Button>
                <Button variant="info">Com Brilho</Button>
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
                <Button>
                  <span className="material-symbols-outlined">favorite</span>
                  Com Ícone
                </Button>
                <Button>
                  Ícone à Direita
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Button>
              </ButtonGroup>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
} 