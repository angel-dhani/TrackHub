const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const User = require("../models/User");

router.use(requireAuth);

// Any logged-in user can see the team list (needed for assignee dropdowns)
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("name email role createdAt");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// Only admins can change roles
router.put("/:id/role", requireRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to update role", error: err.message });
  }
});

module.exports = router;
