/**
 * Data HUT RI 81 — 81 milestone kemerdekaan (1945–2026)
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
        location: { lat: -6.2088, lon: 106.8456, place: 'Jakarta (Jl. Proklamasi)' },
        description: '17 Agustus 1945: Ir. Soekarno dan Drs. Mohammad Hatta memproklamasikan kemerdekaan Indonesia di Jalan Pegangsaan Timur 56 (kini Jl. Proklamasi), Jakarta.'
    },
    1946: {
        title: 'Perang Kemerdekaan',
        category: 'sejarah',
        location: { lat: -7.5, lon: 110.0, place: 'Jawa' },
        description: 'Agresi militer Belanda I (1946–1947) dan perang rakyat semesta mempertahankan kemerdekaan yang baru diproklamasikan.'
    },
    1948: {
        title: 'Agresi Militer Belanda II & PDRI',
        category: 'sejarah',
        location: { lat: -6.95, lon: 107.65, place: 'Yogyakarta' },
        description: 'Belanda melancarkan Agresi Militer II (19 Desember 1948). Soekarno-Hatta ditahan, Pemerintahan Darurat Republik Indonesia (PDRI) dipimpin Sjafruddin Prawiranegara di Sumatra.'
    },
    1949: {
        title: 'Konferensi Meja Bundar',
        category: 'diplomasi',
        location: { lat: 52.0705, lon: 4.3007, place: 'Den Haag, Belanda' },
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
        location: { lat: -2.5, lon: 118.0, place: 'Nusantara' },
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
        description: '17 Agustus 2026: Indonesia merayakan 81 tahun kemerdekaan. Semangat persatuan Nusantara membangun bangsa menuju Indonesia Emas 2045.'
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
    for (let year = 1945; year <= 2026; year++) {
        const tahunKe = year - 1945;
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
        answer: 'Proklamasi Kemerdekaan Indonesia dibaca pada 17 Agustus 1945 oleh Ir. Soekarno dan Drs. Mohammad Hatta di Jalan Pegangsaan Timur 56 (kini Jl. Proklamasi), Jakarta. Inilah momen kelahiran Republik Indonesia.'
    },
    {
        keywords: ['bpupki', 'ppki', 'sidang persiapan'],
        answer: 'BPUPKI bersidang 29 Mei–1 Juni dan 10–17 Juli 1945. PPKI bersidang 18 Agustus 1945, mengesahkan UUD 1945 dan melantik Soekarno-Hatta sebagai presiden dan wakil presiden.'
    },
    {
        keywords: ['meja bundar', 'kmb', 'den haag', '1949'],
        answer: 'Konferensi Meja Bundar di Den Haag, Belanda (23 Agustus–2 November 1949). Belanda mengakui kedaulatan RI per 27 Desember 1949. Indonesia menjadi RIS hingga kembali ke NKRI, 17 Agustus 1950.'
    },
    {
        keywords: ['bandung', 'asia afrika', '1955', 'non blok'],
        answer: 'Konferensi Asia-Afrika di Bandung, 18–24 April 1955, dihadiri 29 negara. Dasasila Bandung melahirkan gerakan Non-Blok dan solidaritas negara berkembang.'
    },
    {
        keywords: ['djuanda', 'wawasan nusantara', 'laut'],
        answer: 'Deklarasi Djuanda (1 Desember 1957) menegaskan RI sebagai negara kepulauan dengan kedaulatan penuh atas perairan Nusantara — cikal bakal Wawasan Nusantara.'
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
        answer: '"Bhinneka Tunggal Ika" berarti berbeda-beda tetapi tetap satu. Indonesia terdiri dari 17.000+ pulau, 700+ bahasa daerah, dan 1.300+ suku bangsa — serta 38 provinsi (2022). Keberagaman ini adalah kekuatan kita.'
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
        answer: 'Trivia: Presiden pertama RI adalah Soekarno (1945–1967). Proklamasi dibaca 17 Agustus 1945. HUT RI ke-81 dirayakan 17 Agustus 2026 — 81 tahun sejak proklamasi kemerdekaan.'
    }
];
