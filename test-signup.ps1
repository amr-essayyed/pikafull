try {
  $response = Invoke-WebRequest -Method POST -Uri 'https://kvgftdpuegzifijohvsc.supabase.co/auth/v1/signup' -Headers @{
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2Z0ZHB1ZWd6aWZpam9odnNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjg3NzMsImV4cCI6MjA5OTYwNDc3M30.LZKbrb6RJrBVnrOAk4NbmSX5DyK8pWc6DSQhuq5HQUw'
    'Content-Type' = 'application/json'
  } -Body '{"email":"testsignup999@example.com","password":"TestPass123456","data":{"full_name":"Test User","role":"customer"}}' -UseBasicParsing
  Write-Host "STATUS: $($response.StatusCode)"
  Write-Host "BODY: $($response.Content)"
} catch {
  Write-Host "ERROR STATUS: $($_.Exception.Response.StatusCode)"
  $stream = $_.Exception.Response.GetResponseStream()
  $reader = New-Object System.IO.StreamReader($stream)
  $body = $reader.ReadToEnd()
  Write-Host "ERROR BODY: $body"
}
