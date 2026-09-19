"""
Open SPSS Web - Python Statistical Engine & API Gateway
Provides server-side heavy computation, SPSS .sav parsing, and statsmodels/scikit-learn processing.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import io
import json

app = FastAPI(
    title="Open SPSS Web API",
    version="1.0.0",
    description="Statistical Engine backend matching IBM SPSS Statistics capabilities"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Open SPSS Web Statistical Engine",
        "version": "1.0.0"
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
                g1_data = pd.to_numeric(df[df[g_var] == g1_val][var], errors="coerce").dropna()
                g2_data = pd.to_numeric(df[df[g_var] == g2_val][var], errors="coerce").dropna()

                # Levene test
                levene_stat, levene_p = stats.levene(g1_data, g2_data)

                # Student t-test (equal var)
                t_equal, p_equal = stats.ttest_ind(g1_data, g2_data, equal_var=True)

                # Welch t-test (unequal var)
                t_unequal, p_unequal = stats.ttest_ind(g1_data, g2_data, equal_var=False)

                results.append({
                    "variable": var,
                    "group1": {"n": len(g1_data), "mean": float(g1_data.mean()), "std": float(g1_data.std())},
                    "group2": {"n": len(g2_data), "mean": float(g2_data.mean()), "std": float(g2_data.std())},
                    "levene": {"f": float(levene_stat), "p": float(levene_p)},
                    "equal_var": {"t": float(t_equal), "p": float(p_equal), "df": len(g1_data) + len(g2_data) - 2},
                    "unequal_var": {"t": float(t_unequal), "p": float(p_unequal)}
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
        for param_name in model.params.index:
            coefs.append({
                "name": param_name,
                "coef": float(model.params[param_name]),
                "std_err": float(model.bse[param_name]),
                "t": float(model.tvalues[param_name]),
                "p": float(model.pvalues[param_name]),
                "ci_lower": float(model.conf_int().loc[param_name, 0]),
                "ci_upper": float(model.conf_int().loc[param_name, 1])
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

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
