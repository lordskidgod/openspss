"""
Open SPSS Web - Vercel Serverless Python API
FastAPI app exposed as a Vercel Python Serverless Function via api/index.py
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI(
    title="Open SPSS Web API",
    version="1.0.0",
    description="Statistical Engine backend for Open SPSS Web"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request Models ──────────────────────────────────────────────────────────

class AnalysisRequest(BaseModel):
    variables: List[str]
    options: Optional[Dict[str, Any]] = None
    data: List[Dict[str, Any]]

class RegressionRequest(BaseModel):
    dependent: str
    independents: List[str]
    data: List[Dict[str, Any]]

class TTestRequest(BaseModel):
    test_variables: List[str]
    group_variable: str
    group_values: List[Any]
    data: List[Dict[str, Any]]

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Open SPSS Web Statistical Engine",
        "version": "1.0.0",
        "runtime": "vercel-python"
    }

@app.post("/api/analyze/descriptives")
def compute_descriptives(req: AnalysisRequest):
    try:
        import pandas as pd
        import numpy as np

        df = pd.DataFrame(req.data)
        results = []
        for var in req.variables:
            if var in df.columns:
                series = pd.to_numeric(df[var], errors="coerce").dropna()
                results.append({
                    "variable": var,
                    "n": int(series.count()),
                    "mean": float(series.mean()),
                    "std_dev": float(series.std(ddof=1)),
                    "variance": float(series.var(ddof=1)),
                    "min": float(series.min()),
                    "max": float(series.max()),
                    "std_error": float(series.sem())
                })
        return {"status": "success", "procedure": "Descriptives", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/ttest/independent")
def compute_independent_ttest(req: TTestRequest):
    try:
        import pandas as pd
        from scipy import stats

        df = pd.DataFrame(req.data)
        g_var = req.group_variable
        g1_val, g2_val = req.group_values[0], req.group_values[1]

        results = []
        for var in req.test_variables:
            if var in df.columns:
                g1 = pd.to_numeric(df[df[g_var] == g1_val][var], errors="coerce").dropna()
                g2 = pd.to_numeric(df[df[g_var] == g2_val][var], errors="coerce").dropna()

                levene_stat, levene_p = stats.levene(g1, g2)
                t_eq, p_eq = stats.ttest_ind(g1, g2, equal_var=True)
                t_uneq, p_uneq = stats.ttest_ind(g1, g2, equal_var=False)

                results.append({
                    "variable": var,
                    "group1": {"n": len(g1), "mean": float(g1.mean()), "std": float(g1.std())},
                    "group2": {"n": len(g2), "mean": float(g2.mean()), "std": float(g2.std())},
                    "levene": {"f": float(levene_stat), "p": float(levene_p)},
                    "equal_var": {"t": float(t_eq), "p": float(p_eq), "df": len(g1) + len(g2) - 2},
                    "unequal_var": {"t": float(t_uneq), "p": float(p_uneq)}
                })
        return {"status": "success", "procedure": "T-Test", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/regression/linear")
def compute_linear_regression(req: RegressionRequest):
    try:
        import pandas as pd
        import statsmodels.api as sm

        df = pd.DataFrame(req.data)
        cols = [req.dependent] + req.independents
        clean_df = df[cols].apply(pd.to_numeric, errors="coerce").dropna()

        y = clean_df[req.dependent]
        X = sm.add_constant(clean_df[req.independents])
        model = sm.OLS(y, X).fit()

        coefs = []
        for name in model.params.index:
            coefs.append({
                "name": name,
                "coef": float(model.params[name]),
                "std_err": float(model.bse[name]),
                "t": float(model.tvalues[name]),
                "p": float(model.pvalues[name]),
                "ci_lower": float(model.conf_int().loc[name, 0]),
                "ci_upper": float(model.conf_int().loc[name, 1])
            })

        return {
            "status": "success",
            "procedure": "Regression",
            "r": float(model.rsquared ** 0.5),
            "r_squared": float(model.rsquared),
            "adj_r_squared": float(model.rsquared_adj),
            "f_stat": float(model.fvalue),
            "f_pvalue": float(model.f_pvalue),
            "coefficients": coefs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
