/* ===========================================
   SLIDE PRESENTATION ENGINE
   Loads slides from JSON and renders them
   =========================================== */

class SlidePresentation {
    constructor() {
        this.slides = [];
        this.config = {};
        this.currentSlide = 0;
        this.init();
    }

    async init() {
        try {
            await this.loadSlides();
            this.applyTheme();
            this.renderSlides();
            this.createNavDots();
            this.bindEvents();
            this.observeSlides();
            this.updateProgress();
        } catch (error) {
            this.showError(error);
        }
    }

    async loadSlides() {
        const response = await fetch('slides.json');
        if (!response.ok) throw new Error('Failed to load slides.json');
        const data = await response.json();
        this.config = data.config;
        this.slides = data.slides;
    }

    applyTheme() {
        const theme = this.config.theme;
        if (!theme) return;

        const root = document.documentElement;

        // Apply all theme colors from JSON
        if (theme.bg) root.style.setProperty('--bg', theme.bg);
        if (theme.bgCard) root.style.setProperty('--bg-card', theme.bgCard);
        if (theme.text) root.style.setProperty('--text', theme.text);
        if (theme.textMuted) root.style.setProperty('--text-muted', theme.textMuted);
        if (theme.accent) root.style.setProperty('--accent', theme.accent);
        if (theme.accentLight) root.style.setProperty('--accent-light', theme.accentLight);
        if (theme.border) root.style.setProperty('--border', theme.border);

        // Set page title
        document.title = this.config.title || 'Presentation';
    }

    renderSlides() {
        const container = document.getElementById('slides');
        container.innerHTML = this.slides.map((slide, index) =>
            this.renderSlide(slide, index)
        ).join('');
    }

    renderSlide(slide, index) {
        const content = [];

        // Badge
        if (slide.badge) {
            content.push(`<div class="badge reveal">${slide.badge}</div>`);
        }

        // Title
        if (slide.title) {
            const tag = slide.type === 'title' ? 'h1' : 'h2';
            content.push(`<${tag} class="slide-title reveal">${slide.title}</${tag}>`);
        }

        // Subtitle
        if (slide.subtitle) {
            content.push(`<p class="subtitle reveal">${slide.subtitle}</p>`);
        }

        // Image
        if (slide.image) {
            content.push(`
                <div class="reveal">
                    <img src="${slide.image}" alt="${slide.imageAlt || ''}" class="slide-image">
                    ${slide.imageCaption ? `<p class="image-caption">${slide.imageCaption}</p>` : ''}
                </div>
            `);
        }

        // Stats
        if (slide.stats) {
            content.push(`
                <div class="stats reveal">
                    ${slide.stats.map(stat => `
                        <div class="stat">
                            <div class="stat-number">${stat.value}</div>
                            <div class="stat-label">${stat.label}</div>
                        </div>
                    `).join('')}
                </div>
            `);
        }

        // Bullets
        if (slide.bullets) {
            content.push(`
                <div class="bullets reveal">
                    ${slide.bullets.map(bullet => `
                        <div class="bullet">${bullet}</div>
                    `).join('')}
                </div>
            `);
        }

        // Code block (enhanced)
        if (slide.code) {
            const codeContent = typeof slide.code === 'object'
                ? slide.code.content
                : slide.code;
            const codeLang = typeof slide.code === 'object'
                ? slide.code.language
                : '';

            const highlightedCode = this.highlightSyntax(codeContent);

            content.push(`
                <div class="code-block reveal">
                    ${codeLang ? `<span class="code-lang">${codeLang}</span>` : ''}
                    <pre>${highlightedCode}</pre>
                </div>
            `);
        }

        // Flow diagram
        if (slide.flow) {
            content.push(`
                <div class="flow reveal">
                    <span class="flow-item">${slide.flow.from}</span>
                    <span class="flow-arrow">&rarr;</span>
                    <span class="flow-item">${slide.flow.to}</span>
                </div>
            `);
        }

        // Note
        if (slide.note) {
            content.push(`<p class="note reveal">${slide.note}</p>`);
        }

        return `
            <section class="slide" data-index="${index}">
                <div class="slide-content">
                    ${content.join('')}
                </div>
            </section>
        `;
    }

    highlightSyntax(code) {
        // Escape HTML first
        let escaped = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Apply syntax highlighting
        // Keywords
        escaped = escaped.replace(
            /\b(const|let|var|function|async|await|return|if|else|for|while|class|import|export|from|test|describe|expect)\b/g,
            '<span class="keyword">$1</span>'
        );

        // Strings (single and double quotes)
        escaped = escaped.replace(
            /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
            '<span class="string">$&</span>'
        );

        // Comments
        escaped = escaped.replace(
            /(\/\/.*$)/gm,
            '<span class="comment">$1</span>'
        );

        // Function calls
        escaped = escaped.replace(
            /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
            '<span class="function">$1</span>('
        );

        // Properties after dot
        escaped = escaped.replace(
            /\.([a-zA-Z_][a-zA-Z0-9_]*)/g,
            '.<span class="property">$1</span>'
        );

        return escaped;
    }

    createNavDots() {
        const container = document.getElementById('navDots');
        container.innerHTML = this.slides.map((_, index) =>
            `<div class="nav-dot" data-index="${index}"></div>`
        ).join('');
    }

    bindEvents() {
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.goToSlide(this.currentSlide + 1);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.goToSlide(this.currentSlide - 1);
            }
        });

        // Nav dot clicks
        document.querySelectorAll('.nav-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                this.goToSlide(parseInt(dot.dataset.index));
            });
        });

        // Scroll tracking
        window.addEventListener('scroll', () => {
            this.updateProgress();
        });
    }

    observeSlides() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.currentSlide = parseInt(entry.target.dataset.index);
                    this.updateActiveDot();
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.slide').forEach(slide => {
            observer.observe(slide);
        });
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        const slide = document.querySelector(`.slide[data-index="${index}"]`);
        if (slide) {
            slide.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateActiveDot() {
        document.querySelectorAll('.nav-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentSlide);
        });
    }

    updateProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        document.getElementById('progress').style.width = `${progress}%`;
    }

    showError(error) {
        document.getElementById('slides').innerHTML = `
            <div class="error">
                <h2>Error Loading Presentation</h2>
                <p>${error.message}</p>
                <p>Make sure slides.json exists in the same directory.</p>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SlidePresentation();
});
