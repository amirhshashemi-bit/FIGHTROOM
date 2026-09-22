const logEl=document.getElementById('log');
const auditKey='fightroom_admin_audit_v1';
function audit(message){const row=new Date().toISOString()+' — '+message;let a=JSON.parse(localStorage.getItem(auditKey)||'[]');a=[row,...a].slice(0,50);localStorage.setItem(auditKey,JSON.stringify(a));logEl.textContent=a.join('\n');document.getElementById('auditCount').textContent=a.length}
function loadLog(){const a=JSON.parse(localStorage.getItem(auditKey)||'[]');logEl.textContent=a.length?a.join('\n'):'در انتظار رویداد...';document.getElementById('auditCount').textContent=a.length}
document.getElementById('continueBtn').addEventListener('click',()=>{document.getElementById('gate').classList.add('hidden');document.getElementById('panel').classList.remove('hidden');audit('Admin UI opened');});
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>audit('Requested action: '+b.dataset.action)));
document.getElementById('kill').addEventListener('click',()=>{audit('Kill switch requested — server-side enforcement required');alert('در رابط فعلی فقط درخواست ثبت شد. توقف واقعی باید سمت سرور/Worker اجرا شود.');});
loadLog();