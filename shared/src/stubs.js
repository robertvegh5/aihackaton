import { articleDraftStatus, issueSeverity } from "./contracts.js";

export const draftStub = {
  supplierSubmissionId: "submission-scenario-b",
  scenarioId: "scenario-b",
  status: articleDraftStatus.NEEDS_FIXES,
  sourceFiles: [
    {
      id: "file-1",
      type: "label-image",
      name: "front-label.jpg",
      path: "data/scenarios/scenario-b/front-label.jpg",
    },
    {
      id: "file-2",
      type: "pdf",
      name: "spec-sheet.pdf",
      path: "data/scenarios/scenario-b/spec-sheet.pdf",
    },
  ],
  displayImages: [
    {
      id: "display-1",
      type: "hero",
      name: "product-front.jpg",
      path: "data/scenarios/scenario-b/product-front.jpg",
    },
  ],
  product: {
    productName: "Tomato Soup",
    brand: "Nordic Pantry",
    packageSize: "400 g",
  },
  ingredients: {
    text: "Tomato puree, water, cream, sugar, salt.",
  },
  allergens: {
    declared: ["milk"],
  },
  nutrition: {
    energyKj: null,
    fat: 3.1,
    carbohydrates: 8.4,
    protein: 1.4,
    salt: 0.9,
  },
  generatedCopy: {
    shortDescription: "A smooth tomato soup with a creamy finish.",
  },
  confidence: {
    product: 0.92,
    ingredients: 0.88,
    allergens: 0.81,
    nutrition: 0.59,
  },
  missingFields: ["nutrition.energyKj"],
};

export const validationStub = {
  isReadyForInternalApproval: false,
  blockingIssues: [
    {
      id: "issue-1",
      field: "nutrition.energyKj",
      severity: issueSeverity.BLOCKING,
      message: "Energy value is missing from the nutrition declaration.",
      suggestedFix: "Provide energy in kJ per 100 g.",
    },
  ],
  warnings: [],
  passedRules: [
    "mandatory-fields-present",
    "ingredients-readable",
    "allergens-identified",
  ],
  failedRules: ["nutrition-complete"],
  suggestedFixes: [
    {
      issueId: "issue-1",
      action: "Add missing nutrition value",
    },
  ],
};

export const scenarioSummaries = [
  {
    id: "scenario-a",
    name: "Almost approved",
    description: "A near-complete submission with a small number of fixable issues.",
  },
  {
    id: "scenario-b",
    name: "Clearly deficient",
    description: "A lower quality submission with multiple blocking issues.",
  },
];
