// heart_easter_egg.js - Based on original Python code conversion
class HeartAnimation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.CANVAS_WIDTH = canvas.width;
        this.CANVAS_HEIGHT = canvas.height;
        this.CANVAS_CENTER_X = this.CANVAS_WIDTH / 2;
        this.CANVAS_CENTER_Y = this.CANVAS_HEIGHT / 2;
        this.IMAGE_ENLARGE = 11;
        this.HEART_COLOR = "#FF99CC";
        
        this._points = new Set();
        this._edge_diffusion_point = new Set();
        this._center_diffusion_points = new Set();
        this.all_points = {};
        this.random_halo = 1000;
        this.generate_frame = 20;
        
        this.build(2000);
        for (let frame = 0; frame < this.generate_frame; frame++) {
            this.calc(frame);
        }
        
        this.render_frame = 0;
        this.animationId = null;
    }
    
    // Original Python heart_function
    heart_function(t, shrink_ratio = this.IMAGE_ENLARGE) {
        const x = 16 * (Math.sin(t) ** 3);
        const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
        
        const scaled_x = x * shrink_ratio;
        const scaled_y = y * shrink_ratio;
        
        const final_x = scaled_x + this.CANVAS_CENTER_X;
        const final_y = scaled_y + this.CANVAS_CENTER_Y;
        
        return [Math.floor(final_x), Math.floor(final_y)];
    }
    
    // Original Python scatter_inside function
    scatter_inside(x, y, beta = 0.15) {
        const ratio_x = -beta * Math.log(Math.random());
        const ratio_y = -beta * Math.log(Math.random());
        const dx = ratio_x * (x - this.CANVAS_CENTER_X);
        const dy = ratio_y * (y - this.CANVAS_CENTER_Y);
        return [x - dx, y - dy];
    }
    
    // Original Python shrink function
    shrink(x, y, ratio) {
        const force = -1 / (((x - this.CANVAS_CENTER_X) ** 2 +
                           (y - this.CANVAS_CENTER_Y) ** 2) ** 0.6);
        const dx = ratio * force * (x - this.CANVAS_CENTER_X);
        const dy = ratio * force * (y - this.CANVAS_CENTER_Y);
        return [x - dx, y - dy];
    }
    
    // Original Python curve function
    curve(p) {
        return 2 * (2 * Math.sin(4 * p)) / (2 * Math.PI);
    }
    
    // Original Python build method
    build(number) {
        // Create base points
        for (let i = 0; i < number; i++) {
            const t = Math.random() * 2 * Math.PI;
            const [x, y] = this.heart_function(t);
            this._points.add(`${x},${y}`);
        }
        
        // Create edge diffusion points
        const pointsArray = Array.from(this._points);
        for (const pointStr of pointsArray) {
            const [_x, _y] = pointStr.split(',').map(Number);
            for (let j = 0; j < 3; j++) {
                const [x, y] = this.scatter_inside(_x, _y, 0.5);
                this._edge_diffusion_point.add(`${x},${y}`);
            }
        }
        
        // Create center diffusion points
        for (let i = 0; i < 4000; i++) {
            const randomPointStr = pointsArray[Math.floor(Math.random() * pointsArray.length)];
            const [x, y] = randomPointStr.split(',').map(Number);
            const [new_x, new_y] = this.scatter_inside(x, y, 0.17);
            this._center_diffusion_points.add(`${new_x},${new_y}`);
        }
    }
    
    // Original Python calc_position method
    calc_position(x, y, ratio) {
        const force = 1 / (((x - this.CANVAS_CENTER_X) ** 2 +
                          (y - this.CANVAS_CENTER_Y) ** 2) ** 0.520);
        const dx = ratio * force * (x - this.CANVAS_CENTER_X) + (Math.random() * 2 - 1);
        const dy = ratio * force * (y - this.CANVAS_CENTER_Y) + (Math.random() * 2 - 1);
        return [x - dx, y - dy];
    }
    
    // Original Python calc method
    calc(generate_frame) {
        const ratio = 10 * this.curve(generate_frame / 10 * Math.PI);
        const halo_radius = Math.floor(4 + 6 * (1 + this.curve(generate_frame / 10 * Math.PI)));
        const halo_number = Math.floor(3000 + 4000 * Math.abs(this.curve(generate_frame / 10 * Math.PI) ** 2));
        
        const all_points = [];
        const heart_halo_point = new Set();
        
        // Halo points
        for (let i = 0; i < halo_number; i++) {
            const t = Math.random() * 2 * Math.PI;
            let [x, y] = this.heart_function(t, 11.6);
            [x, y] = this.shrink(x, y, halo_radius);
            
            const pointKey = `${x},${y}`;
            if (!heart_halo_point.has(pointKey)) {
                heart_halo_point.add(pointKey);
                x += Math.floor(Math.random() * 29) - 14;
                y += Math.floor(Math.random() * 31) - 16;
                const size = [1, 2, 2][Math.floor(Math.random() * 3)];
                all_points.push([x, y, size]);
            }
        }
        
        // Base points
        for (const pointStr of this._points) {
            const [x, y] = pointStr.split(',').map(Number);
            const [new_x, new_y] = this.calc_position(x, y, ratio);
            const size = Math.floor(Math.random() * 2) + 1;
            all_points.push([new_x, new_y, size]);
        }
        
        // Edge diffusion points
        for (const pointStr of this._edge_diffusion_point) {
            const [x, y] = pointStr.split(',').map(Number);
            const [new_x, new_y] = this.calc_position(x, y, ratio);
            const size = Math.floor(Math.random() * 2) + 1;
            all_points.push([new_x, new_y, size]);
        }
        
        // Center diffusion points
        for (const pointStr of this._center_diffusion_points) {
            const [x, y] = pointStr.split(',').map(Number);
            const [new_x, new_y] = this.calc_position(x, y, ratio);
            const size = Math.floor(Math.random() * 2) + 1;
            all_points.push([new_x, new_y, size]);
        }
        
        this.all_points[generate_frame] = all_points;
    }
    
    // Original Python render method
    render() {
        const points = this.all_points[this.render_frame % this.generate_frame] || [];
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.CANVAS_WIDTH, this.CANVAS_HEIGHT);
        
        // Draw all points
        for (const [x, y, size] of points) {
            this.ctx.fillStyle = this.HEART_COLOR;
            this.ctx.fillRect(x, y, size, size);
        }
        
        this.render_frame++;
    }
    
    // Start animation
    start() {
        if (this.animationId) return;
        
        const animate = () => {
            this.render();
            this.animationId = requestAnimationFrame(animate);
        };
        
        // Reduce frame rate to match original Python speed
        const slowAnimate = () => {
            this.render();
            this.animationId = setTimeout(slowAnimate, 160); // Original was 160ms
        };
        
        slowAnimate();
    }
    
    // Stop animation
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            clearTimeout(this.animationId);
            this.animationId = null;
        }
    }
}

// Easter egg management class
class HeartEasterEgg {
    constructor() {
        this.animation = null;
        this.init();
    }
    
    init() {
        this.createElements();
        this.bindEvents();
    }
    
    createElements() {
        // Create easter egg button
        const button = document.createElement('button');
        button.id = 'heartEasterEggBtn';
        button.innerHTML = '🐱';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #ADBC9F;
            color: #12372A;
            border: none;
            cursor: pointer;
            font-size: 20px;
            z-index: 9999;
            opacity: 0.3;
            transition: opacity 0.3s;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(button);
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'heartEasterEggModal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        `;
        
        modal.innerHTML = `
            <div style="color: white; margin-bottom: 20px; font-size: 24px; text-align: center;">
                <div style="font-size: 32px; margin-bottom: 10px;">😸</div>
                <div>彩蛋</div>
                <div style="font-size: 14px; opacity: 0.7; margin-top: 5px;">
                    基於Python愛心動畫轉換
                </div>
            </div>
            
            <canvas id="heartCanvas" width="640" height="480" style="
                border: 1px solid #666;
                background-color: black;
            "></canvas>
            
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button id="closeHeartBtn" style="
                    padding: 10px 30px;
                    background-color: #FF99CC;
                    color: #000;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">
                    關閉
                </button>
            </div>
            
            <div style="color: #888; margin-top: 20px; font-size: 12px;">
                原始Python代碼轉換至JavaScript Canvas
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            #heartEasterEggBtn:hover {
                opacity: 1 !important;
                transform: scale(1.1);
            }
            
            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-5px); }
                100% { transform: translateY(0px); }
            }
            
            #heartEasterEggBtn {
                animation: float 3s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }
    
    bindEvents() {
        const btn = document.getElementById('heartEasterEggBtn');
        const modal = document.getElementById('heartEasterEggModal');
        const closeBtn = document.getElementById('closeHeartBtn');
        
        btn.addEventListener('click', () => this.show());
        closeBtn.addEventListener('click', () => this.hide());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide();
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                this.hide();
            }
        });
    }
    
    show() {
        const modal = document.getElementById('heartEasterEggModal');
        const canvas = document.getElementById('heartCanvas');
        
        modal.style.display = 'flex';
        
        // Create animation
        if (!this.animation) {
            this.animation = new HeartAnimation(canvas);
        }
        
        this.animation.start();
    }
    
    hide() {
        const modal = document.getElementById('heartEasterEggModal');
        modal.style.display = 'none';
        
        // Stop animation
        if (this.animation) {
            this.animation.stop();
        }
    }
}

// Initialize easter egg
document.addEventListener('DOMContentLoaded', () => {
    // Delay loading to avoid affecting main page load
    setTimeout(() => {
        new HeartEasterEgg();
        console.log('😸彩蛋已加載！');
    }, 2000);
});