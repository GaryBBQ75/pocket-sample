"""python validate_parameters_against_binary.py REFERENCE_ELF NATIVE_SHARED_LIB
Loads the supplied reference only for oracle validation; contains no firmware.
Parameter labels were read from the original wrapper construction. Does not
exercise full UI normalization, pitch powf or sample-rate buffer reallocation.
"""
import ctypes as C
import json
import random
import struct
import sys
from elftools.elf.elffile import ELFFile
from unicorn import Uc,UC_ARCH_ARM64,UC_MODE_ARM
from unicorn.arm64_const import *
if len(sys.argv)!=3:raise SystemExit(__doc__)
u=Uc(UC_ARCH_ARM64,UC_MODE_ARM)
with open(sys.argv[1],'rb') as f:
    for segment in ELFFile(f).iter_segments():
        if segment['p_type']=='PT_LOAD':
            a=segment['p_vaddr'];lo=a&~4095
            end=(a+segment['p_memsz']+4095)&~4095
            u.mem_map(lo,end-lo);u.mem_write(a,segment.data())
u.mem_map(0x20000000,0x3000);u.mem_map(0x30000000,0x1000)
u.reg_write(UC_ARM64_REG_CPACR_EL1,3<<20)
native=C.CDLL(sys.argv[2])
for name in ['pocket_grain_window_milliseconds','pocket_grain_length_milliseconds','pocket_grain_percent']:
    fn=getattr(native,name);fn.argtypes=[C.c_float];fn.restype=C.c_float
class Timing(C.Structure):
    _fields_=[('duration',C.c_float),('envelope_rate',C.c_float),('interval',C.c_int32)]
native.pocket_grain_timing.argtypes=[C.c_float,C.c_float,C.c_float,C.POINTER(Timing)]
def f32(x):return struct.unpack('<f',struct.pack('<f',x))[0]
def call(address,value=None,callback=False):
    if value is not None:u.reg_write(UC_ARM64_REG_S0,struct.unpack('<I',struct.pack('<f',value))[0])
    if callback:
        u.mem_write(0x20002000,struct.pack('<Q',0x20000000))
        u.reg_write(UC_ARM64_REG_X0,0x20002000)
        u.reg_write(UC_ARM64_REG_X1,0x20002100)
    u.reg_write(UC_ARM64_REG_LR,0x30000000)
    u.emu_start(address,0x30000000,count=1000)
    if u.reg_read(UC_ARM64_REG_PC)!=0x30000000:raise AssertionError('instruction budget')
    return struct.pack('<I',u.reg_read(UC_ARM64_REG_S0))
rng=random.Random(880088)
values=[0.,.5,1.,.01,.99]+[f32(rng.random()) for _ in range(1000)]
comparisons=0
for normalized in values:
    for address,fn in [(0x18b1f90,native.pocket_grain_window_milliseconds),
                       (0x18b2000,native.pocket_grain_length_milliseconds)]:
        assert call(address,normalized)==struct.pack('<f',fn(normalized))
        comparisons+=1
    percent=f32(normalized*100)
    u.mem_write(0x20002100,struct.pack('<f',percent))
    for address,offset in [(0x250ef20,0x9c0),(0x250ef50,0x9c4),
        (0x250efc0,0x9c8),(0x250eff0,0x9ac),(0x250f020,0x9d0)]:
        call(address,callback=True)
        assert bytes(u.mem_read(0x20000000+offset,4))==struct.pack('<f',native.pocket_grain_percent(percent))
        comparisons+=1
    rate=f32([8000,22050,44100,48000,88200,96000,192000][comparisons%7])
    milliseconds=f32(10+normalized*190)
    cadence=f32(1+normalized*199)
    u.mem_write(0x200009b0,struct.pack('<f',rate))
    u.mem_write(0x20002100,struct.pack('<f',milliseconds))
    call(0x250ef80,callback=True)
    u.mem_write(0x20002100,struct.pack('<f',cadence))
    call(0x250ef00,callback=True)
    result=Timing()
    assert native.pocket_grain_timing(rate,milliseconds,cadence,C.byref(result))==1
    expected=bytes(u.mem_read(0x200009a4,8))+bytes(u.mem_read(0x2000099c,4))
    assert bytes(result)==expected,(rate,milliseconds,cadence,bytes(result).hex(),expected.hex())
    comparisons+=3
rejected=0
for rate,length,cadence in [(0,100,20),(-1,100,20),(48000,0,20),(48000,100,0),
        (float('nan'),100,20),(48000,float('inf'),20),(48000,100,float('nan')),
        (48000,100,96000),(48000,1e30,20),(48000,100,1e-20)]:
    result=Timing(111,222,333);before=bytes(result)
    assert native.pocket_grain_timing(rate,length,cadence,C.byref(result))==0
    assert bytes(result)==before
    rejected+=1
assert native.pocket_grain_timing(48000,100,20,None)==0
print(json.dumps({'result':'PASS','parameter_cases':len(values),
    'scalar_field_comparisons':comparisons,'comparison':'bitwise_equal',
    'invalid_inputs_rejected_without_writes':rejected,'null_output_rejected':True,
    'sample_rates':[8000,22050,44100,48000,88200,96000,192000],
    'scope':['window_ms_display','grain_ms_display','five_percentage_callbacks',
             'grain_duration_samples','envelope_rate','trigger_interval'],
    'full_UI_and_pitch_conversion_verified':False},indent=2))
