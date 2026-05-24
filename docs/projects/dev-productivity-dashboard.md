# Developer Productivity Dashboard — Technical Documentation

## 1. Project Overview

**Role**: AI/Data Engineer  
**Duration**: 2025  
**Organization**: Wipro  
**Scale**: 500+ developers tracked, real-time data pipelines

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Data Sources                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐     │
│  │  GitHub  │  │   Jira   │  │  Surveys │  │   CI/CD    │     │
│  │   API    │  │   API    │  │  (NPS)   │  │  Systems   │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └─────┬──────┘     │
│       │              │              │              │           │
└───────┼──────────────┼──────────────┼──────────────┼───────────┘
        │              │              │              │
┌───────▼──────────────▼──────────────▼──────────────▼───────────┐
│                     Data Pipeline Layer                         │
│                                                                 │
│  1. Data Extraction                                              │
│     └── Python scripts (cron/GitHub Actions)                    │
│     └── GitHub REST API + GraphQL                               │
│     └── Jira REST API                                           │
│                                                                 │
│  2. Data Transformation                                         │
│     └── Pandas dataframes                                       │
│     └── Normalize across sources                                │
│     └── Calculate derived metrics                               │
│                                                                 │
│  3. Data Loading                                                │
│     └── PostgreSQL (aggregated metrics)                         │
│     └── Redis (real-time counters)                              │
│                                                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    API Layer (FastAPI)                           │
│  ┌────────┐  ┌────────────┐  ┌────────┐  ┌────────────────┐   │
│  │ Metric │  │ Dashboard  │  │ Report │  │  WebSocket     │   │
│  │ Endpts │  │   Config   │  │ Export │  │  (Real-time)   │   │
│  └────────┘  └────────────┘  └────────┘  └────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Frontend (React)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Dashboard   │  │  Trends      │  │  Team Comparison     │  │
│  │  View        │  │  Charts      │  │  View                │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Role-based  │  │  Export      │  │  Settings & Config   │  │
│  │  Access      │  │  (CSV/PDF)  │  │  View                │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Data Pipeline Implementation

### 3.1 GitHub Data Extraction

```python
# GitHub API data extraction
import requests
from datetime import datetime, timedelta
import pandas as pd

class GitHubMetricsExtractor:
    def __init__(self, token, org):
        self.token = token
        self.org = org
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json"
        }

    def get_pull_requests(self, repo, since_days=30):
        """Extract PR metrics for a repository."""
        since = (datetime.now() - timedelta(days=since_days)).isoformat()
        url = f"{self.base_url}/repos/{self.org}/{repo}/pulls"
        params = {
            "state": "all",
            "sort": "updated",
            "direction": "desc",
            "per_page": 100,
            "since": since
        }

        prs = []
        page = 1
        while True:
            params["page"] = page
            resp = requests.get(url, headers=self.headers, params=params)
            if resp.status_code != 200:
                break
            data = resp.json()
            if not data:
                break
            prs.extend(data)
            page += 1

        return self._transform_prs(prs)

    def _transform_prs(self, raw_prs):
        """Transform raw PR data into metrics."""
        records = []
        for pr in raw_prs:
            created = datetime.fromisoformat(pr["created_at"].replace("Z", ""))
            merged = None
            if pr.get("merged_at"):
                merged = datetime.fromisoformat(pr["merged_at"].replace("Z", ""))

            cycle_time = None
            if merged and created:
                cycle_time = (merged - created).total_seconds() / 3600  # hours

            records.append({
                "pr_number": pr["number"],
                "repo": pr["base"]["repo"]["name"],
                "author": pr["user"]["login"],
                "created_at": created,
                "merged_at": merged,
                "cycle_time_hours": cycle_time,
                "additions": pr.get("additions", 0),
                "deletions": pr.get("deletions", 0),
                "changed_files": pr.get("changed_files", 0),
                "state": pr["state"],
            })

        return pd.DataFrame(records)
```

### 3.2 Metrics Calculation

```python
# Metrics calculation engine
class MetricsCalculator:
    def __init__(self, df_prs, df_deployments):
        self.df_prs = df_prs
        self.df_deployments = df_deployments

    def calculate_cycle_time(self, group_by="team"):
        """Calculate average cycle time by team."""
        return (
            self.df_prs
            .groupby(group_by)["cycle_time_hours"]
            .agg(["mean", "median", "std"])
            .round(2)
        )

    def calculate_pr_throughput(self, group_by="team"):
        """Calculate PRs merged per developer per week."""
        df = self.df_prs.copy()
        df["week"] = df["merged_at"].dt.isocalendar().week
        return (
            df[df["state"] == "merged"]
            .groupby([group_by, "week"])["pr_number"]
            .count()
            .reset_index()
            .rename(columns={"pr_number": "pr_count"})
        )

    def calculate_deployment_frequency(self, group_by="team"):
        """Calculate deployments per day."""
        df = self.df_deployments.copy()
        df["date"] = df["deployed_at"].dt.date
        return (
            df.groupby([group_by, "date"])
            .size()
            .reset_index(name="deployments")
            .groupby(group_by)["deployments"]
            .mean()
            .round(2)
        )

    def calculate_copilot_acceptance_rate(self, df_copilot):
        """Calculate Copilot suggestion acceptance rate."""
        return (
            df_copilot["acceptances"].sum() /
            df_copilot["suggestions"].sum() * 100
        )
```

### 3.3 Data Pipeline Orchestration

```yaml
# .github/workflows/metrics-pipeline.yml
name: Metrics Pipeline
on:
  schedule:
    - cron: "0 6 * * *"   # Daily at 6 AM UTC
  workflow_dispatch:       # Manual trigger

jobs:
  run-pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Extract GitHub metrics
        run: python extractors/github_metrics.py
        env:
          GITHUB_TOKEN: ${{ secrets.GH_METRICS_TOKEN }}
          ORG_NAME: ${{ vars.ORG_NAME }}

      - name: Calculate metrics
        run: python calculators/metrics_engine.py

      - name: Load to database
        run: python loaders/db_loader.py
        env:
          DB_URL: ${{ secrets.DB_URL }}

      - name: Refresh dashboard cache
        run: python cache/dashboard_cache.py
        env:
          REDIS_URL: ${{ secrets.REDIS_URL }}
```

## 4. Dashboard Features

### 4.1 Dashboard Views

**Overview View** (Engineering Managers):
- 4 KPI cards: PR Cycle Time, Deployment Frequency, Copilot Acceptance, Developer NPS
- Trend charts (last 30/90 days)
- Team comparison table
- Alerts for regressions

**Team View** (Team Leads):
- Team-specific metrics
- Individual contributor breakdown
- PR review workload distribution
- Code quality metrics (merge conflict rate, rework rate)

**Individual View** (Developers):
- Personal metrics (PRs merged, cycle time)
- Copilot usage stats
- Skill improvement trends
- Comparing against team average (anonymous)

### 4.2 Frontend Component (Simplified)

```typescript
// React dashboard component structure
interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title, value, unit, trend, change
}) => (
  <div className="metric-card">
    <h3>{title}</h3>
    <div className="value">
      {value.toFixed(1)}<span className="unit">{unit}</span>
    </div>
    <div className={`trend ${trend}`}>
      {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
      {' '}{Math.abs(change)}%
    </div>
  </div>
);

// Trend chart using Chart.js
const TrendChart: React.FC<{
  data: Array<{ date: string; value: number }>;
  metric: string;
  period: string;
}> = ({ data, metric, period }) => {
  const chartRef = useRef<Chart>(null);

  useEffect(() => {
    const ctx = document.getElementById('trend-chart') as HTMLCanvasElement;
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: metric,
          data: data.map(d => d.value),
          borderColor: '#6366f1',
          tension: 0.3,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { display: true },
          y: { beginAtZero: false },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [data]);

  return <canvas id="trend-chart" />;
};
```

## 5. API Endpoints

```yaml
# FastAPI endpoints
endpoints:
  - path: /api/v1/metrics/overview
    method: GET
    description: Summary KPIs for dashboard overview
    response:
      cycle_time_avg: number
      deployment_freq: number
      copilot_acceptance: number
      dev_satisfaction: number

  - path: /api/v1/metrics/team/{team_id}
    method: GET
    description: Team-specific metrics
    query_params:
      days: integer (default: 30)
    response:
      team_name: string
      cycle_time: { avg, median, p95 }
      pr_throughput: number
      deployments: number

  - path: /api/v1/metrics/trends
    method: GET
    description: Time series data for charts
    query_params:
      metric: string
      days: integer
    response:
      data: Array<{ date: string; value: number }>

  - path: /api/v1/reports/weekly
    method: POST
    description: Generate and send weekly report
    response:
      status: string
      report_url: string
```

## 6. Key Insights Generated

### 6.1 Correlation Analysis

The dashboard enabled the following insights:

```python
# Statistical analysis of Copilot impact
import scipy.stats as stats

def analyze_copilot_impact(before_data, after_data):
    """
    Compare metrics before and after Copilot adoption.
    Uses paired t-test for significance.
    """
    t_stat, p_value = stats.ttest_rel(before_data, after_data)

    effect_size = (
        np.mean(after_data) - np.mean(before_data)
    ) / np.std(before_data)

    return {
        "before_mean": np.mean(before_data),
        "after_mean": np.mean(after_data),
        "change_pct": (
            (np.mean(after_data) - np.mean(before_data))
            / np.mean(before_data) * 100
        ),
        "p_value": p_value,
        "significant": p_value < 0.05,
        "effect_size": effect_size,
    }

# Results
# PR Cycle Time: -25% (p < 0.001, significant)
# Deployment Frequency: +47% (p < 0.001, significant)
# Defect Rate: -3% (p = 0.42, not significant)
# Code Review Time: -18% (p < 0.01, significant)
```

## 7. Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| GitHub API rate limiting | Implemented pagination and caching; batch requests with GraphQL |
| Data normalization across teams | Standardized repo naming conventions and labels |
| Privacy concerns with individual metrics | Aggregated data at team level; individual view requires opt-in |
| Dashboard performance with large datasets | Pre-aggregated Materialized Views + Redis caching |
| Maintaining historical data for trend analysis | Weekly snapshots stored in dedicated analytics schema |

## 8. Key Learnings

1. **Define metrics before building dashboards**: Without clear metrics, dashboards are just decoration
2. **Baseline data is essential**: Can't measure improvement without before/after comparison
3. **Privacy by design**: Aggregate data at appropriate levels; individual tracking requires consent
4. **Automate everything**: Manual data collection doesn't scale; invest in pipelines early
5. **Correlation ≠ causation**: Copilot adoption correlates with productivity gains, but other factors exist

---

*This document serves as a portfolio reference. Implementation specifics are proprietary to Wipro.*
