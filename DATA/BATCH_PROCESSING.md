# Batch Processing

## Files

- Input: `data/products.csv` (exactly 50 product rows)
- Output: `data/generated_products.csv`

## How it works

`BatchProcessor` reads and validates the input columns and product count, then
processes each product independently. It prints progress for every row and
writes the original product fields, `generated_description`, and `status` to
the output CSV. A product-level error is recorded in that row's status and
does not stop the remaining products.

## Current mock generator

The default `create_mock_description(product)` function builds a repeatable
placeholder description from the product name, category, price, features,
specifications, and keywords. No AI service or external API is called.

## Connecting real generation later

Keep the CSV processor unchanged and provide a callable that accepts one
product mapping and returns its description string. Connect the team's
existing generation service in a small adapter, then pass it when constructing
the processor:

```python
from batch_processor import BatchProcessor
from my_generation_adapter import generate_description

BatchProcessor(description_generator=generate_description).process()
```

The adapter's `generate_description(product)` should invoke the existing
backend/service and return the generated description. The mock remains the
default whenever no callable is supplied.

## Run

From the project directory, run:

```bash
python3 batch_processor.py
```
