import { Hono } from "hono";
import db from "../db";
import { DbContact, DbOrganization, FilterOptions } from "../types";
import {
  paginate,
  buildWhereClause,
  buildSearchConditions,
  formatContactForResponse,
  formatOrganizationForResponse,
} from "../utils";

const contacts = new Hono();

// List contacts
contacts.get("/", async (c) => {
  const url = new URL(c.req.url);
  const search = url.searchParams.get("search") || "";
  const trashed = (url.searchParams.get("trashed") ||
    "") as FilterOptions["trashed"];
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = 10;

  const { condition: whereCondition, params: whereParams } = buildWhereClause(
    { trashed },
    "contacts",
  );
  const { condition: searchCondition, params: searchParams } =
    buildSearchConditions(search, [
      "contacts.first_name",
      "contacts.last_name",
      "contacts.email",
      "organizations.name",
      "contacts.city",
    ]);

  let query = `
    SELECT contacts.*, organizations.id as org_id, organizations.name as org_name
    FROM contacts
    LEFT JOIN organizations ON contacts.organization_id = organizations.id
  `;

  let countQuery =
    "SELECT COUNT(*) as total FROM contacts LEFT JOIN organizations ON contacts.organization_id = organizations.id";
  const allParams: unknown[] = [];

  const conditions: string[] = [];
  if (whereCondition) conditions.push(whereCondition);
  if (searchCondition) conditions.push(searchCondition);

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
    countQuery += ` WHERE ${conditions.join(" AND ")}`;
    allParams.push(...whereParams, ...searchParams);
  }

  const countParams = [...whereParams, ...searchParams];
  const { total } = db.prepare(countQuery).get(countParams) as {
    total: number;
  };

  query += " ORDER BY contacts.last_name, contacts.first_name LIMIT ? OFFSET ?";
  allParams.push(perPage, (page - 1) * perPage);

  const data = db.prepare(query).all(...allParams) as Record<string, unknown>[];

  const formattedData = data.map((row) => {
    const contact = formatContactForResponse(row, false);
    if (row.org_id) {
      contact.organization = {
        id: row.org_id,
        name: row.org_name,
      };
    }
    return contact;
  });

  const paginatedData = paginate(
    formattedData,
    total,
    page,
    perPage,
    "/contacts",
  );

  return await c.Inertia("Contacts/Index", {
    contacts: paginatedData,
    filters: { search, trashed },
  });
});

// Create contact form
contacts.get("/create", async (c) => {
  const organizations = db
    .prepare(
      "SELECT id, name FROM organizations WHERE deleted_at IS NULL ORDER BY name",
    )
    .all() as DbOrganization[];

  return await c.Inertia("Contacts/Create", {
    organizations: organizations.map((org) =>
      formatOrganizationForResponse(org),
    ),
  });
});

// Store contact
contacts.post("/", async (c) => {
  const body = await c.req.parseBody();

  const errors: Record<string, string> = {};
  if (!body.first_name) errors.first_name = "First name is required";
  if (!body.last_name) errors.last_name = "Last name is required";

  if (Object.keys(errors).length > 0) {
    const organizations = db
      .prepare(
        "SELECT id, name FROM organizations WHERE deleted_at IS NULL ORDER BY name",
      )
      .all() as DbOrganization[];

    return await c.Inertia("Contacts/Create", {
      organizations: organizations.map((org) =>
        formatOrganizationForResponse(org),
      ),
      errors,
    });
  }

  const result = db
    .prepare(
      `
    INSERT INTO contacts (organization_id, first_name, last_name, email, phone, address, city, region, country, postal_code)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
    )
    .run(
      body.organization_id || null,
      body.first_name,
      body.last_name,
      body.email || null,
      body.phone || null,
      body.address || null,
      body.city || null,
      body.region || null,
      body.country || null,
      body.postal_code || null,
    );

  return await c.Inertia.location(`/contacts/${result.lastInsertRowid}/edit`);
});

// Edit contact form
contacts.get("/:id/edit", async (c) => {
  const id = c.req.param("id");

  const contact = db.prepare("SELECT * FROM contacts WHERE id = ?").get(id) as
    | DbContact
    | undefined;

  if (!contact) {
    return c.notFound();
  }

  const organizations = db
    .prepare(
      "SELECT id, name FROM organizations WHERE deleted_at IS NULL ORDER BY name",
    )
    .all() as DbOrganization[];

  return await c.Inertia("Contacts/Edit", {
    contact: formatContactForResponse(contact),
    organizations: organizations.map((org) =>
      formatOrganizationForResponse(org),
    ),
  });
});

// Update contact
contacts.put("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.parseBody();

  const contact = db.prepare("SELECT * FROM contacts WHERE id = ?").get(id) as
    | DbContact
    | undefined;

  if (!contact) {
    return c.notFound();
  }

  const errors: Record<string, string> = {};
  if (!body.first_name) errors.first_name = "First name is required";
  if (!body.last_name) errors.last_name = "Last name is required";

  if (Object.keys(errors).length > 0) {
    const organizations = db
      .prepare(
        "SELECT id, name FROM organizations WHERE deleted_at IS NULL ORDER BY name",
      )
      .all() as DbOrganization[];

    return await c.Inertia("Contacts/Edit", {
      contact,
      organizations: organizations.map((org) =>
        formatOrganizationForResponse(org),
      ),
      errors,
    });
  }

  db.prepare(
    `
    UPDATE contacts
    SET organization_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, address = ?, city = ?, region = ?, country = ?, postal_code = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  ).run(
    body.organization_id || null,
    body.first_name,
    body.last_name,
    body.email || null,
    body.phone || null,
    body.address || null,
    body.city || null,
    body.region || null,
    body.country || null,
    body.postal_code || null,
    id,
  );

  return await c.Inertia.location(`/contacts/${id}/edit`);
});

// Delete contact (soft delete)
contacts.delete("/:id", async (c) => {
  const id = c.req.param("id");

  db.prepare(
    `
    UPDATE contacts
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
  ).run(id);

  return await c.Inertia.location("/contacts");
});

// Restore contact
contacts.put("/:id/restore", async (c) => {
  const id = c.req.param("id");

  db.prepare(
    `
    UPDATE contacts
    SET deleted_at = NULL
    WHERE id = ?
  `,
  ).run(id);

  return await c.Inertia.location(`/contacts/${id}/edit`);
});

export default contacts;
