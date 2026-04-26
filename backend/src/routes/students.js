import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import sql from "../db/client.js";
import { authenticate, requireInstructor } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireInstructor);

const CreateStudentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  courseIds: z.array(z.number()).optional().default([]),
});

// GET /api/students — list all students with enrollments
router.get("/", async (req, res) => {
  try {
    const students = await sql`
      SELECT u.id, u.name, u.email, u.created_at,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'title', c.title, 'code', c.code)
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) as courses
      FROM users u
      LEFT JOIN enrollments e ON e.student_id = u.id
      LEFT JOIN courses c ON c.id = e.course_id AND c.owner_id = ${req.user.id}
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `;
    res.json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

// POST /api/students — register a new student
router.post("/", async (req, res) => {
  try {
    const { name, email, password, courseIds } = CreateStudentSchema.parse(req.body);

    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 12);
    const [student] = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email.toLowerCase()}, ${hash}, 'student')
      RETURNING id, name, email, role, created_at
    `;

    // Enroll in courses
    if (courseIds.length > 0) {
      for (const courseId of courseIds) {
        await sql`
          INSERT INTO enrollments (student_id, course_id)
          VALUES (${student.id}, ${courseId})
          ON CONFLICT DO NOTHING
        `;
      }
    }

    res.status(201).json({ student: { ...student, courses: [] } });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error(err);
    res.status(500).json({ error: "Failed to create student" });
  }
});

// PATCH /api/students/:id — update student info
router.patch("/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let hash = undefined;
    if (password) hash = await bcrypt.hash(password, 12);

    const [student] = await sql`
      UPDATE users SET
        name     = COALESCE(${name}, name),
        email    = COALESCE(${email?.toLowerCase()}, email),
        password = COALESCE(${hash || null}, password)
      WHERE id = ${req.params.id} AND role = 'student'
      RETURNING id, name, email, created_at
    `;
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({ student });
  } catch (err) {
    res.status(500).json({ error: "Failed to update student" });
  }
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res) => {
  try {
    await sql`DELETE FROM users WHERE id = ${req.params.id} AND role = 'student'`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete student" });
  }
});

// POST /api/students/:id/enroll
router.post("/:id/enroll", async (req, res) => {
  try {
    const { courseId } = req.body;
    await sql`
      INSERT INTO enrollments (student_id, course_id)
      VALUES (${req.params.id}, ${courseId})
      ON CONFLICT DO NOTHING
    `;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to enroll student" });
  }
});

// DELETE /api/students/:id/enroll/:courseId
router.delete("/:id/enroll/:courseId", async (req, res) => {
  try {
    await sql`
      DELETE FROM enrollments
      WHERE student_id = ${req.params.id} AND course_id = ${req.params.courseId}
    `;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to unenroll student" });
  }
});

export default router;
