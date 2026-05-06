from dataclasses import dataclass, field, asdict
from typing import Optional
from datetime import datetime


@dataclass
class Product:
    name: str
    price: float
    sales: int
    shop_name: str
    shop_rating: float
    platform: str
    url: str
    keyword: str = ""
    image_url: str = ""
    original_price: Optional[float] = None
    discount: Optional[str] = None
    collected_at: str = field(default_factory=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    price_score: float = 0.0
    sales_score: float = 0.0
    rating_score: float = 0.0
    value_score: float = 0.0
    recommended: bool = False
    recommend_reason: str = ""

    def to_dict(self) -> dict:
        d = asdict(self)
        d["price"] = round(d["price"], 2)
        if d.get("original_price"):
            d["original_price"] = round(d["original_price"], 2)
        d["price_score"] = round(d["price_score"], 2)
        d["sales_score"] = round(d["sales_score"], 2)
        d["rating_score"] = round(d["rating_score"], 2)
        d["value_score"] = round(d["value_score"], 2)
        return d
