const fs = require('fs');
let code = fs.readFileSync('c:/Users/kunal/nirvexa-frontend/src/pages/Profile.jsx', 'utf8');

// Remove the <style> block
code = code.replace(/<style>\{`[\s\S]*?`\}<\/style>/, '');

// Replace specific hardcoded colors with tailwind dark mode equivalents
const replacements = [
  // Backgrounds
  ['bg-white', 'bg-dark-800'],
  ['bg-[#fcfcfc]', 'bg-dark-800'],
  ['bg-[#f9f9f9]', 'bg-dark-900'],
  ['bg-[#f3f3f3]', 'bg-dark-700'],
  
  // Text
  ['text-[#0a0a0a]', 'text-gray-100'],
  ['text-[#3a3a3a]', 'text-gray-300'],
  ['text-[#4a4a4a]', 'text-gray-300'],
  ['text-[#6b6b6b]', 'text-gray-400'],
  ['text-[#8b8b8b]', 'text-gray-500'],
  ['text-[#a3a3a3]', 'text-gray-500'],
  
  // Borders
  ['border-[#e4e4e4]', 'border-dark-600'],
  ['border-[#c4c4c4]', 'border-dark-500'],
  ['border-[#a3a3a3]', 'border-dark-500'],

  // Focus
  ['focus:border-[#0a0a0a]', 'focus:border-primary-500'],
  ['focus:ring-[#0a0a0a]', 'focus:ring-primary-500/50'],
  ['focus:bg-white', 'focus:bg-dark-900'],
  
  // Hovers
  ['hover:bg-[#f3f3f3]', 'hover:bg-dark-700'],
  ['hover:border-[#c4c4c4]', 'hover:border-dark-500'],
  ['hover:border-[#a3a3a3]', 'hover:border-dark-500'],
  ['hover:text-[#0a0a0a]', 'hover:text-gray-100'],

  // Misc buttons
  ['bg-[#0a0a0a]', 'bg-primary-600'],
  ['hover:bg-[#222222]', 'hover:bg-primary-500'],
  ['disabled:bg-[#e4e4e4]', 'disabled:bg-dark-700'],
  ['disabled:text-[#a3a3a3]', 'disabled:text-gray-500'],
  ['bg-black/30', 'bg-black/60'],
];

replacements.forEach(([target, replacement]) => {
  code = code.split(target).join(replacement);
});

// Update standard fonts
code = code.replace(/font-serif/g, 'rg-serif'); // use class from index.css instead of custom font-serif

// The file might still have <div className="max-w-6xl mx-auto ..."> without text-gray-100
code = code.replace(/className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-12 font-sans/, 'className="max-w-6xl mx-auto px-4 sm:px-6 relative pb-12 font-sans text-gray-100');

fs.writeFileSync('c:/Users/kunal/nirvexa-frontend/src/pages/Profile.jsx', code);
console.log('Profile updated to dark mode tailwind');
