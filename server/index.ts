import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { inertiaHonoAdapter } from "@inertianode/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { sessionMiddleware, CookieStore } from "hono-sessions";

// Import database to initialize schema
import "./db";

// Import routes
import auth from "./routes/auth";
import dashboard from "./routes/dashboard";
import organizations from "./routes/organizations";
import contacts from "./routes/contacts";
import users from "./routes/users";
import reports from "./routes/reports";

// Import middleware
import { authMiddleware } from "./middleware/auth";
import { shareMiddleware } from "./middleware/share";

const app = new Hono();

// Session middleware
const store = new CookieStore();
app.use(
  "*",
  sessionMiddleware({
    store,
    encryptionKey:
      "pingcrm-secret-key-change-this-in-production-please-make-it-secure",
    expireAfterSeconds: 60 * 60 * 24 * 7, // 7 days
    cookieOptions: {
      sameSite: "Lax",
      path: "/",
      httpOnly: true,
    },
  }),
);

// Inertia adapter
app.use(
  inertiaHonoAdapter({
    vite: {
      entrypoints: ["client/App.tsx"],
      reactRefresh: true,
    },
  }),
);

// Serve static files
app.use("*", serveStatic({ root: "./public" }));

// Share data middleware
app.use("*", shareMiddleware);

// Public routes (auth)
app.route("/", auth);

// Protected routes
app.use("*", authMiddleware);
app.route("/", dashboard);
app.route("/organizations", organizations);
app.route("/contacts", contacts);
app.route("/users", users);
app.route("/reports", reports);

serve(
  {
    fetch: app.fetch,
    port: (process.env.PORT || 3000) as number,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
