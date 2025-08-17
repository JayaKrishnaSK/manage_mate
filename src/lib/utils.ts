import { IUser } from "@/models/user.model";
import { clsx, type ClassValue } from "clsx";
import { Session } from "next-auth";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSessionUser(session: Session | null): IUser | null {
  if (!session || !session.user) return null;
  return session.user as IUser;
}
