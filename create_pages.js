const fs = require('fs');
const path = require('path');

const pages = [
  'src/pages/auth/Login.tsx',
  'src/pages/dashboard/Dashboard.tsx',
  'src/pages/students/Students.tsx',
  'src/pages/teachers/Teachers.tsx',
  'src/pages/classes/Classes.tsx',
  'src/pages/attendance/Attendance.tsx',
  'src/pages/live-ai/LiveAI.tsx',
  'src/pages/analytics/Analytics.tsx',
  'src/pages/reports/Reports.tsx',
  'src/pages/settings/Settings.tsx'
];

pages.forEach(pagePath => {
  const fullPath = path.join(__dirname, '../frontend', pagePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const componentName = path.basename(pagePath, '.tsx');
  const content = `import React from 'react';

export const ${componentName}: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">${componentName}</h1>
      <p>Placeholder for ${componentName} page.</p>
    </div>
  );
};
`;

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content);
    console.log(`Created ${pagePath}`);
  }
});
