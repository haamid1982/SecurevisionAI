# Upload-package verification — 25 September 2026

The prepared upload copy was checked using Node.js v24.19.0 on Windows.

- A clean dependency installation from `package-lock.json` completed with `npm ci --ignore-scripts --no-audit --no-fund`, using a workspace-local npm cache. Dependency lifecycle scripts were disabled for this installation.
- `npm run check` completed its test suite and production build: **28 passed, 0 failed**, followed by a successful Vite production build.
- Vite reported a JavaScript chunk larger than 500 kB and a CSS plugin timing warning. Neither prevented the build. Bundle optimisation remains future work.
- The new run is recorded in [packaging-check.txt](packaging-check.txt).
- Quotation and service-report PDF functions produced PDF files from synthetic inputs using `PDF_PYTHON_BIN` pointing to the verification interpreter. This checked process launch and basic PDF output, not visual layout or every document variation.
- [C10_Automated_Tests_24_Passed.png](C10_Automated_Tests_24_Passed.png) is an unchanged **historical** screenshot recording 24 passing tests. It is distinct from this later 28-test packaging check.

These are automated regression and build results. No fresh end-to-end Firebase login, PostgreSQL migration/integration, email-delivery or external-model run was performed for packaging. Existing evidence and the submitted report should be read with their original scope and limitations.

The upload excludes the local environment file, credentials, dependencies, build output, temporary files, database records and Git history. A targeted scan of the prepared text files for common secret formats and copied local credential values was performed; this is not a full security audit or a guarantee that the application is production-ready.
