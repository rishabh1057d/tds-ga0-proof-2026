# TDS GA0 GitHub artifacts

This repository contains the requested email JSON and a GitHub Actions workflow
whose verification step includes the student email address.

To serve the artifact locally:

```sh
docker compose up
```

Open http://127.0.0.1:8001/email.json. The workflow validates the JSON on pushes
and can also be triggered manually. Assignment changes are made on a feature
branch and reviewed through a pull request.
