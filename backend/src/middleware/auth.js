import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireInstructor(req, res, next) {
  if (req.user?.role !== "instructor") {
    return res.status(403).json({ error: "Instructor access required" });
  }
  next();
}

export function requireStudent(req, res, next) {
  if (req.user?.role !== "student") {
    return res.status(403).json({ error: "Student access required" });
  }
  next();
}
