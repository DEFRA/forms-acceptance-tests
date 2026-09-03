#!/bin/sh

echo "run_id: $RUN_ID"
npm install playwright-core
export HTTP_PROXY=http://localhost:3128
export HTTPS_PROXY=http://localhost:3128
PLAYWRIGHT_CHROMIUM_HERMETIC_EXECUTABLE=1 npx playwright install chromium
npm test

if [ "$(ls allure-results 2>/dev/null | wc -l)" -eq 0 ]; then
  echo "No test results generated"
  exit 1
fi

npm run report:publish
publish_exit_code=$?

if [ $publish_exit_code -ne 0 ]; then
  echo "failed to publish test results"
  exit $publish_exit_code
fi

# At the end of the test run, if the suite has failed we write a file called 'FAILED'
if [ -f FAILED ]; then
  echo "test suite failed"
  cat ./FAILED
  exit 1
fi

echo "test suite passed"
exit 0
