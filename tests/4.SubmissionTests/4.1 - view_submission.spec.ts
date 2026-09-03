import { test } from '@playwright/test'
import { SubmissionMapReviewPage } from '~/pages/SubmissionMapReviewPage.js'
import { SubmissionPage } from '~/pages/SubmissionPage.js'

test('4.1.1 - View submission', async ({ page }) => {
  const submissionPage = new SubmissionPage(page)

  await page.goto('/submission/34E-FJR-84A')
  await page.waitForURL('**/submission/34E-FJR-84A')

  await submissionPage.verifyMainHeading('34E-FJR-84A')
  await submissionPage.verifyLede('Submitted on 07 August 2026 at 5:41')

  await submissionPage.verifySectionHeading('Section 1')
  await submissionPage.verifySectionHeading('Section 2')

  // Expect 6 summary lists on the page
  await submissionPage.verifySummaryCount(6)

  await submissionPage.verifySummaryListItem('Text field', 'Enrique Chase')
  await submissionPage.verifySummaryListItem(
    'UK address field',
    'LINE 1, LINE 2, TOWN, COUNTY, PO8 1DE'
  )
  await submissionPage.verifySummaryListItem(
    'Easting Northing field',
    'Easting: 337408 Northing: 552984'
  )
  await submissionPage.verifySummaryListItem(
    'Checkboxes field',
    'Arabian, Shire, Race'
  )

  // Expect 3 repeater summary card lists on the page
  await submissionPage.verifyRepeaterSummaryCount(3)

  // Expect 10 map review links on the page
  await submissionPage.verifyMapReviewLinkCount(10)

  // Expect 1 files download link on the page
  await submissionPage.verifyFilesDownloadLinkCount(1)
})

test('4.1.2 - View single submission EN map review', async ({ page }) => {
  const enMapReviewPage = new SubmissionMapReviewPage(page)

  const enMapReviewUrl =
    '/submission/34E-FJR-84A/map-review/7dcdd33a-4c30-4548-83bb-edc11731107c/c3c34170-3063-49bb-b66c-436e5d3e0158'

  await page.goto(enMapReviewUrl)
  await page.waitForURL(`**${enMapReviewUrl}`)

  await enMapReviewPage.verifyMainHeading('34E-FJR-84A Easting Northing')

  const map = await enMapReviewPage.verifyLocationMap('eastingnorthingfield', 1)

  // Verify EN map has SSSI enabled
  await enMapReviewPage.verifyLocationMapLayers(map, ['sssi'], 1)

  await enMapReviewPage.verifyMapJS(map)
})

test('4.1.3 - View single submission LL map review', async ({ page }) => {
  const llMapReviewPage = new SubmissionMapReviewPage(page)

  const llMapReviewUrl =
    '/submission/34E-FJR-84A/map-review/7dcdd33a-4c30-4548-83bb-edc11731107c/43a8959c-7255-4174-91d5-6bf03980aefe'

  await page.goto(llMapReviewUrl)
  await page.waitForURL(`**${llMapReviewUrl}`)

  await llMapReviewPage.verifyMainHeading(
    '34E-FJR-84A Latitude longitude field'
  )

  const map = await llMapReviewPage.verifyLocationMap('latlongfield')

  await llMapReviewPage.verifyMapJS(map)
})

test('4.1.4 - View single submission OSGR map review', async ({ page }) => {
  const osgrMapReviewPage = new SubmissionMapReviewPage(page)

  const osgrMapReviewUrl =
    '/submission/34E-FJR-84A/map-review/7dcdd33a-4c30-4548-83bb-edc11731107c/c1cc4b5e-f493-4d9b-9f86-eb6754329634'

  await page.goto(osgrMapReviewUrl)
  await page.waitForURL(`**${osgrMapReviewUrl}`)

  await osgrMapReviewPage.verifyMainHeading(
    '34E-FJR-84A OS grid reference field'
  )

  const map = await osgrMapReviewPage.verifyLocationMap('osgridreffield')

  await osgrMapReviewPage.verifyMapJS(map)
})

test('4.1.5 - View single submission Geospatial map review', async ({
  page
}) => {
  const geospatialMapReviewPage = new SubmissionMapReviewPage(page)

  const geospatialMapReviewUrl =
    '/submission/34E-FJR-84A/map-review/e6ad8e99-d599-4c08-a081-bedc0c9268e1/9b99f349-4891-492f-b669-10abc5ed1cf1'

  await page.goto(geospatialMapReviewUrl)
  await page.waitForURL(`**${geospatialMapReviewUrl}`)

  await geospatialMapReviewPage.verifyMainHeading(
    '34E-FJR-84A Geospatial field'
  )

  const map = await geospatialMapReviewPage.verifyGeospatialMap()

  await geospatialMapReviewPage.verifyMapJS(map)
})

test('4.1.6 - View single submission Geospatial map review', async ({
  page
}) => {
  const geospatialMapReviewPage = new SubmissionMapReviewPage(page)

  const geospatialMapReviewUrl =
    '/submission/34E-FJR-84A/map-review/e6ad8e99-d599-4c08-a081-bedc0c9268e1/9b99f349-4891-492f-b669-10abc5ed1cf1'

  await page.goto(geospatialMapReviewUrl)
  await page.waitForURL(`**${geospatialMapReviewUrl}`)

  await geospatialMapReviewPage.verifyMainHeading(
    '34E-FJR-84A Geospatial field'
  )

  const map = await geospatialMapReviewPage.verifyGeospatialMap()

  await geospatialMapReviewPage.verifyMapJS(map)
})

test('4.1.7 - View Geospatial repeater submission map review', async ({
  page
}) => {
  const geospatialMapReviewPage = new SubmissionMapReviewPage(page)

  const geospatialMapReviewUrl =
    '/submission/34E-FJR-84A/map-review/98b46e3f-02fb-44d3-807a-0e0ee90d0722/4e50b4a2-a443-4e0b-a2e0-49008605b34c'

  await page.goto(geospatialMapReviewUrl)
  await page.waitForURL(`**${geospatialMapReviewUrl}`)

  await geospatialMapReviewPage.verifyMainHeading(
    '34E-FJR-84A Geospatial field (multiple responses)'
  )

  const map = await geospatialMapReviewPage.verifyGeospatialMap(3)

  await geospatialMapReviewPage.verifyMapJS(map, 3)
})

test('4.1.8 - View EN repeater submission map review', async ({ page }) => {
  const enMapReviewPage = new SubmissionMapReviewPage(page)

  const enMapReviewUrl =
    '/submission/34E-FJR-84A/map-review/98b46e3f-02fb-44d3-807a-0e0ee90d0722/27ffb7bf-cebf-450c-b6d8-4b1f19eb946f'

  await page.goto(enMapReviewUrl)
  await page.waitForURL(`**${enMapReviewUrl}`)

  await enMapReviewPage.verifyMainHeading(
    '34E-FJR-84A What is your Easting and Northing location (multiple responses)'
  )

  const map = await enMapReviewPage.verifyLocationMap('eastingnorthingfield', 3)

  // Verify the map has the correct layers
  await enMapReviewPage.verifyLocationMapLayers(map, ['sssi'], 3)

  await enMapReviewPage.verifyMapJS(map, 3)
})
