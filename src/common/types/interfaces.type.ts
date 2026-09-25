import { UserRoleEnum } from "./entities.enum";

export interface Payload {
    id: string,
    role: UserRoleEnum
}

export interface TransferNotficationData {
    userId: string,
    title: string,
    message: string,
    email: string
}

export interface NotficationData {
    userId: string,
    title: string,
    message: string,
    email: string
}