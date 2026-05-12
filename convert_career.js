import fs from 'fs';

const files = [
  'src/pages/SalaryInsights.jsx',
  'src/pages/CompanyResearch.jsx'
];

const generalReplacements = [
  // Backgrounds
  ['bg-green-600/6 blur-[120px]', 'bg-emerald-50/80 blur-[100px]'],
  ['bg-blue-600/6 blur-[120px]', 'bg-blue-50/80 blur-[100px]'],
  
  // Badge headers
  ['bg-white/5 border border-white/10 text-xs font-medium text-green-400 mb-3', 'bg-[#fcfcfc] shadow-sm border border-[#e4e4e4] text-[#0a0a0a] text-xs font-medium mb-3'],
  ['bg-white/5 border border-white/10 text-xs font-medium text-blue-400 mb-3', 'bg-[#fcfcfc] shadow-sm border border-[#e4e4e4] text-[#0a0a0a] text-xs font-medium mb-3'],
  
  // Headers
  ['text-3xl sm:text-4xl font-bold text-white tracking-tight', 'text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight'],
  ['text-gray-400 text-sm mt-2 max-w-xl font-light', 'text-[#4a4a4a] text-base font-medium mt-1 max-w-xl'],
  
  // Input labels
  ['text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 block', 'text-xs font-semibold text-[#4a4a4a] uppercase tracking-wider mb-2 block ml-1'],
  
  // Card Backgrounds
  ['bg-[#111116]/80 backdrop-blur-xl border border-white/5', 'bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)]'],
  ['bg-[#111116]/80 border border-white/5', 'bg-white border border-[#e4e4e4] shadow-sm hover:shadow-md transition-all'],
  
  // Text mapped colors
  ['text-gray-300', 'text-[#4a4a4a]'],
  ['text-gray-400', 'text-[#6b6b6b]'],
  ['text-gray-500', 'text-[#8b8b8b]'],
  ['text-gray-600', 'text-[#a3a3a3]'],
  ['text-white', 'text-[#0a0a0a]'],
  ['text-amber-400', 'text-amber-600'],
  ['text-amber-300', 'text-amber-700'],
  ['text-emerald-400', 'text-emerald-600'],
  ['text-rose-400', 'text-rose-600'],
  ['text-purple-400', 'text-purple-600'],
  ['text-purple-300', 'text-purple-700'],
  ['text-green-400', 'text-emerald-600'],
  ['text-green-300', 'text-emerald-700'],
  ['text-blue-400', 'text-blue-600'],
  ['text-blue-300', 'text-blue-700'],
  ['text-teal-400', 'text-teal-600'],
  
  // Buttons
  ['bg-white/3 border-white/8 text-[#6b6b6b] hover:text-gray-200 hover:border-white/20', 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm font-medium'],
  ['bg-white/3 border-white/8 text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-white/20', 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm font-medium'],
  
  // Active buttons
  ['bg-green-500/15 border-green-500/30 text-emerald-700', 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm font-medium'],
  ['bg-blue-500/15 border-blue-500/30 text-blue-700', 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm font-medium'],
  
  // Result Badges
  ['bg-blue-500/10 border-blue-500/20 text-blue-600', 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'],
  ['bg-purple-500/10 border-purple-500/20 text-purple-600', 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'],
  ['bg-purple-500/10 border-purple-500/20 text-purple-700', 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'],
  ['bg-green-500/10 border-green-500/20 text-emerald-700', 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'],
  ['bg-amber-500/10 border-amber-500/20', 'bg-amber-50 border-amber-200 shadow-sm'],
  
  // Section headers
  ['text-[#0a0a0a] font-semibold mb-', 'text-[#0a0a0a] font-bold text-lg tracking-tight mb-'],

  // Layout inputs specific replacements (since dynamic classes are tricky to catch precisely)
  ['bg-white/5 border border-white/10 text-gray-100 placeholder-[#8b8b8b]', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3]'],
  ['focus:border-green-500/50', 'focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm'],
  ['focus:border-blue-500/50', 'focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm'],

  // Submit Buttons
  ['bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-[#8b8b8b] disabled:cursor-not-allowed text-[#0a0a0a] font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:shadow-none text-sm', 'bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none text-sm'],
  ['bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-[#8b8b8b] disabled:cursor-not-allowed text-[#0a0a0a] font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none text-sm', 'bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none text-sm']
];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  
  generalReplacements.forEach(([target, replacement]) => {
    code = code.split(target).join(replacement);
  });
  
  // Specific fix for inputs text color if missed
  code = code.replace(/text-gray-100/g, 'text-[#0a0a0a]');

  // Inject style block
  if (!code.includes('<style>')) {
    const styleBlock = "<Layout>\\n" +
        "      <style>{`\\n" +
        "        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');\\n" +
        "        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }\\n" +
        "        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }\\n" +
        "      `}</style>";
    code = code.replace('<Layout>', styleBlock);
  }

  fs.writeFileSync(f, code);
  console.log(f + ' converted');
});
