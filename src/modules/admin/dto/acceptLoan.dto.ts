import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";


export class AcceptLoanDto {

    @ApiProperty({ example: 20, description: "Enter the interestRate field" })
    @IsNumber({}, { message: "The interestRate field must be an integer" })
    @IsNotEmpty({ message: "The interestRate field can not be empty" })
    interestRate: number;

}