import { Router } from "express";
import { z } from "zod";
import sql from "../db/client.js";
import { authenticate, requireInstructor } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// GET /api/courses — instructor gets own courses, student gets enrolled
router.get("/", async (req, res) => {
  try {
    let courses;
    if (req.user.role === "instructor") {
      courses = await sql`
        SELECT c.*, 
          (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count
        FROM courses c
        WHERE c.owner_id = ${req.user.id}
        ORDER BY c.created_at DESC
      `;
    } else {
      courses = await sql`
        SELECT c.*,
          (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as student_count
        FROM courses c
        JOIN enrollments en ON en.course_id = c.id
        WHERE en.student_id = ${req.user.id} AND c.is_published = true
        ORDER BY c.created_at DESC
      `;
    }

    // Attach modules + lessons for each course
    const full = await Promise.all(
      courses.map(async (c) => {
        const modules = await sql`
          SELECT * FROM modules WHERE course_id = ${c.id} ORDER BY sort_order
        `;
        const modulesWithLessons = await Promise.all(
          modules.map(async (m) => {
            const lessons = await sql`
              SELECT l.*, 
                CASE WHEN s.id IS NOT NULL THEN true ELSE false END as has_slides
              FROM lessons l
              LEFT JOIN slides s ON s.lesson_id = l.id
              WHERE l.module_id = ${m.id}
              ORDER BY l.sort_order
            `;
            return { ...m, lessons };
          })
        );
        return { ...c, modules: modulesWithLessons };
      })
    );

    res.json({ courses: full });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// POST /api/courses — create course (instructor only)
router.post("/", requireInstructor, async (req, res) => {
  try {
    const { title, code, semester, description, color } = req.body;
    const [course] = await sql`
      INSERT INTO courses (title, code, semester, description, color, owner_id)
      VALUES (${title}, ${code}, ${semester}, ${description || ""}, ${color || "#6C8EFF"}, ${req.user.id})
      RETURNING *
    `;
    res.status(201).json({ course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create course" });
  }
});

// PATCH /api/courses/:id — update course
router.patch("/:id", requireInstructor, async (req, res) => {
  try {
    const { title, code, semester, description, color, is_published } = req.body;
    const [course] = await sql`
      UPDATE courses SET
        title        = COALESCE(${title}, title),
        code         = COALESCE(${code}, code),
        semester     = COALESCE(${semester}, semester),
        description  = COALESCE(${description}, description),
        color        = COALESCE(${color}, color),
        is_published = COALESCE(${is_published}, is_published)
      WHERE id = ${req.params.id} AND owner_id = ${req.user.id}
      RETURNING *
    `;
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.json({ course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update course" });
  }
});

// DELETE /api/courses/:id
router.delete("/:id", requireInstructor, async (req, res) => {
  try {
    await sql`DELETE FROM courses WHERE id = ${req.params.id} AND owner_id = ${req.user.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
});

// ─── MODULES ─────────────────────────────────────────────

// POST /api/courses/:courseId/modules
router.post("/:courseId/modules", requireInstructor, async (req, res) => {
  try {
    const { title, sort_order } = req.body;
    const [mod] = await sql`
      INSERT INTO modules (course_id, title, sort_order)
      VALUES (${req.params.courseId}, ${title}, ${sort_order || 0})
      RETURNING *
    `;
    res.status(201).json({ module: mod });
  } catch (err) {
    res.status(500).json({ error: "Failed to create module" });
  }
});

// PATCH /api/courses/:courseId/modules/:moduleId
router.patch("/:courseId/modules/:moduleId", requireInstructor, async (req, res) => {
  try {
    const { title, is_enabled, sort_order } = req.body;
    const [mod] = await sql`
      UPDATE modules SET
        title      = COALESCE(${title}, title),
        is_enabled = COALESCE(${is_enabled}, is_enabled),
        sort_order = COALESCE(${sort_order}, sort_order)
      WHERE id = ${req.params.moduleId} AND course_id = ${req.params.courseId}
      RETURNING *
    `;
    res.json({ module: mod });
  } catch (err) {
    res.status(500).json({ error: "Failed to update module" });
  }
});

// DELETE /api/courses/:courseId/modules/:moduleId
router.delete("/:courseId/modules/:moduleId", requireInstructor, async (req, res) => {
  try {
    await sql`DELETE FROM modules WHERE id = ${req.params.moduleId}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete module" });
  }
});

// ─── LESSONS ─────────────────────────────────────────────

// POST /api/courses/:courseId/modules/:moduleId/lessons
router.post("/:courseId/modules/:moduleId/lessons", requireInstructor, async (req, res) => {
  try {
    const { title, sort_order } = req.body;
    const [lesson] = await sql`
      INSERT INTO lessons (module_id, title, sort_order)
      VALUES (${req.params.moduleId}, ${title}, ${sort_order || 0})
      RETURNING *
    `;
    res.status(201).json({ lesson });
  } catch (err) {
    res.status(500).json({ error: "Failed to create lesson" });
  }
});

// PATCH /api/courses/:courseId/modules/:moduleId/lessons/:lessonId
router.patch("/:courseId/modules/:moduleId/lessons/:lessonId", requireInstructor, async (req, res) => {
  try {
    const { title, is_enabled, sort_order } = req.body;
    const [lesson] = await sql`
      UPDATE lessons SET
        title      = COALESCE(${title}, title),
        is_enabled = COALESCE(${is_enabled}, is_enabled),
        sort_order = COALESCE(${sort_order}, sort_order)
      WHERE id = ${req.params.lessonId}
      RETURNING *
    `;
    res.json({ lesson });
  } catch (err) {
    res.status(500).json({ error: "Failed to update lesson" });
  }
});

// DELETE lesson
router.delete("/:courseId/modules/:moduleId/lessons/:lessonId", requireInstructor, async (req, res) => {
  try {
    await sql`DELETE FROM lessons WHERE id = ${req.params.lessonId}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete lesson" });
  }
});

export default router;
