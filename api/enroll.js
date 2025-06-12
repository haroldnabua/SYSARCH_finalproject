const router = require("express").Router();

// Placeholder for enrollment logic
router.post("/", (req, res) => {
  console.log("Enrollment request received:", req.body);
  // In a real application, you would handle database operations here
  res.status(200).send("Enrollment successful");
});

module.exports = router; 