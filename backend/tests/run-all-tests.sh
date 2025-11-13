#!/bin/bash

#######################################################
# MASTER TEST RUNNER
# Runs all role-based test suites
#######################################################

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

API_URL="http://localhost:5000/api/v1"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   URBAN CLEAN - MASTER TEST SUITE     ║${NC}"
echo -e "${BLUE}║   Complete End-to-End API Testing     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Check if server is running
echo -e "${BLUE}Checking backend server...${NC}"
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5000" 2>/dev/null || echo "000")

if [ "$HEALTH_CHECK" = "000" ]; then
    echo -e "${RED}✗ Backend server is not running!${NC}\n"
    echo -e "${YELLOW}Please start the backend server:${NC}"
    echo -e "  cd backend"
    echo -e "  npm run dev\n"
    exit 1
fi

echo -e "${GREEN}✓ Backend server is running${NC}\n"

# Check if database is seeded
echo -e "${BLUE}Checking database...${NC}"
SERVICES_CHECK=$(curl -s "$API_URL/services" 2>/dev/null | jq -r '.data.services // .services' 2>/dev/null)

if [ "$SERVICES_CHECK" = "null" ] || [ -z "$SERVICES_CHECK" ]; then
    echo -e "${YELLOW}⚠ Warning: No services found in database${NC}"
    echo -e "${YELLOW}  Some tests may fail. Run: npm run seed${NC}\n"
else
    echo -e "${GREEN}✓ Database has services${NC}\n"
fi

# Track results
SUITE_PASSED=0
SUITE_FAILED=0

# Run tests based on argument or all
RUN_ALL=true
if [ "$1" = "resident" ]; then
    RUN_ALL=false
elif [ "$1" = "sevak" ]; then
    RUN_ALL=false
elif [ "$1" = "vendor" ]; then
    RUN_ALL=false
fi

#######################################################
# RESIDENT TESTS
#######################################################

if [ "$RUN_ALL" = "true" ] || [ "$1" = "resident" ]; then
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}    RUNNING RESIDENT TEST SUITE${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

    if [ -f "./test-resident-flow.sh" ]; then
        ./test-resident-flow.sh
        if [ $? -eq 0 ]; then
            ((SUITE_PASSED++))
        else
            ((SUITE_FAILED++))
        fi
    else
        echo -e "${RED}✗ Resident test script not found${NC}"
        ((SUITE_FAILED++))
    fi

    echo -e "\n"
fi

#######################################################
# SEVAK TESTS
#######################################################

if [ "$RUN_ALL" = "true" ] || [ "$1" = "sevak" ]; then
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}    RUNNING SEVAK TEST SUITE${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

    if [ -f "./test-sevak-flow.sh" ]; then
        ./test-sevak-flow.sh
        if [ $? -eq 0 ]; then
            ((SUITE_PASSED++))
        else
            ((SUITE_FAILED++))
        fi
    else
        echo -e "${RED}✗ Sevak test script not found${NC}"
        ((SUITE_FAILED++))
    fi

    echo -e "\n"
fi

#######################################################
# VENDOR TESTS
#######################################################

if [ "$RUN_ALL" = "true" ] || [ "$1" = "vendor" ]; then
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}    RUNNING VENDOR TEST SUITE${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}\n"

    if [ -f "./test-vendor-flow.sh" ]; then
        ./test-vendor-flow.sh
        if [ $? -eq 0 ]; then
            ((SUITE_PASSED++))
        else
            ((SUITE_FAILED++))
        fi
    else
        echo -e "${RED}✗ Vendor test script not found${NC}"
        ((SUITE_FAILED++))
    fi

    echo -e "\n"
fi

#######################################################
# FINAL SUMMARY
#######################################################

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        MASTER TEST SUITE RESULTS       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Test Suites Passed: $SUITE_PASSED${NC}"
echo -e "${RED}Test Suites Failed: $SUITE_FAILED${NC}"
TOTAL_SUITES=$((SUITE_PASSED + SUITE_FAILED))
echo -e "Total Test Suites: $TOTAL_SUITES\n"

if [ $SUITE_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓✓✓  ALL TESTS PASSED  ✓✓✓          ║${NC}"
    echo -e "${GREEN}║  Urban Clean API is working perfectly! ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ SOME TESTS FAILED                   ║${NC}"
    echo -e "${RED}║  Review the output above for details   ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}\n"
    exit 1
fi
