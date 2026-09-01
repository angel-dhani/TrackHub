const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["ticket_created", "status_changed", "comment_added", "assignee_changed"],
      required: true,
    },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true }, // e.g. "moved to In Progress"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);
