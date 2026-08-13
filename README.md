# 3D Profile Website - Yoyo Budianto

A modern, interactive 3D profile website built with Three.js and HTML/CSS. This website showcases the professional profile of Yoyo Budianto with stunning 3D effects and interactive elements.

## Live Demo

Visit the live website: [https://abah.github.io/3d-profile](https://abah.github.io/3d-profile)

## Features

- **3D Car Visualizer** (`visualizer.html`) — interactive showroom inspired by classic Three.js car configurators: orbit the car, switch original models, change paint, and swap rims
- Interactive 3D Earth that users can rotate to discover information
- Glowing markers that highlight information points
- Profile content fragments placed on the surface of the Earth
- Detailed information modal that appears when fragments are clicked or tapped
- Explosion effects when hovering over or clicking on information fragments
- Automatic rotation to center selected information when clicked
- Responsive design that works on desktop and mobile devices
- Modern UI with smooth animations and transitions

## Car Visualizer

Open `visualizer.html` (or from the profile, use **Car Visualizer**). This is an original showroom, not a copy of commercial car brands:

- Six original models (Aero GT, Veloce, Strada, Cima, Pulsar, Nocturne)
- Metallic paint and rim color picker
- Five rim styles
- Auto / free orbit camera, drag to rotate, scroll to zoom
- Studio lighting with reflective floor

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
├── wrangler.toml           # Cloudflare Workers static assets
├── 404.html                # Cloudflare not-found page
├── index.html              # 3D profile (Earth)
├── visualizer.html         # 3D car showroom
├── css/
│   ├── style.css           # Profile styles
│   └── visualizer.css      # Showroom UI
├── js/
│   ├── main.js             # Earth scene
│   ├── visualizer.js       # Showroom scene, lighting, controls
│   └── cars.js             # Procedural original car models
└── README.md
```

## Deployment

### Cloudflare (disarankan)

Situs ini bisa di-deploy ke **Cloudflare Workers** (static assets).

**Opsi A — Klaim deploy preview**

Agent bisa men-deploy preview sementara. Buka **Claim URL** yang dicetak Wrangler, login ke Cloudflare, lalu akun preview jadi permanen di `*.workers.dev`.

**Opsi B — GitHub Actions (otomatis dari `master`)**

1. Buat token di [Cloudflare API tokens](https://dash.cloudflare.com/profile/api-tokens) dengan template **Edit Cloudflare Workers**
2. Di repo GitHub: **Settings → Secrets and variables → Actions**, tambahkan:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID` (dari sidebar kanan di dashboard Cloudflare)
3. Push ke `master`, atau jalankan workflow **Deploy to Cloudflare**
4. URL produksi: `https://3d-profile.<subdomain-akun>.workers.dev`

Deploy lokal:

```
npx wrangler@latest deploy
```

### GitHub Pages

Masih tersedia di **https://abah.github.io/3d-profile**

Jika muncul **Error 404**, GitHub Pages belum diaktifkan:

1. Buka **https://github.com/abah/3d-profile/settings/pages**
2. Di **Build and deployment** → **Source**, pilih **GitHub Actions** (atau branch `master` / root)
3. Tunggu 1–3 menit, lalu hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`

## Credits

- Three.js - https://threejs.org/
- Earth textures from Three.js examples
- Font Awesome - https://fontawesome.com/
- Google Fonts - https://fonts.google.com/

## License

MIT License 