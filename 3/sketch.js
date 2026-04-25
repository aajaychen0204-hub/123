let colors = ['#6FB7B7', '#FFFF6F', '#FF5809', '#0000C6'];
let spacing = 50; // 圓形之間的間距

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
}

function draw() {
  background('#062C06'); // 使用墨綠色背景

  // 根據滑鼠目前的 X 與 Y 座標，計算一個顏色序列的偏移值
  // 當滑鼠移動時，這個 offset 會改變，從而讓所有圓形切換顏色
  let offset = floor(map(mouseX + mouseY, 0, width + height, 0, colors.length * 5));

  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      // 計算每個格點的索引，加上偏移量後對顏色陣列長度取餘數
      let colorIndex = (floor(x / spacing) + floor(y / spacing) + offset) % colors.length;
      
      fill(colors[colorIndex]);
      // 繪製圓形，直徑設為 spacing 使圓形剛好互相接觸
      circle(x, y, spacing);
    }
  }
}

// 當視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
