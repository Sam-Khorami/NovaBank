import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { UserRoleEnum, UserVerificationEnum } from "src/common/types/entities.enum";


export class GetUsersDto {

    @ApiPropertyOptional({ example: 1, description: "Enter the page field" })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "The page field must be an integer" })
    @Min(1)
    page?: number = 1;
    
    @ApiPropertyOptional({ example: 10, description: "Enter the limit field" })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: "The limit field must be an integer" })
    @Min(1)
    limit?: number = 10;

    @ApiPropertyOptional({ enum: UserRoleEnum, enumName: "UserRoleEnum", example: UserRoleEnum.USER, description: "Enter the role field" })
    @IsEnum(UserRoleEnum)
    @IsOptional()
    role?: UserRoleEnum;

    @ApiPropertyOptional({ example: "09025244094", description: "Enter the phoneNumber field" })
    @IsString({ message: "The phoneNumber field must be a string" })
    @IsOptional()
    phoneNumber: string;

    @ApiPropertyOptional({ example: "1234567890" })
    @IsString({ message: "The nationalCode field must be a string" })
    @IsOptional()
    nationalCode?: string;

    @ApiPropertyOptional({ enum: UserVerificationEnum, enumName: "UserVerificationEnum", example: UserVerificationEnum.VERIFIED, description: "Enter the userVerification field" })
    @IsEnum(UserVerificationEnum)
    @IsOptional()
    userVerification?: UserVerificationEnum;

    @ApiPropertyOptional({ enum: UserVerificationEnum, enumName: "UserVerificationEnum", example: UserVerificationEnum.VERIFIED, description: "Enter the emailVerification field" })
    @IsEnum(UserVerificationEnum)
    @IsOptional()
    emailVerification?: UserVerificationEnum;

}