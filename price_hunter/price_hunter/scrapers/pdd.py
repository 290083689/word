import random
import hashlib
from typing import List
from .base import BaseScraper
from ..models import Product


class PddScraper(BaseScraper):
    platform_name = "拼多多"
    base_url = "https://mobile.yangkeduo.com"

    PRODUCT_TEMPLATES = {
        "手机": [
            ("iPhone 15 ProMax 百亿补贴", 7899, 20000),
            ("华为 Mate60 Pro 百亿补贴", 5999, 35000),
            ("小米14 Ultra 骁龙8Gen3", 5299, 22000),
            ("OPPO Find X7 Ultra 影像旗舰", 5099, 10000),
            ("vivo X100 Pro 蔡司镜头", 4299, 18000),
            ("三星 S24 Ultra AI手机", 8499, 8000),
            ("荣耀 Magic6 Pro 旗舰5G", 4099, 15000),
            ("一加12 旗舰性能", 3799, 11000),
            ("Redmi K70 Pro 性价比之王", 2699, 50000),
            ("realme GT5 Pro 超级快充", 2799, 9000),
            ("iQOO 12 Pro 电竞旗舰", 3999, 6000),
            ("中兴 Axon60 Ultra", 3299, 3000),
        ],
        "耳机": [
            ("AirPods Pro2 百亿补贴", 1499, 60000),
            ("索尼 WH1000XM5 降噪", 1899, 18000),
            ("华为 FreeBuds Pro3", 999, 30000),
            ("BOSE QC Ultra 头戴式", 2599, 6000),
            ("小米 Buds4 Pro 降噪", 499, 35000),
            ("漫步者 NeoBuds Pro2", 329, 25000),
            ("森海塞尔 Momentum4", 1999, 4000),
            ("JBL 230NC 降噪豆", 279, 40000),
        ],
        "笔记本": [
            ("联想 ThinkPad X1 Carbon", 9299, 6000),
            ("华为 MateBook X Pro", 10299, 9000),
            ("MacBook Pro14 M3Pro", 13499, 7000),
            ("戴尔 XPS15 超轻薄", 8799, 3000),
            ("RedmiBook Pro15 性价比", 4299, 28000),
            ("ROG 幻16Air 游戏本", 12999, 2500),
            ("暗影精灵9Pro 游戏本", 6999, 15000),
            ("小新Pro16 2024款", 5199, 22000),
        ],
    }

    DEFAULT_PRODUCTS = [
        ("百亿补贴 正品保障", 239, 10000),
        ("万人团 限时特惠", 159, 20000),
        ("官方直营 假一赔十", 349, 5000),
        ("爆款直降 限量抢购", 129, 25000),
        ("品质好货 超值推荐", 199, 15000),
        ("新品特惠 限时秒杀", 289, 8000),
        ("全网最低 限时抢", 99, 35000),
        ("精选好物 包邮到家", 379, 3000),
    ]

    SHOP_NAMES = [
        "官方旗舰店", "品牌特卖店", "百亿补贴店", "正品直营店",
        "好物专营店", "品质优选店", "超值特卖店", "源头工厂店",
    ]

    def search(self, keyword: str, page: int = 1) -> List[Product]:
        products = []
        templates = self.PRODUCT_TEMPLATES.get(keyword, self.DEFAULT_PRODUCTS)

        for i, (name, base_price, base_sales) in enumerate(templates):
            offset = (page - 1) * len(templates)
            idx = i + offset
            price_var = random.uniform(0.82, 1.12)
            sales_var = random.uniform(0.8, 1.5)
            price = round(base_price * price_var, 2)
            sales = int(base_sales * sales_var)

            shop_brand = name.split()[0] if name.split() else "品牌"
            shop_type = random.choice(self.SHOP_NAMES)
            shop_name = f"{shop_brand}{shop_type}"
            shop_rating = round(random.uniform(4.3, 4.8), 1)

            url_hash = hashlib.md5(f"pdd_{name}{idx}".encode()).hexdigest()[:12]
            url = f"https://mobile.yangkeduo.com/goods.html?goods_id={url_hash}"

            original_price = round(price * random.uniform(1.15, 1.4), 2)
            discount = "百亿补贴" if random.random() > 0.4 else f"限时直降{random.choice([50, 100, 200])}元"

            products.append(Product(
                name=name,
                price=price,
                sales=sales,
                shop_name=shop_name,
                shop_rating=shop_rating,
                platform=self.platform_name,
                url=url,
                keyword=keyword,
                original_price=original_price,
                discount=discount,
            ))

        return products
