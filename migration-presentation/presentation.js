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
            this.updateSlideCounter();
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

        // Image (side-by-side with bullets if both exist)
        if (slide.image && slide.bullets) {
            content.push(`
                <div class="image-content-row reveal">
                    <div class="image-side">
                        <img src="${slide.image}" alt="${slide.imageAlt || ''}" class="slide-image">
                        ${slide.imageCaption ? `<p class="image-caption">${slide.imageCaption}</p>` : ''}
                    </div>
                    <div class="content-side">
                        <div class="bullets">
                            ${slide.bullets.map(bullet => `<div class="bullet">${bullet}</div>`).join('')}
                        </div>
                    </div>
                </div>
            `);
            // Mark bullets as handled
            slide._bulletsHandled = true;
        } else if (slide.image) {
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

        // Bullets (skip if already handled by image-content-row)
        if (slide.bullets && !slide._bulletsHandled) {
            content.push(`
                <div class="bullets reveal">
                    ${slide.bullets.map(bullet => `
                        <div class="bullet">${bullet}</div>
                    `).join('')}
                </div>
            `);
        }

        // Code
        if (slide.code) {
            content.push(`<div class="code-block reveal">${slide.code}</div>`);
        }

        // Flow diagram
        if (slide.flow) {
            content.push(`
                <div class="flow reveal">
                    <span class="flow-item">${slide.flow.from}</span>
                    <span class="flow-arrow">→</span>
                    <span class="flow-item">${slide.flow.to}</span>
                </div>
            `);
        }

        // Comparison columns (before/after, old/new)
        if (slide.columns) {
            content.push(`
                <div class="comparison reveal">
                    ${slide.columns.map(col => `
                        <div class="comparison-column">
                            <div class="comparison-header">${col.header}</div>
                            <div class="comparison-items">
                                ${col.items.map(item => `<div class="comparison-item">${item}</div>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `);
        }

        // Timeline
        if (slide.timeline) {
            content.push(`
                <div class="timeline reveal">
                    ${slide.timeline.map((item, i) => `
                        <div class="timeline-item">
                            <div class="timeline-marker">${i + 1}</div>
                            <div class="timeline-content">
                                <div class="timeline-date">${item.date || ''}</div>
                                <div class="timeline-title">${item.title}</div>
                                ${item.description ? `<div class="timeline-desc">${item.description}</div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `);
        }

        // Quote
        if (slide.quote) {
            content.push(`
                <blockquote class="quote reveal">
                    <div class="quote-text">"${slide.quote.text}"</div>
                    ${slide.quote.author ? `<div class="quote-author">— ${slide.quote.author}</div>` : ''}
                </blockquote>
            `);
        }

        // Table
        if (slide.table) {
            content.push(`
                <div class="table-wrapper reveal">
                    <table class="slide-table">
                        <thead>
                            <tr>${slide.table.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${slide.table.rows.map(row => `
                                <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `);
        }

        // Diagram with multiple nodes
        if (slide.diagram) {
            content.push(`
                <div class="diagram reveal">
                    ${slide.diagram.nodes.map((node, i) => `
                        <div class="diagram-node">
                            <div class="diagram-node-label">${node.label}</div>
                            ${node.description ? `<div class="diagram-node-desc">${node.description}</div>` : ''}
                        </div>
                        ${i < slide.diagram.nodes.length - 1 ? '<div class="diagram-arrow">→</div>' : ''}
                    `).join('')}
                </div>
            `);
        }

        // Two-column layout
        if (slide.twoColumn) {
            content.push(`
                <div class="two-column reveal">
                    <div class="column">
                        ${slide.twoColumn.left.title ? `<div class="column-title">${slide.twoColumn.left.title}</div>` : ''}
                        ${slide.twoColumn.left.bullets ? slide.twoColumn.left.bullets.map(b => `<div class="bullet">${b}</div>`).join('') : ''}
                        ${slide.twoColumn.left.content || ''}
                    </div>
                    <div class="column">
                        ${slide.twoColumn.right.title ? `<div class="column-title">${slide.twoColumn.right.title}</div>` : ''}
                        ${slide.twoColumn.right.bullets ? slide.twoColumn.right.bullets.map(b => `<div class="bullet">${b}</div>`).join('') : ''}
                        ${slide.twoColumn.right.content || ''}
                    </div>
                </div>
            `);
        }

        // Highlight box / callout
        if (slide.callout) {
            content.push(`
                <div class="callout reveal ${slide.callout.type || ''}">
                    ${slide.callout.icon ? `<div class="callout-icon">${slide.callout.icon}</div>` : ''}
                    <div class="callout-content">
                        ${slide.callout.title ? `<div class="callout-title">${slide.callout.title}</div>` : ''}
                        <div class="callout-text">${slide.callout.text}</div>
                    </div>
                </div>
            `);
        }

        // Icon/feature grid
        if (slide.features) {
            content.push(`
                <div class="features reveal">
                    ${slide.features.map(f => `
                        <div class="feature">
                            <div class="feature-icon">${f.icon || '●'}</div>
                            <div class="feature-title">${f.title}</div>
                            ${f.description ? `<div class="feature-desc">${f.description}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            `);
        }

        // Code comparison (side by side)
        if (slide.codeCompare) {
            content.push(`
                <div class="code-compare reveal">
                    <div class="code-panel">
                        <div class="code-panel-header">${slide.codeCompare.left.title}</div>
                        <pre class="code-block">${slide.codeCompare.left.code}</pre>
                    </div>
                    <div class="code-panel">
                        <div class="code-panel-header">${slide.codeCompare.right.title}</div>
                        <pre class="code-block">${slide.codeCompare.right.code}</pre>
                    </div>
                </div>
            `);
        }

        // Progress/steps indicator
        if (slide.steps) {
            content.push(`
                <div class="steps reveal">
                    ${slide.steps.map((step, i) => `
                        <div class="step ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}">
                            <div class="step-number">${i + 1}</div>
                            <div class="step-label">${step.label}</div>
                        </div>
                    `).join('')}
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

    createNavDots() {
        // Nav dots disabled - using slide counter instead
    }

    updateSlideCounter() {
        const counter = document.getElementById('slideCounter');
        if (counter) {
            counter.querySelector('.current').textContent = this.currentSlide + 1;
            counter.querySelector('.total').textContent = this.slides.length;
        }
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
                    this.updateSlideCounter();
                }
            });
        }, { threshold: 0.3 });

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
