import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";


export class LoginDto {

    @ApiProperty({ example: "09025244094", description: "Enter the phoneNumber field" })
    @IsNotEmpty({ message: "The phoneNumber field can not be empty" })
    @IsString({ message: "The phoneNumber field must be a string" })
    @Matches(/^09\d{9}$/, { message: "You phone number structure must be like this: 09025244094"})
    phoneNumber: string;

    @ApiProperty({ example: "SamKhorami84@", description: "Enter the password field" })
    @IsNotEmpty({ message: "The password field can not be empty" })
    @IsString({ message: "The password field must be a string" })
    password: string;

}