from dataclasses import dataclass, asdict
from typing import Any, Dict, Optional


@dataclass
class User:
    name: str
    email: str
    _id: Optional[str] = None
    role: str = "faculty"
    password_hash: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "User":
        return cls(
            _id=str(data.get("_id")) if data.get("_id") is not None else None,
            name=data.get("name", ""),
            email=data.get("email", ""),
            role=data.get("role", "faculty"),
            password_hash=data.get("password_hash"),
        )

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        if self._id is not None:
            res["_id"] = self._id
        return res
