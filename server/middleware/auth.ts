import { Context, Next } from "hono";
import { Session } from "hono-sessions";

export interface AuthSession extends Session {
  userId?: number;
}

declare module "hono" {
  interface ContextVariableMap {
    session: AuthSession;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const session = c.get("session") as AuthSession;

  if (!session?.get("userId")) {
    return c.redirect("/login");
  }

  await next();
}

export async function guestMiddleware(c: Context, next: Next) {
  const session = c.get("session") as AuthSession;

  if (session?.get("userId")) {
    return c.redirect("/");
  }

  await next();
}
