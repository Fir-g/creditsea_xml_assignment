import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import xml2js from 'xml2js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import CreditReport from './models/CreditReport.js';
import dotenv from 'dotenv';

dotenv.config(); // Load variables from .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

// Connect to MongoDB using the URI from the .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// mongoose.connect(
//   'mongodb+srv://doctoraraham:9svPlbh0wn7LhHQT@cluster0.jrum0.mongodb.net/yourDatabaseName?retryWrites=true&w=majority',
//   { useNewUrlParser: true, useUnifiedTopology: true }
// )
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));


app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

  
    const xmlData = await fs.promises.readFile(req.file.path, 'utf-8');


    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);

  
    console.log('Parsed XML:', JSON.stringify(result, null, 2));

 
    const root = result.INProfileResponse;
    if (!root) {
      throw new Error('Invalid XML format: missing <INProfileResponse> root element.');
    }

   
    const applicant = root.Current_Application?.Current_Application_Details?.Current_Applicant_Details;
  
    const score = root.SCORE;
   
    const caisSummary = root.CAIS_Account?.CAIS_Summary;
    const creditAccountSummary = caisSummary?.Credit_Account;
    const totalOutstanding = caisSummary?.Total_Outstanding_Balance;
   
    const accountDetails = root.CAIS_Account?.CAIS_Account_DETAILS;

  
    const creditData = {
      basicDetails: {
      
        name: applicant ? `${applicant.First_Name || ''} ${applicant.Last_Name || ''}`.trim() : '',
        mobilePhone: applicant?.MobilePhoneNumber || '',
        pan: applicant?.IncomeTaxPan || '',
        creditScore: score ? parseInt(score.BureauScore, 10) : 0
      },
      reportSummary: {
        totalAccounts: creditAccountSummary ? parseInt(creditAccountSummary.CreditAccountTotal, 10) : 0,
        activeAccounts: creditAccountSummary ? parseInt(creditAccountSummary.CreditAccountActive, 10) : 0,
        closedAccounts: creditAccountSummary ? parseInt(creditAccountSummary.CreditAccountClosed, 10) : 0,
        currentBalanceAmount: totalOutstanding ? parseFloat(totalOutstanding.Outstanding_Balance_All) : 0,
        securedAccountsAmount: totalOutstanding ? parseFloat(totalOutstanding.Outstanding_Balance_Secured) : 0,
        unsecuredAccountsAmount: totalOutstanding ? parseFloat(totalOutstanding.Outstanding_Balance_UnSecured) : 0,
        lastSevenDaysCreditEnquiries: 0
      },
      creditAccounts: []
    };

   
    if (accountDetails) {
      if (Array.isArray(accountDetails)) {
        creditData.creditAccounts = accountDetails.map(acc => ({
          type: acc.Account_Type || '',
          bank: acc.Subscriber_Name || '',
          accountNumber: acc.Account_Number || '',
          address: '', 
          amountOverdue: parseFloat(acc.Amount_Past_Due || '0'),
          currentBalance: parseFloat(acc.Current_Balance || '0')
        }));
      } else {
        
        creditData.creditAccounts.push({
          type: accountDetails.Account_Type || '',
          bank: accountDetails.Subscriber_Name || '',
          accountNumber: accountDetails.Account_Number || '',
          address: '',
          amountOverdue: parseFloat(accountDetails.Amount_Past_Due || '0'),
          currentBalance: parseFloat(accountDetails.Current_Balance || '0')
        });
      }
    }

  
    const creditReport = new CreditReport(creditData);
    await creditReport.save();

    await fs.promises.unlink(req.file.path);

    res.json({ message: 'Report processed successfully', id: creditReport._id });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file: ' + error.message });
  }
});


app.get('/api/reports', async (req, res) => {
  try {
    const reports = await CreditReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reports' });
  }
});


app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await CreditReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching report' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
