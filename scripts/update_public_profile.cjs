const fs = require('fs');

let content = fs.readFileSync('c:/Users/kunal/nirvexa-frontend/src/pages/PublicProfile.jsx', 'utf8');

// Replace Chip
content = content.replace(/function Chip[\s\S]*?return[\s\S]*?<\/span>\n}/, `function Chip({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-dark-800 border-dark-600 text-gray-300',
    green: 'bg-green-900/30 border-green-800/50 text-green-400',
    red: 'bg-red-900/30 border-red-800/50 text-red-400',
    dark: 'bg-primary-900/40 border-primary-800/50 text-primary-300',
  }
  return <span className={\`rounded-full border px-3 py-1.5 text-xs font-semibold \${tones[tone]}\`}>{children}</span>
}`);

// Replace Card
content = content.replace(/function Card[\s\S]*?<\/section>\n  \)\n}/, `function Card({ title, children, className = '' }) {
  return (
    <section className={\`bg-dark-800 border border-dark-600 rounded-xl p-6 shadow-sm \${className}\`}>
      {title && <h2 className="mb-4 text-lg font-bold tracking-tight text-gray-100">{title}</h2>}
      {children}
    </section>
  )
}`);

// Replace RadarScoreChart text color and stroke
content = content.replace(/stroke="#e4e4e4"/g, 'stroke="#30363D"');
content = content.replace(/fill="#3a3a3a"/g, 'fill="#9ca3af"');

// Loading state
content = content.replace(/bg-\[#fafafa\] flex items-center justify-center font-sans/g, 'bg-gray-950 flex items-center justify-center text-gray-100');
content = content.replace(/text-\[#6b6b6b\]/g, 'text-gray-400');

// Not found state
content = content.replace(/bg-\[#fafafa\] flex items-center justify-center px-4 font-sans/g, 'bg-gray-950 flex items-center justify-center px-4 text-gray-100');
content = content.replace(/text-\[#0a0a0a\]/g, 'text-gray-100');

// Main return
content = content.replace(/<main className="min-h-screen bg-\[#fafafa\].*?">/, '<main className="min-h-screen bg-gray-950 px-4 py-8 sm:px-6 lg:px-8 text-gray-100">');

// Remove <style>
content = content.replace(/<style>\{`[\s\S]*?`\}<\/style>\n/, '');

// Fix inline styles that were removed
content = content.replace(/font-sans/g, ''); // default is sans
content = content.replace(/font-serif/g, 'rg-serif'); // use class from index.css

// Card container and social links
content = content.replace(/border-\[#e4e4e4\]/g, 'border-dark-600');
content = content.replace(/bg-white/g, 'bg-dark-800');
content = content.replace(/bg-\[#fcfcfc\]/g, 'bg-dark-700/50');
content = content.replace(/text-\[#3a3a3a\]/g, 'text-gray-300');
content = content.replace(/hover:border-\[#0a0a0a\]/g, 'hover:border-gray-400 hover:text-gray-100');

// RadarScoreChart label and skill match text
content = content.replace(/text-emerald-700/g, 'text-green-400');
content = content.replace(/text-rose-700/g, 'text-red-400');
content = content.replace(/bg-\[#0a0a0a\]/g, 'bg-primary-600');
content = content.replace(/hover:bg-\[#222\]/g, 'hover:bg-primary-500');
content = content.replace(/text-\[#8b8b8b\]/g, 'text-gray-500');

fs.writeFileSync('c:/Users/kunal/nirvexa-frontend/src/pages/PublicProfile.jsx', content);
console.log('PublicProfile updated');
