import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface CreditReport {
  _id: string;
  basicDetails: {
    name: string;
    mobilePhone: string;
    pan: string;
    creditScore: number;
  };
  reportSummary: {
    totalAccounts: number;
    activeAccounts: number;
    closedAccounts: number;
    currentBalanceAmount: number;
    securedAccountsAmount: number;
    unsecuredAccountsAmount: number;
    lastSevenDaysCreditEnquiries: number;
  };
  creditAccounts: Array<{
    type: string;
    bank: string;
    accountNumber: string;
    address: string;
    amountOverdue: number;
    currentBalance: number;
  }>;
  createdAt: string;
}

function App() {
  const [reports, setReports] = useState<CreditReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CreditReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/reports');
      setReports(response.data);
    } catch (error) {
      toast.error('Error fetching reports');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/upload', formData);
      toast.success('Report uploaded successfully');
      fetchReports();
    } catch (error) {
      toast.error('Error uploading report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">CreditSea Report Processor</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Upload Section */}
        <div className="mb-8">
          <label className="block mb-4">
            <span className="sr-only">Choose XML file</span>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </label>
          {/* Display a loading indicator if a file is uploading */}
          {loading && (
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-600" />
              <span className="text-blue-600">Uploading...</span>
            </div>
          )}
        </div>

        {/* Reports List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reports List Sidebar */}
          <div className="col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <div className="space-y-2">
              {reports.map(report => (
                <button
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-3 rounded ${
                    selectedReport?._id === report._id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{report.basicDetails.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Report Details */}
          <div className="col-span-2">
            {selectedReport ? (
              <div className="bg-white rounded-lg shadow p-6">
                {/* Basic Details */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Basic Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Name</label>
                      <div className="font-medium">{selectedReport.basicDetails.name}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Mobile Phone</label>
                      <div className="font-medium">{selectedReport.basicDetails.mobilePhone}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">PAN</label>
                      <div className="font-medium">{selectedReport.basicDetails.pan}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Credit Score</label>
                      <div className="font-medium">{selectedReport.basicDetails.creditScore}</div>
                    </div>
                  </div>
                </div>

                {/* Report Summary */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Report Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-500">Total Accounts</label>
                      <div className="font-medium">{selectedReport.reportSummary.totalAccounts}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Active Accounts</label>
                      <div className="font-medium">{selectedReport.reportSummary.activeAccounts}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Closed Accounts</label>
                      <div className="font-medium">{selectedReport.reportSummary.closedAccounts}</div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Current Balance Amount</label>
                      <div className="font-medium">
                        ₹{selectedReport.reportSummary.currentBalanceAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Secured Accounts Amount</label>
                      <div className="font-medium">
                        ₹{selectedReport.reportSummary.securedAccountsAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Unsecured Accounts Amount</label>
                      <div className="font-medium">
                        ₹{selectedReport.reportSummary.unsecuredAccountsAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-500">Last 7 Days Credit Enquiries</label>
                      <div className="font-medium">
                        {selectedReport.reportSummary.lastSevenDaysCreditEnquiries}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Accounts Information */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Credit Accounts Information</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Credit Card
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Account Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Address
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Current Balance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount Overdue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedReport.creditAccounts.map((account, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {account.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {account.bank}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {account.accountNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {account.address}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{account.currentBalance.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{account.amountOverdue.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2">Select a report to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
