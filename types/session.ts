// types/session.ts
export type Session = {
    expiresAt: string;
    token: string;
    createdAt: string;
    updatedAt: string;
    ipAddress: string;
    userAgent: string;
    userId: string;
    id: string;
};

export type User = {
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    id: string;
};

export type SessionResponse = {
    session: Session;
    user: User;
};