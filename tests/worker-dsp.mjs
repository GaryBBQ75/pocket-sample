import fs from 'node:fs';
import assert from 'node:assert/strict';
import {makeDSP} from '../dist/dsp-runtime.js';
const module=await WebAssembly.compile(fs.readFileSync('dist/pocket-dsp.wasm'));
const left=Float32Array.from({length:4410},(_,i)=>Math.sin(i*.1)*.3),right=left.slice();
const settings={enabled:true,delayEnabled:true,duration:80,density:40,pitch:7,window:.4,stereo:.8,feedback:.25,wet:.65,freeze:false,reverse:false,delayLeft:13,delayRight:47};
let result;globalThis.self={postMessage(data){if(data.wav||data.error||data.left)result=data}};
await import('../dist/render-worker.js');
self.onmessage({data:{module,rate:44100,settings,gain:.75,left,right}});
assert.ok(!result.error,result.error);const bytes=Buffer.from(result.wav);assert.equal(bytes.length,44+left.length*4);
const dsp=makeDSP(module,44100);dsp.configure(settings);let different=0;const l=new Float32Array(128),r=new Float32Array(128);
for(let i=0;i<left.length;i+=128){const n=Math.min(128,left.length-i);dsp.process(left.subarray(i,i+n),right.subarray(i,i+n),l,r,n);for(let j=0;j<n;j++){assert.ok(Number.isFinite(l[j])&&Number.isFinite(r[j]));for(const [channel,signal] of [[0,l],[1,r]]){const pcm=Math.trunc(Math.max(-1,Math.min(1,signal[j]*.75))*32767);assert.equal(bytes.readInt16LE(44+(i+j)*4+channel*2),pcm||0)}if(Math.abs(l[j]-left[i+j])>.001)different++}}
dsp.dispose();assert.ok(different>0);console.log('PASS: background WAV worker matches direct stereo WASM processing, including effects and master gain (8820 samples).');

self.onmessage({data:{module,rate:44100,settings,gain:1,mode:'pcm',left,right}});assert.ok(!result.error,result.error);const pcmDSP=makeDSP(module,44100);pcmDSP.configure(settings);for(let i=0;i<left.length;i+=128){const n=Math.min(128,left.length-i);pcmDSP.process(left.subarray(i,i+n),right.subarray(i,i+n),l,r,n);for(let j=0;j<n;j++){assert.equal(result.left[i+j],l[j]);assert.equal(result.right[i+j],r[j])}}pcmDSP.dispose();console.log('PASS: PCM worker mode matches native WASM floats without intermediate WAV quantization.');
