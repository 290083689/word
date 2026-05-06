from typing import List
from .models import Product


class ProductComparator:
    PRICE_WEIGHT = 0.4
    SALES_WEIGHT = 0.3
    RATING_WEIGHT = 0.3

    def __init__(self, products: List[Product]):
        self.products = products

    def compute_scores(self) -> List[Product]:
        if not self.products:
            return self.products

        prices = [p.price for p in self.products]
        sales = [p.sales for p in self.products]
        ratings = [p.shop_rating for p in self.products]

        min_price, max_price = min(prices), max(prices)
        min_sales, max_sales = min(sales), max(sales)
        min_rating, max_rating = min(ratings), max(ratings)

        price_range = max_price - min_price if max_price != min_price else 1
        sales_range = max_sales - min_sales if max_sales != min_sales else 1
        rating_range = max_rating - min_rating if max_rating != min_rating else 1

        for p in self.products:
            p.price_score = round((1 - (p.price - min_price) / price_range) * 100, 2)
            p.sales_score = round(((p.sales - min_sales) / sales_range) * 100, 2)
            p.rating_score = round(((p.shop_rating - min_rating) / rating_range) * 100, 2)

            p.value_score = round(
                p.price_score * self.PRICE_WEIGHT
                + p.sales_score * self.SALES_WEIGHT
                + p.rating_score * self.RATING_WEIGHT,
                2,
            )

        return self.products

    def recommend(self, top_n: int = 5) -> List[Product]:
        scored = self.compute_scores()
        sorted_products = sorted(scored, key=lambda p: p.value_score, reverse=True)

        for i, p in enumerate(sorted_products[:top_n]):
            p.recommended = True
            if i == 0:
                p.recommend_reason = "🏆 最佳性价比 - 综合评分最高"
            elif p.price_score >= 80:
                p.recommend_reason = "💰 低价优选 - 价格极具竞争力"
            elif p.sales_score >= 80:
                p.recommend_reason = "🔥 热销推荐 - 销量遥遥领先"
            elif p.rating_score >= 80:
                p.recommend_reason = "⭐ 品质之选 - 店铺评分出众"
            else:
                p.recommend_reason = "👍 综合推荐 - 各项均衡"

        return sorted_products

    def compare_by_platform(self) -> dict:
        platform_data = {}
        for p in self.products:
            if p.platform not in platform_data:
                platform_data[p.platform] = []
            platform_data[p.platform].append(p)

        comparison = {}
        for platform, prods in platform_data.items():
            prices = [p.price for p in prods]
            sales = [p.sales for p in prods]
            ratings = [p.shop_rating for p in prods]
            comparison[platform] = {
                "count": len(prods),
                "avg_price": round(sum(prices) / len(prices), 2),
                "min_price": round(min(prices), 2),
                "max_price": round(max(prices), 2),
                "avg_sales": round(sum(sales) / len(sales), 0),
                "avg_rating": round(sum(ratings) / len(ratings), 1),
                "best_value": max(prods, key=lambda p: p.value_score).to_dict(),
            }
        return comparison

    def get_price_distribution(self, bins: int = 5) -> List[dict]:
        if not self.products:
            return []
        prices = [p.price for p in self.products]
        min_price, max_price = min(prices), max(prices)
        step = (max_price - min_price) / bins if max_price != min_price else 1

        distribution = []
        for i in range(bins):
            low = min_price + step * i
            high = min_price + step * (i + 1)
            count = sum(1 for p in self.products if low <= p.price < high)
            if i == bins - 1:
                count = sum(1 for p in self.products if low <= p.price <= high)
            distribution.append({
                "range": f"{round(low, 0)}-{round(high, 0)}",
                "low": round(low, 2),
                "high": round(high, 2),
                "count": count,
            })
        return distribution
