export type CampaignReport = {
  id: string;
  tabLabel: string;
  tabMetric: string;
  title: string;
  context: string;
  platform: "Google Ads" | "Amazon Ads";
  period: string;
  keyMetrics: { label: string; value: string }[];
  secondaryMetrics: { label: string; value: string }[];
  interpretation: string;
  work: string[];
  limitation: string;
  calculation?: string;
  evidence: { src: string; alt: string; width: number; height: number };
};

// Rounded values retain the report currency. Ratios calculated from the
// unrounded source figures are explicitly identified in the interface.
export const campaignEvidence: CampaignReport[] = [
  {
    id: "amazon-marketplace",
    tabLabel: "Amazon Ads / marketplace",
    tabMetric: "9.80x reported ROAS",
    title: "Marketplace advertising for a consumer technology brand.",
    context: "Track attributed purchases and sales against marketplace advertising spend.",
    platform: "Amazon Ads",
    period: "13 Oct 2025-13 Oct 2026",
    keyMetrics: [
      { label: "Ad spend", value: "₹5.55 million" },
      { label: "Attributed sales", value: "₹54.34 million" },
      { label: "Attributed purchases", value: "43.6K" },
      { label: "Reported ROAS", value: "9.80x" },
    ],
    secondaryMetrics: [
      { label: "Clicks", value: "366K" },
      { label: "Average cost per click", value: "₹15.14" },
      { label: "Advertising cost of sales (ACOS)", value: "10.21%" },
    ],
    interpretation:
      "Amazon attributed ₹9.80 in sales to every ₹1 of ad spend during this reporting period.",
    work: [
      "Reviewed website tracking before evaluating channel performance.",
      "Ran search and marketplace advertising as part of the wider engagement.",
    ],
    limitation:
      "Attributed sales are not proof of additional sales caused by ads. ROAS is not profit or ROI and does not include other business costs.",
    evidence: {
      src: "/assets/performance-evidence/consumer-marketplace-report.png",
      alt: "Redacted Amazon Ads report showing ₹5,546,734.40 spend, 43,623 attributed purchases, ₹54,338,608.71 sales, and 9.80 ROAS",
      width: 2048,
      height: 973,
    },
  },
  {
    id: "industrial-search",
    tabLabel: "Google Ads / B2B search",
    tabMetric: "266 tracked conversions",
    title: "Paid search for an industrial manufacturer.",
    context: "Help buyers find product categories beyond the manufacturer’s best-known lines.",
    platform: "Google Ads",
    period: "15 Jul-12 Oct 2026 / 90 days",
    keyMetrics: [
      { label: "Ad spend", value: "₹203K" },
      { label: "Tracked conversions", value: "266" },
      { label: "Clicks", value: "4.30K" },
      { label: "Cost / conversion (calculated)", value: "₹763.38" },
    ],
    secondaryMetrics: [
      { label: "Impressions", value: "25.3K" },
      { label: "Average cost per click", value: "₹47.21" },
      { label: "Exact source spend", value: "₹203,060.06" },
    ],
    interpretation:
      "The account recorded 266 conversion actions from 4.30K clicks. Average spend per tracked action was ₹763.38.",
    work: [
      "Grouped search campaigns around less-visible product categories.",
      "Matched campaigns to relevant buyer searches.",
    ],
    limitation:
      "Conversion actions are not verified sales or qualified leads. The report alone cannot show lead quality or revenue.",
    calculation:
      "Cost per conversion is calculated from ₹203,060.06 ÷ 266 tracked conversions. K means thousand; headline values are rounded.",
    evidence: {
      src: "/assets/performance-evidence/industrial-search-report.png",
      alt: "Redacted Google Ads report showing ₹203,060.06 spend, 25,311 impressions, 4,301 clicks, 266 tracked conversions, and ₹47.21 average CPC",
      width: 2048,
      height: 620,
    },
  },
  {
    id: "consumer-search",
    tabLabel: "Google Ads / consumer search",
    tabMetric: "₹11.87 million recorded value",
    title: "Paid search for a consumer technology brand.",
    context: "Review tracking and compare recorded conversion value with Google Ads spend.",
    platform: "Google Ads",
    period: "15 Jul-12 Oct 2026 / 90 days",
    keyMetrics: [
      { label: "Ad spend", value: "₹2.75 million" },
      { label: "Recorded conversion value", value: "₹11.87 million" },
      { label: "Tracked conversions", value: "5.84K" },
      { label: "Value / spend (calculated)", value: "4.31x" },
    ],
    secondaryMetrics: [
      { label: "Impressions", value: "839K" },
      { label: "Average cost per click", value: "₹7.92" },
      { label: "Cost / conversion (calculated)", value: "₹471.28" },
    ],
    interpretation:
      "Google recorded approximately ₹4.31 in conversion value for every ₹1 of ad spend in this 90-day report.",
    work: [
      "Reviewed and corrected website tracking.",
      "Ran paid search alongside marketplace advertising; this report covers Google Ads only.",
    ],
    limitation:
      "Recorded conversion value is not independently verified revenue or profit. This report is not combined with the Amazon reporting period.",
    calculation:
      "Value / spend uses ₹11,866,687.13 ÷ ₹2,750,711.36. Cost per conversion uses ₹2,750,711.36 ÷ 5,836.63 platform-recorded conversions. K means thousand; headline values are rounded.",
    evidence: {
      src: "/assets/performance-evidence/consumer-search-report.png",
      alt: "Redacted Google Ads report showing ₹2,750,711.36 spend, 5,836.63 tracked conversions, ₹11,866,687.13 conversion value, and ₹7.92 average CPC",
      width: 2048,
      height: 1150,
    },
  },
];
