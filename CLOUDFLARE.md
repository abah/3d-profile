# Deploy permanen — abah.me (Cloudflare)

Situs utama [abah.me](https://abah.me) adalah WordPress. App HUT RI 81 dipasang di **subdomain** agar tidak bentrok.

## URL permanen (target)

| URL | Keterangan |
|-----|------------|
| **https://hutri81.abah.me** | Subdomain khusus app (disarankan) |
| https://indonesia-81.pages.dev/hutri81 | Fallback Pages default |

---

## Setup sekali (±5 menit di Cloudflare Dashboard)

### 1. Connect repo ke Cloudflare Pages

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Pilih **Pages** → **Connect to Git**
3. Repo: `abah/3d-profile`
4. Pengaturan build:

| Setting | Value |
|---------|-------|
| Production branch | `master` |
| Build command | *(kosong)* |
| Build output directory | `/` |
| Project name | `indonesia-81` |

5. **Save and Deploy**

### 2. Custom domain abah.me

1. Pages → project **indonesia-81** → **Custom domains**
2. **Set up a domain** → ketik: `hutri81.abah.me`
3. Cloudflare otomatis buat record DNS (zone abah.me sudah di CF)

Selesai. Buka **https://hutri81.abah.me**

### 3. (Opsional) Redirect dari abah.me

Agar `abah.me/hutri81` mengarah ke subdomain:

1. **Rules** → **Redirect Rules** → Create rule
2. If: URI Path starts with `/hutri81`
3. Then: Dynamic redirect → `https://hutri81.abah.me`

---

## Deploy manual (jika punya API token)

```bash
export CLOUDFLARE_API_TOKEN=your_token
npm run deploy
# Live: https://indonesia-81.pages.dev/hutri81
```

Lalu tambahkan custom domain `hutri81.abah.me` di dashboard (langkah 2).

---

## Merge PR dulu

Pastikan PR [#8](https://github.com/abah/3d-profile/pull/8) sudah merge ke `master` sebelum deploy, agar versi terbaru (Kembang Merdeka, timeline fix, tanpa banner PWA) yang live.
