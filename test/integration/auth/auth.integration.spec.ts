import { TestingModule, Test } from "@nestjs/testing";
import { jest, describe, it, expect, beforeEach, beforeAll, afterAll } from "@jest/globals";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entity/users.entity";
import { Role } from "src/entity/role.entity";
import { Wallet } from "src/entity/wallet.entity";
import { Permission } from "src/entity/permission.entity";
import { AuthService } from "src/modules/auth/auth.service";
import { VitalRecordsService } from "src/modules/vital-records/vital-records.service";
import { RedisService } from "src/modules/redis/redis.service";
import { MailService } from "src/modules/mail/mail.service";
import { Repository } from "typeorm";
import { CacheModule } from "@nestjs/cache-manager";
import { BullModule } from "@nestjs/bull";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { NotficationsService } from "src/modules/notfications/notfications.service";
import { WalletTransaction } from "src/entity/walletTransaction.entity";
import { VirtualCard } from "src/entity/virtualCard.entity";
import { Loan } from "src/entity/loan.entity";
import { LoanInstallments } from "src/entity/loanInstallments.entity";
import { Idempotency } from "src/entity/idempotency.entity";
import { Transfers } from "src/entity/transfers.entity";
import { VirtualCardTransaction } from "src/entity/virtualCardTransaction.entity";
import { Notfications } from "src/entity/notfication.entity";
import { Ip } from "src/entity/ip.entity";
import { Documents } from "src/entity/documents.entity";
import { UserRoleEnum } from "src/common/types/entities.enum";
import { ConflictException, NotFoundException } from "@nestjs/common";

const mockNotficationsService = {
    addTransferNotficationJob: jest.fn<any>(),
    notficationForUser: jest.fn<any>(),
};

const mockRedisService = {
    setOtp: jest.fn<any>(),
    getOtp: jest.fn<any>(),
    deleteOtp: jest.fn<any>(),
};

const mockMailService = {
    sendOtp: jest.fn<any>(),
    sendMailToUser: jest.fn<any>(),
};

const mockVitalRecordsService = {
    isMatch: jest.fn<any>(),
};


describe ("Auth Service", () => {

    let module: TestingModule;
    let authService: AuthService;
    
    let userRepository: Repository<User>;
    let walletRepository: Repository<Wallet>;
    let roleRepository: Repository<Role>;


    beforeAll(async () => {

        module = await Test.createTestingModule({

            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: process.env.DB_HOST,
                    port: Number(process.env.DB_PORT),
                    username: process.env.DB_USER,
                    password: process.env.DB_PASS,
                    database: process.env.DB_NAME,
                    autoLoadEntities: true,
                    synchronize: true,
                }),

                TypeOrmModule.forFeature([ User, Role, Wallet, Permission, WalletTransaction, VirtualCard, Loan, LoanInstallments, Idempotency, Transfers, VirtualCardTransaction, Documents, Notfications, Ip ]),
                CacheModule.register({ isGlobal: true }),
                BullModule.forRootAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (configService: ConfigService) => ({

                        redis: {
                        host: configService.get("REDIS_HOST"),
                        port: configService.get<number>("REDIS_PORT"),
                        }

                    })
                }),
                JwtModule.register({
                    secret: "test-secret",
                    signOptions: { expiresIn: "1h" },
                }),
                
            ],

            providers: [
                AuthService,
                { provide: VitalRecordsService, useValue: mockVitalRecordsService },
                { provide: RedisService, useValue: mockRedisService },
                { provide: MailService, useValue: mockMailService },
                { provide: NotficationsService, useValue: mockNotficationsService }
            ]

    
        }).compile();

        authService = module.get<AuthService>(AuthService);
        
        userRepository = module.get(getRepositoryToken(User));
        walletRepository = module.get(getRepositoryToken(Wallet));
        roleRepository = module.get(getRepositoryToken(Role));

    })

    beforeEach(async () => {

        jest.clearAllMocks();

    });


    afterAll(async () => {

        if (module) await module.close();

    });


    describe("Sign Up", () => {

        const signUpDto = {
            phoneNumber: "09166234681",
            email: "samkhorrami84@gmail.com",
            nationalCode: "4061539558",
            password: "4061539558Sam@"
        }

        it ("Should create a new user", async () => {
        
            const result = await authService.signUp(signUpDto);
            expect(result).toEqual({ message: "The otp Code is sent to you" });

            const user = await userRepository.findOne({ where: { phoneNumber: signUpDto.phoneNumber }, relations: { roles: true } });
            
            expect(user).toBeDefined();
            expect(user.phoneNumber).toBe(signUpDto.phoneNumber);
            expect(user.email).toBe(signUpDto.email);

            expect(user.roles).toEqual(

                expect.arrayContaining([

                    expect.objectContaining({ name: UserRoleEnum.USER })

                ])

            );

            const wallet = await walletRepository.findOne({ where: { userId: user.id } });
            
            expect(wallet).toBeDefined();
            expect(wallet.balance).toBe("0.00000000");
            expect(wallet.accountNumber).toBeNull();
            expect(wallet.cardNumber).toBeNull();
            expect(wallet.shabaNumber).toBeNull();

        })

        it ("Should return Conflict Exception or user already exists", () => {

            expect(async () => { await authService.signUp(signUpDto) }).rejects.toThrow(ConflictException);

        })

    })


    describe("Login", () => {

        const rightLoginDto = {
            phoneNumber: "09025244094",
            password: "4061539558Sam@"
        }

        const falseLoginDto = {
            phoneNumber: "09168761510",
            password: "4061539558Sam@"
        }

        const verifyLoginDto = {
            phoneNumber: "09166234681",
            password: "4061539558Sam@"
        }

        const wrongPasswordLoginDto = {
            phoneNumber: "09025244094",
            password: "4061539558Sami@"
        }
        
        it("Should login the user", async () => {

            const result = await authService.login(rightLoginDto);
            expect(result).toEqual({ message: "The otp code sent to your email" });

        })

        it("Should return user not found", async () => {

            await expect(authService.login(falseLoginDto)).rejects.toThrow("The user with this information not found!");

        })

        it("Should return verify your email", async () => {

            await expect(authService.login(verifyLoginDto)).rejects.toThrow("Please verify your email first");

        })

        it("Should password not match", async () => {

            await expect(authService.login(wrongPasswordLoginDto)).rejects.toThrow("The user with this information not found!");

        })

    })

});