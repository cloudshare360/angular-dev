# Week 5, Day 6: Performance Testing

## 📋 Objectives
- ✅ Implement automated performance testing
- ✅ Set up Lighthouse CI for performance monitoring
- ✅ Create performance budgets and alerts
- ✅ Optimize bundle size and loading performance
- ✅ Monitor Core Web Vitals
- ✅ Set up performance regression detection

---

## 📚 Key Topics

### 1. Lighthouse CI Setup

#### Configuration
```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4200',
        'http://localhost:4200/about',
        'http://localhost:4200/services',
        'http://localhost:4200/portfolio'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox',
        formFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1
        }
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.9 }]
      }
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: 'https://your-lhci-server.com',
      token: process.env.LHCI_TOKEN
    }
  }
};
```

#### Performance Budget
```json
{
  "path": "/*",
  "timings": [
    {
      "metric": "first-contentful-paint",
      "budget": 2000
    },
    {
      "metric": "largest-contentful-paint",
      "budget": 2500
    },
    {
      "metric": "cumulative-layout-shift",
      "budget": 0.1
    },
    {
      "metric": "total-blocking-time",
      "budget": 300
    }
  ],
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 400
    },
    {
      "resourceType": "total",
      "budget": 1600
    }
  ],
  "resourceCounts": [
    {
      "resourceType": "third-party",
      "budget": 10
    }
  ]
}
```

### 2. Bundle Analysis and Optimization

#### Bundle Analysis Script
```typescript
// scripts/analyze-bundle.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface BundleStats {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzipped: number;
  }>;
  warnings: string[];
}

class BundleAnalyzer {
  private readonly sizeLimit = {
    main: 2000000, // 2MB
    polyfills: 100000, // 100KB
    vendor: 3000000 // 3MB
  };

  async analyze(): Promise<BundleStats> {
    // Build with source maps for analysis
    execSync('ng build --source-map --named-chunks', { stdio: 'inherit' });

    const distPath = path.join(process.cwd(), 'dist');
    const stats = await this.getStats(distPath);
    
    this.checkSizeLimits(stats);
    this.generateReport(stats);
    
    return stats;
  }

  private async getStats(distPath: string): Promise<BundleStats> {
    const files = fs.readdirSync(distPath);
    const jsFiles = files.filter(file => file.endsWith('.js') && !file.endsWith('.map'));
    
    let totalSize = 0;
    let gzippedSize = 0;
    const chunks: BundleStats['chunks'] = [];

    for (const file of jsFiles) {
      const filePath = path.join(distPath, file);
      const size = fs.statSync(filePath).size;
      const gzipped = this.getGzippedSize(filePath);
      
      totalSize += size;
      gzippedSize += gzipped;
      
      chunks.push({
        name: file,
        size,
        gzipped
      });
    }

    return {
      totalSize,
      gzippedSize,
      chunks: chunks.sort((a, b) => b.size - a.size),
      warnings: []
    };
  }

  private getGzippedSize(filePath: string): number {
    const gzipSync = require('zlib').gzipSync;
    const content = fs.readFileSync(filePath);
    return gzipSync(content).length;
  }

  private checkSizeLimits(stats: BundleStats): void {
    stats.chunks.forEach(chunk => {
      const chunkType = this.getChunkType(chunk.name);
      const limit = this.sizeLimit[chunkType as keyof typeof this.sizeLimit];
      
      if (limit && chunk.size > limit) {
        stats.warnings.push(
          `⚠️ ${chunk.name} (${this.formatSize(chunk.size)}) exceeds limit (${this.formatSize(limit)})`
        );
      }
    });

    if (stats.totalSize > 5000000) { // 5MB total limit
      stats.warnings.push(
        `⚠️ Total bundle size (${this.formatSize(stats.totalSize)}) exceeds 5MB limit`
      );
    }
  }

  private getChunkType(filename: string): string {
    if (filename.includes('polyfills')) return 'polyfills';
    if (filename.includes('vendor')) return 'vendor';
    if (filename.includes('main')) return 'main';
    return 'other';
  }

  private generateReport(stats: BundleStats): void {
    console.log('\n📊 Bundle Analysis Report\n');
    console.log(`Total Size: ${this.formatSize(stats.totalSize)}`);
    console.log(`Gzipped Size: ${this.formatSize(stats.gzippedSize)}\n`);

    console.log('📦 Chunks:');
    stats.chunks.forEach(chunk => {
      console.log(`  ${chunk.name}: ${this.formatSize(chunk.size)} (${this.formatSize(chunk.gzipped)} gzipped)`);
    });

    if (stats.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      stats.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    // Save report to file
    fs.writeFileSync('bundle-report.json', JSON.stringify(stats, null, 2));
  }

  private formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// Run analysis
new BundleAnalyzer().analyze().catch(console.error);
```

### 3. Core Web Vitals Monitoring

#### Web Vitals Service
```typescript
// src/app/core/services/web-vitals.service.ts
import { Injectable } from '@angular/core';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export interface VitalsReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebVitalsService {
  private vitalsData: VitalsReport[] = [];

  startMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    getCLS(this.onVitalsMeasured.bind(this));
    getFID(this.onVitalsMeasured.bind(this));
    getFCP(this.onVitalsMeasured.bind(this));
    getLCP(this.onVitalsMeasured.bind(this));
    getTTFB(this.onVitalsMeasured.bind(this));

    // Custom performance observers
    this.observeResourceTiming();
    this.observeNavigationTiming();
  }

  private onVitalsMeasured(metric: any): void {
    const report: VitalsReport = {
      name: metric.name,
      value: metric.value,
      rating: this.getRating(metric.name, metric.value),
      delta: metric.delta,
      id: metric.id,
      timestamp: Date.now()
    };

    this.vitalsData.push(report);
    this.sendToAnalytics(report);

    // Log poor performance
    if (report.rating === 'poor') {
      console.warn(`Poor ${metric.name} detected:`, report);
    }
  }

  private getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      'CLS': [0.1, 0.25],
      'FID': [100, 300],
      'FCP': [1800, 3000],
      'LCP': [2500, 4000],
      'TTFB': [800, 1800]
    };

    const [good, poor] = thresholds[name as keyof typeof thresholds] || [0, 0];
    
    if (value <= good) return 'good';
    if (value <= poor) return 'needs-improvement';
    return 'poor';
  }

  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            this.analyzeResourceTiming(entry as PerformanceResourceTiming);
          }
        }
      });

      observer.observe({ type: 'resource', buffered: true });
    }
  }

  private observeNavigationTiming(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.analyzeNavigationTiming(entry as PerformanceNavigationTiming);
          }
        }
      });

      observer.observe({ type: 'navigation', buffered: true });
    }
  }

  private analyzeResourceTiming(entry: PerformanceResourceTiming): void {
    const slowThreshold = 2000; // 2 seconds
    
    if (entry.duration > slowThreshold) {
      console.warn('Slow resource detected:', {
        name: entry.name,
        duration: entry.duration,
        size: entry.transferSize
      });
    }
  }

  private analyzeNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      connection: entry.connectEnd - entry.connectStart,
      request: entry.responseStart - entry.requestStart,
      response: entry.responseEnd - entry.responseStart,
      domProcessing: entry.domContentLoadedEventStart - entry.responseEnd,
      domComplete: entry.domComplete - entry.domContentLoadedEventStart
    };

    this.sendNavigationMetrics(metrics);
  }

  private sendToAnalytics(report: VitalsReport): void {
    // Send to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', report.name, {
        event_category: 'Web Vitals',
        value: Math.round(report.value),
        event_label: report.id,
        custom_map: { metric_rating: report.rating }
      });
    }

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(report);
  }

  private sendNavigationMetrics(metrics: Record<string, number>): void {
    fetch('/api/performance-metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'navigation',
        metrics,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(console.error);
  }

  private sendToCustomAnalytics(report: VitalsReport): void {
    fetch('/api/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    }).catch(console.error);
  }

  getVitalsData(): VitalsReport[] {
    return [...this.vitalsData];
  }
}
```

### 4. Load Testing

#### Load Testing Script
```typescript
// scripts/load-test.ts
import { chromium } from 'playwright';

interface LoadTestConfig {
  url: string;
  concurrent: number;
  duration: number; // seconds
  scenarios: TestScenario[];
}

interface TestScenario {
  name: string;
  weight: number; // percentage
  actions: TestAction[];
}

interface TestAction {
  type: 'navigate' | 'click' | 'type' | 'wait';
  selector?: string;
  value?: string;
  timeout?: number;
}

class LoadTester {
  private results: LoadTestResult[] = [];

  async runLoadTest(config: LoadTestConfig): Promise<void> {
    console.log(`🚀 Starting load test with ${config.concurrent} concurrent users for ${config.duration}s`);

    const startTime = Date.now();
    const endTime = startTime + (config.duration * 1000);
    const promises: Promise<void>[] = [];

    for (let i = 0; i < config.concurrent; i++) {
      promises.push(this.runUserSession(config, endTime, i));
    }

    await Promise.all(promises);
    this.generateReport();
  }

  private async runUserSession(config: LoadTestConfig, endTime: number, userId: number): Promise<void> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      while (Date.now() < endTime) {
        const scenario = this.selectScenario(config.scenarios);
        await this.executeScenario(page, config.url, scenario, userId);
      }
    } catch (error) {
      console.error(`User ${userId} error:`, error);
    } finally {
      await browser.close();
    }
  }

  private selectScenario(scenarios: TestScenario[]): TestScenario {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const scenario of scenarios) {
      cumulative += scenario.weight;
      if (random <= cumulative) {
        return scenario;
      }
    }

    return scenarios[0];
  }

  private async executeScenario(page: any, baseUrl: string, scenario: TestScenario, userId: number): Promise<void> {
    const startTime = Date.now();

    try {
      for (const action of scenario.actions) {
        await this.executeAction(page, baseUrl, action);
      }

      const duration = Date.now() - startTime;
      this.results.push({
        userId,
        scenario: scenario.name,
        duration,
        success: true,
        timestamp: startTime
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        userId,
        scenario: scenario.name,
        duration,
        success: false,
        error: error.message,
        timestamp: startTime
      });
    }
  }

  private async executeAction(page: any, baseUrl: string, action: TestAction): Promise<void> {
    switch (action.type) {
      case 'navigate':
        await page.goto(baseUrl + (action.value || ''));
        break;
      case 'click':
        if (action.selector) {
          await page.click(action.selector);
        }
        break;
      case 'type':
        if (action.selector && action.value) {
          await page.fill(action.selector, action.value);
        }
        break;
      case 'wait':
        await page.waitForTimeout(action.timeout || 1000);
        break;
    }
  }

  private generateReport(): void {
    const totalRequests = this.results.length;
    const successfulRequests = this.results.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const successRate = (successfulRequests / totalRequests) * 100;

    const durations = this.results.filter(r => r.success).map(r => r.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const p95Duration = this.percentile(durations, 95);
    const p99Duration = this.percentile(durations, 99);

    console.log('\n📊 Load Test Results\n');
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful: ${successfulRequests} (${successRate.toFixed(2)}%)`);
    console.log(`Failed: ${failedRequests}`);
    console.log(`Average Response Time: ${avgDuration.toFixed(2)}ms`);
    console.log(`95th Percentile: ${p95Duration.toFixed(2)}ms`);
    console.log(`99th Percentile: ${p99Duration.toFixed(2)}ms`);

    // Scenario breakdown
    const scenarioStats = this.getScenarioStats();
    console.log('\n📈 Scenario Breakdown:');
    Object.entries(scenarioStats).forEach(([scenario, stats]) => {
      console.log(`  ${scenario}: ${stats.count} requests, ${stats.avgDuration.toFixed(2)}ms avg`);
    });

    // Save detailed results
    require('fs').writeFileSync('load-test-results.json', JSON.stringify(this.results, null, 2));
  }

  private percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private getScenarioStats(): Record<string, { count: number; avgDuration: number }> {
    const stats: Record<string, { count: number; totalDuration: number }> = {};

    this.results.filter(r => r.success).forEach(result => {
      if (!stats[result.scenario]) {
        stats[result.scenario] = { count: 0, totalDuration: 0 };
      }
      stats[result.scenario].count++;
      stats[result.scenario].totalDuration += result.duration;
    });

    return Object.fromEntries(
      Object.entries(stats).map(([scenario, data]) => [
        scenario,
        {
          count: data.count,
          avgDuration: data.totalDuration / data.count
        }
      ])
    );
  }
}

interface LoadTestResult {
  userId: number;
  scenario: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: number;
}

// Usage
const config: LoadTestConfig = {
  url: 'http://localhost:4200',
  concurrent: 10,
  duration: 60,
  scenarios: [
    {
      name: 'homepage_visit',
      weight: 40,
      actions: [
        { type: 'navigate', value: '/' },
        { type: 'wait', timeout: 2000 }
      ]
    },
    {
      name: 'browse_services',
      weight: 30,
      actions: [
        { type: 'navigate', value: '/services' },
        { type: 'wait', timeout: 1000 },
        { type: 'click', selector: '.service-card:first-child' },
        { type: 'wait', timeout: 2000 }
      ]
    },
    {
      name: 'contact_form',
      weight: 30,
      actions: [
        { type: 'navigate', value: '/contact' },
        { type: 'type', selector: '#name', value: 'Load Test User' },
        { type: 'type', selector: '#email', value: 'test@example.com' },
        { type: 'type', selector: '#message', value: 'This is a load test message' },
        { type: 'wait', timeout: 1000 }
      ]
    }
  ]
};

new LoadTester().runLoadTest(config).catch(console.error);
```

---

## 🔨 Hands-On Exercise

### Exercise 1: Performance Audit
Run comprehensive performance analysis on all projects.

**Tasks:**
1. Set up Lighthouse CI for all applications
2. Create performance budgets
3. Identify and fix performance bottlenecks
4. Set up automated performance monitoring

### Exercise 2: Core Web Vitals Optimization
Focus on improving Core Web Vitals scores.

**Tasks:**
1. Implement Web Vitals monitoring
2. Optimize Largest Contentful Paint (LCP)
3. Reduce Cumulative Layout Shift (CLS)
4. Minimize First Input Delay (FID)

### Exercise 3: Load Testing Implementation
Set up comprehensive load testing.

**Tasks:**
1. Create realistic user scenarios
2. Test different load levels
3. Identify performance breaking points
4. Create load testing CI/CD integration

---

## ✅ Performance Best Practices

### Optimization Strategies
- Implement lazy loading for routes and components
- Use OnPush change detection strategy
- Optimize bundle splitting and tree shaking
- Implement effective caching strategies

### Monitoring and Alerting
- Set up real-time performance monitoring
- Create alerts for performance regressions
- Monitor performance across different devices
- Track performance over time

---

## 📚 Resources

- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [Angular Performance Guide](https://angular.io/guide/performance-checklist)

---

## 🎯 Daily Checklist

- [ ] Set up Lighthouse CI with performance budgets
- [ ] Implement Web Vitals monitoring
- [ ] Create bundle analysis automation
- [ ] Set up load testing framework
- [ ] Optimize Core Web Vitals scores
- [ ] Configure performance alerts
- [ ] Document performance optimization strategies
- [ ] Integrate performance testing into CI/CD
- [ ] Commit with message: "perf: comprehensive performance testing and monitoring"

---

**Next**: [Day 7 - Code Quality & Documentation →](../Day-07-Code-Quality/README.md)

**Previous**: [← Day 5 - Deployment Strategies](../Day-05-Deployment-Strategies/README.md)