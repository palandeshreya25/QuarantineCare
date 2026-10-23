const TH=38.0, CAP=74, KEY='qc_v1';
let S={patients:[]}, view='nurse', sub='todo';
const day=(o=0)=>{const d=new Date();d.setDate(d.getDate()+o);return d.toLocaleDateString('en-CA')};
const now=()=>new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=day();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const r=localStorage.getItem(KEY);if(r){S=JSON.parse(r);return}}catch(e){}seed();}
function seed(){
  const F=['Aarav','Priya','Rohan','Sneha','Vikram','Anita','Karan','Meera','Arjun','Pooja','Rahul','Divya','Imran','Neha','Suresh','Kavita'];
  const L=['Sharma','Patil','Iyer','Khan','Desai','Nair','Gupta','Joshi','Singh','Mehta','Reddy','Shah'];
  const R=n=>Math.floor(Math.random()*n); S={patients:[]};
  for(let i=1;i<=CAP;i++){
    const age=R(9), rec=2+R(8), p={id:'p'+i,name:F[R(F.length)]+' '+L[R(L.length)],bed:i,admitted:day(-age),status:'active',temps:{},visits:{}};
    for(let k=age;k>=1;k--){ if(Math.random()<.1)continue; const sick=(age-k)<rec;
      p.temps[day(-k)]={t:+(sick?38.2+Math.random()*1.8:36.5+Math.random()*1.1).toFixed(1),time:'09:00'}; p.visits[day(-k)]={time:'12:00',note:''}}
    if(Math.random()<.5){const sick=age<rec;p.temps[today]={t:+(sick?38.2+Math.random()*1.5:36.5+Math.random()*1.1).toFixed(1),time:'08:30'};
      if(Math.random()<.4)p.visits[today]={time:'11:00',note:''}}
    S.patients.push(p)}
  for(let i=0;i<40;i++)S.patients.push({id:'h'+i,name:'(archived)',bed:0,admitted:day(-20),status:i<5?'deceased':'discharged',outcome:day(-3-R(10)),los:6+R(6),temps:{},visits:{}});
  save();
}
const act=()=>S.patients.filter(p=>p.status==='active').sort((a,b)=>a.bed-b.bed);
function streak(p){let n=0;for(let k=0;k<40;k++){const r=p.temps[day(-k)];if(!r){if(k===0)continue;break}if(r.t>=TH)break;n++}return n}
const ready=p=>streak(p)>=3;
function chips(p){let h='<div class="chips">';for(let k=6;k>=0;k--){const r=p.temps[day(-k)];h+=`<span class="${r?(r.t>=TH?'f':'n'):''}" title="${day(-k)}">${r?r.t.toFixed(1):'–'}</span>`}return h+'</div><div class="mu" style="font-size:11px">Last 7 days (oldest → today)</div>'}
function find(id){return S.patients.find(p=>p.id===id)}

function nurse(){
  const A=act(), done=A.filter(p=>p.temps[today]).length;
  let L=A.filter(p=>sub==='done'?p.temps[today]:!p.temps[today]);
  let h=`<div class="mu">${done} of ${A.length} temperatures recorded today</div><div class="bar"><i style="width:${A.length?done/A.length*100:0}%"></i></div>
  <div class="sub"><button data-sub="todo" class="${sub!=='done'?'on':''}">To measure (${A.length-done})</button><button data-sub="done" class="${sub==='done'?'on':''}">Done (${done})</button></div>`;
  if(!L.length)h+=`<div class="empty">${sub==='done'?'Nothing recorded yet.':'🎉 All patients measured today.'}</div>`;
  L.forEach(p=>{const r=p.temps[today];
    h+=`<div class="card"><div class="row"><div><span class="bed">Bed ${p.bed}</span><b>${esc(p.name)}</b></div>`+
    (r&&!p.edit?`<div><span class="tag ${r.t>=TH?'t-bad':'t-ok'}">${r.t.toFixed(1)} °C</span> <span class="mu">${r.time}</span> <button class="btn sec" data-act="edit" data-id="${p.id}">Correct</button></div>`
    :`<div><input type="number" step="0.1" min="30" max="45" inputmode="decimal" placeholder="°C" id="t-${p.id}" value="${r?r.t:''}"> <button class="btn" data-act="temp" data-id="${p.id}">Save</button></div>`)+
    `</div></div>`});
  return h}

function doctor(){
  const A=act(), seen=p=>p.visits[today], meas=p=>p.temps[today];
  const tabs={ready:A.filter(p=>meas(p)&&!seen(p)),wait:A.filter(p=>!meas(p)&&!seen(p)),seen:A.filter(seen)};
  if(!tabs[sub])sub='ready';
  let h=`<div class="sub"><button data-sub="ready" class="${sub==='ready'?'on':''}">Ready to visit (${tabs.ready.length})</button><button data-sub="wait" class="${sub==='wait'?'on':''}">Awaiting temp (${tabs.wait.length})</button><button data-sub="seen" class="${sub==='seen'?'on':''}">Seen (${tabs.seen.length})</button></div>`;
  if(sub==='wait')h+='<div class="mu" style="margin-bottom:10px">These patients have no temperature yet — nurses still need to measure them. Visit later.</div>';
  const L=tabs[sub]; if(!L.length)h+='<div class="empty">No patients in this list.</div>';
  L.forEach(p=>{const r=p.temps[today],s=streak(p),v=p.visits[today];
    h+=`<div class="card"><div class="row"><div><span class="bed">Bed ${p.bed}</span><b>${esc(p.name)}</b><div class="mu">Day ${Math.round((new Date(today)-new Date(p.admitted))/864e5)+1} · fever-free streak: ${s} day${s===1?'':'s'}</div></div>
    <div>${r?`<span class="tag ${r.t>=TH?'t-bad':'t-ok'}">${r.t.toFixed(1)} °C at ${r.time}</span>`:'<span class="tag t-warn">Not measured</span>'}</div></div>${chips(p)}
    ${ready(p)?'<div class="alert t-ok" style="margin:10px 0 0">✔ Meets 3-day fever-free criterion — admin has been flagged automatically.</div>':''}
    ${v?`<div class="mu" style="margin-top:8px">Visited ${v.time}${v.note?' — '+esc(v.note):''}</div>`:
    `<div class="row" style="margin-top:10px"><input style="flex:1;min-width:160px" placeholder="Treatment / notes (optional)" id="n-${p.id}"><button class="btn ok" data-act="visit" data-id="${p.id}">Mark visited</button><button class="btn sec bad" style="color:var(--bad)" data-act="death" data-id="${p.id}">Record death</button></div>`}</div>`});
  return h}

function admin(){
  const A=act(), R=A.filter(ready), free=CAP-A.length;
  const used=new Set(A.map(p=>p.bed)), fb=[];for(let i=1;i<=CAP;i++)if(!used.has(i))fb.push(i);
  let h=`<h2 style="margin-top:0">Ready for discharge (${R.length})</h2>`;
  if(!R.length)h+='<div class="empty">No patients meet the criterion right now.</div>';
  R.forEach(p=>{const s=streak(p);h+=`<div class="card"><div class="row"><div><span class="bed">Bed ${p.bed}</span><b>${esc(p.name)}</b><div class="mu">${s} fever-free days${s>3?` · <b style="color:var(--bad)">${s-3} extra day(s) in centre</b>`:''}</div></div><button class="btn ok" data-act="disch" data-id="${p.id}">Discharge</button></div></div>`});
  h+=`<h2>Admit patient (${free} bed${free===1?'':'s'} free)</h2><div class="card">`+(free?`<div class="row"><input id="an" placeholder="Patient name" style="flex:1;min-width:160px"><select id="ab" style="padding:8px;border-radius:8px">${fb.map(b=>`<option>${b}</option>`).join('')}</select><button class="btn" data-act="admit">Admit</button></div>`:'<span class="mu">Centre is at full capacity.</span>')+'</div>';
  return h}

function stats(){
  const A=act(),all=S.patients,cured=all.filter(p=>p.status==='discharged').length,dead=all.filter(p=>p.status==='deceased').length,n=cured+dead;
  const mr=n?dead/n*100:0, sr=n?cured/n*100:0, meas=A.filter(p=>p.temps[today]).length, vis=A.filter(p=>p.visits[today]).length;
  const extra=A.filter(ready).reduce((a,p)=>a+streak(p)-3,0), los=all.filter(p=>p.status==='discharged'&&p.los);
  let h=n?(mr>15?`<div class="alert t-bad">⚠ Mortality ${mr.toFixed(1)}% is ABOVE the 15% benchmark — review treatment quality.</div>`:`<div class="alert t-ok">Mortality ${mr.toFixed(1)}% is within the 15% benchmark.</div>`):'';
  h+=`<div class="grid">
  <div class="stat"><b>${A.length}/${CAP}</b>Beds occupied</div>
  <div class="stat"><b>${sr.toFixed(1)}%</b>Success rate (target 85%)</div>
  <div class="stat"><b>${mr.toFixed(1)}%</b>Mortality (limit 15%)</div>
  <div class="stat"><b>${cured} / ${dead}</b>Cured / deceased</div>
  <div class="stat"><b>${A.length?Math.round(meas/A.length*100):0}%</b>Temps taken today</div>
  <div class="stat"><b>${A.length?Math.round(vis/A.length*100):0}%</b>Doctor-visited today</div>
  <div class="stat"><b>${extra}</b>Excess patient-days (ready, not discharged)</div>
  <div class="stat"><b>${los.length?(los.reduce((a,p)=>a+p.los,0)/los.length).toFixed(1):'–'}</b>Avg stay, days</div></div>
  <div class="mu">Rates use closed cases only (discharged + deceased). Fever threshold: ${TH} °C. A fever-free day needs a recorded reading below threshold; missing readings break the streak.</div>
  <p><button class="btn sec" data-act="reset">Reset demo data</button></p>`;
  return h}

function render(){
  const tabs=[['nurse','🌡 Nurse'],['doctor','🩺 Doctor'],['admin','📋 Admin'],['stats','📊 Stats']];
  document.getElementById('nav').innerHTML=tabs.map(([k,l])=>`<button data-view="${k}" class="${view===k?'on':''}">${l}${k==='admin'&&act().filter(ready).length?` (${act().filter(ready).length})`:''}</button>`).join('');
  document.getElementById('app').innerHTML={nurse,doctor,admin,stats}[view]();
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.view){view=b.dataset.view;sub=view==='nurse'?'todo':'ready';return render()}
  if(b.dataset.sub){sub=b.dataset.sub;return render()}
  const a=b.dataset.act,p=find(b.dataset.id);
  if(a==='edit'){p.edit=true}
  if(a==='temp'){const v=parseFloat(document.getElementById('t-'+p.id).value);
    if(!(v>=30&&v<=45)){alert('Enter a temperature between 30 and 45 °C');return}
    p.temps[today]={t:v,time:now()};delete p.edit}
  if(a==='visit'){p.visits[today]={time:now(),note:document.getElementById('n-'+p.id).value.trim()}}
  if(a==='death'){if(!confirm('Record death of '+p.name+'?'))return;p.status='deceased';p.outcome=today;p.los=Math.max(1,Math.round((new Date(today)-new Date(p.admitted))/864e5));p.bed=0}
  if(a==='disch'){if(!confirm('Discharge '+p.name+'?'))return;p.status='discharged';p.outcome=today;p.los=Math.max(1,Math.round((new Date(today)-new Date(p.admitted))/864e5));p.bed=0}
  if(a==='admit'){const n=document.getElementById('an').value.trim();if(!n){alert('Enter a name');return}
    S.patients.push({id:'p'+Date.now(),name:n,bed:+document.getElementById('ab').value,admitted:today,status:'active',temps:{},visits:{}})}
  if(a==='reset'){if(!confirm('Replace all data with new demo data?'))return;seed()}
  save();render();
});
load();render();
