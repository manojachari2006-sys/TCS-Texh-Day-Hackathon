"""Standalone CSV batch processor with a mock description generator.

The description generator is injectable so it can later be replaced by an
adapter to the team's existing AI/backend service without changing the CSV
pipeline.
"""

import csv
from pathlib import Path
from typing import Callable, Mapping


INPUT_COLUMNS = [
    "id",
    "name",
    "category",
    "features",
    "specifications",
    "price",
    "keywords",
    "tone",
]
OUTPUT_COLUMNS = INPUT_COLUMNS + ["generated_description", "status"]


def create_mock_description(product: Mapping[str, str]) -> str:
    """Build a deterministic placeholder description from one product row."""
    return (
        f"Meet the {product['name']} from {product['category']}, available for "
        f"{product['price']}. It features {product['features']}. "
        f"Specifications: {product['specifications']}. "
        f"Discover it with keywords including {product['keywords']}."
    )


class BatchProcessor:
    """Read products from CSV and write generated descriptions to CSV."""

    def __init__(
        self,
        input_path: str | Path = "data/products.csv",
        output_path: str | Path = "data/generated_products.csv",
        expected_count: int = 50,
        description_generator: Callable[[Mapping[str, str]], str] = create_mock_description,
    ) -> None:
        self.input_path = Path(input_path)
        self.output_path = Path(output_path)
        self.expected_count = expected_count
        self.description_generator = description_generator

    def _read_products(self) -> list[dict[str, str]]:
        with self.input_path.open("r", newline="", encoding="utf-8-sig") as source:
            reader = csv.DictReader(source)
            if reader.fieldnames != INPUT_COLUMNS:
                raise ValueError(
                    f"Unexpected CSV columns in {self.input_path}: {reader.fieldnames}"
                )
            products = list(reader)

        if len(products) != self.expected_count:
            raise ValueError(
                f"Expected exactly {self.expected_count} products, found {len(products)}"
            )
        return products

    def _process_product(self, product: dict[str, str]) -> dict[str, str]:
        result = {column: product.get(column, "") or "" for column in INPUT_COLUMNS}
        try:
            missing = [column for column in INPUT_COLUMNS if not result[column].strip()]
            if missing:
                raise ValueError(f"Missing required values: {', '.join(missing)}")
            description = self.description_generator(result)
            if not description or not description.strip():
                raise ValueError("Description generator returned an empty description")
            result["generated_description"] = description.strip()
            result["status"] = "SUCCESS"
        except Exception as error:
            result["generated_description"] = ""
            result["status"] = f"ERROR: {error}"
        return result

    def process(self) -> list[dict[str, str]]:
        products = self._read_products()
        results = []
        for index, product in enumerate(products, start=1):
            print(f"Processing {index}/{len(products)}")
            results.append(self._process_product(product))

        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        with self.output_path.open("w", newline="", encoding="utf-8") as destination:
            writer = csv.DictWriter(destination, fieldnames=OUTPUT_COLUMNS)
            writer.writeheader()
            writer.writerows(results)
        return results


if __name__ == "__main__":
    BatchProcessor().process()
