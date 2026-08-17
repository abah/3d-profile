# 3D Profile Website - Yoyo Budianto

A modern, interactive 3D profile website built with Three.js and HTML/CSS. This website showcases the professional profile of Yoyo Budianto with stunning 3D effects and interactive elements.

## Live Demo

Visit the live website: [https://abah.github.io/3d-profile](https://abah.github.io/3d-profile)

### HUT RI ke-81 — Indonesia 81: Perjalanan Nusantara

**Buka langsung (live):**

| Platform | URL |
|----------|-----|
| Cloudflare Tunnel | [https://font-northeast-creator-holders.trycloudflare.com/hutri81](https://font-northeast-creator-holders.trycloudflare.com/hutri81) |
| Vercel (temp ~1 jam) | [https://temporary-agile-valley-j4arsrm.vercel.app/hutri81.html](https://temporary-agile-valley-j4arsrm.vercel.app/hutri81.html) |
| Localtunnel | [https://tall-bats-swim.loca.lt/hutri81](https://tall-bats-swim.loca.lt/hutri81) |

> URL permanen Cloudflare Pages (`indonesia-81.pages.dev`) aktif setelah repo di-connect di dashboard CF (sama seperti nyala). Lihat `CLOUDFLARE.md`.

Fitur Tier 1:
- **3D Timeline Nusantara** — perjalanan kemerdekaan 1945–2026 (HUT RI ke-81 = 17 Agustus 2026) di peta bumi interaktif
- **Kembang Merdeka** — kembang api 3D, nyala 38 provinsi, kartu momen patriotisme
- **Dashboard Patriotisme** — statistik live, heatmap 38 provinsi, kirim ucapan Dirgahayu

## Features

- Interactive 3D Earth that users can rotate to discover information
- Glowing markers that highlight information points
- Profile content fragments placed on the surface of the Earth
- Detailed information modal that appears when fragments are clicked or tapped
- Explosion effects when hovering over or clicking on information fragments
- Automatic rotation to center selected information when clicked
- Responsive design that works on desktop and mobile devices
- Modern UI with smooth animations and transitions

## Technologies Used

- **Three.js** - JavaScript 3D library for creating and displaying animated 3D computer graphics
- **HTML5** - Structure and content
- **CSS3** - Styling and animations
- **JavaScript** - Interactivity and 3D effects

## Special Effects

- **Interactive Earth**: A realistic 3D Earth with cloud layers that users can rotate to discover information
- **Glowing Markers**: Subtle pulsing markers that indicate where information is located
- **Surface Information Fragments**: Profile content is broken into fragments and placed on the Earth's surface
- **Detailed Information Modal**: Clicking on a fragment displays a modal with the complete information
- **Automatic Navigation**: Clicking on a fragment automatically rotates the Earth to center that information
- **Explosion Effects**: Interactive particle explosions occur when hovering over or clicking fragments
- **Dynamic Lighting**: Explosion effects include temporary light sources that illuminate the scene

## User Interaction

- **Drag to Rotate**: Click and drag to rotate the Earth and discover information fragments
- **Hover Effects**: Hover over fragments to see them highlight with a small explosion effect
- **Click to Read**: Click on a fragment to display a modal with the complete information
- **Mobile Support**: Touch and drag to rotate on mobile devices, tap on fragments to read content

## Getting Started

1. Clone this repository
   ```
   git clone https://github.com/abah/3d-profile.git
   ```
2. Open `index.html` in your web browser
3. Alternatively, deploy to any web server

## Browser Compatibility

This website works best in modern browsers that support WebGL:
- Chrome
- Firefox
- Safari
- Edge

## Project Structure

```
├── index.html          # Main HTML file
├── css/
│   └── style.css       # CSS styles
├── js/
│   └── main.js         # JavaScript with Three.js implementation
└── README.md           # This file
```

## Deployment

Website ini di-host di **GitHub Pages**: https://abah.github.io/3d-profile

### Aktifkan GitHub Pages (wajib — sekali saja)

Jika muncul **Error 404**, GitHub Pages belum diaktifkan. Ikuti langkah berikut:

1. Buka **https://github.com/abah/3d-profile/settings/pages**
2. Di **Build and deployment** → **Source**, pilih salah satu:

   **Opsi A — Paling mudah (disarankan)**
   - Source: **Deploy from a branch**
   - Branch: **`master`** → folder **`/ (root)`**
   - Klik **Save**

   **Opsi B — GitHub Actions**
   - Source: **GitHub Actions**
   - Setelah disimpan, buka tab **Actions** → jalankan workflow **Deploy to GitHub Pages**

3. Tunggu 1–3 menit, lalu buka https://abah.github.io/3d-profile
4. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) atau `Cmd+Shift+R` (Mac)

### Update otomatis

Setelah Pages aktif, setiap push ke branch **`master`** akan otomatis ter-deploy (via GitHub Actions workflow).

## Cloudflare Pages

Deploy via **Cloudflare Git Integration** (sama seperti `live-give-away` → nyala-7n7.pages.dev).

- URL: **https://indonesia-81.pages.dev/hutri81**
- Lihat `CLOUDFLARE.md` untuk config build

## Credits

- Three.js - https://threejs.org/
- Earth textures from Three.js examples
- Font Awesome - https://fontawesome.com/
- Google Fonts - https://fonts.google.com/

## License

MIT License 