import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { authenticate, requireInstructor } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireInstructor);

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── SLIDES GENERATION ───────────────────────────────────

const SlidesSchema = z.object({
  topic: z.string().min(2),
  concepts: z.string().optional().default(""),
  depth: z.enum(["undergraduate", "graduate", "phd"]).default("graduate"),
  style: z.enum(["technical", "conceptual", "practical", "mixed"]).default("technical"),
  count: z.number().min(4).max(25).default(10),
});

router.post("/slides", async (req, res) => {
  try {
    const { topic, concepts, depth, style, count } = SlidesSchema.parse(req.body);

    const prompt = `You are a university lecture slide designer for a ${depth}-level course.
Generate exactly ${count} slides for a lecture on: "${topic}"
Key concepts to cover: ${concepts || "all fundamental concepts"}
Style: ${style}

Each slide must be a JSON object with:
- type: "title" | "content" | "code" | "summary"  
- title: string (slide heading, concise)
- bullets: string[] (3-5 points, for content/summary slides only)
- code: string (actual working code snippet, for code slides only)
- notes: string (speaker notes, 2-3 sentences)

Rules:
- First slide must be type "title" with subtitle as bullets[0]
- Last slide must be type "summary"
- Mix content and code slides based on the style
- Bullets should be substantive, not trivial
- Code must be real, runnable, relevant to the topic

Return ONLY a valid JSON array. No markdown fences, no explanation.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const slides = JSON.parse(cleaned);

    res.json({ slides });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error("Slides generation error:", err);
    res.status(500).json({ error: "Failed to generate slides" });
  }
});

// ─── RESOURCES SUGGESTION ────────────────────────────────

const ResourcesSchema = z.object({
  topic: z.string().min(2),
  courseContext: z.string().optional().default("Deep Learning"),
});

router.post("/resources", async (req, res) => {
  try {
    const { topic, courseContext } = ResourcesSchema.parse(req.body);

    const prompt = `You are an academic resource curator for a ${courseContext} course.
For a graduate-level lecture on "${topic}", suggest 8-10 high-quality, real resources.

Return ONLY a JSON array. Each item must have:
- title: string (name of the resource)
- type: "link" | "paper" | "framework" | "playground" | "tool"
- url: string (real, verifiable URL — must actually exist)
- description: string (1-2 sentences: what it is and why students should use it)

Include a mix of:
- Seminal or recent research papers (arxiv, papers with code)
- Official documentation (PyTorch, TensorFlow, JAX, etc.)
- Interactive playgrounds (Colab notebooks, distill.pub, etc.)
- Useful tools (TensorBoard, Weights & Biases, etc.)
- Quality educational links

No markdown, no explanation, just the JSON array.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].text.trim();
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const resources = JSON.parse(cleaned);

    res.json({ resources });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error("Resources generation error:", err);
    res.status(500).json({ error: "Failed to generate resources" });
  }
});

// ─── VISUALIZER GENERATION ───────────────────────────────

const VisualizerSchema = z.object({
  concept: z.string().min(2),
  description: z.string().optional().default(""),
  colorScheme: z.enum(["dark", "light"]).default("dark"),
});

router.post("/visualizer", async (req, res) => {
  try {
    const { concept, description, colorScheme } = VisualizerSchema.parse(req.body);

    const darkBg = colorScheme === "dark";

    const prompt = `You are an expert educational visualizer developer specializing in deep learning concepts.

Create a beautiful, self-contained HTML visualizer for: "${concept}"
What to show: ${description || "a clear visual explanation of how this concept works"}

Design requirements:
- Background: ${darkBg ? "#1a1e2a (dark navy)" : "#ffffff (white)"}
- Text: ${darkBg ? "#e8eaf0 (light)" : "#1a1e2a (dark)"}
- Accent colors: use blues, purples, and teals for highlights
- ${darkBg ? "Use glowing effects sparingly for visual appeal" : "Use clean, academic styling"}

Technical requirements:
- Single self-contained HTML file (ALL CSS and JS inline, zero external dependencies)
- Clear title at the top (the concept name)
- Visual diagram or animation showing the concept
- Labels and annotations on all key elements
- Smooth CSS animations where they add educational value
- Brief explanatory text below key visual elements
- Responsive layout that works at 400px-800px width
- Professional, academic quality suitable for university lectures

The visualizer should help an MS student immediately understand the concept visually.
Make it genuinely educational — not just decorative.

Return ONLY the complete HTML, starting with <!DOCTYPE html>. No markdown, no explanation.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const html = message.content[0].text.trim();

    res.json({ html });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    console.error("Visualizer generation error:", err);
    res.status(500).json({ error: "Failed to generate visualizer" });
  }
});

export default router;
