// -----------------------------------------------------------------------------
// Beacon Manager  – toggle Online ↔ Offline (persists via PATCH)
// -----------------------------------------------------------------------------

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Radio, QrCode, Battery, AlertTriangle,
  Play, Pause, X, Loader2, Link as LinkIcon,
} from 'lucide-react';

import GlassCard from '../../components/ui/GlassCard';
import Button    from '../../components/ui/Button';

import { mockShelves } from '../../data/mockData';
import { Beacon } from '../../types';

/* helpers */
const statusColor = (s: Beacon['status']) =>
  s === 'online'  ? 'text-green-400 bg-green-500'
: s === 'offline' ? 'text-red-400  bg-red-500'
:                   'text-yellow-400 bg-yellow-500';

const battColor = (n?: number) =>
  n == null ? 'text-gray-400'
: n > 50    ? 'text-green-400'
: n > 20    ? 'text-yellow-400'
:             'text-red-400';

export default function BeaconManager() {
  /* remote */
  const [beacons,   setBeacons]   = useState<Beacon[]>([]);
  const [zoneNames, setZoneNames] = useState<Record<string,string>>({ unassigned:'–' });

  useEffect(()=>{
    fetch('/api/beacons').then(r=>r.ok?r.json():Promise.reject()).then(setBeacons);
    fetch('/api/layout' ).then(r=>r.ok?r.json():Promise.reject()).then(l=>{
      const m:Record<string,string>={unassigned:'–'}; l.zones.forEach((z:{id:string;name:string})=>m[z.id]=z.name); setZoneNames(m);
    }).catch(()=>{});
  },[]);

  /* BLE scan / assign state (unchanged) */
  const [scanModal,setScanModal]=useState(false);
  const [scanning ,setScanning ]=useState(false);
  const [foundDevs,setFoundDevs]=useState<BluetoothDevice[]>([]);
  const scanRef=useRef<BluetoothLEScan|null>(null);

  const [assignDev ,setAssignDev ]=useState<BluetoothDevice|null>(null);
  const [assignShelf,setAssignShelf]=useState('');

  const startScan=async()=>{/* unchanged */};
  const stopScan =()=>{/* unchanged */};

  /* toggle status & persist */
  const toggle = async (b: Beacon) => {
    const nextStatus = b.status === 'online' ? 'offline' : 'online';
    try{
      const res = await fetch(`/api/beacons/${b.id}`,{
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({status:nextStatus}),
      });
      if(!res.ok) throw new Error('patch failed');
      setBeacons(list=>list.map(x=>x.id===b.id?{...x,status:nextStatus}:x));
    }catch(err){
      console.warn('[toggle]',err);
      alert('Failed to update status');
    }
  };

  /* save assignment (local only) */
  const saveAssignment=()=>{/* unchanged */};

  /* stats */
  const total = beacons.length;
  const online = beacons.filter(b=>b.status==='online').length;
  const offline = beacons.filter(b=>b.status==='offline').length;
  const simulated = beacons.filter(b=>b.status==='mock').length;

  /* JSX */
  return (
    <div className="p-6 space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">QR / BLE Beacon Manager</h1>
          <p className="text-gray-400">Monitor and manage positioning beacons</p>
        </div>
        <Button variant="secondary" icon={Plus}
                onClick={()=>{setScanModal(true);startScan();}}>
          Add Beacon
        </Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Total',     total,    'text-accent'],
          ['Online',    online,   'text-green-400'],
          ['Offline',   offline,  'text-red-400'],
          ['Simulated', simulated,'text-yellow-400'],
        ].map(([lbl,num,cls])=>(
          <GlassCard key={lbl} className="p-4 text-center">
            <p className={`text-2xl font-bold ${cls}`}>{num as any}</p>
            <p className="text-sm text-gray-400">{lbl}</p>
          </GlassCard>
        ))}
      </div>

      {/* beacon cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beacons.map((b,i)=>{
          const Icon = b.type==='qr'?QrCode:Radio;
          const sc = statusColor(b.status);
          return (
            <motion.div key={b.id} initial={{opacity:0,y:20}}
                        animate={{opacity:1,y:0}} transition={{delay:i*0.1}}>
              <GlassCard className="p-6 hover:bg-white/5 transition-all">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-glass rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-accent"/>
                    </div>
                    <div>
                      <h3 className="font-semibold">{b.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{b.type} Beacon</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${sc} bg-opacity-20`}>
                      <div className={`w-full h-full rounded-full ${sc.split(' ')[1]} animate-pulse`}/>
                    </div>
                    <span className={`text-xs font-medium ${sc.split(' ')[0]}`}>{b.status}</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shelf / Zone:</span>
                    <span>{zoneNames[b.zoneId]??b.zoneId}</span>
                  </div>
                  {b.batteryLevel!=null&&(
                    <div className="flex justify-between">
                      <span className="text-gray-400">Battery:</span>
                      <div className="flex items-center gap-2">
                        <Battery className={`h-4 w-4 ${battColor(b.batteryLevel)}`}/>
                        <span className={battColor(b.batteryLevel)}>{b.batteryLevel}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-glass">
                  <Button
                    variant={b.status==='online'?'secondary':'primary'}
                    size="sm"
                    icon={b.status==='online'?Pause:Play}
                    onClick={()=>toggle(b)}
                    className="flex-1"
                  >
                    {b.status==='online'?'Disable':'Enable'}
                  </Button>
                </div>

                {b.batteryLevel!=null&&b.batteryLevel<20&&(
                  <div className="flex items-center gap-2 mt-3 p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-400"/>
                    <span className="text-xs text-red-400">Low battery</span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* BLE scan modal */}
      {scanModal && (
        <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    initial={{opacity:0}} animate={{opacity:1}}>
          <motion.div className="bg-primary border border-glass rounded-xl p-6 w-full max-w-lg mx-4"
                      initial={{scale:0.95,opacity:0}}
                      animate={{scale:1,opacity:1}}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Nearby Bluetooth Devices</h2>
              <Button size="icon" variant="secondary"
                      onClick={()=>{setScanModal(false);stopScan();}}>
                <X className="w-4 h-4"/>
              </Button>
            </div>

            <div className="h-64 overflow-y-auto space-y-2">
              {foundDevs.length===0?(
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  {scanning?(
                    <>
                      <Loader2 className="animate-spin mb-4"/>
                      <p>Scanning… move your phone/tag close</p>
                    </>
                  ):<p>No devices found</p>}
                </div>
              ):foundDevs.map(d=>(
                <div key={d.id}
                     className="p-3 bg-glass rounded-lg hover:bg-white/10 cursor-pointer transition-colors flex items-center justify-between"
                     onClick={()=>{setAssignDev(d);setAssignShelf('');}}>
                  <div className="flex items-center gap-3">
                    <Radio className="h-5 w-5 text-accent"/>
                    <div>
                      <p className="font-medium">{d.name||'(no name)'}</p>
                      <p className="text-xs text-gray-400 break-all">{d.id}</p>
                    </div>
                  </div>
                  <LinkIcon className="h-4 w-4 text-gray-400"/>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {scanning
                ? <Button variant="secondary" onClick={stopScan}>Stop Scan</Button>
                : <Button variant="primary"   onClick={startScan}>Start Scan</Button>}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* assign modal */}
      {assignDev&&(
        <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    initial={{opacity:0}} animate={{opacity:1}}>
          <motion.div className="bg-primary border border-glass rounded-xl p-6 w-full max-w-sm mx-4"
                      initial={{scale:0.92,opacity:0}}
                      animate={{scale:1,opacity:1}}>
            <h2 className="text-lg font-bold mb-4">Assign Shelf</h2>

            <p className="mb-4 text-gray-300">
              Device:&nbsp;<span className="font-medium">{assignDev.name||assignDev.id}</span>
            </p>

            <label className="block text-sm font-medium mb-1">Shelf</label>
            <select value={assignShelf} onChange={e=>setAssignShelf(e.target.value)}
                    className="w-full mb-6 px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent">
              <option value="">– choose –</option>
              {mockShelves.map(s=>(
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <Button variant="primary" className="flex-1" onClick={saveAssignment}>Save</Button>
              <Button variant="secondary" className="flex-1" onClick={()=>setAssignDev(null)}>Cancel</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
