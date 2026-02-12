//accessibilityChecker.ts
//https://medium.com/@tpshadinijk/automating-accessibility-checks-using-playwright-db443214c38d

import { expect, Page, TestInfo } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'
import { createHtmlReport } from 'axe-html-reporter'
import * as fs from 'node:fs'
import * as path from 'node:path'

export async function runAccessibilityCheck(
  page: Page,
  testInfo: TestInfo,
  description: string
): Promise<void> {
  // Get axeBuilder from the fixture
  const axeResults = await new AxeBuilder({ page })
    .withRules(['color-contrast'])
    .withTags([
      'best-practice',
      'wcag22aa',
      'wcag2a',
      'wcag2aa',
      'wcag21a',
      'wcag21aa'
    ])
    .exclude('input[type="radio"]')
    .analyze()

  const reportDir = 'test-results/axe-core-reports'
  const resultsDir = path.join(reportDir, 'results')
  const safeDescription = description
    .replace(/[^a-z0-9-_]+/gi, '-')
    .toLowerCase()
  const reportFileName = `${safeDescription}-accessibility-report.html`
  const reportPath = path.join(reportDir, reportFileName)
  const jsonFileName = `${safeDescription}-axe-results.json`
  const jsonPath = path.join(reportDir, jsonFileName)
  const aggregateFileName = `${safeDescription}-axe-results.aggregate.json`
  const aggregatePath = path.join(resultsDir, aggregateFileName)

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true })
  }

  createHtmlReport({
    results: axeResults,
    options: {
      outputDir: reportDir,
      reportFileName
    }
  })

  fs.writeFileSync(jsonPath, JSON.stringify(axeResults, null, 2))

  const aggregatePayload = {
    meta: {
      description,
      testTitle: testInfo.title,
      testFile: testInfo.file,
      reportFileName,
      jsonFileName,
      generatedAt: new Date().toISOString()
    },
    results: axeResults
  }

  fs.writeFileSync(aggregatePath, JSON.stringify(aggregatePayload, null, 2))

  if (fs.existsSync(reportPath)) {
    await testInfo.attach(`${description}-accessibility-report`, {
      path: reportPath,
      contentType: 'text/html'
    })
  }

  if (fs.existsSync(jsonPath)) {
    await testInfo.attach(`${description}-axe-results`, {
      path: jsonPath,
      contentType: 'application/json'
    })
  }

  const violationSummary = axeResults.violations.length
    ? axeResults.violations
        .map(
          (violation) =>
            `${violation.id} (${violation.impact ?? 'impact: n/a'}) - ${violation.nodes.length} nodes`
        )
        .join('\n')
    : 'No accessibility violations found.'

  await testInfo.attach(`${description}-axe-summary`, {
    body: Buffer.from(violationSummary, 'utf-8'),
    contentType: 'text/plain'
  })
  // filter out violations with tag 'best-bractice'

  const filteredViolations = axeResults.violations.filter(
    (violation) => !violation.tags.includes('best-practice')
  )

  const bestPracticeViolations = axeResults.violations.filter((violation) =>
    violation.tags.includes('best-practice')
  )

  if (bestPracticeViolations.length > 0) {
    console.warn(
      `Best practice violations found in ${description} page: ${bestPracticeViolations.length}`
    )
    testInfo.annotations.push({
      type: 'best-practice-violations',
      description: `${bestPracticeViolations.length} best practice violation(s) found in ${description} page`
    })
  }
  if (bestPracticeViolations.length > 0) {
    const bestPracticeSummary = bestPracticeViolations
      .map(
        (violation) =>
          `${violation.id} (${violation.impact ?? 'impact: n/a'}) - ${violation.nodes.length} nodes`
      )
      .join('\n')

    testInfo.tags.push('best-practice-violations')
    await testInfo.attach(`${description}-axe-best-practice-violations`, {
      body: Buffer.from(bestPracticeSummary, 'utf-8'),
      contentType: 'text/plain'
    })
  }
  expect
    .soft(
      filteredViolations,
      `Accessibility violations found in ${description} page`
    )
    .toEqual([])
}
