param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\public\icons')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $resolvedOutput | Out-Null

function New-FlamePath {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.StartFigure()
  $path.AddBezier(274, 82, 290, 154, 239, 175, 268, 227)
  $path.AddBezier(268, 227, 285, 257, 320, 263, 340, 235)
  $path.AddBezier(340, 235, 357, 318, 323, 425, 242, 425)
  $path.AddBezier(242, 425, 169, 425, 119, 371, 119, 299)
  $path.AddBezier(119, 299, 119, 216, 180, 180, 197, 115)
  $path.AddBezier(197, 115, 229, 142, 233, 183, 221, 216)
  $path.AddBezier(221, 216, 260, 188, 281, 143, 274, 82)
  $path.CloseFigure()
  return $path
}

function New-CorePath {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $path.StartFigure()
  $path.AddBezier(250, 257, 288, 299, 280, 353, 245, 376)
  $path.AddBezier(245, 376, 216, 368, 197, 342, 197, 310)
  $path.AddBezier(197, 310, 197, 275, 220, 252, 242, 229)
  $path.AddBezier(242, 229, 241, 242, 244, 251, 250, 257)
  $path.CloseFigure()
  return $path
}

function Write-EmberIcon([int]$Size) {
  $bitmap = [System.Drawing.Bitmap]::new(
    $Size,
    $Size,
    [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
  )
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.ScaleTransform($Size / 512, $Size / 512)

    $backgroundBounds = [System.Drawing.RectangleF]::new(0, 0, 512, 512)
    $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
      $backgroundBounds,
      [System.Drawing.ColorTranslator]::FromHtml('#4d3a31'),
      [System.Drawing.ColorTranslator]::FromHtml('#251f1c'),
      45
    )
    try {
      $graphics.FillRectangle($background, $backgroundBounds)
    } finally {
      $background.Dispose()
    }

    $flamePath = New-FlamePath
    $flameBounds = [System.Drawing.RectangleF]::new(110, 72, 250, 365)
    $flame = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
      $flameBounds,
      [System.Drawing.ColorTranslator]::FromHtml('#fff3c4'),
      [System.Drawing.ColorTranslator]::FromHtml('#c9542e'),
      64
    )
    try {
      $graphics.FillPath($flame, $flamePath)
    } finally {
      $flame.Dispose()
      $flamePath.Dispose()
    }

    $corePath = New-CorePath
    $core = [System.Drawing.SolidBrush]::new(
      [System.Drawing.Color]::FromArgb(224, 255, 248, 231)
    )
    try {
      $graphics.FillPath($core, $corePath)
    } finally {
      $core.Dispose()
      $corePath.Dispose()
    }

    $target = Join-Path $resolvedOutput "ember-home-icon-$Size.png"
    $bitmap.Save($target, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output $target
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

180, 192, 512 | ForEach-Object { Write-EmberIcon $_ }
