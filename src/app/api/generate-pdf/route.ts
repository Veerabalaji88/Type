import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const {
      studentName,
      studentEmail,
      language,
      level,
      wpm,
      strokes,
      mistakes,
      accuracy,
      marks,
      passed,
      deductionPerMistake,
      passageText,
      typedText,
      correctWords,
      timestamp,
    } = body;

    // Create a PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 20,
    });

    // Set up response headers for file download
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('CENTRAL SCHOOL OF COMMERCE', { align: 'center' });
    doc.moveDown(0.2);
    doc.fontSize(14).font('Helvetica').text('Official Typing Examination Statement of Marks', { align: 'center' });
    doc.moveDown(0.5);
    doc.moveTo(20, doc.y).lineTo(doc.page.width - 20, doc.y).stroke();
    doc.moveDown(0.5);

    // Student & Exam Info
    doc.fontSize(12).font('Helvetica');
    doc.text(`Student Name: ${studentName}`, 20);
    doc.text(`Student ID: ${studentEmail}`, 20);
    doc.text(`Language: ${language.toUpperCase()}`, 20);
    doc.text(`Exam Level: ${level.toUpperCase()}`, 20);
    doc.text(`Date & Time: ${timestamp}`, 20);
    doc.moveDown(0.5);

    // Table Metrics
    doc.fontSize(11).font('Helvetica-Bold');
    doc.rect(20, doc.y, doc.page.width - 40, 15).fillAndStroke('#f5f5f5', '#000');
    doc.fill('#000');
    const metricsY = doc.y + 5;
    doc.text('Examination Parameter', 25, metricsY);
    doc.text('Obtained Metric', doc.page.width - 65, metricsY, { width: 60, align: 'right' });
    
    doc.moveDown(0.8);
    doc.fontSize(11).font('Helvetica');
    
    const metricsData = [
      ['Gross Speed', `${wpm} WPM`],
      ['Total Strokes Keyed', `${strokes}`],
      ['Word Mistakes Committed', `${mistakes}`],
      ['Grade Accuracy Ratio', `${accuracy}%`],
    ];

    metricsData.forEach(([label, value]) => {
      doc.text(label, 25);
      doc.text(value, doc.page.width - 65, doc.y - 15, { width: 60, align: 'right' });
      doc.moveDown(0.4);
      doc.moveTo(20, doc.y).lineTo(doc.page.width - 20, doc.y).stroke();
      doc.moveDown(0.3);
    });

    // Final Marks
    doc.fontSize(12).font('Helvetica-Bold');
    doc.rect(20, doc.y, doc.page.width - 40, 15).fillAndStroke('#f5f5f5', '#000');
    doc.fill('#000');
    const marksY = doc.y + 5;
    doc.text('NET AGGREGATE MARKS', 25, marksY);
    doc.text(`${marks} / 100`, doc.page.width - 65, marksY, { width: 60, align: 'right' });
    
    doc.moveDown(1.2);
    doc.fontSize(11).font('Helvetica');
    
    // Passage Analysis
    doc.fontSize(12).font('Helvetica-Bold').text('Original Passage (Tamil)', 20);
    doc.fontSize(10).font('Helvetica');
    
    // Wrap Tamil text for display
    const passageLines = doc.splitText(passageText, doc.page.width - 40);
    passageLines.slice(0, 5).forEach((line: string) => {
      doc.text(line, 25, { width: doc.page.width - 50 });
    });
    
    if (passageLines.length > 5) {
      doc.text('...', 25);
    }
    
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica-Bold').text('Verdict', 20);
    doc.fontSize(11).font('Helvetica-Bold');
    const verdict = passed ? 'EXAMINATION PASSED ✓' : 'EXAMINATION UNSUCCESSFUL ✗';
    const verdictColor = passed ? '#10b981' : '#ef4444';
    doc.fillColor(verdictColor).text(verdict, 20);
    
    // End document and collect data
    return new Promise((resolve) => {
      doc.on('finish', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="CSCTypingTest-${language}-${level}.pdf"`,
            },
          })
        );
      });
      
      doc.end();
    });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
