from typing import List
from .models import Product
from .scrapers import JdScraper, TaobaoScraper, PddScraper
from .processor import DataProcessor
from .comparator import ProductComparator


def generate_demo_data(keyword: str = "手机") -> dict:
    scrapers = [JdScraper(), TaobaoScraper(), PddScraper()]
    all_products: List[Product] = []

    for scraper in scrapers:
        products = scraper.search(keyword)
        all_products.extend(products)

    processor = DataProcessor(all_products)
    cleaned = processor.clean().deduplicate().sort_by_price().products

    comparator = ProductComparator(cleaned)
    recommended = comparator.recommend(top_n=5)
    comparison = comparator.compare_by_platform()
    distribution = comparator.get_price_distribution(bins=5)
    price_stats = DataProcessor(cleaned).get_price_stats()

    return {
        "keyword": keyword,
        "total_collected": len(all_products),
        "total_after_clean": len(cleaned),
        "products": [p.to_dict() for p in recommended],
        "all_products": [p.to_dict() for p in cleaned],
        "comparison": comparison,
        "distribution": distribution,
        "price_stats": price_stats,
    }


def get_demo_keywords() -> List[str]:
    return ["手机", "耳机", "笔记本"]
