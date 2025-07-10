export class CreateReportDto {
  version?: string = "";
  createdById?: string = "";
  errorCode?: string = "";
  resolved?: string = "";
  videoId?: string = "";
}

export class UpdateReportDto {
  version?: string = "";
  createdById?: string = "";
  errorCode?: string = "";
  resolved?: string = "";
  videoId?: string = "";
}

export class ReportResponseDto {
  id: string = "";
  version: string = "";
  createdById: string = "";
  dateCreated: string = "";
  errorCode: string = "";
  lastUpdated: string = "";
  resolved: string = "";
  videoId: string = "";
}