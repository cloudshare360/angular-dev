# Week 5, Day 5: Deployment Strategies

## 📋 Objectives
- ✅ Master multiple deployment strategies
- ✅ Implement blue-green deployments
- ✅ Set up feature flags and A/B testing
- ✅ Configure rollback mechanisms
- ✅ Deploy to multiple cloud platforms
- ✅ Implement database migration strategies

---

## 📚 Key Topics

### 1. Multi-Platform Deployment

#### Firebase Hosting
```bash
# Deploy to Firebase with environments
firebase deploy --only hosting --project staging
firebase deploy --only hosting --project production

# Deploy to hosting channels
firebase hosting:channel:deploy feature-branch --project staging
firebase hosting:channel:deploy pr-123 --project staging
```

#### Netlify Deployment
```yaml
# netlify.toml
[build]
  command = "npm run build:prod"
  publish = "dist/app"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.staging]
  command = "npm run build:staging"

[context.production]
  command = "npm run build:prod"
```

#### Vercel Deployment
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/app"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. Blue-Green Deployment Strategy

#### Blue-Green with Firebase
```typescript
// scripts/blue-green-deploy.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface DeploymentConfig {
  project: string;
  blueChannel: string;
  greenChannel: string;
  healthCheckUrl: string;
}

class BlueGreenDeployment {
  constructor(private config: DeploymentConfig) {}

  async deploy(version: string): Promise<void> {
    try {
      // Deploy to green environment
      console.log('🚀 Deploying to green environment...');
      await this.deployToChannel(this.config.greenChannel, version);

      // Health check
      console.log('🔍 Running health checks...');
      await this.runHealthChecks(this.config.greenChannel);

      // Switch traffic
      console.log('🔄 Switching traffic to green...');
      await this.switchTraffic();

      // Cleanup old blue deployment
      console.log('🧹 Cleaning up blue environment...');
      await this.cleanupOldDeployment();

      console.log('✅ Blue-green deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      await this.rollback();
      throw error;
    }
  }

  private async deployToChannel(channel: string, version: string): Promise<void> {
    const command = `firebase hosting:channel:deploy ${channel} --project ${this.config.project}`;
    await execAsync(command);
  }

  private async runHealthChecks(channel: string): Promise<void> {
    const channelUrl = `https://${this.config.project}--${channel}-${Math.random().toString(36).substring(7)}.web.app`;
    
    const healthChecks = [
      this.checkEndpoint(`${channelUrl}/health`),
      this.checkEndpoint(`${channelUrl}/api/status`),
      this.runSmokeTests(channelUrl)
    ];

    await Promise.all(healthChecks);
  }

  private async checkEndpoint(url: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Health check failed for ${url}: ${response.status}`);
    }
  }

  private async runSmokeTests(baseUrl: string): Promise<void> {
    const command = `npm run test:smoke -- --baseUrl=${baseUrl}`;
    await execAsync(command);
  }

  private async switchTraffic(): Promise<void> {
    // Update Firebase hosting to point to green channel
    const command = `firebase hosting:channel:open ${this.config.greenChannel} --project ${this.config.project}`;
    await execAsync(command);
  }

  private async rollback(): Promise<void> {
    console.log('🔙 Rolling back to blue environment...');
    const command = `firebase hosting:channel:open ${this.config.blueChannel} --project ${this.config.project}`;
    await execAsync(command);
  }

  private async cleanupOldDeployment(): Promise<void> {
    // Keep blue as backup, clean up older deployments
    const command = `firebase hosting:channel:list --project ${this.config.project}`;
    await execAsync(command);
  }
}

// Usage
const deployment = new BlueGreenDeployment({
  project: 'your-project-id',
  blueChannel: 'blue',
  greenChannel: 'green',
  healthCheckUrl: 'https://your-app.com/health'
});

deployment.deploy(process.env.RELEASE_VERSION || '1.0.0');
```

### 3. Feature Flags Implementation

#### Feature Flag Service
```typescript
// src/app/core/services/feature-flags.service.ts
import { Injectable, inject } from '@angular/core';
import { RemoteConfig, getRemoteConfig, getValue } from '@angular/fire/remote-config';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FeatureFlags {
  newCheckoutFlow: boolean;
  enhancedSearch: boolean;
  darkModeToggle: boolean;
  betaFeatures: boolean;
  maintenanceMode: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FeatureFlagsService {
  private remoteConfig = inject(RemoteConfig);
  private flags$ = new BehaviorSubject<FeatureFlags>(this.getDefaultFlags());

  constructor() {
    this.initializeRemoteConfig();
  }

  getFlags(): Observable<FeatureFlags> {
    return this.flags$.asObservable();
  }

  isFeatureEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags$.value[feature];
  }

  private async initializeRemoteConfig(): Promise<void> {
    try {
      // Set defaults
      await this.remoteConfig.setDefaults(this.getDefaultFlags());
      
      // Fetch and activate
      await this.remoteConfig.fetchAndActivate();
      
      // Update flags
      this.updateFlags();
      
      // Set up periodic refresh
      setInterval(() => this.refreshFlags(), 5 * 60 * 1000); // Every 5 minutes
    } catch (error) {
      console.warn('Failed to initialize remote config:', error);
    }
  }

  private updateFlags(): void {
    const flags: FeatureFlags = {
      newCheckoutFlow: getValue(this.remoteConfig, 'newCheckoutFlow').asBoolean(),
      enhancedSearch: getValue(this.remoteConfig, 'enhancedSearch').asBoolean(),
      darkModeToggle: getValue(this.remoteConfig, 'darkModeToggle').asBoolean(),
      betaFeatures: getValue(this.remoteConfig, 'betaFeatures').asBoolean(),
      maintenanceMode: getValue(this.remoteConfig, 'maintenanceMode').asBoolean()
    };

    this.flags$.next(flags);
  }

  private async refreshFlags(): Promise<void> {
    try {
      await this.remoteConfig.fetchAndActivate();
      this.updateFlags();
    } catch (error) {
      console.warn('Failed to refresh feature flags:', error);
    }
  }

  private getDefaultFlags(): FeatureFlags {
    return {
      newCheckoutFlow: false,
      enhancedSearch: true,
      darkModeToggle: true,
      betaFeatures: false,
      maintenanceMode: false
    };
  }
}
```

#### Feature Flag Directive
```typescript
// src/app/shared/directives/feature-flag.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit } from '@angular/core';
import { FeatureFlagsService, FeatureFlags } from '@/core/services/feature-flags.service';

@Directive({
  selector: '[appFeatureFlag]',
  standalone: true
})
export class FeatureFlagDirective implements OnInit {
  @Input('appFeatureFlag') featureName!: keyof FeatureFlags;
  @Input('appFeatureFlagElse') elseTemplate?: TemplateRef<any>;

  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private featureFlags = inject(FeatureFlagsService);

  ngOnInit() {
    this.featureFlags.getFlags().subscribe(flags => {
      this.updateView(flags[this.featureName]);
    });
  }

  private updateView(isEnabled: boolean): void {
    this.viewContainer.clear();
    
    if (isEnabled) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else if (this.elseTemplate) {
      this.viewContainer.createEmbeddedView(this.elseTemplate);
    }
  }
}
```

### 4. Database Migration Strategies

#### Firestore Migration Service
```typescript
// src/app/core/services/migration.service.ts
import { Injectable, inject } from '@angular/core';
import { Firestore, collection, getDocs, writeBatch, doc } from '@angular/fire/firestore';

interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private firestore = inject(Firestore);

  private migrations: Migration[] = [
    {
      version: '1.0.0',
      description: 'Add user preferences collection',
      up: async () => {
        const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
        const batch = writeBatch(this.firestore);

        usersSnapshot.docs.forEach(userDoc => {
          const preferencesRef = doc(this.firestore, 'user-preferences', userDoc.id);
          batch.set(preferencesRef, {
            theme: 'light',
            notifications: true,
            language: 'en',
            createdAt: new Date()
          });
        });

        await batch.commit();
      },
      down: async () => {
        const preferencesSnapshot = await getDocs(collection(this.firestore, 'user-preferences'));
        const batch = writeBatch(this.firestore);

        preferencesSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
      }
    },
    {
      version: '1.1.0',
      description: 'Update content schema with versioning',
      up: async () => {
        const pagesSnapshot = await getDocs(collection(this.firestore, 'pages'));
        const batch = writeBatch(this.firestore);

        pagesSnapshot.docs.forEach(pageDoc => {
          const data = pageDoc.data();
          batch.update(pageDoc.ref, {
            version: 1,
            lastModified: data.updatedAt || new Date(),
            schema_version: '1.1.0'
          });
        });

        await batch.commit();
      },
      down: async () => {
        const pagesSnapshot = await getDocs(collection(this.firestore, 'pages'));
        const batch = writeBatch(this.firestore);

        pagesSnapshot.docs.forEach(pageDoc => {
          batch.update(pageDoc.ref, {
            version: null,
            lastModified: null,
            schema_version: null
          });
        });

        await batch.commit();
      }
    }
  ];

  async runMigrations(targetVersion?: string): Promise<void> {
    const currentVersion = await this.getCurrentSchemaVersion();
    console.log('Current schema version:', currentVersion);

    const migrationsToRun = this.getMigrationsToRun(currentVersion, targetVersion);
    
    for (const migration of migrationsToRun) {
      console.log(`Running migration ${migration.version}: ${migration.description}`);
      try {
        await migration.up();
        await this.updateSchemaVersion(migration.version);
        console.log(`✅ Migration ${migration.version} completed`);
      } catch (error) {
        console.error(`❌ Migration ${migration.version} failed:`, error);
        throw error;
      }
    }
  }

  async rollbackMigration(version: string): Promise<void> {
    const migration = this.migrations.find(m => m.version === version);
    if (!migration) {
      throw new Error(`Migration ${version} not found`);
    }

    console.log(`Rolling back migration ${version}`);
    await migration.down();
    
    const previousVersion = this.getPreviousVersion(version);
    await this.updateSchemaVersion(previousVersion);
    console.log(`✅ Rollback completed, schema version: ${previousVersion}`);
  }

  private async getCurrentSchemaVersion(): Promise<string> {
    // Implementation to get current schema version from Firestore
    return '0.0.0'; // Default
  }

  private async updateSchemaVersion(version: string): Promise<void> {
    // Implementation to update schema version in Firestore
    const metadataRef = doc(this.firestore, 'metadata', 'schema');
    // Update document with new version
  }

  private getMigrationsToRun(currentVersion: string, targetVersion?: string): Migration[] {
    // Logic to determine which migrations need to run
    return this.migrations.filter(migration => {
      // Compare versions and return migrations that need to run
      return true; // Simplified
    });
  }

  private getPreviousVersion(version: string): string {
    const index = this.migrations.findIndex(m => m.version === version);
    return index > 0 ? this.migrations[index - 1].version : '0.0.0';
  }
}
```

### 5. Monitoring and Alerting

#### Deployment Health Monitoring
```typescript
// src/app/core/services/health-monitor.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    api: boolean;
    database: boolean;
    auth: boolean;
    storage: boolean;
  };
  responseTime: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class HealthMonitorService {
  constructor(private http: HttpClient) {}

  startHealthChecks(): Observable<HealthStatus> {
    return interval(30000).pipe(
      map(() => this.performHealthCheck()),
      catchError(error => {
        console.error('Health check failed:', error);
        return this.getUnhealthyStatus();
      })
    );
  }

  private async performHealthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    const checks = await Promise.allSettled([
      this.checkAPI(),
      this.checkDatabase(),
      this.checkAuth(),
      this.checkStorage()
    ]);

    const responseTime = Date.now() - startTime;
    
    const healthChecks = {
      api: checks[0].status === 'fulfilled',
      database: checks[1].status === 'fulfilled',
      auth: checks[2].status === 'fulfilled',
      storage: checks[3].status === 'fulfilled'
    };

    const healthyCount = Object.values(healthChecks).filter(Boolean).length;
    let status: HealthStatus['status'] = 'healthy';
    
    if (healthyCount === 0) {
      status = 'unhealthy';
    } else if (healthyCount < 4) {
      status = 'degraded';
    }

    return {
      status,
      checks: healthChecks,
      responseTime,
      timestamp: new Date()
    };
  }

  private async checkAPI(): Promise<boolean> {
    try {
      const response = await this.http.get('/api/health').toPromise();
      return response?.status === 'ok';
    } catch {
      return false;
    }
  }

  private async checkDatabase(): Promise<boolean> {
    // Implement database connectivity check
    return true;
  }

  private async checkAuth(): Promise<boolean> {
    // Implement auth service check
    return true;
  }

  private async checkStorage(): Promise<boolean> {
    // Implement storage service check
    return true;
  }

  private getUnhealthyStatus(): Promise<HealthStatus> {
    return Promise.resolve({
      status: 'unhealthy',
      checks: {
        api: false,
        database: false,
        auth: false,
        storage: false
      },
      responseTime: 0,
      timestamp: new Date()
    });
  }
}
```

---

## 🔨 Hands-On Exercise

### Exercise 1: Blue-Green Deployment
Implement complete blue-green deployment strategy.

**Tasks:**
1. Set up blue and green environments
2. Create automated health checks
3. Implement traffic switching logic
4. Test rollback procedures

### Exercise 2: Feature Flag System
Build comprehensive feature flag management.

**Tasks:**
1. Set up Firebase Remote Config
2. Create feature flag service and directive
3. Implement A/B testing framework
4. Add feature flag analytics

### Exercise 3: Database Migration Pipeline
Create robust migration system.

**Tasks:**
1. Design migration framework
2. Create version control for schema
3. Implement rollback mechanisms
4. Add migration testing

---

## ✅ Best Practices

### Deployment Safety
- Always use health checks before traffic switching
- Implement gradual rollouts for new features
- Maintain rollback capabilities
- Monitor key metrics during deployments

### Feature Management
- Use percentage-based rollouts
- Implement user-based targeting
- Monitor feature performance
- Clean up obsolete flags regularly

---

## 📚 Resources

- [Firebase Remote Config](https://firebase.google.com/docs/remote-config)
- [Blue-Green Deployment](https://martinfowler.com/bliki/BlueGreenDeployment.html)
- [Feature Flags Best Practices](https://docs.launchdarkly.com/guides/best-practices)

---

## 🎯 Daily Checklist

- [ ] Set up multi-platform deployments
- [ ] Implement blue-green deployment strategy
- [ ] Create feature flag system
- [ ] Build database migration pipeline
- [ ] Set up deployment monitoring
- [ ] Test rollback procedures
- [ ] Configure health checks
- [ ] Document deployment processes
- [ ] Commit with message: "deploy: advanced deployment strategies with feature flags"

---

**Next**: [Day 6 - Performance Testing →](../Day-06-Performance-Testing/README.md)

**Previous**: [← Day 4 - GitHub Actions CI/CD](../Day-04-GitHub-Actions/README.md)