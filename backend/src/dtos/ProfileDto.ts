export class CreateProfileDto {
  version?: string = "";
  avatarColor?: string = "";
  isChild?: string = "";
  isDeleted?: string = "";
  profileLanguage?: string = "";
  profileName?: string = "";
  userId?: string = "";
}

export class UpdateProfileDto {
  version?: string = "";
  avatarColor?: string = "";
  isChild?: string = "";
  isDeleted?: string = "";
  profileLanguage?: string = "";
  profileName?: string = "";
  userId?: string = "";
}

export class ProfileResponseDto {
  id: string = "";
  version: string = "";
  avatarColor: string = "";
  isChild: string = "";
  isDeleted: string = "";
  profileLanguage: string = "";
  profileName: string = "";
  userId: string = "";
}