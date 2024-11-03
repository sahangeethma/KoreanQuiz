// server.js
const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from current directory
app.use(express.static("./"));

// Endpoint to save words
app.post("/save-words", async (req, res) => {
  try {
    await fs.writeFile(
      path.join(__dirname, "words.json"),
      JSON.stringify(req.body, null, 2)
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving words:", error);
    res.status(500).json({ error: "Failed to save words" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
