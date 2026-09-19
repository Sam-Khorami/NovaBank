export enum UserRoleEnum {
    USER = "user",
    ADMIN = "admin",
    SUPERADMIN = "superAdmin"
}

export enum WalletStatusEnum {
    Active = "active",
    Closed = "closed",
    Blocked = "blocked"
}

export enum TransactionStatusEnum { 
    PENDING = "pending", 
    SUCCESS = "success", 
    FAILED = "failed", 
    CANCELED = "canceled" 
}

export enum TransactionTypeEnum { 
    DEPOSIT = "deposit", 
    WITHDRAW = "withdraw", 
    PURCHASE = "purchase", 
    REFUND = "refund", 
    ADMINDEPOSIT = "adminDeposit", 
    ADMINWITHDRAW = "adminWithdraw" 
}

export enum UserVerificationEnum {
    VERIFIED = "verified",
    UNVERIFIED = "unverified"
}

export enum KycStatusEnum {
    NOT_SUBMITTED = "not_submitted",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected"
}

export enum DocumentStatusEnum {
    APPROVED = "approved",
    REJECTED = "rejected",
    PENDING = "pending"
}

export enum CountryCodeEnum {
    IR = "IR"
}

export enum AccountCodeTypeEnum {
    ZERO = "0",
    ONE = "1",
    TWO = "2",
    THREE = "3",
    FOUR = "4"
}

export enum AccountTypeEnum {
    ZERO_DEPOSIT_ACCOUNT = "deposit_account",
    ONE_FACILITY_ACCOUNT = "facility_account",
    TWO_INVESTMENT_DEPOSIT_ACCOUNT = "investment_deposit_account",
    THREE_SAVINGS_ACCOUNT = "savings_account",
    FOUR_CHECKING_ACCOUNT = "checking account"
}