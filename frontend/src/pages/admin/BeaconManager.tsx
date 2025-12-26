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
import { api } from '../../config.ts';
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
    fetch(api('/api/beacons')).then(r=>r.ok?r.json():Promise.reject()).then(setBeacons);
    fetch(api('/api/layout') ).then(r=>r.ok?r.json():Promise.reject()).then(l=>{
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
      const res = await fetch(api(`/api/beacons/${b.id}`),{
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
          <h1 className="text-5xl font-bold mb-2 text-black">QR / BLE Beacon Manager</h1>
          <p className="text-gray-500 text-xl">Monitor and manage positioning beacons</p>
        </div>
        <Button variant="secondary" icon={Plus} onClick={()=>{setScanModal(true);startScan();}} className="text-lg px-6 py-3 !bg-blue-500 hover:bg-blue-600 text-white shadow-glow">
          Add Beacon
        </Button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[ ['Total', total, 'text-accent'], ['Online', online, 'text-green-400'], ['Offline', offline, 'text-red-400'], ['Simulated', simulated, 'text-yellow-400'] ].map(([lbl,num,cls])=>(
          <GlassCard key={lbl} className="p-6 text-center text-xl">
            <p className={`text-4xl font-bold ${cls}`}>{num as any}</p>
            <p className="text-lg text-black/70">{lbl}</p>
          </GlassCard>
        ))}
      </div>

      {/* beacon cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {beacons.map((b,i)=>{
          const Icon = b.type==='qr'?QrCode:Radio;
          const sc = statusColor(b.status);
          return (
            <motion.div key={b.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
              <GlassCard className="p-8 hover:bg-white/10 transition-all shadow-xl rounded-2xl">
                <div className="flex justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-glass rounded-xl flex items-center justify-center">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl text-black">{b.name}</h3>
                      <p className="text-md text-gray-500 capitalize">{b.type} Beacon</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${sc} bg-opacity-20`}>
                      <div className={`w-full h-full rounded-full ${sc.split(' ')[1]} animate-pulse`} />
                    </div>
                    <span className={`text-md font-medium ${sc.split(' ')[0]}`}>{b.status}</span>
                  </div>
                </div>

                <div className="space-y-4 text-lg text-black">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shelf / Zone:</span>
                    <span>{zoneNames[b.zoneId]??b.zoneId}</span>
                  </div>
                  {b.batteryLevel!=null&&(
                    <div className="flex justify-between">
                      <span className="text-gray-500">Battery:</span>
                      <div className="flex items-center gap-2">
                        <Battery className={`h-5 w-5 ${battColor(b.batteryLevel)}`} />
                        <span className={battColor(b.batteryLevel)}>{b.batteryLevel}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-glass">
                  <Button
                    variant={b.status==='online' ? 'secondary' : 'primary'}
                    size="lg"
                    icon={b.status==='online'?Pause:Play}
                    onClick={()=>toggle(b)}
                    className={`flex-1 text-lg px-6 py-3 ${b.status==='online' ? '!bg-red-500 hover:!bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                  >
                    {b.status==='online'?'Disable':'Enable'}
                  </Button>
                </div>

                {b.batteryLevel!=null&&b.batteryLevel<20&&(
                  <div className="flex items-center gap-2 mt-4 p-3 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <span className="text-sm text-red-400">Low battery</span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* BLE scan modal and assign modal remain unchanged */}
    </div>
  );
}
