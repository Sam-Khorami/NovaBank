import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator";
import { InstallmentStatusEnum } from "src/common/types/entities.enum";


export class GetInstallmentsQueryDto {

    @ApiPropertyOptional({ example: 1, description: "Enter the page field" })
    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, description: "Enter the limit field" })
    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;

    @ApiProperty({ enum: InstallmentStatusEnum, enumName: "InstallmentStatusEnum", description: "Enter the status field" })
    @IsEnum(InstallmentStatusEnum)
    @IsNotEmpty({ message: "The status field can not be empty" })
    status: InstallmentStatusEnum;


}