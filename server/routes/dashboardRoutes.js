const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const Ticket = require("../models/Ticket");

router.use(requireAuth);

const RANGE_DAYS = { "7d": 7, "30d": 30, "90d": 90 };

function getBaseMatch(req, range) {
  const baseMatch =
    req.user.role === "admin"
      ? {}
      : { $or: [{ createdBy: req.user.id }, { assignee: req.user.id }] };

  if (range && RANGE_DAYS[range]) {
    const since = new Date();
    since.setDate(since.getDate() - RANGE_DAYS[range]);
    baseMatch.createdAt = { $gte: since };
  }
  return baseMatch;
}

// Aggregates ticket counts by status and priority, plus a 14-day creation
// trend and per-assignee workload, all scoped by the same RBAC rule used
// for the ticket list. Optional ?range=7d|30d|90d filters by createdAt.
router.get("/summary", async (req, res) => {
  try {
    const { range } = req.query;
    const baseMatch = getBaseMatch(req, range);

    const trendSince = new Date();
    trendSince.setDate(trendSince.getDate() - 13);
    trendSince.setHours(0, 0, 0, 0);
    const trendMatch = { ...baseMatch, createdAt: { $gte: trendSince } };

    const [statusCounts, priorityCounts, total, trendRaw, workloadRaw] = await Promise.all([
      Ticket.aggregate([{ $match: baseMatch }, { $group: { _id: "$status", count: { $sum: 1 } } }]),
      Ticket.aggregate([{ $match: baseMatch }, { $group: { _id: "$priority", count: { $sum: 1 } } }]),
      Ticket.countDocuments(baseMatch),
      Ticket.aggregate([
        { $match: trendMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Ticket.aggregate([
        { $match: { ...baseMatch, assignee: { $ne: null } } },
        { $group: { _id: "$assignee", count: { $sum: 1 } } },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { name: "$user.name", count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    // Fill in missing days in the 14-day trend window with 0 so the chart
    // doesn't skip days with no tickets created.
    const trendMap = new Map(trendRaw.map((t) => [t._id, t.count]));
    const trend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trend.push({ date: key, count: trendMap.get(key) || 0 });
    }

    const resolved = statusCounts.find((s) => s._id === "Resolved")?.count || 0;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    res.json({
      total,
      resolutionRate,
      range: range && RANGE_DAYS[range] ? range : "all",
      byStatus: statusCounts.map((s) => ({ status: s._id, count: s.count })),
      byPriority: priorityCounts.map((p) => ({ priority: p._id, count: p.count })),
      trend,
      workload: workloadRaw.map((w) => ({ name: w.name, count: w.count })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard data", error: err.message });
  }
});

// A slightly deeper breakdown for the Reports page: resolution rate by
// priority, and a simple average time-to-resolution in hours (computed
// from the first and last entries in each resolved ticket's history).
router.get("/reports", async (req, res) => {
  try {
    const baseMatch = getBaseMatch(req, req.query.range);

    const resolvedTickets = await Ticket.find({ ...baseMatch, status: "Resolved" }).select("history priority createdAt");

    let totalHours = 0;
    let countedTickets = 0;
    const byPriorityResolution = {};

    resolvedTickets.forEach((t) => {
      const opened = t.history.find((h) => h.status === "Open");
      const resolved = [...t.history].reverse().find((h) => h.status === "Resolved");
      if (opened && resolved) {
        const hours = (new Date(resolved.changedAt) - new Date(opened.changedAt)) / (1000 * 60 * 60);
        if (hours >= 0) {
          totalHours += hours;
          countedTickets += 1;
          byPriorityResolution[t.priority] = byPriorityResolution[t.priority] || { total: 0, count: 0 };
          byPriorityResolution[t.priority].total += hours;
          byPriorityResolution[t.priority].count += 1;
        }
      }
    });

    const avgResolutionHours = countedTickets > 0 ? Math.round(totalHours / countedTickets) : 0;

    const resolutionByPriority = Object.entries(byPriorityResolution).map(([priority, v]) => ({
      priority,
      avgHours: Math.round(v.total / v.count),
    }));

    const [ticketsPerMember] = await Promise.all([
      Ticket.aggregate([
        { $match: { ...baseMatch, assignee: { $ne: null } } },
        {
          $group: {
            _id: "$assignee",
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } },
          },
        },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $project: { name: "$user.name", total: 1, resolved: 1 } },
        { $sort: { total: -1 } },
      ]),
    ]);

    res.json({
      avgResolutionHours,
      resolutionByPriority,
      ticketsPerMember,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reports", error: err.message });
  }
});

module.exports = router;
