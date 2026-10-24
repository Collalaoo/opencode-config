# OpenCode Skills — Повний посібник

**29 скілів** встановлено з репозиторію [awesome-opencode-skills](https://github.com/TheArchitectit/awesome-opencode-skills)

> Директорія: `~/.config/opencode/skills/<skill-name>/SKILL.md`

---

## Зміст

1. [Як працювати з Skills](#як-працювати-з-skills)
2. [Document Processing](#document-processing)
3. [Development & Code Tools](#development--code-tools)
4. [Business & Marketing](#business--marketing)
5. [Communication & Writing](#communication--writing)
6. [Creative & Media](#creative--media)
7. [Productivity & Organization](#productivity--organization)
8. [Security & Systems](#security--systems)
9. [Інші](#інші)
10. [Як створити власний скіл](#як-створити-власний-скіл)

---

## Як працювати з Skills

### Автоматичне завантаження

OpenCode автоматично завантажує скіли при старті. Скіл активується, коли опис завдання збігається з його призначенням (`description` у YAML-фронтматері).

### Явний запит скілу

Скажіть прямо:

```
Використай скіл <назва-скілу> для цього завдання
Завантаж скіл <назва-скілу>
Use the <skill-name> skill for this task
```

### Приклади виклику

- _"Use `webapp-testing` to test the local web app"_
- _"Завантаж `code-security-auditor` і перевір цей код"_
- _"Використай `content-research-writer` для написання статті"_
- _"Запусти `staff-engineer-review` на цьому PR"_

### Структура скілу

```
~/.config/opencode/skills/<skill-name>/
├── SKILL.md              # Інструкції + YAML-фронтматер
├── scripts/              # (optional) допоміжні скрипти
├── references/           # (optional) документація
├── templates/            # (optional) шаблони
├── assets/               # (optional) ресурси
└── examples/             # (optional) приклади
```

---

## Document Processing

### docx

Робота з Word-документами (.docx).

**Принцип роботи:** .docx — це ZIP-архів з XML. Для читання використовується pandoc, для створення — JavaScript-бібліотека `docx`, для редагування — Python-бібліотека `Document library`.

**Операції:**
- **Читання:** `pandoc --track-changes=all file.docx -o output.md`
- **Створення:** JavaScript через `docx` (Document, Paragraph, TextRun) + Packer.toBuffer()
- **Редагування:** Розпакувати `python ooxml/scripts/unpack.py`, змінити XML, запакувати
- **Redlining (tracked changes):** Для документів інших людей — обов'язково використовуйте redlining workflow з відстеженням змін через `<w:ins>`/`<w:del>`
- **Конвертація в зображення:** `soffice --headless --convert-to pdf` + `pdftoppm`

**Команди:**
```bash
# Читання
pandoc --track-changes=all file.docx -o output.md

# Розпакування
python ooxml/scripts/unpack.py file.docx output_dir

# Пакування
python ooxml/scripts/pack.py input_dir file.docx

# Візуалізація
soffice --headless --convert-to pdf file.docx
pdftoppm -jpeg -r 150 file.pdf page
```

**Залежності:** pandoc, docx (npm), LibreOffice, poppler-utils, defusedxml

---

### pdf

Маніпуляція PDF-файлами: читання, створення, злиття, розділення, форми.

**Бібліотеки:**
- **pypdf** — базові операції (читання, злиття, split, ротація, водяні знаки, паролі)
- **pdfplumber** — розширене витягування тексту та таблиць
- **reportlab** — створення PDF з нуля (Canvas, Platypus)
- **pytesseract + pdf2image** — OCR для сканованих PDF

**Основні патерни:**
```python
from pypdf import PdfReader, PdfWriter

# Злиття
writer = PdfWriter()
for pdf in ["doc1.pdf", "doc2.pdf"]:
    for page in PdfReader(pdf).pages:
        writer.add_page(page)
writer.write("merged.pdf")

# Таблиці
with pdfplumber.open("doc.pdf") as pdf:
    for page in pdf.pages:
        for table in page.extract_tables():
            print(table)

# Створення
from reportlab.pdfgen import canvas
c = canvas.Canvas("hello.pdf")
c.drawString(100, 700, "Hello World!")
c.save()
```

**CLI-інструменти:** pdftotext (poppler-utils), qpdf, pdftk

---

### pptx

Робота з PowerPoint-презентаціями (.pptx).

**Створення без шаблону:** Використовується **html2pptx** — HTML-слайди конвертуються в PowerPoint.
1. Прочитати `html2pptx.md`
2. Створити HTML для кожного слайду (720pt × 405pt для 16:9)
3. Конвертувати через `html2pptx()` + PptxGenJS
4. Валідувати через thumbnail: `python scripts/thumbnail.py output.pptx`

**Створення з шаблоном:**
1. Витягнути текст: `python -m markitdown template.pptx`
2. Створити thumbnail: `python scripts/thumbnail.py template.pptx`
3. Проінвентаризувати: `python scripts/inventory.py working.pptx text-inventory.json`
4. Розставити слайди: `python scripts/rearrange.py template.pptx working.pptx 0,34,34,50`
5. Замінити текст: `python scripts/replace.py working.pptx replacement-text.json output.pptx`

**Редагування через OOXML:**
```bash
python ooxml/scripts/unpack.py file.pptx output_dir
# редагувати ppt/slides/slide{N}.xml
python ooxml/scripts/validate.py dir --original file.pptx
python ooxml/scripts/pack.py input_dir file.pptx
```

**Дизайн:** 18 вбудованих палітр кольорів, web-safe шрифти (Arial, Times New Roman, Courier New та ін.)

**Залежності:** markitdown, pptxgenjs (npm), playwright (npm), sharp (npm), LibreOffice, poppler-utils

---

### xlsx

Робота з Excel-таблицями (.xlsx, .xlsm, .csv).

**Бібліотеки:**
- **pandas** — аналіз даних, bulk-операції
- **openpyxl** — формули, форматування, Excel-специфічні фічі

**Критичне правило:** Завжди використовуйте Excel-формули, а не хардкод значень з Python.

```python
# ❌ Неправильно: total = df['Sales'].sum(); sheet['B10'] = total
# ✅ Правильно: sheet['B10'] = '=SUM(B2:B9)'
```

**Стандарти кольорів (фінмоделі):**
- **Синій** (0,0,255) — hardcoded inputs
- **Чорний** (0,0,0) — формули
- **Зелений** (0,128,0) — посилання на інші листи
- **Червоний** (255,0,0) — зовнішні посилання
- **Жовтий фон** — ключові припущення

**Перерахунок формул:**
```bash
python recalc.py output.xlsx
# Повертає JSON з помилками (#REF!, #DIV/0!, #VALUE! тощо)
```

**Вимоги:** ZERO formula errors, LibreOffice для recalc

---

## Development & Code Tools

### artifacts-builder

Створення складних HTML-артефактів з React + TypeScript + Tailwind CSS + shadcn/ui.

**Workflow:**
```bash
# 1. Ініціалізація
bash scripts/init-artifact.sh project-name
cd project-name

# 2. Розробка (редагувати згенеровані файли)

# 3. Бандлінг в єдиний HTML
bash scripts/bundle-artifact.sh  # створює bundle.html

# 4. Показати артефакт користувачу
```

**Stack:** React 18 + TypeScript + Vite + Parcel + Tailwind CSS 3.4.1 + shadcn/ui (40+ компонентів)

**Дизайн:** уникати центрованих layout'ів, purple градієнтів, Inter шрифту ("AI slop")

---

### changelog-generator

Автоматичне створення changelog з git-комітів.

**Можливості:**
- Сканує git-історію за період або між версіями
- Категоризує зміни (features, improvements, bug fixes, breaking changes, security)
- Перекладає технічні коміти в зрозумілу мову
- Фільтрує внутрішні коміти (refactoring, tests)

**Приклад використання:**
```
Create a changelog from commits since last release
Generate changelog for all commits from the past week
Create release notes for version 2.5.0
```

---

### code-security-auditor

Аудит безпеки коду перед виконанням.

**Що аналізує:**
- **Dependencies:** відомі malicious пакунки, typosquatting, install-time скрипти
- **Scripts:** `exec`, `spawn`, `eval()`, `base64`, `os.system()`, curl|sh
- **File System:** запис поза project directory, доступ до `~/.ssh`, `~/.aws`, `/etc`
- **Network:** хардкоджені IP, data exfiltration endpoints, C2
- **Obfuscation:** мініфікація, anti-debugging, динамічні import

**Формат звіту:**
- 🔴 Critical Risks — з evidence (файл, рядок, код)
- 🟠 Suspicious Findings
- 🟡 Low Risk / Observations
- 🔍 Manual Review Checklist
- 🚨 Indicators of Malicious Intent
- 🧾 Final Verdict: SAFE / SAFE WITH SANDBOX / HIGH RISK

---

### mcp-builder

Створення MCP (Model Context Protocol) серверів для інтеграції API.

**Фази:**
1. **Research & Planning** — дизайн для агентів (workflow > endpoints, context optimization, actionable errors)
2. **Implementation** — Python (FastMCP) або Node/TypeScript (MCP SDK)
3. **Review & Refine** — DRY, composability, type safety
4. **Evaluations** — 10 QA-пар для тестування

**Принципи дизайну:**
- Build for Workflows, Not Just API Endpoints (напр. `schedule_event` замість окремих `check_availability` + `create_event`)
- Optimize for Limited Context — concise vs detailed формати
- Actionable Error Messages — "Try using filter='active_only'"

**Документація:** завантажується через WebFetch з modelcontextprotocol.io

---

### skill-creator

Створення нових скілів для OpenCode.

**Анатомія скілу:**
```
skill-name/
├── SKILL.md              # YAML frontmatter + інструкції
├── scripts/              # Python/Bash скрипти
├── references/           # документація для контексту
└── assets/              # шаблони, іконки, файли
```

**Процес створення:**
1. Зрозуміти concrete examples використання
2. Спланувати reusable ресурси (scripts, references, assets)
3. Ініціалізувати: `scripts/init_skill.py <name> --path <dir>`
4. Відредагувати SKILL.md (imperative form, без "you")
5. Запакувати: `scripts/package_skill.py <path>`

---

### skill-share

Створення скілів + автоматичний шеринг у Slack через Rube.

**Workflow:** Create → Validate → Package → Slack Notification

**Інтеграція з Rube:** SLACK_SEND_MESSAGE, SLACK_POST_MESSAGE_WITH_BLOCKS, SLACK_FIND_CHANNELS

---

### staff-engineer-review

Глибоке рев'ю коду на рівні Staff+ інженера.

**Що оцінює:**
1. **Plan vs Implementation** — чи збігається реалізація з планом
2. **Architecture** — separation of concerns, coupling, SOLID/DRY
3. **Code Quality** — readability, complexity, edge cases, error handling
4. **Correctness & Risk** — logical errors, race conditions, security
5. **Performance** — N+1 queries, memory, caching
6. **Test Coverage** — unit, integration, edge cases

**Формат висновку:**
- Alignment Score (0–100%) + Overall Quality + Risk Level
- Critical Issues з suggested fix
- Improvement Opportunities (Architecture / Code Quality / Performance / Tests)

---

### webapp-testing

Тестування локальних вебзастосунків через Playwright.

**Decision Tree:**
- **Static HTML** → читати HTML напряму → написати Playwright скрипт
- **Dynamic app, server не запущено** → `python scripts/with_server.py --help`
- **Dynamic app, server запущено** → Reconnaissance-then-action

**Приклад:**
```python
python scripts/with_server.py --server "npm run dev" --port 5173 -- python test.py
```

```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')
    # actions...
    browser.close()
```

**Best Practice:** Використовувати bundled scripts як чорні скриньки (спочатку `--help`, не читати source).

---

## Business & Marketing

### brand-guidelines

Застосування фірмових кольорів та типографії OpenCode до артефактів.

**Кольори (Nord/dark теми):**
- Dark: `#1a1b26` / `#1e1e2e`
- Light: `#eceff4` / `#d8dee9`
- Accent Blue: `#81a1c1` / `#88c0d0`
- Accent Green: `#a3be8c` / `#8fbcbb`

**Типографія:**
- Headings/Code: JetBrains Mono, Fira Code
- Body: System sans-serif (Inter, San Francisco)

---

### competitive-ads-extractor

Витягування та аналіз реклами конкурентів з Facebook Ad Library, LinkedIn тощо.

**Що аналізує:**
- Messaging — problems, use cases, value props
- Creative Patterns — visual styles, colors, layouts
- Copy Formulas — headlines, CTAs, tone
- Audience Targeting — segmentation insights

**Workflow:**
1. Extract ads from competitor on Facebook/LinkedIn
2. Capture screenshots
3. Analyze messaging patterns
4. Identify successful approaches
5. Generate recommendations

---

### domain-name-brainstormer

Генерація ідей для доменних імен з перевіркою доступності.

**TLD Guide:** .com (universal), .io (tech startups), .dev (developer tools), .ai (AI/ML), .app (applications), .co (альтернатива .com)

**Правила хорошого домену:** короткий (<15 символів), зрозумілий, вимовний, без дефісів, брендований

**Ціни:** standard ~$10-15/рік, premium TLDs (.io, .ai) ~$30-50/рік

---

### internal-comms

Написання внутрішніх комунікацій за корпоративними шаблонами.

**Типи:**
- **3P Updates** — Progress, Plans, Problems
- **Company Newsletter** — корпоративна розсилка
- **FAQ Answers** — відповіді на часті питання
- **General Comms** — все інше

Шаблони знаходяться в `examples/` всередині скілу.

---

### lead-research-assistant

Дослідження та кваліфікація потенційних лідів.

**Процес:**
1. Проаналізувати продукт/код
2. Визначити ICP (Ideal Customer Profile)
3. Дослідити компанії (індустрія, розмір, tech stack, гранти)
4. Присвоїти fit score (1-10)
5. Strategy outreach: кому писати, що казати

---

## Communication & Writing

### content-research-writer

Асистент для написання контенту з дослідженням, цитуванням, рев'ю.

**Workflow:**
1. Collaborative outlining — структурувати ідеї
2. Research — пошук даних і джерел
3. Hook improvement — посилення вступу
4. Section feedback — рев'ю кожної секції
5. Citation management — оформлення посилань
6. Final review — комплексна перевірка

**Формати цитування:** inline, numbered, footnotes

**Рекомендована структура проекту:**
```
writing/article-name/
├── outline.md
├── research.md
├── draft-v1.md
├── draft-v2.md
├── final.md
└── sources/
```

---

### meeting-insights-analyzer

Аналіз транскриптів зустрічей для виявлення поведінкових патернів.

**Що аналізує:**
- **Conflict Avoidance** — hedging language, indirect phrasing
- **Speaking Ratios** — хто скільки говорить, перебивання
- **Filler Words** — "um", "like", "you know", "actually"
- **Active Listening** — paraphrasing, building on ideas
- **Leadership/Facilitation** — decision-making, inclusion, time management

**Джерела транскриптів:** Granola, Zoom (VTT/SRT), Google Meet, Fireflies.ai, Otter.ai

---

## Creative & Media

### canvas-design

Створення візуальних арт-робіт у PNG/PDF на основі дизайн-філософії.

**Двоступеневий процес:**
1. **Design Philosophy Creation** (`.md`) — створити естетичний рух/маніфест
   - Назвати рух (1-2 слова): "Brutalist Joy", "Chromatic Silence"
   - Articulate philosophy (4-6 параграфів)
   - Наголосити на craftsmanship, expert-level execution
2. **Canvas Expression** (`.pdf`/`.png`) — візуалізувати філософію
   - Мінімум тексту, максимум дизайну
   - Limited color palette
   - "Museum quality" execution

---

### image-enhancer

Покращення якості зображень та скріншотів.

**Інструменти:** Python Pillow (PIL), OpenCV (cv2)

**Операції:** upscale, sharpen, reduce artifacts, denoise, color correct

**Приклад:**
```
Improve the image quality of screenshot.png
Upscale this image to 4K resolution
Sharpen this blurry screenshot
```

---

### slack-gif-creator

Створення анімованих GIF для Slack.

**Вимоги Slack:**
- **Message GIFs:** max ~2MB, 480×480, 15-20 FPS, 128-256 кольорів, 2-5s
- **Emoji GIFs:** max 64KB (!), 128×128, 10-12 FPS, 32-48 кольорів, 1-2s

**Примітиви анімації:**
- Shake, Bounce, Spin/Rotate, Pulse/Heartbeat, Fade, Zoom
- Explode/Shatter, Wiggle/Jiggle, Slide, Flip, Morph, Move, Kaleidoscope

**Залежності:** `pip install pillow imageio numpy`

---

### theme-factory

Застосування професійних тем (кольори + шрифти) до артефактів.

**10 вбудованих тем:**
1. Ocean Depths — professional maritime
2. Sunset Boulevard — warm vibrant
3. Forest Canopy — natural earth tones
4. Modern Minimalist — clean grayscale
5. Golden Hour — rich autumnal
6. Arctic Frost — cool crisp
7. Desert Rose — soft dusty
8. Tech Innovation — bold modern
9. Botanical Garden — fresh organic
10. Midnight Galaxy — dramatic cosmic

Кожна тема визначена у `themes/` з hex-кодами та font pairing.

---

### video-downloader

Завантаження відео з YouTube та інших платформ.

**Інструменти:** yt-dlp, FFmpeg

**Формати:** MP4, WebM, audio-only (MP3)

**Приклад:**
```
Download this YouTube video: https://youtube.com/watch?v=abc123
Download this video in 1080p quality
Download all videos from this YouTube playlist
```

**Увага:** Only download with permission, respect copyright

---

## Productivity & Organization

### file-organizer

Інтелектуальне сортування файлів та папок.

**Операції:**
- Analyze structure (file types, sizes, dates)
- Find duplicates (by hash, name, size)
- Propose organization plan
- Execute cleanup (move, rename, archive)
- Generate summary

**Принципи:**
- Confirm before delete
- Log all moves for potential undo
- Preserve original modification dates

---

### invoice-organizer

Автоматична організація інвойсів для податків.

**Процес:**
1. Scan folder — знайти всі PDF, JPG, PNG
2. Extract info — vendor, invoice #, date, amount
3. Rename — `YYYY-MM-DD Vendor - Invoice - Product.pdf`
4. Organize — by vendor, category, date, or tax category
5. Generate CSV — для бухгалтерії

---

### raffle-winner-picker

Випадковий вибір переможців для розіграшів.

**Джерела:** CSV, Excel, Google Sheets, plain list

**Функції:**
- Multiple winners (без дублікатів)
- Weighted selection
- Runner-ups
- Exclusion list
- Cryptographic randomness

---

## Security & Systems

### code-security-auditor

(описано в [Development](#development--code-tools))

### factual-accuracy

Забезпечення фактичної точності та верифікації джерел.

**Правила:**
- Кожне твердження має бути підкріплене реальним джерелом
- Формат цитування: `Claim. (Source: [Title](URL), Author/Org, Year)`
- Позначати невпевненість: "I cannot confirm this"
- Якщо джерело недоступне — відмовитись відповідати

**Pre-Response Checklist:**
1. Чи кожне твердження простежується до джерела?
2. Чи кожне джерело явно назване з посиланням?
3. Чи всі числа пояснені?
4. Чи позначена невпевненість?
5. Чи може користувач незалежно верифікувати?

---

## Інші

### developer-growth-analysis

Аналіз патернів коду з OpenCode-чатів для виявлення зон зростання.

**Процес:**
1. Читає `~/.claude/history.jsonl` за останні 24-48h
2. Аналізує проекти, технології, типи проблем
3. Визначає 3-5 зон для покращення
4. Шукає learning resources на HackerNews
5. Відправляє звіт у Slack DMs через Rube

---

### template-skill

Базовий шаблон для створення нових скілів. Містить мінімальну структуру SKILL.md з placeholder-описом.

---

## Як створити власний скіл

```bash
# Використайте скіл skill-creator
# Use the skill-creator skill for this task
```

Або вручну:

```bash
mkdir -p ~/.config/opencode/skills/my-skill
# створити SKILL.md з YAML frontmatter
```

**Мінімальний SKILL.md:**
```markdown
---
name: my-skill-name
description: Короткий опис, коли OpenCode має використовувати цей скіл
---

# My Skill

## Коли використовувати

- Ситуація 1
- Ситуація 2

## Інструкції

[Детальні інструкції для OpenCode]

## Приклади

[Приклади використання]
```

**Для видалення скілу:**
```bash
rm -rf ~/.config/opencode/skills/<skill-name>
```

---

*Джерело: [awesome-opencode-skills](https://github.com/TheArchitectit/awesome-opencode-skills)*
*Оновлено: 2026-05-15*
