// src/pages/DiscountCreator.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Play, Square, Trash2, Zap } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button    from '../../components/ui/Button';
import { DiscountRule } from '../../types';

type RulePayload = {
  name: string;
  trigger:   { type: string; value: string };
  condition: { type: string; value: string };
  action:    { type: string; value: number };
  active:    boolean;
};

const triggerTypes = [
  { value: 'zone-enter',   label: 'Zone Entry'   },
  { value: 'product-view', label: 'Product View' },
  { value: 'time-based',   label: 'Time Based'   },
];

const conditionTypes = [
  { value: 'category',  label: 'Product Category' },
  { value: 'product',   label: 'Specific Product'  },
  { value: 'user-type', label: 'User Type'         },
];

const actionTypes = [
  { value: 'percentage',      label: 'Percentage Off'   },
  { value: 'fixed-amount',    label: 'Fixed Amount Off' },
  { value: 'buy-one-get-one', label: 'Buy One Get One'  },
];

export default function DiscountCreator() {
  const [rules, setRules]               = useState<DiscountRule[]>([]);
  const [loading, setLoading]           = useState(true);
  const [beacons, setBeacons]           = useState<{id:string;name:string;status:string}[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newRule, setNewRule] = useState<Partial<RulePayload>>({
    name: '',
    trigger:   { type: 'zone-enter', value: '' },
    condition: { type: 'category',   value: '' },
    action:    { type: 'percentage', value: 0  },
    active:    true,
  });

  // ── fetch rules ────────────────────────────────────────
  useEffect(() => {
    fetch('/api/discount-rules')
      .then(r => r.json())
      .then((data: DiscountRule[]) => setRules(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── fetch online beacons ───────────────────────────────
  useEffect(() => {
    fetch('/api/beacons')
      .then(r => r.json())
      .then((data: any[]) => setBeacons(data.filter(b => b.status === 'online')))
      .catch(console.error);
  }, []);

  // ── toggle active/inactive ─────────────────────────────
  const toggleRule = async (id:string, active:boolean) => {
    setRules(rs => rs.map(r => r.id===id ? { ...r, active: !active } : r));
    try {
      await fetch(`/api/discount-rules/${id}`, {
        method:'PATCH',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ active: !active }),
      });
    } catch {
      // revert on failure
      setRules(rs => rs.map(r => r.id===id ? { ...r, active } : r));
    }
  };

  // ── delete a rule ──────────────────────────────────────
  const deleteRule = async (id:string) => {
    if (!confirm('Delete this rule?')) return;
    setRules(rs => rs.filter(r => r.id !== id));
    try {
      await fetch(`/api/discount-rules/${id}`, { method:'DELETE' });
    } catch {
      // reload on error
      fetch('/api/discount-rules')
        .then(r => r.json())
        .then((d:DiscountRule[]) => setRules(d));
    }
  };

  // ── create new rule ────────────────────────────────────
  const createRule = async () => {
    if (
      !newRule.name ||
      !newRule.trigger?.type || !newRule.trigger.value ||
      !newRule.condition?.type || !newRule.condition.value ||
      !newRule.action?.type   || newRule.action.value == null
    ) {
      return alert('Please fill out all fields');
    }
    const payload: RulePayload = {
      name: newRule.name!,
      trigger:   newRule.trigger!,
      condition: newRule.condition!,
      action:    newRule.action!,
      active:    newRule.active!,
    };
    try {
      const res = await fetch('/api/discount-rules', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload),
      });
      const created: DiscountRule = await res.json();
      setRules(rs => [...rs, created]);
      setShowCreateModal(false);
      setNewRule({
        name: '',
        trigger:   { type:'zone-enter', value:'' },
        condition: { type:'category',   value:'' },
        action:    { type:'percentage', value:0  },
        active:    true,
      });
    } catch {
      alert('Failed to create rule');
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading rules…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discount Rules</h1>
          <p className="text-gray-400">Location-based offers</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={()=>setShowCreateModal(true)}>
          New Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-accent">{rules.length}</p>
          <p className="text-sm text-gray-400">Total</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{rules.filter(r=>r.active).length}</p>
          <p className="text-sm text-gray-400">Active</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-highlight">—</p>
          <p className="text-sm text-gray-400">Triggered Today</p>
        </GlassCard>
      </div>

      {/* Flow Preview */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Flow Builder</h2>
        <div className="flex items-center justify-center space-x-8">
          <motion.div whileHover={{ scale:1.05 }}>
            <Zap className="h-6 w-6 text-accent mb-1"/>
            <p>Trigger</p>
          </motion.div>
          <div className="w-8 h-0.5 bg-accent"/>
          <motion.div whileHover={{ scale:1.05 }}>
            <Square className="h-6 w-6 text-highlight mb-1"/>
            <p>Condition</p>
          </motion.div>
          <div className="w-8 h-0.5 bg-accent"/>
          <motion.div whileHover={{ scale:1.05 }}>
            <Play className="h-6 w-6 text-green-400 mb-1"/>
            <p>Action</p>
          </motion.div>
        </div>
      </GlassCard>

      {/* Rules List */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-glass">
          <h2 className="text-xl font-semibold">All Rules</h2>
        </div>
        <div className="divide-y divide-glass">
          {rules.map((r,i) => {
            const beaconName = beacons.find(b=>b.id===r.trigger.value)?.name || r.trigger.value;
            return (
              <motion.div
                key={r.id}
                className="p-6 hover:bg-glass hover:bg-opacity-50 transition-colors"
                initial={{ opacity:0, y:20 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.1 }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{r.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        r.active
                          ? 'bg-green-500 bg-opacity-20 text-green-400'
                          : 'bg-gray-500 bg-opacity-20 text-gray-400'
                      }`}>
                        {r.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>Trigger: {r.trigger.type} ({beaconName})</div>
                      <div>Condition: {r.condition.type} = {r.condition.value}</div>
                      <div>Action: {r.action.value}% off</div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={r.active?'secondary':'primary'}
                      size="sm"
                      onClick={()=>toggleRule(r.id, r.active)}
                    >
                      {r.active?'Pause':'Activate'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Trash2}
                      onClick={()=>deleteRule(r.id)}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            exit   ={{ opacity:0 }}
          >
            <motion.div
              className="bg-primary border border-glass rounded-xl p-6 w-full max-w-lg mx-4"
              initial={{ scale:0.9, opacity:0 }}
              animate={{ scale:1, opacity:1 }}
              exit   ={{ scale:0.9, opacity:0 }}
            >
              <h2 className="text-xl font-bold mb-4">New Discount Rule</h2>

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={e=>setNewRule({...newRule, name:e.target.value})}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent"
                  placeholder="e.g. Snacks Offer"
                />
              </div>

              {/* Trigger */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Trigger Type</label>
                  <select
                    value={newRule.trigger?.type}
                    onChange={e=>
                      setNewRule({
                        ...newRule,
                        trigger:{...(newRule.trigger!), type:e.target.value}
                      })
                    }
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent"
                  >
                    {triggerTypes.map(t=>(
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Beacon</label>
                  <select
                    value={newRule.trigger?.value}
                    onChange={e=>
                      setNewRule({
                        ...newRule,
                        trigger:{...(newRule.trigger!), value:e.target.value}
                      })
                    }
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent"
                  >
                    <option value="">– select beacon –</option>
                    {beacons.map(b=>(
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Condition Type</label>
                  <select
                    value={newRule.condition?.type}
                    onChange={e=>
                      setNewRule({
                        ...newRule,
                        condition:{...(newRule.condition!), type:e.target.value}
                      })
                    }
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent"
                  >
                    {conditionTypes.map(t=>(
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condition Value</label>
                  <input
                    type="text"
                    value={newRule.condition?.value}
                    onChange={e=>
                      setNewRule({
                        ...newRule,
                        condition:{...(newRule.condition!), value:e.target.value}
                      })
                    }
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent"
                    placeholder="e.g. Snacks"
                  />
                </div>
              </div>

              {/* Action */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Action Type</label>
                  <select
                    value={newRule.action?.type}
                    onChange={e=>
                      setNewRule({
                        ...newRule,
                        action:{...(newRule.action!), type:e.target.value}
                      })
                    }
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent"
                  >
                    {actionTypes.map(t=>(
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={newRule.action?.value}
                    onChange={e=>
                      setNewRule({
                        ...newRule,
                        action:{...(newRule.action!), value:Number(e.target.value)}
                      })
                    }
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent"
                    placeholder="e.g. 15"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <Button variant="primary" onClick={createRule} className="flex-1">
                  Create Rule
                </Button>
                <Button variant="secondary" onClick={()=>setShowCreateModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
