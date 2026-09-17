import re

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# We want to replace the product images inside .product-img-wrapper
# We'll find all occurrences of:
# <div class="product-img-wrapper"><img src="..."
# and replace the src with a unique placedog.net URL.

pattern = re.compile(r'(<div class="product-img-wrapper"><img src=")([^"]+)(")')

def replace_func(match):
    replace_func.counter += 1
    # Use different IDs to guarantee diverse images
    dog_id = replace_func.counter * 3
    return f'{match.group(1)}https://placedog.net/400/400?id={dog_id}{match.group(3)}'

replace_func.counter = 0

new_content = pattern.sub(replace_func, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)
print(f"Replaced {replace_func.counter} product images.")
