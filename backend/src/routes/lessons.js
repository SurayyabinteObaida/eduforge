import { Router } from "express";
import sql from "../db/client.js";
import { authenticate, requireInstructor } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// GET /api/lessons/:id — full lesson with slides + resources
router.get("/:id", async (req, res) => {
  try {
    const [lesson] = await sql`SELECT * FROM lessons WHERE id = ${req.params.id}`;
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    const [slides] = await sql`SELECT * FROM slides WHERE lesson_id = ${lesson.id}`;
    const resources = await sql`
      SELECT * FROM resources WHERE lesson_id = ${lesson.id} ORDER BY sort_order, created_at
    `;

    res.json({ lesson: { ...lesson, slides: slides?.data || null, resources } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lesson" });
  }
});

// ─── SLIDES ───────────────────────────────────────────────

// PUT /api/lessons/:id/slides — save or replace slides JSON
router.put("/:id/slides", requireInstructor, async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: "data must be an array" });

    const [existing] = await sql`SELECT id FROM slides WHERE lesson_id = ${req.params.id}`;
    let slides;
    if (existing) {
      [slides] = await sql`
        UPDATE slides SET data = ${JSON.stringify(data)}, updated_at = NOW()
        WHERE lesson_id = ${req.params.id}
        RETURNING *
      `;
    } else {
      [slides] = await sql`
        INSERT INTO slides (lesson_id, data) VALUES (${req.params.id}, ${JSON.stringify(data)})
        RETURNING *
      `;
    }
    res.json({ slides });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save slides" });
  }
});

// DELETE /api/lessons/:id/slides
router.delete("/:id/slides", requireInstructor, async (req, res) => {
  try {
    await sql`DELETE FROM slides WHERE lesson_id = ${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete slides" });
  }
});

// ─── RESOURCES ───────────────────────────────────────────

// GET /api/lessons/:id/resources
router.get("/:id/resources", async (req, res) => {
  try {
    const resources = await sql`
      SELECT * FROM resources WHERE lesson_id = ${req.params.id} ORDER BY sort_order, created_at
    `;
    res.json({ resources });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resources" });
  }
});

// POST /api/lessons/:id/resources
router.post("/:id/resources", requireInstructor, async (req, res) => {
  try {
    const { type, title, url, description, html_content, sort_order } = req.body;
    const [resource] = await sql`
      INSERT INTO resources (lesson_id, type, title, url, description, html_content, sort_order)
      VALUES (
        ${req.params.id},
        ${type},
        ${title},
        ${url || null},
        ${description || null},
        ${html_content || null},
        ${sort_order || 0}
      )
      RETURNING *
    `;
    res.status(201).json({ resource });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create resource" });
  }
});

// PATCH /api/lessons/:lessonId/resources/:resourceId
router.patch("/:lessonId/resources/:resourceId", requireInstructor, async (req, res) => {
  try {
    const { title, url, description, html_content, is_enabled, sort_order } = req.body;
    const [resource] = await sql`
      UPDATE resources SET
        title        = COALESCE(${title}, title),
        url          = COALESCE(${url}, url),
        description  = COALESCE(${description}, description),
        html_content = COALESCE(${html_content}, html_content),
        is_enabled   = COALESCE(${is_enabled}, is_enabled),
        sort_order   = COALESCE(${sort_order}, sort_order)
      WHERE id = ${req.params.resourceId} AND lesson_id = ${req.params.lessonId}
      RETURNING *
    `;
    if (!resource) return res.status(404).json({ error: "Resource not found" });
    res.json({ resource });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update resource" });
  }
});

// DELETE /api/lessons/:lessonId/resources/:resourceId
router.delete("/:lessonId/resources/:resourceId", requireInstructor, async (req, res) => {
  try {
    await sql`DELETE FROM resources WHERE id = ${req.params.resourceId}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete resource" });
  }
});

export default router;
