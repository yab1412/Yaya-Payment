const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = "https://sandbox.yayawallet.com";
const API_PATH = "/api/en";
const API_KEY = process.env.YAYA_API_KEY;
const API_SECRET = process.env.YAYA_API_SECRET;

// Headers signature
function buildHeaders(method, endpoint, body) {
  const timestamp = Date.now().toString(); // 13-digit ms
  let endpointForSign = endpoint;

  if (method.toUpperCase() === "GET") {
    endpointForSign = endpoint.split("?")[0];
  }

  if (method.toUpperCase() === "POST") {
    endpointForSign = endpoint.split("?")[0];
  }

  const bodyString = body || "";

  const prehash = `${timestamp}${method.toUpperCase()}${endpointForSign}${bodyString}`;
  const sign = crypto
    .createHmac("sha256", API_SECRET)
    .update(prehash, "utf8")
    .digest("base64");

  return {
    timestamp,
    prehash,
    sign,
    headers: {
      "Content-Type": "application/json",
      "YAYA-API-KEY": API_KEY,
      "YAYA-API-TIMESTAMP": timestamp,
      "YAYA-API-SIGN": sign,
    },
  };
}

// Transactions route
app.get("/api/transactions", async (req, res) => {
  try {
    const page = req.query.p || "1";
    const q = req.query.query ? String(req.query.query) : "";

    if (q) {
      // POST search
      const endpoint = `${API_PATH}/transaction/search?p=${page}`;
      const body = JSON.stringify({ query: q });
      const { headers } = buildHeaders("POST", endpoint, body);

      const r = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers,
        body,
      });
      const data = await r.json();
      return res.status(r.ok ? 200 : r.status).json(data);
    } else {
      // GET list
      const endpoint = `${API_PATH}/transaction/find-by-user?p=${page}`;
      const { headers } = buildHeaders("GET", endpoint, "");

      const r = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        headers,
      });
      const data = await r.json();
      return res.status(r.ok ? 200 : r.status).json(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});


app.listen(4000, () => console.log("Server running on http://localhost:4000"));
