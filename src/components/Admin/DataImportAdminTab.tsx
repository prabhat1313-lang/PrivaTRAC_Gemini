import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  History,
  Trash2,
  RefreshCw,
  Clock,
  ArrowRight,
  Database,
  Building2,
  Users2,
  CheckSquare2,
} from 'lucide-react';

type ImportType = 'Accounts' | 'Contacts' | 'Tasks';

interface ParsedPreviewRow {
  id: string;
  status: 'Valid' | 'Warning' | 'Error';
  message?: string;
  data: Record<string, string>;
}

export const DataImportAdminTab: React.FC = () => {
  const {
    uploadHistory,
    recordUpload,
    bulkImportAccounts,
    bulkImportContacts,
    bulkImportTasks,
    currentUser,
  } = useCrm();

  const [importType, setImportType] = useState<ImportType>('Accounts');
  const [fileName, setFileName] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [previewRows, setPreviewRows] = useState<ParsedPreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Sample CSV Templates
  const sampleAccountsCsv = `accountName,sector,stage,dealValue,revenueCurrency,region,annualRevenueINR,contactPerson
HDFC Life Assurance,BFSI,Proposal Submitted,14500000,INR,India - West,12000000000,Sanjay Verma
Standard Chartered APAC,BFSI,Solution Co-Design,280000,USD,Singapore / APAC,45000000000,Mei Lin Tan
Fortis Healthcare Systems,Healthcare,Initial Outreach,8500000,INR,India - North,8500000000,Dr. Rajesh Batra
Singtel Enterprise 5G,Telecom,Contract Negotiation,350000,SGD,Singapore,62000000000,Kelvin Wong`;

  const sampleContactsCsv = `name,accountId,designation,email,phone,consentStatus
Deepak Shenoy,acc-1,Chief Privacy Officer,d.shenoy@hdfclife.com,+91 98201 11223,Explicitly Consented
Rachel Goh,acc-2,Head of AI Governance,rachel.goh@sc.com,+65 9123 4567,Explicitly Consented
Sunil Aggarwal,acc-3,Chief Medical Information Officer,sunil.a@fortis.in,+91 98110 33445,Pending Verification`;

  const sampleTasksCsv = `title,accountId,assignee,targetCompletionTime,interactionTag,priority
Joint Security Due Diligence Review,acc-1,Vikram Malhotra,2026-10-25,Architecture Review,High
RFP Annexure B Differential Privacy PoC,acc-2,Ananya Sharma,2026-10-22,RFP Working Session,High
Executive CISO Briefing on CBAC Governance,acc-3,Vikram Malhotra,2026-10-28,Executive Briefing,Medium`;

  const handleLoadSample = () => {
    let content = '';
    let name = '';
    if (importType === 'Accounts') {
      content = sampleAccountsCsv;
      name = 'sample_enterprise_accounts.csv';
    } else if (importType === 'Contacts') {
      content = sampleContactsCsv;
      name = 'sample_cbac_contacts.csv';
    } else {
      content = sampleTasksCsv;
      name = 'sample_pipeline_tasks.csv';
    }
    setFileName(name);
    setRawText(content);
    parseCsv(content, importType);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content || '');
      parseCsv(content || '', importType);
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string, type: ImportType) => {
    if (!text.trim()) {
      setPreviewRows([]);
      return;
    }

    const lines = text.trim().split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setPreviewRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows: ParsedPreviewRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const rowData: Record<string, string> = {};
      headers.forEach((h, idx) => {
        rowData[h] = values[idx] || '';
      });

      let status: 'Valid' | 'Warning' | 'Error' = 'Valid';
      let message = 'Ready for import';

      if (type === 'Accounts') {
        if (!rowData.accountName) {
          status = 'Error';
          message = 'Missing required field: accountName';
        } else if (!rowData.dealValue || isNaN(Number(rowData.dealValue))) {
          status = 'Warning';
          message = 'Deal value missing or non-numeric (will default to 0)';
        }
      } else if (type === 'Contacts') {
        if (!rowData.name) {
          status = 'Error';
          message = 'Missing required field: name';
        } else if (!rowData.email || !rowData.email.includes('@')) {
          status = 'Warning';
          message = 'Invalid email syntax';
        }
      } else if (type === 'Tasks') {
        if (!rowData.title) {
          status = 'Error';
          message = 'Missing required field: title';
        }
      }

      rows.push({
        id: `row-${i}`,
        status,
        message,
        data: rowData,
      });
    }

    setPreviewRows(rows);
  };

  const handleExecuteImport = () => {
    if (previewRows.length === 0) return;
    setIsProcessing(true);

    const validRows = previewRows.filter((r) => r.status !== 'Error');
    if (validRows.length === 0) {
      setIsProcessing(false);
      return;
    }

    let importedCount = 0;

    if (importType === 'Accounts') {
      const itemsToImport = validRows.map((r) => ({
        name: r.data.accountName || 'Unnamed Account',
        sector: r.data.sector || 'Other',
        region: r.data.region || 'India - West',
        stage: r.data.stage || 'Initial Outreach',
        dealValue: Number(r.data.dealValue) || 1000000,
        revenueCurrency: (r.data.revenueCurrency as any) || 'INR',
        annualRevenueINR: Number(r.data.annualRevenueINR) || 5000000000,
        privacyGrcProducts: ['PrivaSapien Assessment Suite', 'CBAC Gateway'],
        petsProducts: ['Differential Privacy Engine'],
        responsibleAiProducts: ['Model Fairness Auditor'],
        leadOwner: currentUser.name,
        preSalesOwner: 'Ananya Sharma',
        solutionEngineer: 'Rohan Deshmukh',
        keyInitiatives: ['Bulk ingested enterprise evaluation pipeline'],
      }));
      importedCount = bulkImportAccounts(itemsToImport);
    } else if (importType === 'Contacts') {
      const itemsToImport = validRows.map((r) => ({
        name: r.data.name || 'Unnamed Contact',
        accountId: r.data.accountId || 'acc-1',
        designation: r.data.designation || 'Enterprise Stakeholder',
        department: 'Information Security & Privacy',
        email: r.data.email || 'user@example.com',
        phone: r.data.phone || '+91 98000 00000',
        consentStatus: (r.data.consentStatus as any) || 'Explicitly Consented',
        isPrimary: false,
      }));
      importedCount = bulkImportContacts(itemsToImport);
    } else {
      const itemsToImport = validRows.map((r) => ({
        title: r.data.title || 'Bulk Ingested Task',
        accountId: r.data.accountId || 'acc-1',
        assignee: r.data.assignee || currentUser.name,
        dueDate: r.data.targetCompletionTime || new Date().toISOString().split('T')[0],
        interactionTag: (r.data.interactionTag as any) || 'In-person Meeting',
        priority: (r.data.priority as any) || 'Medium',
        stage: 'RFP Response Preparation',
      }));
      importedCount = bulkImportTasks(itemsToImport);
    }

    recordUpload({
      type: importType,
      fileName: fileName || `${importType.toLowerCase()}_bulk_import_${Date.now()}.csv`,
      uploadedBy: `${currentUser.name} (${currentUser.role})`,
      recordsCount: importedCount,
      status: 'Success',
      summary: `Successfully imported ${importedCount} ${importType.toLowerCase()} records into CRM repository.`,
    });

    setIsProcessing(false);
    setImportSuccessMsg(`Successfully imported ${importedCount} ${importType} records!`);
    setPreviewRows([]);
    setRawText('');
    setFileName('');

    setTimeout(() => {
      setImportSuccessMsg(null);
    }, 4500);
  };

  const handleDownloadTemplate = () => {
    let content = '';
    let dlName = '';
    if (importType === 'Accounts') {
      content = sampleAccountsCsv;
      dlName = 'privatrac_accounts_template.csv';
    } else if (importType === 'Contacts') {
      content = sampleContactsCsv;
      dlName = 'privatrac_contacts_template.csv';
    } else {
      content = sampleTasksCsv;
      dlName = 'privatrac_tasks_template.csv';
    }

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = dlName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Bulk Data Ingestion & Import Center
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest batches of Accounts, CBAC Contacts, and Actionable Tasks via structured CSV or formatted files with automated validation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download {importType} Template</span>
          </button>
        </div>
      </div>

      {importSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importSuccessMsg}</span>
        </div>
      )}

      {/* Ingestion Configurator */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Entity Type Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Target Entity Category
            </label>
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setImportType('Accounts');
                  setPreviewRows([]);
                  setRawText('');
                  setFileName('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  importType === 'Accounts'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Accounts</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportType('Contacts');
                  setPreviewRows([]);
                  setRawText('');
                  setFileName('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  importType === 'Contacts'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>Contacts</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportType('Tasks');
                  setPreviewRows([]);
                  setRawText('');
                  setFileName('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  importType === 'Tasks'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckSquare2 className="w-3.5 h-3.5" />
                <span>Tasks & Milestones</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition border border-blue-200"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Load Sample {importType} CSV</span>
            </button>
          </div>
        </div>

        {/* Upload Drop Zone / Paste Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:border-blue-400 transition bg-slate-50/50 flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-slate-400" />
            <div>
              <label className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700">
                <span>Select CSV File</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-0.5">
                or drag and drop here (UTF-8 formatted CSV)
              </p>
            </div>
            {fileName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-[11px] font-semibold">
                <FileText className="w-3 h-3" />
                {fileName}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Or Paste CSV Raw Content
            </label>
            <textarea
              rows={4}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                parseCsv(e.target.value, importType);
              }}
              placeholder={`accountName,sector,stage,dealValue\nTechCorp,BFSI,Proposal Submitted,15000000`}
              className="w-full p-2.5 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Preview and Validation Matrix */}
        {previewRows.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-slate-100 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-xs">
                  Validation Preview ({previewRows.length} Rows Detected)
                </h4>
                <p className="text-[11px] text-slate-500">
                  {previewRows.filter((r) => r.status === 'Valid').length} valid,{' '}
                  {previewRows.filter((r) => r.status === 'Warning').length} warnings,{' '}
                  {previewRows.filter((r) => r.status === 'Error').length} errors
                </p>
              </div>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={isProcessing || previewRows.filter((r) => r.status !== 'Error').length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {isProcessing
                    ? 'Importing...'
                    : `Execute Import (${previewRows.filter((r) => r.status !== 'Error').length} Records)`}
                </span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Primary Identifier</th>
                    <th className="py-2 px-3">Metadata Fields</th>
                    <th className="py-2 px-3">Validation Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            row.status === 'Valid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : row.status === 'Warning'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-800">
                        {row.data.accountName || row.data.name || row.data.title || 'Untitled'}
                      </td>
                      <td className="py-2 px-3 text-slate-500 text-[11px]">
                        {Object.entries(row.data)
                          .slice(1, 4)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' • ')}
                      </td>
                      <td className="py-2 px-3 text-[11px] text-slate-600">
                        {row.message}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Historical Upload Audit Log */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 font-bold text-slate-900 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <span>Ingestion Audit History</span>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            {uploadHistory.length} Recorded Batch Operations
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] bg-slate-50">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Entity Category</th>
                <th className="py-2.5 px-4">File Name</th>
                <th className="py-2.5 px-4">Uploaded By</th>
                <th className="py-2.5 px-4 text-center">Records</th>
                <th className="py-2.5 px-4">Ingestion Status</th>
                <th className="py-2.5 px-4">Audit Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {uploadHistory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                      {item.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono text-slate-700 text-[11px]">
                    {item.fileName}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {item.uploadedBy}
                  </td>
                  <td className="py-2.5 px-4 text-center font-bold text-slate-800">
                    {item.recordsCount}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                    {item.summary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
