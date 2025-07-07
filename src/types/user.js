"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureBackwardCompatibility = exports.migrateUserFields = exports.USER_STATUS_COLORS = exports.USER_STATUS_LABELS = void 0;
exports.USER_STATUS_LABELS = {
    'true': 'Ativo',
    'false': 'Inativo'
};
exports.USER_STATUS_COLORS = {
    'true': 'green',
    'false': 'red'
};
// ===== UTILITÁRIOS DE MIGRAÇÃO =====
/**
 * Converte campos legados para novos campos padronizados
 */
const migrateUserFields = (user) => {
    return {
        ...user,
        phone: user.phone || user.telefone,
        address: user.address || user.endereco,
        // Remove campos legados após migração
        telefone: undefined,
        endereco: undefined
    };
};
exports.migrateUserFields = migrateUserFields;
/**
 * Mantém compatibilidade com campos legados
 */
const ensureBackwardCompatibility = (user) => {
    return {
        ...user,
        telefone: user.telefone || user.phone,
        endereco: user.endereco || user.address
    };
};
exports.ensureBackwardCompatibility = ensureBackwardCompatibility;
//# sourceMappingURL=user.js.map