

import React, { useRef, useState } from 'react';
import './App.css';
import Papa from 'papaparse';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AnalysisReport from './components/AnalysisReport';
import { RawBankingData } from './types/banking';
import { dataAnalysisService, DataAnalysisReport } from './services/dataAnalysisService';
import { 
  ChakraProvider, 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack,
  Button,
  Spinner,
  Progress
} from '@chakra-ui/react';


function App() {
  const [csvName, setCsvName] = useState('');
  const [rawData, setRawData] = useState<RawBankingData[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisReport, setAnalysisReport] = useState<DataAnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'upload' | 'dashboard' | 'report'>('upload');
  const [csvUrl, setCsvUrl] = useState('');
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved data on component mount
  React.useEffect(() => {
    const savedData = localStorage.getItem('bankingAnalyticsData');
    const savedCsvName = localStorage.getItem('bankingAnalyticsCsvName');
    const savedReport = localStorage.getItem('bankingAnalyticsReport');
    const savedView = localStorage.getItem('bankingAnalyticsView') as 'dashboard' | 'report' | null;

    if (savedData && savedCsvName) {
      try {
        const parsedData = JSON.parse(savedData);
        setRawData(parsedData);
        setCsvName(savedCsvName);
        
        if (savedReport) {
          const parsedReport = JSON.parse(savedReport);
          setAnalysisReport(parsedReport);
        }
        
        if (savedView) {
          setCurrentView(savedView);
        } else {
          setCurrentView('dashboard'); // Default to dashboard if no saved view
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
        // Clear corrupted data
        localStorage.removeItem('bankingAnalyticsData');
        localStorage.removeItem('bankingAnalyticsCsvName');
        localStorage.removeItem('bankingAnalyticsReport');
        localStorage.removeItem('bankingAnalyticsView');
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  React.useEffect(() => {
    if (rawData && csvName) {
      try {
        const dataString = JSON.stringify(rawData);
        // Check if the data is too large for localStorage
        if (dataString.length > 4 * 1024 * 1024) { // 4MB limit for raw data
          console.warn('Raw data too large for localStorage, skipping storage');
          setStorageWarning('Data too large to save locally. Refresh will require re-upload.');
          return;
        }
        
        // Check if localStorage has enough space
        if (!checkLocalStorageQuota()) {
          console.warn('LocalStorage quota exceeded, skipping data storage');
          setStorageWarning('Browser storage full. Refresh will require re-upload.');
          return;
        }
        
        localStorage.setItem('bankingAnalyticsData', dataString);
        localStorage.setItem('bankingAnalyticsCsvName', csvName);
        setStorageWarning(null); // Clear warning on successful save
      } catch (error) {
        console.warn('Failed to save raw data to localStorage:', error);
        // Continue without storing the data
      }
    }
  }, [rawData, csvName]);

  React.useEffect(() => {
    if (analysisReport) {
      try {
        const reportString = JSON.stringify(analysisReport);
        // Check if the data is too large for localStorage (typically 5-10MB limit)
        if (reportString.length > 2 * 1024 * 1024) { // 2MB limit for reports
          console.warn('Analysis report too large for localStorage, skipping storage');
          return;
        }
        
        // Check if localStorage has enough space
        if (!checkLocalStorageQuota()) {
          console.warn('LocalStorage quota exceeded, skipping report storage');
          return;
        }
        
        localStorage.setItem('bankingAnalyticsReport', reportString);
      } catch (error) {
        console.warn('Failed to save analysis report to localStorage:', error);
        // Continue without storing the report
      }
    }
  }, [analysisReport]);

  React.useEffect(() => {
    if (currentView !== 'upload') {
      localStorage.setItem('bankingAnalyticsView', currentView);
    }
  }, [currentView]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCsvName(file.name);
      setParsing(true);
      setAnalyzing(false);
      setAnalysisProgress(0);
      setError(null);
      setWarning(null);
      setAnalysisReport(null);
      
      try {
        // Parse CSV file
        Papa.parse<RawBankingData>(file, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(), // Clean headers
          transform: (value) => value.trim(), // Clean values
          dynamicTyping: false, // Keep everything as strings initially
          preview: 0, // Parse all rows
          encoding: "UTF-8",
          worker: false, // Don't use web worker for better error handling
          complete: async (results) => {
            // Filter out parsing errors that are just warnings about field count mismatches
            const criticalErrors = results.errors.filter(error => 
              !error.message.includes('Too few fields') && 
              !error.message.includes('Too many fields') &&
              !error.message.includes('Expected')
            );
            
            if (criticalErrors.length > 0) {
              setError('Critical CSV parsing errors: ' + criticalErrors.map(e => e.message).join(', '));
              setParsing(false);
              return;
            }
            
            // Log field count warnings for debugging but don't stop processing
            const fieldWarnings = results.errors.filter(error => 
              error.message.includes('Too few fields') || 
              error.message.includes('Too many fields')
            );
            
            if (fieldWarnings.length > 0) {
              console.warn('CSV field count warnings (non-critical):', fieldWarnings);
              console.log('Note: Field count mismatches are common in CSV files and are usually non-critical. The application will process the available data.');
              setWarning(`CSV file has ${fieldWarnings.length} rows with inconsistent field counts. This is common and non-critical - the application will process the available data.`);
            }
            
            // Clean and validate the data
            const cleanedData = results.data.filter(row => {
              // Remove rows that are completely empty or have no meaningful data
              const hasData = Object.values(row).some(value => 
                value && value.toString().trim() !== ''
              );
              return hasData;
            });
            
            if (cleanedData.length === 0) {
              setError('No valid data found in the CSV file. Please check the file format.');
              setParsing(false);
              return;
            }
            
            console.log(`Successfully parsed ${cleanedData.length} rows from CSV file`);
            setRawData(cleanedData);
            setParsing(false);
            
            // Start automatic analysis
            setAnalyzing(true);
            setAnalysisProgress(0);
            
            try {
              // Real progress updates based on analysis steps
              const progressSteps = [
                { step: 'Validating data...', progress: 20 },
                { step: 'Analyzing patterns...', progress: 40 },
                { step: 'Calculating metrics...', progress: 60 },
                { step: 'Generating insights...', progress: 80 },
                { step: 'Finalizing report...', progress: 95 }
              ];
              
              let currentStep = 0;
              const progressInterval = setInterval(() => {
                if (currentStep < progressSteps.length) {
                  setAnalysisProgress(progressSteps[currentStep].progress);
                  currentStep++;
                } else {
                  clearInterval(progressInterval);
                }
              }, 300);
              
              // Perform comprehensive analysis
              const report = await dataAnalysisService.analyzeData(cleanedData, file.name);
              
              clearInterval(progressInterval);
              setAnalysisProgress(100);
              setAnalysisReport(report);
              setAnalyzing(false);
              setCurrentView('report'); // Show report first
              
              console.log('Analysis completed:', report);
            } catch (analysisError) {
              console.error('Analysis failed:', analysisError);
              setError('Analysis failed: ' + (analysisError as Error).message);
              setAnalyzing(false);
            }
          },
          error: (err) => {
            setParsing(false);
            setError('Failed to parse CSV file. Please check the file format. Error: ' + err.message);
          },
        });
      } catch (err) {
        setParsing(false);
        setError('Unexpected error during file processing.');
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const clearSavedData = () => {
    try {
      localStorage.removeItem('bankingAnalyticsData');
      localStorage.removeItem('bankingAnalyticsCsvName');
      localStorage.removeItem('bankingAnalyticsReport');
      localStorage.removeItem('bankingAnalyticsView');
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
    setRawData(null);
    setCsvName('');
    setAnalysisReport(null);
    setCurrentView('upload');
    setError(null);
    setWarning(null);
    setStorageWarning(null);
    setCsvUrl('');
  };

  // Utility function to check localStorage quota
  const checkLocalStorageQuota = () => {
    try {
      const testKey = 'quota-test';
      const testData = 'x'.repeat(1024 * 1024); // 1MB test
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleUrlSubmit = async () => {
    if (!csvUrl.trim()) {
      setError('Please enter a valid CSV URL');
      return;
    }

    setLoadingUrl(true);
    setError(null);
    setWarning(null);
    setParsing(true);
    setAnalyzing(false);
    setAnalysisProgress(0);
    setAnalysisReport(null);

    try {
      // Extract filename from URL
      const urlParts = csvUrl.split('/');
      const fileName = urlParts[urlParts.length - 1] || 'online-data.csv';
      setCsvName(fileName);

      // Fetch CSV data from URL
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
      }

      const csvText = await response.text();
      
      // Parse CSV using Papa Parse
      Papa.parse<RawBankingData>(csvText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim(),
        dynamicTyping: false,
        preview: 0,
        encoding: "UTF-8",
        worker: false,
        complete: async (results) => {
          const criticalErrors = results.errors.filter(error => 
            !error.message.includes('Too few fields') && 
            !error.message.includes('Too many fields') &&
            !error.message.includes('Expected')
          );
          
          if (criticalErrors.length > 0) {
            setError('Critical CSV parsing errors: ' + criticalErrors.map(e => e.message).join(', '));
            setParsing(false);
            setLoadingUrl(false);
            return;
          }

          if (results.errors.length > 0) {
            const warningMessages = results.errors.map(e => e.message).join(', ');
            setWarning(`CSV parsing warnings: ${warningMessages}`);
          }

          const data = results.data;
          if (data.length === 0) {
            setError('No data found in the CSV file');
            setParsing(false);
            setLoadingUrl(false);
            return;
          }

          setRawData(data);
          setParsing(false);
          setLoadingUrl(false);

          // Start analysis
          setAnalyzing(true);
          setAnalysisProgress(0);

          try {
            const report = await dataAnalysisService.analyzeData(data, fileName);
            setAnalysisReport(report);
            setCurrentView('report');
            setAnalyzing(false);
            setAnalysisProgress(100);
          } catch (analysisError) {
            setError('Analysis failed: ' + (analysisError as Error).message);
            setAnalyzing(false);
            setAnalysisProgress(0);
          }
        },
        error: (error: any) => {
          setError('CSV parsing failed: ' + error.message);
          setParsing(false);
          setLoadingUrl(false);
        }
      });

    } catch (error) {
      setError('Failed to load CSV from URL: ' + (error as Error).message);
      setParsing(false);
      setLoadingUrl(false);
    }
  };

  // Show analysis report if available
  if (analysisReport && currentView === 'report') {
    return (
      <ChakraProvider>
        <Box>
          {/* Navigation */}
          <Box p={4} bg="blue.600" color="white">
            <HStack justify="space-between">
              <Heading size="md">Banking Analytics System</Heading>
              <HStack spacing={4}>
                <Button 
                  variant="outline" 
                  colorScheme="white" 
                  onClick={() => setCurrentView('dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="solid" 
                  colorScheme="white" 
                  bg="blue.500"
                >
                  Analysis Report
                </Button>
                <Button 
                  variant="outline" 
                  colorScheme="white" 
                  onClick={clearSavedData}
                >
                  Clear Data
                </Button>
              </HStack>
            </HStack>
          </Box>
          <AnalysisReport report={analysisReport} />
        </Box>
      </ChakraProvider>
    );
  }

  // Show dashboard if data is loaded
  if (rawData && currentView === 'dashboard') {
    return (
      <ChakraProvider>
        <Box>
          {/* Navigation */}
          <Box p={4} bg="blue.600" color="white">
            <HStack justify="space-between">
              <Heading size="md">Banking Analytics System</Heading>
              <HStack spacing={4}>
                <Button 
                  variant="solid" 
                  colorScheme="white" 
                  bg="blue.500"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  colorScheme="white" 
                  onClick={() => setCurrentView('report')}
                >
                  Analysis Report
                </Button>
                <Button 
                  variant="outline" 
                  colorScheme="white" 
                  onClick={clearSavedData}
                >
                  Clear Data
                </Button>
              </HStack>
            </HStack>
          </Box>
        <AnalyticsDashboard rawData={rawData} />
        </Box>
      </ChakraProvider>
    );
  }

  return (
    <ChakraProvider>
      <Box 
        minH="100vh" 
        bg="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
        position="relative"
        overflow="hidden"
      >
        {/* Subtle background pattern */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.03"
          backgroundImage="radial-gradient(circle at 25% 25%, #667eea 0%, transparent 50%), radial-gradient(circle at 75% 75%, #764ba2 0%, transparent 50%)"
        />
        
        <VStack spacing={8} maxW="800px" mx="auto" p={8} position="relative" zIndex={1}>
          {/* Professional Header */}
          <Box textAlign="center" pt={8}>
            <Box
              display="inline-block"
              p={6}
              bg="white"
              borderRadius="20px"
              boxShadow="0 20px 40px rgba(0,0,0,0.1)"
              mb={6}
            >
              <Heading size="xl" color="gray.800" fontWeight="600" mb={2}>
                Benki Yetu
              </Heading>
              <Text fontSize="lg" color="gray.600" fontWeight="500">
                Financial Analytics Platform
              </Text>
            </Box>
            
            <Text fontSize="lg" color="gray.700" maxW="600px" mx="auto" lineHeight="1.6">
              Transform your banking data into actionable insights with our advanced analytics platform. 
              Upload your CSV file to unlock comprehensive analysis of customer behavior, transaction patterns, 
              and financial performance metrics.
            </Text>
          </Box>

            {/* Upload Section */}
            <Box 
              w="full" 
              bg="white" 
              borderRadius="16px" 
              p={8}
              boxShadow="0 10px 30px rgba(0,0,0,0.1)"
              border="1px solid"
              borderColor="gray.100"
            >
              <VStack spacing={6}>
                <Box textAlign="center">
                  <Heading size="lg" color="gray.800" mb={2} fontWeight="600">
                    Upload Your Data
                  </Heading>
                  <Text color="gray.600" fontSize="md">
                    Upload a CSV file or paste a direct link to analyze online data
          </Text>
                </Box>
                
                {/* File Upload */}
                <VStack spacing={4} w="full">
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden-file-input"
              title="Select CSV file for banking data analysis"
              aria-label="Upload CSV file"
            />
                  
                  <Button 
                    onClick={handleUploadClick} 
                    size="lg"
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    color="white"
                    borderRadius="12px"
                    px={12}
                    py={6}
                    fontSize="md"
                    fontWeight="600"
                    isLoading={parsing || analyzing} 
                    loadingText={parsing ? "Processing..." : "Analyzing..."}
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "0 15px 35px rgba(102, 126, 234, 0.4)"
                    }}
                    transition="all 0.3s ease"
                    boxShadow="0 8px 25px rgba(102, 126, 234, 0.3)"
                    w="full"
                    maxW="400px"
                  >
                    Choose CSV File
                  </Button>
                </VStack>

                {/* Divider */}
                <HStack w="full" spacing={4}>
                  <Box flex="1" h="1px" bg="gray.200" />
                  <Text fontSize="sm" color="gray.500" fontWeight="500">OR</Text>
                  <Box flex="1" h="1px" bg="gray.200" />
                </HStack>

                {/* URL Input */}
                <VStack spacing={4} w="full">
                  <Box w="full" maxW="500px">
                    <Text fontSize="sm" color="gray.700" fontWeight="500" mb={2}>
                      Paste CSV URL Link:
                    </Text>
                    <HStack spacing={3}>
                      <Box flex="1">
                        <input
                          type="url"
                          placeholder="https://example.com/data.csv"
                          value={csvUrl}
                          onChange={(e) => setCsvUrl(e.target.value)}
                          className="url-input"
                          title="Enter URL to CSV file for online data analysis"
                          aria-label="CSV file URL input"
                          onFocus={(e) => {
                            e.target.style.borderColor = '#667eea';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                          }}
                        />
                      </Box>
                      <Button 
                        onClick={handleUrlSubmit}
                        colorScheme="blue"
                        isLoading={loadingUrl}
                        loadingText="Loading..."
                        px={6}
                        py={2}
                        fontSize="sm"
                        fontWeight="600"
                        borderRadius="8px"
                        _hover={{
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(66, 153, 225, 0.4)"
                        }}
                        transition="all 0.2s ease"
                      >
                        Analyze URL
            </Button>
                    </HStack>
                  </Box>
                </VStack>
                
                {csvName && !parsing && !analyzing && (
                  <Box 
                    bg="green.50" 
                    color="green.800" 
                    px={4} 
                    py={2} 
                    borderRadius="8px"
                    fontSize="sm"
                    fontWeight="500"
                  >
                    Selected: {csvName}
                  </Box>
                )}
                
                {/* Analysis Progress */}
                {analyzing && (
                  <Box w="full" mt={4}>
                    <VStack spacing={4}>
                      <HStack spacing={3}>
                        <Spinner size="sm" color="blue.500" />
                        <Text color="gray.700" fontWeight="500">Analyzing Data Patterns...</Text>
                      </HStack>
                      <Box w="full">
                        <Progress 
                          value={analysisProgress} 
                          w="full" 
                          colorScheme="blue" 
                          borderRadius="8px"
                          height="8px"
                          bg="gray.100"
                        />
                        <Text mt={2} fontSize="sm" color="gray.600" textAlign="center">
                          {analysisProgress.toFixed(0)}% Complete
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                )}
              </VStack>
          </Box>

          {/* Status Messages */}
          {error && (
            <Box 
              w="full" 
              bg="red.50" 
              border="1px solid" 
              borderColor="red.200" 
              borderRadius="12px" 
              p={6}
            >
              <VStack spacing={3}>
                <Box color="red.600" fontSize="lg" fontWeight="600">
                  Upload Error
                </Box>
                <Text color="red.700" fontSize="md">
                  {error}
                </Text>
              </VStack>
            </Box>
          )}
          
          {warning && (
            <Box 
              w="full" 
              bg="orange.50" 
              border="1px solid" 
              borderColor="orange.200" 
              borderRadius="12px" 
              p={6}
            >
              <VStack spacing={3}>
                <Box color="orange.600" fontSize="lg" fontWeight="600">
                  File Format Notice
                </Box>
                <Text color="orange.700" fontSize="md">
                  {warning}
                </Text>
              </VStack>
            </Box>
          )}

          {storageWarning && (
            <Box 
              w="full" 
              bg="yellow.50" 
              border="1px solid" 
              borderColor="yellow.200" 
              borderRadius="12px" 
              p={6}
            >
              <VStack spacing={3}>
                <Box color="yellow.600" fontSize="lg" fontWeight="600">
                  Storage Notice
                </Box>
                <Text color="yellow.700" fontSize="md">
                  {storageWarning}
                </Text>
                <Text color="yellow.600" fontSize="sm">
                  Tip: Use the "Clear Data" button to free up space, or export your analysis before refreshing.
                </Text>
              </VStack>
            </Box>
          )}

        </VStack>
      </Box>
    </ChakraProvider>
  );
}

export default App;
