import { Controller, Get, Param, ParseUUIDPipe, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { NotficationsService } from './notfications.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';
import { GetNotficationsDto } from './dto/getNotfication.dto';

@ApiTags("Notfications Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notfications')
export class NotficationsController {

  constructor(private readonly notficationsService: NotficationsService) {}

  @ApiOperation({ summary: "Get Unread Notfications", description: "With this api user could see all unread notfications" })
  @Get("unreads")
  async getUnreadNotfications (@Req() request: Request) {

    return await this.notficationsService.getUnreadNotfications(request);

  }

  @ApiOperation({ summary: "Get All Notfications", description: "With this api user can get all its notfications" })
  @Get("all")
  async getAllNotfications (@Req() request: Request, @Query() query: GetNotficationsDto) {

    return await this.notficationsService.getAllNotfications(request, query);

  }

  @ApiOperation({ summary: "Read All Notfication", description: "With this api user can read all notfications" })
  @Patch("read/all")
  async readAllNotfication (@Req() request: Request) {

    return await this.notficationsService.readAllNotfication(request);

  }

  @ApiOperation({ summary: "Read A Notfication", description: "With this api user can read a notfication" })
  @Patch("read/:notficationId")
  async readNotfication (@Req() request: Request, @Param("notficationId", ParseUUIDPipe) notficationId: string) {

    return await this.notficationsService.readNotfication(request, notficationId);

  }

}
