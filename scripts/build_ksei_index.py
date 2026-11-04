#!/usr/bin/env python3
"""Bangun ksei-repo/index.json otomatis dari semua file .xlsx di folder ksei-repo/.

Cara kerja:
  - Nama file bebas (mis. peng-2026-10-00029-satu-persen.xlsx). Tanggal diambil dari kolom DATE DI DALAM file,
    bukan dari nama file, jadi nama seperti "04-31" tidak jadi masalah.
  - Label bulan (ID/EN) dibuat otomatis. Jika satu bulan punya lebih dari satu file, label memakai tanggal lengkap.
  - Dua file dengan tanggal data yang sama: hanya satu yang dipakai (yang barisnya lebih banyak).
  - File rusak/tanpa kolom DATE dilewati dengan peringatan, file lain tetap diproses.

Jalankan manual (opsional):  pip install openpyxl && python scripts/build_ksei_index.py
"""
import collections, json, sys
from datetime import datetime, date
from pathlib import Path
from urllib.parse import quote
import openpyxl

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT / "ksei-repo"
OUT = REPO / "index.json"
ID_M = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
EN_M = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
FORMATS = ("%Y-%m-%d", "%d-%b-%Y", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d")

def to_iso(v):
    if isinstance(v, (datetime, date)):
        return v.strftime("%Y-%m-%d")
    s = str(v).strip()[:10] if v is not None else ""
    for f in FORMATS:
        try:
            return datetime.strptime(s if f == "%Y-%m-%d" else str(v).strip(), f).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return None

def read_meta(path):
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.worksheets[0]
    hdr, n, dates = None, 0, collections.Counter()
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if hdr is None:
            if row and row[0] == "DATE":
                hdr = i
            continue
        if row and len(row) > 1 and row[1]:
            iso = to_iso(row[0])
            if iso:
                dates[iso] += 1
            n += 1
    wb.close()
    if hdr is None:
        raise ValueError("kolom DATE tidak ditemukan")
    if not dates:
        raise ValueError("tanggal data tidak terbaca")
    return dates.most_common(1)[0][0], n

def main():
    items = []
    for p in sorted(REPO.glob("*.xlsx")) + sorted(REPO.glob("*.XLSX")):
        try:
            d, n = read_meta(p)
            items.append({"date": d, "rows": n, "path": p})
            print(f"OK    {p.name}: tanggal data {d}, {n} baris")
        except Exception as e:
            print(f"::warning::Lewati {p.name}: {e}")
    by_date = {}
    for it in items:
        old = by_date.get(it["date"])
        if old:
            print(f"::warning::Tanggal {it['date']} ada di dua file ({old['path'].name} dan {it['path'].name}); dipakai yang barisnya lebih banyak")
            if (it["rows"], it["path"].name) <= (old["rows"], old["path"].name):
                continue
        by_date[it["date"]] = it
    items = sorted(by_date.values(), key=lambda x: x["date"])
    per_month = collections.Counter(x["date"][:7] for x in items)
    files = []
    for it in items:
        y, m, dd = it["date"].split("-")
        mi = int(m)
        if per_month[it["date"][:7]] > 1:
            fid = it["date"]
            lab = {"id": f"{int(dd)} {ID_M[mi]} {y}", "en": f"{EN_M[mi]} {int(dd)}, {y}"}
        else:
            fid = f"{y}-{m}"
            lab = {"id": f"{ID_M[mi]} {y}", "en": f"{EN_M[mi]} {y}"}
        files.append({"id": fid, "date": it["date"], "file": "/ksei-repo/" + quote(it["path"].name), "label": lab, "rows": it["rows"]})
    text = json.dumps({"files": files}, ensure_ascii=False, indent=1) + "\n"
    if OUT.exists() and OUT.read_text(encoding="utf-8") == text:
        print("index.json sudah mutakhir (tidak ada perubahan).")
    else:
        OUT.write_text(text, encoding="utf-8")
        print(f"index.json diperbarui: {len(files)} periode ({files[0]['date']} s/d {files[-1]['date']}).")
    return 0

if __name__ == "__main__":
    sys.exit(main())
