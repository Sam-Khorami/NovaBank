import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";


export class GetNotficationsDto {

    @ApiPropertyOptional({ example: 1 })
    @Type(() => Number)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ example: 10 })
    @Type(() => Number)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    isRead: boolean;

}