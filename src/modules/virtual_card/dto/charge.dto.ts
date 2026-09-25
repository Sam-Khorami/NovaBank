import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Length, Matches } from "class-validator";


export class ChargeDto {

    @ApiProperty({ example: "6037991234567890", description: "The 16 digits card number" })
    @IsString({ message: "The cardNumber must be a string" })
    @IsNotEmpty({ message: "The cardNumber can not be empty" })
    @Matches(/^603799\d{10}$/, { message: "The cardNumber field must start with 603799 and contain exactly 16 digits"})
    cardNumber: string;

    @ApiProperty({ example: "777", description: "Enter the cvv2 field" })
    @IsString({ message: "The cvv2 must be a string" })
    @IsNotEmpty({ message: "The cvv2 can not be empty" })
    @Matches(/^\d{3}$/, { message: "The cvv2 field must be at least 3 chars"})
    cvv2: string;

    @ApiProperty({ example: "10000", description: "Enter the amount field" })
    @IsNotEmpty({ message: "The amount field can not be empty" })
    @IsNumber({}, { message: "The amount field must be a number" })
    amount: number;

    @ApiProperty({ example: "persian petshop", description: "Enter the merchant field" })
    @IsNotEmpty({ message: "The merchant field can not be empty" })
    @IsString({ message: "The merchant field must be a string" })
    merchant: string;

}