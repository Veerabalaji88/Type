import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

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

      const pageWidth = 210;
      const pageHeight = 297;
      const bottomMargin = 20;
      const leftMargin = 20;
      const rightMargin = pageWidth - 20;

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
        // Logo and Header
        try {
          const logoPath = path.join(process.cwd(), 'public', 'lakshmi-logo.png');
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, (pageWidth / 2) - 12, 12, { width: 24, height: 24 });
          }
        } catch (e) {
          // Logo not found, continue without it
        }

        // Title
        doc.fontSize(22).font('Helvetica-Bold').fillColor('#000000');
        doc.text('LAKSHMI TECHNICAL INSTITUTE', pageWidth / 2, 42, { align: 'center' });

        // Subtitle
        doc.fontSize(14).font('Helvetica').fillColor('#000000');
        doc.text('Official Typing Examination Statement of Marks', pageWidth / 2, 55, { align: 'center' });

        // Dividing line
        doc.lineWidth(0.5).strokeColor('#000000');
        doc.moveTo(leftMargin, 62).lineTo(rightMargin, 62).stroke();

        // Student & Exam Info - Section
        doc.fontSize(12).font('Helvetica').fillColor('#000000');
        doc.text(`Student Name: ${studentName}`, leftMargin, 73);
        doc.text(`Student ID: ${studentEmail}`, leftMargin, 83);
        doc.text(`Language: ${language.toUpperCase()}`, leftMargin, 93);
        doc.text(`Exam Level: ${level.toUpperCase()}`, leftMargin, 103);

        // Date and Time on the right, aligned with the top
        doc.fontSize(12).font('Helvetica').fillColor('#000000');
        doc.text(`Date & Time: ${timestamp}`, rightMargin, 73, { align: 'right' });

        // Metrics Table Header
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
        doc.fillColor('#e8e8e8');
        doc.rect(leftMargin, 117, rightMargin - leftMargin, 10).fill();
        doc.fillColor('#000000');
        doc.text('Examination Parameter', leftMargin + 5, 122);
        doc.text('Obtained Metric', rightMargin - 5, 122, { align: 'right' });

        // Metrics Data
        doc.fontSize(11).font('Helvetica').fillColor('#000000');

        const metricsData: [string, string][] = [
          ['Gross Speed', `${wpm} WPM`],
          ['Total Strokes Keyed', `${strokes}`],
          ['Word Mistakes Committed', `${mistakes}`],
          ['Grade Accuracy Ratio', `${accuracy}%`],
        ];

        let yPosition = 133;
        metricsData.forEach((metric: [string, string], index: number) => {
          doc.text(metric[0], leftMargin + 5, yPosition);
          doc.text(metric[1], rightMargin - 5, yPosition, { align: 'right' });
          doc.moveTo(leftMargin, yPosition + 7).lineTo(rightMargin, yPosition + 7).stroke();
          yPosition += 10;
        });

        // NET AGGREGATE MARKS - Highlighted Section
        doc.fontSize(11).font('Helvetica-Bold').fillColor('#ffffff');
        doc.fillColor('#e8e8e8');
        doc.rect(leftMargin, yPosition, rightMargin - leftMargin, 12).fill();
        doc.fillColor('#000000');
        doc.text('NET AGGREGATE MARKS', leftMargin + 5, yPosition + 2);
        doc.text(`${marks} / 100`, rightMargin - 5, yPosition + 2, { align: 'right' });

        // Individual Word Mistake Analysis Log
        yPosition += 20;
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000');
        doc.text('Individual Word Mistake Analysis Log', leftMargin, yPosition);

        // Parse words for analysis
        const targetWords = passageText.trim().split(/\s+/).filter(Boolean);
        const typedWords = (typedText || '').trim().split(/\s+/).filter(Boolean);

        let wordX = leftMargin;
        let wordY = yPosition + 15;
        const wordMarginY = 8;

        targetWords.forEach((word: string, index: number) => {
          const isTyped = index < typedWords.length;
          const isWrong = isTyped && typedWords[index] !== word;
          const isSkipped = !isTyped;

          const wordWidth = doc.widthOfString(word);
          const spaceWidth = doc.widthOfString(' ');

          // Line wrapping
          if (wordX + wordWidth > rightMargin) {
            wordX = leftMargin;
            wordY += wordMarginY;
          }

          // Page break
          if (wordY > pageHeight - bottomMargin - 15) {
            doc.addPage();
            wordX = leftMargin;
            wordY = 30;
          }

          // Draw word
          doc.fontSize(11);
          if (isWrong) {
            doc.fillColor('#dc3232').font('Helvetica-Bold');
            doc.text(typedWords[index], wordX, wordY);
            // Draw underline
            doc.lineWidth(0.5).strokeColor('#dc3232');
            const underlineWidth = doc.widthOfString(typedWords[index]);
            doc.moveTo(wordX, wordY + 3).lineTo(wordX + underlineWidth, wordY + 3).stroke();
            doc.strokeColor('#000000');
          } else if (isSkipped) {
            doc.fillColor('#999999').font('Helvetica-Oblique');
            doc.text(word, wordX, wordY);
          } else {
            doc.fillColor('#000000').font('Helvetica');
            doc.text(word, wordX, wordY);
          }

          wordX += wordWidth + spaceWidth;
        });

        // Verdict Section
        wordY += wordMarginY + 5;
        if (wordY > pageHeight - bottomMargin - 15) {
          doc.addPage();
          wordY = 30;
        }

        const verdictText = passed ? 'VERDICT: EXAMINATION PASSED ✅' : 'VERDICT: EXAMINATION UNSUCCESSFUL ❌';
        doc.fontSize(14).font('Helvetica-Bold').fillColor(passed ? '#059669' : '#dc2626');
        doc.text(verdictText, leftMargin, wordY);

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
