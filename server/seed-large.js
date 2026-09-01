// Run with: node seed-large.js
// Generates ~600 tickets with varied dates, statuses, priorities, and some
// comments, so search, filters, and the dashboard have realistic volume.
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Ticket = require("./models/Ticket");
const Comment = require("./models/Comment");
const Activity = require("./models/Activity");

const TITLE_SUBJECTS = [
  "Login page", "Dashboard chart", "Ticket list", "API endpoint", "Search bar",
  "Notification bell", "Export button", "User avatar", "Settings page", "Comment box",
  "Kanban board", "Filter dropdown", "Mobile nav", "Email template", "Password reset",
  "File upload", "Rate limiter", "Cache layer", "Webhook handler", "Audit log",
];
const TITLE_ISSUES = [
  "crashes on submit", "returns wrong data", "renders slowly on mobile", "throws a 500 error",
  "doesn't validate input", "loses state on refresh", "shows stale data", "breaks in Safari",
  "needs better error messaging", "is missing a loading state", "doesn't handle empty results",
  "times out under load", "has a memory leak", "ignores the selected filter", "duplicates on retry",
];
const DESCRIPTIONS = [
  "Reported by a user on the free tier, reproduced on staging.",
  "First seen in production logs after the last deploy.",
  "Intermittent — happens roughly 1 in 20 attempts.",
  "Consistently reproducible with a fresh account.",
  "Only affects users with more than 100 tickets in their workspace.",
  "Started after the last dependency upgrade.",
];
const COMMENT_TEXTS = [
  "Confirmed, I can reproduce this.",
  "Pushed a fix to staging, can someone verify?",
  "This looks related to the caching issue from last sprint.",
  "Lower priority than I thought — only affects a small user segment.",
  "Deployed the fix, closing once QA signs off.",
  "Reopening, the fix introduced a regression elsewhere.",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24));
  return d;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  await User.deleteMany({});
  await Ticket.deleteMany({});
  await Comment.deleteMany({});
  await Activity.deleteMany({});
  console.log("Cleared existing data");

  const password = await bcrypt.hash("password123", 10);
  const admin = await User.create({ name: "Admin User", email: "admin@test.com", password, role: "admin" });
  const priya = await User.create({ name: "Priya Sharma", email: "priya@test.com", password, role: "member" });
  const arjun = await User.create({ name: "Arjun Mehta", email: "arjun@test.com", password, role: "member" });
  const members = [priya, arjun];
  console.log("Created 3 users");

  const statuses = ["Open", "In Progress", "Resolved"];
  const priorities = ["Low", "Medium", "High", "Critical"];
  const TICKET_COUNT = 600;

  const ticketDocs = [];
  for (let i = 0; i < TICKET_COUNT; i++) {
    const title = `${randomFrom(TITLE_SUBJECTS)} ${randomFrom(TITLE_ISSUES)}`;
    const status = randomFrom(statuses);
    const createdAt = randomDate(120);
    const assignee = Math.random() > 0.15 ? randomFrom(members)._id : null;
    const createdBy = Math.random() > 0.5 ? admin._id : randomFrom(members)._id;

    const history = [{ status: "Open", changedBy: createdBy, changedAt: createdAt }];
    if (status !== "Open") {
      const changedAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * (1 + Math.random() * 48));
      history.push({ status, changedBy: assignee || createdBy, changedAt });
    }

    ticketDocs.push({
      title,
      description: randomFrom(DESCRIPTIONS),
      status,
      priority: randomFrom(priorities),
      assignee,
      createdBy,
      history,
      createdAt,
      updatedAt: createdAt,
    });
  }

  const inserted = await Ticket.insertMany(ticketDocs);
  console.log(`Inserted ${inserted.length} tickets`);

  // Add 1-2 comments to ~40% of tickets, and matching activity entries
  const commentDocs = [];
  const activityDocs = [];
  for (const ticket of inserted) {
    activityDocs.push({
      type: "ticket_created",
      ticket: ticket._id,
      actor: ticket.createdBy,
      message: `created ticket "${ticket.title}"`,
      createdAt: ticket.createdAt,
    });

    if (Math.random() < 0.4) {
      const numComments = 1 + Math.floor(Math.random() * 2);
      for (let c = 0; c < numComments; c++) {
        const author = Math.random() > 0.5 ? admin._id : randomFrom(members)._id;
        const createdAt = new Date(ticket.createdAt.getTime() + 1000 * 60 * 60 * (2 + Math.random() * 72));
        commentDocs.push({
          ticket: ticket._id,
          author,
          text: randomFrom(COMMENT_TEXTS),
          createdAt,
          updatedAt: createdAt,
        });
        activityDocs.push({
          type: "comment_added",
          ticket: ticket._id,
          actor: author,
          message: `commented on "${ticket.title}"`,
          createdAt,
        });
      }
    }
  }

  await Comment.insertMany(commentDocs);
  await Activity.insertMany(activityDocs);
  console.log(`Inserted ${commentDocs.length} comments and ${activityDocs.length} activity entries`);

  console.log("\nDone. Log in with: admin@test.com / password123");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
