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
        // Convert mm positions to points (1mm = 2.834645669 points, but PDFKit uses default unit)
        const mmToPoints = (mm: number) => mm;

        // 🏷️ 1. Institute Branding Header
        doc.fontSize(22).font('Helvetica-Bold').fillColor(0, 0, 0);
        doc.text('CENTRAL SCHOOL OF COMMERCE', mmToPoints(pageWidth / 2), mmToPoints(55), { align: 'center' });

        doc.fontSize(14).font('Helvetica');
        doc.text('Official Typing Examination Statement of Marks', mmToPoints(pageWidth / 2), mmToPoints(65), { align: 'center' });

        doc.lineWidth(0.5).strokeColor(0, 0, 0);
        doc.moveTo(mmToPoints(20), mmToPoints(72)).lineTo(mmToPoints(pageWidth - 20), mmToPoints(72)).stroke();

        // 👤 2. Student & Exam Info
        doc.fontSize(12).font('Helvetica').fillColor(0, 0, 0);
        doc.text(`Student Name: ${studentName}`, mmToPoints(20), mmToPoints(83));
        doc.text(`Student ID: ${studentEmail}`, mmToPoints(20), mmToPoints(91));
        doc.text(`Language: ${language.toUpperCase()}`, mmToPoints(20), mmToPoints(99));
        doc.text(`Exam Level: ${level.toUpperCase()}`, mmToPoints(20), mmToPoints(107));
        doc.text(`Date & Time: ${timestamp}`, mmToPoints(pageWidth - 20), mmToPoints(83), { align: 'right' });

        // 📊 3. Table Metrics
        doc.fillColor(245, 245, 245);
        doc.rect(mmToPoints(20), mmToPoints(115), mmToPoints(pageWidth - 40), mmToPoints(10)).fill();
        doc.fillColor(0, 0, 0).font('Helvetica-Bold').fontSize(11);
        doc.text('Examination Parameter', mmToPoints(25), mmToPoints(121));
        doc.text('Obtained Metric', mmToPoints(pageWidth - 25), mmToPoints(121), { align: 'right' });

        doc.font('Helvetica').fontSize(11);
        doc.text('Gross Speed', mmToPoints(25), mmToPoints(133));
        doc.text(`${wpm} WPM`, mmToPoints(pageWidth - 25), mmToPoints(133), { align: 'right' });
        doc.moveTo(mmToPoints(20), mmToPoints(137)).lineTo(mmToPoints(pageWidth - 20), mmToPoints(137)).stroke();

        doc.text('Total Strokes Keyed', mmToPoints(25), mmToPoints(145));
        doc.text(`${strokes}`, mmToPoints(pageWidth - 25), mmToPoints(145), { align: 'right' });
        doc.moveTo(mmToPoints(20), mmToPoints(149)).lineTo(mmToPoints(pageWidth - 20), mmToPoints(149)).stroke();

        doc.text('Word Mistakes Committed', mmToPoints(25), mmToPoints(157));
        doc.text(`${mistakes}`, mmToPoints(pageWidth - 25), mmToPoints(157), { align: 'right' });
        doc.moveTo(mmToPoints(20), mmToPoints(161)).lineTo(mmToPoints(pageWidth - 20), mmToPoints(161)).stroke();

        doc.text('Grade Accuracy Ratio', mmToPoints(25), mmToPoints(169));
        doc.text(`${accuracy}%`, mmToPoints(pageWidth - 25), mmToPoints(169), { align: 'right' });
        doc.moveTo(mmToPoints(20), mmToPoints(173)).lineTo(mmToPoints(pageWidth - 20), mmToPoints(173)).stroke();

        doc.font('Helvetica-Bold').fontSize(11);
        doc.fillColor(245, 245, 245);
        doc.rect(mmToPoints(20), mmToPoints(180), mmToPoints(pageWidth - 40), mmToPoints(12)).fill();
        doc.fillColor(0, 0, 0);
        doc.text('NET AGGREGATE MARKS', mmToPoints(25), mmToPoints(188));
        doc.text(`${marks} / 100`, mmToPoints(pageWidth - 25), mmToPoints(188), { align: 'right' });

        // 🔴 🔍 4. HIGHLIGHT WRONG + SKIPPED WORDS EVALUATION
        doc.fontSize(14).font('Helvetica').text('Individual Word Mistake Analysis Log', mmToPoints(20), mmToPoints(208));
        doc.fontSize(11).font('Helvetica');

        const targetWords = passageText.trim().split(/\s+/).filter(Boolean);
        const typedWords = (typedText || '').trim().split(/\s+/).filter(Boolean);

        let startX = 20;
        let startY = 218;
        const marginY = 8;
        const spaceWidth = doc.widthOfString(' ');

        targetWords.forEach((word: string) => {
          const wordWidth = doc.widthOfString(word);
          const index = targetWords.indexOf(word);

          if (startX + wordWidth > pageWidth - 20) {
            startX = 20;
            startY += marginY;
          }

          if (startY > pageHeight - bottomMargin) {
            doc.addPage();
            startY = 25;
            startX = 20;
          }

          const isTyped = index < typedWords.length;
          const isWrong = isTyped && typedWords[index] !== word;
          const isSkipped = !isTyped;

          if (isWrong) {
            doc.fillColor(220, 50, 50).font('Helvetica-Bold');
            doc.text(typedWords[index], mmToPoints(startX), mmToPoints(startY));
            doc.strokeColor(220, 50, 50).lineWidth(0.5);
            doc.moveTo(mmToPoints(startX), mmToPoints(startY + 1)).lineTo(mmToPoints(startX + wordWidth), mmToPoints(startY + 1)).stroke();
            doc.fillColor(0, 0, 0).font('Helvetica');
          } else if (isSkipped) {
            doc.fillColor(150, 150, 150).font('Helvetica-Oblique');
            doc.text(word, mmToPoints(startX), mmToPoints(startY));
            doc.fillColor(0, 0, 0).font('Helvetica');
          } else {
            doc.fillColor(0, 0, 0).font('Helvetica');
            doc.text(word, mmToPoints(startX), mmToPoints(startY));
          }

          startX += wordWidth + spaceWidth + 2;
        });

        if (startY + 30 > pageHeight - bottomMargin) {
          doc.addPage();
          startY = 25;
        }

        const passedText = passed ? 'VERDICT: EXAMINATION PASSED' : 'VERDICT: EXAMINATION UNSUCCESSFUL';
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text(passedText, mmToPoints(20), mmToPoints(startY + 20));

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
