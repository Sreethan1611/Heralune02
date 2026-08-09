from PIL import Image, ImageDraw

def process_logo(img_path, output_path):
    img = Image.open(img_path).convert("RGBA")
    
    datas = img.getdata()
    new_data = []
    for item in datas:
        r, g, b, a = item
        # Use luminance or max color channel as alpha to smoothly fade black to transparent
        # We can scale it a bit to keep the logo bright.
        max_c = max(r, g, b)
        
        # If it's pure black or very close, just drop it
        if max_c < 10:
            new_data.append((r, g, b, 0))
        else:
            # Boost alpha slightly so it's not too ghost-like
            alpha = min(255, int(max_c * 1.5))
            new_data.append((r, g, b, alpha))

    img.putdata(new_data)
    
    # We should also crop the image to its bounding box to remove extra padding
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")

process_logo(r"C:\Users\sreet\.gemini\antigravity\brain\9d6e3e13-ca33-4e48-a342-18a70723917c\.user_uploaded\media_1786204885605.jpg", r"C:\Users\sreet\.gemini\antigravity\scratch\heralune-v2\frontend\public\logo.png")
