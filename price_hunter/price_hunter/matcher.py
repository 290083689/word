import re
from typing import List, Dict, Tuple
from .models import Product


class ProductMatcher:
    BRAND_KEYWORDS = {
        "apple": ["apple", "iphone", "ipad", "macbook", "airpods", "苹果"],
        "huawei": ["huawei", "华为", "mate", "pura", "freebuds", "matebook"],
        "xiaomi": ["xiaomi", "小米", "redmi", "红米", "buds"],
        "oppo": ["oppo", "find", "reno"],
        "vivo": ["vivo", "iqoo", "x100", "x200", "蔡司"],
        "samsung": ["samsung", "三星", "galaxy"],
        "honor": ["honor", "荣耀", "magic"],
        "oneplus": ["oneplus", "一加"],
        "sony": ["sony", "索尼", "wh-1000xm", "xm5", "xm4"],
        "bose": ["bose", "quietcomfort"],
        "sennheiser": ["sennheiser", "森海塞尔", "momentum"],
        "jbl": ["jbl"],
        "lenovo": ["lenovo", "联想", "thinkpad", "小新"],
        "dell": ["dell", "戴尔", "xps"],
        "asus": ["asus", "华硕", "rog"],
        "hp": ["hp", "惠普", "暗影精灵"],
        "realme": ["realme"],
        "meizu": ["meizu", "魅族"],
        "motorola": ["motorola", "摩托罗拉", "moto"],
        "nubia": ["nubia", "努比亚"],
        "zte": ["zte", "中兴", "axon"],
        "edifier": ["edifier", "漫步者", "neobuds"],
    }

    MODEL_PATTERNS = [
        r"(?:iphone|iPhone)\s*(\d+)\s*(?:pro\s*max|pro|plus|mini|max)?",
        r"(?:mate|Mate)\s*(\d+)\s*(?:pro\s*\+|pro|x|rs)?",
        r"(?:小米|Redmi|redmi)\s*(\d+)\s*(?:ultra|pro|note|a|se)?",
        r"(?:Find|find)\s*[xX](\d+)\s*(?:ultra|pro)?",
        r"[xX](\d+)\s*(?:pro|ultra)?",
        r"(?:Galaxy|galaxy)\s*[sS](\d+)\s*(?:ultra|plus|fe)?",
        r"(?:Magic|magic)\s*(\d+)\s*(?:pro|至臻版)?",
        r"(?:一加|OnePlus|oneplus)\s*(\d+)\s*(?:pro)?",
        r"(?:WH-?1000XM|wh-?1000xm)(\d+)",
        r"(?:FreeBuds|freebuds)\s*(?:pro|studio|lipstick)?\s*(\d+)?",
        r"(?:AirPods|airpods)\s*(?:pro|max)?\s*(\d+)?",
        r"(?:Momentum|momentum)\s*(\d+)",
        r"(?:NeoBuds|neobuds)\s*(?:pro)?\s*(\d+)?",
        r"(?:ThinkPad|thinkpad)\s*[xX](\d)",
        r"(?:MateBook|matebook)\s*[xX]\s*(?:pro)?",
        r"(?:MacBook|macbook)\s*(?:pro|air)?",
        r"(?:XPS|xps)\s*(\d+)",
        r"(?:ROG|rog)\s*(?:幻|strix)?\s*(\d+)?",
        r"(?:暗影精灵)\s*(\d+)\s*(?:pro)?",
        r"(?:小新)\s*(?:pro)?\s*(\d+)",
        r"(?:RedmiBook|redmibook)\s*(?:pro)?\s*(\d+)",
        r"(?:GT)\s*(\d+)\s*(?:pro|neo)?",
        r"(?:K)(\d+)\s*(?:pro|ultra|e)?",
        r"(?:edge)\s*[xX](\d+)",
        r"(?:Pura|pura)\s*(\d+)\s*(?:ultra|pro)?",
        r"(?:nova|Nova)\s*(\d+)\s*(?:pro|ultra)?",
        r"(?:Civi|civi)\s*(\d+)\s*(?:pro)?",
        r"(?:Z)\s*(?:Fold|fold)(\d+)",
        r"(?:Z)\s*(?:Flip|flip)(\d+)",
    ]

    SPEC_KEYWORDS = [
        "256gb", "512gb", "1tb", "128gb", "16gb", "8gb", "12gb",
        "pro max", "pro", "ultra", "plus", "mini", "se",
        "gen11", "gen12", "2024", "2023", "m3", "m3 pro", "m3 max",
        "m4", "m4 pro", "m4 max",
    ]

    STRIP_PREFIXES = [
        "京东自营", "京东", "百亿补贴", "正品保证", "全网最低", "限时特惠",
        "爆款直降", "万人团", "国行正品", "官方直营", "假一赔十", "品质好货",
        "超值推荐", "限时秒杀", "精选好物", "包邮到家", "正品保障",
    ]

    @classmethod
    def extract_brand(cls, name: str) -> str:
        name_lower = name.lower()
        for brand, keywords in cls.BRAND_KEYWORDS.items():
            for kw in keywords:
                if kw in name_lower:
                    return brand
        return ""

    @classmethod
    def _normalize_model(cls, model: str) -> str:
        m = re.sub(r"pro\s*max", "pro max", model, flags=re.IGNORECASE)
        m = re.sub(r"promax", "pro max", m, flags=re.IGNORECASE)
        m = re.sub(r"pro\s*\+", "pro+", m, flags=re.IGNORECASE)
        m = re.sub(r"\s+", " ", m).strip()
        return m.lower()

    @classmethod
    def extract_model(cls, name: str) -> str:
        name_clean = re.sub(r"[()（）\[\]【】]", " ", name)
        models = []
        for pattern in cls.MODEL_PATTERNS:
            match = re.search(pattern, name_clean, re.IGNORECASE)
            if match:
                raw = match.group(0).strip()
                models.append(cls._normalize_model(raw))

        for spec in cls.SPEC_KEYWORDS:
            if spec in name.lower():
                models.append(spec)

        return " ".join(models)

    @classmethod
    def generate_product_key(cls, product: Product) -> str:
        brand = cls.extract_brand(product.name)
        model = cls.extract_model(product.name)
        if brand and model:
            normalized = model.lower().replace(" ", "_")
            return f"{brand}__{normalized}"
        elif brand:
            return f"{brand}__{product.name[:20].lower().replace(' ', '_')}"
        else:
            return f"unknown__{product.name[:20].lower().replace(' ', '_')}"

    @classmethod
    def group_products(cls, products: List[Product]) -> List[Dict]:
        groups: Dict[str, List[Product]] = {}
        group_labels: Dict[str, str] = {}

        for p in products:
            key = cls.generate_product_key(p)
            if key not in groups:
                groups[key] = []
                group_labels[key] = cls._generate_label(p)
            groups[key].append(p)

        result = []
        for key, group_products in groups.items():
            sorted_group = sorted(group_products, key=lambda p: p.price)
            prices = [p.price for p in sorted_group]
            min_price = min(prices)
            max_price = max(prices)
            savings = max_price - min_price if len(prices) > 1 else 0

            platforms = set(p.platform for p in sorted_group)
            best = sorted_group[0]

            result.append({
                "group_key": key,
                "label": group_labels[key],
                "brand": cls.extract_brand(sorted_group[0].name),
                "products": [p.to_dict() for p in sorted_group],
                "platform_count": len(platforms),
                "platforms": list(platforms),
                "min_price": round(min_price, 2),
                "max_price": round(max_price, 2),
                "avg_price": round(sum(prices) / len(prices), 2),
                "savings": round(savings, 2),
                "best_platform": best.platform,
                "best_price": round(best.price, 2),
                "best_shop": best.shop_name,
                "best_url": best.url,
                "best_discount": best.discount or "",
                "product_count": len(sorted_group),
            })

        result.sort(key=lambda g: (g["platform_count"], -g["savings"]), reverse=True)
        return result

    @classmethod
    def _generate_label(cls, product: Product) -> str:
        brand = cls.extract_brand(product.name)
        name = product.name
        for prefix in cls.STRIP_PREFIXES:
            name = name.replace(prefix, "").strip()
        if brand:
            brand_cn = cls.BRAND_KEYWORDS.get(brand, [brand])
            for kw in brand_cn:
                name = name.replace(kw, "").strip()
                name = name.replace(kw.title(), "").strip()
                name = name.replace(kw.upper(), "").strip()
        name = re.sub(r"\s+", " ", name).strip()
        return name if name else product.name

    @classmethod
    def get_suggestions(cls, keyword: str, limit: int = 8) -> List[Dict]:
        from .scrapers import JdScraper, TaobaoScraper, PddScraper

        scrapers = [JdScraper(), TaobaoScraper(), PddScraper()]
        all_products: List[Product] = []
        for scraper in scrapers:
            all_products.extend(scraper.search(keyword))

        groups = cls.group_products(all_products)

        suggestions = []
        seen_labels = set()
        for g in groups:
            label = g["label"]
            if label in seen_labels:
                continue
            seen_labels.add(label)
            suggestions.append({
                "label": label,
                "brand": g["brand"],
                "min_price": g["min_price"],
                "max_price": g["max_price"],
                "platform_count": g["platform_count"],
                "savings": g["savings"],
                "group_key": g["group_key"],
            })
            if len(suggestions) >= limit:
                break

        return suggestions
