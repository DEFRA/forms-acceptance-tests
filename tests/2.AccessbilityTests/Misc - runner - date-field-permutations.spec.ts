import { test, expect } from '@playwright/test';

const url = 'https://forms-runner.dev.cdp-int.defra.cloud/form/preview/draft/jn-cph-live/date-to-be-removed';

// Permutations: [day, month, year, shouldBeValid]
const datePermutations: [string, string, string, boolean][] = [
    ['01', '05', '2024', true],
    ['31', '12', '2024', true],
    ['29', '02', '2020', true], // leap year
    ['29', '02', '2024', true], // leap year
    ['32', '01', '2024', false],
    ['00', '01', '2024', false],
    ['01', '13', '2024', false],
    ['01', '00', '2024', false],
    ['01', '05', 'abcd', false],
    ['abc', '05', '2024', false],
    ['', '05', '2024', false],
    ['01', '', '2024', false],
    ['01', '05', '', false],
    ['', '', '', false],
    ['31', '04', '2024', false], // April has 30 days
    ['29', '02', '2023', false], // not a leap year
    ['01', '01', '20', false],
    ['01', '01', '2', false],
    ['01', '01', '20201', false],
    ['01', '1', '2024', true], // Accepts single-digit month
    ['1', '01', '2024', true], // Accepts single-digit day
    ['01', '01', '', false],
    ['01', '', '2024', false],
    ['', '01', '2024', false],
    ['01', '01', 'abcd', false],
    ['01', 'ab', '2024', false],
    ['ab', '01', '2024', false],
    [' 1', '01', '2024', true],
    ['01', ' 1', '2024', true], //spaces are still valid
    ['01', '01', ' 2024', true],
    ['-1', '01', '2024', false],
    ['01', '-1', '2024', false],
    ['01', '01', '-2024', false],
    ['01', '01', '2024!', false],
    ['01', '@1', '2024', false],
    ['#1', '01', '2024', false],
];
//better to move this to a unit test
test.skip('Date field permutations (DD MM YYYY)', () => {
    for (const [i, [day, month, year, shouldBeValid]] of datePermutations.entries()) {
        test(
            `#${i + 1}: should ${shouldBeValid ? 'accept' : 'reject'} date input: '${day}-${month}-${year}'`,
            async ({ page }, testInfo) => {
                await page.goto(url);

                await page.getByLabel('Day').fill('');
                await page.getByLabel('Month').fill('');
                await page.getByLabel('Year').fill('');
                if (day) await page.getByLabel('Day').fill(day);
                if (month) await page.getByLabel('Month').fill(month);
                if (year) await page.getByLabel('Year').fill(year);

                await page.getByRole('button', { name: /Continue/i }).click();

                const error = page.locator('.govuk-error-message, [role="alert"], .error-message').first();
                try {
                    if (shouldBeValid) {
                        await expect(error).toHaveCount(0);
                    } else {
                        await expect(error).toHaveCount(1);
                    }
                } catch (e) {
                    const inputDetails = `Test failed for input: day='${day}', month='${month}', year='${year}', shouldBeValid=${shouldBeValid}`;
                    if (testInfo.attach) {
                        await testInfo.attach('input-details', { body: inputDetails, contentType: 'text/plain' });
                    }
                    throw e;
                }
            }
        );
    }
}); 