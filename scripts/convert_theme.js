import fs from 'fs';
const file = 'src/pages/Resume.jsx';
let code = fs.readFileSync(file, 'utf8');

const replacements = [
  ['text-3xl sm:text-4xl font-bold', 'text-3xl sm:text-4xl font-serif text-[#0a0a0a] tracking-tight'],
  ['text-2xl font-bold', 'text-2xl font-serif text-[#0a0a0a] tracking-tight'],
  ['bg-[#111116]/80', 'bg-[#ffffff]'],
  ['bg-[#111116]', 'bg-[#ffffff]'],
  ['bg-white/3', 'bg-[#ffffff] shadow-sm'],
  ['bg-white/5', 'bg-[#f9f9f9]'],
  ['bg-white/8', 'bg-[#f3f3f3]'],
  ['bg-white/10', 'bg-[#e4e4e4]'],
  ['bg-white/12', 'bg-[#e4e4e4]'],
  ['hover:bg-white/10', 'hover:bg-[#e4e4e4]'],
  ['hover:bg-white/12', 'hover:bg-[#e4e4e4]'],
  ['hover:bg-white/25', 'hover:bg-[#c4c4c4]'],
  ['border-white/5', 'border-[#e4e4e4]'],
  ['border-white/8', 'border-[#e4e4e4]'],
  ['border-white/10', 'border-[#e4e4e4]'],
  ['border-white/20', 'border-[#c4c4c4]'],
  ['border-white/25', 'border-[#c4c4c4]'],
  ['hover:border-white/20', 'hover:border-[#0a0a0a]'],
  ['hover:border-white/25', 'hover:border-[#0a0a0a]'],
  ['text-white', 'text-[#0a0a0a]'],
  ['text-gray-300', 'text-[#3a3a3a]'],
  ['text-gray-400', 'text-[#6b6b6b]'],
  ['text-gray-500', 'text-[#8b8b8b]'],
  ['text-gray-600', 'text-[#a3a3a3]'],
  ['hover:text-white', 'hover:text-[#0a0a0a]'],
  ['placeholder-gray-600', 'placeholder-[#a3a3a3]'],
  ['bg-gradient-to-r from-blue-600 to-purple-600', 'bg-[#0a0a0a] text-[#fafafa]'],
  ['hover:from-blue-500 hover:to-purple-500', 'hover:bg-[#3a3a3a]'],
  ['bg-blue-600', 'bg-[#0a0a0a] text-[#fafafa]'],
  ['hover:bg-blue-500', 'hover:bg-[#3a3a3a]'],
  ['shadow-blue-500/25', 'shadow-md shadow-black/10'],
  ['shadow-blue-500/20', 'shadow-sm shadow-black/10'],
  ['text-amber-400', 'text-amber-600'],
  ['text-blue-400', 'text-blue-600'],
  ['text-emerald-400', 'text-emerald-600'],
  ['text-purple-400', 'text-purple-600'],
  ['text-rose-400', 'text-rose-600'],
  ['bg-blue-500/5', 'bg-blue-50'],
  ['bg-blue-500/10', 'bg-blue-50'],
  ['border-blue-500/15', 'border-blue-200'],
  ['border-blue-500/20', 'border-blue-200'],
  ['bg-emerald-500/10', 'bg-emerald-50'],
  ['bg-emerald-500/20', 'bg-emerald-100'],
  ['border-emerald-500/20', 'border-emerald-200'],
  ['bg-amber-500/10', 'bg-amber-50'],
  ['border-amber-500/20', 'border-amber-200'],
  ['bg-rose-500/10', 'bg-rose-50'],
  ['border-rose-500/20', 'border-rose-200'],
  ['bg-purple-600/5', 'bg-transparent'],
  ['disabled:from-gray-800 disabled:to-gray-800', 'disabled:bg-[#e4e4e4]'],
  ['disabled:bg-gray-800', 'disabled:bg-[#e4e4e4]'],
  ['disabled:text-gray-500', 'disabled:text-[#a3a3a3]'],
  ['focus:border-blue-500/50', 'focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a]'],
  ['focus:bg-white/8', 'focus:bg-[#ffffff]'],
  ['bg-[#1e1e1e]', 'bg-[#f9f9f9] border-[#e4e4e4]'],
  ['text-gray-200', 'text-[#0a0a0a]'],
];

replacements.forEach(([target, replacement]) => {
  code = code.split(target).join(replacement);
});

if (!code.includes('<style>')) {
  const styleBlock = "<Layout>\\n" +
      "      <style>{\\n" +
      "        `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');\\n" +
      "        .font-sans, .font-sans * { font-family: 'DM Sans', system-ui, sans-serif; }\\n" +
      "        .font-serif { font-family: 'DM Serif Display', Georgia, serif !important; }\\n" +
      "        .bg-\\\\[\\\\#ffffff\\\\] { background-color: #ffffff; }`\\n" +
      "      }</style>";
  code = code.replace('<Layout>', styleBlock);
}

fs.writeFileSync(file, code);
console.log('Conversion complete');
