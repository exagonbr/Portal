export class CreateSettingsDto {
  version?: string;
  defaultValue?: string;
  description?: string;
  name?: string;
  required?: string;
  settingsKey?: string;
  settingsType?: string;
  validationRequired?: string;
  value?: string;
}

export class UpdateSettingsDto {
  version?: string;
  defaultValue?: string;
  description?: string;
  name?: string;
  required?: string;
  settingsKey?: string;
  settingsType?: string;
  validationRequired?: string;
  value?: string;
}

export class SettingsResponseDto {
  id: string = "";
  version: string = "";
  defaultValue: string = "";
  description: string = "";
  name: string = "";
  required: string = "";
  settingsKey: string = "";
  settingsType: string = "";
  validationRequired: string = "";
  value: string = "";
}