// src/types/index.ts

// 1. RAW LOG SCHEMA: Maps exactly to the parsed ZScaler CSV
export interface ZScalerLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  url: string;
  app: string;
  category: string;
  clientIp: string;
  serverIp: string;
  requestMethod: string;
  responseCode: string;
  userAgent: string;
  sentBytes: number;
  receivedBytes: number;
  threatName?: string;
  threatSeverity?: string;
}

// 2. DEEPSEEK-R1 ANOMALY SCHEMA: Deep forensic reasoning for a specific event
export interface AnomalyDetail {
  id: string;
  timestamp: string;
  action: string;
  url: string;
  clientIp: string; // Added so analysts can pivot
  category: string;
  reasoning: string; // Populated by DeepSeek-R1
  confidenceScore: number; // 0-100
  severity: "critical" | "high" | "medium" | "low";
}

// 3. GEMINI 1.5 FLASH REPORT SCHEMA: The overarching log summary
export interface AnalysisReport {
  jobId: string;
  status: "processing" | "completed" | "failed";
  filename: string;
  timestamp: string;
  summary: string; // Populated by Gemini 1.5 Flash
  anomalies: AnomalyDetail[]; // Array of DeepSeek-R1 findings
}

// 4. PLATFORM SCHEMAS: For global tables and dashboards
export interface LogFileHistory {
  id: string;
  filename: string;
  uploadDate: string;
  status: "Processing" | "Completed" | "Failed";
  size: string;
}

// types/index.ts
export type ThreatCategory =
  | "Normal Traffic"
  | "Data Exfiltration"
  | "Malware Callback (C2)"
  | "Malicious Download"
  | "Phishing & Credential Theft"
  | "Evasion & Anonymizer"
  | "Reconnaissance & Probing"
  | "Shadow IT"
  | "Policy Violation";

// Future work: Use this to keep chart colors and timeline badges perfectly synced
export const getCategoryColor = (category: ThreatCategory): string => {
  switch (category) {
    case "Data Exfiltration":
      return "red";
    case "Malware Callback (C2)":
      return "violet";
    case "Malicious Download":
      return "orange";
    case "Phishing & Credential Theft":
      return "yellow";
    case "Evasion & Anonymizer":
      return "grape";
    case "Reconnaissance & Probing":
      return "indigo";
    case "Shadow IT":
      return "blue";
    case "Policy Violation":
      return "cyan";
    case "Normal Traffic":
      return "gray";
    default:
      return "gray";
  }
};
