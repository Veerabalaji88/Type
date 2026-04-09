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

      doc.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const bottomMargin = 20;

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
        // Header - match jsPDF positioning
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
        doc.text(`Date & Time: ${timestamp}`, pageWidth - 20, 60, { align: 'right', width: pageWidth - 40 });

        // Metrics Table - Header
        doc.fillColor('#f5f5f5');
        doc.rect(20, 93, pageWidth - 40, 10).fill();
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(11);
        doc.text('Examination Parameter', 25, 98);
        doc.text('Obtained Metric', pageWidth - 25, 98, { align: 'right', width: 50 });

        // Metrics Rows with clean styling
        doc.font('Helvetica').fontSize(11);
        
        // Row 1: Gross Speed
        doc.text('Gross Speed', 25, 107);
        doc.text(`${wpm} WPM`, pageWidth - 25, 107, { align: 'right', width: 50 });
        doc.moveTo(20, 111).lineTo(pageWidth - 20, 111).stroke();

        // Row 2: Total Strokes Keyed
        doc.text('Total Strokes Keyed', 25, 117);
        doc.text(`${strokes}`, pageWidth - 25, 117, { align: 'right', width: 50 });
        doc.moveTo(20, 121).lineTo(pageWidth - 20, 121).stroke();

        // Row 3: Word Mistakes Committed
        doc.text('Word Mistakes Committed', 25, 127);
        doc.text(`${mistakes}`, pageWidth - 25, 127, { align: 'right', width: 50 });
        doc.moveTo(20, 131).lineTo(pageWidth - 20, 131).stroke();

        // Row 4: Grade Accuracy Ratio
        doc.text('Grade Accuracy Ratio', 25, 137);
        doc.text(`${accuracy}%`, pageWidth - 25, 137, { align: 'right', width: 50 });
        doc.moveTo(20, 141).lineTo(pageWidth - 20, 141).stroke();

        // NET AGGREGATE MARKS
        doc.font('Helvetica-Bold').fontSize(11);
        doc.fillColor('#f5f5f5');
        doc.rect(20, 147, pageWidth - 40, 10).fill();
        doc.fillColor('#000000');
        doc.text('NET AGGREGATE MARKS', 25, 152);
        doc.text(`${marks} / 100`, pageWidth - 25, 152, { align: 'right', width: 50 });

        // Individual Word Mistake Analysis Log
        doc.fontSize(14).font('Helvetica').fillColor('#000000');
        doc.text('Individual Word Mistake Analysis Log', 20, 167);

        doc.fontSize(11).font('Helvetica');

        const targetWords = passageText.trim().split(/\s+/).filter(Boolean);
        const typedWords = (typedText || '').trim().split(/\s+/).filter(Boolean);

        let currentX = 20;
        let currentY = 180;
        const marginY = 8;
        const marginRight = pageWidth - 20;

        targetWords.forEach((word: string, index: number) => {
          const isTyped = index < typedWords.length;
          const isWrong = isTyped && typedWords[index] !== word;
          const isSkipped = !isTyped;

          const wordWidth = doc.widthOfString(word);
          const spaceWidth = doc.widthOfString(' ');
          const totalWidth = wordWidth + spaceWidth;

          // Wrap to next line if needed
          if (currentX + wordWidth > marginRight) {
            currentX = 20;
            currentY += marginY;
          }

          // Add new page if needed
          if (currentY > pageHeight - bottomMargin - 15) {
            doc.addPage();
            currentX = 20;
            currentY = 30;
          }

          // Draw word with styling
          if (isWrong) {
            doc.fillColor('#dc3232').font('Helvetica-Bold');
            doc.text(typedWords[index], currentX, currentY);
            // Underline
            doc.lineWidth(0.5).strokeColor('#dc3232');
            doc.moveTo(currentX, currentY + 2).lineTo(currentX + doc.widthOfString(typedWords[index]), currentY + 2).stroke();
            doc.strokeColor('#000000');
            doc.fillColor('#000000').font('Helvetica');
          } else if (isSkipped) {
            doc.fillColor('#999999').font('Helvetica-Oblique');
            doc.text(word, currentX, currentY);
            doc.fillColor('#000000').font('Helvetica');
          } else {
            doc.fillColor('#000000').font('Helvetica');
            doc.text(word, currentX, currentY);
          }

          currentX += totalWidth;
        });

        // Verdict
        currentY += marginY;
        if (currentY > pageHeight - bottomMargin - 15) {
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
