import { Controller } from '@nestjs/common';
import { NotficationsService } from './notfications.service';

@Controller('notfications')
export class NotficationsController {
  constructor(private readonly notficationsService: NotficationsService) {}
}
