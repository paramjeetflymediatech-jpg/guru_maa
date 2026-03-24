$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "screenshot_$timestamp.png"
$remotePath = "/sdcard/screenshot.png"

Write-Host "Taking screenshot on emulator..." -ForegroundColor Cyan
adb shell screencap -p $remotePath

if ($LASTEXITCODE -eq 0) {
    Write-Host "Pulling screenshot to local directory: $filename" -ForegroundColor Green
    adb pull $remotePath $filename
    # Clean up remote file
    adb shell rm $remotePath
    Write-Host "Done! Screenshot saved as $filename" -ForegroundColor Yellow
} else {
    Write-Host "Error: Could not take screenshot. Is an emulator running?" -ForegroundColor Red
}
