/**
 * Data HUT RI 81
 * Proklamasi 17 Agustus 1945 · HUT RI ke-81 = 17 Agustus 2026
 * Rumus: HUT RI ke-N = N, dirayakan pada tahun (1945 + N)
 */
const HUTRI81_PROCLAMATION_YEAR = 1945;
const HUTRI81_ANNIVERSARY_YEAR = 2026;
const HUTRI81_ANNIVERSARY_NUMBER = 81;

/** Nomor HUT RI untuk tahun kalender (2026 → 81). 1945 → 0 (proklamasi). */
function getHutNumber(year) {
    return year - HUTRI81_PROCLAMATION_YEAR;
}

function formatHutLabel(year) {
    if (year === HUTRI81_PROCLAMATION_YEAR) return 'Tahun Proklamasi';
    return `HUT RI ke-${getHutNumber(year)}`;
}
const HUTRI81_PROVINCES = [
    { id: 'aceh', name: 'Aceh', lat: 5.5483, lon: 95.3238 },
    { id: 'sumut', name: 'Sumatera Utara', lat: 3.5952, lon: 98.6722 },
    { id: 'sumbar', name: 'Sumatera Barat', lat: -0.9471, lon: 100.4172 },
    { id: 'riau', name: 'Riau', lat: 0.5071, lon: 101.4478 },
    { id: 'kepri', name: 'Kepulauan Riau', lat: 0.9186, lon: 104.4663 },
    { id: 'jambi', name: 'Jambi', lat: -1.6101, lon: 103.6131 },
    { id: 'sumsel', name: 'Sumatera Selatan', lat: -2.9909, lon: 104.7566 },
    { id: 'bengkulu', name: 'Bengkulu', lat: -3.7928, lon: 102.2608 },
    { id: 'lampung', name: 'Lampung', lat: -5.4292, lon: 105.2611 },
    { id: 'banten', name: 'Banten', lat: -6.1200, lon: 106.1500 },
    { id: 'jakarta', name: 'DKI Jakarta', lat: -6.2088, lon: 106.8456 },
    { id: 'jabar', name: 'Jawa Barat', lat: -6.9175, lon: 107.6191 },
    { id: 'jateng', name: 'Jawa Tengah', lat: -6.9667, lon: 110.4167 },
    { id: 'yogya', name: 'DI Yogyakarta', lat: -7.7956, lon: 110.3695 },
    { id: 'jatim', name: 'Jawa Timur', lat: -7.2575, lon: 112.7521 },
    { id: 'bali', name: 'Bali', lat: -8.6705, lon: 115.2126 },
    { id: 'ntb', name: 'Nusa Tenggara Barat', lat: -8.5833, lon: 116.1167 },
    { id: 'ntt', name: 'Nusa Tenggara Timur', lat: -10.1772, lon: 123.6070 },
    { id: 'kalbar', name: 'Kalimantan Barat', lat: -0.0263, lon: 109.3425 },
    { id: 'kalteng', name: 'Kalimantan Tengah', lat: -2.2100, lon: 113.9200 },
    { id: 'kalsel', name: 'Kalimantan Selatan', lat: -3.3186, lon: 114.5944 },
    { id: 'kaltim', name: 'Kalimantan Timur', lat: -0.5022, lon: 117.1536 },
    { id: 'kaltara', name: 'Kalimantan Utara', lat: 3.0731, lon: 116.0414 },
    { id: 'sulut', name: 'Sulawesi Utara', lat: 1.4748, lon: 124.8421 },
    { id: 'sulteng', name: 'Sulawesi Tengah', lat: -0.8986, lon: 119.8707 },
    { id: 'sulsel', name: 'Sulawesi Selatan', lat: -5.1477, lon: 119.4327 },
    { id: 'sultra', name: 'Sulawesi Tenggara', lat: -3.9770, lon: 122.5150 },
    { id: 'gorontalo', name: 'Gorontalo', lat: 0.5435, lon: 123.0585 },
    { id: 'sulbar', name: 'Sulawesi Barat', lat: -2.8441, lon: 119.2321 },
    { id: 'maluku', name: 'Maluku', lat: -3.6954, lon: 128.1814 },
    { id: 'malut', name: 'Maluku Utara', lat: 0.7829, lon: 127.3614 },
    { id: 'papuabarat', name: 'Papua Barat', lat: -0.8667, lon: 134.0833 },
    { id: 'papua', name: 'Papua', lat: -2.5489, lon: 140.7181 },
    { id: 'papuatengah', name: 'Papua Tengah', lat: -3.3687, lon: 135.4971 },
    { id: 'papuapegunungan', name: 'Papua Pegunungan', lat: -4.0833, lon: 138.9500 },
    { id: 'papuaselatan', name: 'Papua Selatan', lat: -7.9833, lon: 131.3000 },
    { id: 'papuabaratdaya', name: 'Papua Barat Daya', lat: -1.8500, lon: 133.2500 },
    { id: 'bangka', name: 'Bangka Belitung', lat: -2.1316, lon: 106.1166 }
];

/** Wilayah klasik (27 provinsi era NKRI) — dipakai untuk milestone tahun tanpa peristiwa kunci */
const HUTRI81_CLASSIC_REGIONS = [
    { name: 'Aceh', lat: 5.5483, lon: 95.3238 },
    { name: 'Sumatera Utara', lat: 3.5952, lon: 98.6722 },
    { name: 'Sumatera Barat', lat: -0.9471, lon: 100.4172 },
    { name: 'Riau', lat: 0.5071, lon: 101.4478 },
    { name: 'Jambi', lat: -1.6101, lon: 103.6131 },
    { name: 'Sumatera Selatan', lat: -2.9909, lon: 104.7566 },
    { name: 'Bengkulu', lat: -3.7928, lon: 102.2608 },
    { name: 'Lampung', lat: -5.4292, lon: 105.2611 },
    { name: 'DKI Jakarta', lat: -6.2088, lon: 106.8456 },
    { name: 'Jawa Barat', lat: -6.9175, lon: 107.6191 },
    { name: 'Jawa Tengah', lat: -6.9667, lon: 110.4167 },
    { name: 'DI Yogyakarta', lat: -7.7956, lon: 110.3695 },
    { name: 'Jawa Timur', lat: -7.2575, lon: 112.7521 },
    { name: 'Bali', lat: -8.6705, lon: 115.2126 },
    { name: 'Nusa Tenggara Barat', lat: -8.5833, lon: 116.1167 },
    { name: 'Nusa Tenggara Timur', lat: -10.1772, lon: 123.6070 },
    { name: 'Kalimantan Barat', lat: -0.0263, lon: 109.3425 },
    { name: 'Kalimantan Tengah', lat: -2.2100, lon: 113.9200 },
    { name: 'Kalimantan Selatan', lat: -3.3186, lon: 114.5944 },
    { name: 'Kalimantan Timur', lat: -0.5022, lon: 117.1536 },
    { name: 'Sulawesi Utara', lat: 1.4748, lon: 124.8421 },
    { name: 'Sulawesi Tengah', lat: -0.8986, lon: 119.8707 },
    { name: 'Sulawesi Selatan', lat: -5.1477, lon: 119.4327 },
    { name: 'Sulawesi Tenggara', lat: -3.9770, lon: 122.5150 },
    { name: 'Maluku', lat: -3.6954, lon: 128.1814 },
    { name: 'Papua', lat: -2.5489, lon: 140.7181 },
    { name: 'Bangka Belitung', lat: -2.1316, lon: 106.1166 }
];

const HUTRI81_KEY_EVENTS = {
    1945: {
        title: 'Proklamasi Kemerdekaan',
        category: 'sejarah',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta (Jl. Proklamasi)' },
        description: '17 Agustus 1945: Ir. Soekarno dan Drs. Mohammad Hatta memproklamasikan kemerdekaan Indonesia di Jalan Pegangsaan Timur 56 (kini Jl. Proklamasi), Jakarta.'
    },
    1946: {
        title: 'Perang Kemerdekaan',
        category: 'sejarah',
        location: { lat: -7.2575, lon: 112.7521, place: 'Surabaya, Jawa Timur' },
        description: 'Agresi militer Belanda I (1946–1947) dan perang rakyat semesta — termasuk Pertempuran Surabaya 10 November 1945 — mempertahankan kemerdekaan yang baru diproklamasikan.'
    },
    1948: {
        title: 'Agresi Militer Belanda II & PDRI',
        category: 'sejarah',
        location: { lat: -7.7956, lon: 110.3695, place: 'Yogyakarta' },
        description: 'Belanda melancarkan Agresi Militer II (19 Desember 1948). Soekarno-Hatta ditahan di Yogyakarta; Pemerintahan Darurat Republik Indonesia (PDRI) dipimpin Sjafruddin Prawiranegara di Sumatra.'
    },
    1949: {
        title: 'Konferensi Meja Bundar',
        category: 'diplomasi',
        location: { lat: -6.2088, lon: 106.8456, place: 'Den Haag, Belanda' },
        description: '23 Agustus–2 November 1949: Delegasi RI dan Belanda berunding di Den Haag. Belanda mengakui kedaulatan RI per 27 Desember 1949.'
    },
    1950: {
        title: 'Kembali ke NKRI',
        category: 'politik',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: '17 Agustus 1950: Republik Indonesia Serikat (RIS) dibubarkan. Indonesia kembali ke bentuk Negara Kesatuan Republik Indonesia (NKRI).'
    },
    1955: {
        title: 'Konferensi Asia-Afrika',
        category: 'diplomasi',
        location: { lat: -6.9175, lon: 107.6191, place: 'Bandung' },
        description: '18–24 April 1955: Bandung menjadi tuan rumah Konferensi Asia-Afrika. Dasasila Bandung melahirkan solidaritas negara berkembang dan gerakan Non-Blok.'
    },
    1957: {
        title: 'Deklarasi Djuanda',
        category: 'maritim',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: '1 Desember 1957: PM Djuanda Kartawidjaja menegaskan kedaulatan RI atas perairan di sekitar kepulauan — cikal bakal Wawasan Nusantara dan konsep archipelagic state.'
    },
    1962: {
        title: 'Asian Games I di Jakarta',
        category: 'olahraga',
        location: { lat: -6.2185, lon: 106.8028, place: 'Jakarta' },
        description: '24 Agustus–4 September 1962: Indonesia menjadi tuan rumah Asian Games perdana di Asia Tenggara, memperkenalkan bangsa di panggung olahraga regional.'
    },
    1963: {
        title: 'Penyerahan Irian Barat ke RI',
        category: 'persatuan',
        location: { lat: -2.5489, lon: 140.7181, place: 'Jayapura' },
        description: '1 Mei 1963: Otonom Wilayah Irian Barat diserahkan UNTEA kepada Indonesia. Irian Barat resmi menjadi bagian NKRI setelah Penentuan Pendapat Rakyat (Pepera) 1969.'
    },
    1965: {
        title: 'G30S/PKI',
        category: 'politik',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: '30 September–1 Oktober 1965: Gerakan 30 September mengguncang politik nasional dan menjadi titik balik sejarah Indonesia pasca-kemerdekaan.'
    },
    1966: {
        title: 'Supersemar & Orde Baru',
        category: 'politik',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: '11 Maret 1966: Soekarno menerbitkan Surat Perintah Sebelas Maret (Supersemar) kepada Soeharto, membuka bab transisi menuju Orde Baru.'
    },
    1968: {
        title: 'Proklamasi Orde Baru',
        category: 'politik',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: '28 Maret 1968: MPRS mengukuhan Soeharto sebagai presiden. Orde Baru resmi dimulai dengan fokus stabilitas dan pembangunan ekonomi.'
    },
    1971: {
        title: 'Pelita I Dimulai',
        category: 'ekonomi',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: '1969–1974: Rencana Pembangunan Lima Tahun (Repelita) I meluncur era industrialisasi dan pertumbuhan ekonomi terencana di Indonesia.'
    },
    1975: {
        title: 'Integrasi Timor Timur',
        category: 'persatuan',
        location: { lat: -8.5569, lon: 125.5603, place: 'Dili' },
        description: '7 Desember 1975: Operasi militer Indonesia di Timor Timur. Wilayah ini kemudian menjadi provinsi ke-27 (1976) hingga hasil referendum 1999.'
    },
    1984: {
        title: 'Swasembada Pangan',
        category: 'pertanian',
        location: { lat: -6.2088, lon: 106.8456, place: 'Nasional' },
        description: 'Indonesia mencapai swasembada beras — prestasi pertanian yang diakui dunia, berkat program intensifikasi dan insentif pertanian Orde Baru.'
    },
    1998: {
        title: 'Reformasi Demokrasi',
        category: 'politik',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: 'Mei 1998: Soeharto mundur setelah gelombang demonstrasi mahasiswa. Indonesia memasuki era reformasi: demokratisasi, kebebasan pers, dan desentralisasi.'
    },
    1999: {
        title: 'Pemilu Bebas Pertama',
        category: 'demokrasi',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: '7 Juni 1999: Pemilu legislatif multi-partai pertama pasca-reformasi. Partai Demokrasi Indonesia Perjuangan (PDI-P) meraih suara terbanyak.'
    },
    2000: {
        title: 'Otonomi Daerah',
        category: 'pemerintahan',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: 'UU No. 22/1999 dan UU No. 25/1999 memberi otonomi luas, keuangan, dan desentralisasi kepada pemerintah provinsi dan kabupaten/kota.'
    },
    2004: {
        title: 'Pemilu Langsung Presiden',
        category: 'demokrasi',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: '20 September & 20 Oktober 2004: Susilo Bambang Yudhoyono terpilih sebagai presiden pertama hasil pemilu langsung oleh rakyat Indonesia.'
    },
    2008: {
        title: 'UU Informasi & Transaksi Elektronik',
        category: 'teknologi',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: 'UU No. 11 Tahun 2008 tentang ITE menjadi landasan hukum transaksi elektronik, tanda tangan digital, dan keamanan siber di Indonesia.'
    },
    2010: {
        title: 'Era Startup Digital',
        category: 'teknologi',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: 'Go-Jek (2010) dan Tokopedia (2009) melambungkan gelombang startup Indonesia — awal ekosistem digital terbesar di Asia Tenggara.'
    },
    2014: {
        title: 'Program Nawa Cita',
        category: 'pemerintahan',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: 'Agenda prioritas nasional Jokowi-JK: 9 program (Nawa Cita) untuk reformasi birokrasi, infrastruktur, dan kesejahteraan rakyat.'
    },
    2016: {
        title: 'Palapa Ring Dimulai',
        category: 'infrastruktur',
        location: { lat: -6.2088, lon: 106.8456, place: 'Nasional (Jakarta)' },
        description: 'Proyek kabel optik bawah laut Palapa Ring menghubungkan 514 kabupaten/kota ke internet cepat — jaringan tulang punggung digital Nusantara.'
    },
    2019: {
        title: 'IKN Diumumkan',
        category: 'infrastruktur',
        location: { lat: -0.9383, lon: 116.7278, place: 'Penajam Paser Utara, Kaltim' },
        description: '26 Agustus 2019: Presiden Jokowi mengumumkan rencana Ibu Kota Negara (IKN) Nusantara di Penajam Paser Utara, Kalimantan Timur.'
    },
    2020: {
        title: 'Transformasi Digital Massal',
        category: 'teknologi',
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta' },
        description: 'Pandemi COVID-19 mempercepat adopsi digital: e-commerce, telemedicine, belajar online, dan layanan pemerintah elektronik (SPBE).'
    },
    2024: {
        title: 'Pemilu Serentak Terbesar',
        category: 'demokrasi',
        location: { lat: -6.2088, lon: 106.8456, place: 'Nasional' },
        description: '14 Februari 2024: Pemilu serentak presiden, DPR, DPD, dan DPRD — demokrasi skala masif di 204.807 TPS se-Indonesia.'
    },
    2026: {
        title: 'Dirgahayu HUT RI ke-81',
        category: 'visi',
        location: { lat: -6.2088, lon: 106.8456, place: 'Nasional' },
        description: '17 Agustus 2026 — HUT Republik Indonesia ke-81. Indonesia genap 81 tahun merdeka sejak Proklamasi 17 Agustus 1945.'
    }
};

const HUTRI81_CATEGORY_COLORS = {
    sejarah: 0xff3333,
    politik: 0xff6666,
    diplomasi: 0xffffff,
    ekonomi: 0xffaa00,
    teknologi: 0x00d4ff,
    infrastruktur: 0x2ecc71,
    demokrasi: 0x9b59ff,
    olahraga: 0xffdd57,
    maritim: 0x3498db,
    pertanian: 0x27ae60,
    energi: 0xe67e22,
    persatuan: 0xff6b9d,
    pemerintahan: 0x1abc9c,
    visi: 0xff3333,
    default: 0xff3333
};

const HUTRI81_CATEGORY_LABELS = {
    sejarah: 'Sejarah',
    politik: 'Politik',
    diplomasi: 'Diplomasi',
    ekonomi: 'Ekonomi',
    teknologi: 'Teknologi',
    infrastruktur: 'Infrastruktur',
    demokrasi: 'Demokrasi',
    olahraga: 'Olahraga',
    maritim: 'Maritim',
    pertanian: 'Pertanian',
    energi: 'Energi',
    persatuan: 'Persatuan',
    pemerintahan: 'Pemerintahan',
    visi: 'Visi',
    default: 'Nasional'
};

function generateHutri81Milestones() {
    const milestones = [];
    for (let year = HUTRI81_PROCLAMATION_YEAR; year <= HUTRI81_ANNIVERSARY_YEAR; year++) {
        const hutNumber = getHutNumber(year);
        const keyEvent = HUTRI81_KEY_EVENTS[year];
        if (keyEvent) {
            milestones.push({
                year,
                hutNumber,
                tahunKe: hutNumber,
                title: keyEvent.title,
                category: keyEvent.category,
                description: keyEvent.description,
                lat: keyEvent.location.lat,
                lon: keyEvent.location.lon,
                place: keyEvent.location.place
            });
        } else {
            const region = HUTRI81_CLASSIC_REGIONS[hutNumber % HUTRI81_CLASSIC_REGIONS.length];
            milestones.push({
                year,
                hutNumber,
                tahunKe: hutNumber,
                title: `${formatHutLabel(year)}: ${region.name}`,
                category: 'default',
                description: `Memperingati ${formatHutLabel(year)}. Semangat persatuan dan gotong royong dari ${region.name} ikut membangun bangsa.`,
                lat: region.lat,
                lon: region.lon,
                place: region.name
            });
        }
    }
    return milestones;
}

const HUTRI81_MILESTONES = generateHutri81Milestones();

/** Kartu momen untuk Rayakan Merdeka */
const CELEBRATION_MOMENTS = [
    { emoji: '🇮🇩', title: 'Proklamasi 1945', fact: '17 Agustus 1945 — Ir. Soekarno & Drs. Mohammad Hatta memproklamasikan kemerdekaan di Jl. Proklamasi, Jakarta.' },
    { emoji: '🌍', title: 'Bhinneka Tunggal Ika', fact: '17.000+ pulau, 700+ bahasa, 38 provinsi — satu bangsa, satu nasionalisme.' },
    { emoji: '🎌', title: 'Sang Saka Merah Putih', fact: 'Merah melambangkan keberanian, putih melambangkan kesucian — dikibarkan 17 Agustus setiap tahun.' },
    { emoji: '🦅', title: 'Garuda Pancasila', fact: 'Lambang negara dengan 17 bulu ekor, 8 bulu ekor, 19 ruas — melambangkan tanggal Proklamasi.' },
    { emoji: '🎵', title: 'Indonesia Raya', fact: 'Lagu kebangsaan ciptaan Wage Rudolf Supratman, diperdengarkan pertama kali 28 Oktober 1928.' },
    { emoji: '🏛️', title: 'Pancasila', fact: 'Ideologi negara: Ketuhanan, Kemanusiaan, Persatuan, Kerakyatan, Keadilan Sosial.' },
    { emoji: '⚓', title: 'Wawasan Nusantara', fact: 'Deklarasi Djuanda 1957 — Indonesia sebagai negara kepulauan (archipelagic state).' },
    { emoji: '🎆', title: 'HUT RI ke-81', fact: '17 Agustus 2026 — genap 81 tahun merdeka. Dirgahayu Republik Indonesia!' }
];
