import express from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { draftStub, validationStub, scenarioSummaries } from "../../shared/src/stubs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiPath = path.resolve(__dirname, "../openapi.yaml");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 10,
  },
});
const allowedExtensions = new Set([".pdf", ".xlsx", ".csv", ".docx", ".png", ".jpg", ".jpeg", ".webp"]);

const app = express();
app.use(express.json());

app.get("/openapi.yaml", (_req, res) => {
  res.sendFile(openApiPath);
});

app.get("/api-docs", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Supplier Intake Backend API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.yaml",
        dom_id: "#swagger-ui",
      });
    </script>
  </body>
</html>`);
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/scenarios", (_req, res) => {
  res.json({ scenarios: scenarioSummaries });
});

app.post("/api/extract", upload.array("files"), async (req, res) => {
  const mode = typeof req.body.mode === "string" ? req.body.mode : "upload";
  const scenarioId = typeof req.body.scenarioId === "string" ? req.body.scenarioId : draftStub.scenarioId;
  const files = Array.isArray(req.files) ? req.files : [];

  if (mode !== "upload" && mode !== "manual") {
    res.status(400).json({ error: "mode must be 'upload' or 'manual'" });
    return;
  }

  if (mode === "upload" && files.length === 0) {
    res.status(400).json({ error: "At least one file is required in upload mode." });
    return;
  }

  const invalidFile = files.find((file) => !allowedExtensions.has(path.extname(file.originalname).toLowerCase()));
  if (invalidFile) {
    res.status(400).json({ error: `Unsupported file type for ${invalidFile.originalname}.` });
    return;
  }

  const sourceFiles =
    mode === "manual"
      ? []
      : files.map((file, index) => ({
          id: `upload-${index + 1}`,
          type: mapFileType(file.originalname, file.mimetype),
          name: file.originalname,
          path: `uploads/${Date.now()}-${sanitizeFileName(file.originalname)}`,
        }));

  const extractedDraft = await buildDraftFromFiles(files);

  const articleDraft = {
    ...draftStub,
    ...extractedDraft,
    scenarioId,
    supplierSubmissionId: `submission-${scenarioId}`,
    sourceFiles,
  };

  res.json({ articleDraft });
});

app.post("/api/validate", (_req, res) => {
  res.json({ validationResult: validationStub });
});

app.post("/api/submit-corrections", (_req, res) => {
  res.json({ articleDraft: draftStub, validationResult: validationStub });
});

app.get("/api/internal-status/:id", (req, res) => {
  res.json({
    supplierSubmissionId: req.params.id,
    status: draftStub.status,
    isReadyForInternalApproval: validationStub.isReadyForInternalApproval,
  });
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function mapFileType(fileName, mimeType) {
  const extension = path.extname(fileName).toLowerCase();

  if ([".png", ".jpg", ".jpeg", ".webp"].includes(extension)) {
    return "label-image";
  }

  if (extension === ".pdf") {
    return "pdf";
  }

  if ([".xlsx", ".csv"].includes(extension)) {
    return "spreadsheet";
  }

  if (extension === ".docx" || mimeType.includes("word")) {
    return "document";
  }

  return "source-file";
}

async function buildDraftFromFiles(files) {
  const pdfFile = files.find((file) => path.extname(file.originalname).toLowerCase() === ".pdf");

  if (!pdfFile) {
    return {};
  }

  try {
    const pdf = new PDFParse({ data: pdfFile.buffer });
    const textResult = await pdf.getText();
    await pdf.destroy();

    const text = normalizeExtractedText(textResult.text || "");
    const lines = text
      .split(/\n+/)
      .map((line) => collapseWhitespace(line))
      .filter(Boolean);
    const labeledValues = extractLabeledValues(text, [
      "Artikelnummer",
      "Varumarke",
      "Kategori",
      "EAN",
      "Ursprungsland",
      "Forpackning",
      "Nettovikt",
      "Forvaring",
    ]);

    const productName =
      findAfterLabel(lines, "Produktblad") ||
      findLineContaining(lines, /Ekologiska|Ekologisk|Produktbeskrivning/i) ||
      draftStub.product.productName;

    const articleNumber = labeledValues.Artikelnummer || "";
    const brand = labeledValues.Varumarke || draftStub.product.brand;
    const category = labeledValues.Kategori || "";
    const ean = normalizeEan(labeledValues.EAN || "");
    const countryOfOrigin = labeledValues.Ursprungsland || "";
    const packaging = labeledValues.Forpackning || "";
    const netWeight = labeledValues.Nettovikt || "";
    const storage = labeledValues.Forvaring || "";
    const shortDescription = extractSectionText(text, "Produktbeskrivning", ["Ingredienser", "Naringsvarde per 100 g", "Naringsvarde per 100 ml"]) || draftStub.generatedCopy.shortDescription;
    const ingredientsText = extractSectionText(text, "Ingredienser", ["Naringsvarde per 100 g", "Naringsvarde per 100 ml"]) || draftStub.ingredients.text;
    const nutritionLine =
      extractSectionText(text, "Naringsvarde per 100 g", ["Forvaring", "Allergener"]) ||
      extractSectionText(text, "Naringsvarde per 100 ml", ["Forvaring", "Allergener"]) ||
      "";

    const nutrition = extractNutrition(nutritionLine);

    return {
      product: {
        productName: cleanProductName(productName),
        brand,
        packageSize: extractPackageSize(packaging, netWeight) || draftStub.product.packageSize,
      },
      ingredients: {
        text: ingredientsText,
      },
      allergens: {
        declared: detectAllergens(ingredientsText),
      },
      nutrition: {
        energyKj: nutrition.energyKj,
        fat: nutrition.fat,
        carbohydrates: nutrition.carbohydrates,
        protein: nutrition.protein,
        salt: nutrition.salt,
      },
      generatedCopy: {
        shortDescription,
      },
      confidence: {
        product: 0.83,
        ingredients: ingredientsText ? 0.9 : draftStub.confidence.ingredients,
        allergens: ingredientsText ? 0.72 : draftStub.confidence.allergens,
        nutrition: nutrition.energyKj != null ? 0.88 : draftStub.confidence.nutrition,
      },
      missingFields: buildMissingFields({ articleNumber, category, ean, countryOfOrigin, packaging, netWeight, storage, nutrition }),
      extractedMetadata: {
        articleNumber,
        category,
        ean,
        countryOfOrigin,
        packaging,
        netWeight,
        storage,
      },
    };
  } catch {
    return {};
  }
}

function normalizeWhitespace(value) {
  return value
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[ÅÄ]/g, (match) => (match === "Å" ? "A" : "A"))
    .replace(/[åä]/g, "a")
    .replace(/[Ö]/g, "O")
    .replace(/[ö]/g, "o")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeExtractedText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\r/g, "")
    .replace(/[\t\f\v]+/g, " ");
}

function collapseWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function findAfterLabel(lines, label) {
  const normalizedLabel = normalizeWhitespace(label).toLowerCase();
  const matchedLine = lines.find((line) => normalizeWhitespace(line).toLowerCase().startsWith(normalizedLabel));

  if (!matchedLine) {
    return "";
  }

  const value = matchedLine.split(":").slice(1).join(":").trim();
  return value || "";
}

function findLineContaining(lines, pattern) {
  return lines.find((line) => pattern.test(line)) || "";
}

function paragraphAfterHeading(lines, heading) {
  const normalizedHeading = normalizeWhitespace(heading).toLowerCase();
  const index = lines.findIndex((line) => normalizeWhitespace(line).toLowerCase().startsWith(normalizedHeading));

  if (index === -1) {
    return "";
  }

  const nextLine = lines[index + 1] || "";
  return nextLine;
}

function extractLabeledValues(text, labels) {
  const escapedLabels = labels.map((label) => escapeRegex(label)).join("|");
  const regex = new RegExp(`(^|\\n)\\s*(${escapedLabels})\\s*:\\s*`, "g");
  const matches = Array.from(text.matchAll(regex));
  const values = {};

  matches.forEach((match, index) => {
    const label = match[2];
    const start = (match.index || 0) + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index || text.length : text.length;
    values[label] = collapseWhitespace(text.slice(start, end));
  });

  return values;
}

function extractSectionText(text, heading, nextHeadings) {
  const escapedHeading = escapeRegex(heading);
  const nextHeadingPattern = nextHeadings.length ? nextHeadings.map((nextHeading) => escapeRegex(nextHeading)).join("|") : "$^";
  const regex = new RegExp(`${escapedHeading}\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:${nextHeadingPattern})\\b|$)`, "i");
  const match = text.match(regex);

  return match ? collapseWhitespace(match[1]) : "";
}

function normalizeEan(value) {
  const digits = value.replace(/\D/g, "");
  return digits;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanProductName(value) {
  return value.replace(/^Produktblad\s*-\s*Testdata/i, "").trim() || draftStub.product.productName;
}

function extractPackageSize(packaging, netWeight) {
  const packagingMatch = packaging.match(/(\d+\s*x\s*\d+\s*[a-zA-Z]+)/i);
  if (packagingMatch) {
    return packagingMatch[1].replace(/\s+/g, " ");
  }

  const weightMatch = netWeight.match(/([0-9]+[.,]?[0-9]*\s*(kg|g|ml|l))/i);
  if (weightMatch) {
    return weightMatch[1].replace(/,/g, ".");
  }

  return "";
}

function extractNutrition(line) {
  return {
    energyKj: extractNumber(line, /Energi\s*(\d+[.,]?\d*)\s*kJ/i),
    fat: extractNumber(line, /Fett\s*(\d+[.,]?\d*)\s*g/i),
    carbohydrates: extractNumber(line, /Kolhydrat\w*\s*(\d+[.,]?\d*)\s*g/i),
    protein: extractNumber(line, /Protein\s*(\d+[.,]?\d*)\s*g/i),
    salt: extractNumber(line, /Salt\s*(\d+[.,]?\d*)\s*g/i),
  };
}

function extractNumber(line, pattern) {
  const match = line.match(pattern);
  if (!match) {
    return null;
  }

  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function detectAllergens(ingredientsText) {
  const lower = ingredientsText.toLowerCase();
  const allergens = [];

  if (lower.includes("mjolk")) {
    allergens.push("milk");
  }
  if (lower.includes("soja")) {
    allergens.push("soy");
  }
  if (lower.includes("gluten")) {
    allergens.push("gluten");
  }

  return allergens;
}

function buildMissingFields({ articleNumber, category, ean, countryOfOrigin, packaging, netWeight, storage, nutrition }) {
  const missing = [];

  if (!articleNumber) {
    missing.push("product.articleNumber");
  }
  if (!category) {
    missing.push("product.category");
  }
  if (!ean) {
    missing.push("product.ean");
  }
  if (!countryOfOrigin) {
    missing.push("logistics.countryOfOrigin");
  }
  if (!packaging) {
    missing.push("packaging.type");
  }
  if (!netWeight) {
    missing.push("packaging.netWeight");
  }
  if (!storage) {
    missing.push("logistics.storage");
  }
  if (nutrition.energyKj == null) {
    missing.push("nutrition.energyKj");
  }

  return missing;
}
