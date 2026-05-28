declare module "@shared/stubs" {
  export const draftStub: {
    status: string;
    sourceFiles: Array<unknown>;
    displayImages: Array<unknown>;
    product: {
      productName: string;
    };
  };

  export const validationStub: {
    isReadyForInternalApproval: boolean;
    blockingIssues: Array<unknown>;
    failedRules: Array<unknown>;
  };
}
