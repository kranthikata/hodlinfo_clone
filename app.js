// Required modules
const express = require("express");
const path = require("path");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

// Initialize Express and set up SQLite database
const app = express();
const port = 3000;
const db = new sqlite3.Database("./database.db");

// Create table if it does not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS crypto (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    last REAL,
    buy REAL,
    sell REAL,
    volume REAL,
    base_unit TEXT
  )`);
});

// Function to fetch data from WazirX API and update database
async function fetchData() {
  try {
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers");
    const tickers = response.data;
    const top10 = Object.keys(tickers)
      .slice(0, 10)
      .map((key) => tickers[key]);

    db.serialize(() => {
      const stmt = db.prepare(
        "INSERT OR REPLACE INTO crypto (name, last, buy, sell, volume, base_unit) VALUES (?, ?, ?, ?, ?, ?)"
      );

      top10.forEach((ticker) => {
        stmt.run(
          ticker.name,
          ticker.last,
          ticker.buy,
          ticker.sell,
          ticker.volume,
          ticker.base_unit
        );
      });

      stmt.finalize();
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Fetch data every 5 minutes
setInterval(fetchData, 60 * 1000);
fetchData(); // Initial fetch

// API route to get top 10 records from the database
app.get("/api/getTop10", (req, res) => {
  db.all("SELECT * FROM crypto LIMIT 10", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Serve static files and handle main route
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Close the database connection gracefully on exit
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Database closed.");
    }
    process.exit(0);
  });
});
