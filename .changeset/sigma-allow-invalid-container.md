---
"@opencosmos/ui": patch
---

Fix KnowledgeGraph crash when sigma container has zero height on initial mount. Adds `allowInvalidContainer: true` to sigma settings so the graph initialises gracefully and renders once the container has dimensions, instead of throwing a hard error.
