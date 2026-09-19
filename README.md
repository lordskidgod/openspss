# Open SPSS Web

<p align="center">
  <img src="public/logo.png" width="100" height="100" alt="Open SPSS Web Logo" />
</p>

<p align="center">
  <b>A modern, high-performance, client-side browser statistical analysis suite and educational platform.</b><br/>
  <i>Hobby project created by JaNuK (<a href="https://github.com/lordskidgod">@lordskidgod</a>) for educational and research exploration.</i>
</p>

---

## 📖 What is Open SPSS Web?

**Open SPSS Web** is an independent, open-source, web-based statistical computation environment designed to provide instant exploratory data analysis, hypothesis testing, matrix decomposition, and APA 7th edition report generation directly inside the web browser.

It requires **no installation, no server backend, no Java runtime, and zero software licensing**. All calculations execute 100% locally on your machine using standard 64-bit IEEE 754 floating-point mathematical algorithms.

---

## ⚖️ Legal & Trademark Disclaimer

> **IMPORTANT NOTICE:**
> 
> 1. **Trademark Notice:** `IBM®` and `SPSS®` are registered trademarks of International Business Machines Corporation (IBM). 
> 2. **No Affiliation:** Open SPSS Web is an independent, clean-room educational hobby project created by **JaNuK (@lordskidgod)**. It is **NOT** affiliated with, endorsed by, sponsored by, or connected to IBM Corporation, SPSS Inc., or any of their subsidiaries.
> 3. **Nominative Fair Use:** Any references to standard statistical syntax, commands, or procedural terminology are used strictly under the doctrine of *Nominative Fair Use* for academic description, educational learning, and cross-platform script interoperability.
> 4. **Independent Mathematics:** All statistical engines, formulas, matrix operations (QR decomposition, Jacobi eigenvalue solver, OLS inversion, Varimax rotation, Levene's variance test), and user interfaces are original, clean-room implementations derived exclusively from public mathematical literature and open academic textbooks.

---

## 🚀 Why Open SPSS Web is Better

| Feature | Legacy Desktop SPSS | Open SPSS Web |
| :--- | :--- | :--- |
| **Startup Time** | 20–45 seconds (Heavy JVM) | **< 100ms (Instant)** |
| **Installation** | Multi-GB installer, Admin rights | **Zero install, runs in any browser** |
| **Data Privacy** | Telemetry / Cloud sync | **100% In-memory, zero data leaves machine** |
| **Multi-Language Code** | Proprietary syntax only | **Tri-Lingual: SPSS + Python + R in 1-click** |
| **Data Health & AI Diagnostic** | Multiple nested menus | **1-Click Smart Outlier & Normality Inspector** |
| **Output Export** | Proprietary `.spv` format | **APA 7th HTML, Word `.doc`, JSON, CSV, PDF** |
| **Theme & Modern UI** | Outdated legacy grey GUI | **Custom Theme Palette, Dark/Light Mode, Glassmorphism** |
| **Cost** | Expensive recurring license | **100% Free & Open Source for Education** |

---

## 🧪 Statistical Procedures Supported

1. **Frequencies & Univariate Statistics:**
   - Counts, Percentages, Valid/Cumulative %, Mean, Median, SD, Variance, Min/Max, Bar Charts & Histograms.
2. **Descriptives:**
   - Central tendency, dispersion, standard error of the mean (SE Mean).
3. **Crosstabs & Contingency Tables:**
   - 2-Way Crosstabs, Row/Column/Total %, Pearson Chi-Square ($\chi^2$), Likelihood Ratio, Fisher's Exact approximation.
4. **Independent-Samples T-Test:**
   - Levene’s Test for Equality of Variances, Student's $t$, Welch's $t$ (unequal variances), 95% Confidence Intervals.
5. **One-Way ANOVA:**
   - Between/Within Sum of Squares, $F$-statistic, $p$-value, Tukey HSD post-hoc comparisons.
6. **Bivariate Correlations:**
   - Pearson $r$, Spearman $\rho$, 2-tailed significance flags ($* p < .05$, $** p < .01$).
7. **Multiple Linear Regression:**
   - OLS matrix solver, $R$, $R^2$, Adjusted $R^2$, ANOVA model significance, Unstandardized $B$, Standard Error, Standardized $\beta$, $t$-tests, Collinearity tolerance.
8. **Factor Analysis & Principal Component Analysis (PCA):**
   - Correlation matrix eigen-decomposition, Scree plot eigenvalues, Varimax orthogonal rotation, component loading matrices.
9. **Reliability Analysis:**
   - Scale metrics, Cronbach's Alpha ($\alpha$), Item-Total statistics.
10. **K-Means Clustering:**
    - Iterative Euclidean centroid clustering, cluster membership assignment.
11. **Smart Data Health & Outlier Diagnostic:**
    - Automated missing data rate, IQR 1.5× fences, $|Z| > 3$ outlier flags, skewness/kurtosis normality warnings.

---

## 💻 Tech Stack & Architecture

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Vanilla CSS design tokens with Glassmorphism and Custom Theme Engine
- **Engine:** Pure client-side TypeScript numerical and matrix algebra engine (IEEE 754 standard)
- **Visuals:** SVG/Canvas-based interactive statistical charts
- **Exports:** Native Blob generators for Word `.doc`, APA 7th HTML, CSV, JSON

---

## 👨‍💻 Developer & Attribution

- **Creator / Developer:** JaNuK ([@lordskidgod](https://github.com/lordskidgod))
- **Purpose:** Personal hobby project for educational exploration and research demonstration.
- **GitHub Repository:** [https://github.com/lordskidgod](https://github.com/lordskidgod)
