import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from flask import Flask, jsonify, request, render_template
from price_hunter.models import Product
from price_hunter.scrapers import JdScraper, TaobaoScraper, PddScraper
from price_hunter.processor import DataProcessor
from price_hunter.comparator import ProductComparator
from price_hunter.matcher import ProductMatcher
from price_hunter.demo_data import generate_demo_data

app = Flask(__name__, static_folder="static", template_folder="templates")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/search", methods=["POST"])
def search():
    data = request.get_json() or {}
    keyword = data.get("keyword", "").strip()
    platforms = data.get("platforms", ["京东", "淘宝", "拼多多"])
    top_n = data.get("top_n", 5)

    if not keyword:
        return jsonify({"error": "关键词不能为空"}), 400

    scraper_map = {
        "京东": JdScraper,
        "淘宝": TaobaoScraper,
        "拼多多": PddScraper,
    }

    all_products = []
    for platform in platforms:
        scraper_cls = scraper_map.get(platform)
        if scraper_cls:
            scraper = scraper_cls()
            products = scraper.search(keyword)
            all_products.extend(products)

    processor = DataProcessor(all_products)
    cleaned = processor.clean().deduplicate().sort_by_price().products

    comparator = ProductComparator(cleaned)
    recommended = comparator.recommend(top_n=top_n)
    comparison = comparator.compare_by_platform()
    distribution = comparator.get_price_distribution(bins=5)
    price_stats = DataProcessor(cleaned).get_price_stats()

    grouped = ProductMatcher.group_products(cleaned)

    result = {
        "keyword": keyword,
        "total_collected": len(all_products),
        "total_after_clean": len(cleaned),
        "products": [p.to_dict() for p in recommended],
        "all_products": [p.to_dict() for p in cleaned],
        "comparison": comparison,
        "distribution": distribution,
        "price_stats": price_stats,
        "grouped": grouped,
    }

    return jsonify(result)


@app.route("/api/suggest", methods=["POST"])
def suggest():
    data = request.get_json() or {}
    keyword = data.get("keyword", "").strip()
    if not keyword or len(keyword) < 1:
        return jsonify({"suggestions": []})

    suggestions = ProductMatcher.get_suggestions(keyword, limit=8)
    return jsonify({"suggestions": suggestions, "keyword": keyword})


@app.route("/api/demo")
def demo():
    keyword = request.args.get("keyword", "手机")
    result = generate_demo_data(keyword)

    all_products = [Product(**p) for p in result["all_products"]]
    grouped = ProductMatcher.group_products(all_products)
    result["grouped"] = grouped

    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
