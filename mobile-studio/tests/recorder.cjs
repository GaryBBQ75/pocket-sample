const assert=require('node:assert/strict'),Recorder=require('../dist/recorder-core.js');
const flush=()=>new Promise(r=>setImmediate(r));
function track(){return {stopped:false,onended:null,stop(){this.stopped=true}}}function stream(){const t=track();return {t,getTracks:()=>[t]}}
function fixture(extra={}){const sources=[],recorders=[],events=[];const deps={requestStream:async()=>{const s=stream();sources.push(s);return s},makeRecorder:s=>{const r={state:'inactive',mimeType:'audio/webm',start(){this.state='recording'},stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable?.({data:new Blob(['take'])});this.onstop?.()})}};recorders.push(r);return r},decode:async()=>({data:new Float32Array([0,.4,0])}),onChange:r=>events.push(r.phase),...extra};return {r:new Recorder(deps),sources,recorders,events}}
(async()=>{
const f=fixture();await f.r.connect();assert.equal(f.r.phase,'ready');assert.equal(f.recorders.length,0,'permission never starts recording');f.r.start();assert.equal(f.r.phase,'recording');await f.r.stop();assert.equal(f.r.phase,'review');assert(f.r.draft);assert(f.sources[0].t.stopped,'release microphone before review');f.r.discard();assert.equal(f.r.draft,null);
let resolve;const late=fixture({requestStream:()=>new Promise(r=>resolve=r)});const p=late.r.connect();late.r.discard();const s=stream();resolve(s);await p;assert(s.t.stopped);assert.equal(late.r.phase,'idle');
const denied=fixture({requestStream:async()=>{const e=Error();e.name='NotAllowedError';throw e}});await denied.r.connect();assert.equal(denied.r.phase,'error');assert.match(denied.r.error,/refusé/);
const canceled=fixture();await canceled.r.connect();canceled.r.start();canceled.r.discard();await flush();assert.equal(canceled.r.phase,'idle');assert.equal(canceled.r.draft,null);assert(canceled.sources[0].t.stopped);
const retry=fixture();await retry.r.connect();retry.r.start();retry.r.discard();await retry.r.connect();await flush();assert.equal(retry.r.phase,'ready');assert(!retry.sources[1].t.stopped,'old stop cannot close the new stream');retry.r.discard();
const unplug=fixture();await unplug.r.connect();unplug.r.start();unplug.sources[0].t.onended();await flush();assert.equal(unplug.r.phase,'error');assert.equal(unplug.r.draft,null);
const bad=fixture({decode:async()=>{throw Error('Audio invalide')}});await bad.r.connect();bad.r.start();await bad.r.stop();assert.equal(bad.r.phase,'error');assert(bad.sources[0].t.stopped);
const limit=fixture({limit:5});await limit.r.connect();limit.r.start();await new Promise(r=>setTimeout(r,25));assert.equal(limit.r.phase,'review');limit.r.discard();
console.log('PASS recorder: permission != recording, explicit review, no implicit commit, microphone cleanup, late permission, cancellation/retry races, unplug, decode error and duration limit.');
})().catch(e=>{console.error(e);process.exit(1)});
