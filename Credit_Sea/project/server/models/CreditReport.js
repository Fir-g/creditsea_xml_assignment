


import mongoose from 'mongoose';

const creditReportSchema = new mongoose.Schema({
  basicDetails: {
    name: String,
    mobilePhone: String,
    pan: String,
    creditScore: Number
  },
  reportSummary: {
    totalAccounts: Number,
    activeAccounts: Number,
    closedAccounts: Number,
    currentBalanceAmount: Number,
    securedAccountsAmount: Number,
    unsecuredAccountsAmount: Number,
    lastSevenDaysCreditEnquiries: Number
  },
  creditAccounts: [{
    type: { type: String }, 
    bank: String,
    accountNumber: String,
    address: String,
    amountOverdue: Number,
    currentBalance: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CreditReport', creditReportSchema);
