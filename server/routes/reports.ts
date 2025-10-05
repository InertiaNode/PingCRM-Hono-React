import { Hono } from "hono";

const reports = new Hono();

reports.get("/", async (c) => {
  return await c.Inertia("Reports/Index");
});

export default reports;
