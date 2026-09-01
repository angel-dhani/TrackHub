const express = require("express");
const router = express.Router();
const { requireAuth, requireRole } = require("../middleware/auth");
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} = require("../controllers/ticketController");

router.use(requireAuth);

router.post("/", createTicket);
router.get("/", getTickets);
router.get("/:id", getTicketById);
router.put("/:id", updateTicket);
router.delete("/:id", requireRole("admin"), deleteTicket);

module.exports = router;
