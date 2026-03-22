#!/bin/bash

##############################################################################
# validate.sh
# Validates Agent Mind structure and required files
#
# Usage: bash .agent-mind/.am-tools/validate.sh
#
# Exit codes:
#   0 = All checks passed
#   1 = One or more checks failed
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

# Status tracking
VALIDATION_STATUS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Agent Mind Structure Validation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Helper function to report validation result
check_item() {
  local item_name="$1"
  local item_path="$2"
  local item_type="$3" # "dir" or "file"

  if [[ "$item_type" == "dir" ]]; then
    if [[ -d "$item_path" ]]; then
      echo -e "${GREEN}✓ Directory exists: $item_name${NC}"
      PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
      echo -e "${RED}✗ Directory missing: $item_name${NC}"
      VALIDATION_STATUS=1
      FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
  elif [[ "$item_type" == "file" ]]; then
    if [[ -f "$item_path" ]]; then
      echo -e "${GREEN}✓ File exists: $item_name${NC}"
      PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
      echo -e "${RED}✗ File missing: $item_name${NC}"
      VALIDATION_STATUS=1
      FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
  fi
}

# 1. Check required directories
echo "📁 Required Directories:"
echo ""

check_item "protocols/" "$AGENT_MIND_ROOT/protocols" "dir"
check_item "knowledge/" "$AGENT_MIND_ROOT/knowledge" "dir"
check_item "workspace/" "$AGENT_MIND_ROOT/workspace" "dir"
check_item "history/" "$AGENT_MIND_ROOT/history" "dir"
check_item "history/episodes/" "$AGENT_MIND_ROOT/history/episodes" "dir"
check_item "history/reflections/" "$AGENT_MIND_ROOT/history/reflections" "dir"
check_item "adapters/" "$AGENT_MIND_ROOT/adapters" "dir"

# 2. Check required files at root
echo ""
echo "📄 Required Root Files:"
echo ""

check_item "BOOT.md" "$AGENT_MIND_ROOT/BOOT.md" "file"
check_item "config.md" "$AGENT_MIND_ROOT/config.md" "file"
check_item "VERSION.md" "$AGENT_MIND_ROOT/VERSION.md" "file"

# 3. Check protocol files
echo ""
echo "📋 Protocol Files:"
echo ""

# Define expected protocols (can be customized)
required_protocols=("reflexion.md" "memory.md" "tools.md")
for protocol in "${required_protocols[@]}"; do
  protocol_file="$AGENT_MIND_ROOT/protocols/$protocol"
  if [[ -f "$protocol_file" ]]; then
    echo -e "${GREEN}✓ Protocol exists: $protocol${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  else
    # Protocols might be optional depending on setup
    echo -e "${YELLOW}⚠ Protocol not found (optional): $protocol${NC}"
  fi
done

# 4. Validate BOOT.md references
echo ""
echo "🔗 BOOT.md References:"
echo ""

if [[ -f "$AGENT_MIND_ROOT/BOOT.md" ]]; then
  # Extract file paths from BOOT.md (look for markdown links and file references)
  # This is a basic check for relative paths
  boot_refs=$(grep -oE '\./[^"\s\)]+|\.\/\.\.[^"\s\)]+' "$AGENT_MIND_ROOT/BOOT.md" 2>/dev/null || true)

  if [[ -z "$boot_refs" ]]; then
    echo -e "${GREEN}✓ BOOT.md reference check: OK (no external references or all valid)${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  else
    # Check each reference exists
    ref_valid=true
    while IFS= read -r ref; do
      # Normalize path (remove leading ./)
      normalized_ref="${ref#./}"
      full_path="$AGENT_MIND_ROOT/$normalized_ref"

      if [[ ! -e "$full_path" ]]; then
        echo -e "${RED}✗ Invalid reference in BOOT.md: $ref${NC}"
        ref_valid=false
        VALIDATION_STATUS=1
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
      fi
    done <<< "$boot_refs"

    if [[ "$ref_valid" == true ]]; then
      echo -e "${GREEN}✓ BOOT.md references are valid${NC}"
      PASSED_CHECKS=$((PASSED_CHECKS + 1))
    fi
  fi
else
  echo -e "${RED}✗ Cannot validate BOOT.md (file not found)${NC}"
  VALIDATION_STATUS=1
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# 5. Check config.md structure
echo ""
echo "⚙️  Configuration:"
echo ""

if [[ -f "$AGENT_MIND_ROOT/config.md" ]]; then
  # Check for at least some basic structure
  if grep -q "^#" "$AGENT_MIND_ROOT/config.md"; then
    echo -e "${GREEN}✓ config.md has valid markdown structure${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
  else
    echo -e "${YELLOW}⚠ config.md might not have valid structure${NC}"
  fi
else
  echo -e "${RED}✗ config.md not found${NC}"
  VALIDATION_STATUS=1
  FAILED_CHECKS=$((FAILED_CHECKS + 1))
fi

# Summary
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC} | Failed: ${RED}$FAILED_CHECKS${NC}"

if (( VALIDATION_STATUS == 0 )); then
  echo -e "${GREEN}✓ All validation checks passed${NC}"
else
  echo -e "${RED}✗ Validation failed - see errors above${NC}"
fi
echo -e "${BLUE}========================================${NC}"

exit $VALIDATION_STATUS
