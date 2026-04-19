import { LeaveRequestStatus } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class ReviewLeaveRequestDto {
  @IsString()
  reviewedById!: string;

  @IsEnum(LeaveRequestStatus)
  status!: LeaveRequestStatus;
}
