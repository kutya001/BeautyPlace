import fs from 'fs';
let content = fs.readFileSync('js/apps/salon/dashboard.js', 'utf8');
const startIdx = content.indexOf('export function renderSalonStaffTab');
const endIdx = content.indexOf('export function renderSalonSubscriptionTab');

let subContent = content.substring(startIdx, endIdx);
subContent = subContent.replace(/\\\${/g, '${');

content = content.substring(0, startIdx) + subContent + content.substring(endIdx);
fs.writeFileSync('js/apps/salon/dashboard.js', content, 'utf8');
console.log("Success");
