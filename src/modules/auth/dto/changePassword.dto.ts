import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";


export class ChangePasswordDto {

    @ApiProperty({ example: "SamKhorami84@", description: "Enter the pastPassword field" })
    @IsNotEmpty({ message: "The pastPassword field can not be empty" })
    @IsString({ message: "The pastPassword field must be a string" })
    pastPassword: string;

    @ApiProperty({ example: "SamKhorami84@", description: "Enter the newPassword field" })
    @IsNotEmpty({ message: "The newPassword field can not be empty" })
    @IsString({ message: "The newPassword field must be a string" })
    @IsStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 }, { message: "The password field mush contain 8 chars & at least one small and capital case & symbol" })
    newPassword: string;

}