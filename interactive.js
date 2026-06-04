// ========== Character Vocabulary (makemore: a-z + special '.') ==========
// Index 0 is the special start/end token '.'; a→1 ... z→26
const ALPHA = 'abcdefghijklmnopqrstuvwxyz';
const stoi = { '.': 0 };
const itos = { 0: '.' };
for (let i = 0; i < ALPHA.length; i++) {
    stoi[ALPHA[i]] = i + 1;
    itos[i + 1] = ALPHA[i];
}
const VOCAB = 27;

// ========== Vocabulary Encoder Demo (Part 1) ==========
function updateVocab() {
    const input = document.getElementById('vocab-input');
    const output = document.getElementById('vocab-output');
    if (!input || !output) return;

    // Wrap the typed word with the start/end token, like '.emma.'
    const raw = input.value.toLowerCase().replace(/[^a-z]/g, '');
    const wrapped = '.' + raw + '.';
    output.innerHTML = '';

    for (const ch of wrapped) {
        const chip = document.createElement('div');
        chip.className = 'token-chip';

        const charSpan = document.createElement('span');
        charSpan.className = 'token-char';
        charSpan.textContent = ch;

        const idSpan = document.createElement('span');
        idSpan.className = 'token-id';
        idSpan.textContent = stoi[ch] !== undefined ? stoi[ch] : '?';

        chip.appendChild(charSpan);
        chip.appendChild(idSpan);
        output.appendChild(chip);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const vocabInput = document.getElementById('vocab-input');
    if (vocabInput) {
        vocabInput.addEventListener('input', updateVocab);
        updateVocab();
    }
});

// ========== Plausible bigram probability table ==========
// P[i] is the distribution over the next character given current char index i.
// Hardcoded but shaped to resemble the real names.txt statistics
// (e.g. names often start with a/m/j/s, frequently end in a/n/e/y).
// Built procedurally so the heatmap and the sampler share one source of truth.
function buildBigramTable() {
    // Per-(prev char) preferences for the next character. Keys are next chars;
    // '.' means "end of word". Unlisted next chars get a small smoothing floor.
    const pref = {
        '.': { a:9, m:6, j:6, s:6, k:5, c:5, d:5, e:4, l:4, r:4, b:3, t:3, n:3, h:3, z:2, i:2, o:2, g:2, f:2, p:2, v:1, w:1, y:1, q:1, u:1, x:1 },
        a:  { '.':6, n:8, r:6, l:6, m:4, i:4, d:4, s:3, y:3, h:3, t:2, c:2, b:2, e:1, v:2 },
        b:  { e:6, a:5, r:4, o:3, i:2, y:2, l:2, '.':1 },
        c:  { h:8, a:5, o:4, k:3, e:3, i:2, l:2, '.':1, r:1 },
        d:  { a:5, e:5, i:4, r:3, o:3, '.':3, y:2, d:1 },
        e:  { '.':7, l:6, n:5, r:5, e:3, a:3, s:3, t:2, y:2, i:2, m:2, v:2 },
        f:  { a:3, e:3, i:3, r:3, o:2, '.':1, f:1 },
        g:  { e:4, a:3, h:3, i:2, o:2, '.':1, r:1 },
        h:  { a:8, e:6, '.':3, i:3, o:2, n:2, y:2, u:1 },
        i:  { a:6, n:6, e:5, s:4, c:3, l:3, '.':3, k:2, r:2, t:2, o:2, d:2 },
        j:  { a:6, o:5, e:4, u:3, '.':1 },
        k:  { a:5, e:4, i:3, '.':3, y:2, l:2, h:1 },
        l:  { a:6, e:6, i:5, l:5, y:4, '.':3, o:2, d:1 },
        m:  { a:8, e:5, i:4, o:3, m:2, '.':1, y:1, u:1 },
        n:  { '.':8, a:5, e:4, i:4, n:3, o:3, y:2, t:2, d:2 },
        o:  { n:5, '.':4, r:4, l:3, u:3, o:2, m:2, s:2, w:1 },
        p:  { h:4, e:3, a:3, o:2, p:2, r:2, '.':1 },
        q:  { u:9, '.':1 },
        r:  { a:6, i:5, e:5, '.':4, o:3, y:3, t:2, d:1 },
        s:  { a:5, h:5, e:4, '.':4, i:3, o:3, t:3, s:2 },
        t:  { a:5, h:5, '.':4, e:4, i:4, o:3, t:2, y:2, r:2 },
        u:  { s:3, r:3, '.':3, l:3, n:2, m:2, a:2, e:1 },
        v:  { a:5, i:5, e:4, '.':1, o:1 },
        w:  { a:4, e:3, i:3, o:2, '.':1, y:1 },
        x:  { '.':4, a:2, i:1, e:1 },
        y:  { '.':7, a:3, n:2, e:2, l:1 },
        z:  { a:5, e:4, i:3, '.':2, o:2, z:1 },
    };

    const P = [];
    const SMOOTH = 0.3; // model smoothing floor, akin to the +1 in Part 2
    for (let i = 0; i < VOCAB; i++) {
        const prevCh = itos[i];
        const row = new Array(VOCAB).fill(SMOOTH);
        const p = pref[prevCh] || {};
        for (const nextCh in p) {
            row[stoi[nextCh]] += p[nextCh];
        }
        const total = row.reduce((s, v) => s + v, 0);
        P.push(row.map(v => v / total));
    }
    return P;
}

const BIGRAM_P = buildBigramTable();

// ========== Bigram Probability Heatmap (Part 2) ==========
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('bigram-heatmap');
    if (!grid) return;

    const caption = document.getElementById('heatmap-caption');
    const labels = [];
    for (let i = 0; i < VOCAB; i++) labels.push(itos[i]);

    // grid = 1 corner + 27 col headers, then per row: 1 label + 27 cells
    grid.style.gridTemplateColumns = `repeat(${VOCAB + 1}, 22px)`;

    // Find a max for colour scaling (use prob, exclude tiny values)
    let maxP = 0;
    for (let i = 0; i < VOCAB; i++)
        for (let j = 0; j < VOCAB; j++)
            if (BIGRAM_P[i][j] > maxP) maxP = BIGRAM_P[i][j];

    // Header row
    const corner = document.createElement('div');
    corner.className = 'heat-label';
    corner.textContent = '';
    grid.appendChild(corner);
    for (let j = 0; j < VOCAB; j++) {
        const h = document.createElement('div');
        h.className = 'heat-label';
        h.textContent = labels[j];
        grid.appendChild(h);
    }

    // Body
    for (let i = 0; i < VOCAB; i++) {
        const rl = document.createElement('div');
        rl.className = 'heat-label';
        rl.textContent = labels[i];
        grid.appendChild(rl);

        for (let j = 0; j < VOCAB; j++) {
            const cell = document.createElement('div');
            cell.className = 'heat-cell';
            const p = BIGRAM_P[i][j];
            const intensity = Math.pow(p / maxP, 0.6); // gamma for visibility
            cell.style.background = `rgba(79, 195, 247, ${0.04 + intensity * 0.85})`;
            // Show approximate count-like number on hover via title + label
            const pct = (p * 100).toFixed(1);
            cell.title = `P(${labels[j]} | ${labels[i]}) = ${pct}%`;
            cell.textContent = p > maxP * 0.18 ? pct : '';
            cell.addEventListener('mouseenter', () => {
                if (caption) caption.textContent =
                    `P( "${labels[j]}" follows "${labels[i]}" ) ≈ ${pct}%`;
            });
            grid.appendChild(cell);
        }
    }
});

// ========== Bigram Name Sampler (Part 2 generation, live) ==========
function sampleFromRow(row) {
    // torch.multinomial equivalent: draw an index in proportion to probs
    const r = Math.random();
    let acc = 0;
    for (let j = 0; j < row.length; j++) {
        acc += row[j];
        if (r <= acc) return j;
    }
    return row.length - 1;
}

function drawName() {
    // Start at '.', sample until we hit '.' again (or a safety cap)
    let ix = 0;
    const chars = [];
    let logProb = 0;
    let steps = 0;
    while (steps < 30) {
        const row = BIGRAM_P[ix];
        const next = sampleFromRow(row);
        logProb += Math.log(row[next]);
        steps++;
        if (next === 0) break;          // end token '.'
        chars.push(itos[next]);
        ix = next;
    }
    const name = chars.join('');
    // average negative log-likelihood of this sample
    const nll = steps > 0 ? (-logProb / steps) : 0;
    return { name, nll };
}

let samplerAnimRunning = false;

function sampleName() {
    const out = document.getElementById('sampler-output');
    const nllEl = document.getElementById('sampler-nll');
    if (!out) return;
    if (samplerAnimRunning) return;
    samplerAnimRunning = true;

    const { name, nll } = drawName();
    const full = '.' + name + '.';
    let shown = 0;

    const render = () => {
        let html = '';
        for (let i = 0; i < shown; i++) {
            const c = full[i];
            html += (c === '.') ? '<span class="dot">.</span>' : c;
        }
        html += '<span class="cursor">▌</span>';
        out.innerHTML = html;
    };
    render();

    const interval = setInterval(() => {
        shown++;
        render();
        if (shown >= full.length) {
            clearInterval(interval);
            out.innerHTML = full
                .split('')
                .map(c => c === '.' ? '<span class="dot">.</span>' : c)
                .join('');
            if (nllEl) nllEl.textContent = `sample nll = ${nll.toFixed(2)}`;
            samplerAnimRunning = false;
        }
    }, 130);
}

function sampleBatch() {
    const namesEl = document.getElementById('sampler-names');
    if (!namesEl) return;
    namesEl.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const { name } = drawName();
        const chip = document.createElement('span');
        chip.className = 'sampler-name';
        chip.textContent = name || '(empty)';
        chip.style.animationDelay = (i * 0.05) + 's';
        namesEl.appendChild(chip);
    }
}
