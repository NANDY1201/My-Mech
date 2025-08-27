// code.js - extracted JS for MY MECHANIC app

// Global state
let scene, camera, renderer;
let currentVehicle = '';
let currentService = '';

// ---------- Three.js ----------
function initThreeJS() {
  try {
    const container = document.getElementById('three-container');
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    createFloatingElements();
    camera.position.z = 5;
    animate();
    setTimeout(createParticles, 1000);
  } catch (e) {
    console.warn('Three.js failed to initialize:', e);
  }
}

function createFloatingElements() {
  // Car
  const carGroup = new THREE.Group();
  const bodyGeometry = new THREE.BoxGeometry(2, 0.8, 4);
  const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x6366f1, transparent: true, opacity: 0.8 });
  const carBody = new THREE.Mesh(bodyGeometry, bodyMaterial);
  carGroup.add(carBody);

  const topGeometry = new THREE.BoxGeometry(1.5, 0.6, 2);
  const topMaterial = new THREE.MeshPhongMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.8 });
  const carTop = new THREE.Mesh(topGeometry, topMaterial);
  carTop.position.y = 0.7; carGroup.add(carTop);

  const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x1f2937 });
  [[-0.8,-0.6,1.2],[0.8,-0.6,1.2],[-0.8,-0.6,-1.2],[0.8,-0.6,-1.2]].forEach(pos=>{
    const w = new THREE.Mesh(wheelGeometry, wheelMaterial);
    w.position.set(...pos); w.rotation.z = Math.PI / 2; carGroup.add(w);
  });
  carGroup.position.set(-3, 0, -2); carGroup.scale.set(0.3,0.3,0.3);
  scene.add(carGroup);

  // Tool
  const toolGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
  const toolMaterial = new THREE.MeshPhongMaterial({ color: 0xef4444, transparent: true, opacity: 0.9 });
  const tool = new THREE.Mesh(toolGeometry, toolMaterial);
  tool.position.set(3, 1, -1); tool.scale.set(0.3,0.3,0.3); scene.add(tool);

  // Orb
  const orbGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const orbMaterial = new THREE.MeshPhongMaterial({ color: 0x8b5cf6, emissive: 0x4c1d95, transparent: true, opacity: 0.7 });
  const orb = new THREE.Mesh(orbGeometry, orbMaterial);
  orb.position.set(0, 0, -3); scene.add(orb);

  // Lights
  scene.add(new THREE.AmbientLight(0x404040, 0.3));
  const p1 = new THREE.PointLight(0x8b5cf6, 1, 100); p1.position.set(10,10,10); scene.add(p1);
  const p2 = new THREE.PointLight(0x6366f1, 0.5, 100); p2.position.set(-10,-10,-10); scene.add(p2);

  // Store references
  window.carGroup = carGroup; window.tool = tool; window.orb = orb;
}

function animate() {
  requestAnimationFrame(animate);
  if (!renderer || !camera) return;

  const time = Date.now() * 0.001;
  if (window.carGroup) {
    window.carGroup.rotation.y = Math.sin(time) * 0.2;
    window.carGroup.position.y = Math.sin(time * 2) * 0.1;
  }
  if (window.tool) {
    window.tool.rotation.x = time * 0.5;
    window.tool.rotation.z = time * 0.3;
  }
  if (window.orb) {
    const s = 1 + Math.sin(time * 3) * 0.1;
    window.orb.scale.setScalar(s);
  }
  renderer.render(scene, camera);
}

function createParticles() {
  if (!scene) return;
  const particleCount = 50;
  const particles = new THREE.Group();
  for (let i = 0; i < particleCount; i++) {
    const geometry = new THREE.SphereGeometry(0.02, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random(), 0.7, 0.5),
      transparent: true, opacity: 0.6
    });
    const particle = new THREE.Mesh(geometry, material);
    particle.position.set((Math.random()-0.5)*20,(Math.random()-0.5)*20,(Math.random()-0.5)*20);
    particles.add(particle);
  }
  scene.add(particles);

  function animateParticles() {
    particles.children.forEach((p, i) => {
      p.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
      p.rotation.x += 0.01; p.rotation.y += 0.01;
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ---------- Screen management ----------
function showWelcome() { hideAllScreens(); document.getElementById('welcomeScreen').classList.remove('hidden'); }
function showPricing() { hideAllScreens(); document.getElementById('pricingScreen').classList.remove('hidden'); }
function showMechanicPricing() { hideAllScreens(); document.getElementById('mechanicPricingScreen').classList.remove('hidden'); }
function showCustomerDashboard() { hideAllScreens(); document.getElementById('customerDashboard').classList.remove('hidden'); populateServices(); }
function hideAllScreens() { ['welcomeScreen','pricingScreen','mechanicPricingScreen','customerDashboard'].forEach(id => document.getElementById(id).classList.add('hidden')); }

// ---------- Plans & Auth (demo) ----------
function selectPlan(plan) { alert(`Selected ${plan} plan! Redirecting to registration...`); showCustomerDashboard(); }
function joinMechanic() { alert('Welcome to MY MECHANIC! Registration process started...'); showCustomerDashboard(); }
function logout() { showWelcome(); }

// ---------- Emergency Modal ----------
const emergencyModal = document.getElementById('emergencyModal');
function showEmergencyModal() { emergencyModal.classList.remove('hidden'); document.body.classList.add('no-scroll'); emergencyModal.querySelector('.glass').focus(); }
function hideEmergencyModal() { emergencyModal.classList.add('hidden'); document.body.classList.remove('no-scroll'); currentVehicle = ''; currentService = ''; resetModalButtons(); }

function selectVehicle(type) {
  currentVehicle = type;
  document.getElementById('carBtn').classList.remove('bg-purple-600');
  document.getElementById('bikeBtn').classList.remove('bg-purple-600');
  document.getElementById(type + 'Btn').classList.add('bg-purple-600');
}

function selectService(type) {
  currentService = type;
  ['batteryBtn','tireBtn','engineBtn'].forEach(id => document.getElementById(id).classList.remove('bg-purple-600'));
  document.getElementById(type + 'Btn').classList.add('bg-purple-600');
}

function requestEmergencyService() {
  if (!currentVehicle || !currentService) { alert('Please select both vehicle and service type!'); return; }
  alert(`Emergency service requested!\n\n🚗 Vehicle: ${currentVehicle}\n🔧 Service: ${currentService}\n\nA mechanic will contact you within 15 minutes!`);
  hideEmergencyModal();
}

function resetModalButtons() {
  ['carBtn','bikeBtn','batteryBtn','tireBtn','engineBtn'].forEach(id => document.getElementById(id).classList.remove('bg-purple-600'));
}

// ---------- Services ----------
function populateServices() {
  const services = [
    { icon: '🔋', name: 'Battery Service', price: '₹299', time: '15 mins', gradient: 'from-blue-500 to-cyan-500' },
    { icon: '🛞', name: 'Tire Repair', price: '₹399', time: '30 mins', gradient: 'from-green-500 to-emerald-500' },
    { icon: '⚙️', name: 'Engine Check', price: '₹699', time: '45 mins', gradient: 'from-purple-500 to-violet-500' },
    { icon: '❄️', name: 'AC Service', price: '₹899', time: '60 mins', gradient: 'from-cyan-500 to-blue-500' },
    { icon: '🚗', name: 'Full Service', price: '₹1299', time: '2 hours', gradient: 'from-pink-500 to-rose-500' },
    { icon: '🚨', name: 'Emergency Tow', price: '₹15/km', time: 'Immediate', gradient: 'from-red-500 to-pink-500' }
  ];

  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = services.map(s => `
    <div class="glass p-6 rounded-3xl hover:scale-105 transform transition-all duration-300 cursor-pointer glow">
      <div class="text-4xl mb-4 float">${s.icon}</div>
      <h3 class="font-bold text-xl mb-2 text-white">${s.name}</h3>
      <div class="flex justify-between items-center text-sm mb-4"><span class="text-green-400 font-bold">${s.price}</span><span class="text-gray-400">⏱️ ${s.time}</span></div>
      <button data-service="${s.name}" class="book-btn w-full py-3 bg-gradient-to-r ${s.gradient} rounded-xl hover:scale-105 transition-all font-bold">Book Now</button>
    </div>
  `).join('');

  grid.querySelectorAll('.book-btn').forEach(btn => {
    btn.addEventListener('click', () => bookService(btn.getAttribute('data-service')));
  });
}

function bookService(serviceName) {
  alert(`Service "${serviceName}" booked successfully!\n\nYou will receive a confirmation call within 5 minutes.`);
}

// ---------- Input & Window handlers ----------
function onWindowResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
window.addEventListener('resize', onWindowResize);

document.addEventListener('mousemove', (e) => {
  if (!camera || !scene) return;
  const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  camera.position.x += (mouseX * 0.1 - camera.position.x) * 0.05;
  camera.position.y += (mouseY * 0.1 - camera.position.y) * 0.05;
  camera.lookAt(scene.position);
});

document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'Escape': hideEmergencyModal(); break;
    case 'e': case 'E':
      if (!document.getElementById('customerDashboard').classList.contains('hidden')) { showEmergencyModal(); }
      break;
    case 'h': case 'H': showWelcome(); break;
  }
});

// ---------- Init ----------
window.addEventListener('load', () => {
  initThreeJS();
  showWelcome();
  console.log('🚗 MY MECHANIC Premium App Loaded!');
  console.log('💡 Keyboard shortcuts: H (Home), E (Emergency in dashboard), ESC (Close modals)');
});
