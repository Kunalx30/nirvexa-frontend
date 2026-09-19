const fs = require('fs');

const transcript = fs.readFileSync('C:/Users/kunal/.gemini/antigravity-ide/brain/2ea86905-2cc0-4472-a4e4-08ceaa196784/.system_generated/logs/transcript.jsonl', 'utf8');
const lines = transcript.split('\n').filter(Boolean);

let found = false;

for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.type === 'TOOL_RESPONSE' && entry.content.includes('Profile.jsx') && entry.content.includes('pf-shell')) {
      console.log('Found it!');
      fs.writeFileSync('C:/Users/kunal/nirvexa-frontend/recovered_profile.txt', entry.content);
      found = true;
      break;
    }
  } catch (e) {
  }
}

if (!found) {
  console.log('Not found');
}
