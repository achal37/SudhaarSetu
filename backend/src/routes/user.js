const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Fetch user details by user_id
router.get("/user", async (req, res) => {
  const { user_id, role } = req.query;

  if (!user_id || !role) {
    return res.status(400).json({ error: "user_id and role are required" });
  }

  let table =
    role === "citizen" ? "users" : role === "officer" ? "officers" : "admins";
  if (!table) {
    return res.status(400).json({ error: "Invalid role" });
  }

  try {
    const query = `SELECT * FROM ${table} WHERE id = $1`;
    const result = await pool.query(query, [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update User Details
router.put("/update-user", async (req, res) => {
  const { user_id, role, name, phone, city, ward, state, email, password } =
    req.body;

  if (!user_id || !role) {
    return res.status(400).json({ error: "user_id and role are required" });
  }

  const validRoles = ["citizen", "admin", "field_officer"];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }

  const table =
    role === "citizen" ? "users" : role === "admin" ? "admins" : "officers";

  let updates = [];
  let values = [];
  let count = 1;

  if (name) {
    updates.push(`name = $${count}`);
    values.push(name);
    count++;
  }
  if (phone) {
    updates.push(`phone = $${count}`);
    values.push(phone);
    count++;
  }
  if (email) {
    updates.push(`email = $${count}`);
    values.push(email);
    count++;
  }

  if (role === "citizen") {
    if (city) {
      updates.push(`city = $${count}`);
      values.push(city);
      count++;
    }
    if (ward !== undefined) {
      updates.push(`ward = $${count}`);
      values.push(ward || null);
      count++;
    }
    if (state) {
      updates.push(`state = $${count}`);
      values.push(state);
      count++;
    }
  }

  if (password) {
    // Check if it looks like a bcrypt hash — then skip hashing
    const isHashed = password.startsWith("$2b$") || password.startsWith("$2a$");

    const finalPassword = isHashed
      ? password
      : await bcrypt.hash(password, 10);

    updates.push(`password = $${count}`);
    values.push(finalPassword);
    count++;
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  values.push(user_id);

  try {
    const query = `UPDATE ${table} SET ${updates.join(
      ", "
    )} WHERE id = $${count} RETURNING id, name, phone, city, ward, state, email`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Update error:", error);

    if (error.code === "23505") {
      return res.status(400).json({ error: "Email already in use" });
    }

    res.status(500).json({ error: "Server error" });
  }
});

// Like a complaint
router.post("/complaints/:id/like", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    // Check if the complaint exists
    const complaintExists = await pool.query(
      "SELECT 1 FROM complaints WHERE id = $1",
      [id]
    );
    if (complaintExists.rowCount === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Check if user has already liked the complaint
    const existingLike = await pool.query(
      "SELECT 1 FROM complaint_upvotes WHERE user_id = $1 AND complaint_id = $2",
      [user_id, id]
    );

    if (existingLike.rowCount > 0) {
      return res
        .status(400)
        .json({ error: "You have already liked this complaint." });
    }

    // Start a transaction
    await pool.query("BEGIN");

    // Increment upvotes
    await pool.query(
      "UPDATE complaints SET upvotes = upvotes + 1 WHERE id = $1",
      [id]
    );

    // Insert like into the database
    await pool.query(
      "INSERT INTO complaint_upvotes (user_id, complaint_id, created_at) VALUES ($1, $2, NOW())",
      [user_id, id]
    );

    // Commit transaction
    await pool.query("COMMIT");

    res.json({ message: "Complaint liked successfully." });
  } catch (error) {
    console.error(error);
    await pool.query("ROLLBACK"); // Rollback transaction on error
    res.status(500).json({ error: "Server error" });
  }
});

// Comment on a complaint
router.post("/complaints/:id/comment", async (req, res) => {
  const { id } = req.params;
  const { user_id, comment_text, userName } = req.body;

  if (!user_id || !comment_text.trim()) {
    return res
      .status(400)
      .json({ error: "user_id and non-empty comment_text are required" });
  }

  try {
    // Check if the complaint exists
    const complaintExists = await pool.query(
      "SELECT 1 FROM complaints WHERE id = $1",
      [id]
    );
    if (complaintExists.rowCount === 0) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    // Start a transaction
    await pool.query("BEGIN");

    // Insert the comment
    const newComment = await pool.query(
      "INSERT INTO comments (id, user_id, complaint_id, comment_text, likes_count, views_count, created_at, user_name) VALUES (gen_random_uuid(), $1, $2, $3, 0, 0, NOW(), $4) RETURNING *",
      [user_id, id, comment_text, userName]
    );
    if (!newComment.rows[0]) {
      throw new Error("Failed to insert comment.");
    }

    // Increase the total_comments count in the complaints table
    await pool.query(
      "UPDATE complaints SET total_comments = total_comments + 1 WHERE id = $1",
      [id]
    );

    // Commit transaction
    await pool.query("COMMIT");

    res.json({
      message: "Comment added successfully.",
      comment: newComment.rows[0],
    });
  } catch (error) {
    console.error(error);
    await pool.query("ROLLBACK"); // Rollback transaction on error
    res.status(500).json({ error: error.message || "Server error" });
  }
});

// Submit feedback to complaint
router.post(
  "/complaint/:complaint_id/feedback/",
  authMiddleware,
  async (req, res) => {
    const { user_id, rating, feedback } = req.body;
    const { complaint_id } = req.params;

    try {
      if(!user_id || !complaint_id) {
        return res
          .status(400)
          .json({ error: "user_id and complaint_id are required." });
      }
      if (!rating) {
        return res
          .status(400)
          .json({ error: "Rating and feedback are required." });
      }

      // New feedback object
      const feedbackEntry = {
        userId: user_id,
        rating,
        review: feedback || "",
      };

      const result = await pool.query(
        `UPDATE complaints
         SET feedback = 
           CASE 
             WHEN jsonb_typeof(COALESCE(feedback, '[]'::jsonb)) = 'array' 
             THEN COALESCE(feedback, '[]'::jsonb) || $1::jsonb
             ELSE jsonb_build_array($1::jsonb)
           END
         WHERE id = $2
         RETURNING *;`,
        [JSON.stringify(feedbackEntry), complaint_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Complaint not found." });
      }

      res.status(200).json({
        message: "Feedback submitted successfully!",
        complaint: result.rows[0],
      });
    } catch (err) {
      console.error("Error submitting feedback:", err);
      res.status(500).json({ error: "Internal server error." });
    }
  }
);

module.exports = router;
