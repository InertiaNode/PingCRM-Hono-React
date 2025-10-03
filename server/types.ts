export interface DbUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  owner: number;
  photo?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrganization {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbContact {
  id: number;
  organization_id?: number | null;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilterOptions {
  search?: string;
  trashed?: "with" | "only" | "";
  page?: number;
  perPage?: number;
}
