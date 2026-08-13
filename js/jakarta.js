const SKETCHFAB_EMBED =
    'https://sketchfab.com/models/54772817abe74df2a75672329db18146/embed'
    + '?autostart=1&preload=1&ui_theme=dark&ui_hint=0&ui_infos=0&dnt=1&camera=0';

const mapEl = document.getElementById('map');
const massingEl = document.getElementById('massing');
const creditSatelit = document.getElementById('credit-satelit');
const creditMassing = document.getElementById('credit-massing');

const map = new maplibregl.Map({
    container: mapEl,
    style: {
        version: 8,
        glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
        sources: {
            satellite: {
                type: 'raster',
                tiles: [
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                ],
                tileSize: 256,
                attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics'
            },
            openmaptiles: {
                type: 'vector',
                url: 'https://tiles.openfreemap.org/planet'
            }
        },
        layers: [
            { id: 'satelit', type: 'raster', source: 'satellite' },
            {
                id: 'building-3d',
                type: 'fill-extrusion',
                source: 'openmaptiles',
                'source-layer': 'building',
                minzoom: 14,
                paint: {
                    'fill-extrusion-color': [
                        'interpolate',
                        ['linear'],
                        ['coalesce', ['get', 'render_height'], 12],
                        0, '#c9b79a',
                        24, '#b7c0c8',
                        80, '#8ea4b8',
                        180, '#d8e4ee'
                    ],
                    'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 10],
                    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
                    'fill-extrusion-opacity': 0.92
                }
            },
            {
                id: 'place-city',
                type: 'symbol',
                source: 'openmaptiles',
                'source-layer': 'place',
                filter: ['==', 'class', 'city'],
                layout: {
                    'text-field': ['get', 'name'],
                    'text-font': ['Noto Sans Bold'],
                    'text-size': 14
                },
                paint: {
                    'text-color': '#f4f7fb',
                    'text-halo-color': '#05070c',
                    'text-halo-width': 1.4
                }
            }
        ]
    },
    center: [106.8272, -6.1754],
    zoom: 15.35,
    pitch: 62,
    bearing: 28,
    maxPitch: 80,
    minZoom: 11,
    maxZoom: 18,
    attributionControl: true
});

map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');

let autoSpin = true;
let massingLoaded = false;

map.on('dragstart', () => { autoSpin = false; });
map.on('pitchstart', () => { autoSpin = false; });
map.on('rotatestart', () => { autoSpin = false; });

map.on('load', () => {
    window.setInterval(() => {
        if (!autoSpin || mapEl.hidden) return;
        map.easeTo({
            bearing: map.getBearing() + 6,
            duration: 1800,
            easing: (t) => t
        });
    }, 1900);
});

function setMode(mode) {
    const satelit = mode === 'satelit';
    mapEl.hidden = !satelit;
    massingEl.hidden = satelit;
    creditSatelit.hidden = !satelit;
    creditMassing.hidden = satelit;
    document.getElementById('mode-satelit').classList.toggle('active', satelit);
    document.getElementById('mode-massing').classList.toggle('active', !satelit);
    if (satelit) {
        map.resize();
        autoSpin = true;
    } else if (!massingLoaded) {
        massingEl.src = SKETCHFAB_EMBED;
        massingLoaded = true;
    }
}

document.getElementById('mode-satelit').addEventListener('click', () => setMode('satelit'));
document.getElementById('mode-massing').addEventListener('click', () => setMode('massing'));
window.addEventListener('resize', () => {
    if (!mapEl.hidden) map.resize();
});
