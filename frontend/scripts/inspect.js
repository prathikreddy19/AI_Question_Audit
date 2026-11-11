const fs = require('fs');
const questions = JSON.parse(fs.readFileSync('./acadza-report-fix/data/questions.json', 'utf8'));
const reports = JSON.parse(fs.readFileSync('./acadza-report-fix/data/reports.json', 'utf8'));
const qMap = new Map(questions.map(q => [q._id, q]));

reports.forEach((r, idx) => {
  const q = qMap.get(r.questionId);
  const qType = q ? q.questionType : 'unknown';
  const content = q && q[qType] ? q[qType] : null;
  const ans = content ? content.answer : 'N/A';
  console.log(`[${idx+1}] ID: ${r.reportId} | QID: ${r.questionId} | Sub: ${q ? q.subject : 'N/A'} | Type: ${qType} | Ans: ${ans} | Comment: "${r.comment}"`);
});
