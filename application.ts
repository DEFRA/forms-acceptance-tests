import { Page } from '@playwright/test'
import { AddEditPagesPage } from './pages/AddEditPagesPage.js'
import { EditConditionPage } from './pages/EditConditionPage.js'
import { EditQuestionPage } from './pages/EditQuestionPage.js'
import { FormPage } from './pages/FormPage.js'
import { GuidancePage } from './pages/GuidancePage.js'
import { LibraryPage } from './pages/LibraryPage.js'
import { LoginPage } from './pages/LoginPage.js'
import { ManagerConditionsPage } from './pages/ManagerConditionsPage.js'
import { PageListingPage } from './pages/PageListingPage.js'
import { PageOverview } from './pages/PageOverview.js'
import { PrivacyNoticePage } from './pages/PrivacyNoticePage.js'
import { ReOrderPages } from './pages/ReOrderPages.js'
import { SelectPageTypePage } from './pages/SelectPageTypePage.js'
import { SelectQuestionTypePage } from './pages/SelectQuestionTypePage.js'
import { TeamDetailsPage } from './pages/TeamDetailsPage.js'
import { UploadPage } from './pages/UploadPage.js'

export class Application {
  private readonly _addEditPagesPage: AddEditPagesPage
  private readonly _editConditionPage: EditConditionPage
  private readonly _editQuestionPage: EditQuestionPage
  private readonly _formPage: FormPage
  private readonly _guidancePage: GuidancePage
  private readonly _libraryPage: LibraryPage
  private readonly _loginPage: LoginPage
  private readonly _managerConditionsPage: ManagerConditionsPage
  private readonly _pageListingPage: PageListingPage
  private readonly _pageOverview: PageOverview
  private readonly _privacyNoticePage: PrivacyNoticePage
  private readonly _reOrderPages: ReOrderPages
  private readonly _selectPageTypePage: SelectPageTypePage
  private readonly _selectQuestionTypePage: SelectQuestionTypePage
  private readonly _teamDetailsPage: TeamDetailsPage
  private readonly _uploadPage: UploadPage

  constructor(page: Page, displayName: string = 'Local Service Account') {
    this._addEditPagesPage = new AddEditPagesPage(page)
    this._editConditionPage = new EditConditionPage(page)
    this._editQuestionPage = new EditQuestionPage(page)
    this._formPage = new FormPage(page)
    this._guidancePage = new GuidancePage(page)
    this._libraryPage = new LibraryPage(page)
    this._loginPage = new LoginPage(page, displayName)
    this._managerConditionsPage = new ManagerConditionsPage(page)
    this._pageListingPage = new PageListingPage(page)
    this._pageOverview = new PageOverview(page)
    this._privacyNoticePage = new PrivacyNoticePage(page)
    this._reOrderPages = new ReOrderPages(page)
    this._selectPageTypePage = new SelectPageTypePage(page)
    this._selectQuestionTypePage = new SelectQuestionTypePage(page)
    this._teamDetailsPage = new TeamDetailsPage(page)
    this._uploadPage = new UploadPage(page)
  }

  get addEditPagesPage(): AddEditPagesPage {
    return this._addEditPagesPage
  }

  get editConditionPage(): EditConditionPage {
    return this._editConditionPage
  }

  get editQuestionPage(): EditQuestionPage {
    return this._editQuestionPage
  }

  get formPage(): FormPage {
    return this._formPage
  }

  get guidancePage(): GuidancePage {
    return this._guidancePage
  }

  get libraryPage(): LibraryPage {
    return this._libraryPage
  }

  get loginPage(): LoginPage {
    return this._loginPage
  }

  get managerConditionsPage(): ManagerConditionsPage {
    return this._managerConditionsPage
  }

  get pageListingPage(): PageListingPage {
    return this._pageListingPage
  }

  get pageOverview(): PageOverview {
    return this._pageOverview
  }

  get privacyNoticePage(): PrivacyNoticePage {
    return this._privacyNoticePage
  }

  get reOrderPages(): ReOrderPages {
    return this._reOrderPages
  }

  get selectPageTypePage(): SelectPageTypePage {
    return this._selectPageTypePage
  }

  get selectQuestionTypePage(): SelectQuestionTypePage {
    return this._selectQuestionTypePage
  }

  get teamDetailsPage(): TeamDetailsPage {
    return this._teamDetailsPage
  }

  get uploadPage(): UploadPage {
    return this._uploadPage
  }
}
