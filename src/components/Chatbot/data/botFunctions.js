import * as XLSX from 'xlsx';
import xlFile from './students.xlsx';
import timeTableFile from './timetables/timetable.xlsx';

export async function readTimeTableFile() {
  try {
    const response = await fetch(timeTableFile);
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headerRow = rows[0];

    const subjectIndex = headerRow.indexOf('subject');
    const dayIndex = headerRow.indexOf('day');
    const mentorIndex = headerRow.indexOf('mentor');
    const hoursIndex = headerRow.indexOf('hours');

    let tableRows = '';

    // insted of iterationg dynamically i want to iteratre all the colums and combine all until it reaches last column (last col is null
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const subject = row[subjectIndex];
      const day = row[dayIndex];
      const mentor = row[mentorIndex];
      const hours = row[hoursIndex];

      tableRows += `<tr>
        <td>${subject}</td>
        <td>${day}</td>
        <td>${mentor}</td>
        <td>${hours}</td>
      </tr>`;
    }

    const message = `<table class="bot-table">
      <tr>
        <th>Subject</th>
        <th>Day</th>
        <th>Mentor</th>
        <th>Hours</th>
      </tr>
      ${tableRows}
    </table>`;

    return {
      text: message,
      typing: 'Generating your timetable...'
    };
  } catch (error) {
    console.error('Error loading the Data:', error);
    return { text: 'Error loading the Data.' };
  }
}


export async function readStudentDatafromxl(usn) {
  try {
    const response = await fetch(xlFile);
    const data = await response.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headerRow = rows[0];

    const usnIndex = headerRow.indexOf('USN');
    const nameIndex = headerRow.indexOf('Name');
    const emailIndex = headerRow.indexOf('Email');
    const phoneIndex = headerRow.indexOf('Phone');

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const usnFromSheet = (row[usnIndex] || '').toLowerCase();
      if (usnFromSheet === usn.toLowerCase()) {
        const name = row[nameIndex];
        const email = row[emailIndex];
        const phone = row[phoneIndex];

        const message = `Name: ${name}<br>RollNo: ${usn.toUpperCase()}<br>Email: <a class='font-semibold' href="mailto:${email}">${email}</a><br>Phone: <a class='font-semibold' href="tel:${phone}">${phone}</a>`;
        return {
          text: message,
          typing: `Searching for your Details ${usn.toUpperCase()} ...`
        };
      }
    }

    return { text: 'Student not found!' };
  } catch (error) {
    console.error('Error loading the Data:', error);
    return { text: 'Error loading the Data.' };
  }
}
