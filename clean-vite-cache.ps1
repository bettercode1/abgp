# Clean Vite cache to fix EPERM errors on Windows/OneDrive
$viteCachePath = "node_modules\.vite"
if (Test-Path $viteCachePath) {
    Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
    try {
        Remove-Item -Path $viteCachePath -Recurse -Force -ErrorAction Stop
        Write-Host "Vite cache cleared successfully!" -ForegroundColor Green
    } catch {
        Write-Host "Error clearing cache: $_" -ForegroundColor Red
        Write-Host "Try closing any processes using these files and run again." -ForegroundColor Yellow
    }
} else {
    Write-Host "No Vite cache found." -ForegroundColor Green
}







