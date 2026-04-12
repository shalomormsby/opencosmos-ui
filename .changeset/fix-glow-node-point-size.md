---
"@opencosmos/ui": patch
---

Fix KnowledgeGraph nodes not rendering (blank canvas with labels only).

Root cause: GlowNodeProgram vertex shader used `u_correctionRatio` (~1/viewportWidth ≈ 0.001) as a `gl_PointSize` multiplier, producing near-zero point sizes. Sigma's canvas2d label layer is independent of WebGL so labels appeared normally, making the bug non-obvious.

Fix: switch to `u_sizeRatio` + `u_pixelRatio` (matching sigma's built-in NodePointProgram), with formula `(a_size + 2.0) / u_sizeRatio * u_pixelRatio * 2.0`.

Also scopes `tsconfig.test.json` to only test files (previously including all of `src/**/*` caused VS Code to show false positives on the main tsconfig).
