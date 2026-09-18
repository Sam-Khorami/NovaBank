import { BadRequestException, Controller, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { existsSync, mkdirSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from "multer";
import { extname } from "path";

@ApiTags("Users Managment")
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  
  constructor(private readonly usersService: UsersService) {

    if (!existsSync("./uploads")) {

      mkdirSync("./uploads", { recursive: true })

    }

  }


  @ApiOperation({ summary: "Upload Document For Review", description: "With this api user can upload its document and await for answer from admin" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({

    schema: {

      type: "object",
      properties: {

        image: {

          type: "string",
          format: "binary"

        }

      }

    }

  })
  @UseInterceptors(

    FileInterceptor(

      "image", {

        storage: diskStorage({ destination: "./uploads", filename(req, file, cb) {

          const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1000)}${extname(file.originalname)}`;
          cb(null, uniqueFileName);

        } }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {

          const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
          if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
          else cb(new BadRequestException("Bad File Format"), false);

        }

      }

    )

  )
  @Post("upload-document")
  async uploadDocument (@UploadedFile() image: Express.Multer.File, @Req() request: Request) {

    if (!image) throw new BadRequestException("Image didn't uploaded successfully!");
    return await this.usersService.uploadDocument(image, request);

  }

}
