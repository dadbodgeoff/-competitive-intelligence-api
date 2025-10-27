# 🎯 FRONTEND REVIEW MODULE IMPLEMENTATION PLAN

## 📊 EXECUTIVE SUMMARY

**Scope:** Frontend for Module 1 (Review Analysis) ONLY - No Menu Intelligence
**Objective:** Production-ready React + TypeScript MVP for competitive review analysis
**Quality Standard:** ≥9.0/10 Quality Compliance Matrix (QCM) score per sprint
**Timeline:** 6 weeks (4 development + 2 beta testing/iteration)
**Error Threshold:** Work halts if >3 critical or >5 minor errors per sprint

### **Module 1 Review Analysis Scope**
- ✅ **Authentication System** (JWT, login/register, protected routes)
- ✅ **Review Analysis Workflow** (restaurant input → competitor discovery → review analysis)
- ✅ **Real-Time Progress Tracking** (polling analysis status)
- ✅ **Results Dashboard** (competitors, insights, review quotes)
- ✅ **Mobile-First Design** (tablet-optimized for restaurant managers)
- ❌ **Menu Intelligence** (Module 2 - NOT included in this implementation)

---

## 🔐 AUTHENTICATION SYSTEM SPECIFICATIONS

### **JWT Security Implementation (Beta-Appropriate)**
```typescript
// Enhanced secure token storage for beta
class SecureTokenStorage {
  private readonly TOKEN_KEY = 'ci_auth_token';
  private readonly REFRESH_KEY = 'ci_refresh_token';
  private readonly USER_KEY = 'ci_user_data';
  
  setTokens(accessToken: string, refreshToken: string, user: User) {
    // Validate token format
    if (!this.isValidJWT(accessToken)) {
      throw new Error('Invalid JWT token format');
    }
    
    // Store with metadata
    const tokenData = {
      token: accessToken,
      expiresAt: this.extractExpiration(accessToken),
      createdAt: Date.now(),
      userId: user.id
    };
    
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokenData));
    localStorage.setItem(this.REFRESH_KEY, refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    // Schedule automatic cleanup
    this.scheduleTokenCleanup(tokenData.expiresAt);
  }
  
  getValidToken(): string | null {
    try {
      const tokenData = JSON.parse(localStorage.getItem(this.TOKEN_KEY) || '{}');
      
      // Check expiration (with 5-minute buffer)
      const bufferTime = 5 * 60 * 1000; // 5 minutes
      if (Date.now() > (tokenData.expiresAt - bufferTime)) {
        this.triggerTokenRefresh();
        return null;
      }
      
      return tokenData.token;
    } catch {
      this.clearAllAuthData();
      return null;
    }
  }
  
  clearAllAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    // Clear any cached analysis data
    this.clearAnalysisCache();
  }
}
```

### **Backend API Integration (Review Module Only)**
```typescript
// Review module API service
class ReviewAnalysisAPIService {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
      timeout: 30000,
    });
    
    this.setupInterceptors();
  }
  
  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    return this.client.post('/api/v1/auth/login', credentials);
  }
  
  async register(userData: RegisterData): Promise<User> {
    return this.client.post('/api/v1/auth/register', userData);
  }
  
  async getProfile(): Promise<User> {
    return this.client.get('/api/v1/auth/me');
  }
  
  // Review analysis endpoints (Module 1 only)
  async createReviewAnalysis(request: ReviewAnalysisRequest): Promise<AnalysisResponse> {
    return this.client.post('/api/v1/analysis/run', {
      ...request,
      analysis_type: 'review' // Specify Module 1
    });
  }
  
  async getAnalysisStatus(analysisId: string): Promise<AnalysisStatus> {
    return this.client.get(`/api/v1/analysis/${analysisId}/status`);
  }
  
  async getReviewAnalysisResults(analysisId: string): Promise<ReviewAnalysisResponse> {
    return this.client.get(`/api/v1/analysis/${analysisId}`);
  }
  
  // Error handling with backend-specific codes
  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const errorCode = error.response?.data?.code;
        const userMessage = this.getErrorMessage(errorCode);
        
        // Log for debugging but show user-friendly message
        console.error('API Error:', error);
        throw new Error(userMessage);
      }
    );
  }
  
  private getErrorMessage(code: string): string {
    const messages = {
      // Review analysis specific errors
      'ANALYSIS_NO_COMPETITORS': 'No competitors found in this area. Try expanding your search radius.',
      'ANALYSIS_QUOTA_EXCEEDED': 'Monthly analysis limit reached. Upgrade to continue analyzing.',
      'GOOGLE_PLACES_QUOTA': 'Service temporarily busy. Please try again in a few minutes.',
      'REVIEW_FETCH_FAILED': 'Unable to fetch competitor reviews. Please try again.',
      
      // Authentication errors
      'AUTH_TOKEN_EXPIRED': 'Session expired. Please log in again.',
      'AUTH_INVALID_CREDENTIALS': 'Invalid email or password.',
      
      // Generic fallbacks
      'NETWORK_ERROR': 'Connection problem. Check internet and retry.',
      'SERVER_ERROR': 'Service temporarily unavailable. We\'re working on it.',
    };
    
    return messages[code] || messages.SERVER_ERROR;
  }
}
```

---

## 📱 MOBILE-FIRST COMPONENT ARCHITECTURE

### **Core Components (Review Module Only)**
```typescript
// Authentication components
interface AuthComponents {
  LoginForm: {
    fields: ['email', 'password'];
    validation: 'Zod schema with email/password rules';
    mobile: '44px touch targets, keyboard-aware layout';
    errors: 'Backend error code mapping';
  };
  
  RegisterForm: {
    fields: ['first_name', 'last_name', 'email', 'password', 'confirm_password'];
    validation: 'Password strength, email uniqueness';
    mobile: 'Single-column layout, large inputs';
    errors: 'Real-time validation feedback';
  };
  
  ProtectedRoute: {
    functionality: 'JWT validation, automatic redirect';
    loading: 'Skeleton screen during token check';
    errors: 'Graceful fallback to login';
  };
}

// Review analysis components
interface ReviewAnalysisComponents {
  ReviewAnalysisForm: {
    fields: ['restaurant_name', 'location', 'category', 'tier'];
    location: 'Google Places autocomplete with mobile optimization';
    tier: 'Free (2 competitors) vs Premium (5 competitors)';
    validation: 'Required fields, location format validation';
    mobile: 'Stacked layout, large touch targets';
  };
  
  AnalysisProgress: {
    display: 'Progress bar, current step, time remaining';
    polling: 'Smart polling (2s-10s adaptive)';
    mobile: 'Full-screen overlay, large cancel button';
    errors: 'Retry logic, graceful failure handling';
  };
  
  ReviewAnalysisResults: {
    sections: ['executive_summary', 'competitors_table', 'insights_grid', 'review_quotes'];
    mobile: 'Tabbed interface, swipeable sections';
    export: 'CSV download (basic for beta)';
    errors: 'Partial data handling, retry options';
  };
  
  CompetitorCard: {
    data: ['name', 'rating', 'review_count', 'distance_miles'];
    insights: 'Related threats/opportunities';
    mobile: 'Card-based layout, tap to expand';
    actions: 'View details, compare';
  };
  
  InsightCard: {
    types: ['threat', 'opportunity', 'watch'];
    data: ['title', 'description', 'confidence', 'proof_quote', 'mention_count'];
    mobile: 'Expandable cards, swipe actions';
    evidence: 'Review quotes with attribution';
  };
}
```

### **Mobile Interaction Patterns**
```typescript
// Touch-optimized interactions for restaurant managers
const MobileOptimizedComponents = {
  // Location input with keyboard handling
  LocationInput: {
    minHeight: '44px',
    fontSize: '16px', // Prevents zoom on iOS
    keyboardAware: 'Adjusts viewport when keyboard appears',
    autocomplete: 'Large touch targets for suggestions'
  },
  
  // Analysis progress with touch controls
  ProgressTracker: {
    progressBar: 'Large, easy to read on tablet',
    cancelButton: 'Prominent, 44px minimum',
    statusText: 'Large font, high contrast',
    timeRemaining: 'Clear, countdown format'
  },
  
  // Results with swipe navigation
  ResultsDisplay: {
    navigation: 'Bottom tabs for main sections',
    cards: 'Large, thumb-friendly',
    scrolling: 'Smooth, momentum scrolling',
    actions: 'Swipe-to-reveal secondary actions'
  }
};
```

---

## 🧪 QUALITY COMPLIANCE MATRIX (QCM) IMPLEMENTATION

### **QCM Scoring System (≥9.0/10 Required)**
```typescript
interface QCMCriteria {
  functionality: {
    weight: 0.40;
    metrics: {
      testCoverage: number;        // ≥90% required
      criticalBugs: number;        // 0 required
      featureCompleteness: number; // ≥95% required
    };
    passThreshold: 9.0;
  };
  
  performance: {
    weight: 0.20;
    metrics: {
      initialLoad: number;         // <3s required
      routeTransitions: number;    // <800ms required
      bundleSize: number;          // <600KB required
    };
    passThreshold: 8.0;
  };
  
  security: {
    weight: 0.20;
    metrics: {
      vulnerabilities: number;     // 0 critical required
      tokenSecurity: boolean;      // Secure storage required
      inputSanitization: boolean;  // XSS protection required
    };
    passThreshold: 10.0;
  };
  
  uxMobile: {
    weight: 0.20;
    metrics: {
      touchTargets: number;        // ≥44px required
      responsiveness: boolean;     // All breakpoints working
      usabilityScore: number;      // ≥9/10 from testing
    };
    passThreshold: 9.0;
  };
}

// QCM calculation
const calculateQCMScore = (metrics: QCMMetrics): number => {
  const functionalityScore = (
    (metrics.testCoverage >= 90 ? 10 : metrics.testCoverage / 9) +
    (metrics.criticalBugs === 0 ? 10 : Math.max(0, 10 - metrics.criticalBugs * 2)) +
    (metrics.featureCompleteness / 10)
  ) / 3;
  
  const performanceScore = (
    (metrics.initialLoad <= 3 ? 10 : Math.max(0, 10 - (metrics.initialLoad - 3))) +
    (metrics.routeTransitions <= 0.8 ? 10 : Math.max(0, 10 - (metrics.routeTransitions - 0.8) * 5)) +
    (metrics.bundleSize <= 600 ? 10 : Math.max(0, 10 - (metrics.bundleSize - 600) / 50))
  ) / 3;
  
  const securityScore = (
    (metrics.vulnerabilities === 0 ? 10 : 0) +
    (metrics.tokenSecurity ? 10 : 0) +
    (metrics.inputSanitization ? 10 : 0)
  ) / 3;
  
  const uxScore = (
    (metrics.touchTargets >= 44 ? 10 : metrics.touchTargets / 4.4) +
    (metrics.responsiveness ? 10 : 0) +
    metrics.usabilityScore
  ) / 3;
  
  return (
    functionalityScore * 0.40 +
    performanceScore * 0.20 +
    securityScore * 0.20 +
    uxScore * 0.20
  );
};
```

---

## 🚀 SPRINT IMPLEMENTATION PLAN

### **SPRINT 1: Authentication & Foundation (Weeks 1-2)**

**Sprint Goal:** Build secure authentication system and project foundation

**Quality Requirements:**
- ✅ 90% test coverage for auth components
- ✅ 0 critical security vulnerabilities
- ✅ Mobile responsiveness on 320px-1024px
- ✅ <3s initial load time

**Detailed Implementation:**

**Days 1-2: Project Foundation**
```bash
# Project initialization
npm create vite@latest competitive-intelligence-frontend -- --template react-ts
cd competitive-intelligence-frontend

# Install dependencies (review module only)
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
npm install @tanstack/react-query zustand axios react-router-dom
npm install react-hook-form @hookform/resolvers zod
npm install lucide-react date-fns

# Development dependencies
npm install -D @types/node @vitejs/plugin-react
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D msw @testing-library/user-event
npm install -D eslint @typescript-eslint/eslint-plugin
npm install -D prettier eslint-config-prettier

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card alert dialog badge
npx shadcn-ui@latest add form select progress skeleton toast
```

**Days 3-5: Authentication System**
```typescript
// Core authentication components
AuthProvider         // Global auth context with SecureTokenStorage
LoginForm           // Email/password with Zod validation
RegisterForm        // User registration with password confirmation
ProtectedRoute      // Route guard with loading states
UserProfile         // Display user info and subscription tier
LogoutButton        // Secure logout with cleanup

// Authentication state management
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  subscriptionTier: 'free' | 'premium' | 'enterprise';
}
```

**Days 6-7: Mobile Foundation**
```css
/* Mobile-first responsive foundation */
.auth-container {
  min-height: 100vh;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-input {
  height: 44px; /* Minimum touch target */
  font-size: 16px; /* Prevents iOS zoom */
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

@media (min-width: 768px) {
  .auth-container {
    padding: 2rem;
  }
  
  .auth-form {
    max-width: 500px;
    padding: 3rem;
  }
}
```

**Sprint 1 Audit Checklist:**
- [ ] Authentication flow works on mobile/tablet/desktop
- [ ] JWT tokens stored securely with expiration handling
- [ ] Form validation provides clear error messages
- [ ] Protected routes redirect properly
- [ ] 90% test coverage for auth components
- [ ] 0 critical security vulnerabilities
- [ ] <3s initial page load
- [ ] Responsive design works 320px-1024px+

---

### **SPRINT 2: Review Analysis Workflow (Weeks 3-4)**

**Sprint Goal:** Build complete review analysis workflow with real-time tracking

**Quality Requirements:**
- ✅ Integration with all Module 1 backend endpoints
- ✅ Real-time progress tracking with smart polling
- ✅ Mobile-optimized form and results display
- ✅ Comprehensive error handling for analysis failures

**Days 1-3: Analysis Form & Submission**
```typescript
// Review analysis form component
interface ReviewAnalysisFormData {
  restaurant_name: string;
  location: string;           // Google Places autocomplete
  category: string;           // Pizza, burger, etc.
  tier: 'free' | 'premium';   // 2 vs 5 competitors
}

const ReviewAnalysisForm = () => {
  const form = useForm<ReviewAnalysisFormData>({
    resolver: zodResolver(reviewAnalysisSchema),
    defaultValues: {
      category: 'restaurant',
      tier: 'free'
    }
  });
  
  const createAnalysis = useCreateAnalysisMutation();
  
  const onSubmit = async (data: ReviewAnalysisFormData) => {
    try {
      const result = await createAnalysis.mutateAsync({
        ...data,
        analysis_type: 'review',
        competitor_count: data.tier === 'free' ? 2 : 5
      });
      
      // Navigate to progress tracking
      navigate(`/analysis/${result.analysis_id}/progress`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };
  
  return (
    <Form {...form}>
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="restaurant_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="e.g., Park Ave Pizza"
                  className="h-12 text-base" // Mobile-optimized
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <LocationAutocomplete
                  {...field}
                  placeholder="Enter address or city, state"
                  className="h-12 text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <TierSelector 
          value={form.watch('tier')}
          onChange={(tier) => form.setValue('tier', tier)}
        />
        
        <Button 
          type="submit" 
          className="w-full h-12 text-base"
          disabled={createAnalysis.isLoading}
        >
          {createAnalysis.isLoading ? 'Starting Analysis...' : 'Analyze Competitors'}
        </Button>
      </div>
    </Form>
  );
};
```

**Days 4-5: Real-Time Progress Tracking**
```typescript
// Smart polling service for analysis progress
const useAnalysisProgress = (analysisId: string) => {
  const [isPolling, setIsPolling] = useState(true);
  
  const { data: status, error } = useQuery({
    queryKey: ['analysis-status', analysisId],
    queryFn: () => reviewAnalysisAPI.getAnalysisStatus(analysisId),
    enabled: isPolling,
    refetchInterval: (data) => {
      // Stop polling when complete
      if (data?.status === 'completed' || data?.status === 'failed') {
        setIsPolling(false);
        return false;
      }
      
      // Adaptive polling based on progress
      const progress = data?.progress_percentage || 0;
      if (progress > 80) return 1000;  // Poll faster near completion
      if (progress < 20) return 3000;  // Poll slower at start
      return 2000; // Default 2s polling
    },
    retry: (failureCount, error) => {
      // Exponential backoff for polling errors
      return failureCount < 3;
    }
  });
  
  return { status, error, isPolling };
};

// Progress display component
const AnalysisProgressTracker = ({ analysisId }: { analysisId: string }) => {
  const { status, error, isPolling } = useAnalysisProgress(analysisId);
  const navigate = useNavigate();
  
  // Handle completion
  useEffect(() => {
    if (status?.status === 'completed') {
      navigate(`/analysis/${analysisId}/results`);
    }
  }, [status?.status]);
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Analysis failed: {getErrorMessage(error)}
          <Button onClick={() => window.location.reload()} className="ml-4">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Analyzing Competitors</h2>
        <p className="text-gray-600">
          {status?.current_step || 'Starting analysis...'}
        </p>
      </div>
      
      <Progress 
        value={status?.progress_percentage || 0} 
        className="mb-4"
      />
      
      <div className="flex justify-between text-sm text-gray-500 mb-6">
        <span>{status?.progress_percentage || 0}% complete</span>
        <span>
          {status?.estimated_time_remaining_seconds 
            ? `${Math.ceil(status.estimated_time_remaining_seconds / 60)} min remaining`
            : 'Calculating...'
          }
        </span>
      </div>
      
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => navigate('/dashboard')}
      >
        Cancel Analysis
      </Button>
    </div>
  );
};
```

**Days 6-7: Basic Results Display**
```typescript
// Review analysis results component
const ReviewAnalysisResults = ({ analysisId }: { analysisId: string }) => {
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: ['analysis-results', analysisId],
    queryFn: () => reviewAnalysisAPI.getReviewAnalysisResults(analysisId),
    retry: 2
  });
  
  if (isLoading) return <ResultsSkeleton />;
  if (error) return <ErrorDisplay error={error} />;
  if (!analysis) return <NoDataDisplay />;
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Executive Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              label="Competitors Analyzed" 
              value={analysis.competitors.length} 
            />
            <StatCard 
              label="Insights Generated" 
              value={analysis.insights.length} 
            />
            <StatCard 
              label="High Confidence" 
              value={analysis.insights.filter(i => i.confidence === 'high').length} 
            />
            <StatCard 
              label="Processing Time" 
              value={`${analysis.processing_time_seconds}s`} 
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Mobile-optimized tabs */}
      <Tabs defaultValue="competitors" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>
        
        <TabsContent value="competitors">
          <CompetitorsTable competitors={analysis.competitors} />
        </TabsContent>
        
        <TabsContent value="insights">
          <InsightsGrid insights={analysis.insights} />
        </TabsContent>
        
        <TabsContent value="evidence">
          <ReviewEvidenceSection insights={analysis.insights} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
```

**Sprint 2 Audit Checklist:**
- [ ] Analysis form submits successfully to backend
- [ ] Real-time progress tracking works with smart polling
- [ ] Results display all Module 1 data correctly
- [ ] Mobile layout works on tablets (768px-1024px)
- [ ] Error handling covers all analysis failure scenarios
- [ ] CSV export generates correct data
- [ ] 90% test coverage maintained
- [ ] <800ms route transitions
- [ ] Integration tests pass with real backend