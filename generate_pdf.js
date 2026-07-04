const puppeteer = require('puppeteer');

async function generatePDF() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900 });

  const htmlPath = 'file:///C:/Users/rohit/.gemini/antigravity-ide/brain/84e4e735-4728-4fe8-8c51-e7c83bfc88f4/submission.html';
  console.log('Loading HTML...');
  await page.goto(htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });

  // Wait for images to fully load
  await new Promise(r => setTimeout(r, 4000));

  console.log('Generating PDF...');
  await page.pdf({
    path: 'C:\\Users\\rohit\\Downloads\\SprintNest_Submission_Final.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '18mm',
      bottom: '18mm',
      left: '15mm',
      right: '15mm'
    },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-family:'Times New Roman',Times,serif;font-size:8pt;width:100%;text-align:center;color:#666;margin-top:6mm;">SprintNest &mdash; Assignment Submission Document</div>`,
    footerTemplate: `<div style="font-family:'Times New Roman',Times,serif;font-size:8pt;width:100%;text-align:center;color:#666;margin-bottom:6mm;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`
  });

  await browser.close();
  console.log('PDF generated successfully at C:\\Users\\rohit\\Downloads\\SprintNest_Submission_Final.pdf');
}

generatePDF().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
