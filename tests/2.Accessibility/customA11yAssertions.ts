import { expect, Page } from '@playwright/test'

export type HeadingHierarchyOptions = {
  scopeSelector?: string
  requireSingleH1?: boolean
}

export type HiddenFocusOptions = {
  maxTabs?: number
  hiddenSelector?: string
}

export type MeaningfulImageAltExpectation = {
  selector: string
  expectedAlt?: string
  forbiddenAltValues?: string[]
}

export type HeadingSectionContentOptions = {
  scopeSelector?: string
}

const ACTION_LINK_KEYWORDS = [
  'edit',
  'remove',
  're-order',
  'change',
  'up',
  'down'
]
export async function assertSkipLinkWorks(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded')

  const skipLink = page.locator('a.govuk-skip-link[href^="#"]').first()
  await expect(skipLink, 'Skip link is missing').toHaveCount(1)

  const href = await skipLink.getAttribute('href')
  expect(href, 'Skip link href is missing').toBeTruthy()
  expect(
    href?.startsWith('#'),
    'Skip link href must target an in-page id'
  ).toBe(true)

  const targetId = href!.slice(1)
  const target = page.locator(`[id="${targetId}"]`).first()
  await expect(
    target,
    `Skip link target #${targetId} was not found in the DOM`
  ).toHaveCount(1)

  await page.keyboard.press('Tab')
  await expect(
    skipLink,
    'Skip link should receive focus on first Tab'
  ).toBeFocused()
  await page.keyboard.press('Enter')

  const focusMovedToTarget = await page.evaluate((id) => {
    const targetElement = document.getElementById(id)
    const activeElement = document.activeElement

    if (!targetElement || !activeElement) {
      return false
    }

    return (
      activeElement === targetElement || targetElement.contains(activeElement)
    )
  }, targetId)

  expect(
    focusMovedToTarget,
    `Skip link did not move focus into #${targetId}`
  ).toBeTruthy()
}

export async function assertNoUnexpectedAutofocus(
  page: Page,
  allowedSelectors: string[] = []
): Promise<void> {
  await page.waitForLoadState('domcontentloaded')

  const unexpectedlyFocusedControl = await page.evaluate((allowed) => {
    const activeElement = document.activeElement as HTMLElement | null

    if (!activeElement) {
      return null
    }

    const tag = activeElement.tagName.toLowerCase()
    const isFormControl = ['input', 'select', 'textarea'].includes(tag)

    if (!isFormControl) {
      return null
    }

    const allowedBySelector = allowed.some((selector) =>
      activeElement.matches(selector)
    )

    if (allowedBySelector) {
      return null
    }

    return {
      tag,
      id: activeElement.id,
      name: activeElement.getAttribute('name'),
      classes: activeElement.className
    }
  }, allowedSelectors)

  expect(
    unexpectedlyFocusedControl,
    'Unexpected autofocus detected on initial page load'
  ).toBeNull()
}
/**
 * Asserts that no hidden elements receive keyboard focus when tabbing through the page.
 * @param page Page
 * @param options HiddenFocusOptions
 */

export async function assertNoHiddenFocusableElementsInTabOrder(
  page: Page,
  options: HiddenFocusOptions = {}
): Promise<void> {
  const {
    maxTabs = 25,
    hiddenSelector = '.govuk-visually-hidden,[aria-hidden="true"],[hidden]' // selectopr for gov uk hidden elements
  } = options

  const offenders: Array<{
    tag: string
    id: string
    classes: string
  }> = []

  for (let index = 0; index < maxTabs; index++) {
    await page.keyboard.press('Tab')

    const focused = await page.evaluate((selector) => {
      const activeElement = document.activeElement as HTMLElement | null

      if (!activeElement || activeElement === document.body) {
        return null
      }

      const hiddenAncestor = activeElement.closest(selector)

      if (!hiddenAncestor) {
        return null
      }

      return {
        tag: activeElement.tagName.toLowerCase(),
        id: activeElement.id,
        classes: activeElement.className
      }
    }, hiddenSelector)

    if (focused) {
      offenders.push(focused)
    }
  }

  expect(
    offenders,
    'Hidden elements should not receive keyboard focus'
  ).toEqual([])
}

export async function assertHeadingHierarchy(
  page: Page,
  options: HeadingHierarchyOptions = {}
): Promise<void> {
  const {
    scopeSelector = 'main, #main-content, #main-head-content, body',
    requireSingleH1 = true
  } = options

  const headingReport = await page.evaluate((scope) => {
    const root =
      document.querySelector(scope) ||
      document.querySelector('body') ||
      document

    const headings = Array.from(root.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(
      (heading) => {
        const level = Number(heading.tagName.slice(1))
        const text = heading.textContent?.trim() || ''
        return { level, text }
      }
    )

    const h1Count = headings.filter((heading) => heading.level === 1).length

    const skippedLevels: Array<{ from: number; to: number; text: string }> = []
    for (let i = 1; i < headings.length; i++) {
      const previous = headings[i - 1]
      const current = headings[i]
      if (current.level > previous.level + 1) {
        skippedLevels.push({
          from: previous.level,
          to: current.level,
          text: current.text
        })
      }
    }

    return {
      count: headings.length,
      h1Count,
      skippedLevels
    }
  }, scopeSelector)

  expect(
    headingReport.count,
    'At least one heading is required on the page'
  ).toBeGreaterThan(0)

  if (requireSingleH1) {
    expect(
      headingReport.h1Count,
      'Exactly one h1 is expected on the page'
    ).toBe(1)
  }

  expect(
    headingReport.skippedLevels,
    'Heading levels should not skip levels (for example h1 -> h3)'
  ).toEqual([])
}

export async function assertHeadingSectionsHaveContent(
  page: Page,
  levels: number[] = [2],
  options: HeadingSectionContentOptions = {}
): Promise<void> {
  const { scopeSelector = 'body' } = options
  const invalidLevels = levels.filter((level) => level < 1 || level > 6)
  expect(invalidLevels, 'Heading levels must be between 1 and 6').toEqual([])

  const offenders = await page.evaluate(
    ({ selectedLevels, scope }) => {
      const headingTags = selectedLevels.map((level) => `h${level}`).join(',')

      const root = document.querySelector(scope)

      const getHeadingLevel = (element: Element): number =>
        Number(element.tagName.slice(1))

      const normaliseText = (value: string | null | undefined): string =>
        (value ?? '').replaceAll(/\s+/g, ' ').trim()

      const isMeaningfulNode = (element: Element): boolean => {
        const tag = element.tagName.toLowerCase()

        if (['script', 'style', 'template'].includes(tag)) {
          return false
        }

        if (tag === 'img') {
          const alt = element.getAttribute('alt')
          return normaliseText(alt).length > 0
        }

        const hasMeaningfulText = normaliseText(element.textContent).length > 0
        if (hasMeaningfulText) {
          return true
        }

        return Boolean(
          element.querySelector(
            'img:not([alt=""]), ul, ol, dl, table, form, fieldset, details, blockquote, pre, iframe, video, audio, button'
          )
        )
      }

      const headingElements = Array.from(
        root?.querySelectorAll<HTMLHeadingElement>(headingTags) || []
      )

      const findings: Array<{ level: number; heading: string; id: string }> = []

      headingElements.forEach((heading) => {
        const currentLevel = getHeadingLevel(heading)
        let sibling = heading.nextElementSibling
        let hasContent = false

        while (sibling) {
          const siblingTag = sibling.tagName.toLowerCase()
          const siblingLevel = /^h[1-6]$/.test(siblingTag)
            ? getHeadingLevel(sibling)
            : null

          if (siblingLevel !== null && siblingLevel <= currentLevel) {
            break
          }

          if (isMeaningfulNode(sibling)) {
            hasContent = true
            break
          }

          sibling = sibling.nextElementSibling
        }

        if (!hasContent) {
          findings.push({
            level: currentLevel,
            heading: normaliseText(heading.textContent),
            id: heading.id
          })
        }
      })

      return findings
    },
    { selectedLevels: levels, scope: scopeSelector }
  )

  expect(
    offenders,
    `Each heading (levels ${levels.join(', ')}) must have meaningful content before the next heading of same or higher level`
  ).toEqual([])
}

export async function assertDecorativeIconsHidden(
  page: Page,
  selectors: string[]
): Promise<void> {
  const offenders: Array<{ selector: string; alt: string | null }> = []

  for (const selector of selectors) {
    const icons = page.locator(selector)
    const count = await icons.count()

    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i)
      const alt = await icon.getAttribute('alt')

      if (alt !== '') {
        offenders.push({ selector, alt })
      }
    }
  }

  expect(
    offenders,
    'Decorative icons should have empty alt text (alt="")'
  ).toEqual([])
}

export async function assertMeaningfulImageAlt(
  page: Page,
  expectations: MeaningfulImageAltExpectation[]
): Promise<void> {
  for (const expectation of expectations) {
    const images = page.locator(expectation.selector)
    await expect(
      images,
      `Expected at least one image for selector ${expectation.selector}`
    ).toHaveCount(1)

    const alt = await images.first().getAttribute('alt')
    expect(
      alt?.trim().length,
      `Image ${expectation.selector} must have non-empty alt text`
    ).toBeGreaterThan(0)

    if (expectation.expectedAlt) {
      expect(
        alt,
        `Image ${expectation.selector} alt text does not match expected value`
      ).toBe(expectation.expectedAlt)
    }

    if (expectation.forbiddenAltValues?.length) {
      const lowered = (alt ?? '').trim().toLowerCase()
      const matchedForbidden = expectation.forbiddenAltValues.find(
        (value) => lowered === value.trim().toLowerCase()
      )

      expect(
        matchedForbidden,
        `Image ${expectation.selector} uses forbidden alt text: ${alt}`
      ).toBeUndefined()
    }
  }
}

export async function assertNoOrphanedHeadingAnchors(
  page: Page
): Promise<Array<{ href: string; text: string }>> {
  return page.evaluate(() => {
    const anchors = Array.from(
      document.querySelectorAll('a[href^="#"]')
    ).filter((anchor) => {
      const href = anchor.getAttribute('href')
      return href && href.startsWith('#') && href.length > 1
    })

    console.log(
      `Found ${anchors.length} in-page anchors for heading check ${anchors.map((a) => a.getAttribute('href')).join(', ')}`
    )
    const orphaned: Array<{ href: string; text: string }> = []

    anchors.forEach((anchor) => {
      const targetId = anchor.getAttribute('href')!.slice(1)
      const targetElement = document.getElementById(targetId)

      if (!targetElement) {
        orphaned.push({
          href: anchor.getAttribute('href')!,
          text: anchor.textContent?.trim() || ''
        })
      }
    })
    return orphaned
  })
}

export async function assertActionLinksHaveHiddenContext(
  page: Page,
  stepName: string
): Promise<void> {
  const offenders = await page.evaluate((actionKeywords: string[]) => {
    const hiddenSelector =
      '.govuk-visually-hidden, .visually-hidden, [class*="visually-hidden"]'

    const normalise = (value: string | null | undefined) =>
      (value ?? '').replaceAll(/\s+/g, ' ').trim()

    const getVisibleLinkText = (anchor: HTMLAnchorElement) => {
      const clone = anchor.cloneNode(true) as HTMLAnchorElement
      clone
        .querySelectorAll(hiddenSelector)
        .forEach((element) => element.remove())
      return normalise(clone.textContent)
    }

    const isActionLink = (text: string) =>
      actionKeywords.includes(text.toLowerCase())

    const results: Array<{
      text: string
      href: string
      hiddenText: string[]
      ariaLabel: string | null
    }> = []

    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href]')
    )

    anchors.forEach((anchor) => {
      const visibleText = getVisibleLinkText(anchor)

      if (!visibleText || !isActionLink(visibleText)) {
        return
      }

      const hiddenText = Array.from(anchor.querySelectorAll(hiddenSelector))
        .map((element) => normalise(element.textContent))
        .filter(Boolean)

      if (hiddenText.length === 0) {
        results.push({
          text: visibleText,
          href: anchor.getAttribute('href') ?? '',
          hiddenText,
          ariaLabel: anchor.getAttribute('aria-label')
        })
      }
    })

    return results
  }, ACTION_LINK_KEYWORDS)

  expect
    .soft(
      offenders,
      `Action links on "${stepName}" should include a visually hidden context span when link text is generic`
    )
    .toEqual([])
}
