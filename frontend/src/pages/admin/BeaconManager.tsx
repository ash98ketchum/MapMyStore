import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Radio, QrCode, Battery, AlertTriangle,
  Play, Pause, QrCode as Qr, Link as LinkIcon,
} from 'lucide-react';

import GlassCard from '../../components/ui/GlassCard';
import Button    from '../../components/ui/Button';

import { mockBeacons, mockShelves } from '../../data/mockData';
import { Beacon } from '../../types';

/* ─── tiny helpers ─────────────────────────────────────────────── */
const statusColor = (s: Beacon['status']) =>
  s === 'online'  ? 'text-green-400 bg-green-500'
: s === 'offline' ? 'text-red-400  bg-red-500'
:                   'text-yellow-400 bg-yellow-500';

const battColor = (n?: number) =>
  n == null ? 'text-gray-400'
: n > 50    ? 'text-green-400'
: n > 20    ? 'text-yellow-400'
:             'text-red-400';

/* ─── component ───────────────────────────────────────────────── */
export default function BeaconManager() {
  /* —— state ————————————————————————— */
  const [beacons, setBeacons] = useState<Beacon[]>(() => {
    const saved = localStorage.getItem('beacons');
    return saved ? JSON.parse(saved) : mockBeacons;
  });

  const [newDev,  setNewDev ]  = useState<BluetoothDevice | null>(null);
  const [selShelf,setSelShelf] = useState<string>('');
  const [showSim ,setShowSim]  = useState(false);
  const [selBcn , setSelBcn ]  = useState<Beacon | null>(null);

  /* —— persistence ————————————————— */
  useEffect(() => {
    localStorage.setItem('beacons', JSON.stringify(beacons));
  }, [beacons]);

  /* —— BLE scan & add ————————————————— */
  const scanForDevice = async () => {
    try {
      const dev = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,         // ← correct flag
        optionalServices: [],
      });
      setNewDev(dev);
    } catch (err) {
      console.warn('[BLE-scan]', err);
    }
  };

  const addAsBeacon = () => {
    if (!newDev || !selShelf) return;
    setBeacons(b => [
      ...b,
      {
        id: newDev.id,
        name: newDev.name || 'BLE Device',
        type: 'ble',
        zoneId: selShelf,
        status: 'online',
        batteryLevel: undefined,
      },
    ]);
    setNewDev(null);
    setSelShelf('');
  };

  /* —— enable / disable ——————————— */
  const toggle = (id: string) =>
    setBeacons(b =>
      b.map(x =>
        x.id === id ? { ...x, status: x.status === 'online' ? 'offline' : 'online' } : x,
      ),
    );

  /* —— simulate (“mock”) —————————— */
  const markMock = (bk: Beacon) =>
    setBeacons(b => b.map(x => (x.id === bk.id ? { ...x, status: 'mock' } : x)));

  /* ─── JSX ───────────────────────────────────────────────────── */
  return (
    <div className="p-6 space-y-6">
      {/* — header — */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">QR / BLE Beacon Manager</h1>
          <p className="text-gray-400">Monitor and manage positioning beacons</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Plus} onClick={scanForDevice}>
            Add Beacon
          </Button>
          <Button variant="primary" icon={Play} onClick={() => setShowSim(true)}>
            Simulate Beacon
          </Button>
        </div>
      </div>

      {/* — stats — */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['Total', beacons.length, 'text-accent'],
          ['Online', beacons.filter(b => b.status === 'online').length, 'text-green-400'],
          ['Offline', beacons.filter(b => b.status === 'offline').length, 'text-red-400'],
          ['Simulated', beacons.filter(b => b.status === 'mock').length, 'text-yellow-400'],
        ].map(([lbl, num, cls]) => (
          <GlassCard key={lbl} className="p-4 text-center">
            <p className={`text-2xl font-bold ${cls}`}>{num as any}</p>
            <p className="text-sm text-gray-400">{lbl}</p>
          </GlassCard>
        ))}
      </div>

      {/* — beacon cards — */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beacons.map((b, i) => {
          const Icon = b.type === 'qr' ? QrCode : Radio;
          const sc   = statusColor(b.status);
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-6 hover:bg-white/5 transition-all">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-glass rounded-xl flex items-center justify-center">
                      <Icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{b.name}</h3>
                      <p className="text-sm text-gray-400 capitalize">{b.type} Beacon</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${sc} bg-opacity-20`}>
                      <div className={`w-full h-full rounded-full ${sc.split(' ')[1]} animate-pulse`} />
                    </div>
                    <span className={`text-xs font-medium ${sc.split(' ')[0]}`}>{b.status}</span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shelf:</span>
                    <span>{b.zoneId}</span>
                  </div>

                  {b.batteryLevel != null && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Battery:</span>
                      <div className="flex items-center gap-2">
                        <Battery className={`h-4 w-4 ${battColor(b.batteryLevel)}`} />
                        <span className={battColor(b.batteryLevel)}>{b.batteryLevel}%</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-glass">
                  <Button
                    variant={b.status === 'online' ? 'secondary' : 'primary'}
                    size="sm"
                    icon={b.status === 'online' ? Pause : Play}
                    onClick={() => toggle(b.id)}
                    className="flex-1"
                  >
                    {b.status === 'online' ? 'Disable' : 'Enable'}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSelBcn(b);
                      setShowSim(true);
                    }}
                    className="flex-1"
                  >
                    Simulate
                  </Button>
                </div>

                {b.batteryLevel != null && b.batteryLevel < 20 && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-xs text-red-400">Low battery</span>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* — modal: assign BLE device to shelf — */}
      {newDev && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-primary border border-glass rounded-xl p-6 w-full max-w-sm mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-lg font-bold mb-4">Assign BLE Device</h2>

            <p className="mb-4 text-gray-300">
              Device:&nbsp;<span className="font-medium">{newDev.name || newDev.id}</span>
            </p>

            <label className="block text-sm font-medium mb-1">Shelf</label>
            <select
              value={selShelf}
              onChange={e => setSelShelf(e.target.value)}
              className="w-full mb-6 px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent"
            >
              <option value="">– choose –</option>
              {mockShelves.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <Button variant="primary" className="flex-1" onClick={addAsBeacon}>
                Save
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setNewDev(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* — modal: simulate beacon (unchanged) — */}
      {showSim && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-primary border border-glass rounded-xl p-6 w-full max-w-md mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-bold mb-4">Simulate Beacon</h2>

            {selBcn ? (
              <>
                <div className="p-4 bg-glass rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    {selBcn.type === 'qr' ? (
                      <Qr className="h-6 w-6 text-accent" />
                    ) : (
                      <Radio className="h-6 w-6 text-accent" />
                    )}
                    <div>
                      <h3 className="font-semibold">{selBcn.name}</h3>
                      <p className="text-sm text-gray-400">Shelf: {selBcn.zoneId}</p>
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium mb-2">
                  Mock Proximity Radius (m)
                </label>
                <input
                  defaultValue={5}
                  type="number"
                  className="w-full mb-4 px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent"
                />

                <label className="block text-sm font-medium mb-2">Duration</label>
                <select className="w-full mb-6 px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent">
                  <option value="5">5 min</option>
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="60">1 hour</option>
                </select>

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      markMock(selBcn);
                      setShowSim(false);
                      setSelBcn(null);
                    }}
                  >
                    Start
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowSim(false);
                      setSelBcn(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-4">Select a beacon to simulate:</p>
                <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                  {beacons.map(b => (
                    <div
                      key={b.id}
                      className="p-3 bg-glass rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                      onClick={() => setSelBcn(b)}
                    >
                      <div className="flex items-center gap-3">
                        {b.type === 'qr' ? (
                          <Qr className="h-5 w-5 text-accent" />
                        ) : (
                          <Radio className="h-5 w-5 text-accent" />
                        )}
                        <div>
                          <p className="font-medium">{b.name}</p>
                          <p className="text-sm text-gray-400">Shelf: {b.zoneId}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="secondary" className="w-full" onClick={() => setShowSim(false)}>
                  Close
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
