import sys
if len(sys.argv)!=3: raise SystemExit("Usage: python validate_against_binary.py EXTRACTED_MPC_BINARY NATIVE_SHARED_LIBRARY")
binary_path,library_path=sys.argv[1:]
import struct,ctypes,random
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM
from unicorn.arm64_const import *
from elftools.elf.elffile import ELFFile
f32=lambda x:struct.unpack('<f',struct.pack('<f',x))[0]
lib=ctypes.CDLL('libm.so.6');fma=lib.fmaf;fma.argtypes=[ctypes.c_float]*3;fma.restype=ctypes.c_float
u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with open(binary_path,'rb') as f:
 e=ELFFile(f)
 for s in e.iter_segments():
  if s['p_type']=='PT_LOAD':
   a=s['p_vaddr'];lo=a&~4095;end=(a+s['p_memsz']+4095)&~4095
   u.mem_map(lo,end-lo);u.mem_write(a,s.data())
u.mem_map(0x20000000,0x2000);u.mem_map(0x30000000,0x1000)
u.reg_write(UC_ARM64_REG_CPACR_EL1,3<<20)
scale=struct.unpack('<f',struct.pack('<I',0x3b810204))[0]
def rebuild(amount,shape):
 gain=fma(amount,9.,1.);r=[]
 for n in range(256):
  t=f32(n*scale)
  v=fma(f32(shape*t),t,f32(f32(f32(1.-shape)*t)*f32(2.-t)))
  v=f32(f32(1.-v)*f32(v*4.));v=f32(f32(v*v)*gain)
  r.append(min(v,1.))
 r[-1]=0.
 return struct.pack('<256f',*r)
rng=random.Random(20261029);pairs=[(0.,0.),(0.,.5),(0.,1.),(1.,0.),(1.,.5),(1.,1.)]+[(rng.random(),rng.random()) for _ in range(1000)]
native=ctypes.CDLL(library_path).pocket_grain_envelope
native.argtypes=[ctypes.c_float,ctypes.c_float,ctypes.POINTER(ctypes.c_float)]
for n,(a,b) in enumerate(pairs):
 a,b=f32(a),f32(b)
 u.mem_write(0x200007a8,struct.pack('<ff',a,b));u.reg_write(UC_ARM64_REG_X0,0x20000000);u.reg_write(UC_ARM64_REG_LR,0x30000000)
 u.emu_start(0x18b22a0,0x30000000,count=15000)
 actual=bytes(u.mem_read(0x200003a8,1024));output=(ctypes.c_float*256)();native(a,b,output);expected=bytes(output)
 if actual!=expected:
  aa=struct.unpack('<256f',actual);bb=struct.unpack('<256f',expected)
  print('FAIL',n,a,b,'max error',max(abs(x-y) for x,y in zip(aa,bb)));raise SystemExit(1)
print('PASS:',len(pairs),'parameter pairs;',len(pairs)*256,'float outputs match bit for bit.')
print('Scope: isolated grain envelope table only, not the complete effect or engine.')
