# Hackathon Plan

## Goal

Build a local POC for packaged food supplier intake that improves data quality at the source.

## Primary Outcome

The supplier can upload a mocked submission package, receive an AI-generated article draft, resolve blocking issues, and reach `Ready for internal approval`.

## Scope

In scope:
- Packaged food products
- Mocked local demo input
- Real AI model calls through Azure AI Foundry
- Article draft generation
- Validation against intake quality rules
- Supplier correction flow
- Minimal internal status view

Out of scope:
- Internal system integrations
- Databases
- Direct publication
- Full backoffice workflows
- Categories outside packaged food

## Demo Scenarios

### Scenario A
Almost approved. A few blocking issues remain and can be corrected quickly.

### Scenario B
Clearly deficient. Multiple blocking issues demonstrate the value of extraction and guided correction.

## Workstreams

### Pair 1: Supplier Flow
- Upload/start view
- Scenario picker
- Article draft form
- Blocking issues task list
- Link from issue to field
- Completion flow

### Pair 2: AI Extraction
- Local file loading
- Azure AI Foundry adapter
- Structured extraction
- Product copy generation
- Normalization into article draft

### Pair 3: Validation
- Intake quality rules
- Validation result generation
- Blocking issues and suggested fixes
- Readiness status
- Minimal internal status view

## Delivery Rule

`main` must remain demoable.
