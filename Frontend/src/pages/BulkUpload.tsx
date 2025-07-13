import { useState, useRef } from 'react';
import { Upload, FileType, AlertCircle, Loader2, CheckCheck, Download } from 'lucide-react';
import { bulkPredict } from '../services/api';
import { toast } from '../components/ui/Toaster';

type ResultItem = {
  isFraud: number;
  [key: string]: any;
};

const BulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (selectedFile) {
      toast({
        title: "File Selected",
        description: `${selectedFile.name} (${formatFileSize(selectedFile.size)})`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      setIsUploading(true);
      
      const response = await bulkPredict(file);
      
      setResults(response);
      
      const fraudCount = response.filter((item: ResultItem) => item.isFraud === 1).length;
      
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${response.length} transactions. Found ${fraudCount} potential fraud cases.`,
        variant: fraudCount > 0 ? "warning" : "success"
      });
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error processing your file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const downloadResults = () => {
    if (!results) return;
    
    // Convert results to CSV
    const headers = Object.keys(results[0]).join(',');
    const rows = results.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');
    
    // Create a download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fraud_analysis_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-center">Bulk Transaction Analysis</h1>
      
      <div className="card mb-6">
        <h2 className="text-xl font-medium mb-4">Upload CSV File</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="csvFile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select CSV File
            </label>
            
            <div className={`border-2 border-dashed rounded-lg p-6 ${
              isUploading ? 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' : 
              file ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 
              'border-slate-300 dark:border-slate-700'
            } text-center`}>
              <input
                type="file"
                id="csvFile"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              
              {isUploading ? (
                <div className="py-4">
                  <Loader2 className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
                  <p className="text-blue-700 dark:text-blue-400">Uploading and processing...</p>
                </div>
              ) : file ? (
                <div>
                  <FileType className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-green-700 dark:text-green-400 font-medium mb-1">{file.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{formatFileSize(file.size)}</p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="mb-1 text-slate-700 dark:text-slate-300">Drag and drop your CSV file here, or</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    Browse Files
                  </button>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    CSV file should contain transaction data. Max size: 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : "Analyze Transactions"}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
              disabled={!file || isLoading}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      
      {results && results.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Analysis Results</h2>
            <button 
              onClick={downloadResults}
              className="btn btn-secondary flex items-center text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Download CSV
            </button>
          </div>
          
          <div className="flex items-center mb-4 space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Fraudulent</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Legitimate</span>
            </div>
          </div>
          
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="data-table">
              <thead>
                <tr>
                  {Object.keys(results[0]).map((header) => (
                    <th key={header}>
                      {header === 'isFraud' ? 'Fraud Status' : 
                        header.replace(/([A-Z])/g, ' $1')
                          .replace(/^./, str => str.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 100).map((row, rowIndex) => (
                  <tr 
                    key={rowIndex} 
                    className={row.isFraud === 1 ? 'fraud' : 'legitimate'}
                  >
                    {Object.entries(row).map(([key, value], cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`}>
                        {key === 'isFraud' ? (
                          <span className="flex items-center">
                            {value === 1 ? (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-red-600 dark:text-red-400 font-medium">Fraudulent</span>
                              </>
                            ) : (
                              <>
                                <CheckCheck className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-600 dark:text-green-400 font-medium">Legitimate</span>
                              </>
                            )}
                          </span>
                        ) : (
                          typeof value === 'number' ? 
                            value % 1 === 0 ? value : value.toFixed(2) : 
                            String(value)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {results.length > 100 && (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Showing first 100 results of {results.length} total records. Download the CSV for complete results.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkUpload;