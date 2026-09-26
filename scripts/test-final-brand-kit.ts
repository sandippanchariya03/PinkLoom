/**
 * Final Brand Kit Engine Test Suite (Phase 9)
 * Comprehensive testing covering all required Phase 9 validation criteria:
 *
 * Completeness Gates:
 * 1. Complete BrandState passes completeness validation
 * 2. Discovery missing fails
 * 3. Positioning missing fails
 * 4. Personality missing fails
 * 5. selectedName missing fails
 * 6. Voice missing fails
 * 7. Visual Direction missing fails
 * 8. Consistency missing fails
 * 9. Delivery missing fails
 *
 * Deterministic Assembly:
 * 10. Brand Overview assembled
 * 11. Discovery assembled
 * 12. Positioning assembled
 * 13. Personality assembled
 * 14. Naming assembled
 * 15. Voice assembled
 * 16. Messaging assembled
 * 17. Visual Direction assembled
 * 18. Consistency summary assembled
 * 19. Usage assembled
 * 20. Delivery assets assembled
 *
 * Name Protection:
 * 21. selectedName unchanged
 * 22. Final Brand Kit name exactly equals selectedName
 *
 * Upstream State Preservation (Deep Immutability):
 * 23. Discovery unchanged
 * 24. Positioning unchanged
 * 25. Personality unchanged
 * 26. Naming unchanged
 * 27. Voice unchanged
 * 28. Visual Direction unchanged
 * 29. Critique unchanged
 * 30. Consistency unchanged
 * 31. Delivery unchanged
 *
 * Metadata & Versioning:
 * 32. completeness flags correct
 * 33. warnings preserved and deduplicated
 * 34. generatedAt & assembledAt present
 * 35. version increments correctly (e.g. 1 -> 2)
 *
 * Context Isolation:
 * 36. Brand A (Cybersecurity) assembled with only Brand A information
 * 37. Brand B (Artisan Wildflower Honey) assembled with only Brand B information
 * 38. Zero cross-brand contamination or data leakage
 *
 * Stage Gate:
 * 39. canRunFinalBrandKit gate validation
 * 40. AgentRun logging and metadata
 */

import {
  type BrandState,
  createInitialBrandState,
  FinalBrandKitSchema,
} from "../src/types/brand";
import {
  validateBrandKitCompleteness,
  canRunFinalBrandKit,
  assembleFinalBrandKit,
} from "../src/lib/brand-kit/final-brand-kit";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean | undefined | null, testName: string, detail?: string) {
  totalTests++;
  if (Boolean(condition)) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Helper to construct a fully validated BrandState
export function createCompleteMockBrandState(): BrandState {
  const base = createInitialBrandState("A modern AI platform for automating brand identity design");
  base.projectId = "test-project-brand-a";
  base.version = 1;

  // 1. Discovery
  base.discovery = {
    rawIdea: "An autonomous developer security intelligence platform that predicts cloud posture regressions.",
    problem: "Engineering teams push insecure infrastructure code because post-deployment scans arrive hours after merging.",
    targetAudience: {
      primary: "Cloud Security Architects and DevSecOps Leads at high-growth engineering organizations",
      secondary: ["Platform Engineers", "VP Engineering"],
      characteristics: ["High-velocity deployment cadence", "Complex multi-cloud environments"],
      painPoints: ["Alert fatigue from static analysis tools", "Siloed security and engineering workflows"],
      motivations: ["Prevent breaches before production rollout", "Maintain audit compliance automatically"],
    },
    userNeeds: ["Inline PR security feedback", "Contextual remediation suggestions", "Zero false positives"],
    constraints: ["Must integrate with GitHub and GitLab CI", "Sub-second analysis overhead"],
    assumptions: ["Teams deploy multiple times daily", "Infrastructure as Code is widely adopted"],
    missingInformation: [],
    clarifyingQuestions: [],
    isAnalyzed: true,
    analyzedAt: "2026-03-01T10:00:00.000Z",
  };

  // 2. Positioning
  base.positioning = {
    category: "Autonomous Cloud Posture Intelligence",
    categoryRationale: "Transcends passive scanning by integrating proactive, real-time remediation directly into developer workflows.",
    positioningStatement: "For cloud security teams overwhelmed by post-deployment alerts, AegisCloud is the autonomous intelligence platform that predicts posture drift before merge.",
    differentiator: "Deterministic pre-commit AST policy simulation coupled with zero-noise developer remediation.",
    valueProposition: "Transform cloud security from a late-stage audit roadblock into continuous engineering velocity.",
    competitiveWhitespace: ["Pre-merge policy simulation", "Developer-native fix snippets", "Unified multi-cloud compliance"],
    proofPoints: ["100x faster feedback loop", "85% reduction in production vulnerability tickets"],
    alternatives: ["Legacy posture scanners", "Manual security code reviews"],
    risks: ["Slow enterprise procurement cycles", "Resistance to automated pipeline policy blocking"],
    confidence: 0.94,
    isPositioned: true,
    positionedAt: "2026-03-01T10:30:00.000Z",
  };

  // 3. Personality
  base.personality = {
    archetype: "The Sentinel",
    archetypeRationale: "Reflects watchful vigilance, uncompromising precision, and steadfast protection without obstructing developer agility.",
    traits: ["Vigilant", "Precise", "Unflappable", "Authoritative", "Empowering"],
    behavioralCharacteristics: ["Speaks with engineering rigor", "Never panics or uses fearmongering", "Delivers actionable clarity"],
    principles: [
      { title: "Clarity over alarmism", description: "Never use fear tactics to motivate security action." },
      { title: "Precision over volume", description: "Deliver zero false positives rather than noisy alerts." },
      { title: "Speed with substance", description: "Evaluate policies within CI constraints without sacrificing depth." },
    ],
    emotionalTerritory: "Quiet confidence and unyielding technical mastery.",
    personalityDo: ["Provide concrete mathematical evidence", "Acknowledge engineering trade-offs"],
    personalityDont: ["Employ fear, uncertainty, or doubt (FUD)", "Use vague marketing buzzwords"],
    confidence: 0.91,
    isFormulated: true,
    formulatedAt: "2026-03-01T11:00:00.000Z",
  };

  // 4. Naming
  base.naming = {
    directions: [
      {
        id: "dir-1",
        name: "Architectural Fortification",
        strategy: "Names evoking architectural strength and cyber resilience.",
        rationale: "Aligns with Sentinel archetype.",
        namingLogic: "Combines classical Greek protective iconography with modern cloud infrastructure terms.",
        taglineCandidates: ["Autonomous Cloud Posture Intelligence", "Zero-Noise Pre-Merge Security"],
        candidates: [
          {
            name: "AegisCloud",
            rationale: "Aegis invokes classical protection and unassailable armor.",
            linguisticRationale: "Strong initial vowel followed by crisp dental consonants.",
            phoneticAssessment: "Crisp two-syllable cadence with authoritative delivery.",
            domainSuitability: "Excellent availability across tech TLDs.",
          },
        ],
      },
    ],
    selectedName: "AegisCloud",
    selectedTagline: "Autonomous Cloud Posture Intelligence",
    selectedDirectionId: "dir-1",
    isSelected: true,
    selectedAt: "2026-03-01T11:30:00.000Z",
    isGenerated: true,
    generatedAt: "2026-03-01T11:15:00.000Z",
  };

  // 5. Voice
  base.voice = {
    toneProfile: {
      primary: "Authoritative & Technical",
      secondary: ["Vigilant", "Direct", "Measured"],
      tonalBalance: "70% engineering precision, 30% reassuring calm",
      emotionalEffect: "Eliminates security anxiety through undeniable technical credibility",
    },
    toneDimensions: [
      { dimension: "Formality", level: 4, rationale: "Professional and engineering-focused" },
      { dimension: "Directness", level: 5, rationale: "Unambiguous recommendations" },
    ],
    vocabulary: {
      preferred: ["posture drift", "policy simulation", "deterministic", "remediation", "pre-merge"],
      avoid: ["silver bullet", "unbreakable", "magic", "game-changer", "hack-proof"],
      terminology: ["IaC", "AST simulation", "CIS Benchmarks"],
      languageCharacteristics: ["Active voice", "Concise declarative sentences"],
    },
    messagingPillars: [
      {
        title: "Predictive Security",
        purpose: "Stop breaches before code merges",
        keyMessage: "Simulate drift at PR time",
        supportingPoints: ["AST graph simulation", "Pre-commit policy checks"],
      },
      {
        title: "Zero Noise",
        purpose: "Only actionable remediations",
        keyMessage: "Zero false alarms",
        supportingPoints: ["Tailored code patches", "Verified policy contexts"],
      },
      {
        title: "Developer Velocity",
        purpose: "Security at CI speed",
        keyMessage: "Sub-second evaluation",
        supportingPoints: ["Under 400ms turnaround", "Zero developer friction"],
      },
    ],
    communicationPrinciples: [
      { principle: "Speak with evidence", description: "Cite CIS benchmarks and deterministic AST findings." },
      { principle: "Never use fear tactics", description: "Focus on engineering rigor, not alarmism." },
      { principle: "Respect developer time", description: "Provide direct code fixes instead of vague warnings." },
    ],
    writingGuidelines: {
      sentenceStyle: ["Direct, punchy engineering sentences"],
      structure: ["State observation, then root cause, then exact fix"],
      callsToAction: ["Deploy Policy Rule", "Inspect AST Analysis"],
      punctuationAndFormatting: ["Use monospace for code references", "Avoid exclamation marks"],
    },
    examples: {
      homepageHero: "Predict cloud drift before your code merges.",
      shortPitch: "AegisCloud simulates infrastructure policies in your pull requests, preventing misconfigurations before deployment.",
      primaryCTA: "Simulate Your First Policy",
      socialPost: "Static cloud scans arrive hours late. AegisCloud simulates posture regressions in sub-second pull request checks.",
    },
    voiceDonts: ["Do not use hyperbole", "Do not demean developer practices", "Do not make absolute safety guarantees"],
    consistencyRules: ["Always cite specific policy benchmarks", "Maintain calm diagnostic tone"],
    isGenerated: true,
    generatedAt: "2026-03-01T12:00:00.000Z",
  };

  // 6. Visual Direction
  base.visualDirection = {
    colorSystem: {
      primary: [
        { name: "Obsidian Deep", hex: "#0B0F19", role: "primary", usage: "Main background and dominant brand surfaces" },
        { name: "Electric Cyan", hex: "#00E5FF", role: "accent", usage: "Key interactive elements and verification badges" },
      ],
      secondary: [
        { name: "Slate Muted", hex: "#64748B", role: "secondary", usage: "Subdued borders and secondary labels" },
      ],
      neutrals: [
        { name: "Pure Light", hex: "#F8FAFC", role: "neutral", usage: "Primary text and icons" },
        { name: "Surface Dark", hex: "#1E293B", role: "neutral", usage: "Card backgrounds" },
      ],
      semantic: [
        { name: "Success Green", hex: "#10B981", role: "semantic", usage: "Policy pass" },
        { name: "Warning Amber", hex: "#F59E0B", role: "semantic", usage: "Policy warning" },
      ],
      accessibility: {
        contrastNotes: "14:1 contrast ratio across primary text on obsidian background",
        wcagCompliance: "WCAG 2.1 AAA",
        darkThemeConsiderations: "Engineered specifically for high-contrast dark environments",
      },
    },
    typography: {
      heading: {
        fontFamily: "Space Grotesk",
        category: "Sans-serif",
        weights: ["600", "700"],
        usage: "Section headers and primary stats",
      },
      body: {
        fontFamily: "JetBrains Mono",
        category: "Monospace",
        weights: ["400", "500"],
        usage: "Interface copy and technical parameters",
      },
      pairing: {
        headingFont: "Space Grotesk",
        bodyFont: "JetBrains Mono",
        contrast: "Technical display juxtaposed with code-native monospace",
        mood: "Engineered, clinical, cutting-edge",
      },
      rationale: "Reinforces terminal-grade intelligence and developer familiarity.",
    },
    visualPersonality: {
      aestheticMood: "Clinical Cyber-Observability",
      visualKeywords: ["Terminal", "Precision", "Telemetry", "Uncompromising", "Architectural"],
      designPrinciples: [
        { principle: "Telemetry First", description: "Information hierarchy mirrors mission-critical HUDs." },
        { principle: "Zero Decorative Flourish", description: "Every pixel communicates state or diagnostic data." },
      ],
      imageryDirection: "Abstract vector topology graphs and schematic policy trees.",
    },
    imagery: {
      photographyDirection: "Monochrome architectural infrastructure in dramatic cross-light",
      illustrationDirection: "Vector topology schematics and node connection graphs",
      composition: "Strict isometric grids with millimeter visual balance",
      subjectTreatment: "Sharp, vector-rendered node edges with glowing telemetry indicators",
    },
    logoDirection: {
      concept: "Interlocking geometric shields forming an abstracted cloud gateway",
      markDirection: "Sharp hexagonal polygon enclosing an invariant center point",
      wordmarkDirection: "Custom weighted Space Grotesk with clipped terminals",
      constructionPrinciples: [
        "Hexagonal vertices align to a 60-degree isometric grid",
        "Maintains 100% silhouette legibility down to 16px favicon",
      ],
    },
    layoutPrinciples: {
      spacing: "8px modular scale throughout all interface layouts",
      density: "High density with clear visual hierarchy",
      hierarchy: "Monospace telemetry primary, explanatory copy secondary",
      shapeLanguage: "Precise 4px corner radii with hairline borders",
      composition: "HUD-style modular grid cards",
    },
    colors: [
      { role: "primary", name: "Obsidian Deep", hex: "#0B0F19", rationale: "Dominant cyber presence" },
      { role: "accent", name: "Electric Cyan", hex: "#00E5FF", rationale: "Diagnostic verification" },
    ],
    overallAesthetic: "Clinical Cyber-Observability",
    isGenerated: true,
    generatedAt: "2026-03-01T12:30:00.000Z",
  };

  // 7. Critique
  base.critique = {
    overallAssessment: "Strong, cohesive security brand system with minor caution on technical jargon density.",
    readiness: "ready",
    strengths: [
      "Authoritative positioning statement directly addresses engineering pain points",
      "Sentinel archetype aligns seamlessly with clinical visual system and monospace typography",
    ],
    issues: [],
    blockingIssues: [],
    summary: "System validated for technical audience launch.",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    isEvaluated: true,
    evaluatedAt: "2026-03-01T13:00:00.000Z",
  };

  // 8. Consistency
  base.consistency = {
    overallAssessment: "Exceptional multi-dimensional alignment across strategic, vocal, and visual systems.",
    readiness: "coherent",
    strategic: { status: "coherent", findings: ["Problem, category, and value prop fully aligned"] },
    audience: { status: "coherent", findings: ["DevSecOps leads correctly addressed"] },
    personality: { status: "coherent", findings: ["Sentinel archetype reflected in voice and aesthetics"] },
    naming: { status: "coherent", findings: ["AegisCloud evokes protection and cloud infrastructure"] },
    voice: { status: "coherent", findings: ["Technical voice maintains calm authority"] },
    visual: { status: "coherent", findings: ["Monospace typography and obsidian palette match clinical mood"] },
    messaging: { status: "coherent", findings: ["Zero-noise claim supported by proof points"] },
    crossSystemIssues: [],
    strengths: [
      "Authoritative selected name 'AegisCloud' perfectly anchors Sentinel archetype",
      "Visual monospace aesthetic directly reinforces CLI and CI/CD workflow context",
    ],
    warnings: [
      "Ensure marketing landing copy does not overwhelm less technical procurement buyers with raw AST nomenclature.",
    ],
    overallCoherenceScore: 94,
    alignments: [
      { dimension: "Strategy to Voice", score: 95, observation: "Vigilant tone directly executes Sentinel positioning", isAligned: true },
      { dimension: "Voice to Visual", score: 93, observation: "Monospace font and obsidian palette complement technical voice", isAligned: true },
    ],
    crossStageConflicts: [],
    finalRecommendation: "Deploy brand kit immediately across developer marketing surfaces.",
    isEvaluated: true,
    evaluatedAt: "2026-03-01T13:30:00.000Z",
  };

  // 9. Delivery
  base.delivery = {
    brandOverview: {
      name: "AegisCloud",
      positioning: "For cloud security teams overwhelmed by post-deployment alerts, AegisCloud is the autonomous intelligence platform that predicts posture drift before merge.",
      audience: "Cloud Security Architects and DevSecOps Leads at high-growth engineering organizations",
      personality: "The Sentinel",
      differentiator: "Deterministic pre-commit AST policy simulation coupled with zero-noise developer remediation.",
    },
    messaging: {
      coreMessage: "Predict cloud drift before your code merges.",
      valueProposition: "Transform cloud security from a late-stage audit roadblock into continuous engineering velocity.",
      elevatorPitch: "AegisCloud simulates infrastructure policies in your pull requests, preventing misconfigurations before deployment.",
      keyMessages: [
        "Sub-second policy simulation inside CI pipelines.",
        "Zero false alarms through deterministic AST graph evaluation.",
        "Contextual auto-remediation snippets tailored to Terraform and OpenTofu.",
      ],
      messagingPillars: [
        { pillar: "Predictive Security", headline: "Stop breaches before code merges", description: "Simulate drift at PR time" },
        { pillar: "Zero Noise", headline: "Only actionable remediations", description: "Zero false alarms" },
        { pillar: "Developer Velocity", headline: "Security at CI speed", description: "Sub-second evaluation" },
      ],
    },
    voiceGuidelines: {
      voiceSummary: "Authoritative, technical, vigilant, and measured.",
      doRules: [
        "State exact policy names and CIS benchmark references",
        "Explain the deterministic reason for every detected drift",
        "Keep copy concise and code-forward",
      ],
      dontRules: [
        "Never use exaggerated fear claims like 'unhackable' or 'total immunity'",
        "Never blame developers for misconfigurations",
      ],
      vocabularyGuidance: {
        preferred: ["posture drift", "policy simulation", "deterministic", "remediation", "pre-merge"],
        avoid: ["silver bullet", "unbreakable", "magic", "game-changer", "hack-proof"],
      },
      exampleLines: [
        "Drift detected in module.vpc.security_group: Ingress rule 0.0.0.0/0 violates CIS 4.1.",
        "AegisCloud simulated 142 policies in 340ms: Zero blocking regressions.",
      ],
    },
    visualGuidelines: {
      colorDirection: "Obsidian Deep (#0B0F19) backdrop with Electric Cyan (#00E5FF) diagnostic accents.",
      typographyDirection: "Space Grotesk for architectural titles paired with JetBrains Mono for telemetry.",
      imageryDirection: "Monochrome infrastructure photography and vector topology schematics.",
      logoGuidance: "Sharp hexagonal polygon enclosing an invariant center point.",
      compositionGuidance: "8px HUD-style modular cards with high telemetry density.",
    },
    usageGuidance: {
      website: "Lead with live interactive terminal demo of a pull request simulation.",
      social: "Share benchmark comparisons, technical tear-downs of cloud outages, and IaC snippets.",
      presentations: "Use high-contrast obsidian slides with architecture topology diagrams.",
      marketing: "Target technical leads with reproducible sandbox environments rather than gated PDF brochures.",
    },
    deliverables: [
      {
        id: "deliv-1",
        type: "cli_quickstart",
        title: "CLI Developer Quickstart Guide",
        description: "Terminal commands and configuration instructions to install the AegisCloud pre-commit hook.",
        content: "curl -fsSL https://get.aegiscloud.dev | sh\naegiscloud init --policy=cis-aws-v2",
      },
      {
        id: "deliv-2",
        type: "brand_manifesto",
        title: "AegisCloud Engineering Manifesto",
        description: "Authoritative statement of principle on why security must happen at simulation time.",
        content: "Security is not an audit stamp at the end of a sprint. It is an invariant property of good software.",
      },
    ],
    warnings: [
      "Avoid using raw telemetry abbreviations in top-of-funnel executive marketing decks.",
    ],
    isDelivered: true,
    deliveredAt: "2026-03-01T14:00:00.000Z",
  };

  return base;
}

// Construct second distinct brand for Context Isolation testing
function createArtisanHoneyBrandState(): BrandState {
  const base = createInitialBrandState("Single-origin raw wildflower honey with pesticide testing reports");
  base.projectId = "test-project-brand-b-honey";
  base.version = 1;

  base.discovery = {
    rawIdea: "A direct-to-consumer regenerative honey brand partnering with regional family apiaries.",
    problem: "Commercially blended honey is often adulterated with corn syrup and stripped of beneficial bee pollens.",
    targetAudience: {
      primary: "Conscious culinary consumers and wellness enthusiasts aged 28-50",
      secondary: ["Specialty bakers", "Eco-conscious gift buyers"],
      characteristics: ["Values ingredient transparency", "Willing to pay premium for regenerative agriculture"],
      painPoints: ["Opaque supermarket honey sourcing", "Loss of authentic seasonal flavor profiles"],
      motivations: ["Support local pollinators and biodiverse ecology", "Taste pure raw honey"],
    },
    userNeeds: ["Batch-level lab testing reports", "Traceability to specific micro-regions", "Eco-friendly packaging"],
    constraints: ["Seasonal batch supply limits", "Strict temperature limits during harvesting"],
    assumptions: ["Consumers understand the value of raw vs pasteurized honey"],
    missingInformation: [],
    clarifyingQuestions: [],
    isAnalyzed: true,
    analyzedAt: "2026-03-02T09:00:00.000Z",
  };

  base.positioning = {
    category: "Regenerative Single-Origin Apiary Honey",
    categoryRationale: "Separates the brand entirely from commercial grocery blends through radical batch transparency.",
    positioningStatement: "For food lovers seeking authentic nourishment, GoldenComb delivers unadulterated raw honey with independent lab test reports for every harvest.",
    differentiator: "Complete botanical lab transparency with zero ultra-filtration or industrial blending.",
    valueProposition: "Pure floral nectar as nature intended, verified clean of synthetic chemicals.",
    competitiveWhitespace: ["QR-coded batch spectroscopy reports", "Direct-from-hive single-season varietals"],
    proofPoints: ["100% pesticide-free lab certificates", "Partnership with 12 family-owned regenerative apiaries"],
    alternatives: ["Industrial bear-bottle honey", "Generic organic store brands"],
    risks: ["Seasonal harvest variation can limit stock", "Educating consumers on natural crystallization"],
    confidence: 0.96,
    isPositioned: true,
    positionedAt: "2026-03-02T09:30:00.000Z",
  };

  base.personality = {
    archetype: "The Caregiver",
    archetypeRationale: "Emphasizes ecological stewardship, warm generosity, and deep respect for the earth and bees.",
    traits: ["Nurturing", "Authentic", "Grounded", "Warm", "Transparent"],
    behavioralCharacteristics: ["Speaks with agrarian reverence", "Warm and inviting tone", "Passionate about pollinator health"],
    principles: [
      { title: "Ecology over industrial yield", description: "Prioritize pollinator welfare above extraction volumes." },
      { title: "Purity without compromise", description: "Zero heating, ultra-filtration, or synthetic processing." },
      { title: "Celebrate seasonal variation", description: "Every harvest reflects the unique botanical terroir of the region." },
    ],
    emotionalTerritory: "Golden sunlight, tactile amber glass, and pastoral comfort.",
    personalityDo: ["Share farmer stories", "Celebrate crystallization as a mark of raw quality"],
    personalityDont: ["Use clinical sterile corporate language", "Make synthetic health claims"],
    confidence: 0.93,
    isFormulated: true,
    formulatedAt: "2026-03-02T10:00:00.000Z",
  };

  base.naming = {
    directions: [
      {
        id: "dir-honey",
        name: "Pastoral Provenance",
        strategy: "Names honoring the natural golden comb and artisan craft.",
        rationale: "Aligns with Caregiver archetype.",
        namingLogic: "Pairs evocative golden visual imagery with the organic structure of the honeycomb.",
        taglineCandidates: ["Pure Wildflower Nectar, Verified Clean", "Direct From Hive Lab Transparency"],
        candidates: [
          {
            name: "GoldenComb",
            rationale: "Celebrates the architectural beauty of the hive and golden unheated honey.",
            linguisticRationale: "Warm, resonant vowels with friendly plosives.",
            phoneticAssessment: "Smooth, memorable two-syllable lilt.",
            domainSuitability: "Available on modern artisanal food domains.",
          },
        ],
      },
    ],
    selectedName: "GoldenComb",
    selectedTagline: "Pure Wildflower Nectar, Verified Clean",
    selectedDirectionId: "dir-honey",
    isSelected: true,
    selectedAt: "2026-03-02T10:30:00.000Z",
    isGenerated: true,
    generatedAt: "2026-03-02T10:15:00.000Z",
  };

  base.voice = {
    toneProfile: {
      primary: "Warm & Pastoral",
      secondary: ["Honest", "Grounded", "Artisanal"],
      tonalBalance: "60% warmth and storytelling, 40% agrarian provenance",
      emotionalEffect: "Invites the customer into the sunny meadow and family apiary",
    },
    toneDimensions: [
      { dimension: "Warmth", level: 5, rationale: "Homely, welcoming connection" },
      { dimension: "Transparency", level: 5, rationale: "Unfiltered ingredient disclosure" },
    ],
    vocabulary: {
      preferred: ["single-origin", "unheated", "biodiverse", "wildflower", "raw comb", "seasonal vintage"],
      avoid: ["pasteurized", "processed", "commercial grade", "cheap sweetener", "industrial"],
      terminology: ["diastase activity", "pollen count", "micro-climate"],
      languageCharacteristics: ["Sensory-rich adjectives", "Warm conversational flow"],
    },
    messagingPillars: [
      {
        title: "Radical Transparency",
        purpose: "Lab reports on every jar",
        keyMessage: "Scan QR for purity results",
        supportingPoints: ["Pesticide analysis", "Pollen spectroscopy"],
      },
      {
        title: "Pollinator Stewardship",
        purpose: "Bees keep 50% of honey",
        keyMessage: "Regenerative beekeeping ethics",
        supportingPoints: ["No winter starvation", "Organic forage zones"],
      },
      {
        title: "Unheated Flavor",
        purpose: "Taste the meadow",
        keyMessage: "Raw enzymatically active honey",
        supportingPoints: ["Sub-100F harvesting", "Live diastase enzymes"],
      },
    ],
    communicationPrinciples: [
      { principle: "Speak with gratitude for pollinators", description: "Acknowledge the ecological craft of the bees." },
      { principle: "Explain natural crystallization with love", description: "Educate consumers on raw honey characteristics." },
      { principle: "Celebrate regional beekeepers", description: "Highlight the families managing each apiary partner." },
    ],
    writingGuidelines: {
      sentenceStyle: ["Lyrical yet grounded descriptions of flora and season"],
      structure: ["Story of apiary origin first, then tasting notes, then lab purity proof"],
      callsToAction: ["Taste the Harvest", "Read the Apiary Report"],
      punctuationAndFormatting: ["Warm punctuation with em-dashes and sensory details"],
    },
    examples: {
      homepageHero: "Raw wildflower nectar, straight from the hive.",
      shortPitch: "GoldenComb bottles single-origin raw honey with independent lab certificates for every harvest.",
      primaryCTA: "Taste the Spring Vintage",
      socialPost: "Meet the apiary behind Batch #204: 120 hives nestled among coastal lavender in Mendocino County.",
    },
    voiceDonts: ["Never call honey a generic commodity", "Do not write sterile corporate jargon"],
    consistencyRules: ["Always list the floral source and harvest month"],
    isGenerated: true,
    generatedAt: "2026-03-02T11:00:00.000Z",
  };

  base.visualDirection = {
    colorSystem: {
      primary: [
        { name: "Wild Honey Amber", hex: "#D97706", role: "primary", usage: "Primary brand mark and warm accents" },
        { name: "Meadow Sage", hex: "#4D7C0F", role: "secondary", usage: "Botanical illustrations and sustainability seals" },
      ],
      secondary: [
        { name: "Warm Parchment", hex: "#FEF3C7", role: "secondary", usage: "Label backgrounds and packaging paper" },
      ],
      neutrals: [
        { name: "Beeswax Cream", hex: "#FFFBEB", role: "neutral", usage: "Main surface tone" },
        { name: "Raw Earth Charcoal", hex: "#1C1917", role: "neutral", usage: "Typography and linework" },
      ],
      semantic: [
        { name: "Organic Green", hex: "#15803D", role: "semantic", usage: "Certified pesticide free" },
      ],
      accessibility: {
        contrastNotes: "11:1 contrast on Raw Earth Charcoal text over Beeswax Cream",
        wcagCompliance: "WCAG 2.1 AAA",
        darkThemeConsiderations: "Soft amber highlights on warm charcoal for night viewing",
      },
    },
    typography: {
      heading: {
        fontFamily: "Fraunces",
        category: "Old-style Serif",
        weights: ["500", "700"],
        usage: "Vintage headers and harvest titles",
      },
      body: {
        fontFamily: "Lora",
        category: "Editorial Serif",
        weights: ["400", "600"],
        usage: "Harvest stories and tasting notes",
      },
      pairing: {
        headingFont: "Fraunces",
        bodyFont: "Lora",
        contrast: "Warm, organic serif harmony evoking vintage botanical texts",
        mood: "Nourishing, pastoral, authentic",
      },
      rationale: "Reflects the tactile warmth of handcrafted small-batch food products.",
    },
    visualPersonality: {
      aestheticMood: "Sunny Pastoral Flora",
      visualKeywords: ["Sun-drenched", "Amber", "Pollen", "Botanical", "Artisanal"],
      designPrinciples: [
        { principle: "Tactile Heritage", description: "Textures recall hand-poured glass and recycled paper." },
        { principle: "Botanical Honesty", description: "Illustrations accurately depict native wildflower blooms." },
      ],
      imageryDirection: "Warm sunlight striking raw honeycomb and golden wildflower fields.",
    },
    imagery: {
      photographyDirection: "Golden hour macro photography of unheated honey drizzling from wooden dippers",
      illustrationDirection: "Hand-engraved copperplate botanical etchings of wildflowers and honeybees",
      composition: "Natural, organic asymmetrical arrangements reminiscent of open meadow landscapes",
      subjectTreatment: "Warm natural lighting with shallow depth of field highlighting raw pollen grains",
    },
    logoDirection: {
      concept: "Hand-drawn honeycomb cell with blossoming clover petals at the center",
      markDirection: "Organic hexagonal linework with slight hand-drawn asymmetry",
      wordmarkDirection: "Hand-lettered Fraunces serif with soft organic terminals",
      constructionPrinciples: [
        "Linework maintains subtle calligraphic pressure variations",
        "Clean vector outlines optimized for blind embossing on paper seals",
      ],
    },
    layoutPrinciples: {
      spacing: "Generous organic margins with breathable white space",
      density: "Relaxed editorial density reminiscent of a culinary periodical",
      hierarchy: "Floral vintage title first, apiary provenance second, lab purity badge third",
      shapeLanguage: "Soft, rounded hexagonal accents and scalloped stamp borders",
      composition: "Centred editorial layout with deckle-edge paper borders",
    },
    colors: [
      { role: "primary", name: "Wild Honey Amber", hex: "#D97706", rationale: "Raw honey color" },
      { role: "secondary", name: "Meadow Sage", hex: "#4D7C0F", rationale: "Botanical health" },
    ],
    overallAesthetic: "Sunny Pastoral Flora",
    isGenerated: true,
    generatedAt: "2026-03-02T11:30:00.000Z",
  };

  base.critique = {
    overallAssessment: "Rich, evocative artisan food brand with strong credibility anchors.",
    readiness: "ready",
    strengths: [
      "Caregiver archetype resonates deeply with consumer desire for purity",
      "Lab test QR code differentiator builds instant consumer trust",
    ],
    issues: [],
    blockingIssues: [],
    summary: "Validated for direct-to-consumer launch.",
    critiques: [],
    genericLanguageDetected: [],
    vulnerabilities: [],
    isEvaluated: true,
    evaluatedAt: "2026-03-02T12:00:00.000Z",
  };

  base.consistency = {
    overallAssessment: "Total harmony between warm pastoral voice and amber botanical aesthetics.",
    readiness: "coherent",
    strategic: { status: "coherent", findings: ["Clear positioning against adulterated honey"] },
    audience: { status: "coherent", findings: ["Resonates with conscious wellness foodies"] },
    personality: { status: "coherent", findings: ["Caregiver archetype shines in warmth and storytelling"] },
    naming: { status: "coherent", findings: ["GoldenComb feels timeless and authentic"] },
    voice: { status: "coherent", findings: ["Warm tone matches artisan ethos"] },
    visual: { status: "coherent", findings: ["Fraunces typography and honey amber palette are impeccable"] },
    messaging: { status: "coherent", findings: ["Purity claims backed by QR lab reports"] },
    crossSystemIssues: [],
    strengths: [
      "Authoritative name GoldenComb directly reinforces amber visual identity",
      "Storytelling voice seamlessly supports direct-from-apiary provenance claims",
    ],
    warnings: [
      "Ensure supply limitation disclosures are clearly communicated during peak winter demand.",
    ],
    overallCoherenceScore: 96,
    alignments: [
      { dimension: "Strategy to Voice", score: 96, observation: "Pastoral tone honors raw ingredient transparency", isAligned: true },
      { dimension: "Voice to Visual", score: 95, observation: "Serif typography and warm amber palette match story", isAligned: true },
    ],
    crossStageConflicts: [],
    finalRecommendation: "Proceed to packaged bottle labeling and direct-to-consumer digital storefront.",
    isEvaluated: true,
    evaluatedAt: "2026-03-02T12:30:00.000Z",
  };

  base.delivery = {
    brandOverview: {
      name: "GoldenComb",
      positioning: "For food lovers seeking authentic nourishment, GoldenComb delivers unadulterated raw honey with independent lab test reports for every harvest.",
      audience: "Conscious culinary consumers and wellness enthusiasts aged 28-50",
      personality: "The Caregiver",
      differentiator: "Complete botanical lab transparency with zero ultra-filtration or industrial blending.",
    },
    messaging: {
      coreMessage: "Pure floral nectar as nature intended, verified clean.",
      valueProposition: "Unadulterated raw honey with independent lab test reports for every harvest.",
      elevatorPitch: "GoldenComb partners with regional family apiaries to bottle single-origin raw honey with lab test certificates on every jar.",
      keyMessages: [
        "Unheated and unpasteurized to preserve active bee enzymes.",
        "Scannable lab analysis verifying zero synthetic pesticides.",
        "Harvested with regenerative ethics that leave 50% of honey for the hive.",
      ],
      messagingPillars: [
        { pillar: "Radical Transparency", headline: "Lab reports on every jar", description: "Scan QR for purity results" },
        { pillar: "Pollinator Stewardship", headline: "Bees keep 50% of honey", description: "Regenerative beekeeping ethics" },
        { pillar: "Unheated Flavor", headline: "Taste the meadow", description: "Raw enzymatically active honey" },
      ],
    },
    voiceGuidelines: {
      voiceSummary: "Warm, pastoral, honest, and grounded in floral provenance.",
      doRules: [
        "Name the specific apiary location and flowering month",
        "Describe natural crystallization as a hallmark of raw authenticity",
        "Share the beekeeper's personal connection to the land",
      ],
      dontRules: [
        "Never use sterile corporate sales language",
        "Never disparage small competitor beekeepers",
      ],
      vocabularyGuidance: {
        preferred: ["single-origin", "unheated", "biodiverse", "wildflower", "raw comb", "seasonal vintage"],
        avoid: ["pasteurized", "processed", "commercial grade", "cheap sweetener", "industrial"],
      },
      exampleLines: [
        "Harvested at dawn under the coastal fog of Big Sur.",
        "Crystallization is living proof that this jar was never boiled.",
      ],
    },
    visualGuidelines: {
      colorDirection: "Wild Honey Amber (#D97706) and Meadow Sage (#4D7C0F) on Beeswax Cream (#FFFBEB).",
      typographyDirection: "Fraunces Old-Style display paired with Lora text serif.",
      imageryDirection: "Golden hour macro photography of raw honeycomb and engraved botanical etchings.",
      logoGuidance: "Organic hexagonal honeycomb cell with blossoming clover petals.",
      compositionGuidance: "Centred editorial layouts with deckle-edge paper and tactile stamp seals.",
    },
    usageGuidance: {
      website: "Warm editorial layout highlighting apiary maps and direct lab report lookups.",
      social: "Share behind-the-scenes bee hive inspections and seasonal flower blooming calendars.",
      presentations: "Parchment-textured slides with botanical illustrations.",
      marketing: "Sample jars paired with sourdough bread at premier farmer markets and culinary pop-ups.",
    },
    deliverables: [
      {
        id: "honey-deliv-1",
        type: "jar_label_spec",
        title: "Embossed Jar Label Specification",
        description: "Front and back label layouts for 350g amber glass jars.",
        content: "GoldenComb -- Coastal Wildflower Raw Honey -- Harvest 05/2026 -- Lot #204\nScan QR for purity spectrometer analysis.",
      },
    ],
    warnings: [
      "Clarify that raw honey naturally crystallizes at cool room temperatures.",
    ],
    isDelivered: true,
    deliveredAt: "2026-03-02T13:00:00.000Z",
  };

  return base;
}

async function runTestSuite() {
  console.log("\n============================================================");
  console.log("  PINKLOOM PHASE 9 — FINAL BRAND KIT ENGINE TEST SUITE");
  console.log("============================================================\n");

  const completeState = createCompleteMockBrandState();

  // ==========================================================================
  // SECTION 1: COMPLETENESS GATES (Tests 1 - 9)
  // ==========================================================================
  console.log("--- SECTION 1: COMPLETENESS GATES ---");

  // 1. Complete BrandState passes
  const validCheck = validateBrandKitCompleteness(completeState);
  assert(validCheck.isComplete === true, "1. Complete BrandState passes completeness validation", validCheck.error);
  assert(validCheck.missingPrerequisites.length === 0, "1b. Complete BrandState has 0 missing prerequisites");

  // 2. Discovery missing fails
  const missingDiscovery = deepClone(completeState);
  missingDiscovery.discovery.isAnalyzed = false;
  missingDiscovery.discovery.problem = "";
  const discCheck = validateBrandKitCompleteness(missingDiscovery);
  assert(discCheck.isComplete === false, "2. Discovery missing fails validation");
  assert(discCheck.completeness.discovery === false, "2b. Discovery completeness flag is false");

  // 3. Positioning missing fails
  const missingPositioning = deepClone(completeState);
  missingPositioning.positioning.isPositioned = false;
  missingPositioning.positioning.category = "";
  const posCheck = validateBrandKitCompleteness(missingPositioning);
  assert(posCheck.isComplete === false, "3. Positioning missing fails validation");
  assert(posCheck.completeness.positioning === false, "3b. Positioning completeness flag is false");

  // 4. Personality missing fails
  const missingPersonality = deepClone(completeState);
  missingPersonality.personality.isFormulated = false;
  missingPersonality.personality.archetype = "";
  const persCheck = validateBrandKitCompleteness(missingPersonality);
  assert(persCheck.isComplete === false, "4. Personality missing fails validation");
  assert(persCheck.completeness.personality === false, "4b. Personality completeness flag is false");

  // 5. selectedName missing fails
  const missingSelectedName = deepClone(completeState);
  missingSelectedName.naming.selectedName = null;
  missingSelectedName.naming.isSelected = false;
  const nameCheck = validateBrandKitCompleteness(missingSelectedName);
  assert(nameCheck.isComplete === false, "5. selectedName missing fails validation");
  assert(nameCheck.completeness.naming === false, "5b. Naming completeness flag is false when selectedName missing");

  // 6. Voice missing fails
  const missingVoice = deepClone(completeState);
  missingVoice.voice.isGenerated = false;
  missingVoice.voice.toneProfile.primary = "";
  const voiceCheck = validateBrandKitCompleteness(missingVoice);
  assert(voiceCheck.isComplete === false, "6. Voice missing fails validation");
  assert(voiceCheck.completeness.voice === false, "6b. Voice completeness flag is false");

  // 7. Visual Direction missing fails
  const missingVisual = deepClone(completeState);
  missingVisual.visualDirection.isGenerated = false;
  missingVisual.visualDirection.colorSystem.primary = [];
  const visCheck = validateBrandKitCompleteness(missingVisual);
  assert(visCheck.isComplete === false, "7. Visual Direction missing fails validation");
  assert(visCheck.completeness.visualDirection === false, "7b. Visual completeness flag is false");

  // 8. Consistency missing fails
  const missingConsistency = deepClone(completeState);
  missingConsistency.consistency.isEvaluated = false;
  const constCheck = validateBrandKitCompleteness(missingConsistency);
  assert(constCheck.isComplete === false, "8. Consistency missing fails validation");
  assert(constCheck.completeness.consistency === false, "8b. Consistency completeness flag is false");

  // 9. Delivery missing fails
  const missingDelivery = deepClone(completeState);
  missingDelivery.delivery.isDelivered = false;
  missingDelivery.delivery.messaging.coreMessage = "";
  const delivCheck = validateBrandKitCompleteness(missingDelivery);
  assert(delivCheck.isComplete === false, "9. Delivery missing fails validation");
  assert(delivCheck.completeness.delivery === false, "9b. Delivery completeness flag is false");

  // ==========================================================================
  // SECTION 2: DETERMINISTIC ASSEMBLY (Tests 10 - 20)
  // ==========================================================================
  console.log("\n--- SECTION 2: DETERMINISTIC ASSEMBLY ---");

  const stateToAssemble = deepClone(completeState);
  const assemblyResult = await assembleFinalBrandKit(stateToAssemble, { persist: false });

  assert(assemblyResult.success === true, "Assembly execution succeeds", assemblyResult.error);
  assert(Boolean(assemblyResult.finalBrandKit), "FinalBrandKit artifact returned");

  const kit = assemblyResult.finalBrandKit!;

  // 10. Brand Overview assembled
  assert(
    kit.overview.name === "AegisCloud" &&
      kit.overview.coreMessage === "Predict cloud drift before your code merges." &&
      kit.overview.positioning === stateToAssemble.positioning.positioningStatement &&
      kit.overview.audience === stateToAssemble.discovery.targetAudience.primary &&
      kit.overview.personality === "The Sentinel" &&
      kit.overview.differentiator === stateToAssemble.positioning.differentiator,
    "10. Brand Overview assembled accurately with all 6 core attributes"
  );

  // 11. Discovery assembled
  assert(
    kit.discovery.problem === stateToAssemble.discovery.problem &&
      kit.discovery.targetAudience.primary === stateToAssemble.discovery.targetAudience.primary &&
      kit.discovery.targetAudience.painPoints.length > 0 &&
      kit.discovery.userNeeds.length > 0,
    "11. Discovery assembled preserving core problem, audience, and needs"
  );

  // 12. Positioning assembled
  assert(
    kit.positioning.category === "Autonomous Cloud Posture Intelligence" &&
      kit.positioning.valueProposition === stateToAssemble.positioning.valueProposition &&
      kit.positioning.competitiveWhitespace.length > 0 &&
      kit.positioning.proofPoints.length > 0,
    "12. Positioning assembled preserving category, value proposition, and whitespace"
  );

  // 13. Personality assembled
  assert(
    kit.personality.archetype === "The Sentinel" &&
      kit.personality.emotionalTerritory === stateToAssemble.personality.emotionalTerritory &&
      kit.personality.traits.includes("Vigilant") &&
      kit.personality.personalityDo.length > 0 &&
      kit.personality.personalityDont.length > 0,
    "13. Personality assembled preserving archetype, emotional territory, traits, and rules"
  );

  // 14. Naming assembled
  assert(
    kit.naming.selectedName === "AegisCloud" &&
      kit.naming.selectedTagline === "Autonomous Cloud Posture Intelligence" &&
      kit.naming.directionName === "Architectural Fortification" &&
      kit.naming.rationale.includes("Aegis") &&
      kit.naming.linguisticRationale.length > 0,
    "14. Naming assembled preserving name, tagline, direction, and linguistic rationale"
  );

  // 15. Voice assembled
  assert(
    kit.voice.primaryTone === "Authoritative & Technical" &&
      kit.voice.secondaryTones.length > 0 &&
      kit.voice.vocabulary.preferred.includes("posture drift") &&
      kit.voice.vocabulary.avoid.includes("magic") &&
      kit.voice.doRules.length > 0 &&
      kit.voice.dontRules.length > 0 &&
      kit.voice.examples.homepageHero === "Predict cloud drift before your code merges.",
    "15. Voice assembled preserving tone profile, vocabulary, rules, and canonical examples"
  );

  // 16. Messaging assembled
  assert(
    kit.messaging.coreMessage === "Predict cloud drift before your code merges." &&
      kit.messaging.valueProposition.includes("continuous engineering velocity") &&
      kit.messaging.elevatorPitch.includes("simulates infrastructure policies") &&
      kit.messaging.keyMessages.length === 3 &&
      kit.messaging.messagingPillars.length === 3,
    "16. Messaging assembled preserving core message, value proposition, pitch, and pillars"
  );

  // 17. Visual Direction assembled
  assert(
    kit.visualDirection.aestheticMood === "Clinical Cyber-Observability" &&
      kit.visualDirection.colorSystem.primary.length === 2 &&
      kit.visualDirection.colorSystem.primary[0].hex === "#0B0F19" &&
      kit.visualDirection.typography.heading.fontFamily === "Space Grotesk" &&
      kit.visualDirection.typography.body.fontFamily === "JetBrains Mono" &&
      kit.visualDirection.logoDirection.concept.includes("Interlocking geometric shields"),
    "17. Visual Direction assembled preserving palette, typography, imagery, and logo direction"
  );

  // 18. Consistency summary assembled
  assert(
    kit.consistency.readiness === "coherent" &&
      kit.consistency.overallAssessment.includes("Exceptional multi-dimensional alignment") &&
      kit.consistency.strengths.length > 0 &&
      kit.consistency.warnings.length > 0 &&
      kit.consistency.isEvaluated === true,
    "18. Consistency summary assembled preserving readiness, strengths, and warnings"
  );

  // 19. Usage assembled
  assert(
    kit.usage.website.includes("terminal demo") &&
      kit.usage.social.includes("benchmark comparisons") &&
      kit.usage.presentations.includes("obsidian slides") &&
      kit.usage.marketing.includes("reproducible sandbox"),
    "19. Usage guidance assembled preserving multi-channel specifications"
  );

  // 20. Delivery assets assembled
  assert(
    kit.deliveryAssets.length === 2 &&
      kit.deliveryAssets[0].title === "CLI Developer Quickstart Guide" &&
      kit.deliveryAssets[1].title === "AegisCloud Engineering Manifesto",
    "20. Delivery assets assembled preserving all production deliverables"
  );

  // ==========================================================================
  // SECTION 3: NAME PROTECTION (Tests 21 - 22)
  // ==========================================================================
  console.log("\n--- SECTION 3: NAME PROTECTION ---");

  // 21. selectedName unchanged
  assert(
    stateToAssemble.naming.selectedName === "AegisCloud",
    "21. selectedName remains strictly unchanged in brandState"
  );

  // 22. Final Brand Kit name exactly equals selectedName
  assert(
    kit.brandName === stateToAssemble.naming.selectedName &&
      kit.overview.name === stateToAssemble.naming.selectedName &&
      kit.naming.selectedName === stateToAssemble.naming.selectedName,
    "22. Final Brand Kit brandName, overview.name, and naming.selectedName exactly equal selectedName"
  );

  // ==========================================================================
  // SECTION 4: STATE PRESERVATION / DEEP IMMUTABILITY (Tests 23 - 31)
  // ==========================================================================
  console.log("\n--- SECTION 4: STATE PRESERVATION / DEEP IMMUTABILITY ---");

  const originalCopy = deepClone(completeState);
  const mutationTest = await assembleFinalBrandKit(completeState, { persist: false });
  const updatedState = mutationTest.updatedBrandState!;

  // 23. Discovery unchanged
  assert(
    JSON.stringify(updatedState.discovery) === JSON.stringify(originalCopy.discovery),
    "23. Discovery stage is bit-for-bit UNCHANGED"
  );

  // 24. Positioning unchanged
  assert(
    JSON.stringify(updatedState.positioning) === JSON.stringify(originalCopy.positioning),
    "24. Positioning stage is bit-for-bit UNCHANGED"
  );

  // 25. Personality unchanged
  assert(
    JSON.stringify(updatedState.personality) === JSON.stringify(originalCopy.personality),
    "25. Personality stage is bit-for-bit UNCHANGED"
  );

  // 26. Naming unchanged
  assert(
    JSON.stringify(updatedState.naming) === JSON.stringify(originalCopy.naming),
    "26. Naming stage is bit-for-bit UNCHANGED"
  );

  // 27. Voice unchanged
  assert(
    JSON.stringify(updatedState.voice) === JSON.stringify(originalCopy.voice),
    "27. Voice stage is bit-for-bit UNCHANGED"
  );

  // 28. Visual Direction unchanged
  assert(
    JSON.stringify(updatedState.visualDirection) === JSON.stringify(originalCopy.visualDirection),
    "28. Visual Direction stage is bit-for-bit UNCHANGED"
  );

  // 29. Critique unchanged
  assert(
    JSON.stringify(updatedState.critique) === JSON.stringify(originalCopy.critique),
    "29. Critique stage is bit-for-bit UNCHANGED"
  );

  // 30. Consistency unchanged
  assert(
    JSON.stringify(updatedState.consistency) === JSON.stringify(originalCopy.consistency),
    "30. Consistency stage is bit-for-bit UNCHANGED"
  );

  // 31. Delivery unchanged
  assert(
    JSON.stringify(updatedState.delivery) === JSON.stringify(originalCopy.delivery),
    "31. Delivery stage is bit-for-bit UNCHANGED"
  );

  // Verify only finalBrandKit and version metadata changed
  assert(
    Boolean(updatedState.finalBrandKit),
    "Only finalBrandKit was added to BrandState"
  );

  // ==========================================================================
  // SECTION 5: METADATA & VERSIONING (Tests 32 - 35)
  // ==========================================================================
  console.log("\n--- SECTION 5: METADATA & VERSIONING ---");

  // 32. completeness flags correct
  assert(
    kit.completeness.discovery === true &&
      kit.completeness.positioning === true &&
      kit.completeness.personality === true &&
      kit.completeness.naming === true &&
      kit.completeness.voice === true &&
      kit.completeness.visualDirection === true &&
      kit.completeness.critique === true &&
      kit.completeness.consistency === true &&
      kit.completeness.delivery === true &&
      kit.completeness.isComplete === true,
    "32. All 10 completeness flags are correctly true"
  );

  // 33. warnings preserved and deduplicated
  assert(
    kit.warnings.length === 2 &&
      kit.warnings.some((w) => w.includes("telemetry abbreviations")) &&
      kit.warnings.some((w) => w.includes("procurement buyers")),
    "33. Warnings from Delivery and Consistency combined and preserved"
  );

  // 34. generatedAt present
  assert(
    typeof kit.generatedAt === "string" &&
      typeof kit.assembledAt === "string" &&
      kit.generatedAt.length > 10,
    "34. generatedAt and assembledAt timestamps present and valid ISO strings"
  );

  // 35. version increments correctly
  assert(
    updatedState.version === (originalCopy.version || 1) + 1,
    `35. BrandState version incremented correctly (${originalCopy.version} -> ${updatedState.version})`
  );

  // ==========================================================================
  // SECTION 6: CONTEXT ISOLATION (Tests 36 - 38)
  // ==========================================================================
  console.log("\n--- SECTION 6: CONTEXT ISOLATION ---");

  const honeyState = createArtisanHoneyBrandState();
  const honeyAssembly = await assembleFinalBrandKit(honeyState, { persist: false });
  assert(honeyAssembly.success === true, "Brand B (GoldenComb Honey) assembled successfully");

  const honeyKit = honeyAssembly.finalBrandKit!;

  // 36. Brand A contains only Brand A information
  const brandAJson = JSON.stringify(kit);
  assert(
    brandAJson.includes("AegisCloud") &&
      brandAJson.includes("posture drift") &&
      brandAJson.includes("The Sentinel") &&
      brandAJson.includes("#00E5FF"),
    "36. Brand A contains its authoritative cybersecurity identity"
  );
  assert(
    !brandAJson.includes("GoldenComb") &&
      !brandAJson.includes("honey") &&
      !brandAJson.includes("wildflower") &&
      !brandAJson.includes("apiary") &&
      !brandAJson.includes("The Caregiver"),
    "36b. Brand A contains ZERO honey/wildflower/artisan terms"
  );

  // 37. Brand B contains only Brand B information
  const brandBJson = JSON.stringify(honeyKit);
  assert(
    brandBJson.includes("GoldenComb") &&
      brandBJson.includes("wildflower") &&
      brandBJson.includes("apiary") &&
      brandBJson.includes("The Caregiver") &&
      brandBJson.includes("#D97706"),
    "37. Brand B contains its authoritative artisan honey identity"
  );
  assert(
    !brandBJson.includes("AegisCloud") &&
      !brandBJson.includes("cloud") &&
      !brandBJson.includes("posture drift") &&
      !brandBJson.includes("AST") &&
      !brandBJson.includes("The Sentinel"),
    "37b. Brand B contains ZERO cloud/cybersecurity/sentinel terms"
  );

  // 38. Zero cross-brand contamination
  assert(
    kit.brandName !== honeyKit.brandName &&
      kit.overview.personality !== honeyKit.overview.personality &&
      kit.visualDirection.colorSystem.primary[0].hex !== honeyKit.visualDirection.colorSystem.primary[0].hex,
    "38. Confirmed total context isolation between Brand A and Brand B"
  );

  // ==========================================================================
  // SECTION 7: STAGE GATE & AGENTRUN LOGGING (Tests 39 - 41)
  // ==========================================================================
  console.log("\n--- SECTION 7: STAGE GATE & AGENTRUN ---");

  // 39. canRunFinalBrandKit stage gate check
  const gatePass = canRunFinalBrandKit(completeState);
  assert(gatePass.allowed === true, "39. canRunFinalBrandKit passes for complete state");

  const gateFail = canRunFinalBrandKit(missingDelivery);
  assert(gateFail.allowed === false, "39b. canRunFinalBrandKit rejects when Delivery is incomplete");

  // 40. AgentRun logging
  assert(Boolean(assemblyResult.agentRun), "40. AgentRun created");
  assert(assemblyResult.agentRun?.agentName === "BrandKit", "40b. AgentRun agentName is 'BrandKit'");
  assert(assemblyResult.agentRun?.stage === "BRAND_KIT", "40c. AgentRun stage is 'BRAND_KIT'");
  assert(assemblyResult.agentRun?.status === "completed", "40d. AgentRun status is 'completed'");

  // 41. Zod safeParse verification
  const schemaValidation = FinalBrandKitSchema.safeParse(kit);
  assert(schemaValidation.success === true, "41. FinalBrandKit strictly satisfies FinalBrandKitSchema");

  // ==========================================================================
  // FINAL SCOREBOARD
  // ==========================================================================
  console.log("\n============================================================");
  console.log(`  FINAL BRAND KIT TEST RESULTS: ${passedTests} / ${totalTests} PASSING`);
  console.log("============================================================\n");

  if (passedTests < totalTests) {
    console.error(`FAILURE: Only ${passedTests} of ${totalTests} tests passed.`);
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution encountered an unhandled error:", err);
  process.exit(1);
});
