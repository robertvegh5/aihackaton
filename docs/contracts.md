# Shared Contracts

## Article Draft

`article-draft.json` is the source of truth shared by frontend, backend, extraction, and validation.

Required top-level fields:
- `supplierSubmissionId`
- `scenarioId`
- `status`
- `sourceFiles`
- `displayImages`
- `product`
- `ingredients`
- `allergens`
- `nutrition`
- `generatedCopy`
- `confidence`
- `missingFields`

### Field Intent

#### `sourceFiles`
All supplier-uploaded source material, such as label images, PDFs, and raw product photos.

#### `displayImages`
The images selected to represent the product in the article draft. This is separate from `sourceFiles`.

## Validation Result

`validation-result.json` describes whether the current article draft is ready for internal approval.

Required top-level fields:
- `isReadyForInternalApproval`
- `blockingIssues`
- `warnings`
- `passedRules`
- `failedRules`
- `suggestedFixes`

## Initial API Surface

- `GET /api/health`
- `GET /api/scenarios`
- `POST /api/extract`
- `POST /api/validate`
- `POST /api/submit-corrections`
- `GET /api/internal-status/:id`
