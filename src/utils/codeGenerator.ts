/**
 * Open SPSS Web - Multi-Language Code Generator
 * Generates equivalent reproducible code in SPSS Syntax, Python (pandas/scipy/statsmodels), and R.
 * Makes Open SPSS Web significantly more versatile and educational than legacy proprietary software.
 */

export interface CodeTranslations {
  spss: string;
  python: string;
  r: string;
}

export function generateCodeForProcedure(
  procedure: string,
  params: {
    variables?: string[];
    rowVar?: string;
    colVar?: string;
    groupVar?: string;
    depVar?: string;
    indepVars?: string[];
    vars?: string[];
    factors?: number;
    k?: number;
  }
): CodeTranslations {
  const vars = params.variables || params.vars || [];

  switch (procedure) {
    case 'Frequencies':
      return {
        spss: `FREQUENCIES VARIABLES=${vars.join(' ')}\n  /STATISTICS=STDDEV MEAN MINIMUM MAXIMUM\n  /BARCHART.`,
        python: `# Python (pandas & matplotlib)\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\n# Calculate frequency tables and summary\nfor col in [${vars.map(v => `'${v}'`).join(', ')}]:\n    print(f"=== Frequencies for {col} ===")\n    print(df[col].value_counts(dropna=False))\n    print(f"Mean: {df[col].mean():.2f}, Std: {df[col].std():.2f}\\n")\n    df[col].value_counts().plot(kind='bar', title=f'Frequency: {col}')\n    plt.show()`,
        r: `# R (base & ggplot2)\n# Frequency distribution and summary\nvars <- c(${vars.map(v => `"${v}"`).join(', ')})\nfor (v in vars) {\n  cat("=== Frequencies for", v, "===\\n")\n  print(table(df[[v]], useNA = "always"))\n  cat("Mean:", mean(df[[v]], na.rm = TRUE), "SD:", sd(df[[v]], na.rm = TRUE), "\\n\\n")\n  barplot(table(df[[v]]), main = paste("Frequency:", v), col = "steelblue")\n}`
      };

    case 'Descriptives':
      return {
        spss: `DESCRIPTIVES VARIABLES=${vars.join(' ')}\n  /STATISTICS=MEAN STDDEV VARIANCE MIN MAX SEMEAN.`,
        python: `# Python (pandas & scipy)\nimport pandas as pd\nfrom scipy import stats\n\n# Compute central tendency, dispersion & SEM\ncols = [${vars.map(v => `'${v}'`).join(', ')}]\ndesc = df[cols].describe().T\ndesc['variance'] = df[cols].var()\ndesc['sem'] = df[cols].sem()\nprint(desc[['count', 'mean', 'std', 'sem', 'variance', 'min', 'max']])`,
        r: `# R (psych package or base summary)\nlibrary(psych)\ncols <- c(${vars.map(v => `"${v}"`).join(', ')})\ndescribe(df[, cols], fast = FALSE)`
      };

    case 'Crosstabs':
      const rV = params.rowVar || 'ROW_VAR';
      const cV = params.colVar || 'COL_VAR';
      return {
        spss: `CROSSTABS\n  /TABLES=${rV} BY ${cV}\n  /STATISTICS=CHISQ\n  /CELLS=COUNT ROW TOTAL.`,
        python: `# Python (scipy.stats & pandas)\nimport pandas as pd\nfrom scipy.stats import chi2_contingency\n\n# Cross-tabulation with Pearson Chi-Square\nct = pd.crosstab(df['${rV}'], df['${cV}'], margins=True)\nchi2, p_val, dof, expected = chi2_contingency(pd.crosstab(df['${rV}'], df['${cV}']))\nprint("Cross-Tabulation:\\n", ct)\nprint(f"\\nChi-Square: {chi2:.4f}, df: {dof}, p-value: {p_val:.4e}")`,
        r: `# R (stats)\n# Contingency table with Chi-Square Test\nct <- table(df$${rV}, df$${cV})\nprint(ct)\nprint(prop.table(ct, 1) * 100) # Row percentages\nchisq.test(ct)`
      };

    case 'Independent-Samples T-Test':
      const depT = params.depVar || vars[0] || 'DEP_VAR';
      const grpT = params.groupVar || 'GROUP_VAR';
      return {
        spss: `T-TEST GROUPS=${grpT}(1 2)\n  /VARIABLES=${depT}\n  /CRITERIA=CI(.95).`,
        python: `# Python (scipy.stats)\nfrom scipy import stats\n\ngroups = df['${grpT}'].dropna().unique()[:2]\ng1 = df[df['${grpT}'] == groups[0]]['${depT}'].dropna()\ng2 = df[df['${grpT}'] == groups[1]]['${depT}'].dropna()\n\n# Levene's Test for Homogeneity of Variances\nlev_stat, lev_p = stats.levene(g1, g2)\n# Student's and Welch's T-Test\nt_stat, p_val = stats.ttest_ind(g1, g2, equal_var=(lev_p > 0.05))\nprint(f"Levene F={lev_stat:.3f} (p={lev_p:.4f})")\nprint(f"T-statistic: {t_stat:.4f}, p-value: {p_val:.4e}")`,
        r: `# R (stats & car)\nlibrary(car)\n# Levene's test for equality of variances\nleveneTest(${depT} ~ as.factor(${grpT}), data = df)\n# Independent Samples T-Test (Welch / Student)\nt.test(${depT} ~ ${grpT}, data = df, var.equal = FALSE)`
      };

    case 'One-Way ANOVA':
      const depA = params.depVar || vars[0] || 'DEP_VAR';
      const grpA = params.groupVar || 'FACTOR_VAR';
      return {
        spss: `ONEWAY ${depA} BY ${grpA}\n  /STATISTICS DESCRIPTIVES HOMOGENEITY\n  /POSTHOC=TUKEY ALPHA(0.05).`,
        python: `# Python (statsmodels & scipy)\nimport statsmodels.api as sm\nfrom statsmodels.formula.api import ols\nfrom statsmodels.stats.multicomp import pairwise_tukeyhsd\n\n# Fit ANOVA model\nmodel = ols('${depA} ~ C(${grpA})', data=df).fit()\nanova_table = sm.stats.anova_lm(model, typ=2)\nprint(anova_table)\n\n# Tukey HSD Post-Hoc Test\ntukey = pairwise_tukeyhsd(df['${depA}'], df['${grpA}'], alpha=0.05)\nprint(tukey)`,
        r: `# R (stats & multcomp)\n# One-Way ANOVA with Tukey Post-Hoc\nmodel <- aov(${depA} ~ as.factor(${grpA}), data = df)\nsummary(model)\nTukeyHSD(model)`
      };

    case 'Bivariate Correlations':
      return {
        spss: `CORRELATIONS\n  /VARIABLES=${vars.join(' ')}\n  /PRINT=TWOTAIL NOSIG.`,
        python: `# Python (pandas & scipy.stats)\nimport pandas as pd\nfrom scipy.stats import pearsonr\n\ncols = [${vars.map(v => `'${v}'`).join(', ')}]\ncorr_matrix = df[cols].corr(method='pearson')\nprint("Pearson Correlation Matrix:\\n", corr_matrix)`,
        r: `# R (stats & Hmisc)\nlibrary(Hmisc)\ncols <- c(${vars.map(v => `"${v}"`).join(', ')})\nrcorr(as.matrix(df[, cols]), type = "pearson")`
      };

    case 'Linear Regression':
      const depR = params.depVar || 'DEP_VAR';
      const indR = params.indepVars || ['INDEP_1', 'INDEP_2'];
      return {
        spss: `REGRESSION\n  /MISSING LISTWISE\n  /STATISTICS COEFF OUTS R ANOVA\n  /DEPENDENT ${depR}\n  /METHOD=ENTER ${indR.join(' ')}.`,
        python: `# Python (statsmodels)\nimport statsmodels.api as sm\n\nX = sm.add_constant(df[[${indR.map(v => `'${v}'`).join(', ')}]])\ny = df['${depR}']\nmodel = sm.OLS(y, X, missing='drop').fit()\nprint(model.summary())`,
        r: `# R (stats)\n# Multiple Linear Regression\nmodel <- lm(${depR} ~ ${indR.join(' + ')}, data = df)\nsummary(model)\nconfint(model)`
      };

    case 'Reliability Analysis':
      return {
        spss: `RELIABILITY\n  /VARIABLES=${vars.join(' ')}\n  /SCALE('ALL VARIABLES') ALL\n  /MODEL=ALPHA\n  /STATISTICS=DESCRIPTIVE SCALE CORR.`,
        python: `# Python (pingouin or custom Cronbach's Alpha)\nimport pingouin as pg\n\n# Compute Cronbach's Alpha\nalpha, ci = pg.cronbach_alpha(data=df[[${vars.map(v => `'${v}'`).join(', ')}]])\nprint(f"Cronbach's Alpha: {alpha:.4f}, 95% CI: {ci}")`,
        r: `# R (psych)\nlibrary(psych)\nalpha(df[, c(${vars.map(v => `"${v}"`).join(', ')})])`
      };

    case 'Factor Analysis / PCA':
      return {
        spss: `FACTOR\n  /VARIABLES ${vars.join(' ')}\n  /CRITERIA FACTORS(${params.factors || 2})\n  /EXTRACTION PC\n  /ROTATION VARIMAX.`,
        python: `# Python (scikit-learn & factor_analyzer)\nfrom sklearn.decomposition import PCA\nfrom sklearn.preprocessing import StandardScaler\n\nX = StandardScaler().fit_transform(df[[${vars.map(v => `'${v}'`).join(', ')}]].dropna())\npca = PCA(n_components=${params.factors || 2})\nloadings = pca.fit_transform(X)\nprint("Explained Variance Ratio:", pca.explained_variance_ratio_)`,
        r: `# R (stats)\nfactanal(na.omit(df[, c(${vars.map(v => `"${v}"`).join(', ')})]), factors = ${params.factors || 2}, rotation = "varimax")`
      };

    default:
      return {
        spss: `* Procedure: ${procedure}\n* Data Analysis Script.`,
        python: `# Python equivalent for ${procedure}\n# Data analysis with pandas\nprint(df.describe())`,
        r: `# R equivalent for ${procedure}\nsummary(df)`
      };
  }
}
