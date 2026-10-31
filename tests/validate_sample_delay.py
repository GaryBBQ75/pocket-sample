"""python tests/validate_sample_delay.py REFERENCE_ELF NATIVE_SHARED_LIBRARY
Original stereo delay routine is executed in Unicorn. Framework bookkeeping is
a no-op and the two virtual control reads return the same supplied normalized
values. Constructor/allocation/UI linking are outside this finite comparison.
No reference program/instructions are distributed in this script.
"""
import ctypes as C,json,random,struct,sys
from elftools.elf.elffile import ELFFile
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM,UC_HOOK_CODE
from unicorn.arm64_const import *
u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with open(sys.argv[1],'rb') as f:
 for s in ELFFile(f).iter_segments():
  if s['p_type']=='PT_LOAD':
   a=s['p_vaddr'];lo=a&~4095;end=(a+s['p_memsz']+4095)&~4095
   u.mem_map(lo,end-lo);u.mem_write(a,s.data())
for a,n in [(0x20000000,0x2000),(0x21000000,0x40000),(0x22000000,0x10000),(0x30000000,0x1000)]:u.mem_map(a,n)
u.reg_write(UC_ARM64_REG_CPACR_EL1,3<<20)
def write(a,fmt,*v):u.mem_write(a,struct.pack('<'+fmt,*v))
def noop(uc,address,size,data):uc.reg_write(UC_ARM64_REG_PC,uc.reg_read(UC_ARM64_REG_LR))
def parameter_vector(uc,address,size,data):
 uc.reg_write(UC_ARM64_REG_X0,0x2102f000);noop(uc,address,size,data)
requested=[0.,0.]
def parameter_read(uc,address,size,data):
 value=requested[0 if uc.reg_read(UC_ARM64_REG_X0)==0x2102f040 else 1]
 uc.reg_write(UC_ARM64_REG_S0,struct.unpack('<I',struct.pack('<f',value))[0]);noop(uc,address,size,data)
u.hook_add(UC_HOOK_CODE,noop,begin=0xddcaf0,end=0xddcaf0)
u.hook_add(UC_HOOK_CODE,parameter_vector,begin=0xea8c80,end=0xea8c80)
u.hook_add(UC_HOOK_CODE,parameter_read,begin=0x30000100,end=0x30000100)
class Delay(C.Structure):
 _fields_=[('left_ring',C.POINTER(C.c_float)),('right_ring',C.POINTER(C.c_float))]+[(n,C.c_int) for n in ['length','write','left','right','previous_left','previous_right']]+[(n,C.c_float) for n in ['fade_left','fade_right','fade_step','sample_rate','requested_left','requested_right']]+[('dirty_left',C.c_int),('dirty_right',C.c_int)]
lib=C.CDLL(sys.argv[2]);lib.pocket_sample_delay_init.argtypes=[C.POINTER(Delay),C.c_float,C.POINTER(C.c_float),C.POINTER(C.c_float),C.c_int]
lib.pocket_sample_delay_set.argtypes=[C.POINTER(Delay),C.c_float,C.c_float]
lib.pocket_sample_delay_process.argtypes=[C.POINTER(Delay),C.POINTER(C.c_float),C.POINTER(C.c_float),C.c_uint]
rng=random.Random(883211);blocks=values=0;wrapped=False;deferred=False
for rate in [8000,22050,44100,48000]:
 length=int(rate*.25)+1;rings=[(C.c_float*length)(*[rng.uniform(-1,1) for _ in range(length)]) for _ in range(2)]
 s=Delay();assert lib.pocket_sample_delay_init(C.byref(s),rate,*rings,length)==1
 u.mem_write(0x20000000,b'\0'*0x2000)
 write(0x20000030,'d',rate);write(0x200001c4,'f',s.fade_step)
 write(0x200001d8,'ii',2,length);write(0x200001e8,'Q',0x2102e000)
 write(0x2102e000,'QQ',0x21000000,0x21010000)
 for a,ring in zip([0x21000000,0x21010000],rings):u.mem_write(a,bytes(ring))
 write(0x20001010,'Q',0x2102e020);write(0x2102e020,'QQ',0x2102d000,0x2102d400)
 write(0x2102f000,'Q',0x2102f020);write(0x2102f00c,'I',2)
 write(0x2102f020,'QQ',0x2102f040,0x2102f060)
 write(0x2102f040,'Q',0x2102f080);write(0x2102f060,'Q',0x2102f080)
 write(0x2102f090,'Q',0x30000100);requested[:]=[0.,0.]
 for block in range(400):
  frames=[0,1,7,16,64,128][block%6]
  if block in [0,25,26,50,100,101,150,200,300]:
   targets=[C.c_float(rng.choice([0,1,rng.random()])).value for _ in range(2)]
   deferred|=s.fade_left>0 or s.fade_right>0
   for n,(old,new) in enumerate(zip(requested,targets)):
    if old!=new:u.mem_write(0x200001d0+n,b'\1')
   requested[:]=targets;assert lib.pocket_sample_delay_set(C.byref(s),*targets)==1
  inputs=[(C.c_float*128)(*[rng.uniform(-1,1) for _ in range(128)]) for _ in range(2)]
  for a,v in zip([0x2102d000,0x2102d400],inputs):u.mem_write(a,bytes(v))
  write(0x20001004,'i',frames)
  u.reg_write(UC_ARM64_REG_X0,0x20000000);u.reg_write(UC_ARM64_REG_X1,0x20001000);u.reg_write(UC_ARM64_REG_X2,0)
  u.reg_write(UC_ARM64_REG_SP,0x2200f000);u.reg_write(UC_ARM64_REG_LR,0x30000000)
  u.emu_start(0x25172a0,0x30000000,count=200000)
  assert u.reg_read(UC_ARM64_REG_PC)==0x30000000
  before=s.write;lib.pocket_sample_delay_process(C.byref(s),*inputs,frames);wrapped|=s.write<before
  for a,v in zip([0x2102d000,0x2102d400],inputs):assert bytes(v)==bytes(u.mem_read(a,512)),('audio',rate,block,a)
  for a,ring in zip([0x21000000,0x21010000],rings):assert bytes(ring)==bytes(u.mem_read(a,length*4)),('ring',rate,block,a)
  fields=struct.pack('<iiifffii',s.write,s.left,s.right,s.fade_left,s.fade_right,s.fade_step,s.previous_left,s.previous_right)
  assert fields==bytes(u.mem_read(0x200001b0,32)),('state',rate,block,fields.hex(),u.mem_read(0x200001b0,32).hex())
  assert bytes([s.dirty_left,s.dirty_right])==bytes(u.mem_read(0x200001d0,2))
  blocks+=1;values+=frames*2
assert wrapped and deferred
print(json.dumps({'result':'PASS','blocks':blocks,'audio_float_values':values,'comparison':'bitwise_equal_audio_rings_and_compared_state','includes':['zero_delay','maximum_delay','different_left_right','crossfade','deferred_changes','ring_wrap','zero_frame_blocks'],'full_UI_linking_verified':False},indent=2))
