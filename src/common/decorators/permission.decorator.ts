import { SetMetadata } from "@nestjs/common";

export const PERMISSION_KEY = "permission_key"

export const Permissions = (...permissions: string[]) => SetMetadata (PERMISSION_KEY, permissions);