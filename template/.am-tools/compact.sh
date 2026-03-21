#!/bin/bash

##############################################################################
# compact.sh
# Mechanical compaction tool for Agent Mind episodes and reflections
#
# Usage: bash .agent-mind/.am-tools/compact.sh \
#   --task "slug" \
#   --outcome "completed|failed|abandoned" \
#   --domain "domain" \
#   --summary "one line" \
#   [--clear-workspace]
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Find .agent-mind root by walking up from script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_MIND_ROOT="$(cd "$(dirname "$SCRIPT_DIR")" && pwd)"

# Parse command-line arguments
TASK_SLUG=""
OUTCOME=""
DOMAIN=""
SUMMARY=""
CLEAR_WORKSPACE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --task)
      TASK_SLUG="$2"
      shift 2
      ;;
    --outcome)
      OUTCOME="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    --summary)
      SUMMARY="$2"
      shift 2
      ;;
    --clear-workspace)
      CLEAR_WORKSPACE=true
      shift
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

# Validate required arguments
if [[ -z "$TASK_SLUG" || -z "$OUTCOME" || -z "$DOMAIN" || -z "$SUMMARY" ]]; then
  echo -e "${RED}Error: Missing required arguments${NC}"
  echo "Usage: bash .agent-mind/.am-tools/compact.sh \\"
  echo "  --task \"slug\" \\"
  echo "  --outcome \"completed|failed|abandoned\" \\"
  echo "  --domain \"domain\" \\"
  echo "  --summary \"one line\" \\"
  echo "  [--clear-workspace]"
  exit 1
fi

# Validate outcome value
if [[ ! "$OUTCOME" =~ ^(completed|failed|abandoned)$ ]]; then
  echo -e "${RED}Error: outcome must be 'completed', 'failed', or 'abandoned'${NC}"
  exit 1
fi

# Get current date and time
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
YEAR_MONTH=$(date -u +"%Y-%m")

# Create history/episodes directory if needed
EPISODES_DIR="$AGENT_MIND_ROOT/history/episodes/$YEAR_MONTH"
mkdir -p "$EPISODES_DIR"

# Create episode file
EPISODE_FILE="$EPISODES_DIR/${TASK_SLUG}.md"
cat > "$EPISODE_FILE" << EOF
# Episode: $TASK_SLUG

**Domain**: $DOMAIN
**Outcome**: $OUTCOME
**Date**: $NOW

## Summary
$SUMMARY

---
_Auto-created by compact.sh_
EOF

echo -e "${GREEN}✓ Created episode: $EPISODE_FILE${NC}"

# Append one-liner to _index.md
INDEX_FILE="$AGENT_MIND_ROOT/history/episodes/_index.md"
if [[ ! -f "$INDEX_FILE" ]]; then
  echo "# Episodes Index" > "$INDEX_FILE"
  echo "" >> "$INDEX_FILE"
fi
echo "- \`$YEAR_MONTH/$TASK_SLUG.md\` [$OUTCOME] $SUMMARY" >> "$INDEX_FILE"
echo -e "${GREEN}✓ Updated episodes index${NC}"

# If outcome is "failed", create reflection
if [[ "$OUTCOME" == "failed" ]]; then
  REFLECTIONS_DIR="$AGENT_MIND_ROOT/history/reflections"
  mkdir -p "$REFLECTIONS_DIR"

  REFLECTION_FILE="$REFLECTIONS_DIR/${TASK_SLUG}-reflection.md"
  cat > "$REFLECTION_FILE" << EOF
# Reflection: $TASK_SLUG (Failed)

**Domain**: $DOMAIN
**Original Summary**: $SUMMARY
**Date**: $NOW

## What Went Wrong
[To be filled in by agent or human]

## Lessons Learned
[To be filled in by agent or human]

## Next Steps
[To be filled in by agent or human]

---
_Auto-created by compact.sh for failed episode_
EOF

  echo -e "${GREEN}✓ Created reflection: $REFLECTION_FILE${NC}"

  # Append to reflections _index.md
  REFLECTIONS_INDEX="$AGENT_MIND_ROOT/history/reflections/_index.md"
  if [[ ! -f "$REFLECTIONS_INDEX" ]]; then
    echo "# Reflections Index" > "$REFLECTIONS_INDEX"
    echo "" >> "$REFLECTIONS_INDEX"
  fi
  echo "- \`${TASK_SLUG}-reflection.md\` (from \`$YEAR_MONTH/$TASK_SLUG.md\`)" >> "$REFLECTIONS_INDEX"
  echo -e "${GREEN}✓ Updated reflections index${NC}"
fi

# Clear workspace if requested
if [[ "$CLEAR_WORKSPACE" == true ]]; then
  WORKSPACE_DIR="$AGENT_MIND_ROOT/workspace"
  if [[ -d "$WORKSPACE_DIR" ]]; then
    # Find and remove files, but keep the directory structure
    find "$WORKSPACE_DIR" -type f -exec rm -f {} +
    echo -e "${GREEN}✓ Cleared workspace files${NC}"
  fi
fi

echo ""
echo -e "${GREEN}✓ Compaction complete${NC}"
echo "  Episode: $EPISODE_FILE"
echo "  Domain: $DOMAIN"
echo "  Outcome: $OUTCOME"
if [[ "$CLEAR_WORKSPACE" == true ]]; then
  echo "  Workspace: cleared"
fi
