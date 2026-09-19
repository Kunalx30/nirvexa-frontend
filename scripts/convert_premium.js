import fs from 'fs';
const file = 'src/pages/Resume.jsx';
let code = fs.readFileSync(file, 'utf8');

const replacements = [
  // 1. Elevate Main Card
  ['bg-[#ffffff] backdrop-blur-xl border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 min-h-[420px]', 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e4e4e4] rounded-3xl p-6 sm:p-8 min-h-[420px] transition-all duration-300'],
  
  // 2. Elevate Nested Cards (Experience, Education, Projects)
  ['bg-[#ffffff] shadow-sm border border-[#e4e4e4] rounded-2xl p-5', 'bg-white shadow-sm hover:shadow-md border border-[#e4e4e4] hover:border-[#c4c4c4] rounded-2xl p-5 transition-all duration-300 transform hover:-translate-y-0.5'],
  
  // 3. Inputs
  ['bg-[#f9f9f9] border border-[#e4e4e4] rounded-xl px-4 py-2.5 text-sm text-[#0a0a0a] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-[#f3f3f3]', 'bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl px-4 py-2.5 text-sm text-[#0a0a0a] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm transition-all duration-200'],
  
  // 4. TextAreas
  ['bg-[#f9f9f9] border border-[#e4e4e4] rounded-xl px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-[#f3f3f3]', 'bg-[#fcfcfc] border border-[#e4e4e4] rounded-xl px-4 py-3 text-sm text-[#0a0a0a] placeholder-[#a3a3a3] focus:outline-none focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] focus:bg-white shadow-sm transition-all duration-200'],
  
  // 5. Template Cards
  ['hover:border-[#0a0a0a]', 'hover:border-[#0a0a0a] hover:shadow-lg'],
  
  // 6. Analyzer Card
  ['bg-[#ffffff] backdrop-blur-xl border border-[#e4e4e4] rounded-3xl p-6 sm:p-10 text-center', 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#e4e4e4] rounded-3xl p-6 sm:p-10 text-center transition-all duration-300'],
  
  // 7. Buttons (making black buttons pop more)
  ['bg-[#0a0a0a] text-[#fafafa] hover:bg-[#3a3a3a]', 'bg-[#0a0a0a] text-[#fafafa] hover:bg-[#222222] hover:shadow-lg hover:-translate-y-0.5'],
  
  // 8. Progress Steps
  ['bg-[#ffffff] shadow-sm text-[#a3a3a3]', 'bg-white border border-[#e4e4e4] text-[#a3a3a3] shadow-sm'],
  
  // 9. Fix Section Titles
  ['<h3 className="text-[#0a0a0a] font-semibold text-base">{title}</h3>', '<h3 className="text-[#0a0a0a] font-bold text-lg tracking-tight">{title}</h3>'],
  
  // 10. Add Icon Container Glow
  ['w-8 h-8 rounded-lg bg-[#f9f9f9] border border-[#e4e4e4] flex items-center justify-center shrink-0 mt-0.5', 'w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm text-blue-600'],
  
  // 11. Add to button "Next"
  ['bg-[#0a0a0a] text-[#fafafa] hover:bg-[#3a3a3a] disabled:bg-[#e4e4e4] disabled:text-[#8b8b8b] disabled:cursor-not-allowed text-[#0a0a0a] text-sm font-semibold rounded-xl transition-all', 'bg-[#0a0a0a] text-[#fafafa] hover:bg-[#222222] disabled:bg-[#e4e4e4] disabled:text-[#8b8b8b] disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5']
];

// Replaces all occurrences globally safely using string split and join
replacements.forEach(([target, replacement]) => {
  code = code.split(target).join(replacement);
});

fs.writeFileSync(file, code);
console.log('Conversion complete');
