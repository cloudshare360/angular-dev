# Week 5, Day 7: Code Quality & Documentation

## 📋 Objectives
- ✅ Set up comprehensive code quality tools
- ✅ Implement automated code analysis and linting
- ✅ Create documentation automation
- ✅ Establish code review standards
- ✅ Set up quality gates in CI/CD
- ✅ Implement technical debt tracking

---

## 📚 Key Topics

### 1. ESLint and Prettier Configuration

#### Advanced ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  root: true,
  ignorePatterns: ['projects/**/*'],
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking',
        '@angular-eslint/recommended',
        '@angular-eslint/template/process-inline-templates'
      ],
      parserOptions: {
        project: ['tsconfig.json'],
        createDefaultProgram: true
      },
      rules: {
        // TypeScript specific rules
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',
        
        // Angular specific rules
        '@angular-eslint/component-class-suffix': 'error',
        '@angular-eslint/directive-class-suffix': 'error',
        '@angular-eslint/no-empty-lifecycle-method': 'error',
        '@angular-eslint/no-host-metadata-property': 'error',
        '@angular-eslint/no-input-rename': 'error',
        '@angular-eslint/no-output-rename': 'error',
        '@angular-eslint/use-lifecycle-interface': 'error',
        '@angular-eslint/use-pipe-transform-interface': 'error',
        
        // Security rules
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-script-url': 'error',
        'no-caller': 'error',
        
        // Performance rules
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'no-debugger': 'error',
        'prefer-const': 'error',
        'no-var': 'error',
        
        // Code style rules
        'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
        'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
        'complexity': ['warn', 10],
        'max-depth': ['warn', 4],
        'max-params': ['warn', 4]
      }
    },
    {
      files: ['*.html'],
      extends: ['@angular-eslint/template/recommended'],
      rules: {
        '@angular-eslint/template/alt-text': 'error',
        '@angular-eslint/template/elements-content': 'error',
        '@angular-eslint/template/label-has-associated-control': 'error',
        '@angular-eslint/template/table-scope': 'error',
        '@angular-eslint/template/valid-aria': 'error',
        '@angular-eslint/template/click-events-have-key-events': 'error',
        '@angular-eslint/template/mouse-events-have-key-events': 'error',
        '@angular-eslint/template/no-autofocus': 'error',
        '@angular-eslint/template/no-distracting-elements': 'error'
      }
    }
  ]
};
```

#### Prettier Configuration
```javascript
// .prettierrc.js
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'angular',
        bracketSameLine: true
      }
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
        singleQuote: false
      }
    }
  ]
};
```

### 2. SonarQube Integration

#### SonarQube Configuration
```javascript
// sonar-project.properties
sonar.projectKey=angular-project
sonar.projectName=Angular Project
sonar.projectVersion=1.0.0

sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.spec.ts
sonar.exclusions=**/node_modules/**,**/*.spec.ts,src/assets/**,src/environments/**

sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info

sonar.coverage.exclusions=**/*.spec.ts,**/*.mock.ts,**/*.module.ts,src/main.ts,src/polyfills.ts

# Technical debt
sonar.technicalDebt.hoursInDay=8
sonar.technicalDebt.ratingGrid=0.05,0.1,0.2,0.5

# Quality gates
sonar.qualitygate.wait=true
```

#### SonarQube GitHub Action
```yaml
# .github/workflows/sonarqube.yml
name: SonarQube Analysis

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  sonarqube:
    name: SonarQube Analysis
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: npm run test:coverage
      
      - name: Run lint
        run: npm run lint:report
      
      - name: SonarQube Scan
        uses: sonarqube-quality-gate-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

### 3. Code Complexity Analysis

#### Complexity Analyzer
```typescript
// scripts/complexity-analyzer.ts
import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile, SyntaxKind } from 'ts-morph';

interface ComplexityReport {
  file: string;
  functions: FunctionComplexity[];
  averageComplexity: number;
  totalComplexity: number;
  warnings: string[];
}

interface FunctionComplexity {
  name: string;
  complexity: number;
  lineCount: number;
  parameterCount: number;
  warnings: string[];
}

class ComplexityAnalyzer {
  private readonly complexityThreshold = 10;
  private readonly lineThreshold = 50;
  private readonly parameterThreshold = 4;

  analyzeProject(projectPath: string): ComplexityReport[] {
    const project = new Project({
      tsConfigFilePath: path.join(projectPath, 'tsconfig.json')
    });

    const sourceFiles = project.getSourceFiles('src/**/*.ts');
    const reports: ComplexityReport[] = [];

    for (const sourceFile of sourceFiles) {
      if (this.shouldAnalyzeFile(sourceFile)) {
        const report = this.analyzeFile(sourceFile);
        reports.push(report);
      }
    }

    this.generateSummaryReport(reports);
    return reports;
  }

  private shouldAnalyzeFile(sourceFile: SourceFile): boolean {
    const filePath = sourceFile.getFilePath();
    return !filePath.includes('.spec.') && !filePath.includes('.mock.');
  }

  private analyzeFile(sourceFile: SourceFile): ComplexityReport {
    const functions = this.extractFunctions(sourceFile);
    const functionComplexities = functions.map(func => this.analyzeFunctionComplexity(func));
    
    const totalComplexity = functionComplexities.reduce((sum, f) => sum + f.complexity, 0);
    const averageComplexity = functionComplexities.length > 0 ? totalComplexity / functionComplexities.length : 0;

    const warnings: string[] = [];
    if (averageComplexity > this.complexityThreshold) {
      warnings.push(`High average complexity: ${averageComplexity.toFixed(2)}`);
    }

    return {
      file: sourceFile.getFilePath(),
      functions: functionComplexities,
      averageComplexity,
      totalComplexity,
      warnings
    };
  }

  private extractFunctions(sourceFile: SourceFile): any[] {
    const functions: any[] = [];

    // Methods in classes
    sourceFile.getClasses().forEach(cls => {
      cls.getMethods().forEach(method => {
        functions.push({
          name: `${cls.getName()}.${method.getName()}`,
          node: method,
          type: 'method'
        });
      });
    });

    // Standalone functions
    sourceFile.getFunctions().forEach(func => {
      functions.push({
        name: func.getName() || 'anonymous',
        node: func,
        type: 'function'
      });
    });

    return functions;
  }

  private analyzeFunctionComplexity(func: any): FunctionComplexity {
    const complexity = this.calculateCyclomaticComplexity(func.node);
    const lineCount = this.getLineCount(func.node);
    const parameterCount = func.node.getParameters?.()?.length || 0;

    const warnings: string[] = [];
    if (complexity > this.complexityThreshold) {
      warnings.push(`High complexity: ${complexity}`);
    }
    if (lineCount > this.lineThreshold) {
      warnings.push(`Too many lines: ${lineCount}`);
    }
    if (parameterCount > this.parameterThreshold) {
      warnings.push(`Too many parameters: ${parameterCount}`);
    }

    return {
      name: func.name,
      complexity,
      lineCount,
      parameterCount,
      warnings
    };
  }

  private calculateCyclomaticComplexity(node: any): number {
    let complexity = 1; // Base complexity

    const countComplexityNodes = (n: any): void => {
      const kind = n.getKind();
      
      // Decision points that increase complexity
      if ([
        SyntaxKind.IfStatement,
        SyntaxKind.WhileStatement,
        SyntaxKind.DoStatement,
        SyntaxKind.ForStatement,
        SyntaxKind.ForInStatement,
        SyntaxKind.ForOfStatement,
        SyntaxKind.ConditionalExpression,
        SyntaxKind.CaseClause,
        SyntaxKind.CatchClause
      ].includes(kind)) {
        complexity++;
      }

      // Logical operators
      if (kind === SyntaxKind.BinaryExpression) {
        const operator = n.getOperatorToken().getKind();
        if (operator === SyntaxKind.AmpersandAmpersandToken || operator === SyntaxKind.BarBarToken) {
          complexity++;
        }
      }

      n.forEachChild(countComplexityNodes);
    };

    node.forEachChild(countComplexityNodes);
    return complexity;
  }

  private getLineCount(node: any): number {
    const start = node.getStartLineNumber();
    const end = node.getEndLineNumber();
    return end - start + 1;
  }

  private generateSummaryReport(reports: ComplexityReport[]): void {
    const totalFunctions = reports.reduce((sum, r) => sum + r.functions.length, 0);
    const highComplexityFunctions = reports
      .flatMap(r => r.functions)
      .filter(f => f.complexity > this.complexityThreshold);

    console.log('\n📊 Code Complexity Analysis\n');
    console.log(`Total files analyzed: ${reports.length}`);
    console.log(`Total functions: ${totalFunctions}`);
    console.log(`High complexity functions: ${highComplexityFunctions.length}`);

    if (highComplexityFunctions.length > 0) {
      console.log('\n⚠️ Functions needing attention:');
      highComplexityFunctions
        .sort((a, b) => b.complexity - a.complexity)
        .slice(0, 10)
        .forEach(func => {
          console.log(`  ${func.name}: complexity ${func.complexity}`);
        });
    }

    // Save detailed report
    fs.writeFileSync('complexity-report.json', JSON.stringify(reports, null, 2));
  }
}

// Run analysis
const analyzer = new ComplexityAnalyzer();
analyzer.analyzeProject(process.cwd());
```

### 4. Documentation Automation

#### TypeDoc Configuration
```javascript
// typedoc.json
{
  "entryPoints": ["src/app"],
  "out": "docs",
  "theme": "default",
  "includeVersion": true,
  "excludePrivate": true,
  "excludeProtected": false,
  "excludeExternals": true,
  "readme": "README.md",
  "name": "Angular Project Documentation",
  "plugin": ["typedoc-plugin-mermaid"],
  "gitRevision": "main",
  "exclude": [
    "**/*.spec.ts",
    "**/*.mock.ts",
    "**/node_modules/**"
  ],
  "categorizeByGroup": true,
  "defaultCategory": "Other",
  "categoryOrder": [
    "Components",
    "Services",
    "Models",
    "Utilities",
    "*"
  ]
}
```

#### Documentation Generator
```typescript
// scripts/generate-docs.ts
import * as fs from 'fs';
import * as path from 'path';
import { Project, SourceFile } from 'ts-morph';

interface DocumentationNode {
  name: string;
  type: 'component' | 'service' | 'interface' | 'enum' | 'class';
  description: string;
  filePath: string;
  properties: PropertyDoc[];
  methods: MethodDoc[];
  examples: string[];
}

interface PropertyDoc {
  name: string;
  type: string;
  description: string;
  isOptional: boolean;
  defaultValue?: string;
}

interface MethodDoc {
  name: string;
  parameters: ParameterDoc[];
  returnType: string;
  description: string;
  examples: string[];
}

interface ParameterDoc {
  name: string;
  type: string;
  description: string;
  isOptional: boolean;
}

class DocumentationGenerator {
  private project: Project;

  constructor(projectPath: string) {
    this.project = new Project({
      tsConfigFilePath: path.join(projectPath, 'tsconfig.json')
    });
  }

  generateDocumentation(): void {
    const sourceFiles = this.project.getSourceFiles('src/app/**/*.ts');
    const documentation: DocumentationNode[] = [];

    for (const sourceFile of sourceFiles) {
      if (this.shouldDocumentFile(sourceFile)) {
        const nodes = this.extractDocumentationNodes(sourceFile);
        documentation.push(...nodes);
      }
    }

    this.generateMarkdownDocs(documentation);
    this.generateApiReference(documentation);
    this.generateComponentsGuide(documentation);
  }

  private shouldDocumentFile(sourceFile: SourceFile): boolean {
    const filePath = sourceFile.getFilePath();
    return !filePath.includes('.spec.') && !filePath.includes('.mock.');
  }

  private extractDocumentationNodes(sourceFile: SourceFile): DocumentationNode[] {
    const nodes: DocumentationNode[] = [];
    const filePath = sourceFile.getFilePath();

    // Extract classes (components, services, etc.)
    sourceFile.getClasses().forEach(cls => {
      const decorators = cls.getDecorators();
      let type: DocumentationNode['type'] = 'class';

      // Determine type based on decorators
      if (decorators.some(d => d.getName() === 'Component')) {
        type = 'component';
      } else if (decorators.some(d => d.getName() === 'Injectable')) {
        type = 'service';
      }

      const node: DocumentationNode = {
        name: cls.getName() || 'Anonymous',
        type,
        description: this.extractJSDocDescription(cls) || '',
        filePath,
        properties: this.extractProperties(cls),
        methods: this.extractMethods(cls),
        examples: this.extractExamples(cls)
      };

      nodes.push(node);
    });

    // Extract interfaces
    sourceFile.getInterfaces().forEach(int => {
      const node: DocumentationNode = {
        name: int.getName(),
        type: 'interface',
        description: this.extractJSDocDescription(int) || '',
        filePath,
        properties: this.extractInterfaceProperties(int),
        methods: [],
        examples: this.extractExamples(int)
      };

      nodes.push(node);
    });

    // Extract enums
    sourceFile.getEnums().forEach(enm => {
      const node: DocumentationNode = {
        name: enm.getName(),
        type: 'enum',
        description: this.extractJSDocDescription(enm) || '',
        filePath,
        properties: this.extractEnumMembers(enm),
        methods: [],
        examples: this.extractExamples(enm)
      };

      nodes.push(node);
    });

    return nodes;
  }

  private extractJSDocDescription(node: any): string | undefined {
    const jsDocs = node.getJsDocs();
    if (jsDocs.length > 0) {
      return jsDocs[0].getDescription();
    }
    return undefined;
  }

  private extractProperties(cls: any): PropertyDoc[] {
    return cls.getProperties().map((prop: any) => ({
      name: prop.getName(),
      type: prop.getType().getText(),
      description: this.extractJSDocDescription(prop) || '',
      isOptional: prop.hasQuestionToken(),
      defaultValue: prop.getInitializer()?.getText()
    }));
  }

  private extractMethods(cls: any): MethodDoc[] {
    return cls.getMethods().map((method: any) => ({
      name: method.getName(),
      parameters: method.getParameters().map((param: any) => ({
        name: param.getName(),
        type: param.getType().getText(),
        description: '',
        isOptional: param.hasQuestionToken()
      })),
      returnType: method.getReturnType().getText(),
      description: this.extractJSDocDescription(method) || '',
      examples: []
    }));
  }

  private extractInterfaceProperties(int: any): PropertyDoc[] {
    return int.getProperties().map((prop: any) => ({
      name: prop.getName(),
      type: prop.getType().getText(),
      description: this.extractJSDocDescription(prop) || '',
      isOptional: prop.hasQuestionToken(),
      defaultValue: undefined
    }));
  }

  private extractEnumMembers(enm: any): PropertyDoc[] {
    return enm.getMembers().map((member: any) => ({
      name: member.getName(),
      type: 'enum member',
      description: this.extractJSDocDescription(member) || '',
      isOptional: false,
      defaultValue: member.getValue()?.toString()
    }));
  }

  private extractExamples(node: any): string[] {
    const jsDocs = node.getJsDocs();
    const examples: string[] = [];

    jsDocs.forEach((jsDoc: any) => {
      const tags = jsDoc.getTags();
      tags.forEach((tag: any) => {
        if (tag.getTagName() === 'example') {
          examples.push(tag.getComment() || '');
        }
      });
    });

    return examples;
  }

  private generateMarkdownDocs(documentation: DocumentationNode[]): void {
    const docsDir = 'docs';
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Group by type
    const grouped = documentation.reduce((acc, node) => {
      if (!acc[node.type]) acc[node.type] = [];
      acc[node.type].push(node);
      return acc;
    }, {} as Record<string, DocumentationNode[]>);

    // Generate index
    this.generateIndex(grouped, docsDir);

    // Generate individual documentation files
    Object.entries(grouped).forEach(([type, nodes]) => {
      this.generateTypeDocumentation(type, nodes, docsDir);
    });
  }

  private generateIndex(grouped: Record<string, DocumentationNode[]>, docsDir: string): void {
    let content = '# API Documentation\n\n';
    content += 'This documentation was automatically generated from TypeScript source code.\n\n';

    Object.entries(grouped).forEach(([type, nodes]) => {
      content += `## ${type.charAt(0).toUpperCase() + type.slice(1)}s\n\n`;
      nodes.forEach(node => {
        content += `- [${node.name}](${type}s/${node.name}.md)\n`;
      });
      content += '\n';
    });

    fs.writeFileSync(path.join(docsDir, 'README.md'), content);
  }

  private generateTypeDocumentation(type: string, nodes: DocumentationNode[], docsDir: string): void {
    const typeDir = path.join(docsDir, `${type}s`);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    nodes.forEach(node => {
      let content = `# ${node.name}\n\n`;
      
      if (node.description) {
        content += `${node.description}\n\n`;
      }

      content += `**File**: \`${node.filePath}\`\n\n`;

      if (node.properties.length > 0) {
        content += '## Properties\n\n';
        content += '| Name | Type | Optional | Description |\n';
        content += '|------|------|----------|-------------|\n';
        
        node.properties.forEach(prop => {
          const optional = prop.isOptional ? '✓' : '';
          content += `| ${prop.name} | \`${prop.type}\` | ${optional} | ${prop.description} |\n`;
        });
        content += '\n';
      }

      if (node.methods.length > 0) {
        content += '## Methods\n\n';
        
        node.methods.forEach(method => {
          content += `### ${method.name}\n\n`;
          if (method.description) {
            content += `${method.description}\n\n`;
          }
          
          content += '**Parameters:**\n\n';
          if (method.parameters.length > 0) {
            content += '| Name | Type | Optional | Description |\n';
            content += '|------|------|----------|-------------|\n';
            method.parameters.forEach(param => {
              const optional = param.isOptional ? '✓' : '';
              content += `| ${param.name} | \`${param.type}\` | ${optional} | ${param.description} |\n`;
            });
          } else {
            content += 'None\n';
          }
          
          content += `\n**Returns:** \`${method.returnType}\`\n\n`;
        });
      }

      if (node.examples.length > 0) {
        content += '## Examples\n\n';
        node.examples.forEach((example, index) => {
          content += `### Example ${index + 1}\n\n`;
          content += '```typescript\n';
          content += example;
          content += '\n```\n\n';
        });
      }

      fs.writeFileSync(path.join(typeDir, `${node.name}.md`), content);
    });
  }

  private generateApiReference(documentation: DocumentationNode[]): void {
    const apiRef = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      nodes: documentation.map(node => ({
        name: node.name,
        type: node.type,
        description: node.description,
        filePath: node.filePath,
        properties: node.properties.length,
        methods: node.methods.length
      }))
    };

    fs.writeFileSync('docs/api-reference.json', JSON.stringify(apiRef, null, 2));
  }

  private generateComponentsGuide(documentation: DocumentationNode[]): void {
    const components = documentation.filter(node => node.type === 'component');
    
    if (components.length === 0) return;

    let content = '# Components Guide\n\n';
    content += 'This guide provides an overview of all components in the application.\n\n';

    components.forEach(component => {
      content += `## ${component.name}\n\n`;
      if (component.description) {
        content += `${component.description}\n\n`;
      }

      // Extract selector and other metadata
      content += '### Usage\n\n';
      content += '```html\n';
      content += `<app-${component.name.toLowerCase().replace('component', '')}></app-${component.name.toLowerCase().replace('component', '')}>\n`;
      content += '```\n\n';

      if (component.properties.filter(p => p.name.startsWith('@Input')).length > 0) {
        content += '### Inputs\n\n';
        component.properties
          .filter(p => p.name.startsWith('@Input'))
          .forEach(input => {
            content += `- **${input.name}**: \`${input.type}\` ${input.isOptional ? '(optional)' : ''}\n`;
            if (input.description) {
              content += `  ${input.description}\n`;
            }
          });
        content += '\n';
      }

      if (component.properties.filter(p => p.name.startsWith('@Output')).length > 0) {
        content += '### Outputs\n\n';
        component.properties
          .filter(p => p.name.startsWith('@Output'))
          .forEach(output => {
            content += `- **${output.name}**: \`${output.type}\`\n`;
            if (output.description) {
              content += `  ${output.description}\n`;
            }
          });
        content += '\n';
      }
    });

    fs.writeFileSync('docs/components-guide.md', content);
  }
}

// Generate documentation
const generator = new DocumentationGenerator(process.cwd());
generator.generateDocumentation();
```

### 5. Quality Gates Configuration

#### GitHub Action for Quality Gates
```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality-checks:
    name: Quality Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint check
        run: |
          npm run lint
          if [ $? -ne 0 ]; then
            echo "❌ Linting failed"
            exit 1
          fi
      
      - name: Type check
        run: |
          npm run type-check
          if [ $? -ne 0 ]; then
            echo "❌ Type checking failed"
            exit 1
          fi
      
      - name: Unit tests with coverage
        run: |
          npm run test:coverage
          COVERAGE=$(node -e "console.log(require('./coverage/coverage-summary.json').total.lines.pct)")
          echo "Test coverage: $COVERAGE%"
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "❌ Test coverage below 80%"
            exit 1
          fi
      
      - name: Bundle size check
        run: |
          npm run build
          SIZE=$(du -sk dist | cut -f1)
          echo "Bundle size: ${SIZE}KB"
          if [ $SIZE -gt 5000 ]; then
            echo "❌ Bundle size exceeds 5MB"
            exit 1
          fi
      
      - name: Security audit
        run: |
          npm audit --audit-level moderate
          if [ $? -ne 0 ]; then
            echo "❌ Security vulnerabilities found"
            exit 1
          fi
      
      - name: Complexity analysis
        run: |
          npm run analyze:complexity
          HIGH_COMPLEXITY=$(node -e "
            const report = require('./complexity-report.json');
            const highComplexity = report.flatMap(r => r.functions).filter(f => f.complexity > 10).length;
            console.log(highComplexity);
          ")
          echo "High complexity functions: $HIGH_COMPLEXITY"
          if [ $HIGH_COMPLEXITY -gt 5 ]; then
            echo "⚠️ Too many high complexity functions"
          fi
      
      - name: Comment PR
        if: always()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            
            let comment = '## 🔍 Quality Check Results\n\n';
            
            try {
              const coverage = require('./coverage/coverage-summary.json');
              comment += `📊 **Test Coverage**: ${coverage.total.lines.pct}%\n`;
            } catch (e) {
              comment += '📊 **Test Coverage**: Not available\n';
            }
            
            try {
              const stats = fs.statSync('dist');
              const size = fs.readdirSync('dist').reduce((total, file) => {
                return total + fs.statSync(`dist/${file}`).size;
              }, 0);
              comment += `📦 **Bundle Size**: ${Math.round(size / 1024)}KB\n`;
            } catch (e) {
              comment += '📦 **Bundle Size**: Not available\n';
            }
            
            try {
              const complexity = require('./complexity-report.json');
              const highComplexity = complexity.flatMap(r => r.functions).filter(f => f.complexity > 10).length;
              comment += `🧮 **High Complexity Functions**: ${highComplexity}\n`;
            } catch (e) {
              comment += '🧮 **Complexity Analysis**: Not available\n';
            }
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

---

## 🔨 Hands-On Exercise

### Exercise 1: Code Quality Setup
Set up comprehensive code quality tools for all projects.

**Tasks:**
1. Configure ESLint with strict rules
2. Set up Prettier for code formatting
3. Integrate SonarQube for code analysis
4. Create quality gates in CI/CD

### Exercise 2: Documentation Automation
Implement automated documentation generation.

**Tasks:**
1. Set up TypeDoc for API documentation
2. Create automated README generation
3. Generate component usage guides
4. Set up documentation deployment

### Exercise 3: Technical Debt Tracking
Implement technical debt monitoring and tracking.

**Tasks:**
1. Set up complexity analysis
2. Create debt tracking dashboard
3. Implement automated debt reporting
4. Create refactoring guidelines

---

## ✅ Code Quality Best Practices

### Linting Standards
- Use strict TypeScript configuration
- Implement consistent code formatting
- Enforce accessibility rules
- Monitor security vulnerabilities

### Documentation Standards
- Maintain comprehensive API documentation
- Create clear usage examples
- Document architectural decisions
- Keep documentation up to date

---

## 📚 Resources

- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
- [Angular ESLint](https://github.com/angular-eslint/angular-eslint)
- [SonarQube](https://www.sonarqube.org/)
- [TypeDoc](https://typedoc.org/)

---

## 🎯 Daily Checklist

- [ ] Configure comprehensive ESLint rules
- [ ] Set up Prettier code formatting
- [ ] Integrate SonarQube analysis
- [ ] Create quality gates in CI/CD
- [ ] Set up automated documentation generation
- [ ] Implement complexity analysis
- [ ] Configure technical debt tracking
- [ ] Create code review standards
- [ ] Commit with message: "chore: comprehensive code quality and documentation setup"

---

**Next**: [Week 6 - Interview Prep & Portfolio →](../../Week-06-Interview-Portfolio/README.md)

**Previous**: [← Day 6 - Performance Testing](../Day-06-Performance-Testing/README.md)