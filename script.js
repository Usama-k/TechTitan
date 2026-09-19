document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Ambient Neural Particle Canvas
       ========================================================================== */
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const resizeCanvas = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resizeCanvas);

        // Particle configuration
        const particleCount = Math.min(Math.floor((width * height) / 14000), 85);
        const particles = [];
        const mouse = { x: null, y: null, radius: 160 };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.7;
                this.vy = (Math.random() - 0.5) * 0.7;
                this.radius = Math.random() * 1.8 + 1;
                this.baseAlpha = Math.random() * 0.5 + 0.2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;

                // Mouse interaction
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (1 - dist / mouse.radius) * 0.04;
                        this.x -= dx * force;
                        this.y -= dy * force;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 242, 254, ${this.baseAlpha})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#00f2fe';
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animateCanvas = () => {
            ctx.clearRect(0, 0, width, height);

            // Connect nearby particles
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        const alpha = (1 - dist / 130) * 0.22;
                        ctx.strokeStyle = `rgba(121, 40, 202, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Connect to mouse if near
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = particles[i].x - mouse.x;
                    const dy = particles[i].y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        const alpha = (1 - dist / 150) * 0.45;
                        ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animateCanvas);
        };
        animateCanvas();
    }

    /* ==========================================================================
       2. Custom Reticle Cursor
       ========================================================================== */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');

    if (cursorDot && cursorRing && window.innerWidth > 768) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        const renderRing = () => {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
            requestAnimationFrame(renderRing);
        };
        requestAnimationFrame(renderRing);

        const interactables = document.querySelectorAll('a, button, input, select, textarea, .model-card, .preset-btn, .lang-tab, .security-card');
        interactables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.classList.add('hovered');
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('hovered');
            });
        });
    }

    /* ==========================================================================
       3. Header Scroll & Mobile Navigation
       ========================================================================== */
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    /* ==========================================================================
       4. Interactive AI Live Playground
       ========================================================================== */
    const playgroundOutput = document.getElementById('playground-output');
    const playgroundInput = document.getElementById('playground-input');
    const btnRunInference = document.getElementById('btn-run-inference');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const modelSelect = document.getElementById('playground-model-select');
    const modelBadge = document.getElementById('active-model-display');
    const tempSlider = document.getElementById('temp-slider');
    const tempValDisplay = document.getElementById('temp-val');
    const statSpeed = document.getElementById('stat-speed');
    const statTokens = document.getElementById('stat-tokens');
    const statTtft = document.getElementById('stat-ttft');

    // Scenarios & Generation Content
    const scenarios = {
        architecture: {
            prompt: "Design a zero-downtime distributed neural cache with speculative validation.",
            output: `[Titan-Omni 3.5 Engine] >> Initializing speculative execution topology...

1. INGESTION & TENSOR PARTITIONING:
   • Edge Routers: Anycast BGP tier terminating requests at 14 POPs.
   • KV-Cache Speculative Decoupling: Partitioning context buffers across 4x NVLink clusters with sub-250μs p99 RDMA interconnects.

2. REAL-TIME SPECULATIVE VERIFICATION:
   ┌───────────────────────┐       Token Delta       ┌───────────────────────┐
   │ Titan-Flash (Draft)   │ ──────────────────────> │ Titan-Omni (Verifier) │
   │ Latency: 2.1ms / tok  │                         │ Latency: 9.8ms / chunk│
   └───────────────────────┘                         └───────────────────────┘
                                                             │
                                                     [Acceptance: 89.4%]
                                                             ▼
                                                    Zero-Copy Broadcast

3. RECOVERY & FAULT TOLERANCE:
   • Raft consensus on KV checkpoints every 512 tokens.
   • Failure detection MTTR: < 4.2ms with hot-standby GPU shard injection.
   
✓ Architecture compiled. Formal invariance proof verified.`
        },
        code: {
            prompt: "Synthesize a high-throughput asynchronous Rust token worker with bounded channels.",
            output: `// Titan-Code Pro: Zero-cost asynchronous token streaming pipeline
use tokio::sync::mpsc;
use bytes::Bytes;
use std::sync::Arc;

pub struct NeuralWorker {
    tx_stream: mpsc::Sender<Bytes>,
    model_id: Arc<str>,
}

impl NeuralWorker {
    pub fn new(buffer_capacity: usize, model_id: &str) -> (Self, mpsc::Receiver<Bytes>) {
        let (tx, rx) = mpsc::channel(buffer_capacity);
        (
            Self {
                tx_stream: tx,
                model_id: Arc::from(model_id),
            },
            rx,
        )
    }

    pub async fn stream_inference(&self, mut token_stream: impl futures::Stream<Item = Bytes> + Unpin) {
        use futures::StreamExt;
        while let Some(chunk) = token_stream.next().await {
            if let Err(e) = self.tx_stream.send(chunk).await {
                eprintln!("Pipeline downstream dropped: {e:?}");
                break;
            }
        }
    }
}
// Benchmark: 2.4M msgs/sec over Tokio v1.38 (Memory overhead: 0 allocs in hot loop)`
        },
        reasoning: {
            prompt: "Perform multi-step reasoning to evaluate optimal KV-cache quantization without perplexity degradation.",
            output: `<thinking>
Step 1: Analyze FP16 vs INT4 / FP8 dynamic range requirements.
- Standard attention logits exhibit outlier dimensions in heads [7, 14, 28].
- Uniform INT4 quantisation produces catastrophic perplexity spikes (+1.8 PPL on Wikitext-103).

Step 2: Formulate Per-Channel Outlier-Preserved Quantization (Titan-Quant).
- Isolate outlier magnitude threshold: ||X_i||_∞ > 4.5σ.
- Retain 1.2% outlier columns in native FP16.
- Quantize the remaining 98.8% matrix to FP8 (E4M3 format) using per-token scale factors.

Step 3: Verification & Error Bound Calculation.
- Max Frobenius norm deviation: ||W_quant - W_fp16||_F < 0.0034.
- Memory consumption reduction: 58.2% across 200k token context window.
</thinking>

SYNTHESIZED CONCLUSION:
Titan-Quant FP8 Hybrid retains 99.94% accuracy on MMLU benchmarks while doubling token generation speed to 164 tok/s.`
        },
        agent: {
            prompt: "Execute autonomous multi-agent tool loop to diagnose and hotpatch production microservice latency.",
            output: `[Titan-Agent OS v3.5] Autonomous Task Initiated.
Goal: Diagnose and resolve p99 latency spike in authentication service.

[Iteration 1 | Observe]: Querying distributed trace database via OpenTelemetry API...
> Action: query_trace(filter="service.name='auth' and latency > 200ms", limit=50)
> Result: 47/50 traces indicate thread starvation in Bcrypt password hasher pool.

[Iteration 2 | Reason]: CPU core contention between HTTP accept loop and cryptographic worker threads.
> Action: generate_patch(path="src/security/hasher.rs")
> Code:
  - thread_pool = ThreadPoolBuilder::new().num_threads(available_cores - 2).build()?;
  + thread_pool = ThreadPoolBuilder::new().num_threads(num_cpus::get_physical()).build()?;

[Iteration 3 | Sandbox Validation]:
> Action: run_integration_tests(suite="load_test_10k_qps")
> Result: Tests Passed. p99 dropped from 284ms -> 8.2ms. Zero regressions.

Task Completed Successfully. Verifiable deployment receipt generated.`
        }
    };

    let isStreaming = false;
    let streamInterval = null;

    const streamTextToConsole = (text) => {
        if (isStreaming) {
            clearInterval(streamInterval);
        }
        isStreaming = true;
        playgroundOutput.innerHTML = '';

        const cursorSpan = document.createElement('span');
        cursorSpan.className = 'output-cursor';
        playgroundOutput.appendChild(cursorSpan);

        let charIndex = 0;
        const totalChars = text.length;
        const estimatedTokens = Math.floor(totalChars / 3.8);

        // Dynamic stats update
        statSpeed.textContent = (145 + Math.random() * 20).toFixed(1) + ' tok/s';
        statTtft.textContent = (8.5 + Math.random() * 3).toFixed(1) + ' ms';
        statTokens.textContent = '0';

        // Speed of typing (streaming chunks)
        streamInterval = setInterval(() => {
            // Stream in natural chunk sizes (2-6 chars per tick)
            const chunkSize = Math.min(Math.floor(Math.random() * 4) + 3, totalChars - charIndex);
            const chunk = text.substr(charIndex, chunkSize);
            charIndex += chunkSize;

            const textNode = document.createTextNode(chunk);
            playgroundOutput.insertBefore(textNode, cursorSpan);
            playgroundOutput.scrollTop = playgroundOutput.scrollHeight;

            const currentTokens = Math.floor(charIndex / 3.8);
            statTokens.textContent = currentTokens;

            if (charIndex >= totalChars) {
                clearInterval(streamInterval);
                isStreaming = false;
                statTokens.textContent = estimatedTokens;
            }
        }, 16);
    };

    // Preset selection
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const presetKey = btn.getAttribute('data-preset');
            if (scenarios[presetKey]) {
                playgroundInput.value = scenarios[presetKey].prompt;
                streamTextToConsole(scenarios[presetKey].output);
            }
        });
    });

    // Run inference trigger
    if (btnRunInference) {
        btnRunInference.addEventListener('click', () => {
            const currentPrompt = playgroundInput.value.trim();
            // Check matching scenario or generate contextual mock
            let matchedOutput = null;
            for (const key in scenarios) {
                if (scenarios[key].prompt === currentPrompt) {
                    matchedOutput = scenarios[key].output;
                    break;
                }
            }

            if (!matchedOutput) {
                matchedOutput = `[TitanTech Neural Core] Processing custom directive:
> Prompt: "${currentPrompt}"

1. TENSOR DECOMPOSITION:
   Analyzing linguistic tokens across 128 multi-head attention vectors.
   Context coherence score: 99.82%.

2. GENERATIVE SYNTHESIS:
   Titan-Omni evaluated 10 candidate hypotheses and selected highest-confidence convergence.
   Optimal solution constructed with zero constraint violations.

3. RESULT DISPATCH:
   Execution completed with verified deterministic bounds. Ready for enterprise pipeline integration.`;
            }

            streamTextToConsole(matchedOutput);
        });
    }

    if (playgroundInput) {
        playgroundInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                btnRunInference.click();
            }
        });
    }

    // Model dropdown change
    if (modelSelect && modelBadge) {
        modelSelect.addEventListener('change', (e) => {
            modelBadge.textContent = `model: ${e.target.value}`;
        });
    }

    // Temperature slider
    if (tempSlider && tempValDisplay) {
        tempSlider.addEventListener('input', (e) => {
            const val = (e.target.value / 100).toFixed(2);
            tempValDisplay.textContent = val;
        });
    }

    // Initial run of default preset
    if (playgroundOutput) {
        streamTextToConsole(scenarios.architecture.output);
    }

    /* ==========================================================================
       5. Developer API Code Terminal & Language Switching
       ========================================================================== */
    const langTabs = document.querySelectorAll('.lang-tab');
    const codeDisplay = document.getElementById('code-display');
    const btnCopyCode = document.getElementById('btn-copy-code');
    const toast = document.getElementById('toast-msg');
    const toastText = document.getElementById('toast-text');

    const codeSnippets = {
        python: `<span class="syntax-kw">import</span> asyncio
<span class="syntax-kw">from</span> titantech <span class="syntax-kw">import</span> AsyncTitanAI

client = <span class="syntax-fn">AsyncTitanAI</span>(
    api_key=<span class="syntax-str">"tt_live_948fbc2910"</span>,
    cluster=<span class="syntax-str">"us-accelerated"</span>
)

<span class="syntax-kw">async def</span> <span class="syntax-fn">main</span>():
    stream = <span class="syntax-kw">await</span> client.chat.stream(
        model=<span class="syntax-str">"titan-omni-3.5"</span>,
        temperature=<span class="syntax-num">0.2</span>,
        messages=[{<span class="syntax-str">"role"</span>: <span class="syntax-str">"user"</span>, <span class="syntax-str">"content"</span>: <span class="syntax-str">"Synthesize neural scheduler in Rust"</span>}]
    )
    <span class="syntax-kw">async for</span> chunk <span class="syntax-kw">in</span> stream:
        print(chunk.delta.content or <span class="syntax-str">""</span>, end=<span class="syntax-str">""</span>, flush=<span class="syntax-kw">True</span>)

asyncio.run(main())`,

        typescript: `<span class="syntax-kw">import</span> { TitanAI } <span class="syntax-kw">from</span> <span class="syntax-str">'@titantech/sdk'</span>;

<span class="syntax-kw">const</span> titan = <span class="syntax-kw">new</span> <span class="syntax-fn">TitanAI</span>({
  apiKey: process.env.TITAN_API_KEY,
  cluster: <span class="syntax-str">'global-accelerated'</span>
});

<span class="syntax-comment">// Stream frontier reasoning with real-time token callback</span>
<span class="syntax-kw">const</span> stream = <span class="syntax-kw">await</span> titan.chat.stream({
  model: <span class="syntax-str">'titan-omni-3.5'</span>,
  temperature: <span class="syntax-num">0.2</span>,
  messages: [
    { role: <span class="syntax-str">'system'</span>, content: <span class="syntax-str">'You are an autonomous engineering agent.'</span> },
    { role: <span class="syntax-str">'user'</span>, content: <span class="syntax-str">'Synthesize fault-tolerant state machine in Rust.'</span> }
  ]
});

<span class="syntax-kw">for await</span> (<span class="syntax-kw">const</span> chunk <span class="syntax-kw">of</span> stream) {
  process.stdout.write(chunk.delta?.content || <span class="syntax-str">''</span>);
}`,

        curl: `<span class="syntax-kw">curl</span> https://api.titantech.ai/v1/chat/completions \\
  -H <span class="syntax-str">"Content-Type: application/json"</span> \\
  -H <span class="syntax-str">"Authorization: Bearer $TITAN_API_KEY"</span> \\
  -d <span class="syntax-str">'{
    "model": "titan-omni-3.5",
    "stream": true,
    "temperature": 0.2,
    "messages": [
      {"role": "user", "content": "Synthesize fault-tolerant state machine in Rust."}
    ]
  }'</span>`,

        rust: `<span class="syntax-kw">use</span> titantech::{Client, ChatPayload, Message};
<span class="syntax-kw">use</span> futures_util::StreamExt;

<span class="syntax-kw">#[tokio::main]</span>
<span class="syntax-kw">async fn</span> <span class="syntax-fn">main</span>() -> Result&lt;(), Box&lt;<span class="syntax-kw">dyn</span> std::error::Error&gt;&gt; {
    <span class="syntax-kw">let</span> client = Client::new(std::env::var(<span class="syntax-str">"TITAN_API_KEY"</span>)?);
    
    <span class="syntax-kw">let mut</span> stream = client.chat_stream(ChatPayload {
        model: <span class="syntax-str">"titan-omni-3.5"</span>.into(),
        temperature: <span class="syntax-num">0.2</span>,
        messages: <span class="syntax-kw">vec</span>![Message::user(<span class="syntax-str">"Synthesize fault-tolerant state machine in Rust."</span>)],
    }).<span class="syntax-kw">await</span>?;

    <span class="syntax-kw">while let</span> <span class="syntax-fn">Some</span>(token) = stream.next().<span class="syntax-kw">await</span> {
        print!(<span class="syntax-str">"{}"</span>, token?.delta);
    }
    <span class="syntax-fn">Ok</span>(())
}`
    };

    const rawSnippets = {
        python: `import asyncio
from titantech import AsyncTitanAI

client = AsyncTitanAI(
    api_key="tt_live_948fbc2910",
    cluster="us-accelerated"
)

async def main():
    stream = await client.chat.stream(
        model="titan-omni-3.5",
        temperature=0.2,
        messages=[{"role": "user", "content": "Synthesize neural scheduler in Rust"}]
    )
    async for chunk in stream:
        print(chunk.delta.content or "", end="", flush=True)

asyncio.run(main())`,

        typescript: `import { TitanAI } from '@titantech/sdk';

const titan = new TitanAI({
  apiKey: process.env.TITAN_API_KEY,
  cluster: 'global-accelerated'
});

const stream = await titan.chat.stream({
  model: 'titan-omni-3.5',
  temperature: 0.2,
  messages: [
    { role: 'system', content: 'You are an autonomous engineering agent.' },
    { role: 'user', content: 'Synthesize fault-tolerant state machine in Rust.' }
  ]
});

for await (const chunk of stream) {
  process.stdout.write(chunk.delta?.content || '');
}`,

        curl: `curl https://api.titantech.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TITAN_API_KEY" \\
  -d '{
    "model": "titan-omni-3.5",
    "stream": true,
    "temperature": 0.2,
    "messages": [
      {"role": "user", "content": "Synthesize fault-tolerant state machine in Rust."}
    ]
  }'`,

        rust: `use titantech::{Client, ChatPayload, Message};
use futures_util::StreamExt;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new(std::env::var("TITAN_API_KEY")?);
    
    let mut stream = client.chat_stream(ChatPayload {
        model: "titan-omni-3.5".into(),
        temperature: 0.2,
        messages: vec![Message::user("Synthesize fault-tolerant state machine in Rust.")],
    }).await?;

    while let Some(token) = stream.next().await {
        print!("{}", token?.delta);
    }
    Ok(())
}`
    };

    let currentActiveLang = 'typescript';

    langTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            langTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const lang = tab.getAttribute('data-lang');
            currentActiveLang = lang;
            if (codeSnippets[lang]) {
                codeDisplay.innerHTML = `<code id="code-text">${codeSnippets[lang]}</code>`;
            }
        });
    });

    const showToast = (msg) => {
        if (!toast) return;
        toastText.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    };

    if (btnCopyCode) {
        btnCopyCode.addEventListener('click', () => {
            const raw = rawSnippets[currentActiveLang] || '';
            navigator.clipboard.writeText(raw).then(() => {
                showToast(`Copied ${currentActiveLang.toUpperCase()} SDK snippet to clipboard!`);
            }).catch(() => {
                showToast(`Snippet copied!`);
            });
        });
    }

    /* ==========================================================================
       6. 3D Tilt Effect on Cards
       ========================================================================== */
    const tiltCards = document.querySelectorAll('.model-card, .security-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });

    /* ==========================================================================
       7. Magnetic Buttons Micro-interaction
       ========================================================================== */
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const h = rect.width / 2;
            const x = e.clientX - rect.left - h;
            const y = e.clientY - rect.top - (rect.height / 2);

            el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0px, 0px)';
        });
    });

    /* ==========================================================================
       8. Request Access Form Submission
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Provisioning API Credentials...';
            submitBtn.style.opacity = '0.85';

            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Request Received — Credentials Queued!';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                submitBtn.style.color = '#fff';
                showToast('API Access Request Transmitted! Our engineering team will review your application.');
                contactForm.reset();

                setTimeout(() => {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.style.opacity = '1';
                }, 4000);
            }, 1200);
        });
    }

});
