import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, Square, Trash2, Zap } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import { mockDiscountRules } from '../../data/mockData';
import { DiscountRule } from '../../types';

const DiscountCreator = () => {
  const [rules, setRules] = useState<DiscountRule[]>(mockDiscountRules);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRule, setNewRule] = useState<Partial<DiscountRule>>({
    name: '',
    trigger: { type: 'zone-enter', value: '' },
    condition: { type: 'category', value: '' },
    action: { type: 'percentage', value: 0 },
    active: true
  });

  const triggerTypes = [
    { value: 'zone-enter', label: 'Zone Entry' },
    { value: 'product-view', label: 'Product View' },
    { value: 'time-based', label: 'Time Based' }
  ];

  const conditionTypes = [
    { value: 'category', label: 'Product Category' },
    { value: 'product', label: 'Specific Product' },
    { value: 'user-type', label: 'User Type' }
  ];

  const actionTypes = [
    { value: 'percentage', label: 'Percentage Off' },
    { value: 'fixed-amount', label: 'Fixed Amount Off' },
    { value: 'buy-one-get-one', label: 'Buy One Get One' }
  ];

  const toggleRule = (ruleId: string) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
  };

  const deleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const createRule = () => {
    if (newRule.name && newRule.trigger && newRule.condition && newRule.action) {
      const rule: DiscountRule = {
        id: `rule-${Date.now()}`,
        name: newRule.name,
        trigger: newRule.trigger,
        condition: newRule.condition,
        action: newRule.action,
        active: newRule.active || false
      };
      setRules([...rules, rule]);
      setShowCreateModal(false);
      setNewRule({
        name: '',
        trigger: { type: 'zone-enter', value: '' },
        condition: { type: 'category', value: '' },
        action: { type: 'percentage', value: 0 },
        active: true
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dynamic Discount Creator</h1>
          <p className="text-gray-400">Create and manage location-based discount rules</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowCreateModal(true)}>
          Create New Rule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-accent">{rules.length}</p>
          <p className="text-sm text-gray-400">Total Rules</p>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-green-400">
            {rules.filter(r => r.active).length}
          </p>
          <p className="text-sm text-gray-400">Active Rules</p>
        </GlassCard>
        
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-highlight">247</p>
          <p className="text-sm text-gray-400">Offers Triggered Today</p>
        </GlassCard>
      </div>

      {/* Visual Flow Builder */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-semibold mb-4">Flow Builder</h2>
        <div className="flex items-center justify-center space-x-8 py-8">
          {/* Trigger Node */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-32 h-20 bg-accent bg-opacity-20 border-2 border-accent rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Zap className="h-6 w-6 text-accent mx-auto mb-1" />
                <p className="text-sm font-medium">Trigger</p>
                <p className="text-xs text-gray-400">Zone Enter</p>
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-accent"></div>
            <div className="w-0 h-0 border-l-4 border-l-accent border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
          </div>

          {/* Condition Node */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-32 h-20 bg-highlight bg-opacity-20 border-2 border-highlight rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Square className="h-6 w-6 text-highlight mx-auto mb-1" />
                <p className="text-sm font-medium">Condition</p>
                <p className="text-xs text-gray-400">Category = Snacks</p>
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-accent"></div>
            <div className="w-0 h-0 border-l-4 border-l-accent border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
          </div>

          {/* Action Node */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-32 h-20 bg-green-500 bg-opacity-20 border-2 border-green-500 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Play className="h-6 w-6 text-green-400 mx-auto mb-1" />
                <p className="text-sm font-medium">Action</p>
                <p className="text-xs text-gray-400">15% Off</p>
              </div>
            </div>
          </motion.div>
        </div>
      </GlassCard>

      {/* Rules List */}
      <GlassCard className="overflow-hidden">
        <div className="p-6 border-b border-glass">
          <h2 className="text-xl font-semibold">Discount Rules</h2>
        </div>
        
        <div className="divide-y divide-glass">
          {rules.map((rule, index) => (
            <motion.div
              key={rule.id}
              className="p-6 hover:bg-glass hover:bg-opacity-50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rule.active ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-gray-500 bg-opacity-20 text-gray-400'
                    }`}>
                      {rule.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-accent" />
                      <span>Trigger: {rule.trigger.type} ({rule.trigger.value})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Square className="h-4 w-4 text-highlight" />
                      <span>Condition: {rule.condition.type} = {rule.condition.value}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4 text-green-400" />
                      <span>Action: {rule.action.value}% off</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant={rule.active ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => toggleRule(rule.id)}
                  >
                    {rule.active ? 'Pause' : 'Activate'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Trash2}
                    onClick={() => deleteRule(rule.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Create Rule Modal */}
      {showCreateModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-primary border border-glass rounded-xl p-6 w-full max-w-lg mx-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-bold mb-4">Create New Discount Rule</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rule Name</label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                  placeholder="e.g., Snacks Zone Welcome Offer"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Trigger Type</label>
                  <select
                    value={newRule.trigger?.type}
                    onChange={(e) => setNewRule({...newRule, trigger: {...newRule.trigger!, type: e.target.value as any}})}
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                  >
                    {triggerTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Trigger Value</label>
                  <input
                    type="text"
                    value={newRule.trigger?.value}
                    onChange={(e) => setNewRule({...newRule, trigger: {...newRule.trigger!, value: e.target.value}})}
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                    placeholder="e.g., snacks"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Condition Type</label>
                  <select
                    value={newRule.condition?.type}
                    onChange={(e) => setNewRule({...newRule, condition: {...newRule.condition!, type: e.target.value as any}})}
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                  >
                    {conditionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Condition Value</label>
                  <input
                    type="text"
                    value={newRule.condition?.value}
                    onChange={(e) => setNewRule({...newRule, condition: {...newRule.condition!, value: e.target.value}})}
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                    placeholder="e.g., Snacks"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Action Type</label>
                  <select
                    value={newRule.action?.type}
                    onChange={(e) => setNewRule({...newRule, action: {...newRule.action!, type: e.target.value as any}})}
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                  >
                    {actionTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Discount Value</label>
                  <input
                    type="number"
                    value={newRule.action?.value}
                    onChange={(e) => setNewRule({...newRule, action: {...newRule.action!, value: parseInt(e.target.value)}})}
                    className="w-full px-3 py-2 bg-glass rounded-lg border border-glass focus:border-accent focus:outline-none"
                    placeholder="15"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                variant="primary"
                onClick={createRule}
                className="flex-1"
              >
                Create Rule
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DiscountCreator;