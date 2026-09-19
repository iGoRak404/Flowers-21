import React, { useState } from 'react';
import { X, Copy, Check, Download, Code2, ExternalLink } from 'lucide-react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  singleFileHtml: string;
}

export const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose, singleFileHtml }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(singleFileHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([singleFileHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flores-amarillas-interactivas.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-panel rounded-3xl border border-amber-400/30 flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Archivo HTML Único Autónomo</h3>
              <p className="text-xs text-amber-200/70">
                Todo el código (HTML + CSS embebido + JS embebido + Canvas + SVG) listo para doble clic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              id="copy-code-modal-btn"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Código'}</span>
            </button>

            <button
              onClick={handleDownload}
              id="download-html-file-btn"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-amber-200 hover:bg-slate-700 border border-amber-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Descargar .html</span>
            </button>

            <button
              onClick={onClose}
              id="close-code-modal-btn"
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="p-4 flex-1 overflow-auto bg-slate-950 text-xs font-mono text-amber-100/90 leading-relaxed select-all">
          <pre className="whitespace-pre-wrap">{singleFileHtml}</pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-amber-500/20 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Totalmente independiente: ábrelo directamente en Chrome, Safari, Edge o Firefox.</span>
          <button
            onClick={onClose}
            className="text-amber-300 hover:underline cursor-pointer"
          >
            Cerrar ventana
          </button>
        </div>
      </div>
    </div>
  );
};
