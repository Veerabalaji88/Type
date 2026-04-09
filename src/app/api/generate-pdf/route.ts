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
      passageText,
      typedText,
      timestamp,
    } = body;

    const buffers: Buffer[] = [];

    return new Promise<Response>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 0,
      });

      // Collect data chunks
      doc.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const bottomMargin = 20;

      // Handle errors
      doc.on('error', (err: any) => {
        reject(err);
      });

      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(
          new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="CSCTypingTest-${language}-${level}.pdf"`,
              'Content-Length': pdfBuffer.length.toString(),
            },
          })
        );
      });

      try {
        // Title
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#000000');
        doc.text('CENTRAL SCHOOL OF COMMERCE', pageWidth / 2, 30, { align: 'center' });

        doc.fontSize(14).font('Helvetica');
        doc.text('Official Typing Examination Statement of Marks', pageWidth / 2, 42, { align: 'center' });

        doc.lineWidth(0.5).strokeColor('#000000');
        doc.moveTo(20, 50).lineTo(pageWidth - 20, 50).stroke();

        // Student & Exam Info
        doc.fontSize(12).font('Helvetica').fillColor('#000000');
        doc.text(`Student Name: ${studentName}`, 20, 60);
        doc.text(`Student ID: ${studentEmail}`, 20, 68);
        doc.text(`Language: ${language.toUpperCase()}`, 20, 76);
        doc.text(`Exam Level: ${level.toUpperCase()}`, 20, 84);
        doc.text(`Date & Time: ${timestamp}`, pageWidth - 20, 60, { align: 'right' });

        // Table Metrics Header
        doc.fillColor('#f5f5f5');
        doc.rect(20, 93, pageWidth - 40, 8).fill();
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11);
        doc.text('Examination Parameter', 25, 96);
        doc.text('Obtained Metric', pageWidth - 25, 96, { align: 'right' });

        // Metrics Rows
        doc.font('Helvetica').fontSize(11);
        doc.text('Gross Speed', 25, 105);
        doc.text(`${wpm} WPM`, pageWidth - 25, 105, { align: 'right' });
        doc.moveTo(20, 110).lineTo(pageWidth - 20, 110).stroke();

        doc.text('Total Strokes Keyed', 25, 118);
        doc.text(`${strokes}`, pageWidth - 25, 118, { align: 'right' });
        doc.moveTo(20, 123).lineTo(pageWidth - 20, 123).stroke();

        doc.text('Word Mistakes Committed', 25, 131);
        doc.text(`${mistakes}`, pageWidth - 25, 131, { align: 'right' });
        doc.moveTo(20, 136).lineTo(pageWidth - 20, 136).stroke();

        doc.text('Grade Accuracy Ratio', 25, 144);
        doc.text(`${accuracy}%`, pageWidth - 25, 144, { align: 'right' });
        doc.moveTo(20, 149).lineTo(pageWidth - 20, 149).stroke();

        // NET AGGREGATE MARKS
        doc.font('Helvetica-Bold').fontSize(11);
        doc.fillColor('#f5f5f5');
        doc.rect(20, 155, pageWidth - 40, 10).fill();
        doc.fillColor('#000000');
        doc.text('NET AGGREGATE MARKS', 25, 160);
        doc.text(`${marks} / 100`, pageWidth - 25, 160, { align: 'right' });

        // Individual Word Mistake Analysis Log
        doc.fontSize(14).font('Helvetica').text('Individual Word Mistake Analysis Log', 20, 175);
        doc.fontSize(11);

        const targetWords = passageText.trim().split(/\s+/).filter(Boolean);
        const typedWords = (typedText || '').trim().split(/\s+/).filter(Boolean);

        let currentX = 20;
        let currentY = 190;
        const lineHeight = 7;
        const marginLeft = 20;
        const marginRight = pageWidth - 20;

        targetWords.forEach((word: string, index: number) => {
          const isTyped = index < typedWords.length;
          const isWrong = isTyped && typedWords[index] !== word;
          const isSkipped = !isTyped;
          const wordWidth = doc.widthOfString(word);
          const spaceWidth = doc.widthOfString(' ');

          // Check if we need to wrap to the next line
          if (currentX + wordWidth + spaceWidth > marginRight) {
            currentX = marginLeft;
            currentY += lineHeight;
          }

          // Check if we need a new page
          if (currentY > pageHeight - bottomMargin - 20) {
            doc.addPage();
            currentX = marginLeft;
            currentY = 30;
          }

          // Set styling based on word status
          if (isWrong) {
            doc.fillColor('#dc3232').font('Helvetica-Bold');
            doc.text(typedWords[index], currentX, currentY);
            // Add underline
            doc.lineWidth(0.5).strokeColor('#dc3232');
            doc.moveTo(currentX, currentY + 2).lineTo(currentX + doc.widthOfString(typedWords[index]), currentY + 2).stroke();
            doc.fillColor('#000000').font('Helvetica');
          } else if (isSkipped) {
            doc.fillColor('#999999').font('Helvetica-Oblique');
            doc.text(word, currentX, currentY);
            doc.fillColor('#000000').font('Helvetica');
          } else {
            doc.fillColor('#000000').font('Helvetica');
            doc.text(word, currentX, currentY);
          }

          currentX += wordWidth + spaceWidth;
        });

        // Add space and verdict
        currentY += lineHeight + 5;
        if (currentY > pageHeight - bottomMargin - 20) {
          doc.addPage();
          currentY = 30;
        }

        const verdictText = passed ? 'VERDICT: EXAMINATION PASSED' : 'VERDICT: EXAMINATION UNSUCCESSFUL';
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000');
        doc.text(verdictText, 20, currentY);

        doc.end();
      } catch (genError: any) {
        reject(genError);
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
