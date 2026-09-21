import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Matches, Max, Min } from "class-validator";


export class TransferByCardNumberDto {

    @ApiProperty({ example: 100000 })
    @Max(15000000, { message: "The maximual amount can not be greater than 15000000 in a day" })
    @Min(1000, { message: "The minimual amount can not be less than 1000" })
    @IsNumber({}, { message: "The amount field must be a number" })
    @IsNotEmpty({ message: "The amount field can not be empty" })
    amount: number;

    @ApiProperty({ example: "6037991234567890", description: "The 16 digits card number" })
    @IsString({ message: "The card number must be a string" })
    @IsNotEmpty({ message: "The card number can not be empty" })
    @Matches(/^603799\d{10}$/, { message: 'Card number must start with 603799 and contain exactly 16 digits.'})
    receiverCardNumber: string;

}