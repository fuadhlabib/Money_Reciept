
    // ── DATE FORMATTER ──────────────────────────────────────────────────────────
    function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00"); // avoid timezone shift
    const day = d.getDate().toString().padStart(2, "0");
    const month = d.toLocaleString("en-GB", { month: "short" }); // Aug
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
    }

    // ── SIMPLE TEXT BINDINGS ────────────────────────────────────────────────────
    const textBindings = [
    ["receiptNo", "pReceiptNo"],
    ["studentName", "pStudentName"],
    ["regNo", "pRegNo"],
    // ["studentId", "pStudentId"],
    ["course", "pCourse"],
    ["type", "pType"],
    ["year", "pYear"],
    ["month", "pMonth"],
    ["shift", "pShift"],
    // ["batch", "pBatch"],
    ["paymentMethod", "pPaymentMethod"],
    ["fee", "pFee"],
    ["discount", "pDiscount"],
    ["payable", "pPayable"],
    ["paid", "pPaid"],
    ["due", "pDue"],
    ["signatureName", "pSigName"],
    ["footerText", "pFooter"],
    ];

    textBindings.forEach(([inp, prev]) => {
    const el = document.getElementById(inp);
    const pEl = document.getElementById(prev);
    if (el && pEl) {
        el.addEventListener("input", () => (pEl.textContent = el.value));
    }
    });

    // ── NOTE TEXT BINDING (special handling for textarea) ────────────────────────
    const noteEl = document.getElementById("noteText");
    const pNote = document.getElementById("pNote");
    if (noteEl && pNote) {
    noteEl.addEventListener("input", () => (pNote.textContent = noteEl.value));
    }

    // ── DATE BINDINGS ────────────────────────────────────────────────────────────
    document
    .getElementById("admissionDate")
    .addEventListener("change", function () {
        document.getElementById("pAdmissionDate").textContent = formatDate(
        this.value,
        );
    });
    document
    .getElementById("payDate")
    .addEventListener("change", function () {
        document.getElementById("pPayDate").textContent = formatDate(
        this.value,
        );
    });
    document
    .getElementById("nextPayDate")
    .addEventListener("change", function () {
        document.getElementById("pNextPayDate").textContent = formatDate(
        this.value,
        );
    });

    // ── LOGO UPLOAD ──────────────────────────────────────────────────────────────
    document
    .getElementById("logoFile")
    .addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
        const src = e.target.result;
        // Preview in form
        document.getElementById("logoThumb").src = src;
        document.getElementById("logoFileName").textContent = file.name;
        document.getElementById("logoPrev").style.display = "flex";
        // Apply to receipt
        document.getElementById("rLogoImg").src = src;
        document.getElementById("rLogoImg").style.display = "block";
        // document.getElementById("rLogoPlaceholder").style.display = "none";
        };
        reader.readAsDataURL(file);
    });

    function clearLogo() {
    document.getElementById("logoFile").value = "";
    document.getElementById("logoPrev").style.display = "none";
    document.getElementById("rLogoImg").src = "fareless_english_logo.jpeg";
    }

    // ── SIGNATURE UPLOAD ─────────────────────────────────────────────────────────
    document
    .getElementById("sigFile")
    .addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
        const src = e.target.result;
        // Preview in form
        document.getElementById("sigThumb").src = src;
        document.getElementById("sigFileName").textContent = file.name;
        document.getElementById("sigPrev").style.display = "flex";
        // Apply to receipt
        const sigImg = document.getElementById("rSigImg");
        sigImg.src = src;
        sigImg.style.display = "block";
        };
        reader.readAsDataURL(file);
    });

    function clearSig() {
    document.getElementById("sigFile").value = "";
    document.getElementById("sigPrev").style.display = "none";
    const sigImg = document.getElementById("rSigImg");
    sigImg.src = "";
    sigImg.style.display = "none";
    }

    // ── PDF GENERATION ────────────────────────────────────────────────────────────
    async function generatePDF() {
    const btn = document.getElementById("genBtn");
    btn.classList.add("loading");
    btn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Generating…`;

    await new Promise((r) => setTimeout(r, 120));

    const receipt = document.getElementById("receipt");

    try {
        const canvas = await html2canvas(receipt, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        });

        const imgData = canvas.toDataURL("image/png", 1.0);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        });

        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const margin = 10;

        const printW = pageW - margin * 2;
        let printH = (canvas.height / canvas.width) * printW;

        if (printH > pageH - margin * 2) {
            printH = pageH - margin * 2;
        }
        pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        printW,
        printH,
        "",
        "FAST",
        );
        const fullName = document.getElementById("studentName")?.value?.trim() || "";
        const studentName = fullName ? fullName.split(/\s+/)[0] : "UnknownStudent";
        const safeStudentName = studentName.replace(/[^a-z0-9]/gi, "_");

        // Get today's date
        const today = new Date();
        const day = String(today.getDate()).padStart(2, "0");
        const month = String(today.getMonth() + 1).padStart(2, "0");
        const year = today.getFullYear();

        const formattedDate = `${year}-${month}-${day}`;

        pdf.save(`Money_Receipt_${safeStudentName}_${formattedDate}.pdf`);
    } catch (err) {
        console.error(err);
        alert("PDF generation failed. Please try again.");
    }

    btn.classList.remove("loading");
    btn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg> Generate PDF`;
    }