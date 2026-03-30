const fs = require('fs');
const path = require('path');

const inputPath = path.join('c:', 'Users', 'ADMIN', 'OneDrive', 'Desktop', 'Mentora', 'data', 'class.csv');
const outputPath = path.join('c:', 'Users', 'ADMIN', 'OneDrive', 'Desktop', 'Mentora', 'public', 'data', 'class.csv');

try {
  const content = fs.readFileSync(inputPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    console.error('File is empty.');
    process.exit(1);
  }

  // Helper to split by two or more spaces, or by tab
  const splitLine = (line) => {
    // Also handle possible tabs just in case, though hex showed spaces
    return line.trim().split(/\s{2,}/);
  };

  const csvRows = lines.map((line, index) => {
    const columns = splitLine(line);
    // Escape columns with commas if any (unlikely in this dataset but good practice)
    return columns.map(col => {
      let val = col.trim();
      if (val.includes(',')) {
        return `"${val}"`;
      }
      return val;
    }).join(',');
  });

  fs.writeFileSync(outputPath, csvRows.join('\n'), 'utf8');
  console.log(`Successfully converted and saved to ${outputPath}`);
} catch (err) {
  console.error('Error during conversion:', err);
  process.exit(1);
}
