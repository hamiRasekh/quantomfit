export interface ActivityStage {
  id: string;
  activityId: string;
  parentId?: string | null;
  name: string;
  description?: string;
  sequence: number;
  durationMinutes?: number;
  isOptional: boolean;
  children?: ActivityStage[];
}

export interface CreateActivityStageDto {
  activityId: string;
  name: string;
  parentId?: string;
  description?: string;
  sequence?: number;
  durationMinutes?: number;
  isOptional?: boolean;
}

export interface UpdateActivityStageDto extends Partial<CreateActivityStageDto> {}


