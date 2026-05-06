import random
import hashlib
from typing import List
from .base import BaseScraper
from ..models import Product


class TaobaoScraper(BaseScraper):
    platform_name = "淘宝"
    base_url = "https://s.taobao.com"

    PRODUCT_TEMPLATES = {
        "手机": [
            ("Apple iPhone 15 ProMax 国行正品", 8399, 8000),
            ("华为 Mate60 Pro 全网通5G", 6499, 15000),
            ("小米14 Ultra 徕卡影像旗舰", 5599, 12000),
            ("OPPO Find X7 Ultra 哈苏影像", 5499, 5000),
            ("vivo X100 Pro 蔡司影像", 4599, 10000),
            ("三星 S24 Ultra AI旗舰", 8999, 4000),
            ("荣耀 Magic6 Pro 鸿蒙生态", 4399, 7000),
            ("一加12 骁龙8Gen3旗舰", 3999, 6000),
            ("Redmi K70 Pro 性能旗舰", 2999, 25000),
            ("realme GT5 Pro 超百瓦闪充", 2999, 5000),
            ("摩托罗拉 edge X40", 2499, 3000),
            ("努比亚 Z60 Ultra", 3599, 2000),
        ],
        "耳机": [
            ("Apple AirPods Pro2 正品", 1699, 35000),
            ("索尼 WH1000XM5 降噪耳机", 2099, 10000),
            ("华为 FreeBuds Pro3 智能降噪", 1099, 15000),
            ("BOSE QC Ultra 头戴式降噪", 2799, 5000),
            ("小米 Buds4 Pro 降噪耳机", 599, 20000),
            ("漫步者 NeoBuds Pro2", 399, 12000),
            ("森海塞尔 Momentum4", 2199, 3000),
            ("JBL 降噪豆 230NC", 349, 25000),
        ],
        "笔记本": [
            ("联想 ThinkPad X1 Carbon", 9999, 3000),
            ("华为 MateBook X Pro 触控屏", 10999, 5000),
            ("苹果 MacBook Pro14 M3", 13999, 4000),
            ("戴尔 XPS15 轻薄本", 9299, 2500),
            ("小米 RedmiBook Pro15", 4599, 15000),
            ("华硕 ROG 幻16 游戏本", 12999, 2000),
            ("惠普 暗影精灵9Pro", 7499, 8000),
            ("联想 小新Pro16 2024", 5499, 18000),
        ],
    }

    DEFAULT_PRODUCTS = [
        ("热销爆款 全网最低", 269, 6000),
        ("正品保证 七天退换", 189, 10000),
        ("限时秒杀 库存紧张", 139, 15000),
        ("品质好货 包邮到家", 369, 4000),
        ("人气爆款 好评99%", 229, 8000),
        ("新品首发 限时优惠", 329, 3000),
        ("经典款 超值特卖", 109, 20000),
        ("升级版 性价比之王", 419, 2500),
    ]

    SHOP_NAMES = [
        "数码旗舰店", "品牌专营店", "官方直营店", "科技数码店",
        "品质生活馆", "好物精选店", "正品折扣店", "潮流数码店",
    ]

    def search(self, keyword: str, page: int = 1) -> List[Product]:
        products = []
        templates = self.PRODUCT_TEMPLATES.get(keyword, self.DEFAULT_PRODUCTS)

        for i, (name, base_price, base_sales) in enumerate(templates):
            offset = (page - 1) * len(templates)
            idx = i + offset
            price_var = random.uniform(0.85, 1.15)
            sales_var = random.uniform(0.6, 1.4)
            price = round(base_price * price_var, 2)
            sales = int(base_sales * sales_var)

            shop_brand = name.split()[0] if name.split() else "品牌"
            shop_type = random.choice(self.SHOP_NAMES)
            shop_name = f"{shop_brand}{shop_type}"
            shop_rating = round(random.uniform(4.5, 4.9), 1)

            url_hash = hashlib.md5(f"tb_{name}{idx}".encode()).hexdigest()[:12]
            url = f"https://item.taobao.com/item.htm?id={url_hash}"

            original_price = round(price * random.uniform(1.1, 1.35), 2) if random.random() > 0.4 else None
            discount = f"跨店满{random.choice([200, 300, 400])}减{random.choice([30, 50, 60])}" if random.random() > 0.4 else None

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
