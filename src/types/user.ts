export type UserRole = "STUDENT" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface UserProfile {
  major?: string;
  hostel?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  year?: string;
}

export interface User {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  campus?: string;
  status: UserStatus;
  profile?: UserProfile;
  createdAt: string;
}
