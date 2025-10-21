# Week 4, Day 6: Public-Facing Pages

## 📋 Objectives
By the end of Day 6, you will:
- ✅ Build responsive public-facing website pages
- ✅ Implement dynamic content rendering from Firestore
- ✅ Add SEO optimization with meta tags
- ✅ Create navigation and layout components
- ✅ Implement contact forms and interactive features
- ✅ Add responsive design with mobile optimization

---

## 📚 Topics Covered

### 1. Public Website Architecture

#### Site Structure
Following the aasoftnet.com inspiration:

```
/                    → Home page
/about              → About us
/services           → Services listing
/services/:slug     → Individual service details
/portfolio          → Portfolio/projects
/portfolio/:slug    → Project details
/blog               → Blog listing
/blog/:slug         → Blog post
/contact            → Contact page
```

#### Layout Components Structure
```typescript
PublicLayoutComponent
├── HeaderComponent
├── NavigationComponent
├── RouterOutlet (page content)
├── FooterComponent
└── BackToTopComponent
```

---

### 2. Public Layout Components

#### Main Layout Component

**src/app/public/layout/public-layout.component.ts**
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { BackToTopComponent } from '@/shared/components/back-to-top/back-to-top.component';
import { LoadingComponent } from '@/shared/components/loading/loading.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    BackToTopComponent,
    LoadingComponent
  ],
  template: `
    <div class="public-layout">
      <app-header></app-header>
      
      <main class="main-content">
        @if (isLoading()) {
          <app-loading></app-loading>
        } @else {
          <router-outlet></router-outlet>
        }
      </main>
      
      <app-footer></app-footer>
      <app-back-to-top></app-back-to-top>
    </div>
  `,
  styles: [`
    .public-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      padding-top: 80px; /* Account for fixed header */
    }

    @media (max-width: 768px) {
      .main-content {
        padding-top: 70px;
      }
    }
  `]
})
export class PublicLayoutComponent implements OnInit {
  isLoading = signal(false);

  ngOnInit() {
    // Initialize any global public site functionality
    this.initSmoothScrolling();
  }

  private initSmoothScrolling() {
    // Add smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const elementId = target.getAttribute('href')?.substring(1);
        if (elementId) {
          const element = document.getElementById(elementId);
          element?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }
}
```

#### Header Component

**src/app/public/layout/header/header.component.ts**
```typescript
import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { PagesService } from '@/core/services/pages.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="header" [class.scrolled]="isScrolled()">
      <nav class="navbar navbar-expand-lg navbar-light">
        <div class="container">
          <!-- Logo -->
          <a class="navbar-brand" routerLink="/">
            <img src="/assets/images/logo.png" alt="Company Logo" 
                 class="logo" *ngIf="!isScrolled()">
            <img src="/assets/images/logo-compact.png" alt="Company Logo" 
                 class="logo-compact" *ngIf="isScrolled()">
          </a>

          <!-- Mobile Toggle -->
          <button class="navbar-toggler" type="button" 
                  (click)="toggleMobileMenu()"
                  [attr.aria-expanded]="isMobileMenuOpen()">
            <span class="navbar-toggler-icon"></span>
          </button>

          <!-- Navigation -->
          <div class="navbar-collapse" 
               [class.show]="isMobileMenuOpen()">
            <ul class="navbar-nav ms-auto">
              <li class="nav-item">
                <a class="nav-link" routerLink="/" routerLinkActive="active" 
                   [routerLinkActiveOptions]="{exact: true}">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/about" routerLinkActive="active">About</a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" 
                   (click)="toggleDropdown($event)">Services</a>
                <ul class="dropdown-menu" [class.show]="isServicesDropdownOpen()">
                  @for (service of featuredServices(); track service.id) {
                    <li>
                      <a class="dropdown-item" [routerLink]="['/services', service.slug]">
                        {{ service.title }}
                      </a>
                    </li>
                  }
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" routerLink="/services">All Services</a>
                  </li>
                </ul>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/portfolio" routerLinkActive="active">Portfolio</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/blog" routerLinkActive="active">Blog</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/contact" routerLinkActive="active">Contact</a>
              </li>
              <li class="nav-item">
                <a class="btn btn-primary ms-2" routerLink="/contact">Get Quote</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1030;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .header.scrolled {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    }

    .navbar {
      padding: 1rem 0;
      transition: padding 0.3s ease;
    }

    .header.scrolled .navbar {
      padding: 0.5rem 0;
    }

    .logo {
      height: 40px;
      transition: height 0.3s ease;
    }

    .logo-compact {
      height: 30px;
    }

    .nav-link {
      font-weight: 500;
      color: #333 !important;
      transition: color 0.3s ease;
      position: relative;
      padding: 0.5rem 1rem !important;
    }

    .nav-link:hover,
    .nav-link.active {
      color: #007bff !important;
    }

    .nav-link.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 2px;
      background: #007bff;
    }

    .dropdown-menu {
      border: none;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      margin-top: 0.5rem;
    }

    .dropdown-item {
      padding: 0.75rem 1.5rem;
      transition: background-color 0.3s ease;
    }

    .dropdown-item:hover {
      background-color: #f8f9fa;
      color: #007bff;
    }

    @media (max-width: 991px) {
      .navbar-collapse {
        background: white;
        margin-top: 1rem;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        padding: 1rem;
      }

      .nav-link.active::after {
        display: none;
      }

      .dropdown-menu {
        box-shadow: none;
        background: #f8f9fa;
        border-radius: 4px;
        margin: 0.5rem 0;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  private pagesService = inject(PagesService);
  private router = inject(Router);

  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  isServicesDropdownOpen = signal(false);
  featuredServices = signal<any[]>([]);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.isServicesDropdownOpen.set(false);
    }
    if (!target.closest('.navbar-collapse') && !target.closest('.navbar-toggler')) {
      this.isMobileMenuOpen.set(false);
    }
  }

  ngOnInit() {
    this.loadFeaturedServices();
  }

  loadFeaturedServices() {
    // Load featured services for dropdown
    // This would connect to your services API
    this.featuredServices.set([
      { id: '1', title: 'Web Development', slug: 'web-development' },
      { id: '2', title: 'Mobile Apps', slug: 'mobile-apps' },
      { id: '3', title: 'Digital Marketing', slug: 'digital-marketing' }
    ]);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(open => !open);
  }

  toggleDropdown(event: Event) {
    event.preventDefault();
    this.isServicesDropdownOpen.update(open => !open);
  }
}
```

#### Footer Component

**src/app/public/layout/footer/footer.component.ts**
```typescript
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <footer class="footer">
      <div class="container">
        <!-- Main Footer Content -->
        <div class="row mb-5">
          <!-- Company Info -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-section">
              <img src="/assets/images/logo-white.png" alt="Company Logo" class="footer-logo mb-3">
              <p class="text-light mb-3">
                Building innovative digital solutions that drive business growth 
                and create exceptional user experiences.
              </p>
              <div class="social-links">
                <a href="#" class="social-link" aria-label="Facebook">
                  <i class="bi bi-facebook"></i>
                </a>
                <a href="#" class="social-link" aria-label="Twitter">
                  <i class="bi bi-twitter"></i>
                </a>
                <a href="#" class="social-link" aria-label="LinkedIn">
                  <i class="bi bi-linkedin"></i>
                </a>
                <a href="#" class="social-link" aria-label="Instagram">
                  <i class="bi bi-instagram"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="col-lg-2 col-md-6 mb-4">
            <div class="footer-section">
              <h5 class="footer-title">Quick Links</h5>
              <ul class="footer-links">
                <li><a routerLink="/">Home</a></li>
                <li><a routerLink="/about">About Us</a></li>
                <li><a routerLink="/services">Services</a></li>
                <li><a routerLink="/portfolio">Portfolio</a></li>
                <li><a routerLink="/contact">Contact</a></li>
              </ul>
            </div>
          </div>

          <!-- Services -->
          <div class="col-lg-2 col-md-6 mb-4">
            <div class="footer-section">
              <h5 class="footer-title">Services</h5>
              <ul class="footer-links">
                <li><a routerLink="/services/web-development">Web Development</a></li>
                <li><a routerLink="/services/mobile-apps">Mobile Apps</a></li>
                <li><a routerLink="/services/digital-marketing">Digital Marketing</a></li>
                <li><a routerLink="/services/consulting">Consulting</a></li>
              </ul>
            </div>
          </div>

          <!-- Newsletter -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-section">
              <h5 class="footer-title">Stay Updated</h5>
              <p class="text-light mb-3">
                Subscribe to our newsletter for the latest updates and insights.
              </p>
              <form [formGroup]="newsletterForm" (ngSubmit)="subscribeNewsletter()" class="newsletter-form">
                <div class="input-group">
                  <input type="email" class="form-control" 
                         placeholder="Enter your email" 
                         formControlName="email">
                  <button class="btn btn-primary" type="submit" 
                          [disabled]="newsletterForm.invalid || subscribing()">
                    {{ subscribing() ? 'Subscribing...' : 'Subscribe' }}
                  </button>
                </div>
                @if (newsletterForm.get('email')?.invalid && newsletterForm.get('email')?.touched) {
                  <small class="text-warning">Please enter a valid email address</small>
                }
              </form>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="row mb-4">
          <div class="col-md-4 mb-3">
            <div class="contact-item">
              <i class="bi bi-geo-alt contact-icon"></i>
              <div>
                <h6 class="text-light mb-1">Address</h6>
                <p class="text-light-muted mb-0">123 Business Street<br>City, State 12345</p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="contact-item">
              <i class="bi bi-telephone contact-icon"></i>
              <div>
                <h6 class="text-light mb-1">Phone</h6>
                <p class="text-light-muted mb-0">
                  <a href="tel:+1234567890" class="text-light-muted">+1 (234) 567-8900</a>
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="contact-item">
              <i class="bi bi-envelope contact-icon"></i>
              <div>
                <h6 class="text-light mb-1">Email</h6>
                <p class="text-light-muted mb-0">
                  <a href="mailto:hello@company.com" class="text-light-muted">hello@company.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="footer-bottom">
          <div class="row align-items-center">
            <div class="col-md-6">
              <p class="text-light-muted mb-0">
                &copy; {{ currentYear }} Your Company Name. All rights reserved.
              </p>
            </div>
            <div class="col-md-6 text-md-end">
              <div class="footer-legal">
                <a routerLink="/privacy-policy" class="text-light-muted me-3">Privacy Policy</a>
                <a routerLink="/terms-of-service" class="text-light-muted">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      padding: 4rem 0 2rem;
      margin-top: auto;
    }

    .footer-logo {
      height: 40px;
    }

    .footer-title {
      color: #fff;
      font-weight: 600;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 0.75rem;
    }

    .footer-links a {
      color: #b0b0b0;
      text-decoration: none;
      transition: color 0.3s ease;
      font-size: 0.95rem;
    }

    .footer-links a:hover {
      color: #fff;
    }

    .social-links {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .social-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      border-radius: 50%;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .social-link:hover {
      background: #007bff;
      color: #fff;
      transform: translateY(-2px);
    }

    .newsletter-form .form-control {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
    }

    .newsletter-form .form-control::placeholder {
      color: #b0b0b0;
    }

    .newsletter-form .form-control:focus {
      background: rgba(255, 255, 255, 0.15);
      border-color: #007bff;
      box-shadow: none;
      color: #fff;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .contact-icon {
      font-size: 1.25rem;
      color: #007bff;
      margin-top: 0.25rem;
    }

    .text-light-muted {
      color: #b0b0b0 !important;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 2rem;
      margin-top: 2rem;
    }

    .footer-legal a {
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-legal a:hover {
      color: #fff !important;
    }

    @media (max-width: 768px) {
      .footer {
        padding: 3rem 0 1.5rem;
      }

      .footer-section {
        margin-bottom: 2rem;
      }

      .footer-bottom {
        text-align: center;
      }

      .footer-legal {
        margin-top: 1rem;
      }
    }
  `]
})
export class FooterComponent implements OnInit {
  private fb = inject(FormBuilder);

  currentYear = new Date().getFullYear();
  subscribing = signal(false);

  newsletterForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit() {
    // Initialize footer functionality
  }

  subscribeNewsletter() {
    if (this.newsletterForm.invalid) return;

    this.subscribing.set(true);
    const email = this.newsletterForm.get('email')?.value;

    // Simulate newsletter subscription
    setTimeout(() => {
      console.log('Newsletter subscription:', email);
      this.subscribing.set(false);
      this.newsletterForm.reset();
      alert('Thank you for subscribing to our newsletter!');
    }, 1000);
  }
}
```

---

### 3. Public Page Components

#### Home Page Component

**src/app/public/pages/home/home.component.ts**
```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PagesService } from '@/core/services/pages.service';
import { BlogService } from '@/core/services/blog.service';
import { PortfolioService } from '@/core/services/portfolio.service';
import { HeroSectionComponent } from './components/hero-section.component';
import { ServicesOverviewComponent } from './components/services-overview.component';
import { PortfolioPreviewComponent } from './components/portfolio-preview.component';
import { TestimonialsComponent } from './components/testimonials.component';
import { BlogPreviewComponent } from './components/blog-preview.component';
import { CTASectionComponent } from './components/cta-section.component';
import { SEOService } from '@/core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HeroSectionComponent,
    ServicesOverviewComponent,
    PortfolioPreviewComponent,
    TestimonialsComponent,
    BlogPreviewComponent,
    CTASectionComponent
  ],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <app-hero-section 
        [heroData]="heroData()"
        [loading]="loadingHero()">
      </app-hero-section>

      <!-- Services Overview -->
      <app-services-overview 
        [services]="featuredServices()"
        [loading]="loadingServices()">
      </app-services-overview>

      <!-- Portfolio Preview -->
      <app-portfolio-preview 
        [portfolioItems]="featuredPortfolio()"
        [loading]="loadingPortfolio()">
      </app-portfolio-preview>

      <!-- Testimonials -->
      <app-testimonials 
        [testimonials]="testimonials()">
      </app-testimonials>

      <!-- Recent Blog Posts -->
      <app-blog-preview 
        [blogPosts]="recentPosts()"
        [loading]="loadingBlog()">
      </app-blog-preview>

      <!-- Call to Action -->
      <app-cta-section></app-cta-section>
    </div>
  `,
  styles: [`
    .home-page {
      overflow-x: hidden;
    }
  `]
})
export class HomeComponent implements OnInit {
  private pagesService = inject(PagesService);
  private blogService = inject(BlogService);
  private portfolioService = inject(PortfolioService);
  private seoService = inject(SEOService);

  // Loading states
  loadingHero = signal(false);
  loadingServices = signal(false);
  loadingPortfolio = signal(false);
  loadingBlog = signal(false);

  // Data signals
  heroData = signal<any>(null);
  featuredServices = signal<any[]>([]);
  featuredPortfolio = signal<any[]>([]);
  recentPosts = signal<any[]>([]);
  testimonials = signal<any[]>([]);

  ngOnInit() {
    this.setupSEO();
    this.loadHeroContent();
    this.loadFeaturedServices();
    this.loadFeaturedPortfolio();
    this.loadRecentBlogPosts();
    this.loadTestimonials();
  }

  private setupSEO() {
    this.seoService.updateSEO({
      title: 'Your Company Name - Digital Solutions & Innovation',
      description: 'Leading provider of web development, mobile apps, and digital marketing solutions. Transform your business with our innovative technology services.',
      keywords: ['web development', 'mobile apps', 'digital marketing', 'software development'],
      ogImage: '/assets/images/og-home.jpg',
      canonicalUrl: '/'
    });
  }

  private loadHeroContent() {
    this.loadingHero.set(true);
    
    // Load hero content from CMS or use default
    this.pagesService.getBySlug('home-hero').subscribe({
      next: (page) => {
        if (page) {
          this.heroData.set({
            title: page.title,
            subtitle: page.excerpt,
            backgroundImage: page.featuredImage,
            ctaText: 'Get Started',
            ctaLink: '/contact'
          });
        } else {
          // Default hero data
          this.heroData.set({
            title: 'Building Digital Solutions That Drive Success',
            subtitle: 'We create innovative web applications, mobile apps, and digital experiences that help businesses thrive in the digital age.',
            backgroundImage: '/assets/images/hero-bg.jpg',
            ctaText: 'Start Your Project',
            ctaLink: '/contact'
          });
        }
        this.loadingHero.set(false);
      },
      error: () => {
        this.loadingHero.set(false);
        // Use default data on error
        this.heroData.set({
          title: 'Building Digital Solutions That Drive Success',
          subtitle: 'We create innovative web applications, mobile apps, and digital experiences that help businesses thrive in the digital age.',
          backgroundImage: '/assets/images/hero-bg.jpg',
          ctaText: 'Start Your Project',
          ctaLink: '/contact'
        });
      }
    });
  }

  private loadFeaturedServices() {
    this.loadingServices.set(true);
    
    // Mock data - replace with actual service loading
    setTimeout(() => {
      this.featuredServices.set([
        {
          id: '1',
          title: 'Web Development',
          description: 'Custom web applications built with modern technologies',
          icon: 'bi-code-slash',
          features: ['Responsive Design', 'Performance Optimized', 'SEO Ready']
        },
        {
          id: '2',
          title: 'Mobile Apps',
          description: 'Native and cross-platform mobile applications',
          icon: 'bi-phone',
          features: ['iOS & Android', 'React Native', 'Flutter']
        },
        {
          id: '3',
          title: 'Digital Marketing',
          description: 'Comprehensive digital marketing strategies',
          icon: 'bi-megaphone',
          features: ['SEO', 'Social Media', 'PPC Campaigns']
        }
      ]);
      this.loadingServices.set(false);
    }, 500);
  }

  private loadFeaturedPortfolio() {
    this.loadingPortfolio.set(true);
    
    // Mock data - replace with actual portfolio loading
    setTimeout(() => {
      this.featuredPortfolio.set([
        {
          id: '1',
          title: 'E-commerce Platform',
          description: 'Modern e-commerce solution with advanced features',
          image: '/assets/images/portfolio/project-1.jpg',
          technologies: ['Angular', 'Firebase', 'Stripe'],
          category: 'Web Development'
        },
        {
          id: '2',
          title: 'Mobile Banking App',
          description: 'Secure mobile banking application',
          image: '/assets/images/portfolio/project-2.jpg',
          technologies: ['React Native', 'Node.js', 'MongoDB'],
          category: 'Mobile App'
        },
        {
          id: '3',
          title: 'Healthcare Dashboard',
          description: 'Real-time healthcare management system',
          image: '/assets/images/portfolio/project-3.jpg',
          technologies: ['Vue.js', 'Laravel', 'MySQL'],
          category: 'Web Application'
        }
      ]);
      this.loadingPortfolio.set(false);
    }, 700);
  }

  private loadRecentBlogPosts() {
    this.loadingBlog.set(true);
    
    // Mock data - replace with actual blog loading
    setTimeout(() => {
      this.recentPosts.set([
        {
          id: '1',
          title: 'The Future of Web Development in 2024',
          excerpt: 'Exploring emerging trends and technologies shaping the web development landscape.',
          featuredImage: '/assets/images/blog/post-1.jpg',
          author: 'John Doe',
          publishedAt: new Date('2024-01-15'),
          slug: 'future-of-web-development-2024'
        },
        {
          id: '2',
          title: 'Mobile App Performance Optimization Tips',
          excerpt: 'Essential strategies to improve your mobile app performance and user experience.',
          featuredImage: '/assets/images/blog/post-2.jpg',
          author: 'Jane Smith',
          publishedAt: new Date('2024-01-10'),
          slug: 'mobile-app-performance-optimization'
        }
      ]);
      this.loadingBlog.set(false);
    }, 600);
  }

  private loadTestimonials() {
    // Mock testimonials data
    this.testimonials.set([
      {
        id: '1',
        name: 'Sarah Johnson',
        position: 'CEO, TechStart Inc.',
        content: 'Exceptional work! They delivered exactly what we needed on time and within budget.',
        avatar: '/assets/images/testimonials/client-1.jpg',
        rating: 5
      },
      {
        id: '2',
        name: 'Michael Chen',
        position: 'CTO, Innovation Labs',
        content: 'Outstanding technical expertise and professional service. Highly recommended!',
        avatar: '/assets/images/testimonials/client-2.jpg',
        rating: 5
      },
      {
        id: '3',
        name: 'Emily Rodriguez',
        position: 'Marketing Director, GrowthCo',
        content: 'They transformed our digital presence and significantly improved our conversion rates.',
        avatar: '/assets/images/testimonials/client-3.jpg',
        rating: 5
      }
    ]);
  }
}
```

#### SEO Service for Meta Tags

**src/app/core/services/seo.service.ts**
```typescript
import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SEOService {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);

  constructor() {
    // Update canonical URL on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateCanonicalUrl(event.url);
    });
  }

  updateSEO(data: SEOData) {
    // Update title
    this.title.setTitle(data.title);

    // Update meta description
    this.meta.updateTag({ name: 'description', content: data.description });

    // Update keywords if provided
    if (data.keywords?.length) {
      this.meta.updateTag({ name: 'keywords', content: data.keywords.join(', ') });
    }

    // Update Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:type', content: data.ogType || 'website' });

    if (data.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: this.getAbsoluteUrl(data.ogImage) });
    }

    // Update Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: data.title });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });

    if (data.ogImage) {
      this.meta.updateTag({ name: 'twitter:image', content: this.getAbsoluteUrl(data.ogImage) });
    }

    // Update canonical URL
    if (data.canonicalUrl) {
      this.updateCanonicalUrl(data.canonicalUrl);
    }

    // Update robots meta tag
    if (data.noIndex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    }
  }

  private updateCanonicalUrl(url: string) {
    const absoluteUrl = this.getAbsoluteUrl(url);
    
    // Remove existing canonical link
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Add new canonical link
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', absoluteUrl);
    document.head.appendChild(link);
  }

  private getAbsoluteUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${window.location.origin}${url.startsWith('/') ? url : '/' + url}`;
  }

  // Helper method to generate structured data
  addStructuredData(data: any) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // Helper method for breadcrumb structured data
  addBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": this.getAbsoluteUrl(item.url)
      }))
    };

    this.addStructuredData(structuredData);
  }
}
```

---

## 🔨 Hands-On Exercise

### Exercise 1: Contact Form with Validation
Build a comprehensive contact form with file attachments.

**Tasks:**
1. Create contact form component with reactive forms
2. Add file upload for project briefs
3. Implement form validation with custom validators
4. Add Google reCAPTCHA integration
5. Send form data to Firestore and email service

### Exercise 2: Blog Detail Page
Create a detailed blog post page with comments.

**Tasks:**
1. Build blog detail component with dynamic routing
2. Add social sharing buttons
3. Implement reading time calculation
4. Add related posts section
5. Create comment system with moderation

### Exercise 3: Advanced SEO Features
Enhance SEO with structured data and analytics.

**Tasks:**
1. Add JSON-LD structured data for different content types
2. Implement Google Analytics 4 integration
3. Add sitemap generation
4. Create robots.txt management
5. Add performance monitoring

---

## ✅ Testing Guidelines

### Unit Testing Public Components

```typescript
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should load hero content on init', () => {
    component.ngOnInit();
    expect(component.loadingHero()).toBeFalsy();
    expect(component.heroData()).toBeTruthy();
  });

  it('should setup SEO metadata', () => {
    const seoService = TestBed.inject(SEOService);
    spyOn(seoService, 'updateSEO');
    
    component.ngOnInit();
    
    expect(seoService.updateSEO).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: jasmine.any(String),
        description: jasmine.any(String)
      })
    );
  });
});
```

---

## 📚 Resources

### Documentation
- [Angular Router](https://angular.io/guide/router)
- [Angular Forms](https://angular.io/guide/reactive-forms)
- [Bootstrap Components](https://getbootstrap.com/docs/5.3/)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)

### SEO Resources
- [Google Search Console](https://search.google.com/search-console)
- [Schema.org](https://schema.org/)
- [Open Graph Protocol](https://ogp.me/)

---

## 🎯 Daily Checklist

- [ ] Create public layout with header and footer
- [ ] Build responsive navigation with mobile menu
- [ ] Implement home page with dynamic content sections
- [ ] Add SEO service with meta tag management
- [ ] Create contact page with working form
- [ ] Build blog listing and detail pages
- [ ] Add structured data for SEO
- [ ] Implement social sharing features
- [ ] Test responsive design across devices
- [ ] Commit with message: "feat(cms): build public-facing pages with SEO"

---

**Next**: [Day 7 - Testing & Deployment →](../Day-07-Testing-Deployment/README.md)

**Previous**: [← Day 5 - Preview Mode & Versioning](../Day-05-Preview-Versioning/README.md)