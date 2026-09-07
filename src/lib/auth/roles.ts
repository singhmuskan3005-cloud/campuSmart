import type { UserRole } from "@/types/user";

export const ROLES = {
  STUDENT: "STUDENT" as UserRole,
  ADMIN: "ADMIN" as UserRole,
};

export function isStudent(role?: UserRole | null): boolean {
  return role === "STUDENT";
}

export function isAdmin(role?: UserRole | null): boolean {
  return role === "ADMIN";
}
