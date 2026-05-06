from .models import Product
from .scrapers import JdScraper, TaobaoScraper, PddScraper
from .processor import DataProcessor
from .comparator import ProductComparator
from .visualizer import ChartVisualizer
from .demo_data import generate_demo_data

__version__ = "1.0.0"
