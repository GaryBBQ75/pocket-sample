"""python validate_pitch_against_binary.py REFERENCE_ELF NATIVE_LIB REFERENCE_LIBM
Runs the reference pitch routine and its actual supplied AArch64 libm powf.
No replacement of powf by the host math library is used in the oracle.
No reference firmware or math library is included with this test.
"""
import ctypes as C
import hashlib
import json
import random
import struct
import sys
from elftools.elf.elffile import ELFFile
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM,UC_HOOK_CODE
from unicorn.arm64_const import *
if len(sys.argv)!=4:raise SystemExit(__doc__)
u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
math_base=0x50000000
for path,base in [(sys.argv[1],0),(sys.argv[3],math_base)]:
    with open(path,'rb') as source:
        elf=ELFFile(source)
        for segment in elf.iter_segments():
            if segment['p_type']=='PT_LOAD':
                a=segment['p_vaddr']+base;lo=a&~4095
                end=(a+segment['p_memsz']+4095)&~4095
                u.mem_map(lo,end-lo);u.mem_write(a,segment.data())
        if base:
            symbols=[s for s in elf.get_section_by_name('.dynsym').iter_symbols()
                     if s.name=='powf' and s['st_info']['type']=='STT_FUNC']
            # Both supplied symbol versions enter the same arithmetic core for
            # these finite positive-base cases. Use the oldest wrapper too.
            powf_address=base+min(s['st_value'] for s in symbols)
u.mem_write(0x716de10,struct.pack('<Q',powf_address))
u.mem_map(0x20000000,0x2000);u.mem_map(0x22000000,0x10000)
u.mem_map(0x30000000,0x1000)
u.reg_write(UC_ARM64_REG_CPACR_EL1,3<<20)
captured=[]
def capture_exponent(uc,address,size,data):
    captured.append(struct.pack('<I',uc.reg_read(UC_ARM64_REG_S1)))
u.hook_add(UC_HOOK_CODE,capture_exponent,begin=0xb516e8,end=0xb516e8)
class Pitch(C.Structure):
    _fields_=[('exponent',C.c_float),('speed',C.c_float)]
native=C.CDLL(sys.argv[2]);fn=native.pocket_grain_pitch
fn.argtypes=[C.c_float,C.c_float,C.POINTER(Pitch)]
rng=random.Random(12188)
pairs=[(0.,0.),(-48.,0.),(48.,0.),(-12.,-100.),(12.,100.),
       (7.,0.),(0.,-.001),(0.,.001)]+[
       (rng.uniform(-48,48),rng.uniform(-100,100)) for _ in range(10000)]
matches=exponents=0;max_ulp=0;examples=[]
for coarse,fine in pairs:
    coarse=C.c_float(coarse).value;fine=C.c_float(fine).value
    u.mem_write(0x200007e8,struct.pack('<ff',coarse,fine))
    u.reg_write(UC_ARM64_REG_X0,0x20000000)
    u.reg_write(UC_ARM64_REG_SP,0x2200f000)
    u.reg_write(UC_ARM64_REG_LR,0x30000000)
    captured.clear();u.emu_start(0x18b2020,0x30000000,count=10000)
    assert u.reg_read(UC_ARM64_REG_PC)==0x30000000
    expected=bytes(u.mem_read(0x200007d0,4));actual=Pitch()
    assert fn(coarse,fine,C.byref(actual))==1
    exponent_bytes=struct.pack('<f',actual.exponent)
    assert captured==[exponent_bytes]
    exponents+=1
    got=struct.pack('<f',actual.speed)
    ulp=abs(struct.unpack('<I',got)[0]-struct.unpack('<I',expected)[0])
    max_ulp=max(max_ulp,ulp)
    if got==expected:matches+=1
    elif len(examples)<5:examples.append({'semitones':coarse,'cents':fine,
         'native':actual.speed,'reference':struct.unpack('<f',expected)[0],'ulp':ulp})
rejected=0
for coarse,fine in [(float('nan'),0),(0,float('inf')),(float('-inf'),0),(1e30,0),(-1e30,0)]:
    output=Pitch(111,222);before=bytes(output)
    assert fn(coarse,fine,C.byref(output))==0 and bytes(output)==before
    rejected+=1
assert fn(0,0,None)==0
print(json.dumps({'result':'PASS' if matches==len(pairs) else 'ROUNDING_MISMATCH',
    'cases':len(pairs),'exponents_bitwise_equal':exponents,
    'speeds_bitwise_equal':matches,'maximum_speed_error_ulp':max_ulp,
    'reference_math':'supplied_AArch64_libm_powf_executed_in_Unicorn',
    'reference_libm_sha256':hashlib.sha256(open(sys.argv[3],'rb').read()).hexdigest(),
    'rejected_inputs':rejected,'null_output_rejected':True,
    'mismatch_examples':examples,'mobile_libm_verified':False},indent=2))
if matches!=len(pairs):raise SystemExit(1)
