# Cara menambah periode KSEI baru (tanpa bantuan siapa pun)

## Sekali saja: pasang otomatisasi
1. Di GitHub, tambahkan dua file ini ke repository (ikuti letak foldernya persis):
   - `scripts/build_ksei_index.py`
   - `.github/workflows/update-ksei-index.yml`
   (Jika folder berawalan titik sulit diunggah dari HP: pilih **Add file → Create new file**, ketik nama lengkap
   `.github/workflows/update-ksei-index.yml`, tempel isinya, lalu Commit.)
2. Buka **Settings → Actions → General → Workflow permissions** dan pilih **Read and write permissions**, lalu Save.

## Setiap bulan: 3 langkah
1. Buka repository → folder **ksei-repo** → **Add file → Upload files** → pilih file KSEI bulan baru (nama file bebas) → **Commit changes**.
2. Tunggu sekitar 1 menit. Buka tab **Actions**: proses "Update KSEI index" akan menyala hijau dan otomatis memperbarui
   `ksei-repo/index.json`. Vercel lalu deploy sendiri.
3. Buka situs, muat ulang (di HP: tutup lalu buka lagi). Chip bulan baru muncul di "Pilih Periode".

## Hal yang perlu diketahui
- Tanggal periode diambil dari kolom **DATE di dalam file**, bukan dari nama file.
- Dua file dengan tanggal data yang sama: hanya satu yang dipakai (yang barisnya lebih banyak).
- Satu bulan dengan lebih dari satu file: label memakai tanggal lengkap.
- Menghapus file dari `ksei-repo` juga otomatis menghapusnya dari daftar.
- Jika Actions berwarna merah: buka log-nya. Pesan `::warning::` menyebut file mana yang dilewati dan alasannya.

## Cadangan manual (jika Actions tidak dipakai)
Tambahkan satu blok di `ksei-repo/index.json` (urut tanggal), lalu Commit:

    {"id": "2026-11", "date": "2026-11-30", "file": "/ksei-repo/NAMA-FILE.xlsx",
     "label": {"id": "November 2026", "en": "November 2026"}, "rows": 7150}

Atau jalankan di komputer: `pip install openpyxl && python scripts/build_ksei_index.py`.
