import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_URL =
  process.env.API_URL || "https://student-api-0q00.onrender.com/api/students";

const server = new McpServer({ name: "student-db", version: "1.0.0" });

async function call(path = "", options = {}) {
  const res = await fetch(API_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API error");
  return data;
}

const reply = (data) => ({
  content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
});

// READ
server.tool(
  "list_students",
  "List all students. Optional search matches name, email or course.",
  { search: z.string().optional() },
  async ({ search }) => {
    let students = await call();
    if (search) {
      const q = search.toLowerCase();
      students = students.filter((s) =>
        [s.name, s.email, s.course].some((v) => v?.toLowerCase().includes(q))
      );
    }
    return reply(students);
  }
);

// CREATE
server.tool(
  "add_student",
  "Add a new student to the database.",
  {
    name: z.string(),
    email: z.string(),
    course: z.string(),
    age: z.number().optional(),
  },
  async (student) => reply(await call("", { method: "POST", body: JSON.stringify(student) }))
);

// UPDATE
server.tool(
  "update_student",
  "Update a student by id. Use list_students first to find the id.",
  {
    id: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    course: z.string().optional(),
    age: z.number().optional(),
  },
  async ({ id, ...changes }) =>
    reply(await call(`/${id}`, { method: "PUT", body: JSON.stringify(changes) }))
);

// DELETE
server.tool(
  "delete_student",
  "Delete a student by id. Use list_students first to find the id.",
  { id: z.string() },
  async ({ id }) => reply(await call(`/${id}`, { method: "DELETE" }))
);

await server.connect(new StdioServerTransport());
console.error("student-db MCP server running"); // console.log mat use karna