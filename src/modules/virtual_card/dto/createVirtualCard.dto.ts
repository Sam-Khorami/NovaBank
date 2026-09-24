import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { VirtualCardType } from "src/common/types/entities.enum";


export class CreateVirtualCardDto {

    @ApiPropertyOptional({ example: "test", description: "Enter the lable field" })
    @IsString({ message: "The lable field can not be empty" })
    @IsOptional()
    lable: string;

    @ApiProperty({ example: 500000, description: "Enter the spending limit field" })
    @IsNotEmpty({ message: "The spending limit field can not be empty" })
    @IsNumber({}, { message: "The spending limit field must be a number" })
    @Min(1000, { message: "The spending limit can not be less than 1000 toman" })
    spendingLimit: number;

    @ApiProperty({ example: 12, description: "Enter the expiryMonth field" })
    @IsNotEmpty({ message: "The expiry month field can not be empty" })
    @IsInt({ message: "The expiry month field must be a number" })
    @Min(1, { message: "The expiry month can not be less than 1 month" })
    @Max(24, { message: "The expiry month can not be greater than 24 month" })
    expiryMonth: number;

}