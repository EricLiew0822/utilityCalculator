/**
 * Integrated Electricity and Water Bill Calculator - Frontend Engine
 */

// Clean blank initial state with zero prefilled values
const DEFAULT_STATE = {
  electricDate: "",
  waterStartDate: "",
  waterEndDate: "",
  electricAmount: "",
  prevBalance: "",
  totalKwh: "",
  waterAmount: "",
  rateMode: "ceil",
  manualRate: "",
  rooms: [
    { id: "room_1", name: "", prevMeter: "", currMeter: "", tenants: [""] }
  ]
};

// Preset reference dataset accessible via the "Load Reference Sample" button
const SAMPLE_REFERENCE_STATE = {
  electricDate: "2026-08-12",
  waterStartDate: "2026-05-01",
  waterEndDate: "2026-07-31",
  electricAmount: 157.15,
  prevBalance: 2.42,
  totalKwh: 477.0,
  waterAmount: 7.0,
  rateMode: "ceil",
  manualRate: 0.33,
  rooms: [
    { id: "room_1", name: "Master", prevMeter: 5574, currMeter: 5774, tenants: ["Bryan", "Lim"] },
    { id: "room_2", name: "Middle", prevMeter: 4693, currMeter: 4693, tenants: ["Eric"] },
    { id: "room_3", name: "Small", prevMeter: 4255, currMeter: 4312, tenants: ["Honger"] }
  ]
};

let appState = loadSavedState() || JSON.parse(JSON.stringify(DEFAULT_STATE));

// --- DOM Elements ---
const elElectricDate = document.getElementById("electricDate");
const elWaterStartDate = document.getElementById("waterStartDate");
const elWaterEndDate = document.getElementById("waterEndDate");
const elElectricAmount = document.getElementById("electricAmount");
const elPrevBalance = document.getElementById("prevBalance");
const elTotalKwh = document.getElementById("totalKwh");
const elWaterAmount = document.getElementById("waterAmount");
const elRateMode = document.getElementById("rateMode");
const elManualRate = document.getElementById("manualRate");
const elManualRateGroup = document.getElementById("manualRateGroup");
const elRoomsContainer = document.getElementById("roomsContainer");
const elBtnAddRoom = document.getElementById("btnAddRoom");
const elBtnLoadSample = document.getElementById("btnLoadSample");
const elBtnRollForward = document.getElementById("btnRollForward");
const elBtnCopyReport = document.getElementById("btnCopyReport");
const elBtnOpenPdf = document.getElementById("btnOpenPdf");
const elPdfPreviewWrapper = document.getElementById("pdfPreviewWrapper");

// Miniature PDF Preview Elements
const elMiniDocPeriod = document.getElementById("miniDocPeriod");
const elMiniDocRate = document.getElementById("miniDocRate");
const elMiniDocGrid = document.getElementById("miniDocGrid");
const elMiniDocWater = document.getElementById("miniDocWater");
const elMiniDocBalance = document.getElementById("miniDocBalance");
const elMiniTenantRows = document.getElementById("miniTenantRows");

// Display Elements
const elDispUnitRate = document.getElementById("dispUnitRate");
const elDispNetElectric = document.getElementById("dispNetElectric");
const elDispCommonPerPerson = document.getElementById("dispCommonPerPerson");
const elDispCommonKwh = document.getElementById("dispCommonKwh");
const elDispWaterPerPerson = document.getElementById("dispWaterPerPerson");
const elDispTotalTenants = document.getElementById("dispTotalTenants");
const elTenantTableBody = document.getElementById("tenantTableBody");
const elDispCollected = document.getElementById("dispCollected");
const elDispActual = document.getElementById("dispActual");
const elDispBalance = document.getElementById("dispBalance");
const elReportPreview = document.getElementById("reportPreview");
const elToast = document.getElementById("toast");

// Wizard Elements
const elBtnOpenWizard = document.getElementById("btnOpenWizard");
const elWizardModal = document.getElementById("wizardModal");
const elBtnCloseWizard = document.getElementById("btnCloseWizard");
const elWizardBody = document.getElementById("wizardBody");
const elBtnWizardPrev = document.getElementById("btnWizardPrev");
const elBtnWizardNext = document.getElementById("btnWizardNext");
const elWizardTitle = document.getElementById("wizardTitle");

let currentWizardStep = 1;
const TOTAL_WIZARD_STEPS = 3;
let wizardTempState = {};

// --- Initialization ---
function init() {
  bindFormInputs();
  renderRooms();
  attachEventListeners();
  recalculate();
}

function bindFormInputs() {
  if (elElectricDate) elElectricDate.value = appState.electricDate || "";
  if (elWaterStartDate) elWaterStartDate.value = appState.waterStartDate || "";
  if (elWaterEndDate) elWaterEndDate.value = appState.waterEndDate || "";
  
  elElectricAmount.value = (appState.electricAmount !== null && appState.electricAmount !== undefined) ? appState.electricAmount : "";
  elPrevBalance.value = (appState.prevBalance !== null && appState.prevBalance !== undefined) ? appState.prevBalance : "";
  elTotalKwh.value = (appState.totalKwh !== null && appState.totalKwh !== undefined) ? appState.totalKwh : "";
  elWaterAmount.value = (appState.waterAmount !== null && appState.waterAmount !== undefined) ? appState.waterAmount : "";
  elRateMode.value = appState.rateMode || "ceil";
  elManualRate.value = (appState.manualRate !== null && appState.manualRate !== undefined) ? appState.manualRate : "";

  toggleManualRate();
}

function attachEventListeners() {
  const inputs = [
    elElectricDate, elWaterStartDate, elWaterEndDate, elElectricAmount,
    elPrevBalance, elTotalKwh, elWaterAmount, elManualRate
  ];

  inputs.forEach(input => {
    if (input) {
      input.addEventListener("input", () => {
        saveInputState();
        recalculate();
      });
      input.addEventListener("change", () => {
        saveInputState();
        recalculate();
      });
    }
  });

  elRateMode.addEventListener("change", () => {
    toggleManualRate();
    saveInputState();
    recalculate();
  });

  elBtnAddRoom.addEventListener("click", () => {
    const newId = "room_" + Date.now();
    appState.rooms.push({
      id: newId,
      name: "",
      prevMeter: "",
      currMeter: "",
      tenants: [""]
    });
    renderRooms();
    saveInputState();
    recalculate();
  });

  elBtnLoadSample.addEventListener("click", () => {
    appState = JSON.parse(JSON.stringify(SAMPLE_REFERENCE_STATE));
    bindFormInputs();
    renderRooms();
    saveInputState();
    recalculate();
    showToast("Loaded August 2026 reference sample!");
  });

  elBtnRollForward.addEventListener("click", () => {
    rollForwardNextMonth();
  });

  elBtnCopyReport.addEventListener("click", () => {
    copyReportToClipboard();
  });

  if (elBtnOpenPdf) {
    elBtnOpenPdf.addEventListener("click", () => {
      saveInputState();
      window.open("invoice.html", "_blank");
    });
  }

  if (elPdfPreviewWrapper) {
    elPdfPreviewWrapper.addEventListener("click", () => {
      saveInputState();
      window.open("invoice.html", "_blank");
    });
  }

  // Wizard Modal
  elBtnOpenWizard.addEventListener("click", openWizard);
  elBtnCloseWizard.addEventListener("click", closeWizard);
  elBtnWizardPrev.addEventListener("click", wizardGoPrev);
  elBtnWizardNext.addEventListener("click", wizardGoNext);
}

function toggleManualRate() {
  if (elRateMode.value === "manual") {
    elManualRateGroup.classList.remove("hidden");
  } else {
    elManualRateGroup.classList.add("hidden");
  }
}

function saveInputState() {
  appState.electricDate = elElectricDate ? elElectricDate.value : "";
  appState.waterStartDate = elWaterStartDate ? elWaterStartDate.value : "";
  appState.waterEndDate = elWaterEndDate ? elWaterEndDate.value : "";
  appState.electricAmount = elElectricAmount.value !== "" ? parseFloat(elElectricAmount.value) : "";
  appState.prevBalance = elPrevBalance.value !== "" ? parseFloat(elPrevBalance.value) : "";
  appState.totalKwh = elTotalKwh.value !== "" ? parseFloat(elTotalKwh.value) : "";
  appState.waterAmount = elWaterAmount.value !== "" ? parseFloat(elWaterAmount.value) : "";
  appState.rateMode = elRateMode.value;
  appState.manualRate = elManualRate.value !== "" ? parseFloat(elManualRate.value) : "";

  localStorage.setItem("bill_calc_state_v4", JSON.stringify(appState));
}

function loadSavedState() {
  try {
    const saved = localStorage.getItem("bill_calc_state_v4");
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    if (parsed.rooms) {
      parsed.rooms.forEach(r => {
        if (typeof r.tenants === "string") {
          r.tenants = r.tenants.split(",").map(t => t.trim()).filter(Boolean);
        }
      });
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

// --- Date Formatting Helpers ---
function formatElectricDate(dateStr) {
  if (!dateStr) return "Current Period";
  try {
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return dateStr;
    const monthName = date.toLocaleDateString("en-US", { month: "long" });
    return `By ${day} ${monthName} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

function formatWaterPeriod(startStr, endStr) {
  if (!startStr && !endStr) return "Current Period";
  try {
    if (startStr && !endStr) {
      const [y, m, d] = startStr.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (startStr && endStr) {
      const [y1, m1, d1] = startStr.split("-").map(Number);
      const [y2, m2, d2] = endStr.split("-").map(Number);
      const date1 = new Date(y1, m1 - 1, d1);
      const date2 = new Date(y2, m2 - 1, d2);
      const mName1 = date1.toLocaleDateString("en-US", { month: "long" });
      const mName2 = date2.toLocaleDateString("en-US", { month: "long" });

      if (y1 === y2) {
        if (m1 === m2) {
          return `${mName1} ${y1}`;
        }
        return `${mName1} to ${mName2} ${y1}`;
      }
      return `${mName1} ${y1} to ${mName2} ${y2}`;
    }
    return "Current Period";
  } catch (e) {
    return `${startStr} to ${endStr}`;
  }
}

// --- Room Rendering ---
function renderRooms() {
  elRoomsContainer.innerHTML = "";

  if (!appState.rooms || appState.rooms.length === 0) {
    appState.rooms = [{ id: "room_1", name: "", prevMeter: "", currMeter: "", tenants: [""] }];
  }

  const sampleNames = ["Master", "Middle", "Small", "Studio", "Room 5"];
  const sampleTenantExamples = ["Bryan", "Lim", "Eric", "Honger", "Alex"];

  appState.rooms.forEach((room, roomIndex) => {
    const roomEl = document.createElement("div");
    roomEl.className = "room-card";
    roomEl.dataset.id = room.id;

    const prevVal = (room.prevMeter !== "" && room.prevMeter !== null && room.prevMeter !== undefined) ? parseFloat(room.prevMeter) : 0;
    const currVal = (room.currMeter !== "" && room.currMeter !== null && room.currMeter !== undefined) ? parseFloat(room.currMeter) : 0;
    const kwhUsed = Math.max(0, currVal - prevVal);

    if (!Array.isArray(room.tenants) || room.tenants.length === 0) {
      room.tenants = [""];
    }

    let tenantInputsHtml = room.tenants.map((tName, tIndex) => {
      const placeholderTenant = sampleTenantExamples[tIndex % sampleTenantExamples.length] || `Tenant ${tIndex + 1}`;
      return `
        <div class="tenant-input-row" data-tindex="${tIndex}">
          <input type="text" class="form-control tenant-name-input" value="${escapeHtml(tName || '')}" placeholder="e.g. ${placeholderTenant}" />
          ${room.tenants.length > 1 ? `<button type="button" class="btn-danger-icon btn-remove-tenant" title="Remove Tenant">✕</button>` : ''}
        </div>
      `;
    }).join("");

    const placeholderRoomName = sampleNames[roomIndex % sampleNames.length] || `Room ${roomIndex + 1}`;

    roomEl.innerHTML = `
      <div class="room-card-header">
        <input type="text" class="room-name-input" value="${escapeHtml(room.name || '')}" placeholder="e.g. ${placeholderRoomName}" data-field="name" />
        ${appState.rooms.length > 1 ? `<button type="button" class="btn-danger-icon btn-remove-room" title="Remove Room">✕</button>` : ''}
      </div>
      <div class="room-meter-grid">
        <div class="form-group">
          <label>Previous Meter Reading</label>
          <input type="number" step="1" class="form-control room-meter-input" value="${(room.prevMeter !== '' && room.prevMeter !== null && room.prevMeter !== undefined) ? room.prevMeter : ''}" placeholder="5574" data-field="prevMeter" />
        </div>
        <div class="form-group">
          <label>Current Meter Reading</label>
          <input type="number" step="1" class="form-control room-meter-input" value="${(room.currMeter !== '' && room.currMeter !== null && room.currMeter !== undefined) ? room.currMeter : ''}" placeholder="5774" data-field="currMeter" />
        </div>
        <div class="form-group">
          <label>Room AC kWh</label>
          <div class="usage-badge room-kwh-badge">${kwhUsed.toFixed(0)} kWh</div>
        </div>
      </div>
      <div class="tenants-section">
        <div class="tenants-list-header">
          <label>Tenants staying in this room (${room.tenants.length}):</label>
          <button type="button" class="btn btn-sm btn-outline btn-add-tenant">+ Add Tenant</button>
        </div>
        <div class="tenant-inputs-grid">
          ${tenantInputsHtml}
        </div>
      </div>
    `;

    // Room name & meter inputs
    const roomInputs = roomEl.querySelectorAll(".room-meter-input, .room-name-input");
    roomInputs.forEach(input => {
      input.addEventListener("input", (e) => {
        const field = e.target.dataset.field;
        const val = e.target.value;
        if (field === "prevMeter" || field === "currMeter") {
          room[field] = val !== "" ? parseFloat(val) : "";
          const kwhBadge = roomEl.querySelector(".room-kwh-badge");
          const p = parseFloat(room.prevMeter) || 0;
          const c = parseFloat(room.currMeter) || 0;
          const updatedKwh = Math.max(0, c - p);
          if (kwhBadge) kwhBadge.textContent = `${updatedKwh.toFixed(0)} kWh`;
        } else {
          room[field] = val;
        }
        saveInputState();
        recalculate();
      });
    });

    // Remove room button
    const removeRoomBtn = roomEl.querySelector(".btn-remove-room");
    if (removeRoomBtn) {
      removeRoomBtn.addEventListener("click", () => {
        appState.rooms.splice(roomIndex, 1);
        renderRooms();
        saveInputState();
        recalculate();
      });
    }

    // Add Tenant button
    const addTenantBtn = roomEl.querySelector(".btn-add-tenant");
    addTenantBtn.addEventListener("click", () => {
      room.tenants.push("");
      renderRooms();
      saveInputState();
      recalculate();
    });

    // Tenant name inputs & remove buttons
    const tenantRows = roomEl.querySelectorAll(".tenant-input-row");
    tenantRows.forEach(row => {
      const tIdx = parseInt(row.dataset.tindex, 10);
      const nameInput = row.querySelector(".tenant-name-input");
      nameInput.addEventListener("input", (e) => {
        room.tenants[tIdx] = e.target.value;
        saveInputState();
        recalculate();
      });

      const removeTBtn = row.querySelector(".btn-remove-tenant");
      if (removeTBtn) {
        removeTBtn.addEventListener("click", () => {
          room.tenants.splice(tIdx, 1);
          renderRooms();
          saveInputState();
          recalculate();
        });
      }
    });

    elRoomsContainer.appendChild(roomEl);
  });
}

// --- Calculation Engine ---
function recalculate() {
  const electricAmount = parseFloat(elElectricAmount.value) || 0;
  const prevBalance = parseFloat(elPrevBalance.value) || 0;
  const totalKwh = parseFloat(elTotalKwh.value) || 0;
  const waterAmount = parseFloat(elWaterAmount.value) || 0;
  const rateMode = elRateMode.value;
  const manualRate = parseFloat(elManualRate.value) || 0;

  // 1. Effective Unit Rate
  const netElectric = Math.max(0, electricAmount - prevBalance);
  const rawRate = totalKwh > 0 ? netElectric / totalKwh : 0;
  
  let unitRate = 0;
  if (rateMode === "manual") {
    unitRate = manualRate;
  } else {
    // ceil
    unitRate = Math.ceil(rawRate * 100) / 100;
  }

  // 2. Parse Tenants and Room Usages
  let totalHeadcount = 0;
  let totalRoomKwh = 0;
  const roomCalculations = [];

  (appState.rooms || []).forEach((r, idx) => {
    const prev = (r.prevMeter !== "" && r.prevMeter !== null && r.prevMeter !== undefined) ? parseFloat(r.prevMeter) : 0;
    const curr = (r.currMeter !== "" && r.currMeter !== null && r.currMeter !== undefined) ? parseFloat(r.currMeter) : 0;
    const kwh = Math.max(0, curr - prev);
    totalRoomKwh += kwh;

    const roomName = (r.name && r.name.trim()) ? r.name.trim() : `Room ${idx + 1}`;

    const tenantList = (Array.isArray(r.tenants) ? r.tenants : [r.tenants])
      .map(t => (typeof t === "string" ? t.trim() : ""))
      .filter(Boolean);

    // If no tenant names typed yet, treat as 1 unnamed tenant for preview
    const effectiveTenants = tenantList.length > 0 ? tenantList : [`Tenant ${totalHeadcount + 1}`];

    totalHeadcount += effectiveTenants.length;
    const roomCost = kwh * unitRate;
    const perTenantAc = effectiveTenants.length > 0 ? (roomCost / effectiveTenants.length) : 0;

    roomCalculations.push({
      name: roomName,
      prevMeter: prev,
      currMeter: curr,
      kwh: kwh,
      roomCost: roomCost,
      perTenantAc: perTenantAc,
      tenants: effectiveTenants
    });
  });

  const commonKwh = Math.max(0, totalKwh - totalRoomKwh);
  const commonCostPerPerson = totalHeadcount > 0 ? ((commonKwh * unitRate) / totalHeadcount) : 0;
  const waterCostPerPerson = totalHeadcount > 0 ? (waterAmount / totalHeadcount) : 0;

  // 3. Individual Breakdown
  const tenantRows = [];
  roomCalculations.forEach(r => {
    r.tenants.forEach(t => {
      const total = commonCostPerPerson + r.perTenantAc + waterCostPerPerson;
      tenantRows.push({
        tenant: t,
        room: r.name,
        common: commonCostPerPerson,
        roomAc: r.perTenantAc,
        water: waterCostPerPerson,
        total: total
      });
    });
  });

  const totalCollected = tenantRows.reduce((sum, t) => sum + round2(t.total), 0);
  const actualPayable = electricAmount + waterAmount;
  const nextMonthBalance = Math.max(0, totalCollected - actualPayable);

  // 4. Update UI Displays
  elDispUnitRate.innerHTML = `RM ${unitRate.toFixed(2)}<span class="unit">/kWh</span>`;
  elDispNetElectric.textContent = `Net: RM ${netElectric.toFixed(2)} (raw: ${rawRate.toFixed(4)})`;
  elDispCommonPerPerson.textContent = `RM ${round2(commonCostPerPerson).toFixed(2)}`;
  elDispCommonKwh.textContent = `${commonKwh.toFixed(0)} kWh / ${totalHeadcount} pax`;
  elDispWaterPerPerson.textContent = `RM ${round2(waterCostPerPerson).toFixed(2)}`;
  elDispTotalTenants.textContent = `${totalHeadcount} Total Tenants`;

  // Render Table Rows
  elTenantTableBody.innerHTML = "";
  tenantRows.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHtml(t.tenant)}</strong></td>
      <td><span class="helper-text">${escapeHtml(t.room)}</span></td>
      <td>RM ${round2(t.common).toFixed(2)}</td>
      <td>RM ${round2(t.roomAc).toFixed(2)}</td>
      <td>RM ${round2(t.water).toFixed(2)}</td>
      <td class="text-right"><span class="tenant-total">RM ${round2(t.total).toFixed(2)}</span></td>
    `;
    elTenantTableBody.appendChild(tr);
  });

  elDispCollected.textContent = `RM ${totalCollected.toFixed(2)}`;
  elDispActual.textContent = `RM ${actualPayable.toFixed(2)}`;
  elDispBalance.textContent = `RM ${nextMonthBalance.toFixed(2)}`;

  // Update Live Miniature PDF Preview
  if (elMiniDocPeriod) elMiniDocPeriod.textContent = electricFormattedDate;
  if (elMiniDocRate) elMiniDocRate.textContent = `RM ${unitRate.toFixed(2)}/kWh`;
  if (elMiniDocGrid) elMiniDocGrid.textContent = `${totalKwh.toFixed(0)} kWh`;
  if (elMiniDocWater) elMiniDocWater.textContent = `RM ${round2(waterCostPerPerson).toFixed(2)}/pax`;
  if (elMiniDocBalance) elMiniDocBalance.textContent = `RM ${nextMonthBalance.toFixed(2)}`;

  if (elMiniTenantRows) {
    elMiniTenantRows.innerHTML = "";
    tenantRows.forEach(t => {
      const row = document.createElement("div");
      row.className = "pdf-mini-row";
      row.innerHTML = `
        <span><strong>${escapeHtml(t.tenant)}</strong></span>
        <span style="color:#64748b;">${escapeHtml(t.room)}</span>
        <span class="text-right"><strong>RM ${round2(t.total).toFixed(2)}</strong></span>
      `;
      elMiniTenantRows.appendChild(row);
    });
  }

  // 5. Generate Formatted WhatsApp Text
  const electricFormattedDate = formatElectricDate(elElectricDate ? elElectricDate.value : "");
  const waterFormattedPeriod = formatWaterPeriod(
    elWaterStartDate ? elWaterStartDate.value : "",
    elWaterEndDate ? elWaterEndDate.value : ""
  );

  generateFormattedReport({
    electricPeriod: electricFormattedDate,
    waterPeriod: waterFormattedPeriod,
    electricAmount,
    prevBalance,
    totalKwh,
    waterAmount,
    unitRate,
    rawRate,
    commonKwh,
    commonCostPerPerson,
    waterCostPerPerson,
    totalHeadcount,
    roomCalculations,
    tenantRows,
    totalCollected,
    actualPayable,
    nextMonthBalance
  });
}

function generateFormattedReport(data) {
  const roomKwhString = data.roomCalculations.map(r => `${r.kwh.toFixed(0)}`).join(" – ");

  const lines = [
    `*Electric Bill ${data.electricPeriod}*`,
    `(RM (${data.electricAmount.toFixed(2)}- ${data.prevBalance.toFixed(2)}) / ${data.totalKwh.toFixed(0)} kWh) = ${data.rawRate.toFixed(4)} ≈ RM ${data.unitRate.toFixed(2)} per kWh\n`,
    `*Common Usage (${data.totalKwh.toFixed(0)} – ${roomKwhString} = ${data.commonKwh.toFixed(0)} kWh)*`,
    `(${data.commonKwh.toFixed(0)} kWh × RM${data.unitRate.toFixed(2)}) / ${data.totalHeadcount} = *RM ${round2(data.commonCostPerPerson).toFixed(2)}*\n`,
    `*Water Bill for ${data.waterPeriod}*`,
    `RM (${data.waterAmount.toFixed(2)} / ${data.totalHeadcount}) = *RM ${round2(data.waterCostPerPerson).toFixed(2)}*\n`
  ];

  data.roomCalculations.forEach(r => {
    lines.push(`------*${r.name}*------`);
    lines.push(`AC Usage: (${r.currMeter.toFixed(0)} - ${r.prevMeter.toFixed(0)}) kWh = ${r.kwh.toFixed(0)} kWh`);
    lines.push(`(${r.kwh.toFixed(0)} * ${data.unitRate.toFixed(2)}) = RM ${r.roomCost.toFixed(2)} / ${r.tenants.length} ≈ RM ${r.perTenantAc.toFixed(2)} per person\n`);

    r.tenants.forEach(t => {
      const row = data.tenantRows.find(item => item.tenant === t && item.room === r.name);
      if (row) {
        lines.push(`${padRight(t, 8)} : RM (${round2(row.common).toFixed(2)} + ${round2(row.roomAc).toFixed(2)} + ${round2(row.water).toFixed(2)}) ≈ *RM ${round2(row.total).toFixed(2)}*`);
      }
    });
    lines.push("");
  });

  const sumParts = data.tenantRows.map(t => `${round2(t.total).toFixed(2)}`).join(" + ");
  lines.push(`Total : RM (${sumParts}) = ${data.totalCollected.toFixed(2)}`);
  lines.push(`Actual : RM ${data.actualPayable.toFixed(2)}`);
  lines.push(`Collected : RM ${data.totalCollected.toFixed(2)}`);
  lines.push(`\n*Balance : RM ${data.nextMonthBalance.toFixed(2)}* ➔ *use for next month bill deduction before calculation.*`);

  elReportPreview.textContent = lines.join("\n");
}

function rollForwardNextMonth() {
  const currentBalance = parseFloat(elDispBalance.textContent.replace("RM", "").trim()) || 0;
  
  if (confirm(`Roll forward to next month?\n\n- Previous Balance will be set to RM ${currentBalance.toFixed(2)}\n- Room Previous Meters will be updated to current meter readings\n- Ready for new readings input!`)) {
    elPrevBalance.value = currentBalance.toFixed(2);
    appState.prevBalance = currentBalance;

    appState.rooms.forEach(r => {
      r.prevMeter = r.currMeter;
      r.currMeter = "";
    });

    renderRooms();
    saveInputState();
    recalculate();
    showToast("Rolled forward to next month successfully!");
  }
}

function copyReportToClipboard() {
  const text = elReportPreview.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Report copied to clipboard!");
  }).catch(() => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    showToast("Report copied to clipboard!");
  });
}

// =====================================================================
// Interactive Wizard Modal Prompter
// =====================================================================

function openWizard() {
  wizardTempState = JSON.parse(JSON.stringify(appState));
  currentWizardStep = 1;
  elWizardModal.classList.remove("hidden");
  renderWizardStep();
}

function closeWizard() {
  elWizardModal.classList.add("hidden");
}

function renderWizardStep() {
  elWizardTitle.textContent = `Interactive Prompt Wizard (Step ${currentWizardStep} of ${TOTAL_WIZARD_STEPS})`;
  elBtnWizardPrev.classList.toggle("hidden", currentWizardStep === 1);
  elBtnWizardNext.textContent = currentWizardStep === TOTAL_WIZARD_STEPS ? "Finish & Calculate ✨" : "Next ➔";

  if (currentWizardStep === 1) {
    elWizardBody.innerHTML = `
      <div class="wizard-step-title">⚡ Step 1: Utility Invoices & Consumption</div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Electric Bill Due Date</label>
        <input type="date" id="wizElecDate" class="form-control" value="${wizardTempState.electricDate || ''}" />
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Total Electric Bill Amount</label>
        <input type="number" step="0.01" id="wizElecAmount" class="form-control" value="${wizardTempState.electricAmount || ''}" placeholder="157.15" />
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Previous Month Balance Carryover</label>
        <input type="number" step="0.01" id="wizPrevBalance" class="form-control" value="${wizardTempState.prevBalance || ''}" placeholder="2.42" />
        <small class="helper-text">Deducted before calculating electricity rate</small>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Total Grid Electricity Usage</label>
        <input type="number" step="0.1" id="wizTotalKwh" class="form-control" value="${wizardTempState.totalKwh || ''}" placeholder="477" />
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Water Bill Period</label>
        <div class="date-range-wrapper">
          <input type="date" id="wizWaterStartDate" class="form-control" value="${wizardTempState.waterStartDate || ''}" />
          <span class="range-sep">to</span>
          <input type="date" id="wizWaterEndDate" class="form-control" value="${wizardTempState.waterEndDate || ''}" />
        </div>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <label>Total Water Bill Amount</label>
        <input type="number" step="0.01" id="wizWaterAmount" class="form-control" value="${wizardTempState.waterAmount || ''}" placeholder="7.00" />
      </div>
    `;
  } else if (currentWizardStep === 2) {
    if (!wizardTempState.rooms || wizardTempState.rooms.length === 0) {
      wizardTempState.rooms = [{ id: "room_1", name: "", prevMeter: "", currMeter: "", tenants: [""] }];
    }

    const sampleRoomExamples = ["Master", "Middle", "Small", "Studio"];
    const sampleTenantExamples = ["Bryan", "Lim", "Eric", "Honger"];

    let roomsHtml = wizardTempState.rooms.map((r, rIdx) => {
      const pRoom = sampleRoomExamples[rIdx % sampleRoomExamples.length] || `Room ${rIdx + 1}`;
      
      let tHtml = r.tenants.map((t, tIdx) => {
        const pTenant = sampleTenantExamples[tIdx % sampleTenantExamples.length] || `Tenant ${tIdx + 1}`;
        return `
          <div class="tenant-input-row" style="margin-bottom:6px;">
            <input type="text" class="form-control wiz-tenant-name" data-ridx="${rIdx}" data-tidx="${tIdx}" value="${escapeHtml(t || '')}" placeholder="e.g. ${pTenant}" />
            ${r.tenants.length > 1 ? `<button type="button" class="btn-danger-icon wiz-btn-remove-tenant" data-ridx="${rIdx}" data-tidx="${tIdx}">✕</button>` : ''}
          </div>
        `;
      }).join("");

      return `
        <div class="room-card" style="margin-bottom:16px;">
          <div class="room-card-header">
            <input type="text" class="room-name-input wiz-room-name" data-ridx="${rIdx}" value="${escapeHtml(r.name || '')}" placeholder="e.g. ${pRoom}" />
            ${wizardTempState.rooms.length > 1 ? `<button type="button" class="btn-danger-icon wiz-btn-remove-room" data-ridx="${rIdx}">✕</button>` : ''}
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Previous Meter</label>
              <input type="number" class="form-control wiz-prev-meter" data-ridx="${rIdx}" value="${r.prevMeter !== undefined && r.prevMeter !== null ? r.prevMeter : ''}" placeholder="5574" />
            </div>
            <div class="form-group">
              <label>Current Meter</label>
              <input type="number" class="form-control wiz-curr-meter" data-ridx="${rIdx}" value="${r.currMeter !== undefined && r.currMeter !== null ? r.currMeter : ''}" placeholder="5774" />
            </div>
          </div>
          <div style="margin-top:8px;">
            <div class="tenants-list-header">
              <label>Tenant Names in ${escapeHtml(r.name || pRoom)}:</label>
              <button type="button" class="btn btn-sm btn-outline wiz-btn-add-tenant" data-ridx="${rIdx}">+ Add Tenant</button>
            </div>
            <div class="tenant-inputs-grid">${tHtml}</div>
          </div>
        </div>
      `;
    }).join("");

    elWizardBody.innerHTML = `
      <div class="wizard-step-title">🏠 Step 2: Rooms, AC Meters & Tenant Names</div>
      <div style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center;">
        <span class="helper-text">Configuring ${wizardTempState.rooms.length} room(s)</span>
        <button type="button" id="wizBtnAddRoom" class="btn btn-sm btn-outline">+ Add Room</button>
      </div>
      <div id="wizRoomsContainer">${roomsHtml}</div>
    `;

    // Bind step 2 events
    document.getElementById("wizBtnAddRoom").addEventListener("click", () => {
      wizardTempState.rooms.push({
        id: "room_" + Date.now(),
        name: "",
        prevMeter: "",
        currMeter: "",
        tenants: [""]
      });
      renderWizardStep();
    });

    elWizardBody.querySelectorAll(".wiz-room-name").forEach(input => {
      input.addEventListener("input", (e) => {
        wizardTempState.rooms[e.target.dataset.ridx].name = e.target.value;
      });
    });

    elWizardBody.querySelectorAll(".wiz-prev-meter").forEach(input => {
      input.addEventListener("input", (e) => {
        wizardTempState.rooms[e.target.dataset.ridx].prevMeter = e.target.value !== "" ? parseFloat(e.target.value) : "";
      });
    });

    elWizardBody.querySelectorAll(".wiz-curr-meter").forEach(input => {
      input.addEventListener("input", (e) => {
        wizardTempState.rooms[e.target.dataset.ridx].currMeter = e.target.value !== "" ? parseFloat(e.target.value) : "";
      });
    });

    elWizardBody.querySelectorAll(".wiz-tenant-name").forEach(input => {
      input.addEventListener("input", (e) => {
        wizardTempState.rooms[e.target.dataset.ridx].tenants[e.target.dataset.tidx] = e.target.value;
      });
    });

    elWizardBody.querySelectorAll(".wiz-btn-add-tenant").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const rIdx = e.target.dataset.ridx;
        wizardTempState.rooms[rIdx].tenants.push("");
        renderWizardStep();
      });
    });

    elWizardBody.querySelectorAll(".wiz-btn-remove-tenant").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const { ridx, tidx } = e.target.dataset;
        wizardTempState.rooms[ridx].tenants.splice(tidx, 1);
        renderWizardStep();
      });
    });

    elWizardBody.querySelectorAll(".wiz-btn-remove-room").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const { ridx } = e.target.dataset;
        wizardTempState.rooms.splice(ridx, 1);
        renderWizardStep();
      });
    });

  } else if (currentWizardStep === 3) {
    elWizardBody.innerHTML = `
      <div class="wizard-step-title">⚙️ Step 3: Rate Strategy & Calculation</div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>Choose Rate Calculation Strategy</label>
        <select id="wizRateMode" class="form-control select-control">
          <option value="ceil" ${wizardTempState.rateMode === 'ceil' ? 'selected' : ''}>Ceil / Round Up - Recommended (House Surplus Carryover)</option>
          <option value="manual" ${wizardTempState.rateMode === 'manual' ? 'selected' : ''}>Manual Fixed Rate</option>
        </select>
      </div>
      <div id="wizManualRateGroup" class="form-group ${wizardTempState.rateMode === 'manual' ? '' : 'hidden'}">
        <label>Custom Rate</label>
        <input type="number" step="0.0001" id="wizManualRate" class="form-control" value="${wizardTempState.manualRate || ''}" placeholder="0.33" />
      </div>
    `;

    const wizRateMode = document.getElementById("wizRateMode");
    const wizManualRateGroup = document.getElementById("wizManualRateGroup");
    wizRateMode.addEventListener("change", (e) => {
      wizardTempState.rateMode = e.target.value;
      wizManualRateGroup.classList.toggle("hidden", wizardTempState.rateMode !== "manual");
    });
    document.getElementById("wizManualRate")?.addEventListener("input", (e) => {
      wizardTempState.manualRate = e.target.value !== "" ? parseFloat(e.target.value) : "";
    });
  }
}

function wizardGoNext() {
  saveCurrentWizardStepData();

  if (currentWizardStep < TOTAL_WIZARD_STEPS) {
    currentWizardStep++;
    renderWizardStep();
  } else {
    // Finish wizard
    appState = JSON.parse(JSON.stringify(wizardTempState));
    bindFormInputs();
    renderRooms();
    saveInputState();
    recalculate();
    closeWizard();
    showToast("✨ Calculation generated successfully!");
  }
}

function wizardGoPrev() {
  saveCurrentWizardStepData();
  if (currentWizardStep > 1) {
    currentWizardStep--;
    renderWizardStep();
  }
}

function saveCurrentWizardStepData() {
  if (currentWizardStep === 1) {
    const elD = document.getElementById("wizElecDate");
    const elA = document.getElementById("wizElecAmount");
    const elB = document.getElementById("wizPrevBalance");
    const elK = document.getElementById("wizTotalKwh");
    const elWS = document.getElementById("wizWaterStartDate");
    const elWE = document.getElementById("wizWaterEndDate");
    const elWA = document.getElementById("wizWaterAmount");

    if (elD) wizardTempState.electricDate = elD.value;
    if (elA) wizardTempState.electricAmount = elA.value !== "" ? parseFloat(elA.value) : "";
    if (elB) wizardTempState.prevBalance = elB.value !== "" ? parseFloat(elB.value) : "";
    if (elK) wizardTempState.totalKwh = elK.value !== "" ? parseFloat(elK.value) : "";
    if (elWS) wizardTempState.waterStartDate = elWS.value;
    if (elWE) wizardTempState.waterEndDate = elWE.value;
    if (elWA) wizardTempState.waterAmount = elWA.value !== "" ? parseFloat(elWA.value) : "";
  }
}

function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function padRight(str, len) {
  return str.padEnd(len, " ");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function showToast(msg) {
  elToast.textContent = msg;
  elToast.classList.add("show");
  setTimeout(() => {
    elToast.classList.remove("show");
  }, 2500);
}

// Run on load
document.addEventListener("DOMContentLoaded", init);
