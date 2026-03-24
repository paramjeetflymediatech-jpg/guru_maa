Add-Type -AssemblyName System.Drawing
$imagePath = "C:\Users\tech\.gemini\antigravity\brain\185435bb-7188-4f03-8874-ac580f8b258c\gurumaa_feature_graphic_1774344244986.png"
$outputPath = "C:\Users\tech\.gemini\antigravity\brain\185435bb-7188-4f03-8874-ac580f8b258c\gurumaa_feature_graphic_final.png"

$img = [System.Drawing.Image]::FromFile($imagePath)
$newImg = New-Object System.Drawing.Bitmap(1024, 500)
$graphics = [System.Drawing.Graphics]::FromImage($newImg)

# Crop center
$srcRect = New-Object System.Drawing.Rectangle(0, 262, 1024, 500)
$destRect = New-Object System.Drawing.Rectangle(0, 0, 1024, 500)

$graphics.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$newImg.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$graphics.Dispose()
$newImg.Dispose()
$img.Dispose()

Write-Output "Resized image saved to $outputPath"
