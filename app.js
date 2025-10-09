(function(){
const MODELS=[{id:'C3.2',portata:3200},{id:'C3.2S',portata:3200}];
function selectedIds(){return MODELS.map(m=>m.id)}
function buildQuery(extras){const p=new URLSearchParams(extras||{});return p.toString()}
document.getElementById('shareBtn').onclick=()=>{
  const url=location.origin+location.pathname+'?'+buildQuery({ids:selectedIds().join(',')});
  if(navigator.share) navigator.share({title:'CASCOS',url}); else {navigator.clipboard.writeText(url); alert('Link copiato\n'+url);}
};
document.getElementById('csvBtn').onclick=()=>{
  const lines=['Modello;Portata(kg)'].concat(MODELS.map(m=>[m.id,m.portata].join(';'))).join('\n');
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([lines],{type:'text/csv'})); a.download='cascos.csv'; a.click();
};
document.getElementById('pdfMultiBtn').onclick=()=>{
  const w=window.open('','_blank'); w.document.write('<pre>'+JSON.stringify(MODELS,null,2)+'</pre><script>setTimeout(()=>print(),200)<\/script>'); w.document.close();
};
})();