import { Page, Locator, expect } from '@playwright/test'

export class SubmissionMapReviewPage {
  readonly page: Page
  readonly mainHeading: Locator
  readonly lede: Locator

  constructor(page: Page) {
    this.page = page
    this.mainHeading = page.getByRole('heading')
    this.lede = page.getByText('Submitted on 07 August 2026 at 5:41')
  }

  async verifyMainHeading(name: string) {
    await expect(this.page.getByRole('heading', { name })).toBeVisible()
  }

  async verifyLocationMap(type: MapReviewLocationType, count: number = 1) {
    const mapContainer = this.page.locator(
      `div.app-location-field--preview[data-locationtype="${type}"]`
    )
    if (count > 1) {
      await expect(await mapContainer.count()).toBe(count)
    } else {
      await expect(mapContainer).toBeVisible()
    }

    return mapContainer
  }

  async verifyLocationMapLayers(
    map: Locator,
    mapLayers: string[],
    count: number = 1
  ) {
    if (count > 1) {
      for (let i = 0; i < count; i++) {
        const mapLayerAttribute = await map
          .nth(i)
          .getAttribute('data-maplayers')
        await expect(mapLayerAttribute).toBe(mapLayers.join(',') || '')
      }
    } else {
      await expect(await map.getAttribute('data-maplayers')).toBe(
        mapLayers.join(',') || ''
      )
    }
  }

  async verifyGeospatialMap(count: number = 1) {
    const mapContainer = this.page.locator(`div.app-geospatial-field--preview`)

    if (count > 1) {
      await expect(await mapContainer.count()).toBe(count)
    } else {
      await expect(mapContainer).toBeVisible()
    }

    return mapContainer
  }

  /**
   * Verify the JavaScript functionality of the map by checking for the presence of the map canvas and search button.
   * If the count is greater than 1, it will check for the count of these elements.
   * Otherwise, it will check for their visibility.
   * @param map - the map locator
   * @param count - the count
   */
  async verifyMapJS(map: Locator, count: number = 1) {
    if (count > 1) {
      await expect(await map.locator('canvas.maplibregl-canvas').count()).toBe(
        count
      )
      await expect(
        await map
          .locator('button.im-c-map-button.im-c-search-open-button')
          .count()
      ).toBe(count)
    } else {
      await expect(map.locator('canvas.maplibregl-canvas')).toBeVisible()
      await expect(
        map.locator('button.im-c-map-button.im-c-search-open-button')
      ).toBeVisible()
    }
  }
}

export type MapReviewLocationType =
  | 'eastingnorthingfield'
  | 'latlongfield'
  | 'osgridreffield'
