import fs from 'node:fs'
import path from 'node:path'

const reportDir = 'test-results/axe-core-reports'
const resultsDir = path.join(reportDir, 'results')
const summaryJsonPath = path.join(reportDir, 'violations-summary.json')
const summaryHtmlPath = path.join(reportDir, 'violations-summary.html')

type AggregateFile = {
  meta: {
    description: string
    testTitle?: string
    testFile?: string
    reportFileName?: string
    jsonFileName?: string
    generatedAt?: string
  }
  results: {
    violations: Array<{
      id: string
      impact?: string
      description: string
      help: string
      helpUrl: string
      nodes: Array<{
        html: string
        target: string[]
        failureSummary?: string
      }>
    }>
  }
}

type AggregatedViolation = {
  id: string
  impact: string
  description: string
  help: string
  helpUrl: string
  occurrences: Array<{
    description: string
    testTitle?: string
    testFile?: string
    reportFileName?: string
    nodesCount: number
  }>
}

export default async function globalTeardown() {
  if (!fs.existsSync(resultsDir)) {
    return
  }

  const files = fs
    .readdirSync(resultsDir)
    .filter((file) => file.endsWith('.json'))

  const violationsMap = new Map<string, AggregatedViolation>()
  let totalTests = 0
  let totalViolations = 0

  for (const file of files) {
    const filePath = path.join(resultsDir, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw) as AggregateFile
    totalTests += 1

    for (const violation of parsed.results.violations) {
      totalViolations += 1
      const impact = violation.impact ?? 'n/a'
      const key = `${violation.id}:${impact}`
      const existing = violationsMap.get(key)

      const occurrence = {
        description: parsed.meta.description,
        testTitle: parsed.meta.testTitle,
        testFile: parsed.meta.testFile,
        reportFileName: parsed.meta.reportFileName,
        nodesCount: violation.nodes.length
      }

      if (existing) {
        existing.occurrences.push(occurrence)
      } else {
        violationsMap.set(key, {
          id: violation.id,
          impact,
          description: violation.description,
          help: violation.help,
          helpUrl: violation.helpUrl,
          occurrences: [occurrence]
        })
      }
    }
  }

  const aggregated = {
    generatedAt: new Date().toISOString(),
    totalTests,
    totalViolations,
    uniqueViolations: violationsMap.size,
    violations: Array.from(violationsMap.values()).sort((a, b) =>
      a.id.localeCompare(b.id)
    )
  }

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true })
  }

  fs.writeFileSync(summaryJsonPath, JSON.stringify(aggregated, null, 2))

  const rows = aggregated.violations
    .map((violation) => {
      const occurrences = violation.occurrences
        .map((occ) => {
          const reportLink = occ.reportFileName
            ? `<a href="${occ.reportFileName}">report</a>`
            : 'report n/a'
          const fileLabel = occ.testFile ?? 'unknown file'
          const titleLabel = occ.testTitle ?? 'unknown test'
          return `<li><strong>${titleLabel}</strong> (${fileLabel}) - nodes: ${occ.nodesCount} - ${reportLink}</li>`
        })
        .join('')

      return `
        <tr>
          <td>${violation.id}</td>
          <td>${violation.impact}</td>
          <td>${violation.description}</td>
          <td><a href="${violation.helpUrl}">${violation.help}</a></td>
          <td><ul>${occurrences}</ul></td>
        </tr>
      `
    })
    .join('')

  const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Accessibility Violations Summary</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
          th { background: #f5f5f5; }
          ul { margin: 0; padding-left: 18px; }
        </style>
      </head>
      <body>
        <h1>Accessibility Violations Summary</h1>
        <p>Generated at: ${aggregated.generatedAt}</p>
        <p>Total tests: ${aggregated.totalTests}</p>
        <p>Total violations: ${aggregated.totalViolations}</p>
        <p>Unique violations: ${aggregated.uniqueViolations}</p>
        <table>
          <thead>
            <tr>
              <th>Rule</th>
              <th>Impact</th>
              <th>Description</th>
              <th>Help</th>
              <th>Occurrences</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5">No violations found.</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `

  fs.writeFileSync(summaryHtmlPath, html)
}
