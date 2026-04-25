let input, slider, button, dropdown, iframe, iframeDiv;
let isJittering = false;
let colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 1. 文字輸入框
  input = createInput('淡江教科 ET');
  input.position(20, 20);
  input.size(200, 50); // 高度為 50px
  input.style('font-size', '30px');

  // 2. 滑桿 (範圍 15-80, 起始 30)
  // 使用固定的 50px 高度進行計算，避免 property undefined 錯誤
  slider = createSlider(15, 80, 30);
  slider.position(input.x + 200 + 20, input.y + (50 / 2) - 10);
  slider.size(150);

  // 3. 切換開關按鈕
  button = createButton('切換跳動');
  button.position(slider.x + 150 + 20, input.y + (50 / 2) - 15);
  button.mousePressed(() => {
    isJittering = !isJittering;
  });

  // 4. 下拉式選單
  dropdown = createSelect();
  // 使用 elt.offsetWidth 獲取按鈕實際寬度進行定位
  dropdown.position(button.x + button.elt.offsetWidth + 20, input.y + (50 / 2) - 10);
  dropdown.option('淡江教科系', 'https://www.et.tku.edu.tw');
  dropdown.option('淡江大學', 'https://www.tku.edu.tw');
  dropdown.changed(() => {
    iframe.attribute('src', dropdown.value());
  });

  // 5. Iframe 容器 DIV
  iframeDiv = createDiv('');
  iframeDiv.style('position', 'fixed');
  iframeDiv.style('top', '200px');
  iframeDiv.style('left', '200px');
  iframeDiv.style('width', 'calc(100% - 400px)');
  iframeDiv.style('height', 'calc(100% - 400px)');
  iframeDiv.style('background-color', 'white');
  iframeDiv.style('opacity', '0.95');
  iframeDiv.style('overflow', 'hidden');
  iframeDiv.style('border', '1px solid #ccc');
  iframeDiv.style('box-shadow', '0 4px 15px rgba(0,0,0,0.2)');

  // 6. 建立 iframe 並放入 div
  iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.parent(iframeDiv);
  iframe.size('100%', '100%');
}

function draw() {
  background(255);
  
  let txt = input.value();
  let fontSize = slider.value();
  textSize(fontSize);
  
  if (txt.length === 0) return;

  // 這裡將 y 的間隔從固定的 50 改為根據 fontSize 動態調整 (例如 1.2 倍)
  // 這樣字體放大時就不會重疊
  let rowSpacing = fontSize * 1.2;

  for (let y = 100; y < height; y += rowSpacing) {
    let currentX = 0;
    let charCount = 0; // 用於追蹤色票索引

    // 每一行文字填滿視窗寬度
    while (currentX < width) {
      for (let i = 0; i < txt.length; i++) {
        let char = txt[i];
        let charW = textWidth(char);
        
        // 設定色票顏色 (同一行連續循環)
        let col = colors[charCount % colors.length];
        fill(col);
        
        let drawX = currentX;
        let drawY = y;

        // 如果啟動跳動開關
        if (isJittering) {
          // 使用 noise 根據時間(frameCount)與座標產生不同的位移量
          let time = frameCount * 0.05;
          let offsetX = map(noise(time, drawX * 0.01, y), 0, 1, -15, 15);
          let offsetY = map(noise(time, y, drawX * 0.01), 0, 1, -15, 15);
          drawX += offsetX;
          drawY += offsetY;
        }

        text(char, drawX, drawY);
        
        currentX += charW;
        charCount++;
        
        if (currentX > width) break;
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}