---
name: academic-illustration
description: Generate black-and-white printed illustrations for academic books based on Tufte data-ink ratio principles, Novak concept mapping theory, and causal loop diagrams. Creates diagrams for interdisciplinary theories including core-environment coupling models and three-stage evolution diagrams.
version: 1.0.0
author: Stigmergy Project
tags:
  [
    academic-illustration,
    scientific-visualization,
    concept-mapping,
    causal-loop-diagrams,
    information-design,
    tufte-principles,
  ]
references:
  - Edward R. Tufte - The Visual Display of Quantitative Information (1983)
  - Novak & Cañas - The Theory Underlying Concept Maps (2006)
  - Cascade Institute - Causal Loop Diagrams Handbook (2024)
  - Martin Krzywinski - Scientific Illustration Methods
---

# Academic Illustration Skill

## Overview

Generate black-and-white printed illustrations for interdisciplinary academic theories. Apply evidence-based visualization principles from Edward Tufte (data-ink ratio maximization), Novak & Cañas (concept mapping theory), and the Cascade Institute (causal loop diagrams) to create clear, publication-ready diagrams for philosophy, sociology, information science, and complex systems theories.

## When to Use This Skill

Use this skill when the user requests:

- Academic illustrations for books or publications
- Black-and-white diagrams for print media
- Visual explanations of complex interdisciplinary theories
- Concept relationship diagrams
- Causal loop diagrams with S/O notation
- Core-environment coupling visualizations
- Evolution/timeline diagrams
- Diagrams requiring dual-audience accessibility (experts + general readers)

## Quick Start

When the user requests an academic illustration:

1. **Identify** the theory type and core message to convey
2. **Select** appropriate diagram type (concept map, causal loop, evolution, coupling)
3. **Apply** Tufte data-ink ratio principles
4. **Design** with visual hierarchy for dual audiences
5. **Generate** ASCII/text representation with design specifications

## Core Functions

### Primary Functions

- **Concept Relationship Diagrams**: Create hierarchical concept maps with cross-domain links using Novak's framework
- **Causal Loop Diagrams**: Build system dynamics diagrams with S (same-direction) and O (opposite-direction) notation
- **Core-Environment Coupling Visualizations**: Design bidirectional coupling models showing mutual constitution

### Secondary Functions

- **Evolution/Timeline Diagrams**: Create three-stage progression diagrams with phase transitions
- **Dual-Audience Adaptation**: Layer information for experts and general readers
- **Visual Hierarchy Design**: Apply grayscale, line weight, and texture strategies

### Advanced Functions

- **Argument Mapping**: Visualize complex arguments with premises, conclusions, and objections
- **Feedback Loop Annotation**: Identify reinforcing (R) and balancing (B) loops
- **Accessibility Optimization**: Ensure 5-second comprehension for general readers

## Visual Design Specifications

### Grayscale Hierarchy

| Value             | Usage                                      |
| ----------------- | ------------------------------------------ |
| Black (100%)      | Primary data, main relationships, emphasis |
| Dark Gray (60%)   | Secondary elements, supporting connections |
| Medium Gray (40%) | Supporting structures, boundaries          |
| Light Gray (20%)  | Context, grids, reference elements         |
| White (0%)        | Negative space, separation                 |

### Line Weight Standards

| Weight      | Application                            |
| ----------- | -------------------------------------- |
| 2pt Thick   | Primary relationships, main flow       |
| 1pt Medium  | Secondary connections, standard arrows |
| 0.75pt Thin | Tertiary links, dashed boundaries      |
| 0.5pt Fine  | Reference grids, subtle annotations    |

### Texture Strategies for B&W Print

| Texture        | Application                   |
| -------------- | ----------------------------- |
| Diagonal lines | Category A elements           |
| Dots           | Category B elements           |
| Crosshatch     | Category C elements           |
| Solid fill     | Core concepts                 |
| Dashed outline | Conditional/optional elements |

## Diagram Type Specifications

### Concept Relationship Diagrams

**Structure**: Apply Novak's concept mapping syntax

```
[Concept] ──[linking phrase]── [Concept]
```

**Design Rules**:

1. One concept per node (no compound nodes)
2. Select 3-7 words per concept label
3. Horizontal reading direction
4. Arrowheads indicate direction of relationship
5. Cross-links shown with different line weight

**Example Syntax**:

```
INFORMATION FIELD
      │
      ├──[shapes]──► PHYSICAL INFRASTRUCTURE
      │                   │
      └──[enables]──► SOCIAL PRACTICES
```

### Causal Loop Diagrams

**Notation System** (Cascade Institute):

- `S` link: Same direction change (+)
- `O` link: Opposite direction change (−)
- `R`: Reinforcing loop (growth/decay)
- `B`: Balancing loop (goal-seeking)

**Design Rules**:

1. Limit to 15-20 elements per diagram
2. Show feedback loops explicitly
3. Label all links with S/O notation
4. Use delay symbols for time lags

**Example Syntax**:

```
ACCESSING ──S──► IMMERSION ──S──► INTEGRATION
    ▲                              │
    │                              ▼
    └──────────O──────────────────┘
           (balancing feedback)
```

### Core-Environment Coupling Model

**Visual Elements**:

1. **Bidirectional arrows** at interface to show co-constitution
2. **Dashed boundary** to indicate permeable interface
3. **Texture contrast**: Flowing lines (process) vs solid fill (structure)
4. **Annotation zone** for theoretical notes

**Example Syntax**:

```
┌─────────────────────────────────────────────┐
│         INFORMATION FIELD                    │
│    ════════════════════════════════         │
│    ║     RIVER (Process Flow)     ║         │
│    ════════════════════════════════         │
│         ↑              ↓                    │
│    ◄──►│◄─────────────►│◄──►                │
│    ════════════════════════════════         │
│    ║  RIVERBED (Infrastructure)  ║           │
│    ════════════════════════════════         │
│         SOCIAL-PRACTICAL CONTEXT            │
└─────────────────────────────────────────────┘
```

### Three-Stage Evolution Diagram

**Design Specifications**:

- Equal-width boxes for parallel structure
- Progressive darkening (light→medium→dark)
- Curved arrows for feedback mechanisms
- Clear phase transitions between stages

**Example Syntax**:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ACCESSING     │───►│   IMMERSION     │───►│   INTEGRATION    │
│   (Light 20%)   │    │   (Medium 40%)  │    │   (Dark 60%)    │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                     │                     │
         ▼                     ▼                     ▼
      Scanning            Engaging             Internalizing
         │                     │                     │
    ┌────┴────┐           ┌────┴────┐           ┌────┴────┐
    │ ◄──►   │           │ ◄──►   │           │ ◄──►   │
    │Feedback│           │Feedback│           │Feedback│
    └────────┘           └────────┘           └────────┘
```

## Dual-Audience Layering Strategy

### Three-Tier Information Design

**TIER 1: Overview (General Reader)**

- Main message visible at 3-second glance
- Simple visual metaphor
- Key takeaway labeled prominently

**TIER 2: Structure (Informed Reader)**

- Full concept relationships visible
- Supporting evidence paths
- Cross-domain connections

**TIER 3: Detail (Expert Reader)**

- Full annotation and definitions
- Methodology notes
- Data sources and uncertainty indicators

## Quality Evaluation Criteria

### Diagnostic Checklist

**Clarity (30%)**

- [ ] Main message identifiable in 5 seconds
- [ ] Clear visual hierarchy
- [ ] No ambiguous relationships

**Accuracy (25%)**

- [ ] Relationships correctly represented
- [ ] No implied causation without evidence
- [ ] Uncertainty acknowledged where present

**Efficiency (25%)**

- [ ] Data-ink ratio maximized (Tufte)
- [ ] No redundant elements
- [ ] Appropriate complexity for audience

**Aesthetics (20%)**

- [ ] Visual balance
- [ ] Consistent style
- [ ] Professional appearance

## Test Scenarios

### Scenario 1: 5-Second Comprehension Test

**Procedure**: Subject views diagram for 5 seconds, then recalls main message and key elements

**Pass Criteria**: ≥70% recall of primary elements (main relationship, core concept)

**Example Prompt**:

```
Test the "River and Riverbed" coupling model with 10 participants.
After 5 seconds of viewing, ask: "What is the relationship between
the river and riverbed?" Record accuracy of "mutual constitution"
or "bidirectional shaping" responses.
```

### Scenario 2: Expert Accuracy Review

**Procedure**: Domain expert evaluates theoretical accuracy

**Pass Criteria**: No conceptual errors identified

**Example Prompt**:

```
Have a systems theory expert review the causal loop diagram.
Verify S/O notation accuracy and loop identification.
```

### Scenario 3: Dual-Audience Clarity Test

**Procedure**: Present to both expert and general reader; measure comprehension

**Pass Criteria**: Both audiences identify primary message; experts identify secondary relationships

### Scenario 4: Data-Ink Ratio Assessment

**Procedure**: Calculate data-ink ratio using Tufte formula

**Formula**: Data-Ink Ratio = Data-Ink ÷ Total Ink Used

**Pass Criteria**: Ratio ≥ 0.8 (80% of ink conveys information)

## Common Pitfalls to Avoid

### Information Overload

| Pitfall                 | Solution                               |
| ----------------------- | -------------------------------------- |
| Too many concepts (>15) | Split into multiple diagrams           |
| Complex cross-links     | Limit cross-links to 3-4 critical ones |
| Ambiguous hierarchy     | Use consistent alignment and sizing    |
| Inconsistent symbolism  | Create and follow style guide          |

### Visual Design Errors

1. **Chartjunk**: Remove decorative elements (Tufte)
2. **False precision**: Don't imply accuracy that doesn't exist
3. **Missing legend**: Always label non-obvious elements
4. **Inconsistent direction**: Maintain single reading direction
5. **Overuse of color**: Use value not hue in B&W design

## Implementation Workflow

### Step 1: Content Analysis

1. Identify the primary message to convey
2. List all concepts and their relationships
3. Determine causal vs. correlational links
4. Identify feedback loops if applicable

### Step 2: Diagram Selection

| Content Type          | Recommended Diagram           |
| --------------------- | ----------------------------- |
| Hierarchical concepts | Concept Relationship Diagram  |
| Causal mechanisms     | Causal Loop Diagram           |
| Temporal evolution    | Three-Stage Evolution Diagram |
| Mutual constitution   | Core-Environment Coupling     |
| Complex arguments     | Argument Mapping              |

### Step 3: Visual Design

1. Apply grayscale hierarchy
2. Set line weights by importance
3. Add textures for categorical distinction
4. Design annotation zones

### Step 4: Dual-Audience Layering

1. Create TIER 1 overview (visible by default)
2. Add TIER 2 structure (for informed readers)
3. Include TIER 3 details (for experts)

### Step 5: Quality Check

1. Apply 5-second test
2. Verify data-ink ratio
3. Check for consistency
4. Test at multiple sizes

## Output Format

Generate a structured output containing:

1. **Diagram Type**: Selected diagram category
2. **ASCII Representation**: Text-based visual layout
3. **Design Specifications**: Grayscale values, line weights, textures
4. **Legend**: Element definitions
5. **Audience Notes**: TIER 1/2/3 layer descriptions
6. **Quality Metrics**: Self-assessed checklist completion
7. **Recommendations**: Suggestions for refinement

## Examples

### Example 1: Information Field Coupling

**Request**: Illustrate how information field shapes and is shaped by physical-social infrastructure

**Output**:

```
DIAGRAM TYPE: Core-Environment Coupling

┌─────────────────────────────────────────────────────────────┐
│                    INFORMATION FIELD                         │
│   ════════════════════════════════════════════════════     │
│   ║                                                   ║     │
│   ║     MENTAL MODELS ◄───────► INFORMATION FLOW     ║     │
│   ║            │                     │                 ║     │
│   ║            │ S                    │ S              ║     │
│   ║            ▼                     ▼                 ║     │
│   ║     COGNITIVE STRUCTURE    KNOWLEDGE ARCHITECT     ║     │
│   ║                                                   ║     │
│   ════════════════════════════════════════════════════     │
│              ↑                         ↓                    │
│         (permeable interface with bidirectional flow)      │
│              ↓                         ↑                    │
│   ════════════════════════════════════════════════════     │
│   ║                                                   ║     │
│   ║     DIGITAL INFRASTRUCTURE ◄───► SOCIAL PRACTICE  ║     │
│   ║            │                     │                 ║     │
│   ║            │ S                    │ O              ║     │
│   ║            ▼                     ▼                 ║     │
│   ║     TECHNICAL STANDARDS     INSTITUTIONAL FORMS   ║     │
│   ║                                                   ║     │
│   ════════════════════════════════════════════════════     │
│              PHYSICAL-SOCIAL INFRASTRUCTURE                 │
└─────────────────────────────────────────────────────────────┘

LEGEND:
- Solid arrows (S): Same-direction change
- Interface: Dashed boundary indicating permeability
- Textures: River = flowing lines, Riverbed = solid fill
```

### Example 2: Three-Stage Evolution

**Request**: Create evolution diagram for Accessing → Immersion → Integration

**Output**:

```
DIAGRAM TYPE: Three-Stage Evolution

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│    ┌───────────────┐     ┌───────────────┐     ┌──────────┐ │
│    │   ACCESSING   │────►│   IMMERSION   │────►│INTEGRAT- │ │
│    │   ░░░ Light   │     │   ▒▒▒▒▒▒▒▒    │     │   ION    │ │
│    │               │     │               │     │▓▓▓▓▓▓▓▓▓▓▓│ │
│    │ • Discovery   │     │ • Engagement  │     │• Synthesis│ │
│    │ • Orientation │     │ • Deep Work   │     │• Identity │ │
│    └───────┬───────┘     └───────┬───────┘     └────┬─────┘ │
│            │                     │                   │       │
│            │                     │                   │       │
│            ▼                     ▼                   ▼       │
│       Scanning              Internalizing        Becoming   │
│            │                     │                   │       │
│      ┌─────┴─────┐        ┌─────┴─────┐       ┌────┴────┐  │
│      │ ◄──►      │        │ ◄──►      │       │ ◄──►   │  │
│      │ Exploration│       │ Balancing │       │Stabilized│ │
│      └────────────┘       └───────────┘       └─────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

DESIGN NOTES:
- Progressive darkening: Light (20%) → Medium (40%) → Dark (60%)
- Equal-width boxes maintain parallel structure
- Circular arrows show stabilization mechanisms
- Dots indicate primary actions in each stage
```

## Parameters

- `diagram_type`: Type of diagram (concept, causal-loop, coupling, evolution)
- `complexity_level`: 1 (simple), 2 (moderate), 3 (detailed)
- `audience_level`: general, mixed, expert, or all
- `include_annotations`: Boolean for TIER 3 expert notes
- `data_ink_minimum`: Minimum data-ink ratio target (default 0.8)
- `color_mode`: Always black-and-white for print

## Resources

- Tufte, E.R. (1983). _The Visual Display of Quantitative Information_
- Novak, J.D. & Cañas, A.J. (2006). _The Theory Underlying Concept Maps_
- Cascade Institute. _Causal Loop Diagrams Handbook_ (2024)
- Krzywinski, M. _Scientific Illustration Methods_
- IHMC CmapTools: https://cmap.ihmc.us/
- Information Is Beautiful Awards: https://informationisbeautifulawards.com/
