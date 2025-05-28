import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('notifications').del();

    // Inserts seed entries
    await knex('notifications').insert([
        {
            title: 'Reunião de Coordenação',
            message: 'Reunião marcada para discutir o planejamento do próximo semestre',
            type: 'info',
            category: 'administrative',
            sent_at: '2024-01-15T10:30:00',
            sent_by: knex.raw('gen_random_uuid()'), // Assuming user with id 1 exists
            recipients: JSON.stringify({
                total: 15,
                read: 12,
                unread: 3,
                roles: ['teacher']
            }),
            status: 'sent',
            scheduled_for: null,
            priority: 'high',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            title: 'Nova Atividade de Matemática',
            message: 'Atividade sobre álgebra linear disponível na plataforma',
            type: 'success',
            category: 'academic',
            sent_at: '2024-01-14T14:20:00',
            sent_by: knex.raw('gen_random_uuid()'), // Assuming user with id 1 exists
            recipients: JSON.stringify({
                total: 30,
                read: 25,
                unread: 5,
                roles: ['student']
            }),
            status: 'sent',
            scheduled_for: null,
            priority: 'medium',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            title: 'Manutenção do Sistema',
            message: 'Sistema ficará indisponível no domingo das 2h às 6h',
            type: 'warning',
            category: 'system',
            sent_at: '2024-01-13T16:45:00',
            sent_by: knex.raw('gen_random_uuid()'), // Assuming user with id 1 exists
            recipients: JSON.stringify({
                total: 50,
                read: 45,
                unread: 5,
                roles: ['teacher', 'student']
            }),
            status: 'sent',
            scheduled_for: null,
            priority: 'high',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            title: 'Aviso sobre Provas',
            message: 'Cronograma de provas do mês de fevereiro',
            type: 'info',
            category: 'academic',
            sent_at: null,
            sent_by: knex.raw('gen_random_uuid()'), // Assuming user with id 1 exists
            recipients: JSON.stringify({
                total: 25,
                read: 0,
                unread: 0,
                roles: ['student']
            }),
            status: 'scheduled',
            scheduled_for: '2024-01-20T08:00:00',
            priority: 'medium',
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            title: 'Rascunho - Evento Cultural',
            message: 'Convite para participar do evento cultural da escola',
            type: 'info',
            category: 'social',
            sent_at: null,
            sent_by: knex.raw('gen_random_uuid()'), // Assuming user with id 1 exists
            recipients: JSON.stringify({
                total: 0,
                read: 0,
                unread: 0
            }),
            status: 'draft',
            scheduled_for: null,
            priority: 'low',
            created_at: new Date(),
            updated_at: new Date()
        }
    ]);
}
