import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches } from "class-validator";


export class OtpVerificationDto {

    @ApiProperty({ example: "09025244094", description: "Enter the phoneNumber field" })
    @IsNotEmpty({ message: "The phoneNumber field can not be empty" })
    @IsString({ message: "The phoneNumber field must be a string" })
    @Matches(/^09\d{9}$/, { message: "You phone number structure must be like this: 09025244094"})
    phoneNumber: string;

    @ApiProperty({ example: "123456", description: "Enter the otp field" })
    @IsNotEmpty({ message: "The otp field can not be empty" })
    @IsString({ message: "The otp field must be a string" })
    otp: string;

}