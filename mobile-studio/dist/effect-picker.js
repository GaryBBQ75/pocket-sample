'use strict';
const effectGroups=[{id:'all',name:'Tous'},{id:'delay',name:'Échos',types:['lib:delay','lib:diffdelay','lib:tapedelay','lib:sampledelay','lib:comb']},{id:'space',name:'Espaces',types:['lib:small','lib:medium','lib:large','lib:spring']},{id:'filter',name:'Filtres',types:['lib:hp','lib:lp','lib:bp','lib:wah']},{id:'motion',name:'Mouvement',types:['lib:chorus','lib:ensemble','lib:multichorus','lib:phaser','lib:flanger','lib:pan','ring']},{id:'dynamics',name:'Dynamique',types:['lib:buscomp','lib:limiter','lib:pumper','lib:transient','lib:gate']},{id:'colour',name:'Couleur',types:['lib:amp','lib:tube','lib:clipper','lib:vintage','lib:vinyl','lib:tape','lib:lofi']}];
const effectDescriptions={off:'Signal sans traitement','lib:delay':'Répétitions régulières','lib:diffdelay':'Échos diffus','lib:tapedelay':'Écho à bande','lib:sampledelay':'Décalage très court','lib:comb':'Résonances métalliques','lib:small':'Pièce courte','lib:medium':'Pièce chaleureuse','lib:large':'Grande profondeur','lib:spring':'Ressort vibrant','lib:hp':'Retirer les graves','lib:lp':'Adoucir les aigus','lib:bp':'Garder une bande','lib:wah':'Filtre en mouvement','lib:chorus':'Doubler et élargir','lib:ensemble':'Plusieurs voix','lib:multichorus':'Texture épaisse','lib:phaser':'Balayage tournant','lib:flanger':'Balayage métallique','lib:pan':'Voyage gauche-droite',ring:'Timbre robotique','lib:buscomp':'Lier le mix','lib:limiter':'Contenir les crêtes','lib:pumper':'Pulsation au tempo','lib:transient':'Sculpter l’attaque','lib:gate':'Couper le signal faible','lib:amp':'Couleur d’ampli','lib:tube':'Chaleur saturée','lib:clipper':'Écrêtage doux','lib:vintage':'Patine numérique','lib:vinyl':'Grain du vinyle','lib:tape':'Chaleur de bande','lib:lofi':'Réduire la définition'};
const effectPaths={
'off':'<path d="M5 16h22"/>',
'lib:delay':'<path d="M6 9v14m7-11v8m7-6v4m7-3v2"/>',
'lib:diffdelay':'<path d="M5 9v14m7-13v12m7-10v8m7-7v6"/>',
'lib:tapedelay':'<circle cx="10" cy="13" r="5"/><circle cx="23" cy="13" r="5"/><path d="M6 17v8h21v-8M10 22h12"/>',
'lib:sampledelay':'<path d="M5 22v-12h8v12m5-12v12h9V10"/>',
'lib:comb':'<path d="M4 24 8 9l4 15 4-15 4 15 4-15 4 15"/>',
'lib:small':'<path d="M8 9h16v16H8Z M12 13h8m-8 4h8m-8 4h5"/>',
'lib:medium':'<path d="M5 7h22v20H5Z M10 12v10m5-8v6m5-4v2"/>',
'lib:large':'<path d="M4 5h24v24H4Z M10 11q12 5 0 10m5-13q15 8 0 16"/>',
'lib:spring':'<path d="M4 16h4l2-7 4 14 4-14 4 14 2-7h4"/>',
'lib:hp':'<path d="M4 26h24M6 23l9-15h12"/>',
'lib:lp':'<path d="M4 26h24M5 8h12l10 15"/>',
'lib:bp':'<path d="M4 26h24M5 23l7-15h8l7 15"/>',
'lib:wah':'<path d="M4 25h24M5 22l8-13 6 13 8-13M12 5h10m-3-3 3 3-3 3"/>',
'lib:chorus':'<path d="M4 12q4-10 8 0t8 0 8 0M4 22q4-10 8 0t8 0 8 0"/>',
'lib:ensemble':'<path d="M6 8h20M6 16h20M6 24h20"/><circle cx="12" cy="8" r="2"/><circle cx="21" cy="16" r="2"/><circle cx="15" cy="24" r="2"/>',
'lib:multichorus':'<path d="M4 8q4-7 8 0t8 0 8 0M4 16q4-7 8 0t8 0 8 0M4 24q4-7 8 0t8 0 8 0"/>',
'lib:phaser':'<circle cx="16" cy="16" r="11"/><path d="M16 5c-9 7 9 15 0 22"/>',
'lib:flanger':'<path d="M5 8c20 0 2 16 22 16M5 24c20 0 2-16 22-16"/>',
'lib:pan':'<path d="M4 16h24M9 11l-5 5 5 5m14-10 5 5-5 5"/>',
'ring':'<circle cx="12" cy="16" r="8"/><circle cx="21" cy="16" r="8"/>',
'lib:buscomp':'<path d="M5 26V5m0 21h22M9 23l9-12 9-4M6 12h7m-3-3 3 3-3 3"/>',
'lib:limiter':'<path d="M4 8h24M4 24l6-11 6 11 6-11 6 11"/>',
'lib:pumper':'<path d="M5 9c0 15 7 16 11 16V9c0 15 7 16 11 16"/>',
'lib:transient':'<path d="M4 25 9 6l4 19 5-10 4 10h6"/>',
'lib:gate':'<path d="M4 25h7V8h10v17h7"/>',
'lib:amp':'<rect x="6" y="4" width="20" height="24" rx="2"/><path d="M10 9h12"/><circle cx="16" cy="20" r="5"/>',
'lib:tube':'<rect x="9" y="4" width="14" height="22" rx="6"/><path d="M13 26v3m6-3v3M13 10l6 10m0-10-6 10"/>',
'lib:clipper':'<path d="M4 24 10 10h12l6 14M4 6h24"/>',
'lib:vintage':'<rect x="7" y="7" width="18" height="18" rx="2"/><path d="M12 3v4m8-4v4M12 25v4m8-4v4M3 12h4m-4 8h4m18-8h4m-4 8h4M12 17h4v-5h4v8"/>',
'lib:vinyl':'<circle cx="16" cy="16" r="11"/><circle cx="16" cy="16" r="3"/><path d="M8 15a8 8 0 0 1 7-7m2 16a8 8 0 0 0 7-7"/>',
'lib:tape':'<rect x="4" y="7" width="24" height="19" rx="2"/><circle cx="11" cy="15" r="4"/><circle cx="21" cy="15" r="4"/><path d="m10 26 2-4h8l2 4"/>',
'lib:lofi':'<path d="M4 24h5V13h6V7h6v12h7"/>'
};
function effectIcon(type){return '<svg class="effect-icon" viewBox="0 0 32 32" aria-hidden="true">'+(effectPaths[type]||effectPaths.off)+'</svg>'}
let effectSlot=0,effectCategory='all',effectOwner=null,effectPad=0,effectScope='master';
const effectDialog=document.createElement('dialog');effectDialog.id='effectSheet';effectDialog.className='effect-sheet';effectDialog.setAttribute('aria-labelledby','effectTitle');effectDialog.innerHTML='<div class="sheet-head"><div><h2 id="effectTitle">Choisir un effet</h2><p id="effectContext"></p></div><button class="pill" id="effectClose">Fermer</button></div><div class="effect-categories" id="effectCategories" aria-label="Familles d’effets"></div><div class="effect-grid" id="effectGrid"></div>';document.body.append(effectDialog);$('#effectClose').onclick=()=>effectDialog.close();
function openEffectPicker(slot){effectSlot=slot;effectOwner=state;effectPad=state.selected;effectScope=rackScope;effectCategory='all';$('#effectContext').textContent=(rackScope==='master'?'Master · tous les pads':label(effectPad)+' · '+state.pads[effectPad].name)+' · FX '+(slot+1);renderEffectPicker();open('effectSheet')}
function renderEffectPicker(){const tabs=$('#effectCategories');tabs.replaceChildren();for(const group of effectGroups){const b=document.createElement('button');b.textContent=group.name;b.classList.toggle('active',effectCategory===group.id);b.setAttribute('aria-pressed',effectCategory===group.id);b.onclick=()=>{effectCategory=group.id;renderEffectPicker()};tabs.append(b)}const types=effectCategory==='all'?['off',...effectGroups.flatMap(g=>g.types||[])]:effectGroups.find(g=>g.id===effectCategory).types,host=$('#effectGrid');host.replaceChildren();const selected=rackSettings()[effectSlot].type;for(const type of types){const b=document.createElement('button');b.className='effect-choice';b.classList.toggle('selected',type===selected);b.setAttribute('aria-pressed',type===selected);b.setAttribute('aria-label',type==='off'?'Aucun effet':PocketFX.names[type]?.replace(' · avancé','')||type);const name=document.createElement('strong');name.textContent=type==='off'?'Aucun effet':PocketFX.names[type]?.replace(' · avancé','')||type;const desc=document.createElement('small');desc.textContent=effectDescriptions[type];b.innerHTML=effectIcon(type);b.append(name,desc);b.onclick=()=>{if(state!==effectOwner||rackScope!==effectScope||rackScope==='pad'&&state.selected!==effectPad){effectDialog.close();message('La cible a changé. Choisis à nouveau ton effet.');return}if(type!==selected)changeRack(effectSlot,{type,wet:.35});effectDialog.close()};host.append(b)}host.scrollTop=0}
