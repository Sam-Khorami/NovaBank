import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumberString, IsString, IsStrongPassword, Matches } from "class-validator";


export class SignUpDto {

    @ApiProperty({ example: "09025244094", description: "Enter the phoneNumber field" })
    @IsNotEmpty({ message: "The phoneNumber field can not be empty" })
    @IsString({ message: "The phoneNumber field must be a string" })
    @Matches(/^09\d{9}$/, { message: "You phone number structure must be like this: 09025244094"})
    phoneNumber: string;

    @ApiProperty({ example: "4061539558", description: "Enter the nationalCode field" })
    @IsNotEmpty({ message: "The nationalCode field can not be empty" })
    @IsNumberString()
    @Matches(/^\d{10}$/, { message: "Your national code must be 10 chars" })
    nationalCode: string;

    @ApiProperty({ example: "samkhorrami84@gmail.com", description: "Enter the email field" })
    @IsNotEmpty({ message: "The email field can not be empty" })
    @IsEmail()
    email: string;

    @ApiProperty({ example: "SamKhorami84@", description: "Enter the password field" })
    @IsNotEmpty({ message: "The password field can not be empty" })
    @IsString({ message: "The password field must be a string" })
    @IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, { message: "The password field mush contain 8 chars & at least one small and capital case & symbol" })
    password: string;

}