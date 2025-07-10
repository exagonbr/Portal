export class CreateQuestionDto {
  version?: string = "";
  deleted?: string = "";
  fileId?: string = "";
  test?: string = "";
  tvShowId?: string = "";
  episodeId?: string = "";
}

export class UpdateQuestionDto {
  version?: string = "";
  deleted?: string = "";
  fileId?: string = "";
  test?: string = "";
  tvShowId?: string = "";
  episodeId?: string = "";
}

export class QuestionResponseDto {
  id: string = "";
  version: string = "";
  dateCreated: string = "";
  deleted: string = "";
  fileId: string = "";
  lastUpdated: string = "";
  test: string = "";
  tvShowId: string = "";
  episodeId: string = "";
}