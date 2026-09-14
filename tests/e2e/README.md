# Trio Elétrico - E2E Tests

This document provides instructions for running the End-to-End (E2E) tests for the Trio Elétrico website using Playwright.

## Project Setup

Ensure you have Node.js installed. Then, navigate to the project's workspace and install dependencies:

\`\`\`bash
cd /home/roger/.hermes/profiles/coder/workspace/trio-eletrico
npm install
\`\`\`

## Running the Tests

The tests are configured to run specifically for the 'site-e2e' project.

### All Tests (List Reporter)

To run all tests with the list reporter (useful for CI or automated runs):

\`\`\`bash
npx playwright test --reporter=list --project=site-e2e
\`\`\`

### Headed Mode (for Visual Inspection)

To run the tests with a browser window open, allowing for visual inspection:

\`\`\`bash
npx playwright test --headed --project=site-e2e
\`\`\`

### Specific Test Files

To run a specific test file (e.g., \`site.spec.js\`):

\`\`\`bash
npx playwright test tests/e2e/site.spec.js --project=site-e2e
\`\`\`

## Test Execution Results

### Last Execution Summary

*   **Date**: 2026-06-28 (Estimated based on current run)
*   **Total Tests Run**: 16 (17 defined, 1 skipped)
*   **Passed**: 16
*   **Failed**: 0
*   **Skipped**: 1 ('Smooth scroll has adequate offset for fixed navbar')
*   **Total Time**: [N/A - Not precisely logged by 'list' reporter to console]

*Note: For detailed results, including timing and specific error logs for any found issues, refer to the HTML report generated in the \`playwright-report/\` directory.*

## Screenshots and Reports

*   **Playwright HTML Report**: Generated in the \`playwright-report/\` directory after a run with \`--reporter=html\`.
*   **Test Screenshots**: Captured failures and visual regression images are stored in \`test-results/screenshots/\` (if any failures occurred).

## Test Suites

The tests are categorized into the following suites:
-   Navigation
-   Sections
-   FAQ
-   Contact Form
-   Dark Mode
-   Images
-   Performance
-   Visual
-   Extra Workflows (includes a skipped test)
