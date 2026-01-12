// Load environment variables from .env.local FIRST, then fallback to .env
const path = require("path");
const fs = require("fs");
const envLocalPath = path.join(__dirname, ".env.local");
const envPath = path.join(__dirname, ".env");

// Try .env.local first, then .env as fallback
let envResult = null;
if (fs.existsSync(envLocalPath)) {
  envResult = require("dotenv").config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  envResult = require("dotenv").config({ path: envPath });
} else {
  // Try default dotenv behavior (loads .env if exists)
  envResult = require("dotenv").config();
}

// Ensure environment variables are set from parsed result
if (envResult && envResult.parsed) {
  Object.keys(envResult.parsed).forEach((key) => {
    if (!process.env[key]) {
      process.env[key] = envResult.parsed[key];
    }
  });
}

// Verify PAT_1 is loaded (for debugging)
if (!process.env.PAT_1) {
  console.warn("Warning: PAT_1 not found in environment variables");
  console.warn(`Looking for .env.local at: ${envLocalPath}`);
  console.warn(`Looking for .env at: ${envPath}`);
  console.warn(
    "Make sure .env.local or .env exists and contains PAT_1=your_token"
  );
} else {
  console.log("✓ PAT_1 loaded successfully");
}

const http = require("http");
const url = require("url");
const handler = require("./api/index.js");

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/api" || parsedUrl.pathname === "/api/") {
    const mockReq = {
      query: parsedUrl.query,
    };

    const mockRes = {
      headers: {},
      statusCode: 200,
      setHeader: function (key, value) {
        this.headers[key] = value;
        res.setHeader(key, value);
      },
      status: function (code) {
        this.statusCode = code;
        res.statusCode = code;
        return this;
      },
      send: function (data) {
        if (!res.headersSent) {
          res.statusCode = this.statusCode || 200;
        }
        res.end(data);
      },
    };

    try {
      await handler(mockReq, mockRes);
    } catch (error) {
      console.error("Error:", error);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(
    `Test with: http://localhost:${PORT}/api?username=<github_username>`
  );
  console.log(
    `Example: http://localhost:${PORT}/api?username=octocat&theme=dark`
  );
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("Server closed successfully");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
