import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";


export class GetUsersDto {

    @ApiPropertyOptional({ example: 1, description: "Enter the page field" })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "The page field must be an integer" })
    @Min(1)
    page?: number = 1;
    
    @ApiPropertyOptional({ example: 10, description: "Enter the limit field" })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "The limit field must be an integer" })
    @Min(1)
    limit?: number = 10

}