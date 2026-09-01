const Ticket = require("../models/Ticket");
const Activity = require("../models/Activity");
const Comment = require("../models/Comment");
const { getIO } = require("../socket");

exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, assignee } = req.body;
    const ticket = await Ticket.create({
      title,
      description,
      priority,
      assignee: assignee || null,
      createdBy: req.user.id,
      history: [{ status: "Open", changedBy: req.user.id }],
    });

    await Activity.create({
      type: "ticket_created",
      ticket: ticket._id,
      actor: req.user.id,
      message: `created ticket "${title}"`,
    });

    getIO().emit("ticket:created", { ticketId: ticket._id });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Failed to create ticket", error: err.message });
  }
};

// Members see tickets they created or are assigned to; admins see everything.
// Supports status/priority/assignee filters, plus a full-text `search` param
// that searches ticket title/description (via MongoDB text index) and
// comment text, unioning the matching ticket ids.
exports.getTickets = async (req, res) => {
  try {
    const { status, priority, assignee, search } = req.query;
    const filter = {};

    if (req.user.role !== "admin") {
      filter.$or = [{ createdBy: req.user.id }, { assignee: req.user.id }];
    }
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    if (search && search.trim()) {
      const textMatches = await Ticket.find(
        { $text: { $search: search } },
        { score: { $meta: "textScore" } }
      ).select("_id");
      const commentMatches = await Comment.find({ $text: { $search: search } }).select("ticket");

      const idSet = new Set([
        ...textMatches.map((t) => String(t._id)),
        ...commentMatches.map((c) => String(c.ticket)),
      ]);

      if (idSet.size === 0) return res.json([]);
      filter._id = { $in: Array.from(idSet) };
    }

    const tickets = await Ticket.find(filter)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(500);

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tickets", error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("history.changedBy", "name");

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch ticket", error: err.message });
  }
};

// Any field update is allowed here, but status and assignee changes are also
// appended to history / logged as activity so the lifecycle can be reconstructed.
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const { title, description, priority, assignee, status } = req.body;

    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (priority !== undefined) ticket.priority = priority;

    if (assignee !== undefined && String(assignee) !== String(ticket.assignee)) {
      ticket.assignee = assignee || null;
      await Activity.create({
        type: "assignee_changed",
        ticket: ticket._id,
        actor: req.user.id,
        message: `reassigned "${ticket.title}"`,
      });
    }

    if (status !== undefined && status !== ticket.status) {
      ticket.status = status;
      ticket.history.push({ status, changedBy: req.user.id });
      await Activity.create({
        type: "status_changed",
        ticket: ticket._id,
        actor: req.user.id,
        message: `moved "${ticket.title}" to ${status}`,
      });
    }

    await ticket.save();
    getIO().emit("ticket:updated", { ticketId: ticket._id });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: "Failed to update ticket", error: err.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    getIO().emit("ticket:deleted", { ticketId: req.params.id });
    res.json({ message: "Ticket deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete ticket", error: err.message });
  }
};
