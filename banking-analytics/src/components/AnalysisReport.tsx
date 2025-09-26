import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  UnorderedList,
  ListItem,
  Code,
  Button,
  Collapse,
  useDisclosure
} from '@chakra-ui/react';
import { DataAnalysisReport } from '../services/dataAnalysisService';

interface AnalysisReportProps {
  report: DataAnalysisReport;
}

const AnalysisReport: React.FC<AnalysisReportProps> = ({ report }) => {
  const { isOpen: isFileInfoOpen, onToggle: toggleFileInfo } = useDisclosure();
  const { isOpen: isQualityOpen, onToggle: toggleQuality } = useDisclosure();
  const { isOpen: isInsightsOpen, onToggle: toggleInsights } = useDisclosure();
  const { isOpen: isRiskOpen, onToggle: toggleRisk } = useDisclosure();
  const { isOpen: isRecommendationsOpen, onToggle: toggleRecommendations } = useDisclosure();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'green';
    if (score >= 70) return 'yellow';
    if (score >= 50) return 'orange';
    return 'red';
  };

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
      p={8}
    >
      <Box maxW="1200px" mx="auto">
        <VStack spacing={8} align="stretch">
          {/* Professional Header */}
          <Box 
            textAlign="center" 
            p={8} 
            bg="white" 
            borderRadius="20px"
            boxShadow="0 20px 40px rgba(0,0,0,0.1)"
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
          >
            {/* Decorative background */}
            <Box
              position="absolute"
              top="-50px"
              right="-50px"
              w="200px"
              h="200px"
              bg="blue.100"
              opacity="0.3"
              borderRadius="full"
            />
            <Box
              position="absolute"
              bottom="-30px"
              left="-30px"
              w="150px"
              h="150px"
              bg="purple.100"
              opacity="0.3"
              borderRadius="full"
            />
            
            <VStack spacing={4} position="relative" zIndex={1}>
              <Heading size="xl" color="gray.800" fontWeight="700" mb={2}>
                Comprehensive Data Analysis Report
              </Heading>
              <Text fontSize="lg" color="gray.600" fontWeight="500">
                {report.fileInfo.fileName}
              </Text>
              <Text fontSize="md" color="gray.500">
                Generated on {report.fileInfo.uploadDate.toLocaleDateString()}
              </Text>
            </VStack>
          </Box>

          {/* Executive Summary */}
          <Box 
            p={8} 
            bg="white" 
            borderRadius="16px"
            boxShadow="0 10px 30px rgba(0,0,0,0.1)"
            border="1px solid"
            borderColor="gray.100"
          >
            <VStack spacing={6}>
              <Heading size="lg" color="gray.800" fontWeight="600" textAlign="center">
                Executive Summary
              </Heading>
              
              <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6} w="full">
                <GridItem>
                  <Box 
                    p={6} 
                    bg="blue.50" 
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="blue.200"
                  >
                    <Stat>
                      <StatLabel color="blue.700" fontWeight="600">Overall Score</StatLabel>
                      <StatNumber color="blue.800" fontSize="2xl">
                        {report.summary.overallScore.toFixed(1)}%
                      </StatNumber>
                      <StatHelpText color="blue.600">
                        <StatArrow type={report.summary.overallScore >= 80 ? 'increase' : 'decrease'} />
                        Data Quality Score
                      </StatHelpText>
                    </Stat>
                  </Box>
                </GridItem>
                
                <GridItem>
                  <Box 
                    p={6} 
                    bg="green.50" 
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="green.200"
                  >
                    <Stat>
                      <StatLabel color="green.700" fontWeight="600">Total Records</StatLabel>
                      <StatNumber color="green.800" fontSize="2xl">
                        {report.fileInfo.totalRows.toLocaleString()}
                      </StatNumber>
                      <StatHelpText color="green.600">
                        {report.fileInfo.totalColumns} columns
                      </StatHelpText>
                    </Stat>
                  </Box>
                </GridItem>
                
                <GridItem>
                  <Box 
                    p={6} 
                    bg="purple.50" 
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="purple.200"
                  >
                    <Stat>
                      <StatLabel color="purple.700" fontWeight="600">Unique Customers</StatLabel>
                      <StatNumber color="purple.800" fontSize="2xl">
                        {report.businessInsights.customerDemographics.totalCustomers.toLocaleString()}
                      </StatNumber>
                      <StatHelpText color="purple.600">
                        Active customers
                      </StatHelpText>
                    </Stat>
                  </Box>
                </GridItem>
                
                <GridItem>
                  <Box 
                    p={6} 
                    bg="orange.50" 
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="orange.200"
                  >
                    <Stat>
                      <StatLabel color="orange.700" fontWeight="600">Total Volume</StatLabel>
                      <StatNumber color="orange.800" fontSize="2xl">
                        KSH {report.businessInsights.financialMetrics.totalVolume.toLocaleString()}
                      </StatNumber>
                      <StatHelpText color="orange.600">
                        Transaction volume
                      </StatHelpText>
                    </Stat>
                  </Box>
                </GridItem>
              </Grid>
            </VStack>
          </Box>

        {/* Key Findings */}
        <Box p={6} bg="white" borderRadius="lg" shadow="md">
          <Heading size="lg" mb={4}>Key Findings</Heading>
          <VStack spacing={3} align="stretch">
            {report.summary.keyFindings.map((finding, index) => (
              <HStack key={index} p={3} bg="blue.50" borderRadius="md">
                <Text fontWeight="medium">-</Text>
                <Text>{finding}</Text>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Critical Issues */}
        {report.summary.criticalIssues.length > 0 && (
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Critical Issues Detected!</AlertTitle>
              <AlertDescription>
                <UnorderedList mt={2}>
                  {report.summary.criticalIssues.map((issue, index) => (
                    <ListItem key={index}>{issue}</ListItem>
                  ))}
                </UnorderedList>
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* File Information */}
        <Box p={6} bg="white" borderRadius="lg" shadow="md">
          <Button onClick={toggleFileInfo} variant="outline" mb={4}>
            {isFileInfoOpen ? 'Hide' : 'Show'} File Information
          </Button>
          <Collapse in={isFileInfoOpen}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">File Details</Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                <GridItem>
                  <Text fontWeight="bold">File Name:</Text>
                  <Text>{report.fileInfo.fileName}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">File Size:</Text>
                  <Text>{report.fileInfo.fileSize}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Total Rows:</Text>
                  <Text>{report.fileInfo.totalRows.toLocaleString()}</Text>
                </GridItem>
                <GridItem>
                  <Text fontWeight="bold">Total Columns:</Text>
                  <Text>{report.fileInfo.totalColumns}</Text>
                </GridItem>
              </Grid>
              
              <Divider />
              
              <Heading size="md">Column Analysis</Heading>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Column Name</Th>
                    <Th>Type</Th>
                    <Th>Null Values</Th>
                    <Th>Unique Values</Th>
                    <Th>Sample Values</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {report.fileInfo.columns.map((column, index) => (
                    <Tr key={index}>
                      <Td>
                        <Code>{column.name}</Code>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue">{column.type}</Badge>
                      </Td>
                      <Td>{column.nullCount}</Td>
                      <Td>{column.uniqueCount}</Td>
                      <Td>
                        <Text fontSize="sm" maxW="200px" isTruncated>
                          {column.sampleValues.join(', ')}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </Collapse>
        </Box>

        {/* Data Quality */}
        <Box p={6} bg="white" borderRadius="lg" shadow="md">
          <Button onClick={toggleQuality} variant="outline" mb={4}>
            {isQualityOpen ? 'Hide' : 'Show'} Data Quality Analysis
          </Button>
          <Collapse in={isQualityOpen}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Data Quality Metrics</Heading>
              
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={2}>Completeness</Text>
                    <Progress value={report.dataQuality.completeness} colorScheme={getScoreColor(report.dataQuality.completeness)} />
                    <Text fontSize="sm" mt={1}>{report.dataQuality.completeness.toFixed(1)}%</Text>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={2}>Consistency</Text>
                    <Progress value={report.dataQuality.consistency} colorScheme={getScoreColor(report.dataQuality.consistency)} />
                    <Text fontSize="sm" mt={1}>{report.dataQuality.consistency.toFixed(1)}%</Text>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={2}>Accuracy</Text>
                    <Progress value={report.dataQuality.accuracy} colorScheme={getScoreColor(report.dataQuality.accuracy)} />
                    <Text fontSize="sm" mt={1}>{report.dataQuality.accuracy.toFixed(1)}%</Text>
                  </Box>
                </GridItem>
              </Grid>

              <Divider />

              <Heading size="md">Data Issues</Heading>
              {report.dataQuality.issues.length > 0 ? (
                <VStack spacing={2} align="stretch">
                  {report.dataQuality.issues.map((issue, index) => (
                    <Box key={index} p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                      <HStack justify="space-between" mb={2}>
                        <Badge colorScheme={getSeverityColor(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <Badge colorScheme="blue">{issue.type}</Badge>
                      </HStack>
                      <Text fontWeight="medium" mb={1}>{issue.description}</Text>
                      <Text fontSize="sm" color="gray.600">{issue.recommendation}</Text>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Text color="green.600" fontWeight="medium">No data quality issues detected!</Text>
              )}
            </VStack>
          </Collapse>
        </Box>

        {/* Business Insights */}
        <Box p={6} bg="white" borderRadius="lg" shadow="md">
          <Button onClick={toggleInsights} variant="outline" mb={4}>
            {isInsightsOpen ? 'Hide' : 'Show'} Business Insights
          </Button>
          <Collapse in={isInsightsOpen}>
            <VStack spacing={6} align="stretch">
              <Heading size="md">Customer Demographics</Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={3}>Age Distribution</Text>
                    {report.businessInsights.customerDemographics.ageDistribution.map((age, index) => (
                      <HStack key={index} justify="space-between" mb={1}>
                        <Text fontSize="sm">{age.range}</Text>
                        <Text fontSize="sm" fontWeight="medium">{age.count} ({age.percentage.toFixed(1)}%)</Text>
                      </HStack>
                    ))}
                  </Box>
                </GridItem>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={3}>Gender Distribution</Text>
                    {report.businessInsights.customerDemographics.genderDistribution.map((gender, index) => (
                      <HStack key={index} justify="space-between" mb={1}>
                        <Text fontSize="sm">{gender.gender}</Text>
                        <Text fontSize="sm" fontWeight="medium">{gender.count} ({gender.percentage.toFixed(1)}%)</Text>
                      </HStack>
                    ))}
                  </Box>
                </GridItem>
              </Grid>

              <Divider />

              <Heading size="md">Transaction Patterns</Heading>
              <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={3}>Transaction Types</Text>
                    {report.businessInsights.transactionPatterns.transactionTypeDistribution.map((type, index) => (
                      <HStack key={index} justify="space-between" mb={1}>
                        <Text fontSize="sm">{type.type}</Text>
                        <Text fontSize="sm" fontWeight="medium">{type.count}</Text>
                      </HStack>
                    ))}
                  </Box>
                </GridItem>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={3}>Peak Hours</Text>
                    {report.businessInsights.transactionPatterns.peakHours.map((hour, index) => (
                      <HStack key={index} justify="space-between" mb={1}>
                        <Text fontSize="sm">{hour.hour}:00</Text>
                        <Text fontSize="sm" fontWeight="medium">{hour.transactionCount}</Text>
                      </HStack>
                    ))}
                  </Box>
                </GridItem>
              </Grid>

              <Divider />

              <Heading size="md">Branch Performance</Heading>
              <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                <Text fontWeight="bold" mb={3}>Top Performing Branches</Text>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      <Th>Branch ID</Th>
                      <Th>Transaction Volume</Th>
                      <Th>Customer Count</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {report.businessInsights.branchPerformance.topPerformingBranches.map((branch, index) => (
                      <Tr key={index}>
                        <Td>{branch.branchId}</Td>
                        <Td>KSH {branch.transactionVolume.toLocaleString()}</Td>
                        <Td>{branch.customerCount}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </Collapse>
        </Box>

        {/* Risk Analysis */}
        <Box p={6} bg="white" borderRadius="lg" shadow="md">
          <Button onClick={toggleRisk} variant="outline" mb={4}>
            {isRiskOpen ? 'Hide' : 'Show'} Risk Analysis
          </Button>
          <Collapse in={isRiskOpen}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Risk Assessment</Heading>
              
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md" textAlign="center">
                    <Text fontWeight="bold" fontSize="2xl" color="red.500">
                      {report.riskAnalysis.suspiciousTransactions.length}
                    </Text>
                    <Text fontSize="sm">Suspicious Transactions</Text>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md" textAlign="center">
                    <Text fontWeight="bold" fontSize="2xl" color="orange.500">
                      {report.riskAnalysis.highRiskCustomers.length}
                    </Text>
                    <Text fontSize="sm">High-Risk Customers</Text>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md" textAlign="center">
                    <Text fontWeight="bold" fontSize="2xl" color={getScoreColor(100 - report.riskAnalysis.anomalyScore)}>
                      {report.riskAnalysis.anomalyScore.toFixed(1)}
                    </Text>
                    <Text fontSize="sm">Anomaly Score</Text>
                  </Box>
                </GridItem>
              </Grid>

              {report.riskAnalysis.suspiciousTransactions.length > 0 && (
                <>
                  <Divider />
                  <Heading size="md">Suspicious Transactions</Heading>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Transaction ID</Th>
                        <Th>Customer ID</Th>
                        <Th>Amount</Th>
                        <Th>Risk Score</Th>
                        <Th>Reason</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {report.riskAnalysis.suspiciousTransactions.slice(0, 10).map((transaction, index) => (
                        <Tr key={index}>
                          <Td>{transaction.transactionId}</Td>
                          <Td>{transaction.customerId}</Td>
                          <Td>KSH {transaction.amount.toLocaleString()}</Td>
                          <Td>
                            <Badge colorScheme={transaction.riskScore > 70 ? 'red' : transaction.riskScore > 40 ? 'orange' : 'yellow'}>
                              {transaction.riskScore.toFixed(1)}
                            </Badge>
                          </Td>
                          <Td>{transaction.reason}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </>
              )}
            </VStack>
          </Collapse>
        </Box>

        {/* Recommendations */}
        <Box p={6} bg="white" borderRadius="lg" shadow="md">
          <Button onClick={toggleRecommendations} variant="outline" mb={4}>
            {isRecommendationsOpen ? 'Hide' : 'Show'} Recommendations
          </Button>
          <Collapse in={isRecommendationsOpen}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Recommendations</Heading>
              
              <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={3} color="blue.600">Data Quality</Text>
                    <UnorderedList spacing={1}>
                      {report.recommendations.dataQuality.map((rec, index) => (
                        <ListItem key={index} fontSize="sm">{rec}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={3} color="green.600">Business Operations</Text>
                    <UnorderedList spacing={1}>
                      {report.recommendations.businessOperations.map((rec, index) => (
                        <ListItem key={index} fontSize="sm">{rec}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={3} color="red.600">Risk Management</Text>
                    <UnorderedList spacing={1}>
                      {report.recommendations.riskManagement.map((rec, index) => (
                        <ListItem key={index} fontSize="sm">{rec}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
                    <Text fontWeight="bold" mb={3} color="purple.600">Growth Opportunities</Text>
                    <UnorderedList spacing={1}>
                      {report.recommendations.growthOpportunities.map((rec, index) => (
                        <ListItem key={index} fontSize="sm">{rec}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                </GridItem>
              </Grid>

              <Divider />

              <Heading size="md">Next Steps</Heading>
              <VStack spacing={2} align="stretch">
                {report.summary.nextSteps.map((step, index) => (
                  <HStack key={index} p={3} bg="blue.50" borderRadius="md">
                    <Text fontWeight="bold" color="blue.600">{index + 1}.</Text>
                    <Text>{step}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Collapse>
        </Box>

          {/* Footer */}
          <Box p={4} bg="gray.100" borderRadius="lg" textAlign="center">
            <Text fontSize="sm" color="gray.600">
              Report generated by Banking Analytics System - {new Date().toLocaleString()}
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default AnalysisReport;
