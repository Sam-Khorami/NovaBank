import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";


export class LoanDto {

    @ApiProperty({ example: 100000000, description: "Enter the amount field" })
    @IsNumber({}, { message: "The amount field must be a number" })
    @IsNotEmpty({ message: "The amount field can not be empty" })
    @Min(50000000, { message: "The amount field can not be less than 50 milion toman" })
    @Max(500000000, { message: "The amount field can not be greater than 500 milion toman" })
    amount: number;

    @ApiProperty({ example: 12, description: "Enter the months field" })
    @IsInt({ message: "The months field must be an integer" })
    @IsNotEmpty({ message: "The months field can not be empty" })
    @Min(6, { message: "The months field can not be less than 6 months" })
    @Max(24, { message: "The months field can not be greater than 24 months" })
    months: number;

    @ApiPropertyOptional({ example: "This is a test", description: "Enter the reason field" })
    @IsOptional()
    @IsString({ message: "The reason field must be a string" })
    reason: string;

}