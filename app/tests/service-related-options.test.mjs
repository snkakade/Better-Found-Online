import assert from "node:assert/strict";
import test from "node:test";
import * as services from "../src/service-pages.ts";
import { serviceRelatedOptions } from "../src/service-related-options.ts";

test("every service has a specific related-services heading and complete destinations", () => {
  for (const service of Object.values(services)) {
    assert.ok(service.relatedHeading.endsWith("?"));
    assert.ok(service.relatedHeading.split(/\s+/).length <= 9);
    assert.doesNotMatch(service.relatedHeading, /connect the right|pieces/i);
    assert.equal(service.related.length, 3);
    assert.equal(new Set(service.related.map((link) => link.href)).size, 3);
    for (const link of service.related) {
      assert.ok(serviceRelatedOptions[link.href], `${service.path}: missing ${link.href}`);
      assert.notEqual(link.href, service.path);
    }
  }
});

test("each option explains a concrete output and supplies its own action label", () => {
  for (const option of Object.values(serviceRelatedOptions)) {
    assert.ok(option.heading.length > 10);
    assert.ok(option.description.split(/\s+/).length <= 16);
    assert.match(option.action, /^Explore /);
    assert.doesNotMatch(option.action, /[↗→↓]/);
    assert.ok(option.icon);
  }
});

test("social management offers graphic design, video editing, and paid advertising", () => {
  assert.equal(services.socialMedia.relatedHeading, "Need graphics, video, or paid ads?");
  assert.deepEqual(
    services.socialMedia.related.map((link) => link.href),
    [
      "/services/graphic-design",
      "/services/video-production-editing",
      "/services/performance-marketing",
    ],
  );
});
