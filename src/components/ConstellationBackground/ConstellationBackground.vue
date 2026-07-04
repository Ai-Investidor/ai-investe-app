<script setup>
import { onMounted, onUnmounted, ref } from "vue";

const props = defineProps({
    connectionDistance: {
        type: Number,
        default: 125,
    },
    particleColor: {
        type: String,
        default: "rgba(0, 0, 0, 0.28)",
    },
    lineOpacity: {
        type: Number,
        default: 0.14,
    },
    lineRgb: {
        type: String,
        default: "0, 0, 0",
    },
    backgroundColor: {
        type: String,
        default: null,
    },
    densityDivisor: {
        type: Number,
        default: 9500,
    },
});

const canvasRef = ref(null);

let animationFrameId = null;
let resizeObserver = null;
let particles = [];

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 1.5 + 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = props.particleColor;
        ctx.fill();
    }
}

function resizeCanvas(canvas) {
    const parent = canvas.parentElement;
    if (!parent) return;

    const { width, height } = parent.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(width));
    canvas.height = Math.max(1, Math.floor(height));
}

function initParticles(canvas) {
    particles = [];
    const count = Math.floor(
        (canvas.width * canvas.height) / props.densityDivisor,
    );

    for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas));
    }
}

function connect(ctx) {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < props.connectionDistance) {
                const opacity =
                    (1 - distance / props.connectionDistance) *
                    props.lineOpacity;
                ctx.strokeStyle = `rgba(${props.lineRgb}, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

function createAnimate(canvas, ctx) {
    return function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (props.backgroundColor) {
            ctx.fillStyle = props.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        for (const particle of particles) {
            particle.update();
            particle.draw(ctx);
        }

        connect(ctx);
        animationFrameId = requestAnimationFrame(animate);
    };
}

onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = createAnimate(canvas, ctx);

    const handleResize = () => {
        resizeCanvas(canvas);
        initParticles(canvas);
    };

    handleResize();

    resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas.parentElement ?? canvas);

    animationFrameId = requestAnimationFrame(animate);
});

onUnmounted(() => {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
    }

    resizeObserver?.disconnect();
    particles = [];
});
</script>

<template>
    <canvas
        ref="canvasRef"
        class="pointer-events-none block h-full w-full"
        aria-hidden="true"
    />
</template>
