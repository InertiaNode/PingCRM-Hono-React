import { Hono } from "hono";

const dashboard = new Hono();

dashboard.get("/", async (c) => {
  return await c.Inertia("Dashboard/Index");
});

export default dashboard;
