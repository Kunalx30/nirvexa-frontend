import fs from 'fs';

const files = [
  'src/pages/ForgotPassword.jsx',
  'src/pages/ResetPassword.jsx'
];

const generalReplacements = [
  // Backgrounds
  ['bg-[#0a0a0c]', 'bg-[#fcfcfc]'],
  ['bg-blue-600/10 blur-[150px]', 'bg-blue-50/80 blur-[150px]'],
  ['bg-purple-600/10 blur-[150px]', 'bg-purple-50/80 blur-[150px]'],
  
  // Logos
  ['bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/20 border border-white/10', 'bg-[#0a0a0a] rounded-xl flex items-center justify-center mx-auto mb-5 shadow-md border border-[#0a0a0a]'],
  
  // Headers
  ['text-white text-xl font-semibold mb-2', 'text-[#0a0a0a] text-xl font-bold mb-2'],
  ['text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2', 'text-2xl sm:text-3xl font-serif text-[#0a0a0a] tracking-tight mb-2'],
  ['text-gray-400 font-light text-sm', 'text-[#4a4a4a] font-medium text-sm'],
  
  // Cards
  ['bg-[#111116]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-2xl', 'bg-white border border-[#e4e4e4] rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]'],
  
  // Success states
  ['text-emerald-400 mx-auto mb-4', 'text-emerald-600 mx-auto mb-4'],
  ['text-white font-semibold text-lg mb-2', 'text-[#0a0a0a] font-bold text-lg mb-2'],
  ['text-gray-400 text-sm mb-6', 'text-[#4a4a4a] text-sm mb-6'],
  ['<span className="text-white">', '<span className="text-[#0a0a0a] font-semibold">'],
  
  // Labels
  ['text-sm font-medium text-gray-300 block mb-1.5', 'text-sm font-semibold text-[#4a4a4a] block mb-1.5 ml-1'],
  
  // Inputs
  ['bg-white/5 border border-white/10 text-gray-100 placeholder-gray-600 rounded-xl', 'bg-[#fcfcfc] border border-[#e4e4e4] text-[#0a0a0a] placeholder-[#a3a3a3] rounded-2xl shadow-sm'],
  ['focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20', 'focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white'],
  ['focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20', 'focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white'],
  ['text-gray-500', 'text-[#8b8b8b]'],
  ['hover:text-gray-300', 'hover:text-[#0a0a0a]'],
  
  // Buttons
  ['bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25', 'bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none'],
  ['bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/25', 'bg-[#0a0a0a] text-white hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#a3a3a3] disabled:cursor-not-allowed font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:transform-none'],
  
  // Links
  ['text-blue-400 hover:text-blue-300 transition-colors font-medium', 'text-[#0a0a0a] hover:text-[#3a3a3a] transition-colors font-semibold underline underline-offset-4'],
  ['text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors', 'text-[#0a0a0a] hover:text-[#3a3a3a] text-sm font-semibold transition-colors underline underline-offset-4'],
  ['text-blue-400 hover:text-blue-300 text-sm font-medium', 'text-[#0a0a0a] hover:text-[#3a3a3a] text-sm font-semibold underline underline-offset-4'],
  
  // Errors
  ['text-rose-400 mx-auto mb-4', 'text-rose-600 mx-auto mb-4'],
];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  
  generalReplacements.forEach(([target, replacement]) => {
    code = code.split(target).join(replacement);
  });
  
  if (!code.includes('<style>')) {
    const styleBlock = "<style>{`\\n" +
        "        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');\\n" +
        "        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }\\n" +
        "        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }\\n" +
        "      `}</style>\\n";
        
    // Insert after the first opening div that has min-h-[100dvh]
    code = code.replace(/<div className="min-h-\[100dvh\][^>]*>/g, match => match + "\\n" + styleBlock);
  }

  fs.writeFileSync(f, code);
  console.log(f + ' converted');
});
