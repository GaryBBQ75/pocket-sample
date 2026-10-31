"""Create deterministic native-host fixtures for compare_wasm.cjs. Run at repo root.
python tests/prepare_wasm_comparison.py SHARED_HOST_LIBRARY OUTPUT_DIRECTORY
"""
import ctypes as C,random,sys
from pathlib import Path
lib=C.CDLL(str(Path(sys.argv[1]).resolve()));dest=Path(sys.argv[2]);dest.mkdir(parents=True,exist_ok=True)
lib.pocket_host_create.argtypes=[C.c_float];lib.pocket_host_create.restype=C.c_void_p
lib.pocket_host_configure.argtypes=[C.c_void_p]+[C.c_float]*7+[C.c_int]*2
lib.pocket_host_process.argtypes=[C.c_void_p,C.POINTER(C.c_float),C.c_uint]
lib.pocket_host_destroy.argtypes=[C.c_void_p]
mode=len(sys.argv)>3 and sys.argv[3]=='delay'
lib.pocket_host_set_effects.argtypes=[C.c_void_p,C.c_int,C.c_int]
lib.pocket_host_set_delay.argtypes=[C.c_void_p,C.c_float,C.c_float]
h=lib.pocket_host_create(48000);rng=random.Random(121088);input=bytearray();out=bytearray()
for block in range(400):
 values=(C.c_float*256)(*[rng.uniform(-.4,.4) for _ in range(256)]);input.extend(bytes(values))
 assert lib.pocket_host_configure(h,80 if block<200 else 32,40,0 if block<150 else 7 if block<300 else -12,.4,.8,.25,.65,int(100<=block<200),int(block>=250))
 if mode:
  assert lib.pocket_host_set_effects(h,int(block>=100),1)
  assert lib.pocket_host_set_delay(h,0 if block<25 else 50 if block<26 else 250 if block<200 else 17,0 if block<150 else 93)
 assert lib.pocket_host_process(h,values,128);out.extend(bytes(values))
lib.pocket_host_destroy(h);(dest/'input.pcm').write_bytes(input);(dest/'output.pcm').write_bytes(out)
print('Created native fixtures: 400 blocks / 102400 float values')
