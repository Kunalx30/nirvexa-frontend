import fs from 'fs';
const file = 'src/pages/Interview.jsx';
let code = fs.readFileSync(file, 'utf8');

// Colors helper replacements
code = code.replace(
  /const modeActive = {[\s\S]*?}/,
  `const modeActive = {
  hr:        'bg-blue-50 border-blue-200 text-blue-700 shadow-sm',
  technical: 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm',
  mock:      'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm',
  stress:    'bg-rose-50 border-rose-200 text-rose-700 shadow-sm',
}`
);

code = code.replace(
  /const levelActive = {[\s\S]*?}/,
  `const levelActive = {
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm',
  amber:   'bg-amber-50 border-amber-200 text-amber-700 shadow-sm',
  rose:    'bg-rose-50 border-rose-200 text-rose-700 shadow-sm',
}`
);

code = code.replace(/text-emerald-400/g, 'text-emerald-600');
code = code.replace(/text-amber-400/g, 'text-amber-600');
code = code.replace(/text-rose-400/g, 'text-rose-600');
code = code.replace(/text-purple-400/g, 'text-purple-600');
code = code.replace(/text-blue-400/g, 'text-blue-600');

// Component specific replacements
const replacements = [
  ['bg-[#111116]/80 backdrop-blur-xl border border-white/5', 'bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'],
  ['bg-[#111116]/80 backdrop-blur-xl border border-white/8', 'bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)]'],
  ['bg-purple-600/8 blur-[120px]', 'bg-purple-50/80 blur-[100px]'],
  ['bg-blue-600/8 blur-[100px]', 'bg-blue-50/80 blur-[100px]'],
  ['bg-emerald-600/8 blur-[100px]', 'bg-emerald-50/80 blur-[100px]'],
  
  // Headers and general text
  ['text-3xl sm:text-4xl font-bold text-white tracking-tight', 'text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight'],
  ['text-white font-semibold', 'text-[#0a0a0a] font-bold text-lg tracking-tight'],
  ['text-2xl font-bold text-white', 'text-3xl font-serif text-[#0a0a0a]'],
  ['text-gray-400 text-sm mt-2 max-w-xl', 'text-[#4a4a4a] text-base font-medium max-w-xl mt-1'],
  ['text-gray-400', 'text-[#6b6b6b]'],
  ['text-gray-500', 'text-[#8b8b8b]'],
  ['text-gray-300', 'text-[#3a3a3a]'],
  ['text-white', 'text-[#0a0a0a]'],
  
  // Inputs
  ['bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-purple-500/50 transition-colors', 'w-full bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl px-4 py-3.5 focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white transition-all text-sm shadow-sm'],
  
  // Role tags
  ['bg-purple-500/20 border-purple-500/40 text-purple-300', 'bg-[#0a0a0a] border border-[#0a0a0a] text-white shadow-sm font-medium'],
  ['bg-white/3 border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/20', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm font-medium'],
  
  // Mode/Level buttons
  ['bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/15 hover:bg-white/5 hover:text-gray-200', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#8b8b8b] hover:border-[#c4c4c4] hover:shadow-sm hover:text-[#0a0a0a] shadow-sm'],
  ['bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#8b8b8b] hover:border-[#c4c4c4] hover:shadow-sm hover:text-[#0a0a0a] shadow-sm'],
  
  // Mic button
  ['bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse', 'bg-rose-50 border-rose-300 text-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.2)] animate-pulse'],
  ['bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/40', 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:bg-white hover:border-[#a3a3a3] hover:text-[#0a0a0a] shadow-sm'],
  
  // Primary Buttons
  ['bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-white/5 disabled:to-white/5 disabled:border disabled:border-white/10 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none text-base', 'w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none text-base'],
  ['bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all text-sm', 'w-full flex items-center justify-center gap-2 bg-[#0a0a0a] text-white hover:bg-[#222222] font-semibold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm'],
  ['bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3.5 rounded-xl transition-all text-sm', 'bg-white hover:bg-[#f3f3f3] border border-[#e4e4e4] text-[#0a0a0a] font-semibold py-3.5 rounded-xl transition-all shadow-sm text-sm'],

  // Live transcript
  ['bg-white/3 border border-white/8 rounded-xl p-4 text-sm', 'bg-[#fcfcfc] border border-[#e4e4e4] rounded-2xl p-4 text-sm shadow-inner'],
  
  // Misc Badges / Tags
  ['bg-white/5 border border-white/10 text-xs font-medium text-purple-400', 'bg-purple-50 border border-purple-200 text-xs font-medium text-purple-700 shadow-sm'],
  ['bg-emerald-500/10 border-emerald-500/30 text-emerald-400', 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'],
  ['bg-amber-500/10 border-amber-500/30 text-amber-400', 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'],
  ['bg-rose-500/10 border-rose-500/30 text-rose-400', 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'],
  ['bg-emerald-500/10 text-emerald-400', 'bg-emerald-50 text-emerald-700'],
  ['bg-amber-500/10 text-amber-400', 'bg-amber-50 text-amber-700'],
  ['bg-rose-500/10 text-rose-400', 'bg-rose-50 text-rose-700'],
  
  // Score / Progress / Icons containers
  ['bg-white/5 rounded-full overflow-hidden', 'bg-[#f0f0f0] rounded-full overflow-hidden shadow-inner'],
  ['bg-emerald-500/10 border border-emerald-500/30 rounded-full', 'bg-emerald-50 border border-emerald-200 rounded-full'],
  ['bg-purple-500/20 border border-purple-500/30 flex items-center', 'bg-purple-50 border border-purple-200 shadow-sm flex items-center'],
  ['bg-emerald-500/5 border border-emerald-500/15 rounded-xl', 'bg-emerald-50 border border-emerald-200 rounded-2xl shadow-sm'],
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
console.log('Interview converted');
