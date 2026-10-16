export type CloudProvider = 'AWS' | 'Azure' | 'GCP' | 'Hybrid';
export type ComplianceStandard = 'PCI-DSS' | 'GDPR' | 'ISO 27001' | 'HIPAA' | 'SOC 2';
export type ModernizationGoal =
  | 'Event-Driven Microservices (Kafka/EDA)'
  | 'Serverless Cloud Functions (Lambda/Cloud Run)'
  | 'Containerized Kubernetes (EKS/GKE/AKS)'
  | 'Modernized Modular Monolith';

export interface RadarScores {
  modularity: number;
  security: number;
  cloudReadiness: number;
  testability: number;
  compliance: number;
  scalability: number;
}

export interface ExecutiveSummary {
  systemName: string;
  detectedStack: string;
  healthScore: number;
  technicalDebtRatio: number;
  estimatedMaintenanceOverheadAnnualUSD: number;
  decouplingComplexity: 'Critical' | 'High' | 'Moderate' | 'Low';
  radarScores: RadarScores;
  keyFindingsSummary: string;
}

export interface AntiPattern {
  pattern: string;
  location: string;
  impact: string;
  maintenanceCostScore: number;
}

export interface TopologicalNode {
  id: string;
  name: string;
  type: 'monolith' | 'db' | 'queue' | 'client' | 'service';
  health: 'critical' | 'warning' | 'good';
  connections: string[];
}

export interface Stage1TopologyDebt {
  runtimeEnvironment: string;
  databaseEngines: string[];
  monolithicAntiPatterns: AntiPattern[];
  couplingAnalysis: string;
  circularDependencies: string[];
  deprecatedApis: string[];
  topologicalNodes: TopologicalNode[];
}

export interface VulnerabilityItem {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvss: number;
  cwe: string;
  owaspCategory: string;
  complianceViolations: string[];
  lineReference: string;
  description: string;
  remediation: string;
}

export interface ComplianceMatrix {
  pciDssStatus: 'Non-Compliant' | 'Partially-Compliant' | 'Compliant';
  gdprStatus: 'Non-Compliant' | 'Partially-Compliant' | 'Compliant';
  iso27001Status: 'Non-Compliant' | 'Partially-Compliant' | 'Compliant';
  hipaaStatus: 'Non-Compliant' | 'Partially-Compliant' | 'Compliant';
}

export interface Stage2DevSecOps {
  vulnerabilities: VulnerabilityItem[];
  complianceMatrix: ComplianceMatrix;
  hardcodedSecretsDetected: string[];
}

export interface StranglerPhase {
  step: number;
  name: string;
  action: string;
  trafficCutoverPercent: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface TargetService {
  serviceName: string;
  responsibility: string;
  techStack: string;
  cloudResources: string[];
  communicationProtocol: 'gRPC' | 'REST' | 'Kafka Event' | 'Cloud PubSub';
}

export interface Stage3CloudNativeStrangler {
  targetCloud: CloudProvider;
  recommendedArchetype: string;
  stranglerPhases: StranglerPhase[];
  targetServices: TargetService[];
}

export interface LegacySnippet {
  language: string;
  code: string;
  antiPatternAnnotations: string[];
}

export interface RefactoredSnippet {
  language: string;
  framework: string;
  code: string;
  solidPrinciplesApplied: string[];
  resiliencePatterns: string[];
  structuredLoggingIncluded: boolean;
  unitTestIncluded: boolean;
}

export interface Stage4CodeReengineering {
  legacySnippet: LegacySnippet;
  refactoredSnippet: RefactoredSnippet;
  unitTestCode?: string;
  dockerfile?: string;
}

export interface RoadmapPhase {
  timeline: string;
  milestones: string[];
  remediationBudgetEstUSD: number;
  riskReductionPercent: number;
}

export interface RoiAnalysis {
  currentAnnualRunCostUSD: number;
  projectedModernizedRunCostUSD: number;
  netAnnualSavingsUSD: number;
  paybackPeriodMonths: number;
}

export interface Stage5Deliverables {
  roadmapPhases: RoadmapPhase[];
  roiAnalysis: RoiAnalysis;
  executiveRecommendations: string[];
}

export interface AuditReport {
  executiveSummary: ExecutiveSummary;
  stage1_topologyDebt: Stage1TopologyDebt;
  stage2_devSecOpsCompliance: Stage2DevSecOps;
  stage3_cloudNativeStrangler: Stage3CloudNativeStrangler;
  stage4_codeReengineering: Stage4CodeReengineering;
  stage5_deliverablesRoadmap: Stage5Deliverables;
}

export interface AuditApiResponse {
  success: boolean;
  source: 'gemini-3.8-flash' | 'local-expert-rules';
  audit: AuditReport;
}
