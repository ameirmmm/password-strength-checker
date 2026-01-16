const pw = document.getElementById("pw");
const meter = document.getElementById("meter");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const hintEl = document.getElementById("hint");
const toggleBtn = document.getElementById("toggle");

const commonPasswords = new Set([
  "password", "123456", "123456789", "qwerty", "letmein",
  "admin", "welcome", "iloveyou", "monkey", "dragon"
]);

function hasUpper(s) { return /[A-Z]/.test(s); }
function hasLower(s) { return /[a-z]/.test(s); }
function hasNum(s) { return /[0-9]/.test(s); }
function hasSym(s) { return /[^A-Za-z0-9\s]/.test(s); }
function hasSpace(s) { return /\s/.test(s); }

function setRule(rule, ok) {
  const li = document.querySelector(`li[data-rule="${rule}"]`);
  if (!li) return;
  li.classList.toggle("ok", ok);
  li.textContent = li.textContent.replace(/^✅\s|^❌\s/, "");
  li.textContent = (ok ? "✅ " : "❌ ") + li.textContent;
}

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function scorePassword(p) {
  const pLower = p.toLowerCase();

  const rules = {
    len: p.length >= 12,
    upper: hasUpper(p),
    lower: hasLower(p),
    num: hasNum(p),
    sym: hasSym(p),
    space: !hasSpace(p),
    common: !commonPasswords.has(pLower)
  };

  // Base score from length (up to 40)
  let score = clamp(p.length * 3, 0, 40);

  // Variety bonuses
  score += rules.upper ? 12 : 0;
  score += rules.lower ? 10 : 0;
  score += rules.num ? 14 : 0;
  score += rules.sym ? 16 : 0;

  // Penalties
  if (!rules.space) score -= 10;
  if (!rules.common) score -= 35;
  if (p.length > 0 && (pLower.includes("password") || pLower.includes("1234"))) score -= 15;

  score = clamp(score, 0, 100);

  // Level text
  let level = "—";
  if (p.length === 0) level = "—";
  else if (score < 35) level = "Weak";
  else if (score < 60) level = "Okay";
  else if (score < 80) level = "Strong";
  else level = "Very strong";

  // Hint (one actionable thing)
  let hint = "";
  if (p.length === 0) hint = "Tip: Use a long passphrase—easy to remember, hard to guess.";
  else if (!rules.len) hint = "Make it longer (12+). Length is king.";
  else if (!rules.sym) hint = "Add a symbol like ! @ # $";
  else if (!rules.num) hint = "Add at least one number.";
  else if (!rules.upper) hint = "Add an uppercase letter.";
  else if (!rules.common) hint = "Avoid common passwords—use something unique.";
  else hint = "Nice. Consider using a password manager for unique passwords everywhere.";

  return { score, level, rules, hint };
}

function paintUI(p) {
  const { score, level, rules, hint } = scorePassword(p);

  // Update rules list
  Object.entries(rules).forEach(([k, ok]) => setRule(k, ok));

  // Update score
  scoreEl.textContent = score.toString();
  levelEl.textContent = level;
  hintEl.textContent = hint;

  // Update meter
  meter.style.width = `${score}%`;

  // Meter color by score
  let color = "#ff4d6d";         // weak
  if (score >= 35) color = "#ffd166"; // okay
  if (score >= 60) color = "#4cc9f0"; // strong
  if (score >= 80) color = "#2dd4bf"; // very strong
  meter.style.background = color;

  levelEl.style.borderColor = color;
}

pw.addEventListener("input", () => paintUI(pw.value));

toggleBtn.addEventListener("click", () => {
  const showing = pw.type === "text";
  pw.type = showing ? "password" : "text";
  toggleBtn.textContent = showing ? "Show" : "Hide";
});

paintUI("");
