function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2800)}
document.addEventListener('contextmenu',e=>{if(e.target.closest('.featured,.fighter-card,.hero-card'))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(e.target.closest('img,.featured,.fighter-card,.hero-card'))e.preventDefault()});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&['s','u'].includes(e.key.toLowerCase()))e.preventDefault();if(e.key==='F12')e.preventDefault()});
