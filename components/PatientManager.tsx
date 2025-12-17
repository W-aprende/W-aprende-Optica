import React, { useState } from 'react';
import { Patient, EyePrescription, Order } from '../types';
import { generateWhatsAppMessage } from '../services/geminiService';
import { Search, Plus, Phone, FileText, X, Send, Sparkles, Eye, Pencil, Trash2, MapPin, Info } from 'lucide-react';

interface PatientManagerProps {
  patients: Patient[];
  onAddPatient: (p: Patient) => void;
  onUpdatePatient: (p: Patient) => void;
  onDeletePatient: (id: string) => void;
}

export const PatientManager: React.FC<PatientManagerProps> = ({ patients, onAddPatient, onUpdatePatient, onDeletePatient }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // WhatsApp Modal State
  const [showWaModal, setShowWaModal] = useState(false);
  const [selectedPatientForWa, setSelectedPatientForWa] = useState<Patient | null>(null);
  const [waMessage, setWaMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Patient Form State
  const initialPatientState: Partial<Patient> = {
    name: '',
    phone: '',
    email: '',
    address: '',
    description: '',
    prescription: {
      od: { sph: '0.00', cyl: '0.00', axis: '0' },
      oi: { sph: '0.00', cyl: '0.00', axis: '0' }
    }
  };
  const [formData, setFormData] = useState<Partial<Patient>>(initialPatientState);
  const [isEditing, setIsEditing] = useState(false);

  const openAddModal = () => {
    setFormData(initialPatientState);
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (patient: Patient) => {
    setFormData(patient);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    if (isEditing && formData.id) {
      // Update existing
      onUpdatePatient(formData as Patient);
    } else {
      // Create new
      const patient: Patient = {
        id: crypto.randomUUID(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        description: formData.description,
        registrationDate: new Date().toISOString(),
        prescription: formData.prescription as { od: EyePrescription, oi: EyePrescription },
        notes: formData.notes
      };
      onAddPatient(patient);
    }

    setShowModal(false);
    setFormData(initialPatientState);
  };

  const handlePrescriptionChange = (eye: 'od' | 'oi', field: keyof EyePrescription, value: string) => {
    setFormData(prev => ({
      ...prev,
      prescription: {
        ...prev.prescription!,
        [eye]: {
          ...prev.prescription![eye],
          [field]: value
        }
      }
    }));
  };

  const openWaModal = (patient: Patient) => {
    setSelectedPatientForWa(patient);
    setWaMessage(`Hola ${patient.name}, soy de Optica Maxima G.E. Te contactamos para...`);
    setShowWaModal(true);
  };

  const generateSmartMessage = async (context: string) => {
    if (!selectedPatientForWa) return;
    setIsGenerating(true);
    const msg = await generateWhatsAppMessage(selectedPatientForWa.name, context);
    setWaMessage(msg);
    setIsGenerating(false);
  };

  const sendWhatsApp = () => {
    if (!selectedPatientForWa) return;
    const url = `https://wa.me/${selectedPatientForWa.phone}?text=${encodeURIComponent(waMessage)}`;
    window.open(url, '_blank');
    setShowWaModal(false);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Pacientes</h2>
          <p className="text-slate-500 dark:text-slate-400">Gestión de historias clínicas y prescripciones.</p>
        </div>
        <button 
          type="button"
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus size={20} />
          Nuevo Paciente
        </button>
      </header>

      {/* Search Bar */}
      <div className="relative group z-0">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-500 transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Buscar por nombre o teléfono..." 
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Patient Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-0">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl p-6 rounded-2xl flex flex-col gap-4 group hover:border-cyan-500/30 transition-all duration-300 border border-slate-200 dark:border-slate-800/60 relative">
             <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  type="button"
                  onClick={() => openEditModal(patient)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 hover:text-cyan-600 transition-colors cursor-pointer"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  type="button"
                  onClick={() => onDeletePatient(patient.id)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
             </div>

            <div className="flex justify-between items-start pr-20">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate max-w-[200px]">{patient.name}</h3>
                <p className="text-slate-500 text-sm font-mono mt-1 flex items-center gap-1.5">
                  <Phone size={12} /> {patient.phone}
                </p>
                {patient.address && (
                  <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5 truncate max-w-[200px]">
                    <MapPin size={12} /> {patient.address}
                  </p>
                )}
              </div>
            </div>
            
            {patient.description && (
              <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg italic border border-slate-100 dark:border-slate-700/50">
                "{patient.description}"
              </div>
            )}

            {/* Prescription Mini View */}
            <div className="grid grid-cols-2 gap-3 mt-1 text-xs font-mono bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="text-center">
                <div className="text-slate-500 mb-1">OD (Derecho)</div>
                <div className="text-slate-900 dark:text-white">SPH: {patient.prescription.od.sph}</div>
                <div className="text-slate-900 dark:text-white">CYL: {patient.prescription.od.cyl}</div>
              </div>
              <div className="text-center border-l border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 mb-1">OI (Izquierdo)</div>
                <div className="text-slate-900 dark:text-white">SPH: {patient.prescription.oi.sph}</div>
                <div className="text-slate-900 dark:text-white">CYL: {patient.prescription.oi.cyl}</div>
              </div>
            </div>

            <div className="mt-auto pt-4 flex gap-2">
              <button 
                type="button"
                onClick={() => openWaModal(patient)}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 py-2 rounded-lg border border-emerald-500/20 transition-colors cursor-pointer"
              >
                <Phone size={16} />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-20 text-slate-500">
          No se encontraron pacientes.
        </div>
      )}

      {/* Add/Edit Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Nombre Completo</label>
                  <input required type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white focus:border-cyan-500 outline-none" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Teléfono (con prefijo)</label>
                  <input required type="tel" placeholder="Ej: 521..." className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white focus:border-cyan-500 outline-none" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><MapPin size={14} /> Dirección (Opcional)</label>
                  <input type="text" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white focus:border-cyan-500 outline-none" 
                    value={formData.address || ''}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Info size={14} /> Descripción del Paciente (Opcional)</label>
                  <textarea rows={2} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white focus:border-cyan-500 outline-none resize-none" 
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {/* Prescription Inputs */}
              <div className="space-y-4">
                <h4 className="text-cyan-600 dark:text-cyan-400 font-medium text-sm uppercase tracking-wider">Prescripción Óptica</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* OD */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="block text-center text-slate-700 dark:text-slate-300 font-bold mb-3">Ojo Derecho (OD)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="SPH" value={formData.prescription?.od.sph} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 text-center text-slate-900 dark:text-white text-sm" onChange={e => handlePrescriptionChange('od', 'sph', e.target.value)} />
                      <input type="text" placeholder="CYL" value={formData.prescription?.od.cyl} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 text-center text-slate-900 dark:text-white text-sm" onChange={e => handlePrescriptionChange('od', 'cyl', e.target.value)} />
                      <input type="text" placeholder="AXIS" value={formData.prescription?.od.axis} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 text-center text-slate-900 dark:text-white text-sm" onChange={e => handlePrescriptionChange('od', 'axis', e.target.value)} />
                    </div>
                  </div>
                  {/* OI */}
                  <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="block text-center text-slate-700 dark:text-slate-300 font-bold mb-3">Ojo Izquierdo (OI)</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="SPH" value={formData.prescription?.oi.sph} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 text-center text-slate-900 dark:text-white text-sm" onChange={e => handlePrescriptionChange('oi', 'sph', e.target.value)} />
                      <input type="text" placeholder="CYL" value={formData.prescription?.oi.cyl} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 text-center text-slate-900 dark:text-white text-sm" onChange={e => handlePrescriptionChange('oi', 'cyl', e.target.value)} />
                      <input type="text" placeholder="AXIS" value={formData.prescription?.oi.axis} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-2 text-center text-slate-900 dark:text-white text-sm" onChange={e => handlePrescriptionChange('oi', 'axis', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Cancelar</button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  {isEditing ? 'Guardar Cambios' : 'Registrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Phone className="text-emerald-500" /> 
              Mensaje para {selectedPatientForWa?.name}
            </h3>
            
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button onClick={() => generateSmartMessage('Recordatorio de cita para examen visual')} className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 whitespace-nowrap">
                📅 Cita
              </button>
              <button onClick={() => generateSmartMessage('Sus gafas ya están listas para recoger')} className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 whitespace-nowrap">
                👓 Listas
              </button>
              <button onClick={() => generateSmartMessage('Recordatorio de pago pendiente')} className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 whitespace-nowrap">
                💰 Pago
              </button>
              <button onClick={() => generateSmartMessage('Seguimiento de satisfacción post-compra')} className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-cyan-600 dark:text-cyan-400 px-3 py-1.5 rounded-full border border-cyan-500/20 whitespace-nowrap">
                ⭐ Seguimiento
              </button>
            </div>

            <div className="relative">
              <textarea 
                className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-slate-900 dark:text-white text-sm focus:border-emerald-500 outline-none resize-none"
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
              />
              {isGenerating && (
                 <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/80 flex items-center justify-center text-cyan-600 dark:text-cyan-400 text-sm gap-2">
                    <Sparkles className="animate-spin" size={16} /> IA Redactando...
                 </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowWaModal(false)} className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Cancelar</button>
              <button onClick={sendWhatsApp} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                <Send size={16} /> Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};