import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileText, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassCard } from '../UI/GlassCard';
import { Button } from '../UI/Button';
import { useStore } from '../../store/useStore';
import type { Lead, PlatformType } from '../../types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

interface LeadUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type UploadMethod = 'csv' | 'bulk' | null;

export function LeadUploadModal({ isOpen, onClose }: LeadUploadModalProps) {
  const { addLeads } = useStore();
  const [method, setMethod] = useState<UploadMethod>(null);
  const [bulkText, setBulkText] = useState('');
  const [parsedLeads, setParsedLeads] = useState<Omit<Lead, 'id' | 'createdAt' | 'lastActionAt'>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const detectPlatform = (text: string): PlatformType => {
    const lower = text.toLowerCase();
    if (lower.includes('instagram.com') || lower.includes('instagram')) return 'instagram';
    if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook';
    if (lower.includes('@') && lower.includes('.')) return 'email';
    if (/^\+?[\d\s-]{10,}$/.test(text.replace(/\s/g, ''))) return 'phone';
    return 'other';
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          try {
            const leads = parseCSVData(results.data as Record<string, string>[]);
            setParsedLeads(leads);
            setError(null);
          } catch (e) {
            setError((e as Error).message);
          }
        },
        error: () => {
          setError('Failed to parse CSV file');
        },
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet) as Record<string, string>[];
          const leads = parseCSVData(jsonData);
          setParsedLeads(leads);
          setError(null);
        } catch (err) {
          setError('Failed to parse Excel file');
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const parseCSVData = (data: Record<string, string>[]): Omit<Lead, 'id' | 'createdAt' | 'lastActionAt'>[] => {
    return data
      .filter((row) => row.firstName || row.first_name || row.name || row.Name)
      .map((row) => {
        const firstName = row.firstName || row.first_name || row.name?.split(' ')[0] || row.Name?.split(' ')[0] || '';
        const link = row.profileLink || row.profile_link || row.link || row.url || row.URL || '';
        const platform = detectPlatform(link || row.platform || row.type || '');

        return {
          firstName,
          lastName: row.lastName || row.last_name,
          platformType: platform,
          profileLink: link || undefined,
          email: row.email || row.Email,
          phone: row.phone || row.Phone,
          status: 'New' as const,
          tags: row.tags ? row.tags.split(',').map((t) => t.trim()) : [],
          notes: row.notes || row.Notes || '',
          source: 'other' as const,
          isClient: false,
        };
      });
  };

  const handleBulkParse = () => {
    const lines = bulkText
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter((l) => l);

    const leads: Omit<Lead, 'id' | 'createdAt' | 'lastActionAt'>[] = lines.map((line) => {
      const platform = detectPlatform(line);
      const isLink = line.includes('http') || line.includes('.com');

      return {
        firstName: isLink ? line.split('/').pop() || 'Unknown' : line.split('@')[0] || line,
        platformType: platform,
        profileLink: isLink ? line : undefined,
        email: platform === 'email' ? line : undefined,
        phone: platform === 'phone' ? line : undefined,
        status: 'New' as const,
        tags: [],
        notes: '',
        source: 'other' as const,
        isClient: false,
      };
    });

    setParsedLeads(leads);
    setError(null);
  };

  const handleImport = () => {
    if (parsedLeads.length === 0) {
      setError('No leads to import');
      return;
    }

    addLeads(parsedLeads);
    setSuccess(true);
    setTimeout(() => {
      onClose();
      resetState();
    }, 1500);
  };

  const resetState = () => {
    setMethod(null);
    setBulkText('');
    setParsedLeads([]);
    setError(null);
    setSuccess(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl"
          >
            <GlassCard className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Import Leads</h2>
                  <p className="text-gray-400 text-sm mt-1">Choose your import method</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {success ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle size={64} className="text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Import Successful!</h3>
                  <p className="text-gray-400">{parsedLeads.length} leads have been imported</p>
                </motion.div>
              ) : !method ? (
                /* Method Selection */
                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMethod('csv')}
                    className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-left"
                  >
                    <Upload size={32} className="text-purple-400 mb-3" />
                    <h3 className="text-lg font-medium text-white mb-1">CSV / Excel Upload</h3>
                    <p className="text-sm text-gray-400">Upload a CSV or Excel file with lead data</p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMethod('bulk')}
                    className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 transition-all text-left"
                  >
                    <ClipboardList size={32} className="text-pink-400 mb-3" />
                    <h3 className="text-lg font-medium text-white mb-1">Bulk Paste</h3>
                    <p className="text-sm text-gray-400">Paste usernames, emails, or links</p>
                  </motion.button>
                </div>
              ) : method === 'csv' ? (
                /* CSV Upload */
                <div className="space-y-4">
                  <button
                    onClick={() => setMethod(null)}
                    className="text-sm text-purple-400 hover:text-purple-300 mb-2"
                  >
                    ← Back to methods
                  </button>

                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-purple-500/50 transition-colors">
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleCSVUpload}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload" className="cursor-pointer">
                      <FileText size={48} className="text-gray-500 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">Drop your file here or click to browse</p>
                      <p className="text-gray-400 text-sm">Supports CSV, XLSX, XLS</p>
                    </label>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  {parsedLeads.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 text-sm">
                          ✓ {parsedLeads.length} leads ready to import
                        </span>
                      </div>
                      <div className="max-h-48 overflow-y-auto rounded-lg bg-white/5 p-3">
                        {parsedLeads.slice(0, 5).map((lead, i) => (
                          <div key={i} className="flex items-center gap-2 py-1 text-sm">
                            <span className="text-white">{lead.firstName}</span>
                            <span className="text-gray-500">-</span>
                            <span className="text-purple-400">{lead.platformType}</span>
                          </div>
                        ))}
                        {parsedLeads.length > 5 && (
                          <p className="text-gray-500 text-sm mt-2">
                            ... and {parsedLeads.length - 5} more
                          </p>
                        )}
                      </div>
                      <Button variant="success" onClick={handleImport} className="w-full">
                        Import {parsedLeads.length} Leads
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                /* Bulk Paste */
                <div className="space-y-4">
                  <button
                    onClick={() => setMethod(null)}
                    className="text-sm text-purple-400 hover:text-purple-300 mb-2"
                  >
                    ← Back to methods
                  </button>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Paste usernames, emails, or profile links (one per line or comma-separated)
                    </label>
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder="user1@email.com&#10;instagram.com/user2&#10;+1234567890"
                      className="w-full h-40 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none"
                    />
                  </div>

                  <Button variant="secondary" onClick={handleBulkParse} className="w-full">
                    Parse Leads
                  </Button>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  {parsedLeads.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-green-400 text-sm">
                          ✓ {parsedLeads.length} leads ready to import
                        </span>
                      </div>
                      <Button variant="success" onClick={handleImport} className="w-full">
                        Import {parsedLeads.length} Leads
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
