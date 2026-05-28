import express from "express";
import { draftStub, validationStub, scenarioSummaries } from "../../shared/src/stubs.js";

const app = express();
app.use(express.json());

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
