function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2800)}
async function loadSiteStatus(){try{const r=await fetch('admin/status.json',{cache:'no-store'});if(!r.ok)return;const s=await r.json();if(s.maintenance){document.querySelectorAll('.featured,.packs,.dark').forEach(el=>el.hidden=true);showToast('سرویس موقتاً در حالت نگهداری است')}else if(s.premiumEnabled===false){document.querySelectorAll('.featured .buy,.packs .hot').forEach(el=>el.hidden=true)}}catch(e){}}
document.addEventListener('DOMContentLoaded',loadSiteStatus);
document.addEventListener('contextmenu',e=>{if(e.target.closest('.featured,.fighter-card,.hero-card'))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(e.target.closest('img,.featured,.fighter-card,.hero-card'))e.preventDefault()});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['s','u'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key==='F12')e.preventDefault()});
