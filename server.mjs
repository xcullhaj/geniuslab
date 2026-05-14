import { createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize } from "node:path";

const root = process.cwd();
const port = process.env.PORT || 8787;
const dbPath = join(root, "data", "db.json");

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function ensureDatabase() {
  if (!existsSync(dirname(dbPath))) {
    mkdirSync(dirname(dbPath), { recursive: true });
  }

  if (!existsSync(dbPath)) {
    writeFileSync(dbPath, JSON.stringify({ users: [], appointments: [] }, null, 2));
  }
}

function readDatabase() {
  ensureDatabase();
  return JSON.parse(readFileSync(dbPath, "utf8"));
}

function writeDatabase(database) {
  ensureDatabase();
  writeFileSync(dbPath, JSON.stringify(database, null, 2));
}

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body is too large"));
      }
    });
    request.on("end", () => {
      resolve(body ? JSON.parse(body) : {});
    });
    request.on("error", reject);
  });
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };
}

async function handleApi(request, response, url) {
  const database = readDatabase();

  if (request.method === "GET" && url.pathname === "/api/appointments") {
    sendJson(response, 200, { appointments: database.appointments });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/appointments") {
    const appointment = await readBody(request);
    database.appointments.unshift({ ...appointment, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
    writeDatabase(database);
    sendJson(response, 201, { appointment: database.appointments[0] });
    return;
  }

  if (request.method === "DELETE" && url.pathname === "/api/appointments") {
    database.appointments = [];
    writeDatabase(database);
    sendJson(response, 200, { appointments: [] });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/signup") {
    const user = await readBody(request);
    const email = String(user.email || "").trim().toLowerCase();

    if (database.users.some((item) => item.email === email)) {
      sendJson(response, 409, { message: "Kjo adrese email eshte regjistruar tashme." });
      return;
    }

    const savedUser = {
      id: crypto.randomUUID(),
      name: String(user.name || "").trim(),
      email,
      phone: String(user.phone || "").trim(),
      password: String(user.password || ""),
      createdAt: new Date().toISOString(),
    };

    database.users.push(savedUser);
    writeDatabase(database);
    sendJson(response, 201, { user: publicUser(savedUser) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/login") {
    const credentials = await readBody(request);
    const email = String(credentials.email || "").trim().toLowerCase();
    const password = String(credentials.password || "");
    const user = database.users.find((item) => item.email === email && item.password === password);

    if (!user) {
      sendJson(response, 401, { message: "Email ose fjalekalim i pasakte." });
      return;
    }

    sendJson(response, 200, { user: publicUser(user) });
    return;
  }

  if (request.method === "PUT" && url.pathname.startsWith("/api/users/")) {
    const id = url.pathname.split("/").pop();
    const updates = await readBody(request);
    const userIndex = database.users.findIndex((user) => user.id === id);

    if (userIndex === -1) {
      sendJson(response, 404, { message: "Llogaria nuk u gjet." });
      return;
    }

    const email = String(updates.email || "").trim().toLowerCase();
    const emailExists = database.users.some((user) => user.email === email && user.id !== id);
    if (emailExists) {
      sendJson(response, 409, { message: "Ky email perdoret nga nje llogari tjeter." });
      return;
    }

    database.users[userIndex] = {
      ...database.users[userIndex],
      name: String(updates.name || "").trim(),
      email,
      phone: String(updates.phone || "").trim(),
      password: updates.password ? String(updates.password) : database.users[userIndex].password,
      updatedAt: new Date().toISOString(),
    };

    writeDatabase(database);
    sendJson(response, 200, { user: publicUser(database.users[userIndex]) });
    return;
  }

  sendJson(response, 404, { message: "API route not found" });
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApi(request, response, url);
      return;
    }

    const safePath = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(root, safePath === "/" ? "index.html" : safePath);

    if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
      filePath = join(root, "index.html");
    }

    response.setHeader("Content-Type", types[extname(filePath)] || "application/octet-stream");
    createReadStream(filePath).pipe(response);
  } catch (error) {
    sendJson(response, 500, { message: error.message || "Server error" });
  }
}).listen(port, "0.0.0.0", () => {
  ensureDatabase();
  console.log(`GeniusLAB app running at http://127.0.0.1:${port}`);
});
