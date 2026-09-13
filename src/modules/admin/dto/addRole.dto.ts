import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { UserRoleEnum } from "src/common/types/entities.enum";


export class AddRoleDto {

    @ApiProperty({ example: "role:test", description: "Enter the role field" })
    @IsNotEmpty({ message: "The role field can not be empty" })
    @IsString({ message: "The role Field must be a string" })
    role: string;

}