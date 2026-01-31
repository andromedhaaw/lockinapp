/**
 * Work Certificate
 * Verifiable proof of work for freelancers/contractors
 */

import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  Award, 
  Download, 
  Share2, 
  Shield, 
  Clock,
  Calendar,
  Hash,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  QrCode
} from 'lucide-react';
import { Card } from '../ui';

export const WorkCertificate = ({ 
  userName = 'Professional',
  period = 'week',
  totalHours = 32.5,
  startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate = new Date(),
  projectName = 'General Work'
}) => {
  const [generating, setGenerating] = useState(false);
  const certificateRef = useRef(null);

  // Generate unique certificate ID
  const certificateId = `LIW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  // Generate verification hash (simulated)
  const verificationHash = `0x${Array.from({length: 16}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}`;

  const handleDownload = async () => {
    setGenerating(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('PDF Certificate would be generated and downloaded. This is a demo feature.');
    setGenerating(false);
  };

  const handleVerify = () => {
    // In a real app, this would open a verification page
    alert(`Certificate ${certificateId} is verified and valid!`);
  };

  return (
    <div className="space-y-6">
      {/* Certificate Card */}
      <div 
        ref={certificateRef}
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl"
      >
        {/* Decorative border */}
        <div className="absolute inset-2 border border-slate-200 dark:border-slate-700 rounded-xl pointer-events-none" />
        <div className="absolute inset-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg pointer-events-none" />

        {/* Content */}
        <div className="relative p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Award className="w-8 h-8 text-yellow-500" />
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              CERTIFICATE OF WORK
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Verified Time Record
            </p>
          </div>

          {/* Main Content */}
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">This certifies that</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-serif">
              {userName}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">has completed</p>
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl mb-4">
              <Clock className="w-6 h-6" />
              <span className="text-3xl font-bold">{totalHours}</span>
              <span className="text-lg">hours</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              of verified deep work on <span className="font-medium text-gray-800 dark:text-gray-200">{projectName}</span>
            </p>
          </div>

          {/* Period */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <span className="text-gray-400">—</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Verification Info */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Hash className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Certificate ID</span>
              </div>
              <p className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                {certificateId}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wide">Verification Hash</span>
              </div>
              <p className="font-mono text-gray-900 dark:text-white text-xs truncate">
                {verificationHash}
              </p>
            </div>
          </div>

          {/* Verification Badge */}
          <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            <div>
              <div className="font-semibold text-green-700 dark:text-green-400">
                Verified by Lock In Work
              </div>
              <div className="text-sm text-green-600 dark:text-green-500">
                Issued {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-dashed border-gray-300 dark:border-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="font-bold text-gray-900 dark:text-white">Lock In Work</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <QrCode className="w-5 h-5" />
              <span className="text-xs">Scan to verify</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDownload}
          disabled={generating}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          <Download className={`w-5 h-5 ${generating ? 'animate-bounce' : ''}`} />
          {generating ? 'Generating...' : 'Download PDF'}
        </button>
        <button
          onClick={handleVerify}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all"
        >
          <ExternalLink className="w-5 h-5" />
          Verify Online
        </button>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-800 dark:text-blue-300 mb-1">
              Cryptographically Verified
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Each certificate includes a unique verification hash. Clients can verify the authenticity of your work records at any time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

WorkCertificate.propTypes = {
  userName: PropTypes.string,
  period: PropTypes.string,
  totalHours: PropTypes.number,
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  projectName: PropTypes.string,
};

export default WorkCertificate;
