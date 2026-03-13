# Accessibility Test Coverage

This document summarises the accessibility test coverage provided by the end-to-end test suite in this repository:

## How accessibility is checked

What the suite does:

- runs axe with tags:
  - `best-practice`
  - `wcag22aaa`
  - `wcag22aa`
  - `wcag2a`
  - `wcag2aa`
  - `wcag21a`
  - `wcag21aa`
- generates:
  - HTML reports in `test-results/axe-core-reports`
  - JSON axe results
  - aggregate JSON payloads
  - attached summaries in test output
- `best-practice` findings are treated as **non-blocking**
- fails on remaining violations using a soft assertion so that all tests complete and report, rather than stopping at the first failure

## Various test specs and their coverage

Accessibililiy coverage is run at each step, also a separate checks for heading hierarchy and other custom assertions are performed in some specs.

### `2.1 - create-basic-form.spec.ts - existing test`

**Journey covered**

- Create a form
- Choose organisation
- Enter team details
- Open draft editor
- Add a question page
- Select **Written answer → Short answer**
- Complete question details

### `2.2 - create-and-publish-form.spec.ts`

**Journey covered**

End-to-end authoring and publishing flow from library to live form.

**Axe scan checkpoints (19)**

- `library-page`
- `create-title`
- `create-organisation`
- `create-team-details`
- `form-overview-draft`
- `editor-add-edit-pages`
- `select-page-type`
- `select-question-type`
- `edit-question-details`
- `page-overview-saved`
- `edit-contact-email`
- `edit-submission-guidance`
- `edit-privacy-notice`
- `edit-notification-email`
- `edit-contact-phone`
- `edit-contact-online`
- `form-overview-all-complete`
- `make-draft-live-confirmation`
- `form-overview-live`

**Links and flows covered**

- Overview navigation link
- Support email link
- Submission guidance link
- Privacy notice link
- Notification email link
- Phone support link
- Online contact link
- Make draft live publish action

### `2.3 - create-forms.spec.ts`

**Journey covered**

- Create form entry page
- Validation/continuation state immediately after pressing Continue

**Axe scan checkpoints (2)**

- `forms-designer-create-form`
- `forms-designer-create-form-continue`

**Components exercised**

- Form-name textbox
- Continue button
- Create form wizard transition

### `2.4 - designer-pages.spec.ts`

**Journey covered**

Accessibility checks are preformed on all top-level designer pages, both unauthenticated and authenticated, covering a wide range of content and components.

**Designer pages covered with total of 26 axe scan checkpoints**

- `/` — Home
- `/support` — Support
- `/services` — Services
- `/about` — About
- `/get-started` — Get Started
- `/get-started/make-form-live-checklist` — Make Form Live Checklist
- `/get-started/get-access` — Get Access
- `/get-started/form-suitability-criteria` — Form Suitability Criteria
- `/get-started/measuring-suitability` — Measuring Suitability
- `/features` — Features
- `/features#forms-designer` — Features - Forms Designer
- `/features#developer-plugin` — Features - Developer Plugin
- `/features#compare` — Features - Compare
- `/resources` — Resources
- `/resources/does-this-need-to-be-a-form` — Does This Need to Be a Form
- `/resources/accessibility-and-inclusion` — Accessibility and Inclusion
- `/resources/working-with-subject-matter-experts` — Working with Subject Matter Experts
- `/resources/question-protocols` — Question Protocols
- `/resources/prototyping-a-form` — Prototyping a Form
- `/resources/form-pages-on-govuk` — Form Pages on GOV.UK
- `/resources/peer-reviewing-forms` — Peer Reviewing Forms
- `/resources/privacy-notices` — Privacy Notices
- `/admin/index` — Admin Index
- `/manage/users` — Manage Users
- `/auth/account` — Auth Account
- `/` unauthenticated — Home page without login

**Additional assertions**

- No orphaned in-page heading anchors
- No hidden focusable elements in tab order
- Heading hierarchy checks

### `2.6 - dac-audit-regression.spec.ts`

**Journey covered**

Regression coverage for issues associated with a DAC audit, focused on semantics and keyboard/focus behaviour.

**Axe scan checkpoints (4)**

- `dac-regression-library-skip-link`
- `dac-regression-conditions`
- `dac-regression-create-condition`
- `dac-regression-question-details`

**Additional assertions**

- Skip link exists, receives first tab focus, and moves focus to its target
- Hidden elements are not tabbable
- Heading hierarchy remains valid
- Conditions page exposes **All conditions** as an `h2`

**Links and components exercised**

- GOV.UK skip link
- Main content target
- Conditions list page
- Create new condition link
- Question details editor

### `2.7 - descriptive-links.spec.ts`

**Journey covered**

Checks that generic action links expose hidden descriptive context through the create/edit/check-answers journey.

**Hidden-context link checkpoints (16)**

- Forms library
- Create form - title
- Create form - organisation
- Create form - team details
- Form overview
- Editor - add and edit pages
- Editor - choose page type
- Editor - choose question type
- Editor - question details
- Editor - page overview
- Check answers settings - overview
- Check answers settings - sections
- Check answers settings - section one
- Check answers settings - section two
- Check answers settings - sections reorder
- Check answers settings - page overview

**Generic action link text for descriptive context (visually hidden span) checked**

- `edit`
- `remove`
- `re-order`
- `change`
- `up`
- `down`

**Expectation**

If a link uses one of the generic action labels above, it must include visually hidden descriptive text unless another accessible naming mechanism is used.

### `2.8 - question-type-heading-hierarchy.spec.ts`

**Journey covered**

Creates a form, enters the editor, then iterates through every supported question-type option to confirm heading structure and axe compliance on the resulting page.

**Question type scenarios covered (20)**

- Written answer → Short answer
- Written answer → Long answer
- Written answer → Numbers only
- Date → Day, month and year
- Date → Month and year
- Location → UK address
- Location → Easting and northing
- Location → Ordnance Survey (OS) grid reference
- Location → National Grid field number
- Location → Latitude and longitude
- Phone number
- Supporting evidence
- Email address
- Payment
- Declaration
- List of options → Yes or No
- List of options → Checkboxes
- List of options → Radios
- List of options → Autocomplete
- List of options → Select
