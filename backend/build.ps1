# Format: dd-MM-yy
$DATE = Get-Date -Format "dd-MM-yy"

$IMAGE_NAME = "nikolaypeshev/dogpass:edog-backend-$DATE"

Write-Host ">>> Building Docker image: $IMAGE_NAME"
docker build -t $IMAGE_NAME .

Write-Host ">>> Pushing Docker image: $IMAGE_NAME"
docker push $IMAGE_NAME
