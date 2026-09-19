import { Controller, UseGuards } from '@nestjs/common';
import { NotficationsService } from './notfications.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwtAuth.guard';

@ApiTags("Notfications Management")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notfications')
export class NotficationsController {

  constructor(private readonly notficationsService: NotficationsService) {}

}
