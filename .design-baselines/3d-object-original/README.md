# 3D object — "original" baseline (الأساسي)

Exact copy of `frontend/src/components/stage/` saved on 2026-10-11, before the
3D object restyle. This is the version the owner calls "the original".

Restore exactly:

```bash
rm -rf frontend/src/components/stage
cp -r .design-baselines/3d-object-original/stage frontend/src/components/stage
docker compose up -d --build frontend
```

Confirm the restore is byte-identical (from the repo root):

```bash
sha256sum -c .design-baselines/3d-object-original/CHECKSUMS.txt
```
