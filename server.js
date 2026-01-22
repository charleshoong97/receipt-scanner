require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { GoogleGenAI } = require("@google/genai");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "receipt-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Parse receipt image using Google Gemini Vision
async function parseReceiptImageWithAI(imagePath, apiKey) {
  try {
    // API key is mandatory - no fallback
    if (!apiKey) {
      throw new Error("API key is required");
    }

    // Initialize Gemini client with user's API key
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Read image and convert to base64
    console.log("Processing receipt image with Gemini...");
    const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });

    // Determine MIME type
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    const mimeType = mimeTypes[ext] || "image/jpeg";

    // Create prompt for Gemini
    const prompt = `You are a receipt data extraction expert. Analyze this receipt image and extract structured information.

Extract the following information and return ONLY a valid JSON object (no markdown, no explanation):
{
    "date": "date in DD-MMM-YY format (e.g., 7-Sep-21, 30-Dec-25)",
    "receiptNo": "receipt/invoice number",
    "companyName": "company or store name",
    "description": "brief description of items purchased or service",
    "amount": "total amount in numbers only (e.g., 21.40)",
    "advanceToCo": "",
    "category": "FUEL, FOOD, HARDWARE, MEDICAL, or OTHERS",
    "paymentType": "CASH, CARD, or ONLINE based on receipt details"
}

Rules:
1. For date: Convert to DD-MMM-YY format (e.g., 30/12/2025 becomes 30-Dec-25)
2. For amount: Extract the TOTAL amount only, as a number (e.g., 21.40)
3. For description: Provide a brief description of what was purchased
4. For category: MUST be one of: FUEL, FOOD, HARDWARE, MEDICAL, or OTHERS
   - FUEL: Gas stations, petrol, diesel
   - FOOD: Restaurants, cafes, convenience stores, groceries
   - HARDWARE: Hardware stores, building materials, tools
   - MEDICAL: Pharmacies, hospitals, clinics, medical supplies
   - OTHERS: Everything else
5. For advanceToCo: ALWAYS leave this empty ("")
6. For paymentType: Determine from payment method shown (Visa=CARD, Cash=CASH, etc.)
7. Return ONLY the JSON object, nothing else`;

    // Prepare contents array with image and prompt
    const contents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      { text: prompt },
    ];

    // Send image and prompt to Gemini using new API
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: contents,
    });

    const responseText = response.text.trim();

    // Try to parse the JSON
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      // If parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch =
        responseText.match(/```json\s*([\s\S]*?)\s*```/) ||
        responseText.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse AI response as JSON");
      }
    }

    return [parsedData];
  } catch (error) {
    console.error("AI parsing error:", error);
    // Fallback to basic extraction if AI fails
    return [
      {
        date: "",
        receiptNo: "",
        companyName: "",
        description: "",
        amount: "",
        advanceToCo: "",
        category: "",
        paymentType: "",
      },
    ];
  }
}

// API Routes
app.post("/api/upload", upload.single("receipt"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Get API key from request body - MANDATORY, no default
    const userApiKey = req.body.apiKey;

    if (!userApiKey || userApiKey.trim() === "") {
      // Clean up uploaded file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
      return res.status(400).json({ error: "API key is required" });
    }

    const imagePath = req.file.path;

    // Process image with OpenAI Vision (no sensitive data in logs)
    console.log("Processing receipt image...");
    const parsedData = await parseReceiptImageWithAI(imagePath, userApiKey);
    console.log("Receipt data extracted successfully");

    // Get a text representation for display (optional)
    const extractedText =
      parsedData.length > 0
        ? `Receipt from ${parsedData[0].companyName}\nDate: ${parsedData[0].date}\nAmount: ${parsedData[0].amount}\nCategory: ${parsedData[0].category}`
        : "No data extracted";

    // Clean up uploaded file
    fs.unlink(imagePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.json({
      success: true,
      text: extractedText,
      data: parsedData,
    });
  } catch (error) {
    // Log error without sensitive data
    console.error("Error processing receipt:", error.message);

    // Clean up file if it exists
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    }

    res.status(500).json({
      error: "Failed to process receipt",
      message: error.message,
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Receipt Scanner API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Receipt Scanner server running on http://localhost:${PORT}`);
  console.log(`📄 Upload receipts at http://localhost:${PORT}`);
});
