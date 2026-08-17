/**
 * Data HUT RI 81 — 81 milestone kemerdekaan (1945–2025)
 */
const HUTRI81_PROVINCES = [
    { id: 'aceh', name: 'Aceh', lat: 4.7, lon: 96.7 },
    { id: 'sumut', name: 'Sumatera Utara', lat: 2.1, lon: 99.5 },
    { id: 'sumbar', name: 'Sumatera Barat', lat: -0.9, lon: 100.4 },
    { id: 'riau', name: 'Riau', lat: 0.5, lon: 101.4 },
    { id: 'kepri', name: 'Kepulauan Riau', lat: 0.9, lon: 104.5 },
    { id: 'jambi', name: 'Jambi', lat: -1.6, lon: 103.6 },
    { id: 'sumsel', name: 'Sumatera Selatan', lat: -3.3, lon: 104.0 },
    { id: 'bengkulu', name: 'Bengkulu', lat: -3.8, lon: 102.3 },
    { id: 'lampung', name: 'Lampung', lat: -4.9, lon: 105.3 },
    { id: 'banten', name: 'Banten', lat: -6.4, lon: 106.1 },
    { id: 'jakarta', name: 'DKI Jakarta', lat: -6.2, lon: 106.8 },
    { id: 'jabar', name: 'Jawa Barat', lat: -6.9, lon: 107.6 },
    { id: 'jateng', name: 'Jawa Tengah', lat: -7.0, lon: 110.4 },
    { id: 'yogya', name: 'DI Yogyakarta', lat: -7.8, lon: 110.4 },
    { id: 'jatim', name: 'Jawa Timur', lat: -7.5, lon: 112.5 },
    { id: 'bali', name: 'Bali', lat: -8.4, lon: 115.1 },
    { id: 'ntb', name: 'Nusa Tenggara Barat', lat: -8.6, lon: 116.1 },
    { id: 'ntt', name: 'Nusa Tenggara Timur', lat: -8.7, lon: 121.0 },
    { id: 'kalbar', name: 'Kalimantan Barat', lat: -0.1, lon: 109.3 },
    { id: 'kalteng', name: 'Kalimantan Tengah', lat: -1.8, lon: 113.9 },
    { id: 'kalsel', name: 'Kalimantan Selatan', lat: -3.3, lon: 114.6 },
    { id: 'kaltim', name: 'Kalimantan Timur', lat: 0.5, lon: 117.1 },
    { id: 'kaltara', name: 'Kalimantan Utara', lat: 3.1, lon: 117.6 },
    { id: 'sulut', name: 'Sulawesi Utara', lat: 1.5, lon: 124.8 },
    { id: 'sulteng', name: 'Sulawesi Tengah', lat: -1.0, lon: 120.0 },
    { id: 'sulsel', name: 'Sulawesi Selatan', lat: -3.7, lon: 119.9 },
    { id: 'sultra', name: 'Sulawesi Tenggara', lat: -4.0, lon: 122.5 },
    { id: 'gorontalo', name: 'Gorontalo', lat: 0.5, lon: 123.1 },
    { id: 'sulbar', name: 'Sulawesi Barat', lat: -2.7, lon: 119.0 },
    { id: 'maluku', name: 'Maluku', lat: -3.2, lon: 130.5 },
    { id: 'malut', name: 'Maluku Utara', lat: 0.8, lon: 127.4 },
    { id: 'papuabarat', name: 'Papua Barat', lat: -1.3, lon: 133.2 },
    { id: 'papua', name: 'Papua', lat: -4.3, lon: 138.0 },
    { id: 'papuatengah', name: 'Papua Tengah', lat: -3.7, lon: 136.4 },
    { id: 'papuapegunungan', name: 'Papua Pegunungan', lat: -4.0, lon: 139.0 },
    { id: 'papuaselatan', name: 'Papua Selatan', lat: -6.1, lon: 140.7 },
    { id: 'papuabaratdaya', name: 'Papua Barat Daya', lat: -1.9, lon: 132.5 },
    { id: 'bangka', name: 'Bangka Belitung', lat: -2.1, lon: 106.1 }
];

const HUTRI81_KEY_EVENTS = {
    1945: {
        title: 'Proklamasi Kemerdekaan',
        category: 'sejarah',
        location: { lat: -6.1751, lon: 106.8272, place: 'Jakarta' },
        description: 'Soekarno-Hatta memproklamasikan kemerdekaan Indonesia di Jalan Pegangsaan Timur 56, Jakarta.'
    },
    1946: {
        title: 'Sidang BPUPKI Pertama',
        category: 'sejarah',
        location: { lat: -6.1751, lon: 106.8272, place: 'Jakarta' },
        description: 'Pembentukan fondasi konstitusi dan ideologi bangsa melalui sidang-sidang BPUPKI.'
    },
    1949: {
        title: 'Konferensi Meja Bundar',
        category: 'sejarah',
        location: { lat: -6.1751, lon: 106.8272, place: 'Jakarta' },
        description: 'Pengakuan kedaulatan RI oleh Belanda melalui Konferensi Meja Bundar di Den Haag.'
    },
    1950: {
        title: 'Republik Indonesia Serikat',
        category: 'politik',
        location: { lat: -6.1751, lon: 106.8272, place: 'Jakarta' },
        description: 'Indonesia resmi menjadi Republik Indonesia Serikat (RIS) sebelum kembali ke NKRI.'
    },
    1955: {
        title: 'Konferensi Asia-Afrika',
        category: 'diplomasi',
        location: { lat: -6.9, lon: 107.6, place: 'Bandung' },
        description: 'Bandung menjadi pusat diplomasi dunia dengan Konferensi Asia-Afrika yang legendaris.'
    },
    1962: {
        title: 'Asian Games I di Jakarta',
        category: 'olahraga',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Indonesia pertama kali menjadi tuan rumah Asian Games, memperkenalkan Indonesia di panggung regional.'
    },
    1963: {
        title: 'Deklarasi Djuanda',
        category: 'maritim',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Indonesia menegaskan kedaulatan atas perairan sekitar kepulauan — cikal bakal konsep Wawasan Nusantara.'
    },
    1965: {
        title: 'Supersemar & Transisi Orde Baru',
        category: 'politik',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Titik balik politik nasional yang mengarah pada Orde Baru.'
    },
    1971: {
        title: 'Pelita I Dimulai',
        category: 'ekonomi',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Program Pembangunan Lima Tahun (Pelita) I meluncurkan era industrialisasi terencana.'
    },
    1975: {
        title: 'Pertamina & Migas Nasional',
        category: 'energi',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Penguatan sektor energi nasional melalui Pertamina sebagai BUMN strategis.'
    },
    1978: {
        title: 'Operasi Jayawijaya',
        category: 'persatuan',
        location: { lat: -4.3, lon: 138.0, place: 'Papua' },
        description: 'Integrasi Irian Jaya ke dalam NKRI, melengkapi cita-cita nusantara.'
    },
    1984: {
        title: 'Swasembada Pangan',
        category: 'pertanian',
        location: { lat: -6.9, lon: 107.6, place: 'Jawa Barat' },
        description: 'Indonesia mencapai swasembada beras — prestasi pertanian yang diakui dunia.'
    },
    1990: {
        title: 'Era Globalisasi Ekonomi',
        category: 'ekonomi',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Indonesia terbuka terhadap investasi asing dan integrasi pasar global.'
    },
    1998: {
        title: 'Reformasi Demokrasi',
        category: 'politik',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Transisi ke era reformasi: demokratisasi, kebebasan pers, dan desentralisasi.'
    },
    2000: {
        title: 'Otonomi Daerah',
        category: 'pemerintahan',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Undang-Undang Otonomi Daerah memberi ruang lebih besar bagi pemerintahan provinsi dan kabupaten.'
    },
    2004: {
        title: 'Pemilu Langsung Presiden',
        category: 'demokrasi',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Presiden pertama terpilih langsung oleh rakyat — tonggak demokrasi modern Indonesia.'
    },
    2008: {
        title: 'UU Informasi & Transaksi Elektronik',
        category: 'teknologi',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Landsan hukum digital commerce dan tanda tangan elektronik di Indonesia.'
    },
    2010: {
        title: 'Boom Startup Digital',
        category: 'teknologi',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Ekosistem startup Indonesia mulai berkembang pesat — Go-Jek, Tokopedia, dan lainnya.'
    },
    2014: {
        title: 'Program Nawa Cita',
        category: 'pemerintahan',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Agenda prioritas nasional untuk pembangunan dan reformasi birokrasi.'
    },
    2016: {
        title: 'Palapa Ring Dimulai',
        category: 'infrastruktur',
        location: { lat: -2.5, lon: 118.0, place: 'Nusantara' },
        description: 'Proyek kabel optik bawah laut menghubungkan seluruh pelosok Indonesia ke internet cepat.'
    },
    2019: {
        title: 'IKN Diumumkan',
        category: 'infrastruktur',
        location: { lat: -0.5, lon: 117.0, place: 'Kalimantan Timur' },
        description: 'Ibu Kota Nusantara (IKN) di Kalimantan Timur diumumkan sebagai visi Indonesia maju.'
    },
    2020: {
        title: 'Transformasi Digital Massal',
        category: 'teknologi',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Pandemi mempercepat adopsi digital: e-commerce, telemedicine, dan belajar online.'
    },
    2022: {
        title: 'Presidensi G20 Indonesia',
        category: 'diplomasi',
        location: { lat: -8.5, lon: 115.3, place: 'Bali' },
        description: 'Indonesia memimpin G20 — Bali menjadi panggung diplomasi global.'
    },
    2024: {
        title: 'Pemilu Serentak Terbesar',
        category: 'demokrasi',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Pemilu serentak presiden, DPR, DPD, dan DPRD — demokrasi skala masif.'
    },
    2025: {
        title: 'Menuju Indonesia Emas 2045',
        category: 'visi',
        location: { lat: -6.2, lon: 106.8, place: 'Jakarta' },
        description: 'Persiapan menuju 100 tahun kemerdekaan dengan fokus ekonomi digital dan SDM unggul.'
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
    for (let year = 1945; year <= 2025; year++) {
        const tahunKe = year - 1944;
        const keyEvent = HUTRI81_KEY_EVENTS[year];
        if (keyEvent) {
            milestones.push({
                year,
                tahunKe,
                title: keyEvent.title,
                category: keyEvent.category,
                description: keyEvent.description,
                lat: keyEvent.location.lat,
                lon: keyEvent.location.lon,
                place: keyEvent.location.place
            });
        } else {
            const province = HUTRI81_PROVINCES[(year - 1945) % HUTRI81_PROVINCES.length];
            milestones.push({
                year,
                tahunKe,
                title: `HUT ke-${tahunKe}: ${province.name}`,
                category: 'default',
                description: `Memperingati ${tahunKe} tahun kemerdekaan Indonesia. Semangat persatuan dan gotong royong dari ${province.name} ikut membangun bangsa.`,
                lat: province.lat,
                lon: province.lon,
                place: province.name
            });
        }
    }
    return milestones;
}

const HUTRI81_MILESTONES = generateHutri81Milestones();

/** Knowledge base untuk Merdeka Talk (fallback tanpa API) */
const MERDEKA_TALK_KB = [
    {
        keywords: ['proklamasi', '17 agustus', '1945', 'soekarno', 'hatta'],
        answer: 'Proklamasi Kemerdekaan Indonesia dibaca pada 17 Agustus 1945 oleh Ir. Soekarno dan Drs. Mohammad Hatta di Jalan Pegangsaan Timur 56, Jakarta. Inilah momen kelahiran Republik Indonesia.'
    },
    {
        keywords: ['pancasila', 'sila'],
        answer: 'Pancasila adalah ideologi negara Indonesia yang terdiri dari lima sila: Ketuhanan Yang Maha Esa, Kemanusiaan yang Adil dan Beradab, Persatuan Indonesia, Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan, dan Keadilan Sosial bagi Seluruh Rakyat Indonesia.'
    },
    {
        keywords: ['bendera', 'merah putih', 'sang saka'],
        answer: 'Bendera Merah-Putih (Sang Saka Merah Putih) dijadikan bendera nasional berdasarkan UU No. 24 Tahun 2009. Merah melambangkan keberanian, putih melambangkan kesucian.'
    },
    {
        keywords: ['garuda', 'lambang', 'pancasila burung'],
        answer: 'Garuda Pancasila adalah lambang negara Indonesia. Burung Garuda melambangkan kekuatan, dengan pita bertuliskan "Bhinneka Tunggal Ika" — berbeda-beda tetapi tetap satu jua.'
    },
    {
        keywords: ['bhinneka', 'tunggal ika', 'keberagaman', 'nusantara'],
        answer: '"Bhinneka Tunggal Ika" berarti berbeda-beda tetapi tetap satu. Indonesia terdiri dari 17.000+ pulau, 700+ bahasa daerah, dan 1.300+ suku bangsa — keberagaman ini adalah kekuatan kita.'
    },
    {
        keywords: ['ibu kota', 'jakarta', 'ikn', 'nusantara'],
        answer: 'Ibu kota Indonesia saat ini Jakarta (DKI Jakarta). Ibu Kota Nusantara (IKN) sedang dibangun di Penajam Paser Utara, Kalimantan Timur, sebagai visi pemerataan pembangunan.'
    },
    {
        keywords: ['lagu kebangsaan', 'indonesia raya', 'wage rudolf'],
        answer: 'Lagu kebangsaan Indonesia adalah "Indonesia Raya", ciptaan Wage Rudolf Supratman, pertama kali diperdengarkan pada 28 Oktober 1928 di Kongres Pemuda II.'
    },
    {
        keywords: ['ucapan', 'selamat', 'hut', 'dirgahayu'],
        answer: 'Contoh ucapan HUT RI: "Dirgahayu Republik Indonesia ke-81! Semoga bangsa kita semakin maju, adil, dan sejahtera. Merdeka!" — Anda bisa personalisasi dengan nama instansi atau daerah Anda.'
    },
    {
        keywords: ['teknologi', 'digital', 'ai', 'startup'],
        answer: 'Indonesia punya ekosistem digital terbesar di ASEAN: GoTo, Traveloka, Tokopedia, dan ratusan startup. Palapa Ring, Satu Data, dan transformasi digital pemerintahan (SPBE) mendorong Indonesia menuju ekonomi digital.'
    },
    {
        keywords: ['trivia', 'quiz', 'pertanyaan'],
        answer: 'Trivia: Presiden pertama RI adalah Soekarno (1945–1967). Indonesia merdeka di usia Soekarno 44 tahun. Hari Kemerdekaan diperingati setiap 17 Agustus sejak 1945. Tahun 2026 = HUT ke-81.'
    }
];
