import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { campaignEvidence } from "../src/performance-evidence.ts";

const report = (id) => campaignEvidence.find((item) => item.id === id);
const metric = (item, label) =>
  [...item.keyMetrics, ...item.secondaryMetrics].find((entry) => entry.label === label)?.value;

test("keeps three separately identified reports with their own periods", () => {
  assert.equal(campaignEvidence.length, 3);
  assert.equal(new Set(campaignEvidence.map((item) => item.id)).size, 3);
  assert.equal(report("amazon-marketplace").period, "13 Oct 2025-13 Oct 2026");
  assert.equal(report("industrial-search").period, "15 Jul-12 Oct 2026 / 90 days");
  assert.equal(report("consumer-search").period, "15 Jul-12 Oct 2026 / 90 days");
});

test("all report assets exist and preserve supplied dimensions", () => {
  for (const item of campaignEvidence) {
    assert.ok(existsSync(new URL(`../public${item.evidence.src}`, import.meta.url)));
    assert.equal(item.evidence.width, 2048);
    assert.ok(item.evidence.height > 0);
    assert.equal(item.keyMetrics.length, 4);
  }
});

test("industrial cost per conversion is derived from the exact source spend", () => {
  const item = report("industrial-search");
  assert.equal(metric(item, "Tracked conversions"), "266");
  assert.equal(metric(item, "Cost / conversion (calculated)"), `₹${(203060.06 / 266).toFixed(2)}`);
  assert.match(item.calculation, /203,060\.06/);
  assert.match(item.limitation, /not verified sales or qualified leads/);
});

test("consumer value and calculated ratios use the source precision", () => {
  const item = report("consumer-search");
  assert.equal(
    metric(item, "Recorded conversion value"),
    `₹${(11866687.13 / 1000000).toFixed(2)} million`,
  );
  assert.equal(
    metric(item, "Value / spend (calculated)"),
    `${(11866687.13 / 2750711.36).toFixed(2)}x`,
  );
  assert.equal(
    metric(item, "Cost / conversion (calculated)"),
    `₹${(2750711.36 / 5836.63).toFixed(2)}`,
  );
  assert.match(item.calculation, /5,836\.63/);
  assert.match(item.limitation, /not independently verified revenue or profit/);
});

test("Amazon attribution is not presented as profit or incremental sales", () => {
  const item = report("amazon-marketplace");
  assert.equal(metric(item, "Reported ROAS"), `${(54338608.71 / 5546734.4).toFixed(2)}x`);
  assert.equal(metric(item, "Attributed purchases"), "43.6K");
  assert.match(item.limitation, /not proof of additional sales/);
  assert.match(item.limitation, /not profit or ROI/);
});
