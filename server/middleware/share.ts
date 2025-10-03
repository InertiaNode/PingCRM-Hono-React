import { Context, Next } from "hono";
import { AuthSession } from "./auth";
import db from "../db";
import { DbUser } from "../types";

export async function shareMiddleware(c: Context, next: Next) {
  const session = c.get("session") as AuthSession;
  const userId = session?.get("userId");

  // Share default empty flash and errors
  const sharedData: Record<string, any> = {
    flash: {},
    errors: {},
  };

  if (userId) {
    const user = db
      .prepare("SELECT * FROM users WHERE id = ? AND deleted_at IS NULL")
      .get(userId) as DbUser | undefined;

    if (user) {
      sharedData.auth = {
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          owner: Boolean(user.owner),
          photo: user.photo || undefined,
          account: {
            id: 1,
            name: "Acme Corporation",
          },
        },
      };
    }
  }

  c.Inertia.share(sharedData);

  await next();
}
