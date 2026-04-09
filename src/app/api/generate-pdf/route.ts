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
      typedText,
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
        const pageHeight = doc.page.height;
        const pageWidth = doc.page.width;
        const bottomMargin = 20;

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
        
        const metricsData: [string, string][] = [
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
        
        // Word Mistake Analysis Section
        doc.fontSize(12).font('Helvetica-Bold').text('Individual Word Mistake Analysis Log', 20);
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');

        const targetWords = passageText.trim().split(/\s+/).filter(Boolean);
        const typedWords = (typedText || '').trim().split(/\s+/).filter(Boolean);

        let startX = 20;
        let startY = doc.y;
        const marginY = 6;
        const marginX = 3;
        const maxWidth = pageWidth - 40;

        // Helper to measure text width
        const textWidth = (text: string): number => {
          return doc.widthOfString(text);
        };

        doc.fillColor('#000000');

        targetWords.forEach((word: string, index: number) => {
          const isTyped = index < typedWords.length;
          const isWrong = isTyped && typedWords[index] !== word;
          const isSkipped = !isTyped;

          const wordTextWidth = textWidth(word);

          // Check if we need to wrap to next line
          if (startX + wordTextWidth + 10 > pageWidth - 20) {
            startX = 20;
            startY += marginY;
          }

          // Check if we need a new page
          if (startY > pageHeight - bottomMargin - 30) {
            doc.addPage();
            startY = 40;
            startX = 20;
          }

          // Draw the word with appropriate styling
          if (isWrong) {
            // Red color for wrong words
            doc.fillColor('#dc3232');
            doc.font('Helvetica-Bold');
            doc.text(typedWords[index], startX, startY);
            // Add underline to wrong word
            const underlineY = startY + 12;
            doc.strokeColor('#dc3232').lineWidth(0.5);
            doc.moveTo(startX, underlineY).lineTo(startX + doc.widthOfString(typedWords[index]), underlineY).stroke();
            doc.strokeColor('#000000');
            doc.fillColor('#000000');
          } else if (isSkipped) {
            // Gray italic for skipped words
            doc.fillColor('#999999');
            doc.font('Helvetica-Oblique');
            doc.text(word, startX, startY);
            doc.font('Helvetica');
            doc.fillColor('#000000');
          } else {
            // Normal black for correct words
            doc.fillColor('#000000');
            doc.font('Helvetica');
            doc.text(word, startX, startY);
          }

          startX += wordTextWidth + marginX + 4;
        });

        doc.moveDown(2);

        // Verdict Section
        doc.fontSize(12).font('Helvetica-Bold').text('Verdict', 20);
        doc.fontSize(11).font('Helvetica-Bold');
        const verdict = passed ? 'EXAMINATION PASSED ✓' : 'EXAMINATION UNSUCCESSFUL ✗';
        const verdictColor = passed ? '#10b981' : '#ef4444';
        doc.fillColor(verdictColor).text(verdict, 20);
        doc.fillColor('#000000');
        
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
