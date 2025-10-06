import { Hono } from "hono";
import { hash } from "bcrypt";
import db from "../db";
import { DbUser, FilterOptions } from "../types";
import {
  paginate,
  buildWhereClause,
  buildSearchConditions,
  formatUserForResponse,
} from "../utils";

const users = new Hono();

// List users
users.get("/", async (c) => {
  const url = new URL(c.req.url);
  const search = url.searchParams.get("search") || "";
  const trashed = (url.searchParams.get("trashed") ||
    "") as FilterOptions["trashed"];
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = 10;

  const { where, params: whereParams } = buildWhereClause({ trashed });
  const { condition: searchCondition, params: searchParams } =
    buildSearchConditions(search, ["first_name", "last_name", "email"]);

  let query = "SELECT * FROM users";
  const countQuery = "SELECT COUNT(*) as total FROM users";
  const allParams: unknown[] = [];

  if (where || searchCondition) {
    const conditions = [where, searchCondition].filter(Boolean).join(" AND ");
    query += ` WHERE ${conditions}`;
    allParams.push(...whereParams, ...searchParams);
  }

  const { total } = db
    .prepare(
      searchCondition ? countQuery + ` WHERE ${searchCondition}` : countQuery,
    )
    .get(searchParams) as { total: number };

  query += " ORDER BY last_name, first_name LIMIT ? OFFSET ?";
  allParams.push(perPage, (page - 1) * perPage);

  const data = db.prepare(query).all(...allParams) as DbUser[];

  const formattedData = data.map((user) => formatUserForResponse(user));
  const paginatedData = paginate(formattedData, total, page, perPage, "/users");

  return await c.Inertia("Users/Index", {
    users: paginatedData,
    filters: { search, trashed },
  });
});

// Create user form
users.get("/create", async (c) => {
  return await c.Inertia("Users/Create");
});

// Store user
users.post("/", async (c) => {
  const body = await c.req.parseBody();

  const errors: Record<string, string> = {};
  if (!body.first_name) errors.first_name = "First name is required";
  if (!body.last_name) errors.last_name = "Last name is required";
  if (!body.email) errors.email = "Email is required";
  if (!body.password) errors.password = "Password is required";

  // Check if email already exists
  if (body.email) {
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(body.email) as DbUser | undefined;
    if (existingUser) {
      errors.email = "Email is already taken";
    }
  }

  if (Object.keys(errors).length > 0) {
    return await c.Inertia("Users/Create", {
      errors,
    });
  }

  const hashedPassword = await hash(body.password as string, 10);

  const result = db
    .prepare(
      `
    INSERT INTO users (first_name, last_name, email, password, owner, photo)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    )
    .run(
      body.first_name,
      body.last_name,
      body.email,
      hashedPassword,
      body.owner === "1" ? 1 : 0,
      body.photo || null,
    );

  return await c.Inertia.location(`/users/${result.lastInsertRowid}/edit`);
});

// Edit user form
users.get("/:id/edit", async (c) => {
  const id = c.req.param("id");

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | DbUser
    | undefined;

  if (!user) {
    return c.notFound();
  }

  return await c.Inertia("Users/Edit", {
    user: formatUserForResponse(user),
  });
});

// Update user
users.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.parseBody();

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | DbUser
    | undefined;

  if (!user) {
    return c.notFound();
  }

  const errors: Record<string, string> = {};
  if (!body.first_name) errors.first_name = "First name is required";
  if (!body.last_name) errors.last_name = "Last name is required";
  if (!body.email) errors.email = "Email is required";

  // Check if email already exists for other users
  if (body.email) {
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ? AND id != ?")
      .get(body.email, id) as DbUser | undefined;
    if (existingUser) {
      errors.email = "Email is already taken";
    }
  }

  if (Object.keys(errors).length > 0) {
    return await c.Inertia("Users/Edit", {
      user,
      errors,
    });
  }

  // Update password only if provided
  if (body.password) {
    const hashedPassword = await hash(body.password as string, 10);
    db.prepare(
      `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, password = ?, owner = ?, photo = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(
      body.first_name,
      body.last_name,
      body.email,
      hashedPassword,
      body.owner === "1" ? 1 : 0,
      body.photo || null,
      id,
    );
  } else {
    db.prepare(
      `
      UPDATE users
      SET first_name = ?, last_name = ?, email = ?, owner = ?, photo = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    ).run(
      body.first_name,
      body.last_name,
      body.email,
      body.owner === "1" ? 1 : 0,
      body.photo || null,
      id,
    );
  }

  return await c.Inertia.location(`/users/${id}/edit`);
});

// Handle POST for PUT (for multipart/form-data)
users.post("/:id", async (c) => {
  const body = await c.req.parseBody();

  if (body._method === "put") {
    // Re-route to PUT handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return users.put("/:id", c as any);
  }

  return c.notFound();
});

// Delete user (soft delete)
users.delete("/:id", async (c) => {
  const id = c.req.param("id");

  db.prepare(
    `
    UPDATE users
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  ).run(id);

  return await c.Inertia.location("/users");
});

// Restore user
users.put("/:id/restore", async (c) => {
  const id = c.req.param("id");

  db.prepare(
    `
    UPDATE users
    SET deleted_at = NULL
    WHERE id = ?
  `,
  ).run(id);

  return await c.Inertia.location(`/users/${id}/edit`);
});

export default users;
