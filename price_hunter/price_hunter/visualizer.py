from typing import List
from .models import Product


class ChartVisualizer:
    BAR_CHARS = "▁▂▃▄▅▆▇█"

    def __init__(self, products: List[Product]):
        self.products = products

    def render_price_bar_chart(self, top_n: int = 20) -> str:
        sorted_products = sorted(self.products, key=lambda p: p.price)[:top_n]
        if not sorted_products:
            return "无数据"

        max_price = max(p.price for p in sorted_products)
        min_price = min(p.price for p in sorted_products)
        price_range = max_price - min_price if max_price != min_price else 1

        lines = []
        lines.append("═" * 80)
        lines.append("  📊 价格分布图 (从低到高)")
        lines.append("═" * 80)

        for p in sorted_products:
            bar_len = int(((p.price - min_price) / price_range) * 40) + 1
            bar = self.BAR_CHARS[-1] * bar_len
            platform_tag = self._platform_tag(p.platform)
            rec_tag = " ⭐推荐" if p.recommended else ""
            lines.append(
                f"  {platform_tag} ¥{p.price:>8.2f} │{bar}{rec_tag}"
            )
            name_display = p.name[:50] + "..." if len(p.name) > 50 else p.name
            lines.append(f"  {'':>12} │ {name_display}")

        lines.append("═" * 80)
        return "\n".join(lines)

    def render_platform_comparison(self, comparison: dict) -> str:
        lines = []
        lines.append("═" * 80)
        lines.append("  📊 平台横向对比")
        lines.append("═" * 80)

        header = f"  {'平台':<8} {'商品数':>6} {'均价':>10} {'最低价':>10} {'最高价':>10} {'均销量':>10} {'均评分':>6}"
        lines.append(header)
        lines.append("  " + "─" * 76)

        for platform, data in comparison.items():
            row = (
                f"  {platform:<8} {data['count']:>6} ¥{data['avg_price']:>9.2f}"
                f" ¥{data['min_price']:>9.2f} ¥{data['max_price']:>9.2f}"
                f" {data['avg_sales']:>9.0f} {data['avg_rating']:>5.1f}"
            )
            lines.append(row)

        lines.append("═" * 80)
        return "\n".join(lines)

    def render_recommendations(self, recommended: List[Product]) -> str:
        lines = []
        lines.append("═" * 80)
        lines.append("  🏆 性价比推荐")
        lines.append("═" * 80)

        for i, p in enumerate(recommended, 1):
            lines.append(f"")
            lines.append(f"  #{i} {p.recommend_reason}")
            lines.append(f"  商品: {p.name}")
            lines.append(f"  平台: {p.platform} | 价格: ¥{p.price:.2f} | 销量: {p.sales:,}")
            lines.append(f"  店铺: {p.shop_name} (评分: {p.shop_rating})")
            lines.append(
                f"  评分: 价格={p.price_score} 销量={p.sales_score} "
                f"口碑={p.rating_score} 综合={p.value_score}"
            )
            if p.discount:
                lines.append(f"  优惠: {p.discount}")
            lines.append(f"  链接: {p.url}")

        lines.append("")
        lines.append("═" * 80)
        return "\n".join(lines)

    def render_price_distribution(self, distribution: List[dict]) -> str:
        if not distribution:
            return "无数据"

        max_count = max(d["count"] for d in distribution)
        if max_count == 0:
            return "无数据"

        lines = []
        lines.append("═" * 60)
        lines.append("  📊 价格区间分布")
        lines.append("═" * 60)

        for d in distribution:
            bar_len = int((d["count"] / max_count) * 30) + 1
            bar = self.BAR_CHARS[-1] * bar_len
            lines.append(f"  ¥{d['range']:>16} │{bar} {d['count']}件")

        lines.append("═" * 60)
        return "\n".join(lines)

    def render_product_table(self, products: List[Product], top_n: int = 30) -> str:
        sorted_products = sorted(products, key=lambda p: p.price)[:top_n]
        lines = []
        lines.append("═" * 110)
        lines.append("  📋 商品列表 (按价格从低到高)")
        lines.append("═" * 110)
        header = f"  {'#':>3} {'平台':<6} {'价格':>10} {'销量':>10} {'评分':>5} {'综合':>6} {'推荐':>4} {'商品名称'}"
        lines.append(header)
        lines.append("  " + "─" * 106)

        for i, p in enumerate(sorted_products, 1):
            rec = "⭐" if p.recommended else ""
            name = p.name[:40] + "..." if len(p.name) > 40 else p.name
            row = (
                f"  {i:>3} {p.platform:<6} ¥{p.price:>9.2f}"
                f" {p.sales:>9,} {p.shop_rating:>5.1f}"
                f" {p.value_score:>5.1f} {rec:>4} {name}"
            )
            lines.append(row)

        lines.append("═" * 110)
        return "\n".join(lines)

    @staticmethod
    def _platform_tag(platform: str) -> str:
        tags = {
            "京东": "[JD]",
            "淘宝": "[TB]",
            "拼多多": "[PDD]",
        }
        return tags.get(platform, f"[{platform[:3]}]")
