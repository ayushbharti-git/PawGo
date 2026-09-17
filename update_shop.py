import os

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix broken image URLs
content = content.replace("1628009368231-7bb7cbcb8122", "1544568100-847a948585b9")
content = content.replace("1576201836106-db1758fd1c97", "1517849845537-4d257902454a")
content = content.replace("1623366302587-bca23fc979dd", "1543466835-00a7907e9de1")

# Replace inputs and labels
old_inputs = """        <input type="radio" name="shop-tab" id="tab-food" class="shop-tab-input" checked>
        <input type="radio" name="shop-tab" id="tab-treats" class="shop-tab-input">
        <input type="radio" name="shop-tab" id="tab-toys" class="shop-tab-input">

        <div class="shop-category-bar">
          <label for="tab-food" class="shop-tab-label">FOOD</label>
          <label for="tab-treats" class="shop-tab-label">TREATS</label>
          <label for="tab-toys" class="shop-tab-label">TOYS</label>
          <label class="shop-tab-label disabled">GROOMING</label>
          <label class="shop-tab-label disabled">WELLNESS</label>
          <label class="shop-tab-label disabled">COLLARS</label>
          <label class="shop-tab-label disabled">BEDS</label>
          <label class="shop-tab-label disabled">TRAVEL</label>
        </div>"""

new_inputs = """        <input type="radio" name="shop-tab" id="tab-food" class="shop-tab-input" checked>
        <input type="radio" name="shop-tab" id="tab-treats" class="shop-tab-input">
        <input type="radio" name="shop-tab" id="tab-toys" class="shop-tab-input">
        <input type="radio" name="shop-tab" id="tab-grooming" class="shop-tab-input">
        <input type="radio" name="shop-tab" id="tab-wellness" class="shop-tab-input">
        <input type="radio" name="shop-tab" id="tab-collars" class="shop-tab-input">
        <input type="radio" name="shop-tab" id="tab-beds" class="shop-tab-input">
        <input type="radio" name="shop-tab" id="tab-travel" class="shop-tab-input">

        <div class="shop-category-bar">
          <label for="tab-food" class="shop-tab-label">FOOD</label>
          <label for="tab-treats" class="shop-tab-label">TREATS</label>
          <label for="tab-toys" class="shop-tab-label">TOYS</label>
          <label for="tab-grooming" class="shop-tab-label">GROOMING</label>
          <label for="tab-wellness" class="shop-tab-label">WELLNESS</label>
          <label for="tab-collars" class="shop-tab-label">COLLARS</label>
          <label for="tab-beds" class="shop-tab-label">BEDS</label>
          <label for="tab-travel" class="shop-tab-label">TRAVEL</label>
        </div>"""

content = content.replace(old_inputs, new_inputs)

# Add new panels before the closing tag of shop-panels
new_panels = """
          <!-- GROOMING PANEL -->
          <div class="shop-panel" id="panel-grooming">
            <div class="shop-editorial-grid">
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80" alt="Grooming"></div><div class="product-info-rich"><h4>Shampoo</h4><div class="p-rating">★★★★★ 4.9</div><div class="p-buy"><span class="current">$18.99</span><button class="add-btn">+</button></div></div></div>
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=400&q=80" alt="Grooming"></div><div class="product-info-rich"><h4>Brush</h4><div class="p-rating">★★★★☆ 4.6</div><div class="p-buy"><span class="current">$12.00</span><button class="add-btn">+</button></div></div></div>
              <div class="shop-editorial-img"><img src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80" alt="Grooming"><div class="img-overlay"><h3 class="display-serif">Spa Day.</h3><a href="#">Explore Grooming &rarr;</a></div></div>
            </div>
          </div>
          <!-- WELLNESS PANEL -->
          <div class="shop-panel" id="panel-wellness">
            <div class="shop-editorial-grid">
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80" alt="Wellness"></div><div class="product-info-rich"><h4>Vitamins</h4><div class="p-rating">★★★★★ 5.0</div><div class="p-buy"><span class="current">$29.99</span><button class="add-btn">+</button></div></div></div>
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1603513492128-ba7bc9b3e143?auto=format&fit=crop&w=400&q=80" alt="Wellness"></div><div class="product-info-rich"><h4>Joint Supplement</h4><div class="p-rating">★★★★☆ 4.8</div><div class="p-buy"><span class="current">$34.50</span><button class="add-btn">+</button></div></div></div>
            </div>
          </div>
          <!-- COLLARS PANEL -->
          <div class="shop-panel" id="panel-collars">
            <div class="shop-editorial-grid">
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=400&q=80" alt="Collar"></div><div class="product-info-rich"><h4>Leather Collar</h4><div class="p-rating">★★★★★ 4.9</div><div class="p-buy"><span class="current">$45.00</span><button class="add-btn">+</button></div></div></div>
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80" alt="Collar"></div><div class="product-info-rich"><h4>Nylon Leash</h4><div class="p-rating">★★★★★ 5.0</div><div class="p-buy"><span class="current">$22.00</span><button class="add-btn">+</button></div></div></div>
            </div>
          </div>
          <!-- BEDS PANEL -->
          <div class="shop-panel" id="panel-beds">
            <div class="shop-editorial-grid">
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&w=400&q=80" alt="Bed"></div><div class="product-info-rich"><h4>Memory Foam Bed</h4><div class="p-rating">★★★★★ 4.9</div><div class="p-buy"><span class="current">$120.00</span><button class="add-btn">+</button></div></div></div>
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1537151608804-ea2f4316d2e6?auto=format&fit=crop&w=400&q=80" alt="Bed"></div><div class="product-info-rich"><h4>Cozy Cave</h4><div class="p-rating">★★★★☆ 4.7</div><div class="p-buy"><span class="current">$85.00</span><button class="add-btn">+</button></div></div></div>
            </div>
          </div>
          <!-- TRAVEL PANEL -->
          <div class="shop-panel" id="panel-travel">
            <div class="shop-editorial-grid">
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?auto=format&fit=crop&w=400&q=80" alt="Travel"></div><div class="product-info-rich"><h4>Travel Carrier</h4><div class="p-rating">★★★★★ 5.0</div><div class="p-buy"><span class="current">$150.00</span><button class="add-btn">+</button></div></div></div>
              <div class="product-card-rich"><div class="product-img-wrapper"><img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80" alt="Travel"></div><div class="product-info-rich"><h4>Car Seat Cover</h4><div class="p-rating">★★★★★ 4.9</div><div class="p-buy"><span class="current">$45.00</span><button class="add-btn">+</button></div></div></div>
            </div>
          </div>
"""

content = content.replace("            </div>\n          </div>\n\n        </div>", "            </div>\n          </div>\n" + new_panels + "\n        </div>")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done")
