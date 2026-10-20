/* ===================================================================
   SpotEngine — mesin tanya-jawab data kepemilikan saham (tanpa DOM, tanpa jaringan)
   Lapisan: A data model/adapter • B normalisasi • C registry+index • D parser NL
            E query planner • F executor analitik • G evidence • H composer
   =================================================================== */
(function(G){'use strict';
var THR=1; /* ambang pelaporan KSEI: pemegang di atas 1% */
function norm(s){return String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function wd(s){return norm(s).replace(/[^a-z0-9%.,\s\-\/]/g,' ').replace(/\s+/g,' ').trim()}
function r2(x){return Math.round(x*100)/100}
function lev(a,b,mx){if(Math.abs(a.length-b.length)>mx)return mx+1;var p=[],i,j;for(j=0;j<=b.length;j++)p[j]=j;
 for(i=1;i<=a.length;i++){var c=[i],lo=i;for(j=1;j<=b.length;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));if(c[j]<lo)lo=c[j]}if(lo>mx)return mx+1;p=c}return p[b.length]}
function median(a){if(!a.length)return null;var s=a.slice().sort(function(x,y){return x-y}),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2}
var MON={jan:1,januari:1,january:1,feb:2,februari:2,february:2,mar:3,maret:3,march:3,apr:4,april:4,mei:5,may:5,jun:6,juni:6,june:6,jul:7,juli:7,july:7,agu:8,agt:8,agustus:8,aug:8,august:8,sep:9,sept:9,september:9,okt:10,oktober:10,oct:10,october:10,nov:11,november:11,des:12,desember:12,dec:12,december:12};
var MONID=['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],MONEN=['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dateLabel(iso,lang){var y=iso.slice(0,4),m=+iso.slice(5,7),d=+iso.slice(8,10);return d+' '+(lang==='en'?MONEN:MONID)[m]+' '+y}

/* ------------------ A/B. model data ------------------ */
/* input: {periods:[{id,date:'YYYY-MM-DD',label,src,rows:[{t,iss,inv,type,lf,grp,sh,pc,self}]}]}
   Nilai kosong ≠ nol: holder yang tidak ada di sebuah periode disimpan sebagai null (tidak tercatat). */
function buildModel(input){
 var ps=input.periods.slice().sort(function(a,b){return a.date<b.date?-1:a.date>b.date?1:0});
 var M={periods:[],stocks:new Map(),inv:new Map(),hist:new Map(),selfOf:new Map(),total:new Map(),counts:{rows:0},_reg:null};
 ps.forEach(function(p,i){M.periods.push({i:i,id:p.id,date:p.date,label:p.label||p.date,src:p.src||'',n:p.rows.length});M.counts.rows+=p.rows.length});
 var P=ps.length;
 ps.forEach(function(p,pi){p.rows.forEach(function(r){
  var t=String(r.t).toUpperCase(),id=r.invId||String(r.inv).toUpperCase(),s=M.stocks.get(t);
  if(!s)M.stocks.set(t,s={t:t,iss:r.iss||''});else if(r.iss)s.iss=r.iss;
  var ii=M.inv.get(id);if(!ii)M.inv.set(id,ii={id:id,name:r.inv,type:r.type||'',lf:r.lf||'',grp:r.grp||'',n:0});
  ii.name=r.inv;if(r.type)ii.type=r.type;if(r.lf)ii.lf=r.lf;if(r.grp)ii.grp=r.grp;
  var h=M.hist.get(t);if(!h)M.hist.set(t,h=new Map());var a=h.get(id);if(!a){a=new Array(P);for(var k=0;k<P;k++)a[k]=null;h.set(id,a);ii.n++}
  a[pi]={sh:Number(r.sh)||0,pc:Number(r.pc)||0};
  if(r.self){var so=M.selfOf.get(t);if(!so)M.selfOf.set(t,so=new Set());so.add(id)}
 })});
 /* total saham beredar tersirat = sh / pc × 100 (median per periode) */
 M.hist.forEach(function(h,t){var arr=new Array(P);for(var pi=0;pi<P;pi++){var v=[];h.forEach(function(a){var c=a[pi];if(c&&c.pc>0&&c.sh>0)v.push(c.sh/c.pc*100)});arr[pi]=median(v)}M.total.set(t,arr)});
 return M}
function isSelf(M,t,id){var s=M.selfOf.get(t);return !!(s&&s.has(id))}
function holdersAt(M,t,pi,opt){var h=M.hist.get(t),out=[];if(!h)return out;
 h.forEach(function(a,id){var c=a[pi];if(!c)return;var ii=M.inv.get(id);if(opt&&opt.noSelf&&isSelf(M,t,id))return;out.push({id:id,name:ii.name,type:ii.type,lf:ii.lf,grp:ii.grp,sh:c.sh,pc:c.pc,self:isSelf(M,t,id)})});
 return out.sort(function(x,y){return y.pc-x.pc||y.sh-x.sh})}
/* perubahan satu holder antar dua snapshot. new/exit memakai batas bawah konservatif karena sisi tak tercatat < ambang. */
function rowChange(M,t,id,pa,pb){var a=(M.hist.get(t).get(id)||[])[pa]||null,b=(M.hist.get(t).get(id)||[])[pb]||null,ii=M.inv.get(id),o={id:id,name:ii.name,type:ii.type,lf:ii.lf,grp:ii.grp,a:a,b:b,self:isSelf(M,t,id)};
 if(a&&b){o.state=b.pc>a.pc?'up':b.pc<a.pc?'down':'same';o.dp=r2(b.pc-a.pc);o.ds=b.sh-a.sh;o.rel=a.pc>0?o.dp/a.pc*100:null;o.relSh=a.sh>0?o.ds/a.sh*100:null;o.dpr=o.dp;o.dsr=o.ds;o.exact=true}
 else if(b){o.state='new';o.dp=null;o.ds=null;o.rel=null;o.dpr=Math.max(0,r2(b.pc-THR));o.dsr=b.pc>0?Math.round(b.sh*(b.pc-THR)/b.pc):0;o.exact=false}
 else if(a){o.state='exit';o.dp=null;o.ds=null;o.rel=null;o.dpr=-Math.max(0,r2(a.pc-THR));o.dsr=a.pc>0?-Math.round(a.sh*(a.pc-THR)/a.pc):0;o.exact=false}
 else return null;
 return o}
function passF(o,f){if(!f)return true;
 if(f.lf&&((o.lf===f.lf)===!!f.notLf))return false;
 if(f.grp&&((o.grp===f.grp)===!!f.notGrp))return false;
 if(f.types&&f.types.length){var m=f.types.some(function(s){return norm(o.type).indexOf(s)>=0});if(m===!!f.notType)return false}
 if(f.noSelf!==false&&o.self)return false;
 return true}
function changeRows(M,t,pa,pb,f){var h=M.hist.get(t),out=[];if(!h)return out;
 h.forEach(function(arr,id){var o=rowChange(M,t,id,pa,pb);if(o&&passF(o,f))out.push(o)});return out}
function netOf(rows){var up=0,dn=0,upS=0,dnS=0,nUp=0,nDn=0,nNew=0,nExit=0;
 rows.forEach(function(o){if(o.dpr>0){up+=o.dpr;upS+=o.dsr;nUp++}else if(o.dpr<0){dn+=o.dpr;dnS+=o.dsr;nDn++}if(o.state==='new')nNew++;if(o.state==='exit')nExit++});
 return {up:r2(up),dn:r2(dn),net:r2(up+dn),upS:upS,dnS:dnS,netS:upS+dnS,nUp:nUp,nDn:nDn,nNew:nNew,nExit:nExit,n:rows.length}}
function topHolder(M,t,pi){var h=holdersAt(M,t,pi,{noSelf:true});return h[0]||null}
function totalShift(M,t,pa,pb){var T=M.total.get(t);if(!T||T[pa]==null||T[pb]==null)return null;return T[pb]/T[pa]-1}

/* ------------------ C. registry & index ------------------ */
var NOISE_N=new Set(['pt','tbk','persero','perseroan','terbuka','the','co','ltd','limited','inc','corp','corporation','company','pte','plc','llc','tbk.','of','and']);
function ntoks(name){return wd(name).split(/[\s,.\-\/]+/).filter(function(w){return w.length>=2&&!NOISE_N.has(w)})}
function addIdx(m,k,v){var s=m.get(k);if(!s)m.set(k,s=new Set());s.add(v)}
function registry(M){if(M._reg)return M._reg;
 var r={tick:new Map(),issTok:new Map(),invTok:new Map()};
 M.stocks.forEach(function(s,t){r.tick.set(t.toLowerCase(),t);ntoks(s.iss).forEach(function(w){addIdx(r.issTok,w,t)})});
 M.inv.forEach(function(i,id){ntoks(i.name).forEach(function(w){addIdx(r.invTok,w,id)})});
 M._reg=r;return r}
/* cocokkan frasa (token) ke indeks. exact=1, prefix(>=4)=.8, fuzzy(lev<=1, len>=5)=.6 -> fuzzy ditandai. */
function matchPhrase(ptoks,idx){var cand=null,fz=false,score={};
 for(var i=0;i<ptoks.length;i++){var w=ptoks[i],set=new Map();
  if(idx.has(w))idx.get(w).forEach(function(id){set.set(id,1)});
  if(!set.size&&w.length>=4)idx.forEach(function(ids,k){if(k.indexOf(w)===0||(w.length>=5&&k.length>=5&&w.indexOf(k)===0))ids.forEach(function(id){if(!set.has(id))set.set(id,.8)})});
  if(!set.size&&w.length>=5)idx.forEach(function(ids,k){if(k.length>=5&&lev(w,k,1)<=1)ids.forEach(function(id){if(!set.has(id)){set.set(id,.6);fz=true}})});
  if(!set.size)return null;
  if(cand===null){cand=set;set.forEach(function(v,id){score[id]=v})}
  else{var nx=new Map();set.forEach(function(v,id){if(cand.has(id)){nx.set(id,1);score[id]=(score[id]||0)+v}});cand=nx;if(!cand.size)return null}}
 var out=[];cand.forEach(function(_,id){out.push({id:id,score:(score[id]||0)/ptoks.length})});
 out.sort(function(a,b){return b.score-a.score});return {list:out,fuzzy:fz&&out.length>0&&out[0].score<1}}

G.__core={norm:norm,wd:wd,r2:r2,lev:lev,median:median,MON:MON,dateLabel:dateLabel,buildModel:buildModel,isSelf:isSelf,holdersAt:holdersAt,rowChange:rowChange,passF:passF,changeRows:changeRows,netOf:netOf,topHolder:topHolder,totalShift:totalShift,ntoks:ntoks,NOISE:NOISE_N,registry:registry,matchPhrase:matchPhrase,THR:THR};
})(typeof window!=='undefined'?window:globalThis);
