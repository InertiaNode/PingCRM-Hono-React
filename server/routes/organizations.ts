import { Hono } from "hono";
import db from "../db";
import { DbOrganization, DbContact, FilterOptions } from "../types";
import {
  paginate,
  buildWhereClause,
  buildSearchConditions,
  formatOrganizationForResponse,
  formatContactForResponse,
} from "../utils";

const organizations = new Hono();

// List organizations
organizations.get("/", async (c) => {
  const url = new URL(c.req.url);
  const search = url.searchParams.get("search") || "";
  const trashed = (url.searchParams.get("trashed") ||
    "") as FilterOptions["trashed"];
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = 10;

  const { where, params: whereParams } = buildWhereClause({ trashed });
  const { condition: searchCondition, params: searchParams } =
    buildSearchConditions(search, ["name", "city", "phone"]);

  let query = "SELECT * FROM organizations";
  const countQuery = "SELECT COUNT(*) as total FROM organizations";
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

  query += " ORDER BY name LIMIT ? OFFSET ?";
  allParams.push(perPage, (page - 1) * perPage);

  const data = db.prepare(query).all(...allParams) as DbOrganization[];

  const formattedData = data.map((org) => formatOrganizationForResponse(org));
  const paginatedData = paginate(
    formattedData,
    total,
    page,
    perPage,
    "/organizations",
  );

  return await c.Inertia("Organizations/Index", {
    organizations: paginatedData,
    filters: { search, trashed },
  });
});

// Create organization form
organizations.get("/create", async (c) => {
  return await c.Inertia("Organizations/Create");
});

// Store organization
organizations.post("/", async (c) => {
  const body = await c.req.parseBody();

  const errors: Record<string, string> = {};
  if (!body.name) errors.name = "Name is required";

  if (Object.keys(errors).length > 0) {
    return await c.Inertia("Organizations/Create", {
      errors,
    });
  }

  const result = db
    .prepare(
      `
    INSERT INTO organizations (name, email, phone, address, city, region, country, postal_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    )
    .run(
      body.name,
      body.email || null,
      body.phone || null,
      body.address || null,
      body.city || null,
      body.region || null,
      body.country || null,
      body.postal_code || null,
    );

  return await c.Inertia.location(
    `/organizations/${result.lastInsertRowid}/edit`,
  );
});

// Edit organization form
organizations.get("/:id/edit", async (c) => {
  const id = c.req.param("id");

  const organization = db
    .prepare("SELECT * FROM organizations WHERE id = ?")
    .get(id) as DbOrganization | undefined;

  if (!organization) {
    return c.notFound();
  }

  const contacts = db
    .prepare(
      "SELECT * FROM contacts WHERE organization_id = ? AND deleted_at IS NULL ORDER BY last_name, first_name",
    )
    .all(id) as DbContact[];

  const formattedOrg = formatOrganizationForResponse(organization);
  const formattedContacts = contacts.map((contact) =>
    formatContactForResponse(contact),
  );

  return await c.Inertia("Organizations/Edit", {
    organization: { ...formattedOrg, contacts: formattedContacts },
  });
});

// Update organization
organizations.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.parseBody();

  const organization = db
    .prepare("SELECT * FROM organizations WHERE id = ?")
    .get(id) as DbOrganization | undefined;

  if (!organization) {
    return c.notFound();
  }

  const errors: Record<string, string> = {};
  if (!body.name) errors.name = "Name is required";

  if (Object.keys(errors).length > 0) {
    const contacts = db
      .prepare(
        "SELECT * FROM contacts WHERE organization_id = ? AND deleted_at IS NULL",
      )
      .all(id) as DbContact[];

    return await c.Inertia("Organizations/Edit", {
      organization: { ...organization, contacts },
      errors,
    });
  }

  db.prepare(
    `
    UPDATE organizations
    SET name = ?, email = ?, phone = ?, address = ?, city = ?, region = ?, country = ?, postal_code = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  ).run(
    body.name,
    body.email || null,
    body.phone || null,
    body.address || null,
    body.city || null,
    body.region || null,
    body.country || null,
    body.postal_code || null,
    id,
  );

  return await c.Inertia.location(`/organizations/${id}/edit`).toResponse(
    c.req.raw,
  );
});

// Delete organization (soft delete)
organizations.delete("/:id", async (c) => {
  const id = c.req.param("id");

  db.prepare(
    `
    UPDATE organizations
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  ).run(id);

  return await c.Inertia.location("/organizations");
});

// Restore organization
organizations.put("/:id/restore", async (c) => {
  const id = c.req.param("id");

  db.prepare(
    `
    UPDATE organizations
    SET deleted_at = NULL
    WHERE id = ?
  `,
  ).run(id);

  return await c.Inertia.location(`/organizations/${id}/edit`).toResponse(
    c.req.raw,
  );
});

export default organizations;
