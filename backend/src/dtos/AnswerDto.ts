export class CreateAnswerDto {
  version?: string;
  deleted?: string;
  isCorrect?: string;
  questionId?: string;
  reply?: string;
}

export class UpdateAnswerDto {
  version?: string;
  deleted?: string;
  isCorrect?: string;
  questionId?: string;
  reply?: string;
}

export class AnswerResponseDto {
  id: string = "";
  version: string = "";
  dateCreated: string = "";
  deleted: string = "";
  isCorrect: string = "";
  lastUpdated: string = "";
  questionId: string = "";
  reply: string = "";
}