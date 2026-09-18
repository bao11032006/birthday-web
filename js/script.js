// Khai báo 3 file nhạc
const soundCountdown = new Audio('audio/nhac1.mp3'); 
const soundRead = new Audio('audio/nhac2.mp3');       
const soundBgm = new Audio('audio/nhac3.mp3');        
soundBgm.loop = true; 

function safePlay(audioObj) {
  audioObj.play().catch(e => console.log("Không thể phát audio:", e));
}

function runFirstPageSequence() {
  // --- PHẦN 1: Phát nhạc đếm (nhac1.mp3) ---
  safePlay(soundCountdown);

  let currentSec = 55;
  const initialTargets = createTextTargets(`23:59:${currentSec}`);
  assignTargets(initialTargets);
  currentSec++;

  function updateCountdownTick() {
    if (currentSec <= 59) {
      transitionToText(`23:59:${currentSec}`);
      currentSec++;
      setTimeout(updateCountdownTick, 1000);
    } else {
      transitionToText("00:00:00");

      // Khi đếm ngược xong: Tắt nhạc đếm
      soundCountdown.pause();
      soundCountdown.currentTime = 0;

      // Chữ HBD TIÊN! ở trang 1
      transitionToText("HAPPY BIRTHDAY", Math.min(width / 8, 45));
      safePlay(soundRead);

      // Sau đó chuyển sang ngày sinh
      setTimeout(() => {
        transitionToText("19/9/2007");
      }, 3000);

      // Tiếp tục chuyển sang năm hiện tại
      setTimeout(() => {
        transitionToText("19/9/2026");
      }, 6000);

      // Chuyển sang trang 2 và các hiệu ứng sau
      setTimeout(() => {
        mode = 'SWIRL';
        const scene1 = document.getElementById('scene1');
        if (scene1) scene1.classList.remove('active');
        
        const targets = createCombinedTextTargets();
        assignTargets(targets);
        setTimeout(() => { mode = 'TEXT'; }, 1200);

        // Chuyển sang nhạc nền chính (nhac3.mp3)
        soundRead.pause();
        soundRead.currentTime = 0;
        safePlay(soundBgm);

        // Mở thư ở trang 2
        setTimeout(() => {
          const scene2 = document.getElementById('scene2');
          if (scene2) scene2.classList.add('active');
          const envelope = document.getElementById('envelope');
          if (envelope) envelope.classList.add('open');
        }, 10000);

        // Hiệu ứng chữ HAPPY BIRTHDAY
        setTimeout(() => {
          const scene2 = document.getElementById('scene2');
          if (scene2) scene2.classList.remove('active');
          startSwirlAndFormTwoLineWish(1200);
        }, 22000);

        // Hiệu ứng trái tim và hiện ảnh / pháo hoa ở trang cuối
        setTimeout(() => {
          formHeartShape();
          const scenePhoto = document.getElementById('scenePhoto');
          if (scenePhoto) scenePhoto.classList.add('active');
          triggerMegaFireworks();

          for (let k = 0; k < 4; k++) {
            triggerDroneClusterExplosion(k, k * 1200);
          }

        }, 34000);

      }, 8500);
    }
  }

  setTimeout(updateCountdownTick, 1000);
}

// --- KHỞI TẠO CANVAS VÀ CÁC HIỆU ỨNG HẠT, ẢNH, PHÁO HOA ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let width, height;
let textParticles = [];        
let backgroundParticles = [];  
let cakeParticles = [];        
let heartDroneGroups = [];     
let mode = 'COUNTDOWN';        
let cakeAngle = 0;

function resize() {
  if (!canvas) return;
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class LargeHeartDroneGroup {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.centerX = Math.random() * width;
    this.centerY = initial ? (height * 0.5 + Math.random() * (height * 0.5)) : height + Math.random() * 80 + 40;
    this.heartScale = Math.random() * 1.5 + 1.8; 
    this.speedY = Math.random() * 1.0 + 0.5; 
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.swing = Math.random() * Math.PI * 2;
    this.swingSpeed = 0.02 + Math.random() * 0.02;

    this.particles = [];
    const count = 12; 

    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const rx = 16 * Math.pow(Math.sin(t), 3);
      const ry = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      this.particles.push({
        relX: rx * this.heartScale,
        relY: ry * this.heartScale,
        radius: Math.random() * 1.5 + 1,
        color: Math.random() > 0.3 ? '#ff1744' : '#ff5252',
        alpha: Math.random() * 0.4 + 0.3
      });
    }
  }

  update() {
    this.centerY -= this.speedY;
    this.swing += this.swingSpeed;
    this.centerX += Math.sin(this.swing) * 0.6 + this.speedX;

    if (this.centerY < height * 0.35) {
      this.reset(false);
    }
  }

  draw() {
    if (!ctx) return;
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(this.centerX + p.relX, this.centerY + p.relY, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();
    });
  }
}

function createTextTargets(text, customFontSize = null) {
  const targets = [];
  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d');
  offscreen.width = width;
  offscreen.height = height;

  const fontSize = customFontSize || Math.min(width / 8, 60);
  offCtx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
  offCtx.fillStyle = 'white';
  offCtx.textAlign = 'center';
  offCtx.textBaseline = 'middle';
  offCtx.fillText(text, width / 2, height / 2);

  const imgData = offCtx.getImageData(0, 0, width, height).data;
  const step = Math.max(4, Math.floor(fontSize / 11));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (imgData[(y * width + x) * 4 + 3] > 128) {
        targets.push({ x, y, color: '#ff1744' });
      }
    }
  }
  return targets;
}

function createCombinedTextTargets() {
  const targets = [];
  const addTextToTargets = (text, fontSize, xPos, yPos, align, baseline, color) => {
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    offscreen.width = width;
    offscreen.height = height;

    offCtx.font = `900 ${fontSize}px Arial, Helvetica, sans-serif`;
    offCtx.fillStyle = 'white';
    offCtx.textAlign = align;
    offCtx.textBaseline = baseline;
    offCtx.fillText(text, xPos, yPos);

    const imgData = offCtx.getImageData(0, 0, width, height).data;
    const step = Math.max(4, Math.floor(fontSize / 9));

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        if (imgData[(y * width + x) * 4 + 3] > 128) {
          targets.push({ x, y, color });
        }
      }
    }
  };

  const fontSizeHBBD = Math.min(width / 9, 50);
  addTextToTargets("HAPPY BIRTHDAY", fontSizeHBBD, width / 2, height * 0.12, 'center', 'middle', '#ff1744');

  const fontSizeName = Math.min(width / 9.5, 38);
  addTextToTargets("NGUYỄN THỊ", fontSizeName, width / 2, height * 0.23, 'center', 'middle', '#ff5252');
  addTextToTargets("CẨM TIÊN", fontSizeName, width / 2, height * 0.33, 'center', 'middle', '#ff5252');

  return targets;
}

function createTwoLineWishTargets() {
  const targets = [];
  const offscreen1 = document.createElement('canvas');
  const offCtx1 = offscreen1.getContext('2d');
  offscreen1.width = width;
  offscreen1.height = height;

  const fontSizeLine1 = Math.min(width / 10, 40);
  offCtx1.font = `900 ${fontSizeLine1}px Arial, Helvetica, sans-serif`;
  offCtx1.fillStyle = 'white';
  offCtx1.textAlign = 'center';
  offCtx1.textBaseline = 'middle';
  offCtx1.fillText("Always keep smiling!" , (width / 2) + 25, height * 0.25);

  const imgData1 = offCtx1.getImageData(0, 0, width, height).data;
  const step1 = Math.max(4, Math.floor(fontSizeLine1 / 8));

  for (let y = 0; y < height; y += step1) {
    for (let x = 0; x < width; x += step1) {
      if (imgData1[(y * width + x) * 4 + 3] > 128) {
        targets.push({ x, y, color: '#ff1744' });
      }
    }
  }

  return targets;
}

function createHeartTargets() {
  const targets = [];
  const count = 1000;
  const scale = Math.min(width, height) / 30;

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

    targets.push({
      x: width / 2 + x * scale,
      y: height / 2 + y * scale - 20,
      color: '#ff1744'
    });
  }
  return targets;
}

class BackgroundParticle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.radius = Math.random() * 1.8 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.15;
    this.alphaSpeed = 0.01 + Math.random() * 0.02;
    this.color = Math.random() > 0.5 ? '#ff1744' : '#ff4081';
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha += this.alphaSpeed;
    if (this.alpha > 0.8 || this.alpha < 0.15) this.alphaSpeed *= -1;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

class CakeParticle {
  constructor(offset, color) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.relX = offset.x;
    this.relY = offset.y;
    this.relZ = offset.z;
    this.radius = Math.random() * 2 + 1;
    this.color = color;
  }

  update() {
    const cosA = Math.cos(cakeAngle);
    const sinA = Math.sin(cakeAngle);
    const rotX = this.relX * cosA - this.relZ * sinA;
    const rotZ = this.relX * sinA + this.relZ * cosA;

    const scale = 300 / (300 + rotZ);
    const targetX = width / 2 + rotX * scale;
    const targetY = height / 2 + (this.relY + 200) * scale;

    this.x += (targetX - this.x) * 0.06;
    this.y += (targetY - this.y) * 0.06;
  }

  draw() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color;
    ctx.fill();
  }
}

class TextParticle {
  constructor() {
    this.resetOutside();
    this.radius = Math.random() * 0.8 + 2.4; 
    this.color = '#ff1744'; 
    this.targetX = null;
    this.targetY = null;
    this.speed = 0.18; 
    this.vx = 0;
    this.vy = 0;
    this.isExploding = false;
    this.alpha = 1;
  }

  resetOutside() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(width, height) * 1.2;
    this.x = width / 2 + Math.cos(angle) * dist;
    this.y = height / 2 + Math.sin(angle) * dist;
    this.isExploding = false;
  }

  update() {
    if (this.isExploding) {
      this.alpha = 1;
      this.x += this.vx;
      this.y += this.vy;
      this.vx *= 0.92;
      this.vy *= 0.92;
      return;
    }

    if (mode === 'SWIRL') {
      this.alpha += (1 - this.alpha) * 0.1;
      this.swirlAngle = (this.swirlAngle || Math.random() * Math.PI * 2) + 0.03;
      this.swirlRadius = (this.swirlRadius || Math.random() * Math.max(width, height) * 0.6) * 0.97;
      const tx = width / 2 + Math.cos(this.swirlAngle) * this.swirlRadius;
      const ty = height / 2 + Math.sin(this.swirlAngle) * this.swirlRadius;
      this.x += (tx - this.x) * 0.08;
      this.y += (ty - this.y) * 0.08;

    } else if (this.targetX !== null) {
      this.x += (this.targetX - this.x) * this.speed;
      this.y += (this.targetY - this.y) * this.speed;
      this.alpha += (1 - this.alpha) * 0.1;
    } else {
      this.alpha *= 0.85; 
      this.y += 1.5; 
    }
  }

  draw() {
    if (!ctx || this.alpha < 0.01) return;
    
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function initParticles() {
  backgroundParticles = [];
  textParticles = [];
  cakeParticles = [];
  heartDroneGroups = [];

  for (let i = 0; i < 350; i++) { 
    backgroundParticles.push(new BackgroundParticle());
  }

  for (let i = 0; i < 12; i++) { 
    heartDroneGroups.push(new LargeHeartDroneGroup());
  }

  for (let i = 0; i < 250; i++) { 
    let offset, color;
    if (i < 120) {
      const a = Math.random() * Math.PI * 2;
      offset = { x: Math.cos(a) * 110, y: 50, z: Math.sin(a) * 110 };
      color = '#ff1744';
    } else if (i < 200) {
      const a = Math.random() * Math.PI * 2;
      offset = { x: Math.cos(a) * 75, y: 15, z: Math.sin(a) * 75 };
      color = '#ff5252';
    } else {
      offset = { x: (Math.random() - 0.5) * 15, y: -25 - Math.random() * 25, z: (Math.random() - 0.5) * 15 };
      color = '#ff8a80';
    }
    cakeParticles.push(new CakeParticle(offset, color));
  }

  for (let i = 0; i < 3000; i++) { 
    textParticles.push(new TextParticle());
  }
}

function assignTargets(targets) {
  textParticles.forEach((p, i) => {
    p.isExploding = false;
    p.speed = mode === 'COUNTDOWN' ? 0.22 : 0.09; 
    if (i < targets.length) {
      p.targetX = targets[i].x;
      p.targetY = targets[i].y;
      p.color = targets[i].color;
    } else {
      p.targetX = null;
      p.targetY = null;
    }
  });
}

function transitionToText(newText, customFontSize = null) {
  const targets = createTextTargets(newText, customFontSize);
  textParticles.forEach((p, i) => {
    p.isExploding = false;
    p.speed = 0.14; 
    if (i < targets.length) {
      p.targetX = targets[i].x;
      p.targetY = targets[i].y;
      p.color = targets[i].color;
    } else {
      p.targetX = null;
      p.targetY = null;
    }
  });
}

function triggerDroneClusterExplosion(cardIndex, delayMs) {
  setTimeout(() => {
    const card = document.getElementById(`photoCard${cardIndex}`);
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    const subsetCount = Math.floor(textParticles.length / 4);
    const startIdx = cardIndex * subsetCount;
    const endIdx = startIdx + subsetCount;

    for (let i = startIdx; i < endIdx && i < textParticles.length; i++) {
      let p = textParticles[i];
      const angle = Math.random() * Math.PI * 2;
      const radius = 150 + Math.random() * 100;
      p.x = targetX + Math.cos(angle) * radius;
      p.y = targetY + Math.sin(angle) * radius;
      
      p.targetX = targetX;
      p.targetY = targetY;
      p.speed = 0.25;
      p.isExploding = false;
    }

    setTimeout(() => {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 35,
          startVelocity: 22,
          spread: 360,
          origin: { x: targetX / width, y: targetY / height }
        });
      }

      for (let i = startIdx; i < endIdx && i < textParticles.length; i++) {
        let p = textParticles[i];
        p.targetX = null;
        p.targetY = null;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        p.vx = Math.cos(angle) * speed;
        p.vy = Math.sin(angle) * speed;
        p.isExploding = true;
      }

      card.classList.add('show');

    }, 700);

  }, delayMs);
}

function startSwirlAndFormTwoLineWish(delayToText = 1200) {
  mode = 'SWIRL';
  const targets = createTwoLineWishTargets();
  assignTargets(targets);
  setTimeout(() => { mode = 'TEXT'; }, delayToText);
}

function formHeartShape() {
  mode = 'HEART';
  const targets = createHeartTargets();
  assignTargets(targets);
}

function triggerMegaFireworks() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) return clearInterval(interval);

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 30,
        startVelocity: 35,
        spread: 360,
        ticks: 60,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
    }
  }, 400);
}

function animate() {
  if (!ctx) return;
  cakeAngle += 0.015;

  if (mode === 'COUNTDOWN') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.25)';
    ctx.fillRect(0, 0, width, height);

    backgroundParticles.forEach(p => { p.update(); p.draw(); });
  }

  if (mode === 'TEXT' || mode === 'SWIRL' || mode === 'HEART') {
    heartDroneGroups.forEach(g => { g.update(); g.draw(); });
    cakeParticles.forEach(p => { p.update(); p.draw(); });
  }

  textParticles.forEach(p => { p.update(); p.draw(); });

  requestAnimationFrame(animate);
}

initParticles();
animate();

window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.createElement('div');
  overlay.id = 'startOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '999999';
  overlay.style.transition = 'opacity 0.6s ease';

  const btn = document.createElement('button');
  btn.innerHTML = '🎁 Mở Quà Ngay 🎁';
  btn.style.padding = '16px 36px';
  btn.style.fontSize = '22px';
  btn.style.fontWeight = 'bold';
  btn.style.color = '#fff';
  btn.style.backgroundColor = '#ff1744';
  btn.style.border = 'none';
  btn.style.borderRadius = '50px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 0 25px rgba(255, 23, 68, 0.6)';
  btn.style.transition = 'transform 0.2s ease, background-color 0.2s ease';

  btn.onmouseover = () => btn.style.transform = 'scale(1.08)';
  btn.onmouseout = () => btn.style.transform = 'scale(1)';

  btn.onclick = () => {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 600);
    runFirstPageSequence();
  };

  overlay.appendChild(btn);
  document.body.appendChild(overlay);
});