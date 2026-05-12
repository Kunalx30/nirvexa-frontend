import fs from 'fs';
const file = 'src/pages/Profile.jsx';
let code = fs.readFileSync(file, 'utf8');

const replacements = [
  // Modal Background
  ['bg-[#111116] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl', 'bg-white border border-[#e4e4e4] rounded-2xl p-8 w-full max-w-md shadow-2xl'],
  ['bg-black/60', 'bg-black/30'],

  // Background glow
  ['bg-purple-600/5 blur-[80px]', 'bg-purple-50/60 blur-[100px]'],
  
  // Headers
  ['text-3xl font-bold text-white tracking-tight', 'text-3xl font-serif text-[#0a0a0a] tracking-tight'],
  ['text-white font-semibold text-lg', 'text-[#0a0a0a] font-bold text-lg tracking-tight'],
  ['text-2xl font-bold text-white tracking-tight', 'text-2xl font-bold text-[#0a0a0a] tracking-tight'],
  ['text-white font-medium text-sm', 'text-[#0a0a0a] font-bold text-sm tracking-tight'],

  // Text Colors
  ['text-white', 'text-[#0a0a0a]'],
  ['text-gray-200', 'text-[#3a3a3a]'],
  ['text-gray-300', 'text-[#3a3a3a]'],
  ['text-gray-400', 'text-[#6b6b6b]'],
  ['text-gray-500', 'text-[#8b8b8b]'],
  ['text-gray-600', 'text-[#a3a3a3]'],
  ['text-gray-700', 'text-[#c4c4c4]'],
  
  // Main Cards
  ['bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl transition-all hover:border-white/10', 'bg-white border border-[#e4e4e4] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#c4c4c4]'],
  ['bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col justify-between transition-all hover:border-white/10', 'bg-white border border-[#e4e4e4] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-[#c4c4c4]'],
  
  // Nested Cards / Alert lists
  ['bg-white/[0.02] border border-white/5 hover:border-white/10', 'bg-white shadow-sm border border-[#e4e4e4] hover:border-[#c4c4c4] hover:shadow-md hover:-translate-y-px'],
  ['bg-white/[0.02] border border-white/10', 'bg-[#fcfcfc] border border-[#e4e4e4] shadow-sm'],
  ['bg-white/[0.02] border border-dashed border-white/10', 'bg-[#f9f9f9] border border-dashed border-[#c4c4c4]'],
  ['bg-white/[0.02]', 'bg-[#fcfcfc]'],
  ['border border-white/10', 'border border-[#e4e4e4]'],
  ['border border-white/5', 'border border-[#e4e4e4]'],

  // Inputs
  ['bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-purple-500/50', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm'],
  ['bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm'],
  ['bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm'],
  ['bg-white/5 border border-white/10 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/50', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#8b8b8b] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm'],
  
  // Selection Pills
  ['bg-white/3 border-white/8', 'bg-[#fcfcfc] border-[#e4e4e4]'],
  ['bg-dark-700 border border-white/10 text-gray-200', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#4a4a4a] shadow-sm'],
  ['bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#6b6b6b] hover:text-[#0a0a0a] hover:border-[#a3a3a3] shadow-sm'],
  
  // Hover & Sub-borders
  ['hover:bg-white/5', 'hover:bg-[#f3f3f3]'],
  ['hover:border-white/20', 'hover:border-[#a3a3a3]'],

  // Buttons & Gradients
  ['bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all', 'bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none'],
  ['bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20', 'bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none'],
  ['px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm transition-all flex items-center gap-1.5', 'px-4 py-2 bg-[#0a0a0a] text-white hover:bg-[#222222] rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md'],
  
  // Accents colors (making text darker against light mode)
  ['text-blue-400', 'text-blue-600'],
  ['text-teal-400', 'text-teal-600'],
  ['text-amber-400', 'text-amber-600'],
  ['text-purple-400', 'text-purple-600'],
  ['text-emerald-400', 'text-emerald-600'],
  ['text-rose-400', 'text-rose-600'],
  ['text-teal-300', 'text-teal-700'],

  // Accent Backgrounds
  ['bg-blue-500/10 border-blue-500/20 text-blue-400', 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'],
  ['bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20', 'bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-sm'],
  ['bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20', 'bg-teal-50 hover:bg-teal-100 border border-teal-200 shadow-sm'],
  ['bg-teal-500/15 border-teal-500/30 text-teal-300', 'bg-[#0a0a0a] border-[#0a0a0a] text-white shadow-sm'], // active preference chips
  ['bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20', 'bg-amber-50 hover:bg-amber-100 border border-amber-200 shadow-sm'],
  ['bg-amber-500/10 border border-amber-500/20', 'bg-amber-50 border border-amber-200'],
  ['bg-emerald-500/10 border-emerald-500/20 text-emerald-400', 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'],
  ['bg-purple-500/10 border-purple-500/20 text-purple-400', 'bg-purple-50 border-purple-200 text-purple-700 shadow-sm'],
  ['bg-rose-500/10 border-rose-500/20 text-rose-400', 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'],
  ['bg-teal-500/10 border-teal-500/20 text-teal-400', 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm'],
  ['bg-gray-500/10 border-gray-500/20 text-gray-400', 'bg-gray-50 border-gray-200 text-gray-700 shadow-sm'],
  ['bg-gray-500/10 border-gray-500/20 text-gray-500', 'bg-[#f3f3f3] border-[#e4e4e4] text-[#8b8b8b]'],

  // Avatar shadow
  ['shadow-purple-500/20 border border-white/10', 'shadow-md border border-[#0a0a0a]/10'],
];

replacements.forEach(([target, replacement]) => {
  code = code.split(target).join(replacement);
});

// Fix some specific cases that didn't match perfectly
code = code.replace(/text-gray-400 font-light/g, "text-[#4a4a4a] font-medium");
code = code.replace(/text-gray-400 text-base font-light/g, "text-[#4a4a4a] text-base font-medium");
code = code.replace(/text-gray-400 text-sm font-light/g, "text-[#4a4a4a] text-sm font-medium");
code = code.replace(/text-gray-500 text-sm font-light/g, "text-[#6b6b6b] text-sm font-medium");
code = code.replace(/text-xs text-gray-500/g, "text-xs font-semibold text-[#4a4a4a]");
code = code.replace(/text-xs font-medium text-gray-500/g, "text-xs font-bold text-[#4a4a4a]");
code = code.replace(/text-xs text-gray-400/g, "text-xs font-semibold text-[#4a4a4a]");

if (!code.includes('<style>')) {
  const styleBlock = "<Layout>\\n" +
      "      <style>{\\n" +
      "        `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');\\n" +
      "        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }\\n" +
      "        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }\\n" +
      "      }`\\n" +
      "      }</style>";
  code = code.replace('<Layout>', styleBlock);
}

fs.writeFileSync(file, code);
console.log('Profile page conversion complete');
