const fs=require('fs');
const bytes=fs.readFileSync('dist/pocket-dsp.wasm');
const {exports:api}=new WebAssembly.Instance(new WebAssembly.Module(bytes),{wasi_snapshot_preview1:{fd_close:()=>0,fd_write:()=>0,fd_seek:()=>0}});
api._initialize();const h=api.pocket_host_create(48000),ptr=api.malloc(1024),view=new Float32Array(api.memory.buffer,ptr,256);
const input=fs.readFileSync(process.argv[2]),expected=fs.readFileSync(process.argv[3]);let mismatches=0;
const withDelay=process.argv[4]==='delay';
for(let block=0;block<400;block++){
 if(!api.pocket_host_configure(h,block<200?80:32,40,block<150?0:block<300?7:-12,.4,.8,.25,.65,block>=100&&block<200?1:0,block>=250?1:0))throw Error('settings');
 if(withDelay){if(!api.pocket_host_set_effects(h,block>=100?1:0,1)||!api.pocket_host_set_delay(h,block<25?0:block<26?50:block<200?250:17,block<150?0:93))throw Error('delay settings');}
 new Uint8Array(api.memory.buffer,ptr,1024).set(input.subarray(block*1024,(block+1)*1024));
 if(!api.pocket_host_process(h,ptr,128))throw Error('process');
 const actual=Buffer.from(api.memory.buffer,ptr,1024),want=expected.subarray(block*1024,(block+1)*1024);
 if(!actual.equals(want)){for(let i=0;i<256;i++)if(actual.readUInt32LE(i*4)!==want.readUInt32LE(i*4))mismatches++;}
}
api.free(ptr);api.pocket_host_destroy(h);
console.log(JSON.stringify({blocks:400,float_values:102400,mismatches,comparison:mismatches?'different':'bitwise_equal'}));if(mismatches)process.exit(1);
