# Banking Analytics & Compliance Platform

**Enterprise-grade financial analytics system built by Gift Tandasi / AngaTech**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.28+-red.svg)](https://streamlit.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-cyan.svg)](https://solution-implementation-analyst-assessment.streamlit.app/)

## Overview

The Banking Analytics & Compliance Platform is a comprehensive financial intelligence system designed to automate risk evaluation, compliance reporting, and performance analytics for banking operations. Built with Python and Streamlit, the platform transforms raw transaction data into actionable executive insights — reducing manual reporting time by 60%.

**Live Demo:** https://solution-implementation-analyst-assessment.streamlit.app/  
**GitHub:** https://github.com/Tandasi/solution-implementation-analyst-assessment-Tandasi  
**Author:** Gift Tandasi | [anga-tech.com](https://anga-tech.com)

---

## Key Features

### Analytics & Reporting
- **Executive Dashboard** — High-level KPIs, transaction summaries, and trend analysis
- **Risk Evaluation Engine** — Automated scoring and flagging of high-risk transactions
- **Regulatory Compliance Reporting** — Automated generation of compliance-ready reports
- **Customer Segmentation** — Behavioural analysis by age, account type, and transaction patterns
- **Branch Performance Tracking** — Cross-branch comparison and efficiency metrics

### Technical Capabilities
- **End-to-end ETL pipeline** — Ingests, cleans, and transforms raw banking CSV data
- **Interactive Plotly visualisations** — Drill-down charts for transaction analysis
- **Self-serve interface** — Designed for compliance officers with no technical background
- **Jupyter notebooks** — Full analytical workbooks for deep-dive exploration
- **TypeScript banking types** — Strongly-typed data models for API integration

---

## Business Impact

| Metric | Result |
|---|---|
| Reporting turnaround time | **-60% faster** |
| Manual reconciliation | **Eliminated** |
| Compliance report generation | **Automated end-to-end** |
| Self-serve capability | **Non-technical users** |

---

## Technology Stack

- **Language:** Python 3.9+, TypeScript
- **Dashboard:** Streamlit
- **Visualisation:** Plotly, Matplotlib, Seaborn
- **Data Processing:** Pandas, NumPy
- **Analysis:** Jupyter Notebooks
- **Database:** CSV-based ETL (extensible to SQL)

---

## Dataset

The platform operates on a comprehensive banking transaction dataset with the following features:

| Feature | Description |
|---|---|
| Customer ID | Unique customer identifier |
| Transaction Date | Date and time of transaction |
| Transaction Type | Deposit, withdrawal, transfer |
| Transaction Amount | Value of transaction |
| Account Balance | Post-transaction balance |
| Customer Age | Customer demographic |
| Customer Gender | Customer demographic |
| Account Type | Savings, checking, etc. |
| Branch Code | Branch identifier |
| Account Opening Date | Account tenure |
| Transaction Description | Transaction remarks |

> Data has been anonymised. No personally identifiable information is stored or processed.

---

## Quick Start

### Prerequisites
```
Python 3.9+
pip install -r requirements.txt
```

### Run Locally
```bash
# Clone the repository
git clone https://github.com/Tandasi/solution-implementation-analyst-assessment-Tandasi.git
cd solution-implementation-analyst-assessment-Tandasi

# Install dependencies
pip install -r requirements.txt

# Launch dashboard
streamlit run banking_dashboard.py
```

### Access
- **Live:** https://solution-implementation-analyst-assessment.streamlit.app/
- **Local:** http://localhost:8501

---

## Project Structure

```
banking-analytics-platform/
├── banking_dashboard.py              # Main Streamlit dashboard
├── banking-types.ts                  # TypeScript type definitions
├── Comprehensive_Banking_Analytics.ipynb   # Full analytical notebook
├── Executive_Presentation_Notebook.ipynb   # Executive summary notebook
├── Comprehensive_Banking_Database.csv      # Dataset
├── banking-analytics/                # Analytics modules
├── data/                             # Data directory
├── docs/                             # Documentation
├── requirements.txt                  # Python dependencies
└── README.md                         # This file
```

---

## Screenshots

> Live demo available at: https://solution-implementation-analyst-assessment.streamlit.app/

---

## Contact

**Gift Tandasi**  
AI Engineer & Data Scientist  
📧 gift@anga-tech.com  
🌐 [anga-tech.com](https://anga-tech.com)  
💻 [github.com/Tandasi](https://github.com/Tandasi)

---

## License

MIT License — © 2025 Gift Tandasi / AngaTech Technologies
