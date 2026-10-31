import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {makeDSP} from '../dist/dsp-runtime.js';
const module=await WebAssembly.compile(fs.readFileSync('dist/pocket-dsp.wasm'));
const base={enabled:false,delayEnabled:false,duration:80,density:40,pitch:0,window:.4,stereo:.8,feedback:.25,wet:.65,freeze:false,reverse:false,delayLeft:0,delayRight:0};
let Ctor;const events=[];
const sandbox={makeDSP,sampleRate:44100,Float32Array,Math,Number,Error,AudioWorkletProcessor:class{constructor(){this.port={postMessage:m=>events.push(m)}}},registerProcessor:(name,type)=>{Ctor=type}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/granulator-worklet.js','utf8').replace("import {makeDSP} from './dsp-runtime.js';",''),sandbox);
const processor=new Ctor({processorOptions:{module,settings:base}});assert.equal(events[0].type,'ready');
const left=Float32Array.from({length:128},(_,i)=>Math.sin(i*.1)*.25),right=left.slice(),out=[new Float32Array(128),new Float32Array(128)];
processor.process([[left,right]],[out]);assert.deepEqual(out[0],left);
processor.port.onmessage({data:{...base,enabled:true}});let altered=0;
for(let block=0;block<800;block++){processor.process([[left,right]],[out]);for(let i=0;i<128;i++){assert.ok(Number.isFinite(out[0][i])&&Number.isFinite(out[1][i]));if(Math.abs(out[0][i]-left[i])>.001)altered++}}
assert.ok(altered>0);assert.ok(events.some(e=>e.type==='meter'&&e.input>0&&e.output>0));assert.ok(!events.some(e=>e.error));
processor.port.onmessage({data:{...base,enabled:true,freeze:true,wet:1}});let frozenPower=0;
for(let block=0;block<100;block++){processor.process([[]],[out]);for(const x of out[0])frozenPower+=x*x}assert.ok(frozenPower>0,'freeze retains captured signal');
processor.port.onmessage({data:{reset:true,settings:base}});processor.process([[left,right]],[out]);assert.deepEqual(out[0],left);
for(const preset of [{duration:10,density:300,pitch:12,feedback:1,wet:1},{duration:200,density:300,pitch:-12,feedback:1,wet:1,reverse:true},{delayEnabled:true,delayLeft:250,delayRight:250}]){processor.port.onmessage({data:{reset:true,settings:{...base,enabled:true,...preset}}});for(let n=0;n<100;n++){processor.process([[left,right]],[out]);for(const c of out)for(const x of c)assert.ok(Number.isFinite(x))}}
assert.ok(!events.some(e=>e.error));processor.dsp.dispose();console.log('PASS: real WASM worklet initialization/ready, bypass, signal meters, transformed audio, freeze capture, reset and parameter extremes.');
