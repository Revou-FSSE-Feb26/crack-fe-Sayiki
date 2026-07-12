# Image Assets for SwitchLab

## Current Implementation
The project currently uses high-quality Unsplash images for demonstration purposes. All images are properly credited and sourced from free stock photo platforms.

## Image Structure

```
/public/images/
├── categories/          # Category icons (will be added later)
├── services/           # Service-related images (will be added later) 
├── products/           # Product images (will be added later)
└── README.md          # This file
```

## Currently Used Images (Unsplash)

### Hero Background
- **Source**: `https://images.unsplash.com/photo-1541140532154-b024d705b90a`
- **Description**: Modern mechanical keyboard on desk
- **License**: Unsplash License (Free for commercial use)

### Category Images
1. **Lubing & Tuning**: `photo-1541140532154-b024d705b90a` - Mechanical keyboard detail
2. **Custom Pre-builts**: `photo-1587829741301-dc798b83add3` - Gaming setup with keyboard
3. **Lubed Switches & Parts**: `photo-1518697413123-71cf7a0c638f` - Technology/electronics
4. **Soldering/Repair**: `photo-1581092160562-40aa08e78837` - Electronics/circuit detail

### Product & Service Images
- **Switch packs**: `photo-1581092160562-40aa08e78837` - Electronics components
- **Keyboards**: `photo-1587829741301-dc798b83add3` - Gaming setup
- **Services**: `photo-1541140532154-b024d705b90a` - Keyboard workstation
- **Cables**: `photo-1518697413123-71cf7a0c638f` - Tech accessories

## Image Specifications
- **Format**: WebP preferred, JPG fallback
- **Hero**: 1920x1080 minimum
- **Cards**: 400x300 optimized
- **Categories**: 100x100 circular crops
- **Compression**: 80% quality for web optimization

## Usage Notes
1. All current images are from Unsplash and free for commercial use
2. Images are loaded via CDN for performance during development
3. For production, download and optimize images locally
4. Consider adding lazy loading for performance
5. Always include proper alt text for accessibility

## Future Improvements
1. Replace with actual keyboard component photography
2. Add product-specific images for each listing
3. Create custom category icons
4. Implement image optimization pipeline
5. Add image compression and WebP conversion

## License Information
- **Unsplash Images**: Free for commercial and personal use
- **Attribution**: Not required but appreciated
- **Modifications**: Allowed (cropping, resizing, filtering)