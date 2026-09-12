import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { UserRoleEnum } from "src/common/types/entities.enum";


export class AddPermissionDto {

    @ApiProperty({ example: "permission:test", description: "Enter the permission field" })
    @IsNotEmpty({ message: "The permission field can not be empty" })
    @IsString({ message: "The permission Field must be a string" })
    permission: string;

}