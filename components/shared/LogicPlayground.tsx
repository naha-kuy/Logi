import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface LogicPlaygroundProps {
  availableBlocks: string[];
  correctAnswers: string[][]; // Array of possible correct combinations (e.g. [['p', 'x', 'l', 'x', 't'], ['l', 'x', 'p', 'x', 't']])
  onCorrect: () => void;
  feedbackText?: string;
}

/**
 * Komponen interaktif untuk menyusun rumus logika dari blok-blok yang tersedia.
 * 
 * @param {LogicPlaygroundProps} props - Properti komponen.
 * @param {string[]} props.availableBlocks - Daftar blok yang dapat dipilih pengguna.
 * @param {string[][]} props.correctAnswers - Array kombinasi blok yang dianggap benar.
 * @param {() => void} props.onCorrect - Fungsi callback yang dipanggil saat susunan rumus benar.
 * @param {string} [props.feedbackText="Rumus berhasil disusun!"] - Teks umpan balik saat jawaban benar.
 * @returns {JSX.Element} Elemen antarmuka LogicPlayground.
 */
export const LogicPlayground: React.FC<LogicPlaygroundProps> = ({ availableBlocks, correctAnswers, onCorrect, feedbackText = "Rumus berhasil disusun!" }) => {
  const [currentFormula, setCurrentFormula] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const handleAddBlock = (block: string) => {
    if (status === 'correct') return;
    setCurrentFormula(prev => [...prev, block]);
    setStatus('idle');
  };

  const handleRemoveBlock = (index: number) => {
    if (status === 'correct') return;
    setCurrentFormula(prev => prev.filter((_, i) => i !== index));
    setStatus('idle');
  };

  const evaluateExpression = (exprArray: string[], variables: Record<string, number>) => {
    try {
        let expr = exprArray.join(' ')
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        Object.keys(variables).forEach(v => {
            const regex = new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            expr = expr.replace(regex, variables[v].toString());
        });

        // eslint-disable-next-line no-new-func
        return new Function(`return ${expr}`)();
    } catch (e) {
        return null;
    }
  };

  const isMathematicallyEquivalent = (answer1: string[], answer2: string[]) => {
    const operators = ['+', '-', '*', '/', '×', '÷', '=', '(', ')'];
    const getVars = (form: string[]) => form.filter(b => !operators.includes(b) && isNaN(Number(b)));
    
    const allVars = Array.from(new Set([...getVars(answer1), ...getVars(answer2)]));
    
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const variables: Record<string, number> = {};
    allVars.forEach((v, i) => {
        variables[v] = primes[i % primes.length];
    });
    
    const sortedVars: Record<string, number> = {};
    Object.keys(variables).sort((a, b) => b.length - a.length).forEach(k => {
        sortedVars[k] = variables[k];
    });

    const splitByEquals = (form: string[]) => {
        const idx = form.indexOf('=');
        if (idx === -1) return [form];
        return [form.slice(0, idx), form.slice(idx + 1)];
    };

    const parts1 = splitByEquals(answer1);
    const parts2 = splitByEquals(answer2);

    if (parts1.length !== parts2.length) return false;

    if (parts1.length === 1) {
        const val1 = evaluateExpression(parts1[0], sortedVars);
        const val2 = evaluateExpression(parts2[0], sortedVars);
        return val1 !== null && val1 === val2;
    } else if (parts1.length === 2) {
        const l1 = evaluateExpression(parts1[0], sortedVars);
        const r1 = evaluateExpression(parts1[1], sortedVars);
        const l2 = evaluateExpression(parts2[0], sortedVars);
        const r2 = evaluateExpression(parts2[1], sortedVars);

        if (l1 === null || r1 === null || l2 === null || r2 === null) return false;

        return (l1 === l2 && r1 === r2) || (l1 === r2 && r1 === l2);
    }

    return false;
  };

  const handleCheck = () => {
    let isCorrect = correctAnswers.some(answer => {
        if (answer.length !== currentFormula.length) return false;
        return answer.every((block, i) => block === currentFormula[i]);
    });

    if (!isCorrect) {
        isCorrect = correctAnswers.some(answer => isMathematicallyEquivalent(answer, currentFormula));
    }

    if (isCorrect) {
        setStatus('correct');
        onCorrect();
    } else {
        setStatus('incorrect');
    }
  };

  const handleReset = () => {
    setCurrentFormula([]);
    setStatus('idle');
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Susun Rumus</h3>
        <p className="text-sm text-slate-500 font-medium">Klik blok di bawah ini untuk menyusun rumus yang tepat.</p>
      </div>

      {/* Formula Area */}
      <div className="min-h-[80px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-wrap gap-2 items-center mb-6">
        {currentFormula.length === 0 && (
            <span className="text-slate-400 font-bold text-sm italic">Area rumus kosong...</span>
        )}
        {currentFormula.map((block, idx) => (
            <button 
                key={idx} 
                onClick={() => handleRemoveBlock(idx)}
                className="px-4 py-2 bg-blue-500 text-white font-bold rounded-xl shadow-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
                {block}
            </button>
        ))}
      </div>

      {/* Available Blocks */}
      <div className="flex flex-wrap gap-2 mb-6">
        {availableBlocks.map((block, idx) => (
            <button 
                key={idx}
                onClick={() => handleAddBlock(block)}
                disabled={status === 'correct'}
                className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50"
            >
                {block}
            </button>
        ))}
      </div>

      {/* Actions & Feedback */}
      <div className="flex items-center justify-between border-t-2 border-slate-100 pt-4">
          <div className="flex items-center gap-3">
              <button 
                  onClick={handleCheck}
                  disabled={currentFormula.length === 0 || status === 'correct'}
                  className="px-6 py-3 bg-green-500 text-white font-bold rounded-xl shadow-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                  <CheckCircle size={20} /> Cek Rumus
              </button>
              <button 
                  onClick={handleReset}
                  disabled={status === 'correct'}
                  className="p-3 bg-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                  <RotateCcw size={20} />
              </button>
          </div>

          {status === 'correct' && (
              <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-xl">
                  <CheckCircle size={20} /> {feedbackText}
              </div>
          )}
          {status === 'incorrect' && (
              <div className="flex items-center gap-2 text-red-500 font-bold bg-red-50 px-4 py-2 rounded-xl">
                  <XCircle size={20} /> Coba lagi! Susunannya belum tepat.
              </div>
          )}
      </div>
    </div>
  );
};
