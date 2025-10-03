import Database from "better-sqlite3";
import { hash } from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, "../database.sqlite"));

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    owner INTEGER NOT NULL DEFAULT 0,
    photo TEXT,
    deleted_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS organizations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    postal_code TEXT,
    deleted_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    organization_id INTEGER,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT,
    postal_code TEXT,
    deleted_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
  CREATE INDEX IF NOT EXISTS idx_organizations_deleted_at ON organizations(deleted_at);
  CREATE INDEX IF NOT EXISTS idx_contacts_deleted_at ON contacts(deleted_at);
  CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON contacts(organization_id);
`);

// Seed database with demo data
async function seedDatabase() {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as {
    count: number;
  };

  if (userCount.count === 0) {
    console.log("Seeding database...");

    // Create demo users
    const hashedPassword = await hash("secret", 10);

    db.prepare(
      `
      INSERT INTO users (first_name, last_name, email, password, owner)
      VALUES (?, ?, ?, ?, ?)
    `,
    ).run("John", "Doe", "johndoe@example.com", hashedPassword, 1);

    db.prepare(
      `
      INSERT INTO users (first_name, last_name, email, password, owner)
      VALUES (?, ?, ?, ?, ?)
    `,
    ).run("Jane", "Smith", "janesmith@example.com", hashedPassword, 0);

    // Create demo organizations
    const org1 = db
      .prepare(
        `
      INSERT INTO organizations (name, email, phone, address, city, region, country, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        "Acme Corporation",
        "info@acme.com",
        "555-0100",
        "123 Main St",
        "New York",
        "NY",
        "US",
        "10001",
      );

    const org2 = db
      .prepare(
        `
      INSERT INTO organizations (name, email, phone, address, city, region, country, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        "Tech Solutions Inc",
        "contact@techsolutions.com",
        "555-0200",
        "456 Tech Ave",
        "Toronto",
        "ON",
        "CA",
        "M5H 2N2",
      );

    const org3 = db
      .prepare(
        `
      INSERT INTO organizations (name, email, phone, address, city, region, country, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(
        "Global Industries",
        "hello@global.com",
        "555-0300",
        "789 Business Blvd",
        "Chicago",
        "IL",
        "US",
        "60601",
      );

    // Create demo contacts
    db.prepare(
      `
      INSERT INTO contacts (organization_id, first_name, last_name, email, phone, address, city, region, country, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      org1.lastInsertRowid,
      "Alice",
      "Johnson",
      "alice@acme.com",
      "555-1001",
      "123 Main St",
      "New York",
      "NY",
      "US",
      "10001",
    );

    db.prepare(
      `
      INSERT INTO contacts (organization_id, first_name, last_name, email, phone, address, city, region, country, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      org1.lastInsertRowid,
      "Bob",
      "Williams",
      "bob@acme.com",
      "555-1002",
      "123 Main St",
      "New York",
      "NY",
      "US",
      "10001",
    );

    db.prepare(
      `
      INSERT INTO contacts (organization_id, first_name, last_name, email, phone, address, city, region, country, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      org2.lastInsertRowid,
      "Charlie",
      "Brown",
      "charlie@techsolutions.com",
      "555-2001",
      "456 Tech Ave",
      "Toronto",
      "ON",
      "CA",
      "M5H 2N2",
    );

    db.prepare(
      `
      INSERT INTO contacts (organization_id, first_name, last_name, email, phone, address, city, region, country, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      org3.lastInsertRowid,
      "Diana",
      "Davis",
      "diana@global.com",
      "555-3001",
      "789 Business Blvd",
      "Chicago",
      "IL",
      "US",
      "60601",
    );

    db.prepare(
      `
      INSERT INTO contacts (first_name, last_name, email, phone, address, city, region, country, postal_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      "Eve",
      "Miller",
      "eve@example.com",
      "555-4001",
      "321 Independent St",
      "Seattle",
      "WA",
      "US",
      "98101",
    );

    console.log("Database seeded successfully!");
  }
}

seedDatabase().catch(console.error);

export default db;
