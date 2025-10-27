# Frontend Analysis Flow Requirements

## Introduction

This feature implements the complete user flow for competitive analysis from form submission through progress tracking to results display. Users will be able to submit analysis requests via `/api/v1/analysis/run`, monitor progress in real-time via `/api/v1/analysis/{id}/status`, and view comprehensive results via `/api/v1/analysis/{id}`.

## Glossary

- **ReviewAnalysisAPIService**: The frontend service class that handles all API communication with the backend
- **AnalysisProgressTracker**: React component that displays real-time status updates during analysis processing
- **ReviewAnalysisResults**: React component that renders comprehensive analysis outcomes including competitors and insights
- **Navigation_Flow**: The React Router system that manages routing between `/analysis/new`, `/analysis/{id}/progress`, and `/analysis/{id}/results`
- **AnalysisStatus**: TypeScript interface defining progress tracking data structure
- **ReviewAnalysisResponse**: TypeScript interface defining complete analysis results data structure

## Requirements

### Requirement 1

**User Story:** As a restaurant owner, I want to submit an analysis request and be guided through the complete process, so that I can easily track my analysis and view results.

#### Acceptance Criteria

1. WHEN the user submits the ReviewAnalysisForm, THE Navigation_Flow SHALL redirect to `/analysis/{analysisId}/progress`
2. WHILE the analysis is processing, THE AnalysisProgressTracker SHALL poll `/api/v1/analysis/{id}/status` for real-time updates
3. WHEN the analysis status becomes "completed", THE Navigation_Flow SHALL automatically redirect to `/analysis/{analysisId}/results`
4. IF the analysis status becomes "failed", THEN THE AnalysisProgressTracker SHALL display error_message with retry options
5. WHERE the user navigates directly to `/analysis/{analysisId}/results`, THE ReviewAnalysisResults SHALL call `/api/v1/analysis/{id}` to load completed analysis

### Requirement 2

**User Story:** As a restaurant owner, I want to see real-time progress updates during analysis, so that I know the system is working and understand how long it will take.

#### Acceptance Criteria

1. WHEN the analysis starts, THE AnalysisProgressTracker SHALL display current_step from AnalysisStatus interface
2. WHILE the analysis is processing, THE AnalysisProgressTracker SHALL show progress_percentage with Progress component
3. THE AnalysisProgressTracker SHALL display estimated_time_remaining_seconds in human-readable format
4. THE AnalysisProgressTracker SHALL use adaptive polling intervals based on progress_percentage (1s when >80%, 2s default, 3s when <20%)
5. WHEN the tab becomes hidden, THE useAnalysisProgress hook SHALL reduce polling frequency to 10s for battery optimization

### Requirement 3

**User Story:** As a restaurant owner, I want to view comprehensive analysis results in a professional format, so that I can understand my competitive landscape and actionable insights.

#### Acceptance Criteria

1. WHEN the ReviewAnalysisResultsPage loads, THE ReviewAnalysisResults SHALL display restaurant_name, location, and analysis metadata from ReviewAnalysisResponse
2. THE CompetitorsTable SHALL present competitors array with name, rating, review_count, distance_miles, and address
3. THE InsightsGrid SHALL organize insights array by type ('threat', 'opportunity', 'watch') with confidence levels ('high', 'medium', 'low')
4. THE ReviewEvidenceSection SHALL display proof_quote and competitor_name for each insight with mention_count
5. WHERE no analysis data exists, THE ReviewAnalysisResults SHALL show Alert component with appropriate messaging

### Requirement 4

**User Story:** As a restaurant owner, I want proper error handling throughout the analysis flow, so that I understand what went wrong and can take corrective action.

#### Acceptance Criteria

1. IF the ReviewAnalysisAPIService.createReviewAnalysis fails, THEN THE ReviewAnalysisForm SHALL display error via useToast hook
2. IF the useAnalysisProgress polling fails, THEN THE AnalysisProgressTracker SHALL show Alert component with retry Button
3. IF the ReviewAnalysisAPIService.getReviewAnalysisResults fails, THEN THE ReviewAnalysisResults SHALL show Alert variant="destructive" with reload option
4. WHEN network errors occur, THE ReviewAnalysisAPIService SHALL use setupInterceptors to provide user-friendly error messages
5. WHERE authentication expires, THE ReviewAnalysisAPIService SHALL clear auth token and redirect via useAuthStore

### Requirement 5

**User Story:** As a restaurant owner, I want seamless navigation between analysis stages, so that I can easily move through the process without confusion.

#### Acceptance Criteria

1. THE Navigation_Flow SHALL add routes for `/analysis/:analysisId/progress` and `/analysis/:analysisId/results` to App.tsx
2. THE Navigation_Flow SHALL wrap both routes with ProtectedRoute component for authentication
3. THE Navigation_Flow SHALL validate analysisId parameter exists using useParams hook before rendering components
4. THE Navigation_Flow SHALL provide "Back to Dashboard" Button components that navigate to `/dashboard`
5. WHERE users access invalid analysisId URLs, THE Navigation_Flow SHALL display Alert component and redirect to dashboard