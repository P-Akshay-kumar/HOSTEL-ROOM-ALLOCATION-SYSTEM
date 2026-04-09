
let currentUser = null;
let currentUserRole = null;
let selectedRoom = null;
let selectedChangeRoom = null;

function getTodayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function validateFullName(name) {
    if (!name || name.length < 2 || name.length > 20) return 'Name must be 2–20 characters.';
    if (!/^[A-Za-z\s.]+$/.test(name)) return 'Name must contain only letters, spaces, and periods.';
    if (/^\s+$/.test(name)) return 'Name cannot be only spaces.';
    return null;
}
function validateRollNumber(roll) {
    if (!roll) return 'Roll number is required.';
    if (!/^[a-zA-Z0-9]{10}$/.test(roll))
        return 'Roll number must be exactly 10 characters (letters and numbers only).';
    return null;
}


function validatePassword(pw) {
    const errors = [];
    if (pw.length < 12) errors.push('at least 12 characters');
    if (!/[A-Z]/.test(pw)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(pw)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(pw)) errors.push('one number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pw)) errors.push('one special character (!@#$%^&*...)');
    if (errors.length > 0) return 'Password must have ' + errors.join(', ') + '.';
    return null;
}

function validateEmail(email) {
    if (!email) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
    return null;
}

function validateDateNotPast(dateStr, fieldName) {
    if (!dateStr) return fieldName + ' is required.';
    const today = getTodayStr();
    if (dateStr < today) return fieldName + ' cannot be a past date. Select today or a future date.';
    return null;
}

function validateDateRange(fromDate, toDate) {
    if (fromDate && toDate && toDate < fromDate) return '"To" date must be on or after the "From" date.';
    return null;
}

function setStudentDateMinimums() {
    const today = getTodayStr();
    const studentDateFields = ['guestCheckIn', 'guestCheckOut', 'passFromDate', 'passToDate'];
    studentDateFields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.setAttribute('min', today);
    });
}

function showFieldError(inputId, message) {
    const el = document.getElementById(inputId);
    if (!el) return;
    let errEl = el.parentElement.querySelector('.field-error');
    if (!errEl) {
        errEl = document.createElement('div');
        errEl.className = 'field-error';
        el.parentElement.appendChild(errEl);
    }
    errEl.textContent = message;
    errEl.style.display = 'block';
    el.classList.add('input-error');
}

function clearFieldError(inputId) {
    const el = document.getElementById(inputId);
    if (!el) return;
    const errEl = el.parentElement.querySelector('.field-error');
    if (errEl) errEl.style.display = 'none';
    el.classList.remove('input-error');
}

function clearAllFieldErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.field-error').forEach(e => e.style.display = 'none');
    form.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));
}

function initializeLocalStorage() {
    if (!localStorage.getItem('hs_initialized')) {
        const rooms = [];
        let rid = 1;
        // Block A rooms per floor
        const blockARooms = [
            { floor: 1, rooms: [{ n: 'A-101', c: 3 }, { n: 'A-102', c: 2 }, { n: 'A-103', c: 3 }] },
            { floor: 2, rooms: [{ n: 'A-201', c: 2 }, { n: 'A-202', c: 3 }, { n: 'A-203', c: 2 }] },
            { floor: 3, rooms: [{ n: 'A-301', c: 3 }, { n: 'A-302', c: 2 }] },
            { floor: 4, rooms: [{ n: 'A-401', c: 2 }, { n: 'A-402', c: 3 }, { n: 'A-403', c: 2 }] },
            { floor: 5, rooms: [{ n: 'A-501', c: 3 }, { n: 'A-502', c: 2 }] },
            { floor: 6, rooms: [{ n: 'A-601', c: 2 }, { n: 'A-602', c: 3 }] },
            { floor: 7, rooms: [{ n: 'A-701', c: 2 }, { n: 'A-702', c: 2 }] },
            { floor: 8, rooms: [{ n: 'A-801', c: 3 }, { n: 'A-802', c: 2 }, { n: 'A-803', c: 1 }] },
            { floor: 9, rooms: [{ n: 'A-901', c: 2 }, { n: 'A-902', c: 3 }] },
            { floor: 10, rooms: [{ n: 'A-1001', c: 1 }, { n: 'A-1002', c: 2 }] },
            { floor: 11, rooms: [{ n: 'A-1101', c: 2 }, { n: 'A-1102', c: 3 }] },
            { floor: 12, rooms: [{ n: 'A-1201', c: 1 }, { n: 'A-1202', c: 2 }] }
        ];
        blockARooms.forEach(fl => {
            fl.rooms.forEach(r => {
                rooms.push({ id: rid++, number: r.n, block: 'A', floor: fl.floor, capacity: r.c, occupants: [], status: 'available' });
            });
        });
        // Block B rooms per floor
        const blockBRooms = [
            { floor: 1, rooms: [{ n: 'B-101', c: 3 }, { n: 'B-102', c: 2 }] },
            { floor: 2, rooms: [{ n: 'B-201', c: 2 }, { n: 'B-202', c: 3 }] },
            { floor: 3, rooms: [{ n: 'B-301', c: 3 }, { n: 'B-302', c: 2 }] },
            { floor: 5, rooms: [{ n: 'B-501', c: 2 }, { n: 'B-502', c: 3 }] },
            { floor: 6, rooms: [{ n: 'B-601', c: 2 }, { n: 'B-602', c: 2 }] },
            { floor: 8, rooms: [{ n: 'B-801', c: 3 }, { n: 'B-802', c: 2 }, { n: 'B-803', c: 1 }] },
            { floor: 9, rooms: [{ n: 'B-901', c: 2 }, { n: 'B-902', c: 3 }] },
            { floor: 10, rooms: [{ n: 'B-1001', c: 1 }, { n: 'B-1002', c: 2 }] },
            { floor: 11, rooms: [{ n: 'B-1101', c: 2 }] },
            { floor: 12, rooms: [{ n: 'B-1201', c: 2 }, { n: 'B-1202', c: 1 }] }
        ];
        blockBRooms.forEach(fl => {
            fl.rooms.forEach(r => {
                rooms.push({ id: rid++, number: r.n, block: 'B', floor: fl.floor, capacity: r.c, occupants: [], status: 'available' });
            });
        });

        const users = [
            { id: 1, name: 'Arjun Sharma', roll: '2024010001', email: 'arjun@uni.edu', department: 'Computer Science & Engineering', deptCode: 'cse', year: 3, gender: 'Male', password: 'Arjun@2024#1' },
            { id: 2, name: 'Priya Patel', roll: '2024010002', email: 'priya@uni.edu', department: 'Electronics & Communication', deptCode: 'ece', year: 2, gender: 'Female', password: 'Priya@2024#2' },
            { id: 3, name: 'Rahul Verma', roll: '2024010003', email: 'rahul@uni.edu', department: 'Mechanical Engineering', deptCode: 'mech', year: 1, gender: 'Male', password: 'Rahul@2024#3' }
        ];

        const a901 = rooms.find(r => r.number === 'A-901');
        if (a901) { a901.occupants = [1]; }

        const applications = [
            { id: 1, studentId: 1, preferredBlock: 'A', roomType: 2, status: 'approved', roomNumber: 'A-901', roomBlock: 'A', roomFloor: 9, allocationDate: '2026-01-15' },
            { id: 2, studentId: 2, preferredBlock: 'B', roomType: 3, status: 'pending', roomNumber: null, roomBlock: null, roomFloor: null, allocationDate: null }
        ];


        const allocations = [
            { id: 1, studentId: 1, studentName: 'Arjun Sharma', studentRoll: '2024010001', roomNumber: 'A-901', roomBlock: 'A', roomFloor: 9, roomType: 2, allocationDate: '2026-01-15' }
        ];

        const admins = [{ id: 1, username: 'admin', password: 'Admin@2024#1', name: 'Administrator' }];

        localStorage.setItem('hs_users', JSON.stringify(users));
        localStorage.setItem('hs_rooms', JSON.stringify(rooms));
        localStorage.setItem('hs_applications', JSON.stringify(applications));
        localStorage.setItem('hs_allocations', JSON.stringify(allocations));
        localStorage.setItem('hs_admins', JSON.stringify(admins));
        localStorage.setItem('hs_roomChanges', JSON.stringify([]));
        localStorage.setItem('hs_guestRequests', JSON.stringify([]));
        localStorage.setItem('hs_gatePasses', JSON.stringify([]));
        localStorage.setItem('hs_payments', JSON.stringify([{ id: 1, studentId: 1, studentName: 'Arjun Sharma', studentRoll: '2024010001', roomNumber: 'A-901', amount: 45000, date: '2026-01-16', status: 'paid', txId: 'TXN100001' }]));
        localStorage.setItem('hs_complaints', JSON.stringify([]));
        localStorage.setItem('hs_nextId', JSON.stringify({ users: 4, applications: 3, rooms: rid, allocations: 2, roomChanges: 1, guestRequests: 1, gatePasses: 1, payments: 2, complaints: 1 }));
        localStorage.setItem('hs_initialized', 'true');
    }
}

function getData(key) { return JSON.parse(localStorage.getItem('hs_' + key) || '[]'); }
function setData(key, data) { localStorage.setItem('hs_' + key, JSON.stringify(data)); }
function getNextId(key) { const ids = JSON.parse(localStorage.getItem('hs_nextId') || '{}'); return ids[key] || 1; }
function incNextId(key) { const ids = JSON.parse(localStorage.getItem('hs_nextId') || '{}'); ids[key] = (ids[key] || 1) + 1; localStorage.setItem('hs_nextId', JSON.stringify(ids)); }

function getEligibleFloors(block, year) {
    year = parseInt(year);
    if (block === 'A') {
        if (year === 1) return [1, 2, 3, 4];
        if (year === 2) return [4, 5, 6, 7, 8];
        if (year >= 3) return [8, 9, 10, 11, 12];
    }
    if (block === 'B') {
        if (year === 1) return [];
        if (year === 2) return [1, 2, 3, 4, 5, 6, 7, 8];
        if (year >= 3) return [8, 9, 10, 11, 12];
    }
    return [];
}

function isRoomEligibleForYear(room, year) {
    const eligible = getEligibleFloors(room.block, year);
    if (!eligible.includes(room.floor)) return false;
    if (room.occupants.length > 0) {
        const users = getData('users');
        const occupantYears = room.occupants.map(oid => { const u = users.find(u => u.id === oid); return u ? u.year : null; }).filter(y => y !== null);
        if (occupantYears.length > 0 && !occupantYears.every(y => y === year)) return false;
    }
    return true;
}

function getRoomStatus(room) {
    if (room.occupants.length === 0) return 'available';
    if (room.occupants.length < room.capacity) return 'partial';
    return 'occupied';
}

function getRoomStatusLabel(room) {
    const s = getRoomStatus(room);
    if (s === 'available') return 'Available';
    if (s === 'partial') return `Partial (${room.occupants.length}/${room.capacity})`;
    return 'Occupied';
}

function showPage(pageId) {
    document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
    const page = document.getElementById(pageId);
    if (page) page.classList.remove('hidden');

    const navbar = document.getElementById('navbar');
    const pagesWithNav = ['studentDashboard', 'adminDashboard', 'facilitiesPage', 'staffPage', 'rulesPage', 'complaintPage', 'faqPage', 'contactPage', 'galleryPage'];
    if (pagesWithNav.includes(pageId)) {
        navbar.classList.remove('hidden');
    } else {
        navbar.classList.add('hidden');
    }

    if (pageId === 'landingPage') {
        currentUser = null;
        currentUserRole = null;
        updateLandingStats();
    }
    if (pageId === 'studentDashboard') loadStudentDashboard();
    if (pageId === 'adminDashboard') loadAdminDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleLogoClick() {
    if (currentUserRole === 'student') showPage('studentDashboard');
    else if (currentUserRole === 'admin') showPage('adminDashboard');
    else showPage('landingPage');
}

function goBackFromPage() {
    if (currentUserRole === 'student') showPage('studentDashboard');
    else if (currentUserRole === 'admin') showPage('adminDashboard');
    else showPage('landingPage');
}

function setupStudentNav() {
    document.getElementById('navLinks').innerHTML = `
        <li><a href="#" onclick="showPage('studentDashboard')"><i class="fas fa-home"></i> Dashboard</a></li>
        <li class="nav-dropdown"><a href="#"><i class="fas fa-ellipsis-h"></i> More</a>
            <div class="nav-dropdown-menu">
                <a href="#" onclick="showPage('facilitiesPage')"><i class="fas fa-dumbbell"></i> Facilities</a>
                <a href="#" onclick="showPage('rulesPage')"><i class="fas fa-gavel"></i> Rules</a>
                <a href="#" onclick="showPage('complaintPage')"><i class="fas fa-exclamation-triangle"></i> Complaint</a>
                <a href="#" onclick="showPage('faqPage')"><i class="fas fa-question-circle"></i> FAQ</a>
                <a href="#" onclick="showPage('contactPage')"><i class="fas fa-phone-alt"></i> Contact</a>
                <a href="#" onclick="showPage('galleryPage')"><i class="fas fa-images"></i> Gallery</a>
                <a href="#" onclick="showPage('staffPage')"><i class="fas fa-id-badge"></i> Staff</a>
            </div>
        </li>
        <li><a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a></li>`;
}

function setupAdminNav() {
    document.getElementById('navLinks').innerHTML = `
        <li><a href="#" onclick="showPage('adminDashboard')"><i class="fas fa-home"></i> Dashboard</a></li>
        <li class="nav-dropdown"><a href="#"><i class="fas fa-ellipsis-h"></i> More</a>
            <div class="nav-dropdown-menu">
                <a href="#" onclick="showPage('facilitiesPage')"><i class="fas fa-dumbbell"></i> Facilities</a>
                <a href="#" onclick="showPage('staffPage')"><i class="fas fa-id-badge"></i> Staff</a>
                <a href="#" onclick="showPage('rulesPage')"><i class="fas fa-gavel"></i> Rules</a>
                <a href="#" onclick="showPage('contactPage')"><i class="fas fa-phone-alt"></i> Contact</a>
            </div>
        </li>
        <li><a href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a></li>`;
}

function logout() {
    currentUser = null;
    currentUserRole = null;
    showPage('landingPage');
}

function toggleEl(id) { document.getElementById(id).classList.toggle('hidden'); }

function showAlert(type, message) {
    let el, msgEl;
    if (currentUserRole === 'student') { el = document.getElementById('studentAlert'); msgEl = document.getElementById('alertMessage'); }
    else if (currentUserRole === 'admin') { el = document.getElementById('adminAlert'); msgEl = document.getElementById('adminAlertMessage'); }
    else return;
    if (!el || !msgEl) return;
    el.className = `alert alert-${type}`;
    msgEl.textContent = message;
    el.classList.remove('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => el.classList.add('hidden'), 5000);
}

function showAlertInElement(elementId, type, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.className = `alert alert-${type}`;
    el.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    el.classList.remove('hidden');
    setTimeout(() => el.classList.add('hidden'), 5000);
}

function initTabs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const section = container.closest('section');
    container.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            section.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            const target = document.getElementById(btn.dataset.tab);
            if (target) target.classList.add('active');
        });
    });
}

function updateLandingStats() {
    const rooms = getData('rooms');
    const allocations = getData('allocations');
    document.getElementById('landingTotalRooms').textContent = rooms.length;
    document.getElementById('landingStudents').textContent = allocations.length;
}

document.getElementById('registrationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    clearAllFieldErrors('registrationForm');
    const name = document.getElementById('fullName').value.trim();
    const roll = document.getElementById('rollNumber').value.trim();
    const email = document.getElementById('email').value.trim();
    const dept = document.getElementById('department');
    const yr = document.getElementById('year');
    const gender = document.querySelector('input[name="gender"]:checked');
    const pw = document.getElementById('password').value;
    const cpw = document.getElementById('confirmPassword').value;

    let hasError = false;

    const nameErr = validateFullName(name);
    if (nameErr) { showFieldError('fullName', nameErr); hasError = true; }

    const rollErr = validateRollNumber(roll);
    if (rollErr) { showFieldError('rollNumber', rollErr); hasError = true; }

    const emailErr = validateEmail(email);
    if (emailErr) { showFieldError('email', emailErr); hasError = true; }

    if (!dept.value) { showFieldError('department', 'Select a department.'); hasError = true; }
    if (!yr.value) { showFieldError('year', 'Select year of study.'); hasError = true; }

    if (!gender) { showAlertInElement('registrationAlert', 'error', 'Please select gender!'); hasError = true; }

    const pwErr = validatePassword(pw);
    if (pwErr) { showFieldError('password', pwErr); hasError = true; }

    if (pw !== cpw) { showFieldError('confirmPassword', 'Passwords do not match!'); hasError = true; }

    if (hasError) {
        showAlertInElement('registrationAlert', 'error', 'Please fix the errors highlighted below.');
        return;
    }

    const users = getData('users');
    if (users.find(u => u.roll === roll)) { showFieldError('rollNumber', 'This roll number is already registered!'); showAlertInElement('registrationAlert', 'error', 'Roll number already exists!'); return; }

    const id = getNextId('users');
    users.push({ id, name, roll, email, department: dept.options[dept.selectedIndex].text, deptCode: dept.value, year: parseInt(yr.value), gender: gender.value, password: pw });
    setData('users', users);
    incNextId('users');

    showAlertInElement('registrationAlert', 'success', 'Registration successful! Redirecting to login...');
    setTimeout(() => showPage('studentLogin'), 1500);
});

document.getElementById('studentLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const roll = document.getElementById('studentRollNumber').value.trim();
    const pw = document.getElementById('studentPassword').value;
    const users = getData('users');
    const student = users.find(u => u.roll === roll && u.password === pw);
    if (student) {
        currentUser = student;
        currentUserRole = 'student';
        setupStudentNav();
        showPage('studentDashboard');
    } else {
        showAlertInElement('studentLoginAlert', 'error', 'Invalid roll number or password!');
    }
});

document.getElementById('adminLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const user = document.getElementById('adminUsername').value.trim();
    const pw = document.getElementById('adminPassword').value;
    const admins = getData('admins');
    const admin = admins.find(a => a.username === user && a.password === pw);
    if (admin) {
        currentUser = admin;
        currentUserRole = 'admin';
        setupAdminNav();
        showPage('adminDashboard');
    } else {
        showAlertInElement('adminLoginAlert', 'error', 'Invalid credentials!');
    }
});

function yearLabel(y) { return ['', '1st', '2nd', '3rd', '4th'][y] + ' Year'; }

function loadStudentDashboard() {
    if (!currentUser) return;
    document.getElementById('studentName').textContent = currentUser.name;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileRoll').textContent = currentUser.roll;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileDept').textContent = currentUser.department;
    document.getElementById('profileYear').textContent = yearLabel(currentUser.year);
    document.getElementById('profileGender').textContent = currentUser.gender;

    const apps = getData('applications');
    const app = apps.find(a => a.studentId === currentUser.id);
    const payments = getData('payments');
    const payment = payments.find(p => p.studentId === currentUser.id);

    if (app) {
        document.getElementById('applicationFormContainer').classList.add('hidden');
        document.getElementById('applicationStatusContainer').classList.remove('hidden');
        const badge = document.getElementById('statusBadge');
        badge.textContent = app.status === 'rejected' ? 'Not Allocated' : capitalize(app.status);
        badge.className = `status-badge status-${app.status === 'rejected' ? 'not-allocated' : app.status}`;
        document.getElementById('applicationStatusLabel').textContent = capitalize(app.status);

        if (app.status === 'approved') {
            document.getElementById('hostelBlockLabel').textContent = 'Block ' + app.roomBlock;
            document.getElementById('roomNumberLabel').textContent = app.roomNumber;
            document.getElementById('allocationDetails').classList.remove('hidden');
            document.getElementById('noAllocationMessage').classList.add('hidden');
            document.getElementById('detailBlock').textContent = 'Block ' + app.roomBlock;
            document.getElementById('detailRoom').textContent = app.roomNumber;
            document.getElementById('detailFloor').textContent = 'Floor ' + app.roomFloor;
            document.getElementById('detailType').textContent = app.roomType + '-Sharing';
            document.getElementById('detailDate').textContent = app.allocationDate;
        } else {
            document.getElementById('hostelBlockLabel').textContent = '-';
            document.getElementById('roomNumberLabel').textContent = '-';
            document.getElementById('allocationDetails').classList.add('hidden');
            document.getElementById('noAllocationMessage').classList.remove('hidden');
        }
    } else {
        document.getElementById('applicationFormContainer').classList.remove('hidden');
        document.getElementById('applicationStatusContainer').classList.add('hidden');
        document.getElementById('applicationStatusLabel').textContent = 'Not Applied';
        document.getElementById('hostelBlockLabel').textContent = '-';
        document.getElementById('roomNumberLabel').textContent = '-';
    }

    if (payment && payment.status === 'paid') {
        document.getElementById('paymentStatusLabel').textContent = 'Paid';
        document.getElementById('paymentRequired').classList.add('hidden');
        document.getElementById('paymentDone').classList.remove('hidden');
        document.getElementById('paymentNotRequired').classList.add('hidden');
        document.getElementById('transactionId').textContent = payment.txId;
        document.getElementById('paymentDate').textContent = payment.date;
    } else if (app && app.status === 'approved') {
        document.getElementById('paymentStatusLabel').textContent = 'Pending';
        document.getElementById('paymentRequired').classList.remove('hidden');
        document.getElementById('paymentDone').classList.add('hidden');
        document.getElementById('paymentNotRequired').classList.add('hidden');
    } else {
        document.getElementById('paymentStatusLabel').textContent = '-';
        document.getElementById('paymentRequired').classList.add('hidden');
        document.getElementById('paymentDone').classList.add('hidden');
        document.getElementById('paymentNotRequired').classList.remove('hidden');
    }

    if (app && app.status === 'approved') {
        document.getElementById('roomChangeEligible').classList.remove('hidden');
        document.getElementById('roomChangeNotEligible').classList.add('hidden');
        document.getElementById('currentRoomInfo').textContent = `Block ${app.roomBlock} — ${app.roomNumber} (Floor ${app.roomFloor})`;
    } else {
        document.getElementById('roomChangeEligible').classList.add('hidden');
        document.getElementById('roomChangeNotEligible').classList.remove('hidden');
    }
    loadRoomChangeHistory();
    loadGuestRequests();
    loadGatePasses();
}

function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

document.getElementById('hostelApplicationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentUser) return;
    const block = document.getElementById('preferredBlock').value;
    const type = parseInt(document.getElementById('roomType').value);
    if (!block || !type) return;

    const eligible = getEligibleFloors(block, currentUser.year);
    if (eligible.length === 0) { showAlert('error', `${yearLabel(currentUser.year)} students are not eligible for Block ${block}!`); return; }

    const apps = getData('applications');
    if (apps.find(a => a.studentId === currentUser.id)) { showAlert('error', 'You already have an application!'); return; }

    const id = getNextId('applications');
    apps.push({ id, studentId: currentUser.id, preferredBlock: block, roomType: type, status: 'pending', roomNumber: null, roomBlock: null, roomFloor: null, allocationDate: null });
    setData('applications', apps);
    incNextId('applications');
    loadStudentDashboard();
    showAlert('success', 'Application submitted successfully!');
});

function renderRoomGrid(containerId, block, filterType, onSelect, mode) {
    const container = document.getElementById(containerId);
    if (!block) { container.innerHTML = '<div class="empty-state"><i class="fas fa-building"></i><h3>Select a Block</h3></div>'; return; }

    const rooms = getData('rooms').filter(r => r.block === block);
    const year = currentUser.year;
    const eligible = getEligibleFloors(block, year);

    if (eligible.length === 0) { container.innerHTML = `<div class="empty-state"><i class="fas fa-ban"></i><h3>Not Eligible</h3><p>${yearLabel(year)} students cannot access Block ${block}.</p></div>`; return; }

    const floors = {};
    rooms.forEach(r => { if (!floors[r.floor]) floors[r.floor] = []; floors[r.floor].push(r); });

    let html = '';
    Object.keys(floors).sort((a, b) => a - b).forEach(floor => {
        const floorRooms = floors[floor];
        const isEligible = eligible.includes(parseInt(floor));
        html += `<div class="floor-section"><div class="floor-label">Floor ${floor} ${!isEligible ? '(Not eligible for your year)' : ''}</div><div class="room-grid">`;
        floorRooms.forEach(room => {
            if (filterType && room.capacity !== parseInt(filterType)) return;
            const status = getRoomStatus(room);
            const elg = isEligible && isRoomEligibleForYear(room, year);
            let cls = 'room-ineligible';
            let clickable = false;
            if (!elg) { cls = 'room-ineligible'; }
            else if (status === 'available') { cls = 'room-available'; clickable = true; }
            else if (status === 'partial') { cls = 'room-partial'; clickable = true; }
            else { cls = 'room-occupied'; }

            html += `<div class="room-box ${cls}" ${clickable ? `onclick="${onSelect}(${room.id})"` : ''} title="${room.number} — ${room.occupants.length}/${room.capacity} occupied${!elg ? ' (Not eligible)' : ''}">
                <div class="room-number">${room.number}</div>
                <div class="room-occupancy">${room.occupants.length}/${room.capacity}</div>
            </div>`;
        });
        html += '</div></div>';
    });

    container.innerHTML = html || '<div class="empty-state"><p>No rooms found.</p></div>';
}

document.getElementById('roomSelectBlock').addEventListener('change', function () {
    selectedRoom = null;
    document.getElementById('selectedRoomInfo').classList.add('hidden');
    renderRoomGrid('roomGridContainer', this.value, document.getElementById('roomSelectType').value, 'selectRoom', 'select');
});
document.getElementById('roomSelectType').addEventListener('change', function () {
    selectedRoom = null;
    document.getElementById('selectedRoomInfo').classList.add('hidden');
    renderRoomGrid('roomGridContainer', document.getElementById('roomSelectBlock').value, this.value, 'selectRoom', 'select');
});

function selectRoom(roomId) {
    const rooms = getData('rooms');
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    selectedRoom = room;
    document.getElementById('selectedRoomInfo').classList.remove('hidden');
    document.getElementById('selectedRoomDetails').innerHTML = `<strong>${room.number}</strong> — Block ${room.block}, Floor ${room.floor}, ${room.capacity}-Sharing (${room.occupants.length}/${room.capacity} occupied)`;
    document.querySelectorAll('#roomGridContainer .room-box').forEach(b => b.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function submitRoomSelection() {
    if (!selectedRoom || !currentUser) return;
    const apps = getData('applications');
    if (apps.find(a => a.studentId === currentUser.id)) { showAlert('error', 'You already have an application! Use Room Change instead.'); return; }
    const id = getNextId('applications');
    apps.push({ id, studentId: currentUser.id, preferredBlock: selectedRoom.block, roomType: selectedRoom.capacity, status: 'pending', roomNumber: null, roomBlock: null, roomFloor: null, allocationDate: null, selectedRoomId: selectedRoom.id });
    setData('applications', apps);
    incNextId('applications');
    selectedRoom = null;
    document.querySelector('[data-tab="sTabOverview"]').click();
    loadStudentDashboard();
    showAlert('success', 'Application submitted! Waiting for admin approval.');
}

document.getElementById('roomChangeBlock').addEventListener('change', function () {
    selectedChangeRoom = null;
    document.getElementById('roomChangeSelectedInfo').classList.add('hidden');
    renderRoomGrid('roomChangeGrid', this.value, null, 'selectChangeRoom', 'change');
});

function selectChangeRoom(roomId) {
    const rooms = getData('rooms');
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    selectedChangeRoom = room;
    const status = getRoomStatus(room);
    document.getElementById('roomChangeSelectedInfo').classList.remove('hidden');
    document.getElementById('roomChangeSelectedDetails').innerHTML = `<strong>${room.number}</strong> — Block ${room.block}, Floor ${room.floor} (${room.occupants.length}/${room.capacity})${status === 'available' ? ' <span style="color:var(--success)">[Will be auto-approved]</span>' : ' <span style="color:var(--warning)">[Partially filled — available]</span>'}`;
    document.querySelectorAll('#roomChangeGrid .room-box').forEach(b => b.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

function submitRoomChangeRequest() {
    if (!selectedChangeRoom || !currentUser) return;
    const reason = document.getElementById('roomChangeReason').value.trim() || 'No reason provided';
    const apps = getData('applications');
    const app = apps.find(a => a.studentId === currentUser.id && a.status === 'approved');
    if (!app) return;

    const changes = getData('roomChanges');
    const id = getNextId('roomChanges');
    const status_r = getRoomStatus(selectedChangeRoom);
    const autoApprove = status_r === 'available';

    const req = { id, studentId: currentUser.id, studentName: currentUser.name, fromRoom: app.roomNumber, fromBlock: app.roomBlock, toRoom: selectedChangeRoom.number, toBlock: selectedChangeRoom.block, toFloor: selectedChangeRoom.floor, toRoomId: selectedChangeRoom.id, reason, date: new Date().toISOString().split('T')[0], status: autoApprove ? 'approved' : 'pending' };
    changes.push(req);
    setData('roomChanges', changes);
    incNextId('roomChanges');

    if (autoApprove) {
        const rooms = getData('rooms');
        const oldRoom = rooms.find(r => r.number === app.roomNumber && r.block === app.roomBlock);
        const newRoom = rooms.find(r => r.id === selectedChangeRoom.id);
        if (oldRoom) oldRoom.occupants = oldRoom.occupants.filter(oid => oid !== currentUser.id);
        if (newRoom) newRoom.occupants.push(currentUser.id);
        setData('rooms', rooms);

        app.roomNumber = newRoom.number;
        app.roomBlock = newRoom.block;
        app.roomFloor = newRoom.floor;
        app.roomType = newRoom.capacity;
        setData('applications', apps);

        const allocs = getData('allocations');
        const alloc = allocs.find(a => a.studentId === currentUser.id);
        if (alloc) { alloc.roomNumber = newRoom.number; alloc.roomBlock = newRoom.block; alloc.roomFloor = newRoom.floor; alloc.roomType = newRoom.capacity; }
        setData('allocations', allocs);

        showAlert('success', 'Room change auto-approved! You have been moved to ' + newRoom.number);
    } else {
        showAlert('info', 'Room change request submitted. Pending admin approval.');
    }

    selectedChangeRoom = null;
    document.getElementById('roomChangeSelectedInfo').classList.add('hidden');
    loadStudentDashboard();
}

function loadRoomChangeHistory() {
    if (!currentUser) return;
    const changes = getData('roomChanges').filter(c => c.studentId === currentUser.id);
    const container = document.getElementById('roomChangeHistory');
    const tbody = document.getElementById('roomChangeHistoryBody');
    if (changes.length === 0) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    tbody.innerHTML = changes.map(c => `<tr><td>${c.date}</td><td>${c.fromRoom}</td><td>${c.toRoom}</td><td><span class="status-badge status-${c.status === 'approved' ? 'approved' : c.status === 'pending' ? 'pending' : 'rejected'}">${capitalize(c.status)}</span></td></tr>`).join('');
}

document.getElementById('guestForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentUser) return;

    const checkIn = document.getElementById('guestCheckIn').value;
    const checkOut = document.getElementById('guestCheckOut').value;
    const gName = document.getElementById('guestName').value.trim();

    // Validate guest name
    const nameErr = validateFullName(gName);
    if (nameErr) { showAlert('error', 'Guest Name: ' + nameErr); return; }

    // Validate dates are not in the past
    const d1Err = validateDateNotPast(checkIn, 'Check-in date');
    if (d1Err) { showAlert('error', d1Err); return; }
    const d2Err = validateDateNotPast(checkOut, 'Check-out date');
    if (d2Err) { showAlert('error', d2Err); return; }
    const rangeErr = validateDateRange(checkIn, checkOut);
    if (rangeErr) { showAlert('error', rangeErr); return; }

    const reqs = getData('guestRequests');
    const id = getNextId('guestRequests');
    reqs.push({ id, studentId: currentUser.id, studentName: currentUser.name, studentRoll: currentUser.roll, guestName: gName, relation: document.getElementById('guestRelation').value, checkIn, checkOut, purpose: document.getElementById('guestPurpose').value, status: 'pending' });
    setData('guestRequests', reqs);
    incNextId('guestRequests');
    this.reset();
    setStudentDateMinimums();
    loadGuestRequests();
    showAlert('success', 'Guest accommodation request submitted!');
});

function loadGuestRequests() {
    if (!currentUser) return;
    const reqs = getData('guestRequests').filter(r => r.studentId === currentUser.id);
    const container = document.getElementById('guestRequestsContainer');
    const tbody = document.getElementById('guestRequestsBody');
    if (reqs.length === 0) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    tbody.innerHTML = reqs.map(r => `<tr><td>${r.guestName}</td><td>${r.checkIn}</td><td>${r.checkOut}</td><td><span class="status-badge status-${r.status}">${capitalize(r.status)}</span></td></tr>`).join('');
}

document.getElementById('gatePassForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentUser) return;

    const fromDate = document.getElementById('passFromDate').value;
    const toDate = document.getElementById('passToDate').value;

    // Validate dates are not in the past
    const d1Err = validateDateNotPast(fromDate, 'From date');
    if (d1Err) { showAlert('error', d1Err); return; }
    const d2Err = validateDateNotPast(toDate, 'To date');
    if (d2Err) { showAlert('error', d2Err); return; }
    const rangeErr = validateDateRange(fromDate, toDate);
    if (rangeErr) { showAlert('error', rangeErr); return; }

    const passes = getData('gatePasses');
    const id = getNextId('gatePasses');
    passes.push({ id, studentId: currentUser.id, studentName: currentUser.name, studentRoll: currentUser.roll, type: document.getElementById('passType').value, fromDate, toDate, reason: document.getElementById('passReason').value, status: 'pending' });
    setData('gatePasses', passes);
    incNextId('gatePasses');
    this.reset();
    setStudentDateMinimums();
    loadGatePasses();
    showAlert('success', 'Pass request submitted!');
});

function loadGatePasses() {
    if (!currentUser) return;
    const passes = getData('gatePasses').filter(p => p.studentId === currentUser.id);
    const container = document.getElementById('gatePassContainer');
    const tbody = document.getElementById('gatePassBody');
    if (passes.length === 0) { container.classList.add('hidden'); return; }
    container.classList.remove('hidden');
    tbody.innerHTML = passes.map(p => `<tr><td>${capitalize(p.type)} Pass</td><td>${p.fromDate}</td><td>${p.toDate}</td><td><span class="status-badge status-${p.status}">${capitalize(p.status)}</span></td></tr>`).join('');
}

let selectedPayMethod = null;

function showPaymentStep1() {
    document.getElementById('payStep1').classList.remove('hidden');
    document.getElementById('payStep2').classList.add('hidden');
    document.getElementById('payStep3').classList.add('hidden');
}
function showPaymentStep2() {
    document.getElementById('payStep1').classList.add('hidden');
    document.getElementById('payStep2').classList.remove('hidden');
    document.getElementById('payStep3').classList.add('hidden');
    selectedPayMethod = null;
    document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('selected'));
    ['payFormCard', 'payFormUpi', 'payFormNetbanking', 'payFormWallet'].forEach(id => document.getElementById(id).classList.add('hidden'));
}
function selectPayMethod(method) {
    selectedPayMethod = method;
    document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('selected'));
    const map = { card: 'pmCard', upi: 'pmUpi', netbanking: 'pmNet', wallet: 'pmWallet' };
    document.getElementById(map[method]).classList.add('selected');
    ['payFormCard', 'payFormUpi', 'payFormNetbanking', 'payFormWallet'].forEach(id => document.getElementById(id).classList.add('hidden'));
    const formMap = { card: 'payFormCard', upi: 'payFormUpi', netbanking: 'payFormNetbanking', wallet: 'payFormWallet' };
    document.getElementById(formMap[method]).classList.remove('hidden');
}

function processPayment() {
    if (!currentUser) return;
    if (!selectedPayMethod) { showAlert('error', 'Please select a payment method!'); return; }
    const apps = getData('applications');
    const app = apps.find(a => a.studentId === currentUser.id && a.status === 'approved');
    if (!app) { showAlert('error', 'No approved allocation found!'); return; }
    const payments = getData('payments');
    if (payments.find(p => p.studentId === currentUser.id && p.status === 'paid')) { showAlert('info', 'Already paid!'); return; }

    document.getElementById('payStep2').classList.add('hidden');
    document.getElementById('payStep3').classList.remove('hidden');

    setTimeout(() => {
        const id = getNextId('payments');
        const txId = 'TXN' + (100000 + id);
        const date = new Date().toISOString().split('T')[0];
        payments.push({ id, studentId: currentUser.id, studentName: currentUser.name, studentRoll: currentUser.roll, roomNumber: app.roomNumber, amount: 45000, date, status: 'paid', txId, method: selectedPayMethod });
        setData('payments', payments);
        incNextId('payments');
        document.getElementById('payStep3').classList.add('hidden');
        loadStudentDashboard();
        showAlert('success', 'Payment of ₹45,000 successful! Transaction ID: ' + txId);
    }, 2500);
}

document.getElementById('complaintForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const complaints = getData('complaints');
    const id = getNextId('complaints');
    const ref = 'CMP' + (10000 + id);
    complaints.push({ id, name: document.getElementById('complaintName').value, room: document.getElementById('complaintRoom').value, category: document.getElementById('complaintCategory').value, description: document.getElementById('complaintDesc').value, ref, date: new Date().toISOString().split('T')[0], status: 'pending' });
    setData('complaints', complaints);
    incNextId('complaints');
    this.reset();
    document.getElementById('complaintRef').textContent = ref;
    document.getElementById('complaintSuccess').classList.remove('hidden');
    setTimeout(() => document.getElementById('complaintSuccess').classList.add('hidden'), 5000);
});

function toggleFaq(el) {
    el.classList.toggle('active');
    const answer = el.nextElementSibling;
    answer.classList.toggle('active');
}

function loadAdminDashboard() {
    const rooms = getData('rooms');
    const users = getData('users');
    const allocations = getData('allocations');
    const apps = getData('applications');

    document.getElementById('totalStudents').textContent = users.length;
    document.getElementById('totalRooms').textContent = rooms.length;
    document.getElementById('allocatedRooms').textContent = allocations.length;
    const vacantCount = rooms.filter(r => r.occupants.length === 0).length;
    document.getElementById('availableRooms').textContent = vacantCount;

    loadRoomsTable();
    loadApplicationsTable();
    loadAllocationsTable();
    loadRoomChangeRequests();
    loadPaymentsTable();
    loadAdminComplaints();
    loadAdminGuestRequests();
    loadAdminGatePasses();
}

document.getElementById('roomForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const number = document.getElementById('newRoomNumber').value.trim();
    const block = document.getElementById('newRoomBlock').value;
    const floor = parseInt(document.getElementById('newRoomFloor').value);
    const capacity = parseInt(document.getElementById('newRoomCapacity').value);

    if (!block || !floor || !capacity) return;

    const rooms = getData('rooms');
    const fullNumber = block + '-' + number;
    if (rooms.find(r => r.number === fullNumber)) { showAlert('error', 'Room already exists!'); return; }

    const id = getNextId('rooms');
    rooms.push({ id, number: fullNumber, block, floor, capacity, occupants: [], status: 'available' });
    setData('rooms', rooms);
    incNextId('rooms');
    this.reset();
    toggleEl('addRoomForm');
    loadAdminDashboard();
    showAlert('success', `Room ${fullNumber} added!`);
});

function loadRoomsTable() {
    const rooms = getData('rooms');
    const tbody = document.getElementById('roomsTableBody');
    const noMsg = document.getElementById('noRoomsMessage');
    if (rooms.length === 0) { tbody.innerHTML = ''; noMsg.classList.remove('hidden'); return; }
    noMsg.classList.add('hidden');

    const searchVal = (document.getElementById('roomSearch').value || '').toLowerCase();
    const filtered = rooms.filter(r => !searchVal || r.number.toLowerCase().includes(searchVal) || r.block.toLowerCase().includes(searchVal));

    tbody.innerHTML = filtered.map(r => {
        const s = getRoomStatus(r);
        const yearInfo = getYearForFloor(r.block, r.floor);
        let badge = '';
        if (s === 'available') badge = '<span class="status-badge status-approved">Available</span>';
        else if (s === 'partial') badge = '<span class="status-badge status-pending">Partial</span>';
        else badge = '<span class="status-badge status-not-allocated">Occupied</span>';
        return `<tr><td>${r.number}</td><td>Block ${r.block}</td><td>${r.floor}</td><td>${r.capacity}-Sharing</td><td>${r.occupants.length}/${r.capacity}</td><td>${yearInfo}</td><td>${badge}</td><td><button class="btn btn-danger btn-sm" onclick="deleteRoom(${r.id})"><i class="fas fa-trash"></i></button></td></tr>`;
    }).join('');
}

document.getElementById('roomSearch').addEventListener('input', loadRoomsTable);

function getYearForFloor(block, floor) {
    if (block === 'A') {
        if (floor >= 1 && floor <= 3) return '1st Year';
        if (floor === 4) return '1st/2nd Year';
        if (floor >= 5 && floor <= 7) return '2nd Year';
        if (floor === 8) return '2nd/3rd+ Year';
        if (floor >= 9) return '3rd/4th Year';
    }
    if (block === 'B') {
        if (floor >= 1 && floor <= 7) return '2nd Year';
        if (floor === 8) return '2nd/3rd+ Year';
        if (floor >= 9) return '3rd/4th Year';
    }
    return '-';
}

function deleteRoom(roomId) {
    if (!confirm('Delete this room?')) return;
    const rooms = getData('rooms');
    const room = rooms.find(r => r.id === roomId);
    if (room && room.occupants.length > 0) { showAlert('error', 'Cannot delete occupied room!'); return; }
    setData('rooms', rooms.filter(r => r.id !== roomId));
    loadAdminDashboard();
    showAlert('success', 'Room deleted!');
}

function loadApplicationsTable() {
    const apps = getData('applications');
    const users = getData('users');
    const tbody = document.getElementById('applicationsTableBody');
    const noMsg = document.getElementById('noApplicationsMessage');

    if (apps.length === 0) { tbody.innerHTML = ''; noMsg.classList.remove('hidden'); return; }
    noMsg.classList.add('hidden');

    const search = (document.getElementById('studentSearch').value || '').toLowerCase();
    const fy = document.getElementById('filterYear').value;
    const fs = document.getElementById('filterStatus').value;

    tbody.innerHTML = apps.map(app => {
        const st = users.find(u => u.id === app.studentId);
        if (!st) return '';
        if (search && !st.name.toLowerCase().includes(search) && !st.roll.includes(search)) return '';
        if (fy && st.year !== parseInt(fy)) return '';
        if (fs && app.status !== fs) return '';

        let badge = '';
        if (app.status === 'approved') badge = '<span class="status-badge status-approved">Approved</span>';
        else if (app.status === 'pending') badge = '<span class="status-badge status-pending">Pending</span>';
        else badge = '<span class="status-badge status-rejected">Rejected</span>';

        return `<tr><td>${st.roll}</td><td>${st.name}</td><td>${st.department}</td><td>${yearLabel(st.year)}</td><td>Block ${app.preferredBlock}</td><td>${app.roomType}-Sharing</td><td>${badge}</td><td>
        <button class="btn btn-success btn-sm" onclick="approveApplication(${app.id})" ${app.status !== 'pending' ? 'disabled' : ''}><i class="fas fa-check"></i></button>
        <button class="btn btn-danger btn-sm" onclick="rejectApplication(${app.id})" ${app.status !== 'pending' ? 'disabled' : ''}><i class="fas fa-times"></i></button></td></tr>`;
    }).join('');
}

document.getElementById('studentSearch').addEventListener('input', loadApplicationsTable);
document.getElementById('filterYear').addEventListener('change', loadApplicationsTable);
document.getElementById('filterStatus').addEventListener('change', loadApplicationsTable);

function approveApplication(appId) {
    const apps = getData('applications');
    const users = getData('users');
    const rooms = getData('rooms');
    const allocs = getData('allocations');
    const app = apps.find(a => a.id === appId);
    if (!app || app.status !== 'pending') return;

    const student = users.find(u => u.id === app.studentId);
    if (!student) return;

    const eligible = getEligibleFloors(app.preferredBlock, student.year);
    const available = rooms.filter(r =>
        r.block === app.preferredBlock &&
        eligible.includes(r.floor) &&
        r.occupants.length < r.capacity &&
        isRoomEligibleForYear(r, student.year) &&
        (app.roomType ? r.capacity === app.roomType : true)
    );

    let room = null;
    if (app.selectedRoomId) room = available.find(r => r.id === app.selectedRoomId);
    if (!room) room = available[0];

    if (!room) { showAlert('error', 'No eligible rooms available for this student!'); return; }

    room.occupants.push(student.id);
    app.status = 'approved';
    app.roomNumber = room.number;
    app.roomBlock = room.block;
    app.roomFloor = room.floor;
    app.roomType = room.capacity;
    app.allocationDate = new Date().toISOString().split('T')[0];

    const allocId = getNextId('allocations');
    allocs.push({ id: allocId, studentId: student.id, studentName: student.name, studentRoll: student.roll, roomNumber: room.number, roomBlock: room.block, roomFloor: room.floor, roomType: room.capacity, allocationDate: app.allocationDate });
    incNextId('allocations');

    setData('applications', apps);
    setData('rooms', rooms);
    setData('allocations', allocs);
    loadAdminDashboard();
    showAlert('success', `${student.name} allocated to ${room.number}!`);
}

function rejectApplication(appId) {
    if (!confirm('Reject this application?')) return;
    const apps = getData('applications');
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    app.status = 'rejected';
    setData('applications', apps);
    loadApplicationsTable();
    showAlert('success', 'Application rejected.');
}

function loadAllocationsTable() {
    const allocs = getData('allocations');
    const tbody = document.getElementById('allocationsTableBody');
    const noMsg = document.getElementById('noAllocationsMessage');
    if (allocs.length === 0) { tbody.innerHTML = ''; noMsg.classList.remove('hidden'); return; }
    noMsg.classList.add('hidden');
    tbody.innerHTML = allocs.map(a => `<tr><td>${a.studentName}</td><td>${a.studentRoll}</td><td>${a.roomNumber}</td><td>Block ${a.roomBlock}</td><td>Floor ${a.roomFloor}</td><td>${a.allocationDate}</td><td><button class="btn btn-danger btn-sm" onclick="removeAllocation(${a.id})"><i class="fas fa-trash"></i></button></td></tr>`).join('');
}

function showAllocationForm() { toggleEl('allocationFormContainer'); populateAllocationDropdowns(); }

function populateAllocationDropdowns() {
    const apps = getData('applications');
    const users = getData('users');
    const rooms = getData('rooms');
    const allocs = getData('allocations');

    const studentSel = document.getElementById('allocateStudent');
    studentSel.innerHTML = '<option value="">Select</option>';
    const allocatedIds = allocs.map(a => a.studentId);
    const pending = apps.filter(a => a.status === 'pending' && !allocatedIds.includes(a.studentId));
    pending.forEach(app => {
        const st = users.find(u => u.id === app.studentId);
        if (st) studentSel.innerHTML += `<option value="${st.id}">${st.name} (${st.roll}) — ${yearLabel(st.year)}</option>`;
    });

    const roomSel = document.getElementById('allocateRoom');
    roomSel.innerHTML = '<option value="">Select</option>';
    rooms.filter(r => r.occupants.length < r.capacity).forEach(r => {
        roomSel.innerHTML += `<option value="${r.id}">${r.number} — Block ${r.block} Fl.${r.floor} (${r.occupants.length}/${r.capacity})</option>`;
    });
}

document.getElementById('allocationForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const studentId = parseInt(document.getElementById('allocateStudent').value);
    const roomId = parseInt(document.getElementById('allocateRoom').value);
    if (!studentId || !roomId) { showAlert('error', 'Select both student and room!'); return; }

    const users = getData('users');
    const rooms = getData('rooms');
    const apps = getData('applications');
    const allocs = getData('allocations');

    const student = users.find(u => u.id === studentId);
    const room = rooms.find(r => r.id === roomId);
    if (!student || !room) return;

    if (!isRoomEligibleForYear(room, student.year)) { showAlert('error', `${yearLabel(student.year)} students are not eligible for this room (Block ${room.block}, Floor ${room.floor})!`); return; }
    if (room.occupants.length >= room.capacity) { showAlert('error', 'Room is full!'); return; }
    if (allocs.find(a => a.studentId === studentId)) { showAlert('error', 'Student already allocated!'); return; }

    room.occupants.push(student.id);
    const app = apps.find(a => a.studentId === studentId);
    if (app) {
        app.status = 'approved';
        app.roomNumber = room.number;
        app.roomBlock = room.block;
        app.roomFloor = room.floor;
        app.roomType = room.capacity;
        app.allocationDate = new Date().toISOString().split('T')[0];
    }

    const allocId = getNextId('allocations');
    allocs.push({ id: allocId, studentId: student.id, studentName: student.name, studentRoll: student.roll, roomNumber: room.number, roomBlock: room.block, roomFloor: room.floor, roomType: room.capacity, allocationDate: new Date().toISOString().split('T')[0] });
    incNextId('allocations');

    setData('rooms', rooms);
    setData('applications', apps);
    setData('allocations', allocs);
    toggleEl('allocationFormContainer');
    loadAdminDashboard();
    showAlert('success', `${student.name} allocated to ${room.number}!`);
});

function removeAllocation(allocId) {
    if (!confirm('Remove this allocation?')) return;
    const allocs = getData('allocations');
    const apps = getData('applications');
    const rooms = getData('rooms');
    const alloc = allocs.find(a => a.id === allocId);
    if (!alloc) return;

    const app = apps.find(a => a.studentId === alloc.studentId);
    if (app) { app.status = 'pending'; app.roomNumber = null; app.roomBlock = null; app.roomFloor = null; app.allocationDate = null; }

    const room = rooms.find(r => r.number === alloc.roomNumber && r.block === alloc.roomBlock);
    if (room) room.occupants = room.occupants.filter(oid => oid !== alloc.studentId);

    setData('allocations', allocs.filter(a => a.id !== allocId));
    setData('applications', apps);
    setData('rooms', rooms);
    loadAdminDashboard();
    showAlert('success', 'Allocation removed!');
}

function loadRoomChangeRequests() {
    const changes = getData('roomChanges');
    const tbody = document.getElementById('roomChangeRequestsBody');
    const noMsg = document.getElementById('noRoomChanges');
    if (changes.length === 0) { tbody.innerHTML = ''; noMsg.classList.remove('hidden'); return; }
    noMsg.classList.add('hidden');
    tbody.innerHTML = changes.map(c => {
        let badge = '';
        if (c.status === 'approved') badge = '<span class="status-badge status-approved">Approved</span>';
        else if (c.status === 'pending') badge = '<span class="status-badge status-pending">Pending</span>';
        else badge = '<span class="status-badge status-rejected">Rejected</span>';
        const actions = c.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="approveRoomChange(${c.id})"><i class="fas fa-check"></i></button> <button class="btn btn-danger btn-sm" onclick="rejectRoomChange(${c.id})"><i class="fas fa-times"></i></button>` : '-';
        return `<tr><td>${c.studentName}</td><td>${c.fromRoom}</td><td>${c.toRoom}</td><td>${c.reason}</td><td>${c.date}</td><td>${badge}</td><td>${actions}</td></tr>`;
    }).join('');
}

function approveRoomChange(changeId) {
    const changes = getData('roomChanges');
    const change = changes.find(c => c.id === changeId);
    if (!change || change.status !== 'pending') return;

    const rooms = getData('rooms');
    const apps = getData('applications');
    const allocs = getData('allocations');

    const newRoom = rooms.find(r => r.id === change.toRoomId);
    if (!newRoom || newRoom.occupants.length >= newRoom.capacity) { showAlert('error', 'Target room is now full!'); return; }

    const oldRoom = rooms.find(r => r.number === change.fromRoom && r.block === change.fromBlock);
    if (oldRoom) oldRoom.occupants = oldRoom.occupants.filter(oid => oid !== change.studentId);
    newRoom.occupants.push(change.studentId);

    const app = apps.find(a => a.studentId === change.studentId && a.status === 'approved');
    if (app) { app.roomNumber = newRoom.number; app.roomBlock = newRoom.block; app.roomFloor = newRoom.floor; app.roomType = newRoom.capacity; }

    const alloc = allocs.find(a => a.studentId === change.studentId);
    if (alloc) { alloc.roomNumber = newRoom.number; alloc.roomBlock = newRoom.block; alloc.roomFloor = newRoom.floor; alloc.roomType = newRoom.capacity; }

    change.status = 'approved';
    setData('roomChanges', changes);
    setData('rooms', rooms);
    setData('applications', apps);
    setData('allocations', allocs);
    loadAdminDashboard();
    showAlert('success', 'Room change approved!');
}

function rejectRoomChange(changeId) {
    if (!confirm('Reject this room change request?')) return;
    const changes = getData('roomChanges');
    const change = changes.find(c => c.id === changeId);
    if (change) change.status = 'rejected';
    setData('roomChanges', changes);
    loadRoomChangeRequests();
    showAlert('success', 'Room change rejected.');
}

function loadPaymentsTable() {
    const payments = getData('payments');
    const allocs = getData('allocations');
    const users = getData('users');
    const tbody = document.getElementById('paymentsTableBody');
    const noMsg = document.getElementById('noPayments');

    const rows = [];
    allocs.forEach(a => {
        const p = payments.find(p => p.studentId === a.studentId);
        rows.push({ name: a.studentName, roll: a.studentRoll, room: a.roomNumber, amount: p ? '₹' + p.amount.toLocaleString() : '₹45,000', date: p ? p.date : '-', status: p ? 'paid' : 'unpaid' });
    });

    if (rows.length === 0) { tbody.innerHTML = ''; noMsg.classList.remove('hidden'); return; }
    noMsg.classList.add('hidden');
    tbody.innerHTML = rows.map(r => `<tr><td>${r.name}</td><td>${r.roll}</td><td>${r.room}</td><td>${r.amount}</td><td>${r.date}</td><td><span class="status-badge status-${r.status}">${capitalize(r.status)}</span></td></tr>`).join('');
}

function openModal(html) {
    document.getElementById('modalContent').innerHTML = html;
    document.getElementById('modalOverlay').classList.remove('hidden');
}
function closeModal(e) {
    if (e && e.target !== document.getElementById('modalOverlay')) return;
    document.getElementById('modalOverlay').classList.add('hidden');
}

function loadAdminComplaints() {
    const complaints = getData('complaints');
    const tbody = document.getElementById('complaintsTableBody');
    const noMsg = document.getElementById('noComplaints');
    if (complaints.length === 0) { tbody.innerHTML = ''; noMsg.classList.remove('hidden'); return; }
    noMsg.classList.add('hidden');
    tbody.innerHTML = complaints.map(c => {
        let badge = '';
        if (c.status === 'resolved') badge = '<span class="status-badge status-approved">Resolved</span>';
        else if (c.status === 'in-progress') badge = '<span class="status-badge status-pending">In Progress</span>';
        else badge = '<span class="status-badge status-not-allocated">Pending</span>';
        const actions = c.status !== 'resolved' ? `<button class="btn btn-accent btn-sm" onclick="updateComplaint(${c.id},'in-progress')" ${c.status === 'in-progress' ? 'disabled' : ''}><i class="fas fa-spinner"></i></button> <button class="btn btn-success btn-sm" onclick="updateComplaint(${c.id},'resolved')"><i class="fas fa-check"></i></button>` : '<span style="color:var(--success)"><i class="fas fa-check-circle"></i></span>';
        return `<tr><td>${c.ref}</td><td>${c.name}</td><td>${c.room}</td><td>${capitalize(c.category)}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${c.description}">${c.description}</td><td>${c.date}</td><td>${badge}</td><td>${actions}</td></tr>`;
    }).join('');
}

function updateComplaint(id, status) {
    const complaints = getData('complaints');
    const c = complaints.find(x => x.id === id);
    if (c) { c.status = status; setData('complaints', complaints); loadAdminComplaints(); showAlert('success', `Complaint ${c.ref} ${status === 'resolved' ? 'resolved' : 'marked in progress'}!`); }
}

function loadAdminGuestRequests() {
    const reqs = getData('guestRequests');
    const tbody = document.getElementById('adminGuestBody');
    const noMsg = document.getElementById('noAdminGuests');
    if (reqs.length === 0) { tbody.innerHTML = ''; noMsg.classList.remove('hidden'); return; }
    noMsg.classList.add('hidden');
    tbody.innerHTML = reqs.map(r => {
        let badge = '<span class="status-badge status-' + r.status + '">' + capitalize(r.status) + '</span>';
        const actions = r.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="updateGuestRequest(${r.id},'approved')"><i class="fas fa-check"></i></button> <button class="btn btn-danger btn-sm" onclick="updateGuestRequest(${r.id},'rejected')"><i class="fas fa-times"></i></button>` : '-';
        return `<tr><td>${r.studentName || '-'} (${r.studentRoll || ''})</td><td>${r.guestName}</td><td>${r.relation}</td><td>${r.checkIn}</td><td>${r.checkOut}</td><td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.purpose}</td><td>${badge}</td><td>${actions}</td></tr>`;
    }).join('');
}

function updateGuestRequest(id, status) {
    const reqs = getData('guestRequests');
    const r = reqs.find(x => x.id === id);
    if (r) { r.status = status; setData('guestRequests', reqs); loadAdminGuestRequests(); showAlert('success', `Guest request ${status}!`); }
}

function loadAdminGatePasses() {
    const passes = getData('gatePasses');
    const tbody = document.getElementById('adminGatePassBody');
    const noMsg = document.getElementById('noAdminGatePasses');
    if (passes.length === 0) { tbody.innerHTML = ''; noMsg.classList.remove('hidden'); return; }
    noMsg.classList.add('hidden');
    tbody.innerHTML = passes.map(p => {
        let badge = '<span class="status-badge status-' + p.status + '">' + capitalize(p.status) + '</span>';
        const actions = p.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="updateGatePass(${p.id},'approved')"><i class="fas fa-check"></i></button> <button class="btn btn-danger btn-sm" onclick="updateGatePass(${p.id},'rejected')"><i class="fas fa-times"></i></button>` : '-';
        return `<tr><td>${p.studentName || '-'} (${p.studentRoll || ''})</td><td>${capitalize(p.type)} Pass</td><td>${p.fromDate}</td><td>${p.toDate}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.reason}</td><td>${badge}</td><td>${actions}</td></tr>`;
    }).join('');
}

function updateGatePass(id, status) {
    const passes = getData('gatePasses');
    const p = passes.find(x => x.id === id);
    if (p) { p.status = status; setData('gatePasses', passes); loadAdminGatePasses(); showAlert('success', `Gate pass ${status}!`); }
}

document.addEventListener('DOMContentLoaded', function () {
    initializeLocalStorage();
    initTabs('studentTabs');
    initTabs('adminTabs');
    updateLandingStats();
    setStudentDateMinimums();
    showPage('landingPage');

    // Real-time validation hints on registration fields
    const fullNameEl = document.getElementById('fullName');
    if (fullNameEl) fullNameEl.addEventListener('input', function () {
        const err = validateFullName(this.value.trim());
        if (err) showFieldError('fullName', err); else clearFieldError('fullName');
    });
    const rollEl = document.getElementById('rollNumber');
    if (rollEl) rollEl.addEventListener('input', function () {
        const err = validateRollNumber(this.value.trim());
        if (err) showFieldError('rollNumber', err); else clearFieldError('rollNumber');
    });
    const emailEl = document.getElementById('email');
    if (emailEl) emailEl.addEventListener('input', function () {
        const err = validateEmail(this.value.trim());
        if (err) showFieldError('email', err); else clearFieldError('email');
    });
    const pwEl = document.getElementById('password');
    if (pwEl) pwEl.addEventListener('input', function () {
        const err = validatePassword(this.value);
        if (err) showFieldError('password', err); else clearFieldError('password');
    });
    const cpwEl = document.getElementById('confirmPassword');
    if (cpwEl) cpwEl.addEventListener('input', function () {
        const pw = document.getElementById('password').value;
        if (this.value && this.value !== pw) showFieldError('confirmPassword', 'Passwords do not match!');
        else clearFieldError('confirmPassword');
    });

    console.log('HostelAlloc System initialized with validations.');
});