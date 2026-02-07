export interface User {
    id?: string;
    email: string;
    password: string;
    name: string;
    icon: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface LoginHistory {
    userId: string;
    loginTime: Date;
    ipAddress: string | undefined;
    device: string;
}