import React, { useState } from 'react';
import { Order, OrderStatus, Patient } from '../types';
import { CheckCircle, Clock, XCircle, Plus, Receipt, Trash2, Pencil } from 'lucide-react';

interface BillingManagerProps {
  orders: Order[];
  patients: Patient[];
  onCreateOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const BillingManager: React.FC<BillingManagerProps> = ({ orders, patients, onCreateOrder, onUpdateOrder, onDeleteOrder, onUpdateStatus }) => {
  const [showModal, setShowModal] = useState(false);
  const initialOrderState = { amount: 0, items: '' };
  const [formData, setFormData] = useState<Partial<Order>>(initialOrderState);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const openCreateModal = () => {
    setFormData(initialOrderState);
    setSelectedPatientId('');
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (order: Order) => {
    setFormData(order);
    setSelectedPatientId(order.patientId);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !formData.amount) return;

    if (isEditing && formData.id) {
        // Update
        const updatedOrder: Order = {
            ...formData as Order,
            patientId: selectedPatientId,
            amount: Number(formData.amount),
            items: formData.items || 'Gafas Graduadas',
        };
        onUpdateOrder(updatedOrder);
    } else {
        // Create
        const order: Order = {
          id: crypto.randomUUID(),
          patientId: selectedPatientId,
          date: new Date().toISOString(),
          amount: Number(formData.amount),
          items: formData.items || 'Gafas Graduadas',
          status: OrderStatus.PENDING,
          isPaid: false
        };
        onCreateOrder(order);
    }

    setShowModal(false);
    setFormData(initialOrderState);
    setSelectedPatientId('');
  };

  const statusColors = {
    [OrderStatus.PENDING]: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20',
    [OrderStatus.IN_PROGRESS]: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 border-blue-200 dark:border-blue-400/20',
    [OrderStatus.READY]: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-400/10 border-purple-200 dark:border-purple-400/20',
    [OrderStatus.DELIVERED]: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20',
    [OrderStatus.CANCELLED]: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20',
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Facturación</h2>
          <p className="text-slate-500 dark:text-slate-400">Control de pedidos y finanzas.</p>
        </div>
        <button 
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
        >
          <Plus size={20} />
          Crear Pedido
        </button>
      </header>

      <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/60 relative z-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-6 font-medium">ID Pedido</th>
                <th className="p-6 font-medium">Paciente</th>
                <th className="p-6 font-medium">Detalle</th>
                <th className="p-6 font-medium">Fecha</th>
                <th className="p-6 font-medium">Monto</th>
                <th className="p-6 font-medium">Estado</th>
                <th className="p-6 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {orders.map(order => {
                const patient = patients.find(p => p.id === order.patientId);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="p-6 font-mono text-xs text-slate-500">{order.id.slice(0, 8)}</td>
                    <td className="p-6 font-medium text-slate-900 dark:text-white">{patient?.name || 'Unknown'}</td>
                    <td className="p-6 text-slate-600 dark:text-slate-300 text-sm">{order.items}</td>
                    <td className="p-6 text-slate-500 dark:text-slate-400 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="p-6 font-bold text-slate-900 dark:text-white">{order.amount.toLocaleString()} FCFA</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6 text-right flex items-center justify-end gap-2">
                       <select 
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded p-1 outline-none focus:border-cyan-500 mr-2"
                        value={order.status}
                        onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                       >
                         {Object.values(OrderStatus).map(s => (
                           <option key={s} value={s}>{s}</option>
                         ))}
                       </select>
                       <button onClick={() => openEditModal(order)} className="p-1.5 text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition cursor-pointer">
                         <Pencil size={16} />
                       </button>
                       <button onClick={() => onDeleteOrder(order.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition cursor-pointer">
                         <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-slate-500">
                    No hay pedidos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Create/Edit Order Modal */}
       {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt className="text-purple-500" /> {isEditing ? 'Editar Pedido' : 'Nuevo Pedido'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Paciente</label>
                <select 
                  required
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white focus:border-purple-500 outline-none"
                  value={selectedPatientId}
                  onChange={e => setSelectedPatientId(e.target.value)}
                >
                  <option value="">Seleccionar Paciente</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Descripción del Pedido</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Ej: Montura RayBan + Lentes Anti-reflejo"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white focus:border-purple-500 outline-none" 
                  value={formData.items}
                  onChange={e => setFormData({...formData, items: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Monto (FCFA)</label>
                <input 
                  required 
                  type="number" 
                  min="0"
                  placeholder="0"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white focus:border-purple-500 outline-none font-mono text-lg" 
                  value={formData.amount || ''}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Cancelar</button>
                <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    {isEditing ? 'Guardar Cambios' : 'Crear Pedido'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};