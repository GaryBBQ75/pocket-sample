const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const scope={Float32Array,Math,Number,Array,Error,self:{postMessage(){}}};vm.createContext(scope);vm.runInContext(fs.readFileSync('dist/stretch-worker.js','utf8'),scope);const stretch=scope.stretch,rate=44100;
const tone=Float32Array.from({length:rate*2},(_,i)=>.7*Math.sin(2*Math.PI*440*i/rate));
function frequency(x){const start=Math.round(x.length*.2),end=Math.round(x.length*.8);let crossings=0;for(let i=start+1;i<end;i++)if(x[i-1]<=0&&x[i]>0)crossings++;return crossings*rate/(end-start)}
for(const ratio of [.5,.75,1,1.25,1.5,2]){const anti=Float32Array.from(tone,v=>-v),result=stretch([tone,anti],ratio);assert.equal(result[0].length,Math.round(tone.length*ratio));assert.ok(result.every(c=>c.every(Number.isFinite)));const hz=frequency(result[0]);assert.ok(Math.abs(hz-440)<3,`ratio ${ratio}: ${hz} Hz`);for(let i=0;i<result[0].length;i++)assert.ok(Math.abs(result[0][i]+result[1][i])<1e-6);console.log(`PASS stretch ${ratio}: ${result[0].length} frames, ${hz.toFixed(2)} Hz, stereo phase preserved`)}
assert.deepEqual(stretch([tone],1)[0],tone);
const silence=stretch([new Float32Array(rate)],2)[0];assert.ok(silence.every(v=>v===0));
assert.throws(()=>stretch([tone],3),/invalides/);assert.throws(()=>stretch([new Float32Array(2)],1.5),/Durée/);const invalid=tone.slice();invalid[100]=NaN;assert.throws(()=>stretch([invalid],1.5),/invalide/);
console.log('PASS stretch bounds, silence, unity and invalid data');
