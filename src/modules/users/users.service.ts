import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KycStatusEnum } from 'src/common/types/entities.enum';
import { Documents } from 'src/entity/documents.entity';
import { User } from 'src/entity/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

    constructor (

        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Documents) private readonly documentsRepo: Repository<Documents>

    ) {}

    async uploadDocument (image: Express.Multer.File, request: Request) {

        const userId = request["user"].id;
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException("The user not found");
        if (user.kycStatus !== KycStatusEnum.NOT_SUBMITTED) throw new BadRequestException("Your request set already");

        const checkDocument = await this.documentsRepo.findOne({ where: { userId } });
        if (checkDocument) throw new ConflictException("Your request set already");

        const documentName = `/uploads/${image.filename}`;
        const newDocument = this.documentsRepo.create({ file: documentName, user: { id: userId }, userId });
        user.kycStatus = KycStatusEnum.UNDER_REVIEW;

        await this.documentsRepo.save(newDocument);
        await this.userRepo.save(user);
        return { message: "Your document uploaded and your request set" }

    }

}
