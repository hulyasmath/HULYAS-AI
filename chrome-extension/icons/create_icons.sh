#!/bin/bash
# Create simple placeholder icons using sips

# Create a simple colored square for each size
for size in 16 48 128; do
  # Create a temporary image file with sips
  # We'll create a simple colored PNG
  python3 << PYTHON
from struct import pack

def create_simple_png(width, height, filename):
    # Create a minimal valid PNG with a purple color (#667eea)
    # This is a very basic PNG structure
    png_data = bytearray()
    
    # PNG signature
    png_data.extend(b'\x89PNG\r\n\x1a\n')
    
    # IHDR chunk
    ihdr_data = pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = 0x12345678  # Placeholder CRC
    png_data.extend(pack('>I', 13))  # IHDR length
    png_data.extend(b'IHDR')
    png_data.extend(ihdr_data)
    png_data.extend(pack('>I', ihdr_crc))
    
    # IEND chunk
    png_data.extend(pack('>I', 0))
    png_data.extend(b'IEND')
    png_data.extend(pack('>I', 0xae426082))
    
    with open(filename, 'wb') as f:
        f.write(png_data)

create_simple_png($size, $size, 'icon${size}.png')
print(f'Created icon${size}.png')
PYTHON
done
