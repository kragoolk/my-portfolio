import { listDir, normalize, resolve } from "./fs";

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  amber: "\x1b[38;2;232;176;75m",
  green: "\x1b[38;2;87;217;138m",
  blue: "\x1b[38;2;122;162;247m",
  dim: "\x1b[38;2;125;132;138m",
  text: "\x1b[38;2;230;233;234m",
};

export const PROMPT = (cwd) =>
  `${C.green}oliver${C.dim}@${C.green}krauss${C.reset}${C.dim}:${C.blue}${cwd || "/"}${C.reset}${C.dim}$ ${C.reset}`;

const LOGO = [
  "   ▄▄▄▄▄▄▄   ",
  "  █       █  ",
  "  █  ▄▄▄  █  ",
  "  █ █   █ █  ",
  "  █ █▄▄▄█ █  ",
  "  █       █  ",
  "   ▀▀▀▀▀▀▀   ",
];

function neofetch() {
  const info = [
    [`${C.amber}oliver${C.reset}${C.dim}@${C.reset}${C.amber}krauss${C.reset}`, ""],
    [`${C.dim}${"-".repeat(20)}${C.reset}`, ""],
    ["OS", "oliverkrauss.space"],
    ["Role", "Cybersecurity Analyst"],
    ["Focus", "Network forensics / IR"],
    ["Shell", "Defender, Splunk, ExtraHop"],
    ["WM", "dwindle (this one)"],
    ["Education", "BBA Cyber Security, UTSA"],
    ["Location", "San Antonio, Texas"],
    ["Status", `${C.green}open to work${C.reset}`],
  ];
  const lines = [];
  const rows = Math.max(LOGO.length, info.length);
  for (let i = 0; i < rows; i++) {
    const art = `${C.amber}${(LOGO[i] ?? "").padEnd(14)}${C.reset}`;
    const row = info[i];
    if (!row) {
      lines.push(art);
      continue;
    }
    const [k, v] = row;
    lines.push(v === "" ? art + k : `${art}${C.amber}${k}${C.reset}${C.dim}: ${C.reset}${v}`);
  }
  return lines;
}

function renderTree(path, prefix = "") {
  const entries = listDir(path);
  if (!entries) return [];
  const out = [];
  entries.forEach((e, i) => {
    const last = i === entries.length - 1;
    const branch = last ? "└── " : "├── ";
    const isDir = e.node.type === "dir";
    const color = isDir ? C.blue : e.node.type === "link" ? C.green : C.text;
    out.push(`${C.dim}${prefix}${branch}${C.reset}${color}${e.name}${isDir ? "/" : ""}${C.reset}`);
    if (isDir) out.push(...renderTree(`${path}/${e.name}`, prefix + (last ? "    " : "│   ")));
  });
  return out;
}

const HELP = [
  `${C.bold}${C.amber}Commands${C.reset}`,
  `  ${C.amber}ls${C.reset} [path]        list a directory`,
  `  ${C.amber}cd${C.reset} <path>        change directory  (cd .. to go up)`,
  `  ${C.amber}cat${C.reset} <file>       print a file`,
  `  ${C.amber}tree${C.reset}             show everything at once`,
  `  ${C.amber}open${C.reset} <target>    resume | gallery | writeups | about | experience`,
  `  ${C.amber}neofetch${C.reset}         the usual`,
  `  ${C.amber}whoami${C.reset}           short version`,
  `  ${C.amber}pwd${C.reset}              print working directory`,
  `  ${C.amber}clear${C.reset}            clear the screen`,
  `  ${C.amber}exit${C.reset}             close this window`,
  "",
  `${C.bold}${C.amber}Window manager${C.reset}`,
  `  ${C.amber}Alt+Enter${C.reset}        new terminal      ${C.amber}Alt+Q${C.reset}     close window`,
  `  ${C.amber}Alt+1..5${C.reset}         switch workspace  ${C.amber}Alt+H/L${C.reset}   focus prev/next`,
  `  ${C.amber}Alt+V${C.reset}            toggle floating   ${C.amber}Alt+F${C.reset}     maximize`,
  `  ${C.amber}Alt+Shift+1..5${C.reset}   move window to workspace`,
  `  ${C.amber}Alt+/${C.reset}            keybind overlay`,
  "",
  `${C.dim}Tab completes paths and commands. Up/Down walks history.${C.reset}`,
];

export const COMMAND_NAMES = [
  "help", "ls", "cd", "cat", "tree", "open", "neofetch",
  "whoami", "pwd", "clear", "echo", "exit",
];

const OPEN_TARGETS = {
  resume: { kind: "link", href: "/media/resume/OliverKraussResume.pdf" },
  gallery: { kind: "route", to: "/gallery" },
  writeups: { kind: "route", to: "/writeups" },
  site: { kind: "route", to: "/" },
  about: { kind: "app", app: "about" },
  experience: { kind: "app", app: "experience" },
  terminal: { kind: "app", app: "terminal" },
};

// Returns { lines, cwd, action } — action is handled by the Terminal component.
export function run(input, cwd) {
  const [cmd, ...args] = input.trim().split(/\s+/).filter(Boolean);
  const err = (m) => ({ lines: [`${C.amber}${m}${C.reset}`], cwd });

  switch (cmd) {
    case undefined:
      return { lines: [], cwd };

    case "help":
      return { lines: HELP, cwd };

    case "pwd":
      return { lines: [cwd || "/"], cwd };

    case "whoami":
      return {
        lines: [
          `${C.text}Oliver Krauss${C.reset} ${C.dim}-${C.reset} cybersecurity analyst, San Antonio TX.`,
          `${C.dim}Network forensics and incident response. Try ${C.reset}${C.amber}neofetch${C.reset}${C.dim} or ${C.reset}${C.amber}ls${C.reset}${C.dim}.${C.reset}`,
        ],
        cwd,
      };

    case "neofetch":
      return { lines: neofetch(), cwd };

    case "clear":
      return { lines: [], cwd, action: { type: "clear" } };

    case "exit":
      return { lines: [], cwd, action: { type: "close" } };

    case "echo":
      return { lines: [args.join(" ")], cwd };

    case "tree":
      return { lines: [`${C.blue}${cwd || "/"}${C.reset}`, ...renderTree(cwd)], cwd };

    case "ls": {
      const path = normalize(cwd, args[0]);
      const entries = listDir(path);
      if (!entries) {
        const node = resolve(path);
        if (node) return { lines: [args[0] ?? path], cwd };
        return err(`ls: ${args[0] ?? path}: no such file or directory`);
      }
      if (!entries.length) return { lines: [`${C.dim}(empty)${C.reset}`], cwd };
      return {
        lines: entries.map(({ name, node }) => {
          if (node.type === "dir") return `${C.blue}${name}/${C.reset}`;
          if (node.type === "link") return `${C.green}${name}${C.reset} ${C.dim}-> ${node.label}${C.reset}`;
          return `${C.text}${name}${C.reset}`;
        }),
        cwd,
      };
    }

    case "cd": {
      if (!args[0]) return { lines: [], cwd: "" };
      const path = normalize(cwd, args[0]);
      const node = resolve(path);
      if (!node) return err(`cd: ${args[0]}: no such file or directory`);
      if (node.type !== "dir") return err(`cd: ${args[0]}: not a directory`);
      return { lines: [], cwd: path === "/" ? "" : path };
    }

    case "cat": {
      if (!args[0]) return err("cat: missing operand");
      const path = normalize(cwd, args[0]);
      const node = resolve(path);
      if (!node) return err(`cat: ${args[0]}: no such file or directory`);
      if (node.type === "dir") return err(`cat: ${args[0]}: is a directory`);
      if (node.type === "link")
        return {
          lines: [`${C.dim}opening ${node.label}...${C.reset}`],
          cwd,
          action: { type: "link", href: node.href },
        };
      return {
        lines: node.content.split("\n").map((l) => {
          if (l.startsWith("# ")) return `${C.bold}${C.amber}${l.slice(2)}${C.reset}`;
          if (l.startsWith("## ")) return `${C.bold}${l.slice(3)}${C.reset}`;
          if (l.startsWith("- ")) return `${C.amber}  - ${C.reset}${C.text}${l.slice(2)}${C.reset}`;
          if (l === "---") return `${C.dim}${"-".repeat(48)}${C.reset}`;
          return `${C.text}${l}${C.reset}`;
        }),
        cwd,
      };
    }

    case "open": {
      const t = OPEN_TARGETS[args[0]];
      if (!t) return err(`open: unknown target '${args[0] ?? ""}'. try: ${Object.keys(OPEN_TARGETS).join(", ")}`);
      if (t.kind === "link")
        return { lines: [`${C.dim}opening resume...${C.reset}`], cwd, action: { type: "link", href: t.href } };
      if (t.kind === "route")
        return { lines: [`${C.dim}navigating to ${t.to}...${C.reset}`], cwd, action: { type: "route", to: t.to } };
      return { lines: [], cwd, action: { type: "app", app: t.app } };
    }

    default:
      return err(`${cmd}: command not found. try 'help'.`);
  }
}

// Tab completion: commands at position 0, paths after.
export function complete(input, cwd) {
  const parts = input.split(/\s+/);
  const word = parts[parts.length - 1] ?? "";
  if (parts.length === 1) {
    const hits = COMMAND_NAMES.filter((c) => c.startsWith(word));
    return hits.length === 1 ? hits[0] + " " : input;
  }
  if (parts[0] === "open") {
    const hits = Object.keys(OPEN_TARGETS).filter((t) => t.startsWith(word));
    return hits.length === 1 ? [...parts.slice(0, -1), hits[0]].join(" ") + " " : input;
  }
  const slash = word.lastIndexOf("/");
  const base = slash >= 0 ? word.slice(0, slash) : "";
  const frag = slash >= 0 ? word.slice(slash + 1) : word;
  const entries = listDir(normalize(cwd, base));
  if (!entries) return input;
  const hits = entries.filter((e) => e.name.startsWith(frag));
  if (hits.length !== 1) return input;
  const done = (base ? base + "/" : "") + hits[0].name + (hits[0].node.type === "dir" ? "/" : " ");
  return [...parts.slice(0, -1), done].join(" ");
}

export { C };
