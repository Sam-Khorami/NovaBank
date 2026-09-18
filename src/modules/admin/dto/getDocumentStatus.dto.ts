import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsOptional } from "class-validator";
import { DocumentStatusEnum } from "src/common/types/entities.enum";


export class GetDocumentStatusDto {

    @ApiPropertyOptional({ example: 1 })
    @Type(() => Number)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ example: 10 })
    @Type(() => Number)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ enum: DocumentStatusEnum, enumName: "DocumentStatusEnum", example: DocumentStatusEnum.APPROVED, description: "Select Document Status" })
    @IsEnum(DocumentStatusEnum)
    @IsOptional()
    status?: DocumentStatusEnum;

}