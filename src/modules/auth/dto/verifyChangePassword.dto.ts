import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsStrongPassword, Matches } from "class-validator";


export class VerifyChangePasswordDto {

    @ApiProperty({ example: "09025244094", description: "Enter the phoneNumber field" })
    @IsNotEmpty({ message: "The phoneNumber field can not be empty" })
    @IsString({ message: "The phoneNumber field must be a string" })
    @Matches(/^09\d{9}$/, { message: "You phone number structure must be like this: 09025244094"})
    phoneNumber: string;

    @ApiProperty({ example: "123456", description: "Enter the otp field" })
    @IsNotEmpty({ message: "The otp field can not be empty" })
    @IsString({ message: "The otp field must be a string" })
    otp: string;

    @ApiProperty({ example: "SamKhorami84@", description: "Enter the newPassword field" })
    @IsNotEmpty({ message: "The newPassword field can not be empty" })
    @IsString({ message: "The newPassword field must be a string" })
    @IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, { message: "The password field mush contain 8 chars & at least one small and capital case & symbol" })
    newPassword: string;

}