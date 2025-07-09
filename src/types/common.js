"use strict";
/**
 * Tipos e definições centralizadas para garantir compatibilidade
 * entre frontend e backend
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_COLORS = exports.STATUS_LABELS = exports.parseDate = exports.formatDate = exports.formatPhone = exports.isValidUUID = exports.isValidPhone = exports.isValidEmail = exports.USER_CLASS_ROLE_LABELS = exports.USER_ROLE_LABELS = exports.INSTITUTION_TYPE_LABELS = exports.UserClassRole = exports.UserRole = exports.InstitutionType = void 0;
// ===== ENUMS CENTRALIZADOS =====
var InstitutionType;
(function (InstitutionType) {
    InstitutionType["SCHOOL"] = "SCHOOL";
    InstitutionType["COLLEGE"] = "COLLEGE";
    InstitutionType["UNIVERSITY"] = "UNIVERSITY";
    InstitutionType["TECH_CENTER"] = "TECH_CENTER";
})(InstitutionType = exports.InstitutionType || (exports.InstitutionType = {}));
var UserRole;
(function (UserRole) {
    UserRole["STUDENT"] = "student";
    UserRole["TEACHER"] = "teacher";
    UserRole["ADMIN"] = "admin";
    UserRole["MANAGER"] = "manager";
    UserRole["SYSTEM_ADMIN"] = "system_admin";
    UserRole["INSTITUTION_MANAGER"] = "institution_manager";
    UserRole["COORDINATOR"] = "coordinator";
    UserRole["GUARDIAN"] = "guardian";
})(UserRole = exports.UserRole || (exports.UserRole = {}));
var UserClassRole;
(function (UserClassRole) {
    UserClassRole["STUDENT"] = "student";
    UserClassRole["TEACHER"] = "teacher";
    UserClassRole["ASSISTANT"] = "assistant";
    UserClassRole["OBSERVER"] = "observer";
})(UserClassRole = exports.UserClassRole || (exports.UserClassRole = {}));
// ===== LABELS PARA ENUMS =====
exports.INSTITUTION_TYPE_LABELS = {
    [InstitutionType.SCHOOL]: 'Escola',
    [InstitutionType.COLLEGE]: 'Faculdade',
    [InstitutionType.UNIVERSITY]: 'Universidade',
    [InstitutionType.TECH_CENTER]: 'Centro Técnico'
};
exports.USER_ROLE_LABELS = {
    [UserRole.STUDENT]: 'Aluno',
    [UserRole.TEACHER]: 'Professor',
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.MANAGER]: 'Gestor',
    [UserRole.SYSTEM_ADMIN]: 'Administrador do Sistema',
    [UserRole.INSTITUTION_MANAGER]: 'Gestor da Instituição',
    [UserRole.COORDINATOR]: 'Coordenador Acadêmico',
    [UserRole.GUARDIAN]: 'Responsável'
};
exports.USER_CLASS_ROLE_LABELS = {
    [UserClassRole.STUDENT]: 'Aluno',
    [UserClassRole.TEACHER]: 'Professor',
    [UserClassRole.ASSISTANT]: 'Assistente',
    [UserClassRole.OBSERVER]: 'Observador'
};
// ===== VALIDADORES =====
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
const isValidPhone = (phone) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
};
exports.isValidPhone = isValidPhone;
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
exports.isValidUUID = isValidUUID;
// ===== UTILITÁRIOS DE CONVERSÃO =====
const formatPhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
};
exports.formatPhone = formatPhone;
const formatDate = (date) => {
    if (typeof date === 'string')
        return date;
    return date.toISOString();
};
exports.formatDate = formatDate;
const parseDate = (dateString) => {
    return new Date(dateString);
};
exports.parseDate = parseDate;
exports.STATUS_LABELS = {
    active: 'Ativo',
    inactive: 'Inativo',
    pending: 'Pendente',
    suspended: 'Suspenso'
};
exports.STATUS_COLORS = {
    active: 'green',
    inactive: 'gray',
    pending: 'yellow',
    suspended: 'red'
};
//# sourceMappingURL=common.js.map