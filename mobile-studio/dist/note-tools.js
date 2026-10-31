/* Musical edits, independent of UI. Positions/durations use sixteenth-note units. */
(()=>{const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),snap=(x,grid)=>Math.round(x/grid)*grid;
function normalize(n,length,grid=1/24){return {...n,step:clamp(snap(n.step,grid),0,length-grid),pitch:clamp(Math.round(n.pitch),-24,24),duration:clamp(snap(n.duration,1/24),1/24,length-clamp(snap(n.step,grid),0,length-grid)),velocity:clamp(n.velocity,.05,1),gated:!!n.gated}}
function quantize(notes,length,grid=1,strength=1){return notes.map(n=>({...n,step:clamp(Math.round((n.step+(snap(n.step,grid)-n.step)*strength)*24)/24,0,length-1/24)}))}
function doubled(pattern){if(pattern.bars>=4)throw Error('La boucle fait déjà 4 mesures.');const length=pattern.bars*16;if(pattern.notes.length*2>8192)throw Error('Trop de notes pour doubler cette boucle.');return {...pattern,bars:pattern.bars*2,notes:[...pattern.notes.map(n=>({...n})),...pattern.notes.map(n=>({...n,step:n.step+length}))]}}
function halved(pattern){if(pattern.bars<=1)throw Error('La boucle fait déjà une mesure.');const bars=pattern.bars/2;return {...pattern,bars,notes:pattern.notes.filter(n=>n.step<bars*16).map(n=>({...n,duration:Math.min(n.duration,bars*16-n.step)}))}}
function reverse(notes,length){return notes.map(n=>({...n,step:Math.max(0,Math.round((length-n.step-Math.min(n.duration,length-n.step))*24)/24)}))}
const visible=(n,page)=>Math.max(0,Math.min(n.step+n.duration,(page+1)*16)-Math.max(n.step,page*16));globalThis.StudioNotes={normalize,quantize,doubled,halved,reverse,visible};if(typeof module!=='undefined')module.exports=StudioNotes;
})();
