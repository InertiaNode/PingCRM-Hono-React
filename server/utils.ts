import { PaginatedData } from "../shared/types";
import { FilterOptions } from "./types";

export function buildPaginationLinks(
  currentPage: number,
  lastPage: number,
  baseUrl: string,
): Array<{ url: string | null; label: string; active: boolean }> {
  const links: Array<{ url: string | null; label: string; active: boolean }> =
    [];

  // Previous button
  links.push({
    url: currentPage > 1 ? `${baseUrl}?page=${currentPage - 1}` : null,
    label: "&laquo; Previous",
    active: false,
  });

  // Page numbers
  for (let i = 1; i <= lastPage; i++) {
    // Show first page, last page, current page, and 2 pages on each side of current
    if (
      i === 1 ||
      i === lastPage ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      links.push({
        url: `${baseUrl}?page=${i}`,
        label: String(i),
        active: i === currentPage,
      });
    } else if (
      (i === currentPage - 3 && currentPage > 4) ||
      (i === currentPage + 3 && currentPage < lastPage - 3)
    ) {
      links.push({
        url: null,
        label: "...",
        active: false,
      });
    }
  }

  // Next button
  links.push({
    url: currentPage < lastPage ? `${baseUrl}?page=${currentPage + 1}` : null,
    label: "Next &raquo;",
    active: false,
  });

  return links;
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number,
  baseUrl: string,
): PaginatedData<T> {
  const lastPage = Math.ceil(total / perPage);
  const from = total > 0 ? (page - 1) * perPage + 1 : 0;
  const to = Math.min(page * perPage, total);

  return {
    data,
    meta: {
      links: buildPaginationLinks(page, lastPage, baseUrl),
      current_page: page,
      from,
      last_page: lastPage,
      per_page: perPage,
      to,
      total,
    },
  };
}

export function buildWhereClause(
  filters: FilterOptions,
  tableName?: string,
): {
  condition: string;
  params: unknown[];
} {
  const conditions: string[] = [];
  const params: unknown[] = [];

  const deletedAtColumn = tableName ? `${tableName}.deleted_at` : "deleted_at";

  if (filters.trashed === "only") {
    conditions.push(`${deletedAtColumn} IS NOT NULL`);
  } else if (!filters.trashed || filters.trashed === "") {
    conditions.push(`${deletedAtColumn} IS NULL`);
  }
  // 'with' means show all, so no condition needed

  const condition = conditions.join(" AND ");
  return { condition, params };
}

export function buildSearchConditions(
  searchTerm: string,
  fields: string[],
): { condition: string; params: unknown[] } {
  if (!searchTerm || fields.length === 0) {
    return { condition: "", params: [] };
  }

  const searchPattern = `%${searchTerm}%`;
  const conditions = fields.map((field) => `${field} LIKE ?`).join(" OR ");
  const params = fields.map(() => searchPattern);

  return { condition: `(${conditions})`, params };
}

export function formatUserForResponse(user: Record<string, unknown>) {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    name: `${user.first_name} ${user.last_name}`,
    email: user.email,
    owner: Boolean(user.owner),
    photo: user.photo || undefined,
    deleted_at: user.deleted_at || null,
  };
}

export function formatOrganizationForResponse(
  org: Record<string, unknown>,
  includeContacts = false,
) {
  const formatted: Record<string, unknown> = {
    id: org.id,
    name: org.name,
    email: org.email || undefined,
    phone: org.phone || undefined,
    address: org.address || undefined,
    city: org.city || undefined,
    region: org.region || undefined,
    country: org.country || undefined,
    postal_code: org.postal_code || undefined,
    deleted_at: org.deleted_at || null,
  };

  if (includeContacts && org.contacts) {
    formatted.contacts = org.contacts;
  }

  return formatted;
}

export function formatContactForResponse(
  contact: Record<string, unknown>,
  includeOrganization = false,
) {
  const formatted: Record<string, unknown> = {
    id: contact.id,
    first_name: contact.first_name,
    last_name: contact.last_name,
    name: `${contact.first_name} ${contact.last_name}`,
    email: contact.email || undefined,
    phone: contact.phone || undefined,
    address: contact.address || undefined,
    city: contact.city || undefined,
    region: contact.region || undefined,
    country: contact.country || undefined,
    postal_code: contact.postal_code || undefined,
    organization_id: contact.organization_id || undefined,
    deleted_at: contact.deleted_at || null,
  };

  if (includeOrganization && contact.organization) {
    formatted.organization = {
      id: contact.organization.id,
      name: contact.organization.name,
    };
  }

  return formatted;
}
