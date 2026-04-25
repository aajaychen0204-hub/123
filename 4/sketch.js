let bubbles = [];
let grasses = []; // New array for multiple grass blades
const COLORS = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff']; // Provided colors

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize 50 grass blades
  for (let i = 0; i < 50; i++) {
    grasses.push({
      x: random(width), // Random X position across the width
      h: random(height * 0.3, height * 2 / 3), // Height between 30% and 2/3 of screen height
      w: random(30, 60), // Random width for each blade, between 30 and 60
      color: color(random(COLORS)), // Random color from the palette
      noiseOffset: random(1000), // Unique noise offset for independent sway
      freq: random(0.005, 0.015), // Random sway frequency
      swayRange: random(20, 60) // Random sway amplitude (smaller for "小草")
    });
  }
}

function draw() {
  clear(); // 將原本的 background 改為 clear()，使畫布背景透明，露出網頁後方內容
  
  // 繪製多根小草
  drawGrasses(); // Call the new function to draw all grasses
  
  // 更新與繪製水泡
  updateBubbles();
  
  // 隨機產生新水泡
  if (frameCount % 20 === 0) {
    createBubble();
  }
}

// New function to draw multiple grass blades
function drawGrasses() {
  noFill();
  blendMode(BLEND); // 啟用混合模式，讓顏色重疊時產生透明效果
  
  grasses.forEach(g => {
    stroke(g.color.levels[0], g.color.levels[1], g.color.levels[2], 120); // 稍微降低 Alpha 值（從 180 降到 120），增加通透感
    strokeWeight(g.w); // 設定等寬粗細 (30-60)

    beginShape();
    // 起點的控制點
    curveVertex(g.x, height); 
    
    let segmentsForBlade = 8; 
    for (let j = 0; j <= segmentsForBlade; j++) {
      let y = height - (j / segmentsForBlade) * g.h;
      let sway = map(noise(g.noiseOffset + frameCount * g.freq, j * 0.2), 0, 1, -g.swayRange, g.swayRange);
      let currentSway = sway * (j / segmentsForBlade); 
      curveVertex(g.x + currentSway, y);
    }
    
    // 終點的控制點 (重複最後一個座標)
    let lastSway = map(noise(g.noiseOffset + frameCount * g.freq, segmentsForBlade * 0.2), 0, 1, -g.swayRange, g.swayRange);
    curveVertex(g.x + lastSway, height - g.h);

    endShape();
  });
}

function createBubble() {
  bubbles.push({
    x: random(width),
    y: height + 20,
    size: random(15, 40),
    speed: random(1, 4),
    targetY: random(height * 0.1, height * 0.7),
    popped: false,
    popTimer: 0
  });
}

function updateBubbles() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    
    if (!b.popped) {
      b.y -= b.speed;
      // 繪製水泡
      stroke(255, 150);
      fill(255, 127); // 透明度 0.5
      circle(b.x, b.y, b.size);
      
      // 水泡反光小圓圈
      noStroke();
      fill(255, 180); // 透明度 0.7
      circle(b.x - b.size/4, b.y - b.size/4, b.size/4);
      
      if (b.y < b.targetY) b.popped = true;
    } else {
      // 破掉的效果
      noFill();
      stroke(255, 255 - b.popTimer * 20);
      circle(b.x, b.y, b.size + b.popTimer * 5);
      b.popTimer++;
      if (b.popTimer > 15) bubbles.splice(i, 1);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}