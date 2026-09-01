const Comment = require("../models/Comment");
const Activity = require("../models/Activity");
const Ticket = require("../models/Ticket");
const { getIO } = require("../socket");

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ ticket: req.params.ticketId })
      .populate("author", "name")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch comments", error: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const comment = await Comment.create({
      ticket: req.params.ticketId,
      author: req.user.id,
      text: text.trim(),
    });

    await Activity.create({
      type: "comment_added",
      ticket: ticket._id,
      actor: req.user.id,
      message: `commented on "${ticket.title}"`,
    });

    const populated = await comment.populate("author", "name");
    getIO().emit("comment:added", { ticketId: ticket._id });
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: "Failed to add comment", error: err.message });
  }
};
