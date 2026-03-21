#!/bin/bash

##############################################################################
# health-check.sh
# Checks Agent Mind system health and reports issues
#
# Usage: bash .agent-mind/.am-tools/health-check.sh
#
# Exit codes:
#   0 = Healthy (no issues)
#   1 = Issues found
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Find .agent-mind root by walking up from script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_MIND_ROOT="$(cd "$(dirname "$SCRIPT_DIR")" && pwd)"

# Thresholds
BOOT_MD_MAX_LINES=150
PROTOCOLS_MAX_LINES=200
PATTERNS_MAX_LINES=200

# Status tracking
HEALTH_STATUS=0
ISSUES_FOUND=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Agent Mind Health Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Helper function to report status
report_check() {
  local check_name="$1"
  local status="$2"
  local message="$3"

  case $status in
    pass)
      echo -e "${GREEN}✓ $check_name${NC}: $message"
      ;;
    warn)
      echo -e "${YELLOW}⚠ $check_name${NC}: $message"
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
      ;;
    fail)
      echo -e "${RED}✗ $check_name${NC}: $message"
      HEALTH_STATUS=1
      ISSUES_FOUND=$((ISSUES_FOUND + 1))
      ;;
  esac
}

# 1. Check line counts
echo "📊 Line Counts:"
echo ""

# BOOT.md
if [[ -f "$AGENT_MIND_ROOT/BOOT.md" ]]; then
  boot_lines=$(wc -l < "$AGENT_MIND_ROOT/BOOT.md")
  if (( boot_lines < BOOT_MD_MAX_LINES )); then
    report_check "BOOT.md" "pass" "$boot_lines lines (< $BOOT_MD_MAX_LINES)"
  else
    report_check "BOOT.md" "warn" "$boot_lines lines (exceeds $BOOT_MD_MAX_LINES limit)"
  fi
else
  report_check "BOOT.md" "fail" "File not found"
fi

# Protocol files
echo ""
if [[ -d "$AGENT_MIND_ROOT/protocols" ]]; then
  for protocol_file in "$AGENT_MIND_ROOT/protocols"/*.md; do
    if [[ -f "$protocol_file" ]]; then
      proto_name=$(basename "$protocol_file")
      proto_lines=$(wc -l < "$protocol_file")
      if (( proto_lines < PROTOCOLS_MAX_LINES )); then
        report_check "protocol: $proto_name" "pass" "$proto_lines lines (< $PROTOCOLS_MAX_LINES)"
      else
        report_check "protocol: $proto_name" "warn" "$proto_lines lines (exceeds $PROTOCOLS_MAX_LINES limit)"
      fi
    fi
  done
else
  report_check "protocols/" "fail" "Directory not found"
fi

# Knowledge domain patterns
echo ""
if [[ -d "$AGENT_MIND_ROOT/knowledge" ]]; then
  for domain_dir in "$AGENT_MIND_ROOT/knowledge"/*; do
    if [[ -d "$domain_dir" ]]; then
      domain_name=$(basename "$domain_dir")
      patterns_file="$domain_dir/patterns.md"
      if [[ -f "$patterns_file" ]]; then
        patterns_lines=$(wc -l < "$patterns_file")
        if (( patterns_lines < PATTERNS_MAX_LINES )); then
          report_check "knowledge: $domain_name" "pass" "$patterns_lines lines (< $PATTERNS_MAX_LINES)"
        else
          report_check "knowledge: $domain_name" "warn" "$patterns_lines lines (exceeds $PATTERNS_MAX_LINES limit)"
        fi
      fi
    fi
  done
fi

# 2. Check for [UNVERIFIED] tags
echo ""
echo "🔍 Verification Status:"
echo ""

unverified_count=0
if [[ -d "$AGENT_MIND_ROOT/knowledge" ]]; then
  unverified_count=$(grep -r "\[UNVERIFIED\]" "$AGENT_MIND_ROOT/knowledge" 2>/dev/null | wc -l || true)
fi

if (( unverified_count == 0 )); then
  report_check "Unverified tags" "pass" "No [UNVERIFIED] tags found"
else
  report_check "Unverified tags" "warn" "Found $unverified_count [UNVERIFIED] tags"
fi

# 3. Count episodes and insights
echo ""
echo "📈 Content Summary:"
echo ""

episodes_count=0
if [[ -d "$AGENT_MIND_ROOT/history/episodes" ]]; then
  episodes_count=$(find "$AGENT_MIND_ROOT/history/episodes" -name "*.md" -not -name "_index.md" | wc -l || true)
fi
report_check "Episodes recorded" "pass" "$episodes_count episode(s)"

insights_count=0
if [[ -d "$AGENT_MIND_ROOT/knowledge" ]]; then
  insights_count=$(find "$AGENT_MIND_ROOT/knowledge" -name "*.md" -not -name "patterns.md" -not -name "_index.md" | wc -l || true)
fi
report_check "Knowledge insights" "pass" "$insights_count insight(s)"

reflections_count=0
if [[ -d "$AGENT_MIND_ROOT/history/reflections" ]]; then
  reflections_count=$(find "$AGENT_MIND_ROOT/history/reflections" -name "*.md" -not -name "_index.md" | wc -l || true)
fi
report_check "Reflections recorded" "pass" "$reflections_count reflection(s)"

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
if (( HEALTH_STATUS == 0 && ISSUES_FOUND == 0 )); then
  echo -e "${GREEN}✓ Agent Mind is healthy${NC}"
else
  echo -e "${YELLOW}⚠ Found $ISSUES_FOUND issue(s)${NC}"
fi
echo -e "${BLUE}========================================${NC}"

exit $HEALTH_STATUS
