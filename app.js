const doctors = [
  { id: "sabahet-dedja", name: "Dr. Sabahet Dedja", specialty: "Infeksioniste" },
  { id: "sonila-hysa", name: "Dr. Sonila Hysa", specialty: "Pediatre" },
  { id: "juxhin-papa", name: "Dr. Juxhin Papa", specialty: "Infeksionist" },
  { id: "stavri-muka", name: "Dr. Stavri Muka", specialty: "Radiolog" },
  { id: "blerta-lame", name: "Dr. Blerta Lame", specialty: "Alergologe" },
  { id: "fatjona-muda", name: "Dr. Fatjona Muda", specialty: "Reumatologe" },
  { id: "entela-greca", name: "Dr. Entela Greca", specialty: "Nefrologe" },
  { id: "sabina-dedej", name: "Dr. Sabina Dedej", specialty: "Dermatologe" },
  { id: "renta-sanxhaku", name: "Dr. Renta Sanxhaku", specialty: "Endokrinologe" },
  { id: "edlira-elezaj", name: "Dr. Edlira Elezaj", specialty: "Gastro-Hepatologe" },
  { id: "xheni-ngjela", name: "Dr. Xheni Ngjela", specialty: "Hematologe" },
  { id: "ada-gjuzi", name: "Dr. Ada Gjuzi", specialty: "Gjinekolog" },
  { id: "oljan-cala", name: "Dr. Oljan Cala", specialty: "Gjinekolog" },
  { id: "jetona-sulaj", name: "Dr. Jetona Sulaj", specialty: "ORL" },
  { id: "ermir-tafaj", name: "Dr. Ermir Tafaj", specialty: "Kardiolog" },
  { id: "nevila-caushi", name: "Dr. Nevila Caushi", specialty: "Kardiologe" },
  { id: "alfred-nona", name: "Dr. Alfred Nona", specialty: "Kardiolog" },
  { id: "shkelqim-ferko", name: "Dr. Shkelqim Ferko", specialty: "Urolog" },
  { id: "malbora-xhelili", name: "Dr. Malbora Xhelili", specialty: "Neurologe" },
  { id: "megi-mahmutaj", name: "Dr. Megi Mahmutaj", specialty: "Pediatre" },
  { id: "ketjona-hajdini", name: "Dr. Ketjona Hajdini", specialty: "Radiologe" },
  { id: "marinela-biba", name: "Dr. Marinela Biba", specialty: "Gjinekologe" },
  { id: "ardian-qosja", name: "Dr. Ardian Qosja", specialty: "Pneumolog" },
  { id: "blerim", name: "Dr. Blerim", specialty: "Anestezist" },
  { id: "argjir", name: "Dr. Argjir", specialty: "Anestezist" },
  { id: "elona-xherahu", name: "Dr. Elona Xherahu", specialty: "Reumatologe" },
  { id: "ardit-zanaj", name: "Dr. Ardit Zanaj", specialty: "Ortoped" },
  { id: "elton", name: "Dr. Elton", specialty: "Radiolog" },
  { id: "manjola-luzi", name: "Dr. Manjola Luzi", specialty: "Senologe" },
  { id: "ani-lika", name: "Dr. Ani Lika", specialty: "Reumatologe" },
].map((doctor, index) => ({
  ...doctor,
  times: buildTimes(index),
}));

const form = document.querySelector("#appointmentForm");
const authScreen = document.querySelector("#authScreen");
const bookingApp = document.querySelector("#bookingApp");
const authForm = document.querySelector("#authForm");
const authTabs = document.querySelectorAll("[data-auth-mode]");
const authSubmit = document.querySelector("#authSubmit");
const authMessage = document.querySelector("#authMessage");
const authName = document.querySelector("#authName");
const authPhone = document.querySelector("#authPhone");
const authPassword = document.querySelector("#authPassword");
const togglePassword = document.querySelector("#togglePassword");
const settingsButton = document.querySelector("#settingsButton");
const settingsModal = document.querySelector("#settingsModal");
const settingsForm = document.querySelector("#settingsForm");
const settingsName = document.querySelector("#settingsName");
const settingsEmail = document.querySelector("#settingsEmail");
const settingsPhone = document.querySelector("#settingsPhone");
const settingsPassword = document.querySelector("#settingsPassword");
const closeSettings = document.querySelector("#closeSettings");
const settingsMessage = document.querySelector("#settingsMessage");
const logoutButton = document.querySelector("#logoutButton");
const specialtyInput = document.querySelector("#specialty");
const dateInput = document.querySelector("#appointmentDate");
const patientNameInput = document.querySelector("#patientName");
const patientPhoneInput = document.querySelector("#patientPhone");
const doctorGrid = document.querySelector("#doctorGrid");
const slotGrid = document.querySelector("#slotGrid");
const slotHint = document.querySelector("#slotHint");
const confirmation = document.querySelector("#confirmation");
const confirmationText = document.querySelector("#confirmationText");
const appointmentsContainer = document.querySelector("#appointments");
const clearAppointments = document.querySelector("#clearAppointments");

let selectedDoctorId = "";
let selectedTime = "";
let authMode = "login";
let syncedAppointments = [];

const today = new Date();
const maxDate = new Date();
maxDate.setDate(today.getDate() + 45);
dateInput.min = toDateInputValue(today);
dateInput.max = toDateInputValue(maxDate);
dateInput.value = toDateInputValue(today);

function buildTimes(index) {
  return ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
}

function toDateInputValue(date) {
  return date.toISOString().slice(0, 10);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || "Ndodhi një problem.");
  }

  return payload;
}

async function loadAppointments() {
  try {
    const payload = await apiRequest("/api/appointments");
    syncedAppointments = payload.appointments;
    localStorage.setItem("geniusLabAppointments", JSON.stringify(syncedAppointments));
  } catch {
    syncedAppointments = JSON.parse(localStorage.getItem("geniusLabAppointments") || "[]");
  }
}

function getAppointments() {
  return syncedAppointments;
}

function cacheAppointments(appointments) {
  syncedAppointments = appointments;
  localStorage.setItem("geniusLabAppointments", JSON.stringify(appointments));
}

function getUsers() {
  return JSON.parse(localStorage.getItem("geniusLabUsers") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("geniusLabUsers", JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("geniusLabSession") || "null");
}

function setCurrentUser(user) {
  localStorage.setItem("geniusLabSession", JSON.stringify(user));
}

function openSettings() {
  const user = getCurrentUser();
  if (!user) return;

  settingsName.value = user.name || "";
  settingsEmail.value = user.email || "";
  settingsPhone.value = user.phone || "";
  settingsPassword.value = "";
  settingsMessage.textContent = "";
  settingsModal.hidden = false;
}

function closeSettingsModal() {
  settingsModal.hidden = true;
}

function setAuthMode(mode) {
  authMode = mode;
  authForm.dataset.mode = mode;
  authSubmit.textContent = mode === "login" ? "Hyr ne llogari" : "Krijo llogari";
  authName.required = mode === "signup";
  authPhone.required = mode === "signup";
  authMessage.textContent = "";
  authTabs.forEach((tab) => {
    tab.setAttribute("aria-pressed", String(tab.dataset.authMode === mode));
  });
}

function showBooking() {
  const user = getCurrentUser();
  if (user) {
    if (!patientNameInput.value) patientNameInput.value = user.name || "";
    if (!patientPhoneInput.value) patientPhoneInput.value = user.phone || "";
  }

  authScreen.hidden = true;
  bookingApp.hidden = false;
}

function showAuth() {
  bookingApp.hidden = true;
  authScreen.hidden = false;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function specialtyNames() {
  return [...new Set(doctors.map((doctor) => doctor.specialty))].sort((a, b) => a.localeCompare(b, "sq"));
}

function renderSpecialtyOptions() {
  specialtyInput.innerHTML = specialtyNames().map((specialty) => `<option value="${specialty}">${specialty}</option>`).join("");
}

function availableDoctors() {
  return doctors.filter((doctor) => doctor.specialty === specialtyInput.value);
}

function renderDoctors() {
  const visibleDoctors = availableDoctors();

  if (!visibleDoctors.some((doctor) => doctor.id === selectedDoctorId)) {
    selectedDoctorId = visibleDoctors[0]?.id || "";
    selectedTime = "";
  }

  doctorGrid.innerHTML = visibleDoctors
    .map((doctor) => {
      const initials = doctor.name
        .replace("Dr. ", "")
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2);

      return `
        <button class="doctor-card" type="button" data-doctor="${doctor.id}" aria-pressed="${doctor.id === selectedDoctorId}">
          <span class="doctor-avatar">${initials}</span>
          <span class="doctor-name">${doctor.name}</span>
          <span class="doctor-meta">${doctor.specialty}</span>
        </button>
      `;
    })
    .join("");

  renderSlots();
}

function isBooked(doctorId, date, time) {
  return getAppointments().some(
    (appointment) => appointment.doctorId === doctorId && appointment.date === date && appointment.time === time
  );
}

function renderSlots() {
  const doctor = doctors.find((item) => item.id === selectedDoctorId);
  selectedTime = doctor?.times.includes(selectedTime) ? selectedTime : "";

  if (!doctor) {
    slotGrid.innerHTML = "";
    slotHint.textContent = "Zgjidh një specialitet";
    return;
  }

  slotHint.textContent = `${doctor.name} më ${formatDate(dateInput.value)}`;
  slotGrid.innerHTML = doctor.times
    .map((time) => {
      const booked = isBooked(doctor.id, dateInput.value, time);
      return `
        <button class="slot-button" type="button" data-time="${time}" aria-pressed="${time === selectedTime}" ${booked ? "disabled" : ""}>
          ${time}
        </button>
      `;
    })
    .join("");
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat("sq-AL", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateValue}T12:00:00`));
}

function renderAppointments() {
  const appointments = getAppointments();

  if (appointments.length === 0) {
    appointmentsContainer.innerHTML = '<p class="empty-state">Nuk ka rezervime ende.</p>';
    clearAppointments.hidden = true;
    return;
  }

  clearAppointments.hidden = false;
  appointmentsContainer.innerHTML = appointments
    .map(
      (appointment) => `
      <article class="appointment-card">
        <strong>${appointment.patientName} me ${appointment.doctorName}</strong>
        <p>${formatDate(appointment.date)} në ${appointment.time} - ${appointment.mode}</p>
        <p>${appointment.specialty}</p>
      </article>
    `
    )
    .join("");
}

doctorGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-doctor]");
  if (!button) return;

  selectedDoctorId = button.dataset.doctor;
  selectedTime = "";
  renderDoctors();
});

slotGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-time]");
  if (!button || button.disabled) return;

  selectedTime = button.dataset.time;
  renderSlots();
});

specialtyInput.addEventListener("change", renderDoctors);
dateInput.addEventListener("change", renderSlots);

clearAppointments.addEventListener("click", async () => {
  try {
    await apiRequest("/api/appointments", { method: "DELETE" });
    cacheAppointments([]);
  } catch {
    cacheAppointments([]);
  }
  confirmation.hidden = true;
  renderSlots();
  renderAppointments();
});

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode));
});

togglePassword.addEventListener("click", () => {
  const isVisible = authPassword.type === "text";
  authPassword.type = isVisible ? "password" : "text";
  togglePassword.setAttribute("aria-pressed", String(!isVisible));
  togglePassword.setAttribute("aria-label", isVisible ? "Shfaq fjalekalimin" : "Fshih fjalekalimin");
  togglePassword.title = isVisible ? "Shfaq fjalekalimin" : "Fshih fjalekalimin";
});

async function legacyLocalSignup(formData, email, password) {
  const users = getUsers();
  if (users.some((user) => user.email === email)) {
    throw new Error("Kjo adrese email eshte regjistruar tashme.");
  }

  const user = {
    id: crypto.randomUUID(),
    name: formData.get("authName").trim(),
    phone: formData.get("authPhone").trim(),
    email,
    password,
  };

  users.push(user);
  saveUsers(users);
  return { id: user.id, name: user.name, phone: user.phone, email: user.email };
}

async function legacyLocalLogin(email, password) {
  const users = getUsers();
  const user = users.find((item) => item.email === email && item.password === password);
  if (!user) {
    throw new Error("Email ose fjalekalim i pasakte.");
  }

  return { id: user.id, name: user.name, phone: user.phone, email: user.email };
}

async function authenticateWithFallback(formData, email, password) {
  try {
    if (authMode === "signup") {
      const payload = await apiRequest("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          name: formData.get("authName").trim(),
          phone: formData.get("authPhone").trim(),
          email,
          password,
        }),
      });
      return payload.user;
    }

    const payload = await apiRequest("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return payload.user;
  } catch (error) {
    if (error.message.includes("Failed") || error.message.includes("fetch")) {
      return authMode === "signup" ? legacyLocalSignup(formData, email, password) : legacyLocalLogin(email, password);
    }
    throw error;
  }
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(authForm);
  const email = normalizeEmail(formData.get("authEmail"));
  const password = formData.get("authPassword");

  if (password.length < 6) {
    authMessage.textContent = "Fjalekalimi duhet te kete te pakten 6 karaktere.";
    return;
  }

  try {
    const user = await authenticateWithFallback(formData, email, password);
    setCurrentUser(user);
    authForm.reset();
    await loadAppointments();
    renderAppointments();
    showBooking();
  } catch (error) {
    authMessage.textContent = error.message;
  }
});

settingsButton.addEventListener("click", openSettings);
closeSettings.addEventListener("click", closeSettingsModal);

settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) {
    closeSettingsModal();
  }
});

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const formData = new FormData(settingsForm);
  const nextEmail = normalizeEmail(formData.get("settingsEmail"));
  const nextPassword = formData.get("settingsPassword");

  if (nextPassword && nextPassword.length < 6) {
    settingsMessage.textContent = "Fjalekalimi duhet te kete te pakten 6 karaktere.";
    return;
  }

  try {
    const payload = await apiRequest(`/api/users/${currentUser.id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: formData.get("settingsName").trim(),
        email: nextEmail,
        phone: formData.get("settingsPhone").trim(),
        password: nextPassword,
      }),
    });
    setCurrentUser(payload.user);
    patientNameInput.value = payload.user.name;
    patientPhoneInput.value = payload.user.phone;
    settingsMessage.textContent = "Te dhenat u perditesuan me sukses.";
  } catch (error) {
    settingsMessage.textContent = error.message;
  }
  return;

  const users = getUsers();
  const existingUser = users.find((user) => user.email === nextEmail && user.id !== currentUser.id);

  if (existingUser) {
    settingsMessage.textContent = "Ky email përdoret nga një llogari tjetër.";
    return;
  }

  const userIndex = users.findIndex((user) => user.id === currentUser.id);
  if (userIndex === -1) {
    settingsMessage.textContent = "Llogaria nuk u gjet.";
    return;
  }

  if (nextPassword && nextPassword.length < 6) {
    settingsMessage.textContent = "Fjalëkalimi duhet të ketë të paktën 6 karaktere.";
    return;
  }

  const updatedUser = {
    ...users[userIndex],
    name: formData.get("settingsName").trim(),
    email: nextEmail,
    phone: formData.get("settingsPhone").trim(),
  };

  if (nextPassword) {
    updatedUser.password = nextPassword;
  }

  users[userIndex] = updatedUser;
  saveUsers(users);
  setCurrentUser({ id: updatedUser.id, name: updatedUser.name, phone: updatedUser.phone, email: updatedUser.email });
  patientNameInput.value = updatedUser.name;
  patientPhoneInput.value = updatedUser.phone;
  settingsMessage.textContent = "Të dhënat u përditësuan me sukses.";
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("geniusLabSession");
  confirmation.hidden = true;
  setAuthMode("login");
  showAuth();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const doctor = doctors.find((item) => item.id === selectedDoctorId);
  if (!doctor || !selectedTime) {
    slotHint.textContent = "Ju lutemi zgjidhni një orar të disponueshëm";
    return;
  }

  const formData = new FormData(form);
  const appointment = {
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: formData.get("specialty"),
    date: formData.get("appointmentDate"),
    time: selectedTime,
    mode: formData.get("visitMode"),
    patientName: formData.get("patientName").trim(),
    phone: formData.get("patientPhone").trim(),
    email: getCurrentUser()?.email || "",
    reason: formData.get("reason").trim(),
  };

  let savedAppointment = appointment;
  try {
    const payload = await apiRequest("/api/appointments", {
      method: "POST",
      body: JSON.stringify(appointment),
    });
    savedAppointment = payload.appointment;
    cacheAppointments([savedAppointment, ...getAppointments()]);
  } catch {
    savedAppointment = { ...appointment, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    cacheAppointments([savedAppointment, ...getAppointments()]);
  }

  confirmation.hidden = false;
  confirmation.classList.remove("is-confirming");
  void confirmation.offsetWidth;
  confirmation.classList.add("is-confirming");
  confirmationText.textContent = `${savedAppointment.patientName}, rezervimi juaj me ${doctor.name} u konfirmua per ${formatDate(savedAppointment.date)} ne ${savedAppointment.time}. Do te njoftoheni me email${savedAppointment.email ? ` (${savedAppointment.email})` : ""} dhe ne telefon${savedAppointment.phone ? ` (${savedAppointment.phone})` : ""} 15 minuta para orarit te takimit.`;
  confirmation.scrollIntoView({ behavior: "smooth", block: "start" });

  selectedTime = "";
  form.reset();
  specialtyInput.value = savedAppointment.specialty;
  dateInput.value = savedAppointment.date;
  renderDoctors();
  renderAppointments();
});

async function initApp() {
  renderSpecialtyOptions();
  await loadAppointments();
  renderDoctors();
  renderAppointments();
  setAuthMode("login");

  if (getCurrentUser()) {
    showBooking();
  } else {
    showAuth();
  }
}

initApp();
