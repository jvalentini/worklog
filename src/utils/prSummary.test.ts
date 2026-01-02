import { describe, expect, test } from "bun:test";
import { extractPrSummary } from "./prSummary.ts";

describe("extractPrSummary", () => {
	describe("heading-based extraction", () => {
		test("extracts from ## Summary heading", () => {
			const body = `
## Summary

This PR adds authentication flow using JWT tokens.

## Details
More stuff here.
			`;

			expect(extractPrSummary(body)).toBe("This PR adds authentication flow using JWT tokens.");
		});

		test("extracts from ### Overview heading", () => {
			const body = `
### Overview

Refactored the database layer to use connection pooling.

### Changes
- Added pool
			`;

			expect(extractPrSummary(body)).toBe(
				"Refactored the database layer to use connection pooling.",
			);
		});

		test("extracts from 'What changed' heading", () => {
			const body = `
## What changed

Fixed the navigation bug in settings screen. Users can now access all tabs.

## Testing
Tested on iOS and Android.
			`;

			expect(extractPrSummary(body)).toBe(
				"Fixed the navigation bug in settings screen. Users can now access all tabs.",
			);
		});

		test("extracts from 'Context:' heading (colon format)", () => {
			const body = `
Context: This implements the new OAuth2 flow for third-party integrations.

Implementation details below.
			`;

			expect(extractPrSummary(body)).toBe(
				"This implements the new OAuth2 flow for third-party integrations.",
			);
		});

		test("extracts from 'Description' heading", () => {
			const body = `
# Description

Migrated the API from Express to Fastify for better performance.

# Technical Notes
...
			`;

			expect(extractPrSummary(body)).toBe(
				"Migrated the API from Express to Fastify for better performance.",
			);
		});

		test("handles multiple sentences under heading", () => {
			const body = `
## Summary

This adds rate limiting middleware. It prevents API abuse by limiting requests to 100 per minute. The implementation uses Redis for distributed tracking.

## Details
More info.
			`;

			expect(extractPrSummary(body)).toBe(
				"This adds rate limiting middleware. It prevents API abuse by limiting requests to 100 per minute.",
			);
		});

		test("converts bullets under heading to sentences", () => {
			const body = `
## Overview

- Implemented user profile page with avatar upload
- Added validation for email addresses

## Tests
...
			`;

			expect(extractPrSummary(body)).toBe(
				"Implemented user profile page with avatar upload. Added validation for email addresses.",
			);
		});
	});

	describe("paragraph fallback", () => {
		test("extracts first meaningful paragraph when no headings", () => {
			const body = `
This PR fixes the memory leak in the WebSocket connection handler. The issue was caused by not properly cleaning up event listeners.
			`;

			expect(extractPrSummary(body)).toBe(
				"This PR fixes the memory leak in the WebSocket connection handler. The issue was caused by not properly cleaning up event listeners.",
			);
		});

		test("skips short paragraphs", () => {
			const body = `
Short.

This paragraph is much longer and contains the actual description of what this PR does. It implements a new caching layer.
			`;

			expect(extractPrSummary(body)).toBe(
				"This paragraph is much longer and contains the actual description of what this PR does. It implements a new caching layer.",
			);
		});

		test("skips paragraphs that are headings", () => {
			const body = `
Changes:

Updated the dependencies to latest versions. Fixed compatibility issues with Node 20.

Testing:
...
			`;

			expect(extractPrSummary(body)).toBe(
				"Updated the dependencies to latest versions. Fixed compatibility issues with Node 20.",
			);
		});

		test("skips checklist paragraphs", () => {
			const body = `
- [ ] Task one
- [ ] Task two

This PR implements the dark mode toggle feature. Users can now switch between light and dark themes.
			`;

			expect(extractPrSummary(body)).toBe(
				"This PR implements the dark mode toggle feature. Users can now switch between light and dark themes.",
			);
		});
	});

	describe("template noise filtering", () => {
		test("removes HTML comments", () => {
			const body = `
<!-- This is a template comment -->

## Summary

This adds logging to the authentication module.
			`;

			expect(extractPrSummary(body)).toBe("This adds logging to the authentication module.");
		});

		test("removes empty checklist items", () => {
			const body = `
- [ ]
- [ ]

## Summary

Fixed the database migration script.
			`;

			expect(extractPrSummary(body)).toBe("Fixed the database migration script.");
		});

		test("removes separator lines", () => {
			const body = `
---

## Summary

Added support for markdown rendering.

***
			`;

			expect(extractPrSummary(body)).toBe("Added support for markdown rendering.");
		});

		test("ignores multiple blank lines", () => {
			const body = `
## Summary


This PR refactors the error handling logic.


More details below.
			`;

			expect(extractPrSummary(body)).toBe("This PR refactors the error handling logic.");
		});
	});

	describe("placeholder handling", () => {
		test("skips N/A placeholder", () => {
			const body = `
## Summary

N/A

## Details

This updates the README with installation instructions.
			`;

			expect(extractPrSummary(body)).toBe(
				"This updates the README with installation instructions.",
			);
		});

		test("skips TBD placeholder", () => {
			const body = `
## Summary

TBD

## Context

Implemented the search functionality with fuzzy matching.
			`;

			expect(extractPrSummary(body)).toBe(
				"Implemented the search functionality with fuzzy matching.",
			);
		});

		test("skips TODO placeholder", () => {
			const body = `
TODO

Added pagination to the user list endpoint. Each page shows 50 users.
			`;

			expect(extractPrSummary(body)).toBe(
				"Added pagination to the user list endpoint. Each page shows 50 users.",
			);
		});

		test("skips 'To be determined' placeholder", () => {
			const body = `
To be determined.

This PR adds internationalization support for French and German.
			`;

			expect(extractPrSummary(body)).toBe(
				"This PR adds internationalization support for French and German.",
			);
		});

		test("skips 'Not applicable' placeholder", () => {
			const body = `
Not applicable

Migrated tests from Jest to Vitest.
			`;

			expect(extractPrSummary(body)).toBe("Migrated tests from Jest to Vitest.");
		});

		test("skips 'None' placeholder", () => {
			const body = `
None.

This implements the file upload feature with drag-and-drop support.
			`;

			expect(extractPrSummary(body)).toBe(
				"This implements the file upload feature with drag-and-drop support.",
			);
		});
	});

	describe("edge cases", () => {
		test("returns null for empty string", () => {
			expect(extractPrSummary("")).toBeNull();
		});

		test("returns null for whitespace only", () => {
			expect(extractPrSummary("   \n\n  \t  ")).toBeNull();
		});

		test("returns null for template-only content", () => {
			const body = `
<!-- Template -->

- [ ]
- [ ]

---

N/A
			`;

			expect(extractPrSummary(body)).toBeNull();
		});

		test("returns null for checklist-only content", () => {
			const body = `
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
			`;

			expect(extractPrSummary(body)).toBeNull();
		});

		test("returns null for non-string input", () => {
			expect(extractPrSummary(null as unknown as string)).toBeNull();
			expect(extractPrSummary(undefined as unknown as string)).toBeNull();
		});

		test("handles single sentence without period", () => {
			const body = "This adds new feature";

			expect(extractPrSummary(body)).toBe("This adds new feature.");
		});

		test("handles sentence with exclamation", () => {
			const body = "Fixed critical bug!";

			expect(extractPrSummary(body)).toBe("Fixed critical bug!");
		});

		test("handles sentence with question mark", () => {
			const body = "Should we merge this?";

			expect(extractPrSummary(body)).toBe("Should we merge this?");
		});

		test("limits to 2 sentences max", () => {
			const body =
				"First sentence here. Second sentence follows. Third sentence should be excluded. Fourth too.";

			expect(extractPrSummary(body)).toBe("First sentence here. Second sentence follows.");
		});

		test("handles bullets without headings", () => {
			const body = `
- Fixed authentication bug
- Added new dashboard
- Updated documentation
			`;

			expect(extractPrSummary(body)).toBe("Fixed authentication bug. Added new dashboard.");
		});

		test("handles mixed content with headings and placeholders", () => {
			const body = `
<!-- Template comment -->

## Summary

TBD

## Description

This refactors the payment processing module to use the new Stripe API.

---
			`;

			expect(extractPrSummary(body)).toBe(
				"This refactors the payment processing module to use the new Stripe API.",
			);
		});
	});
});
