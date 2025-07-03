/**
 * Seed gerado automaticamente baseado nos dados MySQL
 * Tabela: settings -> system_settings
 * Gerado em: 2025-06-01T17:28:00.426Z
 */

import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Limpa dados existentes
  await knex('system_settings').del();

  // Insere dados de exemplo do MySQL
  await knex('system_settings').insert([
    {
        "id": 1,
        "default_value": null,
        "description": "Diretório do S3 que será armazenado os arquivos da plataformaLembrete: Se você mudar esse local, copie todos os arquivos para dentro desse novo diretório.",
        "name": null,
        "required": "AQ==",
        "settings_key": "Upload Directory",
        "settings_type": "string",
        "validation_required": "AQ==",
        "value": "/s3_files"
    },
    {
        "id": 2,
        "default_value": null,
        "description": "O URL-base é usado para o link no e-mail de convite.",
        "name": null,
        "required": "AA==",
        "settings_key": "Base URL",
        "settings_type": "string",
        "validation_required": "AA==",
        "value": "https://plat.sabercon.com.br"
    },
    {
        "id": 3,
        "default_value": null,
        "description": "Entre com um ou mais diretorios de redundância, separados por |. Exemplo: /data/streama|/mnt/streama.",
        "name": null,
        "required": "AA==",
        "settings_key": "Second Directory",
        "settings_type": "string",
        "validation_required": "AQ==",
        "value": "/s3_files"
    },
    {
        "id": 4,
        "default_value": null,
        "description": "Diretório Local",
        "name": null,
        "required": "AA==",
        "settings_key": "Local Video Files",
        "settings_type": "string",
        "validation_required": "AQ==",
        "value": "/s3_files"
    },
    {
        "id": 5,
        "default_value": "/assets/logo.png",
        "description": "Faça upload o logo de abertura aqui",
        "name": "logo",
        "required": "AQ==",
        "settings_key": "Logo",
        "settings_type": "fileUpload",
        "validation_required": "AQ==",
        "value": "upload:1160"
    },
    {
        "id": 6,
        "default_value": "/assets/favicon.ico",
        "description": "Icone no browser. Para mais compatibilidade, use 16x16 .ico",
        "name": "favicon",
        "required": "AQ==",
        "settings_key": "Favicon",
        "settings_type": "fileUpload",
        "validation_required": "AQ==",
        "value": "upload:1154"
    },
    {
        "id": 7,
        "default_value": "/assets/bg.jpg",
        "description": "Faça upload do plano de fundo da plataforma com 1920 de largura aqui ",
        "name": "loginBackground",
        "required": "AQ==",
        "settings_key": "loginBG",
        "settings_type": "fileUpload",
        "validation_required": "AQ==",
        "value": "upload:1155"
    },
    {
        "id": 8,
        "default_value": "/assets/bg.jpg",
        "description": "Faça upload do plano de fundo da plataforma com 1200 de largura aqui ",
        "name": "loginBackground1200",
        "required": "AQ==",
        "settings_key": "loginBG1200",
        "settings_type": "fileUpload",
        "validation_required": "AQ==",
        "value": "upload:1156"
    },
    {
        "id": 9,
        "default_value": "/assets/bg.jpg",
        "description": "Faça upload do plano de fundo da plataforma com 992 de largura aqui ",
        "name": "loginBackground992",
        "required": "AQ==",
        "settings_key": "loginBG992",
        "settings_type": "fileUpload",
        "validation_required": "AQ==",
        "value": "upload:1157"
    },
    {
        "id": 10,
        "default_value": "/assets/bg.jpg",
        "description": "Faça upload do plano de fundo da plataforma com 468 de largura aqui ",
        "name": "loginBackground468",
        "required": "AQ==",
        "settings_key": "loginBG468",
        "settings_type": "fileUpload",
        "validation_required": "AQ==",
        "value": "upload:1158"
    },
    {
        "id": 11,
        "default_value": null,
        "description": "Mude o titulo da plataforma",
        "name": "title",
        "required": "AQ==",
        "settings_key": "Streama title",
        "settings_type": "string",
        "validation_required": "AA==",
        "value": "Sabercon"
    },
    {
        "id": 12,
        "default_value": "false",
        "description": "Carrega automaticamente caso o video conter legenda",
        "name": "subtitle_auto_load",
        "required": "AA==",
        "settings_key": "Subtitle Auto Load",
        "settings_type": "boolean",
        "validation_required": "AA==",
        "value": "true"
    },
    {
        "id": 13,
        "default_value": "false",
        "description": "hidden_dash_sections",
        "name": "hidden_dash_sections",
        "required": "AA==",
        "settings_key": "hidden_dash_sections",
        "settings_type": "boolean",
        "validation_required": "AA==",
        "value": "false"
    },
    {
        "id": 14,
        "default_value": null,
        "description": "hide_help_faq",
        "name": "hide_help_faq",
        "required": "AA==",
        "settings_key": "hide_help_faq",
        "settings_type": "boolean",
        "validation_required": "AA==",
        "value": "false"
    },
    {
        "id": 15,
        "default_value": "false",
        "description": "showDownloadButton",
        "name": "showDownloadButton",
        "required": null,
        "settings_key": "showDownloadButton",
        "settings_type": "boolean",
        "validation_required": "AA==",
        "value": "false"
    }
]);
}
