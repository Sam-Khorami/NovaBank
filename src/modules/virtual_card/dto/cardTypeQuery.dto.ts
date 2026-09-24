import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { VirtualCardType } from "src/common/types/entities.enum";


export class CardTypeQueryDto {

    @ApiProperty({ enum: VirtualCardType, enumName: "VirtualCardType", example: VirtualCardType.STANDARD, description: "Enter the cardType field" })
    @IsNotEmpty({ message: "The card type field can not be empty" })
    @IsEnum(VirtualCardType)
    cardType: VirtualCardType;

}