# Pertanyaan uji Spotlight

Semua uji memakai **fixture sintetis** (bukan data pasar nyata). Jalankan: `node tests/spotlight.test.js`.

| # | Pertanyaan | Intent yang diharapkan | Perilaku yang diverifikasi |
|---|---|---|---|
| 1 | siapa pemegang terbesar aaaa | HOLDERS | entitas: ticker huruf kecil |
| 2 | pemegang jaya | HOLDERS | entitas: ticker mirip kata biasa (jaya) |
| 3 | pemegang Elang Energi | - | entitas: nama emiten → ticker |
| 4 | pemegang ZZZZ | - | entitas: kode tak dikenal |
| 5 | pemegang AAAB | - | entitas: typo ringan → saran, tidak menebak diam-diam |
| 6 | portofolio rajawali | - | entitas: investor mirip tapi beda → klarifikasi |
| 7 | portofolio rajawali kapital | PORTFOLIO | entitas: nama lebih spesifik → resolusi tunggal |
| 8 | portofolio government of norwai | PORTFOLIO | entitas: typo nama investor diterima dengan penanda (norwai) |
| 9 | pemilik AAAA | HOLDERS | holders: pemegang terbesar terbaru |
| 10 | siapa pemegang terbesar AAAA bulan Maret | - | holders: bulan tertentu (Maret) → Corpora |
| 11 | pemegang di atas 5 persen BBBB | - | holders: ambang "di atas 5 persen" |
| 12 | pemilik AAAA | - | holders: catatan cakupan 1% selalu ada |
| 13 | AAAA | OVERVIEW | holders: tanpa kata tanya (kode saja) → overview |
| 14 | perubahan kepemilikan AAAA | CHANGE | change: new/exit memakai batas ≥ / ≤ dan status tercatat |
| 15 | siapa yang menambah AAAA | - | change: "siapa yang menambah" hanya yang naik |
| 16 | perubahan AAAA | - | change: poin vs relatif dijelaskan |
| 17 | perubahan AAAA bulan Maret | - | change: Maret → basis nol rel "—" |
| 18 | perubahan AAAA dibanding bulan lalu | - | change: bulan lalu → rentang Mar→Apr |
| 19 | perubahan AAAA bulan Mei | - | waktu: bulan tidak tersedia → dinyatakan jelas (tanpa fallback: nodata, tanpa tabel) |
| 20 | perubahan AAAA bulan Mei | - | waktu: bulan tidak tersedia → fallback eksplisit ke data terbaru dengan permintaan maaf |
| 21 | perubahan AAAA dibanding bulan lalu | - | waktu: bulan lalu tidak ada pada dataset berlubang |
| 22 | pemegang AAAA terbaru | - | waktu: periode terbaru = tanggal data terbaru (bukan hari ini) |
| 23 | data apa saja yang tersedia | META | waktu: snapshot ≠ tanggal transaksi (META) |
| 24 | perubahan CCCC | - | change: aksi korporasi → catatan total saham beredar |
| 25 | tren kepemilikan AAAA | TREND | trend: pergantian pemegang terbesar teramati |
| 26 | tren Norway di AAAA | INVHOLD | trend: investor di saham, kenaikan beruntun 3 |
| 27 | kapan Lo Kheng Hong mulai terlihat memegang AAAA | FIRST | first: kapan mulai terlihat (bukan tanggal beli) |
| 28 | siapa yang baru muncul di AAAA | FIRST | first: investor baru muncul pada saham |
| 29 | Lo Kheng Hong pegang apa aja | PORTFOLIO | portfolio: investor pegang apa aja |
| 30 | asing paling banyak jual | RANK | rank: asing paling banyak jual → EEEE pertama |
| 31 | top 3 akumulasi asing | - | rank: seri diurutkan stabil (AAAA sebelum FFFF) |
| 32 | saham asing konsisten naik 3 periode | - | rank: konsisten naik 3 periode (asing) → hanya FFFF |
| 33 | perubahan terbesar bukan asing | RANK | rank: negasi "bukan asing" |
| 34 | tampilkan 3 teratas distribusi asing | - | rank: limit "3 teratas distribusi asing" |
| 35 | top 20 akumulasi | - | rank: seluruh saham ikut (DDDD tidak ada di periode awal) |
| 36 | saham dengan kenaikan terbesar sejak Januari keluarkan saham yang datanya tidak lengkap | - | rank: keluarkan data tidak lengkap |
| 37 | saham terbaik | RANK | rank: "terbaik" = Skor Alpha + bukan rekomendasi |
| 38 | saham apa yang diakuisisi | SIGNAL | rank: sinyal akuisisi dilabeli indikasi |
| 39 | top 5 akumulasi asing | - | rank: kriteria & dasar perhitungan tersedia |
| 40 | bandingkan AAAA vs EEEE | COMPARE | compare: dua saham |
| 41 | kenapa AAAA sinyalnya akumulasi | EXPLAIN | explain: dasar data, bukan motif |
| 42 | pemegang terbesar AAAA | HOLDERS | follow-up: "sebelumnya berapa?" memakai saham sebelumnya |
| 43 | perubahan EEEE | - | follow-up: "yang asing saja" menambah filter |
| 44 | pemegang AAAA | COMPARE | follow-up: "bandingkan dengan EEEE" |
| 45 | top 3 akumulasi asing | RANK | follow-up: "10 teratas" mengganti limit |
| 46 | pemegang AAAA | FEATURE | follow-up: reset topik baru |
| 47 | saham mana yang murah? | - | jujur: tanpa data harga → unsupported |
| 48 | harga AAAA | - | jujur: ticker + harga → jawab kepemilikan + catatan |
| 49 | volume transaksi AAAA | - | jujur: transaksi aktual tidak ada |
| 50 | siapa beneficial owner AAAA | - | jujur: beneficial owner tidak diklaim |
| 51 | apakah Norway satu grup dengan UBS | - | jujur: relasi grup tidak ditebak dari nama |
| 52 | naik berapa poin? | - | jujur: "naik berapa poin?" ambigu → klarifikasi |
| 53 | saham yang crossing | SIGNAL | jujur: crossing = indikasi |
| 54 | cara menghitung average down | FEATURE | konten: pertanyaan edukasi menemukan fitur/FAQ |
| 55 | apa arti sinyal distribusi | - | konten: arti sinyal distribusi → FAQ |
| 56 | top 3 foreign accumulation | RANK | bahasa: Inggris |
| 57 | who are the largest holders of AAAA | HOLDERS | bahasa: Inggris who holds |
| 58 | pemilik QQQQ | - | siklus data: model baru memperbarui indeks |
| 59 | top 5 akumulasi asing | - | performa: 40 pertanyaan beruntun pada fixture < 2 detik |
| 60 | <img src=x onerror=alert(1)> AAAA | - | keamanan: input HTML tidak dieksekusi di engine (string mentah, UI yang escape) |
| 61 | berapa investor asing yang mengurangi EEEE | CHANGE | regresi: pertanyaan jumlah → jawaban langsung "Ada N investor" |
| 62 | berapa investor asing yang mengurangi FFFF | - | regresi: jumlah nol tetap dijawab (bukan "tidak ada perubahan") |
| 63 | Kapan PT RAJAWALI KAPITAL EMAS mulai terlihat memegang AAAA? | FIRST | regresi: nama investor huruf besar yang mengandung kode saham (EMAS) |
| 64 | SIAPA PEMEGANG TERBESAR AAAA | HOLDERS | regresi: seluruh pertanyaan huruf besar tetap mengenali ticker |
| 65 | pemegang AAAA | RANK | regresi: topik baru bukan tindak lanjut ("saham" + ranking) |
| 66 | pemegang EMAS | HOLDERS | regresi: ticker nyata EMAS tetap bisa dicari langsung |
| 67 | asing paling banyak jual bulan lalu | RANK | regresi: kata biasa (lalu) bukan nama investor |
| 68 | asing paling banyak jual | - | regresi: headline ranking menyebut arah (penurunan) |
| 69 | perubahan kepemilikan AAAA | - | data terbaru: pasangan default membandingkan snapshot ≥20 hari (bukan hari sebelumnya) |
| 70 | top 3 akumulasi | - | data terbaru: default memakai tanggal terbaru dataset |
| 71 | perubahan HHHH | - | data terbaru: tak ada perubahan di interval terakhir → cari perubahan terakhir yang tercatat |
| 72 | kenaikan asing JAYA | - | fallback: kriteria terlalu detail → maaf + jawaban data terbaru |
| 73 | blablabla xyzqw sesuatu | RANK | fallback: pertanyaan tak dipahami → maaf + ranking data terbaru |
| 74 | pemegang ZZZZ | - | fallback: kode tak dikenal tetap meminta klarifikasi (bukan fallback) |
| 75 | naik berapa poin? | - | fallback: klarifikasi "naik berapa poin?" tidak dialihkan |
| 76 | pemilik AAAA | - | fallback: tidak mengaburkan jawaban yang valid |
| 77 | asing paling banyak beli ZZZZZ | - | jujur: kode tak dikenal pada ranking disebut, bukan diabaikan diam-diam |

Total pertanyaan unik yang dipetakan: 77.
