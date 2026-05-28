import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { draftStub, validationStub, scenarioSummaries } from "../../shared/src/stubs.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const openApiPath = path.resolve(__dirname, "../openapi.yaml");

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

app.post("/api/extract", (_req, res) => {
  res.json({ articleDraft: draftStub });
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
