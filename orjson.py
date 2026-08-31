"""
Pure-Python compatibility shim for orjson.
Provides fast json encoding/decoding without binary C-extension DLL requirements,
resolving Windows Application Control / AppLocker security policy blocks.
"""
import json
import datetime
import uuid
from typing import Any, Callable, Optional

OPT_INDENT_2 = 1
OPT_SORT_KEYS = 2
OPT_NON_STR_KEYS = 4
OPT_SERIALIZE_NUMPY = 8
OPT_SERIALIZE_DATACLASS = 16
OPT_SERIALIZE_UUID = 32
OPT_STRICT_INTEGER = 64
OPT_NAIVE_UTC = 128
OPT_OMIT_MICROSECONDS = 256
OPT_UTC_Z = 512

JSONDecodeError = json.JSONDecodeError
JSONEncodeError = TypeError


def _default_encoder(obj: Any):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    if isinstance(obj, uuid.UUID):
        return str(obj)
    if hasattr(obj, "dict") and callable(getattr(obj, "dict")):
        return obj.dict()
    if hasattr(obj, "model_dump") and callable(getattr(obj, "model_dump")):
        return obj.model_dump()
    if hasattr(obj, "__dict__"):
        return obj.__dict__
    raise TypeError(f"Type is not JSON serializable: {type(obj).__name__}")


def dumps(obj: Any, default: Optional[Callable[[Any], Any]] = None, option: Optional[int] = None) -> bytes:
    indent = 2 if option and (option & OPT_INDENT_2) else None
    sort_keys = bool(option and (option & OPT_SORT_KEYS))
    
    def custom_default(o):
        if default:
            try:
                return default(o)
            except Exception:
                pass
        return _default_encoder(o)
        
    s = json.dumps(obj, default=custom_default, indent=indent, sort_keys=sort_keys)
    return s.encode("utf-8")


def loads(b: Any) -> Any:
    if isinstance(b, (bytes, bytearray)):
        b = b.decode("utf-8")
    return json.loads(b)
