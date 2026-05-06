from abc import ABC, abstractmethod
from typing import List
from ..models import Product


class BaseScraper(ABC):
    platform_name: str = ""
    base_url: str = ""

    @abstractmethod
    def search(self, keyword: str, page: int = 1) -> List[Product]:
        raise NotImplementedError

    def build_search_url(self, keyword: str, page: int = 1) -> str:
        return f"{self.base_url}/search?keyword={keyword}&page={page}"

    @staticmethod
    def normalize_price(price_str: str) -> float:
        if not price_str:
            return 0.0
        cleaned = "".join(c for c in str(price_str) if c.isdigit() or c == ".")
        try:
            return float(cleaned)
        except ValueError:
            return 0.0

    @staticmethod
    def normalize_sales(sales_str: str) -> int:
        if not sales_str:
            return 0
        s = str(sales_str).strip()
        multiplier = 1
        if "万" in s:
            multiplier = 10000
            s = s.replace("万", "")
        if "w" in s.lower():
            multiplier = 10000
            s = s.lower().replace("w", "")
        if "+" in s:
            s = s.replace("+", "")
        cleaned = "".join(c for c in s if c.isdigit() or c == ".")
        try:
            return int(float(cleaned) * multiplier)
        except ValueError:
            return 0
