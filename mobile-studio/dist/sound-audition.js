'use strict';
let soundVoice=null,soundListenLoop=false,soundListenOwner=null,soundListenPad=null,soundListenEpoch=0,soundListenData=null,soundListenRight=null;
function renderSoundListen(){const on=!!soundVoice;$('#soundListen').textContent=on?'■ Arrêter l’écoute':'▶ Écouter ce son';$('#soundListen').setAttribute('aria-pressed',on);$('#soundLoop').setAttribute('aria-pressed',soundListenLoop);$('#soundLoop').classList.toggle('active',soundListenLoop)}
function stopSoundListen(){soundListenEpoch++;const old=soundVoice;soundVoice=null;if(old)audio.release(old);soundListenOwner=null;soundListenPad=null;soundListenData=null;soundListenRight=null;renderSoundListen()}
async function startSoundListen(){stopSoundListen();const epoch=soundListenEpoch,owner=state,index=state.selected,pad=state.pads[index];if(pad.data.length<2){message('Ajoute un son avant de l’écouter.');return}try{await unlock();if(epoch!==soundListenEpoch||state!==owner||state.pads[index]!==pad||screen!=='edit')return;soundListenOwner=owner;soundListenPad=pad;soundListenData=pad.data;soundListenRight=pad.right;const voice=audio.play({...pad,mode:soundListenLoop?'loop':'one'},index,{force:true,preview:true});if(!voice)return;soundVoice=voice;const ended=voice.src.onended;voice.src.onended=()=>{ended?.();if(soundVoice===voice){soundVoice=null;renderSoundListen()}};renderSoundListen()}catch(e){message(e.message)}}
$('#soundListen').onclick=()=>soundVoice?stopSoundListen():startSoundListen();$('#soundLoop').onclick=()=>{soundListenLoop=!soundListenLoop;const playing=!!soundVoice;renderSoundListen();if(playing)startSoundListen()};
// The waveform audition shares the same transport and its optional repeat mode.
$('#audition').onclick=()=>soundVoice?stopSoundListen():startSoundListen();
function syncSoundListen(){if(!soundVoice)return;if(soundListenOwner!==state||soundListenPad!==state.pads[state.selected]||soundListenPad.data!==soundListenData||soundListenPad.right!==soundListenRight||screen!=='edit'){stopSoundListen();return}const p=soundListenPad,c=audio.ctx;try{soundVoice.src.loopStart=p.start*p.data.length/RATE;soundVoice.src.loopEnd=p.end*p.data.length/RATE;soundVoice.src.playbackRate.setTargetAtTime(2**(p.pitch/12),c.currentTime,.015);soundVoice.pan.pan.setTargetAtTime(p.pan,c.currentTime,.015);soundVoice.g.gain.setTargetAtTime(p.volume,c.currentTime,.015)}catch{}}
const editorListenCore=renderEditor;renderEditor=()=>{editorListenCore();syncSoundListen();renderSoundListen()};const screenListenCore=setScreen;setScreen=id=>{if(id!=='edit')stopSoundListen();screenListenCore(id)};const renderListenCore=render;render=()=>{renderListenCore();syncSoundListen()};
const stopListenCore=stop;stop=()=>{stopSoundListen();stopListenCore()};
for(const button of $$('[data-mode]')){const core=button.onclick;button.onclick=()=>{const restart=!!soundVoice;core();if(restart)startSoundListen()}}
// End a preview before sample replacement/crop, avoiding a stale old-buffer loop.
for(const id of ['normalize','reverse','cropSample','deletePad','stopPad']){const el=$('#'+id),core=el.onclick;el.onclick=(...args)=>{stopSoundListen();return core?.(...args)}}
window.addEventListener('pagehide',stopSoundListen);renderSoundListen();

const waveListenCore=drawWave;drawWave=()=>{waveListenCore();syncSoundListen()};
