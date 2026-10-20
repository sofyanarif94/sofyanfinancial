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
| 19 | perubahan AAAA bulan Mei | - | waktu: bulan tidak tersedia tidak diganti diam-diam |
| 20 | perubahan AAAA dibanding bulan lalu | - | waktu: bulan lalu tidak ada pada dataset berlubang |
| 21 | pemegang AAAA terbaru | - | waktu: periode terbaru = tanggal data terbaru (bukan hari ini) |
| 22 | data apa saja yang tersedia | META | waktu: snapshot ≠ tanggal transaksi (META) |
| 23 | perubahan CCCC | - | change: aksi korporasi → catatan total saham beredar |
| 24 | tren kepemilikan AAAA | TREND | trend: pergantian pemegang terbesar teramati |
| 25 | tren Norway di AAAA | INVHOLD | trend: investor di saham, kenaikan beruntun 3 |
| 26 | kapan Lo Kheng Hong mulai terlihat memegang AAAA | FIRST | first: kapan mulai terlihat (bukan tanggal beli) |
| 27 | siapa yang baru muncul di AAAA | FIRST | first: investor baru muncul pada saham |
| 28 | Lo Kheng Hong pegang apa aja | PORTFOLIO | portfolio: investor pegang apa aja |
| 29 | asing paling banyak jual | RANK | rank: asing paling banyak jual → EEEE pertama |
| 30 | top 3 akumulasi asing | - | rank: seri diurutkan stabil (AAAA sebelum FFFF) |
| 31 | saham asing konsisten naik 3 periode | - | rank: konsisten naik 3 periode (asing) → hanya FFFF |
| 32 | perubahan terbesar bukan asing | RANK | rank: negasi "bukan asing" |
| 33 | tampilkan 3 teratas distribusi asing | - | rank: limit "3 teratas distribusi asing" |
| 34 | top 20 akumulasi | - | rank: seluruh saham ikut (DDDD tidak ada di periode awal) |
| 35 | saham dengan kenaikan terbesar sejak Januari keluarkan saham yang datanya tidak lengkap | - | rank: keluarkan data tidak lengkap |
| 36 | saham terbaik | RANK | rank: "terbaik" = Skor Alpha + bukan rekomendasi |
| 37 | saham apa yang diakuisisi | SIGNAL | rank: sinyal akuisisi dilabeli indikasi |
| 38 | top 5 akumulasi asing | - | rank: kriteria & dasar perhitungan tersedia |
| 39 | bandingkan AAAA vs EEEE | COMPARE | compare: dua saham |
| 40 | kenapa AAAA sinyalnya akumulasi | EXPLAIN | explain: dasar data, bukan motif |
| 41 | pemegang terbesar AAAA | HOLDERS | follow-up: "sebelumnya berapa?" memakai saham sebelumnya |
| 42 | perubahan EEEE | - | follow-up: "yang asing saja" menambah filter |
| 43 | pemegang AAAA | COMPARE | follow-up: "bandingkan dengan EEEE" |
| 44 | top 3 akumulasi asing | RANK | follow-up: "10 teratas" mengganti limit |
| 45 | pemegang AAAA | FEATURE | follow-up: reset topik baru |
| 46 | saham mana yang murah? | - | jujur: tanpa data harga → unsupported |
| 47 | harga AAAA | - | jujur: ticker + harga → jawab kepemilikan + catatan |
| 48 | volume transaksi AAAA | - | jujur: transaksi aktual tidak ada |
| 49 | siapa beneficial owner AAAA | - | jujur: beneficial owner tidak diklaim |
| 50 | apakah Norway satu grup dengan UBS | - | jujur: relasi grup tidak ditebak dari nama |
| 51 | naik berapa poin? | - | jujur: "naik berapa poin?" ambigu → klarifikasi |
| 52 | saham yang crossing | SIGNAL | jujur: crossing = indikasi |
| 53 | cara menghitung average down | FEATURE | konten: pertanyaan edukasi menemukan fitur/FAQ |
| 54 | apa arti sinyal distribusi | - | konten: arti sinyal distribusi → FAQ |
| 55 | top 3 foreign accumulation | RANK | bahasa: Inggris |
| 56 | who are the largest holders of AAAA | HOLDERS | bahasa: Inggris who holds |
| 57 | pemilik HHHH | - | siklus data: model baru memperbarui indeks |
| 58 | top 5 akumulasi asing | - | performa: 40 pertanyaan beruntun pada fixture < 2 detik |
| 59 | <img src=x onerror=alert(1)> AAAA | - | keamanan: input HTML tidak dieksekusi di engine (string mentah, UI yang escape) |
| 60 | berapa investor asing yang mengurangi EEEE | CHANGE | regresi: pertanyaan jumlah → jawaban langsung "Ada N investor" |
| 61 | berapa investor asing yang mengurangi FFFF | - | regresi: jumlah nol tetap dijawab (bukan "tidak ada perubahan") |
| 62 | Kapan PT RAJAWALI KAPITAL EMAS mulai terlihat memegang AAAA? | FIRST | regresi: nama investor huruf besar yang mengandung kode saham (EMAS) |
| 63 | SIAPA PEMEGANG TERBESAR AAAA | HOLDERS | regresi: seluruh pertanyaan huruf besar tetap mengenali ticker |
| 64 | pemegang AAAA | RANK | regresi: topik baru bukan tindak lanjut ("saham" + ranking) |
| 65 | pemegang EMAS | HOLDERS | regresi: ticker nyata EMAS tetap bisa dicari langsung |
| 66 | asing paling banyak jual bulan lalu | RANK | regresi: kata biasa (lalu) bukan nama investor |
| 67 | asing paling banyak jual | - | regresi: headline ranking menyebut arah (penurunan) |

Total pertanyaan unik yang dipetakan: 67.
