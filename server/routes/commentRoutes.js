const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/auth");
const { getComments, addComment } = require("../controllers/commentController");

router.use(requireAuth);

router.get("/:ticketId/comments", getComments);
router.post("/:ticketId/comments", addComment);

module.exports = router;
