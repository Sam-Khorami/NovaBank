import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Matches, Max, Min } from "class-validator";


export class TransferByShabaNumberDto {

    @ApiProperty({ example: 15000000 })
    @Max(100000000, { message: "The maximual amount can not be greater than 100000000 in a day" })
    @Min(15000000, { message: "The minimual amount can not be less than 15000000" })
    @IsNumber({}, { message: "The amount field must be a number" })
    @IsNotEmpty({ message: "The amount field can not be empty" })
    amount: number;

    @ApiProperty({ example: "IR060170000000262944265664", description: "The 26 characters Sheba number (IR + 24 digits)"})
    @IsString({ message: "The Sheba number must be a string" })
    @IsNotEmpty({ message: "The Sheba number can not be empty" })
    @Matches(/^IR\d{24}$/, { message: "Sheba number must start with 'IR' and be followed by exactly 24 digits (total 26 characters)"})
    receiverShabaNumber: string;

}