import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixes = [
  // AlertBuilder.jsx - fix _error
  {
    file: 'src/components/Alerts/AlertBuilder.jsx',
    changes: [
      { find: "} catch (_error) {", replace: "} catch (_) {" }
    ]
  },
  // AlertNotification.jsx - remove useEffect import
  {
    file: 'src/components/Alerts/AlertNotification.jsx',
    changes: [
      { find: "import React, { useEffect } from 'react';", replace: "import React from 'react';" },
      { find: "import React from 'react';\nimport { useEffect } from 'react';", replace: "import React from 'react';" }
    ]
  },
  // HourlyForecast.jsx - remove useState
  {
    file: 'src/components/Weather/HourlyForecast.jsx',
    changes: [
      { find: "import React, { useState } from 'react';", replace: "import React from 'react';" }
    ]
  },
  // WeatherStory.jsx - move useMemo outside conditional
  {
    file: 'src/components/Weather/WeatherStory.jsx',
    changes: [
      { find: "export default function WeatherStory({ weather }) {\n  if (!weather) return null;\n\n  const story = React.useMemo(() => {\n    const { current, today_summary, air_quality } = weather;\n    const temp = current.temperature;\n    const condition = current.condition_description.toLowerCase();\n    const humidity = current.humidity;", replace: "export default function WeatherStory({ weather }) {\n  const story = React.useMemo(() => {\n    if (!weather) return '';\n    const { current, air_quality } = weather;\n    const temp = current.temperature;\n    const condition = current.condition_description.toLowerCase();" }
    ]
  },
  // formatters.js - fix _error
  {
    file: 'src/utils/formatters.js',
    changes: [
      { find: "export const formatDate = (date) => {\n  try {\n    return format(parseISO(date), 'MMM dd, yyyy');\n  } catch (_error) {\n    return 'Invalid date';\n  }\n};", replace: "export const formatDate = (date) => {\n  try {\n    return format(parseISO(date), 'MMM dd, yyyy');\n  } catch (_) {\n    return 'Invalid date';\n  }\n};" },
      { find: "export const formatTime = (time) => {\n  try {\n    return format(parseISO(time), 'HH:mm');\n  } catch (error) {\n    return 'Invalid time';\n  }\n};", replace: "export const formatTime = (time) => {\n  try {\n    return format(parseISO(time), 'HH:mm');\n  } catch (_) {\n    return 'Invalid time';\n  }\n};" },
      { find: "export const formatDateTime = (date) => {\n  try {\n    return format(parseISO(date), 'MMM dd, yyyy HH:mm');\n  } catch (error) {\n    return 'Invalid date';\n  }\n};", replace: "export const formatDateTime = (date) => {\n  try {\n    return format(parseISO(date), 'MMM dd, yyyy HH:mm');\n  } catch (_) {\n    return 'Invalid date';\n  }\n};" }
    ]
  }
];

fixes.forEach(({ file, changes }) => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    changes.forEach(({ find, replace }) => {
      if (content.includes(find)) {
        content = content.replace(find, replace);
        console.log(`✅ Fixed: ${file}`);
      }
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
  } else {
    console.log(`⚠️ File not found: ${file}`);
  }
});

console.log('\n✨ All remaining fixes applied!');