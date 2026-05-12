import fs from 'fs';
const file = 'src/pages/News.jsx';
let code = fs.readFileSync(file, 'utf8');

const replacements = [
  // Background
  ['bg-blue-600/5 blur-[120px]', 'bg-blue-50/80 blur-[100px]'],
  
  // Headers
  ['bg-white/5 border border-white/10 text-xs font-medium text-blue-400 w-fit mb-2', 'bg-[#fcfcfc] shadow-sm border border-[#e4e4e4] text-xs font-medium text-[#0a0a0a] w-fit mb-2'],
  ['text-3xl sm:text-4xl font-bold text-white tracking-tight', 'text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight'],
  ['text-gray-400 text-sm font-light mt-1 max-w-xl', 'text-[#4a4a4a] text-base font-medium max-w-xl mt-1'],
  
  // Buttons
  ['bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white text-xs transition-all mt-1', 'bg-[#fcfcfc] hover:bg-white border border-[#e4e4e4] rounded-xl text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#c4c4c4] text-xs shadow-sm transition-all mt-1'],
  ['bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white transition-colors', 'bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl text-sm text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#c4c4c4] hover:bg-white shadow-sm transition-all'],
  
  // Tabs
  ['bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg shadow-purple-500/20', 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-md'],
  ['bg-[#111116]/80 border-white/10 text-gray-400 hover:text-white hover:border-white/20', 'bg-[#fcfcfc] border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#c4c4c4] shadow-sm'],

  // Loading text
  ['text-gray-400', 'text-[#6b6b6b]'],

  // Cards
  ['bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-2xl hover:shadow-blue-500/8', 'bg-white border border-[#e4e4e4] shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#c4c4c4] hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)]'],
  ['from-blue-500/4 to-purple-500/4', 'from-blue-50/50 to-purple-50/50'],
  
  // Card elements
  ['bg-white/5 border border-white/10 text-gray-400 w-fit mb-3', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#6b6b6b] shadow-sm w-fit mb-3'],
  ['text-white leading-snug mb-2 group-hover:text-blue-300 transition-colors line-clamp-2', 'text-[#0a0a0a] leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2'],
  ['text-purple-400', 'text-purple-600'],
  ['text-gray-400 text-sm font-light leading-relaxed mb-4 flex-1 line-clamp-3', 'text-[#4a4a4a] text-sm font-medium leading-relaxed mb-4 flex-1 line-clamp-3'],
  ['border-white/5', 'border-[#e4e4e4]'],
  ['text-gray-500', 'text-[#8b8b8b]'],
  ['text-gray-600', 'text-[#a3a3a3]'],
  ['group-hover:text-blue-400', 'group-hover:text-blue-600'],

  // Empty state
  ['bg-white/[0.02] border border-dashed border-white/10 rounded-2xl', 'bg-[#f9f9f9] border border-dashed border-[#c4c4c4] rounded-2xl shadow-inner'],
  ['text-gray-700 mx-auto mb-3', 'text-[#a3a3a3] mx-auto mb-3'],
  ['text-white mb-1', 'text-[#0a0a0a] mb-1'],
];

replacements.forEach(([target, replacement]) => {
  code = code.split(target).join(replacement);
});

// Inject proper style block
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
console.log('News converted');
