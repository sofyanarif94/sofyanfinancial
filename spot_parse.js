/* ---------------- D. natural-language parser (slot-based) ---------------- */
(function(G){'use strict';var C=G.__core,norm=C.norm,wd=C.wd,MON=C.MON,lev=C.lev;
var V={
 up:/\b(naik|menaik\w*|menambah\w*|ditambah|menaikkan|dinaikkan|tambah\w*|nambah\w*|bertambah|akumulasi\w*|beli|membeli|dibeli|borong\w*|serok\w*|meningkat|peningkatan|kenaikan|increas\w*|rise|rises|rose|add|added|adding|buy\w*|bought|accumulat\w*|gain\w*)\b/,
 down:/\b(turun|menurun|penurunan|berkurang|pengurangan|mengurangi|dikurangi|kurangi|jual|menjual|dijual|penjualan|melepas|lepas\w*|buang\w*|distribusi\w*|keluar|kabur|hengkang|cabut\w*|decreas\w*|drop\w*|fell|fall|reduc\w*|sell\w*|sold|exit\w*|dump\w*|distribut\w*|shed)\b/,
 foreign:/\b(asing|foreign\w*|luar negeri|offshore|overseas)\b/,
 local:/\b(lokal|domestik|local|domestic|dalam negeri)\b/,
 ind:/\b(individu|individual\w*|perorangan|retail|ritel|pribadi)\b/,
 inst:/\b(institusi\w*|lembaga|institutional\w*|institution\w*)\b/,
 rank:/\b(top|teratas|terbesar|terbanyak|tertinggi|terkecil|tersedikit|terendah|paling|ranking|peringkat|terbaik|terkuat|best|most|largest|biggest|highest|lowest|smallest|strongest)\b/,
 best:/\b(terbaik|terkuat|bagus|menarik|potensi\w*|prospek|rekomendasi|rekomen\w*|recommend\w*|profit\w*|cuan|untung|layak|unggulan|favorit|promising|best|strongest|gacor|mantap)\b/,
 compare:/\b(vs|versus|banding\w*|compare\w*|perbandingan|bandingkan)\b/,
 explain:/\b(kenapa|mengapa|why|alasan|penyebab|kok|dasar)\b/,
 first:/\b(kapan|sejak kapan|mulai terlihat|pertama\s+(?:kali\s+)?(?:terlihat|muncul|tercatat|terdeteksi)|baru muncul|when|first seen)\b/,
 port:/\b(portofolio|portfolio|pegang apa|memegang saham apa|saham apa saja|saham apa aja|punya apa|dimiliki oleh|koleksi|holdings)\b|\b(pegang|memegang|punya|memiliki|miliki)\s+(?:saham\s+)?apa\b/,
 who:/\b(siapa|who)\b/,
 holder:/\b(pemegang|pemilik|owner\w*|holders?|shareholders?|kepemilikan|ownership|komposisi|struktur)\b/,
 trend:/\b(tren|trend|histori\w*|history|riwayat|perkembangan|per bulan|sepanjang|selama periode|dari bulan ke bulan|konsisten|berturut|beruntun|berurutan|puncak|tertinggi pada|terendah pada|peak)\b/,
 change:/\b(perubahan|berubah|change[sd]?|selisih|delta|dibanding\w*|sebelumnya|bulan lalu|naik|turun|bertambah|berkurang|menambah|mengurangi)\b/,
 signal:/\b(sinyal|signal|akuisisi\w*|diakuisisi|ipo|crossing|berpindah tangan|pindah tangan|buyback|akumulasi kuat|distribusi besar|takeover|acqui\w*)\b/,
 feature:/\b(cara|menu|fitur|feature|kalkulator|calculator|hitung\w*|menghitung|apa itu|apa arti|arti|definisi|pengertian|maksud|jelaskan|penjelasan|what is|meaning|how to|dimana|di mana|buka|tutorial|panduan|rumus|formula)\b/,
 meta:/\b(data apa|periode apa|sumber data|cakupan|berapa banyak saham|tersedia|coverage|dataset|data yang ada|bulan apa saja|periode apa saja)\b/,
 count:/\b(berapa|jumlah|how many|how much|count|banyaknya)\b/,
 streak:/\b(konsisten|berturut\s*-?\s*turut|beruntun|terus(?:\s+menerus)?|consecutive|straight|berurutan)\b/,
 not:/\b(bukan|tanpa|selain|kecuali|non|tidak termasuk|exclude|excluding|not|except|minus)\b/,
 price:/\b(harga|price|target price|pbv|eps|roe|laba|rugi|dividen|dividend|fundamental|murah|mahal|undervalued|overvalued|prediksi|ramal\w*|forecast|valuasi saham)\b/,
 tx:/\b(transaksi|volume|nilai transaksi|turnover|frekuensi|order)\b/,
 bo:/\b(beneficial|pengendali|controller|ultimate|pemilik sebenarnya|pemilik manfaat|menguasai|kontrol)\b/,
 grp:/\b(satu grup|se-?grup|grup|afiliasi|terafiliasi|related|same group)\b/};
var TYPES=[[/\b(reksa\s*dana|mutual)\b/,'mutual'],[/\b(pensiun|pension|bpjs)\b/,'pension'],[/\b(asuransi|insurance)\b/,'insurance'],[/\b(sekuritas|securities|broker)\b/,'securit'],[/\b(sovereign|swf)\b/,'sovereign'],[/\b(yayasan|foundation)\b/,'foundation'],[/\b(korporasi|corporate|korporat)\b/,'corporate'],[/\b(bank)\b/,'bank']];
var NUMW={satu:1,dua:2,tiga:3,empat:4,lima:5,enam:6,tujuh:7,delapan:8,sembilan:9,sepuluh:10,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
var STOP=new Set(['yang','dari','saya','bisa','atau','dengan','untuk','pada','oleh','dalam','tolong','carikan','cari','tampilkan','tunjukkan','list','daftar','that','with','from','what','show','give','find','have','does','the','and','which','tell','this','saham','emiten','investor','investors','apa','dan','ada','saja','aja','semua','mana','lagi','dong','ya','kah','apakah','di','ke','itu','ini','nya','berapa','jumlah','total','kah','lah','sih','nih','kalau','jika','kalo','sebesar','sebanyak','periode','bulan','data','sekarang','saat','tahun','harga','ambil','kasih','lihat','tunjuk','tentang','soal','mengenai','tersebut','para','akan','sudah','telah','masih','hanya','cuma','juga','lebih','paling','sangat','banyak','sedikit','sama','antara','adalah','yaitu','yakni','jadi','agar','supaya','kapan','siapa','mengapa','kenapa','bagaimana','gimana','how','many','much','who','why','when','where','are','is','was','were','of','in','on','at','to','for','by','as','an','a','be','it','its','me','my','our','all','any','new','old','last','first','than','then','not','no','yes','dan','serta','maupun','vs','versus','mulai','terlihat','memegang','pegang','muncul','tercatat','dimiliki','hari','kemarin','aja','apa','lalu','terakhir','terbaru','terkini','awal','sejak','selama','sampai','hingga','antara','diberi','berikan','mana','kamu']);
var GR=[];Object.keys(V).forEach(function(k){GR.push(V[k])});TYPES.forEach(function(x){GR.push(x[0])});
function isGram(l){if(STOP.has(l)||NUMW[l]!=null||MON[l]!=null)return true;for(var i=0;i<GR.length;i++)if(GR[i].test(l))return true;return false}
function pnum(x){x=String(x).trim();if(x.indexOf('.')>=0&&x.indexOf(',')>=0)return x.lastIndexOf(',')>x.lastIndexOf('.')?parseFloat(x.replace(/\./g,'').replace(',','.')):parseFloat(x.replace(/,/g,''));
 if(/^\d{1,3}(\.\d{3})+$/.test(x))return parseFloat(x.replace(/\./g,''));if(/^\d{1,3}(,\d{3})+$/.test(x))return parseFloat(x.replace(/,/g,''));return parseFloat(x.replace(',','.'))}

/* ---- periode ---- */
var MRE=/\b(jan(?:uari|uary)?|feb(?:ruari|ruary)?|mar(?:et|ch)?|apr(?:il)?|mei|may|jun(?:i|e)?|jul(?:i|y)?|agu(?:stus)?|agt|aug(?:ust)?|sept?(?:ember)?|okt(?:ober)?|oct(?:ober)?|nov(?:ember)?|des(?:ember)?|dec(?:ember)?)\b(?:\s+(20\d\d))?/g;
function monthIdx(M,m,y){var b=-1;M.periods.forEach(function(p,i){if(+p.date.slice(5,7)===m&&(!y||+p.date.slice(0,4)===y))b=i});return b}
function parsePeriod(s,M){var n=M.periods.length,last=n-1,o={kind:'default',missing:[],prev:false,found:false},mons=[],m;
 MRE.lastIndex=0;while((m=MRE.exec(s)))mons.push({m:MON[m[1]],y:m[2]?+m[2]:0,pos:m.index,txt:m[0]});
 function res(x){var i=monthIdx(M,x.m,x.y);if(i<0)o.missing.push(x.txt.trim()+(x.y?'':' '));return i}
 if(/\bbulan lalu\b|\blast month\b/.test(s)&&last>=0){var d=M.periods[last].date,mm=+d.slice(5,7)-1,yy=+d.slice(0,4);if(mm<1){mm=12;yy--}var i=monthIdx(M,mm,yy);if(i<0)o.missing.push('bulan lalu ('+C.dateLabel(yy+'-'+String(mm).padStart(2,'0')+'-01').replace(/^1 /,'')+')');o.kind='range';o.from=i;o.to=last;o.found=true;o.relMonth=true;return o}
 var mr=s.match(/\b(\d{1,2})\s+(?:periode|bulan|period|periods|months?)\s+(?:terakhir|terbaru|belakangan|last)\b|\blast\s+(\d{1,2})\s+(?:periods?|months?)\b/);
 if(mr){var k=+(mr[1]||mr[2]);o.kind='lastN';o.n=k;o.from=Math.max(0,last-k+1);o.to=last;o.found=true;o.short=n<k;return o}
 if(/\b(semua|seluruh|sepanjang|all)\s+(periode|bulan|period|periods|data)\b|\bselama (periode|data)\b|\bsepanjang\b/.test(s)){o.kind='all';o.from=0;o.to=last;o.found=true;return o}
 if(/\b(sejak|since|mulai dari|dari sejak)\b/.test(s)&&mons.length){var i2=res(mons[0]);o.kind='range';o.from=i2;o.to=last;o.found=true;return o}
 if(mons.length>=2&&/\b(ke|sampai|hingga|to|until|-|dan|vs|versus|dibanding\w*)\b/.test(s)){var a=res(mons[0]),b=res(mons[1]);o.kind='range';o.from=a;o.to=b;o.found=true;if(a>b&&b>=0){o.from=b;o.to=a}return o}
 if(mons.length===1){var i3=res(mons[0]);o.kind='at';o.at=i3;o.found=true;if(/\b(dibanding\w*|dari|vs|versus|compared|since)\b/.test(s)&&i3>=0&&i3<last){o.kind='range';o.from=i3;o.to=last}return o}
 if(/\b(awal|pertama|first period|earliest)\b/.test(s)&&/\bperiode\b/.test(s)){o.kind='at';o.at=0;o.found=true;return o}
 if(/\b(sebelumnya|previous|prior|sebelum itu)\b/.test(s)){o.prev=true;o.found=true}
 if(/\b(terbaru|terakhir|terkini|latest|current|bulan ini|sekarang|saat ini|most recent)\b/.test(s)){o.kind='at';o.at=last;o.found=true}
 return o}

/* ---- entitas ---- */
var INV_CUE=/^(investor|oleh|milik|portofolio|portfolio|punya|nama|holder|owner|dimiliki)$/,STK_CUE=/^(saham|emiten|kode|ticker|perusahaan|stock|company|shares)$/;
function resolveEntities(raw,M){var NZ=C.NOISE,selfIds=new Set();M.selfOf.forEach(function(s){s.forEach(function(id){selfIds.add(id)})});var R=C.registry(M),rt=raw.split(/[^A-Za-z0-9]+/).filter(Boolean),lt=rt.map(norm),used=new Array(rt.length).fill(false),
 out={tickers:[],investors:[],stockCands:[],clarify:null,unknown:[]};
 var nameRun=new Array(rt.length).fill(false),mixed=rt.some(function(w){return /[a-z]/.test(w)});
 if(mixed){var i0=0;while(i0<rt.length){if(!/^[A-Z]{2,}$/.test(rt[i0])){i0++;continue}var j0=i0;while(j0<rt.length&&/^[A-Z]{2,}$/.test(rt[j0]))j0++;
  if(j0-i0>=2){var allT=true;for(var q0=i0;q0<j0;q0++)if(!R.tick.has(lt[q0]))allT=false;if(!allT)for(var q1=i0;q1<j0;q1++)nameRun[q1]=true}i0=j0}}
 rt.forEach(function(w,i){var l=lt[i];if(!R.tick.has(l))return;
  if(nameRun[i])return;
  var up=w===w.toUpperCase()&&/[A-Z]/.test(w)&&w.length>=2,ok=up||!isGram(l)||STK_CUE.test(lt[i-1]||'')||rt.length<=2;
  if(ok){used[i]=true;var T=R.tick.get(l);if(!out.tickers.some(function(x){return x.t===T}))out.tickers.push({t:T,fuzzy:false})}});
 var runs=[],cur=[];
 rt.forEach(function(w,i){var l=lt[i];if(!used[i]&&l.length>=2&&!/^\d+$/.test(l)&&!isGram(l)){cur.push(i)}else{if(cur.length)runs.push(cur);cur=[]}});if(cur.length)runs.push(cur);
 runs.forEach(function(run){var done=false;
  for(var len=run.length;len>=1&&!done;len--)for(var st=0;st+len<=run.length&&!done;st++){var idxs=run.slice(st,st+len),ptoks=idxs.map(function(i){return lt[i]}).filter(function(w){return w.length>=2&&!NZ.has(w)});
   if(!ptoks.length||(len===1&&ptoks[0].length<4))continue;
   var im=C.matchPhrase(ptoks,R.invTok),sm=C.matchPhrase(ptoks,R.issTok);
   var p1=lt[idxs[0]-1]||'',p2=lt[idxs[0]-2]||'',cueI=INV_CUE.test(p1)||INV_CUE.test(p2),cueS=STK_CUE.test(p1)||STK_CUE.test(p2);
   if(im&&!cueI){var l2=im.list.filter(function(c){return !selfIds.has(c.id)});im=l2.length?{list:l2,fuzzy:im.fuzzy}:null}
   if(!im&&!sm)continue;
   var iTop=im?im.list[0].score:0,sTop=sm?sm.list[0].score:0,pick;
   if(cueI&&im)pick='i';else if(cueS&&sm)pick='s';else if(im&&!sm)pick='i';else if(sm&&!im)pick='s';else pick=iTop>sTop?'i':sTop>iTop?'s':'x';
   var m=pick==='i'?im:pick==='s'?sm:null;
   if(pick!=='x'&&m.list.length>30&&m.list[0].score<1&&!(cueI||cueS))continue;
   done=true;idxs.forEach(function(i){used[i]=true});
   if(pick==='x'){out.clarify={question:'name',options:im.list.slice(0,3).map(function(c){return {kind:'inv',id:c.id,label:M.inv.get(c.id).name}}).concat(sm.list.slice(0,3).map(function(c){return {kind:'stk',id:c.id,label:c.id+' · '+M.stocks.get(c.id).iss}})),phrase:ptoks.join(' ')};return}
   if(pick==='s'){var top=m.list.filter(function(c){return c.score===m.list[0].score});if(top.length===1||m.list.length===1)out.tickers.push({t:m.list[0].id,fuzzy:m.fuzzy,byName:ptoks.join(' ')});
    else out.clarify=out.clarify||{question:'stock',options:m.list.slice(0,6).map(function(c){return {kind:'stk',id:c.id,label:c.id+' · '+M.stocks.get(c.id).iss}}),phrase:ptoks.join(' ')}}
   else{var topI=m.list.filter(function(c){return c.score===m.list[0].score});
    if(topI.length===1||m.list.length===1)out.investors.push({id:m.list[0].id,name:M.inv.get(m.list[0].id).name,fuzzy:m.fuzzy,phrase:ptoks.join(' '),weak:ptoks.length===1&&!cueI});
    else out.clarify=out.clarify||{question:'inv',options:m.list.slice(0,6).map(function(c){return {kind:'inv',id:c.id,label:M.inv.get(c.id).name}}),phrase:ptoks.join(' '),total:m.list.length}}}});
 /* kode tak dikenal: huruf besar 3-6 karakter -> kandidat typo (tidak ditebak diam-diam) */
 rt.forEach(function(w,i){if(used[i])return;var l=lt[i];if(w.length>=3&&w.length<=6&&w===w.toUpperCase()&&/^[A-Z]+$/.test(w)&&!isGram(l)){
  var near=[];R.tick.forEach(function(T,k){if(Math.abs(k.length-l.length)<=1&&lev(k,l,1)<=1)near.push(T)});out.unknown.push({code:w,near:near.slice(0,4)})}});
 return out}

/* ---- slot parser ---- */
function parseSlots(raw0,M){var raw=String(raw0||'').trim().replace(/>=|≥/g,' lebih dari ').replace(/<=|≤/g,' kurang dari ').replace(/>/g,' lebih dari ').replace(/</g,' kurang dari ');
 var s=wd(raw),S={raw:raw0,s:s,assume:[]};
 S.has={};Object.keys(V).forEach(function(k){S.has[k]=V[k].test(s)});
 S.ent=resolveEntities(raw,M);S.period=parsePeriod(s,M);
 /* ambang */
 var thr={},re=/\b(lebih dari|lebih besar dari|di atas|diatas|minimal|min|paling sedikit|at least|more than|above|over|kurang dari|lebih kecil dari|di bawah|dibawah|maksimal|max|paling banyak|at most|less than|below|under)\s*([0-9][0-9.,]*)\s*(poin persentase|poin|persen|%|juta|jt|miliar|milyar|ribu|lembar|lot|million|billion|shares?|percent|pts?|investor|pemegang|holders?)?/g,m,ge=/^(lebih|di atas|diatas|minimal|min|paling sedikit|at least|more|above|over)/;
 var s2=s,chg=S.has.up||S.has.down||S.has.change,posCue=/\b(kepemilikan|porsi|miliki|memiliki|pegang|memegang|holding|stake|ownership)\b/.test(s);
 while((m=re.exec(s))){var ge1=ge.test(m[1]),val=pnum(m[2]),u=m[3]||'',key,mult=1;
  if(/^(juta|jt|million)$/.test(u))mult=1e6;else if(/^(miliar|milyar|billion)$/.test(u))mult=1e9;else if(u==='ribu')mult=1e3;else if(u==='lot')mult=100;
  var kind=/poin|pts?/.test(u)?'pp':/persen|%|percent/.test(u)?'pct':/investor|pemegang|holder/.test(u)?'n':/juta|jt|miliar|milyar|ribu|lembar|lot|million|billion|share/.test(u)?'sh':(val>=1000?'sh':'pct');
  if(kind==='pct'){if(chg&&!posCue){key=ge1?'minRel':'maxRel';S.assume.push('rel')}else key=ge1?'minPc':'maxPc'}
  else if(kind==='pp')key=ge1?'minDpp':'maxDpp';else if(kind==='n')key=ge1?'minN':'maxN';else key=chg&&!posCue?(ge1?'minDsh':'maxDsh'):(ge1?'minSh':'maxSh');
  thr[key]=val*mult;s2=s2.replace(m[0],' ')}
 S.thr=thr;
 /* filter + negasi */
 var f={},toks=s.split(' '),neg=function(rx){var m2=rx.exec(s);if(!m2)return false;var pre=s.slice(Math.max(0,m2.index-24),m2.index);return V.not.test(pre)};
 if(S.has.foreign&&S.has.local){}else if(S.has.foreign){f.lf='F';f.notLf=neg(V.foreign)}else if(S.has.local){f.lf='L';f.notLf=neg(V.local)}
 if(S.has.ind&&S.has.inst){}else if(S.has.ind){f.grp='I';f.notGrp=neg(V.ind)}else if(S.has.inst){f.grp='N';f.notGrp=neg(V.inst)}
 var tys=[];TYPES.forEach(function(x){var mm=x[0].exec(s);if(!mm)return;if(x[1]==='bank'&&!/\b(investor|pemegang|oleh|tipe|jenis|type)\s+(?:\w+\s+)?bank\b/.test(s))return;tys.push({s:x[1],neg:V.not.test(s.slice(Math.max(0,mm.index-24),mm.index))})});
 if(tys.length){f.types=tys.map(function(x){return x.s});f.notType=tys.every(function(x){return x.neg})}
 S.filter=f;
 /* arah, metrik, urutan, limit */
 var up=S.has.up,dn=S.has.down;S.dir=up&&dn?'both':up?'up':dn?'down':null;
 if(/\b(naik atau turun|perubahan terbesar|biggest (?:change|mover)|paling berubah|paling aktif)\b/.test(s))S.dir='both';
 S.metric=/\b(poin|pp|point|points|persentase kepemilikan)\b/.test(s)?'pp':/\b(lembar|shares?|lot)\b/.test(s)?'shares':/\b(relatif|pertumbuhan|growth)\b/.test(s)?'rel':/\b(jumlah investor|banyak investor|berapa investor|number of investors|how many investors|jumlah pemegang)\b/.test(s)?'holders':/\b(skor|score|alpha)\b/.test(s)?'score':null;
 S.asc=/\b(terkecil|tersedikit|terendah|paling sedikit|smallest|lowest|least|ascending|naik urut)\b/.test(s2);
 var lm=s2.match(/\b(?:top|teratas|best|first|show|tampilkan|ambil|list)\s*(\d{1,3})\b|\b(\d{1,3})\s*(?:saham|emiten|stocks?|investor|teratas|terbaik|top|besar|pemegang|holders?)\b/);
 S.limit=lm?Math.min(50,+(lm[1]||lm[2])):((s2.match(/\b(top|teratas)\s+(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|one|two|three|four|five|six|seven|eight|nine|ten)\b/)||[])[2]?NUMW[(s2.match(/\b(top|teratas)\s+(\w+)\b/)||[])[2]]:null);
 var sk=s.match(/\b(\d{1,2})\s*(?:periode|period)\b/);S.streak=S.has.streak?{n:sk?+sk[1]:3,dir:dn&&!up?'down':'up'}:null;
 S.compareCue=S.has.compare||(S.ent.tickers.length>=2&&/\b(dan|and|dengan|with|dibanding\w*)\b/.test(s));
 S.wantsScore=S.has.best;
 return S}

G.__parse={STOP:STOP,V:V,isGram:isGram,parseSlots:parseSlots,parsePeriod:parsePeriod,resolveEntities:resolveEntities,pnum:pnum,NUMW:NUMW};
})(typeof window!=='undefined'?window:globalThis);
