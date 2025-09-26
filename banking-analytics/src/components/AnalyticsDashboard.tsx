import React, { useMemo, useState, useRef } from "react";
import { RawBankingData } from "../types/banking";
import { validateBankingData } from "../utils/validation/dataValidator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import {
  Stat,
  StatLabel,
  Button,
  Select,
  Heading,
  VStack,
  Box,
  Grid,
  GridItem,
  HStack,
  Text
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface AnalyticsDashboardProps {
  rawData: RawBankingData[];
}

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#14b8a6", "#f472b6", "#facc15", "#a3e635", "#818cf8"];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ rawData }) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Validate and clean the uploaded data
  const { validRecords } = useMemo(() => validateBankingData(rawData), [rawData]);

  // Filtered data based on filters
  const filteredRecords = useMemo(() => {
    return validRecords.filter(record => {
      const recordDate = new Date(record.transactionDate);
      const dateMatch = (!startDate || recordDate >= startDate) && (!endDate || recordDate <= endDate);
      const branchMatch = !selectedBranch || record.branchId === selectedBranch;
      const typeMatch = !selectedType || record.transactionType === selectedType;
      return dateMatch && branchMatch && typeMatch;
    });
  }, [validRecords, startDate, endDate, selectedBranch, selectedType]);

  // Summary stats
  const totalVolume = useMemo(() => filteredRecords.reduce((sum, r) => sum + r.transactionAmount, 0), [filteredRecords]);
  const avgTransaction = useMemo(() => filteredRecords.length ? (totalVolume / filteredRecords.length) : 0, [totalVolume, filteredRecords]);
  const customerCount = useMemo(() => new Set(filteredRecords.map(r => r.customerId)).size, [filteredRecords]);

  // Bar: Top 10 branches by volume
  const branchVolume = useMemo(() => {
    const volumeMap: Record<string, number> = {};
    filteredRecords.forEach(row => {
      const branch = row.branchId || "Unknown";
      const amount = row.transactionAmount;
      if (!volumeMap[branch]) volumeMap[branch] = 0;
      volumeMap[branch] += amount;
    });
    return Object.entries(volumeMap)
      .map(([branch, total]) => ({ branch, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredRecords]);

  // Pie: Transaction type breakdown
  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecords.forEach(row => {
      const type = row.transactionType || "Other";
      map[type] = (map[type] || 0) + row.transactionAmount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredRecords]);

  // Line: Daily transaction trends
  const trendData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecords.forEach(row => {
      const date = new Date(row.transactionDate).toISOString().split("T")[0];
      map[date] = (map[date] || 0) + row.transactionAmount;
    });
    return Object.entries(map)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRecords]);

  // Pie: Gender distribution
  const genderData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecords.forEach(row => {
      const gender = row.customerGender || "Other";
      map[gender] = (map[gender] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredRecords]);

  // Bar: Hourly transaction volume
  const hourlyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecords.forEach(row => {
      const hour = new Date(row.transactionDate).getHours().toString().padStart(2, "0");
      map[hour] = (map[hour] || 0) + row.transactionAmount;
    });
    const hourlyAmounts = Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, "0");
      return { hour, amount: map[hour] || 0 };
    });
    
    // Calculate dynamic range for clearer visualization
    const amounts = hourlyAmounts.map(d => d.amount).filter(amount => amount > 0);
    if (amounts.length === 0) return hourlyAmounts;
    
    const minAmount = Math.min(...amounts);
    const maxAmount = Math.max(...amounts);
    const range = maxAmount - minAmount;
    
    // Use 80% of the range to focus on the most relevant data
    const adjustedMin = minAmount + (range * 0.1);
    const adjustedMax = maxAmount - (range * 0.1);
    
    return hourlyAmounts.map(d => ({
      ...d,
      amount: Math.max(adjustedMin, Math.min(adjustedMax, d.amount))
    }));
  }, [filteredRecords]);

  // Histogram: Transaction amount distribution
  const histogramData = useMemo(() => {
    const bins = [0, 100, 500, 1000, 5000, 10000, 50000, 100000];
    const counts = Array(bins.length - 1).fill(0);
    filteredRecords.forEach(row => {
      const amt = row.transactionAmount;
      for (let i = 0; i < bins.length - 1; i++) {
        if (amt >= bins[i] && amt < bins[i + 1]) {
          counts[i]++;
          break;
        }
      }
    });
    return counts.map((count, i) => ({
      bin: `${bins[i]}-${bins[i + 1] - 1}`,
      count
    }));
  }, [filteredRecords]);

  // Options for filters
  const branchOptions = useMemo(() => {
    const branches = new Set(validRecords.map(r => r.branchId).filter(Boolean));
    return Array.from(branches);
  }, [validRecords]);

  const typeOptions = useMemo(() => {
    const types = new Set(validRecords.map(r => r.transactionType).filter(Boolean));
    return Array.from(types);
  }, [validRecords]);

  // Export functions
  const exportCSV = () => {
    const csv = Papa.unparse(filteredRecords);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "filtered_banking_data.csv";
    link.click();
    alert("CSV exported successfully!");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Banking Analytics Dashboard", 20, 20);
    doc.text(`Total Volume: ${totalVolume.toLocaleString()}`, 20, 40);
    doc.text(`Unique Customers: ${customerCount}`, 20, 50);
    doc.text(`Average Transaction: ${avgTransaction.toLocaleString()}`, 20, 60);
    doc.save("banking_analytics.pdf");
    alert("PDF exported successfully!");
  };

  const exportPNG = async () => {
    if (dashboardRef.current) {
      const canvas = await html2canvas(dashboardRef.current);
      const link = document.createElement("a");
      link.download = "banking_analytics.png";
      link.href = canvas.toDataURL();
      link.click();
      alert("PNG exported successfully!");
    }
  };

  return (
    <Box p={8} maxW="1200px" mx="auto" ref={dashboardRef}>
      <VStack gap={8} align="stretch">
        <Heading as="h2" size="xl" textAlign="center" color="gray.800">
          Banking Analytics Dashboard
        </Heading>

        {/* Filters Section */}
        <Box p={6} bg="gray.50" borderRadius="lg" shadow="md">
          <Heading as="h3" size="md" mb={4}>Filters</Heading>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
            <GridItem>
              <Text fontWeight="medium" mb={2}>Start Date</Text>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                dateFormat="yyyy-MM-dd"
                className="chakra-input"
                placeholderText="Select start date"
              />
            </GridItem>
            <GridItem>
              <Text fontWeight="medium" mb={2}>End Date</Text>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                dateFormat="yyyy-MM-dd"
                className="chakra-input"
                placeholderText="Select end date"
              />
            </GridItem>
            <GridItem>
              <Text fontWeight="medium" mb={2}>Branch</Text>
              <Select
                placeholder="All Branches"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                title="Select branch to filter transactions"
                aria-label="Branch filter selection"
                id="branch-select"
              >
                {branchOptions.map((branch: string) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </Select>
            </GridItem>
            <GridItem>
              <Text fontWeight="medium" mb={2}>Transaction Type</Text>
              <Select
                placeholder="All Types"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                title="Select transaction type to filter data"
                aria-label="Transaction type filter selection"
                id="type-select"
              >
                {typeOptions.map((type: string) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </GridItem>
          </Grid>
        </Box>

        {/* Export Buttons */}
        <HStack justify="center" gap={4}>
          <Button colorScheme="blue" onClick={exportCSV}>
            Export CSV
          </Button>
          <Button colorScheme="green" onClick={exportPDF}>
            Export PDF
          </Button>
          <Button colorScheme="purple" onClick={exportPNG}>
            Export PNG
          </Button>
        </HStack>

        {/* Summary Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
          <GridItem>
            <Stat p={6} bg="gray.50" borderRadius="lg" shadow="md">
              <StatLabel fontSize="sm" color="gray.600">Valid Records</StatLabel>
              <div className="summary-stat-large summary-stat-green">{filteredRecords.length}</div>
              <div className="summary-stat-small">Filtered from {validRecords.length} total</div>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat p={6} bg="gray.50" borderRadius="lg" shadow="md">
              <StatLabel fontSize="sm" color="gray.600">Unique Customers</StatLabel>
              <div className="summary-stat-large summary-stat-blue">{customerCount}</div>
              <div className="summary-stat-small">In filtered data</div>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat p={6} bg="gray.50" borderRadius="lg" shadow="md">
              <StatLabel fontSize="sm" color="gray.600">Total Volume</StatLabel>
              <div className="summary-stat-large summary-stat-orange">
                {totalVolume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="summary-stat-small">In filtered data</div>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat p={6} bg="gray.50" borderRadius="lg" shadow="md">
              <StatLabel fontSize="sm" color="gray.600">Avg Transaction</StatLabel>
              <div className="summary-stat-large summary-stat-red">
                {avgTransaction.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <div className="summary-stat-small">In filtered data</div>
            </Stat>
          </GridItem>
        </Grid>

        {/* Charts */}
        <VStack gap={8} align="stretch">
          {/* Branch Performance */}
          <Box p={6} bg="white" borderRadius="lg" shadow="md">
            <Heading as="h3" size="md" mb={4}>Branch Performance (Top 10)</Heading>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={branchVolume} layout="vertical" margin={{ left: 40, right: 40, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 13 }} />
                <YAxis dataKey="branch" type="category" width={120} tick={{ fontSize: 13 }} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Bar dataKey="total" fill="#10b981">
                  <LabelList
                    dataKey="total"
                    position="right"
                    formatter={(label: React.ReactNode) =>
                      typeof label === "number" ? label.toLocaleString() : label
                    }
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Transaction Type Breakdown */}
          <Box p={6} bg="white" borderRadius="lg" shadow="md">
            <Heading as="h3" size="md" mb={4}>Transaction Type Breakdown</Heading>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={120} label>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Daily Transaction Trends */}
          <Box p={6} bg="white" borderRadius="lg" shadow="md">
            <Heading as="h3" size="md" mb={4}>Daily Transaction Trends</Heading>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }}>
                  <text x={0} y={0} dx={180} dy={320} textAnchor="middle" fontSize={14} fill="#64748b">Date</text>
                </XAxis>
                <YAxis tick={{ fontSize: 12 }}>
                  <text x={0} y={0} dx={-30} dy={150} textAnchor="middle" fontSize={14} fill="#64748b" transform="rotate(-90)">Total Amount</text>
                </YAxis>
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Gender Distribution */}
          <Box p={6} bg="white" borderRadius="lg" shadow="md">
            <Heading as="h3" size="md" mb={4}>Customer Gender Distribution</Heading>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={100} label>
                  {genderData.map((_, index) => (
                    <Cell key={`cell-gender-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Hourly Transaction Volume */}
          <Box p={6} bg="white" borderRadius="lg" shadow="md">
            <Heading as="h3" size="md" mb={4}>Hourly Transaction Volume</Heading>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyData} margin={{ left: 30, right: 30, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" label={{ value: "Hour of Day", position: "insideBottom", offset: -5, fontSize: 14, fill: "#64748b" }} />
                <YAxis label={{ value: "Total Amount", angle: -90, position: "insideLeft", fontSize: 14, fill: "#64748b" }} />
                <Tooltip formatter={(v: number) => v.toLocaleString()} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Transaction Amount Distribution */}
          <Box p={6} bg="white" borderRadius="lg" shadow="md">
            <Heading as="h3" size="md" mb={4}>Transaction Amount Distribution</Heading>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogramData} margin={{ left: 30, right: 30, top: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bin" label={{ value: "Amount Range", position: "insideBottom", offset: -5, fontSize: 14, fill: "#64748b" }} />
                <YAxis label={{ value: "Number of Transactions", angle: -90, position: "insideLeft", fontSize: 14, fill: "#64748b" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};

export default AnalyticsDashboard;
