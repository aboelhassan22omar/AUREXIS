import {
  AppWindow,
  BellRing,
  Bot,
  BrainCircuit,
  Cctv,
  CheckCheck,
  Cloud,
  Cog,
  Database,
  FileText,
  Globe,
  Lightbulb,
  Server,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";

/*
 * Living diagrams in one visual language: glass nodes, wires with data
 * packets travelling through them, and small mono captions. Every scene
 * shows what the service actually does — no decorative shapes.
 */

export type SceneKind =
  | "flow"
  | "neural"
  | "vision"
  | "dialogue"
  | "dashboard"
  | "hub"
  | "radar";

const PROJECT_SCENES: Record<string, SceneKind> = {
  "Artificial Intelligence": "dialogue",
  "Custom AI": "neural",
  "Web Development": "dashboard",
  Automation: "flow",
  Cybersecurity: "radar",
};

const SERVICE_SCENES: Record<string, SceneKind> = {
  "ai-solutions": "neural",
  "ai-chatbot-development": "dialogue",
  "web-application-development": "dashboard",
  "business-process-automation": "flow",
  "cybersecurity-solutions": "vision",
  "systems-integration": "hub",
};

export function sceneForService(slug: string): SceneKind {
  return SERVICE_SCENES[slug] ?? "neural";
}

type Step = { label: string; icon: LucideIcon };

const PIPELINES: Partial<Record<SceneKind, [Step, Step, Step]>> = {
  flow: [
    { label: "Trigger", icon: Zap },
    { label: "Process", icon: Cog },
    { label: "Done", icon: CheckCheck },
  ],
};

function Pipeline({ steps, kind }: { steps: [Step, Step, Step]; kind: SceneKind }) {
  return (
    <div className={`ax-art__pipeline ax-art__pipeline--${kind}`}>
      {steps.map(({ label, icon: Icon }, index) => (
        <div className="ax-art__step" key={label} style={{ ["--n" as string]: index }}>
          {index > 0 && (
            <span className="ax-art__wire">
              <i />
            </span>
          )}
          <span className={`ax-art__node${index === 1 ? " is-main" : ""}`}>
            <Icon size={index === 1 ? 26 : 20} strokeWidth={1.6} />
          </span>
          <span className="ax-art__label">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* AI: a small neural network — signals fire through the layers into an insight */
const LAYERS = [
  [22, 50, 78],
  [14, 38, 62, 86],
  [30, 70],
];
const LAYER_X = [16, 50, 84];

function Neural() {
  const links: { x1: number; y1: number; x2: number; y2: number; n: number }[] = [];

  LAYERS.slice(0, -1).forEach((layer, li) => {
    layer.forEach((y1, a) => {
      LAYERS[li + 1].forEach((y2, b) => {
        links.push({ x1: LAYER_X[li], y1, x2: LAYER_X[li + 1], y2, n: (a + b + li * 2) % 6 });
      });
    });
  });

  return (
    <>
    <div className="ax-art__neural">
      <svg className="ax-art__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {links.map((link, index) => (
          <g key={index} style={{ ["--n" as string]: link.n }}>
            <line {...link} className="ax-art__link" />
            <line {...link} className="ax-art__link-pulse ax-art__link-pulse--fast" />
          </g>
        ))}
      </svg>
      {LAYERS.map((layer, li) =>
        layer.map((y, index) => (
          <span
            key={`${li}-${index}`}
            className={`ax-art__neuron${li === 2 ? " is-out" : ""}`}
            style={{ left: `${LAYER_X[li]}%`, top: `${y}%`, ["--n" as string]: index + li * 2 }}
          >
            {li === 0 && index === 1 && <FileText size={13} strokeWidth={1.8} />}
            {li === 2 && index === 0 && <Lightbulb size={14} strokeWidth={1.8} />}
            {li === 2 && index === 1 && <BrainCircuit size={14} strokeWidth={1.8} />}
          </span>
        ))
      )}
    </div>
    <span className="ax-art__caption">Data · Reason · Insight</span>
    </>
  );
}

/* Security systems: a camera feed with AI tracking a person in real time */
function Vision() {
  return (
    <div className="ax-art__vision">
      <div className="ax-art__feed">
        <span className="ax-art__corner ax-art__corner--tl" />
        <span className="ax-art__corner ax-art__corner--tr" />
        <span className="ax-art__corner ax-art__corner--bl" />
        <span className="ax-art__corner ax-art__corner--br" />
        <span className="ax-art__rec">
          <i />
          CAM 04
        </span>
        <span className="ax-art__scan" />
        <div className="ax-art__subject">
          <span className="ax-art__figure">
            <i />
            <b />
          </span>
          <span className="ax-art__box">
            <em>
              <Cctv size={9} strokeWidth={2} />
              Person · 98%
            </em>
          </span>
        </div>
        <span className="ax-art__alert">
          <BellRing size={11} strokeWidth={2} />
          Zone B
        </span>
      </div>
      <span className="ax-art__caption">Detect · Track · Alert</span>
    </div>
  );
}

function Dialogue() {
  return (
    <div className="ax-art__chat">
      <div className="ax-art__msg ax-art__msg--user">
        <span />
        <span />
      </div>
      <div className="ax-art__msg ax-art__msg--typing">
        <span className="ax-art__avatar">
          <Bot size={15} strokeWidth={1.8} />
        </span>
        <span className="ax-art__dots">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="ax-art__msg ax-art__msg--bot">
        <span className="ax-art__avatar">
          <Bot size={15} strokeWidth={1.8} />
        </span>
        <span className="ax-art__lines">
          <span />
          <span />
          <span />
        </span>
      </div>
      <span className="ax-art__caption">Ask · Understand · Answer</span>
    </div>
  );
}

function Dashboard() {
  return (
    <div className="ax-art__dash">
      <div className="ax-art__window">
        <div className="ax-art__bar">
          <i />
          <i />
          <i />
        </div>
        <div className="ax-art__dash-body">
          <div className="ax-art__side">
            <span className="is-on" />
            <span />
            <span />
            <span />
          </div>
          <div className="ax-art__main">
            <div className="ax-art__kpis">
              <span><b /><i /></span>
              <span><b /><i /></span>
              <span><b /><i /></span>
            </div>
            <div className="ax-art__chart">
              {[0.45, 0.7, 0.55, 0.85, 0.65, 0.95, 0.75].map((h, index) => (
                <span key={index} style={{ ["--h" as string]: h, ["--n" as string]: index }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <span className="ax-art__caption">Live operations · One interface</span>
    </div>
  );
}

const HUB_NODES: { icon: LucideIcon; label: string; x: number; y: number }[] = [
  { icon: Globe, label: "API", x: 18, y: 26 },
  { icon: Cloud, label: "Cloud", x: 82, y: 26 },
  { icon: AppWindow, label: "Apps", x: 18, y: 74 },
  { icon: Server, label: "ERP", x: 82, y: 74 },
];

function Hub() {
  return (
    <div className="ax-art__hub">
      <svg className="ax-art__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {HUB_NODES.map((node, index) => (
          <g key={node.label} style={{ ["--n" as string]: index }}>
            <line x1={node.x} y1={node.y} x2="50" y2="50" className="ax-art__link" />
            <line x1={node.x} y1={node.y} x2="50" y2="50" className="ax-art__link-pulse" />
          </g>
        ))}
      </svg>
      {HUB_NODES.map(({ icon: Icon, label, x, y }, index) => (
        <span
          key={label}
          className="ax-art__sat"
          style={{ left: `${x}%`, top: `${y}%`, ["--n" as string]: index }}
        >
          <span className="ax-art__node">
            <Icon size={18} strokeWidth={1.6} />
          </span>
          <span className="ax-art__sat-label">{label}</span>
        </span>
      ))}
      <span className="ax-art__node is-main ax-art__hub-core">
        <Database size={26} strokeWidth={1.6} />
      </span>
    </div>
  );
}

function Radar() {
  return (
    <div className="ax-art__radar">
      <span className="ax-art__ring ax-art__ring--1" />
      <span className="ax-art__ring ax-art__ring--2" />
      <span className="ax-art__ring ax-art__ring--3" />
      <span className="ax-art__sweep" />
      <i className="ax-art__blip" style={{ ["--x" as string]: "34%", ["--y" as string]: "30%", ["--n" as string]: 0 }} />
      <i className="ax-art__blip" style={{ ["--x" as string]: "70%", ["--y" as string]: "42%", ["--n" as string]: 1 }} />
      <i className="ax-art__blip is-alert" style={{ ["--x" as string]: "58%", ["--y" as string]: "74%", ["--n" as string]: 2 }} />
      <span className="ax-art__node is-main ax-art__radar-core">
        <ShieldCheck size={24} strokeWidth={1.6} />
      </span>
      <span className="ax-art__caption">Monitor · Detect · Respond</span>
    </div>
  );
}

export function SceneArt({ kind, compact = false }: { kind: SceneKind; compact?: boolean }) {
  const steps = PIPELINES[kind];

  return (
    <div className={`ax-art ax-art--${kind}${compact ? " ax-art--compact" : ""}`} aria-hidden="true">
      <div className="ax-art__light" />
      {steps && <Pipeline steps={steps} kind={kind} />}
      {kind === "neural" && <Neural />}
      {kind === "vision" && <Vision />}
      {kind === "dialogue" && <Dialogue />}
      {kind === "dashboard" && <Dashboard />}
      {kind === "hub" && <Hub />}
      {kind === "radar" && <Radar />}
    </div>
  );
}

type ProjectArtProps = {
  category: string;
  /** kept for call-site compatibility; scenes carry their own symbols */
  Icon?: LucideIcon;
  variant?: number;
};

export default function ProjectArt({ category, variant = 0 }: ProjectArtProps) {
  const kind = PROJECT_SCENES[category] ?? (["dialogue", "dashboard", "flow", "radar"] as SceneKind[])[variant % 4];

  return <SceneArt kind={kind} />;
}
