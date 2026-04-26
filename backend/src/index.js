import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import coursesRoutes from "./routes/courses.js";
import lessonsRoutes from "./routes/lessons.js";
import studentsRoutes from "./routes/students.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security & Middleware ────────────────────────────────

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" })); // visualizer HTML can be large

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      /\.onrender\.com$/,   // allow all Render subdomains
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting — generous for AI routes since generation takes time
const defaultLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, message: { error: "Too many AI requests, slow down." } });

app.use(defaultLimiter);

// ─── Routes ──────────────────────────────────────────────

app.get("/", (req, res) => res.json({ service: "EduForge API", status: "ok" }));
app.get("/health", (req, res) => res.json({ status: "healthy", timestamp: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/lessons", lessonsRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);

// ─── Error Handler ───────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Start ───────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`✅ EduForge API running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
});
