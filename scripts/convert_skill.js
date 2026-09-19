import fs from 'fs';
const file = 'src/pages/SkillMatch.jsx';
let code = fs.readFileSync(file, 'utf8');

const replacements = [
  // Typography
  ['text-3xl sm:text-4xl font-bold text-white tracking-tight', 'text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight'],
  ['text-gray-400 text-sm mt-2 max-w-xl font-light', 'text-[#4a4a4a] text-base font-medium mt-1 max-w-xl'],
  ['text-gray-500 text-xs mb-2', 'text-[#8b8b8b] text-xs font-semibold uppercase tracking-wider mb-2 block'],
  ['text-white font-semibold', 'text-[#0a0a0a] font-bold text-lg tracking-tight'],
  ['text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block', 'text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider mb-2 block ml-1'],
  ['text-gray-600 text-xs mt-1.5', 'text-[#a3a3a3] text-xs mt-1.5 ml-1'],
  
  // Layout and Backgrounds
  ['bg-purple-600/6 blur-[120px]', 'bg-purple-50/80 blur-[100px]'],
  ['bg-[#111116]/80 backdrop-blur-xl border border-white/5', 'bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'],
  
  // Header Badge
  ['bg-white/5 border border-white/10 text-xs font-medium text-purple-400', 'bg-[#fcfcfc] shadow-sm border border-[#e4e4e4] text-xs font-medium text-[#0a0a0a]'],
  
  // Inputs & Input Containers
  ['bg-white/5 border border-white/10 text-gray-100 placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 transition-all', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl px-4 py-3.5 pl-11 pr-4 focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm shadow-sm'],
  ['bg-white/3 border border-white/10 rounded-xl p-3 min-h-[52px] flex flex-wrap gap-2 items-center focus-within:border-purple-500/40 transition-colors', 'bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl p-3 min-h-[52px] flex flex-wrap gap-2 items-center focus-within:border-[#0a0a0a] focus-within:ring-1 focus-within:ring-[#0a0a0a] focus-within:bg-white transition-all shadow-sm'],
  ['text-gray-500', 'text-[#8b8b8b]'], // Icons inside input
  ['text-gray-200 placeholder-gray-600', 'text-[#0a0a0a] placeholder-[#a3a3a3]'],

  // Selected Skills
  ['bg-purple-500/15 border border-purple-500/30 text-purple-300', 'bg-[#0a0a0a] border border-[#0a0a0a] text-white shadow-sm'],
  
  // Suggested Skills
  ['bg-white/3 border border-white/8 text-gray-400 hover:text-gray-200 hover:border-white/20 text-xs transition-all', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm text-xs transition-all'],
  
  // Button
  ['bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 disabled:shadow-none text-sm', 'bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none text-sm'],

  // Progress Bar / Accents
  ['bg-white/5 rounded-full overflow-hidden', 'bg-[#f0f0f0] rounded-full overflow-hidden shadow-inner'],
  
  // Colors inside results
  ['text-purple-400', 'text-purple-600'],
  ['bg-emerald-500/10 border border-emerald-500/20 text-emerald-300', 'bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm'],
  ['bg-rose-500/10 border border-rose-500/20 text-rose-300', 'bg-rose-50 border border-rose-200 text-rose-700 shadow-sm'],
  ['bg-amber-500/10 border border-amber-500/20 text-amber-300', 'bg-amber-50 border border-amber-200 text-amber-700 shadow-sm'],
  ['text-emerald-400', 'text-emerald-600'],
  ['text-rose-400', 'text-rose-600'],
  ['text-amber-400', 'text-amber-600'],
  ['text-blue-400', 'text-blue-600'],
  ['text-emerald-300', 'text-emerald-600'],
  ['text-rose-300', 'text-rose-600'],
  ['text-amber-300', 'text-amber-600'],

  // Links & Cards inside results
  ['bg-white/3 border border-white/8 rounded-xl', 'bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl shadow-sm hover:border-[#c4c4c4] transition-all'],
  ['text-gray-300 text-sm group-hover:text-blue-300', 'text-[#3a3a3a] text-sm group-hover:text-blue-600 font-medium'],
  ['text-gray-400 text-xs mt-3 p-3 bg-white/3 border border-white/8 rounded-xl leading-relaxed', 'text-[#4a4a4a] font-medium text-xs mt-3 p-3 bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl leading-relaxed shadow-sm'],
  ['text-gray-600 group-hover:text-blue-400', 'text-[#8b8b8b] group-hover:text-blue-600'],
  ['border-t border-white/5', 'border-t border-[#e4e4e4]'],
  ['bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded', 'bg-emerald-50 border border-emerald-200 text-emerald-700 rounded font-semibold']
];

replacements.forEach(([target, replacement]) => {
  code = code.split(target).join(replacement);
});

// Ensure styles inject
if (!code.includes('<style>')) {
  const styleBlock = "<Layout>\\n" +
      "      <style>{`\\n" +
      "        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');\\n" +
      "        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }\\n" +
      "        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }\\n" +
      "      `}</style>";
  code = code.replace('<Layout>', styleBlock);
}

fs.writeFileSync(file, code);
console.log('SkillMatch converted');
