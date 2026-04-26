import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log("Running migrations...");

  // Users
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      email       TEXT UNIQUE NOT NULL,
      password    TEXT NOT NULL,
      role        TEXT NOT NULL CHECK (role IN ('instructor', 'student')),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Courses
  await sql`
    CREATE TABLE IF NOT EXISTS courses (
      id           SERIAL PRIMARY KEY,
      title        TEXT NOT NULL,
      code         TEXT NOT NULL,
      semester     TEXT NOT NULL,
      description  TEXT,
      color        TEXT DEFAULT '#6C8EFF',
      is_published BOOLEAN DEFAULT false,
      owner_id     INT REFERENCES users(id) ON DELETE CASCADE,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Enrollments
  await sql`
    CREATE TABLE IF NOT EXISTS enrollments (
      id         SERIAL PRIMARY KEY,
      student_id INT REFERENCES users(id) ON DELETE CASCADE,
      course_id  INT REFERENCES courses(id) ON DELETE CASCADE,
      enrolled_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(student_id, course_id)
    )
  `;

  // Modules
  await sql`
    CREATE TABLE IF NOT EXISTS modules (
      id         SERIAL PRIMARY KEY,
      course_id  INT REFERENCES courses(id) ON DELETE CASCADE,
      title      TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      is_enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Lessons
  await sql`
    CREATE TABLE IF NOT EXISTS lessons (
      id         SERIAL PRIMARY KEY,
      module_id  INT REFERENCES modules(id) ON DELETE CASCADE,
      title      TEXT NOT NULL,
      sort_order INT DEFAULT 0,
      is_enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Slides (stored as JSON array per lesson)
  await sql`
    CREATE TABLE IF NOT EXISTS slides (
      id         SERIAL PRIMARY KEY,
      lesson_id  INT REFERENCES lessons(id) ON DELETE CASCADE UNIQUE,
      data       JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Resources
  await sql`
    CREATE TABLE IF NOT EXISTS resources (
      id           SERIAL PRIMARY KEY,
      lesson_id    INT REFERENCES lessons(id) ON DELETE CASCADE,
      type         TEXT NOT NULL CHECK (type IN ('link','paper','framework','playground','tool','visualizer')),
      title        TEXT NOT NULL,
      url          TEXT,
      description  TEXT,
      html_content TEXT,
      is_enabled   BOOLEAN DEFAULT true,
      sort_order   INT DEFAULT 0,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("✅ All tables created.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
