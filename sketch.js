let offset = 0;
let fishes = [];
let bubbles = [];
let grasses = [];
let iframeContainer;

const GRASS_COLORS = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff']; 

// 在此填入你六個作品的 URL
const workUrls = [
  './1/index.html',
  './2/index.html',
  './3/index.html',
  './4/index.html',
  './5/index.html',
  './6/index.html',
  './7/index.html'
];

// 在此修改魚身上顯示的文字
const fishLabels = [
  '音樂色塊',
  '魚',
  '圓型',
  '水草',
  '電流',
  '地雷',
  'DOM'
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER); // 設定文字居中
  
  // 初始化魚群，分佈在螢幕中間區域
  for (let i = 0; i < workUrls.length; i++) {
    fishes.push(new Fish(
      random(width * 0.2, width * 0.8), 
      random(height * 0.3, height * 0.7), 
      workUrls[i],
      fishLabels[i]
    ));
  }

  // 初始化 25 根海草
  for (let i = 0; i < 25; i++) {
    grasses.push({
      x: random(width),
      h: random(height * 0.2, height * 0.5),
      w: random(15, 35),
      color: color(random(GRASS_COLORS)),
      noiseOffset: random(1000),
      freq: random(0.005, 0.015),
      swayRange: random(40, 100)
    });
  }

  setupIframeContainer();
}

/**
 * Separated Iframe setup for better organization
 */
function setupIframeContainer() {
  // 建立存放作品的 Iframe 容器 (預設隱藏)
  iframeContainer = createDiv('');
  iframeContainer.style('position', 'fixed');
  iframeContainer.style('top', '0');
  iframeContainer.style('left', '0');
  iframeContainer.style('width', '100vw');
  iframeContainer.style('height', '100vh');
  iframeContainer.style('background', 'rgba(0, 0, 0, 0.85)');
  iframeContainer.style('display', 'none');
  iframeContainer.style('z-index', '999');
  
  // 建立一個專門放 iframe 的容器，避免影響到按鈕
  let contentArea = createDiv('');
  contentArea.id('iframe-content');
  contentArea.parent(iframeContainer);

  // 建立關閉按鈕
  let closeBtn = createButton('Close ×');
  closeBtn.parent(iframeContainer);
  closeBtn.style('position', 'absolute');
  closeBtn.style('top', '20px');
  closeBtn.style('right', '20px');
  closeBtn.style('padding', '10px 20px');
  closeBtn.mousePressed(() => {
    iframeContainer.style('display', 'none');
    select('#iframe-content').html(''); // 只清空 iframe 內容
  });
}

function draw() {
  background(0, 20, 50); // 改為深藍色背景

  // 1. 繪製背景水泡
  updateBubbles();
  if (frameCount % 30 === 0) {
    createBubble();
  }

  // 2. 繪製底部海草
  drawGrasses();

  // 檢查是否滑鼠在任何魚身上，改變游標
  let hovering = false;
  // 繪製魚群
  for (let fish of fishes) {
    fish.update(fishes);
    fish.display();
    if (fish.isClicked(mouseX, mouseY)) {
      hovering = true;
    }
  }
  
  if (hovering) cursor(HAND);
  else cursor(ARROW);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  for (let fish of fishes) {
    if (fish.isClicked(mouseX, mouseY)) {
      showWork(fish.url);
      break;
    }
  }
}

function showWork(url) {
  iframeContainer.style('display', 'flex');
  iframeContainer.style('justify-content', 'center');
  iframeContainer.style('align-items', 'center');
  
  // 插入 Iframe
  let content = `<iframe src="${url}" style="width:80vw; height:80vh; border:none; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border-radius: 8px;"></iframe>`;
  let contentArea = select('#iframe-content');
  contentArea.html(content);
}

function createBubble() {
  bubbles.push({
    x: random(width),
    y: height + 20,
    size: random(10, 25),
    speed: random(0.5, 2.5),
    opacity: random(50, 150)
  });
}

function updateBubbles() {
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    b.y -= b.speed;
    
    stroke(255, b.opacity);
    noFill();
    circle(b.x, b.y, b.size);
    
    // 水泡反光
    noStroke();
    fill(255, b.opacity + 30);
    circle(b.x - b.size/4, b.y - b.size/4, b.size/5);
    
    if (b.y < -50) {
      bubbles.splice(i, 1);
    }
  }
}

function drawGrasses() {
  noFill();
  
  grasses.forEach(g => {
    // 使用海草自定義顏色，並加上透明度
    let c = g.color;
    stroke(red(c), green(c), blue(c), 150);
    strokeWeight(g.w);

    beginShape();
    // 起點
    curveVertex(g.x, height); 
    
    let segments = 6; 
    for (let j = 0; j <= segments; j++) {
      let y = height - (j / segments) * g.h;
      // 使用 noise 產生擺動
      let sway = map(
        noise(g.noiseOffset + frameCount * g.freq, j * 0.1), 
        0, 1, 
        -g.swayRange, g.swayRange
      );
      // 越往尖端擺動幅度越大
      let currentSway = sway * (j / segments); 
      curveVertex(g.x + currentSway, y);
    }
    
    // 終點控制點
    let lastSway = map(noise(g.noiseOffset + frameCount * g.freq, 0.6), 0, 1, -g.swayRange, g.swayRange);
    curveVertex(g.x + lastSway, height - g.h);

    endShape();
  });
}

class Fish {
  constructor(x, y, url, label) {
    this.x = x;
    this.y = y;
    this.url = url;
    this.label = label;
    this.size = random(40, 60);
    this.angle = random(TWO_PI);
    // 為每隻魚隨機分配顏色 (柔和的藍、綠、紫色系)
    this.color = color(random(100, 200), random(150, 255), random(200, 255), 220);
  }

  update(allFishes) {
    this.x += cos(this.angle) * 0.5;
    this.y += sin(this.angle) * 0.5;
    this.angle += 0.01;

    // 防止魚群重疊邏輯
    for (let other of allFishes) {
      if (other !== this) {
        let d = dist(this.x, this.y, other.x, other.y);
        // 設定最小安全間距 (約為魚身大小的 80%)
        let minDist = (this.size + other.size) * 0.4;
        if (d < minDist) {
          // 計算推開的角度
          let pushAngle = atan2(this.y - other.y, this.x - other.x);
          this.x += cos(pushAngle) * 0.8;
          this.y += sin(pushAngle) * 0.8;
        }
      }
    }

    // 簡單的邊界處理，讓魚留在螢幕內
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  display() {
    push();
    translate(this.x, this.y);
    
    // 根據游動角度旋轉 (加上 PI 是因為預設頭向右)
    rotate(this.angle);
    
    // 繪製魚身
    fill(this.color);
    noStroke();
    
    // 背鰭
    triangle(0, -this.size*0.2, -this.size*0.3, -this.size*0.4, -this.size*0.2, -this.size*0.1);
    
    // 身體
    ellipse(0, 0, this.size, this.size * 0.6);
    
    // 魚尾
    triangle(-this.size/2.5, 0, -this.size*0.9, -this.size/3, -this.size*0.9, this.size/3);
    
    // 眼睛
    fill(255);
    ellipse(this.size/4, -this.size/10, this.size/6, this.size/6);
    fill(0);
    ellipse(this.size/4 + 2, -this.size/10, this.size/12, this.size/12);
    
    // 在魚身上寫字
    rotate(-this.angle); // 文字保持水平不旋轉
    fill(255);
    stroke(0, 100); // 加上淡淡的描邊增加可讀性
    strokeWeight(1);
    textSize(14);
    text(this.label, 0, 0);
    pop();
  }

  isClicked(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.size / 2;
  }
}
