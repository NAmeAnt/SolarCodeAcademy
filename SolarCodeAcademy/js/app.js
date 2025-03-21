// Khởi tạo các biến toàn cục
let scene, camera, renderer, controls;
let planets = [], satellites = [], orbits = [], satelliteOrbits = [];
let selectedPlanet = null;
let raycaster, mouse;
let data;
let starField;
let glowMaterials = [];
let showingSatellites = false;

// Khởi tạo ứng dụng
async function init() {
    // Hiển thị màn hình loading
    document.getElementById('loading').classList.remove('hidden');
    
    // Tải dữ liệu
    data = await loadData();
    
    // Thiết lập Three.js
    setupThreeJS();
    
    // Thiết lập sự kiện
    setupEventListeners();
    
    // Tạo các đối tượng 3D
    createSolarSystem();
    
    // Bắt đầu animation loop
    animate();
    
    // Ẩn màn hình loading
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1500);
}

// Thiết lập Three.js
function setupThreeJS() {
    // Tạo scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Tạo camera
    camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.z = 40;
    
    // Tạo renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    
    // Tạo controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 15;
    controls.maxDistance = 60;
    
    // Tạo raycaster cho tương tác
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Thêm ánh sáng
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    
    // Thêm particles sao làm nền
    createStarfield();
    
    // Xử lý resize cửa sổ
    window.addEventListener('resize', onWindowResize);
}

// Tạo hệ mặt trời
function createSolarSystem() {
    // Tạo hành tinh từ dữ liệu
    data.Fields.forEach(field => {
        createPlanet(field);
    });
    
    // Tạo vệ tinh từ dữ liệu nhưng ẩn chúng ban đầu
    data.Languages.forEach(language => {
        createSatellite(language);
    });
    
    // Ẩn tất cả vệ tinh ban đầu
    hideSatellites();
}

// Tạo hành tinh
function createPlanet(field) {
    // Tạo geometry và material cho hành tinh
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshBasicMaterial({ 
        color: parseInt(field.Color),
        transparent: true,
        opacity: 0.8
    });
    
    // Tạo mesh cho hành tinh
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(field.Position[0], field.Position[1], field.Position[2]);
    planet.userData = {
        type: 'planet',
        fieldID: field.FieldID,
        name: field.Name,
        description: field.Description,
        color: field.Color
    };
    
    // Thêm hiệu ứng glow cho hành tinh
    addGlowEffect(planet, parseInt(field.Color), 2.5);
    
    // Thêm hành tinh vào scene
    scene.add(planet);
    planets.push(planet);
    
    // Tạo quỹ đạo cho hành tinh
    createOrbit(field.Position, Math.sqrt(field.Position[0] * field.Position[0] + field.Position[1] * field.Position[1]));
}

// Tạo vệ tinh
function createSatellite(language) {
    // Tìm hành tinh cha
    const parentField = data.Fields.find(field => field.FieldID === language.FieldID);
    if (!parentField) return;
    
    // Tạo geometry và material cho vệ tinh
    const geometry = new THREE.SphereGeometry(0.7, 24, 24);
    const material = new THREE.MeshBasicMaterial({ 
        color: parseInt(parentField.Color),
        transparent: true,
        opacity: 0.9
    });
    
    // Tạo mesh cho vệ tinh
    const satellite = new THREE.Mesh(geometry, material);
    
    // Tính toán vị trí ban đầu trên quỹ đạo
    const angle = Math.random() * Math.PI * 2;
    const radius = language.OrbitRadius;
    const parentPosition = new THREE.Vector3(
        parentField.Position[0],
        parentField.Position[1],
        parentField.Position[2]
    );
    
    // Đặt vị trí ban đầu
    satellite.position.set(
        parentPosition.x + radius * Math.cos(angle),
        parentPosition.y,
        parentPosition.z + radius * Math.sin(angle)
    );
    
    // Lưu thông tin vệ tinh
    satellite.userData = {
        type: 'satellite',
        languageID: language.LanguageID,
        name: language.Name,
        icon: language.Icon,
        fieldID: language.FieldID,
        parentPlanet: parentField,
        orbitData: {
            center: parentPosition,
            radius: radius,
            angle: angle,
            speed: language.OrbitSpeed
        }
    };
    
    // Thêm hiệu ứng glow cho vệ tinh
    addGlowEffect(satellite, parseInt(parentField.Color), 1);
    
    // Thêm vệ tinh vào scene
    scene.add(satellite);
    satellites.push(satellite);
    
    // Tạo quỹ đạo cho vệ tinh
    createSatelliteOrbit(parentPosition, radius);
}

// Thêm hiệu ứng glow cho đối tượng
function addGlowEffect(object, color, size) {
    const glowGeometry = new THREE.SphereGeometry(size, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    object.add(glowMesh);
    glowMaterials.push(glowMaterial);
    
    // Thêm một lớp glow thứ hai để tăng cường hiệu ứng
    const glowGeometry2 = new THREE.SphereGeometry(size * 1.2, 32, 32);
    const glowMaterial2 = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.05,
        side: THREE.BackSide
    });
    
    const glowMesh2 = new THREE.Mesh(glowGeometry2, glowMaterial2);
    object.add(glowMesh2);
    glowMaterials.push(glowMaterial2);
}

// Tạo quỹ đạo cho hành tinh
function createOrbit(position, radius) {
    const segments = 128;
    const orbitGeometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const y = radius * Math.sin(theta);
        vertices.push(x, y, 0);
    }
    
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3
    });
    
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Xoay quỹ đạo để nằm ngang
    scene.add(orbit);
    orbits.push(orbit);
}

// Tạo quỹ đạo cho vệ tinh
function createSatelliteOrbit(center, radius) {
    const segments = 64;
    const orbitGeometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        vertices.push(x, 0, z);
    }
    
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.2
    });
    
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.position.copy(center);
    orbit.visible = false; // Ẩn ban đầu
    scene.add(orbit);
    satelliteOrbits.push(orbit);
    
    return orbit;
}

// Tạo particles sao làm nền
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    
    // Sử dụng texture cho các ngôi sao để cải thiện hiệu suất
    const textureLoader = new THREE.TextureLoader();
    const starTexture = textureLoader.load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAb0lEQVQYlWNkYGBgKJ254f9/JkYGYsA/BgYGRoaCSeH/GRgYGIpmbPzPwMDA8P//fwZGRkYGBgYGhvy+tf+ZGBgYGJgYGBgYiiZH/GdiYGBgYGBgYGAsmhTxn4mBgYHh////DEyMjAwMDAwMJVPX/QcAoS4cEQAd4sIAAAAASUVORK5CYII=');
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 0.15,
        map: starTexture,
        transparent: true,
        opacity: 0.8,
        vertexColors: false,
        sizeAttenuation: true
    });
    
    // Giảm số lượng sao để cải thiện hiệu suất
    const starsCount = 5000; // Giảm từ 10000 xuống 5000
    const starsVertices = [];
    
    for (let i = 0; i < starsCount; i++) {
        // Giới hạn phạm vi để các ngôi sao gần hơn
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// Hiển thị vệ tinh cho hành tinh được chọn
function showSatellitesForPlanet(planet) {
    // Ẩn tất cả vệ tinh trước
    hideSatellites();
    
    // Hiển thị vệ tinh cho hành tinh được chọn
    const fieldID = planet.userData.fieldID;
    satellites.forEach((satellite, index) => {
        if (satellite.userData.fieldID === fieldID) {
            satellite.visible = true;
            satelliteOrbits[index].visible = true;
        }
    });
    
    showingSatellites = true;
}

// Ẩn tất cả vệ tinh
function hideSatellites() {
    satellites.forEach(satellite => {
        satellite.visible = false;
    });
    
    satelliteOrbits.forEach(orbit => {
        orbit.visible = false;
    });
    
    showingSatellites = false;
}

// Thiết lập sự kiện
function setupEventListeners() {
    // Sự kiện click chuột
    renderer.domElement.addEventListener('click', onMouseClick);
    
    // Sự kiện cho nút cài đặt
    document.getElementById('settings-btn').addEventListener('click', toggleSettings);
    
    // Sự kiện cho nút đóng panel thông tin
    document.getElementById('close-info').addEventListener('click', closeInfoPanel);
    
    // Sự kiện cho checkbox hiển thị lộ trình
    document.getElementById('show-paths').addEventListener('change', togglePathsVisibility);
    
    // Sự kiện cho nút donate
    document.getElementById('donate-btn').addEventListener('click', () => {
        window.open('https://www.patreon.com', '_blank');
    });
}

// Xử lý sự kiện click chuột
function onMouseClick(event) {
    // Tính toán vị trí chuột
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Cập nhật raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Kiểm tra va chạm với hành tinh
    const planetIntersects = raycaster.intersectObjects(planets);
    if (planetIntersects.length > 0) {
        selectPlanet(planetIntersects[0].object);
        return;
    }
    
    // Kiểm tra va chạm với vệ tinh
    const satelliteIntersects = raycaster.intersectObjects(satellites.filter(s => s.visible));
    if (satelliteIntersects.length > 0) {
        selectSatellite(satelliteIntersects[0].object);
        return;
    }
}

// Xử lý sự kiện resize cửa sổ
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Chọn hành tinh
function selectPlanet(planet) {
    console.log("Đã chọn hành tinh:", planet.userData.name);
    
    // Nếu đã chọn hành tinh này rồi, không làm gì cả
    if (selectedPlanet === planet) return;
    
    selectedPlanet = planet;
    
    // Hiển thị vệ tinh cho hành tinh được chọn
    showSatellitesForPlanet(planet);
    
    // Di chuyển camera đến hành tinh được chọn
    const targetPosition = new THREE.Vector3().copy(planet.position);
    
    // Tạo animation cho camera
    new TWEEN.Tween(camera.position)
        .to({
            x: targetPosition.x + 10,
            y: targetPosition.y + 5,
            z: targetPosition.z + 15
        }, 1000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
    
    // Tạo animation cho controls.target
    new TWEEN.Tween(controls.target)
        .to({
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z
        }, 1000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
}

// Chọn vệ tinh
function selectSatellite(satellite) {
    console.log("Đã chọn vệ tinh:", satellite.userData.name);
    
    // Hiển thị panel thông tin
    document.getElementById('info-panel').classList.remove('hidden');
    document.getElementById('info-title').textContent = satellite.userData.name;
    
    // Tìm lộ trình học cho ngôn ngữ này
    const languageID = satellite.userData.languageID;
    const learningPath = data.LearningPaths.find(path => path.LanguageID === languageID);
    
    if (learningPath) {
        // Hiển thị mô tả lộ trình
        const pathDescription = document.getElementById('path-description');
        pathDescription.textContent = learningPath.Description;
        
        // Hiển thị thông tin lộ trình
        const modulesContainer = document.getElementById('modules-container');
        modulesContainer.innerHTML = '';
        
        // Tìm các module cho lộ trình này
        const modules = data.Modules.filter(module => module.PathID === learningPath.PathID)
            .sort((a, b) => a.Order - b.Order);
        
        // Hiển thị các module
        modules.forEach(module => {
            const moduleElement = document.createElement('div');
            
            // Thêm class dựa trên thứ tự module
            let moduleClass = '';
            switch(module.Order) {
                case 1: moduleClass = 'module-syntax'; break;
                case 2: moduleClass = 'module-project'; break;
                case 3: moduleClass = 'module-advanced'; break;
                case 4: moduleClass = 'module-practice'; break;
                case 5: moduleClass = 'module-expert'; break;
            }
            
            moduleElement.className = `module ${moduleClass}`;
            
            const titleElement = document.createElement('div');
            titleElement.className = 'module-title';
            titleElement.textContent = module.Title;
            
            const contentElement = document.createElement('div');
            contentElement.className = 'module-content';
            contentElement.textContent = module.Content;
            
            moduleElement.appendChild(titleElement);
            moduleElement.appendChild(contentElement);
            modulesContainer.appendChild(moduleElement);
            
            // Nếu module là điểm nhánh, thêm các nhánh gợi ý
            if (module.IsBranchPoint) {
                // Tìm các nhánh gợi ý cho module này
                const branches = data.Branches.filter(branch => branch.ModuleID === module.ModuleID);
                
                if (branches.length > 0) {
                    const branchesContainer = document.getElementById('branches-container');
                    branchesContainer.innerHTML = '';
                    
                    branches.forEach(branch => {
                        const branchElement = document.createElement('div');
                        branchElement.className = 'branch';
                        
                        const titleElement = document.createElement('div');
                        titleElement.className = 'branch-title';
                        
                        // Tìm lĩnh vực được gợi ý
                        const suggestedField = data.Fields.find(field => field.FieldID === branch.SuggestedFieldID);
                        if (suggestedField) {
                            titleElement.textContent = suggestedField.Name;
                            branchElement.style.borderLeft = `4px solid ${suggestedField.Color}`;
                            
                            // Thêm sự kiện click để chuyển đến hành tinh tương ứng
                            branchElement.addEventListener('click', () => {
                                const targetPlanet = planets.find(p => p.userData.fieldID === suggestedField.FieldID);
                                if (targetPlanet) {
                                    selectPlanet(targetPlanet);
                                    closeInfoPanel();
                                }
                            });
                        }
                        
                        const reasonElement = document.createElement('div');
                        reasonElement.className = 'branch-reason';
                        reasonElement.textContent = branch.Reason;
                        
                        branchElement.appendChild(titleElement);
                        branchElement.appendChild(reasonElement);
                        branchesContainer.appendChild(branchElement);
                    });
                }
            }
        });
    }
}

// Hiển thị/ẩn panel cài đặt
function toggleSettings() {
    const settingsPanel = document.getElementById('settings-panel');
    settingsPanel.classList.toggle('hidden');
}

// Đóng panel thông tin
function closeInfoPanel() {
    document.getElementById('info-panel').classList.add('hidden');
}

// Hiển thị/ẩn lộ trình
function togglePathsVisibility(event) {
    const showPaths = event.target.checked;
    
    // Hiển thị/ẩn quỹ đạo vệ tinh
    if (showingSatellites) {
        satelliteOrbits.forEach(orbit => {
            orbit.visible = showPaths && orbit.visible;
        });
    }
    
    // Hiển thị/ẩn quỹ đạo hành tinh
    orbits.forEach(orbit => {
        orbit.visible = showPaths;
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Cập nhật controls
    controls.update();
    
    // Cập nhật TWEEN
    TWEEN.update();
    
    // Xoay hành tinh - giảm tần suất cập nhật để tối ưu hiệu suất
    planets.forEach(planet => {
        planet.rotation.y += 0.003;
    });
    
    // Xoay và di chuyển vệ tinh - chỉ cập nhật khi hiển thị
    satellites.forEach(satellite => {
        if (satellite.visible) {
            satellite.rotation.y += 0.008;
            
            // Cập nhật vị trí vệ tinh trên quỹ đạo
            if (satellite.userData.orbitData) {
                const data = satellite.userData.orbitData;
                data.angle += data.speed * 0.8; // Giảm tốc độ để tối ưu hiệu suất
                
                satellite.position.x = data.center.x + data.radius * Math.cos(data.angle);
                satellite.position.z = data.center.z + data.radius * Math.sin(data.angle);
            }
        }
    });
    
    // Hiệu ứng nhấp nháy cho glow - giảm tần suất cập nhật
    const time = Date.now() * 0.0005; // Giảm tốc độ nhấp nháy
    glowMaterials.forEach(material => {
        material.opacity = 0.1 + 0.05 * Math.sin(time);
    });
    
    // Xoay nhẹ starfield để tạo hiệu ứng chuyển động - giảm tốc độ
    if (starField) {
        starField.rotation.y += 0.00005;
    }
    
    // Render scene
    renderer.render(scene, camera);
}

// Khởi chạy ứng dụng khi trang đã tải xong
window.addEventListener('load', init);
