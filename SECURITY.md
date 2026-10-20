# Security

Never commit real credentials, private specifications, personal data or environment files. The gitignore reduces accidents; it is not a secret scanner. Repository owners should enable available GitHub secret scanning and push protection under their existing plan without adding paid products automatically.

The CLI reads bounded local documents and validates paths. It does not run spec commands, download dependencies, use model APIs or upload repository contents. It is not a sandbox for an actively changing, hostile filesystem and does not provide a complete secret-detection or policy-enforcement system.

For a suspected vulnerability, use GitHub private vulnerability reporting if available, or contact the maintainer privately through the profile contact channel. Do not put credential values or exploit data containing private information in public issues. Ordinary reproducible bugs can be filed with synthetic input.
