Add-Type -AssemblyName System.Drawing
$SourcePath = "c:\Users\tech\Documents\gurumaa\guru_maa_app\assets\logo.png"
if (-Not (Test-Path $SourcePath)) {
    Write-Error "Source image not found: $SourcePath"
    exit 1
}

try {
    $src = [System.Drawing.Image]::FromFile($SourcePath)
    $sizes = @{
        "mdpi" = 48
        "hdpi" = 72
        "xhdpi" = 96
        "xxhdpi" = 144
        "xxxhdpi" = 192
    }

    foreach ($density in $sizes.Keys) {
        $size = $sizes[$density]
        $dstDir = "c:\Users\tech\Documents\gurumaa\guru_maa_app\android\app\src\main\res\mipmap-$density"
        
        if (-Not (Test-Path $dstDir)) {
            New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
        }
        
        $bmp = New-Object System.Drawing.Bitmap($size, $size)
        # Set high quality interpolation
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($src, 0, 0, $size, $size)
        $g.Dispose()
        
        $bmp.Save("$dstDir\ic_launcher.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Save("$dstDir\ic_launcher_round.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        
        Write-Host "Generated $density icons (${size}x${size})"
    }
} finally {
    if ($src) { $src.Dispose() }
}

Write-Host "Successfully updated Android App Icons!"
