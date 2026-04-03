"""
Global error handler utilities for CalmNote FastAPI app.

These handlers are registered in main.py via `app.add_exception_handler(...)`.
They ensure every error returns a consistent JSON envelope:

    { "success": false, "error": { "code": 422, "message": "..." } }

Adding a new handler:
    1. Define a handler function below (same signature as existing ones).
    2. Register it in main.py with app.add_exception_handler(ExcType, handler_fn).
"""
import logging
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

logger = logging.getLogger("calmnote")


# ─── Helpers ───────────────────────────────────────────────────────────────────

def _error_envelope(status_code: int, message: str) -> JSONResponse:
    """Return a standardised error response JSON."""
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "error": {
                "code": status_code,
                "message": message,
            },
        },
    )


# ─── Handlers ──────────────────────────────────────────────────────────────────

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Catch all HTTPException (404, 422, 400, etc.) raised inside route handlers.
    """
    logger.warning("HTTP %s — %s %s", exc.status_code, request.method, request.url)
    return _error_envelope(exc.status_code, str(exc.detail))


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Catch Pydantic validation errors from request body/query parsing.
    Formats the Pydantic error list into a single readable message.
    """
    errors = exc.errors()
    # Build a human-friendly message like: "emoji: field required"
    messages = [
        f"{' → '.join(str(loc) for loc in e['loc'])}: {e['msg']}"
        for e in errors
    ]
    detail = " | ".join(messages)
    logger.warning("Validation error on %s %s — %s", request.method, request.url, detail)
    return _error_envelope(422, detail)


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """
    Catch database-level errors (e.g. connection refused, constraint violations).
    The original error is logged server-side but NOT exposed to the client.
    """
    logger.error(
        "Database error on %s %s: %s",
        request.method,
        request.url,
        str(exc),
        exc_info=True,
    )
    return _error_envelope(
        503,
        "A database error occurred. Please try again or check the server logs.",
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Catch-all for any unhandled exception.
    Always returns 500 with a safe message — never leaks stack traces.
    """
    logger.error(
        "Unhandled exception on %s %s: %s",
        request.method,
        request.url,
        str(exc),
        exc_info=True,
    )
    return _error_envelope(500, "An unexpected error occurred. Please try again.")
