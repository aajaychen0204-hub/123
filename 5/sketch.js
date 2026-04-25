// 遊戲狀態定義
const STATE_START = 'START';
const STATE_PLAYING = 'PLAYING';
const STATE_GAMEOVER = '☠️GAMEOVER☠️';
const STATE_WIN = '🎊WIN🎊';

let gameState = STATE_START;
let currentLevel = 1;
let lives = 3;       // 初始生命值
let pathPoints = []; // 儲存路徑點
let hitFlashTime = 0; // 記錄撞擊發生的時間點

// 顏色常量
const COLOR_BG = 15;     // 極深藍黑色 (危險區)
const COLOR_PATH = 45;   // 深灰色路徑
const COLOR_NEON_BLUE = [0, 180, 255];
const COLOR_NEON_PINK = [255, 0, 150];
const PATH_WIDTH = 76;   // 2公分約等於 76 像素 (96 DPI)

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // 確保在不同解析度螢幕上顏色偵測準確
  generatePath();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePath(); // 視窗縮放時重新產生路徑
}

function generatePath() {
  pathPoints = [];
  // 增加點的數量使路徑曲線更細膩平滑
  let numPoints = 80; 
  let centerY = height / 2;
  
  // 難度參數優化：隨關卡增加曲折度 (Scale) 與 震幅 (Amplitude)
  let noiseScale = 0.01 + (currentLevel * 0.005);
  let amplitude = height * (0.2 + currentLevel * 0.08);
  let noiseOffset = random(1000); // 隨機雜訊偏移量

  for (let i = 0; i < numPoints; i++) {
    let x = map(i, 0, numPoints - 1, 100, width - 100);
    
    // 使用 Perlin Noise 產生有機且連續的平滑曲線
    let n = noise(i * noiseScale * 5, noiseOffset);
    let y = centerY + map(n, 0, 1, -amplitude/2, amplitude/2);
    
    // 起點與終點平滑處理：前 10 個點與後 10 個點會強行拉回中心高度
    let edgeWeight = 0;
    if (i < 10) edgeWeight = map(i, 0, 10, 1, 0);
    else if (i > numPoints - 11) edgeWeight = map(i, numPoints - 11, numPoints - 1, 0, 1);
    y = lerp(y, centerY, edgeWeight);

    pathPoints.push({ x, y });
  }
}

function draw() {
  // 檢查是否為遊戲失敗狀態，若是則顯示全黑 Game Over 畫面
  if (gameState === STATE_GAMEOVER) {
    background(0);
    textAlign(CENTER, CENTER);
    fill(255, 0, 0);
    textSize(60);
    text("GAME OVER", width / 2, height / 2);
    fill(255);
    textSize(24);
    text("按下空白鍵重新開始", width / 2, height / 2 + 80);
    return; // 停止繪製後續內容
  }

  // 1. 繪製背景 (深色背景)
  background(COLOR_BG);

  // 2. 繪製路徑 (加上霓虹發光效果)
  noFill();
  strokeJoin(ROUND);
  strokeCap(ROUND);

  // 繪製外層發光層
  stroke(COLOR_NEON_BLUE[0], COLOR_NEON_BLUE[1], COLOR_NEON_BLUE[2], 40);
  strokeWeight(PATH_WIDTH + 12);
  beginShape();
  for (let p of pathPoints) vertex(p.x, p.y);
  endShape();

  // 繪製主路徑層
  stroke(COLOR_PATH);
  strokeWeight(PATH_WIDTH);
  beginShape();
  for (let p of pathPoints) {
    vertex(p.x, p.y);
  }
  endShape();

  // 3. 繪製起點與終點 (放在路徑頭尾)
  let startPos = pathPoints[0];
  let endPos = pathPoints[pathPoints.length - 1];

  // 繪製起點 (科技感旋轉門戶)
  push();
  translate(startPos.x, startPos.y);
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(0, 255, 100, 0.8)';
  
  // 外層旋轉菱形
  rotate(frameCount * 0.03);
  noFill();
  stroke(0, 255, 100);
  strokeWeight(3);
  rectMode(CENTER);
  rect(0, 0, 40, 40, 4); 
  
  // 內層反向旋轉核心
  rotate(-frameCount * 0.06);
  fill(0, 255, 100, 180);
  noStroke();
  rect(0, 0, 20, 20, 2);
  
  // 文字標示 (抵銷旋轉)
  rotate(frameCount * 0.03); 
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(10);
  text("START", 0, 35);
  pop();

  // 繪製終點 (脈衝式六角能量核心)
  push();
  translate(endPos.x, endPos.y);
  drawingContext.shadowBlur = 25;
  drawingContext.shadowColor = 'rgba(255, 0, 150, 0.9)';
  
  let pulse = sin(frameCount * 0.1) * 8;
  
  // 能量環
  noFill();
  stroke(255, 0, 150, 150);
  strokeWeight(2);
  ellipse(0, 0, 50 + pulse, 50 + pulse);
  ellipse(0, 0, 35 - pulse * 0.5, 35 - pulse * 0.5);
  
  // 六角形核心
  fill(255, 0, 150);
  noStroke();
  beginShape();
  for(let i = 0; i < 6; i++) {
    let angle = TWO_PI / 6 * i;
    let r = 18;
    vertex(cos(angle) * r, sin(angle) * r);
  }
  endShape(CLOSE);
  
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(10);
  text("GOAL", 0, 0);
  pop();

  // 4. 計算當前玩家圓球的大小
  let playerSizeFactor = 0.5;
  if (currentLevel === 1) playerSizeFactor = 1/4;
  else if (currentLevel === 2) playerSizeFactor = 1/3;
  else if (currentLevel === 3) playerSizeFactor = 1/2;
  
  let currentPlayerSize = PATH_WIDTH * playerSizeFactor;
  let r = currentPlayerSize / 2;

  // 5. 遊戲邏輯處理：偵測球體是否出界
  if (gameState === STATE_PLAYING) {
    // 檢查中心以及圓周四個邊緣點 (上下左右)，確保整個圓都在路徑內
    let checkPoints = [
      { x: mouseX, y: mouseY },
      { x: mouseX + r, y: mouseY }, { x: mouseX - r, y: mouseY },
      { x: mouseX, y: mouseY + r }, { x: mouseX, y: mouseY - r }
    ];

    let hitWall = false;
    for (let p of checkPoints) {
      let col = get(p.x, p.y);
      // 如果任何一點碰到背景黑色 (COLOR_BG)
      if (col[0] === COLOR_BG && col[1] === COLOR_BG && col[2] === COLOR_BG) {
        hitWall = true;
        break;
      }
    }

    if (hitWall) {
      // --- 修正：起點安全緩衝 ---
      // 如果距離起點還很近 (35像素內)，即使偵測到黑色也判定為安全，防止點下 START 瞬間扣血
      if (dist(mouseX, mouseY, startPos.x, startPos.y) < 35) {
        hitWall = false;
      }
    }

    if (hitWall) {
      lives--; // 扣除生命
      hitFlashTime = millis() + 300; // 設定紅背景消失的時間 (當前時間 + 300ms)
      if (lives <= 0) {
        gameState = STATE_GAMEOVER;
      } else {
        gameState = STATE_START; // 還有生命，回到起點準備狀態
      }
    } else {
      // 如果沒撞牆，檢查中心點是否碰到紅色 (終點偵測)
      let c = get(mouseX, mouseY);
      if (c[0] > 200 && c[1] < 100) { // 優化顏色偵測以符合霓虹粉色
        gameState = STATE_WIN;
      }
    }
  }

  // 6. 決定玩家圓球顯示位置並繪製 (黃色小圓點)
  let playerDispX = mouseX;
  let playerDispY = mouseY;

  // 如果是準備開始狀態，將圓球固定在起點位置 (達成自動跳回起點的效果)
  if (gameState === STATE_START) {
    playerDispX = startPos.x;
    playerDispY = startPos.y;
  } 
  // 如果已經過關，將圓球固定在終點位置
  else if (gameState === STATE_WIN) {
    playerDispX = endPos.x;
    playerDispY = endPos.y;
  }

  // 繪製玩家能量球 (黃色發光核心)
  push();
  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = 'rgba(255, 255, 0, 0.9)';
  noStroke();
  fill(255, 255, 0);
  ellipse(playerDispX, playerDispY, currentPlayerSize, currentPlayerSize);
  fill(255); // 核心亮點
  ellipse(playerDispX, playerDispY, currentPlayerSize * 0.4, currentPlayerSize * 0.4);
  pop();

  // 6.5 撞擊紅屏特效 (透明度調整：不透明度 80%，即 255 * 0.8 = 204)
  if (millis() < hitFlashTime) {
    push();
    noStroke();
    fill(255, 0, 0, 204); // 第四個參數為 Alpha 值 (0-255)
    rect(0, 0, width, height);
    pop();
  }

  // 7. 顯示 UI 文字
  push();
  drawingContext.shadowBlur = 5;
  drawingContext.shadowColor = 'black';
  fill(255);
  
  // 左上角 HUD (資訊面板)
  textAlign(LEFT, TOP);
  textSize(22);
  textStyle(BOLD);
  let heartDisplay = "❤️".repeat(lives);
  let statusText = `LEVEL ${currentLevel} | LIVES ${heartDisplay}`;
  
  // 動態背景框：根據文字長度自動調整寬度，確保文字被完整包覆
  noStroke();
  fill(0, 0, 0, 150); // 半透明黑色背景
  rect(15, 15, textWidth(statusText) + 30, 45, 10);
  
  fill(255);
  text(statusText, 30, 25);

  // 中間狀態文字
  textAlign(CENTER, CENTER);
  textSize(24);
  if (gameState === STATE_START) {
    text("點擊綠色 Start 按鈕開始挑戰", width / 2, height * 0.2);
  } else if (gameState === STATE_PLAYING) {
    text("保持在路徑內！", width / 2, height * 0.2);
  }

  if (gameState === STATE_WIN) {
    fill(0, 255, 0);
    if (currentLevel < 3) {
      text("過關了！點擊滑鼠挑戰下一關", width / 2, height / 2 + 100);
    } else {
      text("恭喜全破！點擊滑鼠重新開始", width / 2, height / 2 + 100);
    }
  }
  pop();
}

function mousePressed() {
  let startPos = pathPoints[0];
  
  if (gameState === STATE_START) {
    // 檢查是否點擊起點按鈕 (距離判斷)
    let d = dist(mouseX, mouseY, startPos.x, startPos.y);
    if (d < 25) { // 擴大判定範圍至綠色圓圈的大小 (半徑 25)
      gameState = STATE_PLAYING;
    }
  } else if (gameState === STATE_WIN) {
    if (currentLevel < 3) currentLevel++;
    else currentLevel = 1;
    generatePath();
    gameState = STATE_START;
  }
}

function keyPressed() {
  // 當碰到邊緣失敗時，按下空白鍵 (keyCode 32) 回到原本遊戲畫面
  if (gameState === STATE_GAMEOVER && key === ' ') {
    lives = 3; // 重置生命值
    generatePath();
    gameState = STATE_START;
  }
}
