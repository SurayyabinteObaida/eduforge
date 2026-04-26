import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log("Seeding database...");

  // Create instructor
  const hash = await bcrypt.hash("instructor123", 12);
  const [instructor] = await sql`
    INSERT INTO users (name, email, password, role)
    VALUES ('Dr. Rashid', 'instructor@eduforge.com', ${hash}, 'instructor')
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  // Create course
  const [course] = await sql`
    INSERT INTO courses (title, code, semester, description, color, is_published, owner_id)
    VALUES (
      'Deep Learning for MS Computer Science',
      'CS-601',
      'Fall 2025',
      'Graduate-level deep learning covering neural networks, CNNs, RNNs, transformers and modern architectures.',
      '#6C8EFF',
      true,
      ${instructor.id}
    )
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  if (!course) {
    console.log("Course already exists, skipping.");
    process.exit(0);
  }

  // Modules + Lessons
  const modules = [
    {
      title: "Foundations of Neural Networks",
      enabled: true,
      lessons: [
        "Biological to Artificial Neurons",
        "Activation Functions & Non-linearity",
        "Forward Propagation",
      ],
    },
    {
      title: "Training Deep Networks",
      enabled: true,
      lessons: [
        "Backpropagation Algorithm",
        "Gradient Descent Variants",
        "Learning Rate Schedules",
      ],
    },
    {
      title: "Convolutional Neural Networks",
      enabled: false,
      lessons: ["Convolution Operations", "Pooling & Receptive Fields"],
    },
  ];

  for (let mi = 0; mi < modules.length; mi++) {
    const m = modules[mi];
    const [mod] = await sql`
      INSERT INTO modules (course_id, title, sort_order, is_enabled)
      VALUES (${course.id}, ${m.title}, ${mi}, ${m.enabled})
      RETURNING id
    `;
    for (let li = 0; li < m.lessons.length; li++) {
      await sql`
        INSERT INTO lessons (module_id, title, sort_order, is_enabled)
        VALUES (${mod.id}, ${m.lessons[li]}, ${li}, true)
      `;
    }
  }

  // Demo student
  const studentHash = await bcrypt.hash("student123", 12);
  const [student] = await sql`
    INSERT INTO users (name, email, password, role)
    VALUES ('Ayesha Siddiqui', 'ayesha@student.edu', ${studentHash}, 'student')
    ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  await sql`
    INSERT INTO enrollments (student_id, course_id)
    VALUES (${student.id}, ${course.id})
    ON CONFLICT DO NOTHING
  `;

  console.log("✅ Seed complete.");
  console.log("   Instructor: instructor@eduforge.com / instructor123");
  console.log("   Student:    ayesha@student.edu / student123");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
