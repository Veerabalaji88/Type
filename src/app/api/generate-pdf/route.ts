import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

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
      passageText,
      timestamp,
    } = body;

    // Create PDF in a stream-based approach
    const stream = new Writable({
      write(chunk: Buffer, encoding, callback) {
        callback();
      }
    });

    const buffers: Buffer[] = [];

    return new Promise<Response>((resolve, reject) => {
      // Create a PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 20,
      });

      // Collect data chunks
      doc.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });

      // Handle errors
      doc.on('error', (err: any) => {
        console.error('PDF Document Error:', err);
        reject(err);
      });

      // Handle finish event (when all data has been written)
      doc.on('end', () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          const response = new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="CSCTypingTest-${language}-${level}.pdf"`,
              'Content-Length': pdfBuffer.length.toString(),
            },
          });
          resolve(response);
        } catch (err) {
          reject(err);
        }
      });

      try {
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
          doc.text(value as string, doc.page.width - 65, doc.y - 15, { width: 60, align: 'right' });
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
        doc.fontSize(12).font('Helvetica-Bold').text('Original Passage', 20);
        doc.fontSize(10).font('Helvetica');
        
        // Display text with automatic wrapping
        doc.text(passageText, {
          width: doc.page.width - 40,
          align: 'left',
        });
        
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica-Bold').text('Verdict', 20);
        doc.fontSize(11).font('Helvetica-Bold');
        const verdict = passed ? 'EXAMINATION PASSED ✓' : 'EXAMINATION UNSUCCESSFUL ✗';
        const verdictColor = passed ? '#10b981' : '#ef4444';
        doc.fillColor(verdictColor).text(verdict, 20);
        
        // End document - this triggers 'end' event
        doc.end();
      } catch (genError: any) {
        console.error('PDF content generation error:', genError);
        reject(genError);
      }
    });
  } catch (error: any) {
    console.error('PDF Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
