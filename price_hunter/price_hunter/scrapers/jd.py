import random
import hashlib
from typing import List
from .base import BaseScraper
from ..models import Product


class JdScraper(BaseScraper):
    platform_name = "京东"
    base_url = "https://search.jd.com"

    BRAND_PREFIXES = [
        "京东自营", "京东", "", "", ""
    ]
    PRODUCT_TEMPLATES = {
        "手机": [
            ("Apple iPhone 15 Pro Max 256GB", 8999, 12000),
            ("华为 Mate 60 Pro 512GB", 6999, 25000),
            ("小米14 Ultra 16GB+512GB", 5999, 18000),
            ("OPPO Find X7 Ultra", 5999, 8000),
            ("vivo X100 Pro", 4999, 15000),
            ("三星 Galaxy S24 Ultra", 9699, 6000),
            ("荣耀 Magic6 Pro", 4699, 10000),
            ("一加 12 16GB+512GB", 4299, 9000),
            ("Redmi K70 Pro", 3299, 30000),
            ("realme GT5 Pro", 3199, 7000),
            ("iQOO 12 Pro", 4399, 5000),
            ("魅族 21 Pro", 4999, 3000),
        ],
        "耳机": [
            ("Apple AirPods Pro 2", 1799, 50000),
            ("索尼 WH-1000XM5", 2299, 15000),
            ("华为 FreeBuds Pro 3", 1199, 20000),
            ("BOSE QuietComfort Ultra", 2999, 8000),
            ("小米 Buds 4 Pro", 699, 25000),
            ("漫步者 NeoBuds Pro 2", 499, 18000),
            ("森海塞尔 Momentum 4", 2399, 5000),
            ("JBL Tune 230NC", 399, 30000),
        ],
        "笔记本": [
            ("联想 ThinkPad X1 Carbon Gen11", 10999, 5000),
            ("华为 MateBook X Pro 2024", 11999, 8000),
            ("苹果 MacBook Pro 14 M3 Pro", 14999, 6000),
            ("戴尔 XPS 15 2024", 9999, 4000),
            ("小米 RedmiBook Pro 15", 4999, 20000),
            ("华硕 ROG 幻16 Air", 13999, 3000),
            ("惠普 暗影精灵9 Pro", 7999, 12000),
            ("联想 小新 Pro 16 2024", 5999, 25000),
        ],
    }

    DEFAULT_PRODUCTS = [
        ("高品质商品 旗舰版", 299, 5000),
        ("热销爆款 正品保证", 199, 8000),
        ("精选好物 限时特惠", 159, 12000),
        ("品质之选 官方直营", 399, 3000),
        ("人气爆款 好评如潮", 259, 6000),
        ("新品上市 限时优惠", 349, 4000),
        ("经典款 超值特卖", 129, 15000),
        ("升级版 性能更强", 449, 2000),
    ]

    def search(self, keyword: str, page: int = 1) -> List[Product]:
        products = []
        templates = self.PRODUCT_TEMPLATES.get(keyword, self.DEFAULT_PRODUCTS)

        for i, (name, base_price, base_sales) in enumerate(templates):
            offset = (page - 1) * len(templates)
            idx = i + offset
            price_var = random.uniform(0.9, 1.1)
            sales_var = random.uniform(0.7, 1.3)
            price = round(base_price * price_var, 2)
            sales = int(base_sales * sales_var)

            shop_names = ["京东自营旗舰店", "京东官方旗舰店", f"{name.split()[0]}京东自营店"]
            shop_name = random.choice(shop_names)
            shop_rating = round(random.uniform(4.7, 5.0), 1)

            prefix = random.choice(self.BRAND_PREFIXES)
            full_name = f"{prefix} {name}".strip()

            url_hash = hashlib.md5(f"{full_name}{idx}".encode()).hexdigest()[:12]
            url = f"https://item.jd.com/{url_hash}.html"

            original_price = round(price * random.uniform(1.05, 1.25), 2) if random.random() > 0.3 else None
            discount = f"满{random.choice([100, 200, 300])}减{random.choice([20, 30, 50])}" if random.random() > 0.5 else None

            products.append(Product(
                name=full_name,
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
