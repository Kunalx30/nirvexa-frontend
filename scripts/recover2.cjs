const fs = require('fs');

const transcript = fs.readFileSync('C:/Users/kunal/.gemini/antigravity-ide/brain/2ea86905-2cc0-4472-a4e4-08ceaa196784/.system_generated/logs/transcript.jsonl', 'utf8');
const lines = transcript.split('\n').filter(Boolean);

let count = 0;
for (const line of lines) {
  try {
    const entry = JSON.parse(line);
    if (entry.type === 'TOOL_RESPONSE' && entry.content.includes('Profile.jsx')) {
      fs.writeFileSync(`c:/Users/kunal/nirvexa-frontend/recovered_profile_${count}.txt`, entry.content);
      count++;
    }
  } catch (e) {
  }
}
console.log(`Saved ${count} files`);
