# Admin Image Storage Setup

## Development

When `NODE_ENV` is not production, the default driver is `local`. Uploaded vehicle images are normalized to WebP below `public/uploads/vehicles/<vehicle-id>`. The directory is ignored by Git.

The server validates MIME type, extension, magic bytes, dimensions, file size, duplicate checksum, vehicle ownership and staff permission. Sharp rotates from metadata, removes sensitive metadata and generates:

- 320x220 thumbnail
- 720x480 card image
- 1600x1067 gallery image
- 1200x630 Open Graph image

Accepted public formats are JPEG, PNG, WebP and AVIF. The limit is 12 MB, minimum dimensions are 640x400 and each vehicle is limited to 40 images. `DOCUMENT` is not accepted by the public image endpoint and is excluded from public galleries.

## Production S3-compatible storage

Set:

```text
IMAGE_STORAGE_DRIVER=s3
S3_BUCKET=deccan-wheels-images
S3_ENDPOINT=https://your-s3-compatible-endpoint
S3_REGION=your-region
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_BASE_URL=https://cdn.example.com
S3_FORCE_PATH_STYLE=false
```

Use `S3_FORCE_PATH_STYLE=true` only for providers such as MinIO that require it. The bucket/CDN must expose only intended public image objects. Keep credentials in deployment secrets, never site settings or source control.

Production fails closed when the driver or required S3 values are missing. It never silently falls back to local disk.

For an optimized local preview or E2E run only, local storage can be selected explicitly with `IMAGE_STORAGE_DRIVER=local` and `ALLOW_LOCAL_IMAGE_STORAGE=true`. Never set `ALLOW_LOCAL_IMAGE_STORAGE` in a deployed environment; without that explicit preview switch, production continues to fail closed.

## Ownership and deletion

Keys are scoped to `vehicles/<vehicle-id>/`. The adapter rejects traversal and cross-vehicle keys. Deleting an image removes its generated variants; deleting the primary image promotes the next ordered image when available.
