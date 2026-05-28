## Handoff

This session clarified the hackathon problem framing and execution plan. No workspace files were changed.

### User Goal

Build a local POC for supplier submission of packaged food article data.

Primary business problem:
- Supplier article submissions are slow, inconsistent, and incomplete.
- Data quality issues affect searchability, compliance, and ecommerce UX.

Primary value hypothesis:
- Improve data quality at the source by guiding the supplier and using AI to extract and validate data early.

### Locked Decisions

Business / product:
- Primary user: supplier
- Domain: packaged food products
- Primary outcome: higher data quality
- Article target state: ready for internal approval, not direct publication
- Main output: article draft plus blocking issues
- Demo story: raw submission -> AI draft -> issues -> supplier corrections -> ready for internal approval
- Internal user scope: minimal internal status view only
- Correction UX: task list that links into the relevant form fields

Data / demo scope:
- All input data will be mocked demo data
- Real AI models will be used to interpret text, images, and files
- No internal database or internal system integrations
- POC will run locally
- Two demo scenarios:
  - Scenario A: almost approved, only a few fixes needed
  - Scenario B: clearly deficient, multiple blocking issues

Quality rules chosen for the demo:
- Mandatory fields exist
- Product name and metadata are complete
- Ingredient list is extracted and readable
- Allergens are identified and clearly marked
- Nutrition values are complete and structured
- Image/label is readable enough
- Product copy is understandable and tone-checked

Technical / collaboration:
- Shared source of truth between teams: `article-draft.json`
- Also agreed on `validation-result.json`
- Team stack choice: `Vite + small backend layer`
- AI provider choice: Azure AI Foundry models

### Recommended Architecture

- Frontend: Vite + React
- Backend: small local Node server, suggested Express or Fastify
- Shared contracts/types between frontend and backend
- Local mock scenario files
- Backend adapter around Azure AI Foundry so Foundry-specific response shapes do not leak into UI

Suggested top-level structure:
- `frontend/`
- `backend/`
- `shared/`
- `data/scenarios/`

Suggested API surface:
- `POST /api/extract`
- `POST /api/validate`
- `POST /api/submit-corrections`
- `GET /api/scenarios`
- `GET /api/internal-status/:id`

### Suggested Contracts

`article-draft.json` should contain at least:
- `supplierSubmissionId`
- `scenarioId`
- `sourceFiles` (all uploaded supplier inputs such as label photos, PDFs, raw product photos)
- `productName`
- `brand`
- `packageSize`
- `ingredients`
- `allergens`
- `nutrition`
- `displayImages` (the curated images intended to represent the product in the article draft)
- `generatedCopy`
- `confidence`
- `missingFields`
- `status`

`validation-result.json` should contain at least:
- `isReadyForInternalApproval`
- `blockingIssues`
- `warnings`
- `passedRules`
- `failedRules`
- `suggestedFixes`

### Team Split Agreed

Pair 1: supplier flow
- Upload/start screen
- Scenario chooser
- Article draft form
- Blocking issues task list
- Link issue -> field
- Status flow and completion screen

Pair 2: AI extraction
- Local scenario file loading
- Azure AI Foundry adapter
- Extraction of product name, ingredients, allergens, nutrition
- Product copy generation
- Normalization into `article-draft`

Pair 3: validation and internal review
- Implement 7 validation rules
- Build `validation-result`
- Blocking issue objects and suggested fixes
- Ready/not-ready logic
- Minimal internal status view

### Git / Workflow Guidance Agreed

- Keep `main` demoable at all times
- Start with a short shared bootstrap before splitting work
- Merge small and often
- Assign one integration owner
- Do not change shared contracts casually once parallel work starts

Suggested branches:
- `feature/bootstrap-app`
- `feature/supplier-intake-ui`
- `feature/azure-foundry-extraction`
- `feature/validation-review`

### Recommended Next Step

The next agent should move from planning to build by doing the shared bootstrap work first:

1. Choose backend framework: Express or Fastify
2. Scaffold Vite frontend and local backend
3. Create `shared` contract/types for article draft and validation result
4. Create two local scenario folders with mocked files
5. Add minimal endpoints and a happy-path stub integration
6. Then let teams branch from that baseline

### Important Constraints

- No internal systems or databases
- No autopublishing scope
- No full backoffice/dashboard scope
- Keep scope strictly on packaged food intake POC

### Repo State

- Repo currently appears to be a hackathon setup repo, not an existing app implementation
- No app code was found in the workspace during this session
- No files were modified in this session

### Suggested Skills

- `frontend-design`: if the next agent starts building the supplier UI
- `design-engineering`: if the next agent wants to polish the interaction flow after the basic scaffold exists
- `microsoft-foundry`: if the next agent needs help wiring Azure AI Foundry model usage
- `grill-with-docs`: if the team wants to pressure-test terminology or narrow scope further before implementation
