import os
from PIL import Image

def resize_image(path, target_width, target_height):
    try:
        with Image.open(path) as img:
            print(f"Original: {img.size}")
            # Resize with aspect ratio preservation or crop?
            # For 1024x1024 to 1024x500, we'll crop the center.
            w, h = img.size
            if w == target_width and h == target_height:
                print("Already correct size")
                return
            
            # Crop center
            left = (w - target_width) / 2
            top = (h - target_height) / 2
            right = (w + target_width) / 2
            bottom = (h + target_height) / 2
            
            img = img.crop((left, top, right, bottom))
            img.save(path)
            print(f"New size: {img.size}")
    except Exception as e:
        print(f"Error: {e}")

# Feature Graphic
resize_image(r'C:\Users\tech\.gemini\antigravity\brain\185435bb-7188-4f03-8874-ac580f8b258c\gurumaa_feature_graphic_1774344244986.png', 1024, 500)
