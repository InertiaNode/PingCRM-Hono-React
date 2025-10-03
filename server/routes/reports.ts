import { Hono } from "hono";
import { Inertia } from "@inertianode/core";

const reports = new Hono();

reports.get("/", async (c) => {
  return await c.Inertia("Reports/Index");
});

export default reports;
