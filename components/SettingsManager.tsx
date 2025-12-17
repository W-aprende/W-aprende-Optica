import React, { useRef, useState } from 'react';
import { Patient, Order, BackupData } from '../types';
import { Download, Upload, Database, AlertTriangle, CheckCircle, ShieldCheck, HardDrive } from 'lucide-react';

interface SettingsManagerProps {
  patients: Patient[];
  orders: Order[];
  onImportData: (data: BackupData) => void;
}

export const SettingsManager: React.FC<SettingsManagerProps> = ({ patients, orders, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleExport = () => {
    const backup: BackupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      patients,
      orders
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `optica_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    setMessage({ type: 'success', text: 'Copia de seguridad descargada correctamente.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = event.target.files;

    if (files && files.length > 0) {
      fileReader.readAsText(files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const parsedData = JSON.parse(content) as BackupData;
            
            // Basic validation
            if (Array.isArray(parsedData.patients) && Array.isArray(parsedData.orders)) {
              if (confirm(`Estás a punto de restaurar:\n- ${parsedData.patients.length} Pacientes\n- ${parsedData.orders.length} Pedidos\n\n¿Deseas continuar? Esto sobrescribirá los datos actuales.`)) {
                onImportData(parsedData);
                setMessage({ type: 'success', text: 'Datos restaurados exitosamente.' });
              }
            } else {
              throw new Error("Formato de archivo inválido");
            }
          }
        } catch (error) {
          console.error(error);
          setMessage({ type: 'error', text: 'Error al leer el archivo. Asegúrate de que sea un respaldo válido.' });
        }
      };
    }
    // Reset input
    if (event.target) event.target.value = '';
    setTimeout(() => setMessage(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <header>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Database className="text-cyan-500" />
            Centro de Datos
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Gestiona la seguridad y portabilidad de tu información.
          </p>
        </header>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300'}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Export Card */}
          <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
              <Download size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Crear Copia de Seguridad</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Descarga un archivo seguro con todos tus pacientes y pedidos actuales. Guarda este archivo en tu <strong>Google Drive</strong> para compartirlo con otros usuarios o tener un respaldo.
            </p>
            <button 
              onClick={handleExport}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <HardDrive size={18} /> Exportar Datos
            </button>
          </div>

          {/* Import Card */}
          <div className="bg-white/75 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Restaurar Datos</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              Sube un archivo de respaldo previamente descargado. Esto <strong>actualizará</strong> tu sistema con la información del archivo. Ideal para sincronizar datos entre computadoras.
            </p>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button 
              onClick={handleImportClick}
              className="w-full py-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium border border-slate-300 dark:border-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Upload size={18} /> Seleccionar Archivo
            </button>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex gap-4">
           <ShieldCheck className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={24} />
           <div>
             <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-1">Nota sobre Sincronización</h4>
             <p className="text-sm text-blue-700 dark:text-blue-400/80">
               Actualmente este sistema opera en modo local (Offline-First). Para que dos usuarios vean lo mismo simultáneamente, uno debe <strong>Exportar</strong> y el otro <strong>Importar</strong> el archivo JSON. Para una sincronización automática en tiempo real, contacte al administrador para configurar un servidor en la nube (Firebase/AWS).
             </p>
           </div>
        </div>
    </div>
  );
};
