import { google } from 'googleapis';

// Configure Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function addLeadToGoogleSheets(lead) {
  try {
    console.log('Starting Google Sheets integration...');
    const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
    
    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEETS_ID is not configured');
    }

    console.log('Checking Google Sheets credentials...');
    console.log('Client Email:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? 'Set' : 'Not set');
    console.log('Private Key:', process.env.GOOGLE_SHEETS_PRIVATE_KEY ? 'Set' : 'Not set');
    console.log('Spreadsheet ID:', spreadsheetId);
    
    // First, try to get the existing sheets
    console.log('Fetching spreadsheet information...');
    const sheetsResponse = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Check if 'Leads' sheet exists, if not create it
    let sheetExists = false;
    if (sheetsResponse.data.sheets) {
      sheetExists = sheetsResponse.data.sheets.some(
        sheet => sheet.properties.title === 'Leads'
      );
      console.log('Leads sheet exists:', sheetExists);
    }

    if (!sheetExists) {
      console.log('Creating new Leads sheet...');
      // Create the Leads sheet with headers
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: 'Leads',
                  gridProperties: {
                    rowCount: 1000,
                    columnCount: 7,
                  },
                },
              },
            },
          ],
        },
      });

      console.log('Adding headers to the new sheet...');
      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Leads!A1:G1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [['Date', 'Name', 'Email', 'Phone', 'Source', 'Subject', 'Message']],
        },
      });
    }

    // Now append the data
    const currentDate = new Date().toLocaleString();
    const values = [
      [
        currentDate,
        lead.name,
        lead.email,
        lead.phone,
        lead.source || 'Chat Bot',
        lead.subject || '',
        lead.message || ''
      ]
    ];

    console.log('Appending new lead data:', values);
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Leads!A2:G',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values,
      },
    });

    console.log('Successfully added lead to Google Sheets:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in addLeadToGoogleSheets:', error);
    // Log specific API errors
    if (error.response) {
      console.error('Google Sheets API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    throw error;
  }
} 