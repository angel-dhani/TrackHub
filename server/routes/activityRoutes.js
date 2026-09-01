const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const Activity = require("../models/Activity");
const Ticket = require("../models/Ticket");

router.use(requireAuth);

// Members only see activity on tickets they created or are assigned to,
// matching the same visibility rule used for the ticket list.
router.get("/", async (req, res) => {
  try {
    let ticketIds = null;

    if (req.user.role !== "admin") {
      const visibleTickets = await Ticket.find({
        $or: [{ createdBy: req.user.id }, { assignee: req.user.id }],
      }).select("_id");
      ticketIds = visibleTickets.map((t) => t._id);
    }

    const filter = ticketIds ? { ticket: { $in: ticketIds } } : {};

    const activity = await Activity.find(filter)
      .populate("actor", "name")
      .populate("ticket", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activity", error: err.message });
  }
});

module.exports = router;
