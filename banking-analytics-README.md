# Banking Data Analysis Tool

A comprehensive React TypeScript application for banking data visualization and analysis.

## Project Overview

This tool processes and visualizes banking transaction data from `Comprehensive_Banking_Database.csv`, providing insights for financial analysis, customer segmentation, and business intelligence.

## Features

- **Data Processing**: Clean and validate banking transaction data
- **Interactive Dashboard**: Real-time charts and visualizations
- **Business Analytics**: Customer lifetime value, anomaly detection, branch performance
- **Data Export**: Export processed data and reports
- **Performance Optimized**: Handles large datasets efficiently

## Visualizations

1. **Branch Performance Dashboard** - Horizontal bar chart showing transaction volumes
2. **Transaction Trends** - Line chart displaying temporal patterns
3. **Customer Segmentation** - Scatter plot for high-value customer identification
4. **Account Distribution** - Pie chart of account types
5. **Anomaly Heatmap** - Detection of unusual transaction patterns

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Charts**: Recharts, D3.js
- **UI Components**: Lucide React icons
- **Date Handling**: React DatePicker
- **Styling**: CSS Modules / Tailwind CSS
- **State Management**: React Context + useReducer
- **Testing**: Jest + React Testing Library

## Project Structure

```
src/
├── components/
│   ├── Dashboard/
│   │   ├── MainDashboard.tsx
│   │   ├── FilterPanel.tsx
│   │   └── MetricsOverview.tsx
│   ├── Charts/
│   │   ├── BranchPerformanceChart.tsx
│   │   ├── TransactionTrendsChart.tsx
│   │   ├── CustomerSegmentationChart.tsx
│   │   ├── AccountDistributionChart.tsx
│   │   └── AnomalyHeatmap.tsx
│   └── UI/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── DataTable.tsx
├── hooks/
│   ├── useDataProcessing.ts
│   ├── useChartData.ts
│   └── usePerformance.ts
├── services/
│   ├── csvParser.ts
│   ├── dataValidator.ts
│   └── exportService.ts
├── types/
│   ├── banking.ts
│   └── charts.ts
├── utils/
│   ├── dataProcessing/
│   │   ├── normalization.ts
│   │   ├── validation.ts
│   │   └── transformation.ts
│   ├── calculations/
│   │   ├── businessMetrics.ts
│   │   └── analytics.ts
│   └── performance/
│       ├── optimization.ts
│       └── memoryManagement.ts
└── data/
    └── mockData.ts
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Install additional packages for banking analytics
npm install recharts @types/d3 d3 react-datepicker @types/react-datepicker lucide-react

# Start development server
npm start
```

### Data Setup
1. Place your `Comprehensive_Banking_Database.csv` in the `public/data/` folder
2. The app will automatically load and process the data on startup

## Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run integration tests
npm run test:integration
```

## Business Metrics

### Key Performance Indicators (KPIs)
- **Customer Lifetime Value (CLV)**
- **Average Transaction Value**
- **Branch Performance Rankings**
- **Customer Acquisition Cost**
- **Churn Rate Analysis**

### Anomaly Detection
- Unusual transaction patterns
- Suspicious account activity
- Outlier detection in customer behavior

## Performance Optimization

- **Lazy Loading**: Components loaded on demand
- **Data Virtualization**: Handle large datasets efficiently
- **Memoization**: Prevent unnecessary re-renders
- **Web Workers**: Offload heavy computations
- **Pagination**: Manage large data displays

## Data Processing Pipeline

1. **Raw Data Import** - CSV parsing and initial load
2. **Data Cleaning** - Handle missing values, format standardization
3. **Validation** - Business rule validation, consistency checks
4. **Transformation** - Data aggregation and metric calculations
5. **Visualization** - Chart data preparation and rendering

## Assessment Criteria

This project addresses the Frontend Engineering Challenge requirements:

- **Data Normalization** - Clean currency, dates, and categorical data
- **Data Validation** - Business logic validation and filtering
- **Edge Case Handling** - Robust error management
- **Business Analytics** - Strategic insights and metrics
- **Performance Optimization** - Scalable for large datasets
- **Visualization** - 5 key charts for senior management
- **Real-time Architecture** - Prepared for streaming data

## License

This project is part of an assessment for HF Analytics and is for educational purposes.