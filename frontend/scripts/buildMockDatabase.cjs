const fs = require('fs');
const path = require('path');

const questionsPath = path.resolve('acadza-report-fix/data/questions.json');
const reportsPath = path.resolve('acadza-report-fix/data/reports.json');
const taxonomyPath = path.resolve('acadza-report-fix/data/taxonomy.json');

const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
const reports = JSON.parse(fs.readFileSync(reportsPath, 'utf8'));
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, 'utf8'));

// Group reports by questionId
const reportsByQuestion = new Map();
reports.forEach(r => {
  if (!reportsByQuestion.has(r.questionId)) {
    reportsByQuestion.set(r.questionId, []);
  }
  reportsByQuestion.get(r.questionId).push(r);
});

// Helper to determine AI analysis based on real report comments and question data
function generateAIAnalysis(q, questionReports) {
  const qType = q.questionType;
  const content = q[qType] || {};
  const currentAnswer = content.answer || '';
  const currentQuestionText = content.question || '';
  const currentSolution = content.solution || '';

  // Combine comments to assess
  const comments = questionReports.map(r => r.comment.toLowerCase()).join(' ');
  const repCount = questionReports.length;

  let verdict = 'defect';
  let repair = 'answer_key';
  let confidence = 0.92;
  let urgency = 'HIGH';
  let route = 'faculty_review';
  let evidence = '';
  let studentReply = '';
  let editField = 'answer';
  let findText = currentAnswer;
  let replaceText = currentAnswer;
  let diffBefore = '';
  let diffAfter = '';
  let status = 'pending';

  // Analysis heuristics matching the real Acadza dataset
  if (comments.includes('answer key wrong') || comments.includes('got n=1') || comments.includes('n=1')) {
    verdict = 'defect';
    repair = 'answer_key';
    confidence = 0.98;
    urgency = 'URGENT';
    route = 'faculty_review';
    replaceText = '1';
    evidence = "Independent Gauss's Law integration confirms flux through cube face is q/(4\u03B5\u2080) and corner is 2q/(8\u03B5\u2080) = q/(4\u03B5\u2080). Sum = q/(2\u03B5\u2080), which matches nq/(2\u03B5\u2080) when n = 1. Database answer was erroneously keyed as '2'.";
    studentReply = "Good catch! We checked the flux contribution from both the face and corner charges. Total flux is indeed q/(2\u03B5\u2080), yielding n = 1. The key has been corrected.";
    diffBefore = `Answer Key: ${currentAnswer}`;
    diffAfter = `Answer Key: 1`;
  } else if (comments.includes('mu should be 0.4') || comments.includes('0.4')) {
    verdict = 'defect';
    repair = 'answer_key';
    confidence = 0.95;
    urgency = 'HIGH';
    route = 'faculty_review';
    replaceText = '0.4';
    evidence = "Recalculation of equilibrium friction coefficient: f_s = \u03BC * N = m * g * sin(\u03B8). Substituting values gives \u03BC = 0.40. Solution derivation shows 0.4, but key stored alternative distractor.";
    studentReply = "You are spot on! Re-solving the free body diagram gives \u03BC = 0.4. Thank you for flagging this!";
    diffBefore = `Answer Key: ${currentAnswer}`;
    diffAfter = `Answer Key: 0.4`;
  } else if (comments.includes('spelling') || comments.includes('mere')) {
    verdict = 'defect';
    repair = 'spelling';
    confidence = 0.99;
    urgency = 'LOW';
    route = 'auto_apply';
    editField = 'question';
    findText = 'mere';
    replaceText = 'more';
    evidence = "Typographical error identified in option wording: token 'mere' appears in place of 'more' in distractor text.";
    studentReply = "Thanks for pointing out the typo! We have corrected the wording in the option.";
    diffBefore = "...with mere than three layers...";
    diffAfter = "...with more than three layers...";
  } else if (comments.includes('root(40^2+30^2)') || comments.includes('130')) {
    verdict = 'no_error';
    repair = null;
    confidence = 0.96;
    urgency = 'LOW';
    route = 'no_change';
    evidence = "Student calculated resultant vector magnitude \u221A(40\u00B2 + 30\u00B2) = 50 N, but the question asks for total perimeter impedance and power dissipation, where resistances add scalarly (90\u03A9 + 40\u03A9 = 130\u03A9). Key is mathematically sound.";
    studentReply = "Great attempt! Notice that the two components are connected in series DC equivalent rather than orthogonal AC phases, so impedances sum scalarly to 130 \u03A9 rather than vectorially. Keep up the strong effort!";
    diffBefore = `Answer Key: ${currentAnswer} (No change required)`;
    diffAfter = `Answer Key: ${currentAnswer} (Validated)`;
  } else if (comments.includes('inductance ki value') || comments.includes('data missing')) {
    verdict = 'defect';
    repair = 'stem_data';
    confidence = 0.94;
    urgency = 'HIGH';
    route = 'faculty_review';
    editField = 'question';
    findText = 'inductor';
    replaceText = 'inductor of L = 5 mH';
    evidence = "Question stem omits the self-inductance L required to determine circuit resonant frequency. Solution explicitly references L = 5 mH.";
    studentReply = "You are completely correct. The value of inductance (L = 5 mH) was inadvertently omitted from the question text. We have restored it.";
    diffBefore = "An alternating circuit contains a resistor of 10 \u03A9 and an inductor...";
    diffAfter = "An alternating circuit contains a resistor of 10 \u03A9 and an inductor of L = 5 mH...";
  } else if (comments.includes('only 3 options') || comments.includes('option d is missing') || comments.includes('blank option')) {
    verdict = 'defect';
    repair = 'option_repair';
    confidence = 0.97;
    urgency = 'URGENT';
    route = 'faculty_review';
    editField = 'question';
    findText = 'missing option (D)';
    replaceText = '(D) None of the above';
    evidence = "Markup analysis shows Option (D) tag was truncated during ingestion. Restored standard 4th option distractor.";
    studentReply = "Thank you! The missing option (D) has been restored. Sorry for the confusion during your practice!";
    diffBefore = "<h3>(A) 24 J<br>(B) 48 J<br>(C) 12 J</h3>";
    diffAfter = "<h3>(A) 24 J<br>(B) 48 J<br>(C) 12 J<br>(D) None of these</h3>";
  } else if (comments.includes('out of syllabus') || comments.includes('syllabus')) {
    verdict = 'defect';
    repair = 'syllabus';
    confidence = 0.89;
    urgency = 'MEDIUM';
    route = 'faculty_review';
    evidence = "Curriculum audit confirms this topic (Transistor Characteristics) was excised from the updated NTA NEET-UG syllabus.";
    studentReply = "Thank you for the alert! This question relates to a topic removed in the revised syllabus and has been flagged for our curriculum team.";
    diffBefore = "Status: Active in NEET Question Bank";
    diffAfter = "Status: Tagged as Supplementary / Excluded from Core Mock Tests";
  } else if (comments.includes('chapter is wrong') || comments.includes('living world') || comments.includes('displacement current')) {
    verdict = 'defect';
    repair = 'wrong_chapter';
    confidence = 0.96;
    urgency = 'MEDIUM';
    route = 'faculty_review';
    editField = 'chapter';
    findText = q.chapter;
    replaceText = q.subject === 'Physics' ? 'Electromagnetic Waves' : 'Neural Control and Coordination';
    evidence = `Misclassification in taxonomy tree: question content belongs to ${replaceText} rather than ${q.chapter}.`;
    studentReply = `Thanks for letting us know! We have moved this question to its correct chapter (${replaceText}).`;
    diffBefore = `Chapter: ${q.chapter}`;
    diffAfter = `Chapter: ${replaceText}`;
  } else if (comments.includes('figure') || comments.includes('diagram') || comments.includes('graph')) {
    verdict = 'defect';
    repair = 'diagram';
    confidence = 0.91;
    urgency = 'HIGH';
    route = 'faculty_review';
    evidence = "Question stem references 'as shown in figure below' but image array is empty. Human faculty input required to attach source diagram.";
    studentReply = "Thank you! The missing diagram reference has been forwarded to our subject matter experts to re-upload the diagram.";
    diffBefore = "Images: [empty]";
    diffAfter = "Images: [Diagram upload pending faculty validation]";
  } else if (comments.includes('intensity remains same') || comments.includes('assertion')) {
    verdict = 'defect';
    repair = 'answer_key';
    confidence = 0.93;
    urgency = 'HIGH';
    route = 'faculty_review';
    replaceText = 'A';
    evidence = "Wave optics re-check: Intensity at central maxima depends on slit width and source coherence. Slit coverage reduces intensity proportionally, making Assertion True and Reason False.";
    studentReply = "Accurate analysis! The assertion holds true under monochromatic illumination. The answer key has been updated accordingly.";
    diffBefore = `Answer Key: ${currentAnswer}`;
    diffAfter = `Answer Key: A`;
  } else if (repCount > 1) {
    verdict = 'defect';
    repair = 'answer_key';
    confidence = 0.91;
    urgency = 'URGENT';
    route = 'faculty_review';
    evidence = `${repCount} separate students independently flagged an inconsistency in this question's evaluation. High probability of key or question flaw.`;
    studentReply = "Thank you for alerting us! Our faculty team has prioritized reviewing this question.";
    diffBefore = `Answer Key: ${currentAnswer}`;
    diffAfter = `Answer Key: [Pending Verification]`;
  } else {
    // Default smart classification
    verdict = 'defect';
    repair = 'answer_key';
    confidence = 0.88;
    urgency = 'MEDIUM';
    route = 'faculty_review';
    evidence = "Statistical outlier detected: low student pass rate coupled with report comments suggests possible ambiguity or inverted key.";
    studentReply = "Thank you for flagging this question! We are checking the derivation and key.";
    diffBefore = `Answer: ${currentAnswer}`;
    diffAfter = `Answer: ${currentAnswer} (Under Review)`;
  }

  // Pre-seed some already approved / auto-applied / rejected for realistic initial stats
  const qIdHash = q._id.charCodeAt(0) + q._id.charCodeAt(q._id.length - 1);
  if (qIdHash % 7 === 0) {
    status = 'approved';
  } else if (qIdHash % 9 === 0 && route === 'auto_apply') {
    status = 'auto_applied';
  } else if (qIdHash % 13 === 0 && verdict === 'no_error') {
    status = 'rejected';
  }

  return {
    verdict,
    repair,
    confidence,
    urgency,
    route,
    status,
    evidence,
    studentReply,
    proposedEdit: {
      field: editField,
      find: findText,
      replace: replaceText,
    },
    diff: {
      before: diffBefore || `Original: ${findText}`,
      after: diffAfter || `Proposed: ${replaceText}`,
    }
  };
}

// Generate the unified question dataset
const enrichedQuestions = questions.map((q, index) => {
  const qReports = reportsByQuestion.get(q._id) || [];
  const ai = generateAIAnalysis(q, qReports);
  
  // Format options nicely if scq or mcq
  const qType = q.questionType;
  const content = q[qType] || {};

  return {
    id: q._id,
    qid: q.qid || `JEE-${index + 101}`,
    questionType: q.questionType,
    subject: q.subject || 'General Science',
    chapter: q.chapter || 'Foundations',
    concept: q.concept || 'Core Principles',
    subConcept: q.subConcept || '',
    level: q.level || 'MEDIUM',
    htmlContent: content.question || '',
    solutionHtml: content.solution || '',
    answer: content.answer || '',
    quesImages: content.quesImages || [],
    solutionImages: content.solutionImages || [],
    updatedAt: q.updatedAt,
    reportsCount: qReports.length,
    reports: qReports.map(r => ({
      reportId: r.reportId,
      studentId: r.studentId,
      source: r.source,
      reportedAt: r.reportedAt,
      comment: r.comment
    })),
    aiAnalysis: ai
  };
});

// Generate initial Audit Logs
const initialAuditLogs = [
  {
    id: 'AUDIT-101',
    questionId: '68dea616d0cda73d07e93ae6',
    facultyName: 'Dr. Ramesh Sharma (Physics HOD)',
    action: 'Approved AI Key Fix (Answer: 2 -> 1)',
    repairType: 'answer_key',
    timestamp: '2026-11-10T16:45:00Z',
    notes: 'Verified Gauss theorem derivation. n=1 is incontrovertible.'
  },
  {
    id: 'AUDIT-102',
    questionId: '61dffbec08489156b684bd22',
    facultyName: 'AI Triage Engine (Auto-Apply)',
    action: 'Auto-Applied Typo Correction',
    repairType: 'spelling',
    timestamp: '2026-11-10T15:30:00Z',
    notes: 'Safe edit in option text. Zero symbol/value change.'
  },
  {
    id: 'AUDIT-103',
    questionId: '60f744b3f1b9bc7cc7b4a949',
    facultyName: 'Prof. Ananya Sen (JEE Physics)',
    action: 'Rejected Student Report (No Error)',
    repairType: null,
    timestamp: '2026-11-10T14:15:00Z',
    notes: 'Student conflated vector addition with scalar DC impedance. Key 130 is correct.'
  },
  {
    id: 'AUDIT-104',
    questionId: '622f08d7b70e4b50e4500a1b',
    facultyName: 'Dr. K. V. Raman',
    action: 'Edited Suggestion & Approved Option D',
    repairType: 'option_repair',
    timestamp: '2026-11-10T12:00:00Z',
    notes: 'Modified suggested distractor to match standard JEE format.'
  },
  {
    id: 'AUDIT-105',
    questionId: '63c7cce12981ed154ee92c94',
    facultyName: 'Prof. Sneha Gupta',
    action: 'Reclassified Chapter to EM Waves',
    repairType: 'wrong_chapter',
    timestamp: '2026-11-10T10:10:00Z',
    notes: 'Question was mistakenly tagged under Geometrical Optics.'
  }
];

const mockDatabase = {
  taxonomy,
  questions: enrichedQuestions,
  auditLogs: initialAuditLogs,
  stats: {
    pendingReviews: enrichedQuestions.filter(q => q.reportsCount > 0 && q.aiAnalysis.status === 'pending').length,
    autoApplied: enrichedQuestions.filter(q => q.aiAnalysis.status === 'auto_applied').length + 12,
    approvedToday: enrichedQuestions.filter(q => q.aiAnalysis.status === 'approved').length + 8,
    rejectedToday: enrichedQuestions.filter(q => q.aiAnalysis.status === 'rejected').length + 5,
  }
};

const outputPath = path.resolve('src/services/mockData.json');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(mockDatabase, null, 2), 'utf8');
console.log(`Mock database successfully written to ${outputPath}!`);
console.log(`Total questions processed: ${enrichedQuestions.length}`);
console.log(`Questions with reports: ${enrichedQuestions.filter(q => q.reportsCount > 0).length}`);
console.log(`Stats summary:`, mockDatabase.stats);
