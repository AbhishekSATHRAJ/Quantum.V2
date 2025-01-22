import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { readFileSync } from "fs";
import process from "process";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin SDK Setup (Server-Side)
const serviceAccount = JSON.parse(
  readFileSync(
    "./src/server/quantum-c7cbc-firebase-adminsdk-ojw5y-761649b398.json",
    "utf8"
  )
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const adminAuth = admin.auth();
const db = admin.firestore();

const PORT = process.env.PORT || 5000;

// Middleware to verify Firebase ID token (using Admin SDK)
const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).send("Forbidden");
  }
};

// Register Endpoint
app.post("/register", async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res
      .status(400)
      .json({ message: "Email, password, and username are required." });
  }

  try {
    // Create the user in Firebase Authentication (Admin SDK)
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
    });

    // Store username and email in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      username: username,
      email: email,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { uid: userRecord.uid, username: username, email: email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

// Sign In Endpoint
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    const userRecord = await adminAuth.getUserByEmail(email);

    res
      .status(200)
      .json({ message: "User signed in successfully", user: userRecord });
  } catch (error) {
    res.status(500).json({ message: "Error signing in", error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
