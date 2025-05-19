"use client";
// vape made this
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, AlertTriangle, Info, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScanFinding {
  severity?: string | number;
  title?: string;
  name?: string;
  type?: string;
  description?: string;
  message?: string;
  location?: string;
  path?: string;
  details?: Record<string, unknown>;
  rule_name?: string;
  file?: string;
  category?: string;
  [key: string]: unknown;
}

interface ScanSummary {
  description?: string;
  categories?: string[];
  [key: string]: unknown;
}

interface NormalizedScanResult {
  summary: ScanSummary;
  findings: ScanFinding[];
  recommendations?: { title?: string; description?: string }[] | string;
}

interface FormattedReportProps {
  result: unknown;
}


const SeverityIcon = ({ level }: { level: string }) => {
  switch (level?.toLowerCase()) {
    case 'high':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'medium':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'low':
      return <Info className="w-4 h-4 text-blue-500" />;
    case 'safe':
    case 'clean':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    default:
      return <Info className="w-4 h-4 text-gray-500" />;
  }
};


const ExpandableSection = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border/30 rounded-lg mb-3 overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-3 bg-card/50 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{title}</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="p-3 bg-background/30">
          {children}
        </div>
      )}
    </div>
  );
};

export const FormattedReport: React.FC<FormattedReportProps> = ({ result }) => {
  if (!result) return null;

  const normalizeResult = (data: unknown): NormalizedScanResult => {
    let parsed: unknown = data;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return {
          summary: { description: "Raw scan result" },
          findings: [{
            severity: "info",
            title: "Scan Output",
            description: "Raw output from scanner",
            details: parsed as Record<string, unknown>
          }]
        };
      }
    }

    // Type guard for object
    if (typeof parsed !== 'object' || parsed === null) {
      return {
        summary: { description: "Scan completed. See details below." },
        findings: []
      };
    }
    // Now parsed is object
    const obj = parsed as Record<string, unknown>;

    if ('error' in obj) {
      return {
        summary: { description: "Scan encountered an error" },
        findings: [{
          severity: "high",
          title: "Error",
          description: typeof obj.error === 'string' ? obj.error : "Unknown error occurred"
        }]
      };
    }

    if ('results' in obj && typeof obj.results === 'object' && obj.results !== null) {
      return normalizeResult(obj.results);
    }

    if ('findings' in obj && Array.isArray(obj.findings) && 'summary' in obj && typeof obj.summary === 'object' && obj.summary !== null) {
      return obj as unknown as NormalizedScanResult;
    }

    if (obj.cryptography || obj.authentication || obj.networking || obj.permissions) {
      const findings: ScanFinding[] = [];
      const categories = Object.keys(obj);
      categories.forEach((category: string) => {
        const arr = obj[category];
        if (Array.isArray(arr)) {
          arr.forEach((item: Record<string, unknown>) => {
            let severityText = "info";
            if (typeof item.severity === 'number') {
              if (item.severity >= 4) severityText = "high";
              else if (item.severity >= 3) severityText = "medium";
              else if (item.severity >= 2) severityText = "low";
            } else if (typeof item.severity === 'string') {
              severityText = item.severity.toLowerCase();
            }
            findings.push({
              severity: severityText,
              title: typeof item.rule_name === 'string' ? item.rule_name : (typeof item.file === 'string' ? item.file : `${category} Finding`),
              description: typeof item.description === 'string' ? item.description : `${category} related finding`,
              category: category,
              location: typeof item.file === 'string' ? item.file : "",
              details: {
                ...item,
                explanation: getCategoryExplanation(category, typeof item.rule_name === 'string' ? item.rule_name : undefined)
              }
            });
          });
        }
      });
      return {
        summary: {
          description: "JAR File Security Analysis",
          categories: categories
        },
        findings
      };
    }

    if ('issues' in obj && Array.isArray(obj.issues) || 'alerts' in obj && Array.isArray(obj.alerts) || 'vulnerabilities' in obj && Array.isArray(obj.vulnerabilities)) {
      const findings = (obj.issues as unknown[] ?? obj.alerts as unknown[] ?? obj.vulnerabilities as unknown[] ?? []) as ScanFinding[];
      return {
        summary: (obj.summary as ScanSummary) || { description: "Scan completed" },
        findings: findings.map((item: ScanFinding) => ({
          severity: typeof item.severity === 'string' || typeof item.severity === 'number' ? item.severity : 'info',
          title: typeof item.title === 'string' ? item.title : (typeof item.name === 'string' ? item.name : (typeof item.type === 'string' ? item.type : 'Finding')),
          description: typeof item.description === 'string' ? item.description : (typeof item.message === 'string' ? item.message : ''),
          location: typeof item.location === 'string' ? item.location : (typeof item.path === 'string' ? item.path : ''),
          details: item.details || item
        }))
      };
    }

    if (Array.isArray(obj)) {
      return {
        summary: { description: "Scan completed" },
        findings: (obj as ScanFinding[]).map((item: ScanFinding) => ({
          severity: typeof item.severity === 'string' || typeof item.severity === 'number' ? item.severity : 'info',
          title: typeof item.title === 'string' ? item.title : (typeof item.name === 'string' ? item.name : (typeof item.type === 'string' ? item.type : 'Finding')),
          description: typeof item.description === 'string' ? item.description : (typeof item.message === 'string' ? item.message : ''),
          location: typeof item.location === 'string' ? item.location : (typeof item.path === 'string' ? item.path : ''),
          details: item.details || item
        }))
      };
    }

    if ('malware' in obj || 'suspicious' in obj || 'obfuscated' in obj) {
      const findings: ScanFinding[] = [];
      if (obj.malware) {
        findings.push({
          severity: "high",
          title: "Malware Detected",
          description: "The file contains known malware patterns",
          details: obj.malware as Record<string, unknown>
        });
      }
      if (obj.suspicious) {
        findings.push({
          severity: "medium",
          title: "Suspicious Code",
          description: "The file contains suspicious code patterns",
          details: obj.suspicious as Record<string, unknown>
        });
      }
      if (obj.obfuscated) {
        findings.push({
          severity: "medium",
          title: "Obfuscated Code",
          description: "The file contains obfuscated code which may hide malicious intent",
          details: obj.obfuscated as Record<string, unknown>
        });
      }
      return {
        summary: {
          description: (obj.summary as string) || "Malware scan completed"
        },
        findings
      };
    }

    return {
      summary: {
        description: "Scan completed. See details below."
      },
      findings: [
        {
          severity: "info",
          title: "Scan Results",
          description: "Complete scan output",
          details: obj
        }
      ]
    };
  };


  const getCategoryExplanation = (category: string, ruleName?: string): string => {
    const explanations: Record<string, Record<string, string>> = {
      cryptography: {
        default: "Cryptographic functions can be used for legitimate purposes but are also commonly used in malware for encryption, obfuscation, or data exfiltration.",
        message_digest: "Message digest algorithms create hash values from data. While useful for data integrity checks, they can also be used to evade detection or verify malicious payloads.",
        aes_usage: "AES (Advanced Encryption Standard) is a strong encryption algorithm. While it has legitimate uses, malware often uses it to encrypt data before exfiltration or to encrypt payloads to avoid detection."
      },
      authentication: {
        default: "Authentication-related code can access sensitive credentials or session information.",
        session_id_method_yarn: "Methods that access session IDs can potentially be used to hijack user sessions or steal authentication tokens."
      },
      networking: {
        default: "Network-related code can establish connections to remote servers, potentially for command and control or data exfiltration."
      },
      permissions: {
        default: "Code that manipulates permissions can be used to escalate privileges or bypass security controls."
      }
    };

    if (ruleName && explanations[category] && explanations[category][ruleName]) {
      return explanations[category][ruleName];
    }

    return explanations[category]?.default ||
      "This finding indicates potentially suspicious code that should be reviewed for security implications.";
  };


  const normalizedResult = normalizeResult(result);


  const groupFindings = (findings: ScanFinding[]) => {
    const groups: Record<string, { finding: ScanFinding, locations: string[] }> = {};
    findings.forEach(finding => {
      const key = [finding.rule_name || finding.title || '', finding.severity || '', finding.category || '', finding.description || ''].join('||');
      if (!groups[key]) {
        groups[key] = { finding, locations: [] };
      }
      if (finding.location && !groups[key].locations.includes(finding.location)) {
        groups[key].locations.push(finding.location);
      }
    });
    return Object.values(groups);
  };

  const FindingGroupCard = ({ finding, locations }: { finding: ScanFinding, locations: string[] }) => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="rounded-xl bg-card/30 border border-border/30 shadow-sm mb-2">
        <div className="flex items-center gap-3 px-4 pt-4 pb-1">
          <SeverityIcon level={String(finding.severity ?? finding.level ?? 'info')} />
          <span className={
            `px-2 py-0.5 rounded-full text-xs font-mono ${
              String(finding.severity).toLowerCase() === 'high' ? 'bg-red-900/40 text-red-300 border border-red-700/40' :
              String(finding.severity).toLowerCase() === 'medium' ? 'bg-yellow-900/40 text-yellow-200 border border-yellow-700/40' :
              String(finding.severity).toLowerCase() === 'low' ? 'bg-blue-900/40 text-blue-200 border border-blue-700/40' :
              'bg-muted/30 text-muted-foreground border border-border/30'
            }`
          }>{finding.rule_name || finding.title || `Finding`}</span>
          <div className="flex-1" />
          {finding.severity && (
            <Badge
              variant={
                String(finding.severity).toLowerCase() === 'high' ? 'destructive' :
                String(finding.severity).toLowerCase() === 'medium' ? 'warning' :
                String(finding.severity).toLowerCase() === 'low' ? 'info' : 'outline'
              }
              className="ml-2 text-xs px-2 py-1 rounded-full uppercase"
            >can you 
              {String(finding.severity)}
            </Badge>
          )}
        </div>
        {finding.description && (
          <div className="px-4 pb-1 pt-1 text-sm text-muted-foreground font-normal">
            {finding.description}
          </div>
        )}
        <div className="px-4 pb-3">
          {locations.length > 0 && (
            <div className="text-xs mt-1 mb-1">
              <button
                className="flex items-center gap-1 text-primary hover:underline font-medium"
                onClick={() => setOpen(o => !o)}
                type="button"
              >
                {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {open ? 'Hide locations' : `Show ${locations.length} location${locations.length > 1 ? 's' : ''}`}
              </button>
              {open && (
                <ul className="mt-2 pl-4 list-disc space-y-1 text-muted-foreground">
                  {locations.map((loc, i) => (
                    <li key={i} className="font-mono break-all">{loc}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const formatFindings = (findings: ScanFinding[]) => {
    if (!findings || !Array.isArray(findings) || findings.length === 0) {
      return (
        <div className="bg-card/20 p-4 rounded-lg border border-border/20 text-center">
          <p className="text-muted-foreground">No findings detected in this scan.</p>
        </div>
      );
    }
    const findingsByCategory: Record<string, ScanFinding[]> = {};
    findings.forEach(finding => {
      const category = finding.category || 'general';
      if (!findingsByCategory[category]) {
        findingsByCategory[category] = [];
      }
      findingsByCategory[category].push(finding);
    });
    if (Object.keys(findingsByCategory).length > 1) {
      return (
        <div className="space-y-4">
          {Object.entries(findingsByCategory).map(([category, categoryFindings]) => (
            <ExpandableSection
              key={category}
              title={`${category.charAt(0).toUpperCase() + category.slice(1)} (${categoryFindings.length})`}
              defaultOpen={true}
            >
              <div className="space-y-3">
                {groupFindings(categoryFindings).map((group, index) => (
                  <FindingGroupCard key={index} finding={group.finding} locations={group.locations} />
                ))}
              </div>
            </ExpandableSection>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {groupFindings(findings).map((group, index) => (
          <FindingGroupCard key={index} finding={group.finding} locations={group.locations} />
        ))}
      </div>
    );
  };


  const formatSummary = () => {
    const summary = normalizedResult.summary || {};
    const findings = normalizedResult.findings || [];


    const stats = {
      total: findings.length,
      high: findings.filter((f: ScanFinding) => String(f.severity).toLowerCase() === 'high').length,
      medium: findings.filter((f: ScanFinding) => String(f.severity).toLowerCase() === 'medium').length,
      low: findings.filter((f: ScanFinding) => String(f.severity).toLowerCase() === 'low').length,
      info: findings.filter((f: ScanFinding) =>
        String(f.severity).toLowerCase() === 'info' ||
        !f.severity ||
        !['high', 'medium', 'low'].includes(String(f.severity).toLowerCase())
      ).length
    };


    const categoryStats: Record<string, number> = {};
    findings.forEach((finding: ScanFinding) => {
      if (typeof finding.category === 'string') {
        categoryStats[finding.category] = (categoryStats[finding.category] || 0) + 1;
      }
    });
    const hasCategories = Object.keys(categoryStats).length > 0;

    // score breakdown calculation ported from backend
    const calculateScoreBreakdown = (findings: ScanFinding[]) => {
      const categoryWeights: Record<string, (sev: number) => number> = {
        authentication: (sev) => sev >= 4 ? 0.9 : 0.5,
        file_paths: (sev) => sev >= 3 ? 0.7 : 0.2,
        class_loading: (sev) => sev >= 3 ? 0.7 : 0.2,
        obfuscation: () => 0.2,
        network: () => 0.3,
        reflection: (sev) => sev >= 3 ? 0.1 : 0.01,
        urls: () => 0.2,
      };
      const severityWeights: Record<number, number> = {
        0: 0.0,
        1: 2.0,
        2: 5.0,
        3: 20.0,
        4: 100.0,
        5: 0.0,
      };
      let score = 0;
      let n = 0;
      let maxSeverity = 0;
      let critical = false;
      let suspicious = false;
      let auth_high = 0;
      let filepath_high = 0;
      let classload_high = 0;
      const perCategory: Record<string, {score: number, count: number, findings: ScanFinding[]}> = {};
      const reasons: string[] = [];
      findings.forEach((m) => {
        n++;
        const cat = m.category || 'general';
        const sev = typeof m.severity === 'number' ? m.severity :
          (typeof m.severity === 'string' ? (m.severity.toLowerCase() === 'high' ? 4 : m.severity.toLowerCase() === 'medium' ? 3 : m.severity.toLowerCase() === 'low' ? 2 : 0) : 0);
        const catWeight = (categoryWeights[cat]?.(sev)) ?? 0.1;
        const sevWeight = severityWeights[sev] ?? 0.0;
        const likelyFP = (m.rule_name || '').toLowerCase().includes('test') || (m.description || '').toLowerCase().includes('test') || (m.rule_name || '').toLowerCase().includes('example') || (m.description || '').toLowerCase().includes('example') || (m.rule_name || '').toLowerCase().includes('sample') || (m.description || '').toLowerCase().includes('sample');
        const fpWeight = likelyFP ? 0.1 : 1.0;
        const findingScore = catWeight * sevWeight * fpWeight;
        score += findingScore;
        maxSeverity = Math.max(maxSeverity, sev);
        if (!perCategory[cat]) perCategory[cat] = {score: 0, count: 0, findings: []};
        perCategory[cat].score += findingScore;
        perCategory[cat].count += 1;
        perCategory[cat].findings.push(m);
        if (["obfuscation", "network", "reflection", "urls"].includes(cat) && sev >= 3) suspicious = true;
        if (cat === "authentication" && sev >= 4) auth_high++;
        if (cat === "file_paths" && sev >= 3) filepath_high++;
        if (cat === "class_loading" && sev >= 3) classload_high++;
      });
      if (n > 10) score *= 10.0 / n;
      let verdict = "Benign";
      let severity = "None";
      let mappedScore = Math.round(score);
      if (n === 0) {
        verdict = "Benign";
        severity = "None";
        mappedScore = 0;
      } else if ((auth_high >= 2 && filepath_high >= 1) || (auth_high >= 1 && filepath_high >= 2) || (auth_high >= 1 && classload_high >= 1) || (filepath_high >= 1 && classload_high >= 1)) {
        score = Math.max(score, 90.0);
        critical = true;
        reasons.push("Multiple high-severity authentication/file_paths/class_loading findings");
      }
      if (critical || score >= 90.0) {
        verdict = "Malicious";
        severity = "High";
        mappedScore = Math.max(90, Math.min(100, mappedScore));
        if (!reasons.length) reasons.push("Critical category with high severity");
      } else if (suspicious || score >= 60.0) {
        verdict = "Suspicious";
        severity = "Medium";
        mappedScore = Math.max(60, Math.min(89, mappedScore));
        if (!reasons.length) reasons.push("Suspicious category with medium/high severity");
      } else if (score >= 20.0) {
        verdict = "Undetected";
        severity = "Low";
        mappedScore = Math.max(20, Math.min(59, mappedScore));
        if (!reasons.length) reasons.push("Low score, minor issues");
      } else {
        verdict = "Benign";
        severity = "None";
        mappedScore = Math.min(19, mappedScore);
        if (!reasons.length) reasons.push("Score too low for concern");
      }
      return {
        perCategory,
        totalScore: score,
        mappedScore,
        verdict,
        severity,
        reasons,
        n
      };
    };

    return (
      <div className="space-y-4">

        <div className="bg-card/20 p-4 rounded-lg border border-border/20">
          <h3 className="font-medium mb-2">Analysis Summary</h3>
          <p className="text-sm text-muted-foreground">
            {typeof summary.description === 'string' ? summary.description : "This report shows the results of scanning the JAR file for potential security issues."}
          </p>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-card/20 p-3 rounded-lg border border-border/20 flex flex-col items-center">
            <span className="text-sm text-muted-foreground">Total Findings</span>
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>

          <div className="bg-card/20 p-3 rounded-lg border border-border/20">
            <h3 className="text-sm text-muted-foreground text-center mb-2">Findings by Severity</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'High', count: stats.high, color: 'red' },
                { label: 'Medium', count: stats.medium, color: 'yellow' },
                { label: 'Low', count: stats.low, color: 'blue' },
                { label: 'Info', count: stats.info, color: 'gray' }
              ].map(item => (
                <div key={item.label} className={cn(
                  "p-2 rounded-lg flex flex-col items-center",
                  item.color === 'red' ? "bg-red-500/10 border border-red-500/20" :
                  item.color === 'yellow' ? "bg-yellow-500/10 border border-yellow-500/20" :
                  item.color === 'blue' ? "bg-blue-500/10 border border-blue-500/20" :
                  "bg-gray-500/10 border border-gray-500/20"
                )}>
                  <span className="text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-lg font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card/20 p-4 rounded-lg border border-border/20">
          <h3 className="font-medium mb-2">Score Breakdown</h3>
          {(() => {
            const breakdown = calculateScoreBreakdown(findings);
            return (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 text-sm">
                  {Object.entries(breakdown.perCategory).sort((a, b) => b[1].score - a[1].score).map(([cat, val]) => (
                    <div key={cat} className="bg-background/40 border border-border/20 rounded px-2 py-1">
                      <span className="font-medium">{cat}</span>: {val.score.toFixed(1)} ({val.count} finding{val.count > 1 ? 's' : ''})
                    </div>
                  ))}
                </div>
                <div className="text-sm mt-2">
                  <span className="font-medium">Total Score:</span> {breakdown.totalScore.toFixed(1)} (<span className="font-medium">Normalized:</span> {breakdown.mappedScore})<br />
                  <span className="font-medium">Verdict:</span> {breakdown.verdict} <span className="text-muted-foreground">({breakdown.severity})</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {breakdown.reasons.map((r, i) => <div key={i}>Reason: {r}</div>)}
                </div>
              </div>
            );
          })()}
        </div>

        <div className="bg-card/20 p-4 rounded-lg border border-border/20">
          <h3 className="font-medium mb-2">What This Means</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>This report analyzes the JAR file for potential security issues:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-red-500 font-medium">High severity</span> findings indicate potential malware or serious security risks</li>
              <li><span className="text-yellow-500 font-medium">Medium severity</span> findings indicate suspicious code that should be reviewed</li>
              <li><span className="text-blue-500 font-medium">Low severity</span> findings indicate minor issues or potential false positives</li>
              <li><span className="text-gray-500 font-medium">Info</span> findings provide additional context about the scan</li>
            </ul>

            {hasCategories && (
              <>
                <p className="mt-3">The scan detected issues in the following categories:</p>
                <ul className="list-disc pl-5 space-y-1">
                  {Object.keys(categoryStats).includes('cryptography') && (
                    <li><span className="font-medium">Cryptography</span>: Use of encryption algorithms that could be used for data obfuscation or exfiltration</li>
                  )}
                  {Object.keys(categoryStats).includes('authentication') && (
                    <li><span className="font-medium">Authentication</span>: Code that accesses or manipulates authentication credentials or sessions</li>
                  )}
                  {Object.keys(categoryStats).includes('networking') && (
                    <li><span className="font-medium">Networking</span>: Network-related code that could establish external connections</li>
                  )}
                  {Object.keys(categoryStats).includes('permissions') && (
                    <li><span className="font-medium">Permissions</span>: Code that manipulates system permissions or security controls</li>
                  )}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };


  const hasSummary = !!normalizedResult.summary;
  const hasFindings = Array.isArray(normalizedResult.findings) && normalizedResult.findings.length > 0;
  const hasRecommendations = !!normalizedResult.recommendations;


  const defaultTab = hasSummary ? "summary" : hasFindings ? "findings" : "raw";

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="mb-4 bg-card/30 p-1 rounded-full border border-border/20 mx-auto">
        {hasSummary && <TabsTrigger value="summary" className="rounded-full">Summary</TabsTrigger>}
        {hasFindings && <TabsTrigger value="findings" className="rounded-full">Findings</TabsTrigger>}
        {hasRecommendations && <TabsTrigger value="recommendations" className="rounded-full">Recommendations</TabsTrigger>}
      </TabsList>

      {hasSummary && (
        <TabsContent value="summary" className="mt-0">
          {formatSummary()}
        </TabsContent>
      )}

      {hasFindings && (
        <TabsContent value="findings" className="mt-0">
          {formatFindings(normalizedResult.findings || [])}
        </TabsContent>
      )}

      {hasRecommendations && (
        <TabsContent value="recommendations" className="mt-0">
          <div className="space-y-3">
            {Array.isArray(normalizedResult.recommendations) ? (
              normalizedResult.recommendations.map((rec: { title?: string; description?: string }, index: number) => (
                <div key={index} className="bg-card/20 p-4 rounded-lg border border-border/20">
                  <h3 className="font-medium mb-2">{rec.title || `Recommendation #${index + 1}`}</h3>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              ))
            ) : (
              <div className="bg-card/20 p-4 rounded-lg border border-border/20">
                <p className="text-sm text-muted-foreground">{normalizedResult.recommendations as string}</p>
              </div>
            )}
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
};
