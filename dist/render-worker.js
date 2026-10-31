import {makeDSP} from './dsp-runtime.js';
self.onmessage=({data})=>{
  let dsp;
  try{
    const {module,rate,settings,gain=1,left,right,mode}=data,frames=left.length;
    if(module){dsp=makeDSP(module,rate);dsp.configure(settings)}
    const pcmL=mode==='pcm'?new Float32Array(frames):null,pcmR=mode==='pcm'?new Float32Array(frames):null;
    const outL=new Float32Array(128),outR=new Float32Array(128),wav=mode==='pcm'?null:new ArrayBuffer(44+frames*4),view=wav?new DataView(wav):null;
    const str=(o,s)=>{for(let i=0;i<s.length;i++)view.setUint8(o+i,s.charCodeAt(i))};
    if(view){str(0,'RIFF');view.setUint32(4,36+frames*4,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);view.setUint32(24,rate,true);view.setUint32(28,rate*4,true);view.setUint16(32,4,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,frames*4,true);}

    let last=0;
    for(let offset=0;offset<frames;offset+=128){const n=Math.min(128,frames-offset);if(dsp)dsp.process(left.subarray(offset,offset+n),right.subarray(offset,offset+n),outL,outR,n);for(let j=0;j<n;j++){const l=(dsp?outL[j]:left[offset+j])*gain,r=(dsp?outR[j]:right[offset+j])*gain;if(pcmL){pcmL[offset+j]=Number.isFinite(l)?l:0;pcmR[offset+j]=Number.isFinite(r)?r:0}else{view.setInt16(44+(offset+j)*4,Math.max(-1,Math.min(1,Number.isFinite(l)?l:0))*32767,true);view.setInt16(46+(offset+j)*4,Math.max(-1,Math.min(1,Number.isFinite(r)?r:0))*32767,true)}}const progress=Math.floor((offset+n)/frames*100);if(progress>=last+10){last=progress;self.postMessage({progress})}}
    if(mode==='pcm')self.postMessage({left:pcmL,right:pcmR},[pcmL.buffer,pcmR.buffer]);else self.postMessage({wav},[wav]);
  }catch(error){self.postMessage({error:error.message})}finally{dsp?.dispose()}
};
