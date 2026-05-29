---
"@relements/core": patch
---

Fix release workflow so npm Trusted Publishing OIDC takes over auth (the previous setup wrote a `.npmrc` with a placeholder token that npm tried to use, causing 404 on publish).
