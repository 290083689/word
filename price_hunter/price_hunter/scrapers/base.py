import re
from abc import ABC, abstractmethod
from typing import List, Optional, Tuple
from ..models import Product


class BaseScraper(ABC):
    platform_name: str = ""
    base_url: str = ""

    KEYWORD_CATEGORY_MAP = {
        "手机": ["手机", "phone", "mobile", "智能手机"],
        "耳机": ["耳机", "earphone", "headphone", "earbuds", "头戴", "降噪"],
        "笔记本": ["笔记本", "laptop", "notebook", "电脑", "轻薄本", "游戏本"],
    }

    BRAND_CATEGORY_MAP = {
        "apple": "手机", "iphone": "手机", "ipad": "笔记本", "macbook": "笔记本", "airpods": "耳机",
        "华为": "手机", "huawei": "手机", "mate": "手机", "pura": "手机", "freebuds": "耳机", "matebook": "笔记本",
        "小米": "手机", "xiaomi": "手机", "redmi": "手机", "红米": "手机",
        "oppo": "手机", "find": "手机", "reno": "手机",
        "vivo": "手机", "iqoo": "手机",
        "三星": "手机", "samsung": "手机", "galaxy": "手机",
        "荣耀": "手机", "honor": "手机", "magic": "手机",
        "一加": "手机", "oneplus": "手机",
        "索尼": "耳机", "sony": "耳机", "wh-1000xm": "耳机", "xm5": "耳机",
        "bose": "耳机", "quietcomfort": "耳机",
        "森海塞尔": "耳机", "sennheiser": "耳机", "momentum": "耳机",
        "jbl": "耳机",
        "漫步者": "耳机", "edifier": "耳机", "neobuds": "耳机",
        "联想": "笔记本", "lenovo": "笔记本", "thinkpad": "笔记本", "小新": "笔记本",
        "戴尔": "笔记本", "dell": "笔记本", "xps": "笔记本",
        "华硕": "笔记本", "asus": "笔记本", "rog": "笔记本",
        "惠普": "笔记本", "暗影精灵": "笔记本",
        "realme": "手机",
        "魅族": "手机", "meizu": "手机",
    }

    SPEC_PATTERNS = {
        "storage": r"(\d+)\s*(?:gb|tb)",
        "ram": r"(\d+)\s*gb(?:\+|\s)",
        "gen": r"(?:gen|第)\s*(\d+)",
    }

    @abstractmethod
    def search(self, keyword: str, page: int = 1) -> List[Product]:
        raise NotImplementedError

    @classmethod
    def resolve_category(cls, keyword: str) -> Optional[str]:
        if not keyword:
            return None
        kw_lower = keyword.lower().strip()
        for category, keywords in cls.KEYWORD_CATEGORY_MAP.items():
            for kw in keywords:
                if kw in kw_lower:
                    return category
        for brand_kw, category in cls.BRAND_CATEGORY_MAP.items():
            if brand_kw in kw_lower:
                return category
        return None

    @classmethod
    def parse_search_keyword(cls, keyword: str) -> dict:
        info = {"raw": keyword, "brand": "", "model": "", "specs": [], "category": ""}
        kw_lower = keyword.lower().strip()

        for brand_kw, category in cls.BRAND_CATEGORY_MAP.items():
            if brand_kw in kw_lower:
                info["brand"] = brand_kw
                info["category"] = category
                break

        model_match = re.search(
            r"(?:iphone|ipad|galaxy\s*s|mate|redmi|小米|find\s*x|magic|oneplus|一加|k\d+|gt\d+)"
            r"[\s\-]*(\d+[\s\-]*(?:pro\s*max|pro|ultra|plus|mini|se|note|fe)?)",
            keyword, re.IGNORECASE
        )
        if model_match:
            info["model"] = model_match.group(0).strip()

        for spec_name, pattern in cls.SPEC_PATTERNS.items():
            matches = re.findall(pattern, keyword, re.IGNORECASE)
            for m in matches:
                info["specs"].append(f"{m}{'TB' if spec_name == 'storage' and int(m) >= 1 else 'GB'}")

        if not info["category"]:
            info["category"] = cls.resolve_category(keyword) or ""

        return info

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
