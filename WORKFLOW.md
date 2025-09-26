# Frontend Engineering Challenge: Banking Data Visualization - Implementation Workflow

## Challenge Overview
This exercise evaluates proficiency in building a robust and scalable frontend application using React and TypeScript for banking data processing and visualization.

## Dataset: Comprehensive_Banking_Database.csv
- **Records**: 5,001 banking transactions
- **Key Columns**: Customer ID, Transaction Date/Type/Amount, Account Balance, Demographics, Branch Code, Account Opening Date

## Implementation Workflow

### Phase 1: Project Setup and Foundation (Day 1)

#### 1.1 Environment Setup
- [ ] Create React TypeScript application
- [ ] Install required dependencies:
  ```bash
  npm install recharts @types/d3 d3 react-datepicker @types/react-datepicker lucide-react
  npm install --dev @types/node @testing-library/react @testing-library/jest-dom
  ```
- [ ] Configure TypeScript strict mode
- [ ] Set up project folder structure

#### 1.2 Project Structure
```
src/
├── components/
│   ├── Dashboard/
│   ├── Charts/
│   └── UI/
├── types/
├── utils/
│   ├── dataProcessing/
│   ├── validation/
│   └── calculations/
├── hooks/
├── services/
└── tests/
```

### Phase 2: Data Foundation & Type System (Day 1-2)

#### 2.1 Type Definitions (`src/types/banking.ts`)
- [ ] Define comprehensive TypeScript interfaces:
  ```typescript
  interface RawBankingData {
    'Customer ID': string;
    'Transaction Date': string;
    'Transaction Type': string;
    'Transaction Amount': string;
    'Account Balance': string;
    'Customer Age': string;
    'Customer Gender': string;
    'Account Type': string;
    'Branch Code': string;
    'Account Opening Date': string;
    // ... other fields
  }

  interface CleanedTransaction {
    customerId: number;
    transactionDate: Date;
    transactionType: TransactionType;
    transactionAmount: number;
    accountBalance: number;
    customerAge: number;
    customerGender: Gender;
    accountType: AccountType;
    branchCode: string;
    accountOpeningDate: Date;
    isValid: boolean;
    validationErrors: string[];
  }
  ```

#### 2.2 Enums and Constants
- [ ] Transaction types, account types, gender enums
- [ ] Validation constants (age ranges, amount limits)

### Phase 3: Part 1 - Foundational Implementation (Day 2-3)

#### 3.1 Question 1: Data Normalization (`src/utils/dataProcessing/normalization.ts`)
- [ ] **parseAmount()**: Handle currency formats, empty values
  ```typescript
  function parseAmount(amount: string): number {
    // Handle: "$1,234.56", "1234.56", "", "N/A", null
  }
  ```
- [ ] **normalizeGender()**: Standardize gender values
- [ ] **parseDate()**: Support multiple date formats

#### 3.2 Question 2: Data Validation (`src/utils/validation/dataValidator.ts`)
- [ ] Validate positive deposits
- [ ] Check logical account balances
- [ ] Age range validation (18-120)
- [ ] Customer consistency validation
- [ ] Invalid record filtering with detailed logging

#### 3.3 Question 3: Edge Case Management (`src/utils/validation/edgeCaseHandler.ts`)
- [ ] Handle inconsistent customer ages
- [ ] Account balance reconciliation
- [ ] Duplicate transaction detection and removal

### Phase 4: Part 2 - Business Logic & Analysis (Day 3-4)

#### 4.1 Question 4: Business Metrics (`src/utils/calculations/businessMetrics.ts`)
- [ ] **getMonthlyVolumeByBranch()**: Branch performance analysis
- [ ] **detectAnomalousTransactions()**: Unusual pattern detection
- [ ] **calculateCustomerLTV()**: Customer lifetime value calculation

#### 4.2 Question 5: Strategic Analysis (`src/utils/calculations/strategicAnalysis.ts`)
- [ ] Underperforming branch identification
- [ ] High-value customer segmentation
- [ ] Seasonal trend analysis algorithms

### Phase 5: Part 3 - Performance & Visualization (Day 4-5)

#### 5.1 Question 6: Performance Optimization (`src/utils/performance/`)
- [ ] Identify bottlenecks for 10M+ records
- [ ] Implement data structure optimizations
- [ ] Memory-efficient processing strategies
- [ ] Lazy loading and pagination

#### 5.2 Question 7: Visualization Components (`src/components/Charts/`)
- [ ] **Visualization 1**: Branch Performance Dashboard (Horizontal Bar)
- [ ] **Visualization 2**: Transaction Volume Trends (Line Chart)
- [ ] **Visualization 3**: Customer Segmentation (Scatter Plot)
- [ ] **Visualization 4**: Account Type Distribution (Pie Chart)
- [ ] **Visualization 5**: Anomaly Detection Heatmap

#### 5.3 Question 8: Real-Time Architecture Design (`docs/architecture.md`)
- [ ] Document current limitations
- [ ] Propose real-time system design
- [ ] Technology stack recommendations
- [ ] Data flow modifications

### Phase 6: UI/UX Implementation (Day 5-6)

#### 6.1 Dashboard Components
- [ ] Main dashboard layout
- [ ] Filter and search functionality
- [ ] Interactive chart components
- [ ] Data export capabilities

#### 6.2 Error Handling & Loading States
- [ ] Graceful error boundaries
- [ ] Loading indicators
- [ ] Empty state handling
- [ ] User feedback systems

### Phase 7: Testing & Quality Assurance (Day 6-7)

#### 7.1 Unit Testing
- [ ] Data processing functions
- [ ] Validation logic
- [ ] Business calculation accuracy
- [ ] Component rendering

#### 7.2 Integration Testing
- [ ] CSV parsing pipeline
- [ ] Chart data flow
- [ ] User interaction flows

#### 7.3 Performance Testing
- [ ] Large dataset processing
- [ ] Memory usage optimization
- [ ] Rendering performance

### Phase 8: Documentation & Submission (Day 7)

#### 8.1 Code Documentation
- [ ] Comprehensive JSDoc comments
- [ ] README with setup instructions
- [ ] Architecture decisions documentation
- [ ] Business logic explanations

#### 8.2 Submission Preparation
- [ ] Code quality review
- [ ] TypeScript strict compliance
- [ ] Error handling verification
- [ ] Performance optimization validation

## Assessment Criteria Focus

### Code Quality (25%)
- TypeScript typing precision
- Clear variable naming
- Comprehensive comments
- Modular architecture

### Error Handling (20%)
- Edge case coverage
- Invalid data scenarios
- Graceful degradation
- User-friendly error messages

### Performance (20%)
- Large dataset efficiency
- Memory optimization
- Rendering performance
- Scalable algorithms

### Business Context (20%)
- Banking domain understanding
- Meaningful insights
- Strategic value
- Financial logic accuracy

### Testing Strategy (15%)
- Unit test coverage
- Integration scenarios
- Performance benchmarks
- Edge case validation

## Deliverables Checklist

- [ ] Fully functional React TypeScript application
- [ ] All 8 questions implemented and documented
- [ ] 5 key visualizations with business insights
- [ ] Comprehensive error handling
- [ ] Performance optimizations
- [ ] Test suite with good coverage
- [ ] Clear documentation and setup instructions
- [ ] GitHub repository with clean commit history

## Submission Guidelines

1. **GitHub Classroom**: Submit via private repository
2. **Code Quality**: TypeScript strict mode, clear naming, comments
3. **Error Handling**: Address edge cases and invalid data
4. **Performance**: Optimize for large datasets
5. **Business Context**: Explain banking/finance decisions
6. **Testing**: Describe testing implementation strategy

---

**Timeline**: 7 days total
**Primary Focus**: Data integrity, business insights, scalable architecture
**Success Metrics**: Functional dashboard, clean code, performance optimization, comprehensive testing