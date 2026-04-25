let mineX, mineY;
let gameState = 'PLAYING'; // 'PLAYING' 或 'WON'
const cols = 8;
const rows = 8;

function resetGame() {
  // 隨機決定地雷在 8x8 網格中的座標 (0-7)
  mineX = floor(random(cols));
  mineY = floor(random(rows));
  gameState = 'PLAYING';
}

function setup() {
  // 創建一個全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  resetGame();
}

function draw() {
  // 背景設為黑色
  background(0);

  // 設定線條顏色為灰色 (100)
  stroke(100);
  strokeWeight(1);

  const w = width / cols;
  const h = height / rows;

  // 繪製垂直線
  for (let i = 0; i <= cols; i++) {
    line(i * w, 0, i * w, height);
  }

  // 繪製水平線
  for (let j = 0; j <= rows; j++) {
    line(0, j * h, width, j * h);
  }

  // 雷達探測邏輯：當鼠標移動到格子時出現圓球
  if (gameState === 'PLAYING') {
    let gridX = floor(mouseX / w);
    let gridY = floor(mouseY / h);

    // 確保鼠標在畫布範圍內
    if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
      // 計算與地雷的距離 (切比雪夫距離)
      let d = max(abs(gridX - mineX), abs(gridY - mineY));

      // 根據距離決定顏色
      let ballColor = '#4A4AFF'; // 預設藍紫色
      if (d === 0) ballColor = '#DC143C';      // 地雷：深紅
      else if (d <= 1) ballColor = '#FF8040';  // 1格內：橘色
      else if (d <= 3) ballColor = '#F9F900';  // 3格內：黃色
      else if (d <= 5) ballColor = '#00EC00';  // 5格內：綠色

      // 繪製圓球
      noStroke();
      fill(ballColor);
      let centerX = (gridX + 0.5) * w;
      let centerY = (gridY + 0.5) * h;
      ellipse(centerX, centerY, min(w, h) * 0.3); // 圓球大小為格子寬高的 30%
    }
  }

  // 如果獲勝，顯示提示字樣
  if (gameState === 'WON') {
    fill(0, 255, 0); // 綠色
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(64);
    text("YOU WIN!", width / 2, height / 2);
    
    textSize(24);
    fill(255);
    text("Press SPACE to restart", width / 2, height / 2 + 60);

    // 顯示地雷原本的位置（可選，增加回饋感）
    fill(255, 255, 0, 100); 
    rect(mineX * w, mineY * h, w, h);
  }
}

function mousePressed() {
  if (gameState === 'PLAYING') {
    let w = width / cols;
    let h = height / rows;
    
    // 計算玩家點擊的是哪一個格子
    let clickedX = floor(mouseX / w);
    let clickedY = floor(mouseY / h);

    // 判斷是否點中地雷
    if (clickedX === mineX && clickedY === mineY) {
      gameState = 'WON';
    }
  }
}

function keyPressed() {
  // 如果遊戲結束且按下空白鍵 (ASCII 32)，重置遊戲
  if (gameState === 'WON' && key === ' ') {
    resetGame();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}