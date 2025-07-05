// src/components/admin/analytics/ActiveSessionsTable.tsx
'use client';

import React from 'react';
import { ActiveSession } from '../../../types/analytics';

interface ActiveSessionsTableProps {
  sessions: ActiveSession[];
  onTerminateSession: (sessionId: string) => void;
}

const ActiveSessionsTable: React.FC<ActiveSessionsTableProps> = ({ sessions, onTerminateSession }) => {
  if (sessions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>Nenhuma sessão ativa no momento.</p>
      </div>
    );
  }

  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " dias";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " horas";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutos";
    return Math.floor(seconds) + " segundos";
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Login
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Última Atividade
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
          {sessions.map((session) => (
            <tr key={session.sessionId}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{session.username}</div>
                <div className="text-xs text-gray-500">{session.role}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {session.ipAddress}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {timeSince(session.loginTime)} atrás
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {timeSince(session.lastActivityTime)} atrás
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onTerminateSession(session.sessionId)}
                  className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400"
                >
                  Encerrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActiveSessionsTable;