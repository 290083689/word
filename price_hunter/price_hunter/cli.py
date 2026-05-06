import argparse
import json
import sys
from typing import List

from .models import Product
from .scrapers import JdScraper, TaobaoScraper, PddScraper
from .processor import DataProcessor
from .comparator import ProductComparator
from .visualizer import ChartVisualizer


def run_search(keyword: str, platforms: List[str] = None, output: str = None, top_n: int = 5) -> dict:
    if platforms is None:
        platforms = ["京东", "淘宝", "拼多多"]

    scraper_map = {
        "京东": JdScraper,
        "淘宝": TaobaoScraper,
        "拼多多": PddScraper,
    }

    all_products: List[Product] = []
    for platform in platforms:
        scraper_cls = scraper_map.get(platform)
        if scraper_cls:
            scraper = scraper_cls()
            products = scraper.search(keyword)
            all_products.extend(products)
            print(f"  ✅ {platform}: 采集到 {len(products)} 条数据")

    processor = DataProcessor(all_products)
    cleaned = processor.clean().deduplicate().sort_by_price().products
    print(f"  📦 清洗去重后: {len(cleaned)} 条数据")

    comparator = ProductComparator(cleaned)
    recommended = comparator.recommend(top_n=top_n)
    comparison = comparator.compare_by_platform()
    distribution = comparator.get_price_distribution(bins=5)
    price_stats = DataProcessor(cleaned).get_price_stats()

    result = {
        "keyword": keyword,
        "total_collected": len(all_products),
        "total_after_clean": len(cleaned),
        "products": [p.to_dict() for p in recommended],
        "all_products": [p.to_dict() for p in cleaned],
        "comparison": comparison,
        "distribution": distribution,
        "price_stats": price_stats,
    }

    if output:
        with open(output, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"  💾 结果已保存到: {output}")

    return result


def display_results(result: dict):
    products = [Product(**p) for p in result["all_products"]]
    recommended = [Product(**p) for p in result["products"]]

    viz = ChartVisualizer(products)

    print("\n")
    print(viz.render_product_table(products))

    print("\n")
    print(viz.render_price_bar_chart())

    print("\n")
    print(viz.render_platform_comparison(result["comparison"]))

    print("\n")
    print(viz.render_price_distribution(result["distribution"]))

    print("\n")
    print(viz.render_recommendations(recommended))

    stats = result["price_stats"]
    print(f"\n  📈 价格统计: 最低 ¥{stats['min']} | 最高 ¥{stats['max']} | 均价 ¥{stats['avg']} | 中位数 ¥{stats['median']}")


def main():
    parser = argparse.ArgumentParser(
        description="电商商品价格自动化采集与对比工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python -m price_hunter 手机
  python -m price_hunter 耳机 --platforms 京东 淘宝
  python -m price_hunter 笔记本 --output result.json --top 3
        """,
    )
    parser.add_argument("keyword", help="搜索关键词")
    parser.add_argument(
        "--platforms", "-p",
        nargs="+",
        choices=["京东", "淘宝", "拼多多"],
        default=["京东", "淘宝", "拼多多"],
        help="指定采集平台 (默认全部)",
    )
    parser.add_argument(
        "--output", "-o",
        help="输出结果到JSON文件",
    )
    parser.add_argument(
        "--top", "-t",
        type=int,
        default=5,
        help="推荐商品数量 (默认5)",
    )

    args = parser.parse_args()

    print(f"\n🔍 正在搜索: {args.keyword}")
    print(f"📡 采集平台: {', '.join(args.platforms)}")
    print(f"{'─' * 50}")

    result = run_search(
        keyword=args.keyword,
        platforms=args.platforms,
        output=args.output,
        top_n=args.top,
    )

    display_results(result)


if __name__ == "__main__":
    main()
