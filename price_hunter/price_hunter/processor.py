from typing import List
from .models import Product


class DataProcessor:
    def __init__(self, products: List[Product]):
        self.products = products

    def clean(self) -> "DataProcessor":
        cleaned = []
        for p in self.products:
            if p.price <= 0:
                continue
            if not p.name or len(p.name.strip()) < 2:
                continue
            p.name = p.name.strip()
            p.shop_name = p.shop_name.strip()
            cleaned.append(p)
        self.products = cleaned
        return self

    def deduplicate(self) -> "DataProcessor":
        seen = set()
        unique = []
        for p in self.products:
            key = (p.platform, p.name, round(p.price, 2))
            if key not in seen:
                seen.add(key)
                unique.append(p)
        self.products = unique
        return self

    def sort_by_price(self, ascending: bool = True) -> "DataProcessor":
        self.products.sort(key=lambda p: p.price, reverse=not ascending)
        return self

    def sort_by_sales(self, descending: bool = True) -> "DataProcessor":
        self.products.sort(key=lambda p: p.sales, reverse=descending)
        return self

    def sort_by_value(self, descending: bool = True) -> "DataProcessor":
        self.products.sort(key=lambda p: p.value_score, reverse=descending)
        return self

    def filter_by_platform(self, platform: str) -> List[Product]:
        return [p for p in self.products if p.platform == platform]

    def filter_by_price_range(self, min_price: float = 0, max_price: float = float("inf")) -> List[Product]:
        return [p for p in self.products if min_price <= p.price <= max_price]

    def get_price_stats(self) -> dict:
        if not self.products:
            return {"min": 0, "max": 0, "avg": 0, "median": 0, "count": 0}
        prices = [p.price for p in self.products]
        sorted_prices = sorted(prices)
        n = len(sorted_prices)
        median = sorted_prices[n // 2] if n % 2 else (sorted_prices[n // 2 - 1] + sorted_prices[n // 2]) / 2
        return {
            "min": round(min(prices), 2),
            "max": round(max(prices), 2),
            "avg": round(sum(prices) / len(prices), 2),
            "median": round(median, 2),
            "count": len(prices),
        }

    def get_platform_stats(self) -> dict:
        stats = {}
        for p in self.products:
            if p.platform not in stats:
                stats[p.platform] = {"count": 0, "prices": [], "sales": []}
            stats[p.platform]["count"] += 1
            stats[p.platform]["prices"].append(p.price)
            stats[p.platform]["sales"].append(p.sales)
        result = {}
        for platform, data in stats.items():
            result[platform] = {
                "count": data["count"],
                "avg_price": round(sum(data["prices"]) / len(data["prices"]), 2),
                "min_price": round(min(data["prices"]), 2),
                "max_price": round(max(data["prices"]), 2),
                "avg_sales": round(sum(data["sales"]) / len(data["sales"]), 0),
                "total_sales": sum(data["sales"]),
            }
        return result

    def process(self) -> List[Product]:
        return (
            self.clean()
            .deduplicate()
            .sort_by_price(ascending=True)
            .products
        )
