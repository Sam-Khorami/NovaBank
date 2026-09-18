import { SetMetadata } from "@nestjs/common";

export const KYC_KEY = "kyc_key"

export const KycOnly = () => SetMetadata(KYC_KEY, true);