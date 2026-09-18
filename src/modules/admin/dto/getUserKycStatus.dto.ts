import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { KycStatusEnum } from "src/common/types/entities.enum";


export class GetUserKycStatusDto {

    @ApiPropertyOptional({ example: 1 })
    @Type(() => Number)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ example: 10 })
    @Type(() => Number)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ enum: KycStatusEnum, enumName: "KycStatusEnum", example: KycStatusEnum.APPROVED, description: "Select Kyc Status" })
    @IsEnum(KycStatusEnum)
    @IsOptional()
    status?: KycStatusEnum;

}