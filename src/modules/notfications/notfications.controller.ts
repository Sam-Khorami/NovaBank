import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NotficationsService } from './notfications.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';

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

}
