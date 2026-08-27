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