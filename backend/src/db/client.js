import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const sql = neon(process.env.DATABASE_URL);

export default sql;

// Helper: run a query and return rows
export async function query(strings, ...values) {
  try {
    const result = await sql(strings, ...values);
    return result;
  } catch (err) {
    console.error("DB Error:", err.message);
    throw err;
  }
}
