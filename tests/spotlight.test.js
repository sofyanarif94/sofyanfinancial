/* Uji otomatis SpotEngine. Data = FIXTURE SINTETIS (bukan data pasar nyata). Jalankan: node tests/spotlight.test.js */
const fs=require('fs'),vm=require('vm'),path=require('path');
const src=['spot_engine.js','spot_parse.js','spot_answer.js'].map(f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8')).join('\n');
vm.runInThisContext(src);const E=globalThis.SpotEngine,core=E.core;
/* ---------- fixture sintetis ---------- */
const DATES=['2026-01-31','2026-02-28','2026-03-31','2026-04-30'];
const lbl=d=>core.dateLabel(d,'id');
const SPEC=[
 ['AAAA','Alfa Abadi Tbk',1e9,[['RAJAWALI CORPORA, PT','Corporate','L','N',[60,60,60,null]],['RAJAWALI KAPITAL EMAS, PT','Corporate','L','N',[null,null,null,60]],['GOVERNMENT OF NORWAY','Sovereign Wealth Fund','F','N',[5,6,7,8]],['LO KHENG HONG','Individual','L','I',[null,null,2,3]],['UBS AG LONDON','Bank','F','N',[4,3,2,1.5]]]],
 ['BBBB','Bumi Bersama Tbk',5e8,[['DANA PENSIUN ALPHA','Pension Funds','L','N',[10,12,14,16]],['GOVERNMENT OF NORWAY','Sovereign Wealth Fund','F','N',[3,3,3,3]],['BUDI SANTOSO','Individual','L','I',[1.5,null,null,null]]]],
 ['CCCC','Cahaya Cemerlang Tbk',[2e9,2e9,2e9,4e9],[['DANA PENSIUN ALPHA','Pension Funds','L','N',null,[4e8,4e8,4e8,4e8]],['UBS AG LONDON','Bank','F','N',null,[1e8,1e8,1e8,1e8]]]],
 ['DDDD','Delta Digital Tbk',1e9,[['LO KHENG HONG','Individual','L','I',[null,null,5,7]]]],
 ['EEEE','Elang Energi Tbk',1e9,[['GOVERNMENT OF NORWAY','Sovereign Wealth Fund','F','N',[15,10,8,5]],['UBS AG LONDON','Bank','F','N',[6,4,2,1.2]],['PT ELANG ENERGI TBK','Corporate','L','N',[3,3,3,3],null,true]]],
 ['FFFF','Fajar Foreign Tbk',1e9,[['GOVERNMENT OF NORWAY','Sovereign Wealth Fund','F','N',[2,3,4,5]],['DANA PENSIUN ALPHA','Pension Funds','L','N',[10,10,10,10]]]],
 ['JAYA','Jaya Makmur Tbk',1e9,[['DANA PENSIUN ALPHA','Pension Funds','L','N',[20,20,20,21]]]],
 ['EMAS','Emas Murni Tbk',1e9,[['DANA PENSIUN ALPHA','Pension Funds','L','N',[7,7,7,7]]]],
 ['GGGG','Giga Besar Tbk',1e14,[['BIG FUND','Mutual Fund','L','N',null,[4000000000000,4000000000001,4000000000001,4000000000001]]]]];
function mk(skip){const periods=DATES.map((d,pi)=>({id:d,date:d,label:lbl(d),src:'fixture-'+d+'.xlsx',rows:[]}));
 SPEC.forEach(([t,iss,tot,hs])=>hs.forEach(([inv,type,lf,grp,pcs,shs,self])=>periods.forEach((p,pi)=>{const T=Array.isArray(tot)?tot[pi]:tot;let pc=pcs?pcs[pi]:(shs[pi]/T*100),sh=pcs?(pc==null?null:Math.round(T*pc/100)):shs[pi];if(pc==null)return;p.rows.push({t,iss,inv,type,lf,grp,sh,pc,self:!!self})})));
 return E.buildModel({periods:periods.filter((p,i)=>!(skip||[]).includes(i))})}
const M=mk(),M2=mk([2]);
const LBL={sa:'Akumulasi kuat',a:'Akumulasi',sd:'Distribusi besar',d:'Distribusi',ak:'Akuisisi',rot:'Berpindah tangan',ipo:'IPO baru',n:'Netral'};
function sigProv(MM){return (pa,pb)=>{const m=new Map();MM.stocks.forEach((s,t)=>{const nn=core.netOf(core.changeRows(MM,t,pa,pb,{noSelf:true}));let sig='n';if(nn.net>=3)sig='sa';else if(nn.net>=1)sig='a';else if(nn.net<=-3)sig='sd';else if(nn.net<=-1)sig='d';m.set(t,{sig,net:nn.net,nUp:nn.nUp,nDn:nn.nDn})});return m}}
const DOCS=[{id:'avg',kind:'fitur',title:'Kalkulator Average Harga Saham',text:'Hitung harga rata-rata pembelian saham dan average down.'},{id:'dcf',kind:'fitur',title:'Discounted Cash Flow',text:'Hitung nilai wajar saham dengan DCF.'},{id:'faq1',kind:'faq',title:'Apa arti sinyal distribusi?',text:'Distribusi berarti investor besar mengurangi kepemilikan.'}];
const O=(MM,lang)=>({model:MM||M,lang:lang||'id',signals:sigProv(MM||M),signalLabel:k=>LBL[k]||k,explainSignal:k=>'Aturan: '+(LBL[k]||k),docs:DOCS});
const ask=(q,ctx,MM,lang)=>E.ask(q,ctx,O(MM,lang));
const txt=a=>[a.headline].concat(a.bullets||[],(a.evidence&&a.evidence.caveats)||[]).join(' | ');
const cell=c=>typeof c==='string'?c:c&&c.s;
const rowsOf=a=>[].concat(...(a.tables||[]).map(t=>t.rows)).map(r=>r.map(cell).join(' ¦ '));
let pass=0,fail=0;const log=[];
function T(name,fn){try{fn();pass++;log.push(['OK ',name])}catch(e){fail++;log.push(['GAGAL',name+' → '+e.message])}}
const eq=(a,b,m)=>{if(a!==b)throw new Error((m||'')+' diharapkan '+JSON.stringify(b)+' dapat '+JSON.stringify(a))},has=(s,x,m)=>{if(String(s).indexOf(x)<0)throw new Error((m||'')+' tidak memuat "'+x+'" di: '+String(s).slice(0,240))},hasnt=(s,x,m)=>{if(String(s).indexOf(x)>=0)throw new Error((m||'')+' seharusnya tidak memuat "'+x+'"')};
/* A. perhitungan murni */
T('hitung: 5%→7% = +2 poin, +40% relatif',()=>{const m=E.buildModel({periods:[{id:'a',date:'2026-01-31',rows:[{t:'ZZZ',iss:'Z',inv:'X',type:'',lf:'L',grp:'N',sh:50,pc:5}]},{id:'b',date:'2026-02-28',rows:[{t:'ZZZ',iss:'Z',inv:'X',type:'',lf:'L',grp:'N',sh:70,pc:7}]}]});const o=core.rowChange(m,'ZZZ','X',0,1);eq(o.dp,2);eq(Math.round(o.rel),40);eq(o.ds,20)});
T('hitung: basis nol → rel null (bukan Infinity), state new batas bawah',()=>{const o=core.rowChange(M,'AAAA','LO KHENG HONG',1,2);eq(o.state,'new');eq(o.rel,null);eq(o.exact,false);eq(o.dpr,1)});
T('hitung: holder tak tercatat ≠ nol (state new, bukan up dari 0)',()=>{const o=core.rowChange(M,'AAAA','RAJAWALI KAPITAL EMAS, PT',2,3);eq(o.state,'new');eq(o.dp,null)});
T('hitung: integer besar tidak dibulatkan (selisih lembar tepat 1)',()=>{const o=core.rowChange(M,'GGGG','BIG FUND',0,1);eq(o.ds,1)});
T('hitung: netOf tidak double counting',()=>{const cr=core.changeRows(M,'AAAA',0,1,{noSelf:true}),nn=core.netOf(cr);eq(nn.up,1);eq(nn.dn,-1);eq(nn.net,0)});
T('hitung: perubahan saham beredar tersirat terdeteksi (CCCC)',()=>{const s=core.totalShift(M,'CCCC',2,3);eq(Math.round(s*100),100)});
/* B. entitas */
T('entitas: ticker huruf kecil',()=>{const r=ask('siapa pemegang terbesar aaaa');eq(r.answer.intent,'HOLDERS');has(r.answer.headline,'RAJAWALI KAPITAL EMAS')});
T('entitas: ticker mirip kata biasa (jaya)',()=>{const r=ask('pemegang jaya');eq(r.answer.intent,'HOLDERS');has(r.answer.title,'JAYA')});
T('entitas: nama emiten → ticker',()=>{const r=ask('pemegang Elang Energi');eq(r.ctx.plan.tickers[0],'EEEE')});
T('entitas: kode tak dikenal',()=>{const r=ask('pemegang ZZZZ');eq(r.answer.status,'ambiguous');has(r.answer.headline,'ZZZZ')});
T('entitas: typo ringan → saran, tidak menebak diam-diam',()=>{const r=ask('pemegang AAAB');eq(r.answer.status,'ambiguous');has(JSON.stringify(r.answer.actions),'AAAA')});
T('entitas: investor mirip tapi beda → klarifikasi',()=>{const r=ask('portofolio rajawali');eq(r.answer.status,'ambiguous');eq(r.answer.clarify.options.length,2)});
T('entitas: nama lebih spesifik → resolusi tunggal',()=>{const r=ask('portofolio rajawali kapital');eq(r.answer.intent,'PORTFOLIO');has(r.answer.title,'KAPITAL EMAS')});
T('entitas: typo nama investor diterima dengan penanda (norwai)',()=>{const r=ask('portofolio government of norwai');eq(r.answer.intent,'PORTFOLIO')});
/* C. kepemilikan */
T('holders: pemegang terbesar terbaru',()=>{const a=ask('pemilik AAAA').answer;eq(a.intent,'HOLDERS');has(rowsOf(a)[0],'RAJAWALI KAPITAL EMAS');has(rowsOf(a)[0],'60,00%')});
T('holders: bulan tertentu (Maret) → Corpora',()=>{const a=ask('siapa pemegang terbesar AAAA bulan Maret').answer;has(a.headline,'RAJAWALI CORPORA');has(a.headline,'31 Mar 2026')});
T('holders: ambang "di atas 5 persen"',()=>{const a=ask('pemegang di atas 5 persen BBBB').answer;eq(rowsOf(a).length,1);has(rowsOf(a)[0],'DANA PENSIUN')});
T('holders: catatan cakupan 1% selalu ada',()=>{const a=ask('pemilik AAAA').answer;has(txt(a),'di atas 1%')});
T('holders: tanpa kata tanya (kode saja) → overview',()=>{eq(ask('AAAA').answer.intent,'OVERVIEW')});
/* D. perubahan & waktu */
T('change: new/exit memakai batas ≥ / ≤ dan status tercatat',()=>{const a=ask('perubahan kepemilikan AAAA').answer;eq(a.intent,'CHANGE');const r=rowsOf(a).join('\n');has(r,'≥');has(r,'≤');has(r,'Tercatat baru')});
T('change: "siapa yang menambah" hanya yang naik',()=>{const a=ask('siapa yang menambah AAAA').answer;hasnt(rowsOf(a).join('\n'),'UBS')});
T('change: poin vs relatif dijelaskan',()=>{const a=ask('perubahan AAAA').answer;has(txt(a)+JSON.stringify(a.bullets),'poin')});
T('change: Maret → basis nol rel "—"',()=>{const a=ask('perubahan AAAA bulan Maret').answer;const r=rowsOf(a).find(x=>x.indexOf('LO KHENG')>=0);has(r,'—')});
T('change: bulan lalu → rentang Mar→Apr',()=>{const a=ask('perubahan AAAA dibanding bulan lalu').answer;has(a.headline,'31 Mar 2026');has(a.headline,'30 Apr 2026')});
T('waktu: bulan tidak tersedia tidak diganti diam-diam',()=>{const a=ask('perubahan AAAA bulan Mei').answer;eq(a.status,'nodata');has(a.headline,'tidak tersedia');eq(a.tables.length,0)});
T('waktu: bulan lalu tidak ada pada dataset berlubang',()=>{const a=ask('perubahan AAAA dibanding bulan lalu',null,M2).answer;eq(a.status,'nodata')});
T('waktu: periode terbaru = tanggal data terbaru (bukan hari ini)',()=>{const a=ask('pemegang AAAA terbaru').answer;has(a.headline,'30 Apr 2026')});
T('waktu: snapshot ≠ tanggal transaksi (META)',()=>{const a=ask('data apa saja yang tersedia').answer;eq(a.intent,'META');has(txt(a),'snapshot');eq(a.tables[0].rows.length,4)});
T('change: aksi korporasi → catatan total saham beredar',()=>{const a=ask('perubahan CCCC').answer;has(txt(a),'Total saham beredar')});
/* E. tren & kapan */
T('trend: pergantian pemegang terbesar teramati',()=>{const a=ask('tren kepemilikan AAAA').answer;eq(a.intent,'TREND');has(txt(a),'30 Apr 2026')});
T('trend: investor di saham, kenaikan beruntun 3',()=>{const a=ask('tren Norway di AAAA').answer;eq(a.intent,'INVHOLD');has(txt(a),'beruntun terpanjang: 3')});
T('first: kapan mulai terlihat (bukan tanggal beli)',()=>{const a=ask('kapan Lo Kheng Hong mulai terlihat memegang AAAA').answer;eq(a.intent,'FIRST');has(a.headline,'31 Mar 2026');has(txt(a),'bukan tanggal transaksi')});
T('first: investor baru muncul pada saham',()=>{const a=ask('siapa yang baru muncul di AAAA').answer;eq(a.intent,'FIRST');has(rowsOf(a).join(''),'LO KHENG')});
T('portfolio: investor pegang apa aja',()=>{const a=ask('Lo Kheng Hong pegang apa aja').answer;eq(a.intent,'PORTFOLIO');const r=rowsOf(a).join('\n');has(r,'AAAA');has(r,'DDDD')});
/* F. ranking */
T('rank: asing paling banyak jual → EEEE pertama',()=>{const a=ask('asing paling banyak jual').answer;eq(a.intent,'RANK');has(rowsOf(a)[0],'EEEE')});
T('rank: seri diurutkan stabil (AAAA sebelum FFFF)',()=>{const a=ask('top 3 akumulasi asing').answer;const r=rowsOf(a);eq(r.length<=3,true);const i1=r.findIndex(x=>x.indexOf('AAAA')>=0),i2=r.findIndex(x=>x.indexOf('FFFF')>=0);eq(i1>=0&&i2>=0&&i1<i2,true)});
T('rank: konsisten naik 3 periode (asing) → hanya FFFF',()=>{const a=ask('saham asing konsisten naik 3 periode').answer;const r=rowsOf(a);eq(r.length,1);has(r[0],'FFFF')});
T('rank: negasi "bukan asing"',()=>{const r=ask('perubahan terbesar bukan asing');eq(r.ctx.plan.filter.notLf,true);eq(r.answer.intent,'RANK')});
T('rank: limit "3 teratas distribusi asing"',()=>{const a=ask('tampilkan 3 teratas distribusi asing').answer;eq(rowsOf(a).length<=3,true)});
T('rank: seluruh saham ikut (DDDD tidak ada di periode awal)',()=>{const a=ask('top 20 akumulasi').answer;has(rowsOf(a).join('\n'),'DDDD')});
T('rank: keluarkan data tidak lengkap',()=>{const a=ask('saham dengan kenaikan terbesar sejak Januari keluarkan saham yang datanya tidak lengkap').answer;hasnt(rowsOf(a).join('\n'),'DDDD')});
T('rank: "terbaik" = Skor Alpha + bukan rekomendasi',()=>{const a=ask('saham terbaik').answer;eq(a.intent,'RANK');has(txt(a),'bukan rekomendasi');has(txt(a),'Skor Alpha')});
T('rank: sinyal akuisisi dilabeli indikasi',()=>{const a=ask('saham apa yang diakuisisi').answer;eq(a.intent,'SIGNAL');has(txt(a),'bukan akuisisi korporasi yang terkonfirmasi')});
T('rank: kriteria & dasar perhitungan tersedia',()=>{const a=ask('top 5 akumulasi asing').answer;eq(a.evidence.formulas.length>0,true);eq(a.evidence.periods.length>=2,true)});
/* G. perbandingan, penjelasan, tindak lanjut */
T('compare: dua saham',()=>{const a=ask('bandingkan AAAA vs EEEE').answer;eq(a.intent,'COMPARE');has(JSON.stringify(a.tables[0].rows),'Pemegang terbesar')});
T('explain: dasar data, bukan motif',()=>{const a=ask('kenapa AAAA sinyalnya akumulasi').answer;eq(a.intent,'EXPLAIN');has(txt(a),'motif')});
T('follow-up: "sebelumnya berapa?" memakai saham sebelumnya',()=>{const r1=ask('pemegang terbesar AAAA'),r2=ask('sebelumnya berapa?',r1.ctx);eq(r2.answer.intent,'HOLDERS');has(r2.answer.headline,'RAJAWALI CORPORA')});
T('follow-up: "yang asing saja" menambah filter',()=>{const r1=ask('perubahan EEEE'),r2=ask('yang asing saja',r1.ctx);eq(r2.ctx.plan.filter.lf,'F');hasnt(rowsOf(r2.answer).join('\n'),'ELANG ENERGI TBK')});
T('follow-up: "bandingkan dengan EEEE"',()=>{const r1=ask('pemegang AAAA'),r2=ask('bandingkan dengan EEEE',r1.ctx);eq(r2.answer.intent,'COMPARE')});
T('follow-up: "10 teratas" mengganti limit',()=>{const r1=ask('top 3 akumulasi asing'),r2=ask('10 teratas',r1.ctx);eq(r2.ctx.plan.limit,10);eq(r2.answer.intent,'RANK')});
T('follow-up: reset topik baru',()=>{const r1=ask('pemegang AAAA'),r2=ask('kalkulator average down',r1.ctx);eq(r2.answer.intent,'FEATURE')});
/* H. kejujuran jawaban */
T('jujur: tanpa data harga → unsupported',()=>{eq(ask('saham mana yang murah?').answer.status,'unsupported')});
T('jujur: ticker + harga → jawab kepemilikan + catatan',()=>{const a=ask('harga AAAA').answer;has(txt(a),'harga')});
T('jujur: transaksi aktual tidak ada',()=>{has(txt(ask('volume transaksi AAAA').answer),'transaksi')});
T('jujur: beneficial owner tidak diklaim',()=>{has(txt(ask('siapa beneficial owner AAAA').answer),'beneficial')});
T('jujur: relasi grup tidak ditebak dari nama',()=>{has(txt(ask('apakah Norway satu grup dengan UBS').answer),'kemiripan nama')});
T('jujur: "naik berapa poin?" ambigu → klarifikasi',()=>{eq(ask('naik berapa poin?').answer.status,'partial')});
T('jujur: crossing = indikasi',()=>{const a=ask('saham yang crossing').answer;eq(a.intent,'SIGNAL')});
/* I. konten, bahasa, autocomplete, siklus data */
T('konten: pertanyaan edukasi menemukan fitur/FAQ',()=>{const a=ask('cara menghitung average down').answer;eq(a.intent,'FEATURE');has(JSON.stringify(a.docs),'avg')});
T('konten: arti sinyal distribusi → FAQ',()=>{const a=ask('apa arti sinyal distribusi').answer;has(JSON.stringify(a.docs||a.bullets),'distribusi')});
T('bahasa: Inggris',()=>{const a=ask('top 3 foreign accumulation',null,null,'en').answer;eq(a.intent,'RANK');has(a.headline,'By')});
T('bahasa: Inggris who holds',()=>{const a=ask('who are the largest holders of AAAA',null,null,'en').answer;eq(a.intent,'HOLDERS')});
T('autocomplete: ticker, investor, periode',()=>{const o=O();const s1=E.suggest('AA',o),s2=E.suggest('raja',o),s3=E.suggest('mar',o);eq(s1.some(x=>x.label.indexOf('AAAA')===0),true);eq(s2.some(x=>x.kind==='inv'),true);eq(s3.some(x=>x.kind==='period'),true)});
T('contoh dinamis memakai data nyata dataset',()=>{const ex=E.examples(O()).join(' ');has(ex,'AAAA')});
T('siklus data: model baru memperbarui indeks',()=>{const periods=[{id:'x',date:'2026-01-31',rows:[{t:'HHHH',iss:'H',inv:'A',type:'',lf:'L',grp:'N',sh:1,pc:5}]},{id:'y',date:'2026-02-28',rows:[{t:'HHHH',iss:'H',inv:'A',type:'',lf:'L',grp:'N',sh:2,pc:6}]}];const m3=E.buildModel({periods});eq(E.ask('pemilik HHHH',null,O(m3)).answer.status,'ok');eq(E.ask('pemilik HHHH',null,O(M)).answer.status==='ok',false)});
T('performa: 40 pertanyaan beruntun pada fixture < 2 detik',()=>{const t0=Date.now();for(let i=0;i<40;i++)ask('top 5 akumulasi asing');const d=Date.now()-t0;if(d>2000)throw new Error(d+' ms')});
T('keamanan: input HTML tidak dieksekusi di engine (string mentah, UI yang escape)',()=>{const a=ask('<img src=x onerror=alert(1)> AAAA').answer;eq(typeof a.headline,'string')});
/* J. regresi dari uji data nyata */
T('regresi: pertanyaan jumlah → jawaban langsung "Ada N investor"',()=>{const a=ask('berapa investor asing yang mengurangi EEEE').answer;eq(a.intent,'CHANGE');has(a.headline,'Ada 2 investor');has(a.headline,'asing')});
T('regresi: jumlah nol tetap dijawab (bukan "tidak ada perubahan")',()=>{const a=ask('berapa investor asing yang mengurangi FFFF').answer;eq(a.status,'ok');has(a.headline,'Ada 0 investor')});
T('regresi: nama investor huruf besar yang mengandung kode saham (EMAS)',()=>{const r=ask('Kapan PT RAJAWALI KAPITAL EMAS mulai terlihat memegang AAAA?');eq(r.answer.intent,'FIRST');eq(r.ctx.plan.tickers.join(),'AAAA');eq(r.ctx.plan.investors.length,1)});
T('regresi: seluruh pertanyaan huruf besar tetap mengenali ticker',()=>{const a=ask('SIAPA PEMEGANG TERBESAR AAAA').answer;eq(a.intent,'HOLDERS');has(a.title,'AAAA')});
T('regresi: topik baru bukan tindak lanjut ("saham" + ranking)',()=>{const r1=ask('pemegang AAAA'),r2=ask('Top 5 saham dengan kenaikan kepemilikan asing terbesar',r1.ctx);eq(r2.answer.intent,'RANK')});
T('regresi: ticker nyata EMAS tetap bisa dicari langsung',()=>{eq(ask('pemegang EMAS').answer.intent,'HOLDERS');eq(ask('pemegang EMAS').ctx.plan.tickers[0],'EMAS')});
T('regresi: kata biasa (lalu) bukan nama investor',()=>{const a=ask('asing paling banyak jual bulan lalu').answer;eq(a.intent,'RANK')});
T('regresi: headline ranking menyebut arah (penurunan)',()=>{const a=ask('asing paling banyak jual').answer;has(a.headline,'penurunan')});
console.log(log.map(l=>l.join('  ')).join('\n'));console.log('\nTotal:',pass+fail,'| lolos:',pass,'| gagal:',fail);process.exit(fail?1:0);
