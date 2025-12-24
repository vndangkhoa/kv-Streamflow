#!/bin/bash
# Generate Android App Icons from source image
# Usage: ./generate_android_icons.sh <source_image.png>

SOURCE_IMAGE="${1:-streamflix_icon.png}"
RES_DIR="frontend/android/app/src/main/res"

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "❌ Source image not found: $SOURCE_IMAGE"
    echo "   Usage: ./generate_android_icons.sh <source_image.png>"
    exit 1
fi

echo "🎨 Generating Android launcher icons from: $SOURCE_IMAGE"

resize_image() {
    local input=$1
    local output=$2
    local size=$3
    
    if command -v convert &> /dev/null; then
        convert "$input" -resize "${size}x${size}" "$output"
    elif command -v sips &> /dev/null; then
        cp "$input" "$output"
        sips -z "$size" "$size" "$output" > /dev/null 2>&1
    else
        echo "❌ Neither ImageMagick (convert) nor sips is available."
        exit 1
    fi
}

# Generate icons for each density
generate_icons() {
    local density=$1
    local size=$2
    local fg_size=$3
    local dir="$RES_DIR/mipmap-$density"
    
    mkdir -p "$dir"
    
    echo "  📱 $density: ${size}x${size}px (foreground: ${fg_size}x${fg_size}px)"
    
    resize_image "$SOURCE_IMAGE" "$dir/ic_launcher.png" "$size"
    resize_image "$SOURCE_IMAGE" "$dir/ic_launcher_round.png" "$size"
    resize_image "$SOURCE_IMAGE" "$dir/ic_launcher_foreground.png" "$fg_size"
}

# Android density -> icon size -> foreground size
generate_icons "mdpi" 48 108
generate_icons "hdpi" 72 162
generate_icons "xhdpi" 96 216
generate_icons "xxhdpi" 144 324
generate_icons "xxxhdpi" 192 432

echo ""
echo "✅ Icons generated successfully!"
echo "   Now rebuild the APK with: ./build_apk.sh"
