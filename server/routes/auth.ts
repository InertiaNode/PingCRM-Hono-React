import { Hono } from "hono";
import { compare } from "bcrypt";
import db from "../db";
import { DbUser } from "../types";
import { AuthSession } from "../middleware/auth";

const auth = new Hono();

// Login page
auth.get("/login", async (c) => {
  return await c.Inertia("Auth/Login");
});

// Login handler
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const email = body.email as string;
  const password = body.password as string;

  if (!email || !password) {
    return await c.Inertia("Auth/Login", {
      errors: {
        email: !email ? "Email is required" : undefined,
        password: !password ? "Password is required" : undefined,
      },
    });
  }

  const user = db
    .prepare("SELECT * FROM users WHERE email = ? AND deleted_at IS NULL")
    .get(email) as DbUser | undefined;

  if (!user) {
    return await c.Inertia("Auth/Login", {
      errors: {
        email: "These credentials do not match our records.",
      },
    });
  }

  const passwordMatches = await compare(password, user.password);

  if (!passwordMatches) {
    return await c.Inertia("Auth/Login", {
      errors: {
        email: "These credentials do not match our records.",
      },
    });
  }

  const session = c.get("session") as AuthSession;
  session.set("userId", user.id);

  return c.Inertia.location("/");
});

// Logout handler
auth.post("/logout", async (c) => {
  const session = c.get("session") as AuthSession;
  session.forget("userId");

  return c.redirect("/login");
});

export default auth;
