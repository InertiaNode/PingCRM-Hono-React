export interface Account {
  id: number;
  name: string;
}

export interface AuthUser extends User {
  account: Account;
}

export interface PageProps<T = Record<string, unknown>> {
  auth: {
    user: AuthUser;
  };
  flash: {
    success?: string;
    error?: string;
  };
  errors: Record<string, string>;
  props: T;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  owner: boolean;
  photo?: string;
  name: string;
  deleted_at?: string | null;
}

export interface Organization {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postal_code?: string;
  deleted_at?: string | null;
}

export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  region?: string;
  country?: string;
  postal_code?: string;
  organization_id?: number | string;
  organization?: Organization;
  deleted_at?: string | null;
}

export interface PaginatedData<T> {
  data: T[];
  meta: {
    links: PaginationLink[];
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}
