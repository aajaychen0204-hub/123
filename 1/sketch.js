/**
 * p5_audio_visualizer
 * 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，
 * 畫面上會有多個隨機生成的多邊形在視窗內移動反彈，
 * 且其大小會跟隨音樂的振幅（音量）即時縮放。
 */

// 全域變數定義
let shapes = [];
let song;
let amplitude;
// 外部定義的二維陣列，做為多邊形頂點的基礎座標
let points = [
  [-2, 4],
  [2, 4],
  [4, 0],
  [2, -4],
  [-2, -4],
  [-4, 0]
];

function preload() {
  // 在程式開始前預載入外部音樂資源
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 初始化畫布
  createCanvas(windowWidth, windowHeight);

  // 初始化振幅分析物件
  amplitude = new p5.Amplitude();

  // 產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    // 透過 map() 讀取全域陣列 points，產生變形
    let deformedPoints = points.map(pt => {
      // 將每個頂點的 x 與 y 分別乘上 10 到 30 之間的隨機倍率
      return [pt[0] * random(10, 30), pt[1] * random(10, 30)];
    });

    let shape = {
      x: random(0, windowWidth),
      y: random(0, windowHeight),
      dx: random(-3, 3),
      dy: random(-3, 3),
      scale: random(1, 10),
      color: color(random(255), random(255), random(255)),
      points: deformedPoints
    };

    shapes.push(shape);
  }
}

function draw() {
  // 設定背景顏色
  background('#FFED97');
  
  // 設定邊框粗細
  strokeWeight(2);

  // 取得當前音量大小 (0 ~ 1)
  let level = amplitude.getLevel();
  
  // 將音量映射到縮放倍率 (0.5 ~ 2)
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // 走訪每個 shape 進行更新與繪製
  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // 設定外觀
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與縮放
    push();
    translate(shape.x, shape.y);
    scale(sizeFactor); // 依照音樂音量縮放圖形

    // 繪製多邊形
    beginShape();
    for (let pt of shape.points) {
      vertex(pt[0], pt[1]);
    }
    endShape(CLOSE);

    // 狀態還原
    pop();
  }
}

// 額外加入：點擊滑鼠以確保音訊播放（解決瀏覽器自動播放限制）
function mousePressed() {
  userStartAudio();
  if (song.isPlaying()) {
    song.stop();
  } else {
    song.loop();
  }
}
