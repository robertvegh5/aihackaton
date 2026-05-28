import { draftStub, validationStub } from "@shared/stubs";

export function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Supplier Intake POC</p>
        <h1>Bootstrap ready</h1>
        <p className="lede">
          Shared contracts, a frontend shell, and a backend scaffold are now in place for the hackathon.
        </p>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Current Draft</h2>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{draftStub.status}</dd>
            </div>
            <div>
              <dt>Product</dt>
              <dd>{draftStub.product.productName}</dd>
            </div>
            <div>
              <dt>Display Images</dt>
              <dd>{draftStub.displayImages.length}</dd>
            </div>
            <div>
              <dt>Source Files</dt>
              <dd>{draftStub.sourceFiles.length}</dd>
            </div>
          </dl>
        </article>

        <article className="panel">
          <h2>Validation</h2>
          <dl>
            <div>
              <dt>Ready</dt>
              <dd>{String(validationStub.isReadyForInternalApproval)}</dd>
            </div>
            <div>
              <dt>Blocking Issues</dt>
              <dd>{validationStub.blockingIssues.length}</dd>
            </div>
            <div>
              <dt>Failed Rules</dt>
              <dd>{validationStub.failedRules.length}</dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
}
